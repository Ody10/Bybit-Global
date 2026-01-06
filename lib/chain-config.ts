//lib/chain-config.ts
// Chain Configuration
// All supported chains, tokens, and contract addresses

export interface TokenConfig {
  symbol: string;
  name: string;
  decimals: number;
  contractAddress?: string; // For ERC20/TRC20/etc tokens
  isNative?: boolean;
  icon?: string;
  minDeposit: number;
  minWithdrawal: number;
  withdrawalFee: number;
}

export interface ChainConfig {
  chainId: string;
  name: string;
  displayName: string;
  network: 'mainnet' | 'testnet';
  nativeCurrency: string;
  rpcUrl: string;
  explorerUrl: string;
  explorerName: string;
  explorerApiUrl?: string;
  explorerApiKey?: string;
  confirmations: number;
  blockTime: number; // in seconds
  tokens: TokenConfig[];
}

// Your custom token contract addresses
export const CUSTOM_CONTRACTS = {
  USCT: {
    ERC20: '0xd32F83a9f25388572DAF835B55cAE37aF2E0140f',
    TRC20: 'TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx', // Add your TRC20 contract
    BEP20: '0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // Add your BEP20 contract
  },
  USDT: {
    ERC20: '0xBFc76b063E03D6E93d2737563bb0a7422c80BC2A', // Your custom USDT ERC20
    TRC20: 'TYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY', // Your custom USDT TRC20
    BEP20: '0xYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY', // Your custom USDT BEP20
  },
};

// Official USDT contract addresses (for reference)
export const OFFICIAL_USDT_CONTRACTS = {
  ERC20: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  TRC20: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
  BEP20: '0x55d398326f99059fF775485246999027B3197955',
};

// Chain configurations
export const CHAIN_CONFIGS: ChainConfig[] = [
  // Ethereum (ERC20)
  {
    chainId: 'ETH',
    name: 'ethereum',
    displayName: 'Ethereum (ERC20)',
    network: 'mainnet',
    nativeCurrency: 'ETH',
    rpcUrl: process.env.ETH_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/your-api-key',
    explorerUrl: 'https://etherscan.io',
    explorerName: 'Etherscan',
    explorerApiUrl: 'https://api.etherscan.io/api',
    explorerApiKey: process.env.ETHERSCAN_API_KEY,
    confirmations: 12,
    blockTime: 12,
    tokens: [
      {
        symbol: 'ETH',
        name: 'Ethereum',
        decimals: 18,
        isNative: true,
        minDeposit: 0.001,
        minWithdrawal: 0.01,
        withdrawalFee: 0.005,
      },
      {
        symbol: 'USCT',
        name: 'USCT Token',
        decimals: 18,
        contractAddress: CUSTOM_CONTRACTS.USCT.ERC20,
        minDeposit: 1,
        minWithdrawal: 10,
        withdrawalFee: 5,
      },
      {
        symbol: 'USDT',
        name: 'Tether USD',
        decimals: 6,
        contractAddress: CUSTOM_CONTRACTS.USDT.ERC20,
        minDeposit: 1,
        minWithdrawal: 10,
        withdrawalFee: 5,
      },
    ],
  },
  
  // TRON (TRC20)
  {
    chainId: 'TRX',
    name: 'tron',
    displayName: 'TRON (TRC20)',
    network: 'mainnet',
    nativeCurrency: 'TRX',
    rpcUrl: process.env.TRON_RPC_URL || 'https://api.trongrid.io',
    explorerUrl: 'https://tronscan.org',
    explorerName: 'Tronscan',
    explorerApiUrl: 'https://apilist.tronscanapi.com/api',
    confirmations: 20,
    blockTime: 3,
    tokens: [
      {
        symbol: 'TRX',
        name: 'TRON',
        decimals: 6,
        isNative: true,
        minDeposit: 1,
        minWithdrawal: 10,
        withdrawalFee: 1,
      },
      {
        symbol: 'USCT',
        name: 'USCT Token',
        decimals: 6,
        contractAddress: CUSTOM_CONTRACTS.USCT.TRC20,
        minDeposit: 1,
        minWithdrawal: 10,
        withdrawalFee: 1,
      },
      {
        symbol: 'USDT',
        name: 'Tether USD',
        decimals: 6,
        contractAddress: CUSTOM_CONTRACTS.USDT.TRC20,
        minDeposit: 1,
        minWithdrawal: 10,
        withdrawalFee: 1,
      },
    ],
  },
  
  // BSC (BEP20)
  {
    chainId: 'BSC',
    name: 'bsc',
    displayName: 'BNB Smart Chain (BEP20)',
    network: 'mainnet',
    nativeCurrency: 'BNB',
    rpcUrl: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    explorerName: 'BscScan',
    explorerApiUrl: 'https://api.bscscan.com/api',
    explorerApiKey: process.env.BSCSCAN_API_KEY,
    confirmations: 15,
    blockTime: 3,
    tokens: [
      {
        symbol: 'BNB',
        name: 'BNB',
        decimals: 18,
        isNative: true,
        minDeposit: 0.01,
        minWithdrawal: 0.1,
        withdrawalFee: 0.0005,
      },
      {
        symbol: 'USCT',
        name: 'USCT Token',
        decimals: 18,
        contractAddress: CUSTOM_CONTRACTS.USCT.BEP20,
        minDeposit: 1,
        minWithdrawal: 10,
        withdrawalFee: 0.5,
      },
      {
        symbol: 'USDT',
        name: 'Tether USD',
        decimals: 18,
        contractAddress: CUSTOM_CONTRACTS.USDT.BEP20,
        minDeposit: 1,
        minWithdrawal: 10,
        withdrawalFee: 0.5,
      },
    ],
  },
  
  // Solana (SPL)
  {
    chainId: 'SOL',
    name: 'solana',
    displayName: 'Solana (SPL)',
    network: 'mainnet',
    nativeCurrency: 'SOL',
    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    explorerUrl: 'https://solscan.io',
    explorerName: 'Solscan',
    confirmations: 1,
    blockTime: 0.4,
    tokens: [
      {
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
        isNative: true,
        minDeposit: 0.01,
        minWithdrawal: 0.1,
        withdrawalFee: 0.01,
      },
    ],
  },
  
  // Bitcoin
  {
    chainId: 'BTC',
    name: 'bitcoin',
    displayName: 'Bitcoin',
    network: 'mainnet',
    nativeCurrency: 'BTC',
    rpcUrl: process.env.BTC_RPC_URL || '',
    explorerUrl: 'https://blockstream.info',
    explorerName: 'Blockstream',
    explorerApiUrl: 'https://blockstream.info/api',
    confirmations: 3,
    blockTime: 600,
    tokens: [
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        decimals: 8,
        isNative: true,
        minDeposit: 0.0001,
        minWithdrawal: 0.001,
        withdrawalFee: 0.0005,
      },
    ],
  },
];

