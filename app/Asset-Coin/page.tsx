'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Clock, Share2, X, Link2, Download, Mail, MoreHorizontal } from 'lucide-react';
import { useMarketPrices, getCoinPrice, getCoinUsdValue, formatPrice } from '@/hooks/useMarketPrices';

// Storage key for persistent currency
const CURRENCY_STORAGE_KEY = 'selected_fiat_currency';

// Fiat currencies list with rates
const currencies = [
  { code: 'USD', rate: 1 },
  { code: 'EUR', rate: 0.86 },
  { code: 'GBP', rate: 0.79 },
  { code: 'JPY', rate: 156.50 },
  { code: 'AUD', rate: 1.52 },
  { code: 'CAD', rate: 1.43 },
  { code: 'CHF', rate: 0.89 },
  { code: 'CNY', rate: 7.25 },
  { code: 'INR', rate: 84.85 },
  { code: 'KRW', rate: 1425.00 },
  { code: 'BRL', rate: 5.98 },
  { code: 'MXN', rate: 20.15 },
  { code: 'AED', rate: 3.67 },
  { code: 'SGD', rate: 1.35 },
  { code: 'HKD', rate: 7.79 },
  { code: 'NZD', rate: 1.74 },
  { code: 'NGN', rate: 1545.00 },
];

// Get fiat rate by currency code
const getCurrencyRate = (code: string): number => {
  const currency = currencies.find(c => c.code === code);
  return currency?.rate || 1;
};

// Coin metadata
const COIN_METADATA: Record<string, { name: string; color: string }> = {
  BTC: { name: 'Bitcoin', color: '#F7931A' },
  ETH: { name: 'Ethereum', color: '#627EEA' },
  USDT: { name: 'Tether', color: '#26A17B' },
  USDC: { name: 'USD Coin', color: '#2775CA' },
  USCT: { name: 'USC Token', color: '#00D4AA' },
  BNB: { name: 'BNB', color: '#F3BA2F' },
  XRP: { name: 'Ripple', color: '#23292F' },
  SOL: { name: 'Solana', color: '#9945FF' },
  ADA: { name: 'Cardano', color: '#0033AD' },
  DOGE: { name: 'Dogecoin', color: '#C2A633' },
  DOT: { name: 'Polkadot', color: '#E6007A' },
  MATIC: { name: 'Polygon', color: '#8247E5' },
  LINK: { name: 'Chainlink', color: '#2A5ADA' },
  AVAX: { name: 'Avalanche', color: '#E84142' },
  UNI: { name: 'Uniswap', color: '#FF007A' },
  ATOM: { name: 'Cosmos', color: '#2E3148' },
  LTC: { name: 'Litecoin', color: '#BFBBBB' },
  TRX: { name: 'TRON', color: '#FF0013' },
  SHIB: { name: 'Shiba Inu', color: '#FFA409' },
  MANA: { name: 'Decentraland', color: '#FF5C5C' },
  SAND: { name: 'The Sandbox', color: '#00ADEF' },
};

// Trading pairs for each coin
const TRADING_PAIRS: Record<string, string[]> = {
  default: ['BTCUSDT', 'ETHUSDT', 'MANAUSDT', 'SANDUSDT'],
  BTC: ['BTCUSDT', 'BTCUSDC', 'BTCEUR', 'BTCGBP'],
  ETH: ['ETHUSDT', 'ETHBTC', 'ETHUSDC', 'ETHEUR'],
  USDT: ['BTCUSDT', 'ETHUSDT', 'MANAUSDT', 'SANDUSDT'],
  USCT: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT'],
};

// ============================================
// FORMAT WITH COMMAS - e.g., 1,000.00
// ============================================
const formatWithCommas = (value: number, decimals: number = 2): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

