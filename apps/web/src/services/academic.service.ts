import { apiClient } from '../lib/axios';

export interface CreateSubjectInput {
  name: string;
  code?: string;
  departmentId?: string;
  description?: string;
  [key: string]: unknown;
}

export interface CreateAcademicYearInput {
  name: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  [key: string]: unknown;
}

export const academicService = {
  async listAcademicYears(schoolId?: string) {
    const response = await apiClient.get('/academic/years', { params: { schoolId } });
    return response.data;
  },
  async getClassStructure(schoolId?: string) {
    const response = await apiClient.get('/academic/classes', { params: { schoolId } });
    return response.data;
  },
  async getSubjects(schoolId?: string) {
    const response = await apiClient.get('/academic/subjects', { params: { schoolId } });
    return response.data;
  },
  async getSubject(id: string) {
    const response = await apiClient.get(`/academic/subjects/${id}`);
    return response.data;
  },
  async createSubject(data: CreateSubjectInput) {
    const response = await apiClient.post('/academic/subjects', data);
    return response.data;
  },
  async updateSubject(id: string, data: Partial<CreateSubjectInput>) {
    const response = await apiClient.patch(`/academic/subjects/${id}`, data);
    return response.data;
  },
  async deleteSubject(id: string) {
    const response = await apiClient.delete(`/academic/subjects/${id}`);
    return response.data;
  },
  async createAcademicYear(data: CreateAcademicYearInput) {
    const response = await apiClient.post('/academic/years', data);
    return response.data;
  },
  async updateAcademicYear(id: string, data: Partial<CreateAcademicYearInput>) {
    const response = await apiClient.patch(`/academic/years/${id}`, data);
    return response.data;
  },
  async deleteAcademicYear(id: string) {
    const response = await apiClient.delete(`/academic/years/${id}`);
    return response.data;
  },
  async setCurrentAcademicYear(id: string) {
    const response = await apiClient.post(`/academic/years/${id}/set-current`);
    return response.data;
  },

  async getTimetable(classId?: string) {
    try {
      const response = await apiClient.get('/academic/timetable', { params: { classId } });
      return response.data;
    } catch {
      return null;
    }
  },
  async getSyllabusProgress(classId?: string) {
    try {
      const response = await apiClient.get('/academic/syllabus-progress', { params: { classId } });
      return response.data;
    } catch {
      return null;
    }
  },

  /** Alias used across pages */
  listSubjects(schoolId?: string) {
    return this.getSubjects(schoolId);
  },
  listClasses(schoolId?: string) {
    return this.getClassStructure(schoolId);
  },
};
