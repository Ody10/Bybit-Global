// lib/trading-service.ts
import prisma from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

// Types
export type OrderType = 'MARKET' | 'LIMIT' | 'STOP_LIMIT' | 'STOP_MARKET';
export type OrderSide = 'BUY' | 'SELL';
export type OrderStatus = 'PENDING' | 'FILLED' | 'PARTIALLY_FILLED' | 'CANCELLED' | 'REJECTED';
export type TimeInForce = 'GTC' | 'IOC' | 'FOK';

// Helper function to get user balance
async function getUserBalance(userId: string, currency: string, chain: string = 'ETH') {
  const balance = await prisma.userBalance.findUnique({
    where: {
      userId_currency_chain: {
        userId,
        currency,
        chain,
      },
    },
  });
  return balance;
}

// Helper function to update user balance
async function updateUserBalance(userId: string, currency: string, amount: number, chain: string = 'ETH') {
  return await prisma.userBalance.upsert({
    where: {
      userId_currency_chain: {
        userId,
        currency,
        chain,
      },
    },
    create: {
      userId,
      currency,
      chain,
      totalBalance: amount,
      available: amount,
      locked: 0,
      frozen: 0,
    },
    update: {
      totalBalance: amount,
      available: amount,
    },
  });
}

// Get trading pair by symbol
export async function getTradingPair(symbol: string) {
  return await prisma.tradingPair.findUnique({
    where: { symbol: symbol.toUpperCase() },
  });
}

// Get current price for a trading pair
export async function getPairPrice(symbol: string): Promise<number> {
  const pair = await getTradingPair(symbol);
  if (!pair) {
    throw new Error('Trading pair not found');
  }
  return pair.lastPrice;
}

// Create spot order
export async function createSpotOrder(params: {
  userId: string;
  symbol: string;
  type: 'MARKET' | 'LIMIT';
  side: OrderSide;
  quantity: number;
  price?: number;
  timeInForce?: TimeInForce;
}) {
  const { userId, symbol, type, side, quantity, price, timeInForce = 'GTC' } = params;

  // Get trading pair
  const pair = await getTradingPair(symbol);
  if (!pair || pair.type !== 'SPOT') {
    return { success: false, error: 'Invalid spot trading pair' };
  }

  // Extract quote currency (e.g., "USDT" from "BTCUSDT")
  const quoteCurrency = pair.quoteAsset;

  // Get user balance
  const userBalance = await getUserBalance(userId, quoteCurrency);
  if (!userBalance) {
    return { success: false, error: 'Insufficient balance' };
  }

  // Calculate order value
  const orderPrice = type === 'MARKET' ? pair.lastPrice : (price || pair.lastPrice);
  const orderValue = quantity * orderPrice;

  // Check if user has enough balance
  if (side === 'BUY' && userBalance.available < orderValue) {
    return { success: false, error: 'Insufficient balance' };
  }

  // Calculate fee (0.1% maker/taker fee)
  const feeRate = 0.1;
  const fee = orderValue * (feeRate / 100);

  // For market orders, execute immediately
  const status: OrderStatus = type === 'MARKET' ? 'FILLED' : 'PENDING';

  // Generate unique order ID
  const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Create order
  const order = await prisma.order.create({
    data: {
      orderId,
      userId,
      symbol,
      tradingPairId: pair.id,
      type,
      side,
      positionSide: 'BOTH',
      quantity,
      filledQty: status === 'FILLED' ? quantity : 0,
      remainingQty: status === 'FILLED' ? 0 : quantity,
      price: orderPrice,
      stopPrice: null,
      timeInForce,
      status,
      fee,
      feeCurrency: quoteCurrency,
      leverage: 1,
      reduceOnly: false,
    },
  });

  // Update user balance for market orders
  if (type === 'MARKET') {
    if (side === 'BUY') {
      const newBalance = userBalance.available - orderValue - fee;
      await updateUserBalance(userId, quoteCurrency, newBalance);
    } else {
      const newBalance = userBalance.available + orderValue - fee;
      await updateUserBalance(userId, quoteCurrency, newBalance);
    }
  }

  return {
    success: true,
    order,
  };
}

