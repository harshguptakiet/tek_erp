import { apiClient } from '../lib/axios';

// Subject Service — wraps academic.service subject endpoints
export const subjectService = {
  async getAll(filters?: { classId?: string; schoolId?: string }) {
    const { data } = await apiClient.get('/academic/subjects', { params: filters });
    return data;
  },

  async getById(id: string) {
    const { data } = await apiClient.get(`/academic/subjects/${id}`);
    return data;
  },

  async create(dto: any) {
    const { data } = await apiClient.post('/academic/subjects', dto);
    return data;
  },

  async update(id: string, dto: any) {
    const { data } = await apiClient.patch(`/academic/subjects/${id}`, dto);
    return data;
  },

  async delete(id: string) {
    await apiClient.delete(`/academic/subjects/${id}`);
  },
};
