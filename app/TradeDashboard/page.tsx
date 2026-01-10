//app/TradeDashboard/page.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home, BarChart2, ArrowLeftRight, DollarSign, Wallet, ChevronDown, Settings, Menu, MoreVertical, HelpCircle, List } from 'lucide-react';

interface InstrumentItem {
  symbol: string;
  baseCoin: string;
  quoteCoin: string;
  status: string;
  [key: string]: any;
}

interface TradingPair {
  symbol: string;
  baseCoin: string;
  quoteCoin: string;
}

interface OrderBookEntry {
  price: number;
  quantity: number;
}

interface OrderBook {
  asks: OrderBookEntry[];
  bids: OrderBookEntry[];
}

export default function TradeDashboard() {
  const router = useRouter();
  const [selectedPair, setSelectedPair] = useState('BTCUSDT');
  const [orderType, setOrderType] = useState('Limit');
  const [side, setSide] = useState('Buy');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [orderValue, setOrderValue] = useState('');
  const [maxBuy, setMaxBuy] = useState('0.000000');
  const [tpsl, setTpsl] = useState(false);
  const [postOnly, setPostOnly] = useState(false);
  const [timeInForce, setTimeInForce] = useState('GTC');
  const [allMarkets, setAllMarkets] = useState(true);
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>([]);
  const [orderBook, setOrderBook] = useState<OrderBook>({ asks: [], bids: [] });
  const [currentPrice, setCurrentPrice] = useState('0');
  const [priceChange, setPriceChange] = useState('0');
  const [volume, setVolume] = useState('0');
  const [loading, setLoading] = useState(true);
  const [navLoading, setNavLoading] = useState(false);
  const [showPairDropdown, setShowPairDropdown] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);

  useEffect(() => {
    fetchTradingPairs();
    fetchOrderBook();
    fetchTicker();
    
    // ✅ FIXED: Faster refresh for more real-time feel
    const orderBookInterval = setInterval(fetchOrderBook, 1500); // Was 2000
    const tickerInterval = setInterval(fetchTicker, 2500); // Was 3000
    
    return () => {
      clearInterval(orderBookInterval);
      clearInterval(tickerInterval);
    };
  }, [selectedPair]);

  const fetchTradingPairs = async () => {
    try {
      console.log('📡 [TradeDashboard] Fetching trading pairs...');
      const response = await fetch('https://api.bybit.com/v5/market/instruments-info?category=spot', {
        cache: 'no-store'
      });
      const data = await response.json();
      
      if (data.retCode === 0) {
        const usdtPairs = data.result.list
          .filter((item: InstrumentItem) => item.quoteCoin === 'USDT' && item.status === 'Trading')
          .map((item: InstrumentItem) => ({
            symbol: item.symbol,
            baseCoin: item.baseCoin,
            quoteCoin: item.quoteCoin,
          }));
        setTradingPairs(usdtPairs);
        console.log('✅ [TradeDashboard] Loaded', usdtPairs.length, 'trading pairs');
      }
    } catch (error) {
      console.error('❌ [TradeDashboard] Error fetching pairs:', error);
    }
  };

  // ✅ CRITICAL FIX: Fetch more order book entries with proper depth parameter
  const fetchOrderBook = async () => {
    try {
      console.log('📡 [TradeDashboard] Fetching order book for', selectedPair);
      
      // ✅ FIXED: Added limit=50 to get more entries (default is only 25)
      const response = await fetch(
        `https://api.bybit.com/v5/market/orderbook?category=spot&symbol=${selectedPair}&limit=50`,
        { cache: 'no-store' }
      );
      
      const data = await response.json();
      console.log('📥 [TradeDashboard] Order book response:', data);
      
      if (data.retCode === 0 && data.result) {
        const book = data.result;
        
        // ✅ FIXED: Take more entries (20 each side instead of 12)
        const asks = book.a?.slice(0, 20).map(([price, qty]: [string, string]) => ({
          price: parseFloat(price),
          quantity: parseFloat(qty),
        })) || [];
        
        const bids = book.b?.slice(0, 20).map(([price, qty]: [string, string]) => ({
          price: parseFloat(price),
          quantity: parseFloat(qty),
        })) || [];
        
        console.log('✅ [TradeDashboard] Order book loaded - Asks:', asks.length, 'Bids:', bids.length);
        
        // ✅ CRITICAL: Log if bids are empty to debug
        if (bids.length === 0) {
          console.error('⚠️ [TradeDashboard] WARNING: No bids received!');
          console.error('Raw book.b data:', book.b);
        }
        
        setOrderBook({ asks, bids });
      } else {
        console.error('❌ [TradeDashboard] Order book API error:', data);
      }
    } catch (error) {
      console.error('❌ [TradeDashboard] Error fetching order book:', error);
    }
  };

  const fetchTicker = async () => {
    try {
      console.log('📡 [TradeDashboard] Fetching ticker for', selectedPair);
      const response = await fetch(
        `https://api.bybit.com/v5/market/tickers?category=spot&symbol=${selectedPair}`,
        { cache: 'no-store' }
      );
      
      const data = await response.json();
      console.log('📥 [TradeDashboard] Ticker response:', data);
      
      if (data.retCode === 0 && data.result.list.length > 0) {
        const ticker = data.result.list[0];
        setCurrentPrice(ticker.lastPrice);
        setPriceChange((parseFloat(ticker.price24hPcnt) * 100).toFixed(2));
        setVolume(ticker.volume24h);
        setPrice(ticker.lastPrice);
        
        // Mock balance calculation
        const mockBalance = 127143443.099;
        const priceInARS = parseFloat(ticker.lastPrice) * 1043;
        setMaxBuy((mockBalance / priceInARS).toFixed(6));
        
        console.log('✅ [TradeDashboard] Ticker loaded - Price:', ticker.lastPrice, 'Change:', (parseFloat(ticker.price24hPcnt) * 100).toFixed(2) + '%');
      }
      setLoading(false);
    } catch (error) {
      console.error('❌ [TradeDashboard] Error fetching ticker:', error);
      setLoading(false);
    }
  };

  // ✅ FIXED: Better price formatting with commas
  const formatPrice = (price: number | string): string => {
    const num = parseFloat(price.toString());
    if (isNaN(num)) return '0';
    if (num >= 10000) return num.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    if (num >= 1000) return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (num >= 1) return num.toFixed(1);
    return num.toFixed(4);
  };

  const formatQuantity = (qty: number | string): string => {
    const num = parseFloat(qty.toString());
    if (isNaN(num)) return '0';
    return num.toFixed(4);
  };

  const navigateWithLoading = (path: string) => {
    setNavLoading(true);
    setTimeout(() => {
      router.push(path);
    }, 500);
  };

  const handleTradeClick = () => {
    setNavLoading(true);
    setTimeout(() => {
      setNavLoading(false);
    }, 1500);
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
      <div className="animate-pulse">
        <div className="flex items-center gap-3 p-4 border-b border-[#1a1a1a]">
          <div className="w-8 h-8 bg-[#1a1a1a] rounded"></div>
          <div className="flex gap-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="w-16 h-6 bg-[#1a1a1a] rounded"></div>
            ))}
          </div>
        </div>
        <div className="p-4 space-y-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-12 bg-[#1a1a1a] rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }
  
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white pb-20 flex flex-col">
      {navLoading && <LoadingSpinner />}
      
      {/* Top Navigation */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-[#1e1e1e] bg-[#0d0d0d]">
        <button className="w-8 h-8 bg-[#f7a600] rounded flex items-center justify-center flex-shrink-0">
          <Menu className="w-5 h-5 text-black" />
        </button>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide flex-1">
          <button className="text-[#71757f] text-sm whitespace-nowrap">Convert</button>
          <button className="text-white text-sm font-medium whitespace-nowrap">Spot</button>
          <button className="text-[#71757f] text-sm whitespace-nowrap">Futures</button>
          <button className="text-[#71757f] text-sm whitespace-nowrap">Options</button>
          <button className="text-[#71757f] text-sm whitespace-nowrap">TradFi</button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Trading Form */}
        <div className="flex-1 overflow-y-auto">
          {/* Pair Header */}
          <div className="px-4 py-3 border-b border-[#1e1e1e] bg-[#0d0d0d]">
            <div className="flex items-center justify-between mb-1">
              <div className="relative">
                <button
                  onClick={() => setShowPairDropdown(!showPairDropdown)}
                  className="flex items-center gap-1"
                >
                  <span className="text-white font-semibold text-lg">{selectedPair.replace('USDT', '/USDT')}</span>
                  <ChevronDown className="w-4 h-4 text-white" />
                </button>
                
                {showPairDropdown && (
                  <div className="absolute top-full left-0 mt-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg py-2 max-h-[300px] overflow-y-auto w-[200px] shadow-lg z-50">
                    {tradingPairs.slice(0, 50).map((pair: TradingPair) => (
                      <button
                        key={pair.symbol}
                        onClick={() => {
                          setSelectedPair(pair.symbol);
                          setShowPairDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-[#2a2a2a] text-white text-sm"
                      >
                        {pair.baseCoin}/{pair.quoteCoin}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <button className="px-2 py-1 bg-[#1a1a1a] rounded text-[#0ecb81] text-[10px] font-medium">
                  MM<br/>0.00%
                </button>
                <button className="p-1.5">
                  <Settings className="w-5 h-5 text-[#71757f]" />
                </button>
                <button className="p-1.5">
                  <List className="w-5 h-5 text-[#71757f]" />
                </button>
              </div>
            </div>
            <span className={`text-sm font-medium ${parseFloat(priceChange) >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
              {parseFloat(priceChange) >= 0 ? '+' : ''}{priceChange}%
            </span>
          </div>

          {/* Buy/Sell Tabs */}
          <div className="flex gap-2 px-4 py-3 bg-[#0d0d0d]">
            <button
              onClick={() => setSide('Buy')}
              className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors ${
                side === 'Buy' ? 'bg-[#0ecb81] text-white' : 'bg-[#1a1a1a] text-[#71757f]'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setSide('Sell')}
              className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors ${
                side === 'Sell' ? 'bg-[#f6465d] text-white' : 'bg-[#1a1a1a] text-[#71757f]'
              }`}
            >
              Sell
            </button>
            <button className="px-4 py-2.5 bg-[#1a1a1a] rounded-md text-white text-sm font-medium flex items-center gap-2">
              Margin
              <div className="w-8 h-4 bg-[#2a2a2a] rounded-full relative">
                <div className="w-3 h-3 bg-white rounded-full absolute left-0.5 top-0.5"></div>
              </div>
            </button>
            <button className="p-2.5 bg-[#1a1a1a] rounded-md">
              <MoreVertical className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Available Balance */}
          <div className="flex items-center justify-between px-4 py-2 text-sm bg-[#0d0d0d]">
            <span className="text-[#71757f]">Available</span>
            <div className="flex items-center gap-1">
              <span className="text-white">0 USDT</span>
              <HelpCircle className="w-3 h-3 text-[#71757f]" />
            </div>
          </div>

          {/* Order Type Dropdown */}
          <div className="px-4 pb-3 bg-[#0d0d0d]">
            <div className="relative">
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="w-full bg-[#1a1a1a] text-white px-3 py-2.5 rounded-md appearance-none cursor-pointer text-sm border border-[#2a2a2a]"
              >
                <option>Limit</option>
                <option>Market</option>
                <option>Stop Limit</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#71757f] pointer-events-none" />
            </div>
          </div>

          {/* Price Input */}
          <div className="px-4 pb-3 bg-[#0d0d0d]">
            <label className="text-[#71757f] text-xs mb-1.5 block">Price</label>
            <div className="relative">
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="90512.5"
                className="w-full bg-[#1a1a1a] text-white text-lg font-semibold px-3 py-2.5 rounded-md pr-16 border border-[#2a2a2a]"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#71757f] text-sm font-medium">
                USDT
              </span>
            </div>
            <div className="text-[#71757f] text-xs mt-1">
              ≈{(parseFloat(price || '0') * 1043).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} ARS
            </div>
          </div>

          {/* Quantity Input */}
          <div className="px-4 pb-3 bg-[#0d0d0d]">
            <label className="text-[#71757f] text-xs mb-1.5 block">Quantity</label>
            <div className="relative">
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0.000000"
                className="w-full bg-[#1a1a1a] text-white px-3 py-2.5 rounded-md pr-16 border border-[#2a2a2a]"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#71757f] text-sm font-medium">
                BTC
              </span>
            </div>
          </div>

          {/* Percentage Slider */}
          <div className="px-4 pb-3 bg-[#0d0d0d]">
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={(e) => setSliderValue(Number(e.target.value))}
                className="w-full h-1.5 bg-[#1a1a1a] rounded-full appearance-none cursor-pointer accent-[#0ecb81]"
              />
              <div className="flex justify-between mt-2">
                {[0, 25, 50, 75, 100].map(val => (
                  <button
                    key={val}
                    onClick={() => setSliderValue(val)}
                    className="w-1 h-1 bg-[#2a2a2a] rounded-full"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Order Value */}
          <div className="px-4 pb-3 bg-[#0d0d0d]">
            <label className="text-[#71757f] text-xs mb-1.5 block">Order Value</label>
            <div className="relative">
              <input
                type="text"
                value={orderValue}
                readOnly
                placeholder="0.000000"
                className="w-full bg-[#1a1a1a] text-white px-3 py-2.5 rounded-md pr-16 border border-[#2a2a2a]"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#71757f] text-sm font-medium">
                USDT
              </span>
            </div>
          </div>

          {/* Max Buy */}
          <div className="px-4 pb-3 bg-[#0d0d0d]">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#71757f]">Max. Buy</span>
              <span className="text-white">{maxBuy} BTC</span>
            </div>
          </div>

          {/* TP/SL and Post-Only */}
          <div className="px-4 pb-3 space-y-2 bg-[#0d0d0d]">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={tpsl}
                onChange={(e) => setTpsl(e.target.checked)}
                className="w-4 h-4 rounded border-[#2a2a2a] bg-[#1a1a1a] accent-[#0ecb81]"
              />
              <span className="text-white text-sm ml-2">TP/SL</span>
            </label>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={postOnly}
                  onChange={(e) => setPostOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-[#2a2a2a] bg-[#1a1a1a] accent-[#0ecb81]"
                />
                <span className="text-white text-sm ml-2">Post-Only</span>
              </label>
              
              <div className="relative">
                <select
                  value={timeInForce}
                  onChange={(e) => setTimeInForce(e.target.value)}
                  className="bg-transparent text-[#71757f] text-sm border border-[#2a2a2a] rounded px-3 py-1 pr-8 appearance-none"
                >
                  <option>GTC</option>
                  <option>IOC</option>
                  <option>FOK</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-[#71757f] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Buy Button */}
          <div className="px-4 pb-3 bg-[#0d0d0d]">
            <button className={`w-full font-semibold py-3.5 rounded-md text-base transition-colors ${
              side === 'Buy' 
                ? 'bg-[#0ecb81] hover:bg-[#0db872] text-white' 
                : 'bg-[#f6465d] hover:bg-[#e03d51] text-white'
            }`}>
              {side}
            </button>
          </div>

          {/* Orders Tabs */}
          <div className="border-t border-[#1e1e1e] bg-[#0d0d0d]">
            <div className="flex items-center px-4 py-3 text-sm overflow-x-auto scrollbar-hide">
              <button className="pb-2 px-1 text-white font-medium border-b-2 border-white whitespace-nowrap">
                Orders(0)
              </button>
              <button className="pb-2 px-4 text-[#71757f] whitespace-nowrap">
                Positions(0)
              </button>
              <button className="pb-2 px-4 text-[#71757f] whitespace-nowrap">
                Assets
              </button>
              <button className="pb-2 px-4 text-[#71757f] whitespace-nowrap">
                Borrowings(0)
              </button>
              <button className="pb-2 px-4 text-[#71757f] whitespace-nowrap">
                Tools(0)
              </button>
              <button className="ml-auto p-1">
                <HelpCircle className="w-4 h-4 text-[#71757f]" />
              </button>
              <button className="p-1">
                <List className="w-4 h-4 text-[#71757f]" />
              </button>
            </div>

            {/* All Markets Filter */}
            <div className="flex items-center justify-between px-4 py-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={allMarkets}
                  onChange={(e) => setAllMarkets(e.target.checked)}
                  className="w-4 h-4 rounded accent-white"
                />
                <span className="text-white text-sm ml-2">All Markets</span>
              </label>
              <button className="flex items-center gap-1 text-[#71757f] text-sm">
                All Types
                <ChevronDown className="w-3 h-3" />
              </button>
              <button className="p-1">
                <List className="w-4 h-4 text-[#71757f]" />
              </button>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 border-2 border-[#2a2a2a] rounded-xl flex items-center justify-center mb-3">
                <svg className="w-10 h-10 text-[#2a2a2a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
		
		{/* Right Panel - Order Book - ✅ FIXED */}
        <div className="w-[45%] border-l border-[#1e1e1e] bg-[#0d0d0d] overflow-y-auto">
          {/* Order Book Header */}
          <div className="sticky top-0 bg-[#0d0d0d] px-3 py-2 border-b border-[#1e1e1e]">
            <div className="flex items-center justify-between text-[10px] text-[#71757f]">
              <span>Price<br/>(USDT)</span>
              <span className="text-right">Qty<br/>(BTC)</span>
            </div>
          </div>

          {/* ✅ FIXED: Asks - Now showing full depth */}
          <div className="space-y-px">
            {orderBook.asks.length > 0 ? (
              orderBook.asks.slice().reverse().map((order, idx) => {
                const maxQty = Math.max(
                  ...orderBook.asks.map(a => a.quantity),
                  ...orderBook.bids.map(b => b.quantity)
                );
                const percentage = maxQty > 0 ? (order.quantity / maxQty) * 100 : 0;
                
                return (
                  <div
                    key={`ask-${idx}`}
                    className="flex items-center justify-between px-3 py-0.5 text-[11px] hover:bg-[#1a1a1a] cursor-pointer relative overflow-hidden"
                  >
                    <div 
                      className="absolute right-0 top-0 bottom-0 bg-[#f6465d] opacity-10"
                      style={{ width: `${percentage}%` }}
                    />
                    <span className="text-[#f6465d] z-10 relative font-medium">{formatPrice(order.price)}</span>
                    <span className="text-[#71757f] z-10 relative">{formatQuantity(order.quantity)}</span>
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-2 text-[#71757f] text-xs text-center">
                Loading asks...
              </div>
            )}
          </div>

          {/* Current Price - ✅ Enhanced */}
          <div className="sticky z-20 bg-[#0d0d0d] px-3 py-2 border-y border-[#1e1e1e]">
            <div className="flex items-center justify-between">
              <span className={`text-base font-semibold ${parseFloat(priceChange) >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                {formatPrice(currentPrice)}
              </span>
              <span className="text-[10px] text-[#71757f]">
                ≈{(parseFloat(currentPrice) * 1043).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} ARS
              </span>
            </div>
          </div>

          {/* ✅ FIXED: Bids - Now showing full depth */}
          <div className="space-y-px">
            {orderBook.bids.length > 0 ? (
              orderBook.bids.map((order, idx) => {
                const maxQty = Math.max(
                  ...orderBook.asks.map(a => a.quantity),
                  ...orderBook.bids.map(b => b.quantity)
                );
                const percentage = maxQty > 0 ? (order.quantity / maxQty) * 100 : 0;
                
                return (
                  <div
                    key={`bid-${idx}`}
                    className="flex items-center justify-between px-3 py-0.5 text-[11px] hover:bg-[#1a1a1a] cursor-pointer relative overflow-hidden"
                  >
                    <div 
                      className="absolute right-0 top-0 bottom-0 bg-[#0ecb81] opacity-10"
                      style={{ width: `${percentage}%` }}
                    />
                    <span className="text-[#0ecb81] z-10 relative font-medium">{formatPrice(order.price)}</span>
                    <span className="text-[#71757f] z-10 relative">{formatQuantity(order.quantity)}</span>
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-2 text-[#71757f] text-xs text-center">
                Loading bids...
              </div>
            )}
          </div>

          {/* ✅ FIXED: Order Book Footer with Buy/Sell Ratio */}
          <div className="sticky bottom-0 bg-[#0d0d0d] px-3 py-3 border-t border-[#1e1e1e]">
            <div className="flex items-center justify-between mb-2">
              <button className="px-2 py-1 bg-[#1a1a1a] rounded text-[10px] text-[#71757f]">
                0.1
              </button>
              <div className="flex items-center gap-2">
                <button className="w-6 h-6 rounded bg-[#1a1a1a] flex items-center justify-center">
                  <List className="w-3 h-3 text-[#71757f]" />
                </button>
              </div>
            </div>
            
            {/* ✅ FIXED: Calculate and display buy/sell ratio */}
            <div className="flex items-center justify-center gap-3 text-xs">
              {(() => {
                const totalBidQty = orderBook.bids.reduce((sum, bid) => sum + bid.quantity, 0);
                const totalAskQty = orderBook.asks.reduce((sum, ask) => sum + ask.quantity, 0);
                const total = totalBidQty + totalAskQty;
                
                const bidPercentage = total > 0 ? Math.round((totalBidQty / total) * 100) : 0;
                const askPercentage = total > 0 ? Math.round((totalAskQty / total) * 100) : 0;
                
                return (
                  <>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-[#0ecb81] rounded-sm"></div>
                      <span className="text-[#0ecb81] font-medium">{bidPercentage}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-[#f6465d] rounded-sm"></div>
                      <span className="text-[#f6465d] font-medium">{askPercentage}%</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
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
          <button onClick={handleTradeClick} className="flex flex-col items-center gap-0.5 text-white">
            <ArrowLeftRight className="w-6 h-6" />
            <span className="text-[9px] font-medium">Trade</span>
          </button>
          <button onClick={() => navigateWithLoading('/EarnDashboard')} className="flex flex-col items-center gap-0.5 text-[#71757f]">
            <DollarSign className="w-6 h-6" />
            <span className="text-[9px]">Earn</span>
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
