//app/IdentityDashboard/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowLeft, HelpCircle, Headphones, MoreVertical, ShieldAlert } from 'lucide-react';

const IdentityDashboard = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('standard');
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = () => {
    setIsLoading(true);
    // Simulate loading before navigation
    setTimeout(() => {
      // In a real app, this would navigate to /app/Proof-Of-Identity/page.tsx
      window.location.href = '/Proof-Of-Identity';
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <button onClick={() => router.push('/SettingsDashboard')} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex gap-3">
          <button className="p-2">
            <HelpCircle className="w-6 h-6" />
          </button>
          <button className="p-2">
            <Headphones className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-md mx-auto">
        {/* Identity Card */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-6 mb-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="bg-gray-600 rounded-lg p-4">
                <div className="w-12 h-12 bg-gray-500 rounded-full"></div>
              </div>
              <div className="space-y-1">
                <div className="h-2 w-24 bg-gray-500 rounded"></div>
                <div className="h-2 w-16 bg-gray-500 rounded"></div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-gray-400" />
            </div>
            <span className="text-lg font-semibold">Identity Unverified</span>
          </div>
          <span className="text-gray-400 text-sm">Standard</span>
        </div>

        {/* Personal Details */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Personal details</h2>
            <button onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>

          <div className="bg-gray-900 rounded-2xl divide-y divide-gray-800">
            <div className="flex justify-between items-center p-4">
              <span className="text-gray-400">Name</span>
              <span className="text-white">{showDetails ? '****' : '****'}</span>
            </div>
            <div className="flex justify-between items-center p-4">
              <span className="text-gray-400">Document ID</span>
              <span className="text-white">{showDetails ? '****' : '**** **** ****'}</span>
            </div>
            <div className="flex justify-between items-center p-4">
              <span className="text-gray-400">Country/Region of Issue</span>
              <span className="text-white">{showDetails ? '****' : '********'}</span>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button className="flex-1 bg-gray-900 text-white py-4 rounded-full font-medium hover:bg-gray-800 transition-colors">
              Update
            </button>
            <button className="bg-gray-900 text-white p-4 rounded-full hover:bg-gray-800 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Level and Limits */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">My level and limits</h2>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('standard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'standard'
                  ? 'bg-gray-800 text-white'
                  : 'bg-transparent text-gray-400'
              }`}
            >
              {activeTab === 'standard' && (
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                  <path d="M13.5 4L6 11.5L2.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              Standard
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'advanced'
                  ? 'bg-gray-800 text-white'
                  : 'bg-transparent text-gray-400'
              }`}
            >
              Advanced
            </button>
          </div>

          {/* Limits Content */}
          <div className="bg-gray-900 rounded-2xl divide-y divide-gray-800">
            {activeTab === 'standard' ? (
              <>
                <div className="flex justify-between items-center p-4">
                  <span className="text-gray-300">Daily crypto withdrawal</span>
                  <span className="text-white">≤ 5000 USDT</span>
                </div>
                <div className="flex justify-between items-center p-4">
                  <span className="text-gray-300">Daily fiat deposit</span>
                  <span className="text-white">≤ 2500 USD</span>
                </div>
                <div className="flex justify-between items-center p-4">
                  <span className="text-gray-300">Daily fiat withdrawal</span>
                  <span className="text-white">≤ 2500 USD</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center p-4">
                  <span className="text-gray-300">Daily crypto withdrawal</span>
                  <span className="text-white">≤ 5000 USDT</span>
                </div>
                <div className="flex justify-between items-center p-4">
                  <span className="text-gray-300">Daily fiat deposit</span>
                  <span className="text-white">≤ 3000 USD</span>
                </div>
                <div className="flex justify-between items-center p-4">
                  <span className="text-gray-300">Daily fiat withdrawal</span>
                  <span className="text-white">≤ 3000 USD</span>
                </div>
                <div className="p-4">
                  <div className="text-gray-400 text-sm mb-3">To unlock the next level</div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-white">Proof of Address</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={isLoading}
          className="w-full bg-white text-black py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
              <span>Verifying...</span>
            </>
          ) : (
            'Verify'
          )}
        </button>
      </div>
    </div>
  );
};

export default IdentityDashboard;