'use client';

import React, { useState, useCallback } from 'react';
import RegisterVerifyEmailModal from '@/components/RegisterVerifyEmailModal';
import RegisterCreatePasswordModal from '@/components/RegisterCreatePasswordModal';
import { useRouter } from 'next/navigation';

type RegistrationStep = 'email' | 'verify' | 'password' | 'success';

interface RegisterSuccessData {
  token: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    phoneNumber: string | null;
    referralCode: string | null;
    myReferralCode: string | null;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    createdAt: string;
  };
  wallets: Array<{
    chain: string;
    network: string;
    currency: string;
    address: string;
    balance: number;
  }>;
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<RegistrationStep>('email');
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [registrationToken, setRegistrationToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<RegisterSuccessData | null>(null);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    console.log('Moving to verify step');
    setStep('verify');
  };

  // Handle verification success - move to password step
  const handleVerifySuccess = useCallback((token: string) => {
    console.log('handleVerifySuccess called with token:', token ? 'token received' : 'no token');
    setRegistrationToken(token);
    console.log('Setting step to password');
    setStep('password');
  }, []);

  // Handle registration success
  const handleRegisterSuccess = useCallback((data: RegisterSuccessData) => {
    console.log('handleRegisterSuccess called');
    setSuccessData(data);
    setStep('success');
    
    setTimeout(() => {
      router.push('/');
    }, 3000);
  }, [router]);

  // Go back to email step
  const handleModifyEmail = useCallback(() => {
    console.log('Modifying email, going back to email step');
    setStep('email');
    setRegistrationToken('');
  }, []);

  // Close verify modal - go back to email
  const handleCloseVerify = useCallback(() => {
    console.log('Closing verify modal');
    setStep('email');
  }, []);

  // Close password modal - go back to verify
  const handleClosePassword = useCallback(() => {
    console.log('Closing password modal');
    setStep('verify');
  }, []);

  // Debug: Log current step
  console.log('Current step:', step);

  return (
    <div className="min-h-screen bg-[#0d0d0e] flex flex-col">
      {/* Logo - always visible when on email step */}
      {step === 'email' && (
        <>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-4xl font-bold">
              <span className="text-white">BYB</span>
              <span className="text-[#f7a600]">I</span>
              <span className="text-white">T</span>
            </div>
          </div>

          {/* Email Entry Form */}
          <div className="bg-[#121214] rounded-t-3xl">
            <div className="px-4 py-6">
              <h2 className="text-xl font-semibold text-white mb-2">Sign Up</h2>
              <p className="text-gray-400 text-sm mb-6">
                Create your account to start trading
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleEmailSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    placeholder="Enter your email"
                    className="w-full bg-[#1a1a1c] border border-[#2a2a2e] rounded-lg px-4 py-4 text-white placeholder-gray-500 focus:border-[#f7a600] focus:outline-none"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-400 text-sm mb-2">
                    Referral Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="Enter referral code"
                    maxLength={8}
                    className="w-full bg-[#1a1a1c] border border-[#2a2a2e] rounded-lg px-4 py-4 text-white placeholder-gray-500 focus:border-[#f7a600] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!email}
                  className={`w-full py-4 rounded-lg text-base font-semibold transition-colors ${
                    email
                      ? 'bg-[#f7a600] text-black hover:bg-[#e69900]'
                      : 'bg-[#1a1a1c] border border-[#2a2a2e] text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Continue
                </button>
              </form>

              <p className="text-gray-500 text-sm text-center mt-6">
                Already have an account?{' '}
                <a href="/login" className="text-[#f7a600] hover:underline">
                  Log In
                </a>
              </p>
            </div>
          </div>
        </>
      )}

      {/* Verify Email Modal */}
      <RegisterVerifyEmailModal
        isOpen={step === 'verify'}
        onClose={handleCloseVerify}
        onSuccess={handleVerifySuccess}
        email={email}
        onModifyEmail={handleModifyEmail}
      />

      {/* Create Password Modal */}
      <RegisterCreatePasswordModal
        isOpen={step === 'password'}
        onClose={handleClosePassword}
        onSuccess={handleRegisterSuccess}
        email={email}
        registrationToken={registrationToken}
        referralCode={referralCode}
      />

      {/* Success Screen */}
      {step === 'success' && successData && (
        <div className="fixed inset-0 z-50 bg-[#0d0d0e] flex flex-col items-center justify-center px-4">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Account Created!</h2>
          <p className="text-gray-400 text-center mb-2">
            Welcome to Bybit
          </p>
          <p className="text-[#f7a600] text-lg font-mono mb-6">
            UID: {successData.user.id}
          </p>

          <div className="w-full max-w-md bg-[#121214] rounded-xl p-4 mb-6">
            <h3 className="text-white font-semibold mb-3">Your Wallet Addresses</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {successData.wallets.slice(0, 8).map((wallet, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-[#2a2a2e] last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{wallet.chain}</span>
                    <span className="text-gray-500 text-xs">({wallet.network})</span>
                  </div>
                  <span className="text-gray-400 text-xs font-mono truncate max-w-[180px]">
                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                  </span>
                </div>
              ))}
              {successData.wallets.length > 8 && (
                <p className="text-gray-500 text-xs text-center pt-2">
                  +{successData.wallets.length - 8} more wallets
                </p>
              )}
            </div>
          </div>

          <p className="text-gray-500 text-sm">Redirecting to dashboard...</p>
          <div className="w-6 h-6 border-2 border-[#f7a600] border-t-transparent rounded-full animate-spin mt-2"></div>
        </div>
      )}
    </div>
  );
}