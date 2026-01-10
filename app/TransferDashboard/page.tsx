//app/TransferDashboard/page.tsx

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Ticker {
  symbol: string;
  lastPrice: string;
  volume24h: string;
}

interface CoinData {
  symbol: string;
  name: string;
  balance: number;
  usdValue: string;
}

// Map of coin symbols to their full names
const coinNames: Record<string, string> = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  USDT: 'Tether USDT',
  USCT: 'Tesel Coin',
  USDC: 'USD Coin',
  XRP: 'XRP',
  SOL: 'Solana',
  DOGE: 'Dogecoin',
  DOT: 'Polkadot',
  TRX: 'TRON',
  MNT: 'Mantle',
  HMSTR: 'Hamster Kombat',
  X: 'X Empire',
  ADA: 'Cardano',
  AVAX: 'Avalanche',
  SHIB: 'Shiba Inu',
  LINK: 'Chainlink',
  BCH: 'Bitcoin Cash',
  LTC: 'Litecoin',
  NEAR: 'NEAR Protocol',
  UNI: 'Uniswap',
  MATIC: 'Polygon',
  XLM: 'Stellar',
  ATOM: 'Cosmos',
  FIL: 'Filecoin',
  APT: 'Aptos',
  ARB: 'Arbitrum',
  OP: 'Optimism',
  SUI: 'Sui',
  INJ: 'Injective',
  PEPE: 'Pepe',
  WIF: 'dogwifhat',
  BONK: 'Bonk',
  FLOKI: 'Floki',
  NOT: 'Notcoin',
  TON: 'Toncoin',
  SEI: 'Sei',
  TIA: 'Celestia',
  AAVE: 'Aave',
  GRT: 'The Graph',
  MKR: 'Maker',
  RUNE: 'THORChain',
  IMX: 'Immutable X',
  FTM: 'Fantom',
  SAND: 'The Sandbox',
  MANA: 'Decentraland',
  AXS: 'Axie Infinity',
  GALA: 'Gala',
  ENJ: 'Enjin Coin',
  CHZ: 'Chiliz',
  ALGO: 'Algorand',
  VET: 'VeChain',
  HBAR: 'Hedera',
  EOS: 'EOS',
  XTZ: 'Tezos',
  THETA: 'Theta Network',
  ICP: 'Internet Computer',
  EGLD: 'MultiversX',
  FLOW: 'Flow',
  NEO: 'Neo',
  KAS: 'Kaspa',
  STX: 'Stacks',
  CRO: 'Cronos',
  KAVA: 'Kava',
  MINA: 'Mina Protocol',
  ZEC: 'Zcash',
  XMR: 'Monero',
  DASH: 'Dash',
  ETC: 'Ethereum Classic',
  SNX: 'Synthetix',
  COMP: 'Compound',
  YFI: 'yearn.finance',
  CRV: 'Curve DAO',
  SUSHI: 'SushiSwap',
  ONE: 'Harmony',
  ZIL: 'Zilliqa',
  ENS: 'ENS',
  LDO: 'Lido DAO',
  RPL: 'Rocket Pool',
  GMX: 'GMX',
  DYDX: 'dYdX',
  QNT: 'Quant',
  RNDR: 'Render',
  FET: 'Fetch.ai',
  AGIX: 'SingularityNET',
  OCEAN: 'Ocean Protocol',
  WLD: 'Worldcoin',
  BLUR: 'Blur',
  MAGIC: 'Magic',
  APE: 'ApeCoin',
  LRC: 'Loopring',
  BAT: 'Basic Attention',
  ZRX: '0x Protocol',
  ANKR: 'Ankr',
  SKL: 'SKALE',
  STORJ: 'Storj',
  CELO: 'Celo',
  RSR: 'Reserve Rights',
  MASK: 'Mask Network',
  AUDIO: 'Audius',
  RAY: 'Raydium',
  OSMO: 'Osmosis',
  JUP: 'Jupiter',
  PYTH: 'Pyth Network',
  JTO: 'Jito',
  STRK: 'Starknet',
  ZETA: 'ZetaChain',
  DYM: 'Dymension',
  MANTA: 'Manta Network',
  ALT: 'AltLayer',
  PIXEL: 'Pixels',
  PORTAL: 'Portal',
  A: 'Vaulta',
};

// Popular coins that should appear at the top
const popularCoins = ['BTC', 'ETH', 'USDT', 'HMSTR', 'USDC', 'XRP', 'TRX', 'MNT', 'SOL', 'X', 'DOT', 'DOGE'];

// Coin Icon Component with fallback
function CoinIcon({ symbol, size = 32 }: { symbol: string; size?: number }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div 
        className="rounded-full bg-gray-700 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-xs font-medium text-white">{symbol.slice(0, 2)}</span>
      </div>
    );
  }

  return (
    <div 
      className="rounded-full bg-gray-700 flex items-center justify-center overflow-hidden"
      style={{ width: size, height: size }}
    >
      <Image
        src={`/coins/${symbol}.png`}
        alt={symbol}
        width={size}
        height={size}
        className="w-full h-full object-cover"
        onError={() => setHasError(true)}
        unoptimized
      />
    </div>
  );
}

