/**
 * FR-AUTH-006: Email Verification Page
 * Verify email with token from email link
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/auth-complete.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type VerificationStatus = 'verifying' | 'success' | 'error' | 'expired' | 'invalid';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      await authService.verifyEmail(token);
      setStatus('success');
      
      // Redirect to dashboard after success
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      
      if (message.includes('expired')) {
        setStatus('expired');
        setCanResend(true);
      } else if (message.includes('invalid')) {
        setStatus('invalid');
      } else {
        setStatus('error');
        setErrorMessage(message);
      }
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    setResending(true);
    try {
      await authService.resendVerificationEmail('');
      alert('Verification email sent! Please check your inbox.');
    } catch (error) {
      alert('Failed to resend verification email. Please try again later.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <Card>
          <CardContent className="pt-6">
            {/* Verifying */}
            {status === 'verifying' && (
              <div className="text-center space-y-4">
                <div className="mx-auto flex items-center justify-center h-16 w-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Verifying your email...
                </h3>
                <p className="text-gray-600">
                  Please wait while we verify your email address.
                </p>
              </div>
            )}

            {/* Success */}
            {status === 'success' && (
              <div className="text-center space-y-4">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Email Verified Successfully!
                </h3>
                <p className="text-gray-600">
                  Your email has been verified. You can now access all features of your
                  account.
                </p>
                <p className="text-sm text-gray-500">
                  Redirecting to dashboard...
                </p>
                <Button onClick={() => router.push('/dashboard')}>
                  Go to Dashboard Now
                </Button>
              </div>
            )}

            {/* Expired */}
            {status === 'expired' && (
              <div className="text-center space-y-4">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
                  <svg className="h-8 w-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Verification Link Expired
                </h3>
                <p className="text-gray-600">
                  This verification link has expired. Verification links are valid for 24
                  hours.
                </p>
                <div className="pt-4">
                  <Button
                    onClick={handleResend}
                    disabled={resending}
                    className="w-full"
                  >
                    {resending ? 'Sending...' : 'Send New Verification Email'}
                  </Button>
                </div>
                <Link href="/auth/login" className="block">
                  <Button variant="outline" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            )}

            {/* Invalid */}
            {status === 'invalid' && (
              <div className="text-center space-y-4">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                  <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Invalid Verification Link
                </h3>
                <p className="text-gray-600">
                  This verification link is invalid or has already been used. Please
                  request a new one.
                </p>
                <div className="pt-4 space-y-3">
                  <Link href="/auth/login" className="block">
                    <Button className="w-full">
                      Go to Login
                    </Button>
                  </Link>
                  <Link href="/contact-support" className="block">
                    <Button variant="outline" className="w-full">
                      Contact Support
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Error */}
            {status === 'error' && (
              <div className="text-center space-y-4">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                  <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Verification Failed
                </h3>
                <p className="text-gray-600">
                  {errorMessage || 'An error occurred while verifying your email. Please try again.'}
                </p>
                <div className="pt-4 space-y-3">
                  <Button
                    onClick={() => token && verifyEmail(token)}
                    className="w-full"
                  >
                    Try Again
                  </Button>
                  <Link href="/auth/login" className="block">
                    <Button variant="outline" className="w-full">
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Having trouble?{' '}
            <Link
              href="/contact-support"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function VerifyEmailFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
