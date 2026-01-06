'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ChainTypeModal, { ChainInfo, chainConfigs } from '@/components/ChainTypeModal';
import AddressDepositModal from '@/components/AddressDepositModal';
import DepositUnavailableModal from '@/components/DepositUnavailableModal';

interface CoinData {
  symbol: string;
  name: string;
  icon?: string;
  isCustom?: boolean;
}

interface WalletData {
  chain: string;
  network: string;
  currency: string;
  address: string;
  balance: number;
}

// Custom tokens configuration
const customTokens: CoinData[] = [
  {
    symbol: 'USCT',
    name: 'Tesel Coin',
    isCustom: true,
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    isCustom: true,
  },
];

// Suspended coins
const suspendedCoins = ['MATIC'];

// Chain to network mapping for wallet lookup
const chainToNetworkMap: { [key: string]: string[] } = {
  'ERC20': ['ETH'],
  'BEP20': ['BSC'],
  'TRC20': ['TRX'],
  'POLYGON': ['POLYGON'],
  'ARBITRUM': ['ARBITRUM'],
  'OPTIMISM': ['OPTIMISM'],
  'BASE': ['BASE'],
  'SOL': ['SOL'],
  'BTC': ['BTC'],
  'LTC': ['LTC'],
  'XRP': ['XRP'],
  'AVAXC': ['AVAX'],
  'AVAX': ['AVAX'],
  'MANTLE': ['MANTLE'],
  'TON': ['TON'],
  'APTOS': ['APTOS'],
  'SUI': ['SUI'],
  'DOGE': ['DOGE'],
};

