// app/api/bybit/orderbook/route.js

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'BTCUSDT';
    
    const response = await fetch(
      `https://api.bybit.com/v5/market/orderbook?category=spot&symbol=${symbol}&limit=50`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`Bybit API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return Response.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('Error fetching orderbook:', error);
    return Response.json(
      { retCode: -1, retMsg: 'Error fetching orderbook' },
      { status: 500 }
    );
  }
}