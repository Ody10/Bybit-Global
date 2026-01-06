'use client';

import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Check, Circle } from 'lucide-react';

interface CreatePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  isLoading: boolean;
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

const CreatePasswordModal: React.FC<CreatePasswordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const allRequirementsMet = passwordRequirements.every((req) => req.check(password));

  const handleSubmit = () => {
    if (allRequirementsMet && !isLoading) {
      onSubmit(password);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-bybit-dark">
      {/* Bybit Logo */}
      <div className="flex justify-center pt-16 pb-8">
        <div className="text-4xl font-bold">
          <span className="text-white">BYB</span>
          <span className="text-bybit-yellow">I</span>
          <span className="text-white">T</span>
        </div>
      </div>

      {/* Bottom Sheet Style Modal */}
      <div className="fixed bottom-0 left-0 right-0 bg-bybit-dark-2 rounded-t-3xl">
        {/* Header */}
        <div className="flex items-center px-4 py-4">
          <button
            onClick={onClose}
            className="p-2 text-white hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="flex-1 text-center text-xl font-semibold text-white pr-10">
            Create Password
          </h2>
        </div>

        {/* Content */}
        <div className="px-4 pb-8">
          <p className="text-gray-400 text-sm mb-4">
            Set a login password to complete your sign-up.
          </p>

          {/* Password Input */}
          <div className="relative mb-4">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full bg-bybit-dark border border-bybit-border rounded-lg px-4 py-4 pr-12 text-white placeholder-gray-500 focus:border-bybit-yellow focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
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
                ? 'bg-bybit-yellow text-black hover:bg-yellow-500'
                : 'bg-bybit-dark border border-bybit-border text-gray-500 cursor-not-allowed'
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
        </div>
      </div>
    </div>
  );
};

export default CreatePasswordModal;