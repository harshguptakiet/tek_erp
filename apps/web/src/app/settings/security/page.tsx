/**
 * Security Settings Dashboard
 * Central hub for all security-related settings
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import Link from 'next/link';
import {
  Shield,
  Key,
  Smartphone,
  Monitor,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';

export default function SecuritySettingsPage() {
  const { user } = useAuthStore();

  // Fetch sessions count
  const { data: sessionsData } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const response = await authService.getSessions();
      return response.sessions || [];
    },
  });

  // Fetch password expiry status
  const { data: passwordStatus, isLoading: loadingPasswordStatus } = useQuery({
    queryKey: ['password-expiry'],
    queryFn: () => authService.checkPasswordExpiry(),
  });

  const activeSessions = sessionsData?.length || 0;
  const is2FAEnabled = user?.twoFactorEnabled || false;

  const getPasswordExpiryColor = () => {
    if (!passwordStatus) return 'text-gray-600';
    if (passwordStatus.isExpired) return 'text-red-600';
    if (passwordStatus.daysRemaining <= 7) return 'text-amber-600';
    return 'text-green-600';
  };

  const getPasswordExpiryText = () => {
    if (loadingPasswordStatus) return 'Checking...';
    if (!passwordStatus) return 'Unknown';
    if (passwordStatus.isExpired) return 'Expired';
    if (passwordStatus.daysRemaining <= 0) return 'Expires today';
    if (passwordStatus.daysRemaining === 1) return 'Expires tomorrow';
    return `${passwordStatus.daysRemaining} days remaining`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Security Settings</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Manage your account security and authentication methods
        </p>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 2FA Status */}
        <div className="rounded-lg border bg-[hsl(var(--card))] p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                Two-Factor Authentication
              </p>
              <div className="flex items-center gap-2">
                {is2FAEnabled ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-lg font-semibold text-green-600">Enabled</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="text-lg font-semibold text-red-600">Disabled</span>
                  </>
                )}
              </div>
            </div>
            <Smartphone className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
          </div>
        </div>

        {/* Active Sessions */}
        <div className="rounded-lg border bg-[hsl(var(--card))] p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                Active Sessions
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">{activeSessions}</span>
                <span className="text-sm text-[hsl(var(--muted-foreground))]">/ 10</span>
              </div>
            </div>
            <Monitor className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
          </div>
        </div>

        {/* Password Expiry */}
        <div className="rounded-lg border bg-[hsl(var(--card))] p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                Password Expiry
              </p>
              <div className="flex items-center gap-2">
                {loadingPasswordStatus ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Clock className={`h-5 w-5 ${getPasswordExpiryColor()}`} />
                )}
                <span className={`text-sm font-semibold ${getPasswordExpiryColor()}`}>
                  {getPasswordExpiryText()}
                </span>
              </div>
            </div>
            <Key className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
          </div>
        </div>
      </div>

      {/* Password Expiry Warning */}
      {passwordStatus && passwordStatus.daysRemaining <= 7 && !passwordStatus.isExpired && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                Password Expiring Soon
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Your password will expire in {passwordStatus.daysRemaining} days. Change it now to
                avoid being locked out.
              </p>
              <Link href="/settings/security/password">
                <Button size="sm" variant="outline" className="mt-3 border-amber-600 text-amber-600 hover:bg-amber-100">
                  Change Password Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Expired Password Error */}
      {passwordStatus && passwordStatus.isExpired && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-4">
          <div className="flex gap-3">
            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900 dark:text-red-100">
                Password Expired
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Your password has expired. You must change it to continue using your account.
              </p>
              <Link href="/settings/security/password">
                <Button size="sm" className="mt-3 bg-red-600 hover:bg-red-700">
                  Change Password
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Security Actions */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Security Actions</h2>
        
        <div className="rounded-lg border bg-[hsl(var(--card))] divide-y">
          {/* Two-Factor Authentication */}
          <Link
            href={is2FAEnabled ? '/settings/security/2fa/disable' : '/settings/security/2fa/enable'}
            className="flex items-center justify-between p-4 hover:bg-[hsl(var(--secondary))] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[hsl(var(--secondary))] flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {is2FAEnabled
                    ? 'Manage your 2FA settings'
                    : 'Add an extra layer of security'}
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
          </Link>

          {/* Change Password */}
          <Link
            href="/settings/security/password"
            className="flex items-center justify-between p-4 hover:bg-[hsl(var(--secondary))] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[hsl(var(--secondary))] flex items-center justify-center">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Change Password</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Update your account password
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
          </Link>

          {/* Active Sessions */}
          <Link
            href="/settings/security/sessions"
            className="flex items-center justify-between p-4 hover:bg-[hsl(var(--secondary))] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[hsl(var(--secondary))] flex items-center justify-center">
                <Monitor className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Active Sessions</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  View and manage your devices ({activeSessions} active)
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
          </Link>

          {/* Backup Codes */}
          {is2FAEnabled && (
            <Link
              href="/settings/security/2fa/backup-codes"
              className="flex items-center justify-between p-4 hover:bg-[hsl(var(--secondary))] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[hsl(var(--secondary))] flex items-center justify-center">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Backup Codes</p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    View and regenerate your 2FA backup codes
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
            </Link>
          )}

          {/* Login History */}
          <Link
            href="/settings/security/login-history"
            className="flex items-center justify-between p-4 hover:bg-[hsl(var(--secondary))] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[hsl(var(--secondary))] flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Login History</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  View all login attempts to your account
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
          </Link>

          {/* Trusted Devices */}
          <Link
            href="/settings/security/trusted-devices"
            className="flex items-center justify-between p-4 hover:bg-[hsl(var(--secondary))] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[hsl(var(--secondary))] flex items-center justify-center">
                <Shield className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium">Trusted Devices</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Manage devices verified for your account
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
          </Link>
        </div>
      </div>

      {/* Security Tips */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 p-4">
        <div className="flex gap-3">
          <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900 dark:text-blue-100">
            <p className="font-medium mb-2">Security Best Practices</p>
            <ul className="space-y-1 text-blue-700 dark:text-blue-300 list-disc list-inside">
              <li>Enable two-factor authentication for extra security</li>
              <li>Use a strong, unique password for your account</li>
              <li>Change your password every 30 days</li>
              <li>Review active sessions regularly and revoke unknown devices</li>
              <li>Never share your password or 2FA codes with anyone</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
