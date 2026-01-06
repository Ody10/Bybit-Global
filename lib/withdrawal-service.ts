// Withdrawal Service
// Handles withdrawal requests, verification, and processing

import { prisma } from './prisma';
import { 
  getChainConfig, 
  getTokenConfig, 
  getExplorerTxUrl,
} from './chain-config';
import { getTokenPrice, calculateUsdValue } from './price-service';
import { lockUserBalance, unlockUserBalance, releaseLockedBalance } from './balance-service';
import {
  createWithdrawalRequestNotification,
  createWithdrawalSuccessNotification,
  createWithdrawalFailedNotification,
} from './notification-service';
import { sendWithdrawalRequestEmail, sendWithdrawalSuccessEmail } from './email';

// Generate withdrawal ID: WD + YYYYMMDD + sequence
async function generateWithdrawalId(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  
  // Get or create counter for today
  const counter = await prisma.withdrawalIdCounter.upsert({
    where: { id: 'withdrawal_counter' },
    update: {
      lastId: { increment: 1 },
      date: dateStr,
    },
    create: {
      id: 'withdrawal_counter',
      lastId: 1,
      date: dateStr,
    },
  });
  
  // Reset counter if new day
  if (counter.date !== dateStr) {
    await prisma.withdrawalIdCounter.update({
      where: { id: 'withdrawal_counter' },
      data: {
        lastId: 1,
        date: dateStr,
      },
    });
    return `WD${dateStr}000001`;
  }
  
  const sequence = String(counter.lastId).padStart(6, '0');
  return `WD${dateStr}${sequence}`;
}

// Generate 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Calculate withdrawal fee
export function calculateWithdrawalFee(
  chain: string,
  token: string,
  amount: number
): { fee: number; netAmount: number; feeUsd?: number } {
  const tokenConfig = getTokenConfig(chain, token);
  
  if (!tokenConfig) {
    // Default fee
    return {
      fee: 0,
      netAmount: amount,
    };
  }
  
  const fee = tokenConfig.withdrawalFee;
  const netAmount = Math.max(0, amount - fee);
  
  return {
    fee,
    netAmount,
  };
}

// Validate withdrawal request
export async function validateWithdrawal(
  userId: string,
  token: string,
  chain: string,
  amount: number,
  toAddress: string
): Promise<{ valid: boolean; error?: string }> {
  // Get token config
  const tokenConfig = getTokenConfig(chain, token);
  const chainConfig = getChainConfig(chain);
  
  if (!tokenConfig || !chainConfig) {
    return { valid: false, error: 'Invalid chain or token' };
  }
  
  // Check minimum withdrawal
  if (amount < tokenConfig.minWithdrawal) {
    return { 
      valid: false, 
      error: `Minimum withdrawal is ${tokenConfig.minWithdrawal} ${token}` 
    };
  }
  
  // Check user balance
  const balance = await prisma.userBalance.findUnique({
    where: {
      userId_currency_chain: {
        userId,
        currency: token,
        chain,
      },
    },
  });
  
  if (!balance || balance.available < amount) {
    return { 
      valid: false, 
      error: `Insufficient balance. Available: ${balance?.available || 0} ${token}` 
    };
  }
  
  // Validate address format (basic validation)
  if (!toAddress || toAddress.length < 10) {
    return { valid: false, error: 'Invalid withdrawal address' };
  }
  
  // Chain-specific address validation
  switch (chain) {
    case 'ETH':
    case 'BSC':
      if (!toAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        return { valid: false, error: 'Invalid EVM address format' };
      }
      break;
    case 'TRX':
      if (!toAddress.match(/^T[a-zA-Z0-9]{33}$/)) {
        return { valid: false, error: 'Invalid TRON address format' };
      }
      break;
    case 'BTC':
      if (!toAddress.match(/^(1|3|bc1)[a-zA-Z0-9]{25,62}$/)) {
        return { valid: false, error: 'Invalid Bitcoin address format' };
      }
      break;
    case 'SOL':
      if (!toAddress.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
        return { valid: false, error: 'Invalid Solana address format' };
      }
      break;
  }
  
  // Check daily limit (if configured)
  // TODO: Implement daily limit check
  
  return { valid: true };
}

