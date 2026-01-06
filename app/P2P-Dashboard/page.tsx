'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// ============== TYPES ==============
interface P2PMerchant {
  id: string;
  username: string;
  isOnline: boolean;
  onlineTime: string;
  orders: number;
  completionRate: number;
  price: number;
  limitMin: number;
  limitMax: number;
  quantity: number;
  paymentMethods: string[];
  isVerified: boolean;
  isTopPick: boolean;
  isInstitution: boolean;
}

// ============== CONSTANTS ==============
const P2P_COINS = ['USDT', 'USDC', 'BTC', 'ETH'];

const FIAT_CURRENCIES = [
  'AED', 'AMD', 'ARS', 'AUD', 'AZN', 'BDT', 'BGN', 'BOB', 'BRL', 'BSD', 'BYN',
  'CAD', 'CLP', 'COP', 'CZK', 'DOP', 'DZD', 'EGP', 'ETB', 'EUR', 'GBP', 'GEL',
  'GHS', 'GTQ', 'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'IQD', 'JOD', 'JPY', 'KES',
  'KGS', 'KHR', 'KWD', 'KZT', 'LBP', 'LKR', 'MAD', 'MDL', 'MMK', 'MNT', 'MXN',
  'MYR', 'NGN', 'NOK', 'NPR', 'NZD', 'PEN', 'PHP', 'PKR', 'PLN', 'QAR', 'RON',
  'RSD', 'RUB', 'SAR', 'SEK', 'SGD', 'THB', 'TRY', 'TWD', 'UAH', 'USD', 'UZS',
  'VND', 'ZAR'
];

const PAYMENT_METHODS = [
  'Wise', 'Revolut', 'Bank Transfer', 'ING', 'Paycom or Opay', 'bKash',
  'Easypaisa-PK Only', 'PKO Bank', 'La Banque postale', 'Plin', 'Interbank',
  'Privat Bank', 'Kuveyt Turk', 'Skrill', 'iCard', 'Kaspi Bank',
  'Cash Deposit to Bank', 'Sofort', 'PayPal', 'Google Pay', 'N26',
  'Banco Brubank', 'Pix', 'Halyk Bank', 'Bank of Georgia', 'VakifBank',
  'Prex', 'Bunq', 'Pyypl', 'Transfers with specific bank', 'DemirBank',
  'Garanti', 'EasyPay', 'RWS BANK', 'Jazzcash', 'Vodafone cash',
  'Perfect Money', 'TBC Bank', 'Freedom Bank', 'Societe Generale',
  'ArmEconomBank', 'DenizBank', 'Pago Movil', 'Ecobank', 'Pipol Pay',
  'PalmPay', 'KapitalBank', 'Palm Pay', 'Produbanco', 'Raiffeisen Bank Aval',
  'IMPS', 'Polaris bank', 'Ameriabank', 'Paytm', 'SEPA', 'SEPA Instant',
  'UPI', 'Zelle', 'Blik'
];

const MERCHANT_NAMES = [
  'WORLD🌍EX-OTC', 'RicklePick', 'ПродамСарай', 'lyed11', 'GEO_PAPA', 'alvik',
  'ŞÄRLMĒRH-F🎀💕✨', 'NextUp', 'universal_king', 'verified101', 'Stranger_Boy',
  'GMFS3', 'Marckk', 'Ummu', 'Pay-Fast-Pro', 'BlocPay', 'bestchange.kh',
  'Jorge Tambley', 'A-change', 'CryptoKing', 'FastTrade', 'SecureExchange',
  'TrustPay', 'QuickBTC', 'SafeDeals', 'ProTrader', 'EasySwap', 'InstantCash',
  'ReliablePay', 'SpeedyTrade', 'GlobalExchange', 'PrimeCrypto', 'EliteTrader',
  'SwiftPay', 'TopMerchant', 'BestRates', 'FastCrypto', 'SecureTrade',
  'TrustedDealer', 'QuickSwap', 'SafeExchange', 'ProPay', 'EasyTrade',
  'InstantSwap', 'ReliableDealer', 'SpeedyCrypto', 'GlobalPay', 'PrimeExchange'
];

