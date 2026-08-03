/**
 * FR-AUTH-053: Permission Checking Components
 * Declarative permission-based rendering components
 */

'use client';

import { ReactNode } from 'react';
import { useHasPermission, useHasAnyPermission, useHasAllPermissions, useCanAccess } from '@/hooks/use-permissions';
import type { Permission } from '@/config/permissions';

interface CanProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component to conditionally render based on a single permission
 * @example
 * <Can permission="users:create">
 *   <CreateUserButton />
 * </Can>
 */
export function Can({ permission, children, fallback = null }: CanProps) {
  const hasPermission = useHasPermission(permission);
  
  return hasPermission ? <>{children}</> : <>{fallback}</>;
}

interface CanAnyProps {
  permissions: Permission[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component to conditionally render if user has ANY of the specified permissions
 * @example
 * <CanAny permissions={['users:create', 'users:update']}>
 *   <UserManagementButton />
 * </CanAny>
 */
export function CanAny({ permissions, children, fallback = null }: CanAnyProps) {
  const hasAnyPermission = useHasAnyPermission(permissions);
  
  return hasAnyPermission ? <>{children}</> : <>{fallback}</>;
}

interface CanAllProps {
  permissions: Permission[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component to conditionally render if user has ALL of the specified permissions
 * @example
 * <CanAll permissions={['users:create', 'users:delete']}>
 *   <AdminPanel />
 * </CanAll>
 */
export function CanAll({ permissions, children, fallback = null }: CanAllProps) {
  const hasAllPermissions = useHasAllPermissions(permissions);
  
  return hasAllPermissions ? <>{children}</> : <>{fallback}</>;
}

interface CanAccessProps {
  permission?: Permission;
  permissions?: Permission[];
  role?: string;
  roles?: string[];
  requireAll?: boolean;
  isOwner?: boolean;
  resourceUserId?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component with advanced permission checking options
 * @example
 * <CanAccess 
 *   permissions={['users:update']} 
 *   isOwner 
 *   resourceUserId={userId}
 * >
 *   <EditProfileButton />
 * </CanAccess>
 */
export function CanAccess({
  permission,
  permissions,
  role,
  roles,
  requireAll,
  isOwner,
  resourceUserId,
  children,
  fallback = null,
}: CanAccessProps) {
  const canAccess = useCanAccess({
    permission,
    permissions,
    role,
    roles,
    requireAll,
    isOwner,
    resourceUserId,
  });
  
  return canAccess ? <>{children}</> : <>{fallback}</>;
}

interface CannotProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component to conditionally render if user DOES NOT have permission
 * Opposite of <Can>
 * @example
 * <Cannot permission="users:create">
 *   <UpgradePrompt />
 * </Cannot>
 */
export function Cannot({ permission, children, fallback = null }: CannotProps) {
  const hasPermission = useHasPermission(permission);
  
  return !hasPermission ? <>{children}</> : <>{fallback}</>;
}
