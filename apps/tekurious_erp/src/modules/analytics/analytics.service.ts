import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventBusService } from '../../events/event-bus.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService, private eventBus: EventBusService) {}

  // ─────────────────────────────────────────────────────────────────────────
  // FR-STU-ANALYTICS-001–015: Student Analytics
  // ─────────────────────────────────────────────────────────────────────────

  async getStudentAnalytics(studentId: string) {
    const cached = await this.prisma.studentAnalytics.findUnique({ where: { studentId } });

    // Compute live data from existing records
    const [attendanceRecords, examAttempts, assignmentSubs] = await Promise.all([
      this.prisma.attendance.findMany({ where: { studentId }, select: { status: true } }),
      this.prisma.examAttempt.findMany({
        where: { studentId, submittedAt: { not: null } },
        select: { obtainedMarks: true, totalMarks: true, percentage: true, isPassed: true },
      }),
      this.prisma.assignmentSubmission.findMany({
        where: { studentId, status: 'GRADED' },
        select: { marksObtained: true, assignment: { select: { maxMarks: true } } },
      }),
    ]);

    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter((a) => a.status === 'PRESENT').length;
    const attendancePercent = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    const avgExamScore =
      examAttempts.length > 0
        ? examAttempts.reduce((s, a) => s + Number(a.percentage || 0), 0) / examAttempts.length
        : 0;

    const avgAssignmentScore =
      assignmentSubs.length > 0
        ? assignmentSubs.reduce((s, a) => {
            const max = Number(a.assignment?.maxMarks || 100);
            return s + (Number(a.marksObtained || 0) / max) * 100;
          }, 0) / assignmentSubs.length
        : 0;

    const overallScore = (avgExamScore * 0.6 + avgAssignmentScore * 0.4);
    const passedExams = examAttempts.filter((a) => a.isPassed).length;

    // Upsert analytics
    const analytics = await this.prisma.studentAnalytics.upsert({
      where: { studentId },
      create: {
        studentId,
        overallPercentage: overallScore as any,
        attendancePercent: attendancePercent as any,
        calculatedAt: new Date(),
      },
      update: {
        overallPercentage: overallScore as any,
        attendancePercent: attendancePercent as any,
        calculatedAt: new Date(),
      },
    });

    return {
      studentId,
      analytics,
      computed: {
        totalExams: examAttempts.length,
        passedExams,
        failedExams: examAttempts.length - passedExams,
        passRate: examAttempts.length > 0
          ? ((passedExams / examAttempts.length) * 100).toFixed(1) : '0',
        avgExamScore: avgExamScore.toFixed(1),
        avgAssignmentScore: avgAssignmentScore.toFixed(1),
        overallScore: overallScore.toFixed(1),
        attendancePercent: attendancePercent.toFixed(1),
        totalAssignmentsGraded: assignmentSubs.length,
      },
    };
  }

  async getStudentPerformanceTrend(studentId: string) {
    const attempts = await this.prisma.examAttempt.findMany({
      where: { studentId, submittedAt: { not: null } },
      include: { exam: { select: { title: true, examType: true, subjectId: true } } },
      orderBy: { submittedAt: 'asc' },
    });

    return {
      studentId,
      trend: attempts.map((a) => ({
        examTitle: a.exam.title,
        examType: a.exam.examType,
        subjectId: a.exam.subjectId,
        percentage: a.percentage,
        isPassed: a.isPassed,
        rank: a.rank,
        date: a.submittedAt,
      })),
    };
  }

  // FR-STU-ANALYTICS-003: Attendance analytics for student
  async getStudentAttendanceAnalytics(studentId: string, schoolId: string) {
    const byMonth = await this.prisma.attendance.groupBy({
      by: ['status'],
      where: { studentId, schoolId },
      _count: { id: true },
    });

    const total = byMonth.reduce((s, b) => s + b._count.id, 0);
    const present = byMonth.find((b) => b.status === 'PRESENT')?._count.id || 0;
    const absent = byMonth.find((b) => b.status === 'ABSENT')?._count.id || 0;
    const late = byMonth.find((b) => b.status === 'LATE')?._count.id || 0;

    return {
      studentId,
      total, present, absent, late,
      attendancePercentage: total > 0 ? ((present / total) * 100).toFixed(1) : '0',
      riskLevel: total > 0 ? (present / total < 0.75 ? 'HIGH' : present / total < 0.85 ? 'MEDIUM' : 'LOW') : 'UNKNOWN',
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR-TEACH-ANALYTICS-001–012: Teacher Analytics
  // ─────────────────────────────────────────────────────────────────────────

  async getTeacherAnalytics(teacherId: string) {
    const [examsCreated, assignmentsCreated, syllabusProgress, teacherAttendance] = await Promise.all([
      this.prisma.exam.count({ where: { teacherId, deletedAt: null } }),
      this.prisma.assignment.count({ where: { teacherId, deletedAt: null } }),
      this.prisma.syllabusProgress.findMany({ where: {} }), // scope per teacher in real impl
      this.prisma.teacherAttendance.findMany({
        where: { teacherId },
        select: { status: true },
      }),
    ]);

    const totalDays = teacherAttendance.length;
    const presentDays = teacherAttendance.filter((a) => a.status === 'PRESENT').length;
    const attendancePercent = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    const analytics = await this.prisma.teacherAnalytics.upsert({
      where: { teacherId },
      create: {
        teacherId,
        examsCreated,
        assignmentsCreated,
        attendancePercent: attendancePercent as any,
        calculatedAt: new Date(),
      },
      update: {
        examsCreated,
        assignmentsCreated,
        attendancePercent: attendancePercent as any,
        calculatedAt: new Date(),
      },
    });

    return {
      teacherId,
      analytics,
      computed: {
        totalExamsCreated: examsCreated,
        totalAssignmentsCreated: assignmentsCreated,
        attendancePercent: attendancePercent.toFixed(1),
      },
    };
  }

  async getTeacherClassPerformance(teacherId: string) {
    const exams = await this.prisma.exam.findMany({
      where: { teacherId, deletedAt: null },
      include: {
        attempts: {
          where: { submittedAt: { not: null } },
          select: { percentage: true, isPassed: true },
        },
      },
    });

    return exams.map((e) => {
      const total = e.attempts.length;
      const passed = e.attempts.filter((a) => a.isPassed).length;
      const avg = total > 0
        ? e.attempts.reduce((s, a) => s + Number(a.percentage || 0), 0) / total : 0;
      return {
        examId: e.id,
        examTitle: e.title,
        examType: e.examType,
        totalAttempts: total,
        passRate: total > 0 ? ((passed / total) * 100).toFixed(1) : '0',
        averageScore: avg.toFixed(1),
      };
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR-PRINCIPAL-001–012: School/Principal Analytics
  // ─────────────────────────────────────────────────────────────────────────

  async getSchoolAnalytics(schoolId: string, academicYearId?: string) {
    const [totalStudents, totalTeachers, overdueFeesAgg] = await Promise.all([
      this.prisma.studentProfile.count({ where: { schoolId } }),
      this.prisma.teacherProfile.count({ where: { schoolId } }),
      this.prisma.feeRecord.aggregate({
        where: { feeStructure: { schoolId }, status: { in: ['PENDING', 'OVERDUE', 'PARTIAL'] } },
        _sum: { balanceAmount: true },
      }),
    ]);

    const revenueAgg = await this.prisma.feePayment.aggregate({
      where: { feeRecord: { feeStructure: { schoolId } } },
      _sum: { amount: true },
    });

    const examStats = await this.prisma.examAttempt.aggregate({
      where: { exam: { section: { class: { schoolId } } }, submittedAt: { not: null } },
      _avg: { percentage: true },
    });

    const attendanceStats = await this.prisma.attendance.groupBy({
      by: ['status'],
      where: { schoolId },
      _count: { id: true },
    });

    const totalAtt = attendanceStats.reduce((s, a) => s + a._count.id, 0);
    const presentAtt = attendanceStats.find((a) => a.status === 'PRESENT')?._count.id || 0;

    const analytics = await this.prisma.schoolAnalytics.upsert({
      where: { schoolId_academicYearId: { schoolId, academicYearId: academicYearId || '' } },
      create: {
        schoolId,
        academicYearId,
        totalStudents,
        totalTeachers,
        averageAttendance: totalAtt > 0 ? (presentAtt / totalAtt * 100) as any : null,
        revenueCollected: revenueAgg._sum.amount as any,
        outstandingFees: overdueFeesAgg._sum.balanceAmount as any,
        studentTeacherRatio: totalTeachers > 0 ? (totalStudents / totalTeachers) as any : null,
        calculatedAt: new Date(),
      },
      update: {
        totalStudents,
        totalTeachers,
        averageAttendance: totalAtt > 0 ? (presentAtt / totalAtt * 100) as any : null,
        revenueCollected: revenueAgg._sum.amount as any,
        outstandingFees: overdueFeesAgg._sum.balanceAmount as any,
        studentTeacherRatio: totalTeachers > 0 ? (totalStudents / totalTeachers) as any : null,
        calculatedAt: new Date(),
      },
    });

    return {
      schoolId,
      analytics,
      computed: {
        totalStudents,
        totalTeachers,
        studentTeacherRatio: totalTeachers > 0 ? (totalStudents / totalTeachers).toFixed(1) : 'N/A',
        averageExamScore: examStats._avg.percentage?.toFixed(1) || 'N/A',
        averageAttendance: totalAtt > 0 ? ((presentAtt / totalAtt) * 100).toFixed(1) : '0',
        totalRevenue: revenueAgg._sum.amount || 0,
        outstandingFees: overdueFeesAgg._sum.balanceAmount || 0,
      },
    };
  }

  async getClassPerformanceComparison(schoolId: string, academicYearId: string) {
    const classes = await this.prisma.class.findMany({
      where: { schoolId, academicYearId, deletedAt: null },
      include: {
        sections: {
          include: {
            enrollments: {
              include: {
                student: {
                  include: {
                    examAttempts: {
                      where: { submittedAt: { not: null } },
                      select: { percentage: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return classes.map((c) => {
      const allAttempts = c.sections.flatMap((s) =>
        s.enrollments.flatMap((e) => e.student.examAttempts)
      );
      const avg = allAttempts.length > 0
        ? allAttempts.reduce((s, a) => s + Number(a.percentage || 0), 0) / allAttempts.length
        : 0;
      return {
        classId: c.id,
        grade: c.grade,
        gradeName: c.gradeName,
        totalStudents: c.sections.reduce((s, sec) => s + sec.enrollments.length, 0),
        averageScore: avg.toFixed(1),
        totalAttempts: allAttempts.length,
      };
    });
  }

  // FR-PRINCIPAL-005: Early Warning System (students at risk)
  async getEarlyWarningAlerts(schoolId: string) {
    // Students with low attendance
    const lowAttendance = await this.prisma.attendance.groupBy({
      by: ['studentId'],
      where: { schoolId, status: 'ABSENT' },
      _count: { id: true },
      having: { id: { _count: { gt: 10 } } },
    });

    // Students who failed recent exams
    const recentFailures = await this.prisma.examAttempt.findMany({
      where: {
        isPassed: false,
        submittedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        student: { schoolId },
      },
      select: { studentId: true, exam: { select: { title: true } } },
      distinct: ['studentId'],
      take: 50,
    });

    return {
      schoolId,
      alerts: {
        lowAttendanceStudents: lowAttendance.map((a) => ({
          studentId: a.studentId,
          absentDays: a._count.id,
          riskLevel: a._count.id > 20 ? 'HIGH' : 'MEDIUM',
        })),
        recentFailures: recentFailures.map((f) => ({
          studentId: f.studentId,
          failedExam: f.exam.title,
          riskLevel: 'MEDIUM',
        })),
      },
      totalAtRisk: new Set([
        ...lowAttendance.map((a) => a.studentId),
        ...recentFailures.map((f) => f.studentId),
      ]).size,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR-GOV-001–015: Government Dashboards & Reports
  // ─────────────────────────────────────────────────────────────────────────

  async getGovernmentDashboard(level: string, stateCode?: string, districtCode?: string) {
    const dashboard = await this.prisma.governmentDashboard.findFirst({
      where: {
        level,
        ...(stateCode ? { stateCode } : {}),
        ...(districtCode ? { districtCode } : {}),
      },
      orderBy: { calculatedAt: 'desc' },
    });

    if (!dashboard) {
      // Build live dashboard
      const whereOrg: any = {};
      if (stateCode) whereOrg.stateId = stateCode;
      if (districtCode) whereOrg.districtId = districtCode;

      const [totalSchools, totalStudents, totalTeachers] = await Promise.all([
        this.prisma.school.count({ where: { organization: whereOrg, isActive: true } }),
        this.prisma.studentProfile.count(),
        this.prisma.teacherProfile.count(),
      ]);

      return {
        level, stateCode, districtCode,
        metrics: { totalSchools, totalStudents, totalTeachers },
        calculatedAt: new Date(),
        fromCache: false,
      };
    }

    return { ...dashboard, fromCache: true };
  }

  async createGovernmentReport(createdBy: string, dto: {
    reportType: string; reportingPeriod: string;
    schoolId?: string; districtId?: string; stateId?: string;
  }) {
    // Gather data based on report type
    let data: any = {};

    if (dto.reportType === 'ATTENDANCE_SUMMARY' && dto.schoolId) {
      const stats = await this.prisma.attendance.groupBy({
        by: ['status'],
        where: { schoolId: dto.schoolId },
        _count: { id: true },
      });
      data = { attendanceSummary: stats };
    } else if (dto.reportType === 'UDISE' && dto.schoolId) {
      const [students, teachers] = await Promise.all([
        this.prisma.studentProfile.count({ where: { schoolId: dto.schoolId } }),
        this.prisma.teacherProfile.count({ where: { schoolId: dto.schoolId } }),
      ]);
      data = { totalStudents: students, totalTeachers: teachers };
    }

    const report = await this.prisma.governmentReport.create({
      data: {
        reportType: dto.reportType,
        reportingPeriod: dto.reportingPeriod,
        schoolId: dto.schoolId,
        districtId: dto.districtId,
        stateId: dto.stateId,
        data,
        status: 'DRAFT',
        submittedBy: createdBy,
      },
    });

    return report;
  }

  async listGovernmentReports(filters: { schoolId?: string; reportType?: string; status?: string }) {
    return this.prisma.governmentReport.findMany({
      where: {
        ...(filters.schoolId ? { schoolId: filters.schoolId } : {}),
        ...(filters.reportType ? { reportType: filters.reportType } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async submitGovernmentReport(reportId: string, submittedBy: string) {
    const report = await this.prisma.governmentReport.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report not found');
    return this.prisma.governmentReport.update({
      where: { id: reportId },
      data: { status: 'SUBMITTED', submittedAt: new Date(), submittedBy },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR-LEARN-001–012 + FR-USAGE-001–007: Usage & Learning Analytics
  // ─────────────────────────────────────────────────────────────────────────

  async getContentEngagementAnalytics(organizationId?: string) {
    const [totalViews, topContent, recentActivity] = await Promise.all([
      this.prisma.content.aggregate({
        where: { deletedAt: null, status: 'PUBLISHED' as any },
        _sum: { viewCount: true },
        _avg: { rating: true },
        _count: { id: true },
      }),
      this.prisma.content.findMany({
        where: { deletedAt: null, status: 'PUBLISHED' as any },
        orderBy: { viewCount: 'desc' },
        take: 10,
        select: { id: true, title: true, contentType: true, viewCount: true, rating: true, ratingCount: true },
      }),
      this.prisma.learningProgress.findMany({
        orderBy: { lastAccessedAt: 'desc' },
        take: 20,
        select: { studentId: true, contentId: true, progressPercent: true, lastAccessedAt: true },
      }),
    ]);

    return {
      organizationId,
      summary: {
        totalPublishedContent: totalViews._count.id,
        totalViews: totalViews._sum.viewCount || 0,
        averageRating: totalViews._avg.rating?.toFixed(2) || '0',
      },
      topContent,
      recentActivity,
    };
  }

  async getLearningPathAnalytics() {
    const paths = await this.prisma.learningPath.findMany({
      orderBy: { enrollmentCount: 'desc' },
      take: 20,
    });

    return {
      totalPaths: paths.length,
      topPaths: paths.map((p) => ({
        pathId: p.id,
        name: p.name,
        grade: p.grade,
        enrollments: p.enrollmentCount,
        completionRate: p.completionRate,
      })),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR-REPORT-001–005: Custom Report Generation
  // ─────────────────────────────────────────────────────────────────────────

  async generateCustomReport(userId: string, dto: {
    reportType: string; reportName: string; filters?: any;
    organizationId?: string; schoolId?: string; format?: string;
  }) {
    let data: any = {};

    switch (dto.reportType) {
      case 'ACADEMIC':
        if (dto.schoolId) {
          data = await this.getSchoolAnalytics(dto.schoolId);
        }
        break;
      case 'ATTENDANCE':
        if (dto.schoolId) {
          data = await this.prisma.attendance.groupBy({
            by: ['status'],
            where: { schoolId: dto.schoolId },
            _count: { id: true },
          });
        }
        break;
      case 'FINANCIAL':
        if (dto.schoolId) {
          data = await this.prisma.feePayment.aggregate({
            where: { feeRecord: { feeStructure: { schoolId: dto.schoolId } } },
            _sum: { amount: true },
            _count: { id: true },
          });
        }
        break;
      default:
        data = { message: 'Custom report — no predefined template' };
    }

    const report = await this.prisma.analyticsReport.create({
      data: {
        organizationId: dto.organizationId,
        schoolId: dto.schoolId,
        reportType: dto.reportType,
        reportName: dto.reportName,
        filters: dto.filters,
        data,
        generatedBy: userId,
        format: dto.format || 'JSON',
      },
    });

    this.eventBus.publish('analytics.report.generated', {
      reportId: report.id,
      reportType: dto.reportType,
      generatedBy: userId,
    });

    return report;
  }

  async listReports(filters: { organizationId?: string; schoolId?: string; reportType?: string }) {
    return this.prisma.analyticsReport.findMany({
      where: {
        ...(filters.organizationId ? { organizationId: filters.organizationId } : {}),
        ...(filters.schoolId ? { schoolId: filters.schoolId } : {}),
        ...(filters.reportType ? { reportType: filters.reportType } : {}),
      },
      orderBy: { generatedAt: 'desc' },
      take: 100,
      select: {
        id: true, reportType: true, reportName: true,
        generatedBy: true, generatedAt: true, format: true, fileUrl: true,
      },
    });
  }

  async getReport(reportId: string) {
    const r = await this.prisma.analyticsReport.findUnique({ where: { id: reportId } });
    if (!r) throw new NotFoundException('Report not found');
    return r;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR-LEARN-005: Subject-wise Analytics
  // ─────────────────────────────────────────────────────────────────────────

  async getSubjectAnalytics(subjectId: string, schoolId?: string) {
    const examAttempts = await this.prisma.examAttempt.findMany({
      where: {
        submittedAt: { not: null },
        exam: {
          subjectId,
          ...(schoolId ? { section: { class: { schoolId } } } : {}),
        },
      },
      select: { percentage: true, isPassed: true },
    });

    const total = examAttempts.length;
    const passed = examAttempts.filter((a) => a.isPassed).length;
    const avg = total > 0
      ? examAttempts.reduce((s, a) => s + Number(a.percentage || 0), 0) / total
      : 0;

    return {
      subjectId,
      totalAttempts: total,
      passed,
      failed: total - passed,
      passRate: total > 0 ? ((passed / total) * 100).toFixed(1) : '0',
      averageScore: avg.toFixed(1),
    };
  }

  // Analytics Snapshots
  async createSnapshot(dto: {
    snapshotType: string; snapshotDate: string;
    entityType: string; entityId?: string; metrics: any;
  }) {
    return this.prisma.analyticsSnapshot.upsert({
      where: {
        snapshotType_snapshotDate_entityType_entityId: {
          snapshotType: dto.snapshotType,
          snapshotDate: new Date(dto.snapshotDate),
          entityType: dto.entityType,
          entityId: dto.entityId || '',
        },
      },
      create: {
        snapshotType: dto.snapshotType,
        snapshotDate: new Date(dto.snapshotDate),
        entityType: dto.entityType,
        entityId: dto.entityId,
        metrics: dto.metrics,
      },
      update: { metrics: dto.metrics },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR-PRINCIPAL-007–012: Real-Time Monitoring Dashboards
  // ─────────────────────────────────────────────────────────────────────────

  // FR-PRINCIPAL-007: Live attendance status for today
  async getLiveAttendanceStatus(schoolId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalStudents, todayRecords] = await Promise.all([
      this.prisma.studentProfile.count({ where: { schoolId } }),
      this.prisma.attendance.findMany({
        where: {
          schoolId,
          date: { gte: today, lt: tomorrow },
        },
        select: { status: true, sectionId: true },
      }),
    ]);

    const byStatus = todayRecords.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const present = byStatus['PRESENT'] || 0;
    const absent = byStatus['ABSENT'] || 0;
    const late = byStatus['LATE'] || 0;
    const unmarked = totalStudents - todayRecords.length;

    return {
      schoolId,
      asOf: new Date(),
      date: today.toISOString().slice(0, 10),
      totalStudents,
      marked: todayRecords.length,
      unmarked,
      present, absent, late,
      attendancePercent: totalStudents > 0
        ? ((present / totalStudents) * 100).toFixed(1) : '0',
    };
  }

  // FR-PRINCIPAL-008: Section-level attendance breakdown
  async getSectionAttendanceBreakdown(schoolId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sections = await this.prisma.section.findMany({
      where: { class: { schoolId } },
      include: {
        class: { select: { grade: true, gradeName: true } },
        _count: { select: { enrollments: true } },
      },
    });

    const todayAttendance = await this.prisma.attendance.groupBy({
      by: ['sectionId', 'status'],
      where: { schoolId, date: { gte: today, lt: tomorrow } },
      _count: { id: true },
    });

    const attMap: Record<string, Record<string, number>> = {};
    for (const row of todayAttendance) {
      if (!attMap[row.sectionId]) attMap[row.sectionId] = {};
      attMap[row.sectionId][row.status] = row._count.id;
    }

    return {
      schoolId,
      date: today.toISOString().slice(0, 10),
      sections: sections.map((s) => {
        const att = attMap[s.id] || {};
        const total = s._count.enrollments;
        const present = att['PRESENT'] || 0;
        return {
          sectionId: s.id,
          sectionName: s.sectionName,
          grade: s.class.grade,
          gradeName: s.class.gradeName,
          totalStudents: total,
          present,
          absent: att['ABSENT'] || 0,
          late: att['LATE'] || 0,
          unmarked: total - (att['PRESENT'] || 0) - (att['ABSENT'] || 0) - (att['LATE'] || 0),
          attendancePercent: total > 0 ? ((present / total) * 100).toFixed(1) : '0',
        };
      }),
    };
  }

  // FR-PRINCIPAL-009: Real-time exam activity
  async getLiveExamActivity(schoolId: string) {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const [activeAttempts, recentSubmissions, upcomingExams] = await Promise.all([
      // Currently active (started but not submitted)
      this.prisma.examAttempt.count({
        where: {
          submittedAt: null,
          startedAt: { gte: oneHourAgo },
          exam: { section: { class: { schoolId } } },
        },
      }),
      // Submitted in the last hour
      this.prisma.examAttempt.count({
        where: {
          submittedAt: { gte: oneHourAgo },
          exam: { section: { class: { schoolId } } },
        },
      }),
      // Published exams that haven't ended yet
      this.prisma.exam.findMany({
        where: {
          isPublished: true,
          deletedAt: null,
          section: { class: { schoolId } },
          OR: [{ endTime: null }, { endTime: { gte: now } }],
        },
        select: { id: true, title: true, startTime: true, endTime: true,
          _count: { select: { attempts: true } } },
        take: 10,
      }),
    ]);

    return {
      schoolId,
      asOf: now,
      activeStudentsInExam: activeAttempts,
      recentSubmissions,
      upcomingAndActiveExams: upcomingExams,
    };
  }

  // FR-PRINCIPAL-010: Fee collection live status
  async getLiveFeeStatus(schoolId: string) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todayCollection, monthCollection, outstanding, overdueCount] = await Promise.all([
      this.prisma.feePayment.aggregate({
        where: { feeRecord: { feeStructure: { schoolId } }, paymentDate: { gte: startOfDay } },
        _sum: { amount: true },
        _count: { id: true },
      }),
      this.prisma.feePayment.aggregate({
        where: { feeRecord: { feeStructure: { schoolId } }, paymentDate: { gte: startOfMonth } },
        _sum: { amount: true },
        _count: { id: true },
      }),
      this.prisma.feeRecord.aggregate({
        where: { feeStructure: { schoolId }, status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } },
        _sum: { balanceAmount: true },
        _count: { id: true },
      }),
      this.prisma.feeRecord.count({
        where: { feeStructure: { schoolId }, status: 'OVERDUE' },
      }),
    ]);

    return {
      schoolId,
      asOf: new Date(),
      today: {
        collected: todayCollection._sum.amount || 0,
        transactions: todayCollection._count.id,
      },
      thisMonth: {
        collected: monthCollection._sum.amount || 0,
        transactions: monthCollection._count.id,
      },
      outstanding: {
        amount: outstanding._sum.balanceAmount || 0,
        records: outstanding._count.id,
        overdueCount,
      },
    };
  }

  // FR-PRINCIPAL-011: Staff activity monitoring
  async getStaffActivityStatus(schoolId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalTeachers, todayTeacherAttendance, liveClasses] = await Promise.all([
      this.prisma.teacherProfile.count({ where: { schoolId } }),
      this.prisma.teacherAttendance.findMany({
        where: { schoolId, date: { gte: today, lt: tomorrow } },
        select: { status: true },
      }),
      this.prisma.liveClass.count({
        where: { status: 'LIVE', teacher: { schoolId } },
      }),
    ]);

    const present = todayTeacherAttendance.filter((a) => a.status === 'PRESENT').length;

    return {
      schoolId,
      asOf: new Date(),
      totalTeachers,
      present,
      absent: todayTeacherAttendance.filter((a) => a.status === 'ABSENT').length,
      unmarked: totalTeachers - todayTeacherAttendance.length,
      attendancePercent: totalTeachers > 0
        ? ((present / totalTeachers) * 100).toFixed(1) : '0',
      activeLiveClasses: liveClasses,
    };
  }

  // FR-PRINCIPAL-012: Consolidated principal live dashboard
  async getPrincipalLiveDashboard(schoolId: string) {
    const [attendance, feeStatus, staffStatus, examActivity] = await Promise.all([
      this.getLiveAttendanceStatus(schoolId),
      this.getLiveFeeStatus(schoolId),
      this.getStaffActivityStatus(schoolId),
      this.getLiveExamActivity(schoolId),
    ]);

    return {
      schoolId,
      asOf: new Date(),
      studentAttendance: {
        present: attendance.present,
        absent: attendance.absent,
        unmarked: attendance.unmarked,
        percent: attendance.attendancePercent,
      },
      staffAttendance: {
        present: staffStatus.present,
        absent: staffStatus.absent,
        percent: staffStatus.attendancePercent,
        activeLiveClasses: staffStatus.activeLiveClasses,
      },
      fees: {
        todayCollection: feeStatus.today.collected,
        outstanding: feeStatus.outstanding.amount,
        overdueCount: feeStatus.outstanding.overdueCount,
      },
      examActivity: {
        activeStudents: examActivity.activeStudentsInExam,
        recentSubmissions: examActivity.recentSubmissions,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR-TEACH-ANALYTICS-007–012: Benchmark & Comparative Reports
  // ─────────────────────────────────────────────────────────────────────────

  // FR-TEACH-ANALYTICS-007: Teacher comparative performance
  async getTeacherBenchmarkReport(schoolId: string) {
    const teachers = await this.prisma.teacherProfile.findMany({
      where: { schoolId },
      select: { id: true, user: { select: { firstName: true, lastName: true } } },
    });

    const results = await Promise.all(
      teachers.map(async (t) => {
        const [examsCreated, avgStudentScore, liveClassesHeld] = await Promise.all([
          this.prisma.exam.count({ where: { teacherId: t.id, deletedAt: null } }),
          this.prisma.examAttempt.aggregate({
            where: { exam: { teacherId: t.id }, submittedAt: { not: null } },
            _avg: { percentage: true },
          }),
          this.prisma.liveClass.count({ where: { teacherId: t.id, status: 'COMPLETED' } }),
        ]);
        return {
          teacherId: t.id,
          teacherName: `${t.user.firstName} ${t.user.lastName}`,
          examsCreated,
          avgStudentScore: avgStudentScore._avg.percentage?.toFixed(1) || 'N/A',
          liveClassesHeld,
        };
      }),
    );

    const schoolAvg = results.reduce((s, r) => s + Number(r.avgStudentScore || 0), 0) / (results.length || 1);

    return {
      schoolId,
      schoolAverageStudentScore: schoolAvg.toFixed(1),
      teacherBenchmarks: results.sort((a, b) => Number(b.avgStudentScore) - Number(a.avgStudentScore)),
    };
  }

  // FR-TEACH-ANALYTICS-008: Section benchmark comparison
  async getSectionBenchmarks(schoolId: string, academicYearId: string) {
    const sections = await this.prisma.section.findMany({
      where: { class: { schoolId, academicYearId } },
      include: {
        class: { select: { grade: true, gradeName: true } },
        sectionTeachers: { select: { teacherId: true, isPrimary: true } },
      },
    });

    const results = await Promise.all(
      sections.map(async (s) => {
        const enrollments = await this.prisma.studentEnrollment.count({
          where: { sectionId: s.id, status: 'ACTIVE' },
        });
        const examStats = await this.prisma.examAttempt.aggregate({
          where: { exam: { sectionId: s.id }, submittedAt: { not: null } },
          _avg: { percentage: true },
          _count: { id: true },
        });
        return {
          sectionId: s.id,
          sectionName: s.sectionName,
          grade: s.class.grade,
          totalStudents: enrollments,
          avgExamScore: examStats._avg.percentage?.toFixed(1) || 'N/A',
          totalAttempts: examStats._count.id,
          teacherIds: s.sectionTeachers.map((st) => st.teacherId),
        };
      }),
    );

    return { schoolId, academicYearId, sections: results };
  }
}
