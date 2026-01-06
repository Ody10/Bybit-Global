'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface TradingPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  lastPrice: number;
  markPrice: number;
  price24hChange: number;
  price24hHigh: number;
  price24hLow: number;
  volume24h: number;
  maxLeverage: number;
}

interface Position {
  positionId: string;
  symbol: string;
  side: string;
  size: number;
  entryPrice: number;
  markPrice: number;
  liquidationPrice: number;
  margin: number;
  leverage: number;
  unrealizedPnl: number;
  roe: number;
  isOpen: boolean;
}

interface Order {
  orderId: string;
  symbol: string;
  type: string;
  side: string;
  positionSide: string;
  quantity: number;
  price: number;
  filledQty: number;
  status: string;
  leverage: number;
  createdAt: string;
}

function FuturesTradingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [selectedPair, setSelectedPair] = useState<TradingPair | null>(null);
  const [pairs, setPairs] = useState<TradingPair[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [balance, setBalance] = useState(0);
  
  // Order form state
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY');
  const [positionSide, setPositionSide] = useState<'LONG' | 'SHORT'>('LONG');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [leverage, setLeverage] = useState(10);
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [margin, setMargin] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [showLeverageModal, setShowLeverageModal] = useState(false);
  const [showPairSelector, setShowPairSelector] = useState(false);
  const [activeTab, setActiveTab] = useState<'positions' | 'openOrders' | 'orderHistory'>('positions');
  
  const symbol = searchParams.get('symbol') || 'BTCUSDT';

  // Fetch trading pairs
  const fetchPairs = useCallback(async () => {
    try {
      const response = await fetch('/api/trading/pairs');
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

  // Fetch positions
  const fetchPositions = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    
    try {
      const response = await fetch('/api/trading/positions?isOpen=true', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setPositions(data.positions);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  };

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

  // Fetch balance
  const fetchBalance = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    
    try {
      const response = await fetch('/api/balances?currency=USDT', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.balances && data.balances.length > 0) {
        setBalance(data.balances[0].available || 0);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchPairs();
    fetchPositions();
    fetchUserOrders();
    fetchBalance();
  }, [fetchPairs]);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPairs();
      fetchPositions();
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchPairs]);

  // Calculate margin when inputs change
  useEffect(() => {
    if (selectedPair && quantity) {
      const currentPrice = parseFloat(price) || selectedPair.lastPrice;
      const notionalValue = parseFloat(quantity) * currentPrice;
      const requiredMargin = notionalValue / leverage;
      setMargin(requiredMargin.toFixed(2));
    } else {
      setMargin('');
    }
  }, [price, quantity, leverage, selectedPair]);

  // Handle position side change
  const handlePositionSideChange = (side: 'LONG' | 'SHORT') => {
    setPositionSide(side);
    setOrderSide(side === 'LONG' ? 'BUY' : 'SELL');
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
          positionSide,
          quantity: parseFloat(quantity),
          price: orderType === 'LIMIT' ? parseFloat(price) : undefined,
          leverage,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setQuantity('');
        fetchPositions();
        fetchUserOrders();
        fetchBalance();
        alert('Order placed successfully!');
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

  // Close position
  const handleClosePosition = async (positionId: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    
    if (!confirm('Are you sure you want to close this position?')) return;
    
    try {
      const response = await fetch('/api/trading/positions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'CLOSE',
          positionId,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        fetchPositions();
        fetchBalance();
        alert('Position closed successfully!');
      } else {
        alert(data.error || 'Failed to close position');
      }
    } catch (error) {
      console.error('Error closing position:', error);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toFixed(2);
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(6);
  };

  const leverageOptions = [1, 2, 3, 5, 10, 20, 25, 50, 75, 100, 125];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0a0a0a] border-b border-[#1a1a1a]">
        <div className="flex items-center justify-between p-3">
          <button onClick={() => router.back()} className="p-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            onClick={() => setShowPairSelector(true)}
            className="flex items-center gap-2"
          >
            <span className="text-lg font-bold">{selectedPair?.symbol || symbol}</span>
            <span className="text-xs bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded">Perp</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <button className="p-2" onClick={() => router.push('/Trade?symbol=' + symbol)}>
            <span className="text-xs text-gray-400">Spot</span>
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
              <span>Mark: {formatPrice(selectedPair.markPrice || selectedPair.lastPrice)}</span>
              <span>24h Vol: {selectedPair.volume24h.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Long/Short Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => handlePositionSideChange('LONG')}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              positionSide === 'LONG'
                ? 'bg-green-500 text-white'
                : 'bg-[#1a1a1a] text-gray-400'
            }`}
          >
            Long
          </button>
          <button
            onClick={() => handlePositionSideChange('SHORT')}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              positionSide === 'SHORT'
                ? 'bg-red-500 text-white'
                : 'bg-[#1a1a1a] text-gray-400'
            }`}
          >
            Short
          </button>
        </div>

        {/* Leverage & Order Type */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setShowLeverageModal(true)}
            className="flex items-center gap-2 bg-[#1a1a1a] px-3 py-2 rounded-lg"
          >
            <span className="text-yellow-500 font-medium">{leverage}x</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div className="flex gap-4">
            <button
              onClick={() => setOrderType('MARKET')}
              className={`text-sm ${orderType === 'MARKET' ? 'text-white' : 'text-gray-500'}`}
            >
              Market
            </button>
            <button
              onClick={() => setOrderType('LIMIT')}
              className={`text-sm ${orderType === 'LIMIT' ? 'text-white' : 'text-gray-500'}`}
            >
              Limit
            </button>
          </div>
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
              <span className="px-3 text-gray-500">USDT</span>
            </div>
          </div>
        )}

        {/* Size Input */}
        <div className="mb-3">
          <div className="flex justify-between mb-1">
            <label className="text-xs text-gray-500">Size</label>
            <span className="text-xs text-gray-500">
              Avbl: {balance.toFixed(2)} USDT
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

        {/* Margin Display */}
        <div className="flex justify-between py-2 text-sm">
          <span className="text-gray-500">Margin</span>
          <span className="text-white">{margin || '0.00'} USDT</span>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmitOrder}
          disabled={loading || !quantity}
          className={`w-full py-4 rounded-lg font-medium transition-colors ${
            positionSide === 'LONG'
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-red-500 hover:bg-red-600'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? 'Processing...' : `Open ${positionSide}`}
        </button>
      </div>

      {/* Positions & Orders */}
      <div className="border-t border-[#1a1a1a] mt-4">
        <div className="flex border-b border-[#1a1a1a] overflow-x-auto">
          <button
            onClick={() => setActiveTab('positions')}
            className={`px-4 py-3 text-sm whitespace-nowrap ${activeTab === 'positions' ? 'text-white border-b-2 border-yellow-500' : 'text-gray-500'}`}
          >
            Positions ({positions.filter(p => p.isOpen).length})
          </button>
          <button
            onClick={() => setActiveTab('openOrders')}
            className={`px-4 py-3 text-sm whitespace-nowrap ${activeTab === 'openOrders' ? 'text-white border-b-2 border-yellow-500' : 'text-gray-500'}`}
          >
            Open Orders ({userOrders.filter(o => o.status === 'NEW').length})
          </button>
          <button
            onClick={() => setActiveTab('orderHistory')}
            className={`px-4 py-3 text-sm whitespace-nowrap ${activeTab === 'orderHistory' ? 'text-white border-b-2 border-yellow-500' : 'text-gray-500'}`}
          >
            Order History
          </button>
        </div>
        
        <div className="p-4 min-h-[200px]">
          {activeTab === 'positions' && (
            positions.filter(p => p.isOpen).length === 0 ? (
              <div className="text-center text-gray-500 py-8">No open positions</div>
            ) : (
              <div className="space-y-3">
                {positions.filter(p => p.isOpen).map((pos) => (
                  <div key={pos.positionId} className="bg-[#1a1a1a] rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{pos.symbol}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${pos.side === 'LONG' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                            {pos.side} {pos.leverage}x
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Size: {pos.size.toFixed(4)} | Entry: {formatPrice(pos.entryPrice)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${pos.unrealizedPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {pos.unrealizedPnl >= 0 ? '+' : ''}{pos.unrealizedPnl.toFixed(2)} USDT
                        </div>
                        <div className={`text-xs ${pos.roe >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          ROE: {pos.roe >= 0 ? '+' : ''}{pos.roe.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mb-3">
                      <span>Mark: {formatPrice(pos.markPrice)}</span>
                      <span>Liq: {pos.liquidationPrice ? formatPrice(pos.liquidationPrice) : '--'}</span>
                      <span>Margin: {pos.margin.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => handleClosePosition(pos.positionId)}
                      className="w-full py-2 border border-gray-600 rounded-lg text-sm hover:bg-[#252525] transition-colors"
                    >
                      Close Position
                    </button>
                  </div>
                ))}
              </div>
            )
          )}
          
          {activeTab === 'openOrders' && (
            userOrders.filter(o => o.status === 'NEW').length === 0 ? (
              <div className="text-center text-gray-500 py-8">No open orders</div>
            ) : (
              <div className="space-y-2">
                {userOrders.filter(o => o.status === 'NEW').map((order) => (
                  <div key={order.orderId} className="bg-[#1a1a1a] rounded-lg p-3">
                    <div className="flex justify-between">
                      <div>
                        <span className={`text-sm font-medium ${order.side === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                          {order.positionSide || order.side} {order.leverage}x
                        </span>
                        <span className="text-sm text-white ml-2">{order.symbol}</span>
                      </div>
                      <div className="text-right text-sm">
                        {order.quantity} @ {order.price?.toFixed(2) || 'Market'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
          
          {activeTab === 'orderHistory' && (
            userOrders.filter(o => o.status !== 'NEW').length === 0 ? (
              <div className="text-center text-gray-500 py-8">No order history</div>
            ) : (
              <div className="space-y-2">
                {userOrders.filter(o => o.status !== 'NEW').map((order) => (
                  <div key={order.orderId} className="bg-[#1a1a1a] rounded-lg p-3">
                    <div className="flex justify-between">
                      <div>
                        <span className={`text-sm ${order.side === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                          {order.positionSide || order.side}
                        </span>
                        <span className="text-sm text-gray-400 ml-2">{order.status}</span>
                      </div>
                      <div className="text-right text-sm text-gray-400">
                        {order.filledQty}/{order.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Leverage Modal */}
      {showLeverageModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] w-full max-w-sm rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Adjust Leverage</h3>
              <button onClick={() => setShowLeverageModal(false)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="text-center mb-6">
              <span className="text-4xl font-bold text-yellow-500">{leverage}x</span>
            </div>
            
            {/* Leverage Slider */}
            <input
              type="range"
              min="1"
              max={selectedPair?.maxLeverage || 125}
              value={leverage}
              onChange={(e) => setLeverage(parseInt(e.target.value))}
              className="w-full mb-4 accent-yellow-500"
            />
            
            {/* Quick Select */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {leverageOptions.filter(l => l <= (selectedPair?.maxLeverage || 125)).map((l) => (
                <button
                  key={l}
                  onClick={() => setLeverage(l)}
                  className={`py-2 rounded text-sm ${leverage === l ? 'bg-yellow-500 text-black' : 'bg-[#1a1a1a] text-white'}`}
                >
                  {l}x
                </button>
              ))}
            </div>
            
            <p className="text-xs text-gray-500 text-center mb-4">
              Maximum leverage: {selectedPair?.maxLeverage || 125}x
            </p>
            
            <button
              onClick={() => setShowLeverageModal(false)}
              className="w-full py-3 bg-yellow-500 text-black rounded-lg font-medium"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* Pair Selector Modal */}
      {showPairSelector && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end lg:items-center justify-center">
          <div className="bg-[#121212] w-full lg:w-96 max-h-[70vh] rounded-t-2xl lg:rounded-2xl">
            <div className="flex justify-between items-center p-4 border-b border-[#1a1a1a]">
              <h3 className="text-lg font-medium">Select Contract</h3>
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
                    router.push(`/Futures?symbol=${pair.symbol}`);
                    setShowPairSelector(false);
                  }}
                  className="w-full flex justify-between items-center p-4 hover:bg-[#1a1a1a] transition-colors"
                >
                  <div>
                    <div className="font-medium">{pair.symbol} Perpetual</div>
                    <div className="text-xs text-gray-500">Max {pair.maxLeverage}x</div>
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

export default function FuturesTrading() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <FuturesTradingContent />
    </Suspense>
  );
}