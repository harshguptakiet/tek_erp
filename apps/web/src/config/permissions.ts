// Centralized permissions configuration
export const PERMISSIONS = {
  // Students
  STUDENTS_VIEW: 'students:view',
  STUDENTS_CREATE: 'students:create',
  STUDENTS_UPDATE: 'students:update',
  STUDENTS_DELETE: 'students:delete',

  // Teachers
  TEACHERS_VIEW: 'teachers:view',
  TEACHERS_CREATE: 'teachers:create',
  TEACHERS_UPDATE: 'teachers:update',
  TEACHERS_DELETE: 'teachers:delete',

  // Parents
  PARENTS_VIEW: 'parents:view',
  PARENTS_CREATE: 'parents:create',
  PARENTS_UPDATE: 'parents:update',

  // Academic
  ACADEMIC_VIEW: 'academic:view',
  ACADEMIC_MANAGE: 'academic:manage',

  // Classes
  CLASSES_VIEW: 'classes:view',
  CLASSES_CREATE: 'classes:create',
  CLASSES_UPDATE: 'classes:update',
  CLASSES_DELETE: 'classes:delete',

  // Subjects
  SUBJECTS_VIEW: 'subjects:view',
  SUBJECTS_CREATE: 'subjects:create',
  SUBJECTS_UPDATE: 'subjects:update',
  SUBJECTS_DELETE: 'subjects:delete',

  // Attendance
  ATTENDANCE_VIEW: 'attendance:view',
  ATTENDANCE_MARK: 'attendance:mark',
  ATTENDANCE_EDIT: 'attendance:edit',

  // Exams
  EXAMS_VIEW: 'exams:view',
  EXAMS_CREATE: 'exams:create',
  EXAMS_GRADE: 'exams:grade',

  // Assignments
  ASSIGNMENTS_VIEW: 'assignments:view',
  ASSIGNMENTS_CREATE: 'assignments:create',
  ASSIGNMENTS_GRADE: 'assignments:grade',

  // Content
  CONTENT_VIEW: 'content:view',
  CONTENT_UPLOAD: 'content:upload',
  CONTENT_EDIT: 'content:edit',
  CONTENT_DELETE: 'content:delete',

  // Fees
  FEES_VIEW: 'fees:view',
  FEES_MANAGE: 'fees:manage',
  FEES_COLLECT: 'fees:collect',

  // Reports
  REPORTS_VIEW: 'reports:view',
  REPORTS_GENERATE: 'reports:generate',

  // Admin
  ADMIN_ACCESS: 'admin:access',
  SETTINGS_MANAGE: 'settings:manage',
  USERS_MANAGE: 'users:manage',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
