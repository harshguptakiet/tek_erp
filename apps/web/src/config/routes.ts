/**
 * Route Constants
 * Centralized route definitions
 */

export const routes = {
  // Public routes
  home: '/',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',

  // Admin routes
  admin: {
    dashboard: '/admin/dashboard',
    students: '/admin/students',
    student: (id: string) => `/admin/students/${id}`,
    teachers: '/admin/teachers',
    teacher: (id: string) => `/admin/teachers/${id}`,
    classes: '/admin/classes',
    class: (id: string) => `/admin/classes/${id}`,
    attendance: '/admin/attendance',
    fees: '/admin/fees',
    exams: '/admin/exams',
    analytics: '/admin/analytics',
    settings: '/admin/settings',
  },

  // Teacher routes
  teacher: {
    dashboard: '/teacher/dashboard',
    classes: '/teacher/classes',
    class: (id: string) => `/teacher/classes/${id}`,
    attendance: '/teacher/attendance',
    exams: '/teacher/exams',
    students: '/teacher/students',
    analytics: '/teacher/analytics',
  },

  // Student routes
  student: {
    dashboard: '/student/dashboard',
    classes: '/student/classes',
    class: (id: string) => `/student/classes/${id}`,
    attendance: '/student/attendance',
    exams: '/student/exams',
    assignments: '/student/assignments',
    fees: '/student/fees',
  },

  // Parent routes
  parent: {
    dashboard: '/parent/dashboard',
    children: '/parent/children',
    child: (id: string) => `/parent/children/${id}`,
    attendance: '/parent/attendance',
    fees: '/parent/fees',
    exams: '/parent/exams',
  },
} as const;
