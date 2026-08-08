import { apiClient } from '../lib/axios';

// Marketplace Service
export const marketplaceService = {
  // ==================== BROWSE ====================
  browseItems: async (filters?: {
    category?: string;
    searchQuery?: string;
    grade?: number;
    subjectId?: string;
  }) => {
    const response = await apiClient.get('/marketplace/items', { params: filters });
    return response.data;
  },

  getItem: async (id: string) => {
    const response = await apiClient.get(`/marketplace/items/${id}`);
    return response.data;
  },

  // ==================== PURCHASES ====================
  purchaseItem: async (data: {
    itemId: string;
    paymentMethod: string;
  }) => {
    const response = await apiClient.post('/marketplace/purchase', data);
    return response.data;
  },

  getMyPurchases: async () => {
    const response = await apiClient.get('/marketplace/my-purchases');
    return response.data;
  },

  browseMarketplace: async (filters?: any) => {
    const response = await apiClient.get('/marketplace/items', { params: filters });
    return response.data;
  },

  getProduct: async (id: string) => {
    const response = await apiClient.get(`/marketplace/items/${id}`);
    return response.data;
  },

  getSellerProducts: async () => {
    const response = await apiClient.get('/marketplace/my-items');
    return response.data;
  },

  getMySales: async () => {
    const response = await apiClient.get('/marketplace/my-purchases');
    return response.data;
  },

  listProduct: async (data: any) => {
    const response = await apiClient.post('/marketplace/items', data);
    return response.data;
  },

  updateProduct: async (id: string, data: any) => {
    const response = await apiClient.patch(`/marketplace/items/${id}`, data);
    return response.data;
  },

  purchaseProduct: async (data: any) => {
    const response = await apiClient.post('/marketplace/purchase', data);
    return response.data;
  },

  deleteProduct: async (id: string) => {
    const response = await apiClient.delete(`/marketplace/items/${id}`);
    return response.data;
  },
};
