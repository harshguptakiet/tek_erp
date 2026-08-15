/**
 * FR-AUTH-018: Change Password (Authenticated User)
 * Allow users to change their password with current password verification
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'Contains uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Contains lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'Contains number', test: (p) => /[0-9]/.test(p) },
  { label: 'Contains special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export default function ChangePasswordPage() {
  const router = useRouter();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChangePasswordForm>();

  const newPassword = watch('newPassword');

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordForm) =>
      authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    onSuccess: () => {
      toast.success('Password changed successfully', {
        description: 'You have been logged out from all other devices for security.',
      });
      reset();
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    },
    onError: (error: any) => {
      toast.error('Failed to change password', {
        description: error?.message || 'Please check your current password and try again.',
      });
    },
  });

  const onSubmit = (data: ChangePasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    changePasswordMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Change Password</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Update your password to keep your account secure
        </p>
      </div>

      {/* Form */}
      <div className="rounded-lg border bg-[hsl(var(--card))] p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium mb-2">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[hsl(var(--muted-foreground))]" />
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Enter current password"
                className={`
                  w-full h-11 pl-11 pr-11 rounded-xl border text-sm
                  bg-[hsl(var(--background))] border-[hsl(var(--border))]
                  placeholder:text-[hsl(var(--muted-foreground)/0.5)]
                  focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent
                  transition-all duration-200
                  ${errors.currentPassword ? 'border-red-400 focus:ring-red-400' : ''}
                `}
                {...register('currentPassword', {
                  required: 'Current password is required',
                })}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-[18px] w-[18px]" />
                ) : (
                  <Eye className="h-[18px] w-[18px]" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-1.5 text-xs text-red-500">{errors.currentPassword.message}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium mb-2">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[hsl(var(--muted-foreground))]" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                className={`
                  w-full h-11 pl-11 pr-11 rounded-xl border text-sm
                  bg-[hsl(var(--background))] border-[hsl(var(--border))]
                  placeholder:text-[hsl(var(--muted-foreground)/0.5)]
                  focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent
                  transition-all duration-200
                  ${errors.newPassword ? 'border-red-400 focus:ring-red-400' : ''}
                `}
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                  validate: {
                    uppercase: (value) =>
                      /[A-Z]/.test(value) || 'Must contain uppercase letter',
                    lowercase: (value) =>
                      /[a-z]/.test(value) || 'Must contain lowercase letter',
                    number: (value) => /[0-9]/.test(value) || 'Must contain number',
                    special: (value) =>
                      /[^A-Za-z0-9]/.test(value) || 'Must contain special character',
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              >
                {showNewPassword ? (
                  <EyeOff className="h-[18px] w-[18px]" />
                ) : (
                  <Eye className="h-[18px] w-[18px]" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1.5 text-xs text-red-500">{errors.newPassword.message}</p>
            )}

            {/* Password Requirements */}
            {newPassword && (
              <div className="mt-3 space-y-2">
                {passwordRequirements.map((requirement, index) => {
                  const isValid = requirement.test(newPassword);
                  return (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      {isValid ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-300" />
                      )}
                      <span className={isValid ? 'text-green-600' : 'text-[hsl(var(--muted-foreground))]'}>
                        {requirement.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-2">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[hsl(var(--muted-foreground))]" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                className={`
                  w-full h-11 pl-11 pr-11 rounded-xl border text-sm
                  bg-[hsl(var(--background))] border-[hsl(var(--border))]
                  placeholder:text-[hsl(var(--muted-foreground)/0.5)]
                  focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent
                  transition-all duration-200
                  ${errors.confirmPassword ? 'border-red-400 focus:ring-red-400' : ''}
                `}
                {...register('confirmPassword', {
                  required: 'Please confirm your new password',
                  validate: (value) => value === newPassword || 'Passwords do not match',
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-[18px] w-[18px]" />
                ) : (
                  <Eye className="h-[18px] w-[18px]" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting || changePasswordMutation.isPending}
              className="min-w-[140px]"
            >
              {isSubmitting || changePasswordMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Changing...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting || changePasswordMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>

      {/* Security Info */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900 dark:text-amber-100">
            <p className="font-medium mb-1">Important</p>
            <ul className="text-amber-700 dark:text-amber-300 space-y-1 list-disc list-inside">
              <li>Your new password cannot be one of your last 5 passwords</li>
              <li>You will be logged out from all other devices for security</li>
              <li>We recommend changing your password every 30 days</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
