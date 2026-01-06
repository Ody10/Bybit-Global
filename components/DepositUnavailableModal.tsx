'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

interface DepositUnavailableModalProps {
  isOpen: boolean;
  onClose: () => void;
  coinSymbol: string;
}

const DepositUnavailableModal: React.FC<DepositUnavailableModalProps> = ({
  isOpen,
  onClose,
  coinSymbol,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0a]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0a0a0a] border-b border-[#1a1a1a]">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <Image
              src={`/coins/${coinSymbol}.png`}
              alt={coinSymbol}
              width={24}
              height={24}
              className="rounded-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <span className="text-lg font-semibold text-white">{coinSymbol}-Deposit</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center px-4 py-20">
        {/* Maintenance Icon */}
        <div className="w-24 h-24 mb-6 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-yellow-500/50 animate-spin-slow" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-xl font-semibold text-white text-center mb-2">
          The Deposit function for this coin is temporarily unavailable
        </h2>
        <p className="text-gray-400 text-center mb-2">
          Wallet is currently under maintenance.
        </p>
        <p className="text-gray-400 text-center mb-8">
          You may set up an alert so you are notified when the service is resumed.
        </p>

        {/* Set Alert Button */}
        <button className="px-8 py-3 bg-transparent border border-yellow-500 text-yellow-500 font-semibold rounded-xl hover:bg-yellow-500/10 transition-colors">
          Set Alert
        </button>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default DepositUnavailableModal;