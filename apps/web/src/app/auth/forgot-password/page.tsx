/**
 * FR-AUTH-041: Forgot Password Page
 * Request password reset email
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { formResolver } from '@/lib/form';
import * as z from 'zod';
import Link from 'next/link';
import { useRequestPasswordReset } from '@/hooks/use-auth-mutations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const requestResetMutation = useRequestPasswordReset();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: formResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await requestResetMutation.mutateAsync(data.email);
      setSentEmail(data.email);
      setEmailSent(true);
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            {/* Success Message */}
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Check your email
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  We've sent a password reset link to
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {sentEmail}
                </p>
                <p className="text-sm text-gray-500 mt-4">
                  The link will expire in 1 hour. If you don't see the email,
                  check your spam folder.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <Button
                onClick={() => setEmailSent(false)}
                variant="outline"
                className="w-full"
              >
                Send to different email
              </Button>

              <Link href="/auth/login">
                <Button variant="ghost" className="w-full">
                  ← Back to login
                </Button>
              </Link>
            </div>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Didn't receive the email?{' '}
                <button
                  onClick={async () => {
                    await requestResetMutation.mutateAsync(sentEmail);
                  }}
                  disabled={requestResetMutation.isPending}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  {requestResetMutation.isPending ? 'Sending...' : 'Resend'}
                </button>
              </p>
            </div>
          </div>

          {/* Rate Limit Info */}
          <p className="mt-4 text-center text-xs text-gray-500">
            Password reset requests are limited to 3 per hour
          </p>
        </div>
      </div>
    );
  }

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
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your
            password
          </p>
        </div>

        {/* Form */}
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  {...register('email')}
                  error={errors.email?.message}
                  autoFocus
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || requestResetMutation.isPending}
              >
                {isSubmitting || requestResetMutation.isPending
                  ? 'Sending...'
                  : 'Send reset link'}
              </Button>
            </div>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                ← Back to login
              </Link>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Need help?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>
                If you don't have access to your email, please{' '}
                <Link
                  href="/contact-support"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  contact support
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div className="rounded-md bg-blue-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-blue-700">
                For security, generic success messages are shown. This prevents
                email enumeration attacks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
