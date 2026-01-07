export const dynamic = 'force-static';
export const revalidate = false;

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenPrice, getCurrentStablecoinPrice } from '@/lib/price-service';

// Default trading pairs to seed if none exist
const DEFAULT_PAIRS = [
  { symbol: 'BTCUSDT', baseAsset: 'BTC', quoteAsset: 'USDT', type: 'SPOT', minOrderQty: 0.0001, maxLeverage: 125 },
  { symbol: 'ETHUSDT', baseAsset: 'ETH', quoteAsset: 'USDT', type: 'SPOT', minOrderQty: 0.001, maxLeverage: 100 },
  { symbol: 'BNBUSDT', baseAsset: 'BNB', quoteAsset: 'USDT', type: 'SPOT', minOrderQty: 0.01, maxLeverage: 75 },
  { symbol: 'SOLUSDT', baseAsset: 'SOL', quoteAsset: 'USDT', type: 'SPOT', minOrderQty: 0.01, maxLeverage: 50 },
  { symbol: 'XRPUSDT', baseAsset: 'XRP', quoteAsset: 'USDT', type: 'SPOT', minOrderQty: 1, maxLeverage: 50 },
  { symbol: 'ADAUSDT', baseAsset: 'ADA', quoteAsset: 'USDT', type: 'SPOT', minOrderQty: 1, maxLeverage: 50 },
  { symbol: 'DOGEUSDT', baseAsset: 'DOGE', quoteAsset: 'USDT', type: 'SPOT', minOrderQty: 1, maxLeverage: 50 },
  { symbol: 'MATICUSDT', baseAsset: 'MATIC', quoteAsset: 'USDT', type: 'SPOT', minOrderQty: 1, maxLeverage: 50 },
  { symbol: 'DOTUSDT', baseAsset: 'DOT', quoteAsset: 'USDT', type: 'SPOT', minOrderQty: 0.1, maxLeverage: 50 },
  { symbol: 'LTCUSDT', baseAsset: 'LTC', quoteAsset: 'USDT', type: 'SPOT', minOrderQty: 0.01, maxLeverage: 75 },
  { symbol: 'AVAXUSDT', baseAsset: 'AVAX', quoteAsset: 'USDT', type: 'SPOT', minOrderQty: 0.1, maxLeverage: 50 },
  { symbol: 'LINKUSDT', baseAsset: 'LINK', quoteAsset: 'USDT', type: 'SPOT', minOrderQty: 0.1, maxLeverage: 50 },
  { symbol: 'UNIUSDT', baseAsset: 'UNI', quoteAsset: 'USDT', type: 'SPOT', minOrderQty: 0.1, maxLeverage: 50 },
  { symbol: 'ATOMUSDT', baseAsset: 'ATOM', quoteAsset: 'USDT', type: 'SPOT', minOrderQty: 0.1, maxLeverage: 50 },
  { symbol: 'USCTUSDT', baseAsset: 'USCT', quoteAsset: 'USDT', type: 'SPOT', minOrderQty: 1, maxLeverage: 10 },
];

// Seed default pairs if needed
async function seedDefaultPairs() {
  const existingCount = await prisma.tradingPair.count();
  
  if (existingCount === 0) {
    for (const pair of DEFAULT_PAIRS) {
      const price = await getTokenPrice(pair.baseAsset);
      
      await prisma.tradingPair.create({
        data: {
          ...pair,
          lastPrice: price,
          markPrice: price,
          indexPrice: price,
          price24hOpen: price,
          price24hHigh: price * 1.02,
          price24hLow: price * 0.98,
          price24hChange: (Math.random() - 0.5) * 10,
          volume24h: Math.random() * 10000,
          volumeQuote24h: Math.random() * 10000000,
          tickSize: price > 1000 ? 0.1 : 0.0001,
          stepSize: pair.minOrderQty,
          minOrderValue: 1,
        },
      });
    }
    console.log('Seeded default trading pairs');
  }
}

// GET /api/trading/pairs - Get all trading pairs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // SPOT, FUTURES
    const symbol = searchParams.get('symbol');
    const baseAsset = searchParams.get('baseAsset');
    
    // Seed default pairs if needed
    await seedDefaultPairs();
    
    // Build query
    const where: any = { isActive: true };
    if (type) where.type = type.toUpperCase();
    if (symbol) where.symbol = symbol.toUpperCase();
    if (baseAsset) where.baseAsset = baseAsset.toUpperCase();
    
    const pairs = await prisma.tradingPair.findMany({
      where,
      orderBy: { volume24h: 'desc' },
    });
    
    // Update prices from price service
    const updatedPairs = await Promise.all(
      pairs.map(async (pair) => {
        try {
          const currentPrice = await getTokenPrice(pair.baseAsset);
          const priceChange = ((currentPrice - pair.price24hOpen) / pair.price24hOpen) * 100;
          
          return {
            ...pair,
            lastPrice: currentPrice,
            markPrice: currentPrice,
            price24hChange: parseFloat(priceChange.toFixed(2)),
          };
        } catch {
          return pair;
        }
      })
    );
    
    return NextResponse.json({
      success: true,
      pairs: updatedPairs,
    });
  } catch (error) {
    console.error('Error fetching trading pairs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trading pairs' },
      { status: 500 }
    );
  }
}

// POST /api/trading/pairs - Create trading pair (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, baseAsset, quoteAsset, type, minOrderQty, maxLeverage, internalSecret } = body;
    
    // Simple admin check
    if (internalSecret !== process.env.INTERNAL_API_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Validate required fields
    if (!symbol || !baseAsset || !quoteAsset) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if pair exists
    const existing = await prisma.tradingPair.findUnique({
      where: { symbol: symbol.toUpperCase() },
    });
    
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Trading pair already exists' },
        { status: 400 }
      );
    }
    
    // Get current price
    const price = await getTokenPrice(baseAsset);
    
    const pair = await prisma.tradingPair.create({
      data: {
        symbol: symbol.toUpperCase(),
        baseAsset: baseAsset.toUpperCase(),
        quoteAsset: quoteAsset.toUpperCase(),
        type: type?.toUpperCase() || 'SPOT',
        lastPrice: price,
        markPrice: price,
        indexPrice: price,
        price24hOpen: price,
        price24hHigh: price,
        price24hLow: price,
        minOrderQty: minOrderQty || 0.0001,
        maxLeverage: maxLeverage || 100,
        tickSize: price > 1000 ? 0.1 : 0.0001,
      },
    });
    
    return NextResponse.json({
      success: true,
      pair,
    });
  } catch (error) {
    console.error('Error creating trading pair:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create trading pair' },
      { status: 500 }
    );
  }
}
