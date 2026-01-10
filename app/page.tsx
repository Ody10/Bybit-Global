//app/page.tsx 

'use client';

import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CoinData {
  symbol: string;
  lastPrice: string;
  price24hPcnt: string;
  turnover24h: string;
  [key: string]: any;
}

interface ProcessedCrypto {
  symbol: string;
  name: string;
  price: string;
  rawPrice: number;
  change: string;
  changeNum: number;
  volume: number;
  icon: string;
  color: string;
}

export default function BybitAppGlobal() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Hot');
  const [searchQuery, setSearchQuery] = useState('');
  const [cryptoData, setCryptoData] = useState<ProcessedCrypto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  const tabs = ['Favorites', 'Hot', 'New', 'Gainers', 'Losers', 'Turnover'];

  // Fetch real market data from Bybit API with CORS proxy
  const fetchMarketData = async () => {
    try {
      const corsProxy = 'https://corsproxy.io/?';
      const apiUrl = 'https://api.bybit.com/v5/market/tickers?category=spot';
      
      const response = await fetch(corsProxy + encodeURIComponent(apiUrl));
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();

      if (data.retCode === 0 && data.result?.list) {
        const processed = data.result.list
          .filter((coin: CoinData) => coin.symbol.endsWith('USDT'))
          .map((coin: CoinData) => {
            const symbol = coin.symbol.replace('USDT', '');
            const price = parseFloat(coin.lastPrice);
            const change = parseFloat(coin.price24hPcnt) * 100;
            const volume = parseFloat(coin.turnover24h);
            
            return {
              symbol,
              name: getFullName(symbol),
              price: formatPrice(price),
              rawPrice: price,
              change: change.toFixed(2),
              changeNum: change,
              volume: volume,
              icon: getCoinIcon(symbol),
              color: getCoinColor(symbol)
            };
          })
          .sort((a: ProcessedCrypto, b: ProcessedCrypto) => b.volume - a.volume)
          .slice(0, 20);

        setCryptoData(processed);
        setLoading(false);
        setError(null);
      } else {
        throw new Error('Invalid API response');
      }
    } catch (err) {
      console.error('API Error:', err);
      setError((err as Error).message);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Show splash screen for 2 seconds
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 15000);
    
    return () => {
      clearTimeout(splashTimer);
      clearInterval(interval);
    };
  }, []);

  const formatPrice = (price: number): string => {
    if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(4);
    if (price >= 0.01) return price.toFixed(6);
    return price.toFixed(8);
  };

  const getFullName = (symbol: string): string => {
    const names: { [key: string]: string } = {
      'BTC': 'Bitcoin', 'ETH': 'Ethereum', 'SOL': 'Solana', 'BNB': 'BNB',
      'XRP': 'Ripple', 'USDC': 'USD Coin', 'ADA': 'Cardano', 'AVAX': 'Avalanche',
      'DOGE': 'Dogecoin', 'DOT': 'Polkadot', 'MATIC': 'Polygon', 'LINK': 'Chainlink',
      'UNI': 'Uniswap', 'LTC': 'Litecoin', 'ATOM': 'Cosmos', 'MNT': 'Mantle',
      'PEPE': 'Pepe', 'SHIB': 'Shiba Inu', 'ARB': 'Arbitrum', 'OP': 'Optimism'
    };
    return names[symbol] || symbol;
  };

  const getCoinIcon = (symbol: string): string => {
    const icons: { [key: string]: string } = {
      'BTC': '₿', 'ETH': 'Ξ', 'SOL': '◎', 'BNB': 'B', 'XRP': 'X',
      'USDC': '$', 'ADA': 'A', 'DOGE': 'Ð', 'DOT': '●', 'MATIC': 'M',
      'LINK': '⬡', 'AVAX': '▲', 'UNI': '🦄', 'LTC': 'Ł', 'ATOM': '⚛',
      'MNT': 'M', 'PEPE': '🐸', 'SHIB': '🐕', 'ARB': 'A', 'OP': 'O'
    };
    return icons[symbol] || symbol.charAt(0);
  };

  const getCoinColor = (symbol: string): string => {
    const colors: { [key: string]: string } = {
      'BTC': 'bg-orange-500', 'ETH': 'bg-blue-500', 'SOL': 'bg-purple-500',
      'BNB': 'bg-yellow-500', 'XRP': 'bg-gray-600', 'USDC': 'bg-blue-600',
      'ADA': 'bg-blue-700', 'DOGE': 'bg-yellow-600', 'DOT': 'bg-pink-500',
      'MATIC': 'bg-purple-600', 'LINK': 'bg-blue-500', 'AVAX': 'bg-red-500',
      'UNI': 'bg-pink-600', 'LTC': 'bg-gray-500', 'ATOM': 'bg-indigo-600',
      'MNT': 'bg-gray-700', 'PEPE': 'bg-green-600', 'SHIB': 'bg-orange-600',
      'ARB': 'bg-blue-400', 'OP': 'bg-red-600'
    };
    return colors[symbol] || 'bg-gray-600';
  };

  const generateChartPath = (isPositive: boolean): string => {
    const points = 8;
    const width = 80;
    const height = 30;
    const segments = [];
    
    let currentY = height / 2;
    
    for (let i = 0; i < points; i++) {
      const x = (width / (points - 1)) * i;
      const variance = (Math.random() - 0.5) * 8;
      const trend = isPositive ? -i * 0.5 : i * 0.5;
      currentY = Math.max(5, Math.min(height - 5, currentY + variance + trend));
      segments.push(`${i === 0 ? 'M' : 'L'} ${x},${currentY}`);
    }
    
    return segments.join(' ');
  };

  const handleGoogleLogin = () => {
    router.push('/Home-Login?provider=google');
  };

  // Splash Screen
  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[9999]">
        <div className="text-6xl font-bold mb-12">
          <span className="text-white">BYB</span>
          <span className="text-[#f7a600]">I</span>
          <span className="text-white">T</span>
        </div>
        <div className="w-12 h-12 border-[3px] border-[#f7a600] border-t-transparent rounded-full animate-spin"></div>
        <div className="mt-8 w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-[#f7a600] rounded-full animate-loading-bar"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-[#0a0a0a] z-50 px-4 pt-4 pb-3 border-b border-gray-900">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={() => router.push('/profile')}
            className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 border-2 border-gray-400 hover:opacity-80 transition-opacity cursor-pointer shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #e8e8e8 0%, #c0c0c0 25%, #a8a8a8 50%, #c0c0c0 75%, #e8e8e8 100%)',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.3)'
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="8" r="4" fill="#333" opacity="0.8"/>
                <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" stroke="#333" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
              </svg>
            </div>
          </button>

          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Search className="w-4 h-4 text-gray-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="CC/USDT"
              className="w-full bg-[#1a1a1a] text-white pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 border border-gray-800"
            />
          </div>
        </div>
      </div>

      {/* New User Bonus Banner */}
      <div className="mx-4 mb-6 mt-4 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-gray-800 rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-gray-800/20 to-transparent rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <p className="text-xs text-gray-400 mb-2">Sign up today and start earning!</p>
          <h2 className="text-xl font-bold mb-1">New user bonus — Join now to get</h2>
          <h2 className="text-xl font-bold mb-3 text-yellow-400">100 USDT</h2>
          
          <button className="flex items-center text-sm text-white hover:text-gray-300 transition">
            Rewards Hub <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        <div className="flex items-center gap-2.5 mt-4 relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] rounded-xl flex items-center justify-center shadow-xl border border-gray-800">
            <img 
              src="/wallet-icon.png" 
              alt="Wallet"
              className="w-11 h-11 object-contain"
              onError={(e) => {
                e.currentTarget.outerHTML = '<div class="text-4xl">💼</div>';
              }}
            />
          </div>

          <div className="w-20 h-20 bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] rounded-xl flex items-center justify-center shadow-xl border border-gray-800 animate-coin-flip">
            <img 
              src="/coin-icon.png" 
              alt="Coin"
              className="w-11 h-11 object-contain"
              onError={(e) => {
                e.currentTarget.outerHTML = '<div class="text-4xl">🪙</div>';
              }}
            />
          </div>

          <div className="w-20 h-20 bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] rounded-xl flex items-center justify-center shadow-xl border border-gray-800 animate-gift-bounce">
            <img 
              src="/gift-icon.png" 
              alt="Gift"
              className="w-11 h-11 object-contain"
              onError={(e) => {
                e.currentTarget.outerHTML = '<div class="text-4xl">🎁</div>';
              }}
            />
          </div>
        </div>

        <div className="absolute right-0 top-0 h-full w-1/2 opacity-5">
          <div className="h-full w-full" style={{
            backgroundImage: 'repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 4px)',
          }}></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm whitespace-nowrap transition-colors relative ${
                activeTab === tab 
                  ? 'text-white font-semibold' 
                  : 'text-gray-500'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-yellow-400 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading && cryptoData.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-6 h-6 animate-spin text-gray-500" />
        </div>
      )}

      {error && (
        <div className="mx-4 bg-red-900/20 border border-red-800 rounded-lg p-4 text-sm text-red-400 mb-4">
          Error loading market data: {error}
          <button 
            onClick={fetchMarketData}
            className="ml-3 underline hover:text-red-300"
          >
            Retry
          </button>
        </div>
      )}

      {/* Crypto List - ✅ FIXED: Removed .toLowerCase() from image src */}
      <div className="px-4 space-y-2">
        {cryptoData.map((crypto, index) => {
          const isPositive = crypto.changeNum >= 0;
          
          return (
            <div
              key={index}
              className="bg-[#1a1a1a] hover:bg-[#222222] rounded-xl p-4 transition-colors cursor-pointer border border-gray-900"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-10 h-10 ${crypto.color} rounded-full flex items-center justify-center font-bold text-lg shadow-lg overflow-hidden`}>
                    <img 
                      src={`/coins/${crypto.symbol}.png`}
                      alt={crypto.symbol}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `<span class="font-bold text-lg">${crypto.icon}</span>`;
                      }}
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-base">{crypto.symbol}</div>
                    <div className="text-xs text-gray-500">{crypto.name}</div>
                  </div>
                </div>

                <div className="flex-1 flex justify-center px-4">
                  <svg width="80" height="30" viewBox="0 0 80 30" className="opacity-90">
                    <path
                      d={generateChartPath(isPositive)}
                      fill="none"
                      stroke={isPositive ? '#22c55e' : '#ef4444'}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className="text-right">
                  <div className="font-semibold text-base">
                    ${crypto.price}
                  </div>
                  <div className={`text-xs font-medium ${
                    isPositive ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {isPositive ? '+' : ''}{crypto.change}%
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Sign Up Button */}
      <div className="fixed bottom-20 left-0 right-0 px-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/Home-Login')}
            className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-semibold py-3.5 rounded-full hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg text-sm"
          >
            Sign up / Log In
          </button>
          
          <button 
            onClick={handleGoogleLogin}
            className="w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center hover:bg-[#222222] transition-colors border border-gray-800"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-gray-900 px-2 py-2">
        <div className="flex items-center justify-around">
          <button className="flex flex-col items-center gap-1 px-3 py-2 text-gray-500 hover:text-white transition">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span className="text-xs">Home</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 px-3 py-2 text-yellow-400">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <span className="text-xs">Markets</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 px-3 py-2 text-gray-500 hover:text-white transition">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <span className="text-xs">Trade</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 px-3 py-2 text-gray-500 hover:text-white transition">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
            <span className="text-xs">Futures</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 px-3 py-2 text-gray-500 hover:text-white transition">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
            <span className="text-xs">Assets</span>
          </button>
        </div>
      </nav>

      <style jsx>{`
        @keyframes coin-flip {
          0%, 100% { transform: rotateY(0deg) scale(1); }
          25% { transform: rotateY(90deg) scale(0.95); }
          50% { transform: rotateY(180deg) scale(1); }
          75% { transform: rotateY(270deg) scale(0.95); }
        }

        @keyframes gift-bounce {
          0%, 100% { transform: translateY(0) rotate(-6deg); }
          25% { transform: translateY(-8px) rotate(-6deg); }
          50% { transform: translateY(-4px) rotate(-6deg); }
          75% { transform: translateY(-2px) rotate(-6deg); }
        }

        @keyframes loading-bar {
          0% { width: 0%; }
          100% { width: 100%; }
        }

        .animate-coin-flip {
          animation: coin-flip 3s ease-in-out infinite;
        }

        .animate-gift-bounce {
          animation: gift-bounce 2s ease-in-out infinite;
        }

        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
