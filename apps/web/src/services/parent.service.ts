/**
 * Parent Portal Service
 * Handles all parent-specific API calls
 */

import { apiClient } from '../lib/axios';

export interface ParentChild {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  rollNumber: string;
  classId: string;
  className: string;
  section: string;
  profilePicture?: string;
  dateOfBirth: Date;
}

export interface ChildAttendanceSummary {
  studentId: string;
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  attendancePercentage: number;
  recentAttendance: {
    date: Date;
    status: string;
    remarks?: string;
  }[];
}

export interface ChildGradeSummary {
  studentId: string;
  subjects: {
    subjectId: string;
    subjectName: string;
    currentGrade: string;
    percentage: number;
    rank?: number;
  }[];
  overallGrade: string;
  overallPercentage: number;
  classRank?: number;
}

export interface ChildFeesSummary {
  studentId: string;
  totalFees: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  nextDueDate?: Date;
  recentPayments: {
    id: string;
    amount: number;
    date: Date;
    receiptNumber: string;
  }[];
}

export interface ParentTeacherMessage {
  id: string;
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export const parentService = {
  /**
   * Get all children for the parent
   */
  async getMyChildren() {
    const response = await apiClient.get<ParentChild[]>('/parents/my-children');
    return response.data;
  },

  /**
   * Get child's attendance summary
   */
  async getChildAttendance(studentId: string, params?: {
    startDate?: string;
    endDate?: string;
  }) {
    const response = await apiClient.get<ChildAttendanceSummary>(
      `/parents/child/${studentId}/attendance`,
      { params }
    );
    return response.data;
  },

  /**
   * Get child's grade summary
   */
  async getChildGrades(studentId: string, params?: {
    termId?: string;
    academicYearId?: string;
  }) {
    const response = await apiClient.get<ChildGradeSummary>(
      `/parents/child/${studentId}/grades`,
      { params }
    );
    return response.data;
  },

  /**
   * Get child's fees summary
   */
  async getChildFees(studentId: string) {
    const response = await apiClient.get<ChildFeesSummary>(
      `/parents/child/${studentId}/fees`
    );
    return response.data;
  },

  /**
   * Get child's timetable
   */
  async getChildTimetable(studentId: string) {
    const response = await apiClient.get(`/parents/child/${studentId}/timetable`);
    return response.data;
  },

  /**
   * Get child's assignments
   */
  async getChildAssignments(studentId: string, params?: {
    status?: string;
    subjectId?: string;
  }) {
    const response = await apiClient.get(`/parents/child/${studentId}/assignments`, { params });
    return response.data;
  },

  /**
   * Get messages between parent and teachers
   */
  async getMessages(params?: {
    childId?: string;
    isRead?: boolean;
  }) {
    const response = await apiClient.get<ParentTeacherMessage[]>('/parents/messages', { params });
    return response.data;
  },

  /**
   * Send message to teacher
   */
  async sendMessage(data: {
    toUserId: string;
    subject: string;
    message: string;
    childId?: string;
  }) {
    const response = await apiClient.post<ParentTeacherMessage>('/parents/messages', data);
    return response.data;
  },

  /**
   * Mark message as read
   */
  async markMessageAsRead(messageId: string) {
    const response = await apiClient.patch(`/parents/messages/${messageId}/read`);
    return response.data;
  },

  /**
   * Get child's complete profile
   */
  async getChildProfile(studentId: string) {
    const response = await apiClient.get(`/parents/child/${studentId}/profile`);
    return response.data;
  },

  /**
   * Get child's teacher list
   */
  async getChildTeachers(studentId: string) {
    const response = await apiClient.get(`/parents/child/${studentId}/teachers`);
    return response.data;
  },

  /**
   * Get notifications for parent
   */
  async getNotifications() {
    const response = await apiClient.get('/parents/notifications');
    return response.data;
  },
};
