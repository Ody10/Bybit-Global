//app/AssetsDashboard/page.tsx - PART 1 OF 2

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Home, BarChart2, Activity, DollarSign, Wallet, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, RefreshCw, ChevronDown, ChevronRight, Eye, EyeOff, List, Clock, HelpCircle, X, Check, Search, ChevronUp } from 'lucide-react';

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

const fiatCurrencies = currencies.map(c => ({
  code: c.code,
  name: c.name,
  color: '#4CAF50',
}));

interface Balance {
  currency: string;
  chain?: string;
  network?: string;
  totalBalance: number;
  available: number;
  locked: number;
  frozen: number;
  usdValue: number;
  price?: number;
  chains?: any[];
}

interface UserProfile {
  uid: string;
  emailMasked: string;
  email: string;
  avatar: string | null;
}

// Format with commas
const formatWithCommas = (value: number, decimals: number = 2): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

// Format crypto balance
const formatCryptoBalance = (balance: number): string => {
  if (balance === 0) return '0';
  if (balance < 0.0001) return balance.toFixed(10).replace(/\.?0+$/, '');
  if (balance < 1) return balance.toFixed(8).replace(/\.?0+$/, '');
  if (balance < 1000) return balance.toFixed(6).replace(/\.?0+$/, '');
  return formatWithCommas(balance, 2);
};

// Get fiat rate
const getCurrencyRate = (code: string): number => {
  const currency = currencies.find(c => c.code === code);
  return currency?.rate || 1;
};

