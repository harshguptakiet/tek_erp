import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventBusService } from '../../events/event-bus.service';

@Injectable()
export class SystemService {
  constructor(private prisma: PrismaService, private eventBus: EventBusService) {}

  // FR-SYS-001: Job Queue Management
  async createJob(dto: {
    jobType: string; payload?: any; priority?: number;
    scheduledAt?: string; maxAttempts?: number;
  }) {
    return this.prisma.backgroundJob.create({
      data: {
        jobType: dto.jobType,
        payload: dto.payload,
        priority: dto.priority || 5,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        maxAttempts: dto.maxAttempts || 3,
        status: 'PENDING',
      },
    });
  }

  async listJobs(filters: { status?: string; jobType?: string; page?: number; limit?: number }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    return this.prisma.backgroundJob.findMany({
      where: {
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.jobType ? { jobType: filters.jobType } : {}),
      },
      orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async getJob(jobId: string) {
    const job = await this.prisma.backgroundJob.findUnique({ where: { id: jobId }, include: { executions: true } });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async updateJobStatus(jobId: string, status: string, result?: any, error?: string) {
    return this.prisma.backgroundJob.update({
      where: { id: jobId },
      data: {
        status,
        ...(result ? { result } : {}),
        ...(error ? { lastError: error } : {}),
        ...(status === 'PROCESSING' ? { startedAt: new Date(), attempts: { increment: 1 } } : {}),
        ...(status === 'COMPLETED' ? { completedAt: new Date() } : {}),
      },
    });
  }

  async getDeadLetterJobs() {
    return this.prisma.backgroundJob.findMany({
      where: { isDeadLetter: true },
      orderBy: { deadLetterAt: 'desc' },
      take: 50,
    });
  }

  async retryJob(jobId: string) {
    const job = await this.prisma.backgroundJob.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');
    return this.prisma.backgroundJob.update({
      where: { id: jobId },
      data: { status: 'PENDING', isDeadLetter: false, deadLetterAt: null, nextRetryAt: null },
    });
  }

  // FR-CACHE-001–002: Cache Management
  async getCache(key: string) {
    const entry = await this.prisma.cacheEntry.findUnique({ where: { key } });
    if (!entry) return null;
    if (entry.expiresAt && new Date() > entry.expiresAt) {
      await this.prisma.cacheEntry.delete({ where: { key } });
      return null;
    }
    return entry;
  }

  async setCache(key: string, value: string, ttlSeconds?: number, tags?: string[]) {
    const expiresAt = ttlSeconds ? new Date(Date.now() + ttlSeconds * 1000) : null;
    return this.prisma.cacheEntry.upsert({
      where: { key },
      create: { key, value, ttl: ttlSeconds, expiresAt, tags: tags || [] },
      update: { value, ttl: ttlSeconds, expiresAt, tags: tags || [] },
    });
  }

  async invalidateCache(tags: string[]) {
    const result = await this.prisma.cacheEntry.deleteMany({
      where: { tags: { hasSome: tags } },
    });
    return { deleted: result.count, tags };
  }

  async clearExpiredCache() {
    const result = await this.prisma.cacheEntry.deleteMany({
      where: { expiresAt: { lte: new Date() } },
    });
    return { cleared: result.count };
  }

  // FR-AUDIT-001: Audit Trail
  async getAuditLogs(filters: {
    userId?: string; action?: string; tableName?: string;
    organizationId?: string; startDate?: string; endDate?: string;
    page?: number; limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const where: any = {
      ...(filters.userId ? { userId: filters.userId } : {}),
      ...(filters.action ? { action: { contains: filters.action, mode: 'insensitive' } } : {}),
      ...(filters.tableName ? { tableName: filters.tableName } : {}),
      ...(filters.organizationId ? { organizationId: filters.organizationId } : {}),
      ...(filters.startDate || filters.endDate
        ? {
            timestamp: {
              ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
              ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data: items, meta: { total, page, limit } };
  }

  // FR-ERROR-001: Error Logging
  async getErrorLogs(filters: { level?: string; page?: number; limit?: number }) {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    return this.prisma.errorLog.findMany({
      where: filters.level ? { errorType: filters.level } : {},   // schema uses errorType
      orderBy: { timestamp: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async logError(dto: {
    level: string; message: string; stack?: string;
    context?: any; userId?: string;
  }) {
    return this.prisma.errorLog.create({
      data: {
        errorType: dto.level,          // schema uses errorType
        errorMessage: dto.message,     // schema uses errorMessage
        stackTrace: dto.stack,         // schema uses stackTrace
        requestBody: dto.context,      // reuse requestBody for context
        userId: dto.userId,
        timestamp: new Date(),
      },
    });
  }

  // FR-ERROR-002: System Health
  async getSystemHealth() {
    const [
      dbCheck,
      totalUsers,
      activeJobs,
      failedJobs,
      totalNotifications,
    ] = await Promise.all([
      this.prisma.$queryRaw`SELECT 1 as db_ok`.then(() => true).catch(() => false),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.backgroundJob.count({ where: { status: 'PROCESSING' } }),
      this.prisma.backgroundJob.count({ where: { status: 'FAILED' } }),
      this.prisma.notification.count(),
    ]);

    return {
      status: dbCheck ? 'healthy' : 'degraded',
      timestamp: new Date(),
      services: {
        database: dbCheck ? 'up' : 'down',
        api: 'up',
      },
      metrics: {
        activeUsers: totalUsers,
        activeJobs,
        failedJobs,
        totalNotifications,
      },
    };
  }

  // FR-CACHE-001: System Config
  async getSystemConfig(organizationId?: string) {
    return this.prisma.systemConfig.findFirst({
      where: organizationId ? { organizationId } : {},
    });
  }

  async updateSystemConfig(dto: {
    organizationId?: string; primaryColor?: string; secondaryColor?: string;
    companyName?: string; tagline?: string; maintenanceMode?: boolean;
    features?: any; smtpConfig?: any;
  }) {
    const existing = await this.prisma.systemConfig.findFirst({
      where: dto.organizationId ? { organizationId: dto.organizationId } : {},
    });

    const data: any = {
      ...(dto.primaryColor ? { primaryColor: dto.primaryColor } : {}),
      ...(dto.secondaryColor ? { secondaryColor: dto.secondaryColor } : {}),
      ...(dto.companyName ? { companyName: dto.companyName } : {}),
      ...(dto.tagline ? { tagline: dto.tagline } : {}),
      ...(dto.maintenanceMode !== undefined ? { maintenanceMode: dto.maintenanceMode } : {}),
      ...(dto.features ? { features: dto.features } : {}),
      ...(dto.smtpConfig ? { smtpConfig: dto.smtpConfig } : {}),
    };

    return existing
      ? this.prisma.systemConfig.update({ where: { id: existing.id }, data })
      : this.prisma.systemConfig.create({ data: { ...data, organizationId: dto.organizationId } });
  }

  // FR-SYS-001: Feature Flags
  async getFeatureFlags() {
    return this.prisma.featureFlag.findMany({ orderBy: { flagName: 'asc' } });
  }

  async getFeatureFlag(flagName: string) {
    return this.prisma.featureFlag.findUnique({ where: { flagName } });
  }

  async setFeatureFlag(flagName: string, isEnabled: boolean, enabledFor?: string[]) {
    return this.prisma.featureFlag.upsert({
      where: { flagName },
      create: { flagName, isEnabled, enabledFor: enabledFor || [] },
      update: { isEnabled, ...(enabledFor ? { enabledFor } : {}) },
    });
  }

  async isFeatureEnabled(flagName: string, userId?: string): Promise<boolean> {
    const flag = await this.prisma.featureFlag.findUnique({ where: { flagName } });
    if (!flag) return false;
    if (!flag.isEnabled) return false;
    if (userId && flag.enabledFor.length > 0) {
      return flag.enabledFor.includes(userId);
    }
    return flag.isEnabled;
  }
}
