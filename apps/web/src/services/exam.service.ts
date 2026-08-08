import { apiClient } from '../lib/axios';

export const examService = {
  // ==================== QUESTION BANK ====================
  async searchQuestions(filters?: {
    query?: string;
    subjectId?: string;
    chapterId?: string;
    topicId?: string;
    difficulty?: string;
    type?: string;
    tags?: string[];
  }) {
    const response = await apiClient.get('/questions', { params: filters });
    return response.data;
  },

  async getQuestion(id: string) {
    const response = await apiClient.get(`/questions/${id}`);
    return response.data;
  },

  async createQuestion(data: {
    subjectId: string;
    chapterId?: string;
    topicId?: string;
    type: string;
    difficulty: string;
    questionText: string;
    options?: any[];
    correctAnswer?: any;
    explanation?: string;
    marks: number;
    tags?: string[];
    attachments?: string[];
  }) {
    const response = await apiClient.post('/questions', data);
    return response.data;
  },

  async updateQuestion(id: string, data: any) {
    const response = await apiClient.put(`/questions/${id}`, data);
    return response.data;
  },

  async deleteQuestion(id: string) {
    const response = await apiClient.delete(`/questions/${id}`);
    return response.data;
  },

  async bulkImportQuestions(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/questions/bulk-import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // ==================== EXAM MANAGEMENT ====================
  async listExams(filters?: {
    schoolId?: string;
    classId?: string;
    subjectId?: string;
    status?: string;
    academicYearId?: string;
  }) {
    const response = await apiClient.get('/exams', { params: filters });
    return response.data;
  },

  async getExam(id: string) {
    const response = await apiClient.get(`/exams/${id}`);
    return response.data;
  },

  async createExam(data: {
    title: string;
    description?: string;
    subjectId: string;
    classId: string;
    academicYearId: string;
    examType: string;
    totalMarks: number;
    passingMarks: number;
    duration: number;
    scheduledAt: string;
    instructions?: string;
  }) {
    const response = await apiClient.post('/exams', data);
    return response.data;
  },

  async updateExam(id: string, data: any) {
    const response = await apiClient.put(`/exams/${id}`, data);
    return response.data;
  },

  async deleteExam(id: string) {
    const response = await apiClient.delete(`/exams/${id}`);
    return response.data;
  },

  async publishExam(id: string) {
    const response = await apiClient.post(`/exams/${id}/publish`);
    return response.data;
  },

  async publishResults(id: string) {
    const response = await apiClient.post(`/exams/${id}/publish-results`);
    return response.data;
  },

  // ==================== EXAM BLUEPRINT ====================
  async generateExamPaper(data: {
    examId: string;
    blueprint: Array<{
      chapterId?: string;
      topicId?: string;
      difficulty: string;
      questionType: string;
      count: number;
      marksPerQuestion: number;
    }>;
  }) {
    const response = await apiClient.post('/exams/generate', data);
    return response.data;
  },

  // ==================== EXAM ASSIGNMENT ====================
  async assignExam(examId: string, data: {
    studentIds?: string[];
    classIds?: string[];
    sectionIds?: string[];
  }) {
    const response = await apiClient.post(`/exams/${examId}/assign`, data);
    return response.data;
  },

  async getExamAssignments(examId: string) {
    const response = await apiClient.get(`/exams/${examId}/assignments`);
    return response.data;
  },

  // ==================== EXAM ATTEMPTS ====================
  async startExamAttempt(examId: string) {
    const response = await apiClient.post(`/exams/${examId}/start`);
    return response.data;
  },

  async submitExam(examId: string, data: {
    attemptId: string;
    answers: Array<{
      questionId: string;
      answer: any;
    }>;
  }) {
    const response = await apiClient.post(`/exams/${examId}/submit`, data);
    return response.data;
  },

  async getExamAttempts(examId: string, filters?: {
    studentId?: string;
    status?: string;
  }) {
    const response = await apiClient.get(`/exams/${examId}/attempts`, { params: filters });
    return response.data;
  },

  async getAttemptDetails(attemptId: string) {
    const response = await apiClient.get(`/attempts/${attemptId}`);
    return response.data;
  },

  async getAttemptAnswers(attemptId: string) {
    const response = await apiClient.get(`/attempts/${attemptId}/answers`);
    return response.data;
  },

  async gradeAttempt(attemptId: string, data: {
    questionGrades: Array<{
      questionId: string;
      marksObtained: number;
      feedback?: string;
    }>;
  }) {
    const response = await apiClient.post(`/attempts/${attemptId}/grade`, data);
    return response.data;
  },

  // ==================== RANKINGS & ANALYTICS ====================
  async getExamRankings(examId: string, scope?: string) {
    const response = await apiClient.get(`/exams/${examId}/rankings`, {
      params: scope ? { scope } : {},
    });
    return response.data;
  },

  async getExamAnalytics(examId: string) {
    const response = await apiClient.get(`/exams/${examId}/analytics`);
    return response.data;
  },

  async getStudentRank(studentId: string, scope: string) {
    const response = await apiClient.get(`/rankings/student/${studentId}/${scope}`);
    return response.data;
  },

  // ==================== REPORT CARDS ====================
  async listReportCards(params?: { 
    studentId?: string;
    academicYearId?: string;
    classId?: string;
  }) {
    const response = await apiClient.get('/report-cards', { params });
    return response.data;
  },

  async generateReportCard(studentId: string, academicYearId: string) {
    const response = await apiClient.post('/report-cards/generate', { studentId, academicYearId });
    return response.data;
  },

  async getReportCard(id: string) {
    const response = await apiClient.get(`/report-cards/${id}`);
    return response.data;
  },

  async bulkGenerateReportCards(data: {
    classId: string;
    academicYearId: string;
    studentIds?: string[];
  }) {
    const response = await apiClient.post('/report-cards/bulk-generate', data);
    return response.data;
  },

  async downloadReportCard(id: string) {
    const response = await apiClient.get(`/report-cards/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
