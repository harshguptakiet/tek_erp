import { apiClient } from '../lib/axios';

// Live Class Service
export const liveClassService = {
  // ==================== LIVE CLASSES ====================
  createLiveClass: async (data: {
    title: string;
    description?: string;
    subjectId: string;
    sectionId: string;
    scheduledAt: string;
    duration: number;
    platform: string;
    meetingUrl?: string;
  }) => {
    const response = await apiClient.post('/live-classes', data);
    return response.data;
  },

  listLiveClasses: async (filters?: {
    sectionId?: string;
    subjectId?: string;
    status?: string;
    date?: string;
  }) => {
    const response = await apiClient.get('/live-classes', { params: filters });
    return response.data;
  },

  getLiveClass: async (id: string) => {
    const response = await apiClient.get(`/live-classes/${id}`);
    return response.data;
  },

  updateLiveClass: async (id: string, data: any) => {
    const response = await apiClient.put(`/live-classes/${id}`, data);
    return response.data;
  },

  deleteLiveClass: async (id: string) => {
    const response = await apiClient.delete(`/live-classes/${id}`);
    return response.data;
  },

  // ==================== CLASS OPERATIONS ====================
  joinClass: async (id: string) => {
    const response = await apiClient.post(`/live-classes/${id}/join`);
    return response.data;
  },

  endClass: async (id: string) => {
    const response = await apiClient.post(`/live-classes/${id}/end`);
    return response.data;
  },

  getParticipants: async (id: string) => {
    const response = await apiClient.get(`/live-classes/${id}/participants`);
    return response.data;
  },

  recordAttendance: async (id: string, studentId: string, attended: boolean) => {
    const response = await apiClient.post(`/live-classes/${id}/attendance`, {
      studentId,
      attended,
    });
    return response.data;
  },

  // ==================== RECORDINGS ====================
  getRecordings: async (id: string) => {
    const response = await apiClient.get(`/live-classes/${id}/recordings`);
    return response.data;
  },

  uploadRecording: async (id: string, data: {
    recordingUrl: string;
    duration?: number;
  }) => {
    const response = await apiClient.post(`/live-classes/${id}/recordings`, data);
    return response.data;
  },

  // ==================== ANALYTICS ====================
  getClassAnalytics: async (id: string) => {
    const response = await apiClient.get(`/live-classes/${id}/analytics`);
    return response.data;
  },
};
