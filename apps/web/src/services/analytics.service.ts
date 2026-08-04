import { apiClient } from '../lib/axios';

// Analytics & Reporting Service
export const analyticsService = {
  // ==================== DASHBOARDS ====================
  getOverviewDashboard: async (schoolId: string) => {
    const response = await apiClient.get('/analytics/dashboard', {
      params: { schoolId },
    });
    return response.data;
  },

  getAttendanceAnalytics: async (filters?: {
    schoolId?: string;
    sectionId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get('/analytics/attendance', { params: filters });
    return response.data;
  },

  getAcademicPerformance: async (filters?: {
    schoolId?: string;
    classId?: string;
    academicYearId?: string;
  }) => {
    const response = await apiClient.get('/analytics/academic-performance', {
      params: filters,
    });
    return response.data;
  },

  getStudentPerformance: async (studentId: string, academicYearId?: string) => {
    const response = await apiClient.get('/analytics/student-performance', {
      params: { studentId, academicYearId },
    });
    return response.data;
  },

  // ==================== REPORTS ====================
  generateReport: async (data: {
    reportType: string;
    filters: any;
    format?: string;
  }) => {
    const response = await apiClient.post('/reports/generate', data);
    return response.data;
  },

  listReports: async (filters?: {
    reportType?: string;
    status?: string;
  }) => {
    const response = await apiClient.get('/reports', { params: filters });
    return response.data;
  },

  downloadReport: async (reportId: string) => {
    const response = await apiClient.get(`/reports/${reportId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
