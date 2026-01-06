'use client';

import React, { useEffect, useState } from 'react';
import { 
  useNotifications, 
  ToastNotification, 
  getNotificationIcon, 
  getNotificationColor,
  NotificationType 
} from './NotificationProvider';

// Configuration for the toast notifications
export const TOAST_CONFIG = {
  // App logo - update this path to your logo
  logoUrl: '/logo.png', // Default logo path
  logoAlt: 'App Logo',
  brandName: 'Bybit',
  // Set to true to show logo, false to show emoji icons
  showLogo: true,
};

// Individual Toast Component
interface ToastItemProps {
  notification: ToastNotification;
  onDismiss: (id: string) => void;
  index: number;
}

function ToastItem({ notification, onDismiss, index }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const [logoError, setLogoError] = useState(false);

  const icon = getNotificationIcon(notification.type);
  const color = getNotificationColor(notification.type);

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const startTime = Date.now();
      const duration = notification.duration;

      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remaining);

        if (remaining > 0) {
          requestAnimationFrame(updateProgress);
        }
      };

      requestAnimationFrame(updateProgress);
    }
  }, [notification.duration]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300);
  };

  // Get title based on notification type (token name or category)
  const getNotificationTitle = (): string => {
    if (notification.token) {
      return notification.token;
    }
    switch (notification.type) {
      case 'DEPOSIT_PENDING':
      case 'DEPOSIT_CONFIRMED':
        return 'Deposit';
      case 'WITHDRAWAL_REQUEST':
      case 'WITHDRAWAL_SUCCESS':
      case 'WITHDRAWAL_FAILED':
        return 'Withdrawal';
      case 'SECURITY':
        return 'Security';
      case 'SYSTEM':
      default:
        return 'Notification';
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className={`
        toast-item
        transform transition-all duration-300 ease-out
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
      style={{
        marginBottom: '12px',
        animation: isExiting ? 'none' : 'slideInRight 0.3s ease-out',
      }}
    >
      <div
        className="rounded-2xl shadow-2xl overflow-hidden"
        style={{
          width: '400px',
          maxWidth: 'calc(100vw - 32px)',
          background: 'linear-gradient(135deg, rgba(30, 40, 80, 0.95) 0%, rgba(25, 35, 70, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Main Content - Bybit Style Layout */}
        <div className="flex items-start gap-3 p-4">
          {/* App Logo */}
          <div 
            className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center"
            style={{ 
              backgroundColor: '#1a1a1e',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
          >
            {TOAST_CONFIG.showLogo && !logoError ? (
              <img 
                src={TOAST_CONFIG.logoUrl} 
                alt={TOAST_CONFIG.logoAlt}
                className="w-full h-full object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              // Fallback: Bybit-style text logo
              <div className="flex items-center justify-center w-full h-full bg-[#1a1a1e]">
                <span className="text-xs font-bold">
                  <span className="text-white">BYB</span>
                  <span className="text-[#f7a600]">I</span>
                  <span className="text-white">T</span>
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header Row */}
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-white font-bold text-base">
                {getNotificationTitle()}
              </h4>
              <span className="text-[#f7a600] text-sm font-medium">
                {formatTimeAgo(notification.createdAt)}
              </span>
            </div>

            {/* Message */}
            <p className="text-[#a0b4d0] text-sm leading-relaxed">
              {notification.message}
            </p>

            {/* Amount Badge (if applicable) */}
            {notification.amount && notification.token && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg" 
                style={{ backgroundColor: 'rgba(247, 166, 0, 0.15)' }}
              >
                <span className="text-[#f7a600] font-bold text-sm">
                  {notification.amount} {notification.token}
                </span>
                {notification.chain && (
                  <span className="text-[#a0b4d0] text-xs">
                    • {notification.chain}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-[#6b7c9a] hover:text-white transition-colors p-1 -mt-1 -mr-1"
            aria-label="Dismiss"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* View Transaction Button (if txUrl exists) */}
        {notification.metadata?.txUrl && (
          <div className="px-4 pb-4">
            <a
              href={notification.metadata.txUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#f7a600] hover:bg-[#e09500] text-black font-semibold text-sm rounded-xl transition-colors"
            >
              View Transaction
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5.5 2.5H2.5V11.5H11.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M8.5 2.5H11.5V5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M11.5 2.5L6.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </a>
          </div>
        )}

        {/* Progress Bar */}
        {notification.duration && notification.duration > 0 && (
          <div className="h-1 bg-[rgba(255,255,255,0.1)]">
            <div
              className="h-full transition-all duration-100 ease-linear"
              style={{
                width: `${progress}%`,
                backgroundColor: '#f7a600',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Main Toast Container Component
export function NotificationToast() {
  const { toasts, dismissToast } = useNotifications();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <>
      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>

      {/* Toast Container */}
      <div
        className="fixed z-[9999] pointer-events-none"
        style={{
          top: '20px',
          right: '20px',
          maxHeight: 'calc(100vh - 40px)',
          overflow: 'hidden',
        }}
      >
        <div className="pointer-events-auto">
          {toasts.map((toast, index) => (
            <ToastItem
              key={toast.id}
              notification={toast}
              onDismiss={dismissToast}
              index={index}
            />
          ))}
        </div>
      </div>
    </>
  );
}

// Simpler Toast for Standalone Use (without Provider)
interface SimpleToastProps {
  type: NotificationType;
  title: string;
  message: string;
  amount?: string;
  token?: string;
  chain?: string;
  txUrl?: string;
  duration?: number;
  onClose?: () => void;
  logoUrl?: string;
}

export function SimpleToast({
  type,
  title,
  message,
  amount,
  token,
  chain,
  txUrl,
  duration = 6000,
  onClose,
  logoUrl,
}: SimpleToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const [logoError, setLogoError] = useState(false);

  const color = getNotificationColor(type);
  const actualLogoUrl = logoUrl || TOAST_CONFIG.logoUrl;

  useEffect(() => {
    if (duration > 0) {
      const startTime = Date.now();

      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remaining);

        if (remaining > 0) {
          requestAnimationFrame(updateProgress);
        }
      };

      requestAnimationFrame(updateProgress);

      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  // Format current time
  const formatTimeAgo = (): string => 'now';

  return (
    <div
      className={`
        fixed z-[9999]
        transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      style={{
        top: '20px',
        right: '20px',
        width: '400px',
        maxWidth: 'calc(100vw - 40px)',
      }}
    >
      <div
        className="rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 40, 80, 0.95) 0%, rgba(25, 35, 70, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Main Content - Bybit Style Layout */}
        <div className="flex items-start gap-3 p-4">
          {/* App Logo */}
          <div 
            className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center"
            style={{ 
              backgroundColor: '#1a1a1e',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
          >
            {TOAST_CONFIG.showLogo && !logoError ? (
              <img 
                src={actualLogoUrl} 
                alt={TOAST_CONFIG.logoAlt}
                className="w-full h-full object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              // Fallback: Bybit-style text logo
              <div className="flex items-center justify-center w-full h-full bg-[#1a1a1e]">
                <span className="text-xs font-bold">
                  <span className="text-white">BYB</span>
                  <span className="text-[#f7a600]">I</span>
                  <span className="text-white">T</span>
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header Row */}
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-white font-bold text-base">
                {token || title}
              </h4>
              <span className="text-[#f7a600] text-sm font-medium">
                {formatTimeAgo()}
              </span>
            </div>

            {/* Message */}
            <p className="text-[#a0b4d0] text-sm leading-relaxed">
              {message}
            </p>

            {/* Amount Badge (if applicable) */}
            {amount && token && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg" 
                style={{ backgroundColor: 'rgba(247, 166, 0, 0.15)' }}
              >
                <span className="text-[#f7a600] font-bold text-sm">
                  {amount} {token}
                </span>
                {chain && (
                  <span className="text-[#a0b4d0] text-xs">
                    • {chain}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-[#6b7c9a] hover:text-white transition-colors p-1 -mt-1 -mr-1"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* View Transaction Button */}
        {txUrl && (
          <div className="px-4 pb-4">
            <a
              href={txUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#f7a600] hover:bg-[#e09500] text-black font-semibold text-sm rounded-xl transition-colors"
            >
              View Transaction
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5.5 2.5H2.5V11.5H11.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M8.5 2.5H11.5V5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M11.5 2.5L6.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </a>
          </div>
        )}

        {/* Progress Bar */}
        {duration > 0 && (
          <div className="h-1 bg-[rgba(255,255,255,0.1)]">
            <div
              className="h-full transition-all duration-100 ease-linear"
              style={{
                width: `${progress}%`,
                backgroundColor: '#f7a600',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationToast;