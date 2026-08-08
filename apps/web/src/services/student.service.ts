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
  // ==================== BASIC CRUD ====================
  async getAll(filters: StudentFilters): Promise<PaginatedResponse<Student>> {
    const { data } = await apiClient.get<PaginatedResponse<Student>>('/students', {
      params: filters,
    });
    return data;
  },

  async getById(id: string, include?: string[]): Promise<Student> {
    const { data } = await apiClient.get<Student>(`/students/${id}`, {
      params: include ? { include: include.join(',') } : {},
    });
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

  async updateStatus(id: string, status: string): Promise<Student> {
    const { data } = await apiClient.patch<Student>(`/students/${id}/status`, { status });
    return data;
  },

  // ==================== BULK OPERATIONS ====================
  async bulkImport(file: File): Promise<{ success: number; failed: number; errors: any[] }> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post('/students/bulk-import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async bulkExport(filters: StudentFilters): Promise<Blob> {
    const { data } = await apiClient.get('/students/export', {
      params: filters,
      responseType: 'blob',
    });
    return data;
  },

  async bulkDelete(studentIds: string[]): Promise<{ deleted: number }> {
    const { data } = await apiClient.post('/students/bulk-delete', { studentIds });
    return data;
  },

  async bulkUpdateClass(studentIds: string[], classId: string, sectionId?: string): Promise<void> {
    await apiClient.post('/students/bulk-update-class', { studentIds, classId, sectionId });
  },

  async bulkPromote(classId: string, targetClassId: string): Promise<{ promoted: number }> {
    const { data } = await apiClient.post('/students/bulk-promote', { classId, targetClassId });
    return data;
  },

  // ==================== PARENT LINKING ====================
  async getParents(studentId: string): Promise<any[]> {
    const { data } = await apiClient.get(`/students/${studentId}/parents`);
    return data;
  },

  async linkParent(studentId: string, parentData: {
    userId?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    relationship: string;
  }): Promise<any> {
    const { data } = await apiClient.post(`/students/${studentId}/parents`, parentData);
    return data;
  },

  async unlinkParent(studentId: string, parentId: string): Promise<void> {
    await apiClient.delete(`/students/${studentId}/parents/${parentId}`);
  },

  // ==================== ACADEMIC HISTORY ====================
  async getAcademicHistory(studentId: string): Promise<any[]> {
    const { data } = await apiClient.get(`/students/${studentId}/academic-history`);
    return data;
  },

  async getEnrollmentHistory(studentId: string): Promise<any[]> {
    const { data } = await apiClient.get(`/students/${studentId}/enrollments`);
    return data;
  },

  async enrollInClass(studentId: string, classId: string, sectionId?: string, academicYearId?: string): Promise<any> {
    const { data } = await apiClient.post(`/students/${studentId}/enroll`, {
      classId,
      sectionId,
      academicYearId,
    });
    return data;
  },

  async unenrollFromClass(studentId: string, enrollmentId: string): Promise<void> {
    await apiClient.delete(`/students/${studentId}/enrollments/${enrollmentId}`);
  },

  // ==================== HEALTH RECORDS ====================
  async getHealthRecords(studentId: string): Promise<any> {
    const { data } = await apiClient.get(`/students/${studentId}/health`);
    return data;
  },

  async updateHealthRecord(studentId: string, healthData: {
    bloodGroup?: string;
    height?: number;
    weight?: number;
    allergies?: string[];
    medications?: string[];
    emergencyContact?: string;
    emergencyPhone?: string;
    medicalConditions?: string[];
  }): Promise<any> {
    const { data } = await apiClient.put(`/students/${studentId}/health`, healthData);
    return data;
  },

  async addMedicalRecord(studentId: string, record: {
    date: string;
    type: string;
    description: string;
    doctorName?: string;
    prescriptions?: string[];
    attachments?: string[];
  }): Promise<any> {
    const { data } = await apiClient.post(`/students/${studentId}/health/records`, record);
    return data;
  },

  // ==================== DOCUMENTS ====================
  async getDocuments(studentId: string): Promise<any[]> {
    const { data } = await apiClient.get(`/students/${studentId}/documents`);
    return data;
  },

  async uploadDocument(studentId: string, document: {
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
    
    const { data } = await apiClient.post(`/students/${studentId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async deleteDocument(studentId: string, documentId: string): Promise<void> {
    await apiClient.delete(`/students/${studentId}/documents/${documentId}`);
  },

  // ==================== TRANSFER & GRADUATION ====================
  async transferStudent(studentId: string, transferData: {
    targetSchoolId: string;
    effectiveDate: string;
    reason: string;
    remarks?: string;
  }): Promise<any> {
    const { data } = await apiClient.post(`/students/${studentId}/transfer`, transferData);
    return data;
  },

  async graduateStudent(studentId: string, graduationData: {
    graduationDate: string;
    certificate?: string;
    remarks?: string;
  }): Promise<any> {
    const { data } = await apiClient.post(`/students/${studentId}/graduate`, graduationData);
    return data;
  },

  // ==================== ATTENDANCE & PERFORMANCE ====================
  async getAttendanceSummary(studentId: string, filters?: {
    startDate?: string;
    endDate?: string;
    academicYearId?: string;
  }): Promise<any> {
    const { data } = await apiClient.get(`/students/${studentId}/attendance/summary`, {
      params: filters,
    });
    return data;
  },

  async getPerformanceSummary(studentId: string, filters?: {
    academicYearId?: string;
    subjectId?: string;
  }): Promise<any> {
    const { data } = await apiClient.get(`/students/${studentId}/performance`, {
      params: filters,
    });
    return data;
  },

  async getGrades(studentId: string, academicYearId?: string): Promise<any[]> {
    const { data } = await apiClient.get(`/students/${studentId}/grades`, {
      params: academicYearId ? { academicYearId } : {},
    });
    return data;
  },

  // ==================== SEARCH & DISCOVERY ====================
  async search(query: string, filters?: StudentFilters): Promise<Student[]> {
    const { data } = await apiClient.get('/students/search', {
      params: { query, ...filters },
    });
    return data;
  },

  async findByAdmissionNumber(admissionNumber: string): Promise<Student> {
    const { data } = await apiClient.get(`/students/admission/${admissionNumber}`);
    return data;
  },

  async findByRollNumber(classId: string, rollNumber: string): Promise<Student> {
    const { data } = await apiClient.get(`/students/roll/${classId}/${rollNumber}`);
    return data;
  },
};
