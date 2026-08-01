import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventBusService } from '../../events/event-bus.service';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService, private eventBus: EventBusService) {}

  // FR-ATT-001: Mark Attendance (single student)
  async markAttendance(markedBy: string, dto: {
    studentId: string; schoolId: string; sectionId?: string;
    date: string; period?: number; status: string;
    checkInTime?: string; checkOutTime?: string; remarks?: string;
  }) {
    const student = await this.prisma.studentProfile.findUnique({ where: { id: dto.studentId } });
    if (!student) throw new NotFoundException('Student not found');

    const attendance = await this.prisma.attendance.upsert({
      where: {
        studentId_date_period: {
          studentId: dto.studentId,
          date: new Date(dto.date),
          period: dto.period ?? 0,
        },
      },
      create: {
        studentId: dto.studentId,
        schoolId: dto.schoolId,
        sectionId: dto.sectionId,
        date: new Date(dto.date),
        period: dto.period ?? 0,
        status: dto.status as any,
        checkInTime: dto.checkInTime ? new Date(dto.checkInTime) : null,
        checkOutTime: dto.checkOutTime ? new Date(dto.checkOutTime) : null,
        remarks: dto.remarks,
        markedBy,
        markedAt: new Date(),
      },
      update: {
        status: dto.status as any,
        checkInTime: dto.checkInTime ? new Date(dto.checkInTime) : undefined,
        checkOutTime: dto.checkOutTime ? new Date(dto.checkOutTime) : undefined,
        remarks: dto.remarks,
        markedBy,
        markedAt: new Date(),
      },
    });

    this.eventBus.publish('attendance.marked', {
      attendanceId: attendance.id,
      studentId: dto.studentId,
      date: dto.date,
      status: dto.status,
      markedBy,
    });

    return attendance;
  }

  // FR-ATT-002: Bulk Mark Attendance (entire section on a date)
  async bulkMarkAttendance(markedBy: string, dto: {
    schoolId: string; sectionId: string; date: string; period?: number;
    records: Array<{ studentId: string; status: string; remarks?: string }>;
  }) {
    const results = { marked: 0, errors: [] as string[] };

    for (const record of dto.records) {
      try {
        await this.markAttendance(markedBy, {
          studentId: record.studentId,
          schoolId: dto.schoolId,
          sectionId: dto.sectionId,
          date: dto.date,
          period: dto.period,
          status: record.status,
          remarks: record.remarks,
        });
        results.marked++;
      } catch {
        results.errors.push(record.studentId);
      }
    }

    return { success: true, date: dto.date, sectionId: dto.sectionId, results };
  }

  // FR-ATT-003: Get Section Attendance for a date
  async getSectionAttendance(sectionId: string, date: string, period?: number) {
    // Get enrolled students
    const enrollments = await this.prisma.studentEnrollment.findMany({
      where: { sectionId, status: 'ACTIVE' },
      include: {
        student: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });

    // Get attendance records
    const attendanceRecords = await this.prisma.attendance.findMany({
      where: {
        sectionId,
        date: new Date(date),
        ...(period !== undefined ? { period } : {}),
      },
    });

    const attendanceMap = new Map(attendanceRecords.map((a) => [a.studentId, a]));

    const summary = enrollments.map((e) => {
      const att = attendanceMap.get(e.studentId);
      return {
        studentId: e.studentId,
        rollNumber: e.rollNumber,
        name: `${e.student.user.firstName} ${e.student.user.lastName}`,
        status: att?.status || 'NOT_MARKED',
        remarks: att?.remarks,
        markedAt: att?.markedAt,
      };
    });

    const present = summary.filter((s) => s.status === 'PRESENT').length;
    const absent = summary.filter((s) => s.status === 'ABSENT').length;
    const late = summary.filter((s) => s.status === 'LATE').length;

    return {
      sectionId, date, period,
      totalStudents: enrollments.length,
      present, absent, late,
      notMarked: enrollments.length - present - absent - late,
      attendancePercentage: enrollments.length > 0
        ? ((present / enrollments.length) * 100).toFixed(1) : '0',
      records: summary,
    };
  }

  // FR-ATT-004: Get Student Attendance Summary
  async getStudentAttendanceSummary(studentId: string, filters: {
    startDate?: string; endDate?: string; schoolId?: string;
  }) {
    const where: any = {
      studentId,
      ...(filters.schoolId ? { schoolId: filters.schoolId } : {}),
      ...(filters.startDate || filters.endDate ? {
        date: {
          ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
          ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
        },
      } : {}),
    };

    const records = await this.prisma.attendance.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    const total = records.length;
    const present = records.filter((r) => r.status === 'PRESENT').length;
    const absent = records.filter((r) => r.status === 'ABSENT').length;
    const late = records.filter((r) => r.status === 'LATE').length;
    const excused = records.filter((r) => (r.status as string) === 'EXCUSED').length;

    return {
      studentId,
      period: { startDate: filters.startDate, endDate: filters.endDate },
      totalDays: total,
      present, absent, late, excused,
      attendancePercentage: total > 0 ? ((present / total) * 100).toFixed(1) : '0',
      recentRecords: records.slice(0, 30),
    };
  }

  // FR-ATT-005: Correct/Update Attendance
  async correctAttendance(correctedBy: string, attendanceId: string, dto: {
    status: string; reason: string;
  }) {
    const record = await this.prisma.attendance.findUnique({ where: { id: attendanceId } });
    if (!record) throw new NotFoundException('Attendance record not found');

    return this.prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        status: dto.status as any,
        correctionRequested: true,
        correctionReason: dto.reason,
        correctedBy,
        correctedAt: new Date(),
      },
    });
  }

  // FR-ATT-006: Teacher Attendance
  async markTeacherAttendance(markedBy: string, dto: {
    teacherId: string; schoolId: string; date: string;
    status: string; checkInTime?: string; checkOutTime?: string; remarks?: string;
  }) {
    const teacher = await this.prisma.teacherProfile.findUnique({ where: { id: dto.teacherId } });
    if (!teacher) throw new NotFoundException('Teacher not found');

    return this.prisma.teacherAttendance.upsert({
      where: { teacherId_date: { teacherId: dto.teacherId, date: new Date(dto.date) } },
      create: {
        teacherId: dto.teacherId,
        schoolId: dto.schoolId,
        date: new Date(dto.date),
        status: dto.status as any,
        checkInTime: dto.checkInTime ? new Date(dto.checkInTime) : null,
        checkOutTime: dto.checkOutTime ? new Date(dto.checkOutTime) : null,
        remarks: dto.remarks,
        markedBy,
        markedAt: new Date(),
      },
      update: {
        status: dto.status as any,
        checkInTime: dto.checkInTime ? new Date(dto.checkInTime) : undefined,
        checkOutTime: dto.checkOutTime ? new Date(dto.checkOutTime) : undefined,
        remarks: dto.remarks,
        markedBy,
        markedAt: new Date(),
      },
    });
  }

  // FR-ATT-007: Get Teacher Attendance
  async getTeacherAttendance(teacherId: string, startDate: string, endDate: string) {
    const records = await this.prisma.teacherAttendance.findMany({
      where: {
        teacherId,
        date: { gte: new Date(startDate), lte: new Date(endDate) },
      },
      orderBy: { date: 'desc' },
    });

    const total = records.length;
    const present = records.filter((r) => r.status === 'PRESENT').length;
    const absent = records.filter((r) => r.status === 'ABSENT').length;

    return {
      teacherId,
      period: { startDate, endDate },
      totalDays: total,
      present, absent,
      attendancePercentage: total > 0 ? ((present / total) * 100).toFixed(1) : '0',
      records,
    };
  }

  // FR-ATT-008: School-wide Attendance Report
  async getSchoolAttendanceReport(schoolId: string, date: string) {
    const [studentRecords, teacherRecords] = await Promise.all([
      this.prisma.attendance.groupBy({
        by: ['status'],
        where: { schoolId, date: new Date(date) },
        _count: { id: true },
      }),
      this.prisma.teacherAttendance.groupBy({
        by: ['status'],
        where: { schoolId, date: new Date(date) },
        _count: { id: true },
      }),
    ]);

    const toMap = (rows: any[]) =>
      rows.reduce((acc, r) => ({ ...acc, [r.status]: r._count.id }), {});

    return {
      schoolId, date,
      students: toMap(studentRecords),
      teachers: toMap(teacherRecords),
    };
  }

  // FR-ATT-009: Attendance Analytics (monthly/term)
  async getAttendanceAnalytics(sectionId: string, month: string) {
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);

    const records = await this.prisma.attendance.findMany({
      where: { sectionId, date: { gte: startDate, lte: endDate } },
      select: { studentId: true, date: true, status: true },
    });

    // Group by student
    const byStudent = records.reduce((acc, r) => {
      if (!acc[r.studentId]) acc[r.studentId] = { present: 0, absent: 0, late: 0, total: 0 };
      acc[r.studentId][r.status.toLowerCase()] = (acc[r.studentId][r.status.toLowerCase()] || 0) + 1;
      acc[r.studentId].total++;
      return acc;
    }, {} as Record<string, any>);

    const stats = Object.entries(byStudent).map(([studentId, data]: any) => ({
      studentId,
      present: data.present || 0,
      absent: data.absent || 0,
      late: data.late || 0,
      total: data.total,
      percentage: data.total > 0 ? ((data.present / data.total) * 100).toFixed(1) : '0',
    }));

    // Students below 75%
    const lowAttendance = stats.filter((s) => parseFloat(s.percentage) < 75);

    return {
      sectionId, month,
      period: { startDate, endDate },
      totalRecords: records.length,
      studentStats: stats,
      lowAttendanceAlerts: lowAttendance,
    };
  }

  // FR-ATT-010: Get Absent Students Alert
  async getAbsentStudents(schoolId: string, date: string, threshold?: number) {
    const minDays = threshold || 3;

    // Find students absent consecutively
    const recentAbsences = await this.prisma.attendance.findMany({
      where: {
        schoolId,
        status: 'ABSENT',
        date: { gte: new Date(new Date(date).getTime() - minDays * 24 * 60 * 60 * 1000) },
      },
      select: { studentId: true, date: true },
      orderBy: { date: 'desc' },
    });

    const countByStudent = recentAbsences.reduce((acc, r) => {
      acc[r.studentId] = (acc[r.studentId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const alerts = Object.entries(countByStudent)
      .filter(([, count]) => count >= minDays)
      .map(([studentId, consecutiveDays]) => ({ studentId, consecutiveDays }));

    return { schoolId, date, threshold: minDays, alerts };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR-ATT-011 to 015: Biometric & Device Integration
  // ─────────────────────────────────────────────────────────────────────────

  // FR-ATT-011: Register Biometric Device
  async registerBiometricDevice(registeredBy: string, dto: {
    schoolId: string; deviceName: string; deviceType: string;
    deviceId: string; location: string; ipAddress?: string;
    macAddress?: string; isActive?: boolean;
  }) {
    const existing = await this.prisma.attendanceDevice.findUnique({
      where: { deviceId: dto.deviceId },
    });
    if (existing) throw new ConflictException('Device with this ID already registered');

    const device = await this.prisma.attendanceDevice.create({
      data: {
        schoolId: dto.schoolId,
        deviceName: dto.deviceName,
        deviceType: dto.deviceType,
        deviceId: dto.deviceId,
        location: dto.location,
        ipAddress: dto.ipAddress,
        macAddress: dto.macAddress,
        isActive: dto.isActive ?? true,
      },
    });

    this.eventBus.publish('attendance.device_registered', {
      deviceId: device.id,
      schoolId: dto.schoolId,
      registeredBy,
    });

    return device;
  }

  // FR-ATT-012: List Biometric Devices
  async listBiometricDevices(schoolId: string, isActive?: boolean) {
    return this.prisma.attendanceDevice.findMany({
      where: {
        schoolId,
        ...(isActive !== undefined ? { isActive } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // FR-ATT-013: Process Biometric Attendance Punch
  async processBiometricPunch(dto: {
    deviceId: string; userId: string; userType: string;
    biometricType: string; timestamp: string;
  }) {
    // Find device by deviceId (unique string identifier)
    const device = await this.prisma.attendanceDevice.findUnique({
      where: { deviceId: dto.deviceId },
    });
    if (!device) throw new NotFoundException('Device not found');
    if (!device.isActive) throw new BadRequestException('Device is not active');

    const timestamp = new Date(dto.timestamp);
    const date = new Date(timestamp.toDateString());

    // Log the biometric punch
    const log = await this.prisma.biometricAttendanceLog.create({
      data: {
        deviceId: device.id, // UUID reference
        userId: dto.userId,
        userType: dto.userType,
        biometricType: dto.biometricType,
        timestamp,
        isVerified: true,
        processed: false,
      },
    });

    // Auto-mark attendance based on punch
    if (dto.userType === 'STUDENT') {
      const student = await this.prisma.studentProfile.findUnique({
        where: { userId: dto.userId },
      });

      if (student) {
        // Find current section enrollment
        const enrollment = await this.prisma.studentEnrollment.findFirst({
          where: { studentId: student.id, status: 'ACTIVE' },
        });

        if (enrollment) {
          const hour = timestamp.getHours();
          const status = hour < 9 ? 'PRESENT' : hour < 11 ? 'LATE' : 'PRESENT';
          
          await this.prisma.attendance.upsert({
            where: {
              studentId_date_period: {
                studentId: student.id,
                date,
                period: 0,
              },
            },
            create: {
              studentId: student.id,
              schoolId: device.schoolId,
              sectionId: enrollment.sectionId,
              date,
              period: 0,
              status: status as any,
              method: 'BIOMETRIC_FINGERPRINT',
              checkInTime: timestamp,
              deviceId: device.id,
              biometricLogId: log.id,
              markedBy: 'BIOMETRIC_SYSTEM',
              markedAt: new Date(),
            },
            update: {
              status: status as any,
              method: 'BIOMETRIC_FINGERPRINT',
              checkInTime: timestamp,
              deviceId: device.id,
              biometricLogId: log.id,
            },
          });

          // Mark as processed
          await this.prisma.biometricAttendanceLog.update({
            where: { id: log.id },
            data: { processed: true, processedAt: new Date() },
          });
        }
      }
    } else if (dto.userType === 'TEACHER') {
      const teacher = await this.prisma.teacherProfile.findUnique({
        where: { userId: dto.userId },
      });

      if (teacher) {
        const hour = timestamp.getHours();
        const status = hour < 9 ? 'PRESENT' : hour < 11 ? 'LATE' : 'PRESENT';

        await this.prisma.teacherAttendance.upsert({
          where: { teacherId_date: { teacherId: teacher.id, date } },
          create: {
            teacherId: teacher.id,
            schoolId: device.schoolId,
            date,
            status: status as any,
            method: 'BIOMETRIC_FINGERPRINT',
            checkInTime: timestamp,
            deviceId: device.id,
            biometricLogId: log.id,
            markedBy: 'BIOMETRIC_SYSTEM',
            markedAt: new Date(),
          },
          update: {
            status: status as any,
            method: 'BIOMETRIC_FINGERPRINT',
            checkInTime: timestamp,
            deviceId: device.id,
            biometricLogId: log.id,
          },
        });

        // Mark as processed
        await this.prisma.biometricAttendanceLog.update({
          where: { id: log.id },
          data: { processed: true, processedAt: new Date() },
        });
      }
    }

    this.eventBus.publish('attendance.biometric_punch', {
      logId: log.id,
      deviceId: dto.deviceId,
      userId: dto.userId,
      userType: dto.userType,
    });

    return { success: true, log, autoMarked: true };
  }

  // FR-ATT-014: Get Biometric Logs
  async getBiometricLogs(filters: {
    deviceId?: string; schoolId?: string; userId?: string;
    startDate?: string; endDate?: string; userType?: string;
    processed?: boolean;
  }) {
    const where: any = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.deviceId) {
      const device = await this.prisma.attendanceDevice.findUnique({
        where: { deviceId: filters.deviceId },
      });
      if (device) where.deviceId = device.id;
    }

    if (filters.schoolId) {
      const devices = await this.prisma.attendanceDevice.findMany({
        where: { schoolId: filters.schoolId },
        select: { id: true },
      });
      where.deviceId = { in: devices.map((d) => d.id) };
    }

    if (filters.userType) {
      where.userType = filters.userType;
    }

    if (filters.processed !== undefined) {
      where.processed = filters.processed;
    }

    if (filters.startDate || filters.endDate) {
      where.timestamp = {
        ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
        ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
      };
    }

    const logs = await this.prisma.biometricAttendanceLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 500,
      include: {
        device: {
          select: { deviceName: true, location: true, deviceId: true },
        },
      },
    });

    return logs;
  }

  // FR-ATT-015: Sync Biometric Data (Bulk Process)
  async syncBiometricData(deviceId: string, punches: Array<{
    userId: string; userType: string; biometricType: string; timestamp: string;
  }>) {
    const device = await this.prisma.attendanceDevice.findUnique({
      where: { deviceId },
    });
    if (!device) throw new NotFoundException('Device not found');

    const results = {
      synced: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const punch of punches) {
      try {
        await this.processBiometricPunch({
          deviceId,
          userId: punch.userId,
          userType: punch.userType,
          biometricType: punch.biometricType,
          timestamp: punch.timestamp,
        });
        results.synced++;
      } catch (error) {
        results.failed++;
        results.errors.push(
          `${punch.userId} at ${punch.timestamp}: ${error.message}`,
        );
      }
    }

    // Update device last sync time
    await this.prisma.attendanceDevice.update({
      where: { id: device.id },
      data: { lastSyncAt: new Date() },
    });

    this.eventBus.publish('attendance.biometric_synced', {
      deviceId,
      synced: results.synced,
      failed: results.failed,
    });

    return results;
  }

  // Update Device Status
  async updateDeviceStatus(deviceId: string, isActive: boolean) {
    const device = await this.prisma.attendanceDevice.findUnique({
      where: { deviceId },
    });
    if (!device) throw new NotFoundException('Device not found');

    return this.prisma.attendanceDevice.update({
      where: { id: device.id },
      data: { isActive },
    });
  }

  // Get Device Details
  async getDeviceDetails(deviceId: string) {
    const device = await this.prisma.attendanceDevice.findUnique({
      where: { deviceId },
      include: {
        biometricLogs: {
          take: 10,
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!device) throw new NotFoundException('Device not found');
    return device;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR-ATT-012–015: Advanced Attendance Methods (RFID, Geofence, QR, Face)
  // ─────────────────────────────────────────────────────────────────────────

  // FR-ATT-012: RFID Attendance
  async registerRfidCard(userId: string, rfidCardId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'RFID_CARD_REGISTER',
        resourceType: 'USER',
        recordId: userId,
        changes: { rfidCardId },
      },
    });

    return { success: true, userId, rfidCardId, message: 'RFID card registered' };
  }

  async processRfidSwipe(rfidCardId: string, locationId?: string) {
    const log = await this.prisma.auditLog.findFirst({
      where: { action: 'RFID_CARD_REGISTER', changes: { path: ['rfidCardId'], equals: rfidCardId } },
    });

    if (!log || !log.userId) throw new NotFoundException('RFID card not registered');

    return this.processBiometricPunch({
      deviceId: locationId || 'RFID_READER_01',
      userId: log.userId,
      userType: 'STUDENT',
      biometricType: 'RFID',
      timestamp: new Date().toISOString(),
    });
  }

  // FR-ATT-013: Geo-fenced Attendance
  async configureGeofence(schoolId: string, centerLat: number, centerLng: number, radiusMeters: number) {
    await this.prisma.auditLog.create({
      data: {
        action: 'GEOFENCE_CONFIGURE',
        resourceType: 'SCHOOL',
        recordId: schoolId,
        changes: { centerLat, centerLng, radiusMeters },
      },
    });
    return { success: true, schoolId, centerLat, centerLng, radiusMeters };
  }

  async markGeoAttendance(userId: string, lat: number, lng: number, schoolId: string) {
    const geofenceLog = await this.prisma.auditLog.findFirst({
      where: { action: 'GEOFENCE_CONFIGURE', recordId: schoolId },
      orderBy: { timestamp: 'desc' },
    });

    if (geofenceLog) {
      const config = geofenceLog.changes as any;
      const latDiff = (lat - config.centerLat) * 111000;
      const lngDiff = (lng - config.centerLng) * 111000 * Math.cos(config.centerLat * Math.PI / 180);
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

      if (distance > config.radiusMeters) {
        throw new BadRequestException(`Location outside geofenced boundary (${distance.toFixed(0)}m from center)`);
      }
    }

    return this.processBiometricPunch({
      deviceId: 'MOBILE_GEO',
      userId,
      userType: 'TEACHER',
      biometricType: 'GEO',
      timestamp: new Date().toISOString(),
    });
  }

  // FR-ATT-014: QR Code Attendance
  async generateAttendanceQR(schoolId: string, sectionId?: string) {
    const qrToken = Buffer.from(JSON.stringify({
      schoolId,
      sectionId,
      timestamp: Date.now(),
      nonce: Math.random(),
    })).toString('base64');

    return {
      schoolId,
      sectionId,
      qrToken,
      expiresInSeconds: 300,
    };
  }

  async markQRAttendance(userId: string, qrToken: string) {
    let payload: any;
    try {
      payload = JSON.parse(Buffer.from(qrToken, 'base64').toString('utf-8'));
    } catch (e) {
      throw new BadRequestException('Invalid QR code token');
    }

    if (Date.now() - payload.timestamp > 300000) {
      throw new BadRequestException('QR code token has expired');
    }

    return this.processBiometricPunch({
      deviceId: 'QR_SCANNER',
      userId,
      userType: 'STUDENT',
      biometricType: 'QR',
      timestamp: new Date().toISOString(),
    });
  }

  // FR-ATT-015: Face Recognition
  async enrollFace(userId: string, faceEncoding: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'FACE_ENROLLMENT',
        resourceType: 'USER',
        recordId: userId,
        changes: { faceEncodingHash: Buffer.from(faceEncoding).toString('base64').substring(0, 32) },
      },
    });

    return { success: true, userId, message: 'Face template enrolled successfully' };
  }

  async markFaceAttendance(faceEncoding: string, deviceId: string) {
    const hash = Buffer.from(faceEncoding).toString('base64').substring(0, 32);
    const log = await this.prisma.auditLog.findFirst({
      where: { action: 'FACE_ENROLLMENT', changes: { path: ['faceEncodingHash'], equals: hash } },
    });

    if (!log || !log.userId) {
      throw new NotFoundException('Face template not recognized');
    }

    return this.processBiometricPunch({
      deviceId,
      userId: log.userId,
      userType: 'STUDENT',
      biometricType: 'FACE',
      timestamp: new Date().toISOString(),
    });
  }
}
