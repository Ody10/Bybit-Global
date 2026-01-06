'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-[#f7a600] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-white text-sm">Loading...</span>
      </div>
    </div>
  );
}

function SelectPaymentMethodModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
      <div className="w-full bg-[#1a1a1a] rounded-t-2xl animate-slide-up max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800 sticky top-0 bg-[#1a1a1a]">
          <span className="text-white font-medium text-lg">Select Payment Method</span>
          <button onClick={onClose} className="text-gray-400">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          <p className="text-gray-500 text-sm mb-3">Don&apos;t have crypto</p>
          <button className="w-full bg-[#252525] rounded-xl p-4 flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#333] rounded-full flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-white font-medium">Deposit Crypto</div>
                <div className="text-gray-500 text-sm">Already have crypto? Deposit directly</div>
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          <button className="w-full bg-[#252525] rounded-xl p-4 flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#333] rounded-full flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-white font-medium">Receive from Bybit User</div>
                <div className="text-gray-500 text-sm">Get crypto directly from another Bybit user.</div>
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-500 text-sm">Buy Crypto with Fiat</p>
            <button className="flex items-center gap-1 text-[#3b82f6]">
              <div className="w-4 h-4 bg-[#3b82f6] rounded-full"></div>
              <span className="text-sm">EUR</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>
          <button className="w-full bg-[#252525] rounded-xl p-4 flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1a5c4b] rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">P2P</span>
              </div>
              <div className="text-left">
                <div className="text-white font-medium">P2P Trading</div>
                <div className="text-gray-500 text-sm">Bank Transfer,Revolut,Wise and more</div>
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          <button className="w-full bg-[#252525] rounded-xl p-4 flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#333] rounded-full flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-white font-medium">Buy with EUR</div>
                <div className="text-gray-500 text-sm">Visa, Mastercard and JCB are supported</div>
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          <button className="w-full bg-[#252525] rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#333] rounded-full flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-white font-medium">Deposit EUR</div>
                <div className="text-gray-500 text-sm">Deposit via Bank Tranfers or Top-Ups</div>
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
      <style jsx>{`
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
}

export default function VisitBybitPay() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const navigateWithLoading = (path: string) => {
    setLoading(true);
    setTimeout(() => router.push(path), 500);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {loading && <LoadingSpinner />}
      <div className="sticky top-0 z-10 bg-[#0d0d0d] px-4 py-4">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="text-white p-2 -ml-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">Bybit Pay</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => navigateWithLoading('/BybitPayDashboard/PaymentHistory')} className="text-gray-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18" />
              </svg>
            </button>
            <button onClick={() => navigateWithLoading('/BybitPayDashboard/BybitPaySettings')} className="text-gray-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="px-4 pb-8">
        <div className="mb-4">
          <div className="flex items-center gap-1 text-gray-500 text-sm mb-1">
            <span>Available Balance</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /></svg>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">0.00</span>
              <span className="text-gray-500 text-sm">ARS</span>
            </div>
            <button onClick={() => setShowPaymentModal(true)} className="flex items-center gap-1 bg-white text-black px-4 py-2 rounded-full font-medium">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" /></svg>
              <span>Top Up</span>
            </button>
          </div>
        </div>
        <button onClick={() => navigateWithLoading('/BybitPayDashboard/PaymentSettings')} className="w-full flex items-center justify-between py-3 mb-6">
          <span className="text-gray-500">Payment Settings</span>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 bg-[#26a17b] rounded-full border-2 border-[#0d0d0d]"></div>
              <div className="w-6 h-6 bg-[#f7931a] rounded-full border-2 border-[#0d0d0d]"></div>
              <div className="w-6 h-6 bg-gray-600 rounded-full border-2 border-[#0d0d0d]"></div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><path d="M9 18l6-6-6-6" /></svg>
          </div>
        </button>
        <div className="flex justify-between mb-8">
          {['QR Pay', 'Transfer', 'Send', 'Receive', 'Referral'].map((label) => (
            <button key={label} onClick={() => label === 'Receive' && navigateWithLoading('/BybitPayDashboard')} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-[#1a1a1a] rounded-xl flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  {label === 'QR Pay' && <rect x="3" y="3" width="18" height="18" rx="2" />}
                  {label === 'Transfer' && <path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4" />}
                  {label === 'Send' && <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />}
                  {label === 'Receive' && <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />}
                  {label === 'Referral' && <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></>}
                </svg>
              </div>
              <span className="text-white text-xs">{label}</span>
            </button>
          ))}
        </div>
        <div className="mb-8">
          <h3 className="text-white font-semibold mb-4">Payment Applications</h3>
          <div className="flex gap-6">
            {['PIX Pay', 'SPEI', 'Bank', 'Giveaway', 'More'].map((name) => (
              <button key={name} className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 ${name === 'PIX Pay' || name === 'SPEI' ? 'bg-[#1a5c4b]' : 'bg-[#1a1a1a]'} rounded-xl flex items-center justify-center`}>
                  <span className="text-white text-xs">{name.slice(0, 3)}</span>
                </div>
                <span className="text-white text-xs">{name}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="bg-gradient-to-r from-[#1a1a1a] to-[#252525] rounded-2xl p-4 mb-6">
          <p className="text-white font-semibold mb-1">Partner with Bybit Pay: Connecting</p>
          <p className="text-white font-semibold mb-2">Your Business to a Borderless Future</p>
          <div className="w-8 h-8 bg-[#f7a600] rounded-full flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </div>
        </div>
        <div className="flex gap-4 mb-6">
          <div className="flex-1 bg-gradient-to-b from-[#4a3d1a] to-[#2a2a2a] rounded-2xl p-4">
            <p className="text-white font-medium mb-1">Points</p>
            <div className="flex items-center gap-1 text-[#f7a600]"><span className="text-xl font-bold">0</span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg></div>
            <p className="text-gray-500 text-sm mt-2">Base: 2%</p>
          </div>
          <div className="flex-1 bg-[#1a1a1a] rounded-2xl p-4 relative">
            <span className="absolute top-2 right-2 text-gray-600 text-xs">Off</span>
            <p className="text-white font-medium mb-1">Auto-Earn</p>
            <p className="text-white text-lg font-semibold">Up to 10.89% APR</p>
            <button className="mt-2 bg-[#3b82f6] text-white text-sm px-4 py-1 rounded-full">Activate</button>
          </div>
        </div>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div><h3 className="text-white font-semibold">Explore the world</h3><p className="text-gray-500 text-sm">See the world cashless with Bybit Pay</p></div>
            <button className="bg-[#f7a600] text-black text-sm px-4 py-2 rounded-full">Invite Friends</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[{ title: 'Brazil', color: 'from-pink-400 to-pink-600' }, { title: 'Argentina', color: 'from-orange-400 to-orange-600' }, { title: 'Mexico', color: 'from-yellow-400 to-yellow-600' }].map((img) => (
              <div key={img.title} className={`flex-shrink-0 w-32 h-24 bg-gradient-to-br ${img.color} rounded-xl flex items-end p-2`}>
                <span className="text-white text-sm font-medium">{img.title}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <h3 className="text-white font-semibold mb-3">Featured Stores</h3>
          <div className="flex flex-wrap gap-2">
            {['Mobile top-up', 'Gift Cards', 'Gaming', 'E-commerce', 'More'].map((name) => (
              <button key={name} className={`px-4 py-2 rounded-full ${name === 'More' ? 'bg-white text-black' : 'bg-[#1a1a1a] text-white'} text-sm`}>{name}</button>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <h3 className="text-white font-semibold mb-3">Merchant partners</h3>
          <div className="flex gap-6 overflow-x-auto pb-2">
            {['Coinsbee', 'Uquid', 'Token Store', 'KryptoMate'].map((name) => (
              <div key={name} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-[#1a1a1a] rounded-xl flex items-center justify-center"><span className="text-white text-xs">{name.slice(0, 2)}</span></div>
                <span className="text-white text-xs">{name}</span>
              </div>
            ))}
          </div>
        </div>
        <button className="w-full text-center text-[#f7a600] py-4 flex items-center justify-center gap-1">
          <span>Merchant Growth Plan</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </button>
      </div>
      <SelectPaymentMethodModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} />
    </div>
  );
}