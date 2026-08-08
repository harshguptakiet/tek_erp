import { apiClient } from '../lib/axios';

// Event Management Service
export const eventService = {
  // ==================== EVENTS ====================
  listEvents: async (filters?: {
    schoolId?: string;
    eventType?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get('/events', { params: filters });
    return response.data;
  },

  getEvent: async (id: string) => {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
  },

  createEvent: async (data: {
    schoolId: string;
    title: string;
    description?: string;
    eventType: string;
    startDate: string;
    endDate?: string;
    location?: string;
  }) => {
    const response = await apiClient.post('/events', data);
    return response.data;
  },

  updateEvent: async (id: string, data: any) => {
    const response = await apiClient.put(`/events/${id}`, data);
    return response.data;
  },

  deleteEvent: async (id: string) => {
    const response = await apiClient.delete(`/events/${id}`);
    return response.data;
  },

  getUpcomingEvents: async (filters?: any) => {
    const response = await apiClient.get('/events/upcoming', { params: filters });
    return response.data;
  },

  // ==================== REGISTRATIONS ====================
  registerForEvent: async (eventId: string) => {
    const response = await apiClient.post(`/events/${eventId}/register`);
    return response.data;
  },

  cancelRegistration: async (eventId: string) => {
    const response = await apiClient.post(`/events/${eventId}/cancel`);
    return response.data;
  },

  getEventRegistrations: async (eventId: string) => {
    const response = await apiClient.get(`/events/${eventId}/registrations`);
    return response.data;
  },

  getMyRegistrations: async () => {
    const response = await apiClient.get('/events/my-registrations');
    return response.data;
  },

  getEventParticipants: async (eventId: string) => {
    const response = await apiClient.get(`/events/${eventId}/participants`);
    return response.data;
  },
};
