export const dynamic = 'force-static';
export const revalidate = false;

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
        { error: 'Unauthorized - No token provided' },
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
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Get query params for filtering
    const { searchParams } = new URL(request.url);
    const chain = searchParams.get('chain');
    const network = searchParams.get('network');

    // Build where clause
    const whereClause: any = { userId: decoded.userId };
    if (chain) whereClause.chain = chain;
    if (network) whereClause.network = network;

    // Get user wallets from database
    const wallets = await prisma.wallet.findMany({
      where: whereClause,
      orderBy: { chain: 'asc' },
    });

    // Map wallets to a more usable format
    const walletMap: { [key: string]: string } = {};
    wallets.forEach((wallet) => {
      // Create keys for different network naming conventions
      walletMap[wallet.chain] = wallet.address;
      walletMap[`${wallet.chain}_${wallet.network}`] = wallet.address;
      
      // Also add common aliases
      const aliases: { [key: string]: string[] } = {
        'ETH': ['ERC20', 'ETHEREUM'],
        'BSC': ['BEP20', 'BINANCE'],
        'TRX': ['TRC20', 'TRON'],
        'POLYGON': ['MATIC', 'POLYGON_POS'],
        'ARBITRUM': ['ARB', 'ARBITRUM_ONE'],
        'OPTIMISM': ['OP', 'OP_MAINNET'],
        'BASE': ['BASE_MAINNET'],
        'SOL': ['SOLANA'],
        'BTC': ['BITCOIN'],
        'LTC': ['LITECOIN'],
        'AVAX': ['AVALANCHE', 'AVAXC'],
        'MANTLE': ['MNT'],
        'TON': ['TONCOIN'],
        'APTOS': ['APT'],
        'SUI': ['SUI_MAINNET'],
      };
      
      if (aliases[wallet.chain]) {
        aliases[wallet.chain].forEach((alias) => {
          walletMap[alias] = wallet.address;
        });
      }
    });

    return NextResponse.json({
      success: true,
      wallets,
      walletMap,
    });
  } catch (error) {
    console.error('Wallets API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
