import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';
import { useAuthStore } from '@/stores/auth.store';

// Query Keys
export const analyticsKeys = {
  all: ['analytics'] as const,
  dashboard: () => [...analyticsKeys.all, 'dashboard'] as const,
  studentPerformance: (studentId: string) => [...analyticsKeys.all, 'student', studentId] as const,
  classPerformance: (classId: string) => [...analyticsKeys.all, 'class', classId] as const,
  teacherPerformance: (teacherId: string) => [...analyticsKeys.all, 'teacher', teacherId] as const,
  subjectAnalysis: (subjectId: string) => [...analyticsKeys.all, 'subject', subjectId] as const,
  attendanceTrends: (filters: any) => [...analyticsKeys.all, 'attendance', filters] as const,
  examAnalysis: (examId: string) => [...analyticsKeys.all, 'exam', examId] as const,
  feeCollection: (filters: any) => [...analyticsKeys.all, 'fees', filters] as const,
  learningProgress: (filters: any) => [...analyticsKeys.all, 'learning', filters] as const,
};

// Fetch dashboard overview
export function useAnalyticsDashboard() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: analyticsKeys.dashboard(),
    queryFn: () => analyticsService.getOverviewDashboard(user?.schoolId!),
    enabled: !!user?.schoolId,
  });
}

// Alias for dashboard analytics (used by analytics-dashboard component)
export function useGetDashboardAnalytics() {
  return useAnalyticsDashboard();
}

// Fetch student performance analytics
export function useStudentPerformance(studentId: string, academicYearId?: string) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: [analyticsKeys.studentPerformance(studentId), academicYearId],
    queryFn: () => analyticsService.getStudentPerformance(studentId, academicYearId),
    enabled: !!user?.schoolId && !!studentId,
  });
}

// Fetch class/academic performance analytics
export function useAcademicPerformance(filters?: {
  classId?: string;
  academicYearId?: string;
}) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: [...analyticsKeys.all, 'academic', filters],
    queryFn: () => analyticsService.getAcademicPerformance({
      schoolId: user?.schoolId,
      ...filters,
    }),
    enabled: !!user?.schoolId,
  });
}

// Fetch attendance analytics
export function useAttendanceAnalytics(filters?: {
  sectionId?: string;
  startDate?: string;
  endDate?: string;
}) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: analyticsKeys.attendanceTrends(filters || {}),
    queryFn: () => analyticsService.getAttendanceAnalytics({
      schoolId: user?.schoolId,
      ...filters,
    }),
    enabled: !!user?.schoolId,
  });
}

// Fetch custom report
export function useGenerateReport(reportType: string, filters?: any) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: [...analyticsKeys.all, 'report', reportType, filters],
    queryFn: () => analyticsService.generateReport({
      reportType,
      filters: { schoolId: user?.schoolId, ...filters },
    }),
    enabled: !!user?.schoolId && !!reportType,
  });
}

// Fetch reports list
export function useReportsList(filters?: {
  reportType?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: [...analyticsKeys.all, 'list', filters],
    queryFn: () => analyticsService.listReports(filters),
  });
}
