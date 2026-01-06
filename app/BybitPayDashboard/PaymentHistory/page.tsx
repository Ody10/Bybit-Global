'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

type FilterType = 'All Types' | 'Send' | 'Receive' | 'Split Bill';
type StatusType = 'All Status' | 'Completed' | 'Pending' | 'Failed';

export default function PaymentHistory() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState<FilterType>('All Types');
  const [statusFilter, setStatusFilter] = useState<StatusType>('All Status');
  const [dateFilter, setDateFilter] = useState('Date');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const transactions: any[] = []; // Empty for now

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
          <h1 className="text-lg font-semibold">Payment History</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-2 flex items-center gap-4">
        {/* Type Filter */}
        <div className="relative">
          <button
            onClick={() => setShowTypeDropdown(!showTypeDropdown)}
            className="flex items-center gap-1 text-gray-400 text-sm"
          >
            <span>{typeFilter}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          {showTypeDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-[#252525] rounded-lg py-2 min-w-[120px] z-20">
              {(['All Types', 'Send', 'Receive', 'Split Bill'] as FilterType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setTypeFilter(type);
                    setShowTypeDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#333]"
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status Filter */}
        <div className="relative">
          <button
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className="flex items-center gap-1 text-gray-400 text-sm"
          >
            <span>{statusFilter}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          {showStatusDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-[#252525] rounded-lg py-2 min-w-[120px] z-20">
              {(['All Status', 'Completed', 'Pending', 'Failed'] as StatusType[]).map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setShowStatusDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#333]"
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date Filter */}
        <button className="flex items-center gap-1 text-gray-400 text-sm">
          <span>{dateFilter}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        {transactions.length === 0 ? (
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
            <p className="text-gray-500">No transactions yet</p>
          </div>
        ) : (
          <div className="w-full">
            {/* Transaction list would go here */}
          </div>
        )}
      </div>
    </div>
  );
}