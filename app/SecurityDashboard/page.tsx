"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Lock,
  Mail,
  Smartphone,
  ShieldCheck,
  Key,
  AlertCircle,
  LockKeyhole,
  Wifi,
  Laptop,
  Settings,
  ChevronRight,
  Eye,
  EyeOff,
  X
} from 'lucide-react';

interface SecurityData {
  email: string;
  phoneNumber: string | null;
  lastLoginAt: string | null;
  lastLoginDevice: string | null;
  googleAuthEnabled: boolean;
  fundPasswordSet: boolean;
  antiPhishingCodeSet: boolean;
  securityLevel: 'Low' | 'Medium' | 'High';
}

export default function SecurityDashboard() {
  const router = useRouter();
  const [securityData, setSecurityData] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  
  // Password modal state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      const response = await fetch('/api/user/security', {
        headers: {
          'x-user-id': '4000000001' // For testing - replace with actual auth
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSecurityData(data);
      }
    } catch (error) {
      console.error('Failed to fetch security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      alert('Please fill in all fields');
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': '4000000001' // For testing - replace with actual auth
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Password changed successfully! You will be logged out.');
        setShowPasswordModal(false);
        // Redirect to login or logout
        router.push('/login');
      } else {
        alert(data.error || 'Failed to change password');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setPasswordLoading(false);
    }
  };

  const maskEmail = (email: string): string => {
    if (email === '******@****') return email;
    const [local, domain] = email.split('@');
    if (!domain) return '******@****';
    const maskedLocal = local.substring(0, 3) + '***';
    const maskedDomain = '****';
    return `${maskedLocal}@${maskedDomain}`;
  };

  const maskPhone = (phone: string | null | undefined): string => {
    if (!phone) return 'None';
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 4) return 'None';
    return digits.substring(0, 3) + '****' + digits.substring(digits.length - 3);
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-green-500';
      case 'Medium': return 'text-yellow-500';
      case 'Low': return 'text-red-500';
      default: return 'text-red-500';
    }
  };

  const getSecurityLevelBars = (level: string) => {
    const totalBars = 3;
    const filledBars = level === 'High' ? 3 : level === 'Medium' ? 2 : 1;
    const color = level === 'High' ? 'bg-green-500' : level === 'Medium' ? 'bg-yellow-500' : 'bg-red-500';
    
    return (
      <div className="flex gap-1 ml-2">
        {Array.from({ length: totalBars }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-1 rounded ${i < filledBars ? color : 'bg-gray-600'}`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 bg-black border-b border-gray-800 p-4 flex items-center">
        <button onClick={() => router.back()} className="mr-4">
          <ChevronRight className="rotate-180" size={24} />
        </button>
        <h1 className="text-xl font-semibold">Security</h1>
      </div>

      <div className="p-4">
        {/* Account Activity */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <Shield size={20} className="mr-2" />
            <span className="text-gray-400">Account Activity</span>
          </div>
          <div className="text-sm text-gray-500 mb-1">
            Last login time: {securityData?.lastLoginAt || 'Never'}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <span>Login device:</span>
            <Laptop size={14} className="ml-1 mr-1" />
            <span>{securityData?.lastLoginDevice || 'Unknown'}</span>
          </div>
        </div>

        {/* Security Level */}
        <div className="mb-6 flex items-center">
          <span className="text-gray-400">Security Level</span>
          <span className={`ml-2 font-semibold ${getSecurityLevelColor(securityData?.securityLevel || 'Low')}`}>
            {securityData?.securityLevel || 'Low'}
          </span>
          {getSecurityLevelBars(securityData?.securityLevel || 'Low')}
        </div>

        {/* Security Options */}
        <div className="space-y-1">
          {/* Change Password */}
          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-900 transition-colors"
          >
            <div className="flex items-center">
              <Lock size={20} className="mr-3" />
              <span>Change Password</span>
            </div>
            <ChevronRight size={20} className="text-gray-500" />
          </button>

          {/* Email */}
          <button
            onClick={() => setShowEmailModal(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-900 transition-colors"
          >
            <div className="flex items-center">
              <Mail size={20} className="mr-3" />
              <span>Email</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">
                {maskEmail(securityData?.email || '******@****')}
              </span>
              <ChevronRight size={20} className="text-gray-500" />
            </div>
          </button>

          {/* Mobile */}
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-900 transition-colors">
            <div className="flex items-center">
              <Smartphone size={20} className="mr-3" />
              <span>Mobile</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">
                {maskPhone(securityData?.phoneNumber)}
              </span>
              <ChevronRight size={20} className="text-gray-500" />
            </div>
          </button>

          {/* Google 2FA */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <ShieldCheck size={20} className="mr-3" />
              <span>Google 2FA Authentication</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={securityData?.googleAuthEnabled || false}
                className="sr-only peer"
                readOnly
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          {/* Secure Transaction Approval */}
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-900 transition-colors">
            <div className="flex items-center">
              <Key size={20} className="mr-3" />
              <span>Secure Transaction Approval</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">Not Setup</span>
              <ChevronRight size={20} className="text-gray-500" />
            </div>
          </button>

          {/* Fund Password */}
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-900 transition-colors">
            <div className="flex items-center">
              <LockKeyhole size={20} className="mr-3" />
              <span>Fund Password</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">
                {securityData?.fundPasswordSet ? 'Setup' : 'Not Setup'}
              </span>
              <ChevronRight size={20} className="text-gray-500" />
            </div>
          </button>

          {/* Anti-phishing Code */}
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-900 transition-colors">
            <div className="flex items-center">
              <AlertCircle size={20} className="mr-3" />
              <span>Anti-phishing Code</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">
                {securityData?.antiPhishingCodeSet ? 'Configured' : 'Not Yet Configured'}
              </span>
              <ChevronRight size={20} className="text-gray-500" />
            </div>
          </button>

          {/* App Lock */}
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-900 transition-colors">
            <div className="flex items-center">
              <Lock size={20} className="mr-3" />
              <span>App Lock</span>
            </div>
            <ChevronRight size={20} className="text-gray-500" />
          </button>

          {/* Withdrawal Security */}
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-900 transition-colors">
            <div className="flex items-center">
              <Shield size={20} className="mr-3" />
              <span>Withdrawal Security</span>
            </div>
            <ChevronRight size={20} className="text-gray-500" />
          </button>

          {/* Trusted Devices */}
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-900 transition-colors">
            <div className="flex items-center">
              <Wifi size={20} className="mr-3" />
              <span>Trusted Devices</span>
            </div>
            <ChevronRight size={20} className="text-gray-500" />
          </button>

          {/* Account Settings */}
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-900 transition-colors">
            <div className="flex items-center">
              <Settings size={20} className="mr-3" />
              <span>Account Settings</span>
            </div>
            <ChevronRight size={20} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black z-50">
          <div className="sticky top-0 bg-black border-b border-gray-800 p-4 flex items-center">
            <button onClick={() => setShowPasswordModal(false)} className="mr-4">
              <ChevronRight className="rotate-180" size={24} />
            </button>
            <h1 className="text-xl font-semibold">Change Password</h1>
          </div>

          <div className="p-4">
            {/* Warning */}
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 mb-6 flex">
              <AlertCircle size={20} className="text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-200">
                <span className="font-semibold">Note:</span> For account security, please be aware that after changing your password, on-chain withdrawals, internal transfers, fiat withdrawals, Bybit Card transactions, P2P Trading, and advertising will be suspended for 24 hours.
              </p>
            </div>

            {/* Old Password */}
            <div className="mb-4">
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type={showOldPassword ? "text" : "password"}
                  placeholder="Old Password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-gray-900 text-white pl-12 pr-12 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="mb-6">
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-900 text-white pl-12 pr-12 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleChangePassword}
              disabled={passwordLoading}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-semibold py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {passwordLoading ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
          <div className="w-full bg-gray-900 rounded-t-3xl p-6 animate-slide-up">
            <h2 className="text-center text-lg font-semibold mb-6">Please Select</h2>
            
            <div className="space-y-4">
              {securityData?.email && securityData.email !== '******@****' ? (
                <>
                  <button className="w-full py-4 text-center hover:bg-gray-800 rounded-lg transition-colors">
                    Unlink my Registered Email
                  </button>
                  <button className="w-full py-4 text-center hover:bg-gray-800 rounded-lg transition-colors">
                    Change my Registered Email
                  </button>
                </>
              ) : (
                <button className="w-full py-4 text-center hover:bg-gray-800 rounded-lg transition-colors">
                  Link Register Email
                </button>
              )}
              
              <button
                onClick={() => setShowEmailModal(false)}
                className="w-full py-4 text-center text-gray-400 hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}