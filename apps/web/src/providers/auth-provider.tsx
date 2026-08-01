'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../stores/auth.store';
import { apiClient } from '../lib/axios';

const PUBLIC_ROUTES = ['/auth/login', '/auth/register', '/auth/forgot-password'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setUser, setLoading, logout } = useAuthStore();

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = async () => {
      try {
        setLoading(true);

        // Call /auth/me to get current user (uses refresh cookie)
        const response = await apiClient.get('/auth/me');

        setUser(response.data.user);
        useAuthStore.getState().setAccessToken(response.data.accessToken);
      } catch (error) {
        // Not authenticated
        setUser(null);

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
      router.push('/auth/login');
    };

    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, [pathname, router, setUser, setLoading, logout]);

  return <>{children}</>;
}