// Coin Icon Component
const CoinIcon = ({ symbol, size = 32 }: { symbol: string; size?: number }) => {
  const [imgError, setImgError] = useState(false);
  
  const getColor = (sym: string) => {
    const colors: Record<string, string> = {
      BTC: '#F7931A', ETH: '#627EEA', USDT: '#26A17B', USDC: '#2775CA',
      USCT: '#00D4AA', BNB: '#F3BA2F', XRP: '#23292F', SOL: '#9945FF',
      ADA: '#0033AD', DOGE: '#C2A633', DOT: '#E6007A', MATIC: '#8247E5',
    };
    return colors[sym] || '#888888';
  };
  
  if (imgError) {
    return (
      <div 
        className="rounded-full flex items-center justify-center"
        style={{ backgroundColor: getColor(symbol), width: size, height: size }}
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

// Switch Account Modal
const SwitchAccountModal = ({
  isOpen,
  onClose,
  userProfile,
  fundingTotal,
  unifiedTradingTotal,
  totalUsdValue,
  btcValue,
  selectedCurrency,
  showBalance,
  onManageClick,
  onCreateClick,
}: {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  fundingTotal: number;
  unifiedTradingTotal: number;
  totalUsdValue: number;
  btcValue: number;
  selectedCurrency: string;
  showBalance: boolean;
  onManageClick: () => void;
  onCreateClick: () => void;
}) => {
  const [expanded, setExpanded] = useState(true);
  const fiatRate = getCurrencyRate(selectedCurrency);
  
  const convertToFiat = (usdAmount: number) => {
    return formatWithCommas(usdAmount * fiatRate, 2);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center">
      <div className="w-full max-w-md bg-[#1a1a1a] rounded-t-3xl max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
          <h2 className="text-white text-lg font-semibold">Switch/Create Account</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="p-4 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white text-3xl font-bold">
              {showBalance ? convertToFiat(totalUsdValue) : '********'}
            </span>
            <span className="text-[#71757f] text-sm flex items-center gap-1">
              {selectedCurrency}
              <ChevronDown className="w-3 h-3" />
            </span>
          </div>
          <div className="flex items-center gap-1 text-[#71757f] text-sm">
            <span>≈ {showBalance ? btcValue.toFixed(8) : '********'} BTC</span>
            <HelpCircle className="w-3 h-3" />
          </div>
        </div>

        <div className="p-4">
          <div className="text-[#71757f] text-sm mb-3">Main Account</div>
          
          <div className="bg-[#252525] rounded-xl p-4 mb-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e8e8e8] to-[#a8a8a8] flex items-center justify-center">
                  <span className="text-[#333] text-sm font-bold">
                    {userProfile?.emailMasked?.[0]?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div>
                  <div className="text-white text-sm font-medium">{userProfile?.emailMasked || 'user***@****'}</div>
                  <div className="text-[#71757f] text-xs">UID: {userProfile?.uid || '000000000'}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[#f7a600] text-xs mb-1">In Use</div>
                <div className="text-white text-sm font-medium">
                  {showBalance ? `${convertToFiat(totalUsdValue)} ${selectedCurrency}` : '******'}
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setExpanded(!expanded)}
              className="w-full"
            >
              {expanded && (
                <div className="space-y-2 mb-3 border-t border-[#3a3a3a] pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#71757f] text-sm">Funding</span>
                    <span className="text-white text-sm">
                      {showBalance ? `${convertToFiat(fundingTotal)} ${selectedCurrency}` : '******'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#71757f] text-sm">Unified Trading Account</span>
                    <span className="text-white text-sm">
                      {showBalance ? `${convertToFiat(unifiedTradingTotal)} ${selectedCurrency}` : '******'}
                    </span>
                  </div>
                </div>
              )}
              <div className="flex justify-center">
                {expanded ? (
                  <ChevronUp className="w-5 h-5 text-[#71757f]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#71757f]" />
                )}
              </div>
            </button>
          </div>

          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 mb-4 relative">
              <div className="w-16 h-12 bg-[#3a3a3a] rounded-lg absolute top-2 left-2"></div>
              <div className="w-6 h-8 bg-[#f7a600] rounded absolute bottom-0 right-2"></div>
            </div>
            <span className="text-[#71757f] text-sm">No Subaccount Created</span>
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t border-[#2a2a2a]">
          <button 
            onClick={onManageClick}
            className="flex-1 py-3 bg-[#2a2a2a] rounded-full text-white font-semibold hover:bg-[#353535] transition-colors"
          >
            Manage
          </button>
          <button 
            onClick={onCreateClick}
            className="flex-1 py-3 bg-[#f7a600] rounded-full text-black font-semibold hover:bg-[#e09500] transition-colors"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

// Deposit Modal
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

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center pt-16">
      <div className="w-full max-w-md bg-[#1a1a1a] rounded-2xl max-h-[85vh] overflow-hidden mx-4">
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
          <h2 className="text-white text-lg font-semibold">Select Payment Method</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="overflow-y-auto p-4">
          <div className="mb-4">
            <div className="text-[#71757f] text-sm mb-3">Don&apos;t have crypto</div>
            
            <button 
              onClick={() => { onClose(); router.push('/CoinDepositDashboard'); }}
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
              onClick={() => { onClose(); router.push('/BybitPayDashboard'); }}
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

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#71757f] text-sm">Buy Crypto with Fiat</span>
              <button 
                onClick={onFiatChange}
                className="flex items-center gap-1 bg-[#2a2a2a] rounded px-2 py-1 hover:bg-[#353535] transition-colors"
              >
                <span className="text-white text-xs">{selectedFiat}</span>
                <ChevronDown className="w-3 h-3 text-white" />
              </button>
            </div>

            <button 
              onClick={() => { onClose(); router.push('/P2P-Dashboard'); }}
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
              onClick={() => { onClose(); router.push('/FiatDashboard'); }}
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
              onClick={() => { onClose(); router.push('/Fiat-Currency-Dashboard'); }}
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

// PART 2 OF 2 - Main Component (paste this after Part 1)

export default function AssetsDashboard() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [navLoading, setNavLoading] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState('Asset');
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showFiatCurrencyModal, setShowFiatCurrencyModal] = useState(false);
  const [showSwitchAccountModal, setShowSwitchAccountModal] = useState(false);
  const [fiatSearchQuery, setFiatSearchQuery] = useState('');

  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedFiatCurrency, setSelectedFiatCurrency] = useState('EUR');

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [fundingTotal, setFundingTotal] = useState(0);
  const [unifiedTradingTotal, setUnifiedTradingTotal] = useState(0);
  const [totalUsdValue, setTotalUsdValue] = useState(0);
  const [btcValue, setBtcValue] = useState(0);

  // Load saved currency
  useEffect(() => {
    const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (saved) setSelectedCurrency(saved);
  }, []);

  const fiatRate = getCurrencyRate(selectedCurrency);

  const convertToFiat = (usdAmount: number) => {
    return formatWithCommas(usdAmount * fiatRate, 2);
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('No auth token found');
        return;
      }

      const response = await fetch('/api/user/profile', {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Profile data:', data);
        
        if (data.success && data.user) {
          setUserProfile({
            uid: data.user.uid,
            emailMasked: data.user.emailMasked,
            email: data.user.email,
            avatar: data.user.avatar,
          });
        }
      } else {
        const errorData = await response.json();
        console.error('Profile fetch failed:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Fetch balances
  const fetchBalances = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('No auth token for balances');
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
          setBalances(data.balances || []);
          setFundingTotal(data.summary?.fundingUsdValue || 0);
          setUnifiedTradingTotal(data.summary?.unifiedTradingUsdValue || 0);
          setTotalUsdValue(data.summary?.totalUsdValue || 0);
          setBtcValue(data.summary?.btcValue || 0);
        }
      } else {
        const errorData = await response.json();
        console.error('Balance fetch failed:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchUserProfile(), fetchBalances()]);
      setLoading(false);
    };
    init();
    
    const interval = setInterval(fetchBalances, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCurrencySelect = (code: string) => {
    setSelectedCurrency(code);
    localStorage.setItem(CURRENCY_STORAGE_KEY, code);
    setShowCurrencyModal(false);
  };

  const handleCoinClick = (symbol: string) => {
    router.push(`/Asset-Coin?symbol=${symbol}`);
  };

  const handleHistoryClick = () => {
    router.push('/CoinDepositDashboard/AssetHistory');
  };

  const navigateWithLoading = (path: string) => {
    setNavLoading(true);
    setTimeout(() => router.push(path), 500);
  };

  const handleManageSubaccount = () => {
    setShowSwitchAccountModal(false);
    router.push('/SubaccountDashboard');
  };

  const handleCreateSubaccount = () => {
    setShowSwitchAccountModal(false);
    router.push('/CreateSubaccount');
  };

  if (loading || navLoading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#f7a600] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white pb-20">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => setShowSwitchAccountModal(true)}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #e8e8e8 0%, #a8a8a8 50%, #c0c0c0 100%)' }}
            >
              <span className="text-[#333] text-sm font-bold">
                {userProfile?.emailMasked?.[0]?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-white text-sm">{userProfile?.emailMasked || 'user***@****'}</span>
              <ChevronDown className="w-4 h-4 text-white" />
            </div>
          </button>
          <button 
            onClick={handleHistoryClick}
            className="w-8 h-8 border border-[#2a2a2a] rounded flex items-center justify-center hover:bg-[#1a1a1a] transition-colors"
          >
            <List className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Balance Section */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[#71757f] text-sm">Total Assets</span>
            <button onClick={() => setShowBalance(!showBalance)}>
              {showBalance ? <Eye className="w-4 h-4 text-[#71757f]" /> : <EyeOff className="w-4 h-4 text-[#71757f]" />}
            </button>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="text-white text-3xl font-bold">
              {showBalance ? convertToFiat(totalUsdValue) : '********'}
            </div>
            <button 
              onClick={() => setShowCurrencyModal(true)}
              className="flex items-center gap-1 bg-[#1a1a1a] rounded px-2 py-1"
            >
              <span className="text-white text-xs font-medium">{selectedCurrency}</span>
              <ChevronDown className="w-3 h-3 text-white" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#71757f] text-xs">
              ≈ {showBalance ? btcValue.toFixed(8) : '********'} BTC
            </span>
            <HelpCircle className="w-3 h-3 text-[#71757f]" />
            <span className="text-[#71757f] text-xs">Today&apos;s P&L</span>
            <span className="text-[#71757f] text-xs">
              {showBalance ? `0.00 ${selectedCurrency}(0%)` : '******'}
            </span>
            <ChevronRight className="w-3 h-3 text-[#71757f]" />
          </div>
        </div>

        {/* Available / In Use */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-[#1a1a1a] rounded-lg p-3">
            <div className="text-[#71757f] text-xs mb-1">Available balance</div>
            <div className="text-white text-base font-semibold">
              {showBalance ? `${convertToFiat(fundingTotal)} ${selectedCurrency}` : '******'}
            </div>
          </div>
          <div className="flex-1 bg-[#1a1a1a] rounded-lg p-3">
            <div className="text-[#71757f] text-xs mb-1">In Use</div>
            <div className="text-white text-base font-semibold">
              {showBalance ? `${convertToFiat(unifiedTradingTotal)} ${selectedCurrency}` : '******'}
            </div>
          </div>
        </div>

        {/* Card Banner */}
        <div className="bg-gradient-to-r from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white text-sm font-medium mb-1">Card</div>
              <div className="flex items-center gap-2">
                <span className="text-[#71757f] text-xs">Apply Now!</span>
                <div className="w-5 h-5 bg-[#f7a600] rounded-full flex items-center justify-center">
                  <ChevronRight className="w-3 h-3 text-black" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button onClick={() => setShowDepositModal(true)} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-[#f7a600] rounded-full flex items-center justify-center">
              <ArrowDownLeft className="w-6 h-6 text-black" />
            </div>
            <span className="text-white text-xs">Deposit</span>
          </button>
          <button onClick={() => navigateWithLoading('/selectCoinDashboard')} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-[#2a2a2a] rounded-full flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xs">Withdraw</span>
          </button>
          <button onClick={() => navigateWithLoading('/TransferDashboard')} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-[#2a2a2a] rounded-full flex items-center justify-center">
              <ArrowLeftRight className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xs">Transfer</span>
          </button>
          <button onClick={() => navigateWithLoading('/ConvertDashboard')} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-[#2a2a2a] rounded-full flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xs">Convert</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-[#1e1e1e] mb-4">
          <button
            onClick={() => setActiveTab('Account')}
            className={`pb-3 text-sm font-semibold relative ${activeTab === 'Account' ? 'text-white' : 'text-[#71757f]'}`}
          >
            Account
            {activeTab === 'Account' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>}
          </button>
          <button
            onClick={() => setActiveTab('Asset')}
            className={`pb-3 text-sm font-semibold relative ${activeTab === 'Asset' ? 'text-white' : 'text-[#71757f]'}`}
          >
            Asset
            {activeTab === 'Asset' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>}
          </button>
          <button 
            onClick={handleHistoryClick} 
            className="ml-auto pb-3 hover:opacity-80 transition-opacity"
          >
            <Clock className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Account Tab */}
        {activeTab === 'Account' && (
          <div className="space-y-1">
            <button 
              onClick={() => navigateWithLoading('/FundingDashboard')}
              className="w-full flex items-center justify-between py-4 hover:bg-[#1a1a1a] rounded-lg px-2"
            >
              <div className="flex-1">
                <div className="text-white text-sm font-medium mb-1 text-left">Funding</div>
                <div className="text-[#9ea1a8] text-xs text-left">
                  {showBalance ? `${convertToFiat(fundingTotal)} ${selectedCurrency}` : '******'}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#71757f]" />
            </button>

            <button 
              onClick={() => navigateWithLoading('/Unified-Trading-Dashboard')}
              className="w-full flex items-center justify-between py-4 hover:bg-[#1a1a1a] rounded-lg px-2"
            >
              <div className="flex-1">
                <div className="text-white text-sm font-medium mb-1 text-left">Unified Trading</div>
                <div className="text-[#9ea1a8] text-xs text-left">
                  {showBalance ? `${convertToFiat(unifiedTradingTotal)} ${selectedCurrency}` : '******'}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#71757f]" />
            </button>
          </div>
        )}

        {/* Asset Tab */}
        {activeTab === 'Asset' && (
          <div className="space-y-1">
            {balances.length > 0 ? (
              balances.map((balance, index) => {
                const fiatValue = balance.usdValue * fiatRate;
                
                return (
                  <button
                    key={`${balance.currency}-${index}`}
                    onClick={() => handleCoinClick(balance.currency)}
                    className="w-full flex items-center justify-between py-4 hover:bg-[#1a1a1a] rounded-lg px-2 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <CoinIcon symbol={balance.currency} size={36} />
                      <div className="text-left">
                        <div className="text-white text-sm font-medium">{balance.currency}</div>
                        <div className="text-[#71757f] text-xs">
                          Available: {showBalance ? formatCryptoBalance(balance.available) : '****'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-sm font-medium">
                        {showBalance ? formatCryptoBalance(balance.totalBalance) : '****'}
                      </div>
                      <div className="text-[#71757f] text-xs">
                        ≈ {showBalance ? `${formatWithCommas(fiatValue, 2)} ${selectedCurrency}` : '****'}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center text-[#71757f] text-sm py-8">
                No assets to display
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0d0d0d] border-t border-[#1e1e1e] z-40">
        <div className="flex items-center justify-around py-2">
          <button onClick={() => navigateWithLoading('/BybitDashboard')} className="flex flex-col items-center gap-0.5 text-[#71757f]">
            <Home className="w-6 h-6" />
            <span className="text-[9px]">Home</span>
          </button>
          <button onClick={() => navigateWithLoading('/MarketsDashboard')} className="flex flex-col items-center gap-0.5 text-[#71757f]">
            <BarChart2 className="w-6 h-6" />
            <span className="text-[9px]">Markets</span>
          </button>
          <button onClick={() => navigateWithLoading('/TradeDashboard')} className="flex flex-col items-center gap-0.5 text-[#71757f]">
            <Activity className="w-6 h-6" />
            <span className="text-[9px]">Trade</span>
          </button>
          <button onClick={() => navigateWithLoading('/EarnDashboard')} className="flex flex-col items-center gap-0.5 text-[#71757f]">
            <DollarSign className="w-6 h-6" />
            <span className="text-[9px]">Earn</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 text-white">
            <Wallet className="w-6 h-6" />
            <span className="text-[9px] font-medium">Assets</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <SwitchAccountModal
        isOpen={showSwitchAccountModal}
        onClose={() => setShowSwitchAccountModal(false)}
        userProfile={userProfile}
        fundingTotal={fundingTotal}
        unifiedTradingTotal={unifiedTradingTotal}
        totalUsdValue={totalUsdValue}
        btcValue={btcValue}
        selectedCurrency={selectedCurrency}
        showBalance={showBalance}
        onManageClick={handleManageSubaccount}
        onCreateClick={handleCreateSubaccount}
      />

      <DepositModal 
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        selectedFiat={selectedFiatCurrency}
        onFiatChange={() => setShowFiatCurrencyModal(true)}
      />

      {/* Currency Selection Modal */}
      {showCurrencyModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
          <div className="w-full bg-[#1a1a1a] rounded-t-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
              <h2 className="text-white text-lg font-semibold">Select a Currency</h2>
              <button onClick={() => setShowCurrencyModal(false)}>
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 max-h-[60vh]">
              <div className="mb-4">
                <div className="text-[#71757f] text-xs mb-2">Most Used</div>
                <button
                  onClick={() => handleCurrencySelect('USD')}
                  className={`w-full text-left px-4 py-3 rounded-lg ${selectedCurrency === 'USD' ? 'bg-[#2a2a2a]' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm">USD</span>
                    {selectedCurrency === 'USD' && <Check className="w-4 h-4 text-white" />}
                  </div>
                </button>
              </div>
              <div>
                <div className="text-[#71757f] text-xs mb-2">More</div>
                <div className="grid grid-cols-3 gap-2">
                  {currencies.filter(c => c.code !== 'USD').map((currency) => (
                    <button
                      key={currency.code}
                      onClick={() => handleCurrencySelect(currency.code)}
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
      )}

      {/* Fiat Currency Modal */}
      {showFiatCurrencyModal && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
            <h2 className="text-white text-lg font-semibold">Select Currency</h2>
            <button onClick={() => setShowFiatCurrencyModal(false)}>
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
          <div className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#71757f]" />
              <input
                type="text"
                placeholder="Search"
                value={fiatSearchQuery}
                onChange={(e) => setFiatSearchQuery(e.target.value)}
                className="w-full bg-[#2a2a2a] text-white pl-10 pr-4 py-3 rounded-lg text-sm focus:outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4">
            {fiatCurrencies
              .filter(c => c.code.toLowerCase().includes(fiatSearchQuery.toLowerCase()))
              .map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => {
                    setSelectedFiatCurrency(currency.code);
                    setShowFiatCurrencyModal(false);
                  }}
                  className="w-full flex items-center gap-3 py-3 hover:bg-[#1a1a1a]"
                >
                  <div className="w-8 h-8 rounded-full bg-[#4CAF50] flex items-center justify-center text-white text-xs font-bold">
                    {currency.code.slice(0, 2)}
                  </div>
                  <span className="text-white text-sm">{currency.code}</span>
                  {selectedFiatCurrency === currency.code && <Check className="w-4 h-4 text-[#f7a600] ml-auto" />}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}