export const dynamic = 'force-static';
export const revalidate = false;

//f app/api/admin/credit-deposit/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendDepositConfirmationEmail } from '@/lib/email';

// POST /api/admin/credit-deposit
// Manually credit a deposit to a user's balance
export async function POST(request: NextRequest) {
  try {
    // Verify admin secret
    const authHeader = request.headers.get('x-api-secret');
    if (authHeader !== process.env.INTERNAL_API_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      walletAddress,
      currency,
      chain,
      amount,
      txHash,
      fromAddress,
      sendEmail = true, // Option to disable email (default: send email)
    } = body;

    // Validate required fields
    if (!walletAddress || !currency || !amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: walletAddress, currency, amount' },
        { status: 400 }
      );
    }

    // Find wallet and user - Convert to lowercase for case-insensitive search
    // ✅ FIXED: Removed the problematic 'mode' property
    const wallet = await prisma.wallet.findFirst({
      where: {
        address: walletAddress.toLowerCase(),
      },
      include: { user: true },
    });

    if (!wallet) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Wallet address not found in database',
          searchedAddress: walletAddress.toLowerCase(),
          hint: 'Make sure the wallet exists and address is correct'
        },
        { status: 404 }
      );
    }

    // Check if deposit already exists (prevent duplicates)
    if (txHash) {
      const existingDeposit = await prisma.deposit.findFirst({
        where: { txHash: txHash.toLowerCase() },
      });

      if (existingDeposit) {
        return NextResponse.json({
          success: false,
          error: 'Deposit already exists',
          existingDeposit: {
            depositId: existingDeposit.depositId,
            status: existingDeposit.status,
            amount: existingDeposit.amount,
          },
        }, { status: 409 });
      }
    }

    // Generate deposit ID
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    // Get or create counter
    let counter;
    try {
      counter = await prisma.depositIdCounter.upsert({
        where: { id: 'deposit_counter' },
        update: { lastId: { increment: 1 } },
        create: { id: 'deposit_counter', lastId: 1, date: today },
      });
    } catch {
      // If DepositIdCounter doesn't exist, use timestamp
      counter = { lastId: Date.now() % 1000000 };
    }
    
    const depositId = `DEP${today}${String(counter.lastId).padStart(6, '0')}`;

    // Determine chain for this deposit
    const depositChain = chain?.toUpperCase() || wallet.chain;
    
    // Get explorer info
    const explorerUrls: Record<string, { name: string; url: string }> = {
      ETH: { name: 'Etherscan', url: 'https://etherscan.io' },
      BSC: { name: 'BscScan', url: 'https://bscscan.com' },
      ARB: { name: 'Arbiscan', url: 'https://arbiscan.io' },
      MATIC: { name: 'PolygonScan', url: 'https://polygonscan.com' },
      AVAX: { name: 'Snowtrace', url: 'https://snowtrace.io' },
      BTC: { name: 'Mempool', url: 'https://mempool.space' },
    };
    const explorer = explorerUrls[depositChain] || explorerUrls.ETH;

    // Create deposit and update balance in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create deposit record
      const deposit = await tx.deposit.create({
        data: {
          depositId,
          userId: wallet.userId,
          userUid: wallet.user.id,
          currency: currency.toUpperCase(),
          chain: depositChain,
          network: 'mainnet',
          amount: parseFloat(amount),
          fee: 0,
          netAmount: parseFloat(amount),
          txHash: txHash?.toLowerCase() || `manual_${Date.now()}`,
          txUrl: txHash ? `${explorer.url}/tx/${txHash}` : null,
          fromAddress: fromAddress?.toLowerCase() || 'manual_deposit',
          toAddress: walletAddress.toLowerCase(),
          confirmations: 100,
          requiredConfirmations: 12,
          status: 'COMPLETED',
          explorerName: explorer.name,
          explorerUrl: explorer.url,
          submittedAt: new Date(),
          confirmedAt: new Date(),
          completedAt: new Date(),
        },
      });

      // Update or create user balance
      const existingBalance = await tx.userBalance.findUnique({
        where: {
          userId_currency_chain: {
            userId: wallet.userId,
            currency: currency.toUpperCase(),
            chain: depositChain,
          },
        },
      });

      let balance;
      if (existingBalance) {
        balance = await tx.userBalance.update({
          where: { id: existingBalance.id },
          data: {
            totalBalance: { increment: parseFloat(amount) },
            available: { increment: parseFloat(amount) },
          },
        });
      } else {
        balance = await tx.userBalance.create({
          data: {
            userId: wallet.userId,
            currency: currency.toUpperCase(),
            chain: depositChain,
            network: 'mainnet',
            totalBalance: parseFloat(amount),
            available: parseFloat(amount),
            locked: 0,
            frozen: 0,
          },
        });
      }

      // Create in-app notification
      try {
        await tx.notification.create({
          data: {
            userId: wallet.userId,
            type: 'DEPOSIT_CONFIRMED',
            category: 'TRANSACTION',
            title: 'Deposit Confirmed',
            message: `Your deposit of ${amount} ${currency.toUpperCase()} has been confirmed and credited to your account.`,
            token: currency.toUpperCase(),
            amount: amount.toString(),
            chain: depositChain,
            txHash: txHash || null,
            isEmailSent: false, // Will update after email sent
            metadata: JSON.stringify({
              depositId,
              txUrl: txHash ? `${explorer.url}/tx/${txHash}` : null,
            }),
          },
        });
      } catch (e) {
        // Notification creation is optional, don't fail the whole transaction
        console.log('Could not create notification:', e);
      }

      return { deposit, balance };
    });

    // =============================================
    // SEND EMAIL NOTIFICATION (Outside transaction)
    // =============================================
    let emailSent = false;
    let emailError: string | null = null;
    
    if (sendEmail && wallet.user.email) {
      console.log(`\n========================================`);
      console.log(`📧 SENDING DEPOSIT EMAIL`);
      console.log(`========================================`);
      console.log(`To: ${wallet.user.email}`);
      console.log(`Amount: ${amount} ${currency.toUpperCase()}`);
      console.log(`Chain: ${depositChain}`);
      console.log(`Deposit ID: ${depositId}`);
      console.log(`========================================\n`);
      
      try {
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
        
        const emailResult = await sendDepositConfirmationEmail(wallet.user.email, {
          amount: amount.toString(),
          token: currency.toUpperCase(),
          chainType: depositChain,
          depositAddress: walletAddress.toLowerCase(),
          timestamp: timestamp,
        });
        
        emailSent = emailResult.success;
        
        if (emailResult.success) {
          console.log(`✅ Deposit confirmation email sent successfully to ${wallet.user.email}`);
          
          // Update notification to mark email as sent
          try {
            await prisma.notification.updateMany({
              where: {
                userId: wallet.userId,
                type: 'DEPOSIT_CONFIRMED',
                txHash: txHash || null,
              },
              data: { isEmailSent: true },
            });
          } catch (e) {
            console.log('Could not update notification email status:', e);
          }
        } else {
          emailError = emailResult.error || 'Unknown error';
          console.error(`❌ Failed to send deposit email to ${wallet.user.email}: ${emailError}`);
        }
      } catch (error) {
        emailError = error instanceof Error ? error.message : 'Unknown email error';
        console.error('❌ Error sending deposit email:', error);
      }
    } else if (!sendEmail) {
      console.log('📧 Email sending skipped (sendEmail=false)');
    } else if (!wallet.user.email) {
      console.log('📧 Email sending skipped (no email address)');
      emailError = 'User has no email address';
    }

    return NextResponse.json({
      success: true,
      message: 'Deposit credited successfully',
      deposit: {
        depositId: result.deposit.depositId,
        amount: result.deposit.amount,
        currency: result.deposit.currency,
        chain: result.deposit.chain,
        status: result.deposit.status,
        txHash: result.deposit.txHash,
      },
      balance: {
        currency: result.balance.currency,
        available: result.balance.available,
        total: result.balance.totalBalance,
      },
      user: {
        id: wallet.userId,
        email: wallet.user.email,
      },
      email: {
        attempted: sendEmail && !!wallet.user.email,
        sent: emailSent,
        error: emailError,
      },
    });

  } catch (error) {
    console.error('Error crediting deposit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to credit deposit', details: String(error) },
      { status: 500 }
    );
  }
}

