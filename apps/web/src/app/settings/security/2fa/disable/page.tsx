/**
 * Disable 2FA Page
 * Requires password + current 2FA code for security
 */

'use client';
// Force TypeScript refresh

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Shield, AlertTriangle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function Disable2FAPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [error, setError] = useState('');

  // Check if 2FA is enabled
  if (!user?.twoFactorEnabled) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>2FA is not currently enabled on your account</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
              Enable 2FA to add an extra layer of security to your account.
            </p>
            <Button onClick={() => router.push('/settings/security/2fa/enable')}>
              <Shield className="h-4 w-4 mr-2" />
              Enable 2FA
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!password) {
      setError('Please enter your password');
      return;
    }

    if (!twoFactorCode || twoFactorCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const confirmDisable = async () => {
    setShowConfirmDialog(false);
    setIsLoading(true);

    try {
      await authService.disable2FA(password, twoFactorCode);

      toast.success('2FA disabled successfully');
      router.push('/settings/security');
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to disable 2FA');
      toast.error('Failed to disable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      {/* Back button */}
      <Link
        href="/settings/security"
        className="inline-flex items-center text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Security Settings
      </Link>

      {/* Warning Alert */}
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Warning:</strong> Disabling two-factor authentication will make your account less
          secure. Anyone with your password will be able to access your account.
        </AlertDescription>
      </Alert>

      {/* Disable 2FA Form */}
      <Card className="card-premium">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-red-500/10">
              <Shield className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <CardTitle>Disable Two-Factor Authentication</CardTitle>
              <CardDescription>Enter your password and 2FA code to disable</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Current Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your current password"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            {/* 2FA Code */}
            <div className="space-y-2">
              <Label htmlFor="code">Authentication Code</Label>
              <Input
                id="code"
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                disabled={isLoading}
                className="text-2xl tracking-widest text-center font-mono"
              />
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            {/* Security Notice */}
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
              <h4 className="text-sm font-medium mb-2 text-amber-600 dark:text-amber-400">
                Security Notice
              </h4>
              <ul className="text-xs text-[hsl(var(--muted-foreground))] space-y-1">
                <li>• Your backup codes will be invalidated</li>
                <li>• You can re-enable 2FA at any time</li>
                <li>• Consider using a strong password if disabling 2FA</li>
                <li>• Enable email notifications for account activity</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/settings/security')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Disabling...
                  </>
                ) : (
                  'Disable 2FA'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                This action will disable two-factor authentication on your account. Your account
                will be protected by password only.
              </p>
              <p className="font-medium text-amber-600 dark:text-amber-400">
                This will make your account more vulnerable to unauthorized access.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDisable}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Yes, disable 2FA
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
