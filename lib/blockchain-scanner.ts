//lib/blockchain-scanner.ts
// Blockchain Scanner Service
// Scans blockchain for incoming deposits to user wallets
//
// CUSTOM TOKEN SUPPORT:
// - USCT (Platform Stablecoin): 0xd32F83a9f25388572DAF835B55cAE37aF2E0140f
// - Custom USDT: 0xBFc76b063E03D6E93d2737563bb0a7422c80BC2A
// - Both original Tether USDT and custom USDT credit to the same USDT balance

import { prisma } from './prisma';
import { createPendingDeposit, updateDepositConfirmations } from './deposit-monitor';
import { getChainConfig, getTokenConfig, CHAIN_CONFIGS } from './chain-config';

// RPC endpoints - configure in .env
const RPC_ENDPOINTS: Record<string, string> = {
  ETH: process.env.ETH_RPC_URL || 'https://eth.llamarpc.com',
  BSC: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org',
  TRX: process.env.TRX_RPC_URL || 'https://api.trongrid.io',
  ARB: process.env.ARB_RPC_URL || 'https://arb1.arbitrum.io/rpc',
  MATIC: process.env.MATIC_RPC_URL || 'https://polygon-rpc.com',
  AVAX: process.env.AVAX_RPC_URL || 'https://api.avax.network/ext/bc/C/rpc',
  OP: process.env.OP_RPC_URL || 'https://mainnet.optimism.io',
};

// ERC20 Transfer event signature
const TRANSFER_EVENT_SIGNATURE = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

// =================================================================
// TOKEN CONFIGURATION
// =================================================================
// Each token entry has:
// - address: Contract address (lowercase)
// - decimals: Token decimals
// - symbol: Symbol used for user balance (determines which balance to credit)
// - displayName: Human-readable name for logs/UI
// - isCustom: Flag for platform-specific tokens
//
// IMPORTANT: Multiple contracts can have the same symbol!
// This means deposits from different contracts will credit to the same balance.
// Example: Both Tether USDT and Custom USDT have symbol "USDT"
//          -> Both will credit to the user's USDT balance
// =================================================================

interface TokenConfig {
  address: string;
  decimals: number;
  symbol: string;       // This determines which balance to credit
  displayName: string;  // For logging and UI
  isCustom: boolean;    // true = platform token, false = official token
}

// Token contracts organized by chain
// Multiple tokens can share the same symbol (they'll credit to same balance)
const TOKEN_CONTRACTS: Record<string, TokenConfig[]> = {
  ETH: [
    // ===========================================
    // OFFICIAL TOKENS (Mainnet)
    // ===========================================
    {
      address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      decimals: 6,
      symbol: 'USDT',
      displayName: 'Tether USD (Official)',
      isCustom: false,
    },
    {
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      decimals: 6,
      symbol: 'USDC',
      displayName: 'USD Coin (Official)',
      isCustom: false,
    },
    
    // ===========================================
    // YOUR CUSTOM/PLATFORM TOKENS
    // ===========================================
    // Custom USDT - Credits to SAME balance as official Tether USDT
    {
      address: '0xbfc76b063e03d6e93d2737563bb0a7422c80bc2a',
      decimals: 6,
      symbol: 'USDT',  // Same symbol = same balance as official USDT
      displayName: 'USDT (Platform)',
      isCustom: true,
    },
    // Custom USCT - Your platform's own stablecoin
    {
      address: '0xd32f83a9f25388572daf835b55cae37af2e0140f',
      decimals: 6,
      symbol: 'USCT',
      displayName: 'USCT (Platform Stablecoin)',
      isCustom: true,
    },
  ],
  
  BSC: [
    // Official BSC tokens
    {
      address: '0x55d398326f99059ff775485246999027b3197955',
      decimals: 18,
      symbol: 'USDT',
      displayName: 'Tether USD (BSC)',
      isCustom: false,
    },
    {
      address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
      decimals: 18,
      symbol: 'USDC',
      displayName: 'USD Coin (BSC)',
      isCustom: false,
    },
    // Add custom BSC tokens here if needed
  ],
  
  ARB: [
    {
      address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
      decimals: 6,
      symbol: 'USDT',
      displayName: 'Tether USD (Arbitrum)',
      isCustom: false,
    },
    {
      address: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
      decimals: 6,
      symbol: 'USDC',
      displayName: 'USD Coin (Arbitrum)',
      isCustom: false,
    },
  ],
  
  MATIC: [
    {
      address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
      decimals: 6,
      symbol: 'USDT',
      displayName: 'Tether USD (Polygon)',
      isCustom: false,
    },
    {
      address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
      decimals: 6,
      symbol: 'USDC',
      displayName: 'USD Coin (Polygon)',
      isCustom: false,
    },
  ],
  
  AVAX: [
    {
      address: '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7',
      decimals: 6,
      symbol: 'USDT',
      displayName: 'Tether USD (Avalanche)',
      isCustom: false,
    },
    {
      address: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
      decimals: 6,
      symbol: 'USDC',
      displayName: 'USD Coin (Avalanche)',
      isCustom: false,
    },
  ],
  
  OP: [
    {
      address: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
      decimals: 6,
      symbol: 'USDT',
      displayName: 'Tether USD (Optimism)',
      isCustom: false,
    },
    {
      address: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
      decimals: 6,
      symbol: 'USDC',
      displayName: 'USD Coin (Optimism)',
      isCustom: false,
    },
  ],
};

