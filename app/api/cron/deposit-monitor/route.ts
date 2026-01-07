export const dynamic = 'force-static';
export const revalidate = false;

import { NextRequest, NextResponse } from 'next/server';
import { runDepositMonitorCycle, scanChainForDeposits, updatePendingDepositConfirmations } from '@/lib/blockchain-scanner';
import { scanBitcoinForDeposits, updateBTCConfirmations } from '@/lib/bitcoin-scanner';

// POST /api/cron/deposit-monitor
// Called by cron job or external scheduler to scan for deposits
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (optional but recommended)
    const authHeader = request.headers.get('x-api-secret') || request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || process.env.INTERNAL_API_SECRET;
    
    if (cronSecret && authHeader !== cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if specific chain requested
    const body = await request.json().catch(() => ({}));
    const chain = body.chain;
    
    // Get enabled chains from env
    const enabledChains = (process.env.ENABLED_CHAINS || 'ETH').split(',').map(c => c.trim().toUpperCase());
    const btcEnabled = enabledChains.includes('BTC');
    const evmChains = enabledChains.filter(c => c !== 'BTC');
    
    let evmScans: any[] = [];
    let btcScan: any = null;
    let evmConfirmationsUpdated = 0;
    let btcConfirmationsUpdated = 0;
    
    console.log('\n========================================');
    console.log('DEPOSIT MONITOR CRON');
    console.log('Time:', new Date().toISOString());
    console.log('Enabled chains:', enabledChains.join(', '));
    console.log('========================================');
    
    if (chain) {
      // Scan specific chain
      const chainUpper = chain.toUpperCase();
      
      if (chainUpper === 'BTC') {
        // Scan Bitcoin only
        console.log('Cron: Scanning Bitcoin only...');
        btcScan = await scanBitcoinForDeposits();
        btcConfirmationsUpdated = await updateBTCConfirmations();
      } else {
        // Scan specific EVM chain
        console.log(`Cron: Scanning ${chainUpper} only...`);
        const scanResult = await scanChainForDeposits(chainUpper);
        evmScans = [scanResult];
        evmConfirmationsUpdated = await updatePendingDepositConfirmations(chainUpper);
      }
    } else {
      // Run full monitoring cycle for all enabled chains
      console.log('Cron: Running full deposit monitoring cycle...');
      
      // Scan EVM chains
      if (evmChains.length > 0) {
        console.log(`\n--- Scanning EVM Chains: ${evmChains.join(', ')} ---`);
        const result = await runDepositMonitorCycle();
        evmScans = result.scans;
        evmConfirmationsUpdated = result.confirmationsUpdated;
      }
      
      // Scan Bitcoin if enabled
      if (btcEnabled) {
        console.log('\n--- Scanning Bitcoin ---');
        btcScan = await scanBitcoinForDeposits();
        btcConfirmationsUpdated = await updateBTCConfirmations();
      }
    }
    
    // Calculate totals
    const evmDepositsFound = evmScans.reduce((sum, s) => sum + (s.depositsFound || 0), 0);
    const evmDepositsCreated = evmScans.reduce((sum, s) => sum + (s.depositsCreated || 0), 0);
    const evmErrors = evmScans.flatMap(s => s.errors || []);
    
    const btcDepositsFound = btcScan?.depositsFound || 0;
    const btcDepositsCreated = btcScan?.depositsCreated || 0;
    const btcErrors = btcScan?.errors || [];
    
    const totalFound = evmDepositsFound + btcDepositsFound;
    const totalCreated = evmDepositsCreated + btcDepositsCreated;
    const totalErrors = [...evmErrors, ...btcErrors];
    
    return NextResponse.json({
      success: true,
      message: 'Deposit monitoring completed',
      summary: {
        enabledChains,
        chainsScanned: evmScans.length + (btcScan ? 1 : 0),
        depositsFound: totalFound,
        depositsCreated: totalCreated,
        confirmationsUpdated: {
          evm: evmConfirmationsUpdated,
          btc: btcConfirmationsUpdated,
          total: evmConfirmationsUpdated + btcConfirmationsUpdated,
        },
        errors: totalErrors.length,
      },
      details: {
        evm: {
          chainsScanned: evmScans.length,
          depositsFound: evmDepositsFound,
          depositsCreated: evmDepositsCreated,
          scans: evmScans,
        },
        btc: btcScan ? {
          enabled: true,
          addressesScanned: btcScan.addressesScanned,
          depositsFound: btcDepositsFound,
          depositsCreated: btcDepositsCreated,
          errors: btcErrors,
        } : {
          enabled: false,
        },
      },
      errors: totalErrors,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Cron deposit monitor error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Deposit monitoring failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET /api/cron/deposit-monitor - Health check
export async function GET(request: NextRequest) {
  const enabledChains = (process.env.ENABLED_CHAINS || 'ETH').split(',').map(c => c.trim().toUpperCase());
  const btcEnabled = enabledChains.includes('BTC');
  const evmChains = enabledChains.filter(c => c !== 'BTC');
  
  return NextResponse.json({
    success: true,
    service: 'Deposit Monitor',
    status: 'ready',
    config: {
      enabledChains,
      evmChains,
      btcEnabled,
      btcProvider: btcEnabled ? (process.env.BTC_PROVIDER || 'mempool') : null,
      btcApiUrl: btcEnabled ? (process.env.BTC_API_URL || 'https://mempool.space/api') : null,
    },
    timestamp: new Date().toISOString(),
  });
}
