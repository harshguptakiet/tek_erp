export class AuthResponseDto {
  accessToken: string;
  refreshToken?: string; // FR-AUTH-014: Refresh token for token rotation
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role?: string;
    roles?: string[];
    permissions?: string[];
    tenantId?: string;
    organizationId?: string;
    schoolId?: string;
    status?: string;
  };
  // FR-AUTH-009: Remember Me support
  rememberMe?: boolean;
  tokenExpiry?: number; // Token expiry in seconds
}

export class UserPayload {
  id: string;
  userId: string;
  email: string;
  tenantId?: string;
  roles: string[];
}
