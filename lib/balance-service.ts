// Balance Service
// Handles user balance operations with real-time price updates

import { prisma } from './prisma';
import { getTokenPrice, getMultipleTokenPrices, calculateUsdValue, isStablecoin } from './price-service';
import { getChainConfig, getTokenConfig } from './chain-config';

export interface BalanceWithPrice {
  id: string;
  currency: string;
  chain: string;
  network: string;
  totalBalance: number;
  available: number;
  locked: number;
  frozen: number;
  staked: number;
  earning: number;
  // Price info
  price: number;
  priceChange24h?: number;
  usdValue: number;
  isStablecoin: boolean;
  // Display helpers
  displayName: string;
  chainDisplayName: string;
}

/**
 * Get all balances for a user with current prices
 */
export async function getUserBalancesWithPrices(userId: string): Promise<BalanceWithPrice[]> {
  // Get user balances from database
  const balances = await prisma.userBalance.findMany({
    where: { userId },
    orderBy: [
      { usdValue: 'desc' },
      { currency: 'asc' },
    ],
  });
  
  if (balances.length === 0) {
    return [];
  }
  
  // Get unique tokens for price fetching
  const tokens = [...new Set(balances.map(b => b.currency))];
  const prices = await getMultipleTokenPrices(tokens);
  
  // Map balances with prices
  const balancesWithPrices: BalanceWithPrice[] = balances.map(balance => {
    const price = prices.get(balance.currency) || 0;
    const usdValue = balance.totalBalance * price;
    const chainConfig = getChainConfig(balance.chain);
    const tokenConfig = getTokenConfig(balance.chain, balance.currency);
    
    return {
      id: balance.id,
      currency: balance.currency,
      chain: balance.chain,
      network: balance.network,
      totalBalance: balance.totalBalance,
      available: balance.available,
      locked: balance.locked,
      frozen: balance.frozen,
      staked: balance.staked,
      earning: balance.earning,
      price,
      usdValue,
      isStablecoin: isStablecoin(balance.currency),
      displayName: tokenConfig?.name || balance.currency,
      chainDisplayName: chainConfig?.displayName || balance.chain,
    };
  });
  
  return balancesWithPrices;
}

/**
 * Get specific token balance for user
 */
export async function getUserTokenBalance(
  userId: string,
  currency: string,
  chain: string
): Promise<BalanceWithPrice | null> {
  const balance = await prisma.userBalance.findUnique({
    where: {
      userId_currency_chain: {
        userId,
        currency,
        chain,
      },
    },
  });
  
  if (!balance) return null;
  
  const price = await getTokenPrice(currency);
  const chainConfig = getChainConfig(chain);
  const tokenConfig = getTokenConfig(chain, currency);
  
  return {
    id: balance.id,
    currency: balance.currency,
    chain: balance.chain,
    network: balance.network,
    totalBalance: balance.totalBalance,
    available: balance.available,
    locked: balance.locked,
    frozen: balance.frozen,
    staked: balance.staked,
    earning: balance.earning,
    price,
    usdValue: balance.totalBalance * price,
    isStablecoin: isStablecoin(currency),
    displayName: tokenConfig?.name || currency,
    chainDisplayName: chainConfig?.displayName || chain,
  };
}

/**
 * Get total portfolio value in USD
 */
export async function getTotalPortfolioValue(userId: string): Promise<{
  totalUsd: number;
  change24h: number;
  changePercent24h: number;
}> {
  const balances = await getUserBalancesWithPrices(userId);
  
  const totalUsd = balances.reduce((sum, b) => sum + b.usdValue, 0);
  
  // For now, we don't track 24h change. In production, you'd store historical values.
  return {
    totalUsd,
    change24h: 0,
    changePercent24h: 0,
  };
}

/**
 * Credit balance to user (used by deposit system)
 */
export async function creditUserBalance(
  userId: string,
  currency: string,
  chain: string,
  amount: number
): Promise<boolean> {
  try {
    const usdValue = await calculateUsdValue(currency, amount);
    
    await prisma.userBalance.upsert({
      where: {
        userId_currency_chain: {
          userId,
          currency,
          chain,
        },
      },
      update: {
        totalBalance: { increment: amount },
        available: { increment: amount },
        usdValue: { increment: usdValue },
      },
      create: {
        userId,
        currency,
        chain,
        network: 'mainnet',
        totalBalance: amount,
        available: amount,
        usdValue,
      },
    });
    
    return true;
  } catch (error) {
    console.error('Error crediting balance:', error);
    return false;
  }
}

/**
 * Debit balance from user (used by withdrawal system)
 */
