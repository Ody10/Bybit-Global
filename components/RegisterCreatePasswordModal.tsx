'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, EyeOff, Check, Circle } from 'lucide-react';

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

interface RegisterCreatePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: RegisterSuccessData) => void;
  email: string;
  registrationToken: string;
  referralCode?: string;
}

interface PasswordRequirement {
  label: string;
  check: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: '8-30 Characters', check: (p) => p.length >= 8 && p.length <= 30 },
  { label: 'At least one lowercase letter', check: (p) => /[a-z]/.test(p) },
  { label: 'At least one uppercase letter', check: (p) => /[A-Z]/.test(p) },
  { label: 'At least one number', check: (p) => /[0-9]/.test(p) },
];

const RegisterCreatePasswordModal: React.FC<RegisterCreatePasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  email,
  registrationToken,
  referralCode,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug: Log when isOpen changes
  useEffect(() => {
    console.log('RegisterCreatePasswordModal - isOpen changed to:', isOpen);
    console.log('RegisterCreatePasswordModal - email:', email);
    console.log('RegisterCreatePasswordModal - registrationToken:', registrationToken ? 'exists' : 'missing');
  }, [isOpen, email, registrationToken]);

  const allRequirementsMet = passwordRequirements.every((req) => req.check(password));

  const handleSubmit = async () => {
    if (!allRequirementsMet || isLoading) return;

    console.log('RegisterCreatePasswordModal - Submitting registration...');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          registrationToken,
          referralCode: referralCode || undefined,
        }),
      });

      const data = await response.json();
      console.log('RegisterCreatePasswordModal - Register response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      // Store the token in localStorage for authentication
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      console.log('RegisterCreatePasswordModal - Calling onSuccess');
      onSuccess(data);
    } catch (err) {
      console.error('RegisterCreatePasswordModal - Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && allRequirementsMet && !isLoading) {
      handleSubmit();
    }
  };

  // Debug: Always log render
  console.log('RegisterCreatePasswordModal rendering - isOpen:', isOpen);

  if (!isOpen) {
    console.log('RegisterCreatePasswordModal - NOT rendering (isOpen is false)');
    return null;
  }

  console.log('RegisterCreatePasswordModal - RENDERING MODAL');

  return (
    <div className="fixed inset-0 z-[60] bg-[#0d0d0e] flex flex-col">
      {/* Top Section with Logo */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-4xl font-bold">
          <span className="text-white">BYB</span>
          <span className="text-[#f7a600]">I</span>
          <span className="text-white">T</span>
        </div>
      </div>

      {/* Bottom Sheet Style Modal */}
      <div className="bg-[#121214] rounded-t-3xl">
        {/* Header */}
        <div className="flex items-center px-4 py-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-white hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="flex-1 text-center text-xl font-semibold text-white pr-6">
            Create Password
          </h2>
        </div>

        {/* Content */}
        <div className="px-4 pb-8">
          <p className="text-gray-400 text-sm mb-4">
            Set a login password to complete your sign-up.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-500 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Password Input */}
          <div className="relative mb-4">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              onKeyPress={handleKeyPress}
              placeholder="Enter password"
              disabled={isLoading}
              autoFocus
              className="w-full bg-[#1a1a1c] border border-[#2a2a2e] rounded-lg px-4 py-4 pr-12 text-white placeholder-gray-500 focus:border-[#f7a600] focus:outline-none transition-colors disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Password Requirements */}
          <div className="space-y-2 mb-6">
            {passwordRequirements.map((req, index) => {
              const isMet = req.check(password);
              return (
                <div key={index} className="flex items-center gap-2">
                  {isMet ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-500" />
                  )}
                  <span className={`text-sm ${isMet ? 'text-green-500' : 'text-gray-400'}`}>
                    {req.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Sign Up Button */}
          <button
            onClick={handleSubmit}
            disabled={!allRequirementsMet || isLoading}
            className={`w-full py-4 rounded-lg text-base font-semibold transition-all duration-200 ${
              allRequirementsMet && !isLoading
                ? 'bg-[#f7a600] text-black hover:bg-[#e69900]'
                : 'bg-[#1a1a1c] border border-[#2a2a2e] text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Account...</span>
              </div>
            ) : (
              'Sign Up Now'
            )}
          </button>

          {/* Terms notice */}
          <p className="text-gray-500 text-xs text-center mt-4">
            By signing up, you agree to our{' '}
            <a href="/terms" className="text-[#f7a600] hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-[#f7a600] hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterCreatePasswordModal;