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

type TabType = 'active' | 'completed';
type FilterType = 'All' | 'Unpaid' | 'Paid' | 'Appeal In Progress';

export default function OrdersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [filter, setFilter] = useState<FilterType>('All');
  
  const orders: any[] = []; // Empty for now

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
          <h1 className="text-lg font-semibold">Orders</h1>
          <button className="text-gray-400">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></svg>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-6 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-3 font-medium ${activeTab === 'active' ? 'text-white border-b-2 border-white' : 'text-gray-500'}`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`pb-3 font-medium ${activeTab === 'completed' ? 'text-white border-b-2 border-white' : 'text-gray-500'}`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 mb-6">
        <div className="flex gap-2 overflow-x-auto">
          {(['All', 'Unpaid', 'Paid', 'Appeal In Progress'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                filter === f ? 'bg-[#252525] text-white' : 'text-gray-500'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        {orders.length === 0 ? (
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
            <p className="text-gray-500">No Records Found</p>
          </div>
        ) : (
          <div className="w-full">
            {/* Order list would go here */}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0d0d0d] border-t border-gray-800 flex justify-around py-3">
        <button onClick={() => navigateWithLoading('/P2P-Dashboard')} className="flex flex-col items-center gap-1 text-gray-400">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          <span className="text-xs">P2P</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#f7a600]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
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
    </div>
  );
}
