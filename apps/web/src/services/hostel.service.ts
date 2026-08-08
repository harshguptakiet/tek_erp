import { apiClient } from '../lib/axios';

export const hostelService = {
  async listRooms(params?: { schoolId?: string; hostelId?: string }) {
    const response = await apiClient.get('/hostel/rooms', { params });
    return response.data;
  },
  async getRoomDetails(roomId: string) {
    const response = await apiClient.get(`/hostel/rooms/${roomId}`);
    return response.data;
  },
  async allocateRoom(data: { studentId: string; roomId: string }) {
    const response = await apiClient.post('/hostel/allocate', data);
    return response.data;
  },
};
