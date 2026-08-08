import { apiClient } from '../lib/axios';

export const transportService = {
  async listBuses(schoolId?: string) {
    const response = await apiClient.get('/transport/buses', { params: { schoolId } });
    return response.data;
  },
  async getBus(id: string) {
    const response = await apiClient.get(`/transport/buses/${id}`);
    return response.data;
  },
  async getBusDetails(busId: string) {
    const response = await apiClient.get(`/transport/buses/${busId}`);
    return response.data;
  },
  async addBus(data: any) {
    const response = await apiClient.post('/transport/buses', data);
    return response.data;
  },
  async updateBus(id: string, data: any) {
    const response = await apiClient.patch(`/transport/buses/${id}`, data);
    return response.data;
  },
  async listRoutes(schoolId?: string) {
    const response = await apiClient.get('/transport/routes', { params: { schoolId } });
    return response.data;
  },
  async getRoute(id: string) {
    const response = await apiClient.get(`/transport/routes/${id}`);
    return response.data;
  },
  async createRoute(data: any) {
    const response = await apiClient.post('/transport/routes', data);
    return response.data;
  },
  async updateRoute(id: string, data: any) {
    const response = await apiClient.patch(`/transport/routes/${id}`, data);
    return response.data;
  },
  async getStudentAssignment(studentId: string) {
    const response = await apiClient.get(`/transport/students/${studentId}/assignment`);
    return response.data;
  },
  async assignStudent(data: any) {
    const response = await apiClient.post('/transport/assignments', data);
    return response.data;
  },
  async unassignStudent(assignmentId: string) {
    const response = await apiClient.delete(`/transport/assignments/${assignmentId}`);
    return response.data;
  },
  async trackBus(busId: string) {
    const response = await apiClient.get(`/transport/buses/${busId}/track`);
    return response.data;
  },
};
