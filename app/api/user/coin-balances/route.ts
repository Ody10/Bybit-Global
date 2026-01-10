import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Get userId from query params or session
    // For now using demo user - replace with actual auth
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || '4000000001'; // Demo UID
    
    console.log('📊 Fetching balances for user:', userId);

    // Fetch user's coin balances from database
    const balances = await prisma.userBalance.findMany({
      where: {
        userId: userId,
      },
      select: {
        currency: true,
        totalBalance: true,
        available: true,
        locked: true,
        usdValue: true,
        chain: true,
      },
    });

    console.log('✅ Found', balances.length, 'balances');

    // Format the response - group by currency (combine chains)
    const formattedBalances = balances.reduce((acc, balance) => {
      const currency = balance.currency;
      
      if (!acc[currency]) {
        acc[currency] = {
          balance: 0,
          available: 0,
          locked: 0,
          usdValue: 0,
        };
      }
      
      // Sum up balances from different chains
      acc[currency].balance += balance.totalBalance;
      acc[currency].available += balance.available;
      acc[currency].locked += balance.locked;
      acc[currency].usdValue += balance.usdValue;
      
      return acc;
    }, {} as Record<string, { balance: number; available: number; locked: number; usdValue: number }>);

    return NextResponse.json({
      success: true,
      balances: formattedBalances,
    });
  } catch (error) {
    console.error('❌ Error fetching coin balances:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch balances',
        balances: {} // Return empty object so app doesn't crash
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}