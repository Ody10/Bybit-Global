//app/convertDashboard/page.tsx

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Ticker {
  symbol: string;
  lastPrice: string;
  volume24h: string;
}

interface CoinData {
  symbol: string;
  name: string;
  balance: number;
  usdValue: string;
}

interface FiatData {
  symbol: string;
  name: string;
  balance: number;
}

// Map of coin symbols to their full names
const coinNames: Record<string, string> = {
  USDT: 'Tether USDT',
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  ARB: 'Arbitrum',
  USDC: 'USD Coin',
  SUI: 'Sui',
  XRP: 'XRP',
  PEPE: 'Pepe',
  ADA: 'Cardano',
  DOGE: 'Dogecoin',
  DOT: 'Polkadot',
  SOL: 'Solana',
  TRX: 'TRON',
  AVAX: 'Avalanche',
  SHIB: 'Shiba Inu',
  LINK: 'Chainlink',
  MATIC: 'Polygon',
  LTC: 'Litecoin',
  BCH: 'Bitcoin Cash',
  ATOM: 'Cosmos',
  UNI: 'Uniswap',
  XLM: 'Stellar',
  NEAR: 'NEAR Protocol',
  APT: 'Aptos',
  OP: 'Optimism',
  INJ: 'Injective',
  SEI: 'Sei',
  TIA: 'Celestia',
  FIL: 'Filecoin',
  AAVE: 'Aave',
  GRT: 'The Graph',
  MKR: 'Maker',
  RUNE: 'THORChain',
  IMX: 'Immutable X',
  FTM: 'Fantom',
  SAND: 'The Sandbox',
  MANA: 'Decentraland',
  AXS: 'Axie Infinity',
  GALA: 'Gala',
  ENJ: 'Enjin Coin',
  CHZ: 'Chiliz',
  ALGO: 'Algorand',
  VET: 'VeChain',
  HBAR: 'Hedera',
  EOS: 'EOS',
  XTZ: 'Tezos',
  THETA: 'Theta Network',
  ICP: 'Internet Computer',
  EGLD: 'MultiversX',
  FLOW: 'Flow',
  NEO: 'Neo',
  KAS: 'Kaspa',
  STX: 'Stacks',
  WIF: 'dogwifhat',
  BONK: 'Bonk',
  FLOKI: 'Floki',
  NOT: 'Notcoin',
  TON: 'Toncoin',
  WLD: 'Worldcoin',
  JUP: 'Jupiter',
  STRK: 'Starknet',
  ZETA: 'ZetaChain',
  MANTA: 'Manta Network',
  ALT: 'AltLayer',
  PIXEL: 'Pixels',
  PORTAL: 'Portal',
};

// Popular coins that should appear at the top
const popularCoins = ['USDT', 'BTC', 'ETH', 'ARB', 'USDC', 'SUI', 'XRP', 'PEPE', 'ADA', 'DOGE', 'DOT'];

// Fiat currencies list
const fiatCurrencies: FiatData[] = [
  { symbol: 'EUR', name: 'Euro', balance: 0 },
  { symbol: 'USD', name: 'USD', balance: 0 },
  { symbol: 'PLN', name: 'PLN', balance: 0 },
  { symbol: 'GBP', name: 'Pound Sterling', balance: 0 },
  { symbol: 'BRL', name: 'Brazilian Real', balance: 0 },
  { symbol: 'ARS', name: 'Argentine Peso', balance: 0 },
  { symbol: 'TRY', name: 'TRY', balance: 0 },
  { symbol: 'UAH', name: 'UAH', balance: 0 },
  { symbol: 'VND', name: 'VND', balance: 0 },
  { symbol: 'MXN', name: 'MXN', balance: 0 },
  { symbol: 'UYU', name: 'UYU', balance: 0 },
  { symbol: 'COP', name: 'COP', balance: 0 },
  { symbol: 'CRC', name: 'CRC', balance: 0 },
  { symbol: 'PEN', name: 'PEN', balance: 0 },
  { symbol: 'RON', name: 'RON', balance: 0 },
  { symbol: 'IDR', name: 'IDR', balance: 0 },
  { symbol: 'HUF', name: 'HUF', balance: 0 },
  { symbol: 'HKD', name: 'HKD', balance: 0 },
  { symbol: 'CZK', name: 'CZK', balance: 0 },
  { symbol: 'CHF', name: 'CHF', balance: 0 },
  { symbol: 'AUD', name: 'Australian Dollar', balance: 0 },
  { symbol: 'CAD', name: 'Canadian Dollar', balance: 0 },
  { symbol: 'JPY', name: 'Japanese Yen', balance: 0 },
  { symbol: 'KRW', name: 'South Korean Won', balance: 0 },
  { symbol: 'SGD', name: 'Singapore Dollar', balance: 0 },
  { symbol: 'NZD', name: 'New Zealand Dollar', balance: 0 },
  { symbol: 'INR', name: 'Indian Rupee', balance: 0 },
  { symbol: 'PHP', name: 'Philippine Peso', balance: 0 },
  { symbol: 'THB', name: 'Thai Baht', balance: 0 },
  { symbol: 'NGN', name: 'Nigerian Naira', balance: 0 },
  { symbol: 'ZAR', name: 'South African Rand', balance: 0 },
  { symbol: 'SEK', name: 'Swedish Krona', balance: 0 },
  { symbol: 'NOK', name: 'Norwegian Krone', balance: 0 },
  { symbol: 'DKK', name: 'Danish Krone', balance: 0 },
];

