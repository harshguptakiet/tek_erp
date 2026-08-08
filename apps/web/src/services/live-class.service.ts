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
  startClass: async (id: string) => {
    const response = await apiClient.post(`/live-classes/${id}/start`);
    return response.data;
  },

  joinClass: async (id: string) => {
    const response = await apiClient.post(`/live-classes/${id}/join`);
    return response.data;
  },

  leaveClass: async (id: string) => {
    const response = await apiClient.post(`/live-classes/${id}/leave`);
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

  // ==================== PARTICIPANT CONTROLS ====================
  muteParticipant: async (id: string, userId: string) => {
    const response = await apiClient.post(`/live-classes/${id}/mute/${userId}`);
    return response.data;
  },

  unmuteParticipant: async (id: string, userId: string) => {
    const response = await apiClient.post(`/live-classes/${id}/unmute/${userId}`);
    return response.data;
  },

  removeParticipant: async (id: string, userId: string) => {
    const response = await apiClient.post(`/live-classes/${id}/remove/${userId}`);
    return response.data;
  },

  // ==================== ATTENDANCE ====================
  recordAttendance: async (id: string, studentId: string, attended: boolean) => {
    const response = await apiClient.post(`/live-classes/${id}/attendance`, {
      studentId,
      attended,
    });
    return response.data;
  },

  bulkRecordAttendance: async (id: string, attendanceRecords: Array<{
    studentId: string;
    attended: boolean;
    joinTime?: string;
    leaveTime?: string;
  }>) => {
    const response = await apiClient.post(`/live-classes/${id}/attendance/bulk`, {
      records: attendanceRecords,
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
    title?: string;
  }) => {
    const response = await apiClient.post(`/live-classes/${id}/recordings`, data);
    return response.data;
  },

  downloadRecording: async (recordingId: string) => {
    const response = await apiClient.post(`/recordings/${recordingId}/download`);
    return response.data;
  },

  deleteRecording: async (recordingId: string) => {
    const response = await apiClient.delete(`/recordings/${recordingId}`);
    return response.data;
  },

  // ==================== CHAT & WHITEBOARD ====================
  sendChatMessage: async (id: string, message: string) => {
    const response = await apiClient.post(`/live-classes/${id}/chat`, { message });
    return response.data;
  },

  getChatHistory: async (id: string) => {
    const response = await apiClient.get(`/live-classes/${id}/chat`);
    return response.data;
  },

  saveWhiteboardState: async (id: string, state: any) => {
    const response = await apiClient.post(`/live-classes/${id}/whiteboard`, { state });
    return response.data;
  },

  getWhiteboardState: async (id: string) => {
    const response = await apiClient.get(`/live-classes/${id}/whiteboard`);
    return response.data;
  },

  // ==================== ANALYTICS ====================
  getClassAnalytics: async (id: string) => {
    const response = await apiClient.get(`/live-classes/${id}/analytics`);
    return response.data;
  },

  getEngagementMetrics: async (id: string) => {
    const response = await apiClient.get(`/live-classes/${id}/engagement`);
    return response.data;
  },

  // ==================== BREAKOUT ROOMS ====================
  createBreakoutRooms: async (id: string, data: {
    roomCount: number;
    duration: number;
    assignmentType: 'automatic' | 'manual';
    assignments?: Array<{ roomId: string; userIds: string[] }>;
  }) => {
    const response = await apiClient.post(`/live-classes/${id}/breakout-rooms`, data);
    return response.data;
  },

  closeBreakoutRooms: async (id: string) => {
    const response = await apiClient.post(`/live-classes/${id}/breakout-rooms/close`);
    return response.data;
  },

  // ==================== POLLS & QUIZZES ====================
  createPoll: async (id: string, data: {
    question: string;
    options: string[];
    duration?: number;
  }) => {
    const response = await apiClient.post(`/live-classes/${id}/polls`, data);
    return response.data;
  },

  submitPollResponse: async (pollId: string, optionId: string) => {
    const response = await apiClient.post(`/polls/${pollId}/respond`, { optionId });
    return response.data;
  },

  getPollResults: async (pollId: string) => {
    const response = await apiClient.get(`/polls/${pollId}/results`);
    return response.data;
  },
};
