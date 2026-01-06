// lib/deposit-monitor.ts
// Detects and processes incoming cryptocurrency deposits

import { prisma } from './prisma';
import { 
  getChainConfig, 
  getTokenConfig, 
  getExplorerTxUrl,
  ERC20_TRANSFER_EVENT_SIGNATURE,
  CHAIN_CONFIGS,
} from './chain-config';
import { getTokenPrice, calculateUsdValue } from './price-service';
import {
  createDepositPendingNotification,
  createDepositConfirmedNotification,
} from './notification-service';

// Deposit detection result
interface DetectedDeposit {
  txHash: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  token: string;
  chain: string;
  blockNumber: number;
  blockHash?: string;
  timestamp?: Date;
  confirmations: number;
}

// Generate deposit ID: DEP + YYYYMMDD + sequence
async function generateDepositId(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  
  // Get or create counter for today
  const counter = await prisma.depositIdCounter.upsert({
    where: { id: 'deposit_counter' },
    update: {
      lastId: { increment: 1 },
      date: dateStr,
    },
    create: {
      id: 'deposit_counter',
      lastId: 1,
      date: dateStr,
    },
  });
  
  // Reset counter if new day
  if (counter.date !== dateStr) {
    await prisma.depositIdCounter.update({
      where: { id: 'deposit_counter' },
      data: {
        lastId: 1,
        date: dateStr,
      },
    });
    return `DEP${dateStr}000001`;
  }
  
  const sequence = String(counter.lastId).padStart(6, '0');
  return `DEP${dateStr}${sequence}`;
}

/**
 * Find user by deposit address
 */