// Fiat currency colors
const fiatColors: Record<string, string> = {
  EUR: '#3b82f6',
  USD: '#22c55e',
  PLN: '#ef4444',
  GBP: '#8b5cf6',
  BRL: '#22c55e',
  ARS: '#22c55e',
  TRY: '#06b6d4',
  UAH: '#f97316',
  VND: '#22c55e',
  MXN: '#f97316',
  UYU: '#8b5cf6',
  COP: '#22c55e',
  CRC: '#3b82f6',
  PEN: '#84cc16',
  RON: '#3b82f6',
  IDR: '#ef4444',
  HUF: '#22c55e',
  HKD: '#22c55e',
  CZK: '#22c55e',
  CHF: '#6b7280',
  AUD: '#f59e0b',
  CAD: '#ef4444',
  JPY: '#ef4444',
  KRW: '#3b82f6',
  SGD: '#ef4444',
  NZD: '#22c55e',
  INR: '#f97316',
  PHP: '#3b82f6',
  THB: '#8b5cf6',
  NGN: '#22c55e',
  ZAR: '#22c55e',
  SEK: '#3b82f6',
  NOK: '#ef4444',
  DKK: '#ef4444',
};

// Coin Icon Component with fallback
function CoinIcon({ symbol, size = 28 }: { symbol: string; size?: number }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div 
        className="rounded-full bg-gray-700 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-[10px] font-medium text-white">{symbol.slice(0, 2)}</span>
      </div>
    );
  }

  return (
    <div 
      className="rounded-full bg-gray-700 flex items-center justify-center overflow-hidden"
      style={{ width: size, height: size }}
    >
      <Image
        src={`/coins/${symbol}.png`}
        alt={symbol}
        width={size}
        height={size}
        className="w-full h-full object-cover"
        onError={() => setHasError(true)}
        unoptimized
      />
    </div>
  );
}

// Fiat Icon Component
function FiatIcon({ symbol, size = 28 }: { symbol: string; size?: number }) {
  const bgColor = fiatColors[symbol] || '#6b7280';
  
  return (
    <div 
      className="rounded-full flex items-center justify-center text-white font-medium"
      style={{ 
        width: size, 
        height: size, 
        backgroundColor: bgColor,
        fontSize: size * 0.35
      }}
    >
      {symbol.slice(0, 3)}
    </div>
  );
}

type ModalType = 'from' | 'to' | null;
type TabType = 'crypto' | 'fiat';
type TradeType = 'instant' | 'limit';

