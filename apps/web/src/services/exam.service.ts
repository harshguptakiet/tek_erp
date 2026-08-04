import { apiClient } from '../lib/axios';

// Exam & Assessment Service
export const examService = {
  // ==================== EXAMS ====================
  createExam: async (data: {
    title: string;
    examType: string;
    subjectId: string;
    sectionId: string;
    date: string;
    duration: number;
    totalMarks: number;
    passingMarks: number;
  }) => {
    const response = await apiClient.post('/exams', data);
    return response.data;
  },

  listExams: async (filters?: {
    sectionId?: string;
    subjectId?: string;
    examType?: string;
    academicYearId?: string;
  }) => {
    const response = await apiClient.get('/exams', { params: filters });
    return response.data;
  },

  getExam: async (id: string) => {
    const response = await apiClient.get(`/exams/${id}`);
    return response.data;
  },

  updateExam: async (id: string, data: any) => {
    const response = await apiClient.put(`/exams/${id}`, data);
    return response.data;
  },

  deleteExam: async (id: string) => {
    const response = await apiClient.delete(`/exams/${id}`);
    return response.data;
  },

  // ==================== GRADES ====================
  submitGrades: async (examId: string, grades: Array<{
    studentId: string;
    marksObtained: number;
    grade?: string;
    remarks?: string;
  }>) => {
    const response = await apiClient.post(`/exams/${examId}/grades`, { grades });
    return response.data;
  },

  getExamResults: async (examId: string) => {
    const response = await apiClient.get(`/exams/${examId}/results`);
    return response.data;
  },

  publishResults: async (examId: string) => {
    const response = await apiClient.post(`/exams/${examId}/publish`);
    return response.data;
  },

  getStudentResult: async (examId: string, studentId: string) => {
    const response = await apiClient.get(`/exams/${examId}/results/${studentId}`);
    return response.data;
  },

  // ==================== REPORT CARDS ====================
  generateReportCard: async (studentId: string, academicYearId: string) => {
    const response = await apiClient.post('/report-cards/generate', {
      studentId,
      academicYearId,
    });
    return response.data;
  },

  getReportCard: async (id: string) => {
    const response = await apiClient.get(`/report-cards/${id}`);
    return response.data;
  },

  listReportCards: async (filters?: {
    studentId?: string;
    academicYearId?: string;
  }) => {
    const response = await apiClient.get('/report-cards', { params: filters });
    return response.data;
  },
};
