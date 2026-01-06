'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// ============== TYPES ==============
interface Currency {
  code: string;
  name: string;
  color: string;
}

interface Coin {
  symbol: string;
  name: string;
  color: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  price: string;
  recommended?: boolean;
  isBalance?: boolean;
  balanceAmount?: string;
  description?: string;
}

// ============== CONSTANTS ==============
const FIAT_CURRENCIES: Currency[] = [
  { code: 'EUR', name: 'Euro', color: '#3b82f6' },
  { code: 'USD', name: 'USD', color: '#22c55e' },
  { code: 'PLN', name: 'PLN', color: '#f7a600' },
  { code: 'GBP', name: 'Pound Sterling', color: '#8b5cf6' },
  { code: 'BRL', name: 'Brazilian Real', color: '#22c55e' },
  { code: 'ARS', name: 'Argentine Peso', color: '#22c55e' },
  { code: 'TRY', name: 'TRY', color: '#3b82f6' },
  { code: 'UAH', name: 'UAH', color: '#3b82f6' },
  { code: 'VND', name: 'VND', color: '#22c55e' },
  { code: 'MXN', name: 'MXN', color: '#22c55e' },
  { code: 'UYU', name: 'UYU', color: '#8b5cf6' },
  { code: 'AED', name: 'UAE Dirham', color: '#3b82f6' },
  { code: 'AMD', name: 'Armenian Dram', color: '#f97316' },
  { code: 'AOA', name: 'Angolan Kwanza', color: '#8b5cf6' },
  { code: 'AUD', name: 'AUD', color: '#22c55e' },
  { code: 'AZN', name: 'Azerbaijani Manat', color: '#f97316' },
  { code: 'BDT', name: 'Bangladeshi Taka', color: '#ef4444' },
  { code: 'BGN', name: 'Bulgarian Lev', color: '#22c55e' },
  { code: 'BHD', name: 'Bahraini Dinar', color: '#ef4444' },
  { code: 'BND', name: 'Brunei Dollar', color: '#22c55e' },
  { code: 'BOB', name: 'Bolivian Boliviano', color: '#22c55e' },
  { code: 'BTN', name: 'BTN', color: '#f97316' },
  { code: 'BYN', name: 'Belarusian Ruble', color: '#ef4444' },
  { code: 'CAD', name: 'Canadian Dollar', color: '#ef4444' },
  { code: 'NGN', name: 'Nigerian Naira', color: '#22c55e' },
  { code: 'INR', name: 'Indian Rupee', color: '#f97316' },
  { code: 'JPY', name: 'Japanese Yen', color: '#ef4444' },
];

const CRYPTO_COINS: Coin[] = [
  { symbol: 'USDT', name: 'Tether USDT', color: '#26a17b' },
  { symbol: 'BTC', name: 'Bitcoin', color: '#f7931a' },
  { symbol: 'ETH', name: 'Ethereum', color: '#627eea' },
  { symbol: 'ARB', name: 'Arbitrum', color: '#28a0f0' },
  { symbol: 'USDC', name: 'USD Coin', color: '#2775ca' },
  { symbol: 'SUI', name: 'Sui', color: '#6fbcf0' },
  { symbol: 'XRP', name: 'XRP', color: '#23292f' },
  { symbol: 'PEPE', name: 'Pepe', color: '#22c55e' },
  { symbol: 'ADA', name: 'Cardano', color: '#0033ad' },
  { symbol: 'DOGE', name: 'Dogecoin', color: '#c3a634' },
  { symbol: 'DOT', name: 'Polkadot', color: '#e6007a' },
  { symbol: 'SOL', name: 'Solana', color: '#9945ff' },
  { symbol: 'MATIC', name: 'Polygon', color: '#8247e5' },
  { symbol: 'AVAX', name: 'Avalanche', color: '#e84142' },
  { symbol: 'LINK', name: 'Chainlink', color: '#2a5ada' },
  { symbol: '0G', name: '0G', color: '#00d4aa' },
  { symbol: 'A8', name: 'A8', color: '#ff6b6b' },
  { symbol: 'ACS', name: 'ACS', color: '#00bcd4' },
  { symbol: 'AERO', name: 'AERO', color: '#4caf50' },
  { symbol: 'AEVO', name: 'AEVO', color: '#9c27b0' },
  { symbol: 'AIOZ', name: 'AIOZ', color: '#607d8b' },
  { symbol: 'AIXBT', name: 'AIXBT', color: '#ff9800' },
  { symbol: 'ALCH', name: 'ALCH', color: '#e91e63' },
  { symbol: 'ALMANAK', name: 'ALMANAK', color: '#00bfa5' },
  { symbol: 'ALT', name: 'ALT', color: '#3f51b5' },
  { symbol: 'AMI', name: 'AMI', color: '#ff5722' },
];