// Create futures order
export async function createFuturesOrder(params: {
  userId: string;
  symbol: string;
  type: 'MARKET' | 'LIMIT';
  side: OrderSide;
  positionSide: string;
  quantity: number;
  price?: number;
  leverage?: number;
  reduceOnly?: boolean;
  timeInForce?: TimeInForce;
}) {
  const {
    userId,
    symbol,
    type,
    side,
    positionSide,
    quantity,
    price,
    leverage = 1,
    reduceOnly = false,
    timeInForce = 'GTC',
  } = params;

  // Get trading pair
  const pair = await getTradingPair(symbol);
  if (!pair || pair.type !== 'PERPETUAL') {
    return { success: false, error: 'Invalid futures trading pair' };
  }

  // Extract quote currency
  const quoteCurrency = pair.quoteAsset;

  // Get user balance
  const userBalance = await getUserBalance(userId, quoteCurrency);
  if (!userBalance) {
    return { success: false, error: 'Insufficient balance' };
  }

  // Calculate order value and margin required
  const orderPrice = type === 'MARKET' ? pair.lastPrice : (price || pair.lastPrice);
  const orderValue = quantity * orderPrice;
  const marginRequired = orderValue / leverage;

  // Check if user has enough balance
  if (userBalance.available < marginRequired) {
    return { success: false, error: 'Insufficient margin' };
  }

  // Calculate fee (0.1% maker/taker fee)
  const feeRate = 0.1;
  const fee = orderValue * (feeRate / 100);

  // For market orders, execute immediately
  const status: OrderStatus = type === 'MARKET' ? 'FILLED' : 'PENDING';

  // Generate unique order ID
  const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Create order
  const order = await prisma.order.create({
    data: {
      orderId,
      userId,
      symbol,
      tradingPairId: pair.id,
      type,
      side,
      positionSide,
      quantity,
      filledQty: status === 'FILLED' ? quantity : 0,
      remainingQty: status === 'FILLED' ? 0 : quantity,
      price: orderPrice,
      stopPrice: null,
      timeInForce,
      status,
      fee,
      feeCurrency: quoteCurrency,
      leverage,
      reduceOnly,
    },
  });

  // For market orders, update position
  let position = null;
  if (type === 'MARKET' && !reduceOnly) {
    // Check if position exists
    const existingPosition = await prisma.position.findFirst({
      where: {
        userId,
        symbol,
        side: positionSide,
      },
    });

    if (existingPosition) {
      // Update existing position
      const newSize = existingPosition.size + quantity;
      const newEntryPrice =
        (existingPosition.entryPrice * existingPosition.size + orderPrice * quantity) / newSize;

      position = await prisma.position.update({
        where: { id: existingPosition.id },
        data: {
          size: newSize,
          entryPrice: newEntryPrice,
          markPrice: pair.markPrice,
          liquidationPrice: newEntryPrice * (1 - 1 / leverage),
        },
      });
    } else {
      // Create new position
      const positionId = `POS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      position = await prisma.position.create({
        data: {
          positionId,
          userId,
          symbol,
          tradingPairId: pair.id,
          side: positionSide,
          size: quantity,
          entryPrice: orderPrice,
          markPrice: pair.markPrice,
          liquidationPrice: orderPrice * (1 - 1 / leverage),
          leverage,
          marginType: 'ISOLATED',
          margin: marginRequired,
          isolatedMargin: marginRequired,
          unrealizedPnl: 0,
          realizedPnl: 0,
        },
      });
    }

    // Update user balance
    const newBalance = userBalance.available - marginRequired - fee;
    await updateUserBalance(userId, quoteCurrency, newBalance);
  }

  return {
    success: true,
    order,
    position,
  };
}

// Cancel order
export async function cancelOrder(orderId: string, userId: string) {
  const order = await prisma.order.findFirst({
    where: { orderId, userId },
  });

  if (!order) {
    return { success: false, error: 'Order not found' };
  }

  if (order.status === 'FILLED' || order.status === 'CANCELLED') {
    return { success: false, error: 'Order cannot be cancelled' };
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { status: 'CANCELLED' },
  });

  return { success: true };
}

// Get user orders
export async function getUserOrders(
  userId: string,
  filters?: {
    symbol?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }
) {
  const { symbol, status, limit = 50, offset = 0 } = filters || {};

  return await prisma.order.findMany({
    where: {
      userId,
      ...(symbol && { symbol }),
      ...(status && { status }),
    },
    orderBy: { updatedAt: 'desc' },
    take: limit,
    skip: offset,
    include: {
      tradingPair: true,
    },
  });
}

// Get user positions
export async function getUserPositions(userId: string) {
  return await prisma.position.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      tradingPair: true,
    },
  });
}

// Update position (stop loss, take profit)
export async function updatePosition(
  positionId: string,
  userId: string,
  updates: {
    stopLoss?: number;
    takeProfit?: number;
  }
) {
  // TODO: Position model doesn't have stopLoss/takeProfit fields
  // In real trading systems, these are typically handled via stop orders
  return {
    success: false,
    error: 'Stop loss and take profit updates not yet implemented. Please use stop orders instead.',
  };
}

// Close position
export async function closePosition(positionId: string, userId: string) {
  const position = await prisma.position.findFirst({
    where: { id: positionId, userId },
    include: { tradingPair: true },
  });

  if (!position) {
    return { success: false, error: 'Position not found' };
  }

  // Calculate PnL
  const currentPrice = position.tradingPair.lastPrice;
  const pnl = (currentPrice - position.entryPrice) * position.size;

  // Extract quote currency
  const quoteCurrency = position.tradingPair.quoteAsset;

  // Update user balance
  const userBalance = await getUserBalance(userId, quoteCurrency);
  if (userBalance) {
    const newBalance = userBalance.available + position.margin + pnl;
    await updateUserBalance(userId, quoteCurrency, newBalance);
  }

  // Delete position
  await prisma.position.delete({
    where: { id: positionId },
  });

  return {
    success: true,
    pnl,
    closedPrice: currentPrice,
  };
}