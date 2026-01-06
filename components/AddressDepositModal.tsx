'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';

// CoinIcon component with fallback
const CoinIcon = ({ symbol, size = 24, className = '' }: { symbol: string; size?: number; className?: string }) => {
  const [imgError, setImgError] = useState(false);
  
  return (
    <div 
      className={`rounded-full overflow-hidden flex items-center justify-center bg-[#26A17B] ${className}`}
      style={{ width: size, height: size }}
    >
      {!imgError ? (
        <Image 
          src={`/coins/${symbol}.png`} 
          alt={symbol} 
          width={size} 
          height={size} 
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="text-white font-bold" style={{ fontSize: size * 0.4 }}>{symbol.slice(0, 1)}</span>
      )}
    </div>
  );
};

interface ChainInfo {
  name: string;
  network: string;
  icon: string;
  confirmations: number;
  withdrawalConfirmations?: number;
  minDeposit: string;
  memo?: string;
  contractAddress?: string;
}

interface AddressDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChangeNetwork: () => void;
  coinSymbol: string;
  coinName: string;
  selectedChain: ChainInfo;
  walletAddress?: string;
}

// Contract addresses for popular tokens on different networks
const contractAddresses: { [key: string]: { [network: string]: string } } = {
  USDT: {
    'ERC20': '0xdac17f958d2ee523a2206206994597c13d831ec7',
    'TRC20': 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    'BEP20': '0x55d398326f99059fF775485246999027B3197955',
    'Polygon': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    'Arbitrum One': '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    'Optimism': '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
    'Avalanche C-Chain': '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
    'SOL': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  },
  USDC: {
    'ERC20': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    'TRC20': 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8',
    'BEP20': '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    'Polygon': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    'Arbitrum One': '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    'Optimism': '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
    'Avalanche C-Chain': '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    'SOL': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    'BASE': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  },
  USCT: {
    'ERC20': '0xd32F83a9f25388572DAF835B55cAE37aF2E0140f',
    'BEP20': '0xabcdef1234567890abcdef1234567890abcdef12',
  },
  DAI: {
    'ERC20': '0x6B175474E89094C44Da98b954EesEcdBC5DAD3BF4',
    'Polygon': '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    'Optimism': '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
  },
  WBTC: {
    'ERC20': '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  },
  LINK: {
    'ERC20': '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    'BEP20': '0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD',
  },
  UNI: {
    'ERC20': '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  },
  SHIB: {
    'ERC20': '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
  },
  MATIC: {
    'ERC20': '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
    'Polygon': '0x0000000000000000000000000000000000001010',
  },
};

export default function AddressDepositModal({
  isOpen,
  onClose,
  onChangeNetwork,
  coinSymbol,
  coinName,
  selectedChain,
  walletAddress: propWalletAddress,
}: AddressDepositModalProps) {
  const [copied, setCopied] = useState(false);
  const [memoCopied, setMemoCopied] = useState(false);
  const [walletAddress, setWalletAddress] = useState(propWalletAddress || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showContractModal, setShowContractModal] = useState(false);

  useEffect(() => {
    if (isOpen && !propWalletAddress) {
      fetchWalletAddress();
    } else if (propWalletAddress) {
      setWalletAddress(propWalletAddress);
    }
  }, [isOpen, selectedChain, propWalletAddress]);

  const fetchWalletAddress = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Please login to get deposit address');
        return;
      }

      const response = await fetch(`/api/user/wallets?chain=${selectedChain.network}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.walletMap) {
          const networkKey = selectedChain.network.toUpperCase();
          const address = data.walletMap[networkKey] || data.walletMap[selectedChain.network] || data.walletMap[selectedChain.name];
          
          if (address) {
            setWalletAddress(address);
          } else {
            setError('No address found for this network');
          }
        }
      } else {
        setError('Failed to fetch wallet address');
      }
    } catch (err) {
      console.error('Error fetching wallet:', err);
      setError('Failed to load wallet address');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleContractCopy = async () => {
    const contractAddr = getContractAddress();
    if (contractAddr) {
      await navigator.clipboard.writeText(contractAddr);
    }
  };

  const handleMemoCopy = async () => {
    if (selectedChain.memo) {
      await navigator.clipboard.writeText(selectedChain.memo);
      setMemoCopied(true);
      setTimeout(() => setMemoCopied(false), 2000);
    }
  };

  const getContractAddress = () => {
    const tokenContracts = contractAddresses[coinSymbol];
    if (tokenContracts) {
      return tokenContracts[selectedChain.name] || tokenContracts[selectedChain.network] || null;
    }
    return null;
  };

  const getShortContractAddress = () => {
    const addr = getContractAddress();
    if (addr && addr.length > 10) {
      return `Ending with ${addr.slice(-7)}`;
    }
    return null;
  };

  if (!isOpen) return null;

  const contractAddress = getContractAddress();

  return (
    <>
      <div className="fixed inset-0 z-50 flex flex-col bg-[#0b0b0b]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#1a1a1a]">
          <button onClick={onClose} className="p-1">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <CoinIcon symbol={coinSymbol} size={24} />
            <span className="font-semibold text-white">{coinSymbol}-Deposit</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-1">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button className="p-1">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </button>
          </div>
        </div>

        {/* Network Selector */}
        <div className="px-4 py-3 flex items-center gap-2">
          <span className="text-gray-400 text-sm">Network:</span>
          <button onClick={onChangeNetwork} className="flex items-center gap-1 text-white text-sm">
            {selectedChain.name}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto px-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400 text-sm">Loading address...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-red-400 text-sm text-center">{error}</p>
              <button onClick={fetchWalletAddress} className="mt-4 px-4 py-2 bg-yellow-500 text-black rounded-lg text-sm font-medium">Retry</button>
            </div>
          ) : (
            <>
              {/* QR Code Section */}
              <div className="flex justify-center py-6">
                <div className="relative bg-white p-4 rounded-2xl">
                  <QRCodeSVG 
                    value={walletAddress || 'loading'} 
                    size={180} 
                    level="H"
                  />
                  {/* Center logo overlay */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <CoinIcon symbol={coinSymbol} size={40} className="border-2 border-white" />
                  </div>
                </div>
              </div>

              {/* Wallet Address Section */}
              <div className="bg-[#1a1a1a] rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Wallet Address</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm font-mono break-all pr-4">{walletAddress}</span>
                  <button onClick={handleCopy} className="p-2 hover:bg-[#2a2a2a] rounded-lg flex-shrink-0">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Info Grid */}
              <div className="space-y-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400 text-sm">Minimum Deposit Amount</span>
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-white text-sm">{selectedChain.minDeposit} {coinSymbol}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Route Deposits To</span>
                  <div className="flex items-center gap-1">
                    <span className="text-white text-sm">Funding Account</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400 text-sm">Deposit Arrival</span>
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-white text-sm">{selectedChain.confirmations} confirmations</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400 text-sm">Withdrawal Unlocked</span>
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-white text-sm">{selectedChain.withdrawalConfirmations || 64} confirmations</span>
                </div>

                {contractAddress && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Contract Address:</span>
                    <button 
                      onClick={() => setShowContractModal(true)}
                      className="flex items-center gap-1"
                    >
                      <span className="text-white text-sm">{getShortContractAddress()}</span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Click here link */}
              <div className="mb-4">
                <p className="text-gray-400 text-sm">
                  View all deposit and withdrawal statuses?{' '}
                  <button className="text-[#f7a600]">Click here.</button>
                </p>
              </div>

              {/* Important Notices */}
              <div className="space-y-3 mb-6">
                <p className="text-gray-400 text-sm leading-relaxed">
                  In upholding the integrity and safety of our platform&apos;s trading environment, Bybit is dedicated to combating financial crime and ensuring adherence to anti-money laundering measures.
                </p>
                
                <p className="text-gray-400 text-sm leading-relaxed">
                  Please make sure that only {coinSymbol} deposit is made via this address. Otherwise, your deposited funds will not be added to your available balance — nor will it be refunded.
                </p>
                
                <p className="text-gray-400 text-sm leading-relaxed">
                  Please make sure that your Bybit deposit address is correct. Otherwise, your deposited funds will not be added to your available balance — nor will it be refunded.
                </p>

                <p className="text-gray-400 text-sm leading-relaxed">
                  Please note that the current asset does not support deposit via the smart contract. If used, your deposited funds will not be added to your available balance — nor will it be refunded.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Bottom Buttons */}
        {!loading && !error && walletAddress && (
          <div className="px-4 py-4 border-t border-[#1a1a1a]">
            <div className="flex gap-3">
              <button className="flex-1 py-3 bg-[#1a1a1a] text-white font-semibold rounded-xl hover:bg-[#252525] transition-colors">
                Save Picture
              </button>
              <button 
                onClick={handleCopy}
                className="flex-1 py-3 bg-[#f7a600] text-black font-semibold rounded-xl hover:bg-[#e69500] transition-colors"
              >
                {copied ? 'Copied!' : 'Copy Address'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contract Address Modal */}
      {showContractModal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70">
          <div className="w-full bg-[#1a1a1a] rounded-t-3xl max-h-[50vh] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#2a2a2a]">
              <h2 className="text-white text-lg font-semibold">Contract Address:</h2>
              <button onClick={() => setShowContractModal(false)} className="p-1">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4">
              {/* Warning Box */}
              <div className="bg-[#2a2a1a] border border-[#f7a600]/30 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#f7a600] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-black text-xs font-bold">!</span>
                  </div>
                  <p className="text-[#f7a600] text-sm leading-relaxed">
                    Contract addresses are different from deposit addresses. Sending funds to this address could result in the permanent loss of your assets. The contract address is a unique code that identifies a specific token to ensure that you are depositing the correct token.
                  </p>
                </div>
              </div>

              {/* Contract Address */}
              <div className="bg-[#0b0b0b] rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm font-mono break-all pr-4">{contractAddress}</span>
                  <button onClick={handleContractCopy} className="p-2 hover:bg-[#2a2a2a] rounded-lg flex-shrink-0">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
