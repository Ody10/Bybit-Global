// Bitcoin Blockchain Scanner
// Detects BTC deposits to user wallet addresses
//
// Bitcoin is different from EVM chains:
// - Uses UTXO model (not account model)
// - No smart contracts or tokens
// - Different address formats (Legacy, SegWit, Native SegWit, Taproot)
// - Requires different API endpoints

import { prisma } from './prisma';
import { createPendingDeposit, updateDepositConfirmations } from './deposit-monitor';

// Bitcoin API providers
const BTC_API_PROVIDERS = {
  // Mempool.space - Recommended (free, no API key needed)
  mempool: {
    baseUrl: 'https://mempool.space/api',
    getAddress: (addr: string) => `/address/${addr}`,
    getTxs: (addr: string) => `/address/${addr}/txs`,
    getTx: (txid: string) => `/tx/${txid}`,
    getBlockHeight: () => `/blocks/tip/height`,
  },
  
  // BlockCypher - Good free tier
  blockcypher: {
    baseUrl: 'https://api.blockcypher.com/v1/btc/main',
    getAddress: (addr: string) => `/addrs/${addr}`,
    getTxs: (addr: string) => `/addrs/${addr}/full`,
    getTx: (txid: string) => `/txs/${txid}`,
    getBlockHeight: () => '',  // Included in main endpoint
  },
  
  // Blockchain.info
  blockchain: {
    baseUrl: 'https://blockchain.info',
    getAddress: (addr: string) => `/rawaddr/${addr}`,
    getTxs: (addr: string) => `/rawaddr/${addr}`,
    getTx: (txid: string) => `/rawtx/${txid}`,
    getBlockHeight: () => `/latestblock`,
  },
};

// Configuration
const BTC_PROVIDER = process.env.BTC_PROVIDER || 'mempool';
const BTC_API_URL = process.env.BTC_API_URL || 'https://mempool.space/api';
const BLOCKCYPHER_API_KEY = process.env.BLOCKCYPHER_API_KEY || '';

// Bitcoin confirmations required (6 is standard for large amounts)
const BTC_REQUIRED_CONFIRMATIONS = parseInt(process.env.BTC_CONFIRMATIONS || '3');

// Satoshi to BTC conversion
const SATOSHI_PER_BTC = 100_000_000;

interface BTCTransaction {
  txHash: string;
  fromAddresses: string[];
  toAddress: string;
  amount: number;  // in BTC
  amountSatoshi: number;
  blockHeight: number | null;
  confirmations: number;
  timestamp: Date | null;
  fee: number;
}

interface BTCScanResult {
  chain: 'BTC';
  addressesScanned: number;
  depositsFound: number;
  depositsCreated: number;
  errors: string[];
}

/**
 * Get all BTC wallet addresses from database
 */
async function getBTCWalletAddresses(): Promise<string[]> {
  const wallets = await prisma.wallet.findMany({
    where: { chain: 'BTC' },
    select: { address: true },
  });
  
  return wallets.map(w => w.address);
}

/**
 * Get current Bitcoin block height
 */
async function getCurrentBlockHeight(): Promise<number> {
  try {
    if (BTC_PROVIDER === 'mempool') {
      const response = await fetch(`${BTC_API_URL}/blocks/tip/height`);
      const height = await response.text();
      return parseInt(height);
    } else if (BTC_PROVIDER === 'blockcypher') {
      const url = BLOCKCYPHER_API_KEY 
        ? `${BTC_API_URL}?token=${BLOCKCYPHER_API_KEY}`
        : BTC_API_URL;
      const response = await fetch(url);
      const data = await response.json();
      return data.height;
    } else {
      const response = await fetch(`${BTC_API_URL}/latestblock`);
      const data = await response.json();
      return data.height;
    }
  } catch (error) {
    console.error('Error getting BTC block height:', error);
    throw error;
  }
}

/**
 * Get transactions for a Bitcoin address using Mempool.space API
 */
