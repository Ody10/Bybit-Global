export const dynamic = 'force-static';
export const revalidate = false;

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createManualDeposit, getDepositStatus } from '@/lib/deposit-monitor';
import { scanChainForDeposits, updatePendingDepositConfirmations } from '@/lib/blockchain-scanner';

// POST /api/deposits/monitor - Trigger manual scan or credit deposit
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
    const { action } = body;
    
    switch (action) {
      case 'scan': {
        // Scan specific chain for deposits
        const { chain } = body;
        if (!chain) {
          return NextResponse.json(
            { success: false, error: 'Chain is required for scan action' },
            { status: 400 }
          );
        }
        
        const result = await scanChainForDeposits(chain);
        
        return NextResponse.json({
          success: true,
          action: 'scan',
          result,
        });
      }
      
      case 'update_confirmations': {
        // Update confirmations for pending deposits
        const { chain } = body;
        const updated = await updatePendingDepositConfirmations(chain);
        
        return NextResponse.json({
          success: true,
          action: 'update_confirmations',
          updated,
        });
      }
      
      case 'manual_credit': {
        // Manually credit a deposit
        const { userId, email, walletAddress, token, chain, amount, txHash, fromAddress } = body;
        
        // Find user by ID, email, or wallet address
        let targetUserId = userId;
        
        if (!targetUserId && email) {
          const user = await prisma.user.findUnique({ where: { email } });
          targetUserId = user?.id;
        }
        
        if (!targetUserId && walletAddress) {
          const wallet = await prisma.wallet.findFirst({
            where: { address: walletAddress.toLowerCase() },
          });
          targetUserId = wallet?.userId;
        }
        
        if (!targetUserId) {
          return NextResponse.json(
            { success: false, error: 'User not found. Provide userId, email, or walletAddress' },
            { status: 404 }
          );
        }
        
        if (!token || !chain || !amount) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields: token, chain, amount' },
            { status: 400 }
          );
        }
        
        const depositId = await createManualDeposit({
          userId: targetUserId,
          token: token.toUpperCase(),
          chain: chain.toUpperCase(),
          amount: parseFloat(amount),
          txHash,
          fromAddress,
        });
        
        if (!depositId) {
          return NextResponse.json(
            { success: false, error: 'Failed to create manual deposit' },
            { status: 500 }
          );
        }
        
        return NextResponse.json({
          success: true,
          action: 'manual_credit',
          depositId,
          message: `Credited ${amount} ${token} to user ${targetUserId}`,
        });
      }
      
      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}. Use 'scan', 'update_confirmations', or 'manual_credit'` },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('Deposit monitor error:', error);
    return NextResponse.json(
      { success: false, error: 'Operation failed' },
      { status: 500 }
    );
  }
}

// GET /api/deposits/monitor - Get deposit status or pending deposits
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const depositId = searchParams.get('depositId');
    const txHash = searchParams.get('txHash');
    const address = searchParams.get('address');
    const status = searchParams.get('status');
    const chain = searchParams.get('chain');
    
    // Get specific deposit
    if (depositId) {
      const deposit = await getDepositStatus(depositId);
      
      if (!deposit) {
        return NextResponse.json(
          { success: false, error: 'Deposit not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ success: true, deposit });
    }
    
    // Search by tx hash
    if (txHash) {
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
          confirmations: deposit.confirmations,
        } : null,
      });
    }
    
    // Get deposits by address
    if (address) {
      const wallet = await prisma.wallet.findFirst({
        where: { address: address.toLowerCase() },
        include: { user: { select: { id: true, email: true } } },
      });
      
      if (!wallet) {
        return NextResponse.json(
          { success: false, error: 'Wallet address not found' },
          { status: 404 }
        );
      }
      
      const deposits = await prisma.deposit.findMany({
        where: { toAddress: address.toLowerCase() },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
      
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
          confirmations: d.confirmations,
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
    
    // Get pending deposits
    const where: any = {};
    if (status) where.status = status.toUpperCase();
    if (chain) where.chain = chain.toUpperCase();
    
    const deposits = await prisma.deposit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    
    return NextResponse.json({
      success: true,
      count: deposits.length,
      deposits: deposits.map(d => ({
        depositId: d.depositId,
        userId: d.userId,
        amount: d.amount,
        currency: d.currency,
        chain: d.chain,
        status: d.status,
        confirmations: d.confirmations,
        requiredConfirmations: d.requiredConfirmations,
        txHash: d.txHash,
        toAddress: d.toAddress,
        createdAt: d.createdAt,
      })),
    });
    
  } catch (error) {
    console.error('Error fetching deposits:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch deposits' },
      { status: 500 }
    );
  }
}