const NEWLY_LISTED_COINS = ['ALMANAK', 'NIGHT', 'WET', 'STABLE'];

const BUY_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'bank_pekao', name: 'Bank Pekao', price: '3.6', recommended: true },
  { id: 'bank_transfer', name: 'Bank Transfer', price: '3.59', recommended: true },
  { id: 'pln_balance', name: 'PLN Balance', price: '0.0', isBalance: true, balanceAmount: '0.0' },
  { id: 'blik', name: 'BLIK', price: '3.68' },
  { id: 'google_pay', name: 'Google Pay', price: '3.64' },
  { id: 'bank_card', name: 'Bank Card', price: '3.66' },
  { id: 'third_party', name: 'Third Party Channel (3)', price: '3.59', description: 'Apple Pay/Credit Card/Google Pay/BRI/BniBank/QRIS/OVO/SEPA/M...' },
];

const SELL_RECEIVE_METHODS: PaymentMethod[] = [
  { id: 'bank_transfer', name: 'Bank Transfer', price: '1,586', recommended: true },
];

// ============== COMPONENTS ==============

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

function CoinIcon({ symbol, size = 24 }: { symbol: string; size?: number }) {
  const [hasError, setHasError] = useState(false);
  const coin = CRYPTO_COINS.find(c => c.symbol === symbol);
  
  if (hasError || !coin) {
    return (
      <div className="rounded-full flex items-center justify-center" style={{ width: size, height: size, backgroundColor: coin?.color || '#666' }}>
        <span style={{ fontSize: size * 0.4 }} className="font-bold text-white">{symbol?.slice(0, 2)}</span>
      </div>
    );
  }
  
  return (
    <Image src={`/coins/${symbol}.png`} alt={symbol} width={size} height={size} className="rounded-full" onError={() => setHasError(true)} unoptimized />
  );
}

function FiatIcon({ code, size = 24 }: { code: string; size?: number }) {
  const currency = FIAT_CURRENCIES.find(c => c.code === code);
  return (
    <div className="rounded-full flex items-center justify-center text-white font-bold" style={{ width: size, height: size, backgroundColor: currency?.color || '#6b7280', fontSize: size * 0.4 }}>
      {code.slice(0, 1)}
    </div>
  );
}

// Select Coin Modal (for Buy tab)
function SelectCoinModal({ isOpen, onClose, selectedCoin, onSelect }: { isOpen: boolean; onClose: () => void; selectedCoin: string; onSelect: (coin: string) => void }) {
  const [search, setSearch] = useState('');
  if (!isOpen) return null;
  
  const recommendedCoins = ['BTC', 'ETH', 'USDT'];
  const filtered = CRYPTO_COINS.filter(c => c.symbol.toLowerCase().includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase()));
  const alphabet = '#↑ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  return (
    <div className="fixed inset-0 bg-[#0d0d0d] z-50 flex flex-col">
      <div className="px-4 py-3">
        <div className="relative flex items-center">
          <svg className="absolute left-3 text-gray-500" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          <input type="text" placeholder="Please enter coin type" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#1a1a1a] rounded-lg py-3 pl-10 pr-20 text-white placeholder-gray-500 outline-none" autoFocus />
          <button onClick={onClose} className="absolute right-3 text-gray-400 text-sm">Cancel</button>
        </div>
      </div>
      
      {/* Recommend */}
      <div className="px-4 mb-4">
        <p className="text-gray-500 text-sm mb-2">Recommend</p>
        <div className="flex gap-2">
          {recommendedCoins.map(coin => (
            <button key={coin} onClick={() => { onSelect(coin); onClose(); }} className="bg-[#1a1a1a] px-4 py-2 rounded-lg text-white text-sm">{coin}</button>
          ))}
        </div>
      </div>
      
      {/* Newly Listed */}
      <div className="px-4 mb-4">
        <p className="text-gray-500 text-sm mb-2">Newly Listed</p>
        <div className="flex gap-2 flex-wrap">
          {NEWLY_LISTED_COINS.map(coin => (
            <button key={coin} onClick={() => { onSelect(coin); onClose(); }} className="bg-[#1a1a1a] px-4 py-2 rounded-lg text-white text-sm">{coin}</button>
          ))}
        </div>
      </div>
      
      <div className="flex flex-1">
        <div className="flex-1 overflow-y-auto px-4">
          <p className="text-gray-500 text-sm mb-2">Crypto</p>
          {filtered.map((coin) => (
            <button key={coin.symbol} onClick={() => { onSelect(coin.symbol); onClose(); }} className="w-full flex items-center gap-3 py-3">
              <CoinIcon symbol={coin.symbol} size={32} />
              <span className="text-white">{coin.symbol}</span>
            </button>
          ))}
        </div>
        <div className="w-6 flex flex-col items-center justify-center text-[10px] text-gray-500">
          {alphabet.map((letter) => <span key={letter} className="py-[1px]">{letter}</span>)}
        </div>
      </div>
    </div>
  );
}

