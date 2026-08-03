/**
 * FR-AUTH-022: 2FA Verification Page
 * Verify 2FA code or backup code during login
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { formResolver } from '@/lib/form';
import * as z from 'zod';
import Link from 'next/link';
import { useVerify2FA } from '@/hooks/use-auth-mutations';
import { authService } from '@/services/auth-complete.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const totpSchema = z.object({
  code: z.string().length(6, '2FA code must be 6 digits').regex(/^\d+$/, 'Must be numbers only'),
});

const backupCodeSchema = z.object({
  backupCode: z.string().length(8, 'Backup code must be 8 characters'),
});

export default function TwoFactorVerifyPage() {
  const router = useRouter();
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const verify2FAMutation = useVerify2FA();

  const totpForm = useForm<{ code: string }>({
    resolver: formResolver(totpSchema),
  });

  const backupForm = useForm<{ backupCode: string }>({
    resolver: formResolver(backupCodeSchema),
  });

  const currentForm = useBackupCode ? backupForm : totpForm;

  const onSubmitTOTP = async (data: { code: string }) => {
    try {
      await verify2FAMutation.mutateAsync({ code: data.code });
      router.push('/dashboard');
    } catch (error: any) {
      const remaining = attemptsRemaining - 1;
      setAttemptsRemaining(remaining);
      
      if (remaining === 0) {
        toast.error('Too many failed attempts. Please try again later.');
        router.push('/auth/login');
      } else {
        toast.error(`Invalid code. ${remaining} attempts remaining.`);
      }
    }
  };

  const onSubmitBackup = async (data: { backupCode: string }) => {
    try {
      const twoFactorToken = sessionStorage.getItem('2fa_token');
      if (!twoFactorToken) {
        toast.error('Session expired. Please login again.');
        router.push('/auth/login');
        return;
      }

      const response = await authService.verifyBackupCode(twoFactorToken, data.backupCode);
      
      // Update auth store (handled by service)
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error: any) {
      const remaining = attemptsRemaining - 1;
      setAttemptsRemaining(remaining);
      
      if (remaining === 0) {
        toast.error('Too many failed attempts. Please try again later.');
        router.push('/auth/login');
      } else {
        toast.error(`Invalid backup code. ${remaining} attempts remaining.`);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100">
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Two-Factor Authentication
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {useBackupCode
              ? 'Enter one of your backup codes'
              : 'Enter the 6-digit code from your authenticator app'}
          </p>
        </div>

        {/* 2FA Form */}
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {!useBackupCode ? (
            // TOTP Code Form
            <form className="space-y-6" onSubmit={totpForm.handleSubmit(onSubmitTOTP)}>
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  Authentication Code
                </label>
                <div className="mt-1">
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="000000"
                    className="text-center text-2xl tracking-widest"
                    {...totpForm.register('code')}
                    error={totpForm.formState.errors.code?.message}
                    autoFocus
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  The code expires every 30 seconds
                </p>
              </div>

              {/* Attempts Warning */}
              {attemptsRemaining < 3 && (
                <div className="rounded-md bg-yellow-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        {attemptsRemaining} {attemptsRemaining === 1 ? 'attempt' : 'attempts'}{' '}
                        remaining
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={totpForm.formState.isSubmitting || verify2FAMutation.isPending}
                >
                  {totpForm.formState.isSubmitting || verify2FAMutation.isPending
                    ? 'Verifying...'
                    : 'Verify'}
                </Button>
              </div>
            </form>
          ) : (
            // Backup Code Form
            <form className="space-y-6" onSubmit={backupForm.handleSubmit(onSubmitBackup)}>
              <div>
                <label htmlFor="backupCode" className="block text-sm font-medium text-gray-700">
                  Backup Code
                </label>
                <div className="mt-1">
                  <Input
                    id="backupCode"
                    type="text"
                    maxLength={8}
                    placeholder="12345678"
                    className="text-center text-xl tracking-wide font-mono"
                    {...backupForm.register('backupCode')}
                    error={backupForm.formState.errors.backupCode?.message}
                    autoFocus
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Enter one of the backup codes you saved during 2FA setup
                </p>
              </div>

              {/* Attempts Warning */}
              {attemptsRemaining < 3 && (
                <div className="rounded-md bg-yellow-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        {attemptsRemaining} {attemptsRemaining === 1 ? 'attempt' : 'attempts'}{' '}
                        remaining
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={backupForm.formState.isSubmitting}
                >
                  {backupForm.formState.isSubmitting ? 'Verifying...' : 'Use Backup Code'}
                </Button>
              </div>
            </form>
          )}

          {/* Toggle Backup Code */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => {
                setUseBackupCode(!useBackupCode);
                setAttemptsRemaining(3); // Reset attempts when switching
              }}
              className="w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              {useBackupCode
                ? '← Back to authenticator code'
                : 'Use backup code instead →'}
            </button>
          </div>

          {/* Help Links */}
          <div className="mt-6 space-y-2">
            <Link
              href="/auth/2fa/recovery"
              className="block text-center text-sm text-gray-600 hover:text-gray-900"
            >
              Lost your device? Request 2FA recovery
            </Link>
            <Link
              href="/auth/login"
              className="block text-center text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to login
            </Link>
          </div>
        </div>

        {/* Security Info */}
        <p className="mt-4 text-center text-xs text-gray-500">
          Your account is protected with two-factor authentication
        </p>
      </div>
    </div>
  );
}
