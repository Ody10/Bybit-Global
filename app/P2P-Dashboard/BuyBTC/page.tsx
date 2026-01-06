'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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

function BuyBTCContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'fiat' | 'crypto'>('fiat');
  const [amount, setAmount] = useState('');
  
  const price = searchParams.get('price') || '75,571.535';
  const currency = searchParams.get('currency') || 'EUR';
  
  const merchant = { username: 'bestchange.kh', orders: 1009, completionRate: 98, paymentDuration: '15m' };

  const handleBuy = () => {
    if (!amount) return;
    setLoading(true);
    setTimeout(() => { alert('Order placed successfully!'); router.push('/P2P-Dashboard/Orders'); }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col">
      {loading && <LoadingSpinner />}
      <div className="sticky top-0 z-10 bg-[#0d0d0d] px-4 py-4">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="text-white"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg></button>
          <h1 className="text-lg font-semibold">Buy BTC</h1>
          <div className="w-6"></div>
        </div>
      </div>
      <div className="px-4 flex-1">
        <div className="flex items-center justify-between mb-4">
          <div><span className="text-gray-500 text-sm">Price </span><span className="text-[#22c55e] font-semibold">{price} {currency}</span><span className="text-gray-500 text-sm ml-1">41s</span></div>
          <button className="flex items-center gap-1 bg-[#1a1a1a] px-3 py-1 rounded-full">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#22c55e"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
            <span className="text-gray-400 text-sm">Security Protection</span>
          </button>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4 mb-4">
          <div className="flex gap-4 mb-4">
            <button onClick={() => setActiveTab('fiat')} className={`font-medium ${activeTab === 'fiat' ? 'text-white' : 'text-gray-500'}`}>With Fiat</button>
            <button onClick={() => setActiveTab('crypto')} className={`font-medium ${activeTab === 'crypto' ? 'text-white' : 'text-gray-500'}`}>With Crypto</button>
          </div>
          <p className="text-gray-500 text-sm mb-2">Available Balance: 0.000 {currency}</p>
          <div className="flex items-center justify-between mb-2">
            <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="text-3xl font-bold bg-transparent text-white outline-none w-full" />
            <div className="flex items-center gap-2"><span className="text-white">{currency}</span><span className="text-gray-500">|</span><button className="text-[#f7a600]">Max</button></div>
          </div>
          <p className="text-gray-500 text-sm mb-2">Limits: 20 - 1,024.676 {currency}</p>
          <p className="text-gray-500 text-sm">I will receive --</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><span className="text-[#f7a600]">|</span><span className="text-white font-medium">Balance</span></div>
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 bg-[#f7a600] rounded-full flex items-center justify-center"><span className="text-black text-xs">₿</span></div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><path d="M6 9l6 6 6-6" /></svg>
            </div>
          </div>
          <div className="flex items-center justify-between"><span className="text-gray-400">Payment Duration</span><span className="text-white">{merchant.paymentDuration}</span></div>
        </div>
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><span className="text-white font-medium">{merchant.username}</span><span className="text-[#f7a600]">🎖️</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><path d="M9 18l6-6-6-6" /></svg></div>
            <div className="flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" /></svg><span className="text-white">100%</span></div>
          </div>
          <p className="text-gray-500 text-sm">Order(s) {merchant.orders} | Completion Rate {merchant.completionRate}%</p>
        </div>
      </div>
      <div className="px-4 py-4 bg-[#0d0d0d] border-t border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div><span className="text-2xl font-bold text-white">0</span><span className="text-white ml-1">{currency}</span><p className="text-gray-500 text-sm">Total Payable</p></div>
          <button onClick={handleBuy} disabled={!amount} className="bg-[#22c55e] text-white px-12 py-3 rounded-xl font-medium disabled:opacity-50">Buy</button>
        </div>
      </div>
    </div>
  );
}

export default function BuyBTCPage() {
  return (<Suspense fallback={<LoadingSpinner />}><BuyBTCContent /></Suspense>);
}
