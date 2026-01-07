export const dynamic = 'force-static';
export const revalidate = false;

// app/api/market/route.ts
export async function GET() {
  try {
    const response = await fetch(
      'https://api.bybit.com/v5/market/tickers?category=spot'
    );
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
