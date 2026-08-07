import { apiClient } from '../lib/axios';

// Transport Management Service
export const transportService = {
  // ==================== BUSES ====================
  listBuses: async (schoolId?: string) => {
    const response = await apiClient.get('/transport/buses', {
      params: schoolId ? { schoolId } : {},
    });
    return response.data;
  },

  getBus: async (id: string) => {
    const response = await apiClient.get(`/transport/buses/${id}`);
    return response.data;
  },

  createBus: async (data: {
    schoolId: string;
    busNumber: string;
    capacity: number;
    driverId?: string;
  }) => {
    const response = await apiClient.post('/transport/buses', data);
    return response.data;
  },

  // ==================== ROUTES ====================
  listRoutes: async (schoolId?: string) => {
    const response = await apiClient.get('/transport/routes', {
      params: schoolId ? { schoolId } : {},
    });
    return response.data;
  },

  createRoute: async (data: {
    schoolId: string;
    routeName: string;
    stops: Array<{ name: string; time: string }>;
  }) => {
    const response = await apiClient.post('/transport/routes', data);
    return response.data;
  },

  // ==================== ASSIGNMENTS ====================
  assignStudent: async (data: {
    studentId: string;
    busId: string;
    routeId: string;
    stopId: string;
  }) => {
    const response = await apiClient.post('/transport/assign', data);
    return response.data;
  },

  getStudentTransport: async (studentId: string) => {
    const response = await apiClient.get(`/transport/student/${studentId}`);
    return response.data;
  },
};
