//hooks/useTransactions.ts

'use client';

import { useState, useEffect, useCallback } from 'react';

interface Transaction {
  id: string;
  transactionId?: string;
  depositId?: string;
  withdrawalId?: string;
  type: string;
  currency: string;
  chain?: string;
  amount: number;
  fee?: number;
  status: string;
  txHash?: string;
  txUrl?: string;
  explorerName?: string;
  explorerUrl?: string;
  confirmations?: number;
  requiredConfirmations?: number;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UseTransactionsParams {
  type?: 'all' | 'deposit' | 'withdraw' | 'transfer';
  currency?: string;
  status?: string;
  page?: number;
  limit?: number;
}

interface UseTransactionsReturn {
  transactions: Transaction[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTransactions(params: UseTransactionsParams = {}): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const queryParams = new URLSearchParams();
      if (params.type && params.type !== 'all') queryParams.append('type', params.type);
      if (params.currency) queryParams.append('currency', params.currency);
      if (params.status) queryParams.append('status', params.status);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const response = await fetch(`/api/user/transactions?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTransactions(data.transactions);
          setPagination(data.pagination);
        } else {
          setError(data.error || 'Failed to fetch transactions');
        }
      } else if (response.status === 401) {
        setError('Session expired');
      } else {
        setError('Failed to fetch transactions');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [params.type, params.currency, params.status, params.page, params.limit]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, pagination, loading, error, refetch: fetchTransactions };
}