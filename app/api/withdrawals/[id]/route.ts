import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import {
  getWithdrawalStatus,
  cancelWithdrawal,
  failWithdrawal,
} from '@/lib/withdrawal-service';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET || 'internal-secret';

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

// GET /api/withdrawals/[id] - Get withdrawal status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const withdrawalId = id;
    
    if (!withdrawalId) {
      return NextResponse.json(
        { error: 'Missing withdrawal ID' },
        { status: 400 }
      );
    }
    
    const withdrawal = await getWithdrawalStatus(withdrawalId);
    
    if (!withdrawal) {
      return NextResponse.json(
        { error: 'Withdrawal not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ withdrawal });
  } catch (error) {
    console.error('Error fetching withdrawal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch withdrawal' },
      { status: 500 }
    );
  }
}

// DELETE /api/withdrawals/[id] - Cancel withdrawal
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    const withdrawalId = id;
    
    if (!withdrawalId) {
      return NextResponse.json(
        { error: 'Missing withdrawal ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json().catch(() => ({}));
    const reason = body.reason || 'Cancelled by user';
    
    const result = await cancelWithdrawal(withdrawalId, userId, reason);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Withdrawal cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling withdrawal:', error);
    return NextResponse.json(
      { error: 'Failed to cancel withdrawal' },
      { status: 500 }
    );
  }
}

// PATCH /api/withdrawals/[id] - Admin actions (fail withdrawal)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { action, reason, internalSecret } = body;
    
    // Verify internal secret for admin actions
    if (internalSecret !== INTERNAL_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    const withdrawalId = id;
    
    if (!withdrawalId) {
      return NextResponse.json(
        { error: 'Missing withdrawal ID' },
        { status: 400 }
      );
    }
    
    let result;
    
    switch (action) {
      case 'fail':
        if (!reason) {
          return NextResponse.json(
            { error: 'Reason is required for failing withdrawal' },
            { status: 400 }
          );
        }
        result = await failWithdrawal(withdrawalId, reason);
        break;
        
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
    const withdrawal = await getWithdrawalStatus(withdrawalId);
    
    return NextResponse.json({
      success: true,
      action,
      withdrawal,
    });
  } catch (error) {
    console.error('Error updating withdrawal:', error);
    return NextResponse.json(
      { error: 'Failed to update withdrawal' },
      { status: 500 }
    );
  }
}