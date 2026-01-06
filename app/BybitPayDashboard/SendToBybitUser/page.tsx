'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

type TabType = 'bybitId' | 'email' | 'phone';

export default function SendToBybitUser() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('bybitId');
  const [inputValue, setInputValue] = useState('');

  const handleNext = () => {
    if (!inputValue) return;
    setLoading(true);
    setTimeout(() => {
      // Navigate to next step or show error
      setLoading(false);
      alert('User not found or Bybit Pay not activated');
    }, 1000);
  };

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'bybitId':
        return 'Enter here';
      case 'email':
        return 'Enter email address';
      case 'phone':
        return 'Enter phone number';
    }
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
          <div className="flex items-center gap-3">
            <button className="text-gray-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M3 10h18" />
              </svg>
            </button>
            <button className="text-gray-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 pb-8">
        {/* Title */}
        <h1 className="text-2xl font-semibold mb-6">Send to Bybit user</h1>

        {/* Tabs */}
        <div className="flex gap-6 mb-6 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('bybitId')}
            className={`pb-3 text-sm font-medium ${
              activeTab === 'bybitId'
                ? 'text-white border-b-2 border-white'
                : 'text-gray-500'
            }`}
          >
            Bybit ID
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`pb-3 text-sm font-medium ${
              activeTab === 'email'
                ? 'text-white border-b-2 border-white'
                : 'text-gray-500'
            }`}
          >
            Email
          </button>
          <button
            onClick={() => setActiveTab('phone')}
            className={`pb-3 text-sm font-medium ${
              activeTab === 'phone'
                ? 'text-white border-b-2 border-white'
                : 'text-gray-500'
            }`}
          >
            Phone
          </button>
        </div>

        {/* Input */}
        <div className="mb-6">
          <div className="relative">
            <input
              type={activeTab === 'email' ? 'email' : 'text'}
              placeholder={getPlaceholder()}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-[#1a1a1a] rounded-xl py-4 px-4 pr-12 text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-gray-600"
            />
            <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={!inputValue}
          className="w-full bg-[#8b7355] text-white font-semibold py-4 rounded-xl mb-6 disabled:bg-[#4a3d2a] disabled:text-gray-500"
        >
          Next
        </button>

        {/* Referral Message */}
        <p className="text-sm text-gray-400">
          Your friends haven&apos;t activated Bybit Pay yet? Invite them now and earn up to 250 USDT!{' '}
          <span className="text-[#f7a600] cursor-pointer">Refer Now</span>
        </p>
      </div>
    </div>
  );
}