// ============================================
// FORMAT FULL BALANCE - WITH COMMAS FOR LARGE NUMBERS
// ============================================
const formatFullBalance = (balance: number): string => {
  if (balance === 0) return '0';
  if (balance === null || balance === undefined || isNaN(balance)) return '0';
  
  // For extremely small amounts (dust)
  if (balance > 0 && balance < 0.00000001) {
    return balance.toFixed(18).replace(/\.?0+$/, '');
  }
  
  // For very small amounts
  if (balance > 0 && balance < 0.0001) {
    return balance.toFixed(12).replace(/\.?0+$/, '');
  }
  
  // For small amounts
  if (balance < 1) {
    return balance.toFixed(8).replace(/\.?0+$/, '');
  }
  
  // For medium amounts (1-999)
  if (balance < 1000) {
    return balance.toFixed(6).replace(/\.?0+$/, '');
  }
  
  // For larger amounts - USE COMMAS
  return formatWithCommas(balance, 2);
};

// CoinIcon component
const CoinIcon = ({ symbol, size = 32 }: { symbol: string; size?: number }) => {
  const [imgError, setImgError] = useState(false);
  const meta = COIN_METADATA[symbol] || { name: symbol, color: '#888888' };
  
  if (imgError) {
    return (
      <div 
        className="rounded-full flex items-center justify-center"
        style={{ backgroundColor: meta.color, width: size, height: size }}
      >
        <span className="text-white font-bold" style={{ fontSize: size * 0.4 }}>
          {symbol.slice(0, 2)}
        </span>
      </div>
    );
  }
  
  return (
    <Image 
      src={`/coins/${symbol}.png`}
      alt={symbol}
      width={size}
      height={size}
      className="rounded-full"
      onError={() => setImgError(true)}
      unoptimized
    />
  );
};