/**
 * Find token config by contract address
 */
function findTokenByAddress(chain: string, contractAddress: string): TokenConfig | null {
  const tokens = TOKEN_CONTRACTS[chain] || [];
  const normalizedAddress = contractAddress.toLowerCase();
  
  for (const token of tokens) {
    if (token.address.toLowerCase() === normalizedAddress) {
      return token;
    }
  }
  
  return null;
}

/**
 * Get all supported tokens for a chain
 */
export function getSupportedTokens(chain: string): TokenConfig[] {
  return TOKEN_CONTRACTS[chain] || [];
}

/**
 * Check if a token contract is supported
 */
export function isTokenSupported(chain: string, contractAddress: string): boolean {
  return findTokenByAddress(chain, contractAddress) !== null;
}

/**
 * Get all unique token symbols for a chain
 */
export function getUniqueTokenSymbols(chain: string): string[] {
  const tokens = TOKEN_CONTRACTS[chain] || [];
  const symbols = new Set(tokens.map(t => t.symbol));
  return Array.from(symbols);
}

// Log configured tokens on startup
function logConfiguredTokens() {
  console.log('\n=== CONFIGURED TOKENS FOR DEPOSIT DETECTION ===');
  for (const [chain, tokens] of Object.entries(TOKEN_CONTRACTS)) {
    console.log(`\n${chain}:`);
    for (const token of tokens) {
      const customTag = token.isCustom ? ' [PLATFORM]' : ' [OFFICIAL]';
      console.log(`  ${token.symbol}${customTag}: ${token.displayName}`);
      console.log(`    Contract: ${token.address}`);
      console.log(`    Decimals: ${token.decimals}`);
    }
  }
  console.log('\n=== END TOKEN CONFIG ===\n');
}

// Log on module load
logConfiguredTokens();

interface ScanResult {
  chain: string;
  addressesScanned: number;
  depositsFound: number;
  depositsCreated: number;
  errors: string[];
  tokenBreakdown: Record<string, number>;
}

/**
 * Get all user wallet addresses for a chain
 */
async function getUserWalletAddresses(chain: string): Promise<string[]> {
  const wallets = await prisma.wallet.findMany({
    where: { chain },
    select: { address: true },
  });
  
  return wallets.map(w => w.address.toLowerCase());
}

/**
 * Get current block number
 */
async function getCurrentBlockNumber(chain: string): Promise<number> {
  const rpcUrl = RPC_ENDPOINTS[chain];
  if (!rpcUrl) throw new Error(`No RPC URL for chain ${chain}`);
  
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      params: [],
      id: 1,
    }),
  });
  
  const data = await response.json();
  return parseInt(data.result, 16);
}

/**
 * Get last scanned block from database
 */
async function getLastScannedBlock(chain: string): Promise<number> {
  const config = await prisma.systemConfig.findUnique({
    where: { key: `last_scanned_block_${chain}` },
  });
  
  return config ? parseInt(config.value) : 0;
}

/**
 * Save last scanned block
 */
