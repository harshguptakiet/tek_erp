import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventBusService } from '../../events/event-bus.service';
import {
  UpdateUserProfileDto,
  ChangeEmailDto,
  ChangePhoneDto,
  PrivacySettingsDto,
  DeactivateAccountDto,
  UserProfileResponseDto,
} from './dto/user-profile.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private eventBus: EventBusService,
  ) {}

  // FR-USER-001: View User Profile
  async getUserProfile(userId: string): Promise<UserProfileResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        middleName: true,
        dateOfBirth: true,
        gender: true,
        profileImage: true,
        role: true,
        status: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        lastLogin: true,
        studentProfile: {
          select: {
            admissionNumber: true,
            rollNumber: true,
          },
        },
        teacherProfile: {
          select: {
            employeeId: true,
            designation: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Calculate profile completeness
    const profileCompleteness = this.calculateProfileCompleteness(user);

    return {
      ...user,
      profileCompleteness,
    };
  }

  // FR-USER-002: Edit User Profile
  async updateUserProfile(
    userId: string,
    updateData: UpdateUserProfileDto,
  ): Promise<UserProfileResponseDto> {
    // Check user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update profile
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...updateData,
        dateOfBirth: updateData.dateOfBirth
          ? new Date(updateData.dateOfBirth)
          : undefined,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        middleName: true,
        dateOfBirth: true,
        gender: true,
        profileImage: true,
        role: true,
        status: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    // Emit event
    await this.eventBus.publish('user.profile.updated', {
      userId,
      changes: updateData,
      timestamp: new Date(),
    });

    const profileCompleteness = this.calculateProfileCompleteness(updatedUser);

    return {
      ...updatedUser,
      profileCompleteness,
    };
  }

  // FR-USER-004: Change Email Address
  async initiateEmailChange(
    userId: string,
    changeEmailDto: ChangeEmailDto,
  ): Promise<{ message: string; verificationRequired: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      changeEmailDto.currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Incorrect password');
    }

    // Check if new email is already in use
    const existingUser = await this.prisma.user.findUnique({
      where: { email: changeEmailDto.newEmail },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new BadRequestException('Email already in use');
    }

    // Generate verification token
    const verificationToken = randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store pending email change (in a real system, you'd have a separate table)
    // For now, we'll store it in a generic verification table or cache
    // TODO: Create EmailVerificationRequest table

    // Emit event for sending verification email
    await this.eventBus.publish('user.email.change.requested', {
      userId,
      oldEmail: user.email,
      newEmail: changeEmailDto.newEmail,
      verificationToken,
      tokenExpiry,
    });

    return {
      message: 'Verification email sent to new email address',
      verificationRequired: true,
    };
  }

  // FR-USER-005: Change Phone Number
  async initiatePhoneChange(
    userId: string,
    changePhoneDto: ChangePhoneDto,
  ): Promise<{ message: string; otpSent: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      changePhoneDto.currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Incorrect password');
    }

    // Check if new phone is already in use
    const existingUser = await this.prisma.user.findUnique({
      where: { phone: changePhoneDto.newPhone },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new BadRequestException('Phone number already in use');
    }

    // Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP (in cache or database)
    // TODO: Store in Redis or OTP table

    // Emit event for sending OTP
    await this.eventBus.publish('user.phone.change.requested', {
      userId,
      oldPhone: user.phone,
      newPhone: changePhoneDto.newPhone,
      otp,
      otpExpiry,
    });

    return {
      message: 'OTP sent to new phone number',
      otpSent: true,
    };
  }

  // FR-USER-006: Deactivate Account
  async deactivateAccount(
    userId: string,
    deactivateDto: DeactivateAccountDto,
  ): Promise<{ message: string; reactivationDeadline: Date }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      deactivateDto.currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Incorrect password');
    }

    // Check for pending obligations
    // TODO: Check for active subscriptions, unpaid fees, etc.

    const reactivationDeadline = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    ); // 30 days

    // Deactivate account
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: 'INACTIVE',
      },
    });

    // Logout all sessions
    await this.prisma.userSession.deleteMany({
      where: { userId },
    });

    // Emit event
    await this.eventBus.publish('user.account.deactivated', {
      userId,
      reason: deactivateDto.reason,
      reactivationDeadline,
    });

    return {
      message: 'Account deactivated successfully',
      reactivationDeadline,
    };
  }

  // FR-USER-007: Delete Account Permanently
  async deleteAccountPermanently(
    userId: string,
    password: string,
    reason?: string,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        teacherProfile: true,
        parentProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestException('Incorrect password');
    }

    // Check for active obligations
    const hasActiveEnrollments = user.studentProfile
      ? await this.prisma.studentEnrollment.count({
          where: { studentId: user.studentProfile.id, status: 'ACTIVE' },
        })
      : 0;

    if (hasActiveEnrollments > 0) {
      throw new BadRequestException(
        'Cannot delete account with active enrollments. Please contact administrator.',
      );
    }

    // Soft delete - mark with deletedAt timestamp
    await this.prisma.$transaction(async (tx) => {
      // Anonymize user data
      await tx.user.update({
        where: { id: userId },
        data: {
          email: `deleted_${userId}@deleted.local`,
          phone: null,
          status: 'DELETED',
          deletedAt: new Date(),
        },
      });

      // Delete all sessions
      await tx.userSession.deleteMany({ where: { userId } });

      // Log the deletion
      await tx.auditLog.create({
        data: {
          userId,
          action: 'DELETE_ACCOUNT_PERMANENTLY',
          tableName: 'User',
          recordId: userId,
          changes: { reason, deletedAt: new Date().toISOString() },
          ipAddress: '127.0.0.1',
          userAgent: 'System',
        },
      });
    });

    // Emit event
    await this.eventBus.publish('user.account.deleted', {
      userId,
      reason,
      timestamp: new Date(),
    });

    return {
      message:
        'Account deleted permanently. Your data will be retained for 90 days as per GDPR requirements.',
    };
  }

  // FR-USER-009: Privacy Settings Management
  async updatePrivacySettings(
    userId: string,
    privacySettings: PrivacySettingsDto,
  ): Promise<{ message: string; settings: PrivacySettingsDto }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.userPreference.upsert({
      where: { userId },
      create: {
        userId,
        privacySettings: privacySettings as object,
      },
      update: {
        privacySettings: privacySettings as object,
      },
    });

    // Emit event
    await this.eventBus.publish('user.privacy.updated', {
      userId,
      settings: privacySettings,
    });

    return {
      message: 'Privacy settings updated successfully',
      settings: privacySettings,
    };
  }

  // FR-USER-008: View Activity Log
  async getActivityLog(
    userId: string,
    page = 1,
    limit = 50,
  ): Promise<{
    activities: any[];
    pagination: { page: number; limit: number; total: number };
  }> {
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip,
        select: {
          id: true,
          action: true,
          tableName: true,
          recordId: true,
          changes: true,
          ipAddress: true,
          userAgent: true,
          timestamp: true,
        },
      }),
      this.prisma.auditLog.count({
        where: { userId },
      }),
    ]);

    return {
      activities,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  // Helper: Calculate profile completeness percentage
  private calculateProfileCompleteness(user: any): number {
    const fields = [
      'email',
      'phone',
      'firstName',
      'lastName',
      'dateOfBirth',
      'gender',
      'profileImage',
    ];

    const filledFields = fields.filter((field) => user[field]).length;
    return Math.round((filledFields / fields.length) * 100);
  }

  // FR-USER-047: Activate User Account (Admin)
  async activateUserAccount(
    adminId: string,
    userId: string,
    reason: string,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status === 'ACTIVE') {
      throw new BadRequestException('User account is already active');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: 'ACTIVE',
      },
    });

    // Log action
    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'ACTIVATE_USER',
        tableName: 'User',
        recordId: userId,
        changes: { reason },
        timestamp: new Date(),
      },
    });

    // Emit event
    await this.eventBus.publish('user.account.activated', {
      userId,
      activatedBy: adminId,
      reason,
    });

    return {
      message: 'User account activated successfully',
    };
  }

  // FR-USER-048: Suspend User Account (Admin)
  async suspendUserAccount(
    adminId: string,
    userId: string,
    reason: string,
    duration?: number, // days
  ): Promise<{ message: string; suspendedUntil?: Date }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status === 'SUSPENDED') {
      throw new BadRequestException('User account is already suspended');
    }

    const suspendedUntil = duration
      ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
      : undefined;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: 'SUSPENDED',
      },
    });

    // Logout all sessions
    await this.prisma.userSession.deleteMany({
      where: { userId },
    });

    // Log action
    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'SUSPEND_USER',
        tableName: 'User',
        recordId: userId,
        changes: { reason, suspendedUntil },
        timestamp: new Date(),
      },
    });

    // Emit event
    await this.eventBus.publish('user.account.suspended', {
      userId,
      suspendedBy: adminId,
      reason,
      suspendedUntil,
    });

    return {
      message: 'User account suspended successfully',
      suspendedUntil,
    };
  }

  // FR-USER-051: Assign Role to User (Admin)
  async assignRole(
    adminId: string,
    userId: string,
    role: string,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate role
    const validRoles = [
      'PLATFORM_ADMIN',
      'GOVERNMENT',
      'ORG_OWNER',
      'ORG_ADMIN',
      'SCHOOL_ADMIN',
      'TEACHER',
      'STUDENT',
      'PARENT',
      'PUBLISHER',
      'CREATOR',
      'GUEST',
    ];

    if (!validRoles.includes(role)) {
      throw new BadRequestException('Invalid role');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        role: role as any,
      },
    });

    // Log action
    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'ASSIGN_ROLE',
        tableName: 'User',
        recordId: userId,
        changes: { oldRole: user.role, newRole: role },
        timestamp: new Date(),
      },
    });

    // Emit event
    await this.eventBus.publish('user.role.assigned', {
      userId,
      assignedBy: adminId,
      oldRole: user.role,
      newRole: role,
    });

    return {
      message: 'Role assigned successfully',
    };
  }

  // FR-USER-052: Change User Role (Admin)
  async changeUserRole(
    adminId: string,
    userId: string,
    newRole: string,
    reason: string,
  ): Promise<{ message: string }> {
    return this.assignRole(adminId, userId, newRole);
  }

  // FR-USER-013: Student Academic History
  async getStudentAcademicHistory(studentId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { id: studentId },
    });
    if (!student) throw new NotFoundException('Student not found');

    const [user, enrollments, examAttempts, assignmentSubmissions] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: student.userId },
        select: { firstName: true, lastName: true, email: true },
      }),
      this.prisma.studentEnrollment.findMany({
        where: { studentId },
        include: {
          section: {
            include: {
              class: { include: { academicYear: true } },
            },
          },
        },
        orderBy: { enrollmentDate: 'desc' },
      }),
      this.prisma.examAttempt.findMany({
        where: { studentId },
        include: { exam: { select: { title: true, totalMarks: true } } },
        orderBy: { submittedAt: 'desc' },
        take: 50,
      }),
      this.prisma.assignmentSubmission.findMany({
        where: { studentId },
        include: { assignment: { select: { title: true, maxMarks: true } } },
        orderBy: { submittedAt: 'desc' },
        take: 50,
      }),
    ]);

    return {
      student: {
        id: student.id,
        name: `${user?.firstName} ${user?.lastName}`,
        admissionNumber: student.admissionNumber,
      },
      enrollments: enrollments.map((e) => ({
        academicYear: e.section.class.academicYear.year,
        grade: e.section.class.grade,
        section: e.section.sectionName,
        rollNumber: e.rollNumber,
        status: e.status,
        enrollmentDate: e.enrollmentDate,
      })),
      examAttempts,
      assignmentSubmissions,
    };
  }

  // FR-USER-014: Student Health Records
  async getStudentHealth(studentId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        bloodGroup: true,
        emergencyContact: true,
        admissionNumber: true,
        user: { select: { firstName: true, lastName: true } },
      },
    });
    if (!student) throw new NotFoundException('Student not found');

    return {
      studentId,
      name: `${student.user.firstName} ${student.user.lastName}`,
      admissionNumber: student.admissionNumber,
      bloodGroup: student.bloodGroup,
      emergencyContact: student.emergencyContact,
    };
  }

  async updateStudentHealth(
    updatedBy: string,
    studentId: string,
    body: { bloodGroup?: string; emergencyContact?: Record<string, any>; medicalNotes?: string },
  ) {
    const student = await this.prisma.studentProfile.findUnique({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Student not found');

    const updated = await this.prisma.studentProfile.update({
      where: { id: studentId },
      data: {
        ...(body.bloodGroup ? { bloodGroup: body.bloodGroup } : {}),
        ...(body.emergencyContact ? { emergencyContact: body.emergencyContact } : {}),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: updatedBy,
        action: 'UPDATE_STUDENT_HEALTH',
        tableName: 'StudentProfile',
        recordId: studentId,
        changes: body as any,
        ipAddress: '127.0.0.1',
        userAgent: 'System',
      },
    });

    return { success: true, studentId, bloodGroup: updated.bloodGroup, emergencyContact: updated.emergencyContact };
  }

  // FR-USER-046: Bulk User Deletion (soft delete)
  async bulkDeleteUsers(adminId: string, userIds: string[], reason: string) {
    if (!userIds || userIds.length === 0)
      throw new BadRequestException('No user IDs provided');
    if (userIds.length > 100)
      throw new BadRequestException('Cannot delete more than 100 users at once');

    const results = { deleted: 0, skipped: 0, errors: [] as string[] };

    for (const userId of userIds) {
      try {
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            status: 'DELETED',
            deletedAt: new Date(),
            email: `deleted_${userId}@deleted.local`,
          },
        });
        await this.prisma.userSession.deleteMany({ where: { userId } });
        results.deleted++;
      } catch {
        results.skipped++;
        results.errors.push(userId);
      }
    }

    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'BULK_DELETE_USERS',
        tableName: 'User',
        recordId: adminId,
        changes: { userIds, reason, results } as any,
        ipAddress: '127.0.0.1',
        userAgent: 'System',
      },
    });

    return {
      success: true,
      results,
      message: `Deleted ${results.deleted} users, skipped ${results.skipped}`,
    };
  }

  // FR-USER-025: Teacher Payroll Summary (now unblocked by HR module)
  async getTeacherPayrollSummary(teacherId: string) {
    const salaries = await this.prisma.employeeSalary.findMany({
      where: { employeeId: teacherId },
      orderBy: { monthYear: 'desc' },
      take: 12, // Last 12 months
    });
    const totalEarnings = salaries
      .filter((s) => s.status === 'PAID')
      .reduce((sum, s) => sum + Number(s.netSalary), 0);
    const pendingAmount = salaries
      .filter((s) => s.status !== 'PAID')
      .reduce((sum, s) => sum + Number(s.netSalary), 0);
    return {
      teacherId,
      totalMonths: salaries.length,
      totalEarnings,
      pendingAmount,
      lastSalary: salaries[0] || null,
      salaryHistory: salaries,
    };
  }

  // FR-USER-056: User Analytics Dashboard
  async getUserAnalyticsDashboard(userId: string) {
    const [user, loginHistory, activityCount, notifications] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, firstName: true, lastName: true, status: true, lastLogin: true, createdAt: true },
      }),
      this.prisma.userLoginHistory.findMany({
        where: { userId },
        orderBy: { loginAt: 'desc' },
        take: 10,
        select: { loginAt: true, ipAddress: true, device: true },
      }),
      this.prisma.auditLog.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, isRead: false, deletedAt: null } }),
    ]);
    if (!user) throw new NotFoundException('User not found');
    return {
      userId, user,
      stats: { totalActions: activityCount, unreadNotifications: notifications },
      recentLogins: loginHistory,
    };
  }

  // FR-USER-057: Generate User Reports
  async generateUserReport(adminId: string, filters: {
    status?: string; role?: string; organizationId?: string; startDate?: string; endDate?: string;
  }) {
    const where: any = {
      deletedAt: null,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.organizationId ? { organizationUsers: { some: { organizationId: filters.organizationId } } } : {}),
      ...(filters.startDate || filters.endDate ? {
        createdAt: {
          ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
          ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
        },
      } : {}),
    };

    const [total, active, inactive, deleted] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.count({ where: { ...where, status: 'ACTIVE' } }),
      this.prisma.user.count({ where: { ...where, status: 'INACTIVE' } }),
      this.prisma.user.count({ where: { ...where, status: 'DELETED' } }),
    ]);

    return {
      generatedBy: adminId,
      generatedAt: new Date(),
      filters,
      summary: { total, active, inactive, deleted },
    };
  }

  // FR-USER-058: User Activity Monitoring
  async getUserActivityMonitoring(userId: string, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const actions = await this.prisma.auditLog.findMany({
      where: { userId, timestamp: { gte: since } },
      select: { action: true, tableName: true, timestamp: true },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
    const byAction = actions.reduce((acc, a) => {
      acc[a.action] = (acc[a.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return {
      userId, period: `Last ${days} days`,
      totalActions: actions.length,
      actionBreakdown: byAction,
      recentActivity: actions.slice(0, 20),
    };
  }

  // FR-USER-060: User Feedback Collection
  async submitUserFeedback(userId: string, dto: {
    feedbackType: string; subject: string; message: string; rating?: number; metadata?: any;
  }) {
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'USER_FEEDBACK',
        tableName: 'User',
        recordId: userId,
        changes: { feedbackType: dto.feedbackType, subject: dto.subject, message: dto.message, rating: dto.rating, metadata: dto.metadata, submittedAt: new Date().toISOString() } as any,
        ipAddress: '127.0.0.1',
        userAgent: 'System',
      },
    });
    return { success: true, message: 'Feedback submitted successfully' };
  }
  async updateTeacherQualifications(updatedBy: string, teacherId: string, dto: {
    qualification?: string; experience?: number; designation?: string;
    certifications?: string[]; subjectExpertise?: string[];
  }) {
    const teacher = await this.prisma.teacherProfile.findUnique({ where: { id: teacherId } });
    if (!teacher) throw new NotFoundException('Teacher profile not found');

    const updated = await this.prisma.teacherProfile.update({
      where: { id: teacherId },
      data: {
        ...(dto.qualification ? { qualification: dto.qualification } : {}),
        ...(dto.experience !== undefined ? { experience: dto.experience } : {}),
        ...(dto.designation ? { designation: dto.designation } : {}),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: updatedBy,
        action: 'UPDATE_TEACHER_QUALIFICATIONS',
        tableName: 'TeacherProfile',
        recordId: teacherId,
        changes: dto as any,
        ipAddress: '127.0.0.1',
        userAgent: 'System',
      },
    });

    return { success: true, teacherId, ...updated };
  }

  // FR-USER-024: Teacher Performance Metrics
  async getTeacherPerformanceMetrics(teacherId: string) {
    const [examsCreated, assignmentsCreated, liveClassesHeld, attendanceRecord] = await Promise.all([
      this.prisma.exam.count({ where: { teacherId, deletedAt: null } }),
      this.prisma.assignment.count({ where: { teacherId, deletedAt: null } }),
      this.prisma.liveClass.count({ where: { teacherId, status: 'COMPLETED' } }),
      this.prisma.teacherAttendance.findMany({
        where: { teacherId },
        select: { status: true },
      }),
    ]);

    const totalDays = attendanceRecord.length;
    const presentDays = attendanceRecord.filter((a) => a.status === 'PRESENT').length;

    return {
      teacherId,
      metrics: {
        examsCreated,
        assignmentsCreated,
        liveClassesHeld,
        attendancePercentage: totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 'N/A',
        totalDays, presentDays,
      },
    };
  }

  // FR-USER-026: Teacher Professional Development
  async recordProfessionalDevelopment(adminId: string, teacherId: string, dto: {
    activityType: string; title: string; description?: string;
    provider?: string; completedDate: string; hoursCompleted: number;
    certificateUrl?: string;
  }) {
    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'PROFESSIONAL_DEVELOPMENT',
        tableName: 'TeacherProfile',
        recordId: teacherId,
        changes: {
          ...dto,
          recordedBy: adminId,
          recordedAt: new Date().toISOString(),
        },
        ipAddress: '127.0.0.1',
        userAgent: 'System',
      },
    });

    return {
      success: true,
      teacherId,
      activity: dto,
      message: 'Professional development activity recorded',
    };
  }

  async getTeacherProfessionalDevelopment(teacherId: string) {
    const records = await this.prisma.auditLog.findMany({
      where: { action: 'PROFESSIONAL_DEVELOPMENT', recordId: teacherId },
      orderBy: { timestamp: 'desc' },
    });
    const activities = records.map((r) => ({
      id: r.id,
      recordedAt: r.timestamp,
      ...(r.changes as any),
    }));
    const totalHours = activities.reduce((s, a) => s + (a.hoursCompleted || 0), 0);
    return { teacherId, totalHours, activities };
  }

  // FR-USER-030: Parent Communication Preferences
  async updateParentCommunicationPreferences(parentId: string, dto: {
    preferredLanguage?: string; preferredChannel?: string;
    receiveExamAlerts?: boolean; receiveAttendanceAlerts?: boolean;
    receiveFeeReminders?: boolean; receiveProgressReports?: boolean;
  }) {
    await this.prisma.auditLog.create({
      data: {
        userId: parentId,
        action: 'UPDATE_PARENT_COMM_PREFS',
        tableName: 'ParentProfile',
        recordId: parentId,
        changes: dto as any,
        ipAddress: '127.0.0.1',
        userAgent: 'System',
      },
    });
    return { success: true, parentId, preferences: dto };
  }

  // FR-USER-010: GDPR Data Export
  async exportUserData(userId: string) {
    const [user, profile, sessions, activityLogs, preferences] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true, firstName: true, lastName: true, email: true, phone: true,
          status: true, createdAt: true, lastLogin: true, emailVerified: true,
        },
      }),
      this.prisma.userProfile.findUnique({ where: { userId } }),
      this.prisma.userSession.findMany({ where: { userId }, take: 50, orderBy: { createdAt: 'desc' } }),
      this.prisma.auditLog.findMany({ where: { userId }, take: 200, orderBy: { timestamp: 'desc' } }),
      this.prisma.userPreference.findUnique({ where: { userId } }),
    ]);

    if (!user) throw new NotFoundException('User not found');

    return {
      exportedAt: new Date(),
      userId,
      personalData: user,
      profile,
      preferences,
      activeSessions: sessions.length,
      activitySummary: {
        totalActions: activityLogs.length,
        recentActions: activityLogs.slice(0, 10),
      },
      notice: 'This is your complete data held by the platform as per GDPR Article 15.',
    };
  }

  // ============================================================================
  // FR-USER-017: Student Achievements and Certificates
  // ============================================================================

  async issueStudentCertificate(issuedBy: string, dto: {
    studentId: string;
    templateId: string;
    title: string;
    description?: string;
    issuedFor?: string;
    data?: any;
    expiresAt?: Date;
  }) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { id: dto.studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const template = await this.prisma.certificateTemplate.findUnique({
      where: { id: dto.templateId },
    });

    if (!template || !template.isActive) {
      throw new NotFoundException('Certificate template not found or inactive');
    }

    const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const verificationCode = `VERIFY-${Math.random().toString(36).substr(2, 12).toUpperCase()}`;

    const certificate = await this.prisma.certificate.create({
      data: {
        templateId: dto.templateId,
        recipientId: dto.studentId,
        recipientType: 'STUDENT',
        certificateNumber,
        title: dto.title,
        description: dto.description,
        issuedFor: dto.issuedFor,
        data: dto.data || {},
        issuedBy,
        verificationCode,
        expiresAt: dto.expiresAt,
      },
    });

    await this.eventBus.publish('user.certificate_issued', {
      certificateId: certificate.id,
      studentId: dto.studentId,
      timestamp: new Date(),
    });

    return certificate;
  }

  async getStudentCertificates(studentId: string) {
    const certificates = await this.prisma.certificate.findMany({
      where: {
        recipientId: studentId,
        recipientType: 'STUDENT',
        isRevoked: false,
      },
      include: { template: { select: { name: true, certificateType: true } } },
      orderBy: { issuedAt: 'desc' },
    });

    return {
      studentId,
      total: certificates.length,
      certificates: certificates.map(c => ({
        id: c.id,
        certificateNumber: c.certificateNumber,
        title: c.title,
        description: c.description,
        issuedFor: c.issuedFor,
        templateName: c.template.name,
        certificateType: c.template.certificateType,
        issuedAt: c.issuedAt,
        expiresAt: c.expiresAt,
        verificationCode: c.verificationCode,
      })),
    };
  }

  async verifyCertificate(verificationCode: string) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { verificationCode },
      include: {
        template: { select: { name: true, certificateType: true } },
      },
    });

    if (!certificate) {
      return { valid: false, message: 'Certificate not found' };
    }

    if (certificate.isRevoked) {
      return {
        valid: false,
        message: 'Certificate has been revoked',
        revokedAt: certificate.revokedAt,
        revokedReason: certificate.revokedReason,
      };
    }

    if (certificate.expiresAt && new Date() > certificate.expiresAt) {
      return {
        valid: false,
        message: 'Certificate has expired',
        expiresAt: certificate.expiresAt,
      };
    }

    return {
      valid: true,
      certificate: {
        certificateNumber: certificate.certificateNumber,
        title: certificate.title,
        issuedFor: certificate.issuedFor,
        recipientType: certificate.recipientType,
        templateName: certificate.template.name,
        certificateType: certificate.template.certificateType,
        issuedAt: certificate.issuedAt,
      },
    };
  }

  async revokeCertificate(certificateId: string, revokedReason: string) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { id: certificateId },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    if (certificate.isRevoked) {
      throw new BadRequestException('Certificate already revoked');
    }

    const updated = await this.prisma.certificate.update({
      where: { id: certificateId },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason,
      },
    });

    await this.eventBus.publish('user.certificate_revoked', {
      certificateId,
      recipientId: certificate.recipientId,
      timestamp: new Date(),
    });

    return { success: true, message: 'Certificate revoked', certificate: updated };
  }

  // Certificate Templates Management
  async createCertificateTemplate(createdBy: string, dto: {
    name: string;
    certificateType: string;
    templateHtml: string;
    templateCss?: string;
    variables?: string[];
    signaturePositions?: any;
  }) {
    const template = await this.prisma.certificateTemplate.create({
      data: {
        name: dto.name,
        certificateType: dto.certificateType,
        templateHtml: dto.templateHtml,
        templateCss: dto.templateCss,
        variables: dto.variables || [],
        signaturePositions: dto.signaturePositions,
        createdBy,
      },
    });

    return template;
  }

  async listCertificateTemplates(certificateType?: string) {
    const where: any = { isActive: true };
    if (certificateType) {
      where.certificateType = certificateType;
    }

    return this.prisma.certificateTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateCertificateTemplate(templateId: string, dto: {
    name?: string;
    templateHtml?: string;
    templateCss?: string;
    variables?: string[];
    isActive?: boolean;
  }) {
    return this.prisma.certificateTemplate.update({
      where: { id: templateId },
      data: dto,
    });
  }

  // FR-USER-018: Student Behavior and Discipline Records
  async createDisciplinaryRecord(recordedBy: string, dto: {
    studentId: string;
    incidentDate: string;
    incidentType: string;
    description: string;
    actionTaken?: string;
  }) {
    const student = await this.prisma.studentProfile.findUnique({ where: { id: dto.studentId } });
    if (!student) throw new NotFoundException('Student not found');

    const record = await this.prisma.disciplinaryRecord.create({
      data: {
        studentId: dto.studentId,
        incidentDate: new Date(dto.incidentDate),
        incidentType: dto.incidentType,
        description: dto.description,
        actionTaken: dto.actionTaken,
        recordedBy,
      },
    });

    // Notify parent if serious incident
    if (['SUSPENSION', 'EXPULSION'].includes(dto.incidentType)) {
      await this.eventBus.publish('student.disciplinary_action', {
        studentId: dto.studentId,
        incidentType: dto.incidentType,
        recordId: record.id,
        timestamp: new Date(),
      });
    }

    return { success: true, record };
  }

  async getStudentDisciplinaryRecords(studentId: string, filters?: {
    incidentType?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const student = await this.prisma.studentProfile.findUnique({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Student not found');

    const where: any = { studentId };

    if (filters?.incidentType) {
      where.incidentType = filters.incidentType;
    }

    if (filters?.startDate || filters?.endDate) {
      where.incidentDate = {};
      if (filters.startDate) where.incidentDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.incidentDate.lte = new Date(filters.endDate);
    }

    const records = await this.prisma.disciplinaryRecord.findMany({
      where,
      orderBy: { incidentDate: 'desc' },
    });

    // Calculate statistics
    const stats = {
      total: records.length,
      warnings: records.filter(r => r.incidentType === 'WARNING').length,
      suspensions: records.filter(r => r.incidentType === 'SUSPENSION').length,
      expulsions: records.filter(r => r.incidentType === 'EXPULSION').length,
    };

    return {
      studentId,
      stats,
      records: records.map(r => ({
        id: r.id,
        incidentDate: r.incidentDate,
        incidentType: r.incidentType,
        description: r.description,
        actionTaken: r.actionTaken,
        recordedBy: r.recordedBy,
        createdAt: r.createdAt,
      })),
    };
  }

  async updateDisciplinaryRecord(recordId: string, updatedBy: string, dto: {
    incidentType?: string;
    description?: string;
    actionTaken?: string;
  }) {
    const record = await this.prisma.disciplinaryRecord.findUnique({ where: { id: recordId } });
    if (!record) throw new NotFoundException('Disciplinary record not found');

    const updated = await this.prisma.disciplinaryRecord.update({
      where: { id: recordId },
      data: dto,
    });

    await this.prisma.auditLog.create({
      data: {
        userId: updatedBy,
        action: 'UPDATE_DISCIPLINARY_RECORD',
        tableName: 'DisciplinaryRecord',
        recordId,
        changes: dto as any,
        ipAddress: '127.0.0.1',
        userAgent: 'System',
      },
    });

    return { success: true, record: updated };
  }

  async deleteDisciplinaryRecord(recordId: string, deletedBy: string, reason: string) {
    const record = await this.prisma.disciplinaryRecord.findUnique({ where: { id: recordId } });
    if (!record) throw new NotFoundException('Disciplinary record not found');

    await this.prisma.disciplinaryRecord.delete({ where: { id: recordId } });

    await this.prisma.auditLog.create({
      data: {
        userId: deletedBy,
        action: 'DELETE_DISCIPLINARY_RECORD',
        tableName: 'DisciplinaryRecord',
        recordId,
        changes: { reason, deletedAt: new Date().toISOString() } as any,
        ipAddress: '127.0.0.1',
        userAgent: 'System',
      },
    });

    return { success: true, message: 'Disciplinary record deleted' };
  }

  async getStudentBehaviorReport(studentId: string, academicYearId?: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: { user: { select: { firstName: true, lastName: true } } },
    });
    if (!student) throw new NotFoundException('Student not found');

    // Get disciplinary records
    const disciplinaryRecords = await this.prisma.disciplinaryRecord.findMany({
      where: { studentId },
      orderBy: { incidentDate: 'desc' },
    });

    // Calculate behavior metrics
    const positiveIncidents = 0; // If you have positive behavior tracking
    const negativeIncidents = disciplinaryRecords.length;
    const warningsCount = disciplinaryRecords.filter(r => r.incidentType === 'WARNING').length;
    const suspensionsCount = disciplinaryRecords.filter(r => r.incidentType === 'SUSPENSION').length;

    // Calculate behavior score (example: 100 - penalties)
    const behaviorScore = Math.max(0, 100 - (warningsCount * 5) - (suspensionsCount * 20));

    return {
      studentId,
      studentName: `${student.user.firstName} ${student.user.lastName}`,
      admissionNumber: student.admissionNumber,
      behaviorMetrics: {
        behaviorScore,
        positiveIncidents,
        negativeIncidents,
        warningsCount,
        suspensionsCount,
        totalRecords: disciplinaryRecords.length,
      },
      recentIncidents: disciplinaryRecords.slice(0, 10),
      recommendations: this.generateBehaviorRecommendations(behaviorScore, warningsCount, suspensionsCount),
    };
  }

  private generateBehaviorRecommendations(score: number, warnings: number, suspensions: number): string[] {
    const recommendations: string[] = [];

    if (score >= 90) {
      recommendations.push('Excellent behavior - consider for student leadership roles');
    } else if (score >= 70) {
      recommendations.push('Good behavior - maintain current standards');
    } else if (score >= 50) {
      recommendations.push('Needs improvement - consider counseling sessions');
    } else {
      recommendations.push('Requires immediate intervention and parent meeting');
    }

    if (warnings > 3) {
      recommendations.push('High number of warnings - schedule parent-teacher meeting');
    }

    if (suspensions > 0) {
      recommendations.push('Previous suspensions recorded - monitor closely and provide support');
    }

    return recommendations;
  }
}
