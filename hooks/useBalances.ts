'use client';

import { useState, useEffect, useCallback } from 'react';

interface Balance {
  currency: string;
  available: number;
  locked: number;
  frozen: number;
  total: number;
  usdValue: number;
}

interface BalanceSummary {
  totalUsdValue: number;
  availableUsdValue: number;
  lockedUsdValue: number;
  frozenUsdValue: number;
  btcValue: number;
  todayPnL: number;
}

interface UseBalancesReturn {
  summary: BalanceSummary | null;
  balances: Balance[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBalances(): UseBalancesReturn {
  const [summary, setSummary] = useState<BalanceSummary | null>(null);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch('/api/user/balances', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSummary(data.summary);
          setBalances(data.balances);
        } else {
          setError(data.error || 'Failed to fetch balances');
        }
      } else if (response.status === 401) {
        setError('Session expired');
      } else {
        setError('Failed to fetch balances');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return { summary, balances, loading, error, refetch: fetchBalances };
}