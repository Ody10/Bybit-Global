export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import {
  createManualDeposit,
  getDepositStatus,
  getPendingDeposits,
  processConfirmedDeposit,
} from '@/lib/deposit-monitor';
import { getTokenPrice, calculateUsdValue } from '@/lib/price-service';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET || 'internal-secret';

// Helper to verify JWT and get user ID
async function getUserIdFromToken(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

// GET /api/deposits - Get user's deposits or specific deposit status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const depositId = searchParams.get('depositId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Get specific deposit by ID (public endpoint for tracking)
    if (depositId) {
      const deposit = await getDepositStatus(depositId);
      
      if (!deposit) {
        return NextResponse.json(
          { error: 'Deposit not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ deposit });
    }
    
    // Get user's deposits (requires auth)
    const userId = await getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const where: any = { userId };
    
    if (status) {
      where.status = status;
    }
    
    const [deposits, total] = await Promise.all([
      prisma.deposit.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.deposit.count({ where }),
    ]);
    
    // Get current prices for deposits
    const depositsWithPrices = await Promise.all(
      deposits.map(async (deposit) => {
        const price = await getTokenPrice(deposit.currency);
        const usdValue = deposit.amount * price;
        
        return {
          ...deposit,
          blockNumber: deposit.blockNumber?.toString(), // BigInt to string for JSON
          currentPrice: price,
          currentUsdValue: usdValue,
        };
      })
    );
    
    return NextResponse.json({
      deposits: depositsWithPrices,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching deposits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deposits' },
      { status: 500 }
    );
  }
}

// POST /api/deposits - Create manual deposit (admin/testing)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      token,
      chain,
      amount,
      txHash,
      fromAddress,
      internalSecret,
    } = body;
    
    // Verify authorization - either internal secret or admin user
    const authUserId = await getUserIdFromToken(request);
    
    // Check if internal service call
    const isInternalCall = internalSecret === INTERNAL_SECRET;
    
    // Check if user is making a deposit request for themselves (simulation mode)
    const isSelfDeposit = authUserId && authUserId === userId;
    
    // For now, allow self-deposits for testing. In production, you'd want admin checks.
    if (!isInternalCall && !isSelfDeposit) {
      return NextResponse.json(
        { error: 'Unauthorized - admin access required' },
        { status: 401 }
      );
    }
    
    // Validate required fields
    if (!userId || !token || !chain || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, token, chain, amount' },
        { status: 400 }
      );
    }
    
    // Validate amount
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }
    
    // Create deposit
    const depositId = await createManualDeposit({
      userId,
      token: token.toUpperCase(),
      chain: chain.toUpperCase(),
      amount: depositAmount,
      txHash,
      fromAddress,
    });
    
    if (!depositId) {
      return NextResponse.json(
        { error: 'Failed to create deposit' },
        { status: 500 }
      );
    }
    
    // Get deposit details
    const deposit = await getDepositStatus(depositId);
    
    // Calculate USD value
    const price = await getTokenPrice(token);
    const usdValue = depositAmount * price;
    
    return NextResponse.json({
      success: true,
      depositId,
      deposit,
      usdValue,
      message: `Successfully deposited ${depositAmount} ${token.toUpperCase()} ($${usdValue.toFixed(2)})`,
    });
  } catch (error) {
    console.error('Error creating deposit:', error);
    return NextResponse.json(
      { error: 'Failed to create deposit' },
      { status: 500 }
    );
  }
}

// PATCH /api/deposits - Update deposit (confirm, process)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { depositId, action, internalSecret } = body;
    
    // Verify internal secret
    if (internalSecret !== INTERNAL_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (!depositId || !action) {
      return NextResponse.json(
        { error: 'Missing depositId or action' },
        { status: 400 }
      );
    }
    
    switch (action) {
      case 'confirm':
        // Process confirmed deposit
        const success = await processConfirmedDeposit(depositId);
        
        if (!success) {
          return NextResponse.json(
            { error: 'Failed to process deposit' },
            { status: 500 }
          );
        }
        
        const deposit = await getDepositStatus(depositId);
        return NextResponse.json({
          success: true,
          deposit,
          message: 'Deposit confirmed and credited',
        });
        
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating deposit:', error);
    return NextResponse.json(
      { error: 'Failed to update deposit' },
      { status: 500 }
    );
  }
}

