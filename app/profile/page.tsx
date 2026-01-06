'use client';

import React from 'react';
import { ArrowLeft, Headphones, Settings, ChevronRight, CreditCard, Gift, TrendingUp, Repeat, Award, Grid } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();

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
            <button 
              onClick={() => router.push('/CustomerCare')}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-900 rounded-full transition"
            >
              <Headphones className="w-6 h-6" />
            </button>
            <button 
              onClick={() => router.push('/Home-Settings')}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-900 rounded-full transition"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="px-4 pt-8 pb-6">
        <h1 className="text-3xl font-bold mb-2">Welcome to Bybit!</h1>
        <p className="text-gray-400 text-sm">Sign up to get rewards!</p>
      </div>

      {/* Action Buttons */}
      <div className="px-4 mb-6">
        <div className="flex gap-3">
          <button 
            onClick={() => router.push('/Home-Login')}
            className="flex-1 bg-transparent border-2 border-gray-700 text-white font-semibold py-3.5 rounded-full hover:border-gray-600 transition"
          >
            Login Now
          </button>
          <button 
            onClick={() => router.push('/Home-Register-Account')}
            className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-semibold py-3.5 rounded-full hover:from-orange-600 hover:to-yellow-600 transition"
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Cards Section */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          {/* Bybit Card */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="w-6 h-6 text-yellow-500" />
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </div>
            <h3 className="font-semibold text-base mb-1">Bybit Card</h3>
            <p className="text-xs text-gray-400">Apply Now</p>
          </div>

          {/* Rewards Hub */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <Gift className="w-6 h-6 text-yellow-500" />
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </div>
            <h3 className="font-semibold text-base mb-1">Rewards Hub</h3>
            <p className="text-xs text-gray-400">Welcome Gift</p>
          </div>
        </div>
      </div>

      {/* Trending Services */}
      <div className="px-4 mb-6">
        <h2 className="text-base font-semibold mb-4 text-gray-400">Trending services</h2>
        <div className="grid grid-cols-3 gap-4">
          {/* Bybit Earn */}
          <button className="flex flex-col items-center gap-2 p-4 bg-gray-900 hover:bg-gray-800 rounded-xl transition">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-black" />
            </div>
            <span className="text-xs text-gray-300 text-center">Bybit Earn</span>
          </button>

          {/* P2P Trading */}
          <button className="flex flex-col items-center gap-2 p-4 bg-gray-900 hover:bg-gray-800 rounded-xl transition">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <Repeat className="w-6 h-6 text-black" />
            </div>
            <span className="text-xs text-gray-300 text-center">P2P Trading</span>
          </button>

          {/* Rewards Hub */}
          <button className="flex flex-col items-center gap-2 p-4 bg-gray-900 hover:bg-gray-800 rounded-xl transition">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-black" />
            </div>
            <span className="text-xs text-gray-300 text-center">Rewards Hub</span>
          </button>
        </div>
      </div>

      {/* All Services Button */}
      <div className="px-4 mb-6">
        <button className="w-full bg-transparent border border-gray-700 text-white font-semibold py-3.5 rounded-full hover:border-gray-600 transition flex items-center justify-center gap-2">
          All Services
        </button>
      </div>

      {/* Bottom Links */}
      <div className="px-4 space-y-3 mb-6">
        {/* Bybit Lite */}
        <button className="w-full bg-gray-900 hover:bg-gray-800 rounded-xl p-4 transition flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-black font-bold text-lg">
              B
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-sm">Bybit Lite</h3>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-500" />
        </button>

        {/* About Us */}
        <button className="w-full bg-gray-900 hover:bg-gray-800 rounded-xl p-4 transition flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-left">
              <h3 className="font-semibold text-sm">About Us</h3>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-500" />
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
          
          <button className="flex flex-col items-center gap-1 px-3 py-2 text-yellow-500">
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