// Centralized permissions configuration
export const PERMISSIONS = {
  // Students
  STUDENTS_VIEW: 'students:view',
  STUDENTS_CREATE: 'students:create',
  STUDENTS_UPDATE: 'students:update',
  STUDENTS_DELETE: 'students:delete',
  STUDENTS_MANAGE: 'students:manage',

  // Teachers
  TEACHERS_VIEW: 'teachers:view',
  TEACHERS_CREATE: 'teachers:create',
  TEACHERS_UPDATE: 'teachers:update',
  TEACHERS_DELETE: 'teachers:delete',

  // Parents
  PARENTS_VIEW: 'parents:view',
  PARENTS_READ: 'parents:read',
  PARENTS_CREATE: 'parents:create',
  PARENTS_UPDATE: 'parents:update',
  PARENTS_EDIT: 'parents:edit',

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
  EXAMS_MANAGE: 'exams:manage',

  // Assignments
  ASSIGNMENTS_VIEW: 'assignments:view',
  ASSIGNMENTS_CREATE: 'assignments:create',
  ASSIGNMENTS_GRADE: 'assignments:grade',
  ASSIGNMENTS_SUBMIT: 'assignments:submit',

  // Content
  CONTENT_VIEW: 'content:view',
  CONTENT_CREATE: 'content:create',
  CONTENT_UPLOAD: 'content:upload',
  CONTENT_EDIT: 'content:edit',
  CONTENT_DELETE: 'content:delete',
  CONTENT_MANAGE: 'content:manage',

  // Fees
  FEES_VIEW: 'fees:view',
  FEES_MANAGE: 'fees:manage',
  FEES_COLLECT: 'fees:collect',
  FEES_PAY: 'fees:pay',
  FEE_VIEW: 'fees:view',

  // Reports
  REPORTS_VIEW: 'reports:view',
  REPORTS_GENERATE: 'reports:generate',

  // Analytics
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_READ: 'analytics:read',

  // Live Classes
  LIVE_CLASSES_VIEW: 'live-classes:view',
  LIVE_CLASSES_CREATE: 'live-classes:create',
  LIVE_CLASSES_UPDATE: 'live-classes:update',
  LIVE_CLASSES_MANAGE: 'live-classes:manage',

  // Timetable
  TIMETABLE_CREATE: 'timetable:create',
  TIMETABLE_UPDATE: 'timetable:update',

  // Transport
  TRANSPORT_VIEW: 'transport:view',
  TRANSPORT_MANAGE: 'transport:manage',

  // Hostel
  HOSTEL_VIEW: 'hostel:view',
  HOSTEL_MANAGE: 'hostel:manage',

  // Inventory
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_MANAGE: 'inventory:manage',
  INVENTORY_CREATE: 'inventory:create',
  INVENTORY_UPDATE: 'inventory:update',
  INVENTORY_DELETE: 'inventory:delete',

  // Payroll
  PAYROLL_VIEW: 'payroll:view',
  PAYROLL_MANAGE: 'payroll:manage',
  PAYROLL_PROCESS: 'payroll:process',
  PAYROLL_APPROVE: 'payroll:approve',

  // Organization & Admin
  ORGANIZATION_UPDATE: 'organization:update',
  ORG_SETTINGS: 'org:settings',
  SYSTEM_SETTINGS: 'system:settings',
  ADMIN_ACCESS: 'admin:access',
  SETTINGS_MANAGE: 'settings:manage',
  USERS_MANAGE: 'users:manage',

  // Certificates & Cards
  CERTIFICATES_GENERATE: 'certificates:generate',
  ID_CARDS_GENERATE: 'id-cards:generate',

  // Learning Paths & Other
  LEARNING_PATHS_CREATE: 'learning-paths:create',
  LEARNING_PATHS_ASSIGN: 'learning-paths:assign',
  // Library
  LIBRARY_VIEW: 'library:view',
  LIBRARY_MANAGE: 'library:manage',
  MESSAGES_READ: 'messages:read',
  EVENTS_CREATE: 'events:create',
  EVENTS_MANAGE: 'events:manage',
  PTM_MANAGE: 'ptm:manage',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