// Create withdrawal request
export async function createWithdrawalRequest(data: {
  userId: string;
  token: string;
  chain: string;
  amount: number;
  toAddress: string;
  memo?: string;
  note?: string;
}): Promise<{ success: boolean; withdrawalId?: string; verificationCode?: string; error?: string }> {
  try {
    // Validate withdrawal
    const validation = await validateWithdrawal(
      data.userId,
      data.token,
      data.chain,
      data.amount,
      data.toAddress
    );
    
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    // Get user's wallet (from address)
    const wallet = await prisma.wallet.findFirst({
      where: {
        userId: data.userId,
        chain: data.chain,
      },
    });
    
    // Calculate fee
    const { fee, netAmount } = calculateWithdrawalFee(data.chain, data.token, data.amount);
    
    // Generate IDs and codes
    const withdrawalId = await generateWithdrawalId();
    const verificationCode = generateVerificationCode();
    const codeExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    // Get chain config
    const chainConfig = getChainConfig(data.chain);
    
    // Lock user balance
    const locked = await lockUserBalance(data.userId, data.token, data.chain, data.amount);
    
    if (!locked) {
      return { success: false, error: 'Failed to lock balance' };
    }
    
    // Create withdrawal record
    const withdrawal = await prisma.withdrawal.create({
      data: {
        withdrawalId,
        userId: data.userId,
        userUid: data.userId,
        currency: data.token,
        chain: data.chain,
        network: 'mainnet',
        amount: data.amount,
        fee,
        netAmount,
        toAddress: data.toAddress.toLowerCase(),
        fromAddress: wallet?.address,
        status: 'PENDING',
        requiredConfirmations: chainConfig?.confirmations || 12,
        explorerName: chainConfig?.explorerName,
        explorerUrl: chainConfig?.explorerUrl,
        memo: data.memo,
        note: data.note,
        submittedAt: new Date(),
      },
    });
    
    // Create verification code record
    await prisma.verificationCode.create({
      data: {
        userId: data.userId,
        email: user.email,
        code: verificationCode,
        type: 'WITHDRAWAL',
        expiresAt: codeExpiresAt,
        metadata: JSON.stringify({ withdrawalId }),
      },
    });
    
    // Send verification email
    await sendWithdrawalRequestEmail(user.email, {
      amount: data.amount.toString(),
      token: data.token,
      chainType: chainConfig?.displayName || data.chain,
      withdrawalAddress: data.toAddress,
      fee: fee.toString(),
      verificationCode,
    });
    
    // Create in-app notification
    await createWithdrawalRequestNotification({
      userId: data.userId,
      userEmail: user.email,
      amount: data.amount.toString(),
      token: data.token,
      chain: chainConfig?.displayName || data.chain,
      toAddress: data.toAddress,
      fee: fee.toString(),
      withdrawalId,
      verificationCode,
    });
    
    console.log(`Created withdrawal request ${withdrawalId} for user ${data.userId}`);
    
    return {
      success: true,
      withdrawalId,
      verificationCode, // Return for testing; in production, only send via email
    };
  } catch (error) {
    console.error('Error creating withdrawal request:', error);
    return { success: false, error: 'Failed to create withdrawal request' };
  }
}

