//CreateSubaccount/page.tsx

'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, ChevronDown } from 'lucide-react';

// Separate component that uses useSearchParams
function CreateSubaccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accountType = searchParams.get('type') || 'standard';
  
  const [nickname, setNickname] = useState('');
  const [accountMode, setAccountMode] = useState('Unified Trading Account');
  const [requirePassword, setRequirePassword] = useState(false);
  const [showAccountModeDropdown, setShowAccountModeDropdown] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const accountModes = [
    'Unified Trading Account',
    'Standard Account',
  ];

  const features = [
    'Save the hassle of moving or transferring funds between multiple accounts',
    'Support all three margin modes — Isolated, Cross, and Portfolio margin — in one account',
    'Use unrealized profits as margin to open new positions',
  ];

  const handleCreate = async () => {
    if (!nickname.trim()) {
      alert('Please enter a subaccount nickname');
      return;
    }

    setIsCreating(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsCreating(false);
      alert('Subaccount created successfully!');
      router.push('/SubaccountDashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0d0d0d] border-b border-[#1a1a1a]">
        <div className="flex items-center justify-between px-4 py-4">
          <button onClick={() => router.back()} className="p-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Create Subaccount</h1>
          <div className="w-6"></div>
        </div>
      </div>

      <div className="p-4">
        {/* Description */}
        <p className="text-[#71757f] text-sm mb-6">
          Subaccount nicknames make it easy to know which Subaccount you&apos;re moving assets to or switching to.
        </p>

        {/* Nickname Input */}
        <div className="mb-6">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter subaccount nickname"
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-4 text-white placeholder-[#71757f] focus:outline-none focus:border-[#f7a600]"
            maxLength={20}
          />
        </div>

        {/* Account Mode */}
        <div className="mb-6">
          <label className="text-[#71757f] text-sm mb-2 block">Account Mode</label>
          <button
            onClick={() => setShowAccountModeDropdown(!showAccountModeDropdown)}
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-4 flex items-center justify-between"
          >
            <span className="text-white">{accountMode}</span>
            <ChevronDown className={`w-5 h-5 text-[#71757f] transition-transform ${showAccountModeDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showAccountModeDropdown && (
            <div className="mt-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
              {accountModes.map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setAccountMode(mode);
                    setShowAccountModeDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-[#252525] flex items-center justify-between"
                >
                  <span className="text-white">{mode}</span>
                  {accountMode === mode && <Check className="w-5 h-5 text-[#f7a600]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Features Card */}
        <div className="bg-gradient-to-b from-[#1a2a1a] to-[#1a1a1a] rounded-xl p-4 mb-6">
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#00c076] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-white text-sm">{feature}</span>
              </div>
            ))}
          </div>
          
          <p className="text-[#71757f] text-xs mt-4">
            The Bybit Unified Trading Account (UTA) is a comprehensive account type that provides access to various trading features, such as Spot Trading, Spot Margin Trading, USDT Perpetual, and USDC Perpetual, Futures, and Options.
          </p>
        </div>

        {/* Require Password Toggle */}
        <div className="bg-[#1a1a1a] rounded-xl px-4 py-4 flex items-center justify-between mb-8">
          <span className="text-white">Require password for login</span>
          <button
            onClick={() => setRequirePassword(!requirePassword)}
            className={`w-12 h-6 rounded-full transition-colors ${requirePassword ? 'bg-[#f7a600]' : 'bg-[#3a3a3a]'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${requirePassword ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
          </button>
        </div>

        {/* Create Button */}
        <button
          onClick={handleCreate}
          disabled={isCreating}
          className="w-full bg-[#f7a600] text-black font-semibold py-4 rounded-xl hover:bg-[#e09500] transition-colors disabled:opacity-50"
        >
          {isCreating ? 'Creating...' : 'Create'}
        </button>
      </div>
    </div>
  );
}

// Main component wrapped with Suspense
export default function CreateSubaccount() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-[#0d0d0d] text-white flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f7a600]"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <CreateSubaccountContent />
    </Suspense>
  );
}
