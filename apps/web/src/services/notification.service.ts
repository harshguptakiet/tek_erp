import { apiClient } from '../lib/axios';

// Notification Service
export const notificationService = {
  // ==================== NOTIFICATIONS ====================
  getNotifications: async (filters?: {
    status?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/notifications', { params: filters });
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await apiClient.post(`/notifications/mark-read/${id}`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await apiClient.post('/notifications/mark-all-read');
    return response.data;
  },

  deleteNotification: async (id: string) => {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data;
  },

  // ==================== PREFERENCES ====================
  getPreferences: async () => {
    const response = await apiClient.get('/notifications/preferences');
    return response.data;
  },

  updatePreferences: async (preferences: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    inApp?: boolean;
    categories?: Record<string, boolean>;
  }) => {
    const response = await apiClient.put('/notifications/preferences', preferences);
    return response.data;
  },

  // ==================== SEND NOTIFICATION ====================
  sendNotification: async (data: {
    recipientId: string;
    title: string;
    message: string;
    priority?: string;
    channels?: string[];
  }) => {
    const response = await apiClient.post('/notifications/send', data);
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data;
  },
};