// Select Fiat Modal
function SelectFiatModal({ isOpen, onClose, selectedFiat, onSelect }: { isOpen: boolean; onClose: () => void; selectedFiat: string; onSelect: (fiat: string) => void }) {
  const [search, setSearch] = useState('');
  if (!isOpen) return null;
  
  const filtered = FIAT_CURRENCIES.filter(c => c.code.toLowerCase().includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase()));
  const alphabet = '#↑ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  return (
    <div className="fixed inset-0 bg-[#0d0d0d] z-50 flex flex-col">
      <div className="px-4 py-3">
        <div className="relative flex items-center">
          <svg className="absolute left-3 text-gray-500" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          <input type="text" placeholder="Please enter fiat type" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#1a1a1a] rounded-lg py-3 pl-10 pr-20 text-white placeholder-gray-500 outline-none" autoFocus />
          <button onClick={onClose} className="absolute right-3 text-gray-400 text-sm">Cancel</button>
        </div>
      </div>
      
      {/* Recommend */}
      <div className="px-4 mb-4">
        <p className="text-gray-500 text-sm mb-2">Recommend</p>
        <div className="flex gap-2">
          <button onClick={() => { onSelect('EUR'); onClose(); }} className="bg-[#1a1a1a] px-4 py-2 rounded-lg text-white text-sm">EUR</button>
        </div>
      </div>
      
      <div className="flex flex-1">
        <div className="flex-1 overflow-y-auto px-4">
          <p className="text-gray-500 text-sm mb-2">Fiat</p>
          {filtered.map((currency) => (
            <button key={currency.code} onClick={() => { onSelect(currency.code); onClose(); }} className="w-full flex items-center gap-3 py-3">
              <FiatIcon code={currency.code} size={32} />
              <div className="text-left">
                <span className="text-white font-medium">{currency.code}</span>
                <span className="text-gray-500 ml-2 text-sm">{currency.name}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="w-6 flex flex-col items-center justify-center text-[10px] text-gray-500">
          {alphabet.map((letter) => <span key={letter} className="py-[1px]">{letter}</span>)}
        </div>
      </div>
    </div>
  );
}

// Pay With Modal (Buy tab)
function PayWithModal({ isOpen, onClose, selectedMethod, onSelect, fiat }: { isOpen: boolean; onClose: () => void; selectedMethod: string; onSelect: (method: PaymentMethod) => void; fiat: string }) {
  if (!isOpen) return null;
  
  const recommended = BUY_PAYMENT_METHODS.filter(m => m.recommended);
  const others = BUY_PAYMENT_METHODS.filter(m => !m.recommended);
  
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
      <div className="w-full bg-[#1a1a1a] rounded-t-2xl max-h-[80vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-4 py-4">
          <span className="text-white font-medium text-lg">Pay with</span>
          <button onClick={onClose} className="text-gray-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4">
          {/* Recommended */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Recommended</span>
            <span className="text-gray-500 text-sm">Price</span>
          </div>
          {recommended.map((method) => (
            <button key={method.id} onClick={() => { onSelect(method); onClose(); }} className={`w-full flex items-center justify-between p-4 rounded-xl mb-2 ${selectedMethod === method.id ? 'border border-[#f7a600]' : 'bg-[#252525]'}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#f7a600] rounded-lg flex items-center justify-center text-xs font-bold text-black">P2P</div>
                <span className="text-white">{method.name}</span>
              </div>
              <span className="text-white">{method.price} {fiat}</span>
            </button>
          ))}
          
          {/* Others */}
          <div className="flex items-center gap-1 mb-2 mt-4">
            <span className="text-gray-500 text-sm">Others</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="text-gray-500" /></svg>
          </div>
          {others.map((method) => (
            <button key={method.id} onClick={() => { onSelect(method); onClose(); }} className={`w-full flex items-center justify-between p-4 rounded-xl mb-2 ${selectedMethod === method.id ? 'border border-[#f7a600]' : 'bg-[#252525]'}`}>
              <div className="flex items-center gap-3">
                {method.isBalance ? (
                  <div className="w-8 h-8 bg-[#f7a600] rounded-full flex items-center justify-center text-white text-lg">$</div>
                ) : (
                  <div className="w-8 h-8 bg-[#252525] border border-gray-600 rounded-lg flex items-center justify-center text-xs text-gray-400">
                    {method.name.includes('BLIK') ? 'blik' : method.name.includes('Google') ? 'G' : '💳'}
                  </div>
                )}
                <div className="text-left">
                  <span className="text-white">{method.name}</span>
                  {method.isBalance && <span className="text-[#f7a600] ml-2 text-sm">Deposit</span>}
                  {method.description && <p className="text-gray-500 text-xs">{method.description}</p>}
                </div>
              </div>
              <span className="text-white">{method.price} {fiat}</span>
            </button>
          ))}
        </div>
        
        <div className="p-4">
          <button onClick={onClose} className="w-full bg-[#f7a600] text-black font-semibold py-4 rounded-xl">Confirm</button>
        </div>
      </div>
      <style jsx>{`@keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } } .animate-slide-up { animation: slide-up 0.3s ease-out; }`}</style>
    </div>
  );
}

// Receive Method Modal (Sell tab)
function ReceiveMethodModal({ isOpen, onClose, selectedMethod, onSelect, fiat }: { isOpen: boolean; onClose: () => void; selectedMethod: string; onSelect: (method: PaymentMethod) => void; fiat: string }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
      <div className="w-full bg-[#1a1a1a] rounded-t-2xl max-h-[80vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-4 py-4">
          <span className="text-white font-medium text-lg">Receive Method</span>
          <button onClick={onClose} className="text-gray-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Recommended</span>
            <span className="text-gray-500 text-sm">Price</span>
          </div>
          {SELL_RECEIVE_METHODS.map((method) => (
            <button key={method.id} onClick={() => { onSelect(method); onClose(); }} className={`w-full flex items-center justify-between p-4 rounded-xl mb-2 ${selectedMethod === method.id ? 'border border-[#f7a600]' : 'bg-[#252525]'}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#f7a600] rounded-lg flex items-center justify-center text-xs font-bold text-black">P2P</div>
                <span className="text-white">{method.name}</span>
              </div>
              <span className="text-white">{method.price} {fiat}</span>
            </button>
          ))}
        </div>
        
        <div className="p-4">
          <button onClick={onClose} className="w-full bg-[#f7a600] text-black font-semibold py-4 rounded-xl">Confirm</button>
        </div>
      </div>
      <style jsx>{`@keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } } .animate-slide-up { animation: slide-up 0.3s ease-out; }`}</style>
    </div>
  );
}

