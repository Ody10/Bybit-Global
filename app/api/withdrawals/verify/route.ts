export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import {
  verifyWithdrawalCode,
  resendWithdrawalVerificationCode,
  processWithdrawal,
  completeWithdrawal,
  getWithdrawalStatus,
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

// POST /api/withdrawals/verify - Verify withdrawal with code
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { withdrawalId, code, action } = body;
    
    // Handle different actions
    if (action === 'resend') {
      // Resend verification code
      if (!withdrawalId) {
        return NextResponse.json(
          { error: 'Missing withdrawalId' },
          { status: 400 }
        );
      }
      
      const result = await resendWithdrawalVerificationCode(withdrawalId, userId);
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Verification code sent to your email',
      });
    }
    
    // Default: Verify withdrawal code
    if (!withdrawalId || !code) {
      return NextResponse.json(
        { error: 'Missing withdrawalId or code' },
        { status: 400 }
      );
    }
    
    // Verify the code
    const verifyResult = await verifyWithdrawalCode(withdrawalId, code, userId);
    
    if (!verifyResult.success) {
      return NextResponse.json(
        { error: verifyResult.error },
        { status: 400 }
      );
    }
    
    // Auto-process the withdrawal (in production, this might require admin approval)
    const autoProcess = process.env.AUTO_PROCESS_WITHDRAWALS === 'true';
    
    if (autoProcess) {
      // Process withdrawal (send to blockchain)
      await processWithdrawal(withdrawalId);
      
      // For testing/demo, auto-complete the withdrawal
      const autoComplete = process.env.AUTO_COMPLETE_WITHDRAWALS === 'true';
      if (autoComplete) {
        await completeWithdrawal(withdrawalId);
      }
    }
    
    // Get updated status
    const withdrawal = await getWithdrawalStatus(withdrawalId);
    
    return NextResponse.json({
      success: true,
      message: 'Withdrawal verified successfully',
      withdrawal,
      nextStep: autoProcess 
        ? 'Your withdrawal is being processed' 
        : 'Your withdrawal is pending admin approval',
    });
  } catch (error) {
    console.error('Error verifying withdrawal:', error);
    return NextResponse.json(
      { error: 'Failed to verify withdrawal' },
      { status: 500 }
    );
  }
}

// PATCH /api/withdrawals/verify - Process/complete withdrawal (internal)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { withdrawalId, action, txHash, confirmations, internalSecret } = body;
    
    // Verify internal secret
    if (internalSecret !== INTERNAL_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (!withdrawalId || !action) {
      return NextResponse.json(
        { error: 'Missing withdrawalId or action' },
        { status: 400 }
      );
    }
    
    let result;
    
    switch (action) {
      case 'process':
        // Process withdrawal (broadcast to blockchain)
        result = await processWithdrawal(withdrawalId, txHash);
        break;
        
      case 'complete':
        // Complete withdrawal after confirmations
        result = await completeWithdrawal(withdrawalId, confirmations);
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
    console.error('Error processing withdrawal:', error);
    return NextResponse.json(
      { error: 'Failed to process withdrawal' },
      { status: 500 }
    );
  }
}