async function getAddressTransactionsMempool(address: string): Promise<BTCTransaction[]> {
  const transactions: BTCTransaction[] = [];
  
  try {
    // Get address transactions
    const response = await fetch(`${BTC_API_URL}/address/${address}/txs`);
    
    if (!response.ok) {
      console.error(`Mempool API error for ${address}: ${response.status}`);
      return transactions;
    }
    
    const txs = await response.json();
    const currentHeight = await getCurrentBlockHeight();
    
    for (const tx of txs) {
      // Find outputs that go to our address
      for (const vout of tx.vout) {
        if (vout.scriptpubkey_address === address) {
          const confirmations = tx.status.confirmed 
            ? currentHeight - tx.status.block_height + 1 
            : 0;
          
          // Get input addresses (senders)
          const fromAddresses: string[] = [];
          for (const vin of tx.vin) {
            if (vin.prevout?.scriptpubkey_address) {
              fromAddresses.push(vin.prevout.scriptpubkey_address);
            }
          }
          
          transactions.push({
            txHash: tx.txid,
            fromAddresses,
            toAddress: address,
            amountSatoshi: vout.value,
            amount: vout.value / SATOSHI_PER_BTC,
            blockHeight: tx.status.block_height || null,
            confirmations,
            timestamp: tx.status.block_time 
              ? new Date(tx.status.block_time * 1000) 
              : null,
            fee: tx.fee / SATOSHI_PER_BTC,
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error fetching transactions for ${address}:`, error);
  }
  
  return transactions;
}

/**
 * Get transactions for a Bitcoin address using BlockCypher API
 */
async function getAddressTransactionsBlockCypher(address: string): Promise<BTCTransaction[]> {
  const transactions: BTCTransaction[] = [];
  
  try {
    let url = `${BTC_API_URL}/addrs/${address}/full?limit=50`;
    if (BLOCKCYPHER_API_KEY) {
      url += `&token=${BLOCKCYPHER_API_KEY}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`BlockCypher API error for ${address}: ${response.status}`);
      return transactions;
    }
    
    const data = await response.json();
    
    for (const tx of data.txs || []) {
      // Find outputs that go to our address
      for (const output of tx.outputs) {
        if (output.addresses?.includes(address)) {
          transactions.push({
            txHash: tx.hash,
            fromAddresses: tx.inputs?.flatMap((i: any) => i.addresses || []) || [],
            toAddress: address,
            amountSatoshi: output.value,
            amount: output.value / SATOSHI_PER_BTC,
            blockHeight: tx.block_height || null,
            confirmations: tx.confirmations || 0,
            timestamp: tx.confirmed ? new Date(tx.confirmed) : null,
            fee: (tx.fees || 0) / SATOSHI_PER_BTC,
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error fetching transactions for ${address}:`, error);
  }
  
  return transactions;
}

/**
 * Get transactions for a Bitcoin address (auto-selects provider)
 */
async function getAddressTransactions(address: string): Promise<BTCTransaction[]> {
  if (BTC_PROVIDER === 'blockcypher') {
    return getAddressTransactionsBlockCypher(address);
  }
  
  // Default to Mempool.space
  return getAddressTransactionsMempool(address);
}

/**
 * Get last scanned BTC transaction from database
 */
async function getLastScannedTx(address: string): Promise<string | null> {
  const config = await prisma.systemConfig.findUnique({
    where: { key: `last_btc_tx_${address}` },
  });
  
  return config?.value || null;
}

/**
 * Save last scanned BTC transaction
 */
async function saveLastScannedTx(address: string, txHash: string): Promise<void> {
  await prisma.systemConfig.upsert({
    where: { key: `last_btc_tx_${address}` },
    update: { value: txHash },
    create: {
      key: `last_btc_tx_${address}`,
      value: txHash,
      type: 'STRING',
    },
  });
}

/**
 * Check if deposit already exists
 */
async function depositExists(txHash: string): Promise<boolean> {
  const existing = await prisma.deposit.findFirst({
    where: { txHash: txHash.toLowerCase() },
  });
  return !!existing;
}

/**
 * Main function to scan Bitcoin addresses for deposits
 */
export async function scanBitcoinForDeposits(): Promise<BTCScanResult> {
  const result: BTCScanResult = {
    chain: 'BTC',
    addressesScanned: 0,
    depositsFound: 0,
    depositsCreated: 0,
    errors: [],
  };
  
  try {
    console.log('\n🔍 Scanning Bitcoin for deposits...');
    console.log(`   Provider: ${BTC_PROVIDER}`);
    console.log(`   Required confirmations: ${BTC_REQUIRED_CONFIRMATIONS}`);
    
    // Get all BTC wallet addresses
    const addresses = await getBTCWalletAddresses();
    result.addressesScanned = addresses.length;
    
    if (addresses.length === 0) {
      console.log('   No BTC wallet addresses found');
      return result;
    }
    
    console.log(`   Found ${addresses.length} BTC addresses to monitor`);
    
    // Get current block height
    const currentHeight = await getCurrentBlockHeight();
    console.log(`   Current block height: ${currentHeight}`);
    
    // Scan each address
    for (const address of addresses) {
      console.log(`\n   Scanning address: ${address.slice(0, 10)}...${address.slice(-6)}`);
      
      try {
        const transactions = await getAddressTransactions(address);
        console.log(`   Found ${transactions.length} transaction(s)`);
        
        for (const tx of transactions) {
          // Skip if already processed
          if (await depositExists(tx.txHash)) {
            continue;
          }
          
          result.depositsFound++;
          
          // Create deposit record - convert null to undefined for timestamp
          const depositData = {
            txHash: tx.txHash,
            fromAddress: tx.fromAddresses[0] || 'unknown',
            toAddress: tx.toAddress,
            amount: tx.amount.toString(),
            token: 'BTC',
            chain: 'BTC',
            blockNumber: tx.blockHeight || 0,
            confirmations: tx.confirmations,
            timestamp: tx.timestamp || undefined, // Convert null to undefined
          };
          
          const depositId = await createPendingDeposit(depositData);
          
          if (depositId) {
            result.depositsCreated++;
            console.log(`   ✅ Created BTC deposit ${depositId}: ${tx.amount} BTC`);
            console.log(`      TX: ${tx.txHash.slice(0, 20)}...`);
            console.log(`      Confirmations: ${tx.confirmations}/${BTC_REQUIRED_CONFIRMATIONS}`);
          }
        }
        
        // Rate limit between addresses
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error: any) {
        const errorMsg = `Error scanning ${address}: ${error.message}`;
        result.errors.push(errorMsg);
        console.error(`   ❌ ${errorMsg}`);
      }
    }
    
  } catch (error: any) {
    console.error('BTC scan error:', error);
    result.errors.push(error.message);
  }
  
  return result;
}

/**
 * Update confirmations for pending BTC deposits
 */
export async function updateBTCConfirmations(): Promise<number> {
  const pendingDeposits = await prisma.deposit.findMany({
    where: {
      chain: 'BTC',
      status: { in: ['PENDING', 'CONFIRMING'] },
    },
  });
  
  if (pendingDeposits.length === 0) {
    return 0;
  }
  
  console.log(`\n🔄 Updating confirmations for ${pendingDeposits.length} pending BTC deposit(s)...`);
  
  let updated = 0;
  const currentHeight = await getCurrentBlockHeight();
  
  for (const deposit of pendingDeposits) {
    try {
      if (!deposit.blockNumber) continue;
      
      const confirmations = currentHeight - Number(deposit.blockNumber) + 1;
      
      if (confirmations > deposit.confirmations) {
        await updateDepositConfirmations(deposit.txHash!, confirmations);
        updated++;
        console.log(`   Updated ${deposit.depositId}: ${confirmations} confirmations`);
      }
    } catch (error) {
      console.error(`Error updating BTC deposit ${deposit.depositId}:`, error);
    }
  }
  
  return updated;
}

/**
 * Get Bitcoin address balance (for display)
 */
export async function getBTCAddressBalance(address: string): Promise<{
  confirmed: number;
  unconfirmed: number;
  total: number;
}> {
  try {
    if (BTC_PROVIDER === 'mempool') {
      const response = await fetch(`${BTC_API_URL}/address/${address}`);
      const data = await response.json();
      
      const confirmed = (data.chain_stats?.funded_txo_sum - data.chain_stats?.spent_txo_sum) / SATOSHI_PER_BTC;
      const unconfirmed = (data.mempool_stats?.funded_txo_sum - data.mempool_stats?.spent_txo_sum) / SATOSHI_PER_BTC;
      
      return {
        confirmed,
        unconfirmed,
        total: confirmed + unconfirmed,
      };
    } else if (BTC_PROVIDER === 'blockcypher') {
      let url = `${BTC_API_URL}/addrs/${address}/balance`;
      if (BLOCKCYPHER_API_KEY) url += `?token=${BLOCKCYPHER_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      return {
        confirmed: data.balance / SATOSHI_PER_BTC,
        unconfirmed: data.unconfirmed_balance / SATOSHI_PER_BTC,
        total: data.final_balance / SATOSHI_PER_BTC,
      };
    }
    
    return { confirmed: 0, unconfirmed: 0, total: 0 };
  } catch (error) {
    console.error(`Error getting BTC balance for ${address}:`, error);
    return { confirmed: 0, unconfirmed: 0, total: 0 };
  }
}

/**
 * Validate Bitcoin address format
 */
export function isValidBTCAddress(address: string): boolean {
  // Legacy addresses start with 1
  // P2SH addresses start with 3
  // Native SegWit (Bech32) addresses start with bc1
  // Taproot addresses start with bc1p
  
  const patterns = [
    /^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/,  // Legacy (P2PKH)
    /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/,  // P2SH
    /^bc1[a-z0-9]{39,59}$/i,            // Native SegWit (Bech32)
    /^bc1p[a-z0-9]{58}$/i,              // Taproot
  ];
  
  return patterns.some(pattern => pattern.test(address));
}

/**
 * Get supported Bitcoin address types
 */
export function getBTCAddressType(address: string): string {
  if (address.startsWith('1')) return 'Legacy (P2PKH)';
  if (address.startsWith('3')) return 'P2SH (SegWit Compatible)';
  if (address.startsWith('bc1q')) return 'Native SegWit (Bech32)';
  if (address.startsWith('bc1p')) return 'Taproot';
  return 'Unknown';
}