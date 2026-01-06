'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface VerifyEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (code: string) => void;
  email: string;
  onModifyEmail: () => void;
}

const VerifyEmailModal: React.FC<VerifyEmailModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  email,
  onModifyEmail,
}) => {
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setCode(['', '', '', '', '', '']);
      setCountdown(45);
      setCanResend(false);
      // Focus first input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, canResend]);

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if all digits are filled
    const fullCode = newCode.join('');
    if (fullCode.length === 6) {
      onSuccess(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];
    
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }
    
    setCode(newCode);

    if (pastedData.length === 6) {
      onSuccess(pastedData);
    } else {
      inputRefs.current[pastedData.length]?.focus();
    }
  };

  const handleResend = () => {
    if (!canResend) return;
    setCountdown(45);
    setCanResend(false);
    setCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    // Here you would trigger the API to resend the code
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
            Verify Your Email
          </h2>
        </div>

        {/* Content */}
        <div className="px-4 pb-8">
          <p className="text-gray-400 text-sm mb-1">A 6-digit code has been sent to:</p>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white text-sm">{email}</span>
            <button
              onClick={onModifyEmail}
              className="text-bybit-yellow text-sm hover:underline flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Modify
            </button>
          </div>
          <p className="text-gray-400 text-sm mb-6">
            Your verification code is valid for five (5) minutes.
          </p>

          {/* Code Input Boxes */}
          <div className="flex justify-between gap-2 mb-6" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-14 h-14 text-center text-2xl font-semibold bg-bybit-dark border border-bybit-border rounded-lg text-white focus:border-bybit-yellow focus:outline-none transition-colors"
              />
            ))}
          </div>

          {/* Resend Button */}
          <button
            onClick={handleResend}
            disabled={!canResend}
            className={`w-full py-4 rounded-lg text-base font-medium transition-colors mb-4 ${
              canResend
                ? 'bg-bybit-yellow text-black hover:bg-yellow-500'
                : 'bg-bybit-dark border border-bybit-border text-gray-500 cursor-not-allowed'
            }`}
          >
            {canResend ? 'Resend' : `${formatTime(countdown)} Resend`}
          </button>

          {/* Didn't receive email link */}
          <button className="w-full text-center text-gray-400 text-sm hover:text-white transition-colors flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Didn't receive email
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailModal;