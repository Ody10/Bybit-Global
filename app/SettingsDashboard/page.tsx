"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sun, Globe, User, CreditCard, Shield, ShieldCheck, Diamond, DollarSign, Users, Link2, UserPlus, Copy, ChevronRight, Check, Clock, MapPin, Wallet, RefreshCw, Bell, Mail, CircleDollarSign, Palette, Moon, HelpCircle, TrendingUp, Headphones, MessageSquare, Info, HardDrive, ThumbsUp, X } from 'lucide-react';

interface UserProfile {
  uid: string;
  emailMasked: string;
  avatar: string | null;
  kycLevel: number;
  kycStatus: string;
  securityLevel: number;
  securityStatus: string;
}

export default function SettingsDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('myinfo');
  const [copied, setCopied] = useState(false);
  const [alwaysOn, setAlwaysOn] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isNavigatingToSecurity, setIsNavigatingToSecurity] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  const languages = [
    { code: 'en', name: 'English' }, { code: 'ar', name: 'العربية' }, { code: 'id', name: 'Bahasa Indonesia' },
    { code: 'es', name: 'Español' }, { code: 'pt', name: 'Português' }, { code: 'vi', name: 'Tiếng Việt' },
    { code: 'ru', name: 'Русский' }, { code: 'uk', name: 'Українська' }, { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' }, { code: 'ko', name: '한국인' }
  ];

  const mostUsedCurrencies = ['USD'];
  const otherCurrencies = ['AED', 'ARS', 'AUD', 'BDT', 'BGN', 'BHD', 'BOB', 'BRL', 'CAD', 'CHF', 'CLP', 'CNY', 'COP', 'CZK', 'DKK', 'EGP', 'EUR', 'GBP', 'GEL', 'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'JPY', 'KES', 'KRW', 'KWD', 'KZT', 'LKR', 'MAD', 'MNT', 'MXN', 'MYR', 'NGN', 'NOK', 'NZD', 'OMR', 'PEN', 'PHP', 'PKR', 'PLN', 'QAR', 'RON', 'RUB', 'SAR', 'SEK', 'TRY', 'TWD', 'UAH', 'UGX', 'UYU', 'VES', 'VND', 'ZAR'];

  useEffect(() => {
    fetchUserProfile();
    const savedLang = localStorage.getItem('preferredLanguage');
    const savedCurrency = localStorage.getItem('preferredCurrency');
    if (savedLang) setSelectedLanguage(savedLang);
    if (savedCurrency) setSelectedCurrency(savedCurrency);
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) { router.push('/Home-Login'); return; }

      const response = await fetch('/api/user/profile', { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        if (data.success) setUser(data.user);
      } else if (response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        router.push('/Home-Login');
        return;
      }
    } catch (error) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const email = parsed.email || '';
        const [name] = email.split('@');
        setUser({
          uid: parsed.uid || parsed.id || '0000000000',
          emailMasked: name.length <= 3 ? `${name[0]}***@****` : `${name.slice(0, 3)}***@****`,
          avatar: parsed.avatar,
          kycLevel: parsed.kycLevel || 0,
          kycStatus: parsed.kycStatus || 'NOT_STARTED',
          securityLevel: 1,
          securityStatus: 'Low',
        });
      }
    } finally { setLoading(false); }
  };

  const handleCopyUID = () => { if (user?.uid) { navigator.clipboard.writeText(user.uid); setCopied(true); setTimeout(() => setCopied(false), 2000); } };
  
  const handleIdentityVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setShowVerificationModal(true);
      setTimeout(() => {
        router.push('/IdentityDashboard');
      }, 2000);
    }, 1500);
  };

  const handleSecurityClick = () => {
    setIsNavigatingToSecurity(true);
    setTimeout(() => {
      router.push('/SecurityDashboard');
    }, 1500);
  };
  
  const handleLanguageSelect = (lang: string) => { setSelectedLanguage(lang); setShowLanguageModal(false); localStorage.setItem('preferredLanguage', lang); };
  const handleCurrencySelect = (curr: string) => { setSelectedCurrency(curr); setShowCurrencyModal(false); localStorage.setItem('preferredCurrency', curr); };
  const handleConfirmLogout = () => { setShowLogoutModal(false); setIsLoggingOut(true); localStorage.removeItem('auth_token'); localStorage.removeItem('user'); setTimeout(() => router.push('/profile'), 2000); };
  const getKycStatusText = () => !user ? 'Not Verified' : user.kycLevel >= 1 ? `Lv.${user.kycLevel} Verified` : user.kycStatus === 'PENDING' ? 'Pending' : 'Not Verified';
  const getSecurityBars = () => { const l = user?.securityLevel || 0; return [l >= 1 ? 'bg-[#10b981]' : 'bg-[#333]', l >= 2 ? 'bg-[#10b981]' : 'bg-[#333]', l >= 3 ? 'bg-[#10b981]' : 'bg-[#333]', l >= 4 ? 'bg-[#10b981]' : 'bg-[#333]']; };

  if (isLoggingOut || isVerifying || isNavigatingToSecurity) return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      <div className="text-4xl font-bold mb-8"><span className="text-white">BYB</span><span className="text-[#f7a600]">I</span><span className="text-white">T</span></div>
      <div className="w-10 h-10 border-[3px] border-[#f7a600] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-400 mt-4">{isLoggingOut ? 'Logging out...' : 'Loading...'}</p>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 bg-black border-b border-[#1a1a1a]">
        <div className="flex items-center px-4 py-4 gap-4"><div className="w-6 h-6 bg-[#1a1a1a] rounded animate-pulse"></div><div className="w-24 h-6 bg-[#1a1a1a] rounded animate-pulse"></div></div>
      </header>
      <div className="px-4 py-6 animate-pulse"><div className="flex items-center gap-4 mb-6"><div className="w-14 h-14 rounded-full bg-[#1a1a1a]"></div><div className="flex-1 space-y-2"><div className="h-5 bg-[#1a1a1a] rounded w-32"></div><div className="h-4 bg-[#1a1a1a] rounded w-48"></div></div></div></div>
    </div>
  );

  const securityBars = getSecurityBars();

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 bg-black border-b border-[#1a1a1a]">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4"><a href="/ProfileDashboard" className="p-2 hover:bg-[#0a0a0a] rounded-lg"><ArrowLeft className="w-6 h-6" /></a><h1 className="text-lg font-semibold">User Center</h1></div>
          <div className="flex items-center gap-3"><button className="p-2 hover:bg-[#0a0a0a] rounded-lg"><Sun className="w-5 h-5" /></button><button className="p-2 hover:bg-[#0a0a0a] rounded-lg"><Globe className="w-5 h-5" /></button></div>
        </div>
      </header>

      <div className="px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#b8c5d6] to-[#8a98ab]">
            {user?.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-white text-xl font-bold">{user?.emailMasked[0].toUpperCase() || 'U'}</span>}
          </div>
          <div className="flex-1">
            <div className="text-xl font-semibold mb-1">{user?.emailMasked || '***@****'}</div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#9ca3af]">Security level:</span>
              <span className={`font-semibold ${(user?.securityLevel || 0) >= 3 ? 'text-[#10b981]' : (user?.securityLevel || 0) >= 2 ? 'text-[#f7a600]' : 'text-[#ef4444]'}`}>{user?.securityStatus || 'Low'}</span>
              <div className="flex gap-0.5">{securityBars.map((c, i) => <div key={i} className={`w-6 h-1 ${c} rounded`}></div>)}</div>
              <ChevronRight className="w-4 h-4 text-[#71757f]" />
            </div>
            <div className="text-xs text-[#71757f] mt-1">Site: Bybit Global</div>
          </div>
        </div>

        <div className="flex gap-6 mb-6 border-b border-[#1a1a1a]">
          {['myinfo', 'preference', 'general'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-sm font-medium relative ${activeTab === tab ? 'text-white' : 'text-[#71757f]'}`}>
              {tab === 'myinfo' ? 'My info' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>}
            </button>
          ))}
        </div>

        {activeTab === 'myinfo' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between py-4 hover:bg-[#0a0a0a] rounded-lg px-2 cursor-pointer">
              <div className="flex items-center gap-3"><User className="w-5 h-5 text-[#71757f]" /><span>Profile Picture</span></div>
              <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#b8c5d6] to-[#8a98ab] flex items-center justify-center"><span className="text-white text-sm font-bold">{user?.emailMasked[0].toUpperCase() || 'U'}</span></div><ChevronRight className="w-5 h-5 text-[#71757f]" /></div>
            </div>
            <div className="flex items-center justify-between py-4 hover:bg-[#0a0a0a] rounded-lg px-2 cursor-pointer">
              <div className="flex items-center gap-3"><CreditCard className="w-5 h-5 text-[#71757f]" /><span>Nickname</span></div>
              <div className="flex items-center gap-2"><span className="text-sm text-[#9ca3af]">{user?.emailMasked || '***@****'}</span><ChevronRight className="w-5 h-5 text-[#71757f]" /></div>
            </div>
            <div className="flex items-center justify-between py-4 hover:bg-[#0a0a0a] rounded-lg px-2">
              <div className="flex items-center gap-3"><CreditCard className="w-5 h-5 text-[#71757f]" /><span>UID</span></div>
              <div className="flex items-center gap-2"><span className="text-sm text-[#9ca3af]">{user?.uid || '----------'}</span><button onClick={handleCopyUID} className="p-1 hover:bg-[#1a1a1a] rounded">{copied ? <Check className="w-4 h-4 text-[#10b981]" /> : <Copy className="w-4 h-4 text-[#71757f]" />}</button></div>
            </div>
            <div onClick={handleIdentityVerification} className="flex items-center justify-between py-4 hover:bg-[#0a0a0a] rounded-lg px-2 cursor-pointer">
              <div className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-[#71757f]" /><span>Identity Verification</span></div>
              <div className="flex items-center gap-2"><span className="text-sm text-[#9ca3af]">{getKycStatusText()}</span><ChevronRight className="w-5 h-5 text-[#71757f]" /></div>
            </div>
            <div onClick={handleSecurityClick} className="flex items-center justify-between py-4 hover:bg-[#0a0a0a] rounded-lg px-2 cursor-pointer">
              <div className="flex items-center gap-3"><Shield className="w-5 h-5 text-[#71757f]" /><span>Security</span></div>
              <ChevronRight className="w-5 h-5 text-[#71757f]" />
            </div>
            <div className="flex items-center justify-between py-4 hover:bg-[#0a0a0a] rounded-lg px-2 cursor-pointer">
              <div className="flex items-center gap-3"><Diamond className="w-5 h-5 text-[#71757f]" /><span>VIP level</span></div>
              <div className="flex items-center gap-2"><div className="flex items-center gap-1 px-2 py-0.5 bg-[#1a1a1a] rounded"><Diamond className="w-3 h-3 text-[#9ca3af]" /><span className="text-sm text-[#9ca3af]">Non-VIP</span></div><ChevronRight className="w-5 h-5 text-[#71757f]" /></div>
            </div>
            <div className="flex items-center justify-between py-4 hover:bg-[#0a0a0a] rounded-lg px-2 cursor-pointer"><div className="flex items-center gap-3"><DollarSign className="w-5 h-5 text-[#71757f]" /><span>My Fee Rates</span></div><ChevronRight className="w-5 h-5 text-[#71757f]" /></div>
            <div className="flex items-center justify-between py-4 hover:bg-[#0a0a0a] rounded-lg px-2 cursor-pointer"><div className="flex items-center gap-3"><Users className="w-5 h-5 text-[#71757f]" /><span>Subaccount</span></div><ChevronRight className="w-5 h-5 text-[#71757f]" /></div>
            <div className="flex items-center justify-between py-4 hover:bg-[#0a0a0a] rounded-lg px-2 cursor-pointer"><div className="flex items-center gap-3"><Link2 className="w-5 h-5 text-[#71757f]" /><span>Link Account</span></div><div className="flex items-center gap-2"><Link2 className="w-4 h-4 text-[#4a90e2]" /><ChevronRight className="w-5 h-5 text-[#71757f]" /></div></div>
            <div className="flex items-center justify-between py-4 hover:bg-[#0a0a0a] rounded-lg px-2 cursor-pointer"><div className="flex items-center gap-3"><UserPlus className="w-5 h-5 text-[#71757f]" /><span>Join Our Community</span></div><ChevronRight className="w-5 h-5 text-[#71757f]" /></div>
          </div>
        )}

        {activeTab === 'preference' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between py-4 hover:bg-[#0a0a0a] rounded-lg px-2 cursor-pointer"><div className="flex items-center gap-3"><Clock className="w-5 h-5 text-[#71757f]" /><span>Benchmark Time Zone</span></div><div className="flex items-center gap-2"><span className="text-sm text-[#9ca3af]">Last 24 hours</span><ChevronRight className="w-5 h-5 text-[#71757f]" /></div></div>
            <div className="flex items-center justify-between py-4 hover:bg-[#0a0a0a] rounded-lg px-2 cursor-pointer"><div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-[#71757f]" /><span>Withdrawal Address</span></div><ChevronRight className="w-5 h-5 text-[#71757f]" /></div>
            <div className="flex items-center justify-between py-4 hover:bg-[#0a0a0a] rounded-lg px-2 cursor-pointer"><div className="flex items-center gap-3"><Wallet className="w-5 h-5 text-[#71757f]" /><span>Manage Crypto Withdrawal Limits</span></div><ChevronRight className="w-5 h-5 text-[#71757f]" /></div>
            <div className="flex items-center justify-between py-4 hover:bg-[#0a0a0a] rounded-lg px-2 cursor-pointer"><div className="flex items-center gap-3"><RefreshCw className="w-5 h-5 text-[#71757f]" /><span>Switch routing</span></div><ChevronRight className="w-5 h-5 text-[#71757f]" /></div>
            <div className="flex items-center justify-between py-4 hover:bg-[#0a0a0a] rounded-lg px-2 cursor-pointer"><div className="flex items-center gap-3"><DollarSign className="w-5 h-5 text-[#71757f]" /><span>Route Deposits To</span></div><div className="flex items-center gap-2"><span className="text-sm text-[#9ca3af]">Funding Account</span><ChevronRight className="w-5 h-5 text-[#71757f]" /></div></div>
            <div className="flex items-center justify-between py-4 hover:bg-[#0a0a0a] rounded-lg px-2 cursor-pointer"><div className="flex items-center gap-3"><Bell className="w-5 h-5 text-[#71757f]" /><span>Notification Settings</span></div><ChevronRight className="w-5 h-5 text-[#71757f]" /></div>
            <div className="flex items-center justify-between py-4 hover:bg-[#0a0a0a] rounded-lg px-2 cursor-pointer"><div className="flex items-center gap-3"><Mail className="w-5 h-5 text-[#71757f]" /><span>Email Subscriptions</span></div><ChevronRight className="w-5 h-5 text-[#71757f]" /></div>
          </div>
        )}

        {activeTab === 'general' && (
          <div className="space-y-1">
            <div onClick={() => setShowLanguageModal(true)} className="flex items-center justify-between py-4 hover:bg-[#0a0a0a] rounded-lg px-2 cursor-pointer"><div className="flex items-center gap-3"><Globe className="w-5 h-5 text-[#71757f]" /><span>Language</span></div><div className="flex items-center gap-2"><span className="text-sm text-[#9ca3af]">{selectedLanguage}</span><ChevronRight className="w-5 h-5 text-[#71757f]" /></div></div>
            <div onClick={() => setShowCurrencyModal(true)} className="flex items-center justify-between py-4 hover:bg-[#0a0a0a] rounded-lg px-2 cursor-pointer"><div className="flex items-center gap-3"><CircleDollarSign className="w-5 h-5 text-[#71757f]" /><span>Currency Display</span></div><div className="flex items-center gap-2"><span className="text-sm text-[#9ca3af]">{selectedCurrency}</span><ChevronRight className="w-5 h-5 text-[#71757f]" /></div></div>
            <div className="flex items-center justify-between py-4 hover:bg-[#0a0a0a] rounded-lg px-2 cursor-pointer"><div className="flex items-center gap-3"><Sun className="w-5 h-5 text-[#71757f]" /><span>Color Preferences</span></div><div className="flex items-center gap-2"><span className="text-sm text-[#9ca3af]">Classic</span><ChevronRight className="w-5 h-5 text-[#71757f]" /></div></div>
            <div className="flex items-center justify-between py-4 hover:bg-[#0a0a0a] rounded-lg px-2 cursor-pointer"><div className="flex items-center gap-3"><Palette className="w-5 h-5 text-[#71757f]" /><span>Theme</span></div><div className="flex items-center gap-2"><div className="flex gap-1"><div className="w-4 h-4 bg-[#10b981] rounded"></div><div className="w-4 h-4 bg-[#ef4444] rounded"></div></div><ChevronRight className="w-5 h-5 text-[#71757f]" /></div></div>
            <div className="flex items-center justify-between py-4 hover:bg-[#0a0a0a] rounded-lg px-2"><div className="flex items-center gap-3"><Moon className="w-5 h-5 text-[#71757f]" /><span>Always on (no screen lock)</span></div><button onClick={() => setAlwaysOn(!alwaysOn)} className={`relative w-12 h-6 rounded-full transition-colors ${alwaysOn ? 'bg-[#10b981]' : 'bg-[#333]'}`}><div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${alwaysOn ? 'translate-x-6' : 'translate-x-0'}`}></div></button></div>
            <div className="flex items-center justify-between py-4 hover:bg-[#0a0a0a] rounded-lg px-2 cursor-pointer"><div className="flex items-center gap-3"><HelpCircle className="w-5 h-5 text-[#71757f]" /><span>Help Center</span></div><ChevronRight className="w-5 h-5 text-[#71757f]" /></div>
            <div className="flex items-center justify-between py-4 hover:bg-[#0a0a0a] rounded-lg px-2 cursor-pointer"><div className="flex items-center gap-3"><TrendingUp className="w-5 h-5 text-[#71757f]" /><span>Trade market overview</span></div><ChevronRight className="w-5 h-5 text-[#71757f]" /></div>
            <div className="flex items-center justify-between py-4 hover:bg-[#0a0a0a] rounded-lg px-2 cursor-pointer"><div className="flex items-center gap-3"><Headphones className="w-5 h-5 text-[#71757f]" /><span>Contact Support</span></div><ChevronRight className="w-5 h-5 text-[#71757f]" /></div>
            <div className="flex items-center justify-between py-4 hover:bg-[#0a0a0a] rounded-lg px-2 cursor-pointer"><div className="flex items-center gap-3"><MessageSquare className="w-5 h-5 text-[#71757f]" /><span>User feedback</span></div><ChevronRight className="w-5 h-5 text-[#71757f]" /></div>
            <div className="flex items-center justify-between py-4 hover:bg-[#0a0a0a] rounded-lg px-2 cursor-pointer"><div className="flex items-center gap-3"><Info className="w-5 h-5 text-[#71757f]" /><span>About Us</span></div><ChevronRight className="w-5 h-5 text-[#71757f]" /></div>
            <div className="flex items-center justify-between py-4 hover:bg-[#0a0a0a] rounded-lg px-2 cursor-pointer"><div className="flex items-center gap-3"><HardDrive className="w-5 h-5 text-[#71757f]" /><span>Storage management</span></div><ChevronRight className="w-5 h-5 text-[#71757f]" /></div>
            <div className="flex items-center justify-between py-4 hover:bg-[#0a0a0a] rounded-lg px-2 cursor-pointer"><div className="flex items-center gap-3"><ThumbsUp className="w-5 h-5 text-[#71757f]" /><span>Rate Our App</span></div><ChevronRight className="w-5 h-5 text-[#71757f]" /></div>
          </div>
        )}

        <div className="mt-8 mb-6 px-2">
          <button onClick={() => setShowLogoutModal(true)} className="w-full bg-transparent border border-[#2a2a2e] hover:border-[#3a3a3e] text-white font-medium py-4 rounded-xl transition-colors">Log Out</button>
        </div>
      </div>

      {showLanguageModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-black w-full h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#1a1a1a]"><button onClick={() => setShowLanguageModal(false)} className="p-2 hover:bg-[#0a0a0a] rounded-lg"><ArrowLeft className="w-6 h-6" /></button><h2 className="text-lg font-semibold">Language</h2><div className="w-10"></div></div>
            <div className="flex-1 overflow-y-auto px-4 py-4">{languages.map(lang => (<div key={lang.code} onClick={() => handleLanguageSelect(lang.name)} className="flex items-center justify-between py-4 hover:bg-[#0a0a0a] rounded-lg px-2 cursor-pointer"><span>{lang.name}</span>{selectedLanguage === lang.name && <Check className="w-5 h-5 text-white" />}</div>))}</div>
          </div>
        </div>
      )}

      {showCurrencyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-black w-full rounded-t-3xl" style={{ maxHeight: '60vh' }}>
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#1a1a1a]"><h2 className="text-lg font-semibold">Select a Currency</h2><button onClick={() => setShowCurrencyModal(false)} className="p-2 hover:bg-[#0a0a0a] rounded-lg"><X className="w-5 h-5" /></button></div>
            <div className="overflow-y-auto px-4 py-4" style={{ maxHeight: 'calc(60vh - 60px)' }}>
              <div className="mb-4"><h3 className="text-sm text-[#71757f] mb-3">Most Used</h3><div className="grid grid-cols-3 gap-2">{mostUsedCurrencies.map(c => (<button key={c} onClick={() => handleCurrencySelect(c)} className={`py-3 rounded-lg text-sm font-medium transition-colors ${selectedCurrency === c ? 'bg-white text-black' : 'bg-[#1a1a1a] text-white hover:bg-[#252525]'}`}>{c}</button>))}</div></div>
              <div><h3 className="text-sm text-[#71757f] mb-3">More</h3><div className="grid grid-cols-3 gap-2">{otherCurrencies.map(c => (<button key={c} onClick={() => handleCurrencySelect(c)} className={`py-3 rounded-lg text-sm font-medium transition-colors ${selectedCurrency === c ? 'bg-white text-black' : 'bg-[#1a1a1a] text-white hover:bg-[#252525]'}`}>{c}</button>))}</div></div>
            </div>
          </div>
        </div>
      )}

      {showVerificationModal && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="relative mb-8">
              <div className="w-16 h-1 bg-[#333] rounded-full mb-1"></div>
              <div className="w-16 h-1 bg-[#f7a600] rounded-full mb-1"></div>
              <div className="w-16 h-1 bg-[#333] rounded-full"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-[#f7a600] rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="text-white text-base">Start verification...</p>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-[#1a1a1a] w-full rounded-t-3xl">
            <div className="px-6 pt-6 pb-4">
              <p className="text-center text-[#9ca3af] text-base mb-6">Confirm Logout?</p>
              <button onClick={handleConfirmLogout} className="w-full bg-[#2a2a2e] hover:bg-[#3a3a3e] text-white font-medium py-4 rounded-xl transition-colors mb-3">Confirm</button>
              <button onClick={() => setShowLogoutModal(false)} className="w-full bg-transparent text-white font-medium py-4 rounded-xl transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}