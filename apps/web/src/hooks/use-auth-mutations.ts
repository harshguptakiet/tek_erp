/**
 * Authentication Mutation Hooks
 * React Query mutations for all auth operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth-complete.service';
import { useAuthStore, type User as StoreUser } from '../stores/auth.store';
import { toast } from 'sonner';
import type {
  RegisterRequest,
  LoginRequest,
  ChangePasswordRequest,
  PasswordResetConfirm,
  User as AuthUser,
} from '../types/auth.types';

function toStoreUser(user: AuthUser): StoreUser {
  const primaryRole = Array.isArray(user.role) ? user.role[0] ?? '' : String(user.role ?? '');
  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    phone: user.phone,
    phoneVerified: user.phoneVerified,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: [user.firstName, user.lastName].filter(Boolean).join(' '),
    role: primaryRole,
    roles: Array.isArray(user.role) ? user.role : [primaryRole],
    permissions: [],
    organizationId: user.organizationId,
    profilePicture: user.profilePicture,
    status: user.status,
    twoFactorEnabled: user.twoFactorEnabled,
    lastLogin: user.lastLogin,
  };
}

export function useRegister() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.registerWithEmail(data),
    onSuccess: (data) => {
      toast.success('Registration successful! Please verify your email.');
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });
}

export function useLogin() {
  const { setUser, setTokens } = useAuthStore();
  
  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.loginWithEmail(credentials),
    onSuccess: (data) => {
      if (data.requiresTwoFactor) {
        // Store temp token for 2FA verification
        sessionStorage.setItem('2fa_token', data.twoFactorToken!);
        toast.info('Please enter your 2FA code');
      } else {
        setUser(toStoreUser(data.user));
        setTokens(data.tokens);
        toast.success('Login successful!');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });
}

export function useVerify2FA() {
  const { setUser, setTokens } = useAuthStore();
  
  return useMutation({
    mutationFn: ({ code }: { code: string }) => {
      const twoFactorToken = sessionStorage.getItem('2fa_token');
      if (!twoFactorToken) throw new Error('2FA token not found');
      return authService.verify2FA(twoFactorToken, code);
    },
    onSuccess: (data) => {
      setUser(toStoreUser(data.user));
      setTokens(data.tokens);
      sessionStorage.removeItem('2fa_token');
      toast.success('Login successful!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '2FA verification failed');
    },
  });
}

export function useEnable2FA() {
  return useMutation({
    mutationFn: () => authService.enable2FA(),
    onSuccess: () => {
      toast.success('2FA setup initiated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to enable 2FA');
    },
  });
}

export function useVerify2FASetup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (code: string) => authService.verify2FASetup(code),
    onSuccess: (data) => {
      toast.success('2FA enabled successfully! Save your backup codes.');
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      return data.backupCodes;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '2FA setup failed');
    },
  });
}

export function useDisable2FA() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ password, code }: { password: string; code: string }) =>
      authService.disable2FA(password, code),
    onSuccess: () => {
      toast.success('2FA disabled successfully');
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to disable 2FA');
    },
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email: string) => authService.requestPasswordReset({ email }),
    onSuccess: () => {
      toast.success('Password reset email sent! Check your inbox.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: PasswordResetConfirm) => authService.resetPassword(data),
    onSuccess: () => {
      toast.success('Password reset successfully! Please login.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Password reset failed');
    },
  });
}

export function useChangePassword() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => authService.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully');
      queryClient.invalidateQueries({ queryKey: ['auth', 'sessions'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    },
  });
}

export function useLogout() {
  const { clearAuth } = useAuthStore();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      toast.success('Logged out successfully');
    },
    onError: (error: any) => {
      // Even if server logout fails, clear local state
      clearAuth();
      queryClient.clear();
      toast.error(error.response?.data?.message || 'Logout completed');
    },
  });
}

export function useLogoutAllDevices() {
  const { clearAuth } = useAuthStore();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: { password?: string; twoFactorCode?: string } = {}) =>
      authService.logoutAllDevices(params.password ?? '', params.twoFactorCode),
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      toast.success('Logged out from all devices');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to logout all devices');
    },
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sessionId: string) => authService.revokeSession(sessionId),
    onSuccess: () => {
      toast.success('Session revoked successfully');
      queryClient.invalidateQueries({ queryKey: ['auth', 'sessions'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to revoke session');
    },
  });
}

export function useTrustDevice() {
  return useMutation({
    mutationFn: () => authService.trustDevice(),
    onSuccess: () => {
      toast.success('Device trusted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to trust device');
    },
  });
}

export function useResendEmailVerification() {
  return useMutation({
    mutationFn: (email: string) => authService.resendEmailVerification(email),
    onSuccess: () => {
      toast.success('Verification email sent!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send verification email');
    },
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => authService.verifyEmail(token),
    onSuccess: () => {
      toast.success('Email verified successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Email verification failed');
    },
  });
}

export function useRequest2FARecovery() {
  return useMutation({
    mutationFn: (email: string) => authService.request2FARecovery(email),
    onSuccess: (data) => {
      toast.success(data.message || 'Recovery request submitted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit recovery request');
    },
  });
}
