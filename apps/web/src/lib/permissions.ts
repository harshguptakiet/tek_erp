/**
 * Permission System
 * Defines permissions and role-based access control
 */

export type Permission =
  // Students
  | 'student.create'
  | 'student.view'
  | 'student.edit'
  | 'student.delete'
  | 'student.bulk_import'
  // Teachers
  | 'teacher.create'
  | 'teacher.view'
  | 'teacher.edit'
  | 'teacher.delete'
  // Attendance
  | 'attendance.mark'
  | 'attendance.view'
  | 'attendance.edit'
  | 'attendance.delete'
  // Fees
  | 'fee.create'
  | 'fee.collect'
  | 'fee.view'
  | 'fee.refund'
  // Exams
  | 'exam.create'
  | 'exam.view'
  | 'exam.edit'
  | 'exam.grade'
  | 'exam.publish'
  // Classes
  | 'class.create'
  | 'class.view'
  | 'class.edit'
  | 'class.delete'
  // Analytics
  | 'analytics.view'
  | 'analytics.export'
  // Settings
  | 'settings.view'
  | 'settings.edit'
  // Organizations
  | 'organization.create'
  | 'organization.view'
  | 'organization.edit'
  | 'organization.delete';

export type Role = 
  | 'ADMIN' 
  | 'TEACHER' 
  | 'STUDENT' 
  | 'PARENT' 
  | 'PRINCIPAL'
  | 'ACCOUNTANT';

export const rolePermissions: Record<Role, Permission[]> = {
  ADMIN: [
    // All permissions
    'student.create',
    'student.view',
    'student.edit',
    'student.delete',
    'student.bulk_import',
    'teacher.create',
    'teacher.view',
    'teacher.edit',
    'teacher.delete',
    'attendance.mark',
    'attendance.view',
    'attendance.edit',
    'attendance.delete',
    'fee.create',
    'fee.collect',
    'fee.view',
    'fee.refund',
    'exam.create',
    'exam.view',
    'exam.edit',
    'exam.grade',
    'exam.publish',
    'class.create',
    'class.view',
    'class.edit',
    'class.delete',
    'analytics.view',
    'analytics.export',
    'settings.view',
    'settings.edit',
    'organization.create',
    'organization.view',
    'organization.edit',
    'organization.delete',
  ],
  
  PRINCIPAL: [
    'student.view',
    'student.edit',
    'teacher.view',
    'teacher.edit',
    'attendance.view',
    'fee.view',
    'exam.view',
    'exam.publish',
    'class.view',
    'class.edit',
    'analytics.view',
    'analytics.export',
    'settings.view',
  ],

  TEACHER: [
    'student.view',
    'attendance.mark',
    'attendance.view',
    'exam.view',
    'exam.grade',
    'class.view',
    'analytics.view',
  ],

  ACCOUNTANT: [
    'student.view',
    'fee.create',
    'fee.collect',
    'fee.view',
    'fee.refund',
    'analytics.view',
  ],

  STUDENT: [
    'attendance.view',
    'exam.view',
    'class.view',
    'fee.view',
  ],

  PARENT: [
    'student.view', // View own children
    'attendance.view',
    'exam.view',
    'class.view',
    'fee.view',
  ],
};

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  userPermissions: Permission[], 
  required: Permission
): boolean {
  return userPermissions.includes(required);
}

/**
 * Check if user has any of the required permissions
 */
export function hasAnyPermission(
  userPermissions: Permission[], 
  required: Permission[]
): boolean {
  return required.some(permission => userPermissions.includes(permission));
}

/**
 * Check if user has all required permissions
 */
export function hasAllPermissions(
  userPermissions: Permission[], 
  required: Permission[]
): boolean {
  return required.every(permission => userPermissions.includes(permission));
}

/**
 * Get permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return rolePermissions[role] || [];
}
