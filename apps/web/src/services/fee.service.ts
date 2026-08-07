import { apiClient } from '../lib/axios';

// Fee & Payment Service
export const feeService = {
  // ==================== FEE STRUCTURES ====================
  createFeeStructure: async (data: {
    schoolId: string;
    name: string;
    academicYearId: string;
    classId: string;
    components: Array<{
      name: string;
      amount: number;
      isOptional?: boolean;
    }>;
  }) => {
    const response = await apiClient.post('/fees/structures', data);
    return response.data;
  },

  listFeeStructures: async (filters?: {
    schoolId?: string;
    academicYearId?: string;
    classId?: string;
  }) => {
    const response = await apiClient.get('/fees/structures', { params: filters });
    return response.data;
  },

  getFeeStructure: async (id: string) => {
    const response = await apiClient.get(`/fees/structures/${id}`);
    return response.data;
  },

  // ==================== PAYMENTS ====================
  processPayment: async (data: {
    studentId: string;
    feeStructureId: string;
    amount: number;
    paymentMethod: string;
    transactionId?: string;
  }) => {
    const response = await apiClient.post('/fees/pay', data);
    return response.data;
  },

  getPaymentHistory: async (filters?: {
    studentId?: string;
    schoolId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get('/fees/payments', { params: filters });
    return response.data;
  },

  getStudentFeeDetails: async (studentId: string) => {
    const response = await apiClient.get(`/fees/student/${studentId}`);
    return response.data;
  },

  generateReceipt: async (paymentId: string) => {
    const response = await apiClient.get(`/fees/payments/${paymentId}/receipt`);
    return response.data;
  },

  // ==================== DISCOUNTS & REFUNDS ====================
  applyDiscount: async (data: {
    studentId: string;
    feeStructureId: string;
    discountType: string;
    amount: number;
    reason: string;
  }) => {
    const response = await apiClient.post('/fees/discounts', data);
    return response.data;
  },

  processRefund: async (paymentId: string, data: {
    amount: number;
    reason: string;
  }) => {
    const response = await apiClient.post(`/fees/payments/${paymentId}/refund`, data);
    return response.data;
  },

  // ==================== REPORTS ====================
  getCollectionReport: async (filters?: {
    schoolId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get('/fees/reports/collection', { params: filters });
    return response.data;
  },

  getDueReport: async (schoolId: string) => {
    const response = await apiClient.get('/fees/reports/due', {
      params: { schoolId },
    });
    return response.data;
  },
};
