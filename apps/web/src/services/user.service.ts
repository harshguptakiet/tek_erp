/**
 * User Management Service
 * Implements Module 02 requirements (60 features)
 */

import { apiClient } from '../lib/axios';
import type {
  UserProfile,
  UpdateProfileRequest,
  PrivacySettings,
  StudentProfile,
  StudentHealthRecord,
  TeacherProfile,
  ParentProfile,
  PublisherProfile,
  CreatorProfile,
  BulkImportRequest,
  BulkImportResult,
} from '../types/user.types';
import type { PaginatedResponse, PaginationParams } from '../types';

const USER_ENDPOINTS = {
  // Profile Management (FR-USER-001 to FR-USER-010)
  profile: '/users/profile',
  updateProfile: '/users/profile',
  uploadProfilePicture: '/users/profile/picture',
  changeEmail: '/users/change-email',
  verifyNewEmail: '/users/verify-new-email',
  changePhone: '/users/change-phone',
  verifyNewPhone: '/users/verify-new-phone',
  deactivateAccount: '/users/deactivate',
  deleteAccount: '/users/delete',
  activityLog: '/users/activity-log',
  privacySettings: '/users/privacy-settings',
  dataExport: '/users/data-export',
  downloadData: '/users/data-export/download',
  
  // Student Management (FR-USER-011 to FR-USER-018)
  students: '/users/students',
  student: (id: string) => `/users/students/${id}`,
  studentHealthRecords: (id: string) => `/users/students/${id}/health`,
  studentAcademicHistory: (id: string) => `/users/students/${id}/academic-history`,
  studentAttendanceSummary: (id: string) => `/users/students/${id}/attendance`,
  studentPerformance: (id: string) => `/users/students/${id}/performance`,
  studentAchievements: (id: string) => `/users/students/${id}/achievements`,
  studentBehavior: (id: string) => `/users/students/${id}/behavior`,
  
  // Teacher Management (FR-USER-019 to FR-USER-026)
  teachers: '/users/teachers',
  teacher: (id: string) => `/users/teachers/${id}`,
  teacherQualifications: (id: string) => `/users/teachers/${id}/qualifications`,
  teacherSubjects: (id: string) => `/users/teachers/${id}/subjects`,
  teacherAttendance: (id: string) => `/users/teachers/${id}/attendance`,
  teacherPerformance: (id: string) => `/users/teachers/${id}/performance`,
  teacherPayroll: (id: string) => `/users/teachers/${id}/payroll`,
  teacherPD: (id: string) => `/users/teachers/${id}/professional-development`,
  
  // Parent Management (FR-USER-027 to FR-USER-032)
  parents: '/users/parents',
  parent: (id: string) => `/users/parents/${id}`,
  linkStudent: '/users/parents/link-student',
  unlinkStudent: '/users/parents/unlink-student',
  parentMeetings: (id: string) => `/users/parents/${id}/meetings`,
  parentFeedback: '/users/parents/feedback',
  
  // Publisher/Creator (FR-USER-033 to FR-USER-038)
  publishers: '/users/publishers',
  publisher: (id: string) => `/users/publishers/${id}`,
  creators: '/users/creators',
  creator: (id: string) => `/users/creators/${id}`,
  verifyPublisher: (id: string) => `/users/publishers/${id}/verify`,
  verifyCreator: (id: string) => `/users/creators/${id}/verify`,
  
  // Search & Discovery (FR-USER-039 to FR-USER-042)
  search: '/users/search',
  directory: '/users/directory',
  findClassmates: '/users/classmates',
  findColleagues: '/users/colleagues',
  publicProfile: (id: string) => `/users/${id}/public`,
  
  // Bulk Operations (FR-USER-043 to FR-USER-046)
  bulkImport: '/users/bulk-import',
  bulkExport: '/users/bulk-export',
  bulkUpdate: '/users/bulk-update',
  bulkDelete: '/users/bulk-delete',
  
  // Status Management (FR-USER-047 to FR-USER-050)
  activate: (id: string) => `/users/${id}/activate`,
  suspend: (id: string) => `/users/${id}/suspend`,
  statusHistory: (id: string) => `/users/${id}/status-history`,
  bulkStatusChange: '/users/bulk-status-change',
  
  // Roles & Permissions (FR-USER-051 to FR-USER-055)
  assignRole: (id: string) => `/users/${id}/roles`,
  getUserPermissions: (id: string) => `/users/${id}/permissions`,
  grantPermission: (id: string) => `/users/${id}/permissions/grant`,
  revokePermission: (id: string) => `/users/${id}/permissions/revoke`,
  
  // Analytics (FR-USER-056 to FR-USER-060)
  userAnalytics: '/users/analytics',
  generateReport: '/users/reports/generate',
  userActivity: (id: string) => `/users/${id}/activity`,
  segmentation: '/users/segments',
  feedback: '/users/feedback',
};

