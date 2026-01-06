'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';

interface RegisterVerifyEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (registrationToken: string) => void;
  email: string;
  onModifyEmail: () => void;
}

const RegisterVerifyEmailModal: React.FC<RegisterVerifyEmailModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  email,
  onModifyEmail,
}) => {
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const hasInitialized = useRef(false);

  // Send verification code when modal opens (only once)
  useEffect(() => {
    if (isOpen && email && !hasInitialized.current) {
      hasInitialized.current = true;
      sendVerificationCode();
    }
    
    if (!isOpen) {
      hasInitialized.current = false;
      setCodeSent(false);
      setCountdown(60);
      setCanResend(false);
      setError(null);
      setCode(['', '', '', '', '', '']);
    }
  }, [isOpen, email]);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen && codeSent) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen, codeSent]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || !codeSent || canResend) return;

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
  }, [isOpen, codeSent, canResend]);

  const sendVerificationCode = async () => {
    if (isSending) return;
    
    setIsSending(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          type: 'EMAIL_VERIFICATION',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }

      setCodeSent(true);
      setCountdown(60);
      setCanResend(false);
      console.log('Verification code sent successfully');
    } catch (err) {
      console.error('Error sending code:', err);
      setError(err instanceof Error ? err.message : 'Failed to send verification code');
    } finally {
      setIsSending(false);
    }
  };

  const verifyCode = useCallback(async (fullCode: string) => {
    if (isVerifying) return;
    
    setIsVerifying(true);
    setError(null);

    try {
      console.log('Verifying code:', fullCode);
      
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: fullCode,
          type: 'EMAIL_VERIFICATION',
        }),
      });

      const data = await response.json();
      console.log('Verify response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code');
      }

      // Success! Pass the registration token to parent
      console.log('Verification successful, calling onSuccess with token');
      onSuccess(data.registrationToken);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid verification code';
      console.error('Verification error:', errorMessage);
      setError(errorMessage);
      // Clear the code inputs on error
      setCode(['', '', '', '', '', '']);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } finally {
      setIsVerifying(false);
    }
  }, [email, isVerifying, onSuccess]);

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if all digits are filled
    const fullCode = newCode.join('');
    if (fullCode.length === 6 && !newCode.includes('')) {
      verifyCode(fullCode);
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
    const newCode = ['', '', '', '', '', ''];
    
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }
    
    setCode(newCode);
    setError(null);

    if (pastedData.length === 6) {
      verifyCode(pastedData);
    } else {
      inputRefs.current[pastedData.length]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend || isSending) return;
    
    setCode(['', '', '', '', '', '']);
    setError(null);
    setCanResend(false);
    setCountdown(60);
    
    await sendVerificationCode();
    
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0d0e] flex flex-col">
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
            className="text-white hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="flex-1 text-center text-xl font-semibold text-white pr-6">
            Verify Your Email
          </h2>
        </div>

        {/* Content */}
        <div className="px-4 pb-8">
          {isSending && !codeSent ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-10 h-10 border-3 border-[#f7a600] border-t-transparent rounded-full animate-spin mb-4"></div>
              <span className="text-gray-400">Sending verification code...</span>
            </div>
          ) : (
            <>
              <p className="text-gray-400 text-sm mb-1">A 6-digit code has been sent to:</p>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white text-sm font-medium">{email}</span>
                <button
                  onClick={onModifyEmail}
                  className="text-[#f7a600] text-sm hover:opacity-80 flex items-center gap-1"
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

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-500 text-sm text-center">{error}</p>
                </div>
              )}

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
                    disabled={isVerifying}
                    className={`w-12 h-14 sm:w-14 sm:h-14 text-center text-2xl font-semibold bg-[#1a1a1c] border rounded-lg text-white focus:border-[#f7a600] focus:outline-none transition-colors ${
                      error ? 'border-red-500' : 'border-[#2a2a2e]'
                    } ${isVerifying ? 'opacity-50' : ''}`}
                  />
                ))}
              </div>

              {/* Verifying indicator */}
              {isVerifying && (
                <div className="flex items-center justify-center mb-4">
                  <div className="w-5 h-5 border-2 border-[#f7a600] border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2 text-gray-400 text-sm">Verifying...</span>
                </div>
              )}

              {/* Resend Button */}
              <button
                onClick={handleResend}
                disabled={!canResend || isSending}
                className={`w-full py-4 rounded-lg text-base font-medium transition-colors mb-4 ${
                  canResend && !isSending
                    ? 'bg-[#f7a600] text-black hover:bg-[#e69900]'
                    : 'bg-[#1a1a1c] border border-[#2a2a2e] text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSending ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </div>
                ) : canResend ? (
                  'Resend Code'
                ) : (
                  `Resend in ${formatTime(countdown)}`
                )}
              </button>

              {/* Didn't receive email link */}
              <button className="w-full text-center text-gray-400 text-sm hover:text-white transition-colors flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Didn't receive email?
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterVerifyEmailModal;