/**
 * Complete Authentication Service
 * Implements all Module 01 requirements (71 features)
 */

import { apiClient } from '../lib/axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  TwoFactorSetupResponse,
  DeviceSession,
  LoginHistory,
  PasswordResetRequest,
  PasswordResetConfirm,
  ChangePasswordRequest,
  OAuthCallbackParams,
} from '../types/auth.types';

const AUTH_ENDPOINTS = {
  // Registration (FR-AUTH-001 to FR-AUTH-005)
  register: '/auth/register',
  registerPhone: '/auth/register-phone',
  verifyEmail: '/auth/verify-email',
  verifyPhone: '/auth/verify-otp',
  resendVerification: '/auth/resend-verification',
  resendOTP: '/auth/resend-otp',
  
  // Login (FR-AUTH-011 to FR-AUTH-020)
  login: '/auth/login',
  loginPhone: '/auth/login-phone',
  oauthGoogle: '/auth/oauth/google',
  oauthMicrosoft: '/auth/oauth/microsoft',
  oauthCallback: '/auth/oauth/callback',
  checkLockStatus: '/auth/check-lock',
  
  // 2FA (FR-AUTH-021 to FR-AUTH-030)
  enable2FA: '/auth/2fa/enable',
  verify2FASetup: '/auth/2fa/verify-setup',
  verify2FA: '/auth/2fa/verify',
  disable2FA: '/auth/2fa/disable',
  regenerateBackupCodes: '/auth/2fa/backup-codes/regenerate',
  getBackupCodes: '/auth/2fa/backup-codes',
  verifyBackupCode: '/auth/2fa/verify-backup',
  request2FARecovery: '/auth/2fa/recovery',
  
  // Session Management (FR-AUTH-031 to FR-AUTH-040)
  refreshToken: '/auth/refresh',
  getSessions: '/auth/sessions',
  revokeSession: (sessionId: string) => `/auth/sessions/${sessionId}`,
  revokeAllSessions: '/auth/sessions/revoke-all',
  getLoginHistory: '/auth/login-history',
  trustDevice: '/auth/device/trust',
  
  // Password Management (FR-AUTH-041 to FR-AUTH-050)
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  changePassword: '/auth/change-password',
  checkPasswordExpiry: '/auth/password-expiry',
  
  // Logout (FR-AUTH-074 to FR-AUTH-081)
  logout: '/auth/logout',
  logoutAllDevices: '/auth/logout-all',
  emergencyLogout: '/auth/emergency-logout',
};

