/**
 * FR-AUTH-023: Disable 2FA
 * Allow users to disable two-factor authentication
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { formResolver } from '@/lib/form';
import * as z from 'zod';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth-complete.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const disable2FASchema = z.object({
  password: z.string().min(1, 'Password is required'),
  twoFactorCode: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Must be numbers only'),
});

type Disable2FAFormData = z.infer<typeof disable2FASchema>;

export default function Disable2FAPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Disable2FAFormData>({
    resolver: formResolver(disable2FASchema),
  });

  // Check if 2FA is enabled
  if (!user?.twoFactorEnabled) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Disable Two-Factor Authentication</CardTitle>
            <CardDescription>2FA is not currently enabled</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Two-factor authentication is not enabled on your account.
            </p>
            <Button onClick={() => router.push('/account/security')}>
              Back to Security
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = async (data: Disable2FAFormData) => {
    try {
      await authService.disable2FA(data.password, data.twoFactorCode);
      setSuccess(true);
      toast.success('Two-factor authentication disabled');
      
      // Redirect after success
      setTimeout(() => {
        router.push('/account/security');
      }, 3000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to disable 2FA');
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                2FA Disabled Successfully
              </h3>
              <p className="text-gray-600">
                Two-factor authentication has been disabled on your account. A confirmation
                email has been sent to you.
              </p>
              <p className="text-sm text-gray-500">
                All other devices have been logged out for security.
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to security dashboard...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Disable 2FA</h1>
            <p className="mt-2 text-sm text-gray-600">
              Turn off two-factor authentication for your account
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/account/security')}
          >
            ← Back
          </Button>
        </div>
      </div>

      {/* Warning */}
      <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex">
          <svg className="h-6 w-6 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">Warning: Security Risk</h3>
            <div className="mt-2 text-sm text-red-700">
              <p className="mb-2">
                Disabling two-factor authentication will make your account less secure.
                Consider the following before proceeding:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Your account will only be protected by your password</li>
                <li>You'll be more vulnerable to unauthorized access</li>
                <li>All your backup codes will be invalidated</li>
                <li>You'll be logged out from all other devices</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Disable Form */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Required</CardTitle>
          <CardDescription>
            Enter your password and current 2FA code to confirm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  {...register('password')}
                  error={errors.password?.message}
                  autoFocus
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-600 hover:text-gray-900"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* 2FA Code */}
            <div>
              <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-700 mb-2">
                Two-Factor Authentication Code
              </label>
              <Input
                id="twoFactorCode"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                className="text-center text-2xl tracking-widest"
                {...register('twoFactorCode')}
                error={errors.twoFactorCode?.message}
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            {/* Confirmation Checklist */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">What will happen:</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>2FA will be disabled immediately</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>All backup codes will be invalidated</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>You'll be logged out from all other devices</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>You'll receive a confirmation email</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>You can re-enable 2FA anytime from security settings</span>
                </li>
              </ul>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/account/security')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isSubmitting ? 'Disabling 2FA...' : 'Disable 2FA'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Alternative: Keep 2FA Enabled */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-medium text-blue-900 mb-2">
          Want to keep your account secure?
        </h3>
        <p className="text-sm text-blue-800 mb-4">
          We strongly recommend keeping two-factor authentication enabled. It provides
          an additional layer of security that protects your account even if your
          password is compromised.
        </p>
        <Button
          variant="outline"
          onClick={() => router.push('/account/security')}
        >
          Keep 2FA Enabled
        </Button>
      </div>
    </div>
  );
}
