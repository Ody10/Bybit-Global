'use client';

import { useState, useEffect, useCallback } from 'react';

interface UserProfile {
  uid: string;
  email: string;
  emailMasked: string;
  phoneNumber: string | null;
  phoneNumberMasked: string | null;
  name: string | null;
  avatar: string | null;
  country: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  kycStatus: string;
  kycLevel: number;
  securityLevel: number;
  securityStatus: string;
  securityFeatures: string[];
  twoFactorEnabled: boolean;
  googleAuthEnabled: boolean;
  hasFundPassword: boolean;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  walletCount: number;
  balanceCount: number;
}

interface BalanceSummary {
  totalUsdValue: number;
  availableUsdValue: number;
  lockedUsdValue: number;
  frozenUsdValue: number;
  btcValue: number;
  todayPnL: number;
  todayPnLPercent: number;
}

interface Balance {
  currency: string;
  totalBalance: number;
  available: number;
  locked: number;
  frozen: number;
  staked: number;
  earning: number;
  usdValue: number;
  chains: Array<{
    chain: string;
    network: string;
    balance: number;
    available: number;
  }>;
}

interface WalletMap {
  [key: string]: string;
}

interface Transaction {
  id: string;
  transactionId?: string;
  depositId?: string;
  withdrawalId?: string;
  type: string;
  currency: string;
  chain?: string;
  amount: number;
  fee: number;
  status: string;
  txHash?: string;
  txUrl?: string;
  fromAddress?: string;
  toAddress?: string;
  confirmations?: number;
  requiredConfirmations?: number;
  explorerName?: string;
  explorerUrl?: string;
  createdAt: string;
  completedAt?: string;
}

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          setUser(null);
        }
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        // Also update localStorage with latest user data
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (err: any) {
      setError(err.message);
      // Try to get user from localStorage as fallback
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading, error, refetch: fetchUser };
}

export function useBalances() {
  const [summary, setSummary] = useState<BalanceSummary | null>(null);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/user/balances', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch balances');
      }

      const data = await response.json();
      if (data.success) {
        setSummary(data.summary);
        setBalances(data.balances);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return { summary, balances, loading, error, refetch: fetchBalances };
}

export function useWallets() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [walletMap, setWalletMap] = useState<WalletMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallets = useCallback(async (chain?: string, network?: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      let url = '/api/user/wallets';
      const params = new URLSearchParams();
      if (chain) params.append('chain', chain);
      if (network) params.append('network', network);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch wallets');
      }

      const data = await response.json();
      if (data.success) {
        setWallets(data.wallets);
        setWalletMap(data.walletMap);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  // Helper function to get address for a specific network
  const getAddress = useCallback((network: string): string => {
    return walletMap[network] || walletMap[network.toUpperCase()] || '';
  }, [walletMap]);

  return { wallets, walletMap, getAddress, loading, error, refetch: fetchWallets };
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async (params?: {
    type?: string;
    currency?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const searchParams = new URLSearchParams();
      if (params?.type) searchParams.append('type', params.type);
      if (params?.currency) searchParams.append('currency', params.currency);
      if (params?.status) searchParams.append('status', params.status);
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());

      const url = `/api/user/transactions${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      if (data.success) {
        setTransactions(data.transactions);
        setPagination(data.pagination);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, pagination, loading, error, refetch: fetchTransactions };
}

// Helper hook to check if user is logged in
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, isLoading, logout };
}