// ============== UTILITY FUNCTIONS ==============
const generateMerchants = (coin: string, currency: string, isBuy: boolean): P2PMerchant[] => {
  const basePrice = coin === 'BTC' ? 75000 : coin === 'ETH' ? 4000 : 1;
  const currencyMultiplier = currency === 'EUR' ? 0.85 : currency === 'GBP' ? 0.73 : 1;
  
  return Array.from({ length: 30 }, (_, i) => {
    const priceVariation = (Math.random() - 0.5) * 0.02;
    const price = basePrice * currencyMultiplier * (1 + priceVariation);
    const limitMin = Math.floor(Math.random() * 100) + 2;
    const limitMax = limitMin + Math.floor(Math.random() * 50000) + 1000;
    const quantity = Math.random() * (coin === 'BTC' ? 5 : coin === 'ETH' ? 50 : 100000);
    
    const paymentMethodCount = Math.floor(Math.random() * 4) + 1;
    const shuffledMethods = [...PAYMENT_METHODS].sort(() => Math.random() - 0.5);
    const selectedMethods = shuffledMethods.slice(0, paymentMethodCount);
    
    return {
      id: `${coin}-${currency}-${i}`,
      username: MERCHANT_NAMES[i % MERCHANT_NAMES.length] + (Math.random() > 0.7 ? ' 🎖️' : '') + (Math.random() > 0.8 ? ' 💎' : ''),
      isOnline: Math.random() > 0.3,
      onlineTime: `${Math.floor(Math.random() * 60)}m`,
      orders: Math.floor(Math.random() * 5000) + 20,
      completionRate: Math.floor(Math.random() * 15) + 85,
      price: Math.round(price * 1000) / 1000,
      limitMin,
      limitMax,
      quantity: Math.round(quantity * 10000) / 10000,
      paymentMethods: selectedMethods,
      isVerified: Math.random() > 0.5,
      isTopPick: i < 3,
      isInstitution: Math.random() > 0.9,
    };
  }).sort((a, b) => isBuy ? a.price - b.price : b.price - a.price);
};

// ============== COMPONENTS ==============

// Loading Spinner
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

// Skeleton Loader
function SkeletonLoader() {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-[#1a1a1a] rounded-xl p-4 animate-pulse">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-700 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-20"></div>
            </div>
            <div className="h-4 bg-gray-700 rounded w-24"></div>
          </div>
          <div className="h-8 bg-gray-700 rounded w-40 mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-48 mb-2"></div>
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <div className="h-5 bg-gray-700 rounded w-16"></div>
              <div className="h-5 bg-gray-700 rounded w-16"></div>
            </div>
            <div className="h-10 bg-gray-700 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Coin Icon
function CoinIcon({ symbol, size = 20 }: { symbol: string; size?: number }) {
  const [hasError, setHasError] = useState(false);
  const colors: Record<string, string> = {
    USDT: '#26a17b', USDC: '#2775ca', BTC: '#f7931a', ETH: '#627eea'
  };
  
  if (hasError) {
    return (
      <div className="rounded-full flex items-center justify-center" style={{ width: size, height: size, backgroundColor: colors[symbol] || '#666' }}>
        <span className="text-[8px] font-bold text-white">{symbol.slice(0, 2)}</span>
      </div>
    );
  }
  
  return (
    <Image src={`/coins/${symbol}.png`} alt={symbol} width={size} height={size} className="rounded-full" onError={() => setHasError(true)} unoptimized />
  );
}

// Fiat Currency Icon
function FiatIcon({ currency, size = 20 }: { currency: string; size?: number }) {
  const colors: Record<string, string> = {
    EUR: '#003399', USD: '#22c55e', GBP: '#9333ea', ARS: '#22c55e', BRL: '#22c55e',
    AUD: '#f59e0b', CAD: '#ef4444', JPY: '#ef4444', INR: '#f97316', NGN: '#22c55e'
  };
  
  return (
    <div className="rounded-full flex items-center justify-center text-white font-bold" style={{ width: size, height: size, backgroundColor: colors[currency] || '#6b7280', fontSize: size * 0.4 }}>
      {currency.slice(0, 1)}
    </div>
  );
}

// Notice Modal
function NoticeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-8">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
        <div className="flex flex-col items-center mb-4">
          <div className="w-16 h-16 mb-4">
            <svg viewBox="0 0 64 64" className="w-full h-full">
              <polygon points="32,8 56,56 8,56" fill="#f7a600" />
              <text x="32" y="46" textAnchor="middle" fontSize="24" fill="white" fontWeight="bold">!</text>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-black mb-3">Notice</h3>
        </div>
        <p className="text-gray-700 text-sm mb-2">
          Ensure your transaction security, please avoid <span className="text-[#f7a600]">off-platform</span> communication.
        </p>
        <p className="text-gray-700 text-sm mb-6">
          It is recommended that you look for <span className="text-[#f7a600]">verified advertisers</span> to enjoy a <span className="text-[#22c55e]">safer</span> and <span className="text-[#f7a600]">better experience</span>.
        </p>
        <button onClick={onClose} className="w-full bg-[#f7a600] text-black font-semibold py-3 rounded-xl">
          Acknowledge
        </button>
      </div>
    </div>
  );
}

