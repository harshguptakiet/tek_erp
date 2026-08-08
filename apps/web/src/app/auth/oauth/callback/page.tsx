/**
 * FR-AUTH-013: OAuth Callback Handler
 * Handle OAuth redirects from Google, Microsoft, etc.
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { Card, CardContent } from '@/components/ui/card';

type CallbackStatus = 'processing' | 'success' | 'error';

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<CallbackStatus>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  const provider = searchParams.get('provider');
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    // Check for error from OAuth provider
    if (error) {
      setStatus('error');
      setErrorMessage(decodeURIComponent(error));
      return;
    }

    // Validate required parameters
    if (!provider || !code) {
      setStatus('error');
      setErrorMessage('Missing required OAuth parameters');
      return;
    }

    try {
      // Call backend to complete OAuth flow
      const response = await authService.handleOAuthCallback({
        provider: provider as 'google' | 'microsoft',
        code,
        state: state || '',
      });
      
      setStatus('success');
      
      // Redirect based on user status
      setTimeout(() => {
        if (response.isNewUser) {
          router.push('/onboarding');
        } else {
          router.push('/dashboard');
        }
      }, 1500);
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.response?.data?.message || 'OAuth authentication failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <Card>
          <CardContent className="pt-6">
            {/* Processing */}
            {status === 'processing' && (
              <div className="text-center space-y-4">
                <div className="mx-auto flex items-center justify-center h-16 w-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Completing sign in...
                </h3>
                <p className="text-gray-600">
                  Please wait while we verify your {provider} account.
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
                  Sign in successful!
                </h3>
                <p className="text-gray-600">
                  Redirecting you to your dashboard...
                </p>
              </div>
            )}

            {/* Error */}
            {status === 'error' && (
              <div className="text-center space-y-4">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                  <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Sign in failed
                </h3>
                <p className="text-gray-600">
                  {errorMessage || 'An error occurred during authentication.'}
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => router.push('/auth/login')}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Text */}
        {status === 'error' && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need help?{' '}
              <a
                href="/contact-support"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Contact support
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function OAuthCallbackFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<OAuthCallbackFallback />}>
      <OAuthCallbackContent />
    </Suspense>
  );
}