// Verify withdrawal with email code
export async function verifyWithdrawalCode(
  withdrawalId: string,
  code: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get withdrawal
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { withdrawalId },
    });
    
    if (!withdrawal) {
      return { success: false, error: 'Withdrawal not found' };
    }
    
    if (withdrawal.userId !== userId) {
      return { success: false, error: 'Unauthorized' };
    }
    
    if (withdrawal.status !== 'PENDING') {
      return { success: false, error: `Withdrawal is already ${withdrawal.status.toLowerCase()}` };
    }
    
    // Find verification code
    const verificationRecord = await prisma.verificationCode.findFirst({
      where: {
        userId,
        code,
        type: 'WITHDRAWAL',
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    if (!verificationRecord) {
      return { success: false, error: 'Invalid or expired verification code' };
    }
    
    // Check if code is for this withdrawal
    const metadata = JSON.parse(verificationRecord.metadata || '{}');
    if (metadata.withdrawalId !== withdrawalId) {
      return { success: false, error: 'Verification code does not match this withdrawal' };
    }
    
    // Mark code as used
    await prisma.verificationCode.update({
      where: { id: verificationRecord.id },
      data: { used: true },
    });
    
    // Update withdrawal status
    await prisma.withdrawal.update({
      where: { id: withdrawal.id },
      data: {
        status: 'PROCESSING',
        emailVerified: true,
        emailVerifiedAt: new Date(),
        processedAt: new Date(),
      },
    });
    
    console.log(`Withdrawal ${withdrawalId} verified and processing`);
    
    return { success: true };
  } catch (error) {
    console.error('Error verifying withdrawal:', error);
    return { success: false, error: 'Failed to verify withdrawal' };
  }
}

// Process withdrawal (send to blockchain) - called by admin or automated system
export async function processWithdrawal(
  withdrawalId: string,
  txHash?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { withdrawalId },
      include: { user: true },
    });
    
    if (!withdrawal) {
      return { success: false, error: 'Withdrawal not found' };
    }
    
    if (withdrawal.status !== 'PROCESSING') {
      return { success: false, error: `Cannot process withdrawal with status: ${withdrawal.status}` };
    }
    
    const chainConfig = getChainConfig(withdrawal.chain);
    
    // In production, you would:
    // 1. Sign and broadcast the transaction
    // 2. Get the actual txHash from the blockchain
    
    // For now, simulate with provided or generated txHash
    const finalTxHash = txHash || `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;
    const txUrl = getExplorerTxUrl(withdrawal.chain, finalTxHash);
    
    // Update withdrawal with tx info
    await prisma.withdrawal.update({
      where: { id: withdrawal.id },
      data: {
        status: 'AWAITING_CONFIRMATION',
        txHash: finalTxHash,
        txUrl,
        broadcastAt: new Date(),
      },
    });
    
    console.log(`Withdrawal ${withdrawalId} broadcast with txHash ${finalTxHash}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    return { success: false, error: 'Failed to process withdrawal' };
  }
}

