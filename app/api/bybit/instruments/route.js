// app/api/bybit/instruments/route.js
export async function GET() {
  try {
    const response = await fetch(
      'https://api.bybit.com/v5/market/instruments-info?category=spot',
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
    console.error('Error fetching instruments:', error);
    return Response.json(
      { retCode: -1, retMsg: 'Error fetching instruments' },
      { status: 500 }
    );
  }
}