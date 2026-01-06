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

export default function PaymentLimits() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const limits = {
    single: '21,746,230.68',
    daily: { limit: '28,994,974.25', used: '0.00', remaining: '28,994,974.25' },
    monthly: { limit: '72,487,435.62', used: '0.00', remaining: '72,487,435.62' },
    yearly: { limit: '144,974,871.25', used: '0.00', remaining: '144,974,871.25' },
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {loading && <LoadingSpinner />}
      <div className="sticky top-0 z-10 bg-[#0d0d0d] px-4 py-4">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="text-white p-2 -ml-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold flex-1 text-center mr-8">Payment Limits</h1>
        </div>
      </div>
      <div className="px-4 pb-8">
        <p className="text-gray-500 text-sm mb-6">Single Payment Limit {limits.single} ARS</p>
        
        {/* Daily Limit */}
        <div className="mb-8">
          <h3 className="text-white font-semibold mb-4">Daily Limit</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Daily Payment Limit</span>
              <span className="text-white">{limits.daily.limit} ARS</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Used</span>
              <span className="text-white">{limits.daily.used} ARS</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Remaining</span>
              <span className="text-white">{limits.daily.remaining} ARS</span>
            </div>
          </div>
        </div>

        {/* Monthly Limit */}
        <div className="mb-8">
          <h3 className="text-white font-semibold mb-4">Monthly Limit</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Monthly Payment Limit</span>
              <span className="text-white">{limits.monthly.limit} ARS</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Used</span>
              <span className="text-white">{limits.monthly.used} ARS</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Remaining</span>
              <span className="text-white">{limits.monthly.remaining} ARS</span>
            </div>
          </div>
        </div>

        {/* Yearly Limit */}
        <div>
          <h3 className="text-white font-semibold mb-4">Yearly Limit</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Yearly Payment Limit</span>
              <span className="text-white">{limits.yearly.limit} ARS</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Used</span>
              <span className="text-white">{limits.yearly.used} ARS</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Remaining</span>
              <span className="text-white">{limits.yearly.remaining} ARS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}