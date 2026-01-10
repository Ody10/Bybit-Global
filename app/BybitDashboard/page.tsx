//BybitDashboard/page.tsx

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, Eye, EyeOff, ChevronDown, ChevronRight, ScanLine, X, Home, BarChart2, ArrowLeftRight, DollarSign, Wallet, ArrowDownLeft, RefreshCw, Check } from 'lucide-react';
import Image from 'next/image';

// Storage key for persistent currency
const CURRENCY_STORAGE_KEY = 'selected_fiat_currency';

// Fiat currencies list with rates
const currencies = [
  { code: 'USD', name: 'US Dollar', rate: 1 },
  { code: 'EUR', name: 'Euro', rate: 0.86 },
  { code: 'GBP', name: 'British Pound', rate: 0.79 },
  { code: 'JPY', name: 'Japanese Yen', rate: 156.50 },
  { code: 'AUD', name: 'Australian Dollar', rate: 1.52 },
  { code: 'CAD', name: 'Canadian Dollar', rate: 1.43 },
  { code: 'CHF', name: 'Swiss Franc', rate: 0.89 },
  { code: 'CNY', name: 'Chinese Yuan', rate: 7.25 },
  { code: 'INR', name: 'Indian Rupee', rate: 84.85 },
  { code: 'KRW', name: 'South Korean Won', rate: 1425.00 },
  { code: 'BRL', name: 'Brazilian Real', rate: 5.98 },
  { code: 'MXN', name: 'Mexican Peso', rate: 20.15 },
  { code: 'AED', name: 'UAE Dirham', rate: 3.67 },
  { code: 'SGD', name: 'Singapore Dollar', rate: 1.35 },
  { code: 'HKD', name: 'Hong Kong Dollar', rate: 7.79 },
  { code: 'NZD', name: 'New Zealand Dollar', rate: 1.74 },
  { code: 'SEK', name: 'Swedish Krona', rate: 10.68 },
  { code: 'NOK', name: 'Norwegian Krone', rate: 11.05 },
  { code: 'DKK', name: 'Danish Krone', rate: 6.89 },
  { code: 'PLN', name: 'Polish Zloty', rate: 3.60 },
  { code: 'ZAR', name: 'South African Rand', rate: 18.25 },
  { code: 'RUB', name: 'Russian Ruble', rate: 96.50 },
  { code: 'TRY', name: 'Turkish Lira', rate: 34.95 },
  { code: 'THB', name: 'Thai Baht', rate: 35.50 },
  { code: 'IDR', name: 'Indonesian Rupiah', rate: 16125.00 },
  { code: 'MYR', name: 'Malaysian Ringgit', rate: 4.47 },
  { code: 'PHP', name: 'Philippine Peso', rate: 58.25 },
  { code: 'VND', name: 'Vietnamese Dong', rate: 25420.00 },
  { code: 'PKR', name: 'Pakistani Rupee', rate: 278.50 },
  { code: 'NGN', name: 'Nigerian Naira', rate: 1545.00 },
  { code: 'EGP', name: 'Egyptian Pound', rate: 49.25 },
  { code: 'ARS', name: 'Argentine Peso', rate: 985.50 },
];

// Get fiat rate by currency code
const getCurrencyRate = (code: string): number => {
  const currency = currencies.find(c => c.code === code);
  return currency?.rate || 1;
};

// Format with commas
const formatWithCommas = (value: number, decimals: number = 2): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

// Format price helper
const formatPrice = (price: number): string => {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(4);
  if (price >= 0.0001) return price.toFixed(6);
  return price.toFixed(8);
};

// Format volume helper
const formatVolume = (volume: number): string => {
  if (volume >= 1000000000) return (volume / 1000000000).toFixed(2) + 'B';
  if (volume >= 1000000) return (volume / 1000000).toFixed(2) + 'M';
  if (volume >= 1000) return (volume / 1000).toFixed(2) + 'K';
  return volume.toFixed(2);
};

