/**
 * FR-AUTH-067: Security Dashboard
 * Comprehensive security overview and settings
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSessions, usePasswordExpiry } from '@/hooks/use-auth-queries';
import { useLogoutAllDevices, useChangePassword } from '@/hooks/use-auth-mutations';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function SecurityDashboardPage() {
  const { user } = useAuthStore();
  const { data: sessionsData } = useSessions();
  const { data: passwordExpiry } = usePasswordExpiry();
  const logoutAllMutation = useLogoutAllDevices();
  const [showLogoutAllDialog, setShowLogoutAllDialog] = useState(false);

  // Calculate security score
  const calculateSecurityScore = () => {
    let score = 0;
    let maxScore = 100;

    // 2FA enabled (30 points)
    if (user?.twoFactorEnabled) score += 30;

    // Email verified (20 points)
    if (user?.emailVerified) score += 20;

    // Phone verified (10 points)
    if (user?.phoneVerified) score += 10;

    // Password not expiring soon (20 points)
    if (passwordExpiry && !passwordExpiry.isExpired && passwordExpiry.daysRemaining > 7) {
      score += 20;
    } else if (passwordExpiry && passwordExpiry.daysRemaining > 0) {
      score += 10;
    }

    // Active sessions count (20 points if <= 3 devices)
    const sessionCount = sessionsData?.sessions?.length || 0;
    if (sessionCount <= 3) {
      score += 20;
    } else if (sessionCount <= 5) {
      score += 10;
    }

    return { score, maxScore, percentage: (score / maxScore) * 100 };
  };

  const securityScore = calculateSecurityScore();

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (percentage: number) => {
    if (percentage >= 80) return 'Strong';
    if (percentage >= 60) return 'Good';
    if (percentage >= 40) return 'Fair';
    return 'Weak';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Security Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your account security settings and monitor activity
        </p>
      </div>

      {/* Security Score Card */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Security Score</h2>
            <p className="mt-1 text-sm text-gray-500">
              Overall security health of your account
            </p>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(securityScore.percentage)}`}>
              {securityScore.score}/{securityScore.maxScore}
            </div>
            <div className={`text-sm font-medium ${getScoreColor(securityScore.percentage)}`}>
              {getScoreLabel(securityScore.percentage)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                securityScore.percentage >= 80
                  ? 'bg-green-600'
                  : securityScore.percentage >= 60
                  ? 'bg-yellow-600'
                  : 'bg-red-600'
              }`}
              style={{ width: `${securityScore.percentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Two-Factor Authentication */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                user?.twoFactorEnabled ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <svg
                  className={`h-6 w-6 ${user?.twoFactorEnabled ? 'text-green-600' : 'text-gray-400'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Two-Factor Authentication
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {user?.twoFactorEnabled
                    ? 'Your account is protected with 2FA'
                    : 'Add an extra layer of security'}
                </p>
              </div>
            </div>
            {user?.twoFactorEnabled ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Enabled
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Disabled
              </span>
            )}
          </div>
          <div className="mt-4">
            <Link href="/account/security/2fa/setup">
              <Button variant={user?.twoFactorEnabled ? 'outline' : 'default'}>
                {user?.twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA'}
              </Button>
            </Link>
          </div>
        </div>

        {/* Password Management */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Password</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {passwordExpiry?.isExpired
                    ? 'Your password has expired'
                    : passwordExpiry?.daysRemaining && passwordExpiry.daysRemaining <= 7
                    ? `Expires in ${passwordExpiry.daysRemaining} days`
                    : 'Last changed recently'}
                </p>
              </div>
            </div>
            {passwordExpiry?.isExpired && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Expired
              </span>
            )}
          </div>
          <div className="mt-4">
            <Link href="/account/security/change-password">
              <Button>Change Password</Button>
            </Link>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Active Sessions
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {sessionsData?.sessions?.length || 0} active{' '}
                  {sessionsData?.sessions?.length === 1 ? 'device' : 'devices'}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex space-x-3">
            <Link href="/account/security/devices">
              <Button variant="outline">View Devices</Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => setShowLogoutAllDialog(true)}
              className="text-red-600 hover:text-red-700"
            >
              Logout All
            </Button>
          </div>
        </div>

        {/* Login History */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Login History
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {user?.lastLogin
                    ? `Last login: ${format(new Date(user.lastLogin), 'PPp')}`
                    : 'View your recent login activity'}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/account/security/login-history">
              <Button variant="outline">View History</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Security Recommendations */}
      <div className="mt-6 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Security Recommendations
        </h2>
        <div className="space-y-3">
          {!user?.twoFactorEnabled && (
            <div className="flex items-start p-4 bg-yellow-50 rounded-lg">
              <svg
                className="h-5 w-5 text-yellow-400 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-yellow-800">
                  Enable Two-Factor Authentication
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Protect your account with an extra layer of security
                </p>
              </div>
              <Link href="/account/security/2fa/setup">
                <Button size="sm" variant="outline" className="ml-4">
                  Enable
                </Button>
              </Link>
            </div>
          )}

          {!user?.emailVerified && (
            <div className="flex items-start p-4 bg-yellow-50 rounded-lg">
              <svg
                className="h-5 w-5 text-yellow-400 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-yellow-800">
                  Verify Your Email
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Verify your email address to secure account recovery
                </p>
              </div>
            </div>
          )}

          {passwordExpiry?.isExpired && (
            <div className="flex items-start p-4 bg-red-50 rounded-lg">
              <svg
                className="h-5 w-5 text-red-400 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Password Expired
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  Your password has expired. Please change it immediately.
                </p>
              </div>
              <Link href="/account/security/change-password">
                <Button size="sm" className="ml-4">
                  Change Now
                </Button>
              </Link>
            </div>
          )}

          {(sessionsData?.sessions?.length || 0) > 5 && (
            <div className="flex items-start p-4 bg-blue-50 rounded-lg">
              <svg
                className="h-5 w-5 text-blue-400 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-blue-800">
                  Multiple Active Sessions
                </h3>
                <p className="mt-1 text-sm text-blue-700">
                  You have {sessionsData?.sessions?.length} active sessions. Review and
                  logout unused devices.
                </p>
              </div>
              <Link href="/account/security/devices">
                <Button size="sm" variant="outline" className="ml-4">
                  Review
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Logout All Devices Dialog */}
      {showLogoutAllDialog && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Logout All Devices?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              This will log you out from all devices except this one. You'll need your
              password and 2FA code (if enabled) to confirm.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowLogoutAllDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  // This would open a modal to collect password + 2FA
                  // For now, just close the dialog
                  setShowLogoutAllDialog(false);
                }}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
