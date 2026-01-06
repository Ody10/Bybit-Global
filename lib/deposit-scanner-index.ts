// Master Blockchain Scanner
// Combines EVM chains (ETH, BSC, etc.) and Bitcoin scanning

import { 
  scanChainForDeposits, 
  scanAllChainsForDeposits, 
  updatePendingDepositConfirmations,
  getSupportedTokens,
} from './blockchain-scanner';

import {
  scanBitcoinForDeposits,
  updateBTCConfirmations,
  getBTCAddressBalance,
  isValidBTCAddress,
  getBTCAddressType,
} from './bitcoin-scanner';

// Re-export everything
export {
  // EVM chain functions
  scanChainForDeposits,
  scanAllChainsForDeposits,
  updatePendingDepositConfirmations,
  getSupportedTokens,
  
  // Bitcoin functions
  scanBitcoinForDeposits,
  updateBTCConfirmations,
  getBTCAddressBalance,
  isValidBTCAddress,
  getBTCAddressType,
};

interface FullScanResult {
  evmScans: any[];
  btcScan: any | null;
  confirmationsUpdated: {
    evm: number;
    btc: number;
  };
  totalDepositsFound: number;
  totalDepositsCreated: number;
}

/**
 * Run complete deposit monitoring cycle for all chains including Bitcoin
 */
export async function runFullDepositMonitorCycle(): Promise<FullScanResult> {
  console.log('\n========================================');
  console.log('FULL DEPOSIT MONITOR CYCLE');
  console.log('Time:', new Date().toISOString());
  console.log('========================================');
  
  const enabledChains = (process.env.ENABLED_CHAINS || 'ETH').split(',').map(c => c.trim().toUpperCase());
  const btcEnabled = enabledChains.includes('BTC');
  const evmChains = enabledChains.filter(c => c !== 'BTC');
  
  console.log(`\nEnabled chains: ${enabledChains.join(', ')}`);
  console.log(`EVM chains: ${evmChains.length > 0 ? evmChains.join(', ') : 'None'}`);
  console.log(`Bitcoin: ${btcEnabled ? 'Enabled' : 'Disabled'}`);
  
  // Scan EVM chains
  let evmScans: any[] = [];
  if (evmChains.length > 0) {
    console.log('\n--- Scanning EVM Chains ---');
    evmScans = await scanAllChainsForDeposits();
  }
  
  // Scan Bitcoin
  let btcScan: any | null = null;
  if (btcEnabled) {
    console.log('\n--- Scanning Bitcoin ---');
    btcScan = await scanBitcoinForDeposits();
  }
  
  // Update confirmations
  console.log('\n--- Updating Confirmations ---');
  const evmConfirmations = await updatePendingDepositConfirmations();
  const btcConfirmations = btcEnabled ? await updateBTCConfirmations() : 0;
  
  // Calculate totals
  const evmDepositsFound = evmScans.reduce((sum, s) => sum + s.depositsFound, 0);
  const evmDepositsCreated = evmScans.reduce((sum, s) => sum + s.depositsCreated, 0);
  const btcDepositsFound = btcScan?.depositsFound || 0;
  const btcDepositsCreated = btcScan?.depositsCreated || 0;
  
  const result: FullScanResult = {
    evmScans,
    btcScan,
    confirmationsUpdated: {
      evm: evmConfirmations,
      btc: btcConfirmations,
    },
    totalDepositsFound: evmDepositsFound + btcDepositsFound,
    totalDepositsCreated: evmDepositsCreated + btcDepositsCreated,
  };
  
  // Summary
  console.log('\n========================================');
  console.log('CYCLE COMPLETE');
  console.log('----------------------------------------');
  console.log('EVM Chains:');
  console.log(`  Chains scanned: ${evmScans.length}`);
  console.log(`  Deposits found: ${evmDepositsFound}`);
  console.log(`  Deposits created: ${evmDepositsCreated}`);
  console.log(`  Confirmations updated: ${evmConfirmations}`);
  if (btcEnabled) {
    console.log('Bitcoin:');
    console.log(`  Addresses scanned: ${btcScan?.addressesScanned || 0}`);
    console.log(`  Deposits found: ${btcDepositsFound}`);
    console.log(`  Deposits created: ${btcDepositsCreated}`);
    console.log(`  Confirmations updated: ${btcConfirmations}`);
  }
  console.log('----------------------------------------');
  console.log(`TOTAL Deposits found: ${result.totalDepositsFound}`);
  console.log(`TOTAL Deposits created: ${result.totalDepositsCreated}`);
  console.log('========================================\n');
  
  return result;
}