// Notification data
const notifications = [
  {
    id: 1,
    type: 'system',
    title: 'Login Attempt From New IP',
    content: `Dear Trader,

The system has detected that your account is logged in from an unfamiliar IP address.

If this is not you, please disable your account immediately.`,
    date: '12-24 15:02',
    tag: 'Changes to Account Info',
    category: 'System Notification'
  },
  {
    id: 2,
    type: 'event',
    title: 'Win up to $ 7,000',
    content: 'Trade boosted tokens to win big! Trade over $10,000 daily to earn an extra lucky draw chance!',
    date: '12-23 12:29',
    tag: 'Latest Events',
    category: 'Latest Events'
  },
  {
    id: 3,
    type: 'announcement',
    title: 'On-Chain Earn: Mantle Vault is Live',
    content: 'Earn up to 8.5 APR% on USDT & USDC — High Yield. Flexible. Low Risk.',
    date: '12-22 13:28',
    tag: 'Announcement',
    category: 'Announcement'
  },
];

const notifTabs = [
  { name: 'All', count: 93 },
  { name: 'System Notification', count: 5 },
  { name: 'Latest Events', count: 68 },
  { name: 'Announcement', count: 1 },
  { name: 'Rewards', count: null }
];

// Coin Icon Component
const CoinIcon = ({ symbol, size = 40 }: { symbol: string; size?: number }) => {
  const [hasError, setHasError] = useState(false);
  
  const getColor = (sym: string) => {
    const colors: Record<string, string> = {
      BTC: '#F7931A', ETH: '#627EEA', USDT: '#26A17B', USDC: '#2775CA',
      USCT: '#00D4AA', BNB: '#F3BA2F', XRP: '#23292F', SOL: '#9945FF',
      ADA: '#0033AD', DOGE: '#C2A633', DOT: '#E6007A', MATIC: '#8247E5',
      AVAX: '#E84142', LINK: '#2A5ADA', UNI: '#FF007A', ATOM: '#2E3148',
    };
    return colors[sym] || '#888888';
  };
  
  if (hasError) {
    return (
      <div 
        className="rounded-full flex items-center justify-center"
        style={{ backgroundColor: getColor(symbol), width: size, height: size }}
      >
        <span className="text-white font-bold" style={{ fontSize: size * 0.35 }}>{symbol[0]}</span>
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
      onError={() => setHasError(true)}
      unoptimized
    />
  );
};

// Deposit Modal Component
const DepositModal = ({ 
  isOpen, 
  onClose,
  selectedFiat,
  onFiatChange,
}: { 
  isOpen: boolean; 
  onClose: () => void;
  selectedFiat: string;
  onFiatChange: () => void;
}) => {
  const router = useRouter();
  
  if (!isOpen) return null;

  const handleDepositCrypto = () => {
    onClose();
    router.push('/CoinDepositDashboard');
  };

  const handleReceiveFromBybit = () => {
    onClose();
    router.push('/BybitPayDashboard');
  };

  const handleP2PTrading = () => {
    onClose();
    router.push('/P2P-Dashboard');
  };

  const handleBuyWithFiat = () => {
    onClose();
    router.push('/FiatDashboard');
  };

  const handleDepositFiat = () => {
    onClose();
    router.push('/Fiat-Currency-Dashboard');
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center pt-16">
      <div className="w-full max-w-md bg-[#1a1a1a] rounded-2xl max-h-[85vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
          <h2 className="text-white text-lg font-semibold">Select Payment Method</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="overflow-y-auto p-4">
          {/* Don't have crypto section */}
          <div className="mb-4">
            <div className="text-[#71757f] text-sm mb-3">Don&apos;t have crypto</div>
            
            <button 
              onClick={handleDepositCrypto}
              className="w-full bg-[#2a2a2a] rounded-xl p-4 mb-3 flex items-center justify-between hover:bg-[#353535] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#3a3a3a] rounded-full flex items-center justify-center">
                  <ArrowDownLeft className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-white text-sm font-medium">Deposit Crypto</div>
                  <div className="text-[#71757f] text-xs">Already have crypto? Deposit directly</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#71757f]" />
            </button>

            <button 
              onClick={handleReceiveFromBybit}
              className="w-full bg-[#2a2a2a] rounded-xl p-4 flex items-center justify-between hover:bg-[#353535] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#3a3a3a] rounded-full flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-white text-sm font-medium">Receive from Bybit User</div>
                  <div className="text-[#71757f] text-xs">Get crypto directly from another Bybit user.</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#71757f]" />
            </button>
          </div>

          {/* Buy Crypto with Fiat section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#71757f] text-sm">Buy Crypto with Fiat</span>
              <button 
                onClick={onFiatChange}
                className="flex items-center gap-1 bg-[#2a2a2a] rounded px-2 py-1 hover:bg-[#353535] transition-colors"
              >
                <div className="w-4 h-4 rounded-full bg-[#3F51B5] flex items-center justify-center text-white text-[8px] font-bold">
                  {selectedFiat[0]}
                </div>
                <span className="text-white text-xs">{selectedFiat}</span>
                <ChevronDown className="w-3 h-3 text-white" />
              </button>
            </div>

            <button 
              onClick={handleP2PTrading}
              className="w-full bg-[#2a2a2a] rounded-xl p-4 mb-3 flex items-center justify-between hover:bg-[#353535] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#3a3a3a] rounded-full flex items-center justify-center">
                  <span className="text-[#4CAF50] text-xs font-bold">P2P</span>
                </div>
                <div className="text-left">
                  <div className="text-white text-sm font-medium">P2P Trading</div>
                  <div className="text-[#71757f] text-xs">Bank Transfer, Revolut, Wise and more</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#71757f]" />
            </button>

            <button 
              onClick={handleBuyWithFiat}
              className="w-full bg-[#2a2a2a] rounded-xl p-4 mb-3 flex items-center justify-between hover:bg-[#353535] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#3a3a3a] rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-white text-sm font-medium">Buy with {selectedFiat}</div>
                  <div className="text-[#71757f] text-xs">Visa, Mastercard and JCB are supported</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#71757f]" />
            </button>

            <button 
              onClick={handleDepositFiat}
              className="w-full bg-[#2a2a2a] rounded-xl p-4 flex items-center justify-between hover:bg-[#353535] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#3a3a3a] rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-bold">$</span>
                </div>
                <div className="text-left">
                  <div className="text-white text-sm font-medium">Deposit {selectedFiat}</div>
                  <div className="text-[#71757f] text-xs">Deposit via Bank Transfers or Top-Ups</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#71757f]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Currency Selection Modal Component
const CurrencySelectionModal = ({
  isOpen,
  onClose,
  selectedCurrency,
  onSelectCurrency,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedCurrency: string;
  onSelectCurrency: (code: string) => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
      <div className="w-full bg-[#1a1a1a] rounded-t-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
          <h2 className="text-white text-lg font-semibold">Select a Currency</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
        <div className="overflow-y-auto p-4 max-h-[60vh]">
          {/* Most Used */}
          <div className="mb-4">
            <div className="text-[#71757f] text-xs mb-2">Most Used</div>
            <button
              onClick={() => onSelectCurrency('USD')}
              className={`w-full text-left px-4 py-3 rounded-lg ${selectedCurrency === 'USD' ? 'bg-[#2a2a2a]' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-white text-sm">USD</span>
                {selectedCurrency === 'USD' && <Check className="w-4 h-4 text-white" />}
              </div>
            </button>
          </div>
          {/* More Currencies */}
          <div>
            <div className="text-[#71757f] text-xs mb-2">More</div>
            <div className="grid grid-cols-3 gap-2">
              {currencies.filter(c => c.code !== 'USD').map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => onSelectCurrency(currency.code)}
                  className={`px-4 py-3 rounded-lg text-center ${
                    selectedCurrency === currency.code ? 'bg-[#2a2a2a] border border-white' : 'bg-[#1a1a1a]'
                  }`}
                >
                  <span className="text-white text-sm">{currency.code}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function BybitDashboard() {
  const router = useRouter();
  const [showBalance, setShowBalance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [navLoading, setNavLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Hot');
  const [activeSubTab, setActiveSubTab] = useState('Spot');
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showFiatModal, setShowFiatModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectedFiat, setSelectedFiat] = useState('EUR');
  const [activeNotifTab, setActiveNotifTab] = useState('All');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = useState(false);

  // User profile state
  const [userEmail, setUserEmail] = useState('');
  const [userEmailFirstLetter, setUserEmailFirstLetter] = useState('A');

  // Selected currency state - persistent
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  // User balance state
  const [totalBalance, setTotalBalance] = useState(0);
  const [todayPnL, setTodayPnL] = useState(0);

  // Market prices state - DIRECT from Bybit
  const [prices, setPrices] = useState<Record<string, any>>({});
  const [pricesLoading, setPricesLoading] = useState(true);

  // Get fiat rate
  const fiatRate = getCurrencyRate(selectedCurrency);

  // Convert USD to selected fiat
  const convertToFiat = (usdAmount: number) => {
    return formatWithCommas(usdAmount * fiatRate, 2);
  };

  // Load saved currency from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (savedCurrency) {
      setSelectedCurrency(savedCurrency);
    }
  }, []);

  // Handle currency selection
  const handleCurrencySelect = (code: string) => {
    setSelectedCurrency(code);
    localStorage.setItem(CURRENCY_STORAGE_KEY, code);
    setShowCurrencyModal(false);
  };

  // ✅ FIXED: Fetch market prices DIRECTLY from Bybit API
  const fetchMarketPrices = async () => {
    try {
      console.log('🔄 [BybitDashboard] Fetching market prices from Bybit...');
      const response = await fetch('https://api.bybit.com/v5/market/tickers?category=spot', {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`Bybit API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.retCode === 0 && data.result?.list) {
        const pricesMap: Record<string, any> = {};
        
        data.result.list.forEach((ticker: any) => {
          const symbol = ticker.symbol.replace('USDT', '').replace('USDC', '');
          pricesMap[symbol] = {
            price: parseFloat(ticker.lastPrice || '0'),
            change24h: parseFloat(ticker.price24hPcnt || '0') * 100,
            volume24h: parseFloat(ticker.volume24h || '0'),
            high24h: parseFloat(ticker.highPrice24h || '0'),
            low24h: parseFloat(ticker.lowPrice24h || '0'),
          };
        });
        
        setPrices(pricesMap);
        console.log('✅ [BybitDashboard] Market prices loaded:', Object.keys(pricesMap).length, 'pairs');
      }
      setPricesLoading(false);
    } catch (error) {
      console.error('❌ [BybitDashboard] Error fetching market prices:', error);
      setPricesLoading(false);
    }
  };

  // Transform prices to crypto data array
  const cryptoData = Object.entries(prices)
    .filter(([symbol]) => !['USDT', 'USDC', 'USCT', 'DAI', 'BUSD'].includes(symbol))
    .map(([symbol, data]) => ({
      symbol: `${symbol}USDT`,
      coin: symbol,
      price: data.price,
      change: data.change24h,
      volume: data.volume24h,
      high24h: data.high24h,
      low24h: data.low24h,
    }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 20);

  const banners = [
    { id: 1, image: '/Events/event1.png', title: 'Trade Smarter', subtitle: "Your Daily Pulse is ready. Let's check today's key market moves", category: 'Trade Smarter' },
    { id: 2, image: '/Events/event2.png', title: '2025 Recap', subtitle: 'Share and win up to 100 MNT!', category: 'Event' },
    { id: 3, image: '/Events/event3.png', title: 'Bybit Alpha Farm', subtitle: 'Join and earn 10 USDT in rewards', category: 'Events' },
    { id: 4, image: '/Events/event4.png', title: 'Master the Trade', subtitle: 'Win up to 1,000 USDT!', category: 'Events' },
    { id: 5, image: '/Events/event5.png', title: 'Christmas Season', subtitle: 'Earn from a 25,000 USDT prize pool', category: 'Fiat & Pay' },
    { id: 6, image: '/Events/event6.png', title: 'Predict MNT', subtitle: 'Make your prediction now', category: 'Events' }
  ];
  
  // Fetch user profile with improved error handling
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      console.log('🔍 [BybitDashboard] Token check:', token ? '✅ Token exists' : '❌ No token');
      
      if (!token) {
        console.error('❌ [BybitDashboard] No token found - redirecting to login');
        router.push('/Home-Login');
        return;
      }

      console.log('📡 [BybitDashboard] Fetching profile from:', window.location.origin + '/api/user/profile');
      
      const response = await fetch('/api/user/profile', {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });

      console.log('📥 [BybitDashboard] Profile response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ [BybitDashboard] Profile API Error:', errorData);
        
        if (response.status === 401) {
          console.error('❌ [BybitDashboard] Unauthorized - token invalid');
          localStorage.removeItem('auth_token');
          router.push('/Home-Login');
          return;
        }
        
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ [BybitDashboard] Profile loaded:', data);
      
      if (data.success && data.user) {
        const email = data.user.email || data.user.emailMasked || '';
        setUserEmail(email);
        if (email && email.length > 0) {
          setUserEmailFirstLetter(email[0].toUpperCase());
        }
      }
    } catch (error: any) {
      console.error('💥 [BybitDashboard] Profile fetch failed:', error);
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error('🌐 [BybitDashboard] Network error - Is your backend running?');
        console.error('Check: http://localhost:3000/api/user/profile');
      }
    }
  };

  // Fetch user balance with improved error handling
  const fetchUserBalance = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      console.log('🔍 [BybitDashboard] Balance - Token check:', token ? '✅ Exists' : '❌ Missing');
      
      if (!token) {
        console.error('❌ [BybitDashboard] No token for balance fetch');
        return;
      }

      console.log('📡 [BybitDashboard] Fetching balance from:', window.location.origin + '/api/user/balances');

      const response = await fetch('/api/user/balances', {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });

      console.log('📥 [BybitDashboard] Balance response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ [BybitDashboard] Balance API Error:', errorData);
        
        if (response.status === 401) {
          console.error('❌ [BybitDashboard] Unauthorized - redirecting');
          localStorage.removeItem('auth_token');
          router.push('/Home-Login');
          return;
        }
        
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ [BybitDashboard] Balance loaded:', data);
      
      if (data.success) {
        setTotalBalance(data.summary?.totalUsdValue || 0);
        setTodayPnL(data.summary?.todayPnL || 0);
      }
    } catch (error: any) {
      console.error('💥 [BybitDashboard] Balance fetch failed:', error);
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error('🌐 [BybitDashboard] Network error - Is your backend running?');
        console.error('Check: http://localhost:3000/api/user/balances');
      }
    }
  };

  useEffect(() => {
    // Initial load with proper async handling
    const init = async () => {
      console.log('🚀 [BybitDashboard] Initializing...');
      await Promise.all([
        fetchUserProfile(), 
        fetchUserBalance(), 
        fetchMarketPrices() // ✅ FIXED: Now fetches directly from Bybit
      ]);
      setLoading(false);
      console.log('✅ [BybitDashboard] Initialization complete');
    };
    
    init();
    
    // Banner rotation
    const bannerInterval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentBannerIndex(prev => (prev + 1) % banners.length);
        setIsTransitioning(false);
      }, 150);
    }, 3000);

    // Refresh balance every 30 seconds
    const balanceInterval = setInterval(() => {
      console.log('🔄 [BybitDashboard] Auto-refreshing balance...');
      fetchUserBalance();
    }, 30000);

    // ✅ FIXED: Refresh market prices every 3 seconds (real-time feel)
    const pricesInterval = setInterval(() => {
      console.log('🔄 [BybitDashboard] Auto-refreshing market prices...');
      fetchMarketPrices();
    }, 3000);
    
    return () => {
      clearInterval(bannerInterval);
      clearInterval(balanceInterval);
      clearInterval(pricesInterval); // ✅ Clean up prices interval
    };
  }, []);

  // Camera setup for QR scanner
  useEffect(() => {
    if (showQRScanner && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error('Camera error:', err);
          setCameraError(true);
        });
    }
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [showQRScanner]);

  const navigateWithLoading = (path: string) => {
    setNavLoading(true);
    setTimeout(() => {
      router.push(path);
    }, 500);
  };

  const handleHomeClick = () => {
    setNavLoading(true);
    setTimeout(() => {
      setNavLoading(false);
    }, 1500);
  };

  const handleDepositClick = () => {
    setShowDepositModal(true);
  };

  const filteredNotifications = activeNotifTab === 'All' 
    ? notifications 
    : notifications.filter(n => n.category === activeNotifTab);

  const promoCards = [
    { title: "Daily Treasure Hunt", subtitle: "Join the Daily Treasure Hunt & grab your share of 860,000 USDT!", endDate: "2025-12-25", image: "treasure" },
    { title: "Predict MNT price", subtitle: "Up or down? Make your call and win from a 250,000 USDT airdrop!", endDate: "2025-12-28", image: "predict" },
    { title: "Stake USDT to earn 666% APR with BTC!", subtitle: "Stake USDT to earn 666% APR with BTC!", endDate: "2026-01-08", image: "stake" },
  ];

  // Loading Spinner
  const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-[#f7a600] border-t-transparent rounded-full animate-spin" style={{ borderWidth: '3px' }}></div>
        <span className="text-white text-sm">Loading...</span>
      </div>
    </div>
  );

  const SkeletonLoader = () => (
    <div className="animate-pulse space-y-6 px-4">
      <div className="space-y-3">
        <div className="h-4 bg-[#1a1a1a] rounded w-32"></div>
        <div className="h-8 bg-[#1a1a1a] rounded w-48"></div>
      </div>
      <div className="grid grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-[#1a1a1a] rounded-full"></div>
            <div className="h-3 bg-[#1a1a1a] rounded w-16"></div>
          </div>
        ))}
      </div>
      <div className="h-24 bg-[#1a1a1a] rounded-lg"></div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-[#1a1a1a] rounded-lg"></div>
        ))}
      </div>
    </div>
  );

  // Continue with JSX/UI Render in Part 3
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white pb-20">
      {navLoading && <LoadingSpinner />}
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0d0d0d] border-b border-[#1a1a1a]">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Profile Icon - Shows user email first letter with silver gradient */}
            <button 
              onClick={() => navigateWithLoading('/ProfileDashboard')}
              className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #e8e8e8 0%, #a8a8a8 50%, #c0c0c0 100%)' }}
            >
              <span className="text-[#333] font-bold text-sm">{userEmailFirstLetter}</span>
            </button>
            <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-3 py-2 w-64">
              <Search className="w-4 h-4 text-[#71757f]" />
              <input
                type="text"
                placeholder="USDE/USDT"
                className="bg-transparent border-none outline-none text-sm w-full text-white"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowQRScanner(true)}
              className="p-2 hover:bg-[#1a1a1a] rounded-lg"
            >
              <ScanLine className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowNotifications(true)}
              className="relative p-2 hover:bg-[#1a1a1a] rounded-lg"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {loading || pricesLoading ? (
        <div className="py-6">
          <SkeletonLoader />
        </div>
      ) : (
        <main className="px-4 py-6 max-w-md mx-auto">
          {/* Balance Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[#71757f] text-sm">Total Assets</span>
                <button onClick={() => setShowBalance(!showBalance)}>
                  {showBalance ? <Eye className="w-4 h-4 text-[#71757f]" /> : <EyeOff className="w-4 h-4 text-[#71757f]" />}
                </button>
              </div>
              <button 
                onClick={handleDepositClick}
                className="bg-[#f7a600] text-black px-6 py-2 rounded-lg font-medium hover:bg-[#e09500]"
              >
                Deposit
              </button>
            </div>
            {/* Total Balance - shows in selected fiat currency */}
            <div className="text-3xl font-bold mb-1">
              {showBalance ? `${convertToFiat(totalBalance)} ${selectedCurrency}` : '********'}
            </div>
            {/* Today's P&L - Click to open currency modal */}
            <button 
              onClick={() => setShowCurrencyModal(true)}
              className="flex items-center gap-2 text-[#71757f] text-sm hover:text-white transition-colors"
            >
              <span>Today&apos;s P&L</span>
              <span>{showBalance ? `${convertToFiat(todayPnL)} ${selectedCurrency}` : '*****'}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <button className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center">
                <span className="text-xl">🔄</span>
              </div>
              <span className="text-xs text-[#71757f]">P2P Trading</span>
            </button>
            <button className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center">
                <span className="text-xl">🧩</span>
              </div>
              <span className="text-xs text-[#71757f]">Puzzle Hunt</span>
            </button>
            <button className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center">
                <span className="text-xl">🔄</span>
              </div>
              <span className="text-xs text-[#71757f]">Convert</span>
            </button>
            <button className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center">
                <span className="text-xl">7️⃣</span>
              </div>
              <span className="text-xs text-[#71757f]">7UpBybit</span>
            </button>
            <button className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center">
                <span className="text-xl">⋯</span>
              </div>
              <span className="text-xs text-[#71757f]">More</span>
            </button>
          </div>

          {/* Banner Carousel */}
          <div className="relative bg-[#1a1a1a] rounded-lg overflow-hidden mb-6">
            <div className={`transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              <div className="h-40 overflow-hidden bg-[#0d0d0d] rounded-t-lg">
                <img 
                  src={banners[currentBannerIndex].image}
                  alt={banners[currentBannerIndex].title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <div className="flex items-center gap-3 p-4">
                <div className="flex-1">
                  <div className="text-xs text-[#71757f] mb-1">{banners[currentBannerIndex].category}</div>
                  <div className="text-sm font-medium mb-2">{banners[currentBannerIndex].subtitle}</div>
                  <button className="flex items-center gap-1 text-[#f7a600] text-sm">
                    Explore Now <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-[#4a4e59] text-sm">{currentBannerIndex + 1}/6</div>
              </div>
            </div>
            <div className="flex justify-center gap-1 pb-3">
              {banners.map((_, index) => (
                <div 
                  key={index} 
                  className={`h-1.5 rounded-full transition-all duration-150 ${
                    index === currentBannerIndex ? 'bg-[#f7a600] w-4' : 'bg-[#2a2a2a] w-1.5'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-4 border-b border-[#1a1a1a] overflow-x-auto">
            {['Favorites', 'Hot', 'New', 'Gainers', 'Losers', 'Turnover'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 text-sm font-medium whitespace-nowrap ${
                  activeTab === tab ? 'border-b-2 border-[#f7a600] text-white' : 'text-[#71757f]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Sub Tabs */}
          <div className="flex gap-3 mb-4 overflow-x-auto">
            {['Spot', 'Alpha 🔥', 'Derivatives', 'TradFi'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                  activeSubTab === tab ? 'bg-[#1a1a1a] text-white' : 'text-[#71757f]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Crypto List - Real-time prices */}
          <div className="space-y-2 mb-6">
            {cryptoData.map((crypto) => (
              <div 
                key={crypto.symbol} 
                className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg hover:bg-[#252525] cursor-pointer"
                onClick={() => navigateWithLoading(`/TradeDashboard?pair=${crypto.symbol}`)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <CoinIcon symbol={crypto.coin} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {crypto.coin} <span className="text-[#71757f] text-sm">/ USDT</span>
                    </div>
                    <div className="text-xs text-[#4a4e59]">{formatVolume(crypto.volume)}</div>
                  </div>
                  <span className="px-2 py-0.5 bg-[#252525] text-[#71757f] text-xs rounded flex-shrink-0">10x</span>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <div className="font-medium text-white">{formatPrice(crypto.price)}</div>
                  <div className={`text-xs font-bold px-2 py-1 rounded ${
                    crypto.change >= 0 
                      ? 'text-white bg-green-500' 
                      : 'text-white bg-red-500'
                  }`}>
                    {crypto.change >= 0 ? '+' : ''}{crypto.change.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
		  
		  {/* More Button */}
          <button className="w-full py-3 text-center text-[#f7a600] hover:text-[#e09500] flex items-center justify-center gap-2 mb-6">
            More <ChevronRight className="w-4 h-4" />
          </button>

          {/* Token Splash & Puzzle Hunt */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-[#1a1a1a] rounded-lg p-4">
              <div className="text-xs text-[#71757f] mb-2">Token Splash</div>
              <div className="font-bold mb-3">Earn 200,000 BARD</div>
              <button className="flex items-center gap-1 text-[#9ca3af] text-sm">
                <span className="w-6 h-6 bg-[#252525] rounded-full flex items-center justify-center text-white text-xs">B</span>
                BARD <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-4">
              <div className="text-xs text-[#71757f] mb-2">Puzzle Hunt</div>
              <div className="font-bold mb-3">Earn 3,000,000 MON</div>
              <button className="flex items-center gap-1 text-[#9ca3af] text-sm">
                <span className="w-6 h-6 bg-[#252525] rounded-full flex items-center justify-center text-white text-xs">M</span>
                MON <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Promotional Cards */}
          <div className="space-y-4 mb-6">
            {promoCards.map((card, index) => (
              <div key={index} className="rounded-lg overflow-hidden bg-[#1a1a1a]">
                <div className="h-32 flex items-center justify-center relative bg-[#0d0d0d]">
                  <div className="text-4xl opacity-50">
                    {card.image === 'treasure' && '💎'}
                    {card.image === 'predict' && '🎯'}
                    {card.image === 'stake' && '₿'}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold mb-1">{card.title}</h3>
                  <p className="text-sm text-[#9ca3af] mb-2">{card.subtitle}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#71757f]">Ends on {card.endDate}</span>
                    <button className="px-4 py-1.5 bg-[#252525] rounded-lg text-sm hover:bg-[#333]">Join</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0d0d0d] border-t border-[#1a1a1a] z-50">
        <div className="flex justify-around items-center py-2 max-w-md mx-auto">
          <button onClick={handleHomeClick} className="flex flex-col items-center gap-1">
            <div className="w-6 h-6 flex items-center justify-center">
              <Home className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-[10px] text-white">Home</span>
          </button>
          <button onClick={() => navigateWithLoading('/MarketsDashboard')} className="flex flex-col items-center gap-1">
            <div className="w-6 h-6 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-[#71757f]" />
            </div>
            <span className="text-[10px] text-[#71757f]">Markets</span>
          </button>
          <button onClick={() => navigateWithLoading('/TradeDashboard')} className="flex flex-col items-center gap-1">
            <div className="w-6 h-6 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 text-[#71757f]" />
            </div>
            <span className="text-[10px] text-[#71757f]">Trade</span>
          </button>
          <button onClick={() => navigateWithLoading('/EarnDashboard')} className="flex flex-col items-center gap-1">
            <div className="w-6 h-6 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#71757f]" />
            </div>
            <span className="text-[10px] text-[#71757f]">Earn</span>
          </button>
          <button onClick={() => navigateWithLoading('/AssetsDashboard')} className="flex flex-col items-center gap-1">
            <div className="w-6 h-6 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-[#71757f]" />
            </div>
            <span className="text-[10px] text-[#71757f]">Assets</span>
          </button>
        </div>
      </nav>

      {/* Currency Selection Modal */}
      <CurrencySelectionModal
        isOpen={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)}
        selectedCurrency={selectedCurrency}
        onSelectCurrency={handleCurrencySelect}
      />

      {/* Deposit Modal */}
      <DepositModal 
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        selectedFiat={selectedFiat}
        onFiatChange={() => setShowFiatModal(true)}
      />

      {/* Notification Modal */}
      {showNotifications && (
        <div className="fixed inset-0 bg-[#0d0d0d] z-[60] flex flex-col">
          <div className="flex items-center justify-between px-4 py-4 border-b border-[#1a1a1a]">
            <button onClick={() => setShowNotifications(false)} className="text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-white">Notification</h1>
            <div className="w-6"></div>
          </div>

          <div className="flex gap-2 px-4 py-3 overflow-x-auto border-b border-[#1a1a1a]">
            {notifTabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveNotifTab(tab.name)}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap flex items-center gap-1 ${
                  activeNotifTab === tab.name ? 'bg-white text-black' : 'text-[#71757f]'
                }`}
              >
                {tab.name}
                {tab.count && <span className="text-xs">{tab.count}</span>}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.map((notif) => (
              <div key={notif.id} className="px-4 py-4 border-b border-[#1a1a1a]">
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-[#f7a600] rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium mb-2">{notif.title}</h3>
                    <p className="text-[#9ca3af] text-sm whitespace-pre-line mb-3">{notif.content}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-[#71757f] text-xs">{notif.date}</span>
                      <span className="bg-[#1a1a1a] text-[#9ca3af] text-xs px-2 py-1 rounded">{notif.tag}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <div className="fixed inset-0 bg-black z-[60] flex flex-col">
          <div className="flex items-center px-4 py-4">
            <button onClick={() => setShowQRScanner(false)} className="text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-white flex-1 text-center mr-8">Scan QR Code</h1>
          </div>

          <div className="flex-1 relative flex items-center justify-center">
            {cameraError ? (
              <div className="text-center text-white">
                <p className="mb-4">Camera access denied or not available</p>
                <button 
                  onClick={() => setShowQRScanner(false)}
                  className="bg-[#f7a600] text-black px-6 py-2 rounded-lg"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="relative w-64 h-64 z-10">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                  <div className="absolute left-0 right-0 h-0.5 bg-[#f7a600] animate-scan"></div>
                </div>
                <p className="absolute bottom-1/3 text-white text-center">Scan QR code</p>
              </>
            )}
          </div>

          <div className="flex justify-around py-8">
            <button className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 bg-[#1a1a1a] rounded-full flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
              <span className="text-white text-sm">Photos</span>
            </button>
            <button className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 bg-[#1a1a1a] rounded-full flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </div>
              <span className="text-white text-sm">Enter Code</span>
            </button>
            <button className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 bg-[#1a1a1a] rounded-full flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <rect x="7" y="7" width="3" height="3" />
                  <rect x="14" y="7" width="3" height="3" />
                  <rect x="7" y="14" width="3" height="3" />
                  <rect x="14" y="14" width="3" height="3" />
                </svg>
              </div>
              <span className="text-white text-sm">My QR Code</span>
            </button>
          </div>

          <style jsx>{`
            @keyframes scan {
              0%, 100% { top: 0; }
              50% { top: calc(100% - 2px); }
            }
            .animate-scan {
              animation: scan 2s linear infinite;
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
