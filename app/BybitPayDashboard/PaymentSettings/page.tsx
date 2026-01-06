'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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

function CoinIcon({ symbol, size = 32 }: { symbol: string; size?: number }) {
  const [hasError, setHasError] = useState(false);
  if (hasError) {
    return (
      <div className="rounded-full bg-gray-700 flex items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-[10px] font-medium text-white">{symbol.slice(0, 2)}</span>
      </div>
    );
  }
  return (
    <div className="rounded-full bg-gray-700 flex items-center justify-center overflow-hidden" style={{ width: size, height: size }}>
      <Image src={`/coins/${symbol}.png`} alt={symbol} width={size} height={size} className="w-full h-full object-cover" onError={() => setHasError(true)} unoptimized />
    </div>
  );
}

function InsufficientModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
      <div className="w-full bg-[#1a1a1a] rounded-t-2xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white font-medium text-lg">Insufficient for spending</span>
          <button onClick={onClose} className="text-gray-400">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-gray-400 text-sm">Your 0 USDT is below the minimum conversion amount of 1 USD and can&apos;t be used with Bybit Pay. Please choose another asset or add more funds.</p>
      </div>
      <style jsx>{`@keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } } .animate-slide-up { animation: slide-up 0.3s ease-out; }`}</style>
    </div>
  );
}

const paymentCoins = [
  { symbol: 'USDT', name: 'Tether USDT' },
  { symbol: 'USDC', name: 'USD Coin' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'MNT', name: 'Mantle' },
  { symbol: 'TON', name: 'TON' },
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'USDE', name: 'USDe' },
  { symbol: 'PYUSD', name: 'PayPal USD' },
  { symbol: 'USD1', name: 'World Liberty Financial USD' },
  { symbol: 'USDD', name: 'USDD' },
  { symbol: 'XUSD', name: 'StraitsX USD' },
  { symbol: 'DAI', name: 'Dai' },
  { symbol: 'USDTB', name: 'Ethena Labs' },
  { symbol: 'XRP', name: 'XRP' },
  { symbol: 'BNB', name: 'Binance Coin' },
  { symbol: 'SUI', name: 'Sui' },
  { symbol: 'ADA', name: 'Cardano' },
];

export default function PaymentSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [autoDeduction, setAutoDeduction] = useState(true);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {loading && <LoadingSpinner />}
      <div className="sticky top-0 z-10 bg-[#0d0d0d] px-4 py-4">
        <div className="flex items-center justify-between">
          {isEditing ? (
            <button onClick={() => setIsEditing(false)} className="text-white">Cancel</button>
          ) : (
            <button onClick={() => router.back()} className="text-white p-2 -ml-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="text-lg font-semibold">Payment Settings</h1>
          {isEditing ? (
            <button onClick={() => setIsEditing(false)} className="text-[#f7a600]">Confirm</button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="text-gray-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3h7a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h7M18 9l-6 6-3-3" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="px-4 pb-8">
        <p className="text-gray-500 text-sm mb-4">When making cross-currency payments, the system will follow the sequence below</p>
        <div className="flex items-center justify-between mb-6">
          <span className="text-white text-sm underline">Auto-Deduction</span>
          <button
            onClick={() => setAutoDeduction(!autoDeduction)}
            className={`w-12 h-6 rounded-full transition-colors ${autoDeduction ? 'bg-[#f7a600]' : 'bg-gray-600'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${autoDeduction ? 'translate-x-6' : 'translate-x-1'}`}></div>
          </button>
        </div>
        <div className="space-y-3">
          {paymentCoins.map((coin) => (
            <button
              key={coin.symbol}
              onClick={() => setShowInsufficientModal(true)}
              className="w-full bg-[#1a1a1a] rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <CoinIcon symbol={coin.symbol} size={36} />
                <div className="text-left">
                  <div className="text-white font-medium">{coin.symbol}</div>
                  <div className="text-gray-500 text-sm">{coin.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#f7a600] text-sm">Insufficient for spending</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#f7a600" strokeWidth="2" />
                  <path d="M12 16v-4M12 8h.01" stroke="#f7a600" strokeWidth="2" strokeLinecap="round" />
                </svg>
                {isEditing && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500 ml-2">
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
      <InsufficientModal isOpen={showInsufficientModal} onClose={() => setShowInsufficientModal(false)} />
    </div>
  );
}