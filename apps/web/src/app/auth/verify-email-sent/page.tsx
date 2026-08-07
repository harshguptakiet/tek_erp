/**
 * FR-AUTH-010: Registration Success - Email Sent Confirmation
 * Show after successful registration
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/auth-complete.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

function VerifyEmailSentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your email';
  
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);

  // Countdown for resend cooldown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (!canResend) return;

    setIsResending(true);
    try {
      await authService.resendVerificationEmail(email);
      toast.success('Verification email sent!');
      setCanResend(false);
      setCountdown(60); // 1 minute cooldown
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              {/* Success Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                </svg>
              </div>

              {/* Message */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Check your email
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  We've sent a verification link to
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {email}
                </p>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h4 className="font-medium text-blue-900 mb-2">Next steps:</h4>
                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                  <li>Check your email inbox</li>
                  <li>Click the verification link in the email</li>
                  <li>You'll be redirected to your dashboard</li>
                </ol>
              </div>

              {/* Troubleshooting */}
              <div className="text-left space-y-2">
                <p className="text-sm font-medium text-gray-900">
                  Didn't receive the email?
                </p>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Check your spam or junk folder</li>
                  <li>Make sure {email} is correct</li>
                  <li>Wait a few minutes and check again</li>
                  <li>Click "Resend" below if needed</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-4">
                <Button
                  onClick={handleResend}
                  disabled={!canResend || isResending}
                  className="w-full"
                  variant="outline"
                >
                  {isResending
                    ? 'Sending...'
                    : countdown > 0
                    ? `Resend in ${countdown}s`
                    : 'Resend verification email'}
                </Button>

                <Link href="/auth/login" className="block">
                  <Button variant="ghost" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>

              {/* Help Link */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Need help?{' '}
                  <Link
                    href="/contact-support"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Contact support
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> The verification link expires in 24 hours. You can
                request a new one if it expires.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VerifyEmailSentFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
    </div>
  );
}

export default function VerifyEmailSentPage() {
  return (
    <Suspense fallback={<VerifyEmailSentFallback />}>
      <VerifyEmailSentContent />
    </Suspense>
  );
}