// Select Coin Modal
function SelectCoinModal({ isOpen, onClose, selectedCoin, onSelect }: { isOpen: boolean; onClose: () => void; selectedCoin: string; onSelect: (coin: string) => void }) {
  const [search, setSearch] = useState('');
  if (!isOpen) return null;
  
  const filtered = P2P_COINS.filter(c => c.toLowerCase().includes(search.toLowerCase()));
  
  return (
    <div className="fixed inset-0 bg-[#0d0d0d] z-50 flex flex-col">
      <div className="flex items-center px-4 py-4">
        <button onClick={onClose} className="text-white p-2 -ml-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-lg font-semibold text-white flex-1 text-center mr-8">Select Coin</h1>
      </div>
      <div className="px-4 mb-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          <input type="text" placeholder="Search Coin" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#1a1a1a] rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 outline-none" />
        </div>
      </div>
      <div className="flex-1 px-4">
        {filtered.map((coin) => (
          <button key={coin} onClick={() => { onSelect(coin); onClose(); }} className="w-full flex items-center justify-between py-4 border-b border-gray-800/30">
            <div className="flex items-center gap-3">
              <CoinIcon symbol={coin} size={28} />
              <span className="text-white font-medium">{coin}</span>
            </div>
            {selectedCoin === coin && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f7a600" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>}
          </button>
        ))}
      </div>
    </div>
  );
}

// Select Currency Modal
function SelectCurrencyModal({ isOpen, onClose, selectedCurrency, onSelect }: { isOpen: boolean; onClose: () => void; selectedCurrency: string; onSelect: (currency: string) => void }) {
  const [search, setSearch] = useState('');
  if (!isOpen) return null;
  
  const filtered = FIAT_CURRENCIES.filter(c => c.toLowerCase().includes(search.toLowerCase()));
  const alphabet = '#↑ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  return (
    <div className="fixed inset-0 bg-[#0d0d0d] z-50 flex flex-col">
      <div className="px-4 py-3">
        <div className="relative flex items-center">
          <svg className="absolute left-3 text-gray-500" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          <input type="text" placeholder="Please enter preferred fiat currency" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#1a1a1a] rounded-lg py-3 pl-10 pr-20 text-white placeholder-gray-500 outline-none" autoFocus />
          <button onClick={onClose} className="absolute right-3 text-gray-400 text-sm">Cancel</button>
        </div>
      </div>
      <div className="flex flex-1">
        <div className="flex-1 overflow-y-auto px-4">
          {filtered.map((currency) => (
            <button key={currency} onClick={() => { onSelect(currency); onClose(); }} className="w-full flex items-center gap-3 py-3">
              <FiatIcon currency={currency} size={24} />
              <span className="text-white">{currency}</span>
            </button>
          ))}
        </div>
        <div className="w-6 flex flex-col items-center justify-center text-[10px] text-gray-500">
          {alphabet.map((letter) => <span key={letter} className="py-[2px]">{letter}</span>)}
        </div>
      </div>
    </div>
  );
}

