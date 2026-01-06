"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TestSecurityPage() {
  const router = useRouter();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testSecurityAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/user/security', {
        headers: {
          'x-user-id': '4000000001' // Test user ID
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testPasswordChange = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': '4000000001'
        },
        body: JSON.stringify({
          oldPassword: 'Test1234!',
          newPassword: 'NewTest1234!'
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }
      
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const goToSecurityDashboard = () => {
    router.push('/SecurityDashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          Security Dashboard Test Suite
        </h1>

        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Setup Status</h2>
          <div className="space-y-2 text-sm">
            <p className="flex items-center">
              <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
              Test user credentials: test@example.com / Test1234!
            </p>
            <p className="flex items-center">
              <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
              User ID: 4000000001
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Test API Endpoints</h3>
            <div className="space-y-3">
              <button
                onClick={testSecurityAPI}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 rounded-lg transition-colors"
              >
                Test GET /api/user/security
              </button>
              <button
                onClick={testPasswordChange}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-3 rounded-lg transition-colors"
              >
                Test POST /api/user/change-password
              </button>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Navigate to Dashboard</h3>
            <button
              onClick={goToSecurityDashboard}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold py-3 rounded-lg transition-all"
            >
              Open Security Dashboard →
            </button>
            <p className="text-xs text-gray-400 mt-3">
              This will open the full Security Dashboard UI with test user data
            </p>
          </div>
        </div>

        {loading && (
          <div className="bg-gray-800 rounded-lg p-6 border border-blue-500 mb-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-3"></div>
              <span>Testing...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 mb-6">
            <h3 className="text-red-400 font-semibold mb-2">Error</h3>
            <p className="text-red-300">{error}</p>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-red-400 hover:text-red-300">
                Troubleshooting
              </summary>
              <ul className="mt-2 text-sm text-gray-300 space-y-1 list-disc list-inside">
                <li>Make sure you've run: npm run db:seed</li>
                <li>Check that Prisma client is generated: npx prisma generate</li>
                <li>Verify database migrations are up to date: npx prisma migrate dev</li>
                <li>Check .env file has DATABASE_URL and JWT_SECRET</li>
                <li>Restart the development server</li>
              </ul>
            </details>
          </div>
        )}

        {result && (
          <div className="bg-gray-800 rounded-lg p-6 border border-green-500">
            <h3 className="text-green-400 font-semibold mb-4">✅ Success - API Response:</h3>
            <pre className="bg-black rounded p-4 overflow-x-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-3">Quick Setup Commands</h3>
          <div className="space-y-3 text-sm font-mono">
            <div className="bg-black rounded p-3">
              <p className="text-gray-400 mb-1"># Install dependencies</p>
              <p className="text-green-400">npm install</p>
            </div>
            <div className="bg-black rounded p-3">
              <p className="text-gray-400 mb-1"># Generate Prisma client</p>
              <p className="text-green-400">npx prisma generate</p>
            </div>
            <div className="bg-black rounded p-3">
              <p className="text-gray-400 mb-1"># Run migrations</p>
              <p className="text-green-400">npx prisma migrate dev</p>
            </div>
            <div className="bg-black rounded p-3">
              <p className="text-gray-400 mb-1"># Seed test data</p>
              <p className="text-green-400">npm run db:seed</p>
            </div>
            <div className="bg-black rounded p-3">
              <p className="text-gray-400 mb-1"># Start dev server</p>
              <p className="text-green-400">npm run dev</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}