'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

// Notification types
export type NotificationType = 
  | 'DEPOSIT_PENDING'
  | 'DEPOSIT_CONFIRMED'
  | 'WITHDRAWAL_REQUEST'
  | 'WITHDRAWAL_SUCCESS'
  | 'WITHDRAWAL_FAILED'
  | 'SYSTEM'
  | 'SECURITY';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface Notification {
  id: string;
  type: NotificationType;
  category: string;
  title: string;
  message: string;
  transactionId?: string;
  txHash?: string;
  token?: string;
  amount?: string;
  chain?: string;
  address?: string;
  isRead: boolean;
  priority: NotificationPriority;
  metadata?: {
    txUrl?: string;
    explorerUrl?: string;
    explorerName?: string;
    depositId?: string;
    withdrawalId?: string;
    [key: string]: any;
  };
  createdAt: string;
  readAt?: string;
}

export interface ToastNotification extends Notification {
  duration?: number;
  onClose?: () => void;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  toasts: ToastNotification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  showToast: (notification: Omit<ToastNotification, 'id' | 'createdAt' | 'isRead'>) => void;
  dismissToast: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  fetchNotifications: () => Promise<void>;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
  pollingInterval?: number; // in milliseconds
}

export function NotificationProvider({ 
  children, 
  pollingInterval = 30000 // Poll every 30 seconds by default
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      
      if (!token) {
        return;
      }

      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const newNotifications: Notification[] = data.notifications || [];
        
        // Check for new notifications and show toasts
        if (lastFetchTime) {
          const newUnread = newNotifications.filter(n => 
            !n.isRead && 
            new Date(n.createdAt) > lastFetchTime
          );
          
          // Show toast for each new notification
          newUnread.forEach(n => {
            showToastInternal({
              ...n,
              duration: 8000, // 8 seconds
            });
          });
        }
        
        setNotifications(newNotifications);
        setLastFetchTime(new Date());
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [lastFetchTime]);

  // Internal function to show toast without dependency issues
  const showToastInternal = useCallback((notification: ToastNotification) => {
    const id = notification.id || `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const toast: ToastNotification = {
      ...notification,
      id,
      duration: notification.duration || 6000,
    };

    setToasts(prev => {
      // Prevent duplicate toasts
      if (prev.some(t => t.id === id)) {
        return prev;
      }
      return [...prev, toast];
    });

    // Auto-dismiss after duration
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, toast.duration);
    }
  }, []);

  // Add notification to list (for local additions)
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  // Show toast notification
  const showToast = useCallback((notification: Omit<ToastNotification, 'id' | 'createdAt' | 'isRead'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const toast: ToastNotification = {
      ...notification,
      id,
      createdAt: new Date().toISOString(),
      isRead: false,
      duration: notification.duration || 6000,
    };

    setToasts(prev => [...prev, toast]);

    // Auto-dismiss after duration
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, toast.duration);
    }
  }, []);

  // Dismiss a toast
  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
      )
    );

    // Update on server
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      if (token) {
        await fetch(`/api/notifications/${id}/read`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
    );

    // Update on server
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      if (token) {
        await fetch('/api/notifications/read-all', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Polling for new notifications
  useEffect(() => {
    if (pollingInterval > 0) {
      const interval = setInterval(fetchNotifications, pollingInterval);
      return () => clearInterval(interval);
    }
  }, [pollingInterval, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        addNotification,
        showToast,
        dismissToast,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        fetchNotifications,
        isLoading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Helper function to get notification icon based on type
export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case 'DEPOSIT_PENDING':
      return '⏳';
    case 'DEPOSIT_CONFIRMED':
      return '✅';
    case 'WITHDRAWAL_REQUEST':
      return '📤';
    case 'WITHDRAWAL_SUCCESS':
      return '✅';
    case 'WITHDRAWAL_FAILED':
      return '❌';
    case 'SECURITY':
      return '🔒';
    case 'SYSTEM':
    default:
      return 'ℹ️';
  }
}

// Helper function to get notification color based on type
export function getNotificationColor(type: NotificationType): string {
  switch (type) {
    case 'DEPOSIT_PENDING':
      return '#f59e0b'; // amber
    case 'DEPOSIT_CONFIRMED':
      return '#10b981'; // green
    case 'WITHDRAWAL_REQUEST':
      return '#3b82f6'; // blue
    case 'WITHDRAWAL_SUCCESS':
      return '#10b981'; // green
    case 'WITHDRAWAL_FAILED':
      return '#ef4444'; // red
    case 'SECURITY':
      return '#ef4444'; // red
    case 'SYSTEM':
    default:
      return '#6b7280'; // gray
  }
}