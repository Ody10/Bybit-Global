// Price Service
// Handles token price fetching with stablecoin fluctuation

// Cache for prices
interface PriceCache {
  [key: string]: {
    price: number;
    timestamp: number;
  };
}

const priceCache: PriceCache = {};
const CACHE_DURATION = 60000; // 1 minute cache for regular tokens

// Stablecoin configuration
const STABLECOINS = ['USCT', 'USDT', 'USDC', 'DAI', 'BUSD'];

// Track stablecoin price state for realistic fluctuation
let stablecoinPriceState = {
  currentPrice: 1.0,
  direction: -1, // -1 = going down, 1 = going up
  lastUpdate: Date.now(),
  updateInterval: 5000, // Change direction every 5 seconds
};

/**
 * Get fluctuating stablecoin price between $0.99 and $1.00
 * Simulates realistic stablecoin price movement
 */
function getStablecoinPrice(): number {
  const now = Date.now();
  
  // Update price direction periodically
  if (now - stablecoinPriceState.lastUpdate > stablecoinPriceState.updateInterval) {
    // Random chance to change direction
    if (Math.random() > 0.5) {
      stablecoinPriceState.direction *= -1;
    }
    
    // Calculate new price
    const change = (Math.random() * 0.002) * stablecoinPriceState.direction; // 0-0.2% change
    let newPrice = stablecoinPriceState.currentPrice + change;
    
    // Keep within bounds $0.99 - $1.00
    if (newPrice > 1.0) {
      newPrice = 1.0;
      stablecoinPriceState.direction = -1;
    } else if (newPrice < 0.99) {
      newPrice = 0.99;
      stablecoinPriceState.direction = 1;
    }
    
    stablecoinPriceState.currentPrice = newPrice;
    stablecoinPriceState.lastUpdate = now;
  }
  
  // Add small random noise for more realistic feel
  const noise = (Math.random() - 0.5) * 0.001; // ±0.05% noise
  let price = stablecoinPriceState.currentPrice + noise;
  
  // Ensure within bounds
  price = Math.max(0.99, Math.min(1.0, price));
  
  // Round to 4 decimal places
  return Math.round(price * 10000) / 10000;
}

/**
 * Check if token is a stablecoin
 */
export function isStablecoin(token: string): boolean {
  return STABLECOINS.includes(token.toUpperCase());
}

/**
 * Get current price for a token
 * @param token - Token symbol (BTC, ETH, USCT, etc.)
 * @returns Price in USD
 */
export async function getTokenPrice(token: string): Promise<number> {
  const upperToken = token.toUpperCase();
  
  // Stablecoins: Return fluctuating price $0.99-$1.00
  if (isStablecoin(upperToken)) {
    return getStablecoinPrice();
  }
  
  // Check cache for non-stablecoins
  const cached = priceCache[upperToken];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.price;
  }
  
  // Fetch from CoinGecko for other tokens
  try {
    const price = await fetchCoinGeckoPrice(upperToken);
    priceCache[upperToken] = {
      price,
      timestamp: Date.now(),
    };
    return price;
  } catch (error) {
    console.error(`Error fetching price for ${token}:`, error);
    // Return cached price if available, otherwise 0
    return cached?.price || 0;
  }
}

/**
 * Get prices for multiple tokens
 * @param tokens - Array of token symbols
 * @returns Map of token to price
 */
export async function getMultipleTokenPrices(tokens: string[]): Promise<Map<string, number>> {
  const prices = new Map<string, number>();
  
  // Separate stablecoins from other tokens
  const stablecoins = tokens.filter(t => isStablecoin(t));
  const otherTokens = tokens.filter(t => !isStablecoin(t));
  
  // Get stablecoin price (same for all)
  const stablecoinPrice = getStablecoinPrice();
  stablecoins.forEach(token => {
    prices.set(token.toUpperCase(), stablecoinPrice);
  });
  
  // Fetch other token prices
  if (otherTokens.length > 0) {
    try {
      const fetchedPrices = await fetchMultipleCoinGeckoPrices(otherTokens);
      fetchedPrices.forEach((price, token) => {
        prices.set(token, price);
        priceCache[token] = {
          price,
          timestamp: Date.now(),
        };
      });
    } catch (error) {
      console.error('Error fetching multiple prices:', error);
      // Use cached prices or 0
      otherTokens.forEach(token => {
        const upperToken = token.toUpperCase();
        prices.set(upperToken, priceCache[upperToken]?.price || 0);
      });
    }
  }
  
  return prices;
}