// Select Sell Coin Modal (with balance)
function SelectSellCoinModal({ isOpen, onClose, selectedCoin, onSelect, fiat }: { isOpen: boolean; onClose: () => void; selectedCoin: string; onSelect: (coin: string) => void; fiat: string }) {
  const [search, setSearch] = useState('');
  const [hideZero, setHideZero] = useState(false);
  if (!isOpen) return null;
  
  const filtered = CRYPTO_COINS.filter(c => c.symbol.toLowerCase().includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase()));
  const alphabet = '#↑ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  return (
    <div className="fixed inset-0 bg-[#0d0d0d] z-50 flex flex-col">
      <div className="px-4 py-3">
        <div className="relative flex items-center">
          <svg className="absolute left-3 text-gray-500" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          <input type="text" placeholder="Please enter coin type" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#1a1a1a] rounded-lg py-3 pl-10 pr-20 text-white placeholder-gray-500 outline-none" autoFocus />
          <button onClick={onClose} className="absolute right-3 text-gray-400 text-sm">Cancel</button>
        </div>
      </div>
      
      {/* Hide zero balances */}
      <div className="px-4 mb-4">
        <button onClick={() => setHideZero(!hideZero)} className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${hideZero ? 'bg-[#f7a600] border-[#f7a600]' : 'border-gray-500'}`}>
            {hideZero && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
          </div>
          <span className="text-gray-400 text-sm">Hide zero balances</span>
        </button>
      </div>
      
      <div className="flex flex-1">
        <div className="flex-1 overflow-y-auto px-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Crypto</span>
            <span className="text-gray-500 text-sm">Funding Account</span>
          </div>
          {filtered.map((coin) => (
            <button key={coin.symbol} onClick={() => { onSelect(coin.symbol); onClose(); }} className="w-full flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <CoinIcon symbol={coin.symbol} size={32} />
                <span className="text-white">{coin.symbol}</span>
              </div>
              <div className="text-right">
                <p className="text-white">0.0000</p>
                <p className="text-gray-500 text-xs">≈ 0.00 {fiat}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="w-6 flex flex-col items-center justify-center text-[10px] text-gray-500">
          {alphabet.map((letter) => <span key={letter} className="py-[1px]">{letter}</span>)}
        </div>
      </div>
    </div>
  );
}

// Convert Coin/Fiat Modal
function ConvertSelectModal({ isOpen, onClose, type, selectedValue, onSelect }: { isOpen: boolean; onClose: () => void; type: 'crypto' | 'fiat'; selectedValue: string; onSelect: (value: string) => void }) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'crypto' | 'fiat'>(type);
  if (!isOpen) return null;
  
  const filteredCoins = CRYPTO_COINS.filter(c => c.symbol.toLowerCase().includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase()));
  const filteredFiat = FIAT_CURRENCIES.filter(c => c.code.toLowerCase().includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase()));
  
  return (
    <div className="fixed inset-0 bg-[#0d0d0d] z-50 flex flex-col">
      <div className="px-4 py-3">
        <div className="relative flex items-center">
          <svg className="absolute left-3 text-gray-500" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          <input type="text" placeholder="Please select your preferred pair" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#1a1a1a] rounded-lg py-3 pl-10 pr-20 text-white placeholder-gray-500 outline-none" autoFocus />
          <button onClick={onClose} className="absolute right-3 text-gray-400 text-sm">Cancel</button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="px-4 mb-4 flex gap-6 border-b border-gray-800">
        <button onClick={() => setActiveTab('crypto')} className={`pb-3 font-medium ${activeTab === 'crypto' ? 'text-white border-b-2 border-white' : 'text-gray-500'}`}>Crypto</button>
        <button onClick={() => setActiveTab('fiat')} className={`pb-3 font-medium ${activeTab === 'fiat' ? 'text-white border-b-2 border-white' : 'text-gray-500'}`}>Fiat</button>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4">
        {activeTab === 'crypto' ? (
          filteredCoins.map((coin) => (
            <button key={coin.symbol} onClick={() => { onSelect(coin.symbol); onClose(); }} className="w-full flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <CoinIcon symbol={coin.symbol} size={32} />
                <div className="text-left">
                  <p className="text-white font-medium">{coin.symbol}</p>
                  <p className="text-gray-500 text-sm">{coin.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white">0</p>
                <p className="text-gray-500 text-xs">≈$ 0</p>
              </div>
            </button>
          ))
        ) : (
          filteredFiat.map((currency) => (
            <button key={currency.code} onClick={() => { onSelect(currency.code); onClose(); }} className="w-full flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <FiatIcon code={currency.code} size={32} />
                <div className="text-left">
                  <p className="text-white font-medium">{currency.code}</p>
                  <p className="text-gray-500 text-sm">{currency.name}</p>
                </div>
              </div>
              <p className="text-white">0</p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// Orders Modal
function OrdersModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('one-click');
  const [subTab, setSubTab] = useState('buy-sell');
  if (!isOpen) return null;
  
  const tabs = ['One-Click Buy', 'P2P Trading', 'Fiat Deposit', 'Fiat Withdrawal', 'Convert'];
  
  return (
    <div className="fixed inset-0 bg-[#0d0d0d] z-50 flex flex-col">
      <div className="flex items-center px-4 py-4">
        <button onClick={onClose} className="text-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-lg font-semibold text-white flex-1 text-center mr-8">Orders</h1>
      </div>
      
      {/* Tabs */}
      <div className="px-4 overflow-x-auto">
        <div className="flex gap-4 border-b border-gray-800 whitespace-nowrap">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '-'))} className={`pb-3 text-sm ${activeTab === tab.toLowerCase().replace(' ', '-') ? 'text-white border-b-2 border-white' : 'text-gray-500'}`}>{tab}</button>
          ))}
        </div>
      </div>
      
      {/* Sub tabs */}
      <div className="px-4 py-3 flex gap-2">
        <button onClick={() => setSubTab('buy-sell')} className={`px-4 py-2 rounded-full text-sm ${subTab === 'buy-sell' ? 'bg-[#252525] text-white' : 'text-gray-500'}`}>Buy / Sell</button>
        <button onClick={() => setSubTab('recurring')} className={`px-4 py-2 rounded-full text-sm ${subTab === 'recurring' ? 'bg-[#252525] text-white' : 'text-gray-500'}`}>Recurring Buy</button>
      </div>
      
      {/* Filters */}
      <div className="px-4 py-2 flex gap-4">
        <button className="text-gray-400 text-sm flex items-center gap-1">All Types <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg></button>
        <button className="text-gray-400 text-sm flex items-center gap-1">All Statuses <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg></button>
      </div>
      
      {/* Empty state */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-24 h-24 mb-4">
          <div className="w-full h-full bg-gradient-to-br from-[#4a3d1a] to-[#2a2a2a] rounded-lg transform rotate-12 flex items-center justify-center">
            <div className="w-16 h-12 bg-[#1a1a1a] rounded-md flex flex-col items-center justify-center">
              <div className="w-10 h-1 bg-[#f7a600] rounded mb-1"></div>
              <div className="w-8 h-1 bg-[#f7a600] rounded mb-1"></div>
              <div className="w-6 h-1 bg-[#f7a600] rounded"></div>
            </div>
          </div>
        </div>
        <p className="text-gray-500">No orders found</p>
      </div>
    </div>
  );
}

// Menu Modal (three dots)
function MenuModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  
  const menuItems = [
    { icon: '🔄', label: 'Recurring Buy' },
    { icon: '🎫', label: 'Coupon' },
    { icon: '💎', label: 'VIP Benefits' },
    { icon: '❓', label: 'FAQs' },
    { icon: '📖', label: 'User Guide' },
    { icon: '📝', label: 'Submit trading materials' },
  ];
  
  return (
    <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose}>
      <div className="absolute top-12 right-4 bg-[#1a1a1a] rounded-xl p-2 min-w-[200px]" onClick={e => e.stopPropagation()}>
        {menuItems.map((item, i) => (
          <button key={i} className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#252525] rounded-lg">
            <span className="text-[#f7a600]">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============== MAIN COMPONENT ==============
export default function FiatDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'convert'>('buy');
  
  // Buy state
  const [buyAmount, setBuyAmount] = useState('');
  const [buyCoin, setBuyCoin] = useState('USDT');
  const [buyFiat, setBuyFiat] = useState('PLN');
  const [buyPaymentMethod, setBuyPaymentMethod] = useState<PaymentMethod | null>(BUY_PAYMENT_METHODS[0]);
  
  // Sell state
  const [sellAmount, setSellAmount] = useState('');
  const [sellCoin, setSellCoin] = useState('USDT');
  const [sellFiat, setSellFiat] = useState('PLN');
  const [sellReceiveMethod, setSellReceiveMethod] = useState<PaymentMethod | null>(SELL_RECEIVE_METHODS[0]);
  
  // Convert state
  const [convertFromCoin, setConvertFromCoin] = useState('USDT');
  const [convertToCoin, setConvertToCoin] = useState('BTC');
  const [convertAmount, setConvertAmount] = useState('');
  
  // Modals
  const [showBuyCoinModal, setShowBuyCoinModal] = useState(false);
  const [showBuyFiatModal, setShowBuyFiatModal] = useState(false);
  const [showPayWithModal, setShowPayWithModal] = useState(false);
  const [showSellCoinModal, setShowSellCoinModal] = useState(false);
  const [showSellFiatModal, setShowSellFiatModal] = useState(false);
  const [showReceiveMethodModal, setShowReceiveMethodModal] = useState(false);
  const [showConvertFromModal, setShowConvertFromModal] = useState(false);
  const [showConvertToModal, setShowConvertToModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);

  const formatNumber = (num: string) => {
    if (!num) return '0';
    return num;
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {loading && <LoadingSpinner />}
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <button onClick={() => router.back()} className="text-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowOrdersModal(true)} className="text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
          </button>
          <button onClick={() => setShowMenuModal(true)} className="text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="px-4 mb-6">
        <div className="bg-[#1a1a1a] rounded-full p-1 flex">
          <button onClick={() => setActiveTab('buy')} className={`flex-1 py-3 rounded-full font-medium text-sm ${activeTab === 'buy' ? 'bg-[#252525] text-white' : 'text-gray-400'}`}>Buy</button>
          <button onClick={() => setActiveTab('sell')} className={`flex-1 py-3 rounded-full font-medium text-sm ${activeTab === 'sell' ? 'bg-[#252525] text-white' : 'text-gray-400'}`}>Sell</button>
          <button onClick={() => setActiveTab('convert')} className={`flex-1 py-3 rounded-full font-medium text-sm ${activeTab === 'convert' ? 'bg-[#252525] text-white' : 'text-gray-400'}`}>Convert</button>
        </div>
      </div>
      
      {/* Buy Tab */}
      {activeTab === 'buy' && (
        <div className="px-4">
          {/* Amount Input */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-5xl font-light text-gray-600">{buyAmount || '0'}</span>
              <button onClick={() => setShowBuyFiatModal(true)} className="flex items-center gap-1">
                <FiatIcon code={buyFiat} size={28} />
                <span className="text-white text-lg">{buyFiat}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
              </button>
            </div>
            <p className="text-gray-500 text-sm">↕ 0 {buyCoin}</p>
          </div>
          
          {/* Buy Coin Selection */}
          <div className="bg-[#1a1a1a] rounded-xl p-4 mb-3">
            <button onClick={() => setShowBuyCoinModal(true)} className="w-full flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CoinIcon symbol={buyCoin} size={40} />
                <div className="text-left">
                  <p className="text-gray-500 text-sm">Buy</p>
                  <p className="text-white font-medium">{buyCoin}</p>
                </div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
          
          {/* Pay With Selection */}
          <div className="bg-[#1a1a1a] rounded-xl p-4 mb-6">
            <button onClick={() => setShowPayWithModal(true)} className="w-full flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f7a600] rounded-lg flex items-center justify-center text-xs font-bold text-black">P2P</div>
                <div className="text-left">
                  <p className="text-gray-500 text-sm">Pay with</p>
                  <p className="text-white font-medium">{buyPaymentMethod?.name || 'Select'}</p>
                </div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
          
          {/* Min Amount Button */}
          <button className="w-full border border-gray-600 rounded-full py-3 text-gray-400 mb-6">Min. Amount</button>
          
          {/* Numpad */}
          <div className="grid grid-cols-3 gap-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'].map((key) => (
              <button key={key} onClick={() => {
                if (key === 'del') setBuyAmount(buyAmount.slice(0, -1));
                else if (key === '.' && buyAmount.includes('.')) return;
                else setBuyAmount(buyAmount + key);
              }} className="py-4 text-2xl text-white">
                {key === 'del' ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto"><path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z" /><line x1="18" y1="9" x2="12" y2="15" /><line x1="12" y1="9" x2="18" y2="15" /></svg> : key}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Sell Tab */}
      {activeTab === 'sell' && (
        <div className="px-4">
          {/* Amount Input */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-5xl font-light text-gray-600">{sellAmount || '0'}</span>
              <span className="text-white text-lg">{sellCoin}</span>
            </div>
            <p className="text-gray-500 text-sm">↕ 0 {sellFiat}</p>
          </div>
          
          {/* Sell Coin Selection */}
          <div className="bg-[#1a1a1a] rounded-xl p-4 mb-3">
            <button onClick={() => setShowSellCoinModal(true)} className="w-full flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CoinIcon symbol={sellCoin} size={40} />
                <div className="text-left">
                  <p className="text-gray-500 text-sm">Sell</p>
                  <p className="text-white font-medium">{sellCoin}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-sm">Available</p>
                <p className="text-white">0 {sellCoin}</p>
              </div>
            </button>
          </div>
          
          {/* Receive Method Selection */}
          <div className="bg-[#1a1a1a] rounded-xl p-4 mb-6">
            <button onClick={() => setShowReceiveMethodModal(true)} className="w-full flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f7a600] rounded-lg flex items-center justify-center text-xs font-bold text-black">P2P</div>
                <div className="text-left">
                  <p className="text-gray-500 text-sm">Receive Method</p>
                  <p className="text-white font-medium">{sellReceiveMethod?.name || 'Select'}</p>
                </div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
          
          {/* Next Button */}
          <button className="w-full bg-[#8b7355] text-white font-semibold py-4 rounded-xl mb-6">Next</button>
          
          {/* Numpad */}
          <div className="grid grid-cols-3 gap-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'].map((key) => (
              <button key={key} onClick={() => {
                if (key === 'del') setSellAmount(sellAmount.slice(0, -1));
                else if (key === '.' && sellAmount.includes('.')) return;
                else setSellAmount(sellAmount + key);
              }} className="py-4 text-2xl text-white">
                {key === 'del' ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto"><path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z" /><line x1="18" y1="9" x2="12" y2="15" /><line x1="12" y1="9" x2="18" y2="15" /></svg> : key}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Convert Tab */}
      {activeTab === 'convert' && (
        <div className="px-4">
          {/* Chart Icon */}
          <div className="flex justify-end mb-4">
            <button className="text-gray-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
            </button>
          </div>
          
          {/* From */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">From</span>
              <button className="text-gray-500 text-sm flex items-center gap-1">
                Available balance 0 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <button onClick={() => setShowConvertFromModal(true)} className="flex items-center gap-2">
                <CoinIcon symbol={convertFromCoin} size={24} />
                <span className="text-white">{convertFromCoin}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
              </button>
              <div className="flex items-center gap-2">
                <input type="text" value={convertAmount} onChange={(e) => setConvertAmount(e.target.value)} placeholder="0.01-50,000" className="bg-transparent text-white text-right outline-none w-32" />
                <button className="text-[#f7a600]">Max</button>
              </div>
            </div>
          </div>
          
          {/* Swap Icon */}
          <div className="flex justify-center my-4">
            <button className="w-10 h-10 bg-[#1a1a1a] rounded-full flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4" /></svg>
            </button>
          </div>
          
          {/* To */}
          <div className="mb-6">
            <span className="text-gray-500 text-sm mb-2 block">To</span>
            <div className="flex items-center justify-between">
              <button onClick={() => setShowConvertToModal(true)} className="flex items-center gap-2">
                <CoinIcon symbol={convertToCoin} size={24} />
                <span className="text-white">{convertToCoin}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
              </button>
              <span className="text-gray-500">--</span>
            </div>
          </div>
          
          {/* Quote Button */}
          <button className="w-full bg-[#8b7355] text-white font-semibold py-4 rounded-xl">Quote</button>
        </div>
      )}
      
      {/* Modals */}
      <SelectCoinModal isOpen={showBuyCoinModal} onClose={() => setShowBuyCoinModal(false)} selectedCoin={buyCoin} onSelect={setBuyCoin} />
      <SelectFiatModal isOpen={showBuyFiatModal} onClose={() => setShowBuyFiatModal(false)} selectedFiat={buyFiat} onSelect={setBuyFiat} />
      <PayWithModal isOpen={showPayWithModal} onClose={() => setShowPayWithModal(false)} selectedMethod={buyPaymentMethod?.id || ''} onSelect={setBuyPaymentMethod} fiat={buyFiat} />
      <SelectSellCoinModal isOpen={showSellCoinModal} onClose={() => setShowSellCoinModal(false)} selectedCoin={sellCoin} onSelect={setSellCoin} fiat={sellFiat} />
      <SelectFiatModal isOpen={showSellFiatModal} onClose={() => setShowSellFiatModal(false)} selectedFiat={sellFiat} onSelect={setSellFiat} />
      <ReceiveMethodModal isOpen={showReceiveMethodModal} onClose={() => setShowReceiveMethodModal(false)} selectedMethod={sellReceiveMethod?.id || ''} onSelect={setSellReceiveMethod} fiat={sellFiat} />
      <ConvertSelectModal isOpen={showConvertFromModal} onClose={() => setShowConvertFromModal(false)} type="crypto" selectedValue={convertFromCoin} onSelect={setConvertFromCoin} />
      <ConvertSelectModal isOpen={showConvertToModal} onClose={() => setShowConvertToModal(false)} type="crypto" selectedValue={convertToCoin} onSelect={setConvertToCoin} />
      <OrdersModal isOpen={showOrdersModal} onClose={() => setShowOrdersModal(false)} />
      <MenuModal isOpen={showMenuModal} onClose={() => setShowMenuModal(false)} />
    </div>
  );
}
