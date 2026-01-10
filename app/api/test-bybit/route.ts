// app/api/test-bybit/route.ts
export async function GET() {
  try {
    const start = Date.now();
    const response = await fetch('https://api.bybit.com/v5/market/time');
    const duration = Date.now() - start;
    const data = await response.json();
    
    return Response.json({
      success: true,
      duration: `${duration}ms`,
      bybitResponse: data
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}