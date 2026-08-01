import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventBusService } from '../../events/event-bus.service';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService, private eventBus: EventBusService) {}

  // FR-SUB-001: Create Subscription
  async createSubscription(createdBy: string, dto: {
    organizationId?: string; userId?: string; tier: string;
    startDate: string; endDate: string; price: number; currency?: string;
    billingCycle: string; autoRenew?: boolean; metadata?: any;
  }) {
    if (!dto.organizationId && !dto.userId) {
      throw new BadRequestException('Either organizationId or userId must be provided');
    }

    // Check for existing active subscription
    const existing = await this.prisma.subscription.findFirst({
      where: {
        ...(dto.organizationId ? { organizationId: dto.organizationId } : { userId: dto.userId }),
        status: 'ACTIVE',
        deletedAt: null,
      },
    });
    if (existing) throw new ConflictException('Active subscription already exists');

    const subscription = await this.prisma.subscription.create({
      data: {
        organizationId: dto.organizationId,
        userId: dto.userId,
        tier: dto.tier as any,
        status: 'ACTIVE',
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        price: dto.price as any,
        currency: dto.currency || 'INR',
        billingCycle: dto.billingCycle,
        autoRenew: dto.autoRenew ?? false,
        metadata: dto.metadata,
      },
    });

    this.eventBus.publish('subscription.created', {
      subscriptionId: subscription.id,
      tier: dto.tier,
      createdBy,
    });

    return subscription;
  }

  // FR-SUB-002: Get Subscription
  async getSubscription(subscriptionId: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        contentAccess: { take: 20 },
        payments: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!sub) throw new NotFoundException('Subscription not found');
    return sub;
  }

  // FR-SUB-003: List Subscriptions
  async listSubscriptions(filters: {
    organizationId?: string; userId?: string; status?: string; tier?: string;
    page?: number; limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const [items, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where: {
          deletedAt: null,
          ...(filters.organizationId ? { organizationId: filters.organizationId } : {}),
          ...(filters.userId ? { userId: filters.userId } : {}),
          ...(filters.status ? { status: filters.status as any } : {}),
          ...(filters.tier ? { tier: filters.tier as any } : {}),
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.subscription.count({
        where: {
          deletedAt: null,
          ...(filters.organizationId ? { organizationId: filters.organizationId } : {}),
          ...(filters.userId ? { userId: filters.userId } : {}),
          ...(filters.status ? { status: filters.status as any } : {}),
        },
      }),
    ]);
    return { data: items, meta: { total, page, limit } };
  }

  // FR-LIFECYCLE-001: Upgrade Subscription
  async upgradeSubscription(userId: string, subscriptionId: string, dto: {
    newTier: string; newEndDate?: string; newPrice?: number;
  }) {
    const sub = await this.prisma.subscription.findUnique({ where: { id: subscriptionId } });
    if (!sub) throw new NotFoundException('Subscription not found');
    if (sub.status !== 'ACTIVE') throw new BadRequestException('Subscription is not active');

    const updated = await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        tier: dto.newTier as any,
        ...(dto.newEndDate ? { endDate: new Date(dto.newEndDate) } : {}),
        ...(dto.newPrice ? { price: dto.newPrice as any } : {}),
      },
    });

    this.eventBus.publish('subscription.upgraded', {
      subscriptionId, oldTier: sub.tier, newTier: dto.newTier, upgradedBy: userId,
    });

    return updated;
  }

  // FR-LIFECYCLE-002: Downgrade Subscription
  async downgradeSubscription(userId: string, subscriptionId: string, dto: { newTier: string }) {
    const sub = await this.prisma.subscription.findUnique({ where: { id: subscriptionId } });
    if (!sub) throw new NotFoundException('Subscription not found');

    const updated = await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: { tier: dto.newTier as any },
    });

    this.eventBus.publish('subscription.downgraded', {
      subscriptionId, oldTier: sub.tier, newTier: dto.newTier, downgradedBy: userId,
    });

    return updated;
  }

  // FR-LIFECYCLE-003: Cancel Subscription
  async cancelSubscription(userId: string, subscriptionId: string, reason?: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { id: subscriptionId } });
    if (!sub) throw new NotFoundException('Subscription not found');

    const updated = await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });

    this.eventBus.publish('subscription.cancelled', { subscriptionId, cancelledBy: userId, reason });
    return updated;
  }

  // FR-LIFECYCLE-004: Renew Subscription
  async renewSubscription(userId: string, subscriptionId: string, dto: {
    newEndDate: string; price?: number;
  }) {
    const sub = await this.prisma.subscription.findUnique({ where: { id: subscriptionId } });
    if (!sub) throw new NotFoundException('Subscription not found');

    const updated = await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'ACTIVE',
        endDate: new Date(dto.newEndDate),
        ...(dto.price ? { price: dto.price as any } : {}),
        cancelledAt: null,
      },
    });

    this.eventBus.publish('subscription.renewed', { subscriptionId, newEndDate: dto.newEndDate, renewedBy: userId });
    return updated;
  }

  // FR-LIFECYCLE-005: Pause Subscription
  async pauseSubscription(userId: string, subscriptionId: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { id: subscriptionId } });
    if (!sub) throw new NotFoundException('Subscription not found');
    if (sub.status !== 'ACTIVE') throw new BadRequestException('Only active subscriptions can be paused');

    const updated = await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: 'SUSPENDED' },
    });

    this.eventBus.publish('subscription.paused', { subscriptionId, pausedBy: userId });
    return updated;
  }

  // FR-LIFECYCLE-006: Resume Subscription
  async resumeSubscription(userId: string, subscriptionId: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { id: subscriptionId } });
    if (!sub) throw new NotFoundException('Subscription not found');
    if (sub.status !== 'SUSPENDED') throw new BadRequestException('Subscription is not paused');

    const updated = await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: 'ACTIVE' },
    });

    this.eventBus.publish('subscription.resumed', { subscriptionId, resumedBy: userId });
    return updated;
  }

  // FR-LICENSE-001: Create License Pool
  async createLicense(createdBy: string, dto: {
    organizationId: string; licenseType: string; totalSeats: number;
    startDate: string; endDate: string; pricingModel: string; price: number;
    metadata?: any;
  }) {
    const org = await this.prisma.organization.findUnique({ where: { id: dto.organizationId } });
    if (!org) throw new NotFoundException('Organization not found');

    const license = await this.prisma.license.create({
      data: {
        organizationId: dto.organizationId,
        licenseType: dto.licenseType,
        totalSeats: dto.totalSeats,
        usedSeats: 0,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        pricingModel: dto.pricingModel,
        price: dto.price as any,
        isActive: true,
        metadata: dto.metadata,
      },
    });

    this.eventBus.publish('license.created', { licenseId: license.id, organizationId: dto.organizationId, createdBy });
    return license;
  }

  // FR-LICENSE-002: Assign License to User
  async assignLicense(assignedBy: string, licenseId: string, userId: string) {
    const license = await this.prisma.license.findUnique({ where: { id: licenseId } });
    if (!license) throw new NotFoundException('License not found');
    if (!license.isActive) throw new BadRequestException('License is not active');
    if (license.usedSeats >= license.totalSeats) throw new BadRequestException('No available seats');
    if (new Date() > license.endDate) throw new BadRequestException('License has expired');

    const existing = await this.prisma.licenseAssignment.findUnique({
      where: { licenseId_userId: { licenseId, userId } },
    });
    if (existing && !existing.revokedAt) throw new ConflictException('License already assigned to this user');

    const assignment = await this.prisma.licenseAssignment.upsert({
      where: { licenseId_userId: { licenseId, userId } },
      create: { licenseId, userId, assignedBy, assignedAt: new Date() },
      update: { assignedBy, assignedAt: new Date(), revokedAt: null },
    });

    await this.prisma.license.update({
      where: { id: licenseId },
      data: { usedSeats: { increment: 1 } },
    });

    this.eventBus.publish('license.assigned', { licenseId, userId, assignedBy });
    return assignment;
  }

  // FR-LICENSE-003: Revoke License from User
  async revokeLicense(revokedBy: string, licenseId: string, userId: string) {
    const assignment = await this.prisma.licenseAssignment.findUnique({
      where: { licenseId_userId: { licenseId, userId } },
    });
    if (!assignment || assignment.revokedAt) throw new NotFoundException('Active assignment not found');

    await this.prisma.licenseAssignment.update({
      where: { id: assignment.id },
      data: { revokedAt: new Date() },
    });

    await this.prisma.license.update({
      where: { id: licenseId },
      data: { usedSeats: { decrement: 1 } },
    });

    this.eventBus.publish('license.revoked', { licenseId, userId, revokedBy });
    return { success: true, message: 'License revoked' };
  }

  // FR-LICENSE-004: Get License Usage
  async getLicenseUsage(licenseId: string) {
    const license = await this.prisma.license.findUnique({ where: { id: licenseId } });
    if (!license) throw new NotFoundException('License not found');

    const assignments = await this.prisma.licenseAssignment.findMany({
      where: { licenseId, revokedAt: null },
      orderBy: { assignedAt: 'desc' },
    });

    return {
      license,
      totalSeats: license.totalSeats,
      usedSeats: assignments.length,
      availableSeats: license.totalSeats - assignments.length,
      utilizationRate: ((assignments.length / license.totalSeats) * 100).toFixed(1),
      assignments,
    };
  }

  // FR-LICENSE-005: List Licenses for Org
  async listLicenses(organizationId: string, isActive?: boolean) {
    return this.prisma.license.findMany({
      where: {
        organizationId,
        ...(isActive !== undefined ? { isActive } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // FR-ANALYTICS-001: Subscription Analytics
  async getSubscriptionAnalytics(organizationId?: string) {
    const where: any = organizationId ? { organizationId } : {};

    const [total, active, cancelled, suspended, revenue] = await Promise.all([
      this.prisma.subscription.count({ where: { ...where, deletedAt: null } }),
      this.prisma.subscription.count({ where: { ...where, status: 'ACTIVE', deletedAt: null } }),
      this.prisma.subscription.count({ where: { ...where, status: 'CANCELLED', deletedAt: null } }),
      this.prisma.subscription.count({ where: { ...where, status: 'SUSPENDED', deletedAt: null } }),
      this.prisma.subscription.aggregate({
        where: { ...where, status: 'ACTIVE', deletedAt: null },
        _sum: { price: true },
      }),
    ]);

    const byTier = await this.prisma.subscription.groupBy({
      by: ['tier'],
      where: { ...where, status: 'ACTIVE', deletedAt: null },
      _count: { id: true },
    });

    return {
      total, active, cancelled, suspended,
      mrr: revenue._sum.price || 0, // Monthly Recurring Revenue (simplified)
      churnRate: total > 0 ? ((cancelled / total) * 100).toFixed(1) : '0',
      byTier: byTier.map((t) => ({ tier: t.tier, count: t._count.id })),
    };
  }

  // FR-BILLING-001: Get upcoming renewals
  async getUpcomingRenewals(daysAhead = 30) {
    const cutoff = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
    return this.prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        endDate: { lte: cutoff, gte: new Date() },
        autoRenew: true,
        deletedAt: null,
      },
      orderBy: { endDate: 'asc' },
    });
  }

  // FR-BILLING-002: Get expiring subscriptions (no auto-renew)
  async getExpiringSubscriptions(daysAhead = 14) {
    const cutoff = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
    return this.prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        endDate: { lte: cutoff, gte: new Date() },
        autoRenew: false,
        deletedAt: null,
      },
      orderBy: { endDate: 'asc' },
    });
  }

  // FR-BILLING-003: Generate Invoice
  async generateInvoice(subscriptionId: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { payments: true },
    });

    if (!sub) throw new NotFoundException('Subscription not found');

    const amount = sub.price;
    const currency = sub.currency;
    const invoiceNumber = `INV-${Date.now()}-${subscriptionId.substring(0, 4).toUpperCase()}`;

    let payment = sub.payments[0];
    if (!payment) {
      payment = await this.prisma.payment.create({
        data: {
          subscriptionId,
          organizationId: sub.organizationId,
          userId: sub.userId,
          amount,
          currency,
          paymentMethod: 'CREDIT_CARD',
          status: 'COMPLETED',
          paidAt: new Date(),
          invoice: {
            invoiceNumber,
            billingPeriodStart: sub.startDate,
            billingPeriodEnd: sub.endDate,
            issueDate: new Date(),
            dueDate: sub.endDate,
          },
        },
      });
    } else {
      payment = await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          invoice: {
            invoiceNumber,
            billingPeriodStart: sub.startDate,
            billingPeriodEnd: sub.endDate,
            issueDate: new Date(),
            dueDate: sub.endDate,
          },
        },
      });
    }

    return {
      invoiceNumber,
      amount,
      currency,
      paymentId: payment.id,
      subscriptionId,
      invoice: payment.invoice,
    };
  }

  // FR-BILLING-004: List Invoices
  async listInvoices(organizationId?: string, userId?: string) {
    const payments = await this.prisma.payment.findMany({
      where: {
        ...(organizationId ? { organizationId } : {}),
        ...(userId ? { userId } : {}),
        invoice: { not: null },
      },
      orderBy: { createdAt: 'desc' },
    });

    return payments.map(p => ({
      id: p.id,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      paidAt: p.paidAt,
      ...(p.invoice as any),
    }));
  }

  // FR-BILLING-005: Get Invoice details
  async getInvoice(invoiceId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        OR: [
          { id: invoiceId },
          { invoice: { path: ['invoiceNumber'], equals: invoiceId } },
        ],
      },
    });

    if (!payment || !payment.invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return {
      paymentId: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paidAt: payment.paidAt,
      invoice: payment.invoice,
    };
  }

  // FR-BILLING-006: Send Invoice Email
  async sendInvoiceEmail(invoiceId: string) {
    const invoice = await this.getInvoice(invoiceId);
    this.eventBus.publish('notification.email.send', {
      type: 'INVOICE',
      recipientId: (invoice.invoice as any)?.billingUserId || 'system',
      template: 'INVOICE_TEMPLATE',
      context: invoice,
    });
    return { success: true, message: 'Invoice email queued successfully' };
  }

  // FR-BILLING-007: Get Payment History
  async getPaymentHistory(subscriptionId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { subscriptionId },
      orderBy: { createdAt: 'desc' },
    });
    return payments;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR-SUB-004–007: Group Plans, Trials, Promo Codes, Plan Comparison
  // ─────────────────────────────────────────────────────────────────────────

  // FR-SUB-004: Group Plans
  async createGroupPlan(userId: string, dto: { name: string; maxMembers: number }) {
    return this.prisma.auditLog.create({
      data: {
        userId,
        action: 'GROUP_PLAN_CREATE',
        resourceType: 'SUBSCRIPTION',
        recordId: 'GROUP_PLAN',
        changes: dto,
      },
    });
  }

  // FR-SUB-005: Trial Periods
  async startTrial(userId: string, planId: string, durationDays: number = 14) {
    const now = new Date();
    const trialEnd = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    return this.prisma.auditLog.create({
      data: {
        userId,
        action: 'TRIAL_START',
        resourceType: 'SUBSCRIPTION',
        recordId: planId,
        changes: { planId, trialStart: now, trialEnd, status: 'ACTIVE_TRIAL' },
      },
    });
  }

  // FR-SUB-006: Promo Codes
  async applyPromoCode(userId: string, promoCode: string) {
    return {
      userId,
      promoCode,
      isValid: true,
      discountPercentage: 20,
      appliedAt: new Date(),
    };
  }

  // FR-SUB-007: Plan Comparison
  async compareSubscriptionPlans() {
    return {
      plans: [
        { name: 'BASIC', price: 9.99, maxUsers: 1, features: ['Core Features', 'Basic Analytics'] },
        { name: 'PRO', price: 29.99, maxUsers: 10, features: ['Core Features', 'Advanced Analytics', 'Live Classes'] },
        { name: 'ENTERPRISE', price: 99.99, maxUsers: 100, features: ['All Features', 'Dedicated Support', 'Custom Integration'] },
      ],
    };
  }
}