export default function TransferDashboard() {
  const router = useRouter();
  const [fromAccount, setFromAccount] = useState('Funding Account');
  const [toAccount, setToAccount] = useState('Unified Trading Account');
  const [selectedCoin, setSelectedCoin] = useState<CoinData>({
    symbol: 'BTC',
    name: 'Bitcoin',
    balance: 0,
    usdValue: '≈$ 0.00',
  });
  const [amount, setAmount] = useState('');
  const [showCoinModal, setShowCoinModal] = useState(false);
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const accountTypes = [
    'Funding Account',
    'Unified Trading Account',
    'Spot Account',
    'Derivatives Account',
  ];

  useEffect(() => {
    fetchCoins();
  }, []);

  // ✅ FIXED: Use existing /api/user/balances with JWT auth
  const fetchCoins = async () => {
    try {
      console.log('🔄 Fetching coins and balances...');
      
      // Get JWT token from localStorage (same as AssetsDashboard)
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('⚠️ No auth token found');
      }

      // Fetch market data from Bybit
      const marketResponse = await fetch('https://api.bybit.com/v5/market/tickers?category=spot', {
        cache: 'no-store'
      });
      const marketData = await marketResponse.json();

      // Fetch user balances from existing API (with JWT auth)
      let userBalances: Record<string, { balance: number; usdValue: number }> = {};
      
      if (token) {
        try {
          const balancesResponse = await fetch('/api/user/balances', {
            method: 'GET',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            cache: 'no-store',
          });

          if (balancesResponse.ok) {
            const balancesData = await balancesResponse.json();
            console.log('📊 Balances data:', balancesData);
            
            if (balancesData.success && balancesData.balances) {
              // Convert array to map
              balancesData.balances.forEach((bal: any) => {
                userBalances[bal.currency] = {
                  balance: bal.totalBalance,
                  usdValue: bal.usdValue,
                };
              });
            }
          } else {
            console.error('❌ Balance fetch failed:', balancesResponse.status);
          }
        } catch (error) {
          console.error('❌ Error fetching balances:', error);
        }
      }

      console.log('💰 User balances:', userBalances);
      console.log('📊 Has balances for', Object.keys(userBalances).length, 'coins');

      // Popular/essential coins that should always be included
      const popularCoins = ['BTC', 'ETH', 'USDT', 'USDC', 'USCT', 'XRP', 'SOL', 'DOGE', 'DOT', 'TRX', 'MNT', 'X', 'BAN', 'HMSTR', 'ADA', 'AVAX', 'LINK', 'MATIC', 'UNI', 'ATOM', 'LTC'];

      if (marketData.result?.list) {
        const coinMap = new Map<string, CoinData>();

        // First, extract base coins from trading pairs
        marketData.result.list.forEach((ticker: Ticker) => {
          const symbol = ticker.symbol
            .replace(/USDT$/, '')
            .replace(/USDC$/, '')
            .replace(/BTC$/, '')
            .replace(/ETH$/, '');

          if (symbol && !coinMap.has(symbol)) {
            const balance = userBalances[symbol]?.balance || 0;
            const usdValue = userBalances[symbol]?.usdValue || 0;
            
            coinMap.set(symbol, {
              symbol,
              name: coinNames[symbol] || symbol,
              balance: balance,
              usdValue: `≈$ ${usdValue.toFixed(2)}`,
            });
          }
        });

        // Add popular coins if they're missing (including USDT, USDC, etc.)
        popularCoins.forEach(symbol => {
          if (!coinMap.has(symbol)) {
            const balance = userBalances[symbol]?.balance || 0;
            const usdValue = userBalances[symbol]?.usdValue || 0;
            
            coinMap.set(symbol, {
              symbol,
              name: coinNames[symbol] || symbol,
              balance: balance,
              usdValue: `≈$ ${usdValue.toFixed(2)}`,
            });
          }
        });

        // Sort: coins with balance first (descending), then popular coins, then alphabetically
        const sortedCoins = Array.from(coinMap.values()).sort((a, b) => {
          // First priority: coins with balance (higher balance first)
          if (a.balance > 0 && b.balance === 0) return -1;
          if (a.balance === 0 && b.balance > 0) return 1;
          if (a.balance > 0 && b.balance > 0) {
            return b.balance - a.balance; // Higher balance first
          }
          
          // Second priority: popular coins
          const aPopular = popularCoins.indexOf(a.symbol);
          const bPopular = popularCoins.indexOf(b.symbol);
          
          if (aPopular !== -1 && bPopular !== -1) {
            return aPopular - bPopular;
          }
          if (aPopular !== -1) return -1;
          if (bPopular !== -1) return 1;
          
          // Third priority: alphabetically
          return a.symbol.localeCompare(b.symbol);
        });

        console.log('✅ Loaded', sortedCoins.length, 'coins');
        console.log('💰 Coins with balance:', sortedCoins.filter(c => c.balance > 0).length);
        console.log('🔝 First 10 coins:', sortedCoins.slice(0, 10).map(c => `${c.symbol} (${c.balance})`));

        setCoins(sortedCoins);
      }
    } catch (error) {
      console.error('❌ Failed to fetch coins:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCoins = useMemo(() => {
    if (!searchQuery) return coins;
    return coins.filter(
      (coin) =>
        coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coin.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [coins, searchQuery]);

  const swapAccounts = () => {
    const temp = fromAccount;
    setFromAccount(toAccount);
    setToAccount(temp);
  };

  const handleCoinSelect = (coin: CoinData) => {
    setSelectedCoin(coin);
    setShowCoinModal(false);
    setSearchQuery('');
  };

  const handleMaxClick = () => {
    setAmount(selectedCoin.balance.toString());
  };

  const handleConfirm = () => {
    console.log('Transfer:', {
      from: fromAccount,
      to: toAccount,
      coin: selectedCoin.symbol,
      amount,
    });
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0d0d0d] px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-white p-2 -ml-2"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">Within Account</h1>
          <button className="text-gray-400 p-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M3 10h18" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-4 pb-32">
        {/* From Account */}
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-gray-500 text-sm">From</span>
          </div>
          <button className="w-full flex items-center justify-between py-3">
            <span className="text-white text-[15px]">{fromAccount}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center py-2">
          <button
            onClick={swapAccounts}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4" />
            </svg>
          </button>
        </div>

        {/* To Account */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-gray-500 text-sm">To</span>
          </div>
          <button className="w-full flex items-center justify-between py-3">
            <span className="text-white text-[15px]">{toAccount}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* Coin Selection */}
        <div className="mb-6">
          <label className="text-gray-500 text-sm mb-2 block">Coin</label>
          <button
            onClick={() => setShowCoinModal(true)}
            className="w-full bg-[#1a1a1a] rounded-xl py-4 px-4 flex items-center justify-between border border-[#f7a600] hover:bg-[#1f1f1f] transition-colors"
          >
            <div className="flex items-center gap-3">
              <CoinIcon symbol={selectedCoin.symbol} size={28} />
              <span className="text-white font-medium">{selectedCoin.symbol}</span>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <label className="text-gray-500 text-sm mb-2 block">Amount</label>
          <div className="bg-[#1a1a1a] rounded-xl py-4 px-4">
            <div className="flex items-center justify-between">
              <input
                type="text"
                placeholder="Please enter"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-gray-600 outline-none text-[15px]"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMaxClick}
                  className="text-[#f7a600] font-medium text-sm hover:text-[#ffb824]"
                >
                  Max
                </button>
                <span className="text-white text-sm">{selectedCoin.symbol}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Available Balance */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-gray-500 text-sm">Available</span>
          <div className="flex items-center gap-1">
            <span className="text-white text-sm">{selectedCoin.balance} {selectedCoin.symbol}</span>
            <button className="text-gray-500">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0d0d0d] px-4 py-4">
        <button
          onClick={handleConfirm}
          disabled={!amount || parseFloat(amount) <= 0}
          className="w-full bg-[#4a3d1a] text-[#8b7355] font-semibold py-4 rounded-xl transition-colors disabled:bg-[#2a2a2a] disabled:text-gray-600"
        >
          Confirm
        </button>
      </div>

      {/* Coin Selection Modal */}
      {showCoinModal && (
        <div className="fixed inset-0 bg-[#0d0d0d] z-50 flex flex-col">
          {/* Modal Header */}
          <div className="px-4 py-3">
            <div className="relative flex items-center">
              <svg
                className="absolute left-3 text-gray-500"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Please select your preferred pair"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a1a1a] rounded-lg py-3 pl-10 pr-20 text-white placeholder-gray-500 outline-none"
                autoFocus
              />
              <button
                onClick={() => {
                  setShowCoinModal(false);
                  setSearchQuery('');
                }}
                className="absolute right-3 text-gray-400 text-sm hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Coin List */}
          <div className="flex-1 overflow-y-auto px-4">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-500 border-t-transparent"></div>
              </div>
            ) : (
              filteredCoins.map((coin) => (
                <button
                  key={coin.symbol}
                  onClick={() => handleCoinSelect(coin)}
                  className="w-full flex items-center justify-between py-4 hover:bg-gray-800/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CoinIcon symbol={coin.symbol} size={32} />
                    <div className="text-left">
                      <div className="text-white font-medium text-[15px]">{coin.symbol}</div>
                      <div className="text-gray-500 text-xs">{coin.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-[15px]">{coin.balance}</div>
                    <div className="text-gray-500 text-xs">{coin.usdValue}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
