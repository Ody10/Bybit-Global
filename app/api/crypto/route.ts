// app/api/crypto/route.ts
export const dynamic = 'force-dynamic';
export const maxDuration = 10; // Add this

export async function GET() {
  try {
    console.log('Attempting to fetch from Bybit API...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    const response = await fetch(
      'https://api.bybit.com/v5/market/tickers?category=spot',
      { 
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        }
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Bybit API error response:', errorText);
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
    
    if (error.name === 'AbortError') {
      return Response.json(
        { retCode: -1, retMsg: 'Request timeout' },
        { status: 504 }
      );
    }
    
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
