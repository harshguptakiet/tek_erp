/**
 * FR-AUTH-054: Permission Groups and Definitions
 * Centralized permission configuration
 */

export type Permission = string;

export const PERMISSIONS = {
  // Users Module
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  USERS_MANAGE_ROLES: 'users:manage_roles',
  
  // Students Module
  STUDENTS_VIEW: 'students:view',
  STUDENTS_CREATE: 'students:create',
  STUDENTS_UPDATE: 'students:update',
  STUDENTS_DELETE: 'students:delete',
  STUDENTS_VIEW_RECORDS: 'students:view_records',
  STUDENTS_UPDATE_RECORDS: 'students:update_records',
  
  // Teachers Module
  TEACHERS_VIEW: 'teachers:view',
  TEACHERS_CREATE: 'teachers:create',
  TEACHERS_UPDATE: 'teachers:update',
  TEACHERS_DELETE: 'teachers:delete',
  TEACHERS_ASSIGN_SUBJECTS: 'teachers:assign_subjects',
  
  // Attendance Module
  ATTENDANCE_VIEW: 'attendance:view',
  ATTENDANCE_MARK: 'attendance:mark',
  ATTENDANCE_UPDATE: 'attendance:update',
  ATTENDANCE_DELETE: 'attendance:delete',
  ATTENDANCE_REPORT: 'attendance:report',
  
  // Fees Module
  FEE_VIEW: 'fee:view',
  FEE_CREATE: 'fee:create',
  FEE_UPDATE: 'fee:update',
  FEE_DELETE: 'fee:delete',
  FEE_COLLECT: 'fee:collect',
  FEE_WAIVER: 'fee:waiver',
  
  // Content Module
  CONTENT_VIEW: 'content:view',
  CONTENT_CREATE: 'content:create',
  CONTENT_UPDATE: 'content:update',
  CONTENT_DELETE: 'content:delete',
  CONTENT_PUBLISH: 'content:publish',
  CONTENT_APPROVE: 'content:approve',
  
  // Exams Module
  EXAMS_VIEW: 'exams:view',
  EXAMS_CREATE: 'exams:create',
  EXAMS_UPDATE: 'exams:update',
  EXAMS_DELETE: 'exams:delete',
  EXAMS_GRADE: 'exams:grade',
  EXAMS_PUBLISH_RESULTS: 'exams:publish_results',
  
  // Reports Module
  REPORTS_VIEW: 'reports:view',
  REPORTS_GENERATE: 'reports:generate',
  REPORTS_EXPORT: 'reports:export',
  REPORTS_VIEW_ALL: 'reports:view_all',
  
  // Organization Module
  ORG_VIEW: 'organization:view',
  ORG_UPDATE: 'organization:update',
  ORG_SETTINGS: 'organization:settings',
  
  // Academic Module
  ACADEMIC_VIEW: 'academic:view',
  ACADEMIC_CREATE: 'academic:create',
  ACADEMIC_UPDATE: 'academic:update',
  ACADEMIC_DELETE: 'academic:delete',
  
  // Live Classes Module
  LIVE_CLASSES_VIEW: 'live_classes:view',
  LIVE_CLASSES_CREATE: 'live_classes:create',
  LIVE_CLASSES_JOIN: 'live_classes:join',
  LIVE_CLASSES_MODERATE: 'live_classes:moderate',
  
  // Assignments Module
  ASSIGNMENTS_VIEW: 'assignments:view',
  ASSIGNMENTS_CREATE: 'assignments:create',
  ASSIGNMENTS_SUBMIT: 'assignments:submit',
  ASSIGNMENTS_GRADE: 'assignments:grade',
  
  // Analytics Module
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_ADVANCED: 'analytics:advanced',
  ANALYTICS_EXPORT: 'analytics:export',
  
  // System Module
  SYSTEM_SETTINGS: 'system:settings',
  SYSTEM_USERS: 'system:users',
  SYSTEM_ROLES: 'system:roles',
  SYSTEM_AUDIT: 'system:audit',

  // Aliases used across frontend pages
  ORGANIZATION_UPDATE: 'organization:update',
  ORGANIZATION_VIEW: 'organization:view',
  ANALYTICS_READ: 'analytics:view',
  FEES_PAY: 'fee:collect',
  FINANCE_VIEW: 'fee:view',
  PARENTS_VIEW: 'users:view',
  PARENTS_READ: 'users:view',
  PARENTS_CREATE: 'users:create',
  PARENTS_UPDATE: 'users:update',
  PARENTS_EDIT: 'users:update',
  STUDENTS_MANAGE: 'students:update',
  CLASSES_CREATE: 'academic:create',
  SUBJECTS_CREATE: 'academic:create',
  TIMETABLE_CREATE: 'academic:create',
  ACADEMIC_MANAGE: 'academic:update',
  EXAMS_MANAGE: 'exams:update',
  ASSIGNMENTS_MANAGE: 'assignments:grade',
  CONTENT_MANAGE: 'content:update',
  LIVE_CLASSES_UPDATE: 'live_classes:moderate',
  LIVE_CLASSES_MANAGE: 'live_classes:moderate',
  MESSAGES_READ: 'users:view',
  EVENTS_CREATE: 'academic:create',
  LIBRARY_MANAGE: 'system:settings',
  HOSTEL_MANAGE: 'system:settings',
  TRANSPORT_MANAGE: 'system:settings',
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

// Permission Groups for easier management
export const PERMISSION_GROUPS = {
  users: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.USERS_MANAGE_ROLES,
  ],
  students: [
    PERMISSIONS.STUDENTS_VIEW,
    PERMISSIONS.STUDENTS_CREATE,
    PERMISSIONS.STUDENTS_UPDATE,
    PERMISSIONS.STUDENTS_DELETE,
    PERMISSIONS.STUDENTS_VIEW_RECORDS,
    PERMISSIONS.STUDENTS_UPDATE_RECORDS,
  ],
  teachers: [
    PERMISSIONS.TEACHERS_VIEW,
    PERMISSIONS.TEACHERS_CREATE,
    PERMISSIONS.TEACHERS_UPDATE,
    PERMISSIONS.TEACHERS_DELETE,
    PERMISSIONS.TEACHERS_ASSIGN_SUBJECTS,
  ],
  attendance: [
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_MARK,
    PERMISSIONS.ATTENDANCE_UPDATE,
    PERMISSIONS.ATTENDANCE_DELETE,
    PERMISSIONS.ATTENDANCE_REPORT,
  ],
  fees: [
    PERMISSIONS.FEE_VIEW,
    PERMISSIONS.FEE_CREATE,
    PERMISSIONS.FEE_UPDATE,
    PERMISSIONS.FEE_DELETE,
    PERMISSIONS.FEE_COLLECT,
    PERMISSIONS.FEE_WAIVER,
  ],
  content: [
    PERMISSIONS.CONTENT_VIEW,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_UPDATE,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.CONTENT_PUBLISH,
    PERMISSIONS.CONTENT_APPROVE,
  ],
  exams: [
    PERMISSIONS.EXAMS_VIEW,
    PERMISSIONS.EXAMS_CREATE,
    PERMISSIONS.EXAMS_UPDATE,
    PERMISSIONS.EXAMS_DELETE,
    PERMISSIONS.EXAMS_GRADE,
    PERMISSIONS.EXAMS_PUBLISH_RESULTS,
  ],
  reports: [
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_GENERATE,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.REPORTS_VIEW_ALL,
  ],
  organization: [
    PERMISSIONS.ORG_VIEW,
    PERMISSIONS.ORG_UPDATE,
    PERMISSIONS.ORG_SETTINGS,
  ],
  academic: [
    PERMISSIONS.ACADEMIC_VIEW,
    PERMISSIONS.ACADEMIC_CREATE,
    PERMISSIONS.ACADEMIC_UPDATE,
    PERMISSIONS.ACADEMIC_DELETE,
  ],
  liveClasses: [
    PERMISSIONS.LIVE_CLASSES_VIEW,
    PERMISSIONS.LIVE_CLASSES_CREATE,
    PERMISSIONS.LIVE_CLASSES_JOIN,
    PERMISSIONS.LIVE_CLASSES_MODERATE,
  ],
  assignments: [
    PERMISSIONS.ASSIGNMENTS_VIEW,
    PERMISSIONS.ASSIGNMENTS_CREATE,
    PERMISSIONS.ASSIGNMENTS_SUBMIT,
    PERMISSIONS.ASSIGNMENTS_GRADE,
  ],
  analytics: [
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_ADVANCED,
    PERMISSIONS.ANALYTICS_EXPORT,
  ],
  system: [
    PERMISSIONS.SYSTEM_SETTINGS,
    PERMISSIONS.SYSTEM_USERS,
    PERMISSIONS.SYSTEM_ROLES,
    PERMISSIONS.SYSTEM_AUDIT,
  ],
};

