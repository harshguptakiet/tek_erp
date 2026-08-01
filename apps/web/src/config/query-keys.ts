/**
 * Query Keys Factory
 * Centralized query key management for TanStack Query
 */

export const queryKeys = {
  // Authentication
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },

  // Students
  students: {
    all: ['students'] as const,
    lists: () => [...queryKeys.students.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.students.lists(), filters] as const,
    details: () => [...queryKeys.students.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.students.details(), id] as const,
  },

  // Teachers
  teachers: {
    all: ['teachers'] as const,
    lists: () => [...queryKeys.teachers.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.teachers.lists(), filters] as const,
    details: () => [...queryKeys.teachers.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.teachers.details(), id] as const,
  },

  // Attendance
  attendance: {
    all: ['attendance'] as const,
    lists: () => [...queryKeys.attendance.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.attendance.lists(), filters] as const,
    section: (sectionId: string, date: string) => 
      [...queryKeys.attendance.all, 'section', sectionId, date] as const,
    student: (studentId: string, filters: any) => 
      [...queryKeys.attendance.all, 'student', studentId, filters] as const,
  },

  // Classes
  classes: {
    all: ['classes'] as const,
    lists: () => [...queryKeys.classes.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.classes.lists(), filters] as const,
    details: () => [...queryKeys.classes.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.classes.details(), id] as const,
  },

  // Fees
  fees: {
    all: ['fees'] as const,
    lists: () => [...queryKeys.fees.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.fees.lists(), filters] as const,
    student: (studentId: string) => [...queryKeys.fees.all, 'student', studentId] as const,
  },

  // Exams
  exams: {
    all: ['exams'] as const,
    lists: () => [...queryKeys.exams.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.exams.lists(), filters] as const,
    details: () => [...queryKeys.exams.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.exams.details(), id] as const,
    results: (examId: string) => [...queryKeys.exams.all, 'results', examId] as const,
  },

  // Analytics
  analytics: {
    all: ['analytics'] as const,
    dashboard: (role: string) => [...queryKeys.analytics.all, 'dashboard', role] as const,
    student: (studentId: string) => [...queryKeys.analytics.all, 'student', studentId] as const,
    teacher: (teacherId: string) => [...queryKeys.analytics.all, 'teacher', teacherId] as const,
    school: (schoolId: string) => [...queryKeys.analytics.all, 'school', schoolId] as const,
  },

  // Organizations
  organizations: {
    all: ['organizations'] as const,
    lists: () => [...queryKeys.organizations.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.organizations.lists(), filters] as const,
    details: () => [...queryKeys.organizations.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.organizations.details(), id] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    lists: () => [...queryKeys.notifications.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.notifications.lists(), filters] as const,
    unread: () => [...queryKeys.notifications.all, 'unread'] as const,
  },
} as const;
