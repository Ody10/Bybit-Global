import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Get query params for filtering
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type')?.toUpperCase(); // DEPOSIT, WITHDRAWAL, TRANSFER, etc.
    const currency = searchParams.get('currency');
    const status = searchParams.get('status')?.toUpperCase();
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Arrays to hold results
    let deposits: any[] = [];
    let withdrawals: any[] = [];
    let transactions: any[] = [];

    // Build where clauses
    const baseWhere = { userId: decoded.userId };

    // Get deposits if type is 'DEPOSIT' or not specified
    if (!type || type === 'DEPOSIT') {
      const depositWhere: any = { ...baseWhere };
      if (currency && currency !== 'All Assets') {
        depositWhere.currency = currency.toUpperCase();
      }
      if (status && status !== 'ALL') {
        depositWhere.status = status;
      }
      
      deposits = await prisma.deposit.findMany({
        where: depositWhere,
        orderBy: { createdAt: 'desc' },
        take: type ? limit : Math.ceil(limit / 2),
        skip: type ? skip : 0,
      });
    }

    // Get withdrawals if type is 'WITHDRAWAL' or 'WITHDRAW' or not specified
    if (!type || type === 'WITHDRAWAL' || type === 'WITHDRAW') {
      const withdrawalWhere: any = { ...baseWhere };
      if (currency && currency !== 'All Assets') {
        withdrawalWhere.currency = currency.toUpperCase();
      }
      if (status && status !== 'ALL') {
        withdrawalWhere.status = status;
      }
      
      withdrawals = await prisma.withdrawal.findMany({
        where: withdrawalWhere,
        orderBy: { createdAt: 'desc' },
        take: type ? limit : Math.ceil(limit / 2),
        skip: type ? skip : 0,
      });
    }

    // Get other transactions (transfers, etc.) if type matches or not specified
    if (!type || (type !== 'DEPOSIT' && type !== 'WITHDRAWAL' && type !== 'WITHDRAW')) {
      const transactionWhere: any = { ...baseWhere };
      if (type && type !== 'ALL') {
        transactionWhere.type = type;
      }
      if (currency && currency !== 'All Assets') {
        transactionWhere.currency = currency.toUpperCase();
      }
      if (status && status !== 'ALL') {
        transactionWhere.status = status;
      }

      transactions = await prisma.transaction.findMany({
        where: transactionWhere,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });
    }

    // Format deposits
    const formattedDeposits = deposits.map((dep) => ({
      id: dep.id,
      depositId: dep.depositId,
      type: 'DEPOSIT',
      currency: dep.currency,
      chain: dep.chain,
      network: dep.network,
      amount: dep.amount,
      fee: dep.fee,
      netAmount: dep.netAmount,
      status: dep.status,
      txHash: dep.txHash,
      txUrl: dep.txUrl,
      fromAddress: dep.fromAddress,
      toAddress: dep.toAddress,
      confirmations: dep.confirmations,
      requiredConfirmations: dep.requiredConfirmations,
      explorerName: dep.explorerName,
      explorerUrl: dep.explorerUrl,
      blockNumber: dep.blockNumber?.toString(),
      blockHash: dep.blockHash,
      createdAt: dep.createdAt.toISOString(),
      submittedAt: dep.submittedAt?.toISOString(),
      confirmedAt: dep.confirmedAt?.toISOString(),
      completedAt: dep.completedAt?.toISOString(),
    }));

    // Format withdrawals
    const formattedWithdrawals = withdrawals.map((wd) => ({
      id: wd.id,
      withdrawalId: wd.withdrawalId,
      type: 'WITHDRAWAL',
      currency: wd.currency,
      chain: wd.chain,
      network: wd.network,
      amount: wd.amount,
      fee: wd.fee,
      netAmount: wd.netAmount,
      status: wd.status,
      txHash: wd.txHash,
      txUrl: wd.txUrl,
      fromAddress: wd.fromAddress,
      toAddress: wd.toAddress,
      confirmations: wd.confirmations,
      requiredConfirmations: wd.requiredConfirmations,
      explorerName: wd.explorerName,
      explorerUrl: wd.explorerUrl,
      memo: wd.memo,
      createdAt: wd.createdAt.toISOString(),
      submittedAt: wd.submittedAt?.toISOString(),
      processedAt: wd.processedAt?.toISOString(),
      confirmedAt: wd.confirmedAt?.toISOString(),
      completedAt: wd.completedAt?.toISOString(),
      cancelledAt: wd.cancelledAt?.toISOString(),
      failedAt: wd.failedAt?.toISOString(),
    }));

    // Format other transactions
    const formattedTransactions = transactions.map((tx) => ({
      id: tx.id,
      transactionId: tx.transactionId,
      type: tx.type,
      currency: tx.currency,
      chain: tx.chain,
      network: tx.network,
      amount: tx.amount,
      fee: tx.fee,
      status: tx.status,
      txHash: tx.txHash,
      txUrl: tx.txUrl,
      fromAddress: tx.fromAddress,
      toAddress: tx.toAddress,
      explorerName: tx.explorerName,
      explorerUrl: tx.explorerUrl,
      description: tx.description,
      createdAt: tx.createdAt.toISOString(),
      completedAt: tx.completedAt?.toISOString(),
    }));

    // Combine and sort by date (newest first)
    const allRecords = [
      ...formattedDeposits,
      ...formattedWithdrawals,
      ...formattedTransactions,
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply pagination to combined results
    const paginatedRecords = type 
      ? allRecords 
      : allRecords.slice(0, limit);

    // Get total counts for pagination
    const [depositCount, withdrawalCount, transactionCount] = await Promise.all([
      prisma.deposit.count({ where: baseWhere }),
      prisma.withdrawal.count({ where: baseWhere }),
      prisma.transaction.count({ where: baseWhere }),
    ]);

    const totalCount = depositCount + withdrawalCount + transactionCount;

    return NextResponse.json({
      success: true,
      transactions: paginatedRecords,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      summary: {
        totalDeposits: depositCount,
        totalWithdrawals: withdrawalCount,
        totalTransactions: transactionCount,
      },
    });
  } catch (error) {
    console.error('Transactions API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}