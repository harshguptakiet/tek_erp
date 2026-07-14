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
}