async function saveLastScannedBlock(chain: string, blockNumber: number): Promise<void> {
  await prisma.systemConfig.upsert({
    where: { key: `last_scanned_block_${chain}` },
    update: { value: blockNumber.toString() },
    create: {
      key: `last_scanned_block_${chain}`,
      value: blockNumber.toString(),
      type: 'NUMBER',
    },
  });
}

/**
 * Scan for native token (ETH/BNB/MATIC) transfers using Etherscan API
 */
async function scanNativeTransfers(
  chain: string,
  addresses: string[],
  fromBlock: number,
  toBlock: number
): Promise<any[]> {
  const deposits: any[] = [];
  
  const etherscanApiKey = process.env.ETHERSCAN_API_KEY;
  if (!etherscanApiKey) {
    console.log(`⚠️  No Etherscan API key - skipping native ${chain} transfer scan`);
    console.log(`   Get a free key at: https://etherscan.io/apis`);
    return deposits;
  }
  
  const apiUrls: Record<string, string> = {
    ETH: 'https://api.etherscan.io/api',
    BSC: 'https://api.bscscan.com/api',
    ARB: 'https://api.arbiscan.io/api',
    MATIC: 'https://api.polygonscan.com/api',
    AVAX: 'https://api.snowtrace.io/api',
    OP: 'https://api-optimistic.etherscan.io/api',
  };
  
  const apiUrl = apiUrls[chain];
  if (!apiUrl) return deposits;
  
  for (const address of addresses) {
    try {
      const url = `${apiUrl}?module=account&action=txlist&address=${address}&startblock=${fromBlock}&endblock=${toBlock}&sort=asc&apikey=${etherscanApiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === '1' && data.result) {
        for (const tx of data.result) {
          // Only incoming transactions with value (not errors)
          if (
            tx.to?.toLowerCase() === address.toLowerCase() && 
            tx.value !== '0' && 
            tx.isError === '0'
          ) {
            const chainConfig = getChainConfig(chain);
            const nativeToken = chainConfig?.nativeCurrency || chain;
            
            deposits.push({
              txHash: tx.hash,
              fromAddress: tx.from,
              toAddress: tx.to,
              amount: (parseInt(tx.value) / 1e18).toString(),
              token: nativeToken,
              chain,
              blockNumber: parseInt(tx.blockNumber),
              blockHash: tx.blockHash,
              timestamp: new Date(parseInt(tx.timeStamp) * 1000),
              confirmations: toBlock - parseInt(tx.blockNumber),
              // Metadata
              tokenContract: null,
              tokenDisplayName: `${nativeToken} (Native)`,
              isCustomToken: false,
            });
          }
        }
      }
      
      // Rate limit to avoid API throttling
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Error scanning native transfers for ${address}:`, error);
    }
  }
  
  return deposits;
}

/**
 * Scan for ERC20 token transfers using eth_getLogs
 */
async function scanTokenTransfers(
  chain: string,
  addresses: string[],
  fromBlock: number,
  toBlock: number
): Promise<any[]> {
  const rpcUrl = RPC_ENDPOINTS[chain];
  const deposits: any[] = [];
  
  for (const address of addresses) {
    const paddedAddress = '0x000000000000000000000000' + address.slice(2).toLowerCase();
    
    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getLogs',
          params: [{
            fromBlock: '0x' + fromBlock.toString(16),
            toBlock: '0x' + toBlock.toString(16),
            topics: [
              TRANSFER_EVENT_SIGNATURE,
              null, // from (any sender)
              paddedAddress, // to (our wallet address)
            ],
          }],
          id: 1,
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        console.error(`RPC error for ${chain}:`, data.error);
        continue;
      }
      
      if (data.result && Array.isArray(data.result)) {
        for (const log of data.result) {
          const tokenAddress = log.address.toLowerCase();
          
          // Find token in our configured list
          const tokenConfig = findTokenByAddress(chain, tokenAddress);
          
          // Skip tokens not in our list
          if (!tokenConfig) {
            continue;
          }
          
          // Parse transfer event data
          const fromAddr = '0x' + log.topics[1].slice(26);
          const toAddr = '0x' + log.topics[2].slice(26);
          const rawAmount = BigInt(log.data);
          const amount = Number(rawAmount) / Math.pow(10, tokenConfig.decimals);
          
          // Skip zero-value transfers
          if (amount === 0) continue;
          
          deposits.push({
            txHash: log.transactionHash,
            fromAddress: fromAddr,
            toAddress: toAddr,
            amount: amount.toString(),
            token: tokenConfig.symbol,  // This determines which balance to credit!
            chain,
            blockNumber: parseInt(log.blockNumber, 16),
            blockHash: log.blockHash,
            confirmations: toBlock - parseInt(log.blockNumber, 16),
            // Metadata for tracking/logging
            tokenContract: tokenAddress,
            tokenDisplayName: tokenConfig.displayName,
            isCustomToken: tokenConfig.isCustom,
          });
          
          // Log the detection
          const platformTag = tokenConfig.isCustom ? ' [PLATFORM TOKEN]' : '';
          console.log(`   📥 Detected: ${amount} ${tokenConfig.symbol}${platformTag}`);
          console.log(`      From: ${tokenConfig.displayName}`);
          console.log(`      Contract: ${tokenAddress}`);
        }
      }
    } catch (error) {
      console.error(`Error scanning token transfers for ${address}:`, error);
    }
  }
  
  return deposits;
}

