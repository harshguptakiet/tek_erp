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

  // ==================== SELLER ====================
  listMyItems: async () => {
    const response = await apiClient.get('/marketplace/my-items');
    return response.data;
  },

  createItem: async (data: {
    title: string;
    description: string;
    price: number;
    category: string;
    contentId?: string;
  }) => {
    const response = await apiClient.post('/marketplace/items', data);
    return response.data;
  },
};
