//app/FundingDashboard/page.tsx - PART 1 OF 2

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// CoinIcon component with fallback
const CoinIcon = ({ symbol, size = 36 }: { symbol: string; size?: number }) => {
  const [imgError, setImgError] = useState(false);
  
  const getColor = (sym: string) => {
    const colors: Record<string, string> = {
      BTC: '#F7931A', ETH: '#627EEA', USDT: '#26A17B', USDC: '#2775CA',
      USCT: '#00D4AA', BNB: '#F3BA2F', XRP: '#23292F', SOL: '#9945FF',
      ADA: '#0033AD', DOGE: '#C2A633', DOT: '#E6007A', MATIC: '#8247E5',
      AVAX: '#E84142', LINK: '#2A5ADA', UNI: '#FF007A', ATOM: '#2E3148',
      LTC: '#BFBBBB', TRX: '#FF0013', SHIB: '#FFA409', AAVE: '#B6509E',
    };
    return colors[sym] || '#888888';
  };
  
  if (imgError) {
    return (
      <div 
        className="rounded-full flex items-center justify-center"
        style={{ backgroundColor: getColor(symbol), width: size, height: size }}
      >
        <span className="text-white text-xs font-bold">{symbol.slice(0, 2)}</span>
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

interface Balance {
  currency: string;
  chain?: string;
  available: number;
  locked: number;
  frozen: number;
  totalBalance: number;
  usdValue: number;
  price?: number;
}

interface BalanceSummary {
  totalUsdValue: number;
  availableUsdValue: number;
  lockedUsdValue: number;
  frozenUsdValue: number;
  btcValue: number;
}

// Fiat currency rates
const fiatRates: Record<string, number> = {
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
  NGN: 1545.00,
  EGP: 49.25,
  ARS: 985.50,
  SAR: 3.75,
  COP: 4100,
  CLP: 950,
  PEN: 3.70,
};

// Format balance
const formatBalance = (balance: number): string => {
  if (balance === 0) return '0';
  if (balance < 0.0001) return balance.toFixed(10).replace(/\.?0+$/, '');
  if (balance < 1) return balance.toFixed(8).replace(/\.?0+$/, '');
  if (balance < 1000) return balance.toFixed(6).replace(/\.?0+$/, '');
  return balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Get fiat rate
const getFiatRate = (currency: string): number => {
  return fiatRates[currency] || 1;
};

// Popular cryptocurrencies at top, then A-Z
const cryptoList = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'USDT', name: 'Tether USDT' },
  { symbol: 'USDC', name: 'USD Coin' },
  { symbol: 'USCT', name: 'USC Token' },
  { symbol: 'BNB', name: 'BNB' },
  { symbol: 'XRP', name: 'Ripple' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'ADA', name: 'Cardano' },
  { symbol: 'DOGE', name: 'Dogecoin' },
  { symbol: 'TRX', name: 'TRON' },
  { symbol: 'DOT', name: 'Polkadot' },
  { symbol: 'MATIC', name: 'Polygon' },
  { symbol: 'LINK', name: 'Chainlink' },
  { symbol: 'AVAX', name: 'Avalanche' },
  { symbol: 'UNI', name: 'Uniswap' },
  { symbol: 'ATOM', name: 'Cosmos' },
  { symbol: 'LTC', name: 'Litecoin' },
  { symbol: 'SHIB', name: 'Shiba Inu' },
  { symbol: 'AAVE', name: 'Aave' },
];

// Fiat currencies
const fiatList = [
  { code: 'EUR', name: 'Euro' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'BRL', name: 'Brazilian Real' },
  { code: 'RUB', name: 'Russian Ruble' },
  { code: 'KRW', name: 'South Korean Won' },
  { code: 'MXN', name: 'Mexican Peso' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'HKD', name: 'Hong Kong Dollar' },
  { code: 'NOK', name: 'Norwegian Krone' },
  { code: 'SEK', name: 'Swedish Krona' },
  { code: 'DKK', name: 'Danish Krone' },
  { code: 'NZD', name: 'New Zealand Dollar' },
  { code: 'ZAR', name: 'South African Rand' },
  { code: 'PLN', name: 'Polish Zloty' },
  { code: 'TRY', name: 'Turkish Lira' },
  { code: 'THB', name: 'Thai Baht' },
  { code: 'IDR', name: 'Indonesian Rupiah' },
  { code: 'MYR', name: 'Malaysian Ringgit' },
  { code: 'PHP', name: 'Philippine Peso' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'SAR', name: 'Saudi Riyal' },
  { code: 'NGN', name: 'Nigerian Naira' },
  { code: 'EGP', name: 'Egyptian Pound' },
  { code: 'PKR', name: 'Pakistani Rupee' },
  { code: 'VND', name: 'Vietnamese Dong' },
  { code: 'ARS', name: 'Argentine Peso' },
  { code: 'COP', name: 'Colombian Peso' },
  { code: 'CLP', name: 'Chilean Peso' },
  { code: 'PEN', name: 'Peruvian Sol' },
];

const mostUsedCurrencies = ['USD'];
const otherCurrencies = fiatList.filter(f => f.code !== 'USD').map(f => f.code);

// PART 2 OF 2 - Main Component (paste this after Part 1)

export default function FundingDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'crypto' | 'fiat'>('crypto');
  const [summary, setSummary] = useState<BalanceSummary | null>(null);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);
  const [hideZero, setHideZero] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [eyeOpen, setEyeOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBalances();
    const saved = localStorage.getItem('preferredCurrency');
    if (saved) setSelectedCurrency(saved);
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchBalances, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchBalances = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('No auth token found');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/user/balances', {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Balances data:', data);
        
        if (data.success) {
          // Use funding balances specifically
          const fundingBalances = data.funding?.balances || data.balances || [];
          const fundingSummary = data.funding?.summary || {
            totalUsdValue: data.summary?.fundingUsdValue || data.summary?.totalUsdValue || 0,
            availableUsdValue: data.summary?.availableUsdValue || 0,
            lockedUsdValue: data.summary?.lockedUsdValue || 0,
            frozenUsdValue: 0,
            btcValue: data.summary?.btcValue || 0,
          };
          
          setBalances(fundingBalances);
          setSummary(fundingSummary);
        }
      } else {
        const errorData = await response.json();
        console.error('Balance fetch failed:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error fetching balances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencySelect = (currency: string) => {
    setSelectedCurrency(currency);
    setShowCurrencyModal(false);
    localStorage.setItem('preferredCurrency', currency);
  };

  const fiatRate = getFiatRate(selectedCurrency);

  const formatDisplayBalance = (usdValue: number) => {
    if (!eyeOpen) return '****';
    const converted = usdValue * fiatRate;
    return converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getBalanceForCrypto = (symbol: string): Balance | undefined => {
    return balances.find(b => b.currency === symbol);
  };

  const handleCoinClick = (symbol: string) => {
    router.push(`/Asset-Coin?symbol=${symbol}`);
  };

  // Filter crypto list based on search
  const filteredCryptoList = cryptoList.filter(crypto => 
    crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crypto.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter fiat list based on search
  const filteredFiatList = fiatList.filter(fiat =>
    fiat.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fiat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#f7a600] border-t-transparent rounded-full animate-spin" style={{ borderWidth: '3px' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0b0b0b]">
        <div className="flex items-center justify-between px-4 py-4">
          <button onClick={() => router.back()} className="p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">Funding Account</h1>
          <div className="flex items-center gap-4">
            <button className="p-1">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <Link href="/AssetHistory" className="p-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Balance Section */}
      <div className="px-4 pt-2 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-gray-400 text-sm">Total Assets</span>
          <button onClick={() => setEyeOpen(!eyeOpen)} className="p-0.5">
            {eyeOpen ? (
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            )}
          </button>
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-bold">
            {eyeOpen ? formatDisplayBalance(summary?.totalUsdValue || 0) : '****'}
          </span>
          <button onClick={() => setShowCurrencyModal(true)} className="flex items-center gap-0.5 text-sm text-gray-300">
            {selectedCurrency}
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-400 mb-4">
          <span>≈ {eyeOpen ? (summary?.btcValue || 0).toFixed(8) : '********'} BTC</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div className="mb-6">
          <div className="text-gray-400 text-sm mb-1">Available Balance</div>
          <div className="text-white font-medium">
            {eyeOpen ? formatDisplayBalance(summary?.availableUsdValue || 0) : '****'} 
            <span className="text-gray-400"> {selectedCurrency}</span>
          </div>
          <div className="text-gray-400 text-sm">
            ≈ {eyeOpen ? (summary?.btcValue || 0).toFixed(8) : '********'} BTC
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          <Link href="/CoinDepositDashboard" className="flex flex-col items-center gap-2 min-w-[60px]">
            <div className="w-12 h-12 rounded-full bg-[#f7a600] flex items-center justify-center">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            <span className="text-xs text-white">Deposit</span>
          </Link>
          <Link href="/selectCoinDashboard" className="flex flex-col items-center gap-2 min-w-[60px]">
            <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
            <span className="text-xs text-white">Withdraw</span>
          </Link>
          <Link href="/TransferDashboard" className="flex flex-col items-center gap-2 min-w-[60px]">
            <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <span className="text-xs text-white">Transfer</span>
          </Link>
          <Link href="/ConvertDashboard" className="flex flex-col items-center gap-2 min-w-[60px]">
            <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <span className="text-xs text-white">Convert</span>
          </Link>
          <div className="flex flex-col items-center gap-2 min-w-[60px]">
            <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs text-white">Give</span>
          </div>
        </div>

        {/* HODL Banner */}
        <div className="bg-[#1a1a1a] rounded-xl p-3 flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
            <span className="text-white text-xs font-bold">$</span>
          </div>
          <span className="text-white text-sm">HODL USDtb to Enjoy Up to 3.50% APR!</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-6">
            <button 
              onClick={() => setActiveTab('crypto')} 
              className={`pb-2 text-base font-semibold relative ${activeTab === 'crypto' ? 'text-white' : 'text-gray-500'}`}
            >
              Crypto
              {activeTab === 'crypto' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>}
            </button>
            <button 
              onClick={() => setActiveTab('fiat')} 
              className={`pb-2 text-base font-semibold relative ${activeTab === 'fiat' ? 'text-white' : 'text-gray-500'}`}
            >
              Fiat
              {activeTab === 'fiat' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-1">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button className="p-1">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Hide Zero Toggle */}
      <div className="px-4 mb-4">
        <button onClick={() => setHideZero(!hideZero)} className="flex items-center gap-2 text-sm text-gray-400">
          <div className={`w-4 h-4 rounded border-2 ${hideZero ? 'bg-transparent border-yellow-500' : 'border-gray-500'} flex items-center justify-center`}>
            {hideZero && <svg className="w-3 h-3 text-yellow-500" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
          </div>
          Hide zero balances
        </button>
      </div>

      {/* Asset List */}
      <div className="px-4">
        {activeTab === 'crypto' ? (
          <div className="space-y-0">
            {/* First show coins with balance */}
            {balances
              .filter(b => b.totalBalance > 0)
              .map((balance) => (
                <button
                  key={`${balance.currency}-${balance.chain || 'default'}`}
                  onClick={() => handleCoinClick(balance.currency)}
                  className="w-full flex items-center justify-between py-4 border-b border-[#1a1a1a] hover:bg-[#1a1a1a] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CoinIcon symbol={balance.currency} size={36} />
                    <div className="text-left">
                      <div className="text-white font-medium text-sm">{balance.currency}</div>
                      <div className="text-gray-500 text-xs">
                        {cryptoList.find(c => c.symbol === balance.currency)?.name || balance.currency}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium text-sm">
                      {eyeOpen ? formatBalance(balance.totalBalance) : '****'}
                    </div>
                    <div className="text-gray-500 text-xs">
                      ≈ {eyeOpen ? formatDisplayBalance(balance.usdValue) : '****'} {selectedCurrency}
                    </div>
                  </div>
                </button>
              ))}

            {/* Then show other coins from the list (with 0 balance) */}
            {!hideZero && filteredCryptoList
              .filter(crypto => !balances.find(b => b.currency === crypto.symbol && b.totalBalance > 0))
              .map((crypto) => {
                const balance = getBalanceForCrypto(crypto.symbol);
                const totalBalance = balance?.totalBalance || 0;
                const usdValue = balance?.usdValue || 0;
                
                return (
                  <button
                    key={crypto.symbol}
                    onClick={() => handleCoinClick(crypto.symbol)}
                    className="w-full flex items-center justify-between py-4 border-b border-[#1a1a1a] hover:bg-[#1a1a1a] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <CoinIcon symbol={crypto.symbol} size={36} />
                      <div className="text-left">
                        <div className="text-white font-medium text-sm">{crypto.symbol}</div>
                        <div className="text-gray-500 text-xs">{crypto.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium text-sm">
                        {eyeOpen ? formatBalance(totalBalance) : '****'}
                      </div>
                      <div className="text-gray-500 text-xs">
                        ≈ {eyeOpen ? formatDisplayBalance(usdValue) : '****'} {selectedCurrency}
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>
        ) : (
          <div className="space-y-0">
            {filteredFiatList.map((fiat) => (
              <div key={fiat.code} className="flex items-center justify-between py-4 border-b border-[#1a1a1a]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#4CAF50] flex items-center justify-center text-white text-xs font-bold">
                    {fiat.code.slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{fiat.code}</div>
                    <div className="text-gray-500 text-xs">{fiat.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium text-sm">{eyeOpen ? '0.00' : '****'}</div>
                  <div className="text-gray-500 text-xs">≈ 0 {selectedCurrency}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Currency Modal */}
      {showCurrencyModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end">
          <div className="bg-[#0b0b0b] w-full rounded-t-3xl" style={{ maxHeight: '70vh' }}>
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#1a1a1a]">
              <h2 className="text-lg font-semibold">Select a Currency</h2>
              <button onClick={() => setShowCurrencyModal(false)} className="p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto px-4 py-4" style={{ maxHeight: 'calc(70vh - 60px)' }}>
              <div className="mb-4">
                <h3 className="text-sm text-gray-500 mb-3">Most Used</h3>
                <div className="grid grid-cols-3 gap-2">
                  {mostUsedCurrencies.map(c => (
                    <button 
                      key={c} 
                      onClick={() => handleCurrencySelect(c)} 
                      className={`py-3 rounded-lg text-sm font-medium transition-colors ${selectedCurrency === c ? 'bg-white text-black' : 'bg-[#1a1a1a] text-white hover:bg-[#252525]'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm text-gray-500 mb-3">More</h3>
                <div className="grid grid-cols-3 gap-2">
                  {otherCurrencies.map(c => (
                    <button 
                      key={c} 
                      onClick={() => handleCurrencySelect(c)} 
                      className={`py-3 rounded-lg text-sm font-medium transition-colors ${selectedCurrency === c ? 'bg-white text-black' : 'bg-[#1a1a1a] text-white hover:bg-[#252525]'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}