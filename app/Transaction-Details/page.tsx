'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface TransactionDetails {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  currency: string;
  chain: string;
  amount: number;
  fee: number;
  netAmount: number;
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
  confirmedAt?: string;
  account?: string;
}

// Blockchain explorer URLs for different chains
const EXPLORER_URLS: { [key: string]: { name: string; txUrl: string; addressUrl: string } } = {
  'ETH': {
    name: 'Etherscan',
    txUrl: 'https://etherscan.io/tx/',
    addressUrl: 'https://etherscan.io/address/'
  },
  'BSC': {
    name: 'BscScan',
    txUrl: 'https://bscscan.com/tx/',
    addressUrl: 'https://bscscan.com/address/'
  },
  'TRX': {
    name: 'Tronscan',
    txUrl: 'https://tronscan.org/#/transaction/',
    addressUrl: 'https://tronscan.org/#/address/'
  },
  'SOL': {
    name: 'Solscan',
    txUrl: 'https://solscan.io/tx/',
    addressUrl: 'https://solscan.io/account/'
  },
  'BTC': {
    name: 'Blockstream',
    txUrl: 'https://blockstream.info/tx/',
    addressUrl: 'https://blockstream.info/address/'
  },
  'ARB': {
    name: 'Arbiscan',
    txUrl: 'https://arbiscan.io/tx/',
    addressUrl: 'https://arbiscan.io/address/'
  },
  'MATIC': {
    name: 'Polygonscan',
    txUrl: 'https://polygonscan.com/tx/',
    addressUrl: 'https://polygonscan.com/address/'
  },
  'AVAX': {
    name: 'Snowtrace',
    txUrl: 'https://snowtrace.io/tx/',
    addressUrl: 'https://snowtrace.io/address/'
  },
};

function TransactionDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const txId = searchParams.get('id');
  const txType = searchParams.get('type');

  useEffect(() => {
    if (txId && txType) {
      fetchTransactionDetails();
    }
  }, [txId, txType]);

  const fetchTransactionDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/transactions/${txId}?type=${txType}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTransaction(data.transaction);
        }
      }
    } catch (error) {
      console.error('Error fetching transaction details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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

  const getChainDisplayName = (chain: string) => {
    const chainNames: { [key: string]: string } = {
      'ETH': 'Ethereum (ERC20)',
      'BSC': 'BNB Smart Chain (BEP20)',
      'TRX': 'TRON (TRC20)',
      'SOL': 'Solana (SPL)',
      'BTC': 'Bitcoin',
      'ARB': 'Arbitrum One',
      'MATIC': 'Polygon',
      'AVAX': 'Avalanche C-Chain',
    };
    return chainNames[chain] || chain;
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getExplorerUrl = (chain: string, txHash: string) => {
    const explorer = EXPLORER_URLS[chain];
    if (explorer && txHash) {
      return explorer.txUrl + txHash;
    }
    return transaction?.txUrl || null;
  };

  const openBlockchainExplorer = () => {
    if (transaction?.txHash && transaction?.chain) {
      const url = getExplorerUrl(transaction.chain, transaction.txHash);
      if (url) {
        window.open(url, '_blank');
      }
    } else if (transaction?.txUrl) {
      window.open(transaction.txUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center">
        <p className="text-gray-400">Transaction not found</p>
        <button 
          onClick={() => router.back()}
          className="mt-4 text-yellow-500 hover:text-yellow-400"
        >
          Go back
        </button>
      </div>
    );
  }

  const isDeposit = transaction.type === 'DEPOSIT';
  const pageTitle = isDeposit ? 'Deposit Details' : 'Withdrawal Details';
  const addressLabel = isDeposit ? 'Deposit Address' : 'Withdrawal Address';
  const address = isDeposit ? transaction.toAddress : transaction.toAddress;
  const accountLabel = isDeposit ? 'Deposit Account' : 'Withdrawal Account';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
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
          <h1 className="text-[17px] font-semibold">{pageTitle}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4">
        {/* Amount Section */}
        <div className="text-center py-8">
          <p className="text-gray-500 text-[14px] mb-2">Quantity</p>
          <h2 className="text-[28px] font-semibold text-white">
            {transaction.amount} {transaction.currency}
          </h2>
          <div className={`flex items-center justify-center gap-2 mt-2 ${getStatusColor(transaction.status)}`}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-[14px]">{getStatusText(transaction.status, transaction.type)}</span>
          </div>
        </div>

        {/* Details Table */}
        <div className="space-y-0 mt-4">
          {/* Account */}
          <div className="flex justify-between py-4">
            <span className="text-gray-500 text-[14px]">{accountLabel}</span>
            <span className="text-white text-[14px]">Funding Account</span>
          </div>

          {/* Fee - only for withdrawals */}
          {!isDeposit && transaction.fee > 0 && (
            <div className="flex justify-between py-4">
              <span className="text-gray-500 text-[14px]">Fees</span>
              <span className="text-white text-[14px]">{transaction.fee}</span>
            </div>
          )}

          {/* Chain Type */}
          <div className="flex justify-between py-4">
            <span className="text-gray-500 text-[14px]">Chain Type</span>
            <span className="text-white text-[14px]">{getChainDisplayName(transaction.chain)}</span>
          </div>

          {/* Time */}
          <div className="flex justify-between py-4">
            <span className="text-gray-500 text-[14px]">Time</span>
            <span className="text-white text-[14px]">{formatDate(transaction.completedAt || transaction.createdAt)}</span>
          </div>

          {/* Address */}
          {address && (
            <div className="flex justify-between py-4 items-start">
              <span className="text-gray-500 text-[14px] flex-shrink-0">{addressLabel}</span>
              <div className="flex items-start gap-2 ml-4">
                <span className="text-white text-[14px] text-right break-all">{address}</span>
                <button 
                  onClick={() => copyToClipboard(address, 'address')}
                  className="flex-shrink-0 p-1 hover:bg-[#1a1a1a] rounded transition-colors"
                >
                  {copied === 'address' ? (
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Transaction Hash */}
          {transaction.txHash && (
            <div className="flex justify-between py-4 items-start">
              <span className="text-gray-500 text-[14px] flex-shrink-0">Transaction Hash</span>
              <div className="flex items-start gap-2 ml-4">
                <span className="text-white text-[14px] text-right break-all">{transaction.txHash}</span>
                <button 
                  onClick={() => copyToClipboard(transaction.txHash!, 'txHash')}
                  className="flex-shrink-0 p-1 hover:bg-[#1a1a1a] rounded transition-colors"
                >
                  {copied === 'txHash' ? (
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Button */}
      {transaction.txHash && (
        <div className="p-4 pb-8">
          <button
            onClick={openBlockchainExplorer}
            className="w-full py-3.5 border border-gray-600 rounded-lg text-white text-[15px] font-medium hover:bg-[#1a1a1a] transition-colors"
          >
            View in Blockchain Explorer
          </button>
        </div>
      )}
    </div>
  );
}

export default function TransactionDetails() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <TransactionDetailsContent />
    </Suspense>
  );
}