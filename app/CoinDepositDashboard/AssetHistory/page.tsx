'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type TabType = 'all' | 'deposit' | 'withdraw' | 'transfer' | 'p2p' | 'fiat';

interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'P2P' | 'FIAT';
  currency: string;
  chain: string;
  amount: number;
  fee: number;
  status: string;
  txHash?: string;
  txUrl?: string;
  toAddress?: string;
  fromAddress?: string;
  depositId?: string;
  withdrawalId?: string;
  explorerName?: string;
  explorerUrl?: string;
  createdAt: string;
  completedAt?: string;
}

export default function AssetHistory() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('deposit');
  const [selectedAsset, setSelectedAsset] = useState('All Assets');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableAssets, setAvailableAssets] = useState<string[]>(['All Assets']);

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: 'All Transactions' },
    { key: 'deposit', label: 'Deposit' },
    { key: 'withdraw', label: 'Withdraw' },
    { key: 'transfer', label: 'Transfer' },
    { key: 'p2p', label: 'P2P' },
    { key: 'fiat', label: 'Fiat Deposit' },
  ];

  useEffect(() => {
    fetchTransactions();
  }, [activeTab, selectedAsset, selectedFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Please log in to view transactions');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      
      // Map tab to transaction type
      if (activeTab === 'deposit') {
        params.append('type', 'DEPOSIT');
      } else if (activeTab === 'withdraw') {
        params.append('type', 'WITHDRAWAL');
      } else if (activeTab === 'transfer') {
        params.append('type', 'TRANSFER');
      } else if (activeTab === 'p2p') {
        params.append('type', 'P2P');
      } else if (activeTab === 'fiat') {
        params.append('type', 'FIAT');
      }
      
      if (selectedAsset !== 'All Assets') {
        params.append('currency', selectedAsset);
      }
      
      if (selectedFilter !== 'All') {
        params.append('status', selectedFilter.toUpperCase());
      }

      const apiUrl = `/api/user/transactions?${params.toString()}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('auth_token');
          router.push('/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setTransactions(data.transactions || []);
        
        // Extract unique assets for filter
        const assets = new Set<string>();
        data.transactions?.forEach((tx: Transaction) => {
          assets.add(tx.currency);
        });
        setAvailableAssets(['All Assets', ...Array.from(assets).sort()]);
      } else {
        setError(data.message || 'Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transactions. Please try again.');
      // Set mock data for development
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch {
      return dateStr;
    }
  };

  const getStatusText = (status: string, type: string) => {
    const statusUpper = status.toUpperCase();
    if (type === 'DEPOSIT') {
      switch (statusUpper) {
        case 'COMPLETED': return 'Succeeded';
        case 'PENDING': return 'Pending';
        case 'CONFIRMING': return 'Confirming';
        case 'FAILED': return 'Failed';
        default: return status;
      }
    } else {
      switch (statusUpper) {
        case 'COMPLETED': return 'Withdrawal Completed';
        case 'PENDING': return 'Pending Verification';
        case 'PROCESSING': return 'Processing';
        case 'AWAITING_CONFIRMATION': return 'Awaiting Confirmation';
        case 'FAILED': return 'Failed';
        case 'CANCELLED': return 'Canceled';
        case 'REJECTED': return 'Rejected';
        default: return status;
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED': return 'text-green-500';
      case 'PENDING': case 'PROCESSING': case 'CONFIRMING': case 'AWAITING_CONFIRMATION': return 'text-yellow-500';
      case 'FAILED': case 'REJECTED': return 'text-red-500';
      case 'CANCELLED': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  const handleTransactionClick = (tx: Transaction) => {
    const params = new URLSearchParams({
      id: tx.id,
      type: tx.type,
    });
    router.push(`/Transaction-Details?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0a0a0a]">
        <div className="flex items-center justify-center p-4 relative">
          <button 
            onClick={() => router.back()} 
            className="absolute left-4 p-2 hover:bg-[#1a1a1a] rounded-lg transition-all"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-[17px] font-semibold">Asset History</h1>
        </div>

        {/* Tabs */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex px-4 gap-6 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 px-1 whitespace-nowrap transition-colors relative text-[15px] ${
                  activeTab === tab.key 
                    ? 'text-white font-medium' 
                    : 'text-gray-500'
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 px-4 py-3">
          <div className="relative">
            <select 
              value={selectedAsset} 
              onChange={(e) => setSelectedAsset(e.target.value)} 
              className="bg-transparent text-white text-[14px] py-1 pr-5 appearance-none cursor-pointer outline-none"
            >
              {availableAssets.map(asset => (
                <option key={asset} value={asset} className="bg-[#1a1a1a]">{asset}</option>
              ))}
            </select>
            <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div className="relative">
            <select 
              value={selectedFilter} 
              onChange={(e) => setSelectedFilter(e.target.value)} 
              className="bg-transparent text-white text-[14px] py-1 pr-5 appearance-none cursor-pointer outline-none"
            >
              <option value="All" className="bg-[#1a1a1a]">All</option>
              <option value="Completed" className="bg-[#1a1a1a]">Completed</option>
              <option value="Pending" className="bg-[#1a1a1a]">Pending</option>
              <option value="Failed" className="bg-[#1a1a1a]">Failed</option>
            </select>
            <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Self-service assistance - only show on deposit tab */}
        {activeTab === 'deposit' && (
          <div className="px-4 py-3 border-t border-[#1a1a1a]">
            <div className="text-[13px]">
              <span className="text-gray-400">Deposit not received? </span>
              <button className="text-[#f7a600] hover:text-yellow-400 transition-colors inline-flex items-center">
                Click here for self-service assistance
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction List */}
      <div className="pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-24 h-24 mb-6 rounded-full bg-[#1a1a1a] flex items-center justify-center">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg text-gray-400 mb-2">Error Loading Transactions</h3>
            <p className="text-sm text-gray-500 text-center max-w-xs mb-4">{error}</p>
            <button 
              onClick={fetchTransactions}
              className="px-6 py-2 bg-[#f7a600] text-black rounded-full font-medium hover:bg-yellow-500 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-24 h-24 mb-6 rounded-full bg-[#1a1a1a] flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg text-gray-400 mb-2">No Transaction History</h3>
            <p className="text-sm text-gray-500 text-center max-w-xs">
              Your transactions will appear here once you make your first deposit or withdrawal
            </p>
          </div>
        ) : (
          <div>
            {transactions.map((tx) => (
              <button
                key={tx.id}
                onClick={() => handleTransactionClick(tx)}
                className="w-full px-4 py-4 hover:bg-[#111] transition-colors text-left flex items-center justify-between"
              >
                {/* Left side - Coin and Date */}
                <div>
                  <div className="text-[15px] font-medium text-white">{tx.currency}</div>
                  <div className="text-[13px] text-gray-500 mt-1">{formatDate(tx.createdAt)}</div>
                </div>
                
                {/* Right side - Amount, Status, Arrow */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[15px] font-medium text-white">
                      {tx.type === 'WITHDRAWAL' ? '-' : '+'}{tx.amount.toFixed(8)}
                    </div>
                    <div className={`text-[13px] flex items-center justify-end gap-1.5 mt-1 ${getStatusColor(tx.status)}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {getStatusText(tx.status, tx.type)}
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}