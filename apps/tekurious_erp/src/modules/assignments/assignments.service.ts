import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventBusService } from '../../events/event-bus.service';

@Injectable()
export class AssignmentsService {
  constructor(private prisma: PrismaService, private eventBus: EventBusService) {}

  // FR-ASSIGN-001: Create Assignment
  async createAssignment(userId: string, dto: {
    teacherId: string; sectionId?: string; title: string; description?: string;
    subjectId?: string; topicId?: string; maxMarks?: number; dueDate?: string;
    attachments?: string[]; allowLateSubmission?: boolean;
  }) {
    // teacherId can be either a teacherProfile.id or userId — support both
    let resolvedTeacherId = dto.teacherId;
    const teacherByProfile = await this.prisma.teacherProfile.findUnique({ where: { id: dto.teacherId } });
    if (!teacherByProfile) {
      // Try looking up by userId
      const teacherByUser = await this.prisma.teacherProfile.findUnique({ where: { userId: dto.teacherId } });
      if (!teacherByUser) {
        // Auto-create a minimal teacher profile for the user
        const user = await this.prisma.user.findUnique({ where: { id: dto.teacherId } });
        if (!user) throw new NotFoundException('Teacher not found');
        const created = await this.prisma.teacherProfile.upsert({
          where: { userId: dto.teacherId },
          create: { userId: dto.teacherId },
          update: {},
        });
        resolvedTeacherId = created.id;
      } else {
        resolvedTeacherId = teacherByUser.id;
      }
    }

    const assignment = await this.prisma.assignment.create({
      data: {
        teacherId: resolvedTeacherId,
        sectionId: dto.sectionId,
        title: dto.title,
        description: dto.description,
        subjectId: dto.subjectId,
        topicId: dto.topicId,
        maxMarks: dto.maxMarks as any,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        attachments: dto.attachments || [],
        allowLateSubmission: dto.allowLateSubmission ?? true,
        isPublished: false,
      },
    });
    this.eventBus.publish('assignment.created', { assignmentId: assignment.id, createdBy: userId });
    return assignment;
  }