// Role definitions with default permissions
export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: Object.values(PERMISSIONS), // All permissions
  
  SCHOOL_ADMIN: [
    ...PERMISSION_GROUPS.users,
    ...PERMISSION_GROUPS.students,
    ...PERMISSION_GROUPS.teachers,
    ...PERMISSION_GROUPS.attendance,
    ...PERMISSION_GROUPS.fees,
    ...PERMISSION_GROUPS.content,
    ...PERMISSION_GROUPS.exams,
    ...PERMISSION_GROUPS.reports,
    ...PERMISSION_GROUPS.organization,
    ...PERMISSION_GROUPS.academic,
    ...PERMISSION_GROUPS.liveClasses,
    ...PERMISSION_GROUPS.assignments,
    ...PERMISSION_GROUPS.analytics,
  ],
  
  TEACHER: [
    PERMISSIONS.STUDENTS_VIEW,
    PERMISSIONS.STUDENTS_VIEW_RECORDS,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_MARK,
    PERMISSIONS.CONTENT_VIEW,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.EXAMS_VIEW,
    PERMISSIONS.EXAMS_GRADE,
    PERMISSIONS.LIVE_CLASSES_VIEW,
    PERMISSIONS.LIVE_CLASSES_CREATE,
    PERMISSIONS.LIVE_CLASSES_MODERATE,
    PERMISSIONS.ASSIGNMENTS_VIEW,
    PERMISSIONS.ASSIGNMENTS_CREATE,
    PERMISSIONS.ASSIGNMENTS_GRADE,
    PERMISSIONS.REPORTS_VIEW,
  ],
  
  STUDENT: [
    PERMISSIONS.CONTENT_VIEW,
    PERMISSIONS.EXAMS_VIEW,
    PERMISSIONS.LIVE_CLASSES_VIEW,
    PERMISSIONS.LIVE_CLASSES_JOIN,
    PERMISSIONS.ASSIGNMENTS_VIEW,
    PERMISSIONS.ASSIGNMENTS_SUBMIT,
    PERMISSIONS.REPORTS_VIEW,
  ],
  
  PARENT: [
    PERMISSIONS.STUDENTS_VIEW,
    PERMISSIONS.STUDENTS_VIEW_RECORDS,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.FEE_VIEW,
    PERMISSIONS.EXAMS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
  ],
};