async function findUserByDepositAddress(address: string, chain: string): Promise<{
  userId: string;
  userUid: string;
  userEmail: string;
} | null> {
  const wallet = await prisma.wallet.findFirst({
    where: {
      address: address.toLowerCase(),
      chain: chain,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });
  
  if (!wallet) return null;
  
  return {
    userId: wallet.userId,
    userUid: wallet.userId, // User ID is the UID
    userEmail: wallet.user.email,
  };
}

/**
 * Check if deposit already exists (prevent duplicates)
 */
async function depositExists(txHash: string): Promise<boolean> {
  const existing = await prisma.deposit.findFirst({
    where: { txHash: txHash.toLowerCase() },
  });
  return !!existing;
}

/**
 * Create a new pending deposit record
 */
export async function createPendingDeposit(deposit: DetectedDeposit): Promise<string | null> {
  try {
    // Check for duplicate
    if (await depositExists(deposit.txHash)) {
      console.log(`Deposit ${deposit.txHash} already exists, skipping`);
      return null;
    }
    
    // Find user
    const user = await findUserByDepositAddress(deposit.toAddress, deposit.chain);
    if (!user) {
      console.log(`No user found for address ${deposit.toAddress} on ${deposit.chain}`);
      return null;
    }
    
    // Get chain config
    const chainConfig = getChainConfig(deposit.chain);
    const tokenConfig = getTokenConfig(deposit.chain, deposit.token);
    
    if (!chainConfig || !tokenConfig) {
      console.error(`Invalid chain or token: ${deposit.chain}/${deposit.token}`);
      return null;
    }
    
    // Parse amount
    const amount = parseFloat(deposit.amount);
    
    // Check minimum deposit
    if (amount < tokenConfig.minDeposit) {
      console.log(`Deposit ${amount} ${deposit.token} below minimum ${tokenConfig.minDeposit}`);
      return null;
    }
    
    // Generate deposit ID
    const depositId = await generateDepositId();
    
    // Create deposit record
    const newDeposit = await prisma.deposit.create({
      data: {
        depositId,
        userId: user.userId,
        userUid: user.userUid,
        currency: deposit.token,
        chain: deposit.chain,
        network: 'mainnet',
        amount: amount,
        fee: 0,
        netAmount: amount,
        txHash: deposit.txHash.toLowerCase(),
        txUrl: getExplorerTxUrl(deposit.chain, deposit.txHash),
        fromAddress: deposit.fromAddress.toLowerCase(),
        toAddress: deposit.toAddress.toLowerCase(),
        confirmations: deposit.confirmations,
        requiredConfirmations: chainConfig.confirmations,
        status: deposit.confirmations >= chainConfig.confirmations ? 'COMPLETED' : 'CONFIRMING',
        blockNumber: BigInt(deposit.blockNumber),
        blockHash: deposit.blockHash,
        blockTimestamp: deposit.timestamp,
        explorerName: chainConfig.explorerName,
        explorerUrl: chainConfig.explorerUrl,
        submittedAt: new Date(),
      },
    });
    
    console.log(`Created deposit ${depositId} for user ${user.userUid}`);
    
    // Create pending notification
    await createDepositPendingNotification({
      userId: user.userId,
      userEmail: user.userEmail,
      amount: amount.toString(),
      token: deposit.token,
      chain: chainConfig.displayName,
      depositAddress: deposit.toAddress,
      txHash: deposit.txHash,
      txUrl: getExplorerTxUrl(deposit.chain, deposit.txHash),
      explorerName: chainConfig.explorerName,
      depositId,
      confirmations: deposit.confirmations,
      requiredConfirmations: chainConfig.confirmations,
    });
    
    // If already has enough confirmations, process immediately
    if (deposit.confirmations >= chainConfig.confirmations) {
      await processConfirmedDeposit(depositId);
    }
    
    return depositId;
  } catch (error) {
    console.error('Error creating pending deposit:', error);
    return null;
  }
}

/**
 * Update deposit confirmations
 */
export async function updateDepositConfirmations(
  txHash: string,
  confirmations: number
): Promise<boolean> {
  try {
    const deposit = await prisma.deposit.findFirst({
      where: { txHash: txHash.toLowerCase() },
    });
    
    if (!deposit) return false;
    if (deposit.status === 'COMPLETED') return true;
    
    // Update confirmations
    await prisma.deposit.update({
      where: { id: deposit.id },
      data: {
        confirmations,
        status: confirmations >= deposit.requiredConfirmations ? 'COMPLETED' : 'CONFIRMING',
      },
    });
    
    // Check if now confirmed
    if (confirmations >= deposit.requiredConfirmations && deposit.status !== 'COMPLETED') {
      await processConfirmedDeposit(deposit.depositId);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating deposit confirmations:', error);
    return false;
  }
}

/**
 * Process a confirmed deposit - credit user balance
 */
export async function processConfirmedDeposit(depositId: string): Promise<boolean> {
  try {
    // Get deposit
    const deposit = await prisma.deposit.findUnique({
      where: { depositId },
      include: {
        user: true,
      },
    });
    
    if (!deposit) {
      console.error(`Deposit ${depositId} not found`);
      return false;
    }
    
    if (deposit.status === 'COMPLETED' && deposit.completedAt) {
      console.log(`Deposit ${depositId} already completed`);
      return true;
    }
    
    const chainConfig = getChainConfig(deposit.chain);
    
    // Use transaction for atomic update
    await prisma.$transaction(async (tx) => {
      // Get current USD value
      const usdValue = await calculateUsdValue(deposit.currency, deposit.amount);
      
      // Update or create user balance
      const existingBalance = await tx.userBalance.findUnique({
        where: {
          userId_currency_chain: {
            userId: deposit.userId,
            currency: deposit.currency,
            chain: deposit.chain,
          },
        },
      });
      
      if (existingBalance) {
        await tx.userBalance.update({
          where: { id: existingBalance.id },
          data: {
            totalBalance: { increment: deposit.netAmount },
            available: { increment: deposit.netAmount },
            usdValue: { increment: usdValue },
          },
        });
      } else {
        await tx.userBalance.create({
          data: {
            userId: deposit.userId,
            currency: deposit.currency,
            chain: deposit.chain,
            network: 'mainnet',
            totalBalance: deposit.netAmount,
            available: deposit.netAmount,
            usdValue: usdValue,
          },
        });
      }
      
      // Update deposit status
      const now = new Date();
      const processingTime = Math.floor((now.getTime() - deposit.submittedAt.getTime()) / 1000);
      
      await tx.deposit.update({
        where: { id: deposit.id },
        data: {
          status: 'COMPLETED',
          confirmedAt: now,
          completedAt: now,
          processingTime,
        },
      });
      
      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: deposit.userId,
          userUid: deposit.userUid,
          type: 'DEPOSIT',
          status: 'COMPLETED',
          currency: deposit.currency,
          chain: deposit.chain,
          network: 'mainnet',
          amount: deposit.netAmount,
          fee: deposit.fee,
          depositId: deposit.depositId,
          txHash: deposit.txHash,
          txUrl: deposit.txUrl,
          fromAddress: deposit.fromAddress,
          toAddress: deposit.toAddress,
          explorerName: deposit.explorerName,
          explorerUrl: deposit.explorerUrl,
          completedAt: now,
        },
      });
    });
    
    console.log(`Deposit ${depositId} completed - credited ${deposit.netAmount} ${deposit.currency} to user ${deposit.userUid}`);
    
    // Send confirmation notification and email
    await createDepositConfirmedNotification({
      userId: deposit.userId,
      userEmail: deposit.user.email,
      amount: deposit.amount.toString(),
      token: deposit.currency,
      chain: chainConfig?.displayName || deposit.chain,
      depositAddress: deposit.toAddress,
      txHash: deposit.txHash || '',
      txUrl: deposit.txUrl || '',
      explorerName: deposit.explorerName || '',
      depositId: deposit.depositId,
    });
    
    return true;
  } catch (error) {
    console.error(`Error processing confirmed deposit ${depositId}:`, error);
    return false;
  }
}

