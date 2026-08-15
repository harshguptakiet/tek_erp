/**
 * Authentication Query Hooks
 * React Query queries for auth data fetching
 */

import { useQuery } from '@tanstack/react-query';
import { authService } from '../services/auth.service';

export function useSessions() {
  return useQuery({
    queryKey: ['auth', 'sessions'],
    queryFn: () => authService.getSessions(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useLoginHistory(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['auth', 'login-history', params],
    queryFn: () => authService.getLoginHistory(params),
    // Backend returns { attempts, stats, total } - there is no `history`
    // field. Reading `data.history` always returned [] regardless of actual
    // login attempts, making this page permanently show "no history".
    select: (data) => data.attempts ?? [],
    staleTime: 1000 * 60 * 5,
  });
}

export function useBackupCodes() {
  return useQuery({
    queryKey: ['auth', '2fa', 'backup-codes'],
    queryFn: () => authService.getBackupCodes(),
    enabled: false, // Only fetch when explicitly requested
  });
}

export function usePasswordExpiry() {
  return useQuery({
    queryKey: ['auth', 'password-expiry'],
    queryFn: () => authService.checkPasswordExpiry(),
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: false,
  });
}

export function useAccountLockStatus(email: string, enabled: boolean = false) {
  return useQuery({
    queryKey: ['auth', 'lock-status', email],
    queryFn: () => authService.checkLockStatus(email),
    enabled: enabled && !!email,
    retry: false,
  });
}