// Permission labels for UI
export const PERMISSION_LABELS: Record<string, string> = {
  [PERMISSIONS.USERS_VIEW]: 'View Users',
  [PERMISSIONS.USERS_CREATE]: 'Create Users',
  [PERMISSIONS.USERS_UPDATE]: 'Update Users',
  [PERMISSIONS.USERS_DELETE]: 'Delete Users',
  [PERMISSIONS.USERS_MANAGE_ROLES]: 'Manage User Roles',
  
  [PERMISSIONS.STUDENTS_VIEW]: 'View Students',
  [PERMISSIONS.STUDENTS_CREATE]: 'Create Students',
  [PERMISSIONS.STUDENTS_UPDATE]: 'Update Students',
  [PERMISSIONS.STUDENTS_DELETE]: 'Delete Students',
  [PERMISSIONS.STUDENTS_VIEW_RECORDS]: 'View Student Records',
  [PERMISSIONS.STUDENTS_UPDATE_RECORDS]: 'Update Student Records',
  
  [PERMISSIONS.TEACHERS_VIEW]: 'View Teachers',
  [PERMISSIONS.TEACHERS_CREATE]: 'Create Teachers',
  [PERMISSIONS.TEACHERS_UPDATE]: 'Update Teachers',
  [PERMISSIONS.TEACHERS_DELETE]: 'Delete Teachers',
  [PERMISSIONS.TEACHERS_ASSIGN_SUBJECTS]: 'Assign Subjects to Teachers',
  
  [PERMISSIONS.ATTENDANCE_VIEW]: 'View Attendance',
  [PERMISSIONS.ATTENDANCE_MARK]: 'Mark Attendance',
  [PERMISSIONS.ATTENDANCE_UPDATE]: 'Update Attendance',
  [PERMISSIONS.ATTENDANCE_DELETE]: 'Delete Attendance',
  [PERMISSIONS.ATTENDANCE_REPORT]: 'Generate Attendance Reports',
  
  [PERMISSIONS.FEE_VIEW]: 'View Fees',
  [PERMISSIONS.FEE_CREATE]: 'Create Fee Records',
  [PERMISSIONS.FEE_UPDATE]: 'Update Fee Records',
  [PERMISSIONS.FEE_DELETE]: 'Delete Fee Records',
  [PERMISSIONS.FEE_COLLECT]: 'Collect Fees',
  [PERMISSIONS.FEE_WAIVER]: 'Apply Fee Waivers',
  
  [PERMISSIONS.CONTENT_VIEW]: 'View Content',
  [PERMISSIONS.CONTENT_CREATE]: 'Create Content',
  [PERMISSIONS.CONTENT_UPDATE]: 'Update Content',
  [PERMISSIONS.CONTENT_DELETE]: 'Delete Content',
  [PERMISSIONS.CONTENT_PUBLISH]: 'Publish Content',
  [PERMISSIONS.CONTENT_APPROVE]: 'Approve Content',
  
  [PERMISSIONS.EXAMS_VIEW]: 'View Exams',
  [PERMISSIONS.EXAMS_CREATE]: 'Create Exams',
  [PERMISSIONS.EXAMS_UPDATE]: 'Update Exams',
  [PERMISSIONS.EXAMS_DELETE]: 'Delete Exams',
  [PERMISSIONS.EXAMS_GRADE]: 'Grade Exams',
  [PERMISSIONS.EXAMS_PUBLISH_RESULTS]: 'Publish Exam Results',
  
  [PERMISSIONS.REPORTS_VIEW]: 'View Reports',
  [PERMISSIONS.REPORTS_GENERATE]: 'Generate Reports',
  [PERMISSIONS.REPORTS_EXPORT]: 'Export Reports',
  [PERMISSIONS.REPORTS_VIEW_ALL]: 'View All Reports',
  
  [PERMISSIONS.ORG_VIEW]: 'View Organization',
  [PERMISSIONS.ORG_UPDATE]: 'Update Organization',
  [PERMISSIONS.ORG_SETTINGS]: 'Manage Organization Settings',
  
  [PERMISSIONS.ACADEMIC_VIEW]: 'View Academic Data',
  [PERMISSIONS.ACADEMIC_CREATE]: 'Create Academic Data',
  [PERMISSIONS.ACADEMIC_UPDATE]: 'Update Academic Data',
  [PERMISSIONS.ACADEMIC_DELETE]: 'Delete Academic Data',
  
  [PERMISSIONS.LIVE_CLASSES_VIEW]: 'View Live Classes',
  [PERMISSIONS.LIVE_CLASSES_CREATE]: 'Create Live Classes',
  [PERMISSIONS.LIVE_CLASSES_JOIN]: 'Join Live Classes',
  [PERMISSIONS.LIVE_CLASSES_MODERATE]: 'Moderate Live Classes',
  
  [PERMISSIONS.ASSIGNMENTS_VIEW]: 'View Assignments',
  [PERMISSIONS.ASSIGNMENTS_CREATE]: 'Create Assignments',
  [PERMISSIONS.ASSIGNMENTS_SUBMIT]: 'Submit Assignments',
  [PERMISSIONS.ASSIGNMENTS_GRADE]: 'Grade Assignments',
  
  [PERMISSIONS.ANALYTICS_VIEW]: 'View Analytics',
  [PERMISSIONS.ANALYTICS_ADVANCED]: 'View Advanced Analytics',
  [PERMISSIONS.ANALYTICS_EXPORT]: 'Export Analytics',
  
  [PERMISSIONS.SYSTEM_SETTINGS]: 'Manage System Settings',
  [PERMISSIONS.SYSTEM_USERS]: 'Manage System Users',
  [PERMISSIONS.SYSTEM_ROLES]: 'Manage System Roles',
  [PERMISSIONS.SYSTEM_AUDIT]: 'View Audit Logs',
};

// Permission descriptions for tooltips
export const PERMISSION_DESCRIPTIONS: Record<string, string> = {
  [PERMISSIONS.USERS_VIEW]: 'Ability to view user profiles and information',
  [PERMISSIONS.USERS_CREATE]: 'Ability to create new user accounts',
  [PERMISSIONS.USERS_UPDATE]: 'Ability to modify existing user accounts',
  [PERMISSIONS.USERS_DELETE]: 'Ability to delete user accounts',
  [PERMISSIONS.USERS_MANAGE_ROLES]: 'Ability to assign and remove roles from users',
  
  [PERMISSIONS.STUDENTS_VIEW]: 'Ability to view student profiles',
  [PERMISSIONS.STUDENTS_CREATE]: 'Ability to enroll new students',
  [PERMISSIONS.STUDENTS_UPDATE]: 'Ability to update student information',
  [PERMISSIONS.STUDENTS_DELETE]: 'Ability to remove students from the system',
  [PERMISSIONS.STUDENTS_VIEW_RECORDS]: 'Ability to view academic and health records',
  [PERMISSIONS.STUDENTS_UPDATE_RECORDS]: 'Ability to update academic and health records',
  
  // Add more descriptions as needed...
};
