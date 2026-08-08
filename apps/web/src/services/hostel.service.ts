import { apiClient } from '../lib/axios';

export const hostelService = {
  async listRooms(params?: { schoolId?: string; hostelId?: string }) {
    const response = await apiClient.get('/hostel/rooms', { params });
    return response.data;
  },
  async getRoom(id: string) {
    const response = await apiClient.get(`/hostel/rooms/${id}`);
    return response.data;
  },
  async getRoomDetails(roomId: string) {
    const response = await apiClient.get(`/hostel/rooms/${roomId}`);
    return response.data;
  },
  async getAvailableRooms(params?: any) {
    const response = await apiClient.get('/hostel/rooms/available', { params });
    return response.data;
  },
  async addRoom(data: any) {
    const response = await apiClient.post('/hostel/rooms', data);
    return response.data;
  },
  async updateRoom(id: string, data: any) {
    const response = await apiClient.patch(`/hostel/rooms/${id}`, data);
    return response.data;
  },
  async allocateRoom(data: { studentId: string; roomId: string }) {
    const response = await apiClient.post('/hostel/allocate', data);
    return response.data;
  },
  async deallocateRoom(allocationId: string) {
    const response = await apiClient.post(`/hostel/deallocate/${allocationId}`);
    return response.data;
  },
  async listAllocations(params?: any) {
    const response = await apiClient.get('/hostel/allocations', { params });
    return response.data;
  },
  async getStudentAllocation(studentId: string) {
    const response = await apiClient.get(`/hostel/students/${studentId}/allocation`);
    return response.data;
  },
};
