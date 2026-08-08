/**
 * Leave Management Service
 * Handles all leave-related API calls
 */

import { apiClient } from '../lib/axios';

export interface Leave {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  leaveTypeId: string;
  leaveTypeName: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  approvedBy?: string;
  approverName?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  allowedDays: number;
  requiresApproval: boolean;
  color: string;
  description?: string;
}

export interface LeaveBalance {
  userId: string;
  leaveTypeId: string;
  leaveTypeName: string;
  totalAllowed: number;
  used: number;
  pending: number;
  available: number;
  academicYearId: string;
}

export interface ApplyLeaveDto {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  attachments?: string[];
}

export interface ApproveLeaveDto {
  status: 'APPROVED' | 'REJECTED';
  remarks?: string;
}

export const leaveService = {
  /**
   * Get all leave types
   */
  async getLeaveTypes() {
    const response = await apiClient.get<LeaveType[]>('/leaves/types');
    return response.data;
  },

  /**
   * Get leave balance for a user
   */
  async getLeaveBalance(userId?: string) {
    const url = userId ? `/leaves/balance/${userId}` : '/leaves/balance';
    const response = await apiClient.get<LeaveBalance[]>(url);
    return response.data;
  },

  /**
   * Get leaves for the current user
   */
  async getMyLeaves(params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const response = await apiClient.get<Leave[]>('/leaves/my-leaves', { params });
    return response.data;
  },

  /**
   * Get all leaves (for admins/managers)
   */
  async getAllLeaves(params?: {
    userId?: string;
    status?: string;
    leaveTypeId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const response = await apiClient.get<Leave[]>('/leaves', { params });
    return response.data;
  },

  /**
   * Get pending approvals
   */
  async getPendingApprovals() {
    const response = await apiClient.get<Leave[]>('/leaves/pending-approvals');
    return response.data;
  },

  /**
   * Apply for leave
   */
  async applyLeave(data: ApplyLeaveDto) {
    const response = await apiClient.post<Leave>('/leaves', data);
    return response.data;
  },

  /**
   * Update leave application
   */
  async updateLeave(leaveId: string, data: Partial<ApplyLeaveDto>) {
    const response = await apiClient.patch<Leave>(`/leaves/${leaveId}`, data);
    return response.data;
  },

  /**
   * Cancel leave application
   */
  async cancelLeave(leaveId: string) {
    const response = await apiClient.patch<Leave>(`/leaves/${leaveId}/cancel`);
    return response.data;
  },

  /**
   * Approve or reject leave
   */
  async processLeave(leaveId: string, data: ApproveLeaveDto) {
    const response = await apiClient.patch<Leave>(`/leaves/${leaveId}/process`, data);
    return response.data;
  },

  /**
   * Get leave details
   */
  async getLeaveDetails(leaveId: string) {
    const response = await apiClient.get<Leave>(`/leaves/${leaveId}`);
    return response.data;
  },

  /**
   * Get leave statistics
   */
  async getLeaveStatistics(params?: {
    userId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const response = await apiClient.get('/leaves/statistics', { params });
    return response.data;
  },

  /**
   * Export leaves
   */
  async exportLeaves(format: 'csv' | 'pdf' | 'excel', params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const response = await apiClient.get('/leaves/export', {
      params: { ...params, format },
      responseType: 'blob',
    });
    return response.data;
  },
};
