'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Loading Spinner Component
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

// Save QR Code Modal
function SaveQRCodeModal({ 
  isOpen, 
  onClose, 
  theme, 
  setTheme,
  userEmail,
  bybitId 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  userEmail: string;
  bybitId: string;
}) {
  if (!isOpen) return null;

  const handleSaveQRCode = () => {
    alert('QR Code saved to gallery!');
  };

  const handleShareQRCode = () => {
    alert('Share QR Code');
  };

  return (
    <div className="fixed inset-0 bg-[#0d0d0d]/95 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <span className="text-white font-medium text-lg">Save QR Code</span>
        <button 
          onClick={onClose} 
          className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* QR Card Container */}
        <div className="w-full max-w-[320px] relative">
          {/* Main Card */}
          <div className={`rounded-2xl overflow-hidden relative ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-[#f7a600]'}`}>
            {/* Decorative Corner Elements - Top Left */}
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              <div className={`w-6 h-[2px] ${theme === 'dark' ? 'bg-[#f7a600]' : 'bg-white'}`}></div>
              <div className={`w-[2px] h-5 ${theme === 'dark' ? 'bg-[#f7a600]' : 'bg-white'}`}></div>
            </div>
            {/* Decorative Corner Elements - Top Right */}
            <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
              <div className={`w-6 h-[2px] ${theme === 'dark' ? 'bg-[#f7a600]' : 'bg-white'}`}></div>
              <div className={`w-[2px] h-5 ml-auto ${theme === 'dark' ? 'bg-[#f7a600]' : 'bg-white'}`}></div>
            </div>
            {/* Decorative Corner Elements - Bottom Left */}
            <div className="absolute bottom-[88px] left-3 flex flex-col gap-1">
              <div className={`w-[2px] h-5 ${theme === 'dark' ? 'bg-[#f7a600]' : 'bg-white'}`}></div>
              <div className={`w-6 h-[2px] ${theme === 'dark' ? 'bg-[#f7a600]' : 'bg-white'}`}></div>
            </div>
            {/* Decorative Corner Elements - Bottom Right */}
            <div className="absolute bottom-[88px] right-3 flex flex-col gap-1 items-end">
              <div className={`w-[2px] h-5 ml-auto ${theme === 'dark' ? 'bg-[#f7a600]' : 'bg-white'}`}></div>
              <div className={`w-6 h-[2px] ${theme === 'dark' ? 'bg-[#f7a600]' : 'bg-white'}`}></div>
            </div>

            {/* Header - BYBIT PAY Logo */}
            <div className="pt-6 pb-4 text-center">
              <span className={`font-bold text-2xl tracking-wide ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                BYB<span className={theme === 'dark' ? 'text-[#f7a600]' : 'text-white'}>I</span>T
              </span>
              <span className={`ml-2 text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-black/70'}`}>PAY</span>
            </div>
            
            {/* QR Code Section */}
            <div className={`mx-5 mb-5 p-5 rounded-xl ${theme === 'dark' ? 'bg-[#252525]' : 'bg-white'}`}>
              <p className={`text-center text-sm mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Scan with the Bybit App to pay
              </p>
              
              {/* QR Code */}
              <div className="flex justify-center mb-4">
                <div className="bg-white p-2 rounded-lg relative">
                  <Image
                    src="/images/bybit-qr.png"
                    alt="QR Code"
                    width={160}
                    height={160}
                    className="w-40 h-40"
                  />
                  {/* Center Logo */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center shadow-sm">
                      <span className="text-[10px] font-bold text-black">BYBIT</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* User Email */}
              <p className={`text-center text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                {userEmail}
              </p>
            </div>

            {/* Footer Banner */}
            <div className={`px-5 py-4 ${theme === 'dark' ? 'bg-gradient-to-r from-[#8B6914] via-[#6d5210] to-[#3d2e0a]' : 'bg-[#e69500]'}`}>
              <p className={`font-semibold text-base ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Life is Paid Bit Bybit
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-black/70'}`}>
                Unlock the future of payments today!
              </p>
            </div>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center gap-1 mt-6 bg-[#252525] rounded-full p-1">
          <button
            onClick={() => setTheme('dark')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              theme === 'dark' ? 'bg-[#3d3d3d] text-white' : 'text-gray-500'
            }`}
          >
            Dark
          </button>
          <button
            onClick={() => setTheme('light')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              theme === 'light' ? 'bg-[#3d3d3d] text-white' : 'text-gray-500'
            }`}
          >
            Light
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-20 mt-10">
          <button onClick={handleSaveQRCode} className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <span className="text-gray-400 text-xs">Save QR Code</span>
          </button>
          <button onClick={handleShareQRCode} className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </div>
            <span className="text-gray-400 text-xs">Share QR Code</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Share To Modal
function ShareToModal({ 
  isOpen, 
  onClose,
  userEmail,
}: { 
  isOpen: boolean; 
  onClose: () => void;
  userEmail: string;
}) {
  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://bybit.com/pay/${userEmail}`);
    alert('Link copied!');
  };

  const handleTelegram = () => {
    window.open('https://t.me/share/url?url=https://bybit.com/pay', '_blank');
  };

  const handleWhatsapp = () => {
    window.open('https://wa.me/?text=Pay me via Bybit Pay', '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
      <div className="w-full bg-[#1a1a1a] rounded-t-2xl animate-slide-up">
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
          <span className="text-white font-medium">Share to</span>
          <button onClick={onClose} className="text-gray-400">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* QR Preview Card */}
        <div className="p-4">
          <div className="bg-[#1a1a1a] border border-[#f7a600] rounded-2xl p-4">
            <div className="text-center mb-2">
              <span className="font-bold text-xl text-white">BYB<span className="text-[#f7a600]">I</span>T</span>
              <span className="ml-1 text-gray-400">PAY</span>
            </div>
            <p className="text-center text-sm text-white mb-3">Scan with the Bybit App to pay</p>
            <div className="flex justify-center mb-3">
              <div className="w-32 h-32 bg-white p-2 rounded-lg">
                <Image
                  src="/images/bybit-qr.png"
                  alt="QR Code"
                  width={128}
                  height={128}
                  className="w-full h-full"
                />
              </div>
            </div>
            <p className="text-center text-sm text-white">{userEmail}</p>
            <div className="mt-4 bg-gradient-to-r from-[#8B6914] to-[#4a3d1a] rounded-lg p-3">
              <p className="font-semibold text-white">Life is Paid Bit Bybit</p>
              <p className="text-sm text-gray-300">Unlock the future of payments today!</p>
            </div>
          </div>
        </div>

        {/* Share Options */}
        <div className="flex items-center justify-around py-6 px-4">
          <button onClick={handleCopy} className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-[#333] rounded-full flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <span className="text-white text-xs">Copy</span>
          </button>
          <button onClick={handleTelegram} className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-[#0088cc] rounded-full flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
            </div>
            <span className="text-white text-xs">Telegram</span>
          </button>
          <button onClick={handleWhatsapp} className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <span className="text-white text-xs">Whatsapp</span>
          </button>
          <button className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-[#333] rounded-full flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
            </div>
            <span className="text-white text-xs">More</span>
          </button>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default function BybitPayDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSaveQRModal, setShowSaveQRModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [qrTheme, setQrTheme] = useState<'dark' | 'light'>('dark');
  
  const userEmail = 'ais***@****';
  const bybitId = '408053641';

  const navigateWithLoading = (path: string) => {
    setLoading(true);
    setTimeout(() => {
      router.push(path);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {loading && <LoadingSpinner />}
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0d0d0d] px-4 py-4">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="text-white p-2 -ml-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">Receive</h1>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigateWithLoading('/BybitPayDashboard/PaymentHistory')}
              className="text-gray-400"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M3 10h18" />
              </svg>
            </button>
            <button 
              onClick={() => navigateWithLoading('/BybitPayDashboard/SendToBybitUser')}
              className="text-gray-400"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8M8 12h8" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 pb-8">
        {/* QR Code Card */}
        <div className="bg-[#1a1a1a] rounded-2xl p-6 mb-4">
          {/* User Info */}
          <div className="text-center mb-4">
            <p className="text-white font-medium">{userEmail}</p>
            <div className="flex items-center justify-center gap-1 text-gray-500 text-sm">
              <span>{bybitId}(Bybit ID)</span>
              <button className="text-gray-400">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
              </button>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-xl relative">
              <Image
                src="/images/bybit-qr.png"
                alt="QR Code"
                width={180}
                height={180}
                className="w-44 h-44"
              />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-10 h-10 bg-[#f7a600] rounded-full flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="black">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-white mb-4">Pay me via this QR code</p>

          {/* Set Amount Button */}
          <div className="flex justify-center mb-4">
            <button
              onClick={() => navigateWithLoading('/BybitPayDashboard/SetAmount')}
              className="flex items-center gap-2 px-6 py-2 border border-gray-600 rounded-full text-white hover:bg-gray-800 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span>Set amount</span>
            </button>
          </div>

          {/* Save & Share Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowSaveQRModal(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-600 rounded-xl text-white hover:bg-gray-800 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              <span>Save QR Code</span>
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-600 rounded-xl text-white hover:bg-gray-800 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
              </svg>
              <span>Share Link</span>
            </button>
          </div>
        </div>

        {/* Split Bill */}
        <button
          onClick={() => navigateWithLoading('/BybitPayDashboard/SplitBill')}
          className="w-full bg-[#1a1a1a] rounded-2xl p-4 flex items-center justify-between mb-6 hover:bg-[#252525] transition-colors"
        >
          <div className="flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            <span className="text-white">Split bill</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        {/* Visit Bybit Pay */}
        <button
          onClick={() => navigateWithLoading('/BybitPayDashboard/VisitBybitPay')}
          className="w-full flex items-center justify-center gap-2 text-gray-400 py-4 hover:text-white transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
          </svg>
          <span>Visit Bybit Pay</span>
        </button>
      </div>

      {/* Modals */}
      <SaveQRCodeModal
        isOpen={showSaveQRModal}
        onClose={() => setShowSaveQRModal(false)}
        theme={qrTheme}
        setTheme={setQrTheme}
        userEmail={userEmail}
        bybitId={bybitId}
      />

      <ShareToModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        userEmail={userEmail}
      />
    </div>
  );
}