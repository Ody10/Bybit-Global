// app/api/crypto/route.ts

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const response = await fetch(
      'https://api.bybit.com/v5/market/tickers?category=spot',
      { 
        cache: 'no-store',
        next: { revalidate: 0 }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Bybit API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return Response.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    return Response.json(
      { 
        retCode: -1,
        retMsg: 'Failed to fetch crypto data',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}