export async function debitUserBalance(
  userId: string,
  currency: string,
  chain: string,
  amount: number
): Promise<boolean> {
  try {
    const balance = await prisma.userBalance.findUnique({
      where: {
        userId_currency_chain: {
          userId,
          currency,
          chain,
        },
      },
    });
    
    if (!balance || balance.available < amount) {
      return false; // Insufficient balance
    }
    
    const usdValue = await calculateUsdValue(currency, amount);
    
    await prisma.userBalance.update({
      where: { id: balance.id },
      data: {
        totalBalance: { decrement: amount },
        available: { decrement: amount },
        usdValue: { decrement: usdValue },
      },
    });
    
    return true;
  } catch (error) {
    console.error('Error debiting balance:', error);
    return false;
  }
}

/**
 * Lock balance (for pending withdrawals or orders)
 */
export async function lockUserBalance(
  userId: string,
  currency: string,
  chain: string,
  amount: number
): Promise<boolean> {
  try {
    const balance = await prisma.userBalance.findUnique({
      where: {
        userId_currency_chain: {
          userId,
          currency,
          chain,
        },
      },
    });
    
    if (!balance || balance.available < amount) {
      return false; // Insufficient available balance
    }
    
    await prisma.userBalance.update({
      where: { id: balance.id },
      data: {
        available: { decrement: amount },
        locked: { increment: amount },
      },
    });
    
    return true;
  } catch (error) {
    console.error('Error locking balance:', error);
    return false;
  }
}

/**
 * Unlock balance (when order cancelled or withdrawal failed)
 */
export async function unlockUserBalance(
  userId: string,
  currency: string,
  chain: string,
  amount: number
): Promise<boolean> {
  try {
    const balance = await prisma.userBalance.findUnique({
      where: {
        userId_currency_chain: {
          userId,
          currency,
          chain,
        },
      },
    });
    
    if (!balance || balance.locked < amount) {
      return false; // Not enough locked balance
    }
    
    await prisma.userBalance.update({
      where: { id: balance.id },
      data: {
        available: { increment: amount },
        locked: { decrement: amount },
      },
    });
    
    return true;
  } catch (error) {
    console.error('Error unlocking balance:', error);
    return false;
  }
}

/**
 * Release locked balance (when withdrawal succeeds)
 */
export async function releaseLockedBalance(
  userId: string,
  currency: string,
  chain: string,
  amount: number
): Promise<boolean> {
  try {
    const balance = await prisma.userBalance.findUnique({
      where: {
        userId_currency_chain: {
          userId,
          currency,
          chain,
        },
      },
    });
    
    if (!balance || balance.locked < amount) {
      return false;
    }
    
    const usdValue = await calculateUsdValue(currency, amount);
    
    await prisma.userBalance.update({
      where: { id: balance.id },
      data: {
        totalBalance: { decrement: amount },
        locked: { decrement: amount },
        usdValue: { decrement: usdValue },
      },
    });
    
    return true;
  } catch (error) {
    console.error('Error releasing locked balance:', error);
    return false;
  }
}

/**
 * Update all USD values based on current prices
 * Called periodically to keep displayed values accurate
 */
export async function updateAllUsdValues(): Promise<void> {
  try {
    const balances = await prisma.userBalance.findMany({
      where: {
        totalBalance: { gt: 0 },
      },
    });
    
    // Get unique tokens
    const tokens = [...new Set(balances.map(b => b.currency))];
    const prices = await getMultipleTokenPrices(tokens);
    
    // Update each balance
    for (const balance of balances) {
      const price = prices.get(balance.currency) || 0;
      const newUsdValue = balance.totalBalance * price;
      
      await prisma.userBalance.update({
        where: { id: balance.id },
        data: { usdValue: newUsdValue },
      });
    }
    
    console.log(`Updated USD values for ${balances.length} balances`);
  } catch (error) {
    console.error('Error updating USD values:', error);
  }
}

/**
 * Get balance summary grouped by token (across all chains)
 */
export async function getBalanceSummaryByToken(userId: string): Promise<Map<string, {
  totalBalance: number;
  usdValue: number;
  chains: string[];
}>> {
  const balances = await getUserBalancesWithPrices(userId);
  
  const summary = new Map<string, {
    totalBalance: number;
    usdValue: number;
    chains: string[];
  }>();
  
  balances.forEach(balance => {
    const existing = summary.get(balance.currency);
    
    if (existing) {
      existing.totalBalance += balance.totalBalance;
      existing.usdValue += balance.usdValue;
      existing.chains.push(balance.chain);
    } else {
      summary.set(balance.currency, {
        totalBalance: balance.totalBalance,
        usdValue: balance.usdValue,
        chains: [balance.chain],
      });
    }
  });
  
  return summary;
}