/**
 * Get pending deposits that need confirmation updates
 */
export async function getPendingDeposits(chain?: string): Promise<any[]> {
  const where: any = {
    status: { in: ['PENDING', 'CONFIRMING'] },
  };
  
  if (chain) {
    where.chain = chain;
  }
  
  return prisma.deposit.findMany({
    where,
    orderBy: { createdAt: 'asc' },
  });
}

/**
 * Manual deposit creation (for admin/testing)
 */
export async function createManualDeposit(data: {
  userId: string;
  token: string;
  chain: string;
  amount: number;
  txHash?: string;
  fromAddress?: string;
}): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const wallet = await prisma.wallet.findFirst({
      where: {
        userId: data.userId,
        chain: data.chain,
      },
    });
    
    if (!wallet) {
      throw new Error('User wallet not found for this chain');
    }
    
    const chainConfig = getChainConfig(data.chain);
    const depositId = await generateDepositId();
    const txHash = data.txHash || `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create deposit directly as completed
    await prisma.deposit.create({
      data: {
        depositId,
        userId: data.userId,
        userUid: data.userId,
        currency: data.token,
        chain: data.chain,
        network: 'mainnet',
        amount: data.amount,
        fee: 0,
        netAmount: data.amount,
        txHash: txHash,
        txUrl: data.txHash ? getExplorerTxUrl(data.chain, data.txHash) : null,
        fromAddress: data.fromAddress || 'manual_deposit',
        toAddress: wallet.address,
        confirmations: chainConfig?.confirmations || 12,
        requiredConfirmations: chainConfig?.confirmations || 12,
        status: 'COMPLETED',
        explorerName: chainConfig?.explorerName,
        explorerUrl: chainConfig?.explorerUrl,
        submittedAt: new Date(),
        confirmedAt: new Date(),
        completedAt: new Date(),
        processingTime: 0,
      },
    });
    
    // Credit balance
    const usdValue = await calculateUsdValue(data.token, data.amount);
    
    await prisma.userBalance.upsert({
      where: {
        userId_currency_chain: {
          userId: data.userId,
          currency: data.token,
          chain: data.chain,
        },
      },
      update: {
        totalBalance: { increment: data.amount },
        available: { increment: data.amount },
        usdValue: { increment: usdValue },
      },
      create: {
        userId: data.userId,
        currency: data.token,
        chain: data.chain,
        network: 'mainnet',
        totalBalance: data.amount,
        available: data.amount,
        usdValue: usdValue,
      },
    });
    
    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId: data.userId,
        userUid: data.userId,
        type: 'DEPOSIT',
        status: 'COMPLETED',
        currency: data.token,
        chain: data.chain,
        network: 'mainnet',
        amount: data.amount,
        fee: 0,
        depositId: depositId,
        txHash: txHash,
        fromAddress: data.fromAddress || 'manual_deposit',
        toAddress: wallet.address,
        explorerName: chainConfig?.explorerName,
        explorerUrl: chainConfig?.explorerUrl,
        completedAt: new Date(),
        description: 'Manual deposit',
      },
    });
    
    // Send notification
    await createDepositConfirmedNotification({
      userId: data.userId,
      userEmail: user.email,
      amount: data.amount.toString(),
      token: data.token,
      chain: chainConfig?.displayName || data.chain,
      depositAddress: wallet.address,
      txHash: txHash,
      depositId: depositId,
    });
    
    console.log(`Manual deposit ${depositId} created for user ${data.userId}`);
    
    return depositId;
  } catch (error) {
    console.error('Error creating manual deposit:', error);
    return null;
  }
}

/**
 * Get deposit status
 */
export async function getDepositStatus(depositId: string): Promise<any | null> {
  const deposit = await prisma.deposit.findUnique({
    where: { depositId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });
  
  if (!deposit) return null;
  
  return {
    depositId: deposit.depositId,
    status: deposit.status,
    amount: deposit.amount,
    token: deposit.currency,
    chain: deposit.chain,
    confirmations: deposit.confirmations,
    requiredConfirmations: deposit.requiredConfirmations,
    txHash: deposit.txHash,
    txUrl: deposit.txUrl,
    explorerName: deposit.explorerName,
    submittedAt: deposit.submittedAt,
    completedAt: deposit.completedAt,
  };
}