export const authService = {
  // ========== REGISTRATION ==========
  
  /**
   * FR-AUTH-001: Email Registration
   */
  async registerWithEmail(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      AUTH_ENDPOINTS.register,
      data
    );
    return response.data;
  },

  /**
   * FR-AUTH-002: Phone Registration
   */
  async registerWithPhone(data: Omit<RegisterRequest, 'email'> & { phone: string }): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      AUTH_ENDPOINTS.registerPhone,
      data
    );
    return response.data;
  },

  /**
   * FR-AUTH-006: Email Verification
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(AUTH_ENDPOINTS.verifyEmail, { token });
    return response.data;
  },

  /**
   * FR-AUTH-007: Phone Verification
   */
  async verifyPhone(phone: string, otp: string): Promise<{ success: boolean }> {
    const response = await apiClient.post(AUTH_ENDPOINTS.verifyPhone, { phone, otp });
    return response.data;
  },

  /**
   * Resend email verification
   */
  async resendEmailVerification(email: string): Promise<{ success: boolean }> {
    const response = await apiClient.post(AUTH_ENDPOINTS.resendVerification, { email });
    return response.data;
  },

  /**
   * Resend phone OTP
   */
  async resendPhoneOTP(phone: string): Promise<{ success: boolean }> {
    const response = await apiClient.post(AUTH_ENDPOINTS.resendOTP, { phone });
    return response.data;
  },

  // ========== LOGIN ==========
  
  /**
   * FR-AUTH-011: Email/Password Login
   */
  async loginWithEmail(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      AUTH_ENDPOINTS.login,
      credentials
    );
    return response.data;
  },

  /**
   * FR-AUTH-012: Phone/Password Login
   */
  async loginWithPhone(phone: string, password: string, rememberMe?: boolean): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      AUTH_ENDPOINTS.loginPhone,
      { phone, password, rememberMe }
    );
    return response.data;
  },

  /**
   * FR-AUTH-013: OAuth Login - Google
   */
  async initiateGoogleOAuth(): Promise<{ authUrl: string }> {
    const response = await apiClient.get(AUTH_ENDPOINTS.oauthGoogle);
    return response.data;
  },

  /**
   * FR-AUTH-013: OAuth Login - Microsoft
   */
  async initiateMicrosoftOAuth(): Promise<{ authUrl: string }> {
    const response = await apiClient.get(AUTH_ENDPOINTS.oauthMicrosoft);
    return response.data;
  },

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(params: OAuthCallbackParams): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      AUTH_ENDPOINTS.oauthCallback,
      params
    );
    return response.data;
  },

  /**
   * FR-AUTH-015: Check account lock status
   */
  async checkLockStatus(email: string): Promise<{ isLocked: boolean; attemptsRemaining?: number; lockoutEndsAt?: Date }> {
    const response = await apiClient.post(AUTH_ENDPOINTS.checkLockStatus, { email });
    return response.data;
  },

  // ========== 2FA ==========
  
  /**
   * FR-AUTH-021: Enable TOTP 2FA
   */
  async enable2FA(): Promise<TwoFactorSetupResponse> {
    const response = await apiClient.post<TwoFactorSetupResponse>(
      AUTH_ENDPOINTS.enable2FA
    );
    return response.data;
  },

  /**
   * Verify 2FA setup
   */
  async verify2FASetup(code: string): Promise<{ success: boolean; backupCodes: string[] }> {
    const response = await apiClient.post(AUTH_ENDPOINTS.verify2FASetup, { code });
    return response.data;
  },

  /**
   * FR-AUTH-022: Verify 2FA code during login
   */
  async verify2FA(twoFactorToken: string, code: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      AUTH_ENDPOINTS.verify2FA,
      { twoFactorToken, code }
    );
    return response.data;
  },

  /**
   * Verify backup code
   */
  async verifyBackupCode(twoFactorToken: string, backupCode: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      AUTH_ENDPOINTS.verifyBackupCode,
      { twoFactorToken, backupCode }
    );
    return response.data;
  },

  /**
   * FR-AUTH-023: Disable 2FA
   */
  async disable2FA(password: string, code: string): Promise<{ success: boolean }> {
    const response = await apiClient.post(AUTH_ENDPOINTS.disable2FA, { password, code });
    return response.data;
  },

  /**
   * FR-AUTH-024: Regenerate backup codes
   */
  async regenerateBackupCodes(password?: string): Promise<{ backupCodes: string[] }> {
    const response = await apiClient.post(AUTH_ENDPOINTS.regenerateBackupCodes, { password: password ?? '' });
    return response.data;
  },

  /**
   * Get current backup codes
   */
  async getBackupCodes(): Promise<{ codes: Array<{ code: string; used: boolean }>; remaining: number }> {
    const response = await apiClient.get(AUTH_ENDPOINTS.getBackupCodes);
    const data = response.data as { codes: Array<{ code: string; used: boolean }>; remaining?: number };
    return {
      ...data,
      remaining: data.remaining ?? data.codes.filter((c) => !c.used).length,
    };
  },

  /**
   * FR-AUTH-025: Request 2FA recovery
   */
  async request2FARecovery(email: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(AUTH_ENDPOINTS.request2FARecovery, { email });
    return response.data;
  },

  // ========== SESSION MANAGEMENT ==========
  
  /**
   * FR-AUTH-031: Refresh access token
   */
  async refreshAccessToken(): Promise<{ accessToken: string; expiresIn: number }> {
    const response = await apiClient.post(AUTH_ENDPOINTS.refreshToken);
    return response.data;
  },

  /**
   * FR-AUTH-033: Get all device sessions
   */
  async getSessions(): Promise<{ sessions: DeviceSession[]; currentSessionId?: string }> {
    const response = await apiClient.get(AUTH_ENDPOINTS.getSessions);
    return response.data;
  },

  /**
   * Revoke specific session
   */
  async revokeSession(sessionId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete(AUTH_ENDPOINTS.revokeSession(sessionId));
    return response.data;
  },

  /**
   * Revoke all sessions except current
   */
  async revokeAllSessions(): Promise<{ success: boolean; revokedCount: number }> {
    const response = await apiClient.post(AUTH_ENDPOINTS.revokeAllSessions);
    return response.data;
  },

  /**
   * FR-AUTH-018: Get login history
   */
  async getLoginHistory(params?: { page?: number; limit?: number }): Promise<{ history: LoginHistory[] }> {
    const response = await apiClient.get(AUTH_ENDPOINTS.getLoginHistory, { params });
    return response.data;
  },

  /**
   * FR-AUTH-017: Trust current device
   */
  async trustDevice(): Promise<{ success: boolean }> {
    const response = await apiClient.post(AUTH_ENDPOINTS.trustDevice);
    return response.data;
  },

  // ========== PASSWORD MANAGEMENT ==========
  
  /**
   * FR-AUTH-041: Request password reset
   */
  async requestPasswordReset(data: PasswordResetRequest): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(AUTH_ENDPOINTS.forgotPassword, data);
    return response.data;
  },

  /**
   * Confirm password reset with token
   */
  async resetPassword(data: PasswordResetConfirm): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(AUTH_ENDPOINTS.resetPassword, data);
    return response.data;
  },

  /**
   * FR-AUTH-042: Change password (authenticated)
   */
  async changePassword(data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(AUTH_ENDPOINTS.changePassword, data);
    return response.data;
  },

  /**
   * FR-AUTH-043: Check password expiry status
   */
  async checkPasswordExpiry(): Promise<{ 
    expiresAt: Date; 
    daysRemaining: number; 
    isExpired: boolean;
    requiresChange: boolean;
  }> {
    const response = await apiClient.get(AUTH_ENDPOINTS.checkPasswordExpiry);
    return response.data;
  },

  // ========== LOGOUT ==========
  
  /**
   * FR-AUTH-074: Standard logout
   */
  async logout(): Promise<{ success: boolean }> {
    const response = await apiClient.post(AUTH_ENDPOINTS.logout);
    return response.data;
  },

  /**
   * FR-AUTH-075: Logout all devices
   */
  async logoutAllDevices(password: string, twoFactorCode?: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(AUTH_ENDPOINTS.logoutAllDevices, {
      password,
      twoFactorCode,
    });
    return response.data;
  },

  /**
   * FR-AUTH-081: Emergency logout (no confirmation)
   */
  async emergencyLogout(): Promise<{ success: boolean }> {
    const response = await apiClient.post(AUTH_ENDPOINTS.emergencyLogout);
    return response.data;
  },

  // Aliases for page compatibility
  registerPhone: async (data: Omit<RegisterRequest, 'email'> & { phone: string }) =>
    authService.registerWithPhone(data),
  verifyPhoneOTP: async (phone: string, otp: string) => authService.verifyPhone(phone, otp),
  resendVerificationEmail: async (email: string) => authService.resendEmailVerification(email),
};
