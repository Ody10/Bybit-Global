export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import {
  getUserBalancesWithPrices,
  getUserTokenBalance,
  getTotalPortfolioValue,
  getBalanceSummaryByToken,
} from '@/lib/balance-service';
import { getCurrentStablecoinPrice } from '@/lib/price-service';

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

// GET /api/balances - Get user balances with real-time prices
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
    const currency = searchParams.get('currency');
    const chain = searchParams.get('chain');
    const summary = searchParams.get('summary') === 'true';
    
    // Get specific token balance
    if (currency && chain) {
      const balance = await getUserTokenBalance(userId, currency.toUpperCase(), chain.toUpperCase());
      
      if (!balance) {
        return NextResponse.json({
          balance: null,
          message: 'No balance found for this token',
        });
      }
      
      return NextResponse.json({ balance });
    }
    
    // Get summary grouped by token
    if (summary) {
      const balanceSummary = await getBalanceSummaryByToken(userId);
      const portfolioValue = await getTotalPortfolioValue(userId);
      
      const summaryArray = Array.from(balanceSummary.entries()).map(([token, data]) => ({
        token,
        ...data,
      }));
      
      return NextResponse.json({
        summary: summaryArray,
        portfolio: portfolioValue,
        stablecoinPrice: getCurrentStablecoinPrice(),
        timestamp: new Date().toISOString(),
      });
    }
    
    // Get all balances with prices
    const balances = await getUserBalancesWithPrices(userId);
    const portfolioValue = await getTotalPortfolioValue(userId);
    
    // Separate balances by type
    const nonZeroBalances = balances.filter(b => b.totalBalance > 0);
    const zeroBalances = balances.filter(b => b.totalBalance === 0);
    
    return NextResponse.json({
      balances: nonZeroBalances,
      zeroBalances: zeroBalances.length,
      portfolio: portfolioValue,
      stablecoinPrice: getCurrentStablecoinPrice(),
      priceNote: 'Stablecoin prices fluctuate between $0.99 and $1.00',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching balances:', error);
    return NextResponse.json(
      { error: 'Failed to fetch balances' },
      { status: 500 }
    );
  }
}

