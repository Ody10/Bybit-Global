"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Headphones, HelpCircle, Copy, CheckCircle, ChevronRight, CreditCard, Gift, Settings, Check } from 'lucide-react';

interface UserProfile {
  uid: string;
  email: string;
  emailMasked: string;
  phoneNumber: string | null;
  phoneNumberMasked: string | null;
  name: string | null;
  avatar: string | null;
  isEmailVerified: boolean;
  kycStatus: string;
  kycLevel: number;
  securityLevel: number;
  securityStatus: string;
}

export default function ProfileDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        // Not logged in, show guest view
        setLoading(false);
        return;
      }

      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
        }
      } else if (response.status === 401) {
        // Token expired, clear and show guest view
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Try localStorage fallback
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser({
            uid: parsed.uid || parsed.id,
            email: parsed.email,
            emailMasked: maskEmail(parsed.email),
            phoneNumber: parsed.phoneNumber,
            phoneNumberMasked: parsed.phoneNumber ? maskPhone(parsed.phoneNumber) : null,
            name: parsed.name,
            avatar: parsed.avatar,
            isEmailVerified: parsed.isEmailVerified,
            kycStatus: parsed.kycStatus || 'NOT_STARTED',
            kycLevel: parsed.kycLevel || 0,
            securityLevel: 1,
            securityStatus: 'Low',
          });
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  };

  const maskEmail = (email: string): string => {
    if (!email) return '***@****';
    const [name] = email.split('@');
    if (name.length <= 3) {
      return `${name[0]}***@****`;
    }
    return `${name.slice(0, 3)}***@****`;
  };

  const maskPhone = (phone: string): string => {
    if (!phone) return '****';
    if (phone.length <= 4) return '****';
    return `${phone.slice(0, 2)}****${phone.slice(-2)}`;
  };

  const handleCopyUID = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getKycStatusText = () => {
    if (!user) return 'Not Verified';
    if (user.kycLevel >= 1) return 'Verified';
    if (user.kycStatus === 'PENDING') return 'Pending';
    return 'Not Verified';
  };

  const getVipStatus = () => {
    // In production, this would be based on user's trading volume
    return 'Non-VIP';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] text-white">
        <header className="sticky top-0 z-50 bg-[#000000]">
          <div className="flex items-center justify-between px-4 py-4">
            <a href="/BybitDashboard" className="p-2 hover:bg-[#0a0a0a] rounded-lg">
              <ArrowLeft className="w-6 h-6" />
            </a>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-[#1a1a1a] rounded animate-pulse"></div>
              <div className="w-5 h-5 bg-[#1a1a1a] rounded animate-pulse"></div>
              <div className="w-5 h-5 bg-[#1a1a1a] rounded animate-pulse"></div>
            </div>
          </div>
        </header>
        <main className="px-4 py-2 max-w-md mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center gap-4 mb-6 bg-[#0a0a0a] rounded-2xl p-4">
              <div className="w-16 h-16 rounded-full bg-[#1a1a1a]"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-[#1a1a1a] rounded w-32"></div>
                <div className="h-4 bg-[#1a1a1a] rounded w-48"></div>
                <div className="h-4 bg-[#1a1a1a] rounded w-24"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Not logged in state
  if (!user) {
    return (
      <div className="min-h-screen bg-[#000000] text-white">
        <header className="sticky top-0 z-50 bg-[#000000]">
          <div className="flex items-center justify-between px-4 py-4">
            <a href="/BybitDashboard" className="p-2 hover:bg-[#0a0a0a] rounded-lg">
              <ArrowLeft className="w-6 h-6" />
            </a>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-[#0a0a0a] rounded-lg">
                <Headphones className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-[#0a0a0a] rounded-lg">
                <HelpCircle className="w-5 h-5" />
              </button>
              <a href="/SettingsDashboard" className="p-2 hover:bg-[#0a0a0a] rounded-lg">
                <Settings className="w-5 h-5" />
              </a>
            </div>
          </div>
        </header>
        <main className="px-4 py-2 max-w-md mx-auto">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#4a5568] to-[#2d3748] flex items-center justify-center mb-4">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-[#a0aec0]">
                <circle cx="12" cy="8" r="4" fill="currentColor" />
                <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Welcome to Bybit</h2>
            <p className="text-[#9ca3af] text-center mb-6">Log in or sign up to access your account</p>
            <div className="flex gap-3 w-full max-w-xs">
              <a 
                href="/Home-Login"
                className="flex-1 bg-[#f7a600] text-black font-semibold py-3 rounded-lg text-center hover:bg-[#e69500] transition-colors"
              >
                Login Now
              </a>
              <a 
                href="/Home-Register-Account"
                className="flex-1 bg-[#1a1a1a] text-white font-semibold py-3 rounded-lg text-center hover:bg-[#252525] transition-colors"
              >
                Sign Up
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#000000]">
        <div className="flex items-center justify-between px-4 py-4">
          <a href="/BybitDashboard" className="p-2 hover:bg-[#0a0a0a] rounded-lg">
            <ArrowLeft className="w-6 h-6" />
          </a>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-[#0a0a0a] rounded-lg">
              <Headphones className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-[#0a0a0a] rounded-lg">
              <HelpCircle className="w-5 h-5" />
            </button>
            <a href="/SettingsDashboard" className="p-2 hover:bg-[#0a0a0a] rounded-lg">
              <Settings className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-2 max-w-md mx-auto">
        {/* Profile Section */}
        <div className="flex items-center justify-between mb-6 bg-[#0a0a0a] rounded-2xl p-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#4a5568] to-[#2d3748] flex-shrink-0">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-2xl font-bold">
                  {user.emailMasked[0].toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-lg font-semibold mb-1">{user.emailMasked}</div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-[#71757f]">UID: {user.uid}</span>
                  <button onClick={handleCopyUID} className="hover:opacity-80">
                    {copied ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3 text-[#71757f]" />
                    )}
                  </button>
                </div>
                <span className="text-xs text-[#71757f]">Site: Bybit Glo...</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                  user.kycLevel >= 1 ? 'bg-[#1a1a1a] text-white' : 'bg-[#1a1a1a] text-[#9ca3af]'
                }`}>
                  {user.kycLevel >= 1 && <CheckCircle className="w-3 h-3" />}
                  <span className="font-medium">{getKycStatusText()}</span>
                </div>
                <div className="px-2 py-1 bg-[#1a1a1a] rounded text-xs text-[#9ca3af] font-medium">
                  {getVipStatus()}
                </div>
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#71757f] flex-shrink-0 ml-2" />
        </div>

        {/* VIP Journey Card */}
        <div className="bg-[#0a0a0a] rounded-2xl p-5 mb-4">
          <h2 className="text-base font-semibold mb-2">Embark on Your VIP Journey</h2>
          <p className="text-sm text-[#9ca3af] mb-4">
            Deposit <span className="text-white font-semibold">50,000</span> USDT to unlock a VIP 1 trial and enjoy exclusive perks!
          </p>
          <div className="text-xs text-[#71757f] mb-4">Deposited: $0</div>
          <div className="flex items-center justify-between mb-4">
            <button className="flex items-center gap-1 text-sm text-[#9ca3af] hover:text-white">
              VIP Benefits
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={() => router.push('/CoinDepositDashboard')}
            className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-lg hover:bg-yellow-400 transition-colors"
          >
            Deposit Now
          </button>
        </div>

        {/* Bybit Card & Rewards Hub */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#0a0a0a] rounded-2xl p-4 hover:bg-[#151515] cursor-pointer transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div className="text-base font-semibold mb-1">Bybit Card</div>
            <div className="text-xs text-[#71757f]">Apply Now</div>
          </div>
          <div className="bg-[#0a0a0a] rounded-2xl p-4 hover:bg-[#151515] cursor-pointer transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div className="text-base font-semibold mb-1">Rewards Hub</div>
            <div className="text-xs text-[#71757f]">Check Now</div>
          </div>
        </div>

        {/* All Services Button */}
        <div className="flex justify-center mb-6">
          <button className="px-8 py-2.5 bg-[#0a0a0a] rounded-full text-sm font-medium hover:bg-[#151515] transition-colors border border-[#1a1a1a]">
            All Services
          </button>
        </div>

        {/* Bottom Links */}
        <div className="grid grid-cols-2 gap-3 pb-6">
          <button className="bg-[#0a0a0a] rounded-xl py-4 flex items-center justify-center gap-2 hover:bg-[#151515] transition-colors">
            <span className="text-sm font-medium">Bybit Lite</span>
            <ChevronRight className="w-4 h-4 text-[#71757f]" />
          </button>
          <button className="bg-[#0a0a0a] rounded-xl py-4 flex items-center justify-center gap-2 hover:bg-[#151515] transition-colors">
            <span className="text-sm font-medium">About Us</span>
            <ChevronRight className="w-4 h-4 text-[#71757f]" />
          </button>
        </div>
      </main>
    </div>
  );
}