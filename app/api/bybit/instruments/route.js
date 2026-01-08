// app/api/bybit/instruments/route.js

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const response = await fetch(
      'https://api.bybit.com/v5/market/instruments-info?category=spot',
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
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error fetching instruments:', error);
    return Response.json(
      { retCode: -1, retMsg: 'Error fetching instruments' },
      { status: 500 }
    );
  }
}