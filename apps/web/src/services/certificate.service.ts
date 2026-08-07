import { apiClient } from '../lib/axios';

// Certificate & ID Card Service
export const certificateService = {
  // ==================== CERTIFICATES ====================
  listCertificates: async (filters?: {
    studentId?: string;
    certificateType?: string;
  }) => {
    const response = await apiClient.get('/certificates', { params: filters });
    return response.data;
  },

  generateCertificate: async (data: {
    studentId: string;
    certificateType: string;
    templateId?: string;
    metadata?: any;
  }) => {
    const response = await apiClient.post('/certificates/generate', data);
    return response.data;
  },

  getCertificate: async (id: string) => {
    const response = await apiClient.get(`/certificates/${id}`);
    return response.data;
  },

  verifyCertificate: async (certificateNumber: string) => {
    const response = await apiClient.get(`/certificates/verify/${certificateNumber}`);
    return response.data;
  },

  // ==================== ID CARDS ====================
  listIDCards: async (filters?: {
    studentId?: string;
    status?: string;
  }) => {
    const response = await apiClient.get('/id-cards', { params: filters });
    return response.data;
  },

  generateIDCard: async (data: {
    studentId: string;
    templateId: string;
    academicYearId: string;
  }) => {
    const response = await apiClient.post('/id-cards/generate', data);
    return response.data;
  },

  getIDCard: async (id: string) => {
    const response = await apiClient.get(`/id-cards/${id}`);
    return response.data;
  },
};
