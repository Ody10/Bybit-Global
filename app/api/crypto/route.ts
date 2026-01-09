// app/api/crypto/route.ts

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('Attempting to fetch from Bybit API...');
    
    const response = await fetch(
      'https://api.bybit.com/v5/market/tickers?category=spot',
      { 
        cache: 'no-store',
        next: { revalidate: 0 },
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        }
      }
    );
    
    console.log('Bybit API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Bybit API error response:', errorText);
      throw new Error(`Bybit API responded with status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Successfully fetched data, symbols count:', data?.result?.list?.length);
    
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
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
