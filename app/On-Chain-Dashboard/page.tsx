//On-Chain-Dashboard/page.tsx

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

function OnChainDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const coinSymbol = searchParams.get('coin') || 'A';
  const coinName = searchParams.get('name') || 'Vaulta';

  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState('');
  const [memo, setMemo] = useState('');
  const [amount, setAmount] = useState('');
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<'funding' | 'unified' | null>(null);
  
  // ✅ NEW: State for real balances
  const [loading, setLoading] = useState(true);
  const [fundingBalance, setFundingBalance] = useState(0);
  const [unifiedBalance, setUnifiedBalance] = useState(0);

  // Mock data - would come from API in real app
  const minWithdrawal = 2;
  const withdrawalFee = 0.5;
  const dailyLimit = '1,000,000/1,000,000';
  const contractAddress = 'Ending with vaulta';

  // Available networks for the coin
  const networks = [
    { id: 'erc20', name: 'ERC20', fee: '0.5' },
    { id: 'bep20', name: 'BEP20', fee: '0.3' },
    { id: 'trc20', name: 'TRC20', fee: '0.2' },
    { id: 'sol', name: 'Solana', fee: '0.1' },
  ];

  // ✅ NEW: Fetch balances from API
  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.log('⚠️ No auth token found');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/user/balances', {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          console.log('📊 Balances data:', data);
          
          if (data.success) {
            // Find the specific coin balance for both accounts
            const fundingCoins = data.funding?.balances || [];
            const unifiedCoins = data.unifiedTrading?.balances || [];
            
            // Find balance for the selected coin in Funding account
            const fundingCoin = fundingCoins.find((b: any) => b.currency === coinSymbol);
            setFundingBalance(fundingCoin?.available || 0);
            
            // Find balance for the selected coin in Unified Trading account
            const unifiedCoin = unifiedCoins.find((b: any) => b.currency === coinSymbol);
            setUnifiedBalance(unifiedCoin?.available || 0);
            
            console.log(`💰 ${coinSymbol} Balances:`, {
              funding: fundingCoin?.available || 0,
              unified: unifiedCoin?.available || 0,
            });
          }
        } else {
          console.error('❌ Balance fetch failed:', response.status);
        }
      } catch (error) {
        console.error('❌ Error fetching balances:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, [coinSymbol]); // Re-fetch when coin changes

  const amountReceived = Math.max(0, parseFloat(amount || '0') - withdrawalFee);

  const handleMaxClick = () => {
    const maxAmount = selectedAccount === 'funding' ? fundingBalance : unifiedBalance;
    setAmount(maxAmount.toString());
  };

  const handleWithdraw = () => {
    // Implement withdrawal logic
    console.log('Withdraw:', { coinSymbol, address, network, memo, amount, selectedAccount });
  };

  // ✅ Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0d0d0d] px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-white p-2 -ml-2"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">{coinSymbol}-On-Chain</h1>
          <div className="flex items-center gap-3">
            <button className="text-gray-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <button className="text-gray-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M3 10h18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 pb-32">
        {/* Address Section */}
        <div className="mb-6">
          <label className="text-gray-400 text-sm mb-2 block">Address</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Please select an address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-[#1a1a1a] rounded-lg py-4 px-4 pr-12 text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-gray-600"
            />
            <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Network Section */}
        <div className="mb-6">
          <label className="text-gray-400 text-sm mb-2 block">Network</label>
          <div className="relative">
            <button
              onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
              className="w-full bg-[#1a1a1a] rounded-lg py-4 px-4 text-left flex items-center justify-between"
            >
              <span className={network ? 'text-white' : 'text-gray-500'}>
                {network || 'Please choose a chain type'}
              </span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`text-gray-400 transition-transform ${showNetworkDropdown ? 'rotate-180' : ''}`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {showNetworkDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#252525] rounded-lg overflow-hidden z-20">
                {networks.map((net) => (
                  <button
                    key={net.id}
                    onClick={() => {
                      setNetwork(net.name);
                      setShowNetworkDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-[#2a2a2a] flex justify-between items-center"
                  >
                    <span className="text-white">{net.name}</span>
                    <span className="text-gray-500 text-sm">Fee: {net.fee} {coinSymbol}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tag/Memo Section */}
        <div className="mb-6">
          <div className="flex items-center gap-1 mb-2">
            <label className="text-gray-400 text-sm">Tag/Memo (Comment/Note/Remark)</label>
            <button className="text-gray-500">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <input
            type="text"
            placeholder="Optional"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full bg-[#1a1a1a] rounded-lg py-4 px-4 text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-gray-600"
          />
        </div>

        {/* Amount Section */}
        <div className="mb-6">
          <label className="text-gray-400 text-sm mb-2 block">Amount</label>
          <div className="relative">
            <input
              type="text"
              placeholder={`Min. Withdrawal Amount: ${minWithdrawal}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#1a1a1a] rounded-lg py-4 px-4 pr-20 text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-gray-600"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <span className="text-white">{coinSymbol}</span>
              <button
                onClick={handleMaxClick}
                disabled={!selectedAccount}
                className="text-[#f7a600] font-medium hover:text-[#ffb824] disabled:text-gray-600 disabled:cursor-not-allowed"
              >
                Max
              </button>
            </div>
          </div>
        </div>

        {/* Select Account Section - ✅ NOW SHOWS REAL BALANCES */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <span className="text-gray-400 text-sm">
                Select account ({(fundingBalance + unifiedBalance).toFixed(8)})
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <span className="text-sm">{(fundingBalance + unifiedBalance).toFixed(8)}</span>
              <button className="text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
              </button>
            </div>
          </div>

          {/* Funding Account - ✅ REAL BALANCE */}
          <label className="flex items-center justify-between py-3 cursor-pointer">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedAccount === 'funding'}
                onChange={() => setSelectedAccount(selectedAccount === 'funding' ? null : 'funding')}
                className="w-5 h-5 rounded border-gray-600 bg-transparent checked:bg-yellow-500 checked:border-yellow-500"
              />
              <span className="text-white">Funding</span>
            </div>
            <span className="text-white">{fundingBalance.toFixed(8)}</span>
          </label>

          {/* Unified Trading Account - ✅ REAL BALANCE */}
          <label className="flex items-center justify-between py-3 cursor-pointer">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedAccount === 'unified'}
                onChange={() => setSelectedAccount(selectedAccount === 'unified' ? null : 'unified')}
                className="w-5 h-5 rounded border-gray-600 bg-transparent checked:bg-yellow-500 checked:border-yellow-500"
              />
              <span className="text-white">Unified Trading</span>
            </div>
            <span className="text-white">{unifiedBalance.toFixed(8)}</span>
          </label>
        </div>

        {/* Note Section */}
        <div className="mb-6">
          <div className="text-gray-500 text-sm mb-2">Note:</div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Daily Remaining Limit</span>
            <div className="flex items-center gap-2">
              <span className="text-white text-sm">{dailyLimit} USDT</span>
              <button className="text-[#f7a600] text-sm hover:text-[#ffb824]">
                Manage Limit →
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm">Contract Address:</span>
            <button className="text-gray-400 text-sm flex items-center gap-1">
              {contractAddress}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>
          <a href="#" className="text-[#f7a600] text-sm hover:text-[#ffb824]">
            Need help? Please visit our Help Center.
          </a>
        </div>
      </div>

      {/* Bottom Section - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0d0d0d] px-4 py-4 border-t border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-400 text-sm">Withdrawal Fees</span>
          <span className="text-white">{withdrawalFee} {coinSymbol}</span>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <span className="text-[#f7a600] text-sm">Amount Received</span>
            <button className="text-[#f7a600] text-sm">Setting</button>
          </div>
          <span className="text-white font-medium">{amountReceived.toFixed(8)} {coinSymbol}</span>
        </div>
        <button
          onClick={handleWithdraw}
          disabled={!address || !network || !amount || parseFloat(amount) < minWithdrawal || !selectedAccount}
          className="w-full bg-[#f7a600] text-black font-semibold py-4 rounded-lg hover:bg-[#ffb824] transition-colors disabled:bg-[#4a3d1a] disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          Withdraw
        </button>
      </div>
    </div>
  );
}

// ✅ WRAPPER COMPONENT (REQUIRED!)
export default function OnChainDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-500 border-t-transparent"></div>
      </div>
    }>
      <OnChainDashboardContent />
    </Suspense>
  );
}