// Amount Modal
function AmountModal({ isOpen, onClose, currency, onConfirm }: { isOpen: boolean; onClose: () => void; currency: string; onConfirm: (amount: string) => void }) {
  const [amount, setAmount] = useState('');
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
      <div className="w-full bg-[#1a1a1a] rounded-t-2xl p-4 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white font-medium text-lg">Amount</span>
          <button onClick={onClose} className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="bg-[#252525] rounded-xl p-4 mb-2 flex items-center border border-[#f7a600]">
          <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="" className="flex-1 bg-transparent text-white outline-none text-lg" autoFocus />
          <span className="text-white">{currency}</span>
        </div>
        <p className="text-gray-500 text-sm mb-4">Min. 2</p>
        <div className="flex gap-3">
          <button onClick={() => { setAmount(''); }} className="flex-1 bg-[#252525] text-white py-3 rounded-xl font-medium">Reset</button>
          <button onClick={() => { onConfirm(amount); onClose(); }} className="flex-1 bg-[#f7a600] text-black py-3 rounded-xl font-medium">Confirm</button>
        </div>
      </div>
      <style jsx>{`@keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } } .animate-slide-up { animation: slide-up 0.3s ease-out; }`}</style>
    </div>
  );
}

// Payment Methods Modal
function PaymentMethodsModal({ isOpen, onClose, selected, onConfirm }: { isOpen: boolean; onClose: () => void; selected: string[]; onConfirm: (methods: string[]) => void }) {
  const [search, setSearch] = useState('');
  const [localSelected, setLocalSelected] = useState<string[]>(selected);
  
  if (!isOpen) return null;
  
  const filtered = PAYMENT_METHODS.filter(m => m.toLowerCase().includes(search.toLowerCase()));
  const isAllSelected = localSelected.length === 0;
  
  const toggleMethod = (method: string) => {
    if (localSelected.includes(method)) {
      setLocalSelected(localSelected.filter(m => m !== method));
    } else {
      setLocalSelected([...localSelected, method]);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
      <div className="w-full bg-[#1a1a1a] rounded-t-2xl max-h-[80vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
          <span className="text-white font-medium text-lg">Payment Methods</span>
          <button onClick={onClose} className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="px-4 py-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            <input type="text" placeholder="Payment Methods" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#252525] rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 outline-none" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4">
          <button onClick={() => setLocalSelected([])} className="w-full flex items-center justify-between py-3 border-b border-gray-800/30">
            <span className="text-white font-medium">All</span>
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isAllSelected ? 'bg-[#f7a600] border-[#f7a600]' : 'border-gray-500'}`}>
              {isAllSelected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
            </div>
          </button>
          <p className="text-gray-500 text-sm py-2">Other</p>
          {filtered.map((method) => (
            <button key={method} onClick={() => toggleMethod(method)} className="w-full flex items-center justify-between py-3">
              <span className="text-white">{method}</span>
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${localSelected.includes(method) ? 'bg-[#f7a600] border-[#f7a600]' : 'border-gray-500'}`}>
                {localSelected.includes(method) && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
              </div>
            </button>
          ))}
        </div>
        <div className="flex gap-3 p-4 border-t border-gray-800">
          <button onClick={() => setLocalSelected([])} className="flex-1 bg-[#252525] text-white py-3 rounded-xl font-medium">Reset</button>
          <button onClick={() => { onConfirm(localSelected); onClose(); }} className="flex-1 bg-[#f7a600] text-black py-3 rounded-xl font-medium">Confirm</button>
        </div>
      </div>
      <style jsx>{`@keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } } .animate-slide-up { animation: slide-up 0.3s ease-out; }`}</style>
    </div>
  );
}