export default function ConvertDashboard() {
  const router = useRouter();
  const [tradeType, setTradeType] = useState<TradeType>('instant');
  const [fromCoin, setFromCoin] = useState<CoinData>({
    symbol: 'BTC',
    name: 'Bitcoin',
    balance: 0,
    usdValue: '≈$ 0.00',
  });
  const [toCoin, setToCoin] = useState<CoinData>({
    symbol: 'USDT',
    name: 'Tether USDT',
    balance: 0,
    usdValue: '≈$ 0.00',
  });
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('--');
  const [showModal, setShowModal] = useState<ModalType>(null);
  const [activeTab, setActiveTab] = useState<TabType>('crypto');
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoins();
  }, []);

  const fetchCoins = async () => {
    try {
      const response = await fetch('https://api.bybit.com/v5/market/tickers?category=spot', {
  cache: 'no-store'
});
      const data = await response.json();

      if (data.result?.list) {
        const coinMap = new Map<string, CoinData>();

        data.result.list.forEach((ticker: Ticker) => {
          const symbol = ticker.symbol
            .replace(/USDT$/, '')
            .replace(/USDC$/, '')
            .replace(/BTC$/, '')
            .replace(/ETH$/, '');

          if (symbol && !coinMap.has(symbol)) {
            coinMap.set(symbol, {
              symbol,
              name: coinNames[symbol] || symbol,
              balance: 0,
              usdValue: '≈$ 0',
            });
          }
        });

        // Sort: popular coins first, then alphabetically
        const sortedCoins = Array.from(coinMap.values()).sort((a, b) => {
          const aPopular = popularCoins.indexOf(a.symbol);
          const bPopular = popularCoins.indexOf(b.symbol);
          
          if (aPopular !== -1 && bPopular !== -1) {
            return aPopular - bPopular;
          }
          if (aPopular !== -1) return -1;
          if (bPopular !== -1) return 1;
          return a.symbol.localeCompare(b.symbol);
        });

        setCoins(sortedCoins);
      }
    } catch (error) {
      console.error('Failed to fetch coins:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCoins = useMemo(() => {
    if (!searchQuery) return coins;
    return coins.filter(
      (coin) =>
        coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coin.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [coins, searchQuery]);

  const filteredFiat = useMemo(() => {
    if (!searchQuery) return fiatCurrencies;
    return fiatCurrencies.filter(
      (fiat) =>
        fiat.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fiat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const swapCoins = () => {
    const temp = fromCoin;
    setFromCoin(toCoin);
    setToCoin(temp);
    setFromAmount('');
    setToAmount('--');
  };

  const handleCoinSelect = (coin: CoinData) => {
    if (showModal === 'from') {
      setFromCoin(coin);
    } else if (showModal === 'to') {
      setToCoin(coin);
    }
    setShowModal(null);
    setSearchQuery('');
    setActiveTab('crypto');
  };

  const handleFiatSelect = (fiat: FiatData) => {
    const coinData: CoinData = {
      symbol: fiat.symbol,
      name: fiat.name,
      balance: fiat.balance,
      usdValue: '≈$ 0',
    };
    if (showModal === 'from') {
      setFromCoin(coinData);
    } else if (showModal === 'to') {
      setToCoin(coinData);
    }
    setShowModal(null);
    setSearchQuery('');
    setActiveTab('crypto');
  };

  const handleMaxClick = () => {
    setFromAmount(fromCoin.balance.toString());
  };

  const handleQuote = () => {
    console.log('Quote:', {
      from: fromCoin.symbol,
      to: toCoin.symbol,
      amount: fromAmount,
    });
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Header Navigation */}
      <div className="sticky top-0 z-10 bg-[#0d0d0d]">
        <div className="flex items-center gap-1 px-4 py-3">
          <button className="p-2 -ml-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </button>
          <span className="text-white font-semibold">Convert</span>
          <span className="text-gray-500 ml-3">Spot</span>
          <span className="text-gray-500 ml-3">Futures</span>
          <span className="text-gray-500 ml-3">Options</span>
          <span className="text-gray-500 ml-3">TradFi</span>
        </div>

        {/* Instant / Limit Tabs */}
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex gap-4">
            <button
              onClick={() => setTradeType('instant')}
              className={`text-sm font-medium pb-1 ${
                tradeType === 'instant'
                  ? 'text-white border-b-2 border-white'
                  : 'text-gray-500'
              }`}
            >
              Instant
            </button>
            <button
              onClick={() => setTradeType('limit')}
              className={`text-sm font-medium pb-1 ${
                tradeType === 'limit'
                  ? 'text-white border-b-2 border-white'
                  : 'text-gray-500'
              }`}
            >
              Limit
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-gray-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </button>
            <button className="text-gray-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <button className="text-gray-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M3 10h18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 pb-32">
        {/* From Section */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">From</span>
            <button className="text-gray-400 text-sm flex items-center gap-1">
              Available balance {fromCoin.balance}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowModal('from')}
              className="flex items-center gap-2"
            >
              {fiatCurrencies.some(f => f.symbol === fromCoin.symbol) ? (
                <FiatIcon symbol={fromCoin.symbol} size={24} />
              ) : (
                <CoinIcon symbol={fromCoin.symbol} size={24} />
              )}
              <span className="text-white font-medium">{fromCoin.symbol}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="0.00000009-0.45"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="bg-transparent text-white text-right outline-none w-40 placeholder-gray-600"
              />
              <button
                onClick={handleMaxClick}
                className="text-[#f7a600] font-medium text-sm"
              >
                Max
              </button>
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center py-3">
          <button
            onClick={swapCoins}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4" />
            </svg>
          </button>
        </div>

        {/* To Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">To</span>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowModal('to')}
              className="flex items-center gap-2"
            >
              {fiatCurrencies.some(f => f.symbol === toCoin.symbol) ? (
                <FiatIcon symbol={toCoin.symbol} size={24} />
              ) : (
                <CoinIcon symbol={toCoin.symbol} size={24} />
              )}
              <span className="text-white font-medium">{toCoin.symbol}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            <span className="text-gray-500">{toAmount}</span>
          </div>
        </div>

        {/* Quote Button */}
        <button
          onClick={handleQuote}
          className="w-full bg-[#f7a600] text-black font-semibold py-4 rounded-xl mb-4 hover:bg-[#ffb824] transition-colors"
        >
          Quote
        </button>

        {/* One-Click Buy Link */}
        <button className="w-full text-center text-gray-400 text-sm flex items-center justify-center gap-1">
          One-Click Buy
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0d0d0d] border-t border-gray-800">
        <div className="flex items-center justify-around py-2">
          <button 
            onClick={() => router.push('/BybitDashboard')}
            className="flex flex-col items-center gap-1 text-gray-500 py-2 px-4 hover:text-white transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs">Home</span>
          </button>
          <button 
            onClick={() => router.push('/MarketsDashboard')}
            className="flex flex-col items-center gap-1 text-gray-500 py-2 px-4 hover:text-white transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <span className="text-xs">Markets</span>
          </button>
          <button 
            onClick={() => router.push('/TradeDashboard')}
            className="flex flex-col items-center gap-1 text-white py-2 px-4"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
            <span className="text-xs">Trade</span>
          </button>
          <button 
            onClick={() => router.push('/EarnDashboard')}
            className="flex flex-col items-center gap-1 text-gray-500 py-2 px-4 hover:text-white transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span className="text-xs">Earn</span>
          </button>
          <button 
            onClick={() => router.push('/AssetsDashboard')}
            className="flex flex-col items-center gap-1 text-gray-500 py-2 px-4 hover:text-white transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
            </svg>
            <span className="text-xs">Assets</span>
          </button>
        </div>
      </div>

      {/* Coin/Fiat Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0d0d0d] z-50 flex flex-col">
          {/* Modal Header */}
          <div className="px-4 py-3">
            <div className="relative flex items-center">
              <svg
                className="absolute left-3 text-gray-500"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Please select your preferred pair"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a1a1a] rounded-lg py-3 pl-10 pr-20 text-white placeholder-gray-500 outline-none"
                autoFocus
              />
              <button
                onClick={() => {
                  setShowModal(null);
                  setSearchQuery('');
                  setActiveTab('crypto');
                }}
                className="absolute right-3 text-gray-400 text-sm hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Crypto / Fiat Tabs */}
          <div className="px-4 mb-2">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('crypto')}
                className={`pb-2 text-sm font-medium ${
                  activeTab === 'crypto'
                    ? 'text-white border-b-2 border-white'
                    : 'text-gray-500'
                }`}
              >
                Crypto
              </button>
              <button
                onClick={() => setActiveTab('fiat')}
                className={`pb-2 text-sm font-medium ${
                  activeTab === 'fiat'
                    ? 'text-white border-b-2 border-white'
                    : 'text-gray-500'
                }`}
              >
                Fiat
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-4">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-500 border-t-transparent"></div>
              </div>
            ) : activeTab === 'crypto' ? (
              // Crypto List
              filteredCoins.map((coin) => (
                <button
                  key={coin.symbol}
                  onClick={() => handleCoinSelect(coin)}
                  className="w-full flex items-center justify-between py-4 hover:bg-gray-800/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CoinIcon symbol={coin.symbol} size={32} />
                    <div className="text-left">
                      <div className="text-white font-medium text-[15px]">{coin.symbol}</div>
                      <div className="text-gray-500 text-xs">{coin.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-[15px]">{coin.balance}</div>
                    <div className="text-gray-500 text-xs">{coin.usdValue}</div>
                  </div>
                </button>
              ))
            ) : (
              // Fiat List
              filteredFiat.map((fiat) => (
                <button
                  key={fiat.symbol}
                  onClick={() => handleFiatSelect(fiat)}
                  className="w-full flex items-center justify-between py-4 hover:bg-gray-800/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FiatIcon symbol={fiat.symbol} size={32} />
                    <div className="text-left">
                      <div className="text-white font-medium text-[15px]">{fiat.symbol}</div>
                      <div className="text-gray-500 text-xs">{fiat.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-[15px]">{fiat.balance}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}