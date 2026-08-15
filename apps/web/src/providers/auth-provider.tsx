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
    // Check authentication status on mount
    const checkAuth = async () => {
      try {
        setLoading(true);

        // Check if there's a token in localStorage (client-side persistence)
        const storedToken = localStorage.getItem('accessToken');
        
        if (!storedToken) {
          // No token, not authenticated
          setUser(null);
          if (!isPublicRoute(pathname)) {
            router.push('/auth/login');
          }
          return;
        }

        // Set the token
        setAccessToken(storedToken);

        // Verify token by calling /auth/me with timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth check timeout')), 5000)
        );
        
        const response = await Promise.race([
          authService.getMe(),
          timeoutPromise
        ]) as any;
        
        setUser(response.user);
        setAccessToken(response.accessToken);
        
        // Store new token if refreshed
        localStorage.setItem('accessToken', response.accessToken);

      } catch (error) {
        // Token invalid, expired, or backend unreachable
        console.warn('Auth check failed:', error);
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem('accessToken');

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
      localStorage.removeItem('accessToken');
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

