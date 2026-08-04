// Centralized query keys for TanStack Query
export const queryKeys = {
  // Authentication
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
    sessions: () => [...queryKeys.auth.all, 'sessions'] as const,
  },

  // Students
  students: {
    all: ['students'] as const,
    list: (filters: any) => [...queryKeys.students.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.students.all, 'detail', id] as const,
  },

  // Teachers
  teachers: {
    all: ['teachers'] as const,
    list: (filters: any) => [...queryKeys.teachers.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.teachers.all, 'detail', id] as const,
  },

  // Parents
  parents: {
    all: ['parents'] as const,
    list: (filters: any) => [...queryKeys.parents.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.parents.all, 'detail', id] as const,
  },

  // Classes
  classes: {
    all: ['classes'] as const,
    list: (schoolId: string) => [...queryKeys.classes.all, 'list', schoolId] as const,
    detail: (id: string) => [...queryKeys.classes.all, 'detail', id] as const,
  },

  // Subjects
  subjects: {
    all: ['subjects'] as const,
    list: (filters: any) => [...queryKeys.subjects.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.subjects.all, 'detail', id] as const,
  },

  // Attendance
  attendance: {
    all: ['attendance'] as const,
    list: (filters: any) => [...queryKeys.attendance.all, 'list', filters] as const,
    report: (filters: any) => [...queryKeys.attendance.all, 'report', filters] as const,
  },

  // Exams
  exams: {
    all: ['exams'] as const,
    list: (filters: any) => [...queryKeys.exams.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.exams.all, 'detail', id] as const,
  },

  // Assignments
  assignments: {
    all: ['assignments'] as const,
    list: (filters: any) => [...queryKeys.assignments.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.assignments.all, 'detail', id] as const,
  },

  // Content
  content: {
    all: ['content'] as const,
    list: (filters: any) => [...queryKeys.content.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.content.all, 'detail', id] as const,
  },

  // Live Classes
  liveClasses: {
    all: ['liveClasses'] as const,
    list: (filters: any) => [...queryKeys.liveClasses.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.liveClasses.all, 'detail', id] as const,
  },

  // Fees
  fees: {
    all: ['fees'] as const,
    list: (filters: any) => [...queryKeys.fees.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.fees.all, 'detail', id] as const,
  },

  // Timetable
  timetable: {
    all: ['timetable'] as const,
    list: (filters: any) => [...queryKeys.timetable.all, 'list', filters] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    list: (filters: any) => [...queryKeys.notifications.all, 'list', filters] as const,
  },

  // Analytics
  analytics: {
    all: ['analytics'] as const,
    dashboard: (filters: any) => [...queryKeys.analytics.all, 'dashboard', filters] as const,
  },
};