// Complete withdrawal after confirmations
export async function completeWithdrawal(
  withdrawalId: string,
  confirmations?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { withdrawalId },
      include: { user: true },
    });
    
    if (!withdrawal) {
      return { success: false, error: 'Withdrawal not found' };
    }
    
    if (withdrawal.status === 'COMPLETED') {
      return { success: true }; // Already completed
    }
    
    if (!['PROCESSING', 'AWAITING_CONFIRMATION'].includes(withdrawal.status)) {
      return { success: false, error: `Cannot complete withdrawal with status: ${withdrawal.status}` };
    }
    
    const chainConfig = getChainConfig(withdrawal.chain);
    const now = new Date();
    const processingTime = Math.floor((now.getTime() - withdrawal.submittedAt.getTime()) / 1000);
    
    // Release locked balance (deduct from total)
    await releaseLockedBalance(
      withdrawal.userId,
      withdrawal.currency,
      withdrawal.chain,
      withdrawal.amount
    );
    
    // Update withdrawal status
    await prisma.withdrawal.update({
      where: { id: withdrawal.id },
      data: {
        status: 'COMPLETED',
        confirmations: confirmations || withdrawal.requiredConfirmations,
        confirmedAt: now,
        completedAt: now,
        processingTime,
      },
    });
    
    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId: withdrawal.userId,
        userUid: withdrawal.userUid,
        type: 'WITHDRAWAL',
        status: 'COMPLETED',
        currency: withdrawal.currency,
        chain: withdrawal.chain,
        network: 'mainnet',
        amount: withdrawal.amount,
        fee: withdrawal.fee,
        withdrawalId: withdrawal.withdrawalId,
        txHash: withdrawal.txHash,
        txUrl: withdrawal.txUrl,
        fromAddress: withdrawal.fromAddress,
        toAddress: withdrawal.toAddress,
        explorerName: withdrawal.explorerName,
        explorerUrl: withdrawal.explorerUrl,
        completedAt: now,
      },
    });
    
    // Send success notification and email
    await createWithdrawalSuccessNotification({
      userId: withdrawal.userId,
      userEmail: withdrawal.user.email,
      amount: withdrawal.netAmount.toString(),
      token: withdrawal.currency,
      chain: chainConfig?.displayName || withdrawal.chain,
      toAddress: withdrawal.toAddress,
      txHash: withdrawal.txHash || '',
      txUrl: withdrawal.txUrl || '',
      explorerName: chainConfig?.explorerName || '',
      withdrawalId: withdrawal.withdrawalId,
    });
    
    await sendWithdrawalSuccessEmail(withdrawal.user.email, {
      amount: withdrawal.netAmount.toString(),
      token: withdrawal.currency,
      chainType: chainConfig?.displayName || withdrawal.chain,
      withdrawalAddress: withdrawal.toAddress,
      txId: withdrawal.txHash || '',
      txUrl: withdrawal.txUrl || '',
    });
    
    console.log(`Withdrawal ${withdrawalId} completed`);
    
    return { success: true };
  } catch (error) {
    console.error('Error completing withdrawal:', error);
    return { success: false, error: 'Failed to complete withdrawal' };
  }
}

// Cancel withdrawal (by user or admin)
export async function cancelWithdrawal(
  withdrawalId: string,
  userId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { withdrawalId },
    });
    
    if (!withdrawal) {
      return { success: false, error: 'Withdrawal not found' };
    }
    
    if (withdrawal.userId !== userId) {
      return { success: false, error: 'Unauthorized' };
    }
    
    // Can only cancel pending or processing withdrawals
    if (!['PENDING', 'PROCESSING'].includes(withdrawal.status)) {
      return { success: false, error: `Cannot cancel withdrawal with status: ${withdrawal.status}` };
    }
    
    // Unlock the balance
    await unlockUserBalance(
      withdrawal.userId,
      withdrawal.currency,
      withdrawal.chain,
      withdrawal.amount
    );
    
    // Update withdrawal status
    await prisma.withdrawal.update({
      where: { id: withdrawal.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        adminNote: reason || 'Cancelled by user',
      },
    });
    
    console.log(`Withdrawal ${withdrawalId} cancelled`);
    
    return { success: true };
  } catch (error) {
    console.error('Error cancelling withdrawal:', error);
    return { success: false, error: 'Failed to cancel withdrawal' };
  }
}

