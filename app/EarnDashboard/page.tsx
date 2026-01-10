//app/EarnDashboard/page.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home, BarChart2, ArrowLeftRight, DollarSign, Wallet, Search, Grid3x3, ChevronDown, ArrowRight, HelpCircle, SlidersHorizontal } from 'lucide-react';
import Image from 'next/image';

// ✅ Add type definitions
interface InstrumentItem {
  status: string;
  baseCoin: string;
  [key: string]: any; // For other potential properties
}

interface EarnProduct {
  type: string;
  duration: string;
  apr: string;
  category: string;
  maxAPR?: boolean;
}

interface CoinProduct {
  coin: string;
  symbol: string;
  products: EarnProduct[];
}

export default function EarnDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Steady Returns');
  const [searchQuery, setSearchQuery] = useState('');
  const [earnProducts, setEarnProducts] = useState<CoinProduct[]>([]);
  const [expandedCoins, setExpandedCoins] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [navLoading, setNavLoading] = useState(false);
  const [totalEarnAsset, setTotalEarnAsset] = useState('********');
  const [showAsset, setShowAsset] = useState(false);

  useEffect(() => {
    fetchEarnProducts();
  }, []);

  const fetchEarnProducts = async () => {
    try {
      const instrumentsRes = await fetch('https://api.bybit.com/v5/market/instruments-info?category=spot');
      const instrumentsData = await instrumentsRes.json();
      
      if (instrumentsData.retCode === 0) {
        // ✅ FIXED: Added type annotation for item parameter
        const coins = instrumentsData.result.list
          .filter((item: InstrumentItem) => item.status === 'Trading')
          .map((item: InstrumentItem) => item.baseCoin);
        
        const uniqueCoins = [...new Set(coins)].sort() as string[];
        
        const products = uniqueCoins.slice(0, 50).map((coin: string) => {
          const hasMultipleProducts = Math.random() > 0.5;
          const flexibleAPR = (Math.random() * 10).toFixed(2);
          const products: EarnProduct[] = [
            {
              type: 'Flexible',
              duration: 'Flexible',
              apr: flexibleAPR,
              category: 'Easy Earn'
            }
          ];
          
          if (hasMultipleProducts) {
            const days = [3, 7, 14, 30, 90, 120].sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 3) + 1);
            days.forEach(day => {
              products.push({
                type: `${day} Days`,
                duration: `${day} Days`,
                apr: (Math.random() * 400).toFixed(2),
                category: 'Easy Earn'
              });
            });
          }
          
          if (Math.random() > 0.7) {
            products.push({
              type: 'Flexible/Fixed',
              duration: 'Flexible/Fixed',
              apr: (Math.random() * 15).toFixed(2),
              category: 'On-Chain Earn',
              maxAPR: true
            });
          }
          
          return {
            coin,
            symbol: coin,
            products: products
          };
        });
        
        setEarnProducts(products);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching earn products:', error);
      setLoading(false);
    }
  };

  const toggleCoin = (coin: string) => {
    setExpandedCoins(prev => ({
      ...prev,
      [coin]: !prev[coin]
    }));
  };

  const navigateWithLoading = (path: string) => {
    setNavLoading(true);
    setTimeout(() => {
      router.push(path);
    }, 500);
  };

  const handleEarnClick = () => {
    setNavLoading(true);
    setTimeout(() => {
      setNavLoading(false);
    }, 1500);
  };

  const filteredProducts = earnProducts.filter(product =>
    product.coin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Coin Icon Component
  const CoinIcon = ({ symbol, size = 32 }: { symbol: string; size?: number }) => {
    const [hasError, setHasError] = useState(false);
    
    if (hasError) {
      return (
        <div 
          className="rounded-full flex items-center justify-center bg-[#2a2a2a]"
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
    <div className="min-h-screen bg-[#0d0d0d] text-white pb-20">
      <div className="animate-pulse p-4">
        <div className="h-12 bg-[#1a1a1a] rounded mb-4"></div>
        <div className="h-16 bg-[#1a1a1a] rounded mb-4"></div>
        <div className="flex gap-4 mb-4">
          {[1,2,3].map(i => (
            <div key={i} className="flex-1 h-20 bg-[#1a1a1a] rounded-full"></div>
          ))}
        </div>
        <div className="flex gap-3 mb-4 overflow-x-auto">
          {[1,2,3].map(i => (
            <div key={i} className="min-w-[200px] h-32 bg-[#1a1a1a] rounded-xl"></div>
          ))}
        </div>
        <div className="space-y-3">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="h-16 bg-[#1a1a1a] rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white pb-20">
      {navLoading && <LoadingSpinner />}
      
      {/* Header */}
      <div className="sticky top-0 bg-[#0d0d0d] z-40 border-b border-[#1e1e1e]">
        {/* Search Bar */}
        <div className="flex items-center gap-2 p-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#71757f]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Please enter your preferred coin"
              className="w-full bg-[#1a1a1a] text-white pl-10 pr-4 py-2.5 rounded-lg text-sm border border-[#2a2a2a] focus:outline-none focus:border-[#3a3a3a]"
            />
          </div>
          <button className="w-10 h-10 bg-[#1a1a1a] rounded-lg flex items-center justify-center border border-[#2a2a2a]">
            <Grid3x3 className="w-5 h-5 text-white" />
          </button>
          <button className="w-10 h-10 bg-[#1a1a1a] rounded-lg flex items-center justify-center border border-[#2a2a2a]">
            <Grid3x3 className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Total Earn Asset */}
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#71757f]">Total Earn Asset</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">{totalEarnAsset}</span>
              <span className="text-[#71757f]">Auto-Earn</span>
              <button className="text-white text-xs">Off</button>
              <ChevronDown className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>

        {/* Earn Types */}
        <div className="flex items-center justify-around px-4 pb-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-white">Easy Earn</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center">
              <ArrowLeftRight className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-white">On-Chain Earn</span>
          </div>
          <div className="flex flex-col items-center gap-2 relative">
            <div className="w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center">
              <BarChart2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-white">Advanced Earn</span>
            <span className="absolute -top-1 -right-1 bg-[#f7a600] text-black text-[8px] font-bold px-1.5 py-0.5 rounded">New</span>
          </div>
        </div>

        {/* Featured Earn Cards */}
        <div className="px-4 pb-4 flex gap-3 overflow-x-auto scrollbar-hide">
          <div className="min-w-[200px] bg-gradient-to-br from-[#1a4d4d] to-[#1a1a1a] rounded-xl p-4 border border-[#2a5555]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-[#0ecb81] rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">U</span>
              </div>
              <span className="text-white font-semibold">USDT</span>
            </div>
            <div className="text-xs text-[#71757f] mb-1">On-Chain Earn</div>
            <div className="text-2xl font-bold text-[#0ecb81]">7.44%</div>
          </div>

          <div className="min-w-[200px] bg-gradient-to-br from-[#4d1a4d] to-[#1a1a1a] rounded-xl p-4 border border-[#552a55]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-[#ec4899] rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">M</span>
              </div>
              <span className="text-white font-semibold">METH</span>
            </div>
            <div className="text-xs text-[#71757f] mb-1">On-Chain Earn</div>
            <div className="text-2xl font-bold text-[#ec4899]">5.71%</div>
          </div>

          <div className="min-w-[200px] bg-gradient-to-br from-[#1a3a5a] to-[#1a1a1a] rounded-xl p-4 border border-[#2a4a6a]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-[#3b82f6] rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">U</span>
              </div>
              <span className="text-white font-semibold">USDC</span>
            </div>
            <div className="text-xs text-[#71757f] mb-1">On-Chain Earn</div>
            <div className="text-2xl font-bold text-[#3b82f6]">7.47%</div>
          </div>
        </div>

        {/* Events Banner */}
        <div className="px-4 pb-4">
          <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] rounded-lg p-3 flex items-center justify-between border border-[#3a3a3a]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#f7a600] rounded flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-black" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-[#71757f]">Events</span>
                <span className="text-xs text-white">Swap BYUSDT to win a share of 858,670 USDT!</span>
              </div>
            </div>
            <div className="text-xs text-[#71757f]">2/5</div>
          </div>
        </div>
      </div>

      {/* Explore Products Section */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Explore Products</h2>
          <button className="p-1">
            <SlidersHorizontal className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-4 border-b border-[#1e1e1e]">
          {['Steady Returns', 'Top Gains', 'VIP Exclusive'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-sm font-medium transition-colors relative ${
                activeTab === tab ? 'text-white' : 'text-[#71757f]'
              }`}
            >
              {tab}
              {tab === 'VIP Exclusive' && (
                <span className="ml-1 text-[#f7a600]">★</span>
              )}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
              )}
            </button>
          ))}
        </div>

        {/* Products List */}
        <div className="space-y-2">
          {filteredProducts.map(product => (
            <div key={product.coin} className="bg-[#1a1a1a] rounded-xl overflow-hidden">
              {/* Coin Header */}
              <button
                onClick={() => toggleCoin(product.coin)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#202020] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CoinIcon symbol={product.coin} size={32} />
                  <span className="text-white font-semibold">{product.coin}</span>
                </div>
                <ChevronDown 
                  className={`w-5 h-5 text-white transition-transform ${
                    expandedCoins[product.coin] ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Products List (Expandable) */}
              {expandedCoins[product.coin] && (
                <div className="border-t border-[#2a2a2a]">
                  {product.products.map((item, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-3 flex items-center justify-between hover:bg-[#202020] transition-colors border-b border-[#2a2a2a] last:border-b-0"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#71757f]">{item.category}</span>
                          {item.category === 'Easy Earn' && (
                            <HelpCircle className="w-3 h-3 text-[#71757f]" />
                          )}
                        </div>
                        <span className="text-white text-sm font-medium">{item.type}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs text-[#71757f] mb-0.5">
                            {item.maxAPR ? 'Max. APR' : 'APR'}
                          </div>
                          <div className="text-white font-semibold">{item.apr}%</div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-[#71757f]" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 border-2 border-[#2a2a2a] rounded-xl flex items-center justify-center mb-3">
              <Search className="w-10 h-10 text-[#2a2a2a]" />
            </div>
            <p className="text-[#71757f] text-sm">No products found</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0d0d0d] border-t border-[#1e1e1e] z-50">
        <div className="flex items-center justify-around py-2">
          <button onClick={() => navigateWithLoading('/BybitDashboard')} className="flex flex-col items-center gap-0.5 text-[#71757f]">
            <Home className="w-6 h-6" />
            <span className="text-[9px]">Home</span>
          </button>
          <button onClick={() => navigateWithLoading('/MarketsDashboard')} className="flex flex-col items-center gap-0.5 text-[#71757f]">
            <BarChart2 className="w-6 h-6" />
            <span className="text-[9px]">Markets</span>
          </button>
          <button onClick={() => navigateWithLoading('/TradeDashboard')} className="flex flex-col items-center gap-0.5 text-[#71757f]">
            <ArrowLeftRight className="w-6 h-6" />
            <span className="text-[9px]">Trade</span>
          </button>
          <button onClick={handleEarnClick} className="flex flex-col items-center gap-0.5 text-white">
            <DollarSign className="w-6 h-6" />
            <span className="text-[9px] font-medium">Earn</span>
          </button>
          <button onClick={() => navigateWithLoading('/AssetsDashboard')} className="flex flex-col items-center gap-0.5 text-[#71757f]">
            <Wallet className="w-6 h-6" />
            <span className="text-[9px]">Assets</span>
          </button>
        </div>
      </div>
    </div>
  );
}