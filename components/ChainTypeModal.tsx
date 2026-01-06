'use client';

import React from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';

interface ChainInfo {
  name: string;
  network: string;
  icon: string;
  confirmations: number;
  minDeposit: string;
  contractAddress?: string;
  suspended?: boolean;
}

interface ChainTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChain: (chain: ChainInfo) => void;
  coinSymbol: string;
  coinName: string;
}

// Chain configurations for different coins
const chainConfigs: { [key: string]: ChainInfo[] } = {
  ETH: [
    { name: 'Ethereum (ERC20)', network: 'ERC20', icon: '/chains/ethereum.png', confirmations: 6, minDeposit: '0.00005 ETH' },
    { name: 'Base Mainnet', network: 'BASE', icon: '/chains/base.png', confirmations: 30, minDeposit: '0.000001 ETH' },
    { name: 'Arbitrum One', network: 'ARBITRUM', icon: '/chains/arbitrum.png', confirmations: 120, minDeposit: '0.000001 ETH' },
    { name: 'Mantle Network', network: 'MANTLE', icon: '/chains/mantle.png', confirmations: 100, minDeposit: '0.000001 ETH' },
    { name: 'BSC (BEP20)', network: 'BEP20', icon: '/chains/bsc.png', confirmations: 60, minDeposit: '0.000001 ETH' },
    { name: 'OP Mainnet', network: 'OPTIMISM', icon: '/chains/optimism.png', confirmations: 30, minDeposit: '0.000001 ETH' },
    { name: 'LINEA', network: 'LINEA', icon: '/chains/linea.png', confirmations: 60, minDeposit: '0.000001 ETH' },
    { name: 'zkSync Era', network: 'ZKSYNC', icon: '/chains/zksync.png', confirmations: 100, minDeposit: '0.000001 ETH' },
    { name: 'Arbitrum Nova', network: 'ARBITRUM_NOVA', icon: '/chains/arbitrum-nova.png', confirmations: 100, minDeposit: '0.000001 ETH' },
  ],
  USDT: [
    { name: 'Ethereum (ERC20)', network: 'ERC20', icon: '/chains/ethereum.png', confirmations: 6, minDeposit: '0.005 USDT' },
    { name: 'TRON (TRC20)', network: 'TRC20', icon: '/chains/tron.png', confirmations: 20, minDeposit: '0.0001 USDT' },
    { name: 'Mantle Network(USDT0)', network: 'MANTLE', icon: '/chains/mantle.png', confirmations: 100, minDeposit: '0.0001 USDT' },
    { name: 'BSC (BEP20)', network: 'BEP20', icon: '/chains/bsc.png', confirmations: 60, minDeposit: '0.005 USDT' },
    { name: 'APTOS', network: 'APTOS', icon: '/chains/aptos.png', confirmations: 1, minDeposit: '0.001 USDT' },
    { name: 'Plasma (USDT0)', network: 'PLASMA', icon: '/chains/plasma.png', confirmations: 10, minDeposit: '0.0001 USDT' },
    { name: 'TON', network: 'TON', icon: '/chains/ton.png', confirmations: 1, minDeposit: '0.0001 USDT' },
    { name: 'SOL', network: 'SOL', icon: '/chains/solana.png', confirmations: 200, minDeposit: '0.005 USDT' },
    { name: 'Arbitrum One', network: 'ARBITRUM', icon: '/chains/arbitrum.png', confirmations: 120, minDeposit: '0.005 USDT' },
    { name: 'Polygon PoS', network: 'POLYGON', icon: '/chains/polygon.png', confirmations: 60, minDeposit: '0.0001 USDT' },
    { name: 'AVAXC', network: 'AVAXC', icon: '/chains/avalanche.png', confirmations: 30, minDeposit: '0.0001 USDT' },
    { name: 'CELO', network: 'CELO', icon: '/chains/celo.png', confirmations: 10, minDeposit: '0.0001 USDT' },
    { name: 'OP Mainnet', network: 'OPTIMISM', icon: '/chains/optimism.png', confirmations: 30, minDeposit: '0.0001 USDT' },
    { name: 'BERA (USDT0)', network: 'BERA', icon: '/chains/bera.png', confirmations: 12, minDeposit: '0.0001 USDT' },
    { name: 'Mantle Network(Bridged)', network: 'MANTLE_BRIDGED', icon: '/chains/mantle.png', confirmations: 100, minDeposit: '0.0001 USDT' },
    { name: 'KAIA', network: 'KAIA', icon: '/chains/kaia.png', confirmations: 30, minDeposit: '0.0001 USDT' },
    { name: 'HYPEREVM (USDT0)', network: 'HYPEREVM', icon: '/chains/hyperevm.png', confirmations: 30, minDeposit: '0.0001 USDT' },
    { name: 'MONAD(USDT0)', network: 'MONAD', icon: '/chains/monad.png', confirmations: 3, minDeposit: '0.0001 USDT' },
    { name: 'KAVAEVM', network: 'KAVAEVM', icon: '/chains/kava.png', confirmations: 10, minDeposit: '0.0001 USDT' },
    { name: 'CORN (USDT0)', network: 'CORN', icon: '/chains/corn.png', confirmations: 30, minDeposit: '0.0001 USDT' },
  ],
  USDC: [
    { name: 'SOL', network: 'SOL', icon: '/chains/solana.png', confirmations: 200, minDeposit: '0.000001 USDC' },
    { name: 'Base Mainnet', network: 'BASE', icon: '/chains/base.png', confirmations: 30, minDeposit: '0.000001 USDC' },
    { name: 'Ethereum (ERC20)', network: 'ERC20', icon: '/chains/ethereum.png', confirmations: 6, minDeposit: '0.005 USDC' },
    { name: 'BSC (BEP20)', network: 'BEP20', icon: '/chains/bsc.png', confirmations: 60, minDeposit: '0.000001 USDC' },
    { name: 'Polygon PoS', network: 'POLYGON', icon: '/chains/polygon.png', confirmations: 60, minDeposit: '0.005 USDC' },
    { name: 'SUI', network: 'SUI', icon: '/chains/sui.png', confirmations: 1, minDeposit: '0.000001 USDC' },
    { name: 'Arbitrum One', network: 'ARBITRUM', icon: '/chains/arbitrum.png', confirmations: 120, minDeposit: '0.005 USDC' },
    { name: 'MONAD', network: 'MONAD', icon: '/chains/monad.png', confirmations: 3, minDeposit: '0.000001 USDC' },
    { name: 'APTOS', network: 'APTOS', icon: '/chains/aptos.png', confirmations: 1, minDeposit: '0.000001 USDC' },
    { name: 'AVAXC', network: 'AVAXC', icon: '/chains/avalanche.png', confirmations: 30, minDeposit: '0.000001 USDC' },
    { name: 'OP Mainnet', network: 'OPTIMISM', icon: '/chains/optimism.png', confirmations: 30, minDeposit: '0.000001 USDC' },
    { name: 'Sonic', network: 'SONIC', icon: '/chains/sonic.png', confirmations: 1, minDeposit: '0.000001 USDC' },
    { name: 'Polygon(bridged)', network: 'POLYGON_BRIDGED', icon: '/chains/polygon.png', confirmations: 60, minDeposit: '0.005 USDC' },
    { name: 'SEIEVM', network: 'SEIEVM', icon: '/chains/sei.png', confirmations: 10, minDeposit: '0.000001 USDC' },
    { name: 'Mantle Network', network: 'MANTLE', icon: '/chains/mantle.png', confirmations: 100, minDeposit: '0.000001 USDC' },
    { name: 'CODEX', network: 'CODEX', icon: '/chains/codex.png', confirmations: 900, minDeposit: '0.000001 USDC' },
    { name: 'HBAR', network: 'HBAR', icon: '/chains/hedera.png', confirmations: 1, minDeposit: '0.000001 USDC' },
    { name: 'XDC', network: 'XDC', icon: '/chains/xdc.png', confirmations: 32, minDeposit: '0.000001 USDC', suspended: true },
  ],
  BTC: [
    { name: 'BTC', network: 'BTC', icon: '/chains/bitcoin.png', confirmations: 1, minDeposit: '0.00001 BTC' },
  ],
  TRX: [
    { name: 'TRON (TRC20)', network: 'TRC20', icon: '/chains/tron.png', confirmations: 20, minDeposit: '1 TRX' },
  ],
  XRP: [
    { name: 'XRP', network: 'XRP', icon: '/chains/xrp.png', confirmations: 1, minDeposit: '0.01 XRP' },
  ],
  SOL: [
    { name: 'SOL', network: 'SOL', icon: '/chains/solana.png', confirmations: 200, minDeposit: '0.001 SOL' },
  ],
  MATIC: [
    { name: 'Polygon', network: 'POLYGON', icon: '/chains/polygon.png', confirmations: 60, minDeposit: '0.1 MATIC', suspended: true },
  ],
  AVAX: [
    { name: 'AVAXC', network: 'AVAXC', icon: '/chains/avalanche.png', confirmations: 30, minDeposit: '0.0001 AVAX' },
    { name: 'AVAX', network: 'AVAX', icon: '/chains/avalanche.png', confirmations: 1, minDeposit: '0.0001 AVAX' },
  ],
  ARB: [
    { name: 'Arbitrum One', network: 'ARBITRUM', icon: '/chains/arbitrum.png', confirmations: 120, minDeposit: '0.00000001 ARB' },
  ],
  LTC: [
    { name: 'LTC', network: 'LTC', icon: '/chains/litecoin.png', confirmations: 6, minDeposit: '0.00001 LTC' },
  ],
  // Custom tokens - USCT uses same chains as USDT
  USCT: [
    { name: 'Ethereum (ERC20)', network: 'ERC20', icon: '/chains/ethereum.png', confirmations: 6, minDeposit: '0.005 USCT', contractAddress: '0xd32F83a9f25388572DAF835B55cAE37aF2E0140f' },
    { name: 'TRON (TRC20)', network: 'TRC20', icon: '/chains/tron.png', confirmations: 20, minDeposit: '0.0001 USCT' },
    { name: 'Mantle Network(USCT0)', network: 'MANTLE', icon: '/chains/mantle.png', confirmations: 100, minDeposit: '0.0001 USCT' },
    { name: 'BSC (BEP20)', network: 'BEP20', icon: '/chains/bsc.png', confirmations: 60, minDeposit: '0.005 USCT' },
    { name: 'APTOS', network: 'APTOS', icon: '/chains/aptos.png', confirmations: 1, minDeposit: '0.001 USCT' },
    { name: 'Plasma (USCT0)', network: 'PLASMA', icon: '/chains/plasma.png', confirmations: 10, minDeposit: '0.0001 USCT' },
    { name: 'TON', network: 'TON', icon: '/chains/ton.png', confirmations: 1, minDeposit: '0.0001 USCT' },
    { name: 'SOL', network: 'SOL', icon: '/chains/solana.png', confirmations: 200, minDeposit: '0.005 USCT' },
  ],
};

