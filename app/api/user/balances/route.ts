export const dynamic = 'force-static';
export const revalidate = false;

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Custom token prices (stablecoins pegged to $1)
const STABLECOIN_PRICES: Record<string, number> = {
  USDT: 1.00,
  USDC: 1.00,
  USCT: 1.00,  // Your platform stablecoin
  DAI: 1.00,
  BUSD: 1.00,
  TUSD: 1.00,
  USDP: 1.00,
};

// Fetch live prices from Bybit API
async function fetchLivePrices(): Promise<Record<string, number>> {
  try {
    const response = await fetch('https://api.bybit.com/v5/market/tickers?category=spot', {
      next: { revalidate: 10 }, // Cache for 10 seconds
    });
    const data = await response.json();
    
    const prices: Record<string, number> = { ...STABLECOIN_PRICES };
    
    if (data.retCode === 0 && data.result?.list) {
      for (const item of data.result.list) {
        if (item.symbol.endsWith('USDT')) {
          const symbol = item.symbol.replace('USDT', '');
          prices[symbol] = parseFloat(item.lastPrice) || 0;
        }
      }
    }
    
    return prices;
  } catch (error) {
    console.error('Error fetching prices:', error);
    // Return default prices if API fails
    return {
      ...STABLECOIN_PRICES,
      BTC: 87000,
      ETH: 3000,
      BNB: 600,
      SOL: 180,
      XRP: 2.20,
      ADA: 0.90,
      DOGE: 0.32,
      DOT: 7.50,
      MATIC: 0.85,
      LINK: 22,
      AVAX: 35,
      LTC: 100,
      TRX: 0.25,
      ATOM: 10,
      UNI: 12,
      SHIB: 0.000025,
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    // Fetch live prices
    const prices = await fetchLivePrices();

    // Get user FUNDING balances from database (UserBalance table)
    // All deposits go here
    const fundingBalances = await prisma.userBalance.findMany({
      where: { userId },
      orderBy: [
        { totalBalance: 'desc' },
        { currency: 'asc' },
      ],
    });

    // Get UNIFIED TRADING balances (if table exists)
    // Only contains balances user has transferred from Funding
    let unifiedTradingBalances: any[] = [];
    try {
      // Check if UnifiedTradingBalance table exists
      unifiedTradingBalances = await (prisma as any).unifiedTradingBalance?.findMany({
        where: { userId },
      }) || [];
    } catch (e) {
      // Table doesn't exist yet - that's fine
      unifiedTradingBalances = [];
    }

    // Calculate funding balances with live USD values
    let fundingTotalUsd = 0;
    let fundingAvailableUsd = 0;
    let fundingLockedUsd = 0;
    let fundingFrozenUsd = 0;

    const processedFundingBalances = fundingBalances.map((balance) => {
      // Get live price for this currency
      const price = prices[balance.currency] || STABLECOIN_PRICES[balance.currency] || 0;
      const usdValue = balance.totalBalance * price;
      const availableUsd = balance.available * price;
      const lockedUsd = balance.locked * price;
      const frozenUsd = balance.frozen * price;

      fundingTotalUsd += usdValue;
      fundingAvailableUsd += availableUsd;
      fundingLockedUsd += lockedUsd;
      fundingFrozenUsd += frozenUsd;

      return {
        currency: balance.currency,
        chain: balance.chain,
        network: balance.network,
        totalBalance: balance.totalBalance,
        available: balance.available,
        locked: balance.locked,
        frozen: balance.frozen,
        staked: balance.staked,
        earning: balance.earning,
        usdValue,
        price,
        accountType: 'FUNDING',
      };
    });

    // Calculate unified trading balances with live USD values
    let tradingTotalUsd = 0;
    let tradingAvailableUsd = 0;
    let tradingLockedUsd = 0;

    const processedTradingBalances = unifiedTradingBalances.map((balance: any) => {
      const price = prices[balance.currency] || STABLECOIN_PRICES[balance.currency] || 0;
      const usdValue = balance.totalBalance * price;
      
      tradingTotalUsd += usdValue;
      tradingAvailableUsd += balance.available * price;
      tradingLockedUsd += balance.locked * price;

      return {
        currency: balance.currency,
        totalBalance: balance.totalBalance,
        available: balance.available,
        locked: balance.locked,
        frozen: balance.frozen || 0,
        usdValue,
        price,
        accountType: 'UNIFIED_TRADING',
      };
    });

    // Group funding balances by currency (aggregate across chains)
    const aggregatedBalances: { [key: string]: any } = {};
    
    processedFundingBalances.forEach((balance) => {
      if (!aggregatedBalances[balance.currency]) {
        aggregatedBalances[balance.currency] = {
          currency: balance.currency,
          totalBalance: 0,
          available: 0,
          locked: 0,
          frozen: 0,
          usdValue: 0,
          price: balance.price,
          chains: [],
        };
      }
      
      aggregatedBalances[balance.currency].totalBalance += balance.totalBalance;
      aggregatedBalances[balance.currency].available += balance.available;
      aggregatedBalances[balance.currency].locked += balance.locked;
      aggregatedBalances[balance.currency].frozen += balance.frozen;
      aggregatedBalances[balance.currency].usdValue += balance.usdValue;
      aggregatedBalances[balance.currency].chains.push({
        chain: balance.chain,
        network: balance.network,
        balance: balance.totalBalance,
        available: balance.available,
      });
    });

    // Total across all accounts
    const totalUsdValue = fundingTotalUsd + tradingTotalUsd;
    const totalAvailableUsd = fundingAvailableUsd + tradingAvailableUsd;
    const totalLockedUsd = fundingLockedUsd + tradingLockedUsd;
    
    // Calculate BTC equivalent using live BTC price
    const btcPrice = prices['BTC'] || 87000;
    const btcValue = totalUsdValue / btcPrice;

    return NextResponse.json({
      success: true,
      
      // Main balances array (for Asset tab - aggregated funding balances)
      balances: Object.values(aggregatedBalances),
      
      // Raw funding balances (with chain info)
      rawBalances: processedFundingBalances,
      
      // Separate account balances for detailed views
      funding: {
        balances: processedFundingBalances,
        summary: {
          totalUsdValue: fundingTotalUsd,
          availableUsdValue: fundingAvailableUsd,
          lockedUsdValue: fundingLockedUsd,
          frozenUsdValue: fundingFrozenUsd,
        },
      },
      
      unifiedTrading: {
        balances: processedTradingBalances,
        summary: {
          totalUsdValue: tradingTotalUsd,
          availableUsdValue: tradingAvailableUsd,
          lockedUsdValue: tradingLockedUsd,
          frozenUsdValue: 0,
        },
      },
      
      // Overall summary
      summary: {
        totalUsdValue,
        availableUsdValue: totalAvailableUsd,
        lockedUsdValue: totalLockedUsd,
        frozenUsdValue: fundingFrozenUsd,
        btcValue,
        todayPnL: 0, // Calculate from trade history in production
        todayPnLPercent: 0,
        // Separate totals for Account tab display
        fundingUsdValue: fundingTotalUsd,
        unifiedTradingUsdValue: tradingTotalUsd,
      },
      
      // Live prices for frontend calculations
      prices,
    });

  } catch (error) {
    console.error('Balances API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
