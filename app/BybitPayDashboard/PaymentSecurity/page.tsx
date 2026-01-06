'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

export default function PaymentSecurity() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [passwordFreePayment, setPasswordFreePayment] = useState(false);
  const [limitAmount, setLimitAmount] = useState('0');

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.back();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col">
      {loading && <LoadingSpinner />}
      <div className="sticky top-0 z-10 bg-[#0d0d0d] px-4 py-4">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="text-white p-2 -ml-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold flex-1 text-center mr-8">Payment Security</h1>
        </div>
      </div>
      <div className="flex-1 px-4 pb-8">
        {/* Passkeys */}
        <button className="w-full flex items-center justify-between py-4 border-b border-gray-800/30">
          <span className="text-white">Passkeys</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        {/* Password-free payment */}
        <div className="py-4 border-b border-gray-800/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1">
              <span className="text-white">Password-free payment</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="text-gray-500" />
                <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-500" />
              </svg>
            </div>
            <button
              onClick={() => setPasswordFreePayment(!passwordFreePayment)}
              className={`w-12 h-6 rounded-full transition-colors ${passwordFreePayment ? 'bg-[#f7a600]' : 'bg-gray-600'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${passwordFreePayment ? 'translate-x-6' : 'translate-x-1'}`}></div>
            </button>
          </div>

          {/* Set limit */}
          <div className="mb-4">
            <label className="text-gray-500 text-sm mb-2 block">Set limit</label>
            <div className="bg-[#1a1a1a] rounded-xl py-4 px-4 flex items-center justify-between">
              <input
                type="text"
                value={limitAmount}
                onChange={(e) => setLimitAmount(e.target.value)}
                className="flex-1 bg-transparent text-white outline-none"
                placeholder="0"
              />
              <span className="text-white">USD</span>
            </div>
          </div>

          <p className="text-gray-500 text-sm">
            Password-free limit: 100 USD. Payments within this amount need no password.
          </p>
        </div>
      </div>

      {/* Confirm Button */}
      <div className="px-4 py-4 bg-[#0d0d0d]">
        <button
          onClick={handleConfirm}
          className="w-full bg-[#8b7355] text-white font-semibold py-4 rounded-xl"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}