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

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const user = {
    username: 'User3641QDeUdM',
    email: true,
    sms: true,
    identityVerified: true,
    deposit: false,
    completedOrders: 0,
    completionRate: 0,
    avgReleaseTime: 0,
    avgPaymentTime: 0,
  };

  const navigateWithLoading = (path: string) => {
    setLoading(true);
    setTimeout(() => router.push(path), 500);
  };

  const menuItems = [
    { icon: '🎫', label: 'P2P Coupon', action: '' },
    { icon: '💳', label: 'Payment Method', action: 'Add', highlight: true },
    { icon: '👤', label: 'Advertiser', action: 'Apply Now', highlight: true },
    { icon: '👍', label: 'Leave A Review', action: '0%' },
    { icon: '🔔', label: 'Manage Notifications', action: '' },
    { icon: '👥', label: 'Following', action: '' },
    { icon: '🚫', label: 'Manage the Blacklist', action: '' },
  ];

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white pb-20">
      {loading && <LoadingSpinner />}
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0d0d0d] px-4 py-4">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </button>
          <button className="text-gray-400">Help & Support</button>
        </div>
      </div>

      <div className="px-4">
        {/* User Info Card */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-[#f7a600] rounded-full flex items-center justify-center text-black text-2xl font-bold">
              U
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-lg">{user.username}</span>
                <button className="text-gray-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className={`flex items-center gap-1 ${user.email ? 'text-[#22c55e]' : 'text-gray-500'}`}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /></svg>
                  Email
                </span>
                <span className={`flex items-center gap-1 ${user.sms ? 'text-[#22c55e]' : 'text-gray-500'}`}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /></svg>
                  SMS
                </span>
                <span className={`flex items-center gap-1 ${user.identityVerified ? 'text-[#22c55e]' : 'text-gray-500'}`}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /></svg>
                  Identity Verification
                </span>
                <span className={`flex items-center gap-1 ${user.deposit ? 'text-[#22c55e]' : 'text-gray-500'}`}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /></svg>
                  Deposit
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Completed Order(s) in 30 Days</span>
              <span className="text-white">{user.completedOrders} Order(s)</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Completion Rate Within 30 Days</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="text-gray-500" /></svg>
              </div>
              <span className="text-white">{user.completionRate} %</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Avg. Release Time</span>
              <span className="text-white">{user.avgReleaseTime} Minute(s)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Avg. Payment Time</span>
              <span className="text-white">{user.avgPaymentTime} Minute(s)</span>
            </div>
          </div>

          <button className="text-gray-400 text-sm flex items-center gap-1">
            More Data
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>

        {/* Menu Items */}
        <div className="space-y-1">
          {menuItems.map((item, index) => (
            <button key={index} className="w-full flex items-center justify-between py-4 border-b border-gray-800/30">
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-white">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.action && (
                  <span className={item.highlight ? 'text-[#f7a600]' : 'text-gray-500'}>
                    {item.action}
                  </span>
                )}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><path d="M9 18l6-6-6-6" /></svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0d0d0d] border-t border-gray-800 flex justify-around py-3">
        <button onClick={() => navigateWithLoading('/P2P-Dashboard')} className="flex flex-col items-center gap-1 text-gray-400">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          <span className="text-xs">P2P</span>
        </button>
        <button onClick={() => navigateWithLoading('/P2P-Dashboard/Orders')} className="flex flex-col items-center gap-1 text-gray-400">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
          <span className="text-xs">Orders</span>
        </button>
        <button onClick={() => navigateWithLoading('/P2P-Dashboard/Ads')} className="flex flex-col items-center gap-1 text-gray-400">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>
          <span className="text-xs">Ads</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#f7a600]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          <span className="text-xs">Profile</span>
        </button>
      </div>
    </div>
  );
}
