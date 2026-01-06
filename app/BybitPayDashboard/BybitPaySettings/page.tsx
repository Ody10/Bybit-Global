'use client';

import { useState } from 'react';
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

function HelpSupportModal({ isOpen, onClose, onNavigate }: { isOpen: boolean; onClose: () => void; onNavigate: (path: string) => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
      <div className="w-full bg-[#1a1a1a] rounded-t-2xl animate-slide-up">
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
          <span className="text-white font-medium">Help & Support</span>
          <button onClick={onClose} className="text-gray-400">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          <button onClick={() => onNavigate('/BybitPayDashboard/LiveChat')} className="w-full bg-[#252525] rounded-xl p-4 flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#333] rounded-full flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f7a600" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-white font-medium">FAQs</div>
                <div className="text-gray-500 text-sm">Check FAQs for quick answers</div>
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          <button onClick={() => onNavigate('/BybitPayDashboard/LiveChat')} className="w-full bg-[#252525] rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#333] rounded-full flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f7a600" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-white font-medium">Live Chat</div>
                <div className="text-gray-500 text-sm">Start live chat with our Customer Support</div>
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

export default function BybitPaySettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const navigateWithLoading = (path: string) => {
    setShowHelpModal(false);
    setLoading(true);
    setTimeout(() => router.push(path), 500);
  };

  const settingsItems = [
    { label: 'Payment Settings', path: '/BybitPayDashboard/PaymentSettings' },
    { label: 'Payment Limits', path: '/BybitPayDashboard/PaymentLimits' },
    { label: 'Payment History', path: '/BybitPayDashboard/PaymentHistory' },
    { label: 'Payment Security', path: '/BybitPayDashboard/PaymentSecurity' },
    { label: 'Help & Support', action: () => setShowHelpModal(true) },
  ];

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {loading && <LoadingSpinner />}
      <div className="sticky top-0 z-10 bg-[#0d0d0d] px-4 py-4">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="text-white p-2 -ml-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold flex-1 text-center mr-8">Bybit Pay Settings</h1>
        </div>
      </div>
      <div className="px-4 pb-8">
        {settingsItems.map((item) => (
          <button
            key={item.label}
            onClick={() => item.path ? navigateWithLoading(item.path) : item.action?.()}
            className="w-full flex items-center justify-between py-4 border-b border-gray-800/30"
          >
            <span className="text-white">{item.label}</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        ))}
      </div>
      <HelpSupportModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} onNavigate={navigateWithLoading} />
    </div>
  );
}