// Merchant Card
function MerchantCard({ merchant, coin, currency, isBuy, onAction }: { merchant: P2PMerchant; coin: string; currency: string; isBuy: boolean; onAction: () => void }) {
  return (
    <div className={`bg-[#1a1a1a] rounded-xl p-4 mb-3 ${merchant.isTopPick ? 'border border-[#f7a600]/30' : ''}`}>
      {merchant.isTopPick && (
        <div className="flex justify-end mb-1">
          <span className="text-[#f7a600] text-xs flex items-center gap-1">
            Top Picks for New Users <span className="w-4 h-4 bg-[#f7a600] rounded-full flex items-center justify-center text-black text-[8px]">✓</span>
          </span>
        </div>
      )}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${merchant.isOnline ? 'bg-[#f7a600]' : 'bg-gray-600'}`}>
            {merchant.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-white font-medium text-sm">{merchant.username}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 text-xs">
              <span className={`w-2 h-2 rounded-full ${merchant.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></span>
              <span>{merchant.onlineTime}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-gray-400 text-xs">{merchant.orders} Orders ({merchant.completionRate}%)</span>
          {merchant.isInstitution && <span className="text-[#f7a600] text-xs ml-2">Institution</span>}
        </div>
      </div>
      <div className={`text-2xl font-bold mb-2 ${isBuy ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
        {currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'} {merchant.price.toLocaleString()}
      </div>
      <div className="text-gray-400 text-xs mb-1">
        <span className="text-gray-500">Limits</span> {merchant.limitMin.toLocaleString()} - {merchant.limitMax.toLocaleString()} {currency}
      </div>
      <div className="text-gray-400 text-xs mb-2">
        <span className="text-gray-500">Quantity</span> {merchant.quantity.toLocaleString()} {coin}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {merchant.paymentMethods.slice(0, 3).map((method, i) => (
            <span key={i} className="text-[#f7a600] text-xs">| {method}</span>
          ))}
          {merchant.paymentMethods.length > 3 && <span className="text-gray-500 text-xs">+{merchant.paymentMethods.length - 3}</span>}
        </div>
        <button onClick={onAction} className={`px-6 py-2 rounded-lg font-medium ${isBuy ? 'bg-[#22c55e] text-white' : 'bg-[#ef4444] text-white'}`}>
          {isBuy ? 'Buy' : 'Sell'}
        </button>
      </div>
    </div>
  );
}

// ============== MAIN COMPONENT ==============
export default function P2PDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showNotice, setShowNotice] = useState(true);
  const [isBuy, setIsBuy] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState('USDT');
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);
  const [amountFilter, setAmountFilter] = useState('');
  
  // Modals
  const [showCoinModal, setShowCoinModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Merchants
  const [merchants, setMerchants] = useState<P2PMerchant[]>([]);
  
  // Generate merchants
  useEffect(() => {
    setInitialLoading(true);
    const timer = setTimeout(() => {
      setMerchants(generateMerchants(selectedCoin, selectedCurrency, isBuy));
      setInitialLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [selectedCoin, selectedCurrency, isBuy]);
  
  // Auto-toggle online status
  useEffect(() => {
    const interval = setInterval(() => {
      setMerchants(prev => prev.map(m => ({
        ...m,
        isOnline: Math.random() > 0.3,
        onlineTime: `${Math.floor(Math.random() * 60)}m`
      })));
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  const navigateWithLoading = (path: string) => {
    setLoading(true);
    setTimeout(() => router.push(path), 500);
  };
  
  const handleMerchantAction = (merchant: P2PMerchant) => {
    const action = isBuy ? 'Buy' : 'Sell';
    navigateWithLoading(`/P2P-Dashboard/${action}${selectedCoin}?merchantId=${merchant.id}&price=${merchant.price}&currency=${selectedCurrency}`);
  };
  
  const filteredMerchants = useMemo(() => {
    let result = merchants;
    if (amountFilter) {
      const amount = parseFloat(amountFilter);
      result = result.filter(m => m.limitMin <= amount && m.limitMax >= amount);
    }
    if (selectedPaymentMethods.length > 0) {
      result = result.filter(m => m.paymentMethods.some(pm => selectedPaymentMethods.includes(pm)));
    }
    return result;
  }, [merchants, amountFilter, selectedPaymentMethods]);
  
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white pb-20">
      {loading && <LoadingSpinner />}
      <NoticeModal isOpen={showNotice} onClose={() => setShowNotice(false)} />
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0d0d0d]">
        <div className="flex items-center justify-between px-4 py-4">
          <button onClick={() => router.back()} className="text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </button>
          <div className="flex items-center gap-6">
            <span className="text-gray-400">Express</span>
            <span className="text-[#f7a600] font-semibold">P2P</span>
            <span className="text-gray-400">Block Trade</span>
          </div>
          <button onClick={() => setShowCurrencyModal(true)} className="flex items-center gap-1 bg-[#252525] px-3 py-1 rounded-lg">
            <span className="text-white text-sm">{selectedCurrency}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
          </button>
        </div>
        
        {/* Banner */}
        <div className="px-4 mb-4">
          <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] rounded-xl p-4 flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">Bybit Global, P2P Trade</h3>
              <p className="text-gray-400 text-xs">Get up to 50 USDT when you deposit and spend with Fiat & Pay this season</p>
            </div>
            <div className="w-16 h-16 bg-[#f7a600]/20 rounded-full"></div>
          </div>
        </div>
        
        {/* Buy/Sell Tabs */}
        <div className="px-4 mb-4 flex items-center justify-between">
          <div className="flex gap-2">
            <button onClick={() => setIsBuy(true)} className={`px-4 py-2 rounded-lg font-medium ${isBuy ? 'bg-[#252525] text-white' : 'text-gray-400'}`}>Buy</button>
            <button onClick={() => setIsBuy(false)} className={`px-4 py-2 rounded-lg font-medium ${!isBuy ? 'bg-[#252525] text-white' : 'text-gray-400'}`}>Sell</button>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 bg-[#252525] rounded-full flex items-center justify-center">
              <span className="text-[#3b82f6] text-xs font-bold">LTC</span>
            </button>
            <button className="w-10 h-10 bg-[#f7a600]/20 rounded-full flex items-center justify-center text-[#f7a600]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="px-4 pb-3 flex items-center gap-3 overflow-x-auto">
          <button onClick={() => setShowCoinModal(true)} className="flex items-center gap-1 bg-[#252525] px-3 py-2 rounded-lg whitespace-nowrap">
            <CoinIcon symbol={selectedCoin} size={16} />
            <span className="text-white text-sm">{selectedCoin}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
          </button>
          <button onClick={() => setShowAmountModal(true)} className="flex items-center gap-1 text-gray-400 text-sm whitespace-nowrap">
            <span>Amount</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
          </button>
          <button onClick={() => setShowPaymentModal(true)} className="flex items-center gap-1 text-gray-400 text-sm whitespace-nowrap">
            <span>{selectedPaymentMethods.length > 0 ? `${selectedPaymentMethods.length} Methods` : 'All Payment Methods'}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
          </button>
          <button className="ml-auto">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f7a600" strokeWidth="2">
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
            </svg>
            {selectedPaymentMethods.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#f7a600] rounded-full text-[10px] text-black flex items-center justify-center">1</span>}
          </button>
        </div>
      </div>
      
      {/* Merchant List */}
      {initialLoading ? (
        <SkeletonLoader />
      ) : (
        <div className="px-4">
          {filteredMerchants.map((merchant) => (
            <MerchantCard key={merchant.id} merchant={merchant} coin={selectedCoin} currency={selectedCurrency} isBuy={isBuy} onAction={() => handleMerchantAction(merchant)} />
          ))}
        </div>
      )}
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0d0d0d] border-t border-gray-800 flex justify-around py-3">
        <button className="flex flex-col items-center gap-1 text-[#f7a600]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          <span className="text-xs">P2P</span>
        </button>
        <button onClick={() => navigateWithLoading('/P2P-Dashboard/Orders')} className="flex flex-col items-center gap-1 text-gray-400">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
          <span className="text-xs">Orders</span>
        </button>
        <button onClick={() => navigateWithLoading('/P2P-Dashboard/Ads')} className="flex flex-col items-center gap-1 text-gray-400">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>
          <span className="text-xs">Ads</span>
        </button>
        <button onClick={() => navigateWithLoading('/P2P-Dashboard/Profile')} className="flex flex-col items-center gap-1 text-gray-400">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          <span className="text-xs">Profile</span>
        </button>
      </div>
      
      {/* Modals */}
      <SelectCoinModal isOpen={showCoinModal} onClose={() => setShowCoinModal(false)} selectedCoin={selectedCoin} onSelect={setSelectedCoin} />
      <SelectCurrencyModal isOpen={showCurrencyModal} onClose={() => setShowCurrencyModal(false)} selectedCurrency={selectedCurrency} onSelect={setSelectedCurrency} />
      <AmountModal isOpen={showAmountModal} onClose={() => setShowAmountModal(false)} currency={selectedCurrency} onConfirm={setAmountFilter} />
      <PaymentMethodsModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} selected={selectedPaymentMethods} onConfirm={setSelectedPaymentMethods} />
    </div>
  );
}