export const dynamic = 'force-static';
export const revalidate = false;

// app/api/trading/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import {
  createSpotOrder,
  createFuturesOrder,
  cancelOrder,
  getUserOrders,
  getTradingPair,
  getPairPrice,
} from '@/lib/trading-service';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Helper to verify JWT and get user ID
async function getUserIdFromToken(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

// GET /api/trading/orders - Get user's orders
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || undefined;
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const orders = await getUserOrders(userId, {
      symbol: symbol?.toUpperCase(),
      status: status?.toUpperCase(),
      limit,
      offset,
    });
    
    return NextResponse.json({
      success: true,
      orders: orders.map(order => ({
        id: order.id,
        orderId: order.orderId,
        userId: order.userId,
        symbol: order.symbol,
        type: order.type,
        side: order.side,
        positionSide: order.positionSide,
        quantity: order.quantity,
        remainingQty: order.remainingQty,
        price: order.price,
        stopPrice: order.stopPrice,
        timeInForce: order.timeInForce,
        status: order.status,
        fee: order.fee,
        leverage: order.leverage,
        reduceOnly: order.reduceOnly,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/trading/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const {
      symbol,
      type,
      side,
      quantity,
      price,
      stopPrice,
      positionSide,
      leverage,
      reduceOnly,
      timeInForce,
    } = body;
    
    // Validate required fields
    if (!symbol || !type || !side || !quantity) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: symbol, type, side, quantity' },
        { status: 400 }
      );
    }
    
    // Validate order type
    const validTypes = ['MARKET', 'LIMIT', 'STOP_LIMIT', 'STOP_MARKET'];
    if (!validTypes.includes(type.toUpperCase())) {
      return NextResponse.json(
        { success: false, error: `Invalid order type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Validate side
    if (!['BUY', 'SELL'].includes(side.toUpperCase())) {
      return NextResponse.json(
        { success: false, error: 'Invalid side. Must be BUY or SELL' },
        { status: 400 }
      );
    }
    
    // Get trading pair to determine if spot or futures
    const pair = await getTradingPair(symbol.toUpperCase());
    if (!pair) {
      return NextResponse.json(
        { success: false, error: 'Trading pair not found' },
        { status: 400 }
      );
    }
    
    let result;
    
    if (pair.type === 'SPOT') {
      // Create spot order
      result = await createSpotOrder({
        userId,
        symbol: symbol.toUpperCase(),
        type: type.toUpperCase() as 'MARKET' | 'LIMIT',
        side: side.toUpperCase() as 'BUY' | 'SELL',
        quantity: parseFloat(quantity),
        price: price ? parseFloat(price) : undefined,
        timeInForce: timeInForce?.toUpperCase() || 'GTC',
      });
    } else {
      // Create futures order
      result = await createFuturesOrder({
        userId,
        symbol: symbol.toUpperCase(),
        type: type.toUpperCase() as 'MARKET' | 'LIMIT',
        side: side.toUpperCase() as 'BUY' | 'SELL',
        positionSide: positionSide?.toUpperCase() || (side.toUpperCase() === 'BUY' ? 'LONG' : 'SHORT'),
        quantity: parseFloat(quantity),
        price: price ? parseFloat(price) : undefined,
        leverage: leverage ? parseInt(leverage) : 1,
        reduceOnly: reduceOnly || false,
        timeInForce: timeInForce?.toUpperCase() || 'GTC',
      });
    }
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
    
    // Get current price for response
    const currentPrice = await getPairPrice(symbol.toUpperCase());
    
    return NextResponse.json({
      success: true,
      order: result.order,
      position: 'position' in result ? result.position : undefined,
      executedPrice: result.order?.price || currentPrice,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// DELETE /api/trading/orders - Cancel order
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }
    
    const result = await cancelOrder(orderId, userId);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
