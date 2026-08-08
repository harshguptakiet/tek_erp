import { apiClient } from '../lib/axios';
import type { PaginatedResponse, BaseFilters } from '../types';

export interface Teacher {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  dateOfJoining: string;
  qualification?: string;
  specialization?: string;
  experience?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'RESIGNED';
  subjects?: any[];
  classes?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface TeacherFilters extends BaseFilters {
  schoolId?: string;
  subjectId?: string;
  classId?: string;
  status?: string;
  specialization?: string;
}

export interface CreateTeacherDto {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  dateOfJoining: string;
  qualification?: string;
  specialization?: string;
  experience?: number;
  address?: string;
  schoolId: string;
}

export const teacherService = {
  // ==================== BASIC CRUD ====================
  async getAll(filters: TeacherFilters): Promise<PaginatedResponse<Teacher>> {
    const { data } = await apiClient.get<PaginatedResponse<Teacher>>('/teachers', {
      params: filters,
    });
    return data;
  },

  async getById(id: string, include?: string[]): Promise<Teacher> {
    const { data } = await apiClient.get<Teacher>(`/teachers/${id}`, {
      params: include ? { include: include.join(',') } : {},
    });
    return data;
  },

  async create(dto: CreateTeacherDto): Promise<Teacher> {
    const { data } = await apiClient.post<Teacher>('/teachers', dto);
    return data;
  },

  async update(id: string, dto: Partial<CreateTeacherDto>): Promise<Teacher> {
    const { data } = await apiClient.patch<Teacher>(`/teachers/${id}`, dto);
    return data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/teachers/${id}`);
  },

  async updateStatus(id: string, status: string): Promise<Teacher> {
    const { data } = await apiClient.patch<Teacher>(`/teachers/${id}/status`, { status });
    return data;
  },

  // ==================== SUBJECT ASSIGNMENT ====================
  async getTeacherSubjects(teacherId: string): Promise<any[]> {
    const { data } = await apiClient.get(`/teachers/${teacherId}/subjects`);
    return data;
  },

  async assignSubject(teacherId: string, subjectId: string, classIds?: string[]): Promise<any> {
    const { data } = await apiClient.post(`/teachers/${teacherId}/subjects`, {
      subjectId,
      classIds,
    });
    return data;
  },

  async unassignSubject(teacherId: string, subjectId: string): Promise<void> {
    await apiClient.delete(`/teachers/${teacherId}/subjects/${subjectId}`);
  },

  // ==================== CLASS ASSIGNMENT ====================
  async getTeacherClasses(teacherId: string): Promise<any[]> {
    const { data } = await apiClient.get(`/teachers/${teacherId}/classes`);
    return data;
  },

  async assignClass(teacherId: string, classId: string, role?: string): Promise<any> {
    const { data } = await apiClient.post(`/teachers/${teacherId}/classes`, {
      classId,
      role,
    });
    return data;
  },

  async unassignClass(teacherId: string, classId: string): Promise<void> {
    await apiClient.delete(`/teachers/${teacherId}/classes/${classId}`);
  },

  // ==================== TIMETABLE ====================
  async getTeacherTimetable(teacherId: string, filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const { data } = await apiClient.get(`/teachers/${teacherId}/timetable`, {
      params: filters,
    });
    return data;
  },

  // ==================== PERFORMANCE ====================
  async getTeacherPerformance(teacherId: string, filters?: {
    academicYearId?: string;
  }): Promise<any> {
    const { data } = await apiClient.get(`/teachers/${teacherId}/performance`, {
      params: filters,
    });
    return data;
  },

  async getTeacherAnalytics(teacherId: string): Promise<any> {
    const { data } = await apiClient.get(`/teachers/${teacherId}/analytics`);
    return data;
  },

  // ==================== ATTENDANCE ====================
  async getTeacherAttendance(teacherId: string, filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const { data } = await apiClient.get(`/teachers/${teacherId}/attendance`, {
      params: filters,
    });
    return data;
  },

  // ==================== DOCUMENTS ====================
  async getDocuments(teacherId: string): Promise<any[]> {
    const { data } = await apiClient.get(`/teachers/${teacherId}/documents`);
    return data;
  },

  async uploadDocument(teacherId: string, document: {
    type: string;
    title: string;
    file: File;
    description?: string;
  }): Promise<any> {
    const formData = new FormData();
    formData.append('file', document.file);
    formData.append('type', document.type);
    formData.append('title', document.title);
    if (document.description) formData.append('description', document.description);
    
    const { data } = await apiClient.post(`/teachers/${teacherId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  // ==================== BULK OPERATIONS ====================
  async bulkImport(file: File): Promise<{ success: number; failed: number; errors: any[] }> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post('/teachers/bulk-import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async bulkExport(filters: TeacherFilters): Promise<Blob> {
    const { data } = await apiClient.get('/teachers/export', {
      params: filters,
      responseType: 'blob',
    });
    return data;
  },

  // ==================== SEARCH ====================
  async search(query: string, filters?: TeacherFilters): Promise<Teacher[]> {
    const { data } = await apiClient.get('/teachers/search', {
      params: { query, ...filters },
    });
    return data;
  },
};
