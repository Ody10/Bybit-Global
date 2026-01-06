'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface TradingPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  lastPrice: number;
  price24hChange: number;
  price24hHigh: number;
  price24hLow: number;
  volume24h: number;
}

interface OrderBookLevel {
  price: number;
  quantity: number;
  total: number;
}

interface Order {
  orderId: string;
  symbol: string;
  type: string;
  side: string;
  quantity: number;
  price: number;
  filledQty: number;
  status: string;
  createdAt: string;
}

function SpotTradingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [selectedPair, setSelectedPair] = useState<TradingPair | null>(null);
  const [pairs, setPairs] = useState<TradingPair[]>([]);
  const [orderBook, setOrderBook] = useState<{ bids: OrderBookLevel[]; asks: OrderBookLevel[] }>({ bids: [], asks: [] });
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [balances, setBalances] = useState<{ base: number; quote: number }>({ base: 0, quote: 0 });
  
  // Order form state
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('LIMIT');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [total, setTotal] = useState('');
  const [percentages] = useState([25, 50, 75, 100]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [showPairSelector, setShowPairSelector] = useState(false);
  const [activeTab, setActiveTab] = useState<'orderbook' | 'trades'>('orderbook');
  const [bottomTab, setBottomTab] = useState<'openOrders' | 'orderHistory'>('openOrders');
  
  const symbol = searchParams.get('symbol') || 'BTCUSDT';

  // Fetch trading pairs
  const fetchPairs = useCallback(async () => {
    try {
      const response = await fetch('/api/trading/pairs?type=SPOT');
      const data = await response.json();
      if (data.success) {
        setPairs(data.pairs);
        const current = data.pairs.find((p: TradingPair) => p.symbol === symbol);
        if (current) {
          setSelectedPair(current);
          setPrice(current.lastPrice.toString());
        }
      }
    } catch (error) {
      console.error('Error fetching pairs:', error);
    }
  }, [symbol]);

  // Fetch order book
  const fetchOrderBook = useCallback(async () => {
    if (!symbol) return;
    try {
      const response = await fetch(`/api/trading/orderbook?symbol=${symbol}&type=orderbook&depth=15`);
      const data = await response.json();
      if (data.success) {
        setOrderBook({ bids: data.bids, asks: data.asks.reverse() });
      }
    } catch (error) {
      console.error('Error fetching order book:', error);
    }
  }, [symbol]);

  // Fetch recent trades
  const fetchTrades = useCallback(async () => {
    if (!symbol) return;
    try {
      const response = await fetch(`/api/trading/orderbook?symbol=${symbol}&type=trades&limit=20`);
      const data = await response.json();
      if (data.success) {
        setRecentTrades(data.trades);
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  }, [symbol]);

  // Fetch user orders
  const fetchUserOrders = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    
    try {
      const response = await fetch(`/api/trading/orders?symbol=${symbol}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setUserOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // Fetch user balances
  const fetchBalances = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token || !selectedPair) return;
    
    try {
      const response = await fetch('/api/balances', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.balances) {
        const baseBalance = data.balances.find((b: any) => b.currency === selectedPair.baseAsset);
        const quoteBalance = data.balances.find((b: any) => b.currency === selectedPair.quoteAsset);
        setBalances({
          base: baseBalance?.available || 0,
          quote: quoteBalance?.available || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchPairs();
  }, [fetchPairs]);

  // Update when pair changes
  useEffect(() => {
    if (selectedPair) {
      fetchOrderBook();
      fetchTrades();
      fetchUserOrders();
      fetchBalances();
    }
  }, [selectedPair]);

  // Auto-refresh market data
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrderBook();
      fetchTrades();
      if (selectedPair) {
        fetchPairs();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchOrderBook, fetchTrades, fetchPairs, selectedPair]);

  // Calculate total when price or quantity changes
  useEffect(() => {
    if (price && quantity) {
      const totalValue = parseFloat(price) * parseFloat(quantity);
      setTotal(totalValue.toFixed(2));
    } else {
      setTotal('');
    }
  }, [price, quantity]);

  // Handle percentage buttons
  const handlePercentage = (percent: number) => {
    if (!selectedPair) return;
    
    const currentPrice = parseFloat(price) || selectedPair.lastPrice;
    
    if (orderSide === 'BUY') {
      const maxQuantity = balances.quote / currentPrice;
      const qty = (maxQuantity * percent) / 100;
      setQuantity(qty.toFixed(6));
    } else {
      const qty = (balances.base * percent) / 100;
      setQuantity(qty.toFixed(6));
    }
  };

  // Submit order
  const handleSubmitOrder = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    if (!quantity || parseFloat(quantity) <= 0) {
      alert('Please enter a valid quantity');
      return;
    }
    
    if (orderType === 'LIMIT' && (!price || parseFloat(price) <= 0)) {
      alert('Please enter a valid price');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/trading/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol,
          type: orderType,
          side: orderSide,
          quantity: parseFloat(quantity),
          price: orderType === 'LIMIT' ? parseFloat(price) : undefined,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Reset form
        setQuantity('');
        if (orderType === 'MARKET') setPrice('');
        
        // Refresh data
        fetchUserOrders();
        fetchBalances();
        fetchOrderBook();
        
        alert(`Order ${data.order.status === 'FILLED' ? 'executed' : 'placed'} successfully!`);
      } else {
        alert(data.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  // Cancel order
  const handleCancelOrder = async (orderId: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    
    try {
      const response = await fetch(`/api/trading/orders?orderId=${orderId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const data = await response.json();
      if (data.success) {
        fetchUserOrders();
        fetchBalances();
      } else {
        alert(data.error || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  // Format price for display
  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toFixed(2);
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(6);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0a0a0a] border-b border-[#1a1a1a]">
        <div className="flex items-center justify-between p-3">
          <button onClick={() => router.back()} className="p-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* Pair Selector */}
          <button 
            onClick={() => setShowPairSelector(true)}
            className="flex items-center gap-2"
          >
            <span className="text-lg font-bold">{selectedPair?.symbol || symbol}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <button className="p-2" onClick={() => router.push('/Futures?symbol=' + symbol)}>
            <span className="text-xs text-yellow-500">Futures</span>
          </button>
        </div>
        
        {/* Price Info */}
        {selectedPair && (
          <div className="px-4 pb-3">
            <div className="flex items-baseline gap-3">
              <span className={`text-2xl font-bold ${selectedPair.price24hChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatPrice(selectedPair.lastPrice)}
              </span>
              <span className={`text-sm ${selectedPair.price24hChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {selectedPair.price24hChange >= 0 ? '+' : ''}{selectedPair.price24hChange.toFixed(2)}%
              </span>
            </div>
            <div className="flex gap-4 mt-1 text-xs text-gray-500">
              <span>24h High: {formatPrice(selectedPair.price24hHigh)}</span>
              <span>24h Low: {formatPrice(selectedPair.price24hLow)}</span>
              <span>Vol: {selectedPair.volume24h.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row">
        {/* Order Book / Trades */}
        <div className="lg:w-1/3 border-r border-[#1a1a1a]">
          {/* Tabs */}
          <div className="flex border-b border-[#1a1a1a]">
            <button
              onClick={() => setActiveTab('orderbook')}
              className={`flex-1 py-2 text-sm ${activeTab === 'orderbook' ? 'text-white border-b-2 border-yellow-500' : 'text-gray-500'}`}
            >
              Order Book
            </button>
            <button
              onClick={() => setActiveTab('trades')}
              className={`flex-1 py-2 text-sm ${activeTab === 'trades' ? 'text-white border-b-2 border-yellow-500' : 'text-gray-500'}`}
            >
              Trades
            </button>
          </div>
          
          {activeTab === 'orderbook' ? (
            <div className="p-2">
              {/* Header */}
              <div className="flex justify-between text-xs text-gray-500 mb-1 px-1">
                <span>Price ({selectedPair?.quoteAsset})</span>
                <span>Amount ({selectedPair?.baseAsset})</span>
                <span>Total</span>
              </div>
              
              {/* Asks (Sell orders) - Red */}
              <div className="space-y-0.5">
                {orderBook.asks.slice(0, 10).map((level, i) => (
                  <div 
                    key={`ask-${i}`}
                    className="flex justify-between text-xs py-0.5 px-1 hover:bg-[#1a1a1a] cursor-pointer relative"
                    onClick={() => setPrice(level.price.toString())}
                  >
                    <div 
                      className="absolute inset-0 bg-red-500/10"
                      style={{ width: `${Math.min((level.quantity / (orderBook.asks[0]?.quantity || 1)) * 100, 100)}%`, right: 0, left: 'auto' }}
                    />
                    <span className="text-red-500 relative z-10">{formatPrice(level.price)}</span>
                    <span className="text-gray-300 relative z-10">{level.quantity.toFixed(4)}</span>
                    <span className="text-gray-500 relative z-10">{level.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              {/* Current Price */}
              <div className="py-2 text-center">
                <span className={`text-lg font-bold ${selectedPair && selectedPair.price24hChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {selectedPair ? formatPrice(selectedPair.lastPrice) : '--'}
                </span>
              </div>
              
              {/* Bids (Buy orders) - Green */}
              <div className="space-y-0.5">
                {orderBook.bids.slice(0, 10).map((level, i) => (
                  <div 
                    key={`bid-${i}`}
                    className="flex justify-between text-xs py-0.5 px-1 hover:bg-[#1a1a1a] cursor-pointer relative"
                    onClick={() => setPrice(level.price.toString())}
                  >
                    <div 
                      className="absolute inset-0 bg-green-500/10"
                      style={{ width: `${Math.min((level.quantity / (orderBook.bids[0]?.quantity || 1)) * 100, 100)}%`, right: 0, left: 'auto' }}
                    />
                    <span className="text-green-500 relative z-10">{formatPrice(level.price)}</span>
                    <span className="text-gray-300 relative z-10">{level.quantity.toFixed(4)}</span>
                    <span className="text-gray-500 relative z-10">{level.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1 px-1">
                <span>Price</span>
                <span>Amount</span>
                <span>Time</span>
              </div>
              <div className="space-y-0.5">
                {recentTrades.map((trade, i) => (
                  <div key={i} className="flex justify-between text-xs py-0.5 px-1">
                    <span className={trade.isBuyerMaker ? 'text-red-500' : 'text-green-500'}>
                      {formatPrice(trade.price)}
                    </span>
                    <span className="text-gray-300">{trade.quantity.toFixed(4)}</span>
                    <span className="text-gray-500">
                      {new Date(trade.time).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Form */}
        <div className="lg:w-2/3 p-4">
          {/* Buy/Sell Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setOrderSide('BUY')}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                orderSide === 'BUY'
                  ? 'bg-green-500 text-white'
                  : 'bg-[#1a1a1a] text-gray-400'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setOrderSide('SELL')}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                orderSide === 'SELL'
                  ? 'bg-red-500 text-white'
                  : 'bg-[#1a1a1a] text-gray-400'
              }`}
            >
              Sell
            </button>
          </div>

          {/* Order Type */}
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setOrderType('LIMIT')}
              className={`text-sm ${orderType === 'LIMIT' ? 'text-white' : 'text-gray-500'}`}
            >
              Limit
            </button>
            <button
              onClick={() => setOrderType('MARKET')}
              className={`text-sm ${orderType === 'MARKET' ? 'text-white' : 'text-gray-500'}`}
            >
              Market
            </button>
          </div>

          {/* Price Input (for Limit orders) */}
          {orderType === 'LIMIT' && (
            <div className="mb-3">
              <label className="text-xs text-gray-500 mb-1 block">Price</label>
              <div className="flex items-center bg-[#1a1a1a] rounded-lg">
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-transparent px-3 py-3 outline-none text-right"
                />
                <span className="px-3 text-gray-500">{selectedPair?.quoteAsset}</span>
              </div>
            </div>
          )}

          {/* Quantity Input */}
          <div className="mb-3">
            <div className="flex justify-between mb-1">
              <label className="text-xs text-gray-500">Amount</label>
              <span className="text-xs text-gray-500">
                Avbl: {orderSide === 'BUY' ? balances.quote.toFixed(2) : balances.base.toFixed(6)} {orderSide === 'BUY' ? selectedPair?.quoteAsset : selectedPair?.baseAsset}
              </span>
            </div>
            <div className="flex items-center bg-[#1a1a1a] rounded-lg">
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0.00"
                className="flex-1 bg-transparent px-3 py-3 outline-none text-right"
              />
              <span className="px-3 text-gray-500">{selectedPair?.baseAsset}</span>
            </div>
          </div>

          {/* Percentage Buttons */}
          <div className="flex gap-2 mb-4">
            {percentages.map((p) => (
              <button
                key={p}
                onClick={() => handlePercentage(p)}
                className="flex-1 py-1.5 text-xs bg-[#1a1a1a] rounded hover:bg-[#252525] transition-colors"
              >
                {p}%
              </button>
            ))}
          </div>

          {/* Total */}
          <div className="mb-4">
            <label className="text-xs text-gray-500 mb-1 block">Total</label>
            <div className="flex items-center bg-[#1a1a1a] rounded-lg">
              <input
                type="text"
                value={total}
                readOnly
                placeholder="0.00"
                className="flex-1 bg-transparent px-3 py-3 outline-none text-right"
              />
              <span className="px-3 text-gray-500">{selectedPair?.quoteAsset}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmitOrder}
            disabled={loading || !quantity}
            className={`w-full py-4 rounded-lg font-medium transition-colors ${
              orderSide === 'BUY'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-red-500 hover:bg-red-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? 'Processing...' : `${orderSide === 'BUY' ? 'Buy' : 'Sell'} ${selectedPair?.baseAsset || ''}`}
          </button>
        </div>
      </div>

      {/* Open Orders / Order History */}
      <div className="border-t border-[#1a1a1a] mt-4">
        <div className="flex border-b border-[#1a1a1a]">
          <button
            onClick={() => setBottomTab('openOrders')}
            className={`px-4 py-3 text-sm ${bottomTab === 'openOrders' ? 'text-white border-b-2 border-yellow-500' : 'text-gray-500'}`}
          >
            Open Orders ({userOrders.filter(o => o.status === 'NEW' || o.status === 'PARTIALLY_FILLED').length})
          </button>
          <button
            onClick={() => setBottomTab('orderHistory')}
            className={`px-4 py-3 text-sm ${bottomTab === 'orderHistory' ? 'text-white border-b-2 border-yellow-500' : 'text-gray-500'}`}
          >
            Order History
          </button>
        </div>
        
        <div className="p-4 min-h-[200px]">
          {userOrders.filter(o => 
            bottomTab === 'openOrders' 
              ? (o.status === 'NEW' || o.status === 'PARTIALLY_FILLED')
              : (o.status !== 'NEW' && o.status !== 'PARTIALLY_FILLED')
          ).length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No {bottomTab === 'openOrders' ? 'open orders' : 'order history'}
            </div>
          ) : (
            <div className="space-y-2">
              {userOrders
                .filter(o => 
                  bottomTab === 'openOrders' 
                    ? (o.status === 'NEW' || o.status === 'PARTIALLY_FILLED')
                    : (o.status !== 'NEW' && o.status !== 'PARTIALLY_FILLED')
                )
                .map((order) => (
                  <div key={order.orderId} className="bg-[#1a1a1a] rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${order.side === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                            {order.side}
                          </span>
                          <span className="text-sm text-white">{order.symbol}</span>
                          <span className="text-xs text-gray-500">{order.type}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(order.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-white">
                          {order.filledQty}/{order.quantity}
                        </div>
                        <div className="text-xs text-gray-500">
                          @ {order.price?.toFixed(2) || 'Market'}
                        </div>
                      </div>
                    </div>
                    {bottomTab === 'openOrders' && (
                      <button
                        onClick={() => handleCancelOrder(order.orderId)}
                        className="mt-2 text-xs text-red-500 hover:text-red-400"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Pair Selector Modal */}
      {showPairSelector && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end lg:items-center justify-center">
          <div className="bg-[#121212] w-full lg:w-96 max-h-[70vh] rounded-t-2xl lg:rounded-2xl">
            <div className="flex justify-between items-center p-4 border-b border-[#1a1a1a]">
              <h3 className="text-lg font-medium">Select Pair</h3>
              <button onClick={() => setShowPairSelector(false)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {pairs.map((pair) => (
                <button
                  key={pair.symbol}
                  onClick={() => {
                    router.push(`/Trade?symbol=${pair.symbol}`);
                    setShowPairSelector(false);
                  }}
                  className="w-full flex justify-between items-center p-4 hover:bg-[#1a1a1a] transition-colors"
                >
                  <div>
                    <div className="font-medium">{pair.baseAsset}/{pair.quoteAsset}</div>
                    <div className="text-xs text-gray-500">Vol: {pair.volume24h.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatPrice(pair.lastPrice)}</div>
                    <div className={`text-xs ${pair.price24hChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {pair.price24hChange >= 0 ? '+' : ''}{pair.price24hChange.toFixed(2)}%
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SpotTrading() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SpotTradingContent />
    </Suspense>
  );
}