import { apiClient } from '../lib/axios';

// Hostel Management Service
export const hostelService = {
  // ==================== ROOMS ====================
  listRooms: async (filters?: {
    schoolId?: string;
    hostelId?: string;
    isAvailable?: boolean;
  }) => {
    const response = await apiClient.get('/hostel/rooms', { params: filters });
    return response.data;
  },

  getRoom: async (id: string) => {
    const response = await apiClient.get(`/hostel/rooms/${id}`);
    return response.data;
  },

  createRoom: async (data: {
    hostelId: string;
    roomNumber: string;
    capacity: number;
    floor?: number;
  }) => {
    const response = await apiClient.post('/hostel/rooms', data);
    return response.data;
  },

  // ==================== ALLOCATIONS ====================
  allocateRoom: async (data: {
    studentId: string;
    roomId: string;
    startDate: string;
    endDate?: string;
  }) => {
    const response = await apiClient.post('/hostel/allocate', data);
    return response.data;
  },

  getResidents: async (roomId?: string, hostelId?: string) => {
    const response = await apiClient.get('/hostel/residents', {
      params: { roomId, hostelId },
    });
    return response.data;
  },

  getStudentHostel: async (studentId: string) => {
    const response = await apiClient.get(`/hostel/student/${studentId}`);
    return response.data;
  },
};
