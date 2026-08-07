import { apiClient } from '../lib/axios';

// Messaging Service
export const messageService = {
  // ==================== CONVERSATIONS ====================
  getConversations: async () => {
    const response = await apiClient.get('/messages');
    return response.data;
  },

  getConversation: async (id: string) => {
    const response = await apiClient.get(`/messages/${id}`);
    return response.data;
  },

  createConversation: async (data: {
    recipientId: string;
    message: string;
  }) => {
    const response = await apiClient.post('/messages', data);
    return response.data;
  },

  // ==================== MESSAGES ====================
  sendMessage: async (conversationId: string, data: {
    content: string;
    attachments?: string[];
  }) => {
    const response = await apiClient.post(`/messages/${conversationId}/send`, data);
    return response.data;
  },

  markAsRead: async (conversationId: string) => {
    const response = await apiClient.post(`/messages/${conversationId}/read`);
    return response.data;
  },

  deleteMessage: async (messageId: string) => {
    const response = await apiClient.delete(`/messages/${messageId}`);
    return response.data;
  },

  // ==================== PARENT-TEACHER MESSAGING ====================
  getParentTeacherMessages: async (studentId?: string) => {
    const response = await apiClient.get('/parent-teacher/messages', {
      params: studentId ? { studentId } : {},
    });
    return response.data;
  },

  sendParentTeacherMessage: async (data: {
    recipientId: string;
    studentId: string;
    subject: string;
    message: string;
  }) => {
    const response = await apiClient.post('/parent-teacher/messages', data);
    return response.data;
  },

  scheduleMeeting: async (data: {
    parentId: string;
    teacherId: string;
    studentId: string;
    scheduledAt: string;
    agenda: string;
  }) => {
    const response = await apiClient.post('/parent-teacher/meetings', data);
    return response.data;
  },

  getMeetings: async () => {
    const response = await apiClient.get('/parent-teacher/meetings');
    return response.data;
  },
};