// GET /api/admin/credit-deposit - Check wallet/deposit info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('address');
    const txHash = searchParams.get('txHash');

    if (txHash) {
      // Check if transaction already processed
      const deposit = await prisma.deposit.findFirst({
        where: { txHash: txHash.toLowerCase() },
      });

      return NextResponse.json({
        success: true,
        exists: !!deposit,
        deposit: deposit ? {
          depositId: deposit.depositId,
          amount: deposit.amount,
          currency: deposit.currency,
          status: deposit.status,
        } : null,
      });
    }

    if (walletAddress) {
      // Get wallet info - Convert to lowercase
      const wallet = await prisma.wallet.findFirst({
        where: {
          address: walletAddress.toLowerCase(),
        },
        include: {
          user: {
            select: { id: true, email: true },
          },
        },
      });

      if (!wallet) {
        return NextResponse.json({
          success: false,
          error: 'Wallet not found',
          searchedAddress: walletAddress.toLowerCase(),
        }, { status: 404 });
      }

      // Get user balances
      const balances = await prisma.userBalance.findMany({
        where: { userId: wallet.userId },
      });

      // Get recent deposits
      const deposits = await prisma.deposit.findMany({
        where: { userId: wallet.userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      return NextResponse.json({
        success: true,
        wallet: {
          address: wallet.address,
          chain: wallet.chain,
          userId: wallet.userId,
          userEmail: wallet.user.email,
        },
        balances: balances.map(b => ({
          currency: b.currency,
          chain: b.chain,
          available: b.available,
          locked: b.locked,
          total: b.totalBalance,
        })),
        recentDeposits: deposits.map(d => ({
          depositId: d.depositId,
          amount: d.amount,
          currency: d.currency,
          status: d.status,
          txHash: d.txHash,
          createdAt: d.createdAt,
        })),
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Provide address or txHash parameter',
    }, { status: 400 });

  } catch (error) {
    console.error('Error checking deposit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check deposit', details: String(error) },
      { status: 500 }
    );
  }
}
