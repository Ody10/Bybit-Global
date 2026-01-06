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

function P2PPaymentMethodModal({ isOpen, onClose, onSelect, selectedMethods }: { isOpen: boolean; onClose: () => void; onSelect: (methods: string[]) => void; selectedMethods: string[] }) {
  const [localSelected, setLocalSelected] = useState<string[]>(selectedMethods);
  const availableMethods = ['Revolut', 'Bank Transfer', 'PayPal', 'Blik', 'Zelle'];
  
  if (!isOpen) return null;

  const toggleMethod = (method: string) => {
    if (localSelected.includes(method)) {
      setLocalSelected(localSelected.filter(m => m !== method));
    } else {
      setLocalSelected([...localSelected, method]);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-[#0d0d0d] z-50 flex flex-col">
      <div className="flex items-center px-4 py-4">
        <button onClick={onClose} className="text-white p-2 -ml-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-lg font-semibold text-white flex-1 text-center mr-8">P2P payment method</h1>
      </div>
      <div className="flex-1 px-4">
        <div className="flex flex-col items-center py-8">
          <div className="w-20 h-20 mb-4 relative">
            <div className="w-full h-full bg-gradient-to-br from-[#4a3d1a] to-[#2a2a2a] rounded-lg transform rotate-12 flex items-center justify-center">
              <div className="w-14 h-10 bg-[#1a1a1a] rounded-md flex flex-col items-center justify-center">
                <div className="w-8 h-1 bg-[#f7a600] rounded mb-1"></div>
                <div className="w-6 h-1 bg-[#f7a600] rounded mb-1"></div>
                <div className="w-4 h-1 bg-[#f7a600] rounded"></div>
              </div>
            </div>
          </div>
          <p className="text-gray-500">Not available yet</p>
        </div>
        <div className="mt-4">
          <p className="text-gray-500 text-sm mb-3">Add supported payment methods</p>
          {availableMethods.map((method) => (
            <button key={method} onClick={() => toggleMethod(method)} className="w-full flex items-center justify-between py-4 border-b border-gray-800/30">
              <div className="flex items-center gap-2">
                <span className={localSelected.includes(method) ? 'text-[#22c55e]' : 'text-[#f7a600]'}>|</span>
                <span className="text-white">{method}</span>
              </div>
              {localSelected.includes(method) ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#22c55e"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><path d="M12 5v14M5 12h14" /></svg>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 py-4">
        <button onClick={() => { onSelect(localSelected); onClose(); }} className="w-full bg-[#f7a600] text-black font-semibold py-4 rounded-xl">Confirm</button>
      </div>
    </div>
  );
}

function SellUSDCContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'crypto' | 'fiat'>('crypto');
  const [amount, setAmount] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);
  
  const price = searchParams.get('price') || '75,251.375';
  const currency = searchParams.get('currency') || 'EUR';
  
  const merchant = { username: 'Ummu', orders: 369, completionRate: 99, paymentDuration: '30m', terms: "Thanks for choosed us 🤝💯 drop your IBAN and name, I'm paying Asap, Due to the account limit I'm paying with Third party account. 💯💯💯💯 ✅✅✅✅" };

  const handleSell = () => {
    if (!amount || selectedPaymentMethods.length === 0) return;
    setLoading(true);
    setTimeout(() => { alert('Order placed successfully!'); router.push('/P2P-Dashboard/Orders'); }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col">
      {loading && <LoadingSpinner />}
      <div className="sticky top-0 z-10 bg-[#0d0d0d] px-4 py-4">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="text-white"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg></button>
          <h1 className="text-lg font-semibold">Sell USDC</h1>
          <div className="w-6"></div>
        </div>
      </div>
      <div className="px-4 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div><span className="text-gray-500 text-sm">Price </span><span className="text-[#ef4444] font-semibold">{price} {currency}</span><span className="text-gray-500 text-sm ml-1">43s</span></div>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4 mb-4">
          <div className="flex gap-4 mb-4">
            <button onClick={() => setActiveTab('crypto')} className={`font-medium ${activeTab === 'crypto' ? 'text-white' : 'text-gray-500'}`}>With Crypto</button>
            <button onClick={() => setActiveTab('fiat')} className={`font-medium ${activeTab === 'fiat' ? 'text-white' : 'text-gray-500'}`}>With Fiat</button>
          </div>
          <div className="flex items-center justify-between mb-2">
            <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="text-3xl font-bold bg-transparent text-white outline-none w-full" />
            <div className="flex items-center gap-2"><span className="text-white">USDC</span><span className="text-gray-500">|</span><button className="text-[#f7a600]">Max</button></div>
          </div>
          <p className="text-gray-500 text-sm mb-2">Limits: 0 - 0 USDC</p>
          <div className="flex items-center gap-1 text-gray-500 text-sm mb-3"><span>Balance: 0.00000000 USDC</span><button className="text-[#22c55e]"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /></svg></button></div>
          <p className="text-gray-500 text-sm">I will receive --</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4 mb-4">
          <button onClick={() => setShowPaymentModal(true)} className="w-full flex items-center gap-2 text-[#f7a600] mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
            <span>Select payment method</span>
          </button>
          {selectedPaymentMethods.length > 0 && <div className="flex flex-wrap gap-2 mb-3">{selectedPaymentMethods.map((method) => (<span key={method} className="bg-[#252525] text-white px-3 py-1 rounded-full text-sm">{method}</span>))}</div>}
          <div className="flex items-center justify-between"><span className="text-gray-400">Payment Duration</span><span className="text-white">{merchant.paymentDuration}</span></div>
        </div>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2"><span className="text-white font-medium">{merchant.username}</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><path d="M9 18l6-6-6-6" /></svg></div>
            <div className="flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" /></svg><span className="text-white">{merchant.completionRate}%</span></div>
          </div>
          <p className="text-gray-500 text-sm mb-4">Order(s) {merchant.orders} | Completion Rate {merchant.completionRate}%</p>
          <div className="bg-[#1a1a1a] rounded-xl p-4">
            <h4 className="text-white font-medium mb-2">Advertiser Terms</h4>
            <div className="flex items-start gap-2 text-gray-400 text-sm mb-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /></svg>
              <p>Merchants may include additional terms in their Advertiser Terms. Please review them carefully before placing an order. In the event of any conflict, the <span className="text-[#f7a600]">P2P Taker Terms of Use</span> and <span className="text-[#f7a600]">P2P Privacy Agreement</span> shall prevail. Violations will not be protected under platform protection.</p>
            </div>
            <p className="text-gray-300 text-sm">{merchant.terms}</p>
          </div>
        </div>
      </div>
      <div className="px-4 py-4 bg-[#0d0d0d] border-t border-gray-800">
        <div className="flex items-center justify-between">
          <div><span className="text-2xl font-bold text-white">0</span><span className="text-white ml-1">USDC</span><p className="text-gray-500 text-sm">Total Payable</p></div>
          <button onClick={handleSell} disabled={!amount || selectedPaymentMethods.length === 0} className="bg-[#ef4444] text-white px-12 py-3 rounded-xl font-medium disabled:opacity-50">Sell</button>
        </div>
      </div>
      <P2PPaymentMethodModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} onSelect={setSelectedPaymentMethods} selectedMethods={selectedPaymentMethods} />
    </div>
  );
}

export default function SellUSDCPage() {
  return (<Suspense fallback={<LoadingSpinner />}><SellUSDCContent /></Suspense>);
}
