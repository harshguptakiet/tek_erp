import { apiClient } from '../lib/axios';

export const libraryService = {
  async listBooks(params?: { searchQuery?: string; category?: string; isAvailable?: boolean }) {
    const response = await apiClient.get('/library/books', { params });
    return response.data;
  },
  async getBookDetails(bookId: string) {
    const response = await apiClient.get(`/library/books/${bookId}`);
    return response.data;
  },
  async borrowBook(bookId: string, userId: string) {
    const response = await apiClient.post('/library/borrow', { bookId, userId });
    return response.data;
  },
  async returnBook(borrowId: string) {
    const response = await apiClient.post(`/library/return/${borrowId}`);
    return response.data;
  },
  async getBorrowedBooks(userId: string) {
    const response = await apiClient.get(`/library/borrowed/${userId}`);
    return response.data;
  },
};
