import { apiClient } from '../lib/axios';

// DTOs - These should ideally come from OpenAPI code generation
export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    permissions: string[];
    organizationId?: string;
    schoolId?: string;
    status: string;
  };
  accessToken: string;
}

// Auth Service
export const authService = {
  /**
   * Login with email and password
   */
  async login(data: LoginDto): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * Register new user
   */
  async register(data: RegisterDto): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Logout (clears refresh cookie on server)
   */
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  /**
   * Get current user profile
   */
  async getMe(): Promise<LoginResponse> {
    const response = await apiClient.get<LoginResponse>('/auth/me');
    return response.data;
  },

  /**
   * Refresh access token (uses HttpOnly cookie)
   */
  async refresh(): Promise<{ accessToken: string }> {
    const response = await apiClient.post<{ accessToken: string }>('/auth/refresh');
    return response.data;
  },

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordDto): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/forgot-password', data);
    return response.data;
  },

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordDto): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/reset-password', data);
    return response.data;
  },

  /**
   * Change password (authenticated)
   */
  async changePassword(data: ChangePasswordDto): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/change-password', data);
    return response.data;
  },

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/verify-email', { token });
    return response.data;
  },

  /**
   * Resend verification email
   */
  async resendVerification(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/resend-verification', { email });
    return response.data;
  },

  /**
   * Verify 2FA code during login
   */
  async verify2FA(twoFactorToken: string, code: string): Promise<{ user: any; tokens: { accessToken: string; refreshToken: string } }> {
    const response = await apiClient.post('/auth/2fa/verify', { twoFactorToken, code });
    return response.data;
  },

  /**
   * Complete OAuth callback authentication
   */
  async handleOAuthCallback(data: { provider: 'google' | 'microsoft'; code: string; state: string }): Promise<{ user: any; accessToken: string; isNewUser?: boolean }> {
    const response = await apiClient.post(`/auth/oauth/${data.provider}/callback`, data);
    return response.data;
  },

  /**
   * Verify 2FA backup code during login
   */
  async verifyBackupCode(twoFactorToken: string, backupCode: string): Promise<{ user: any; tokens: { accessToken: string; refreshToken: string } }> {
    const response = await apiClient.post('/auth/2fa/verify-backup', { twoFactorToken, backupCode });
    return response.data;
  },

  /**
   * Initiate 2FA setup
   */
  async enable2FA(): Promise<{ secret: string; qrCode: string }> {
    const response = await apiClient.post('/auth/2fa/enable');
    return response.data;
  },

  /**
   * Verify 2FA setup with code
   */
  async verify2FASetup(code: string): Promise<{ backupCodes: string[] }> {
    const response = await apiClient.post('/auth/2fa/verify-setup', { code });
    return response.data;
  },

  /**
   * Disable 2FA
   */
  async disable2FA(password: string, code: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/2fa/disable', { password, code });
    return response.data;
  },

  /**
   * Logout from all devices
   */
  async logoutAllDevices(password: string, twoFactorCode?: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/logout-all', { password, twoFactorCode });
    return response.data;
  },

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionId: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/auth/sessions/${sessionId}`);
    return response.data;
  },

  /**
   * Mark current device as trusted
   */
  async trustDevice(): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/trust-device');
    return response.data;
  },

  /**
   * Resend email verification
   */
  async resendEmailVerification(email: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/resend-email-verification', { email });
    return response.data;
  },

  /**
   * Request 2FA recovery
   */
  async request2FARecovery(email: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/2fa/recovery-request', { email });
    return response.data;
  },

  /**
   * Get active sessions
   */
  async getSessions(): Promise<any[]> {
    const response = await apiClient.get('/auth/sessions');
    return response.data;
  },

  /**
   * Get login history
   */
  async getLoginHistory(params?: { page?: number; limit?: number }): Promise<{ history: any[] }> {
    const response = await apiClient.get('/auth/login-history', { params });
    return response.data;
  },

  /**
   * Get 2FA backup codes
   */
  async getBackupCodes(): Promise<{ backupCodes: string[] }> {
    const response = await apiClient.get('/auth/2fa/backup-codes');
    return response.data;
  },

  /**
   * Check password expiry status
   */
  async checkPasswordExpiry(): Promise<{ isExpired: boolean; daysRemaining: number }> {
    const response = await apiClient.get('/auth/password-expiry');
    return response.data;
  },

  /**
   * Check account lock status
   */
  async checkLockStatus(email?: string): Promise<{ isLocked: boolean; lockedUntil?: string }> {
    const response = await apiClient.get('/auth/lock-status', { params: { email } });
    return response.data;
  },
};
