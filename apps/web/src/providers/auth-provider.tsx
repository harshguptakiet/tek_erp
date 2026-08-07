'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../stores/auth.store';
import { authService } from '../services/auth.service';

const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/test/api',
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setUser, setLoading, setAccessToken, logout } = useAuthStore();

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
          if (!PUBLIC_ROUTES.includes(pathname)) {
            router.push('/auth/login');
          }
          return;
        }

        // Set the token
        setAccessToken(storedToken);

        // Verify token by calling /auth/me
        const response = await authService.getMe();
        
        setUser(response.user);
        setAccessToken(response.accessToken);
        
        // Store new token if refreshed
        localStorage.setItem('accessToken', response.accessToken);

      } catch (error) {
        // Token invalid or expired
        console.warn('Auth check failed:', error);
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem('accessToken');

        // Redirect to login if not on public route
        if (!PUBLIC_ROUTES.includes(pathname)) {
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
  }, [pathname, router, setUser, setLoading, setAccessToken, logout]);

  return <>{children}</>;
}
