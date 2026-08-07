import { apiClient } from '../lib/axios';
import type { PaginatedResponse, BaseFilters } from '../types';

export interface Student {
  id: string;
  admissionNumber: string;
  rollNumber?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  email?: string;
  phone?: string;
  bloodGroup?: string;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'TRANSFERRED';
  enrollmentDate: string;
  class?: {
    id: string;
    name: string;
    section: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface StudentFilters extends BaseFilters {
  classId?: string;
  sectionId?: string;
  gender?: string;
  bloodGroup?: string;
}

export interface CreateStudentDto {
  admissionNumber: string;
  rollNumber?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  email?: string;
  phone?: string;
  bloodGroup?: string;
  address?: string;
  classId: string;
  sectionId?: string;
}

export interface UpdateStudentDto extends Partial<CreateStudentDto> {
  status?: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'TRANSFERRED';
}

export const studentService = {
  async getAll(filters: StudentFilters): Promise<PaginatedResponse<Student>> {
    const { data } = await apiClient.get<PaginatedResponse<Student>>('/students', {
      params: filters,
    });
    return data;
  },

  async getById(id: string): Promise<Student> {
    const { data } = await apiClient.get<Student>(`/students/${id}`);
    return data;
  },

  async create(dto: CreateStudentDto): Promise<Student> {
    const { data } = await apiClient.post<Student>('/students', dto);
    return data;
  },

  async update(id: string, dto: UpdateStudentDto): Promise<Student> {
    const { data } = await apiClient.patch<Student>(`/students/${id}`, dto);
    return data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/students/${id}`);
  },

  async bulkImport(file: File): Promise<{ success: number; failed: number }> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post('/students/bulk-import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
