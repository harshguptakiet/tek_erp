import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventBusService } from '../../events/event-bus.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService, private eventBus: EventBusService) {}

  // FR-PAY-001: Initiate Payment
  async initiatePayment(userId: string, dto: {
    amount: number; currency?: string; paymentMethod: string;
    subscriptionId?: string; organizationId?: string;
    gateway?: string; metadata?: any;
  }) {
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        amount: dto.amount as any,
        currency: dto.currency || 'INR',
        paymentMethod: dto.paymentMethod as any,
        status: 'PENDING',
        subscriptionId: dto.subscriptionId,
        organizationId: dto.organizationId,
      },
    });

    // Create initial attempt
    await this.prisma.paymentAttempt.create({
      data: {
        paymentId: payment.id,
        attemptNumber: 1,
        amount: dto.amount as any,
        paymentGateway: dto.gateway || 'RAZORPAY',
        status: 'INITIATED',
        attemptedAt: new Date(),
      },
    });

    this.eventBus.publish('payment.initiated', { paymentId: payment.id, userId, amount: dto.amount });
    return payment;
  }

  // FR-PAY-002: Get Payment
  async getPayment(paymentId: string) {
    const p = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { attempts: { orderBy: { attemptedAt: 'desc' } }, refunds: true },
    });
    if (!p) throw new NotFoundException('Payment not found');
    return p;
  }

  // FR-PAY-003: List Payments
  async listPayments(filters: {
    userId?: string; organizationId?: string; status?: string;
    page?: number; limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: {
          ...(filters.userId ? { userId: filters.userId } : {}),
          ...(filters.organizationId ? { organizationId: filters.organizationId } : {}),
          ...(filters.status ? { status: filters.status as any } : {}),
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { _count: { select: { attempts: true } } },
      }),
      this.prisma.payment.count({
        where: {
          ...(filters.userId ? { userId: filters.userId } : {}),
          ...(filters.organizationId ? { organizationId: filters.organizationId } : {}),
          ...(filters.status ? { status: filters.status as any } : {}),
        },
      }),
    ]);
    return { data: items, meta: { total, page, limit } };
  }

  // FR-PAY-004: Confirm/Update Payment Status (webhook handler)
  async updatePaymentStatus(paymentId: string, dto: {
    status: string; gatewayTransactionId?: string; gatewayResponse?: any;
  }) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');

    const updated = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: dto.status as any,
        gatewayTransactionId: dto.gatewayTransactionId,
        gatewayResponse: dto.gatewayResponse,
        paidAt: dto.status === 'COMPLETED' ? new Date() : undefined,
        failedAt: dto.status === 'FAILED' ? new Date() : undefined,
      },
    });

    // Update last attempt
    await this.prisma.paymentAttempt.updateMany({
      where: { paymentId, status: 'INITIATED' },
      data: {
        status: dto.status === 'COMPLETED' ? 'SUCCESS' : 'FAILED',
        gatewayResponse: dto.gatewayResponse,
      },
    });

    this.eventBus.publish(`payment.${dto.status.toLowerCase()}`, {
      paymentId, status: dto.status, gatewayTransactionId: dto.gatewayTransactionId,
    });

    return updated;
  }

  // FR-PAY-005: Retry Payment
  async retryPayment(userId: string, paymentId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status === 'COMPLETED') throw new ConflictException('Payment already completed');

    const attemptCount = await this.prisma.paymentAttempt.count({ where: { paymentId } });

    await this.prisma.paymentAttempt.create({
      data: {
        paymentId,
        attemptNumber: attemptCount + 1,
        amount: payment.amount,
        paymentGateway: 'RAZORPAY',
        status: 'INITIATED',
        attemptedAt: new Date(),
      },
    });

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'PENDING' },
    });

    return { success: true, message: 'Payment retry initiated', attemptNumber: attemptCount + 1 };
  }

  // FR-REFUND-001: Request Refund
  async requestRefund(userId: string, paymentId: string, dto: {
    refundAmount: number; refundReason: string; refundType?: string;
  }) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== 'COMPLETED') throw new BadRequestException('Can only refund completed payments');
    if (payment.refundedAt) throw new ConflictException('Payment already refunded');

    const totalAmount = Number(payment.amount);
    if (dto.refundAmount > totalAmount) {
      throw new BadRequestException('Refund amount exceeds payment amount');
    }

    const refund = await this.prisma.paymentRefund.create({
      data: {
        paymentId,
        refundAmount: dto.refundAmount as any,
        refundReason: dto.refundReason,
        refundType: dto.refundType || (dto.refundAmount === totalAmount ? 'FULL' : 'PARTIAL'),
        status: 'PENDING',
        requestedBy: userId,
        requestedAt: new Date(),
      },
    });

    this.eventBus.publish('payment.refund.requested', { refundId: refund.id, paymentId, userId });
    return refund;
  }

  // FR-REFUND-002: Process Refund (admin)
  async processRefund(adminId: string, refundId: string, approved: boolean, reason?: string) {
    const refund = await this.prisma.paymentRefund.findUnique({ where: { id: refundId } });
    if (!refund) throw new NotFoundException('Refund not found');

    const updated = await this.prisma.paymentRefund.update({
      where: { id: refundId },
      data: {
        status: approved ? 'COMPLETED' : 'FAILED',
        processedAt: new Date(),
        completedAt: approved ? new Date() : undefined,
        ...(reason ? { refundReason: `${refund.refundReason} | Admin note: ${reason}` } : {}),
      },
    });

    if (approved) {
      await this.prisma.payment.update({
        where: { id: refund.paymentId },
        data: { status: 'REFUNDED', refundedAt: new Date() },
      });
    }

    this.eventBus.publish('payment.refund.processed', { refundId, approved, processedBy: adminId });
    return updated;
  }

  // FR-REPORT-001: Payment Summary Report
  async getPaymentSummary(filters: { organizationId?: string; startDate?: string; endDate?: string }) {
    const where: any = {
      ...(filters.organizationId ? { organizationId: filters.organizationId } : {}),
      ...(filters.startDate || filters.endDate ? {
        createdAt: {
          ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
          ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
        },
      } : {}),
    };

    const [total, completed, failed, refunded, revenue] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.count({ where: { ...where, status: 'COMPLETED' } }),
      this.prisma.payment.count({ where: { ...where, status: 'FAILED' } }),
      this.prisma.payment.count({ where: { ...where, status: 'REFUNDED' } }),
      this.prisma.payment.aggregate({
        where: { ...where, status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    return {
      period: { startDate: filters.startDate, endDate: filters.endDate },
      totalPayments: total,
      completed, failed, refunded,
      totalRevenue: revenue._sum.amount || 0,
      successRate: total > 0 ? ((completed / total) * 100).toFixed(1) : '0',
    };
  }

  // FR-SECURITY-001: Log gateway interaction
  async logGatewayInteraction(dto: {
    gateway: string; endpoint: string; httpMethod: string;
    requestBody?: any; responseStatus?: number; responseBody?: any; duration?: number;
  }) {
    return this.prisma.paymentGatewayLog.create({
      data: {
        gateway: dto.gateway,
        endpoint: dto.endpoint,
        httpMethod: dto.httpMethod,
        requestBody: dto.requestBody,
        responseStatus: dto.responseStatus,
        responseBody: dto.responseBody,
        duration: dto.duration,
        timestamp: new Date(),
      },
    });
  }

  // ── Fee Management (FR-FEE-001–018) ──────────────────────────────────────

  async createFeeStructure(userId: string, dto: {
    schoolId: string; name: string; description?: string; grade?: number;
    amount: number; currency?: string; frequency: string; dueDate?: string;
    lateFeeAmount?: number; lateFeeDays?: number; academicYear?: string;
  }) {
    return this.prisma.feeStructure.create({
      data: {
        schoolId: dto.schoolId,
        name: dto.name,
        description: dto.description,
        grade: dto.grade,
        amount: dto.amount as any,
        currency: dto.currency || 'INR',
        frequency: dto.frequency,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        lateFeeAmount: dto.lateFeeAmount as any,
        lateFeeDays: dto.lateFeeDays,
        academicYear: dto.academicYear,
      },
    });
  }

  async listFeeStructures(schoolId: string, grade?: number, academicYear?: string) {
    return this.prisma.feeStructure.findMany({
      where: {
        schoolId, isActive: true,
        ...(grade ? { grade } : {}),
        ...(academicYear ? { academicYear } : {}),
      },
      orderBy: [{ grade: 'asc' }, { name: 'asc' }],
    });
  }

  async generateFeeRecord(userId: string, dto: {
    studentId: string; feeStructureId: string; discountAmount?: number; discountReason?: string;
  }) {
    const feeStructure = await this.prisma.feeStructure.findUnique({ where: { id: dto.feeStructureId } });
    if (!feeStructure) throw new NotFoundException('Fee structure not found');

    const existing = await this.prisma.feeRecord.findFirst({
      where: { studentId: dto.studentId, feeStructureId: dto.feeStructureId },
    });
    if (existing) throw new ConflictException('Fee record already exists for this student');

    const totalAmount = Number(feeStructure.amount);
    const discountAmount = dto.discountAmount || 0;
    const balanceAmount = totalAmount - discountAmount;

    const record = await this.prisma.feeRecord.create({
      data: {
        studentId: dto.studentId,
        feeStructureId: dto.feeStructureId,
        totalAmount: totalAmount as any,
        paidAmount: 0 as any,
        balanceAmount: balanceAmount as any,
        discountAmount: discountAmount as any,
        discountReason: dto.discountReason,
        status: 'PENDING',
        dueDate: feeStructure.dueDate,
      },
    });

    this.eventBus.publish('fee.record.generated', { feeRecordId: record.id, studentId: dto.studentId });
    return record;
  }

  async collectFeePayment(collectedBy: string, feeRecordId: string, dto: {
    amount: number; paymentMethod: string; transactionId?: string; remarks?: string;
  }) {
    const record = await this.prisma.feeRecord.findUnique({ where: { id: feeRecordId } });
    if (!record) throw new NotFoundException('Fee record not found');
    if (record.status === 'PAID') throw new ConflictException('Fee already fully paid');

    const balance = Number(record.balanceAmount);
    if (dto.amount > balance) {
      throw new BadRequestException(`Amount exceeds balance of ${balance}`);
    }

    // Generate receipt number
    const receiptNumber = `REC-${Date.now()}-${feeRecordId.slice(-4).toUpperCase()}`;

    const feePayment = await this.prisma.feePayment.create({
      data: {
        feeRecordId,
        amount: dto.amount as any,
        paymentMethod: dto.paymentMethod as any,
        paymentDate: new Date(),
        transactionId: dto.transactionId,
        receiptNumber,
        remarks: dto.remarks,
      },
    });

    // Update fee record
    const newPaid = Number(record.paidAmount) + dto.amount;
    const newBalance = Number(record.balanceAmount) - dto.amount;
    const newStatus = newBalance <= 0 ? 'PAID' : newPaid > 0 ? 'PARTIAL' : 'PENDING';

    await this.prisma.feeRecord.update({
      where: { id: feeRecordId },
      data: {
        paidAmount: newPaid as any,
        balanceAmount: newBalance as any,
        status: newStatus,
      },
    });

    this.eventBus.publish('fee.payment.collected', {
      feePaymentId: feePayment.id, feeRecordId, amount: dto.amount, collectedBy,
    });

    return { feePayment, receiptNumber, newBalance, status: newStatus };
  }

  async getStudentFeeStatement(studentId: string) {
    const records = await this.prisma.feeRecord.findMany({
      where: { studentId },
      include: {
        feeStructure: { select: { name: true, frequency: true, academicYear: true } },
        payments: { orderBy: { paymentDate: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalDue = records.reduce((s, r) => s + Number(r.totalAmount), 0);
    const totalPaid = records.reduce((s, r) => s + Number(r.paidAmount), 0);
    const totalBalance = records.reduce((s, r) => s + Number(r.balanceAmount), 0);
    const overdueRecords = records.filter((r) => r.status === 'OVERDUE' || (r.status !== 'PAID' && r.dueDate && new Date() > r.dueDate));

    return {
      studentId,
      totalDue, totalPaid, totalBalance,
      overdueCount: overdueRecords.length,
      records,
    };
  }

  async getFeeCollection(schoolId: string, filters: { startDate?: string; endDate?: string; grade?: number }) {
    const where: any = {
      feeRecord: {
        feeStructure: {
          schoolId,
          ...(filters.grade ? { grade: filters.grade } : {}),
        },
      },
      ...(filters.startDate || filters.endDate ? {
        paymentDate: {
          ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
          ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
        },
      } : {}),
    };

    const [payments, total] = await Promise.all([
      this.prisma.feePayment.findMany({
        where,
        include: {
          feeRecord: {
            include: {
              student: { include: { user: { select: { firstName: true, lastName: true } } } },
              feeStructure: { select: { name: true, grade: true } },
            },
          },
        },
        orderBy: { paymentDate: 'desc' },
        take: 200,
      }),
      this.prisma.feePayment.aggregate({ where, _sum: { amount: true } }),
    ]);

    return {
      schoolId,
      totalCollected: total._sum.amount || 0,
      paymentCount: payments.length,
      payments: payments.map((p) => ({
        receiptNumber: p.receiptNumber,
        amount: p.amount,
        paymentMethod: p.paymentMethod,
        paymentDate: p.paymentDate,
        studentName: `${p.feeRecord.student.user.firstName} ${p.feeRecord.student.user.lastName}`,
        feeName: p.feeRecord.feeStructure.name,
        grade: p.feeRecord.feeStructure.grade,
      })),
    };
  }

  // FR-FEE-007: Apply fee concession
  async applyFeeConcession(appliedBy: string, dto: {
    studentId: string; feeRecordId: string; concessionType: string;
    discountAmount?: number; discountPercentage?: number; reason: string;
  }) {
    const record = await this.prisma.feeRecord.findUnique({
      where: { id: dto.feeRecordId },
      include: { feeStructure: true },
    });
    if (!record) throw new NotFoundException('Fee record not found');

    const totalAmount = Number(record.totalAmount);
    let discountAmount = dto.discountAmount || 0;
    if (dto.discountPercentage) discountAmount = (totalAmount * dto.discountPercentage) / 100;

    // FeeConcession uses feeStructureId not feeRecordId
    await this.prisma.feeConcession.create({
      data: {
        studentId: dto.studentId,
        feeStructureId: record.feeStructureId,
        concessionType: dto.concessionType,
        concessionAmount: discountAmount as any,
        concessionPercent: dto.discountPercentage as any,
        reason: dto.reason,
        approvedBy: appliedBy,
        approvedAt: new Date(),
        effectiveFrom: new Date(),
        isActive: true,
      },
    });

    const newBalance = Math.max(0, Number(record.balanceAmount) - discountAmount);
    const updated = await this.prisma.feeRecord.update({
      where: { id: dto.feeRecordId },
      data: {
        discountAmount: { increment: discountAmount },
        balanceAmount: newBalance as any,
        status: newBalance <= 0 ? 'PAID' : record.status,
      },
    });

    this.eventBus.publish('fee.concession.applied', { feeRecordId: dto.feeRecordId, studentId: dto.studentId, discountAmount, appliedBy });
    return { success: true, feeRecord: updated, discountAmount };
  }

  // FR-FEE-010: Apply fee waiver
  async applyFeeWaiver(appliedBy: string, dto: {
    studentId: string; feeRecordId: string; waiverCategory: string;
    waiverAmount: number; waiverPercent?: number; reason: string; supportingDocs?: string[];
  }) {
    const record = await this.prisma.feeRecord.findUnique({
      where: { id: dto.feeRecordId },
      include: { feeStructure: true },
    });
    if (!record) throw new NotFoundException('Fee record not found');

    // FeeWaiver uses feeStructureId, waiverReason, waiverCategory, requestedBy
    await this.prisma.feeWaiver.create({
      data: {
        studentId: dto.studentId,
        feeStructureId: record.feeStructureId,
        waiverAmount: dto.waiverAmount as any,
        waiverPercent: (dto.waiverPercent || 0) as any,
        waiverReason: dto.reason,
        waiverCategory: dto.waiverCategory,
        supportingDocs: dto.supportingDocs || [],
        requestedBy: appliedBy,
        approvedBy: appliedBy,
        approvedAt: new Date(),
        status: 'APPROVED',
        effectiveFrom: new Date(),
      },
    });

    const newBalance = Math.max(0, Number(record.balanceAmount) - dto.waiverAmount);
    const updated = await this.prisma.feeRecord.update({
      where: { id: dto.feeRecordId },
      data: { balanceAmount: newBalance as any, status: newBalance <= 0 ? 'PAID' : record.status },
    });

    this.eventBus.publish('fee.waiver.applied', { feeRecordId: dto.feeRecordId, waiverAmount: dto.waiverAmount, appliedBy });
    return { success: true, feeRecord: updated, waiverAmount: dto.waiverAmount };
  }

  // FR-FEE-008: Create fee installment plan
  async createInstallmentPlan(dto: {
    feeRecordId: string; installments: Array<{ installmentNumber: number; amount: number; dueDate: string }>;
  }) {
    const record = await this.prisma.feeRecord.findUnique({ where: { id: dto.feeRecordId } });
    if (!record) throw new NotFoundException('Fee record not found');
    const created = await this.prisma.feeInstallment.createMany({
      data: dto.installments.map((inst) => ({
        feeRecordId: dto.feeRecordId,
        installmentNumber: inst.installmentNumber,
        installmentAmount: inst.amount as any,
        dueDate: new Date(inst.dueDate),
        status: 'PENDING',
      })),
    });
    return { success: true, feeRecordId: dto.feeRecordId, installmentsCreated: created.count };
  }

  // FR-FEE-009: Get fee defaulters
  async getFeeDefaulters(schoolId: string) {
    const overdue = await this.prisma.feeRecord.findMany({
      where: { feeStructure: { schoolId }, status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] }, dueDate: { lt: new Date() } },
      include: {
        student: { include: { user: { select: { firstName: true, lastName: true } } } },
        feeStructure: { select: { name: true, grade: true } },
      },
      orderBy: { balanceAmount: 'desc' },
    });
    const totalOutstanding = overdue.reduce((s, r) => s + Number(r.balanceAmount), 0);
    return {
      schoolId, totalDefaulters: overdue.length, totalOutstanding,
      defaulters: overdue.map((r) => ({
        studentId: r.studentId,
        studentName: `${r.student.user.firstName} ${r.student.user.lastName}`,
        feeName: r.feeStructure.name, grade: r.feeStructure.grade,
        totalAmount: r.totalAmount, paidAmount: r.paidAmount, balanceAmount: r.balanceAmount, dueDate: r.dueDate,
      })),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR-FEE-013, 015, 016: Parent Portal, Fee Forecasting, Demand Letters
  // ─────────────────────────────────────────────────────────────────────────

  // FR-FEE-013: Parent Fee Portal
  async getParentFeePortal(parentId: string) {
    const parent = await this.prisma.parentProfile.findUnique({
      where: { id: parentId },
      include: { children: { include: { student: { include: { feeRecords: true } } } } },
    });
    if (!parent) throw new NotFoundException('Parent profile not found');

    const childrenFees = parent.children.map((link) => {
      const student = link.student;
      const records = student.feeRecords;
      const totalDue = records.reduce((s, r) => s + Number(r.balanceAmount), 0);
      return {
        studentId: student.id,
        recordsCount: records.length,
        totalDue,
        feeRecords: records,
      };
    });

    return { parentId, childrenCount: parent.children.length, childrenFees };
  }

  // FR-FEE-015: Fee Forecasting
  async forecastFeeRevenue(schoolId: string, academicYearId: string) {
    const records = await this.prisma.feeRecord.findMany({
      where: { feeStructure: { schoolId, ...(academicYearId ? { academicYear: academicYearId } : {}) } },
    });

    const totalProjected = records.reduce((s, r) => s + Number(r.totalAmount), 0);
    const totalCollected = records.reduce((s, r) => s + Number(r.paidAmount), 0);

    return {
      schoolId,
      academicYearId,
      totalProjectedRevenue: totalProjected,
      totalCollectedRevenue: totalCollected,
      pendingRevenue: totalProjected - totalCollected,
      collectionRate: totalProjected > 0 ? ((totalCollected / totalProjected) * 100).toFixed(1) : '0',
    };
  }

  // FR-FEE-016: Fee Demand Letters
  async generateFeeDemandLetter(feeRecordId: string) {
    const record = await this.prisma.feeRecord.findUnique({
      where: { id: feeRecordId },
      include: { student: { include: { user: true } }, feeStructure: true },
    });
    if (!record) throw new NotFoundException('Fee record not found');

    return {
      feeRecordId,
      studentName: `${record.student.user.firstName} ${record.student.user.lastName}`,
      amountDue: record.balanceAmount,
      dueDate: record.dueDate,
      letterTitle: 'OVERDUE FEE PAYMENT NOTICE',
      letterBody: `Dear Parent, Please settle the outstanding fee balance of $${record.balanceAmount} for ${record.feeStructure.name} by ${record.dueDate.toISOString().split('T')[0]}.`,
      generatedAt: new Date(),
    };
  }
}
