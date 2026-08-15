/**
 * OAuth Success Handler
 * Receives token from backend OAuth callback and logs user in
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

type Status = 'processing' | 'success' | 'error';

function OAuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setTokens } = useAuthStore();
  const [status, setStatus] = useState<Status>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    handleOAuthSuccess();
  }, []);

  const handleOAuthSuccess = async () => {
    try {
      const token = searchParams.get('token');
      const userStr = searchParams.get('user');

      if (!token || !userStr) {
        throw new Error('Missing authentication data');
      }

      // Decode user data
      const user = JSON.parse(decodeURIComponent(userStr));

      // Security: scrub the access token out of the URL/browser history
      // immediately after reading it, so it isn't retained in browser
      // history, address bar, or leaked via Referer headers on subsequent
      // navigation. This doesn't fully solve token-in-URL exposure (server
      // logs may still capture it) but meaningfully reduces the client-side
      // exposure window.
      window.history.replaceState({}, '', '/auth/oauth/success');

      // Store authentication data
      setTokens({ accessToken: token });
      setUser({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        permissions: user.permissions || [],
        organizationId: user.organizationId,
        schoolId: user.schoolId,
        status: user.status,
      });

      setStatus('success');
      
      toast.success('Welcome!', {
        description: `Signed in as ${user.firstName} ${user.lastName}`,
      });

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (error: any) {
      console.error('OAuth success handler error:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Failed to complete sign in');
      
      toast.error('Sign in failed', {
        description: error.message || 'Failed to complete sign in',
      });

      // Redirect to login after error
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Processing */}
          {status === 'processing' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Completing sign in...
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Please wait while we set up your account
              </p>
            </div>
          )}

          {/* Success */}
          {status === 'success' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Sign in successful!
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Redirecting you to your dashboard...
              </p>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Sign in failed
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {errorMessage || 'An error occurred during authentication'}
              </p>
              <p className="text-sm text-gray-500">
                Redirecting you back to login...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OAuthSuccessFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
    </div>
  );
}

export default function OAuthSuccessPage() {
  return (
    <Suspense fallback={<OAuthSuccessFallback />}>
      <OAuthSuccessContent />
    </Suspense>
  );
}
