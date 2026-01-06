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

export default function AdsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'all'>('active');
  const [activeMode, setActiveMode] = useState(true);
  
  const ads: any[] = []; // Empty for now

  const navigateWithLoading = (path: string) => {
    setLoading(true);
    setTimeout(() => router.push(path), 500);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white pb-20">
      {loading && <LoadingSpinner />}
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0d0d0d] px-4 py-4">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-lg font-semibold">My Ads</h1>
          <button className="text-gray-400">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
          </button>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="px-4 mb-4">
        <div className="bg-[#4a3d1a] rounded-lg p-3 flex items-start gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#f7a600"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          <p className="text-gray-300 text-sm flex-1">
            No ad posting permission. Start as a trial merchant with zero deposit application.
            <span className="text-[#f7a600] ml-1">Try now</span>
          </p>
        </div>
      </div>

      {/* Tabs & Add Button */}
      <div className="px-4 mb-4 flex items-center justify-between">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('active')}
            className={`font-medium ${activeTab === 'active' ? 'text-white' : 'text-gray-500'}`}
          >
            Active(0)
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`font-medium ${activeTab === 'all' ? 'text-white' : 'text-gray-500'}`}
          >
            All
          </button>
        </div>
        <button className="w-8 h-8 bg-[#252525] rounded-lg flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
        </button>
      </div>

      {/* Active Mode Toggle */}
      <div className="px-4 mb-6">
        <div className="bg-[#1a1a1a] rounded-xl p-4 flex items-center justify-between">
          <span className="text-white font-medium">Active Mode</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveMode(!activeMode)}
              className={`w-12 h-6 rounded-full transition-colors ${activeMode ? 'bg-[#f7a600]' : 'bg-gray-600'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${activeMode ? 'translate-x-6' : 'translate-x-1'}`}></div>
            </button>
            <span className="text-[#f7a600] text-sm">Automatic Inactive Mode</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        {ads.length === 0 ? (
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 mb-4 relative">
              <div className="w-full h-full bg-gradient-to-br from-[#4a3d1a] to-[#2a2a2a] rounded-lg transform rotate-12 flex items-center justify-center">
                <div className="w-16 h-12 bg-[#1a1a1a] rounded-md flex flex-col items-center justify-center">
                  <div className="w-10 h-1 bg-[#f7a600] rounded mb-1"></div>
                  <div className="w-8 h-1 bg-[#f7a600] rounded mb-1"></div>
                  <div className="w-6 h-1 bg-[#f7a600] rounded"></div>
                </div>
              </div>
            </div>
            <p className="text-gray-500 mb-4">Oops, you do not have any active ads.</p>
            <button className="px-12 py-3 border border-dashed border-gray-600 rounded-xl text-white">
              Post Now
            </button>
          </div>
        ) : (
          <div className="w-full">
            {/* Ads list would go here */}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0d0d0d] border-t border-gray-800 flex justify-around py-3">
        <button onClick={() => navigateWithLoading('/P2P-Dashboard')} className="flex flex-col items-center gap-1 text-gray-400">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          <span className="text-xs">P2P</span>
        </button>
        <button onClick={() => navigateWithLoading('/P2P-Dashboard/Orders')} className="flex flex-col items-center gap-1 text-gray-400">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
          <span className="text-xs">Orders</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#f7a600]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>
          <span className="text-xs">Ads</span>
        </button>
        <button onClick={() => navigateWithLoading('/P2P-Dashboard/Profile')} className="flex flex-col items-center gap-1 text-gray-400">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          <span className="text-xs">Profile</span>
        </button>
      </div>
    </div>
  );
}
