/**
 * FR-AUTH-025: 2FA Recovery
 * Request account recovery when authenticator access is lost
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { formResolver } from '@/lib/form';
import * as z from 'zod';
import Link from 'next/link';
import { useRequest2FARecovery } from '@/hooks/use-auth-mutations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  details: z
    .string()
    .min(20, 'Please describe how you lost access (at least 20 characters)'),
});

type FormData = z.infer<typeof schema>;

export default function TwoFactorRecoveryPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const recoveryMutation = useRequest2FARecovery();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: formResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await recoveryMutation.mutateAsync(data.email);
      setSubmittedEmail(data.email);
      setSubmitted(true);
    } catch {
      // Toast handled by mutation hook
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="mt-4 text-center">
            <h3 className="text-lg font-medium text-gray-900">Recovery request submitted</h3>
            <p className="mt-2 text-sm text-gray-500">
              We received your request for <span className="font-medium text-gray-900">{submittedEmail}</span>.
              Our team will verify your identity and contact you within 1–2 business days.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              If you still have backup codes, you can{' '}
              <Link href="/auth/2fa-verify" className="text-indigo-600 hover:text-indigo-500">
                sign in with a backup code
              </Link>
              .
            </p>
            <Link
              href="/auth/login"
              className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">2FA account recovery</h2>
          <p className="mt-2 text-sm text-gray-600">
            Lost access to your authenticator app? Submit a recovery request for admin review.
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Account email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                className="mt-1"
                {...register('email')}
                error={errors.email?.message}
              />
            </div>

            <div>
              <label htmlFor="details" className="block text-sm font-medium text-gray-700">
                What happened?
              </label>
              <textarea
                id="details"
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Describe how you lost access to your authenticator..."
                {...register('details')}
              />
              {errors.details?.message && (
                <p className="mt-1 text-sm text-red-600">{errors.details.message}</p>
              )}
            </div>

            <div className="rounded-md bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                For faster access, try a backup code on the{' '}
                <Link href="/auth/2fa-verify" className="font-medium underline">
                  2FA verification
                </Link>{' '}
                screen. Recovery may take 1–2 business days.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting || recoveryMutation.isPending}>
              {isSubmitting || recoveryMutation.isPending ? 'Submitting...' : 'Submit recovery request'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm">
            <Link href="/auth/2fa-verify" className="font-medium text-indigo-600 hover:text-indigo-500">
              ← Back to 2FA verification
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
