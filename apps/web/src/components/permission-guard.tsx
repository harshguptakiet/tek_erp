'use client';

import { usePermissions } from '../hooks/use-auth';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  role?: string;
  fallback?: React.ReactNode;
}

/**
 * Component-level permission guard
 * 
 * @example
 * <PermissionGuard permission="student.create">
 *   <CreateStudentButton />
 * </PermissionGuard>
 * 
 * @example
 * <PermissionGuard permissions={["student.read", "student.write"]} requireAll>
 *   <StudentForm />
 * </PermissionGuard>
 * 
 * @example
 * <PermissionGuard role="SUPER_ADMIN">
 *   <AdminPanel />
 * </PermissionGuard>
 */
export function PermissionGuard({
  children,
  permission,
  permissions,
  requireAll = false,
  role,
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole } = usePermissions();

  // Check role first
  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  // Check single permission
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  // Check multiple permissions
  if (permissions) {
    const hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

/**
 * Shorter alias
 */
export const Can = PermissionGuard;
