export class AuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    tenantId?: string;
    roles?: string[];
  };
}

export class UserPayload {
  id: string;
  userId: string;
  email: string;
  tenantId?: string;
  roles: string[];
}
