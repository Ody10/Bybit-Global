import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Manual Deposit Credit API
// Use this to manually credit deposits that weren't auto-detected

// POST /api/admin/credit-deposit
export async function POST(request: NextRequest) {
  try {
    // Verify admin secret
    const authHeader = request.headers.get('x-api-secret');
    if (authHeader !== process.env.INTERNAL_API_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const {
      walletAddress,
      currency,
      chain,
      amount,
      txHash,
      fromAddress,
    } = body;
    
    // Validate required fields
    if (!walletAddress || !currency || !amount || !txHash) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: walletAddress, currency, amount, txHash' },
        { status: 400 }
      );
    }
    
    // Find wallet and user
    const wallet = await prisma.wallet.findFirst({
      where: { 
        address: { 
          equals: walletAddress,
          //mode: 'insensitive' 
        }
      },
      include: { user: true },
    });
    
    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet address not found in database' },
        { status: 404 }
      );
    }
    
    // Check if deposit already exists
    const existingDeposit = await prisma.deposit.findFirst({
      where: { txHash: txHash.toLowerCase() },
    });
    
    if (existingDeposit) {
      return NextResponse.json({
        success: false,
        error: 'Deposit already exists',
        existingDeposit: {
          depositId: existingDeposit.depositId,
          status: existingDeposit.status,
          amount: existingDeposit.amount,
        },
      }, { status: 409 });
    }
    
    // Generate deposit ID
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const counter = await prisma.depositIdCounter.upsert({
      where: { id: 'deposit_counter' },
      update: { lastId: { increment: 1 } },
      create: { id: 'deposit_counter', lastId: 1, date: today },
    });
    const depositId = `DEP${today}${String(counter.lastId).padStart(6, '0')}`;
    
    // Create deposit and update balance
    const result = await prisma.$transaction(async (tx) => {
      // Create deposit record
      const deposit = await tx.deposit.create({
        data: {
          depositId,
          userId: wallet.userId,
          userUid: wallet.user.id,
          currency: currency.toUpperCase(),
          chain: chain?.toUpperCase() || wallet.chain,
          amount: parseFloat(amount),
          fee: 0,
          netAmount: parseFloat(amount),
          txHash: txHash.toLowerCase(),
          fromAddress: fromAddress?.toLowerCase() || 'unknown',
          toAddress: walletAddress.toLowerCase(),
          status: 'COMPLETED',
          confirmations: 12,
          requiredConfirmations: 12,
          confirmedAt: new Date(),
          completedAt: new Date(),
          explorerName: 'Etherscan',
          explorerUrl: 'https://etherscan.io',
          txUrl: `https://etherscan.io/tx/${txHash}`,
        },
      });
      
      // Update user balance
      const balance = await tx.userBalance.upsert({
        where: {
          userId_currency_chain: {
            userId: wallet.userId,
            currency: currency.toUpperCase(),
            chain: chain?.toUpperCase() || wallet.chain,
          },
        },
        update: {
          totalBalance: { increment: parseFloat(amount) },
          available: { increment: parseFloat(amount) },
        },
        create: {
          userId: wallet.userId,
          currency: currency.toUpperCase(),
          chain: chain?.toUpperCase() || wallet.chain,
          totalBalance: parseFloat(amount),
          available: parseFloat(amount),
        },
      });
      
      // Create notification
      await tx.notification.create({
        data: {
          userId: wallet.userId,
          type: 'DEPOSIT_CONFIRMED',
          category: 'TRANSACTION',
          title: 'Deposit Confirmed',
          message: `Your deposit of ${amount} ${currency.toUpperCase()} has been confirmed.`,
          token: currency.toUpperCase(),
          amount: amount.toString(),
          chain: chain?.toUpperCase() || wallet.chain,
          txHash: txHash,
          metadata: JSON.stringify({
            depositId,
            txUrl: `https://etherscan.io/tx/${txHash}`,
          }),
        },
      });
      
      return { deposit, balance };
    });
    
    return NextResponse.json({
      success: true,
      message: 'Deposit credited successfully',
      deposit: {
        depositId: result.deposit.depositId,
        amount: result.deposit.amount,
        currency: result.deposit.currency,
        status: result.deposit.status,
        txHash: result.deposit.txHash,
      },
      balance: {
        currency: result.balance.currency,
        available: result.balance.available,
        total: result.balance.totalBalance,
      },
    });
    
  } catch (error) {
    console.error('Error crediting deposit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to credit deposit' },
      { status: 500 }
    );
  }
}

// GET /api/admin/credit-deposit - Check deposit status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('address');
    const txHash = searchParams.get('txHash');
    
    if (txHash) {
      // Check if specific transaction exists
      const deposit = await prisma.deposit.findFirst({
        where: { txHash: txHash.toLowerCase() },
      });
      
      return NextResponse.json({
        success: true,
        exists: !!deposit,
        deposit: deposit ? {
          depositId: deposit.depositId,
          amount: deposit.amount,
          currency: deposit.currency,
          status: deposit.status,
        } : null,
      });
    }
    
    if (walletAddress) {
      // Get wallet info
      const wallet = await prisma.wallet.findFirst({
        where: { 
          address: { 
            equals: walletAddress,
            //mode: 'insensitive' 
          }
        },
        include: { 
          user: {
            select: { id: true, email: true }
          }
        },
      });
      
      if (!wallet) {
        return NextResponse.json({
          success: false,
          error: 'Wallet not found',
        }, { status: 404 });
      }
      
      // Get deposits for this address
      const deposits = await prisma.deposit.findMany({
        where: { toAddress: walletAddress.toLowerCase() },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      
      // Get balances
      const balances = await prisma.userBalance.findMany({
        where: { userId: wallet.userId },
      });
      
      return NextResponse.json({
        success: true,
        wallet: {
          address: wallet.address,
          chain: wallet.chain,
          userId: wallet.userId,
          userEmail: wallet.user.email,
        },
        deposits: deposits.map(d => ({
          depositId: d.depositId,
          amount: d.amount,
          currency: d.currency,
          status: d.status,
          txHash: d.txHash,
          createdAt: d.createdAt,
        })),
        balances: balances.map(b => ({
          currency: b.currency,
          available: b.available,
          locked: b.locked,
          total: b.totalBalance,
        })),
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Provide address or txHash parameter',
    }, { status: 400 });
    
  } catch (error) {
    console.error('Error checking deposit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check deposit' },
      { status: 500 }
    );
  }
}