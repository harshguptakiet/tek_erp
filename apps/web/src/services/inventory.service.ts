import { apiClient } from '../lib/axios';

export const inventoryService = {
  async listItems(params?: any) {
    const response = await apiClient.get('/inventory/items', { params });
    return response.data;
  },

  async getItem(id: string) {
    const response = await apiClient.get(`/inventory/items/${id}`);
    return response.data;
  },

  async addItem(data: any) {
    const response = await apiClient.post('/inventory/items', data);
    return response.data;
  },

  async updateItem(id: string, data: any) {
    const response = await apiClient.put(`/inventory/items/${id}`, data);
    return response.data;
  },

  async deleteItem(id: string) {
    const response = await apiClient.delete(`/inventory/items/${id}`);
    return response.data;
  },

  async adjustStock(id: string, data: { quantity: number; reason: string }) {
    const response = await apiClient.post(`/inventory/items/${id}/adjust`, data);
    return response.data;
  },

  async getLowStockItems(schoolId: string) {
    const response = await apiClient.get('/inventory/low-stock', { params: { schoolId } });
    return response.data;
  },

  async exportInventory(filters?: any) {
    const response = await apiClient.get('/inventory/export', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },
};