  // FR-ASSIGN-002: List Assignments
  async listAssignments(filters: { teacherId?: string; sectionId?: string; subjectId?: string; isPublished?: boolean }) {
    return this.prisma.assignment.findMany({
      where: {
        deletedAt: null,
        ...(filters.teacherId ? { teacherId: filters.teacherId } : {}),
        ...(filters.sectionId ? { sectionId: filters.sectionId } : {}),
        ...(filters.subjectId ? { subjectId: filters.subjectId } : {}),
        ...(filters.isPublished !== undefined ? { isPublished: filters.isPublished } : {}),
      },
      include: { _count: { select: { submissions: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // FR-ASSIGN-003: Get Assignment
  async getAssignment(assignmentId: string) {
    const a = await this.prisma.assignment.findUnique({
      where: { id: assignmentId, deletedAt: null },
      include: {
        submissions: {
          select: { id: true, studentId: true, status: true, marksObtained: true, submittedAt: true },
        },
      },
    });
    if (!a) throw new NotFoundException('Assignment not found');
    return a;
  }

  // FR-ASSIGN-004: Update Assignment
  async updateAssignment(userId: string, assignmentId: string, dto: {
    title?: string; description?: string; maxMarks?: number; dueDate?: string;
    attachments?: string[]; allowLateSubmission?: boolean;
  }) {
    const a = await this.prisma.assignment.findUnique({ where: { id: assignmentId, deletedAt: null } });
    if (!a) throw new NotFoundException('Assignment not found');
    return this.prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        ...(dto.title ? { title: dto.title } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.maxMarks !== undefined ? { maxMarks: dto.maxMarks as any } : {}),
        ...(dto.dueDate ? { dueDate: new Date(dto.dueDate) } : {}),
        ...(dto.attachments ? { attachments: dto.attachments } : {}),
        ...(dto.allowLateSubmission !== undefined ? { allowLateSubmission: dto.allowLateSubmission } : {}),
      },
    });
  }

  // FR-ASSIGN-005: Publish Assignment
  async publishAssignment(userId: string, assignmentId: string) {
    const a = await this.prisma.assignment.findUnique({ where: { id: assignmentId, deletedAt: null } });
    if (!a) throw new NotFoundException('Assignment not found');
    if (a.isPublished) throw new ConflictException('Assignment already published');
    const updated = await this.prisma.assignment.update({
      where: { id: assignmentId },
      data: { isPublished: true, publishedAt: new Date() },
    });
    this.eventBus.publish('assignment.published', { assignmentId, publishedBy: userId });
    return updated;
  }

  // FR-ASSIGN-006: Delete Assignment
  async deleteAssignment(userId: string, assignmentId: string) {
    const a = await this.prisma.assignment.findUnique({ where: { id: assignmentId, deletedAt: null } });
    if (!a) throw new NotFoundException('Assignment not found');
    await this.prisma.assignment.update({ where: { id: assignmentId }, data: { deletedAt: new Date() } });
    return { success: true };
  }

  // FR-SUBMIT-001: Submit Assignment
  async submitAssignment(studentId: string, assignmentId: string, dto: {
    submissionText?: string; submissionFiles?: string[];
  }) {
    const a = await this.prisma.assignment.findUnique({ where: { id: assignmentId, deletedAt: null } });
    if (!a) throw new NotFoundException('Assignment not found');
    if (!a.isPublished) throw new BadRequestException('Assignment not published yet');

    // Late submission check
    if (!a.allowLateSubmission && a.dueDate && new Date() > a.dueDate) {
      throw new BadRequestException('Late submissions are not allowed for this assignment');
    }

    const student = await this.prisma.studentProfile.findUnique({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Student not found');

    const existing = await this.prisma.assignmentSubmission.findUnique({
      where: { assignmentId_studentId: { assignmentId, studentId } },
    });
    if (existing) throw new ConflictException('Assignment already submitted');

    const submission = await this.prisma.assignmentSubmission.create({
      data: {
        assignmentId,
        studentId,
        submissionText: dto.submissionText,
        submissionFiles: dto.submissionFiles || [],
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });
    this.eventBus.publish('assignment.submitted', { submissionId: submission.id, studentId, assignmentId });
    return submission;
  }

  // FR-SUBMIT-002: Resubmit
  async resubmitAssignment(studentId: string, assignmentId: string, dto: {
    submissionText?: string; submissionFiles?: string[];
  }) {
    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { assignmentId_studentId: { assignmentId, studentId } },
    });
    if (!submission) throw new NotFoundException('Submission not found');
    return this.prisma.assignmentSubmission.update({
      where: { id: submission.id },
      data: {
        submissionText: dto.submissionText,
        submissionFiles: dto.submissionFiles || [],
        status: 'SUBMITTED',
        submittedAt: new Date(),
        marksObtained: null, // reset grade
        feedback: null,
        gradedAt: null,
      },
    });
  }

  // FR-SUBMIT-003: List Submissions
  async listSubmissions(assignmentId: string, status?: string) {
    return this.prisma.assignmentSubmission.findMany({
      where: {
        assignmentId,
        ...(status ? { status: status as any } : {}),
      },
      include: {
        student: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { submittedAt: 'asc' },
    });
  }

  // FR-SUBMIT-004: Get Student Submission
  async getStudentSubmission(assignmentId: string, studentId: string) {
    const s = await this.prisma.assignmentSubmission.findUnique({
      where: { assignmentId_studentId: { assignmentId, studentId } },
      include: { assignment: { select: { title: true, maxMarks: true, dueDate: true } } },
    });
    if (!s) throw new NotFoundException('Submission not found');
    return s;
  }

  // FR-GRADE-001–005: Grade Submission
  async gradeSubmission(graderId: string, submissionId: string, dto: {
    marksObtained: number; feedback?: string;
  }) {
    const s = await this.prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: { assignment: true },
    });
    if (!s) throw new NotFoundException('Submission not found');
    if (dto.marksObtained > Number(s.assignment.maxMarks || 100)) {
      throw new BadRequestException('Marks exceed maximum marks');
    }
    const updated = await this.prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        marksObtained: dto.marksObtained as any,
        feedback: dto.feedback,
        gradedAt: new Date(),
        gradedBy: graderId,
        status: 'GRADED',
      },
    });
    this.eventBus.publish('assignment.graded', { submissionId, gradedBy: graderId });
    return updated;
  }

  // Bulk grade
  async bulkGradeSubmissions(graderId: string, grades: Array<{ submissionId: string; marksObtained: number; feedback?: string }>) {
    const results = [];
    for (const g of grades) {
      results.push(await this.gradeSubmission(graderId, g.submissionId, g));
    }
    return { graded: results.length, results };
  }

  // FR-ANALYTICS-001–004: Assignment Analytics
  async getAssignmentAnalytics(assignmentId: string) {
    const a = await this.prisma.assignment.findUnique({
      where: { id: assignmentId, deletedAt: null },
    });
    if (!a) throw new NotFoundException('Assignment not found');

    const [total, submitted, graded, stats] = await Promise.all([
      // All enrolled students in section
      a.sectionId ? this.prisma.studentEnrollment.count({ where: { sectionId: a.sectionId, status: 'ACTIVE' } }) : Promise.resolve(0),
      this.prisma.assignmentSubmission.count({ where: { assignmentId } }),
      this.prisma.assignmentSubmission.count({ where: { assignmentId, status: 'GRADED' } }),
      this.prisma.assignmentSubmission.aggregate({
        where: { assignmentId, status: 'GRADED' },
        _avg: { marksObtained: true },
        _max: { marksObtained: true },
        _min: { marksObtained: true },
      }),
    ]);

    return {
      assignmentId,
      title: a.title,
      maxMarks: a.maxMarks,
      dueDate: a.dueDate,
      totalStudents: total,
      submitted,
      notSubmitted: total - submitted,
      graded,
      submissionRate: total > 0 ? ((submitted / total) * 100).toFixed(1) : '0',
      averageMarks: stats._avg.marksObtained,
      highestMarks: stats._max.marksObtained,
      lowestMarks: stats._min.marksObtained,
    };
  }