export default function CoinDepositDashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletsLoading, setWalletsLoading] = useState(true);
  const [searchHistory, setSearchHistory] = useState<string[]>(['ETH', 'USDC', 'USDT', 'BAN']);
  const [recommendedCoins] = useState<string[]>(['BTC', 'ETH', 'USDT', 'USCT', 'USDC', 'XRP', 'TRX', 'MNT', 'SOL', 'X']);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Modal states
  const [showChainModal, setShowChainModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);
  const [selectedChain, setSelectedChain] = useState<ChainInfo | null>(null);

  // Wallet addresses from database
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [walletAddresses, setWalletAddresses] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchCoins();
    fetchWalletAddresses();
  }, []);

  const fetchCoins = async () => {
    try {
      const response = await fetch('https://api.bybit.com/v5/market/tickers?category=spot');
      const data = await response.json();
      
      if (data.result && data.result.list) {
        const uniqueCoins = new Map<string, CoinData>();
        
        // Add custom tokens first
        customTokens.forEach(token => {
          uniqueCoins.set(token.symbol, token);
        });
        
        data.result.list.forEach((ticker: any) => {
          const symbol = ticker.symbol.replace(/USDT$|USDC$|USD$/, '');
          if (!uniqueCoins.has(symbol) && symbol.length >= 1) {
            uniqueCoins.set(symbol, {
              symbol: symbol,
              name: symbol,
            });
          }
        });
        
        const coinList = Array.from(uniqueCoins.values()).sort((a, b) => {
          // Custom tokens should appear at top
          if (a.isCustom && !b.isCustom) return -1;
          if (!a.isCustom && b.isCustom) return 1;
          return a.symbol.localeCompare(b.symbol);
        });
        
        setCoins(coinList);
      }
    } catch (error) {
      console.error('Error fetching coins:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletAddresses = async () => {
    setWalletsLoading(true);
    try {
      // Get auth token from localStorage - primary key is 'auth_token'
      let token = localStorage.getItem('auth_token');
      
      // Also check for alternative token storage keys as fallback
      if (!token) {
        token = localStorage.getItem('token');
      }
      if (!token) {
        token = localStorage.getItem('authToken');
      }
      if (!token) {
        // Try to get from user object
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            token = userData.token;
          } catch (e) {
            console.error('Error parsing user data:', e);
          }
        }
      }
      
      if (!token) {
        console.warn('No auth token found - user may need to log in');
        // Don't redirect, just show empty state or use fallback
        setWalletsLoading(false);
        return;
      }

      // Fetch wallets from API
      const response = await fetch('/api/user/wallets', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.warn('Token expired or invalid');
          // Clear invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
          // Don't redirect automatically - let user continue browsing
          setWalletsLoading(false);
          return;
        }
        throw new Error('Failed to fetch wallets');
      }

      const data = await response.json();
      
      if (data.success && data.wallets) {
        setWallets(data.wallets);
        
        // Build wallet address map by network
        const addressMap: { [key: string]: string } = {};
        
        data.wallets.forEach((wallet: WalletData) => {
          // Map by chain name
          addressMap[wallet.chain] = wallet.address;
          
          // Also map by common network aliases
          switch (wallet.chain) {
            case 'ETH':
              addressMap['ERC20'] = wallet.address;
              addressMap['ETHEREUM'] = wallet.address;
              break;
            case 'BSC':
              addressMap['BEP20'] = wallet.address;
              addressMap['BINANCE'] = wallet.address;
              break;
            case 'TRX':
              addressMap['TRC20'] = wallet.address;
              addressMap['TRON'] = wallet.address;
              break;
            case 'POLYGON':
              addressMap['MATIC'] = wallet.address;
              addressMap['POLYGON_POS'] = wallet.address;
              break;
            case 'ARBITRUM':
              addressMap['ARB'] = wallet.address;
              addressMap['ARBITRUM_ONE'] = wallet.address;
              break;
            case 'OPTIMISM':
              addressMap['OP'] = wallet.address;
              addressMap['OP_MAINNET'] = wallet.address;
              break;
            case 'BASE':
              addressMap['BASE_MAINNET'] = wallet.address;
              break;
            case 'SOL':
              addressMap['SOLANA'] = wallet.address;
              break;
            case 'AVAX':
              addressMap['AVALANCHE'] = wallet.address;
              addressMap['AVAXC'] = wallet.address;
              break;
            case 'LTC':
              addressMap['LITECOIN'] = wallet.address;
              break;
            case 'DOGE':
              addressMap['DOGECOIN'] = wallet.address;
              break;
            case 'XRP':
              addressMap['RIPPLE'] = wallet.address;
              break;
            case 'TON':
              addressMap['TONCOIN'] = wallet.address;
              break;
          }
        });
        
        setWalletAddresses(addressMap);
        console.log('Loaded wallet addresses:', addressMap);
      }
    } catch (error) {
      console.error('Error fetching wallet addresses:', error);
    } finally {
      setWalletsLoading(false);
    }
  };

  const groupedCoins = useMemo(() => {
    const filtered = coins.filter(coin =>
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groups: { [key: string]: CoinData[] } = {};
    filtered.forEach(coin => {
      const firstLetter = coin.symbol[0].toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(coin);
    });

    return groups;
  }, [coins, searchQuery]);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const handleImageError = (symbol: string) => {
    setImageErrors(prev => new Set(prev).add(symbol));
  };

  const scrollToSection = (letter: string) => {
    const element = document.getElementById(`section-${letter}`);
    if (element) {
      const headerOffset = 420;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleCoinClick = (coin: CoinData) => {
    // Check if wallets are still loading
    if (walletsLoading) {
      console.log('Wallets still loading...');
      return;
    }

    // Check if user has wallet addresses - if not, prompt to login
    if (Object.keys(walletAddresses).length === 0) {
      const shouldLogin = window.confirm('Please log in to view your deposit address. Would you like to log in now?');
      if (shouldLogin) {
        router.push('/login');
      }
      return;
    }

    // Check if coin is suspended
    if (suspendedCoins.includes(coin.symbol.toUpperCase())) {
      setSelectedCoin(coin);
      setShowUnavailableModal(true);
      return;
    }

    // Check if coin has chain configurations
    const chains = chainConfigs[coin.symbol.toUpperCase()];
    
    if (chains && chains.length === 1) {
      // If only one chain, go directly to deposit
      setSelectedCoin(coin);
      setSelectedChain(chains[0]);
      setShowDepositModal(true);
    } else if (chains && chains.length > 1) {
      // Multiple chains, show chain selection modal
      setSelectedCoin(coin);
      setShowChainModal(true);
    } else {
      // No specific chain config, show generic deposit
      setSelectedCoin(coin);
      const defaultChain: ChainInfo = {
        name: coin.symbol,
        network: coin.symbol,
        icon: `/coins/${coin.symbol}.png`,
        confirmations: 6,
        minDeposit: `0.001 ${coin.symbol}`,
      };
      setSelectedChain(defaultChain);
      setShowDepositModal(true);
    }
  };

  const handleChainSelect = (chain: ChainInfo) => {
    setSelectedChain(chain);
    setShowChainModal(false);
    setShowDepositModal(true);
  };

  const handleChangeNetwork = () => {
    setShowDepositModal(false);
    setShowChainModal(true);
  };

  const getWalletAddress = () => {
    if (!selectedChain) return '';
    
    // Try to find address by network name
    const network = selectedChain.network.toUpperCase();
    
    // Direct match
    if (walletAddresses[network]) {
      return walletAddresses[network];
    }
    
    // Try common aliases
    const aliases = chainToNetworkMap[network];
    if (aliases) {
      for (const alias of aliases) {
        if (walletAddresses[alias]) {
          return walletAddresses[alias];
        }
      }
    }
    
    // For EVM-compatible chains, use ETH address
    const evmChains = ['ERC20', 'BEP20', 'POLYGON', 'ARBITRUM', 'OPTIMISM', 'BASE', 'AVAXC', 'MANTLE'];
    if (evmChains.includes(network)) {
      return walletAddresses['ETH'] || walletAddresses['ERC20'] || '';
    }
    
    console.warn(`No wallet address found for network: ${network}`);
    return '';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0a0a0a] border-b border-[#2a2a2a]">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-all"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h1 className="text-xl font-semibold">Select Coin</h1>
          
          <div className="flex items-center gap-4">
            <Link
              href="/CoinDepositDashboard/FAQ"
              className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-all"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Link>
            <Link
              href="/CoinDepositDashboard/AssetHistory"
              className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-all"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1a1a] text-white rounded-lg pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
            />
          </div>
        </div>

        {/* Wallet Loading Indicator */}
        {walletsLoading && (
          <div className="mx-4 mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-500 text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
              <span>Loading your wallet addresses...</span>
            </div>
          </div>
        )}

        {/* No Wallets Warning */}
        {!walletsLoading && Object.keys(walletAddresses).length === 0 && (
          <div className="mx-4 mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-yellow-500 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Please log in to view your deposit addresses</span>
              </div>
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-1.5 bg-yellow-500 text-black text-sm font-medium rounded-lg hover:bg-yellow-400 transition-colors"
              >
                Log In
              </button>
            </div>
          </div>
        )}

        {/* How to Deposit Banner */}
        <div className="mx-4 mb-4">
          <div className="bg-[#1a1a1a] rounded-lg p-4 flex items-center justify-between hover:bg-[#252525] transition-all cursor-pointer">
            <div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-white">How to Deposit?</span>
              </div>
              <div className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                Learn more
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search History */}
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">Search History</span>
            <button className="text-gray-500 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {searchHistory.map((coin, index) => (
              <button
                key={index}
                onClick={() => setSearchQuery(coin)}
                className="px-4 py-1.5 bg-[#2a2a2a] rounded-full text-sm hover:bg-[#3a3a3a] transition-colors"
              >
                {coin}
              </button>
            ))}
          </div>
        </div>

        {/* Recommended */}
        <div className="px-4 pb-4">
          <div className="mb-3">
            <span className="text-sm text-gray-400">Recommend</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {recommendedCoins.map((coin, index) => (
              <button
                key={index}
                onClick={() => setSearchQuery(coin)}
                className="px-4 py-1.5 bg-[#2a2a2a] rounded-full text-sm hover:bg-[#3a3a3a] transition-colors"
              >
                {coin}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Coin List */}
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 pb-20 pr-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
          ) : (
            alphabet.map(letter => {
              const coinsInGroup = groupedCoins[letter] || [];
              if (coinsInGroup.length === 0 && searchQuery) return null;
              
              return (
                <div key={letter} id={`section-${letter}`}>
                  <div className="sticky top-[420px] bg-[#0a0a0a] px-4 py-2 text-sm text-gray-500 border-b border-[#1a1a1a] z-10">
                    {letter}
                  </div>
                  <div>
                    {coinsInGroup.length > 0 ? (
                      coinsInGroup.map((coin, index) => (
                        <button
                          key={index}
                          onClick={() => handleCoinClick(coin)}
                          disabled={walletsLoading}
                          className={`w-full px-4 py-4 flex items-center gap-3 hover:bg-[#1a1a1a] transition-colors border-b border-[#1a1a1a] ${walletsLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {!imageErrors.has(coin.symbol) ? (
                            <div className="w-9 h-9 rounded-full overflow-hidden bg-[#2a2a2a] flex items-center justify-center relative">
                              <Image
                                src={`/coins/${coin.symbol}.png`}
                                alt={coin.symbol}
                                width={36}
                                height={36}
                                onError={() => handleImageError(coin.symbol)}
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-sm font-bold">
                              {coin.symbol.slice(0, 2)}
                            </div>
                          )}
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{coin.symbol}</span>
                              {coin.isCustom && (
                                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-xs rounded">Custom</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-400">{coin.name}</div>
                          </div>
                        </button>
                      ))
                    ) : (
                      !searchQuery && (
                        <div className="px-4 py-8 text-center text-gray-500 text-sm">
                          No coins starting with {letter}
                        </div>
                      )
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Alphabet Navigation */}
        <div className="fixed right-1 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0 z-40 bg-[#0a0a0a] py-2 px-1 rounded-full">
          {alphabet.map(letter => (
            <button
              key={letter}
              onClick={() => scrollToSection(letter)}
              className="text-[11px] text-gray-400 hover:text-yellow-500 hover:bg-[#1a1a1a] transition-colors text-center w-6 h-5 flex items-center justify-center rounded"
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* Chain Type Modal */}
      {selectedCoin && (
        <ChainTypeModal
          isOpen={showChainModal}
          onClose={() => setShowChainModal(false)}
          onSelectChain={handleChainSelect}
          coinSymbol={selectedCoin.symbol}
          coinName={selectedCoin.name}
        />
      )}

      {/* Address Deposit Modal */}
      {selectedCoin && selectedChain && (
        <AddressDepositModal
          isOpen={showDepositModal}
          onClose={() => {
            setShowDepositModal(false);
            setSelectedCoin(null);
            setSelectedChain(null);
          }}
          onChangeNetwork={handleChangeNetwork}
          coinSymbol={selectedCoin.symbol}
          coinName={selectedCoin.name}
          selectedChain={selectedChain}
          walletAddress={getWalletAddress()}
        />
      )}

      {/* Deposit Unavailable Modal */}
      {selectedCoin && (
        <DepositUnavailableModal
          isOpen={showUnavailableModal}
          onClose={() => {
            setShowUnavailableModal(false);
            setSelectedCoin(null);
          }}
          coinSymbol={selectedCoin.symbol}
        />
      )}
    </div>
  );
}