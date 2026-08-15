/**
 * Permissions Decorator
 * FR-AUTH-022: Define required permissions for endpoints
 */

import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Require specific permissions to access endpoint
 * @param permissions - Array of required permissions (OR logic: user needs ANY of these)
 * 
 * @example
 * @RequirePermissions('students:create', 'students:*')
 * async createStudent() { ... }
 */
export const RequirePermissions = (...permissions: string[]) => 
  SetMetadata(PERMISSIONS_KEY, permissions);
