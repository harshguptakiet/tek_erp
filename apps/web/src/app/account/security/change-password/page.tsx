/**
 * FR-AUTH-042: Change Password (Authenticated)
 * Allow users to change their password while logged in
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { formResolver } from '@/lib/form';
import * as z from 'zod';
import { useChangePassword } from '@/hooks/use-auth-mutations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PasswordStrengthMeter } from '@/components/auth/password-strength-meter';
import { Checkbox } from '@/components/ui/checkbox';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain special character'),
  confirmPassword: z.string(),
  logoutOtherDevices: z.boolean().default(true),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ['newPassword'],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordPage() {
  const router = useRouter();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const changePasswordMutation = useChangePassword();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: formResolver(changePasswordSchema),
    defaultValues: {
      logoutOtherDevices: true,
    },
  });

  const newPassword = watch('newPassword');
  const logoutOtherDevices = watch('logoutOtherDevices');

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
        logoutOtherDevices: data.logoutOtherDevices,
      });
      setSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        router.push('/account/security');
      }, 3000);
    } catch (error) {
      // Error handled by mutation hook (toast notification)
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
                Password Changed Successfully!
              </h3>
              <p className="text-gray-600">
                Your password has been updated. An email confirmation has been sent to you.
              </p>
              {logoutOtherDevices && (
                <p className="text-sm text-gray-500">
                  All other devices have been logged out for security.
                </p>
              )}
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
          <h1 className="text-3xl font-bold text-gray-900">Change Password</h1>
          <Button
            variant="outline"
            onClick={() => router.push('/account/security')}
          >
            ← Back
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Update your password to keep your account secure
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Password Requirements</CardTitle>
          <CardDescription>
            Your new password must meet the following requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Password Policy Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Password Policy:</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>At least 8 characters long</li>
                <li>Contains uppercase letter (A-Z)</li>
                <li>Contains lowercase letter (a-z)</li>
                <li>Contains number (0-9)</li>
                <li>Contains special character (!@#$%^&*)</li>
                <li>Different from last 5 passwords</li>
              </ul>
            </div>

            {/* Current Password */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your current password"
                  {...register('currentPassword')}
                  error={errors.currentPassword?.message}
                  autoFocus
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-600 hover:text-gray-900"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Enter your new password"
                  {...register('newPassword')}
                  error={errors.newPassword?.message}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-600 hover:text-gray-900"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {/* Password Strength Meter */}
              {newPassword && <PasswordStrengthMeter password={newPassword} />}
            </div>

            {/* Confirm New Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                type={showNewPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Confirm your new password"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
              />
            </div>

            {/* Logout Other Devices Option */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <Checkbox
                    id="logoutOtherDevices"
                    {...register('logoutOtherDevices')}
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="logoutOtherDevices" className="font-medium text-gray-900 text-sm">
                    Logout other devices
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    Recommended: Log out all other devices for security. You'll stay
                    logged in on this device.
                  </p>
                </div>
              </div>
            </div>

            {/* Security Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">Security Notice</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    After changing your password, you may need to update it in any apps
                    or services that use your account credentials.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
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
                disabled={isSubmitting || changePasswordMutation.isPending}
              >
                {isSubmitting || changePasswordMutation.isPending
                  ? 'Changing Password...'
                  : 'Change Password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <div className="mt-6 space-y-4">
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium text-gray-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
              <li>Your password will be updated immediately</li>
              <li>You'll receive a confirmation email</li>
              <li>Other devices will be logged out (if selected)</li>
              <li>You'll stay logged in on this device</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium text-gray-900 mb-2">Password Security Tips:</h3>
            <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
              <li>Use a unique password for each account</li>
              <li>Consider using a password manager</li>
              <li>Enable two-factor authentication for extra security</li>
              <li>Change your password regularly</li>
              <li>Never share your password with anyone</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
