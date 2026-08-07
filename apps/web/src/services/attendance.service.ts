import { apiClient } from '../lib/axios';

// Attendance Service - Complete integration with backend API
export const attendanceService = {
  // ==================== STUDENT ATTENDANCE ====================
  markAttendance: async (data: {
    studentId: string;
    schoolId: string;
    sectionId?: string;
    date: string;
    period?: number;
    status: string;
    checkInTime?: string;
    checkOutTime?: string;
    remarks?: string;
  }) => {
    const response = await apiClient.post('/attendance/mark', data);
    return response.data;
  },

  bulkMarkAttendance: async (data: {
    schoolId: string;
    sectionId: string;
    date: string;
    period?: number;
    records: Array<{
      studentId: string;
      status: string;
      remarks?: string;
    }>;
  }) => {
    const response = await apiClient.post('/attendance/bulk', data);
    return response.data;
  },

  getSectionAttendance: async (sectionId: string, date: string, period?: number) => {
    const response = await apiClient.get(`/attendance/section/${sectionId}`, {
      params: { date, period },
    });
    return response.data;
  },

  getStudentAttendanceSummary: async (studentId: string, filters?: {
    startDate?: string;
    endDate?: string;
    schoolId?: string;
  }) => {
    const response = await apiClient.get(`/attendance/student/${studentId}/summary`, {
      params: filters,
    });
    return response.data;
  },

  correctAttendance: async (attendanceId: string, data: {
    status: string;
    reason: string;
  }) => {
    const response = await apiClient.put(`/attendance/${attendanceId}/correct`, data);
    return response.data;
  },

  // ==================== TEACHER ATTENDANCE ====================
  markTeacherAttendance: async (data: {
    teacherId: string;
    schoolId: string;
    date: string;
    status: string;
    checkInTime?: string;
    checkOutTime?: string;
    remarks?: string;
  }) => {
    const response = await apiClient.post('/attendance/teacher/mark', data);
    return response.data;
  },

  getTeacherAttendance: async (teacherId: string, startDate: string, endDate: string) => {
    const response = await apiClient.get(`/attendance/teacher/${teacherId}`, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // ==================== REPORTS ====================
  getSchoolAttendanceReport: async (schoolId: string, date: string) => {
    const response = await apiClient.get(`/attendance/school/${schoolId}/report`, {
      params: { date },
    });
    return response.data;
  },

  getAttendanceAnalytics: async (sectionId: string, month: string) => {
    const response = await apiClient.get(`/attendance/section/${sectionId}/analytics`, {
      params: { month },
    });
    return response.data;
  },

  getAbsentStudents: async (schoolId: string, date: string, threshold?: number) => {
    const response = await apiClient.get(`/attendance/school/${schoolId}/absent-alerts`, {
      params: { date, threshold },
    });
    return response.data;
  },

  // ==================== BIOMETRIC DEVICES ====================
  registerBiometricDevice: async (data: {
    schoolId: string;
    deviceName: string;
    deviceType: string;
    deviceId: string;
    location: string;
    ipAddress?: string;
    macAddress?: string;
    isActive?: boolean;
  }) => {
    const response = await apiClient.post('/attendance/devices', data);
    return response.data;
  },

  listBiometricDevices: async (schoolId: string, isActive?: boolean) => {
    const response = await apiClient.get(`/attendance/devices/school/${schoolId}`, {
      params: isActive !== undefined ? { isActive } : {},
    });
    return response.data;
  },

  processBiometricPunch: async (data: {
    deviceId: string;
    userId: string;
    userType: string;
    biometricType: string;
    timestamp: string;
  }) => {
    const response = await apiClient.post('/attendance/biometric/punch', data);
    return response.data;
  },

  getBiometricLogs: async (filters?: {
    deviceId?: string;
    schoolId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    userType?: string;
    processed?: boolean;
  }) => {
    const response = await apiClient.get('/attendance/biometric/logs', {
      params: filters,
    });
    return response.data;
  },

  syncBiometricData: async (deviceId: string, punches: Array<{
    userId: string;
    userType: string;
    biometricType: string;
    timestamp: string;
  }>) => {
    const response = await apiClient.post('/attendance/biometric/sync', {
      deviceId,
      punches,
    });
    return response.data;
  },

  updateDeviceStatus: async (deviceId: string, isActive: boolean) => {
    const response = await apiClient.put(`/attendance/devices/${deviceId}/status`, {
      isActive,
    });
    return response.data;
  },

  getDeviceDetails: async (deviceId: string) => {
    const response = await apiClient.get(`/attendance/devices/${deviceId}`);
    return response.data;
  },

  // ==================== RFID ATTENDANCE ====================
  registerRfidCard: async (userId: string, rfidCardId: string) => {
    const response = await apiClient.post('/attendance/rfid/register', {
      userId,
      rfidCardId,
    });
    return response.data;
  },

  processRfidSwipe: async (rfidCardId: string, locationId?: string) => {
    const response = await apiClient.post('/attendance/rfid/swipe', {
      rfidCardId,
      locationId,
    });
    return response.data;
  },

  // ==================== GEO-FENCED ATTENDANCE ====================
  configureGeofence: async (schoolId: string, data: {
    centerLat: number;
    centerLng: number;
    radiusMeters: number;
  }) => {
    const response = await apiClient.post('/attendance/geofence/configure', {
      schoolId,
      ...data,
    });
    return response.data;
  },

  markGeoAttendance: async (data: {
    userId: string;
    lat: number;
    lng: number;
    schoolId: string;
  }) => {
    const response = await apiClient.post('/attendance/geofence/mark', data);
    return response.data;
  },

  // ==================== QR CODE ATTENDANCE ====================
  generateAttendanceQR: async (schoolId: string, sectionId?: string) => {
    const response = await apiClient.post('/attendance/qr/generate', {
      schoolId,
      sectionId,
    });
    return response.data;
  },

  markQRAttendance: async (userId: string, qrToken: string) => {
    const response = await apiClient.post('/attendance/qr/mark', {
      userId,
      qrToken,
    });
    return response.data;
  },

  // ==================== FACE RECOGNITION ====================
  enrollFace: async (userId: string, faceEncoding: string) => {
    const response = await apiClient.post('/attendance/face/enroll', {
      userId,
      faceEncoding,
    });
    return response.data;
  },

  markFaceAttendance: async (faceEncoding: string, deviceId: string) => {
    const response = await apiClient.post('/attendance/face/mark', {
      faceEncoding,
      deviceId,
    });
    return response.data;
  },
};
