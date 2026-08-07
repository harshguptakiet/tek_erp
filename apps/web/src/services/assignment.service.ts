import { apiClient } from '../lib/axios';

// Assignment Service
export const assignmentService = {
  // ==================== ASSIGNMENTS ====================
  createAssignment: async (data: {
    title: string;
    description: string;
    subjectId: string;
    sectionId: string;
    dueDate: string;
    totalMarks: number;
    attachments?: string[];
  }) => {
    const response = await apiClient.post('/assignments', data);
    return response.data;
  },

  listAssignments: async (filters?: {
    sectionId?: string;
    subjectId?: string;
    status?: string;
  }) => {
    const response = await apiClient.get('/assignments', { params: filters });
    return response.data;
  },

  getAssignment: async (id: string) => {
    const response = await apiClient.get(`/assignments/${id}`);
    return response.data;
  },

  updateAssignment: async (id: string, data: any) => {
    const response = await apiClient.put(`/assignments/${id}`, data);
    return response.data;
  },

  deleteAssignment: async (id: string) => {
    const response = await apiClient.delete(`/assignments/${id}`);
    return response.data;
  },

  // ==================== SUBMISSIONS ====================
  submitAssignment: async (assignmentId: string, data: {
    content?: string;
    attachments?: string[];
  }) => {
    const response = await apiClient.post(`/assignments/${assignmentId}/submit`, data);
    return response.data;
  },

  getSubmissions: async (assignmentId: string) => {
    const response = await apiClient.get(`/assignments/${assignmentId}/submissions`);
    return response.data;
  },

  gradeSubmission: async (submissionId: string, data: {
    marksObtained: number;
    feedback?: string;
    grade?: string;
  }) => {
    const response = await apiClient.post(`/assignments/submissions/${submissionId}/grade`, data);
    return response.data;
  },

  getStudentSubmission: async (assignmentId: string, studentId: string) => {
    const response = await apiClient.get(`/assignments/${assignmentId}/submissions/${studentId}`);
    return response.data;
  },

  // ==================== HOMEWORK ====================
  getHomework: async (studentId?: string, filters?: {
    dueDate?: string;
    status?: string;
  }) => {
    const response = await apiClient.get('/homework', {
      params: { studentId, ...filters },
    });
    return response.data;
  },
};