// Fail withdrawal (system or admin)
export async function failWithdrawal(
  withdrawalId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { withdrawalId },
      include: { user: true },
    });
    
    if (!withdrawal) {
      return { success: false, error: 'Withdrawal not found' };
    }
    
    if (withdrawal.status === 'COMPLETED') {
      return { success: false, error: 'Cannot fail completed withdrawal' };
    }
    
    // Unlock the balance (return to user)
    await unlockUserBalance(
      withdrawal.userId,
      withdrawal.currency,
      withdrawal.chain,
      withdrawal.amount
    );
    
    // Update withdrawal status
    await prisma.withdrawal.update({
      where: { id: withdrawal.id },
      data: {
        status: 'FAILED',
        failedAt: new Date(),
        rejectionReason: reason,
      },
    });
    
    // Send failure notification
    const chainConfig = getChainConfig(withdrawal.chain);
    
    await createWithdrawalFailedNotification({
      userId: withdrawal.userId,
      userEmail: withdrawal.user.email,
      amount: withdrawal.amount.toString(),
      token: withdrawal.currency,
      chain: chainConfig?.displayName || withdrawal.chain,
      toAddress: withdrawal.toAddress,
      reason,
      withdrawalId: withdrawal.withdrawalId,
    });
    
    console.log(`Withdrawal ${withdrawalId} failed: ${reason}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error failing withdrawal:', error);
    return { success: false, error: 'Failed to update withdrawal' };
  }
}

// Get withdrawal status
export async function getWithdrawalStatus(withdrawalId: string): Promise<any | null> {
  const withdrawal = await prisma.withdrawal.findUnique({
    where: { withdrawalId },
  });
  
  if (!withdrawal) return null;
  
  const price = await getTokenPrice(withdrawal.currency);
  const usdValue = withdrawal.netAmount * price;
  
  return {
    withdrawalId: withdrawal.withdrawalId,
    status: withdrawal.status,
    amount: withdrawal.amount,
    fee: withdrawal.fee,
    netAmount: withdrawal.netAmount,
    token: withdrawal.currency,
    chain: withdrawal.chain,
    toAddress: withdrawal.toAddress,
    txHash: withdrawal.txHash,
    txUrl: withdrawal.txUrl,
    explorerName: withdrawal.explorerName,
    confirmations: withdrawal.confirmations,
    requiredConfirmations: withdrawal.requiredConfirmations,
    currentUsdValue: usdValue,
    submittedAt: withdrawal.submittedAt,
    processedAt: withdrawal.processedAt,
    completedAt: withdrawal.completedAt,
    cancelledAt: withdrawal.cancelledAt,
    failedAt: withdrawal.failedAt,
  };
}

// Get user's withdrawals
export async function getUserWithdrawals(
  userId: string,
  options?: {
    status?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ withdrawals: any[]; total: number }> {
  const where: any = { userId };
  
  if (options?.status) {
    where.status = options.status;
  }
  
  const [withdrawals, total] = await Promise.all([
    prisma.withdrawal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    }),
    prisma.withdrawal.count({ where }),
  ]);
  
  // Add current prices
  const withdrawalsWithPrices = await Promise.all(
    withdrawals.map(async (w) => {
      const price = await getTokenPrice(w.currency);
      return {
        ...w,
        blockNumber: w.blockNumber?.toString(),
        currentPrice: price,
        currentUsdValue: w.netAmount * price,
      };
    })
  );
  
  return { withdrawals: withdrawalsWithPrices, total };
}

// Resend verification code
export async function resendWithdrawalVerificationCode(
  withdrawalId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { withdrawalId },
    });
    
    if (!withdrawal) {
      return { success: false, error: 'Withdrawal not found' };
    }
    
    if (withdrawal.userId !== userId) {
      return { success: false, error: 'Unauthorized' };
    }
    
    if (withdrawal.status !== 'PENDING') {
      return { success: false, error: 'Withdrawal is no longer pending verification' };
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    // Generate new code
    const verificationCode = generateVerificationCode();
    const codeExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
    // Create new verification code record
    await prisma.verificationCode.create({
      data: {
        userId,
        email: user.email,
        code: verificationCode,
        type: 'WITHDRAWAL',
        expiresAt: codeExpiresAt,
        metadata: JSON.stringify({ withdrawalId }),
      },
    });
    
    // Get chain config for email
    const chainConfig = getChainConfig(withdrawal.chain);
    
    // Send email
    await sendWithdrawalRequestEmail(user.email, {
      amount: withdrawal.amount.toString(),
      token: withdrawal.currency,
      chainType: chainConfig?.displayName || withdrawal.chain,
      withdrawalAddress: withdrawal.toAddress,
      fee: withdrawal.fee.toString(),
      verificationCode,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error resending verification code:', error);
    return { success: false, error: 'Failed to resend verification code' };
  }
}