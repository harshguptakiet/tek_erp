import { apiClient } from '../lib/axios';

export const payrollService = {
  async listPayrollRecords(params?: any) {
    const response = await apiClient.get('/payroll/records', { params });
    return response.data;
  },

  async getPayrollRecord(id: string) {
    const response = await apiClient.get(`/payroll/records/${id}`);
    return response.data;
  },

  async createPayrollRecord(data: any) {
    const response = await apiClient.post('/payroll/records', data);
    return response.data;
  },

  async updatePayrollRecord(id: string, data: any) {
    const response = await apiClient.put(`/payroll/records/${id}`, data);
    return response.data;
  },

  async processPayroll(id: string) {
    const response = await apiClient.post(`/payroll/records/${id}/process`);
    return response.data;
  },

  async markAsPaid(id: string, data: { paidDate: string; paymentMethod: string }) {
    const response = await apiClient.post(`/payroll/records/${id}/mark-paid`, data);
    return response.data;
  },

  async generatePayslip(id: string) {
    const response = await apiClient.get(`/payroll/records/${id}/payslip`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async bulkProcessPayroll(recordIds: string[]) {
    const response = await apiClient.post('/payroll/bulk-process', { recordIds });
    return response.data;
  },

  async getPayrollSummary(params: { month: number; year: number; schoolId: string }) {
    const response = await apiClient.get('/payroll/summary', { params });
    return response.data;
  },
};
