/**
 * React Query Configuration for Performance Optimization
 * Centralized configuration to reduce loading times
 */

import { QueryClient, DefaultOptions } from '@tanstack/react-query';

// Optimized default options for better performance
const queryConfig: DefaultOptions = {
  queries: {
    // Reduce stale time to 30 seconds (was 0 by default)
    staleTime: 30 * 1000, // 30 seconds
    
    // Cache data for 5 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    
    // Retry failed requests only once
    retry: 1,
    
    // Disable automatic refetch on window focus for better UX
    refetchOnWindowFocus: false,
    
    // Disable refetch on reconnect to reduce server load
    refetchOnReconnect: false,
    
    // Disable refetch on mount if data is not stale
    refetchOnMount: false,
  },
  mutations: {
    // Retry mutations once on failure
    retry: 1,
  },
};

// Create optimized query client
export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

// Query key factories for better cache management
export const queryKeys = {
  // Students
  students: {
    all: ['students'] as const,
    lists: () => [...queryKeys.students.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.students.lists(), { filters }] as const,
    details: () => [...queryKeys.students.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.students.details(), id] as const,
  },
  
  // Teachers
  teachers: {
    all: ['teachers'] as const,
    lists: () => [...queryKeys.teachers.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.teachers.lists(), { filters }] as const,
    details: () => [...queryKeys.teachers.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.teachers.details(), id] as const,
  },
  
  // Classes
  classes: {
    all: ['classes'] as const,
    lists: () => [...queryKeys.classes.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.classes.lists(), { filters }] as const,
    details: () => [...queryKeys.classes.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.classes.details(), id] as const,
  },
  
  // Attendance
  attendance: {
    all: ['attendance'] as const,
    lists: () => [...queryKeys.attendance.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.attendance.lists(), { filters }] as const,
  },
  
  // Timetable
  timetable: {
    all: ['timetable'] as const,
    lists: () => [...queryKeys.timetable.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.timetable.lists(), { filters }] as const,
  },
  
  // Exams
  exams: {
    all: ['exams'] as const,
    lists: () => [...queryKeys.exams.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.exams.lists(), { filters }] as const,
    details: () => [...queryKeys.exams.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.exams.details(), id] as const,
  },
  
  // Fees
  fees: {
    all: ['fees'] as const,
    lists: () => [...queryKeys.fees.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.fees.lists(), { filters }] as const,
  },
  
  // Analytics
  analytics: {
    all: ['analytics'] as const,
    dashboard: () => [...queryKeys.analytics.all, 'dashboard'] as const,
    attendance: () => [...queryKeys.analytics.all, 'attendance'] as const,
    academic: () => [...queryKeys.analytics.all, 'academic'] as const,
  },
};

// Prefetch utilities for common data
export const prefetchHelpers = {
  // Prefetch students list for faster navigation
  prefetchStudents: async (filters?: any) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.students.list(filters),
      queryFn: async () => {
        // Import dynamically to avoid circular dependencies
        const { studentService } = await import('@/services/student.service');
        return studentService.listStudents(filters);
      },
    });
  },
  
  // Prefetch teachers list
  prefetchTeachers: async (filters?: any) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.teachers.list(filters),
      queryFn: async () => {
        const { teacherService } = await import('@/services/teacher.service');
        return teacherService.listTeachers(filters);
      },
    });
  },
  
  // Prefetch dashboard analytics
  prefetchDashboard: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.analytics.dashboard(),
      queryFn: async () => {
        const { analyticsService } = await import('@/services/analytics.service');
        return analyticsService.getDashboardAnalytics();
      },
    });
  },
};

// Cache invalidation helpers
export const invalidateHelpers = {
  // Invalidate all student-related queries
  invalidateStudents: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
  },
  
  // Invalidate all teacher-related queries
  invalidateTeachers: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
  },
  
  // Invalidate all class-related queries
  invalidateClasses: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.classes.all });
  },
  
  // Invalidate analytics
  invalidateAnalytics: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
  },
};
