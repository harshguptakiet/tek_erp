/**
 * Grade Book Service
 * Handles all grade-related API calls
 */

import { apiClient } from '../lib/axios';

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  examId?: string;
  assignmentId?: string;
  marks: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  remarks?: string;
  teacherId: string;
  academicYearId: string;
  termId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GradeEntry {
  studentId: string;
  subjectId: string;
  examId?: string;
  assignmentId?: string;
  marks: number;
  maxMarks: number;
  remarks?: string;
}

export interface GradeBookSummary {
  studentId: string;
  studentName: string;
  rollNumber: string;
  subjects: {
    subjectId: string;
    subjectName: string;
    marks: number;
    maxMarks: number;
    percentage: number;
    grade: string;
  }[];
  totalMarks: number;
  totalMaxMarks: number;
  overallPercentage: number;
  overallGrade: string;
  rank?: number;
}

export const gradebookService = {
  /**
   * Get grades for a class
   */
  async getClassGrades(classId: string, params?: {
    subjectId?: string;
    examId?: string;
    termId?: string;
  }) {
    const response = await apiClient.get<Grade[]>(`/grades/class/${classId}`, { params });
    return response.data;
  },

  /**
   * Get grades for a student
   */
  async getStudentGrades(studentId: string, params?: {
    subjectId?: string;
    termId?: string;
    academicYearId?: string;
  }) {
    const response = await apiClient.get<Grade[]>(`/grades/student/${studentId}`, { params });
    return response.data;
  },

  /**
   * Get grade book summary for a class
   */
  async getClassGradeBook(classId: string, params?: {
    examId?: string;
    termId?: string;
  }) {
    const response = await apiClient.get<GradeBookSummary[]>(`/grades/class/${classId}/summary`, { params });
    return response.data;
  },

  /**
   * Enter grades for students
   */
  async enterGrades(grades: GradeEntry[]) {
    const response = await apiClient.post<{ success: boolean; count: number }>('/grades/bulk', { grades });
    return response.data;
  },

  /**
   * Update a single grade
   */
  async updateGrade(gradeId: string, data: Partial<GradeEntry>) {
    const response = await apiClient.patch<Grade>(`/grades/${gradeId}`, data);
    return response.data;
  },

  /**
   * Delete a grade
   */
  async deleteGrade(gradeId: string) {
    const response = await apiClient.delete(`/grades/${gradeId}`);
    return response.data;
  },

  /**
   * Calculate and update ranks
   */
  async calculateRanks(classId: string, examId: string) {
    const response = await apiClient.post(`/grades/class/${classId}/calculate-ranks`, { examId });
    return response.data;
  },

  /**
   * Export grade book
   */
  async exportGradeBook(classId: string, format: 'csv' | 'pdf' | 'excel', params?: {
    examId?: string;
    termId?: string;
  }) {
    const response = await apiClient.get(`/grades/class/${classId}/export`, {
      params: { ...params, format },
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Get grade statistics
   */
  async getGradeStatistics(classId: string, params?: {
    subjectId?: string;
    examId?: string;
  }) {
    const response = await apiClient.get(`/grades/class/${classId}/statistics`, { params });
    return response.data;
  },
};
