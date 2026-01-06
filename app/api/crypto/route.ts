// app/api/crypto/route.ts
export async function GET() {
  const response = await fetch(
    'https://api.bybit.com/v5/market/tickers?category=spot'
  );
  const data = await response.json();
  return Response.json(data);
}