import { apiClient } from '../lib/axios';

// Class & Section Service — wraps academic.service endpoints for backward compat
export const classService = {
  async getAll(filters?: { schoolId?: string; academicYearId?: string }) {
    const { data } = await apiClient.get('/academic/classes', { params: filters });
    return data;
  },

  async getById(id: string) {
    const { data } = await apiClient.get(`/academic/classes/${id}`);
    return data;
  },

  async create(dto: any) {
    const { data } = await apiClient.post('/academic/classes', dto);
    return data;
  },

  async update(id: string, dto: any) {
    const { data } = await apiClient.patch(`/academic/classes/${id}`, dto);
    return data;
  },

  async delete(id: string) {
    await apiClient.delete(`/academic/classes/${id}`);
  },

  async getSections(classId: string) {
    const { data } = await apiClient.get(`/academic/classes/${classId}/sections`);
    return data;
  },
};
