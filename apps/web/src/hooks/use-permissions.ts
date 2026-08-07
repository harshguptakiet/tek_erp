/**
 * FR-AUTH-053: Permission Checking Hooks
 * React hooks for permission checking
 */

'use client';

import { useMemo } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import type { Permission } from '@/config/permissions';

/**
 * Hook to get all user permissions
 */
export function usePermissions(): Permission[] {
  const { user } = useAuthStore();
  
  return useMemo(() => {
    if (!user) return [];
    
    // Super admin has all permissions
    if (user.isSuperAdmin) {
      return ['*']; // Wildcard for all permissions
    }
    
    return user.permissions || [];
  }, [user]);
}

/**
 * Hook to check if user has a specific permission
 */
export function useHasPermission(permission: Permission): boolean {
  const permissions = usePermissions();
  const { user } = useAuthStore();
  
  return useMemo(() => {
    if (!user) return false;
    
    // Super admin has all permissions
    if (user.isSuperAdmin) return true;
    
    // Check if user has wildcard permission
    if (permissions.includes('*')) return true;
    
    // Check if user has the specific permission
    return permissions.includes(permission);
  }, [permissions, permission, user]);
}

/**
 * Hook to check if user has ANY of the specified permissions
 */
export function useHasAnyPermission(requiredPermissions: Permission[]): boolean {
  const permissions = usePermissions();
  const { user } = useAuthStore();
  
  return useMemo(() => {
    if (!user) return false;
    
    // Super admin has all permissions
    if (user.isSuperAdmin) return true;
    
    // Check if user has wildcard permission
    if (permissions.includes('*')) return true;
    
    // Check if user has at least one of the required permissions
    return requiredPermissions.some(permission => 
      permissions.includes(permission)
    );
  }, [permissions, requiredPermissions, user]);
}

/**
 * Hook to check if user has ALL of the specified permissions
 */
export function useHasAllPermissions(requiredPermissions: Permission[]): boolean {
  const permissions = usePermissions();
  const { user } = useAuthStore();
  
  return useMemo(() => {
    if (!user) return false;
    
    // Super admin has all permissions
    if (user.isSuperAdmin) return true;
    
    // Check if user has wildcard permission
    if (permissions.includes('*')) return true;
    
    // Check if user has all required permissions
    return requiredPermissions.every(permission => 
      permissions.includes(permission)
    );
  }, [permissions, requiredPermissions, user]);
}

/**
 * Hook to check if user has a specific role
 */
export function useHasRole(role: string): boolean {
  const { user } = useAuthStore();
  
  return useMemo(() => {
    if (!user) return false;

    return user.role === role || (user.roles?.includes(role) ?? false);
  }, [user, role]);
}

/**
 * Hook to check if user has ANY of the specified roles
 */
export function useHasAnyRole(roles: string[]): boolean {
  const { user } = useAuthStore();
  
  return useMemo(() => {
    if (!user) return false;
    
    if (user.role && roles.includes(user.role)) return true;
    
    if (user.roles) {
      return roles.some(role => user.roles?.includes(role));
    }
    
    return false;
  }, [user, roles]);
}

/**
 * Hook to check if user owns a resource
 * Useful for checking if user can edit their own profile
 */
export function useIsResourceOwner(resourceUserId: string | undefined): boolean {
  const { user } = useAuthStore();
  
  return useMemo(() => {
    if (!user || !resourceUserId) return false;
    
    return user.id === resourceUserId;
  }, [user, resourceUserId]);
}

/**
 * Hook for permission-based feature flags
 */
export function useFeatureAccess(feature: string): boolean {
  const { user } = useAuthStore();
  
  return useMemo(() => {
    if (!user) return false;
    
    // Feature flags could be stored in user object or fetched separately
    // For now, using role-based access
    const featureRoleMap: Record<string, string[]> = {
      'advanced-analytics': ['SUPER_ADMIN', 'SCHOOL_ADMIN'],
      'bulk-operations': ['SUPER_ADMIN', 'SCHOOL_ADMIN'],
      'api-access': ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'],
      'live-classes': ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT'],
      'arvr-content': ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'],
    };
    
    const allowedRoles = featureRoleMap[feature] || [];
    
    if (user.isSuperAdmin) return true;
    
    return allowedRoles.includes(user.role || '');
  }, [user, feature]);
}

/**
 * Combined permission check hook with multiple options
 */
export function useCanAccess(options: {
  permission?: Permission;
  permissions?: Permission[];
  role?: string;
  roles?: string[];
  requireAll?: boolean;
  isOwner?: boolean;
  resourceUserId?: string;
}): boolean {
  const hasPermission = useHasPermission(options.permission || '');
  const hasAnyPermission = useHasAnyPermission(options.permissions || []);
  const hasAllPermissions = useHasAllPermissions(options.permissions || []);
  const hasRole = useHasRole(options.role || '');
  const hasAnyRole = useHasAnyRole(options.roles || []);
  const isOwner = useIsResourceOwner(options.resourceUserId);
  
  const { user } = useAuthStore();
  
  return useMemo(() => {
    if (!user) return false;
    
    // Super admin always has access
    if (user.isSuperAdmin) return true;
    
    // Check ownership
    if (options.isOwner && !isOwner) return false;
    
    // Check single permission
    if (options.permission && !hasPermission) return false;
    
    // Check multiple permissions
    if (options.permissions && options.permissions.length > 0) {
      if (options.requireAll) {
        if (!hasAllPermissions) return false;
      } else {
        if (!hasAnyPermission) return false;
      }
    }
    
    // Check single role
    if (options.role && !hasRole) return false;
    
    // Check multiple roles
    if (options.roles && options.roles.length > 0 && !hasAnyRole) return false;
    
    return true;
  }, [
    user,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    isOwner,
    options,
  ]);
}