/**
 * Main scan function for a chain
 */
export async function scanChainForDeposits(chain: string): Promise<ScanResult> {
  const result: ScanResult = {
    chain,
    addressesScanned: 0,
    depositsFound: 0,
    depositsCreated: 0,
    errors: [],
    tokenBreakdown: {},
  };
  
  try {
    console.log(`\n🔍 Scanning ${chain} for deposits...`);
    
    // Get user wallet addresses
    const addresses = await getUserWalletAddresses(chain);
    result.addressesScanned = addresses.length;
    
    if (addresses.length === 0) {
      console.log(`   No wallet addresses found for ${chain}`);
      return result;
    }
    
    console.log(`   Found ${addresses.length} wallet addresses to monitor`);
    
    // Log which tokens we're scanning for
    const chainTokens = TOKEN_CONTRACTS[chain] || [];
    console.log(`   Scanning for ${chainTokens.length} token types:`);
    for (const token of chainTokens) {
      const tag = token.isCustom ? '[PLATFORM]' : '[OFFICIAL]';
      console.log(`     - ${token.symbol} ${tag}: ${token.displayName}`);
    }
    
    // Get block range
    const currentBlock = await getCurrentBlockNumber(chain);
    let lastScannedBlock = await getLastScannedBlock(chain);
    
    // If first run, start from recent blocks (last 1000)
    if (lastScannedBlock === 0) {
      lastScannedBlock = Math.max(0, currentBlock - 1000);
      console.log(`   First scan - starting from block ${lastScannedBlock}`);
    }
    
    // Don't scan more than 10000 blocks at once
    const fromBlock = lastScannedBlock + 1;
    const toBlock = Math.min(currentBlock, fromBlock + 10000);
    
    if (fromBlock > toBlock) {
      console.log(`   Already up to date (block ${currentBlock})`);
      return result;
    }
    
    console.log(`   Scanning blocks ${fromBlock} to ${toBlock} (${toBlock - fromBlock + 1} blocks)`);
    
    // Scan for native transfers (ETH, BNB, etc.)
    const nativeDeposits = await scanNativeTransfers(chain, addresses, fromBlock, toBlock);
    console.log(`   Found ${nativeDeposits.length} native ${chain} transfers`);
    
    // Scan for token transfers (USDT, USDC, USCT, etc.)
    const tokenDeposits = await scanTokenTransfers(chain, addresses, fromBlock, toBlock);
    console.log(`   Found ${tokenDeposits.length} token transfers`);
    
    // Combine all deposits
    const allDeposits = [...nativeDeposits, ...tokenDeposits];
    result.depositsFound = allDeposits.length;
    
    // Calculate token breakdown
    for (const dep of allDeposits) {
      const key = dep.isCustomToken ? `${dep.token} (Platform)` : dep.token;
      result.tokenBreakdown[key] = (result.tokenBreakdown[key] || 0) + 1;
    }
    
    // Log breakdown
    if (Object.keys(result.tokenBreakdown).length > 0) {
      console.log(`   Token breakdown:`);
      for (const [token, count] of Object.entries(result.tokenBreakdown)) {
        console.log(`     - ${token}: ${count} deposit(s)`);
      }
    }
    
    // Process each deposit
    for (const deposit of allDeposits) {
      try {
        const depositId = await createPendingDeposit(deposit);
        if (depositId) {
          result.depositsCreated++;
          const platformTag = deposit.isCustomToken ? ' [PLATFORM]' : '';
          console.log(`   ✅ Created deposit ${depositId}: ${deposit.amount} ${deposit.token}${platformTag}`);
        }
      } catch (error: any) {
        const errorMsg = `Failed to create deposit ${deposit.txHash}: ${error.message}`;
        result.errors.push(errorMsg);
        console.error(`   ❌ ${errorMsg}`);
      }
    }
    
    // Update last scanned block
    await saveLastScannedBlock(chain, toBlock);
    console.log(`   Updated last scanned block to ${toBlock}`);
    
  } catch (error: any) {
    console.error(`Error scanning ${chain}:`, error);
    result.errors.push(error.message);
  }
  
  return result;
}

