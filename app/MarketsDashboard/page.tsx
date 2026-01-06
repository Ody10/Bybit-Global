//app/MarketsDashboard/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, TrendingUp, Home, BarChart2, ArrowLeftRight, DollarSign, Wallet, ChevronDown } from 'lucide-react';
import Image from 'next/image';

// ✅ Add type definitions
interface InstrumentItem {
  symbol: string;
  baseCoin: string;
  quoteCoin: string;
  status: string;
  [key: string]: any;
}

interface TickerItem {
  symbol: string;
  lastPrice?: string;
  price24hPcnt?: string;
  volume24h?: string;
  turnover24h?: string;
  highPrice24h?: string;
  lowPrice24h?: string;
  [key: string]: any;
}

interface Market {
  symbol: string;
  baseCoin: string;
  quoteCoin: string;
  price: string;
  change24h: string;
  volume24h: string;
  turnover24h: string;
  highPrice24h: string;
  lowPrice24h: string;
}

export default function MarketsDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Hot');
  const [activeFilter, setActiveFilter] = useState('Spot');
  const [searchQuery, setSearchQuery] = useState('');
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [navLoading, setNavLoading] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState('USDT');
  const [showQuoteDropdown, setShowQuoteDropdown] = useState(false);
  const [showAllDropdown, setShowAllDropdown] = useState(false);

  const tabs = ['Favorites', 'Hot', 'Pre-Market', 'New', 'Gainers', 'Turnover'];
  const filters = ['Spot', 'Alpha', 'Derivatives', 'TradFi'];
  const quotes = ['USDT', 'USDC', 'BTC', 'ETH'];

  useEffect(() => {
    fetchAllMarkets();
    const interval = setInterval(fetchAllMarkets, 3000);
    return () => clearInterval(interval);
  }, [selectedQuote]);

  const fetchAllMarkets = async () => {
    try {
      const instrumentsResponse = await fetch('https://api.bybit.com/v5/market/instruments-info?category=spot');
      const instrumentsData = await instrumentsResponse.json();
      
      if (instrumentsData.retCode === 0) {
        // ✅ FIXED: Added type annotation for item parameter
        const filteredPairs = instrumentsData.result.list.filter(
          (item: InstrumentItem) => item.quoteCoin === selectedQuote && item.status === 'Trading'
        );

        const tickersResponse = await fetch('https://api.bybit.com/v5/market/tickers?category=spot');
        const tickersData = await tickersResponse.json();
        
        if (tickersData.retCode === 0) {
          const tickerMap: Record<string, TickerItem> = {};
          tickersData.result.list.forEach((ticker: TickerItem) => {
            tickerMap[ticker.symbol] = ticker;
          });

          const combinedData = filteredPairs.map((pair: InstrumentItem) => {
            const ticker = tickerMap[pair.symbol] || {};
            return {
              symbol: pair.symbol,
              baseCoin: pair.baseCoin,
              quoteCoin: pair.quoteCoin,
              price: ticker.lastPrice || '0',
              change24h: ticker.price24hPcnt ? (parseFloat(ticker.price24hPcnt) * 100).toFixed(2) : '0',
              volume24h: ticker.volume24h || '0',
              turnover24h: ticker.turnover24h || '0',
              highPrice24h: ticker.highPrice24h || '0',
              lowPrice24h: ticker.lowPrice24h || '0'
            };
          });

          let sortedData = [...combinedData];
          
          if (activeTab === 'Hot' || activeTab === 'Turnover') {
            sortedData.sort((a, b) => parseFloat(b.turnover24h) - parseFloat(a.turnover24h));
          } else if (activeTab === 'Gainers') {
            sortedData.sort((a, b) => parseFloat(b.change24h) - parseFloat(a.change24h));
          } else if (activeTab === 'New') {
            sortedData.sort((a, b) => a.baseCoin.localeCompare(b.baseCoin));
          } else {
            sortedData.sort((a, b) => parseFloat(b.volume24h) - parseFloat(a.volume24h));
          }

          setMarkets(sortedData);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching markets:', error);
      setLoading(false);
    }
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (isNaN(num)) return '0';
    if (num >= 1000) return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (num >= 1) return num.toFixed(4);
    if (num >= 0.0001) return num.toFixed(6);
    return num.toFixed(8);
  };

  const formatVolume = (volume: string) => {
    const num = parseFloat(volume);
    if (isNaN(num)) return '0';
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  const formatTurnover = (turnover: string) => {
    const num = parseFloat(turnover);
    if (isNaN(num)) return '0 ARS';
    const arsValue = num * 1043;
    if (arsValue >= 1000000000) return (arsValue / 1000000000).toFixed(2) + 'B ARS';
    if (arsValue >= 1000000) return (arsValue / 1000000).toFixed(2) + 'M ARS';
    if (arsValue >= 1000) return (arsValue / 1000).toFixed(2) + 'K ARS';
    return arsValue.toFixed(2) + ' ARS';
  };

  const navigateWithLoading = (path: string) => {
    setNavLoading(true);
    setTimeout(() => {
      router.push(path);
    }, 500);
  };

  const handleMarketsClick = () => {
    setNavLoading(true);
    setTimeout(() => {
      setNavLoading(false);
    }, 1500);
  };

  const filteredMarkets = markets.filter(market => {
    const matchesSearch = market.baseCoin.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         market.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Coin Icon Component
  const CoinIcon = ({ symbol, size = 32 }: { symbol: string; size?: number }) => {
    const [hasError, setHasError] = useState(false);
    
    if (hasError) {
      return (
        <div 
          className="rounded-full flex items-center justify-center bg-gradient-to-br from-orange-500 to-yellow-600"
          style={{ width: size, height: size }}
        >
          <span className="text-white font-bold" style={{ fontSize: size * 0.4 }}>{symbol[0]}</span>
        </div>
      );
    }
    
    return (
      <Image 
        src={`/coins/${symbol}.png`}
        alt={symbol}
        width={size}
        height={size}
        className="rounded-full"
        onError={() => setHasError(true)}
        unoptimized
      />
    );
  };

  // Loading Spinner
  const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-[#f7a600] border-t-transparent rounded-full animate-spin" style={{ borderWidth: '3px' }}></div>
        <span className="text-white text-sm">Loading...</span>
      </div>
    </div>
  );

  // Skeleton Loader
  const SkeletonLoader = () => (
    <div className="animate-pulse px-4 py-4">
      <div className="h-10 bg-[#1a1a1a] rounded-lg mb-4"></div>
      <div className="flex gap-4 mb-4">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="w-16 h-6 bg-[#1a1a1a] rounded"></div>
        ))}
      </div>
      <div className="flex gap-2 mb-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="w-16 h-8 bg-[#1a1a1a] rounded-full"></div>
        ))}
      </div>
      <div className="space-y-3">
        {[1,2,3,4,5,6,7,8,9,10].map(i => (
          <div key={i} className="h-16 bg-[#1a1a1a] rounded-lg"></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white pb-20">
      {navLoading && <LoadingSpinner />}
      
      {/* Search Bar */}
      <div className="sticky top-0 z-40 bg-[#0d0d0d] border-b border-[#1a1a1a]">
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
            <input
              type="text"
              placeholder="MON/USDT"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1a1a] text-white pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2a2a2a] text-sm"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto scrollbar-hide px-4 gap-6">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium whitespace-nowrap relative ${
                activeTab === tab ? 'text-white' : 'text-[#6b7280]'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
              )}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                activeFilter === filter
                  ? 'bg-[#2a2a2a] text-white'
                  : 'bg-transparent text-[#6b7280]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Currency Selectors and Table Header */}
        <div className="flex items-center justify-between px-4 py-3 text-xs border-t border-[#1a1a1a]">
          <div className="flex items-center gap-2 text-[#6b7280]">
            <span>Trading Pairs / Vols</span>
          </div>
          <div className="flex items-center gap-3">
            {/* USDT Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowQuoteDropdown(!showQuoteDropdown)}
                className="flex items-center gap-1 text-[#6b7280] hover:text-white transition-colors"
              >
                <span className="text-xs font-medium">{selectedQuote}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              
              {showQuoteDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg py-1 min-w-[80px] shadow-lg">
                  {quotes.map(quote => (
                    <button
                      key={quote}
                      onClick={() => {
                        setSelectedQuote(quote);
                        setShowQuoteDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-xs text-left hover:bg-[#2a2a2a] text-white"
                    >
                      {quote}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* All Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowAllDropdown(!showAllDropdown)}
                className="flex items-center gap-1 text-[#6b7280] hover:text-white transition-colors"
              >
                <span className="text-xs font-medium">All</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              
              {showAllDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg py-1 min-w-[100px] shadow-lg">
                  <button className="w-full px-3 py-2 text-xs text-left hover:bg-[#2a2a2a] text-white">
                    All
                  </button>
                  <button className="w-full px-3 py-2 text-xs text-left hover:bg-[#2a2a2a] text-white">
                    Favorites
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Markets List */}
      <div className="px-4">
        {loading ? (
          <SkeletonLoader />
        ) : filteredMarkets.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-[#6b7280]">
            No markets found
          </div>
        ) : (
          filteredMarkets.map((market) => {
            const change = parseFloat(market.change24h);
            const isPositive = change >= 0;

            return (
              <div
                key={market.symbol}
                className="flex items-center justify-between py-3 border-b border-[#1a1a1a] hover:bg-[#151515] cursor-pointer transition-colors"
              >
                {/* Left Side - Symbol and Volume */}
                <div className="flex items-center gap-3">
                  <CoinIcon symbol={market.baseCoin} size={32} />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium text-[15px]">
                        {market.baseCoin}
                      </span>
                      <span className="text-[#6b7280] text-[13px]">/ {market.quoteCoin}</span>
                      {change > 10 && <TrendingUp className="w-3 h-3 text-[#0ecb81]" />}
                    </div>
                    <span className="text-[#6b7280] text-[11px] mt-0.5">
                      {formatVolume(market.volume24h)} {market.quoteCoin}
                    </span>
                  </div>
                </div>

                {/* Right Side - Price and Change */}
                <div className="flex items-center gap-4">
                  {/* Price Column */}
                  <div className="text-right min-w-[90px]">
                    <div className="text-white font-medium text-[15px]">
                      {formatPrice(market.price)}
                    </div>
                    <div className="text-[#6b7280] text-[11px] mt-0.5">
                      {formatTurnover(market.turnover24h)}
                    </div>
                  </div>

                  {/* Change Percentage Box */}
                  <div
                    className={`px-2.5 py-1 rounded min-w-[62px] text-center ${
                      isPositive
                        ? 'bg-[#0ecb81]'
                        : 'bg-[#f6465d]'
                    }`}
                  >
                    <span className="text-white text-[13px] font-medium">
                      {isPositive ? '+' : ''}{change}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0d0d0d] border-t border-[#1a1a1a] z-50">
        <div className="flex items-center justify-around py-2.5">
          <button onClick={() => navigateWithLoading('/BybitDashboard')} className="flex flex-col items-center gap-1 text-[#6b7280] hover:text-white transition-colors">
            <Home className="w-6 h-6" />
            <span className="text-[10px]">Home</span>
          </button>
          <button onClick={handleMarketsClick} className="flex flex-col items-center gap-1 text-white">
            <BarChart2 className="w-6 h-6" />
            <span className="text-[10px] font-medium">Markets</span>
          </button>
          <button onClick={() => navigateWithLoading('/TradeDashboard')} className="flex flex-col items-center gap-1 text-[#6b7280] hover:text-white transition-colors">
            <ArrowLeftRight className="w-6 h-6" />
            <span className="text-[10px]">Trade</span>
          </button>
          <button onClick={() => navigateWithLoading('/EarnDashboard')} className="flex flex-col items-center gap-1 text-[#6b7280] hover:text-white transition-colors">
            <DollarSign className="w-6 h-6" />
            <span className="text-[10px]">Earn</span>
          </button>
          <button onClick={() => navigateWithLoading('/AssetsDashboard')} className="flex flex-col items-center gap-1 text-[#6b7280] hover:text-white transition-colors">
            <Wallet className="w-6 h-6" />
            <span className="text-[10px]">Assets</span>
          </button>
        </div>
      </div>
    </div>
  );
}