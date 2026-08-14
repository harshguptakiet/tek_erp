/**
 * FR-AUTH-053: Permission Checking Hooks
 * React hooks for permission checking
 */

'use client';

import { useMemo } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import type { Permission } from '@/config/permissions';

/**
 * Hook to get all user permissions based on role
 */
export function usePermissions(): Permission[] {
  const { user } = useAuthStore();
  
  return useMemo(() => {
    if (!user) return [];
    
    // Super admin/Platform admin has all permissions
    if (user.isSuperAdmin || user.role === 'PLATFORM_ADMIN') {
      return ['*'] as Permission[]; // Wildcard for all permissions
    }
    
    // If permissions array exists, use it
    if (user.permissions && user.permissions.length > 0) {
      return user.permissions as Permission[];
    }
    
    // Otherwise, derive permissions from role
    return getRolePermissions(user.role);
  }, [user]);
}

/**
 * Get default permissions for a role
 * Cached to avoid recreating arrays on every call
 */
const ROLE_PERMISSIONS_CACHE: Record<string, Permission[]> = {
  // ========== ADMINS (Full Access) ==========
  'PLATFORM_ADMIN': ['*'] as Permission[],
  'ORG_ADMIN': ['*'] as Permission[],
  'SCHOOL_ADMIN': [
    // Students & Parents
    'students:view', 'students:create', 'students:update', 'students:delete', 'students:manage',
    'parents:view', 'parents:create', 'parents:update', 'parents:edit', 'parents:read',
    
    // Teachers & Staff
    'teachers:view', 'teachers:create', 'teachers:update', 'teachers:delete',
    
    // Academic
    'academic:view', 'academic:manage',
    'classes:view', 'classes:create', 'classes:update', 'classes:delete',
    'subjects:view', 'subjects:create', 'subjects:update', 'subjects:delete',
    
    // Attendance & Exams
    'attendance:view', 'attendance:mark', 'attendance:edit',
    'exams:view', 'exams:create', 'exams:grade', 'exams:manage',
    'assignments:view', 'assignments:create', 'assignments:grade',
    
    // Content & Classes
    'content:view', 'content:create', 'content:upload', 'content:edit', 'content:delete', 'content:manage',
    'live-classes:view', 'live-classes:create', 'live-classes:update', 'live-classes:manage',
    
    // Finance
    'fees:view', 'fees:manage', 'fees:collect',
    
    // Reports & Analytics
    'reports:view', 'reports:generate',
    'analytics:view', 'analytics:read',
    
    // Operations
    'timetable:create', 'timetable:update',
    'transport:view', 'transport:manage',
    'hostel:view', 'hostel:manage',
    'library:view', 'library:manage',
    'inventory:view', 'inventory:manage', 'inventory:create', 'inventory:update', 'inventory:delete',
    'payroll:view', 'payroll:manage', 'payroll:process', 'payroll:approve',
    
    // Admin
    'organization:update', 'org:settings', 'system:settings', 'admin:access', 'settings:manage', 'users:manage',
    'certificates:generate', 'id-cards:generate',
    'events:create', 'events:manage', 'ptm:manage',
    'messages:read',
  ],
  
  // ========== TEACHER (Teaching & Class Management) ==========
  'TEACHER': [
    // Can view students in their classes
    'students:view',
    
    // Can view classes they teach
    'classes:view',
    'subjects:view',
    
    // Attendance for their classes
    'attendance:view', 'attendance:mark',
    
    // Exams & Grading
    'exams:view', 'exams:grade',
    'assignments:view', 'assignments:create', 'assignments:grade',
    
    // Content creation
    'content:view', 'content:create', 'content:upload',
    
    // Live classes
    'live-classes:view', 'live-classes:create',
    
    // Communication
    'messages:read',
    
    // Can view timetable
    'academic:view',
  ],
  
  // ========== STUDENT (Learning & Submissions) ==========
  'STUDENT': [
    // View own data
    'attendance:view',
    'exams:view',
    
    // Assignments
    'assignments:view', 'assignments:submit',
    
    // Content access
    'content:view',
    
    // Classes
    'live-classes:view',
    'academic:view',
    
    // Fees
    'fees:view', 'fees:pay',
    
    // Communication
    'messages:read',
  ],
  
  // ========== PARENT (Child Monitoring & Payment) ==========
  'PARENT': [
    // View children's data
    'students:view',
    'parents:view',
    
    // Monitor progress
    'attendance:view',
    'exams:view',
    'assignments:view',
    'academic:view',
    
    // Fees & Payments
    'fees:view', 'fees:pay',
    
    // Reports
    'reports:view',
    'analytics:read',
    
    // Communication  
    'messages:read',
    'ptm:manage', // Parent-teacher meetings
  ],
};

function getRolePermissions(role: string | undefined): Permission[] {
  if (!role) return [];
  return ROLE_PERMISSIONS_CACHE[role] || [];
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
  const hasPermission = useHasPermission(options.permission as Permission);
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
