// app/api/bybit/orderbook/route.js
export const dynamic = 'force-static';
export const revalidate = false;

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
      }
    );
    
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching orderbook:', error);
    return Response.json(
      { retCode: -1, retMsg: 'Error fetching orderbook' },
      { status: 500 }
    );
  }
}