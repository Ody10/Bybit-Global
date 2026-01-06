// lib/api-config.ts
// API Configuration that reads from environment variables

/**
 * Get the API base URL based on environment
 * Priority:
 * 1. NEXT_PUBLIC_API_URL from .env
 * 2. Fallback to localhost for development
 */
export function getApiUrl(): string {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Check if running in Capacitor (mobile app)
    const isCapacitor = window.location.protocol === 'capacitor:';
    
    if (isCapacitor) {
      // Mobile app - use the backend URL from environment
      return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    }
  }
  
  // Server-side or web browser - use environment variable or default
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
}

/**
 * Get full API endpoint URL
 */
export function getApiEndpoint(path: string): string {
  const baseUrl = getApiUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Make an API call with proper configuration
 */
export async function apiCall(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : getApiEndpoint(endpoint);

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  };

  return fetch(url, { ...defaultOptions, ...options });
}

// API Endpoints - centralized endpoint definitions
export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
  },
  trading: {
    positions: '/api/trading/positions',
    orders: '/api/trading/orders',
    history: '/api/trading/history',
  },
  wallet: {
    balance: '/api/wallet/balance',
    transactions: '/api/wallet/transactions',
    deposit: '/api/wallet/deposit',
    withdraw: '/api/wallet/withdraw',
  },
  user: {
    profile: '/api/user/profile',
    settings: '/api/user/settings',
    kyc: '/api/user/kyc',
  },
} as const;

// Helper functions for common API calls
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiCall(API_ENDPOINTS.auth.login, {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  
  register: (data: { email: string; password: string; name: string }) =>
    apiCall(API_ENDPOINTS.auth.register, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  logout: () =>
    apiCall(API_ENDPOINTS.auth.logout, {
      method: 'POST',
    }),
  
  getCurrentUser: () =>
    apiCall(API_ENDPOINTS.auth.me),
};

export const tradingApi = {
  getPositions: () =>
    apiCall(API_ENDPOINTS.trading.positions),
  
  getOrders: () =>
    apiCall(API_ENDPOINTS.trading.orders),
  
  getHistory: () =>
    apiCall(API_ENDPOINTS.trading.history),
  
  createOrder: (orderData: any) =>
    apiCall(API_ENDPOINTS.trading.orders, {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),
};

export const walletApi = {
  getBalance: () =>
    apiCall(API_ENDPOINTS.wallet.balance),
  
  getTransactions: () =>
    apiCall(API_ENDPOINTS.wallet.transactions),
  
  deposit: (depositData: any) =>
    apiCall(API_ENDPOINTS.wallet.deposit, {
      method: 'POST',
      body: JSON.stringify(depositData),
    }),
  
  withdraw: (withdrawData: any) =>
    apiCall(API_ENDPOINTS.wallet.withdraw, {
      method: 'POST',
      body: JSON.stringify(withdrawData),
    }),
};

// Debug helper
export function logApiConfig() {
  console.log('API Configuration:', {
    baseUrl: getApiUrl(),
    isCapacitor: typeof window !== 'undefined' 
      ? window.location.protocol === 'capacitor:' 
      : false,
    environment: process.env.NODE_ENV,
  });
}