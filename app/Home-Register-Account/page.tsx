'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import BybitLoader from '@/components/BybitLoader';
import PuzzleModal from '@/components/PuzzleModal';
import RegisterVerifyEmailModal from '@/components/RegisterVerifyEmailModal';
import RegisterCreatePasswordModal from '@/components/RegisterCreatePasswordModal';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Registration steps
type RegistrationStep = 
  | 'initial'
  | 'checking-email'
  | 'loading-puzzle'
  | 'puzzle'
  | 'loading-verify'
  | 'verify-email'
  | 'create-password'
  | 'loading-complete'
  | 'success';

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

export default function HomeRegisterAccount() {
  const router = useRouter();
  
  // Form state
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [showReferralInput, setShowReferralInput] = useState(false);
  
  // Validation state
  const [emailError, setEmailError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  
  // Registration flow state
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('initial');
  const [registrationToken, setRegistrationToken] = useState('');
  const [successData, setSuccessData] = useState<RegisterSuccessData | null>(null);

  // Validate email format
  const validateEmailFormat = (value: string) => {
    if (!value) {
      return 'Email is required';
    }
    if (!EMAIL_REGEX.test(value)) {
      return 'Invalid email address';
    }
    return '';
  };

  // Handle email change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    if (emailTouched) {
      setEmailError(validateEmailFormat(value));
    }
  };

  // Handle email blur
  const handleEmailBlur = () => {
    setEmailTouched(true);
    setEmailError(validateEmailFormat(email));
  };

  // Check if email is already registered
  const checkEmailExists = async (emailToCheck: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailToCheck }),
      });

      const data = await response.json();

      if (data.exists) {
        setEmailError('Email Already Registered. Please Login');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking email:', error);
      setEmailError('Error checking email. Please try again.');
      return true; // Prevent registration on error
    }
  };

  // Handle Sign Up button click
  const handleSignUpClick = async () => {
    // Validate email format
    const formatError = validateEmailFormat(email);
    setEmailTouched(true);
    setEmailError(formatError);

    if (formatError) {
      return;
    }

    if (!agreedToTerms) {
      return;
    }

    // Show loading while checking email
    setCurrentStep('checking-email');

    // Check if email already exists in database
    const emailExists = await checkEmailExists(email);

    if (emailExists) {
      setCurrentStep('initial');
      return;
    }

    // Start the registration flow
    setCurrentStep('loading-puzzle');
    
    // Show loader for 1.5 seconds, then show puzzle
    setTimeout(() => {
      setCurrentStep('puzzle');
    }, 1500);
  };

  // Handle puzzle success
  const handlePuzzleSuccess = () => {
    setCurrentStep('loading-verify');
    
    // Show loader briefly, then show verification modal
    setTimeout(() => {
      setCurrentStep('verify-email');
    }, 1500);
  };

  // Handle puzzle close
  const handlePuzzleClose = () => {
    setCurrentStep('initial');
  };

  // Handle verification success - receives registration token from API
  const handleVerificationSuccess = (token: string) => {
    console.log('Verification successful, token received:', token ? 'yes' : 'no');
    setRegistrationToken(token);
    setCurrentStep('create-password');
  };

  // Handle verify email close
  const handleVerifyEmailClose = () => {
    setCurrentStep('initial');
  };

  // Handle modify email
  const handleModifyEmail = () => {
    setCurrentStep('initial');
    setEmailTouched(false);
    setEmailError('');
  };

  // Handle registration success - receives full user data from API
  const handleRegisterSuccess = (data: RegisterSuccessData) => {
    console.log('Registration successful:', data);
    setSuccessData(data);
    setCurrentStep('success');
    
    // Navigate to dashboard after showing success
    setTimeout(() => {
      router.push('/BybitDashboard');
    }, 3000);
  };

  // Handle password modal close
  const handlePasswordClose = () => {
    setCurrentStep('verify-email');
  };

  // Render loader screens
  if (currentStep === 'checking-email' || currentStep === 'loading-puzzle' || currentStep === 'loading-verify' || currentStep === 'loading-complete') {
    return <BybitLoader fullScreen />;
  }

  // Render Success Screen
  if (currentStep === 'success' && successData) {
    return (
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
    );
  }

  // Render Verify Email full-screen modal
  if (currentStep === 'verify-email') {
    return (
      <RegisterVerifyEmailModal
        isOpen={true}
        onClose={handleVerifyEmailClose}
        onSuccess={handleVerificationSuccess}
        email={email}
        onModifyEmail={handleModifyEmail}
      />
    );
  }

  // Render Create Password full-screen modal
  if (currentStep === 'create-password') {
    return (
      <RegisterCreatePasswordModal
        isOpen={true}
        onClose={handlePasswordClose}
        onSuccess={handleRegisterSuccess}
        email={email}
        registrationToken={registrationToken}
        referralCode={referralCode}
      />
    );
  }

  // Render Puzzle Modal
  if (currentStep === 'puzzle') {
    return (
      <>
        <div className="min-h-screen bg-[#0d0d0e] flex flex-col">
          {/* Top Section with Logo */}
          <div className="flex-1 flex items-center justify-center py-8">
            <div className="text-4xl font-bold">
              <span className="text-white">BYB</span>
              <span className="text-[#f7a600]">I</span>
              <span className="text-white">T</span>
            </div>
          </div>

          {/* Bottom Sheet Style Form */}
          <div className="bg-[#121214] rounded-t-3xl">
            {/* Header with Back Arrow and Login Now */}
            <div className="flex items-center justify-between px-4 py-4">
              <button
                onClick={() => setCurrentStep('initial')}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={() => router.push('/Home-Login')}
                className="text-[#f7a600] text-sm font-medium hover:opacity-80 transition-opacity"
              >
                Login Now
              </button>
            </div>

            {/* Form Content */}
            <div className="px-4 pb-8">
              <p className="text-center text-gray-400">Verifying you're human...</p>
            </div>
          </div>
        </div>

        {/* Puzzle Modal Overlay */}
        <PuzzleModal
          isOpen={true}
          onClose={handlePuzzleClose}
          onSuccess={handlePuzzleSuccess}
        />
      </>
    );
  }

  // Main Registration Form (initial state)
  return (
    <div className="min-h-screen bg-[#0d0d0e] flex flex-col">
      {/* Top Section with Logo */}
      <div className="flex-1 flex items-center justify-center py-8">
        <div className="text-4xl font-bold">
          <span className="text-white">BYB</span>
          <span className="text-[#f7a600]">I</span>
          <span className="text-white">T</span>
        </div>
      </div>

      {/* Bottom Sheet Style Form */}
      <div className="bg-[#121214] rounded-t-3xl">
        {/* Header with Back Arrow and Login Now */}
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => router.back()}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={() => router.push('/Home-Login')}
            className="text-[#f7a600] text-sm font-medium hover:opacity-80 transition-opacity"
          >
            Login Now
          </button>
        </div>

        {/* Form Content */}
        <div className="px-4 pb-8">
          {/* Title */}
          <h1 className="text-2xl font-semibold text-white mb-2">Create a Bybit account</h1>
          
          {/* Bybit Global with icon */}
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-6">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span>Bybit Global</span>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>

          {/* Email/Mobile Number Label */}
          <label className="text-white text-sm mb-2 block">Email/Mobile Number</label>
          
          {/* Email Input */}
          <div className="mb-4">
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              placeholder="Enter email/mobile (without code)"
              className={`w-full bg-[#1a1a1c] border rounded-lg px-4 py-4 text-white placeholder-gray-500 focus:outline-none transition-colors ${
                emailError && emailTouched
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-[#2a2a2e] focus:border-[#f7a600]'
              }`}
            />
            {emailError && emailTouched && (
              <p className="text-red-500 text-sm mt-2">{emailError}</p>
            )}
          </div>

          {/* Referral Code Dropdown */}
          <button
            onClick={() => setShowReferralInput(!showReferralInput)}
            className="flex items-center gap-1 text-gray-400 text-sm mb-4 hover:text-white transition-colors"
          >
            <span>Referral Code (Optional)</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showReferralInput ? 'rotate-180' : ''}`} />
          </button>

          {/* Referral Code Input (Collapsible) */}
          {showReferralInput && (
            <div className="mb-4">
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Enter referral code"
                className="w-full bg-[#1a1a1c] border border-[#2a2a2e] rounded-lg px-4 py-4 text-white placeholder-gray-500 focus:border-[#f7a600] focus:outline-none transition-colors"
              />
            </div>
          )}

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3 mb-6">
            <button
              onClick={() => setAgreedToTerms(!agreedToTerms)}
              className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                agreedToTerms
                  ? 'bg-[#f7a600] border-[#f7a600]'
                  : 'border-gray-500 bg-transparent'
              }`}
            >
              {agreedToTerms && (
                <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <p className="text-gray-400 text-sm leading-relaxed">
              I have read and agree to the Bybit's{' '}
              <span className="text-white">Terms of Service</span> and{' '}
              <span className="text-white">Privacy Policy</span>
            </p>
          </div>

          {/* Sign Up Button - Yellow like Bybit */}
          <button
            onClick={handleSignUpClick}
            className="w-full bg-[#f7a600] text-black font-semibold py-4 rounded-lg hover:bg-[#e69900] transition-colors mb-6"
          >
            Sign Up Now
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[#2a2a2e]"></div>
            <span className="text-gray-500 text-sm">Or Sign Up With</span>
            <div className="flex-1 h-px bg-[#2a2a2e]"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="flex gap-4">
            {/* Google Button */}
            <button className="flex-1 flex items-center justify-center gap-2 bg-[#1a1a1c] border border-[#2a2a2e] rounded-full py-3 hover:border-gray-500 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-white text-sm">Google</span>
            </button>

            {/* Telegram Button */}
            <button className="flex-1 flex items-center justify-center gap-2 bg-[#1a1a1c] border border-[#2a2a2e] rounded-full py-3 hover:border-gray-500 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#29A9EB">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
              <span className="text-white text-sm">Telegram</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}