/**
 * Permissions Guard
 * FR-AUTH-022: Permission checking on every action
 * Enforces granular permissions based on roles
 */

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required permissions from decorator
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no permissions specified, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Super admin bypasses all permission checks
    if (user.role === 'PLATFORM_ADMIN' || user.roles?.includes('PLATFORM_ADMIN')) {
      return true;
    }

    // Check if user has any of the required permissions
    const userPermissions = user.permissions || user.roles || [];
    
    // For now, we use roles as permissions
    // In future: fetch actual permissions from role-permission mappings
    const hasPermission = requiredPermissions.some(permission => 
      userPermissions.includes(permission) || 
      userPermissions.includes('*') // Wildcard permission
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredPermissions.join(' OR ')}`
      );
    }

    return true;
  }
}
