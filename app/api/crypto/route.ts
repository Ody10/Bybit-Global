// app/api/crypto/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET() {
  try {
    const response = await fetch(
      'https://api.bybit.com/v5/market/tickers?category=spot',
      { cache: 'no-store' }
    );
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    return Response.json(
      { error: 'Failed to fetch crypto data' },
      { status: 500 }
    );
  }
}
