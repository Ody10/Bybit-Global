import { NextRequest, NextResponse } from 'next/server';
import { getOrderBook, getRecentTrades, get24hTicker, getAllTickers } from '@/lib/orderbook-service';

// GET /api/trading/orderbook - Get order book, trades, or ticker
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const type = searchParams.get('type') || 'orderbook'; // orderbook, trades, ticker, alltickers
    const depth = parseInt(searchParams.get('depth') || '20');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    switch (type.toLowerCase()) {
      case 'orderbook':
        if (!symbol) {
          return NextResponse.json(
            { success: false, error: 'Symbol is required for order book' },
            { status: 400 }
          );
        }
        
        const orderBook = await getOrderBook(symbol.toUpperCase(), depth);
        return NextResponse.json({
          success: true,
          ...orderBook,
        });
        
      case 'trades':
        if (!symbol) {
          return NextResponse.json(
            { success: false, error: 'Symbol is required for trades' },
            { status: 400 }
          );
        }
        
        const trades = await getRecentTrades(symbol.toUpperCase(), limit);
        return NextResponse.json({
          success: true,
          symbol: symbol.toUpperCase(),
          trades,
        });
        
      case 'ticker':
        if (!symbol) {
          return NextResponse.json(
            { success: false, error: 'Symbol is required for ticker' },
            { status: 400 }
          );
        }
        
        const ticker = await get24hTicker(symbol.toUpperCase());
        return NextResponse.json({
          success: true,
          ...ticker,
        });
        
      case 'alltickers':
        const tickers = await getAllTickers();
        return NextResponse.json({
          success: true,
          tickers,
        });
        
      default:
        return NextResponse.json(
          { success: false, error: `Unknown type: ${type}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching market data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}