// P&L Analysis Modal
const PnLAnalysisModal = ({ 
  isOpen, 
  onClose, 
  symbol,
  equity,
  pnlPercent,
  avgCost,
  indexPrice,
  selectedCurrency,
  fiatRate,
}: { 
  isOpen: boolean; 
  onClose: () => void;
  symbol: string;
  equity: number;
  pnlPercent: number;
  avgCost: number;
  indexPrice: number;
  selectedCurrency: string;
  fiatRate: number;
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/referral?code=O6OA4L`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    alert('Save functionality - implement with html2canvas library');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent('Check out my P&L on Bybit!');
    const body = encodeURIComponent(`My ${symbol} P&L: ${pnlPercent.toFixed(2)}%\n\nJoin using my referral code: O6OA4L`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleMore = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Bybit P&L',
        text: `Check out my ${symbol} performance!`,
        url: `${window.location.origin}/referral?code=O6OA4L`,
      });
    } else {
      alert('Share functionality not available on this device');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#0d0d0d] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[#1a1a1a]">
          <h2 className="text-white text-lg font-semibold">P&L Analysis</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4">
          <div id="pnl-card" className="bg-[#1a1a1a] rounded-xl overflow-hidden">
            <div className="bg-gradient-to-br from-[#1a2a1a] to-[#0d1a0d] p-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'linear-gradient(#2a3a2a 1px, transparent 1px), linear-gradient(90deg, #2a3a2a 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}></div>
              </div>
              
              <div className="relative z-10 mb-6">
                <span className="text-white text-2xl font-bold">BYB<span className="text-[#f7a600]">I</span>T</span>
              </div>

              <div className="relative z-10 mb-4">
                <div className="text-gray-400 text-sm mb-1">Cumulative P&L%</div>
                <div className={`text-4xl font-bold ${pnlPercent >= 0 ? 'text-[#00c076]' : 'text-[#f6465d]'}`}>
                  {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400 text-xs">Avg. Cost {selectedCurrency}</div>
                  <div className="text-white font-semibold">{formatWithCommas(avgCost * fiatRate, 2)}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Index Price</div>
                  <div className="text-white font-semibold">{formatWithCommas(indexPrice * fiatRate, 2)}</div>
                </div>
              </div>

              <div className="absolute right-4 bottom-4 opacity-80">
                <div className="text-6xl">🚀</div>
              </div>
            </div>

            <div className="bg-white p-4 flex items-center justify-between">
              <div>
                <div className="text-gray-600 text-xs">Join and claim over $5,000 in bonuses!</div>
                <div className="text-black font-bold text-lg">Referral Code: O6OA4L</div>
              </div>
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-xs">QR</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-around py-6 border-t border-[#1a1a1a]">
          <button onClick={handleCopyLink} className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-xs">{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
          <button onClick={handleSave} className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-xs">Save</span>
          </button>
          <button onClick={handleEmail} className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-xs">Email</span>
          </button>
          <button onClick={handleMore} className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center">
              <MoreHorizontal className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-xs">More</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AssetCoinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const symbol = searchParams.get('symbol') || 'USDT';
  
  const { prices, loading } = useMarketPrices(5000);
  const [balance, setBalance] = useState({ total: 0, available: 0, locked: 0 });
  const [showPnLModal, setShowPnLModal] = useState(false);
  const [tradingPairs, setTradingPairs] = useState<Array<{ pair: string; price: number; change: number }>>([]);
  
  // Load selected currency from localStorage
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  
  useEffect(() => {
    const savedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (savedCurrency) {
      setSelectedCurrency(savedCurrency);
    }
  }, []);

  const fiatRate = getCurrencyRate(selectedCurrency);
  const coinMeta = COIN_METADATA[symbol] || { name: symbol, color: '#888888' };
  const coinPrice = getCoinPrice(prices, symbol);
  const usdValue = getCoinUsdValue(prices, symbol, balance.total);
  const fiatValue = usdValue * fiatRate;
  
  // Calculate P&L
  const avgCost = coinPrice * 0.98;
  const pnlPercent = ((coinPrice - avgCost) / avgCost) * 100;
  const pnlUsd = usdValue * (pnlPercent / 100);
  const pnlFiat = pnlUsd * fiatRate;

  // Fetch user balance for this coin
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        const response = await fetch('/api/user/balances', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const coinBalance = data.balances.find((b: any) => b.currency === symbol);
            if (coinBalance) {
              setBalance({
                total: coinBalance.totalBalance || 0,
                available: coinBalance.available || 0,
                locked: coinBalance.locked || 0,
              });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    fetchBalance();
  }, [symbol]);

  // Fetch trading pairs prices
  useEffect(() => {
    const pairs = TRADING_PAIRS[symbol] || TRADING_PAIRS.default;
    const pairData = pairs.map(pair => {
      const baseSymbol = pair.replace('USDT', '').replace('USDC', '').replace('EUR', '').replace('GBP', '').replace('BTC', '');
      const priceData = prices[baseSymbol];
      return {
        pair,
        price: priceData?.price || 0,
        change: priceData?.change24h || 0,
      };
    });
    setTradingPairs(pairData);
  }, [prices, symbol]);

  const handleHistoryClick = () => {
    router.push(`/CoinDepositDashboard/AssetHistory?coin=${symbol}`);
  };

  const handleShareClick = () => {
    setShowPnLModal(true);
  };

  const handleTransfer = () => {
    router.push(`/TransferDashboard?coin=${symbol}`);
  };

  const handleConvert = () => {
    router.push(`/ConvertDashboard?from=${symbol}`);
  };

  const handleTradePair = (pair: string) => {
    router.push(`/TradeDashboard?pair=${pair}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#f7a600] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0d0d0d] border-b border-[#1a1a1a]">
        <div className="flex items-center justify-between px-4 py-4">
          <button onClick={() => router.back()} className="p-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <CoinIcon symbol={symbol} size={24} />
            <span className="text-lg font-semibold">{symbol}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleHistoryClick} className="p-1 hover:opacity-80 transition-opacity">
              <Clock className="w-6 h-6" />
            </button>
            <button onClick={handleShareClick} className="p-1 hover:opacity-80 transition-opacity">
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* Equity Section - With selected fiat currency and commas */}
        <div className="mb-6">
          <div className="text-gray-400 text-sm mb-1">Equity</div>
          <div className="text-4xl font-bold mb-1">{formatFullBalance(balance.total)}</div>
          <div className="text-gray-400 text-sm">≈ {formatWithCommas(fiatValue, 2)} {selectedCurrency}</div>
        </div>

        {/* P&L Stats - With selected fiat currency */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="text-gray-400 text-sm mb-1">Cumulative PnL ({selectedCurrency})</div>
            <div className={`text-lg font-semibold ${pnlFiat >= 0 ? 'text-[#00c076]' : 'text-[#f6465d]'}`}>
              {pnlFiat >= 0 ? '+' : ''}{formatWithCommas(pnlFiat, 2)}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-sm mb-1">Cumulative ROI%</div>
            <div className={`text-lg font-semibold ${pnlPercent >= 0 ? 'text-[#00c076]' : 'text-[#f6465d]'}`}>
              {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-[#1a1a1a]">
          <div>
            <div className="text-gray-400 text-sm mb-1">Avg. Cost ({selectedCurrency})</div>
            <div className="text-white font-semibold">{formatWithCommas(avgCost * fiatRate, 2)}</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm mb-1">Index Price ({selectedCurrency})</div>
            <div className="text-white font-semibold">{formatWithCommas(coinPrice * fiatRate, 2)}</div>
          </div>
        </div>

        {/* Distribution Section - With selected fiat currency and commas */}
        <div className="mb-6 pb-6 border-b border-[#1a1a1a]">
          <h3 className="text-white font-semibold mb-4">Distribution</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#1a1a1a" strokeWidth="6" />
                <circle cx="32" cy="32" r="28" fill="none" stroke="#00c076" strokeWidth="6"
                  strokeDasharray={`${99.99 * 1.76} ${100 * 1.76}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-xs font-semibold">99.99%</span>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#00c076] rounded-full"></div>
                <span className="text-white">Funding Account</span>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">{formatFullBalance(balance.total)}</div>
                <div className="text-gray-400 text-sm">≈ {formatWithCommas(fiatValue, 2)} {selectedCurrency}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Details Section - With commas */}
        <div className="mb-6 pb-6 border-b border-[#1a1a1a]">
          <h3 className="text-white font-semibold mb-4">Balance Details</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Available</span>
              <span className="text-white font-medium">{formatFullBalance(balance.available)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Locked</span>
              <span className="text-white font-medium">{formatFullBalance(balance.locked)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Total</span>
              <span className="text-white font-medium">{formatFullBalance(balance.total)}</span>
            </div>
          </div>
        </div>

        {/* Trade Section */}
        <div className="mb-6">
          <h3 className="text-white font-semibold mb-4">Trade</h3>
          <div className="grid grid-cols-2 gap-3">
            {tradingPairs.map((pair) => (
              <button
                key={pair.pair}
                onClick={() => handleTradePair(pair.pair)}
                className="bg-[#1a1a1a] rounded-xl p-4 text-left hover:bg-[#252525] transition-colors"
              >
                <div className="text-gray-400 text-sm mb-1">{pair.pair}</div>
                <div className="text-white font-semibold mb-1">{formatPrice(pair.price)}</div>
                <div className={`text-sm ${pair.change >= 0 ? 'text-[#00c076]' : 'text-[#f6465d]'}`}>
                  {pair.change >= 0 ? '+' : ''}{pair.change.toFixed(2)}%
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0d0d0d] border-t border-[#1a1a1a] p-4">
        <div className="flex gap-4 max-w-md mx-auto">
          <button 
            onClick={handleTransfer}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1a1a1a] rounded-full text-white font-semibold hover:bg-[#252525] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Transfer
          </button>
          <button 
            onClick={handleConvert}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1a1a1a] rounded-full text-white font-semibold hover:bg-[#252525] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Convert
          </button>
        </div>
      </div>

      {/* P&L Analysis Modal */}
      <PnLAnalysisModal
        isOpen={showPnLModal}
        onClose={() => setShowPnLModal(false)}
        symbol={symbol}
        equity={balance.total}
        pnlPercent={pnlPercent}
        avgCost={avgCost}
        indexPrice={coinPrice}
        selectedCurrency={selectedCurrency}
        fiatRate={fiatRate}
      />
    </div>
  );
}