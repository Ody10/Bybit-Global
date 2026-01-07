export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


// app/api/trading/positions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import {
  getUserPositions,
  closePosition,
  updatePosition,
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

// GET /api/trading/positions - Get user's positions
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const positions = await getUserPositions(userId);

    return NextResponse.json({
      success: true,
      positions: positions.map(position => ({
        id: position.id,
        positionId: position.positionId,
        symbol: position.symbol,
        side: position.side,
        size: position.size,
        entryPrice: position.entryPrice,
        markPrice: position.markPrice,
        liquidationPrice: position.liquidationPrice,
        leverage: position.leverage,
        marginType: position.marginType,
        margin: position.margin,
        unrealizedPnl: position.unrealizedPnl,
        realizedPnl: position.realizedPnl,
        updatedAt: position.updatedAt,
        tradingPair: position.tradingPair,
      })),
    });
  } catch (error) {
    console.error('Error fetching positions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch positions' },
      { status: 500 }
    );
  }
}

// PATCH /api/trading/positions - Update position (stop loss, take profit)
export async function PATCH(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { positionId, stopLoss, takeProfit } = body;

    if (!positionId) {
      return NextResponse.json(
        { success: false, error: 'Position ID is required' },
        { status: 400 }
      );
    }

    const result = await updatePosition(positionId, userId, {
      stopLoss,
      takeProfit,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // updatePosition now only returns error message since the feature isn't implemented yet
    return NextResponse.json({
      success: false,
      error: result.error || 'Stop loss and take profit updates not yet implemented',
    });
  } catch (error) {
    console.error('Error updating position:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update position' },
      { status: 500 }
    );
  }
}

// DELETE /api/trading/positions - Close position
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
    const positionId = searchParams.get('positionId');

    if (!positionId) {
      return NextResponse.json(
        { success: false, error: 'Position ID is required' },
        { status: 400 }
      );
    }

    const result = await closePosition(positionId, userId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      pnl: result.pnl,
      closedPrice: result.closedPrice,
      message: 'Position closed successfully',
    });
  } catch (error) {
    console.error('Error closing position:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to close position' },
      { status: 500 }
    );
  }
}
