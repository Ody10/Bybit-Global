// Order Book Service
// Generates realistic order book data for trading pairs

import { prisma } from './prisma';
import { getPairPrice } from './trading-service';

interface OrderBookLevel {
  price: number;
  quantity: number;
  total: number;
}

interface OrderBook {
  symbol: string;
  bids: OrderBookLevel[]; // Buy orders (descending price)
  asks: OrderBookLevel[]; // Sell orders (ascending price)
  lastPrice: number;
  spread: number;
  spreadPercent: number;
  timestamp: number;
}

// Generate simulated order book
export async function getOrderBook(
  symbol: string,
  depth: number = 20
): Promise<OrderBook> {
  const lastPrice = await getPairPrice(symbol);
  
  // Generate bids (buy orders) - prices below current price
  const bids: OrderBookLevel[] = [];
  let bidTotal = 0;
  
  for (let i = 0; i < depth; i++) {
    // Prices decrease as we go down the book
    const priceOffset = (i + 1) * 0.0001 * lastPrice * (1 + Math.random() * 0.5);
    const price = parseFloat((lastPrice - priceOffset).toFixed(2));
    
    // Quantity increases slightly at lower prices (more demand)
    const baseQty = 0.1 + Math.random() * 2;
    const quantity = parseFloat((baseQty * (1 + i * 0.05)).toFixed(4));
    bidTotal += quantity;
    
    bids.push({
      price,
      quantity,
      total: parseFloat(bidTotal.toFixed(4)),
    });
  }
  
  // Generate asks (sell orders) - prices above current price
  const asks: OrderBookLevel[] = [];
  let askTotal = 0;
  
  for (let i = 0; i < depth; i++) {
    // Prices increase as we go up the book
    const priceOffset = (i + 1) * 0.0001 * lastPrice * (1 + Math.random() * 0.5);
    const price = parseFloat((lastPrice + priceOffset).toFixed(2));
    
    // Quantity increases at higher prices (more supply)
    const baseQty = 0.1 + Math.random() * 2;
    const quantity = parseFloat((baseQty * (1 + i * 0.05)).toFixed(4));
    askTotal += quantity;
    
    asks.push({
      price,
      quantity,
      total: parseFloat(askTotal.toFixed(4)),
    });
  }
  
  // Calculate spread
  const bestBid = bids[0]?.price || lastPrice;
  const bestAsk = asks[0]?.price || lastPrice;
  const spread = bestAsk - bestBid;
  const spreadPercent = (spread / lastPrice) * 100;
  
  return {
    symbol,
    bids,
    asks,
    lastPrice,
    spread: parseFloat(spread.toFixed(2)),
    spreadPercent: parseFloat(spreadPercent.toFixed(4)),
    timestamp: Date.now(),
  };
}

// Get recent trades (simulated)
export async function getRecentTrades(
  symbol: string,
  limit: number = 50
): Promise<any[]> {
  // First try to get real trades from database
  const realTrades = await prisma.trade.findMany({
    where: { symbol },
    orderBy: { executedAt: 'desc' },
    take: limit,
  });
  
  if (realTrades.length >= limit) {
    return realTrades.map(trade => ({
      id: trade.id,
      price: trade.price,
      quantity: trade.quantity,
      quoteQty: trade.quoteQty,
      time: trade.executedAt.getTime(),
      isBuyerMaker: trade.isBuyer,
    }));
  }
  
  // Generate simulated trades to fill the gap
  const lastPrice = await getPairPrice(symbol);
  const simulatedTrades: any[] = [];
  const now = Date.now();
  
  for (let i = realTrades.length; i < limit; i++) {
    const priceVariation = (Math.random() - 0.5) * 0.002 * lastPrice;
    const price = parseFloat((lastPrice + priceVariation).toFixed(2));
    const quantity = parseFloat((0.001 + Math.random() * 0.5).toFixed(4));
    
    simulatedTrades.push({
      id: `sim_${i}`,
      price,
      quantity,
      quoteQty: parseFloat((price * quantity).toFixed(2)),
      time: now - i * 1000 * (1 + Math.random() * 5), // Random time gaps
      isBuyerMaker: Math.random() > 0.5,
    });
  }
  
  // Combine and sort
  const allTrades = [
    ...realTrades.map(trade => ({
      id: trade.id,
      price: trade.price,
      quantity: trade.quantity,
      quoteQty: trade.quoteQty,
      time: trade.executedAt.getTime(),
      isBuyerMaker: trade.isBuyer,
    })),
    ...simulatedTrades,
  ];
  
  return allTrades.sort((a, b) => b.time - a.time).slice(0, limit);
}

// Get 24h ticker data
export async function get24hTicker(symbol: string) {
  const pair = await prisma.tradingPair.findUnique({
    where: { symbol },
  });
  
  if (!pair) {
    const lastPrice = await getPairPrice(symbol);
    // Return simulated data
    const change = (Math.random() - 0.5) * 0.1; // -5% to +5%
    
    return {
      symbol,
      lastPrice,
      priceChange: parseFloat((lastPrice * change).toFixed(2)),
      priceChangePercent: parseFloat((change * 100).toFixed(2)),
      highPrice: parseFloat((lastPrice * (1 + Math.abs(change))).toFixed(2)),
      lowPrice: parseFloat((lastPrice * (1 - Math.abs(change))).toFixed(2)),
      volume: parseFloat((Math.random() * 10000).toFixed(2)),
      quoteVolume: parseFloat((Math.random() * 10000000).toFixed(2)),
      openPrice: parseFloat((lastPrice * (1 - change)).toFixed(2)),
    };
  }
  
  return {
    symbol: pair.symbol,
    lastPrice: pair.lastPrice,
    priceChange: parseFloat((pair.lastPrice - pair.price24hOpen).toFixed(2)),
    priceChangePercent: pair.price24hChange,
    highPrice: pair.price24hHigh,
    lowPrice: pair.price24hLow,
    volume: pair.volume24h,
    quoteVolume: pair.volumeQuote24h,
    openPrice: pair.price24hOpen,
  };
}

// Get all tickers
export async function getAllTickers() {
  const pairs = await prisma.tradingPair.findMany({
    where: { isActive: true },
  });
  
  return pairs.map(pair => ({
    symbol: pair.symbol,
    lastPrice: pair.lastPrice,
    priceChange: parseFloat((pair.lastPrice - pair.price24hOpen).toFixed(2)),
    priceChangePercent: pair.price24hChange,
    highPrice: pair.price24hHigh,
    lowPrice: pair.price24hLow,
    volume: pair.volume24h,
    quoteVolume: pair.volumeQuote24h,
  }));
}