'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Loading Spinner Component
function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-[#f7a600] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-white text-sm">Loading...</span>
      </div>
    </div>
  );
}

interface CoinData {
  symbol: string;
  name: string;
  balance: number;
  usdValue: string;
}

// Coin names mapping
const coinNames: Record<string, string> = {
  USDT: 'Tether USDT',
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  USDC: 'USD Coin',
  SOL: 'Solana',
  XRP: 'XRP',
  DOGE: 'Dogecoin',
  ADA: 'Cardano',
  DOT: 'Polkadot',
  TRX: 'TRON',
  SUI: 'Sui',
  MNT: 'Mantle',
  USDE: 'USDe',
  BNB: 'Binance Coin',
  DAI: 'Dai',
  USDTB: 'Ethena Labs',
};

// Payment coins list (order matters - as shown in images)
const paymentCoins: CoinData[] = [
  { symbol: 'BTC', name: 'Bitcoin', balance: 0, usdValue: '≈ 0.00 USD' },
  { symbol: 'SUI', name: 'Sui', balance: 0, usdValue: '≈ 0.00 USD' },
  { symbol: 'MNT', name: 'Mantle', balance: 0, usdValue: '≈ 0.00 USD' },
  { symbol: 'USDE', name: 'USDe', balance: 0, usdValue: '≈ 0.00 USD' },
  { symbol: 'USDC', name: 'USD Coin', balance: 0, usdValue: '≈ 0.00 USD' },
  { symbol: 'BNB', name: 'Binance Coin', balance: 0, usdValue: '≈ 0.00 USD' },
  { symbol: 'SOL', name: 'Solana', balance: 0, usdValue: '≈ 0.00 USD' },
  { symbol: 'DAI', name: 'Dai', balance: 0, usdValue: '≈ 0.00 USD' },
  { symbol: 'USDTB', name: 'Ethena Labs', balance: 0, usdValue: '≈ 0.00 USD' },
  { symbol: 'XRP', name: 'XRP', balance: 0, usdValue: '≈ 0.00 USD' },
  { symbol: 'USDT', name: 'Tether USDT', balance: 0, usdValue: '≈ 0.00 USD' },
  { symbol: 'ETH', name: 'Ethereum', balance: 0, usdValue: '≈ 0.00 USD' },
  { symbol: 'TRX', name: 'TRON', balance: 0, usdValue: '≈ 0.00 USD' },
  { symbol: 'DOGE', name: 'Dogecoin', balance: 0, usdValue: '≈ 0.00 USD' },
  { symbol: 'ADA', name: 'Cardano', balance: 0, usdValue: '≈ 0.00 USD' },
  { symbol: 'DOT', name: 'Polkadot', balance: 0, usdValue: '≈ 0.00 USD' },
];

// Coin Icon Component
function CoinIcon({ symbol, size = 32 }: { symbol: string; size?: number }) {
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

export default function SetAmount() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<CoinData>(paymentCoins.find(c => c.symbol === 'USDT') || paymentCoins[0]);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCoins = useMemo(() => {
    if (!searchQuery) return paymentCoins;
    return paymentCoins.filter(
      (coin) =>
        coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coin.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      router.back();
    }, 500);
  };

  const handleCoinSelect = (coin: CoinData) => {
    setSelectedCoin(coin);
    setShowCurrencyModal(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {loading && <LoadingSpinner />}
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0d0d0d] px-4 py-4">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="text-white p-2 -ml-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">Set currency/amount</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="px-4 pb-8">
        {/* Currency Selection */}
        <div className="mb-6">
          <label className="text-gray-500 text-sm mb-2 block">Currency</label>
          <button
            onClick={() => setShowCurrencyModal(true)}
            className="w-full bg-[#1a1a1a] rounded-xl py-4 px-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <CoinIcon symbol={selectedCoin.symbol} size={28} />
              <span className="text-white font-medium">{selectedCoin.symbol}</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="text-gray-500 text-sm mb-2 block">Amount</label>
          <div className="bg-[#1a1a1a] rounded-xl py-4 px-4">
            <div className="flex items-center justify-between">
              <input
                type="text"
                placeholder="Enter here"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-gray-600 outline-none"
              />
              <span className="text-white">{selectedCoin.symbol}</span>
            </div>
          </div>
        </div>

        {/* Note Input */}
        <div className="mb-8">
          <label className="text-gray-500 text-sm mb-2 block">Note (optional)</label>
          <div className="bg-[#1a1a1a] rounded-xl py-4 px-4">
            <input
              type="text"
              placeholder="Enter your reason here"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-transparent text-white placeholder-gray-600 outline-none"
            />
          </div>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          className="w-full bg-[#f7a600] text-black font-semibold py-4 rounded-xl hover:bg-[#ffb824] transition-colors"
        >
          Confirm
        </button>
      </div>

      {/* Currency Selection Modal */}
      {showCurrencyModal && (
        <div className="fixed inset-0 bg-[#0d0d0d] z-50 flex flex-col">
          {/* Search Header */}
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
                placeholder="Enter here"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a1a1a] rounded-lg py-3 pl-10 pr-20 text-white placeholder-gray-500 outline-none"
                autoFocus
              />
              <button
                onClick={() => {
                  setShowCurrencyModal(false);
                  setSearchQuery('');
                }}
                className="absolute right-3 text-gray-400 text-sm hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Info Text */}
          <div className="px-4 py-3">
            <p className="text-gray-500 text-sm">
              You can use any currency for transfers. Bybit Pay will automatically convert your available balance to the target currency via Bybit Convert.
            </p>
          </div>

          {/* Coin List */}
          <div className="flex-1 overflow-y-auto px-4">
            {filteredCoins.map((coin) => (
              <button
                key={coin.symbol}
                onClick={() => handleCoinSelect(coin)}
                className="w-full bg-[#1a1a1a] rounded-xl mb-2 p-4 flex items-center justify-between hover:bg-[#252525] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CoinIcon symbol={coin.symbol} size={36} />
                  <div className="text-left">
                    <div className="text-white font-medium">{coin.symbol}</div>
                    <div className="text-gray-500 text-sm">{coin.name}</div>
                  </div>
                </div>
                <span className="text-white">{coin.usdValue}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}