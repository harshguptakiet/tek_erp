import { apiClient } from '../lib/axios';

// Section Service — wraps academic.service section endpoints
export const sectionService = {
  async getAll(filters?: { classId?: string; schoolId?: string }) {
    const { data } = await apiClient.get('/academic/sections', { params: filters });
    return data;
  },

  async getById(id: string) {
    const { data } = await apiClient.get(`/academic/sections/${id}`);
    return data;
  },

  async create(dto: any) {
    const { data } = await apiClient.post('/academic/sections', dto);
    return data;
  },

  async update(id: string, dto: any) {
    const { data } = await apiClient.patch(`/academic/sections/${id}`, dto);
    return data;
  },

  async delete(id: string) {
    await apiClient.delete(`/academic/sections/${id}`);
  },
};
