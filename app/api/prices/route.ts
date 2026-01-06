import { NextRequest, NextResponse } from 'next/server';
import {
  getTokenPrice,
  getMultipleTokenPrices,
  getCurrentStablecoinPrice,
  isStablecoin,
  getStablecoinPriceHistory,
  formatPrice,
} from '@/lib/price-service';

// GET /api/prices - Get token prices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokens = searchParams.get('tokens'); // comma-separated list
    const single = searchParams.get('token'); // single token
    const history = searchParams.get('history') === 'true';
    
    // Get stablecoin price history
    if (history) {
      const points = parseInt(searchParams.get('points') || '24');
      const priceHistory = getStablecoinPriceHistory(points);
      
      return NextResponse.json({
        type: 'stablecoin_history',
        currentPrice: getCurrentStablecoinPrice(),
        history: priceHistory,
      });
    }
    
    // Get single token price
    if (single) {
      const price = await getTokenPrice(single);
      const isStable = isStablecoin(single);
      
      return NextResponse.json({
        token: single.toUpperCase(),
        price,
        priceFormatted: `$${formatPrice(price, isStable ? 4 : 2)}`,
        isStablecoin: isStable,
        timestamp: new Date().toISOString(),
      });
    }
    
    // Get multiple token prices
    if (tokens) {
      const tokenList = tokens.split(',').map(t => t.trim().toUpperCase());
      const prices = await getMultipleTokenPrices(tokenList);
      
      const result: any = {};
      prices.forEach((price, token) => {
        const isStable = isStablecoin(token);
        result[token] = {
          price,
          priceFormatted: `$${formatPrice(price, isStable ? 4 : 2)}`,
          isStablecoin: isStable,
        };
      });
      
      return NextResponse.json({
        prices: result,
        timestamp: new Date().toISOString(),
      });
    }
    
    // Default: Return prices for common tokens including stablecoins
    const defaultTokens = ['BTC', 'ETH', 'BNB', 'SOL', 'TRX', 'USCT', 'USDT', 'USDC'];
    const prices = await getMultipleTokenPrices(defaultTokens);
    
    const result: any = {};
    prices.forEach((price, token) => {
      const isStable = isStablecoin(token);
      result[token] = {
        price,
        priceFormatted: `$${formatPrice(price, isStable ? 4 : 2)}`,
        isStablecoin: isStable,
      };
    });
    
    return NextResponse.json({
      prices: result,
      stablecoinInfo: {
        currentPrice: getCurrentStablecoinPrice(),
        range: { min: 0.99, max: 1.0 },
        note: 'Stablecoins fluctuate between $0.99 and $1.00',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}