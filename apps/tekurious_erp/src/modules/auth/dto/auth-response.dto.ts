export class AuthResponseDto {
  accessToken: string;
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
}

export class UserPayload {
  id: string;
  userId: string;
  email: string;
  tenantId?: string;
  roles: string[];
}
