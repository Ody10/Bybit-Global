import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Generate transfer ID like TRF20251229000001
async function generateTransferId(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  // Get or create counter
  let counter = await (prisma as any).transferIdCounter?.findUnique({
    where: { id: 'transfer_counter' },
  });
  
  if (!counter) {
    counter = await (prisma as any).transferIdCounter?.create({
      data: { id: 'transfer_counter', lastId: 0, date: dateStr },
    });
  }
  
  // Reset counter if new day
  if (counter?.date !== dateStr) {
    counter = await (prisma as any).transferIdCounter?.update({
      where: { id: 'transfer_counter' },
      data: { lastId: 1, date: dateStr },
    });
  } else {
    counter = await (prisma as any).transferIdCounter?.update({
      where: { id: 'transfer_counter' },
      data: { lastId: { increment: 1 } },
    });
  }
  
  const sequence = String(counter?.lastId || 1).padStart(6, '0');
  return `TRF${dateStr}${sequence}`;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;
    const body = await request.json();
    const { currency, amount, fromAccount, toAccount } = body;

    // Validate input
    if (!currency || !amount || !fromAccount || !toAccount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: currency, amount, fromAccount, toAccount' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    const validAccounts = ['FUNDING', 'UNIFIED_TRADING'];
    if (!validAccounts.includes(fromAccount) || !validAccounts.includes(toAccount)) {
      return NextResponse.json(
        { success: false, error: 'Invalid account type. Must be FUNDING or UNIFIED_TRADING' },
        { status: 400 }
      );
    }

    if (fromAccount === toAccount) {
      return NextResponse.json(
        { success: false, error: 'Cannot transfer to the same account' },
        { status: 400 }
      );
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Perform transfer in transaction
    const result = await prisma.$transaction(async (tx) => {
      if (fromAccount === 'FUNDING') {
        // Transfer FROM Funding TO Unified Trading
        
        // Check funding balance
        const fundingBalance = await tx.userBalance.findFirst({
          where: { userId, currency },
        });

        if (!fundingBalance || fundingBalance.available < amount) {
          throw new Error(`Insufficient ${currency} balance in Funding account`);
        }

        // Deduct from Funding (UserBalance)
        await tx.userBalance.update({
          where: { id: fundingBalance.id },
          data: {
            totalBalance: { decrement: amount },
            available: { decrement: amount },
          },
        });

        // Add to Unified Trading
        // Check if UnifiedTradingBalance model exists
        const unifiedBalance = await (tx as any).unifiedTradingBalance?.upsert({
          where: {
            userId_currency: { userId, currency },
          },
          create: {
            userId,
            currency,
            totalBalance: amount,
            available: amount,
          },
          update: {
            totalBalance: { increment: amount },
            available: { increment: amount },
          },
        });

        return { fundingBalance, unifiedBalance };

      } else {
        // Transfer FROM Unified Trading TO Funding
        
        // Check unified trading balance
        const unifiedBalance = await (tx as any).unifiedTradingBalance?.findUnique({
          where: {
            userId_currency: { userId, currency },
          },
        });

        if (!unifiedBalance || unifiedBalance.available < amount) {
          throw new Error(`Insufficient ${currency} balance in Unified Trading account`);
        }

        // Deduct from Unified Trading
        await (tx as any).unifiedTradingBalance?.update({
          where: {
            userId_currency: { userId, currency },
          },
          data: {
            totalBalance: { decrement: amount },
            available: { decrement: amount },
          },
        });

        // Add to Funding (UserBalance) - find any chain for this currency
        const existingFunding = await tx.userBalance.findFirst({
          where: { userId, currency },
        });

        if (existingFunding) {
          await tx.userBalance.update({
            where: { id: existingFunding.id },
            data: {
              totalBalance: { increment: amount },
              available: { increment: amount },
            },
          });
        } else {
          // Create new funding balance (use ETH as default chain)
          await tx.userBalance.create({
            data: {
              userId,
              currency,
              chain: 'ETH',
              network: 'mainnet',
              totalBalance: amount,
              available: amount,
            },
          });
        }

        return { unifiedBalance, existingFunding };
      }
    });

    // Generate transfer ID and create record
    let transferId = `TRF${Date.now()}`;
    try {
      transferId = await generateTransferId();
    } catch (e) {
      // Fallback if counter doesn't exist
    }

    // Create transfer record (if model exists)
    try {
      await (prisma as any).internalTransfer?.create({
        data: {
          transferId,
          userId,
          userUid: userId,
          currency,
          amount,
          fromAccount,
          toAccount,
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });
    } catch (e) {
      // Model might not exist yet - that's okay
      console.log('InternalTransfer model not available yet');
    }

    // Create notification
    try {
      await prisma.notification.create({
        data: {
          userId,
          type: 'TRANSFER_SUCCESS',
          category: 'TRANSACTION',
          title: 'Transfer Successful',
          message: `Successfully transferred ${amount} ${currency} from ${fromAccount.replace('_', ' ')} to ${toAccount.replace('_', ' ')}`,
          token: currency,
          amount: amount.toString(),
          metadata: JSON.stringify({
            transferId,
            fromAccount,
            toAccount,
          }),
        },
      });
    } catch (e) {
      // Notification creation failed - non-critical
    }

    return NextResponse.json({
      success: true,
      transfer: {
        transferId,
        currency,
        amount,
        fromAccount,
        toAccount,
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
      },
      message: `Successfully transferred ${amount} ${currency}`,
    });

  } catch (error: any) {
    console.error('Transfer API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Transfer failed' },
      { status: 400 }
    );
  }
}

// GET - Get transfer history
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    // Get transfer history (if model exists)
    let transfers: any[] = [];
    try {
      transfers = await (prisma as any).internalTransfer?.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }) || [];
    } catch (e) {
      // Model doesn't exist yet
    }

    return NextResponse.json({
      success: true,
      transfers,
    });

  } catch (error) {
    console.error('Transfer History Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transfers' },
      { status: 500 }
    );
  }
}