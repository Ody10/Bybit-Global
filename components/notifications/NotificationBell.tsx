'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  useNotifications, 
  Notification, 
  getNotificationIcon, 
  getNotificationColor 
} from './NotificationProvider';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications, isLoading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Handle navigation based on notification type
    if (notification.metadata?.txUrl) {
      window.open(notification.metadata.txUrl, '_blank');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
        aria-label="Notifications"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>

        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-xs font-bold text-black rounded-full"
            style={{ backgroundColor: '#f7a600' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 bg-[#1e1e22] rounded-lg shadow-2xl overflow-hidden z-50"
          style={{
            width: '400px',
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: '480px',
            border: '1px solid #2a2a2e',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2e]">
            <h3 className="text-white font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[#f7a600] text-sm hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto" style={{ maxHeight: '380px' }}>
            {isLoading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f7a600]"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4a4a4e" strokeWidth="1.5">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="text-gray-500 mt-3 text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                  formatTimeAgo={formatTimeAgo}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-[#2a2a2e] text-center">
              <a
                href="/notifications"
                className="text-[#f7a600] text-sm hover:underline"
              >
                View all notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Individual Notification Item
interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  formatTimeAgo: (date: string) => string;
}

function NotificationItem({ notification, onClick, formatTimeAgo }: NotificationItemProps) {
  const icon = getNotificationIcon(notification.type);
  const color = getNotificationColor(notification.type);

  return (
    <div
      onClick={onClick}
      className={`
        flex gap-3 px-4 py-3 cursor-pointer transition-colors
        ${notification.isRead ? 'bg-transparent' : 'bg-[#16161a]'}
        hover:bg-[#252529]
      `}
      style={{
        borderLeft: notification.isRead ? 'none' : `3px solid ${color}`,
      }}
    >
      {/* Icon */}
      <div
        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg"
        style={{ backgroundColor: `${color}22` }}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium truncate ${notification.isRead ? 'text-gray-400' : 'text-white'}`}>
            {notification.title}
          </p>
          <span className="text-xs text-gray-500 flex-shrink-0">
            {formatTimeAgo(notification.createdAt)}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        
        {/* Amount Badge */}
        {notification.amount && notification.token && (
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-[#2a2a2e] rounded text-xs">
            <span className="text-white font-semibold">{notification.amount}</span>
            <span className="text-gray-400">{notification.token}</span>
          </div>
        )}
      </div>

      {/* Unread Dot */}
      {!notification.isRead && (
        <div 
          className="flex-shrink-0 w-2 h-2 rounded-full mt-2"
          style={{ backgroundColor: color }}
        />
      )}
    </div>
  );
}

export default NotificationBell;