'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, PlusCircle, Search, Eye, EyeOff } from 'lucide-react';

// Storage key for persistent currency
const CURRENCY_STORAGE_KEY = 'selected_fiat_currency';

// Currencies with rates
const currencies = [
  { code: 'USD', rate: 1 },
  { code: 'EUR', rate: 0.86 },
  { code: 'GBP', rate: 0.79 },
  { code: 'JPY', rate: 156.50 },
  { code: 'CNY', rate: 7.25 },
  { code: 'NGN', rate: 1545.00 },
];

const getCurrencyRate = (code: string): number => {
  const currency = currencies.find(c => c.code === code);
  return currency?.rate || 1;
};

const formatWithCommas = (value: number, decimals: number = 2): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export default function SubaccountDashboard() {
  const router = useRouter();
  const [showBalance, setShowBalance] = useState(true);
  const [showSwitchableOnly, setShowSwitchableOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [totalUsdValue, setTotalUsdValue] = useState(0);
  const [btcValue, setBtcValue] = useState(0);

  // Load saved currency from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (savedCurrency) {
      setSelectedCurrency(savedCurrency);
    }
  }, []);

  // Fetch total balance
  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        const response = await fetch('/api/user/balances', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setTotalUsdValue(data.summary?.totalUsdValue || 0);
            setBtcValue(data.summary?.btcValue || 0);
          }
        }
      } catch (error) {
        console.error('Error fetching balances:', error);
      }
    };

    fetchBalances();
  }, []);

  const fiatRate = getCurrencyRate(selectedCurrency);

  const convertToFiat = (usdAmount: number) => {
    return formatWithCommas(usdAmount * fiatRate, 2);
  };

  const handleCreateClick = () => {
    router.push('/CreateSubaccount/SelectType');
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0d0d0d] border-b border-[#1a1a1a]">
        <div className="flex items-center justify-between px-4 py-4">
          <button onClick={() => router.back()} className="p-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Subaccount</h1>
          <div className="w-6"></div>
        </div>
      </div>

      {/* Total Assets Card */}
      <div className="mx-4 mt-4 bg-[#1a1a1a] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[#71757f] text-sm">Total Assets</span>
          <button onClick={() => setShowBalance(!showBalance)}>
            {showBalance ? (
              <Eye className="w-4 h-4 text-[#71757f]" />
            ) : (
              <EyeOff className="w-4 h-4 text-[#71757f]" />
            )}
          </button>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-white text-3xl font-bold">
            {showBalance ? convertToFiat(totalUsdValue) : '********'}
          </span>
          <span className="text-white text-lg">{selectedCurrency}</span>
        </div>
        <div className="text-[#71757f] text-sm">
          ≈ {showBalance ? btcValue.toFixed(8) : '********'} BTC
        </div>
      </div>

      {/* Create Button */}
      <div className="mx-4 mt-4">
        <button
          onClick={handleCreateClick}
          className="w-full bg-[#1a1a1a] rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-[#252525] transition-colors"
        >
          <PlusCircle className="w-6 h-6 text-white" />
          <span className="text-white text-sm">Create</span>
        </button>
      </div>

      {/* Filters */}
      <div className="mx-4 mt-4 flex items-center justify-between">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showSwitchableOnly}
            onChange={(e) => setShowSwitchableOnly(e.target.checked)}
            className="w-4 h-4 rounded border-[#3a3a3a] bg-transparent accent-[#f7a600]"
          />
          <span className="text-[#71757f] text-sm">Show switchable accounts only</span>
        </label>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#71757f]" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#1a1a1a] text-white pl-9 pr-4 py-2 rounded-lg text-sm w-32 focus:outline-none focus:ring-1 focus:ring-[#f7a600]"
          />
        </div>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-24 h-24 mb-4 relative">
          <div className="w-20 h-14 bg-[#2a2a2a] rounded-lg absolute top-2 left-2"></div>
          <div className="w-8 h-10 bg-[#f7a600] rounded absolute bottom-0 right-2"></div>
        </div>
        <span className="text-[#71757f] text-sm">No Subaccount Created</span>
      </div>
    </div>
  );
}