/**
 * Scan all configured chains
 */
export async function scanAllChainsForDeposits(): Promise<ScanResult[]> {
  const results: ScanResult[] = [];
  
  // Get enabled chains from env or use defaults
  const enabledChains = (process.env.ENABLED_CHAINS || 'ETH,BSC').split(',').map(c => c.trim());
  
  console.log(`\n📡 Enabled chains: ${enabledChains.join(', ')}`);
  
  for (const chain of enabledChains) {
    if (RPC_ENDPOINTS[chain]) {
      const result = await scanChainForDeposits(chain);
      results.push(result);
    } else {
      console.log(`⚠️  No RPC endpoint configured for ${chain}, skipping`);
    }
  }
  
  return results;
}

/**
 * Update confirmations for pending deposits
 */
export async function updatePendingDepositConfirmations(chain?: string): Promise<number> {
  const where: any = {
    status: { in: ['PENDING', 'CONFIRMING'] },
  };
  
  if (chain) {
    where.chain = chain;
  }
  
  const pendingDeposits = await prisma.deposit.findMany({
    where,
  });
  
  if (pendingDeposits.length === 0) {
    return 0;
  }
  
  console.log(`\n🔄 Updating confirmations for ${pendingDeposits.length} pending deposit(s)...`);
  
  let updated = 0;
  
  for (const deposit of pendingDeposits) {
    try {
      const currentBlock = await getCurrentBlockNumber(deposit.chain);
      const depositBlock = Number(deposit.blockNumber);
      const confirmations = currentBlock - depositBlock;
      
      if (confirmations > deposit.confirmations) {
        await updateDepositConfirmations(deposit.txHash!, confirmations);
        updated++;
        console.log(`   Updated ${deposit.depositId}: ${confirmations} confirmations`);
      }
    } catch (error) {
      console.error(`Error updating confirmations for ${deposit.depositId}:`, error);
    }
  }
  
  return updated;
}

/**
 * Full monitoring cycle
 */
export async function runDepositMonitorCycle(): Promise<{
  scans: ScanResult[];
  confirmationsUpdated: number;
}> {
  console.log('\n========================================');
  console.log('DEPOSIT MONITOR CYCLE');
  console.log('Time:', new Date().toISOString());
  console.log('========================================');
  
  // Scan for new deposits
  const scans = await scanAllChainsForDeposits();
  
  // Update confirmations for pending deposits
  const confirmationsUpdated = await updatePendingDepositConfirmations();
  
  // Summary
  const totalFound = scans.reduce((sum, s) => sum + s.depositsFound, 0);
  const totalCreated = scans.reduce((sum, s) => sum + s.depositsCreated, 0);
  const totalErrors = scans.reduce((sum, s) => sum + s.errors.length, 0);
  
  console.log('\n========================================');
  console.log('CYCLE COMPLETE');
  console.log('----------------------------------------');
  console.log('Chains scanned:', scans.length);
  console.log('Addresses scanned:', scans.reduce((sum, s) => sum + s.addressesScanned, 0));
  console.log('Deposits found:', totalFound);
  console.log('Deposits created:', totalCreated);
  console.log('Confirmations updated:', confirmationsUpdated);
  console.log('Errors:', totalErrors);
  console.log('========================================\n');
  
  return { scans, confirmationsUpdated };
}