//hooks/useWallets.ts

'use client';

import { useState, useEffect, useCallback } from 'react';

interface Wallet {
  chain: string;
  network: string;
  address: string;
}

interface UseWalletsReturn {
  wallets: Wallet[];
  walletMap: Record<string, string>;
  getAddress: (network: string) => string | undefined;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useWallets(chain?: string, network?: string): UseWalletsReturn {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [walletMap, setWalletMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const params = new URLSearchParams();
      if (chain) params.append('chain', chain);
      if (network) params.append('network', network);

      const response = await fetch(`/api/user/wallets?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setWallets(data.wallets);
          setWalletMap(data.walletMap || {});
        } else {
          setError(data.error || 'Failed to fetch wallets');
        }
      } else if (response.status === 401) {
        setError('Session expired');
      } else {
        setError('Failed to fetch wallets');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [chain, network]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  const getAddress = useCallback((network: string): string | undefined => {
    return walletMap[network] || walletMap[network.toUpperCase()] || walletMap[network.toLowerCase()];
  }, [walletMap]);

  return { wallets, walletMap, getAddress, loading, error, refetch: fetchWallets };
}