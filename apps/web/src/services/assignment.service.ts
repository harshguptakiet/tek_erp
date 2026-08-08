import { apiClient } from '../lib/axios';

// Assignment Service - Complete integration with backend API
export const assignmentService = {
  // ==================== ASSIGNMENTS ====================
  createAssignment: async (data: {
    title: string;
    description: string;
    subjectId: string;
    sectionId: string;
    dueDate: string;
    totalMarks: number;
    passingMarks?: number;
    attachments?: string[];
    instructions?: string;
    allowLateSubmission?: boolean;
    maxFileSize?: number;
    allowedFileTypes?: string[];
  }) => {
    const response = await apiClient.post('/assignments', data);
    return response.data;
  },

  listAssignments: async (filters?: {
    sectionId?: string;
    subjectId?: string;
    status?: string;
    teacherId?: string;
    studentId?: string;
    startDate?: string;
    endDate?: string;
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

  publishAssignment: async (id: string) => {
    const response = await apiClient.post(`/assignments/${id}/publish`);
    return response.data;
  },

  // ==================== SUBMISSIONS ====================
  submitAssignment: async (assignmentId: string, data: {
    content?: string;
    attachments?: string[];
    links?: string[];
  }) => {
    const response = await apiClient.post(`/assignments/${assignmentId}/submit`, data);
    return response.data;
  },

  updateSubmission: async (submissionId: string, data: {
    content?: string;
    attachments?: string[];
  }) => {
    const response = await apiClient.put(`/assignments/submissions/${submissionId}`, data);
    return response.data;
  },

  getSubmissions: async (assignmentId: string, filters?: {
    status?: string;
    studentId?: string;
  }) => {
    const response = await apiClient.get(`/assignments/${assignmentId}/submissions`, {
      params: filters,
    });
    return response.data;
  },

  getSubmission: async (submissionId: string) => {
    const response = await apiClient.get(`/assignments/submissions/${submissionId}`);
    return response.data;
  },

  getStudentSubmission: async (assignmentId: string, studentId: string) => {
    const response = await apiClient.get(`/assignments/${assignmentId}/students/${studentId}/submission`);
    return response.data;
  },

  // ==================== GRADING ====================
  gradeSubmission: async (submissionId: string, data: {
    marksObtained: number;
    feedback?: string;
    grade?: string;
    rubricScores?: Array<{
      criterionId: string;
      score: number;
      comment?: string;
    }>;
  }) => {
    const response = await apiClient.post(`/assignments/submissions/${submissionId}/grade`, data);
    return response.data;
  },

  bulkGradeSubmissions: async (assignmentId: string, grades: Array<{
    submissionId: string;
    marksObtained: number;
    feedback?: string;
    grade?: string;
  }>) => {
    const response = await apiClient.post(`/assignments/${assignmentId}/bulk-grade`, { grades });
    return response.data;
  },

  updateGrade: async (submissionId: string, data: {
    marksObtained: number;
    feedback?: string;
    grade?: string;
  }) => {
    const response = await apiClient.put(`/assignments/submissions/${submissionId}/grade`, data);
    return response.data;
  },

  // ==================== RUBRICS ====================
  createRubric: async (assignmentId: string, data: {
    criteria: Array<{
      name: string;
      description: string;
      maxScore: number;
      weight?: number;
    }>;
  }) => {
    const response = await apiClient.post(`/assignments/${assignmentId}/rubric`, data);
    return response.data;
  },

  getRubric: async (assignmentId: string) => {
    const response = await apiClient.get(`/assignments/${assignmentId}/rubric`);
    return response.data;
  },

  updateRubric: async (assignmentId: string, data: any) => {
    const response = await apiClient.put(`/assignments/${assignmentId}/rubric`, data);
    return response.data;
  },

  // ==================== PLAGIARISM ====================
  checkPlagiarism: async (submissionId: string) => {
    const response = await apiClient.post(`/assignments/submissions/${submissionId}/plagiarism-check`);
    return response.data;
  },

  getPlagiarismReport: async (submissionId: string) => {
    const response = await apiClient.get(`/assignments/submissions/${submissionId}/plagiarism-report`);
    return response.data;
  },

  // ==================== PEER REVIEW ====================
  assignPeerReviews: async (assignmentId: string, data: {
    reviewsPerSubmission: number;
    reviewDeadline: string;
  }) => {
    const response = await apiClient.post(`/assignments/${assignmentId}/peer-reviews`, data);
    return response.data;
  },

  submitPeerReview: async (submissionId: string, data: {
    rating: number;
    comments: string;
    strengths?: string[];
    improvements?: string[];
  }) => {
    const response = await apiClient.post(`/assignments/submissions/${submissionId}/peer-review`, data);
    return response.data;
  },

  getPeerReviews: async (submissionId: string) => {
    const response = await apiClient.get(`/assignments/submissions/${submissionId}/peer-reviews`);
    return response.data;
  },

  // ==================== LATE SUBMISSIONS ====================
  requestLateSubmission: async (assignmentId: string, data: {
    reason: string;
    requestedDeadline: string;
  }) => {
    const response = await apiClient.post(`/assignments/${assignmentId}/request-late-submission`, data);
    return response.data;
  },

  approveLateSubmission: async (requestId: string, approved: boolean, newDeadline?: string) => {
    const response = await apiClient.post(`/assignments/late-requests/${requestId}/approve`, {
      approved,
      newDeadline,
    });
    return response.data;
  },

  // ==================== ANALYTICS ====================
  getAssignmentAnalytics: async (assignmentId: string) => {
    const response = await apiClient.get(`/assignments/${assignmentId}/analytics`);
    return response.data;
  },

  getSubmissionStats: async (assignmentId: string) => {
    const response = await apiClient.get(`/assignments/${assignmentId}/stats`);
    return response.data;
  },

  // ==================== HOMEWORK ====================
  getHomework: async (studentId?: string, filters?: {
    dueDate?: string;
    status?: string;
    subjectId?: string;
  }) => {
    const response = await apiClient.get('/homework', {
      params: { studentId, ...filters },
    });
    return response.data;
  },

  getUpcomingAssignments: async (filters?: {
    studentId?: string;
    days?: number;
  }) => {
    const response = await apiClient.get('/assignments/upcoming', { params: filters });
    return response.data;
  },

  getOverdueAssignments: async (filters?: {
    studentId?: string;
    sectionId?: string;
  }) => {
    const response = await apiClient.get('/assignments/overdue', { params: filters });
    return response.data;
  },

  // ==================== BULK OPERATIONS ====================
  bulkDeleteAssignments: async (assignmentIds: string[]) => {
    const response = await apiClient.post('/assignments/bulk-delete', { assignmentIds });
    return response.data;
  },

  exportAssignmentData: async (assignmentId: string) => {
    const response = await apiClient.get(`/assignments/${assignmentId}/export`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