// Default chain for coins not in the config
const getDefaultChain = (symbol: string): ChainInfo[] => [
  { name: `${symbol}`, network: symbol, icon: `/coins/${symbol}.png`, confirmations: 6, minDeposit: `0.001 ${symbol}` },
];

const ChainTypeModal: React.FC<ChainTypeModalProps> = ({
  isOpen,
  onClose,
  onSelectChain,
  coinSymbol,
  coinName,
}) => {
  if (!isOpen) return null;

  const chains = chainConfigs[coinSymbol.toUpperCase()] || getDefaultChain(coinSymbol);

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60">
      <div 
        className="bg-[#0a0a0a] w-full max-h-[80vh] rounded-t-3xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#1a1a1a]">
          <h2 className="text-lg font-semibold text-white">Choose a Chain Type</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="mx-4 mt-4 mb-4">
          <div className="bg-[#1a1a1a] rounded-lg p-3 flex items-start gap-2">
            <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-gray-400">
              Make sure that the chain type you make deposits to is the one you make withdrawals from.
            </p>
          </div>
        </div>

        {/* Chain List */}
        <div className="overflow-y-auto max-h-[60vh] pb-8">
          {chains.map((chain, index) => (
            <button
              key={index}
              onClick={() => !chain.suspended && onSelectChain(chain)}
              disabled={chain.suspended}
              className={`w-full px-4 py-4 flex items-center gap-3 border-b border-[#1a1a1a] transition-colors ${
                chain.suspended 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-[#1a1a1a]'
              }`}
            >
              <div className="w-9 h-9 rounded-full overflow-hidden bg-[#2a2a2a] flex items-center justify-center">
                <Image
                  src={chain.icon}
                  alt={chain.name}
                  width={36}
                  height={36}
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `<span class="text-sm font-bold text-white">${chain.network.slice(0, 2)}</span>`;
                  }}
                />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{chain.name}</span>
                  {chain.suspended && (
                    <span className="px-2 py-0.5 bg-[#2a2a2a] rounded text-xs text-gray-400">Suspended</span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  Deposit Completion: {chain.confirmations} confirmation(s)
                </div>
                <div className="text-sm text-gray-500">
                  Min. Deposit Amount: {chain.minDeposit}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ChainTypeModal;
export { chainConfigs, getDefaultChain };
export type { ChainInfo };