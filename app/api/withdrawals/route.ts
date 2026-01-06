import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import {
  createWithdrawalRequest,
  getUserWithdrawals,
  calculateWithdrawalFee,
  validateWithdrawal,
} from '@/lib/withdrawal-service';
import { getTokenPrice } from '@/lib/price-service';
import { getChainConfig, getTokenConfig } from '@/lib/chain-config';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

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

// GET /api/withdrawals - Get user's withdrawals
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const { withdrawals, total } = await getUserWithdrawals(userId, {
      status,
      limit,
      offset,
    });
    
    return NextResponse.json({
      withdrawals,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch withdrawals' },
      { status: 500 }
    );
  }
}

// POST /api/withdrawals - Create withdrawal request
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { token, chain, amount, toAddress, memo, note } = body;
    
    // Validate required fields
    if (!token || !chain || !amount || !toAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: token, chain, amount, toAddress' },
        { status: 400 }
      );
    }
    
    // Parse amount
    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }
    
    // Validate withdrawal
    const validation = await validateWithdrawal(
      userId,
      token.toUpperCase(),
      chain.toUpperCase(),
      withdrawAmount,
      toAddress
    );
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    
    // Calculate fee
    const { fee, netAmount } = calculateWithdrawalFee(
      chain.toUpperCase(),
      token.toUpperCase(),
      withdrawAmount
    );
    
    // Get current price
    const price = await getTokenPrice(token);
    const usdValue = netAmount * price;
    
    // Get chain config
    const chainConfig = getChainConfig(chain.toUpperCase());
    
    // Create withdrawal request
    const result = await createWithdrawalRequest({
      userId,
      token: token.toUpperCase(),
      chain: chain.toUpperCase(),
      amount: withdrawAmount,
      toAddress,
      memo,
      note,
    });
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      withdrawalId: result.withdrawalId,
      message: 'Withdrawal request created. Please verify with the code sent to your email.',
      details: {
        amount: withdrawAmount,
        fee,
        netAmount,
        token: token.toUpperCase(),
        chain: chainConfig?.displayName || chain.toUpperCase(),
        toAddress,
        usdValue,
        requiredConfirmations: chainConfig?.confirmations || 12,
      },
      // In production, don't return the verification code
      // Only included here for testing
      _testVerificationCode: process.env.NODE_ENV === 'development' ? result.verificationCode : undefined,
    });
  } catch (error) {
    console.error('Error creating withdrawal:', error);
    return NextResponse.json(
      { error: 'Failed to create withdrawal request' },
      { status: 500 }
    );
  }
}

// OPTIONS - Get withdrawal info (fees, limits, etc.)
export async function OPTIONS(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const chain = searchParams.get('chain');
    const amount = searchParams.get('amount');
    
    if (!token || !chain) {
      return NextResponse.json(
        { error: 'Missing token or chain parameter' },
        { status: 400 }
      );
    }
    
    const chainConfig = getChainConfig(chain.toUpperCase());
    const tokenConfig = getTokenConfig(chain.toUpperCase(), token.toUpperCase());
    
    if (!chainConfig || !tokenConfig) {
      return NextResponse.json(
        { error: 'Invalid chain or token' },
        { status: 400 }
      );
    }
    
    // Calculate fee if amount provided
    let feeInfo = null;
    if (amount) {
      const withdrawAmount = parseFloat(amount);
      if (!isNaN(withdrawAmount) && withdrawAmount > 0) {
        const { fee, netAmount } = calculateWithdrawalFee(
          chain.toUpperCase(),
          token.toUpperCase(),
          withdrawAmount
        );
        const price = await getTokenPrice(token);
        
        feeInfo = {
          amount: withdrawAmount,
          fee,
          netAmount,
          usdValue: netAmount * price,
        };
      }
    }
    
    const price = await getTokenPrice(token);
    
    return NextResponse.json({
      token: token.toUpperCase(),
      chain: chain.toUpperCase(),
      chainDisplayName: chainConfig.displayName,
      withdrawalFee: tokenConfig.withdrawalFee,
      minWithdrawal: tokenConfig.minWithdrawal,
      requiredConfirmations: chainConfig.confirmations,
      estimatedTime: `~${Math.ceil(chainConfig.confirmations * chainConfig.blockTime / 60)} minutes`,
      currentPrice: price,
      feeInfo,
    });
  } catch (error) {
    console.error('Error getting withdrawal info:', error);
    return NextResponse.json(
      { error: 'Failed to get withdrawal info' },
      { status: 500 }
    );
  }
}