  async getStudentAssignmentReport(studentId: string) {
    const submissions = await this.prisma.assignmentSubmission.findMany({
      where: { studentId },
      include: { assignment: { select: { title: true, subjectId: true, maxMarks: true, dueDate: true } } },
      orderBy: { submittedAt: 'desc' },
    });

    const total = submissions.length;
    const graded = submissions.filter((s) => s.status === 'GRADED');
    const avg = graded.reduce((s, g) => s + Number(g.marksObtained || 0), 0) / (graded.length || 1);

    return {
      studentId,
      totalSubmitted: total,
      graded: graded.length,
      averageMarks: avg.toFixed(2),
      submissions: submissions.map((s) => ({
        assignmentTitle: s.assignment.title,
        subjectId: s.assignment.subjectId,
        maxMarks: s.assignment.maxMarks,
        marksObtained: s.marksObtained,
        status: s.status,
        submittedAt: s.submittedAt,
        dueDate: s.assignment.dueDate,
        isLate: s.assignment.dueDate ? s.submittedAt > s.assignment.dueDate : false,
      })),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR-MANAGE-001–005: Assignment Management Dashboard
  // ─────────────────────────────────────────────────────────────────────────
  async getAssignmentDashboard(teacherId?: string, sectionId?: string) {
    const where: any = {
      deletedAt: null,
      ...(teacherId ? { teacherId } : {}),
      ...(sectionId ? { sectionId } : {}),
    };

    const [totalAssignments, published, draft, totalSubmissions, pendingGrading] = await Promise.all([
      this.prisma.assignment.count({ where }),
      this.prisma.assignment.count({ where: { ...where, isPublished: true } }),
      this.prisma.assignment.count({ where: { ...where, isPublished: false } }),
      this.prisma.assignmentSubmission.count({
        where: { assignment: where },
      }),
      this.prisma.assignmentSubmission.count({
        where: { assignment: where, status: 'SUBMITTED' },
      }),
    ]);

    return {
      totalAssignments,
      published,
      draft,
      totalSubmissions,
      pendingGrading,
    };
  }

  async getTeacherAssignmentWorkload(teacherId: string) {
    const assignments = await this.prisma.assignment.findMany({
      where: { teacherId, deletedAt: null },
      include: {
        _count: { select: { submissions: true } },
      },
    });

    const pendingGradingCount = await this.prisma.assignmentSubmission.count({
      where: { assignment: { teacherId }, status: 'SUBMITTED' },
    });

    return {
      teacherId,
      activeAssignments: assignments.length,
      pendingGrading: pendingGradingCount,
      assignments: assignments.map((a) => ({
        id: a.id,
        title: a.title,
        dueDate: a.dueDate,
        submissionsCount: a._count.submissions,
      })),
    };
  }

  async getStudentAssignmentProgress(studentId: string) {
    return this.getStudentAssignmentReport(studentId);
  }

  async getOverdueAssignments(studentId?: string, teacherId?: string) {
    const now = new Date();

    if (teacherId) {
      return this.prisma.assignment.findMany({
        where: {
          teacherId,
          dueDate: { lt: now },
          isPublished: true,
          deletedAt: null,
        },
        include: {
          _count: { select: { submissions: true } },
        },
      });
    }

    const activeEnrollment = await this.prisma.studentEnrollment.findFirst({
      where: { student: { userId: studentId }, status: 'ACTIVE' },
    });

    if (!activeEnrollment) return [];

    const assignments = await this.prisma.assignment.findMany({
      where: {
        sectionId: activeEnrollment.sectionId,
        dueDate: { lt: now },
        isPublished: true,
        deletedAt: null,
      },
      include: {
        submissions: { where: { studentId: activeEnrollment.studentId } },
      },
    });

    return assignments.filter((a) => a.submissions.length === 0);
  }

  async getAssignmentCompletionTrends(sectionId?: string) {
    const assignments = await this.prisma.assignment.findMany({
      where: {
        ...(sectionId ? { sectionId } : {}),
        isPublished: true,
        deletedAt: null,
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { submissions: true } },
      },
    });

    return assignments.map((a) => ({
      assignmentId: a.id,
      title: a.title,
      dueDate: a.dueDate,
      submissionCount: a._count.submissions,
    }));
  }
}