export const userService = {
  // ========== PROFILE MANAGEMENT ==========
  
  /**
   * FR-USER-001: Get user profile
   */
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>(USER_ENDPOINTS.profile);
    return response.data;
  },

  /**
   * FR-USER-002: Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    const response = await apiClient.patch<UserProfile>(
      USER_ENDPOINTS.updateProfile,
      data
    );
    return response.data;
  },

  /**
   * FR-USER-003: Upload profile picture
   */
  async uploadProfilePicture(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(
      USER_ENDPOINTS.uploadProfilePicture,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  /**
   * FR-USER-004: Change email
   */
  async changeEmail(newEmail: string, password: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(USER_ENDPOINTS.changeEmail, {
      newEmail,
      password,
    });
    return response.data;
  },

  /**
   * Verify new email with token
   */
  async verifyNewEmail(token: string): Promise<{ success: boolean }> {
    const response = await apiClient.post(USER_ENDPOINTS.verifyNewEmail, { token });
    return response.data;
  },

  /**
   * FR-USER-005: Change phone number
   */
  async changePhone(newPhone: string, password: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(USER_ENDPOINTS.changePhone, {
      newPhone,
      password,
    });
    return response.data;
  },

  /**
   * Verify new phone with OTP
   */
  async verifyNewPhone(otp: string): Promise<{ success: boolean }> {
    const response = await apiClient.post(USER_ENDPOINTS.verifyNewPhone, { otp });
    return response.data;
  },

  /**
   * FR-USER-006: Deactivate account
   */
  async deactivateAccount(password: string, reason: string): Promise<{ success: boolean }> {
    const response = await apiClient.post(USER_ENDPOINTS.deactivateAccount, {
      password,
      reason,
    });
    return response.data;
  },

  /**
   * FR-USER-007: Delete account permanently
   */
  async deleteAccount(password: string, confirmText: string): Promise<{ success: boolean }> {
    const response = await apiClient.post(USER_ENDPOINTS.deleteAccount, {
      password,
      confirmText,
    });
    return response.data;
  },

  /**
   * FR-USER-008: Get activity log
   */
  async getActivityLog(params?: PaginationParams): Promise<PaginatedResponse<any>> {
    const response = await apiClient.get(USER_ENDPOINTS.activityLog, { params });
    return response.data;
  },

  /**
   * FR-USER-009: Get/Update privacy settings
   */
  async getPrivacySettings(): Promise<PrivacySettings> {
    const response = await apiClient.get<PrivacySettings>(USER_ENDPOINTS.privacySettings);
    return response.data;
  },

  async updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<PrivacySettings> {
    const response = await apiClient.patch<PrivacySettings>(
      USER_ENDPOINTS.privacySettings,
      settings
    );
    return response.data;
  },

  /**
   * FR-USER-010: Request data export (GDPR)
   */
  async requestDataExport(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(USER_ENDPOINTS.dataExport);
    return response.data;
  },

  async downloadData(exportId: string): Promise<Blob> {
    const response = await apiClient.get(`${USER_ENDPOINTS.downloadData}/${exportId}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // ========== STUDENT MANAGEMENT ==========
  
  /**
   * FR-USER-011: Create student profile
   */
  async createStudent(data: Partial<StudentProfile>): Promise<StudentProfile> {
    const response = await apiClient.post<StudentProfile>(USER_ENDPOINTS.students, data);
    return response.data;
  },

  /**
   * FR-USER-012: Update student profile
   */
  async updateStudent(id: string, data: Partial<StudentProfile>): Promise<StudentProfile> {
    const response = await apiClient.patch<StudentProfile>(
      USER_ENDPOINTS.student(id),
      data
    );
    return response.data;
  },

  /**
   * Get student by ID
   */
  async getStudent(id: string): Promise<StudentProfile> {
    const response = await apiClient.get<StudentProfile>(USER_ENDPOINTS.student(id));
    return response.data;
  },

  /**
   * FR-USER-013: Get student academic history
   */
  async getStudentAcademicHistory(id: string): Promise<any> {
    const response = await apiClient.get(USER_ENDPOINTS.studentAcademicHistory(id));
    return response.data;
  },

  /**
   * FR-USER-014: Get/Update student health records
   */
  async getStudentHealthRecords(id: string): Promise<StudentHealthRecord> {
    const response = await apiClient.get<StudentHealthRecord>(
      USER_ENDPOINTS.studentHealthRecords(id)
    );
    return response.data;
  },

  async updateStudentHealthRecords(
    id: string,
    data: Partial<StudentHealthRecord>
  ): Promise<StudentHealthRecord> {
    const response = await apiClient.patch<StudentHealthRecord>(
      USER_ENDPOINTS.studentHealthRecords(id),
      data
    );
    return response.data;
  },

  /**
   * FR-USER-015: Get student attendance summary
   */
  async getStudentAttendanceSummary(id: string): Promise<any> {
    const response = await apiClient.get(USER_ENDPOINTS.studentAttendanceSummary(id));
    return response.data;
  },

  /**
   * FR-USER-016: Get student performance summary
   */
  async getStudentPerformance(id: string): Promise<any> {
    const response = await apiClient.get(USER_ENDPOINTS.studentPerformance(id));
    return response.data;
  },

  /**
   * FR-USER-017: Get student achievements
   */
  async getStudentAchievements(id: string): Promise<any> {
    const response = await apiClient.get(USER_ENDPOINTS.studentAchievements(id));
    return response.data;
  },

  /**
   * FR-USER-018: Get student behavior records
   */
  async getStudentBehavior(id: string): Promise<any> {
    const response = await apiClient.get(USER_ENDPOINTS.studentBehavior(id));
    return response.data;
  },

  // ========== TEACHER MANAGEMENT ==========
  
  /**
   * FR-USER-019: Create teacher profile
   */
  async createTeacher(data: Partial<TeacherProfile>): Promise<TeacherProfile> {
    const response = await apiClient.post<TeacherProfile>(USER_ENDPOINTS.teachers, data);
    return response.data;
  },

  /**
   * FR-USER-020: Update teacher profile
   */
  async updateTeacher(id: string, data: Partial<TeacherProfile>): Promise<TeacherProfile> {
    const response = await apiClient.patch<TeacherProfile>(
      USER_ENDPOINTS.teacher(id),
      data
    );
    return response.data;
  },

  /**
   * Get teacher by ID
   */
  async getTeacher(id: string): Promise<TeacherProfile> {
    const response = await apiClient.get<TeacherProfile>(USER_ENDPOINTS.teacher(id));
    return response.data;
  },

  // ========== SEARCH & DISCOVERY ==========
  
  /**
   * Get user by ID (public profile)
   */
  async getUserById(id: string): Promise<Partial<UserProfile>> {
    return this.getPublicProfile(id);
  },

  /**
   * FR-USER-039: Search users
   */
  async searchUsers(query: string, filters?: any): Promise<PaginatedResponse<UserProfile>> {
    const response = await apiClient.get<PaginatedResponse<UserProfile>>(
      USER_ENDPOINTS.search,
      { params: { query, ...filters } }
    );
    return response.data;
  },

  /**
   * FR-USER-040: Get user directory
   */
  async getUserDirectory(filters?: any): Promise<PaginatedResponse<UserProfile>> {
    const response = await apiClient.get<PaginatedResponse<UserProfile>>(
      USER_ENDPOINTS.directory,
      { params: filters }
    );
    return response.data;
  },

  /**
   * FR-USER-042: Get public profile
   */
  async getPublicProfile(id: string): Promise<Partial<UserProfile>> {
    const response = await apiClient.get(USER_ENDPOINTS.publicProfile(id));
    return response.data;
  },

  // ========== BULK OPERATIONS ==========
  
  /**
   * FR-USER-043: Bulk import users
   */
  async bulkImport(data: BulkImportRequest): Promise<BulkImportResult> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('roleType', data.roleType);
    if (data.organizationId) {
      formData.append('organizationId', data.organizationId);
    }
    
    const response = await apiClient.post<BulkImportResult>(
      USER_ENDPOINTS.bulkImport,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  /**
   * FR-USER-044: Bulk export users
   */
  async bulkExport(filters?: any): Promise<Blob> {
    const response = await apiClient.post(
      USER_ENDPOINTS.bulkExport,
      filters,
      { responseType: 'blob' }
    );
    return response.data;
  },
};
