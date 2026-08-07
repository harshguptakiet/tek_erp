import { apiClient } from '../lib/axios';

// Library Management Service
export const libraryService = {
  // ==================== BOOKS ====================
  listBooks: async (filters?: {
    searchQuery?: string;
    category?: string;
    isAvailable?: boolean;
  }) => {
    const response = await apiClient.get('/library/books', { params: filters });
    return response.data;
  },

  getBook: async (id: string) => {
    const response = await apiClient.get(`/library/books/${id}`);
    return response.data;
  },

  addBook: async (data: {
    title: string;
    author: string;
    isbn?: string;
    category: string;
    quantity: number;
  }) => {
    const response = await apiClient.post('/library/books', data);
    return response.data;
  },

  // ==================== ISSUE & RETURN ====================
  issueBook: async (data: {
    bookId: string;
    userId: string;
    dueDate: string;
  }) => {
    const response = await apiClient.post('/library/issue', data);
    return response.data;
  },

  returnBook: async (issueId: string) => {
    const response = await apiClient.post('/library/return', { issueId });
    return response.data;
  },

  getBorrowedBooks: async (userId: string) => {
    const response = await apiClient.get(`/library/borrowed/${userId}`);
    return response.data;
  },

  getOverdueBooks: async (schoolId: string) => {
    const response = await apiClient.get('/library/overdue', {
      params: { schoolId },
    });
    return response.data;
  },
};
