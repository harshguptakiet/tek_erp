import { apiClient } from '../lib/axios';

// Timetable Service - Complete integration with backend API
export const timetableService = {
  // ==================== TIMETABLE CRUD ====================
  createTimetable: async (data: {
    schoolId: string;
    classId: string;
    sectionId?: string;
    academicYearId: string;
    name: string;
    effectiveFrom: string;
    effectiveTo?: string;
  }) => {
    const response = await apiClient.post('/timetables', data);
    return response.data;
  },

  listTimetables: async (filters?: {
    schoolId?: string;
    classId?: string;
    sectionId?: string;
    academicYearId?: string;
    isActive?: boolean;
  }) => {
    const response = await apiClient.get('/timetables', { params: filters });
    return response.data;
  },

  getTimetable: async (id: string) => {
    const response = await apiClient.get(`/timetables/${id}`);
    return response.data;
  },

  updateTimetable: async (id: string, data: any) => {
    const response = await apiClient.put(`/timetables/${id}`, data);
    return response.data;
  },

  deleteTimetable: async (id: string) => {
    const response = await apiClient.delete(`/timetables/${id}`);
    return response.data;
  },

  // ==================== PERIODS ====================
  createPeriod: async (timetableId: string, data: {
    day: string;
    periodNumber: number;
    startTime: string;
    endTime: string;
    subjectId: string;
    teacherId: string;
    roomId?: string;
    periodType?: string;
  }) => {
    const response = await apiClient.post(`/timetables/${timetableId}/periods`, data);
    return response.data;
  },

  updatePeriod: async (periodId: string, data: any) => {
    const response = await apiClient.put(`/timetables/periods/${periodId}`, data);
    return response.data;
  },

  deletePeriod: async (periodId: string) => {
    const response = await apiClient.delete(`/timetables/periods/${periodId}`);
    return response.data;
  },

  bulkCreatePeriods: async (timetableId: string, periods: any[]) => {
    const response = await apiClient.post(`/timetables/${timetableId}/periods/bulk`, {
      periods,
    });
    return response.data;
  },

  // ==================== CONFLICT DETECTION ====================
  validateTimetable: async (timetableId: string) => {
    const response = await apiClient.post(`/timetables/${timetableId}/validate`);
    return response.data;
  },

  checkConflicts: async (data: {
    teacherId?: string;
    roomId?: string;
    day: string;
    startTime: string;
    endTime: string;
    excludePeriodId?: string;
  }) => {
    const response = await apiClient.post('/timetables/check-conflicts', data);
    return response.data;
  },

  // ==================== SUBSTITUTION ====================
  createSubstitution: async (data: {
    periodId: string;
    date: string;
    substituteTeacherId: string;
    reason: string;
    remarks?: string;
  }) => {
    const response = await apiClient.post('/timetables/substitutions', data);
    return response.data;
  },

  listSubstitutions: async (filters?: {
    teacherId?: string;
    date?: string;
    schoolId?: string;
  }) => {
    const response = await apiClient.get('/timetables/substitutions', { params: filters });
    return response.data;
  },

  cancelSubstitution: async (substitutionId: string) => {
    const response = await apiClient.delete(`/timetables/substitutions/${substitutionId}`);
    return response.data;
  },

  // ==================== VIEWS ====================
  getTeacherTimetable: async (teacherId: string, filters?: {
    date?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get(`/timetables/teacher/${teacherId}`, {
      params: filters,
    });
    return response.data;
  },

  getStudentTimetable: async (studentId: string, filters?: {
    date?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get(`/timetables/student/${studentId}`, {
      params: filters,
    });
    return response.data;
  },

  getClassTimetable: async (classId: string, sectionId?: string, date?: string) => {
    const response = await apiClient.get(`/timetables/class/${classId}`, {
      params: { sectionId, date },
    });
    return response.data;
  },

  getRoomSchedule: async (roomId: string, date?: string) => {
    const response = await apiClient.get(`/timetables/room/${roomId}`, {
      params: { date },
    });
    return response.data;
  },

  // ==================== AUTO-GENERATION ====================
  autoGenerateTimetable: async (data: {
    schoolId: string;
    classId: string;
    sectionId?: string;
    academicYearId: string;
    constraints?: {
      minPeriodsPerDay?: number;
      maxPeriodsPerDay?: number;
      avoidConsecutivePeriods?: string[];
      teacherPreferences?: any[];
    };
  }) => {
    const response = await apiClient.post('/timetables/auto-generate', data);
    return response.data;
  },

  optimizeTimetable: async (timetableId: string) => {
    const response = await apiClient.post(`/timetables/${timetableId}/optimize`);
    return response.data;
  },

  // ==================== TEMPLATES ====================
  saveAsTemplate: async (timetableId: string, templateName: string) => {
    const response = await apiClient.post(`/timetables/${timetableId}/save-template`, {
      templateName,
    });
    return response.data;
  },

  listTemplates: async (schoolId: string) => {
    const response = await apiClient.get('/timetables/templates', {
      params: { schoolId },
    });
    return response.data;
  },

  applyTemplate: async (templateId: string, data: {
    classId: string;
    sectionId?: string;
    academicYearId: string;
  }) => {
    const response = await apiClient.post(`/timetables/templates/${templateId}/apply`, data);
    return response.data;
  },

  // ==================== ANALYTICS ====================
  getTimetableUtilization: async (timetableId: string) => {
    const response = await apiClient.get(`/timetables/${timetableId}/utilization`);
    return response.data;
  },

  getTeacherWorkload: async (teacherId: string, academicYearId?: string) => {
    const response = await apiClient.get(`/timetables/teacher/${teacherId}/workload`, {
      params: { academicYearId },
    });
    return response.data;
  },
};