/**
 * Calculate USD value of token amount
 */
export async function calculateUsdValue(token: string, amount: number): Promise<number> {
  const price = await getTokenPrice(token);
  return amount * price;
}

/**
 * Fetch price from CoinGecko API
 */
async function fetchCoinGeckoPrice(token: string): Promise<number> {
  const coinGeckoIds: { [key: string]: string } = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'BNB': 'binancecoin',
    'SOL': 'solana',
    'TRX': 'tron',
    'XRP': 'ripple',
    'ADA': 'cardano',
    'DOGE': 'dogecoin',
    'DOT': 'polkadot',
    'MATIC': 'matic-network',
    'AVAX': 'avalanche-2',
    'LINK': 'chainlink',
    'UNI': 'uniswap',
    'LTC': 'litecoin',
    'ATOM': 'cosmos',
  };
  
  const coinId = coinGeckoIds[token.toUpperCase()];
  if (!coinId) {
    console.warn(`No CoinGecko ID for token: ${token}`);
    return 0;
  }
  
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
    {
      headers: {
        'Accept': 'application/json',
      },
    }
  );
  
  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data[coinId]?.usd || 0;
}

/**
 * Fetch multiple prices from CoinGecko
 */
async function fetchMultipleCoinGeckoPrices(tokens: string[]): Promise<Map<string, number>> {
  const coinGeckoIds: { [key: string]: string } = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'BNB': 'binancecoin',
    'SOL': 'solana',
    'TRX': 'tron',
    'XRP': 'ripple',
    'ADA': 'cardano',
    'DOGE': 'dogecoin',
    'DOT': 'polkadot',
    'MATIC': 'matic-network',
    'AVAX': 'avalanche-2',
    'LINK': 'chainlink',
    'UNI': 'uniswap',
    'LTC': 'litecoin',
    'ATOM': 'cosmos',
  };
  
  const prices = new Map<string, number>();
  
  // Map tokens to CoinGecko IDs
  const idsToFetch: string[] = [];
  const tokenToId: { [key: string]: string } = {};
  
  tokens.forEach(token => {
    const upperToken = token.toUpperCase();
    const coinId = coinGeckoIds[upperToken];
    if (coinId) {
      idsToFetch.push(coinId);
      tokenToId[coinId] = upperToken;
    }
  });
  
  if (idsToFetch.length === 0) {
    return prices;
  }
  
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${idsToFetch.join(',')}&vs_currencies=usd`,
    {
      headers: {
        'Accept': 'application/json',
      },
    }
  );
  
  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  Object.entries(data).forEach(([coinId, priceData]: [string, any]) => {
    const token = tokenToId[coinId];
    if (token && priceData?.usd) {
      prices.set(token, priceData.usd);
    }
  });
  
  return prices;
}

/**
 * Get price history simulation for stablecoins
 * Returns array of prices over time for charts
 */
export function getStablecoinPriceHistory(points: number = 24): { time: string; price: number }[] {
  const history: { time: string; price: number }[] = [];
  const now = Date.now();
  
  let price = 0.995; // Start in middle
  let direction = 1;
  
  for (let i = points; i >= 0; i--) {
    const timestamp = new Date(now - i * 3600000); // hourly points
    
    // Simulate price movement
    const change = (Math.random() * 0.003) * direction;
    price += change;
    
    // Keep in range and change direction at bounds
    if (price >= 1.0) {
      price = 1.0;
      direction = -1;
    } else if (price <= 0.99) {
      price = 0.99;
      direction = 1;
    }
    
    // Random direction change
    if (Math.random() > 0.7) {
      direction *= -1;
    }
    
    history.push({
      time: timestamp.toISOString(),
      price: Math.round(price * 10000) / 10000,
    });
  }
  
  return history;
}

/**
 * Format price for display
 */
export function formatPrice(price: number, decimals: number = 2): string {
  if (price >= 1000) {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
  
  // For small prices, show more decimals
  if (price < 0.01) {
    return price.toFixed(6);
  }
  
  return price.toFixed(decimals);
}

/**
 * Format USD value for display
 */
export function formatUsdValue(value: number): string {
  return '$' + formatPrice(value, 2);
}

// Export current stablecoin price for real-time display
export function getCurrentStablecoinPrice(): number {
  return getStablecoinPrice();
}

// Reset stablecoin price state (for testing)
export function resetStablecoinPrice(): void {
  stablecoinPriceState = {
    currentPrice: 1.0,
    direction: -1,
    lastUpdate: Date.now(),
    updateInterval: 5000,
  };
}