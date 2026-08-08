import { apiClient } from '../lib/axios';

export const transportService = {
  async listBuses(schoolId?: string) {
    const response = await apiClient.get('/transport/buses', { params: { schoolId } });
    return response.data;
  },
  async listRoutes(schoolId?: string) {
    const response = await apiClient.get('/transport/routes', { params: { schoolId } });
    return response.data;
  },
  async getBusDetails(busId: string) {
    const response = await apiClient.get(`/transport/buses/${busId}`);
    return response.data;
  },
  async trackBus(busId: string) {
    const response = await apiClient.get(`/transport/buses/${busId}/track`);
    return response.data;
  },
};
