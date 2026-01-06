import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

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

// Blockchain explorer configurations
const EXPLORER_CONFIG: { [key: string]: { name: string; txUrl: string } } = {
  'ETH': { name: 'Etherscan', txUrl: 'https://etherscan.io/tx/' },
  'BSC': { name: 'BscScan', txUrl: 'https://bscscan.com/tx/' },
  'TRX': { name: 'Tronscan', txUrl: 'https://tronscan.org/#/transaction/' },
  'SOL': { name: 'Solscan', txUrl: 'https://solscan.io/tx/' },
  'BTC': { name: 'Blockstream', txUrl: 'https://blockstream.info/tx/' },
  'ARB': { name: 'Arbiscan', txUrl: 'https://arbiscan.io/tx/' },
  'MATIC': { name: 'Polygonscan', txUrl: 'https://polygonscan.com/tx/' },
  'AVAX': { name: 'Snowtrace', txUrl: 'https://snowtrace.io/tx/' },
  'OP': { name: 'Optimistic Etherscan', txUrl: 'https://optimistic.etherscan.io/tx/' },
  'FTM': { name: 'FTMScan', txUrl: 'https://ftmscan.com/tx/' },
};

// GET /api/transactions/[id] - Get transaction details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // DEPOSIT or WITHDRAWAL
    const transactionId = params.id;

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    let transaction: any = null;

    // Try to find as deposit
    if (!type || type === 'DEPOSIT') {
      const deposit = await prisma.deposit.findFirst({
        where: {
          OR: [
            { id: transactionId },
            { depositId: transactionId },
          ],
          userId,
        },
      });

      if (deposit) {
        // Get explorer URL
        const explorer = EXPLORER_CONFIG[deposit.chain];
        const txUrl = deposit.txUrl || (explorer && deposit.txHash ? explorer.txUrl + deposit.txHash : null);

        transaction = {
          id: deposit.id,
          type: 'DEPOSIT',
          depositId: deposit.depositId,
          currency: deposit.currency,
          chain: deposit.chain,
          amount: deposit.amount,
          fee: deposit.fee,
          netAmount: deposit.netAmount,
          status: deposit.status,
          txHash: deposit.txHash,
          txUrl: txUrl,
          toAddress: deposit.toAddress,
          fromAddress: deposit.fromAddress,
          explorerName: deposit.explorerName || explorer?.name,
          explorerUrl: deposit.explorerUrl || (explorer ? explorer.txUrl.replace('/tx/', '') : null),
          confirmations: deposit.confirmations,
          requiredConfirmations: deposit.requiredConfirmations,
          createdAt: deposit.createdAt.toISOString(),
          submittedAt: deposit.submittedAt?.toISOString(),
          confirmedAt: deposit.confirmedAt?.toISOString(),
          completedAt: deposit.completedAt?.toISOString(),
          blockNumber: deposit.blockNumber?.toString(),
          blockHash: deposit.blockHash,
        };
      }
    }

    // Try to find as withdrawal if not found as deposit
    if (!transaction && (!type || type === 'WITHDRAWAL')) {
      const withdrawal = await prisma.withdrawal.findFirst({
        where: {
          OR: [
            { id: transactionId },
            { withdrawalId: transactionId },
          ],
          userId,
        },
      });

      if (withdrawal) {
        // Get explorer URL
        const explorer = EXPLORER_CONFIG[withdrawal.chain];
        const txUrl = withdrawal.txUrl || (explorer && withdrawal.txHash ? explorer.txUrl + withdrawal.txHash : null);

        transaction = {
          id: withdrawal.id,
          type: 'WITHDRAWAL',
          withdrawalId: withdrawal.withdrawalId,
          currency: withdrawal.currency,
          chain: withdrawal.chain,
          amount: withdrawal.amount,
          fee: withdrawal.fee,
          netAmount: withdrawal.netAmount,
          status: withdrawal.status,
          txHash: withdrawal.txHash,
          txUrl: txUrl,
          toAddress: withdrawal.toAddress,
          fromAddress: withdrawal.fromAddress,
          explorerName: withdrawal.explorerName || explorer?.name,
          explorerUrl: withdrawal.explorerUrl || (explorer ? explorer.txUrl.replace('/tx/', '') : null),
          confirmations: withdrawal.confirmations,
          requiredConfirmations: withdrawal.requiredConfirmations,
          createdAt: withdrawal.createdAt.toISOString(),
          submittedAt: withdrawal.submittedAt?.toISOString(),
          processedAt: withdrawal.processedAt?.toISOString(),
          confirmedAt: withdrawal.confirmedAt?.toISOString(),
          completedAt: withdrawal.completedAt?.toISOString(),
          cancelledAt: withdrawal.cancelledAt?.toISOString(),
          failedAt: withdrawal.failedAt?.toISOString(),
          emailVerified: withdrawal.emailVerified,
          memo: withdrawal.memo,
        };
      }
    }

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transaction details' },
      { status: 500 }
    );
  }
}