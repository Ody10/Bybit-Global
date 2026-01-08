//hooks/useMarketPrices.ts

'use client';

import { useState, useEffect, useCallback } from 'react';

// Custom token prices (stablecoins pegged to $1)
const CUSTOM_TOKEN_PRICES: Record<string, number> = {
  USCT: 1.00,  // Your platform stablecoin
  USDT: 1.00,
  USDC: 1.00,
  DAI: 1.00,
  BUSD: 1.00,
};

// Fiat currency rates to USD
const FIAT_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.86,
  GBP: 0.79,
  JPY: 156.50,
  AUD: 1.52,
  CAD: 1.43,
  CHF: 0.89,
  CNY: 7.25,
  INR: 84.85,
  KRW: 1425.00,
  BRL: 5.98,
  MXN: 20.15,
  AED: 3.67,
  SGD: 1.35,
  HKD: 7.79,
  NZD: 1.74,
  SEK: 10.68,
  NOK: 11.05,
  DKK: 6.89,
  PLN: 3.60,
  ZAR: 18.25,
  RUB: 96.50,
  TRY: 34.95,
  THB: 35.50,
  IDR: 16125.00,
  MYR: 4.47,
  PHP: 58.25,
  VND: 25420.00,
  PKR: 278.50,
  BDT: 119.50,
  NGN: 1545.00,
  EGP: 49.25,
  ARS: 985.50,
  COP: 4385.00,
  CLP: 973.50,
  PEN: 3.77,
  UAH: 41.25,
  CZK: 23.45,
  HUF: 361.50,
  RON: 4.59,
  BGN: 1.80,
  ILS: 3.58,
  SAR: 3.75,
  QAR: 3.64,
  KWD: 0.31,
  BHD: 0.38,
  OMR: 0.38,
  KZT: 512.00,
  GEL: 2.82,
  MAD: 10.05,
  KES: 129.00,
  UGX: 3685.00,
  GHS: 15.50,
  TWD: 32.50,
  BOB: 6.91,
  UYU: 43.85,
  VES: 50.25,
  MNT: 3405.00,
  LKR: 292.50,
};

export interface CryptoPrice {
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
}

export interface MarketPrices {
  [symbol: string]: CryptoPrice;
}

// Hook to get real-time market prices
export function useMarketPrices(updateInterval: number = 5000) {
  const [prices, setPrices] = useState<MarketPrices>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      console.log('🔄 Fetching crypto prices...');
      
      // Use absolute URL in development to avoid routing issues
      const apiUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/api/crypto`
        : '/api/crypto';
      
      const response = await fetch(apiUrl, {
        cache: 'no-store',
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Data parsed successfully');
      
      if (data.retCode === 0 && data.result?.list) {
        const priceMap: MarketPrices = {};
        
        for (const item of data.result.list) {
          if (item.symbol.endsWith('USDT')) {
            const symbol = item.symbol.replace('USDT', '');
            priceMap[symbol] = {
              symbol,
              price: parseFloat(item.lastPrice) || 0,
              change24h: (parseFloat(item.price24hPcnt) || 0) * 100,
              high24h: parseFloat(item.highPrice24h) || 0,
              low24h: parseFloat(item.lowPrice24h) || 0,
              volume24h: parseFloat(item.turnover24h) || 0,
            };
          }
        }
        
        // Add custom token prices
        for (const [symbol, price] of Object.entries(CUSTOM_TOKEN_PRICES)) {
          if (!priceMap[symbol]) {
            priceMap[symbol] = {
              symbol,
              price,
              change24h: 0,
              high24h: price,
              low24h: price,
              volume24h: 0,
            };
          }
        }
        
        console.log('✅ Prices updated:', Object.keys(priceMap).length, 'symbols');
        setPrices(priceMap);
        setError(null);
      }
    } catch (err) {
      console.error('❌ Error fetching prices:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    
    const interval = setInterval(fetchPrices, updateInterval);
    
    return () => clearInterval(interval);
  }, [fetchPrices, updateInterval]);

  return { prices, loading, error, refetch: fetchPrices };
}

// Get price for a specific coin
export function getCoinPrice(prices: MarketPrices, symbol: string): number {
  // Check custom tokens first
  if (CUSTOM_TOKEN_PRICES[symbol]) {
    return CUSTOM_TOKEN_PRICES[symbol];
  }
  
  return prices[symbol]?.price || 0;
}

// Convert coin amount to USD value
export function getCoinUsdValue(prices: MarketPrices, symbol: string, amount: number): number {
  const price = getCoinPrice(prices, symbol);
  return amount * price;
}

// Convert USD to fiat currency
export function convertUsdToFiat(usdAmount: number, fiatCode: string): number {
  const rate = FIAT_RATES[fiatCode] || 1;
  return usdAmount * rate;
}

// Get fiat rate
export function getFiatRate(fiatCode: string): number {
  return FIAT_RATES[fiatCode] || 1;
}

// Format price based on value
export function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (price >= 1) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  }
  if (price >= 0.01) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
  }
  return price.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 8 });
}

// Format volume
export function formatVolume(num: number): string {
  if (num >= 1000000000) return '$' + (num / 1000000000).toFixed(2) + 'B';
  if (num >= 1000000) return '$' + (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return '$' + (num / 1000).toFixed(2) + 'K';
  return '$' + num.toFixed(2);
}

// Format balance display
export function formatBalance(value: number, decimals: number = 4): string {
  if (value === 0) return '0.00';
  if (value < 0.0001) return value.toFixed(8);
  return value.toFixed(decimals);
}

// Calculate total portfolio value
export function calculatePortfolioValue(
  balances: Array<{ currency: string; totalBalance: number }>,
  prices: MarketPrices
): number {
  return balances.reduce((total, balance) => {
    const usdValue = getCoinUsdValue(prices, balance.currency, balance.totalBalance);
    return total + usdValue;
  }, 0);
}

// Calculate BTC equivalent value
export function calculateBtcValue(usdValue: number, prices: MarketPrices): number {
  const btcPrice = prices['BTC']?.price || 87000;
  return usdValue / btcPrice;
}

export { CUSTOM_TOKEN_PRICES, FIAT_RATES };