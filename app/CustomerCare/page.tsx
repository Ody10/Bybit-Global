//app/CustomerCare/page.tsx
'use client';

import React, { useState } from 'react';
import { ArrowLeft, Globe, Power, ChevronRight, Shield, FileText, AlertCircle, Lock, RefreshCw, MessageCircle, Headphones } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CustomerCarePage() {
  const router = useRouter();
  // ✅ FIXED: Added type annotation to allow both number and null
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const faqCategories = [
    {
      title: 'Event & Bonus',
      questions: [
        "Why Haven't I Received my TON, XRP, A, XLM Deposit?",
        "Check my Case Status"
      ]
    },
    {
      title: 'Account & Identity Verification',
      questions: [
        "How can I Check my P2P Appeal Status",
        "I Want to Report the Seller for Using a Third-Party Payment",
        "The Buyer Used a Third-Party Account for Payment, Which I've Refunded. Please Cancel th..."
      ]
    },
    {
      title: 'P2P Trading',
      questions: [
        "Why Can't I Register on Bybit?"
      ]
    },
    {
      title: 'Trading',
      questions: []
    },
    {
      title: 'Deposit & Withdrawal',
      questions: []
    }
  ];

  const selfServiceOptions = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'P2P Order Dispute',
      description: 'Dispute a P2P Order here',
      link: '/p2p-dispute'
    },
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: 'Update KYC',
      description: 'Update your account KYC information',
      link: '/update-kyc'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Report Stolen Funds',
      description: 'Report unauthorized fund movements here',
      link: '/report-funds'
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'Support Hub',
      description: 'One-Stop Hub for Support Cases, Chats, and Alerts',
      link: '/support-hub'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-black z-50 border-b border-gray-900">
        <div className="flex items-center justify-between px-4 py-4">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-900 rounded-full transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-900 rounded-full transition">
              <Globe className="w-6 h-6" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-900 rounded-full transition">
              <Power className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* 24/7 Support Banner */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
            <Headphones className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-lg font-bold">24/7 Dedicated Support</h1>
            <p className="text-xs text-gray-400">
              Hello there! I'm Bybot, how can I assist you today?{' '}
              <span className="text-orange-500 font-semibold">Log In</span>
            </p>
          </div>
        </div>
      </div>

      {/* Lock Account Card */}
      <div className="px-4 mb-6">
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-5">
          <div className="flex items-start gap-3 mb-4">
            <Shield className="w-6 h-6 text-white mt-1" />
            <div className="flex-1">
              <h3 className="font-bold text-base mb-2">Lock Account</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                If you detect suspicious or unauthorized logins, you can temporarily deactivate your Bybit account by clicking the button below.
              </p>
            </div>
          </div>
          <button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-semibold py-3.5 rounded-full hover:from-orange-600 hover:to-yellow-600 transition">
            View Details
          </button>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">FAQs</h2>
          <button className="flex items-center text-orange-500 text-sm font-semibold">
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-900 rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3 text-gray-400">You might be looking for</h3>
            <div className="space-y-2">
              {faqCategories.slice(0, 3).map((category, idx) => (
                <button
                  key={idx}
                  onClick={() => setExpandedSection(expandedSection === idx ? null : idx)}
                  className="w-full text-left"
                >
                  <div className="text-xs text-gray-300 font-medium py-2 hover:text-white transition">
                    {category.title}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Expandable FAQ Questions */}
          <div className="space-y-2">
            {faqCategories[1].questions.map((question, idx) => (
              <button
                key={idx}
                className="w-full bg-gray-900 hover:bg-gray-800 rounded-xl p-4 text-left transition"
              >
                <p className="text-xs text-gray-300 leading-relaxed">{question}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Self-Service Section */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Self-Service</h2>
          <button className="flex items-center text-orange-500 text-sm font-semibold">
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {selfServiceOptions.map((option, idx) => (
            <button
              key={idx}
              className="bg-gray-900 hover:bg-gray-800 rounded-xl p-4 transition text-left"
            >
              <div className="mb-3 text-orange-500">
                {option.icon}
              </div>
              <h3 className="text-sm font-semibold mb-1">{option.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Start Asking Button */}
      <div className="px-4 mb-6">
        <button className="w-full bg-transparent border border-gray-700 text-white font-semibold py-4 rounded-full hover:border-gray-600 transition flex items-center justify-center gap-2">
          <Headphones className="w-5 h-5" />
          Start Asking
        </button>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-900 px-2 py-2">
        <div className="flex items-center justify-around">
          <button 
            onClick={() => router.push('/')}
            className="flex flex-col items-center gap-1 px-3 py-2 text-gray-500 hover:text-white transition"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span className="text-xs">Home</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 px-3 py-2 text-gray-500 hover:text-white transition">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <span className="text-xs">Markets</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 px-3 py-2 text-gray-500 hover:text-white transition">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <span className="text-xs">Trade</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 px-3 py-2 text-gray-500 hover:text-white transition">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
            <span className="text-xs">Futures</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 px-3 py-2 text-gray-500 hover:text-white transition">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
            <span className="text-xs">Assets</span>
          </button>
        </div>
      </nav>
    </div>
  );
}