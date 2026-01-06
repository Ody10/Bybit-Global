'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

function CollectingBillsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  
  const totalAmount = searchParams.get('amount') || '10';
  const currency = searchParams.get('currency') || 'USDT';
  const numberOfPeople = searchParams.get('people') || '3';
  const eachPersonPays = searchParams.get('each') || '3.33333333';
  
  const userEmail = 'ais***@****';
  const bybitId = '408053641';

  // Calculate expiry time (24 hours from now)
  const [expiryTime, setExpiryTime] = useState('');
  
  useEffect(() => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    expiry.setHours(expiry.getHours() + 4);
    setExpiryTime(expiry.toISOString().replace('T', ' ').slice(0, 19));
  }, []);

  const handleSaveQRCode = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('QR Code saved!');
    }, 500);
  };

  const handleShareLink = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigator.clipboard.writeText(`https://bybit.com/pay/split/${bybitId}`);
      alert('Link copied to clipboard!');
    }, 500);
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
          <h1 className="text-lg font-semibold">Collecting bills</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="px-4 pb-8">
        {/* QR Code Card */}
        <div className="bg-[#1a1a1a] rounded-2xl p-6 mb-6 relative overflow-hidden">
          {/* Decorative dots */}
          <div className="absolute top-4 left-4 flex gap-1">
            <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
          </div>
          <div className="absolute top-4 right-4 flex gap-1">
            <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
          </div>
          
          {/* User Info */}
          <div className="text-center mb-4 pt-4">
            <p className="text-white font-medium">{userEmail}</p>
            <div className="flex items-center justify-center gap-1 text-gray-500 text-sm">
              <span>{bybitId}(Bybit ID)</span>
              <button className="text-gray-400">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
              </button>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-4 relative">
            {/* Side dots */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 flex flex-col gap-1">
              <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
            </div>
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex flex-col gap-1">
              <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
            </div>
            
            <div className="bg-white p-3 rounded-xl relative">
              <Image
                src="/images/bybit-qr.png"
                alt="QR Code"
                width={180}
                height={180}
                className="w-44 h-44"
              />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-10 h-10 bg-[#f7a600] rounded-full flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="black">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-white mb-2">Pay me via this QR code</p>
          
          {/* Amount Display */}
          <p className="text-center text-3xl font-bold text-white mb-4">
            {eachPersonPays} {currency}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSaveQRCode}
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-600 rounded-xl text-white hover:bg-gray-800 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              <span>Save QR Code</span>
            </button>
            <button
              onClick={handleShareLink}
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-600 rounded-xl text-white hover:bg-gray-800 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
              </svg>
              <span>Share Link</span>
            </button>
          </div>
        </div>

        {/* Bill Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Total amount to split</span>
            <span className="text-white">{totalAmount} {currency}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Number of people</span>
            <span className="text-white">{numberOfPeople}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Each person pays</span>
            <span className="text-white">{eachPersonPays} {currency}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Valid until</span>
            <span className="text-white">{expiryTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CollectingBills() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CollectingBillsContent />
    </Suspense>
  );
}