// Helper functions
export function getChainConfig(chainId: string): ChainConfig | undefined {
  return CHAIN_CONFIGS.find(c => c.chainId === chainId);
}

export function getTokenConfig(chainId: string, symbol: string): TokenConfig | undefined {
  const chain = getChainConfig(chainId);
  return chain?.tokens.find(t => t.symbol === symbol);
}

export function getExplorerTxUrl(chainId: string, txHash: string): string {
  const chain = getChainConfig(chainId);
  if (!chain) return '';
  
  switch (chainId) {
    case 'ETH':
      return `${chain.explorerUrl}/tx/${txHash}`;
    case 'TRX':
      return `${chain.explorerUrl}/#/transaction/${txHash}`;
    case 'BSC':
      return `${chain.explorerUrl}/tx/${txHash}`;
    case 'SOL':
      return `${chain.explorerUrl}/tx/${txHash}`;
    case 'BTC':
      return `${chain.explorerUrl}/tx/${txHash}`;
    default:
      return `${chain.explorerUrl}/tx/${txHash}`;
  }
}

export function getExplorerAddressUrl(chainId: string, address: string): string {
  const chain = getChainConfig(chainId);
  if (!chain) return '';
  
  switch (chainId) {
    case 'ETH':
      return `${chain.explorerUrl}/address/${address}`;
    case 'TRX':
      return `${chain.explorerUrl}/#/address/${address}`;
    case 'BSC':
      return `${chain.explorerUrl}/address/${address}`;
    case 'SOL':
      return `${chain.explorerUrl}/account/${address}`;
    case 'BTC':
      return `${chain.explorerUrl}/address/${address}`;
    default:
      return `${chain.explorerUrl}/address/${address}`;
  }
}

export function getAllSupportedTokens(): { chain: string; token: TokenConfig }[] {
  const tokens: { chain: string; token: TokenConfig }[] = [];
  
  CHAIN_CONFIGS.forEach(chain => {
    chain.tokens.forEach(token => {
      tokens.push({ chain: chain.chainId, token });
    });
  });
  
  return tokens;
}

export function getTokenByContract(contractAddress: string): { chain: string; token: TokenConfig } | undefined {
  for (const chain of CHAIN_CONFIGS) {
    for (const token of chain.tokens) {
      if (token.contractAddress?.toLowerCase() === contractAddress.toLowerCase()) {
        return { chain: chain.chainId, token };
      }
    }
  }
  return undefined;
}

// ERC20 Transfer event signature
export const ERC20_TRANSFER_EVENT_SIGNATURE = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

// Standard ERC20 ABI for Transfer event
export const ERC20_TRANSFER_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'value', type: 'uint256' },
    ],
    name: 'Transfer',
    type: 'event',
  },
];

// Minimal ERC20 ABI for balance checks
export const ERC20_BALANCE_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
];