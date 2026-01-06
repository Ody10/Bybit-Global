"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomeSignup() {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState({
    name: 'Andorra',
    code: '+376',
    flag: '/flags/andorra.png'
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col">
      {/* Logo */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold tracking-wider mb-2">
            BYB<span className="text-yellow-500">!</span>T
          </h1>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="px-6 pb-8">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="mb-8 text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Question */}
        <h2 className="text-2xl font-semibold mb-6">Where do you live?</h2>

        {/* Country Selector */}
        <button
          onClick={() => router.push('/Country-list-Account')}
          className="w-full bg-gray-800 hover:bg-gray-750 rounded-lg px-4 py-4 mb-4 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3">
            <img 
              src={selectedCountry.flag} 
              alt={selectedCountry.name}
              className="w-6 h-6 rounded-sm object-cover"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Crect fill="%23666" width="24" height="24"/%3E%3C/svg%3E';
              }}
            />
            <span className="text-white font-medium">{selectedCountry.name}</span>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Create Account Button */}
        <button
          onClick={() => router.push('/Home-Register-Account')}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-full py-4 mb-3 flex items-center justify-center gap-2 transition-colors"
        >
          Create Account
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>

        {/* Login Button */}
        <button
          onClick={() => router.push('/Home-Login')}
          className="w-full bg-transparent border border-gray-600 hover:border-gray-500 text-white font-semibold rounded-full py-4 transition-colors"
        >
          Login Now
        </button>
      </div>
    </div>
  );
}