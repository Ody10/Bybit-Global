'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function EmailContent() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState('551070');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const urlCode = searchParams.get('code');
    if (urlCode) setCode(urlCode);

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    setCurrentTime(`${hours}:${minutes}`);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Email Header Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <button className="text-gray-600 hover:text-gray-800">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
        <div className="flex-1"></div>
        <span className="text-gray-500 text-sm">1 of 293</span>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Email Subject */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <h1 className="text-xl font-normal text-gray-900 flex items-center gap-2">
          [Bybit]Security Code for Your Bybit Account
          <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded">Inbox</span>
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </h1>
      </div>

      {/* Email Sender Info */}
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-start gap-4">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-semibold">
          B
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">Bybit</span>
            <span className="text-gray-500 text-sm">&lt;support@email-service.bybit.com&gt;</span>
          </div>
          <div className="text-gray-500 text-sm">to me ▼</div>
        </div>
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <span>{currentTime} (0 minutes ago)</span>
          <button className="p-1 hover:bg-gray-100 rounded">★</button>
          <button className="p-1 hover:bg-gray-100 rounded">😊</button>
          <button className="p-1 hover:bg-gray-100 rounded">↩</button>
          <button className="p-1 hover:bg-gray-100 rounded">⋮</button>
        </div>
      </div>

      {/* Email Content */}
      <div className="bg-white max-w-3xl mx-auto my-4 shadow-sm">
        <div className="p-8">
          {/* Bybit Logo */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold inline-block">
              <span className="text-gray-900">BYB</span>
              <span className="text-[#F7A600]">I</span>
              <span className="text-gray-900">T</span>
            </h2>
            <p className="text-sm mt-1">
              <span className="text-gray-600">#TheCryptoArk</span>
              <span className="text-gray-600"> and </span>
              <span className="text-[#F7A600]">Gateway to Web3</span>
            </p>
          </div>

          {/* Main Content */}
          <div className="text-gray-700 space-y-4">
            <p>Hello Trader,</p>
            <p>Here's your unique security code:</p>
            
            {/* Security Code */}
            <div className="text-center py-4">
              <span className="text-5xl font-bold text-[#F7A600]">{code}</span>
            </div>

            <p>
              This code will remain valid for 5 minutes and is an essential measure to ensure the 
              security of your account.
            </p>

            <p>
              For your protection, we kindly ask that you refrain from sharing this code with 
              anyone, including members of the Bybit team.
            </p>

            <p>
              If you have any questions regarding this matter, please contact our Customer 
              Support via this <a href="#" className="text-blue-600 hover:underline">form</a>.
            </p>

            <p>Regards,</p>
            <p>The Bybit Team</p>
          </div>

          {/* Warning Box */}
          <div className="mt-8 bg-gray-50 p-4 rounded-lg">
            <p className="text-[#F7A600] text-sm mb-3">
              We've recently noticed a surge in phishing attempts aimed at stealing users' passwords 
              or verification codes by directing them to fraudulent websites.
            </p>
            <p className="text-gray-600 text-sm">
              To verify the authenticity of Bybit URLs and communication sources, such as mobile 
              numbers and emails, we recommend utilizing our{' '}
              <a href="#" className="text-blue-600 hover:underline">Bybit Authenticity Check</a>
              {' '}or reaching out to our Customer Support for assistance.
            </p>
          </div>

          {/* Security Features */}
          <div className="mt-8 text-gray-600 text-sm space-y-4">
            <p>
              For added protection and peace of mind, we strongly advise visiting the{' '}
              <a href="#" className="text-blue-600 hover:underline">Account & Security page</a>
              {' '}after logging in to set up the following security features:
            </p>

            <p>
              <strong className="text-gray-900">Activate Google 2FA Authentication:</strong>
              {' '}This additional layer of security will be instrumental in safeguarding your 
              account against unauthorized access, facilitating secure logins, asset withdrawals, 
              password recovery, and management of security settings.
            </p>

            <p>
              <strong className="text-gray-900">Implement the Anti-phishing Code:</strong>
              {' '}As a proactive measure, an Anti-phishing Code will be included in all official 
              communications from Bybit. Any email purportedly from Bybit lacking this code or 
              containing an incorrect one should be treated as suspicious and reported immediately.
            </p>

            <p>
              <strong className="text-gray-900">Enable New Address Withdrawal Lock:</strong>
              {' '}By activating this feature, your account will be fortified against unauthorized 
              asset withdrawals to newly added addresses for a duration of 24 hours.
            </p>

            <p>
              <strong className="text-gray-900">Establish a Fund Password:</strong>
              {' '}Secure hassle-free withdrawals from your account by setting up a fund password, 
              ensuring an added layer of protection for your assets.
            </p>
          </div>

          {/* Divider */}
          <hr className="my-8 border-gray-200" />

          {/* Footer */}
          <div className="text-center">
            {/* Bybit Logo */}
            <h3 className="text-2xl font-bold mb-4">
              <span className="text-gray-900">BYB</span>
              <span className="text-[#F7A600]">I</span>
              <span className="text-gray-900">T</span>
            </h3>

            <p className="text-gray-500 text-sm mb-4">
              Never miss a beat on our latest product updates and events.
            </p>

            {/* Social Icons */}
            <div className="flex justify-center gap-4 mb-6">
              <a href="#" className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:opacity-80">
                <span className="text-white font-bold">𝕏</span>
              </a>
              <a href="#" className="w-10 h-10 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-full flex items-center justify-center hover:opacity-80">
                <span className="text-white">📷</span>
              </a>
              <a href="#" className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:opacity-80">
                <span className="text-white">♪</span>
              </a>
              <a href="#" className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:opacity-80">
                <span className="text-white">▶</span>
              </a>
              <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:opacity-80">
                <span className="text-white">f</span>
              </a>
              <a href="#" className="w-10 h-10 bg-[#0088cc] rounded-full flex items-center justify-center hover:opacity-80">
                <span className="text-white">✈</span>
              </a>
            </div>

            <p className="text-gray-600 text-sm mb-4">Trade on the go with Bybit</p>

            {/* App Store Buttons */}
            <div className="flex justify-center gap-4 mb-6">
              <a href="#" className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:opacity-80">
                <span className="text-xl">🍎</span>
                <div className="text-left">
                  <div className="text-xs">Download on the</div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </a>
              <a href="#" className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:opacity-80">
                <span className="text-xl">▶️</span>
                <div className="text-left">
                  <div className="text-xs">GET IT ON</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </a>
            </div>

            {/* Links */}
            <div className="space-y-2 mb-6">
              <a href="#" className="text-gray-600 text-sm underline block hover:text-gray-800">
                Latest Promotions
              </a>
              <a href="#" className="text-gray-600 text-sm underline block hover:text-gray-800">
                Help Center
              </a>
            </div>

            {/* Copyright */}
            <p className="text-gray-400 text-xs">
              Copyright ©2018 - 2025 Bybit. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SendEmailCode() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>}>
      <EmailContent />
    </Suspense>
  );
}