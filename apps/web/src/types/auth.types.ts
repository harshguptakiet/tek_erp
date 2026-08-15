/**
 * Authentication Types
 * Based on Module 01: Authentication Requirements
 */

export type AuthProvider = 'EMAIL' | 'PHONE' | 'GOOGLE' | 'MICROSOFT' | 'AADHAAR';

export type AccountStatus = 
  | 'ACTIVE' 
  | 'INACTIVE' 
  | 'SUSPENDED' 
  | 'PENDING_VERIFICATION' 
  | 'DEACTIVATED'
  | 'DELETED'
  | 'ON_LEAVE';

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  phone?: string;
  phoneVerified: boolean;
  firstName: string;
  lastName: string;
  middleName?: string;
  profilePicture?: string;
  role: string[];
  organizationId?: string;
  status: AccountStatus;
  twoFactorEnabled: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email?: string;
  phone?: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email?: string;
  phone?: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  role?: string;
  organizationId?: string;
  acceptTerms: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  requiresTwoFactor?: boolean;
  twoFactorToken?: string;
  isNewUser?: boolean;
}

export interface TwoFactorSetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface DeviceSession {
  id: string;
  userId?: string;
  deviceName?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  // Backend (getAllSessions) returns location as an object, not a string
  location?: string | { city?: string; region?: string; country?: string } | null;
  lastActivity?: Date | string | null;
  lastActivityAt?: Date | string | null;
  createdAt?: Date | string;
  isCurrent?: boolean;
}

export type LoginHistoryEntry = LoginHistory;

export interface LoginHistory {
  id: string;
  userId?: string;
  ipAddress?: string;
  // Backend (getLoginHistory) returns location as an object, not a string
  location?: string | { city?: string; region?: string; country?: string; countryCode?: string } | null;
  device?: string;
  browser?: string;
  os?: string;
  method?: string;
  success: boolean;
  timestamp: Date | string;
  suspicious?: boolean;
  isSuspicious?: boolean;
  failureReason?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  logoutOtherDevices?: boolean;
}

export interface OAuthCallbackParams {
  code: string;
  state: string;
  provider: 'google' | 'microsoft';
}
