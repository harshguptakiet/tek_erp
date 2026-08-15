'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../stores/auth.store';
import { authService } from '../services/auth.service';

const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/register-phone',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/verify-email-sent',
  '/auth/2fa',
  '/auth/2fa-verify',
  '/auth/2fa/recovery',
  '/auth/oauth/callback',
  '/auth/oauth/success',
  '/test/api',
];

// Routes that start with these prefixes are public
const PUBLIC_ROUTE_PREFIXES = ['/auth/', '/test/'];

function isPublicRoute(pathname: string): boolean {
  // Check exact matches
  if (PUBLIC_ROUTES.includes(pathname)) {
    return true;
  }
  
  // Check prefixes
  return PUBLIC_ROUTE_PREFIXES.some(prefix => pathname.startsWith(prefix));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setUser, setLoading, setAccessToken, logout, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Check authentication status on mount.
    // FR-AUTH-033: Access tokens are NEVER persisted to localStorage - they
    // live in memory only (see lib/axios.ts). On a fresh page load the
    // in-memory token is gone, so we re-authenticate using the HttpOnly
    // refresh-token cookie (sent automatically via withCredentials) instead
    // of resurrecting a token from localStorage.
    const checkAuth = async () => {
      try {
        setLoading(true);

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth check timeout')), 5000)
        );

        // Attempt silent refresh via the HttpOnly refresh-token cookie.
        const refreshResponse = await Promise.race([
          authService.refresh(''), // refresh token is read from the cookie server-side
          timeoutPromise,
        ]) as any;

        setAccessToken(refreshResponse.accessToken);

        // Now fetch the user profile using the freshly-issued access token
        const meResponse = await Promise.race([
          authService.getMe(),
          timeoutPromise,
        ]) as any;

        setUser(meResponse.user);
      } catch (error) {
        // No valid refresh cookie, expired, or backend unreachable
        console.warn('Auth check failed:', error);
        setUser(null);
        setAccessToken(null);

        // Redirect to login if not on public route
        if (!isPublicRoute(pathname)) {
          router.push('/auth/login');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for logout events
    const handleLogout = () => {
      logout();
      router.push('/auth/login');
    };

    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

  // Handle route changes - redirect if not authenticated and trying to access protected route
  useEffect(() => {
    if (!isAuthenticated && !isPublicRoute(pathname)) {
      router.push('/auth/login');
    }
  }, [pathname, isAuthenticated, router]);

  return <>{children}</>;
}

