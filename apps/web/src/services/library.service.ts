import { apiClient } from '../lib/axios';

export const libraryService = {
  async listBooks(params?: { searchQuery?: string; category?: string; isAvailable?: boolean }) {
    const response = await apiClient.get('/library/books', { params });
    return response.data;
  },
  async getBook(id: string) {
    const response = await apiClient.get(`/library/books/${id}`);
    return response.data;
  },
  async getBookDetails(bookId: string) {
    const response = await apiClient.get(`/library/books/${bookId}`);
    return response.data;
  },
  async addBook(data: any) {
    const response = await apiClient.post('/library/books', data);
    return response.data;
  },
  async updateBook(id: string, data: any) {
    const response = await apiClient.patch(`/library/books/${id}`, data);
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
  async getIssuedBooks(params?: any) {
    const response = await apiClient.get('/library/issued', { params });
    return response.data;
  },
  async getStudentIssuedBooks(studentId: string) {
    const response = await apiClient.get(`/library/students/${studentId}/issued`);
    return response.data;
  },
  async getOverdueBooks(params?: any) {
    const response = await apiClient.get('/library/overdue', { params });
    return response.data;
  },
  async issueBook(data: any) {
    const response = await apiClient.post('/library/issue', data);
    return response.data;
  },
  async renewBook(borrowId: string) {
    const response = await apiClient.post(`/library/renew/${borrowId}`);
    return response.data;
  },
};
