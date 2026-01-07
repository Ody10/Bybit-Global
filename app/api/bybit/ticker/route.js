// app/api/bybit/ticker/route.js
export const dynamic = 'force-static';
export const revalidate = false;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'BTCUSDT';
    
    const response = await fetch(
      `https://api.bybit.com/v5/market/tickers?category=spot&symbol=${symbol}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching ticker:', error);
    return Response.json(
      { retCode: -1, retMsg: 'Error fetching ticker' },
      { status: 500 }
    );
  }
}