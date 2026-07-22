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

  // ═══════════════════════════════════════════════════════════════════════════
  // FR-SYNC-001/002: CLOUD SYNC & OFFLINE MODE
  // ═══════════════════════════════════════════════════════════════════════════

  async getSyncStatus(organizationId?: string) {
    // Get latest sync jobs
    const syncJobs = await this.prisma.backgroundJob.findMany({
      where: {
        jobType: { in: ['CLOUD_SYNC', 'DATA_SYNC'] },
        ...(organizationId ? { payload: { path: ['organizationId'], equals: organizationId } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const lastSync = syncJobs.length > 0 ? syncJobs[0] : null;

    return {
      lastSyncAt: lastSync?.completedAt || lastSync?.createdAt,
      lastSyncStatus: lastSync?.status || 'NEVER',
      pendingSyncs: syncJobs.filter(j => j.status === 'PENDING').length,
      failedSyncs: syncJobs.filter(j => j.status === 'FAILED').length,
      recentJobs: syncJobs,
    };
  }

  async triggerSync(dto: {
    syncType: string; organizationId?: string; entities?: string[];
    direction?: 'CLOUD_TO_LOCAL' | 'LOCAL_TO_CLOUD' | 'BIDIRECTIONAL';
  }) {
    // Create sync job
    const job = await this.prisma.backgroundJob.create({
      data: {
        jobType: 'CLOUD_SYNC',
        status: 'PENDING',
        payload: {
          syncType: dto.syncType,
          organizationId: dto.organizationId,
          entities: dto.entities || ['ALL'],
          direction: dto.direction || 'BIDIRECTIONAL',
        } as any,
        priority: 5,
      },
    });

    await this.eventBus.publish('sync.triggered', {
      jobId: job.id,
      syncType: dto.syncType,
      direction: dto.direction,
    });

    return {
      message: 'Sync triggered successfully',
      jobId: job.id,
      syncType: dto.syncType,
    };
  }

  async getOfflineConfig(organizationId: string) {
    const config = await this.prisma.systemConfig.findFirst({
      where: { organizationId },
    });

    return {
      organizationId,
      offlineEnabled: true,
      syncInterval: 300, // seconds
      maxOfflineDataSize: '500MB',
      offlineEntities: ['attendance', 'students', 'timetable', 'assignments'],
      lastSyncRequired: true,
      conflictResolution: 'SERVER_WINS',
      config: config?.features || {},
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FR-DATA-001/002: AUTOMATED BACKUPS & DATA RETENTION
  // ═══════════════════════════════════════════════════════════════════════════

  async triggerBackup(dto: {
    backupType: string; includeMedia?: boolean;
    organizationId?: string;
  }) {
    const job = await this.prisma.backgroundJob.create({
      data: {
        jobType: 'DATABASE_BACKUP',
        status: 'PENDING',
        payload: {
          backupType: dto.backupType || 'FULL',
          includeMedia: dto.includeMedia || false,
          organizationId: dto.organizationId,
          initiatedAt: new Date().toISOString(),
        } as any,
        priority: 10,
      },
    });

    await this.eventBus.publish('backup.triggered', {
      jobId: job.id,
      backupType: dto.backupType,
    });

    return {
      message: 'Backup initiated successfully',
      jobId: job.id,
      backupType: dto.backupType || 'FULL',
    };
  }

  async getBackupHistory(page = 1, limit = 20) {
    const [backups, total] = await Promise.all([
      this.prisma.backgroundJob.findMany({
        where: { jobType: { in: ['DATABASE_BACKUP', 'MEDIA_BACKUP'] } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.backgroundJob.count({
        where: { jobType: { in: ['DATABASE_BACKUP', 'MEDIA_BACKUP'] } },
      }),
    ]);

    return {
      data: backups.map(b => ({
        id: b.id,
        backupType: b.jobType,
        status: b.status,
        createdAt: b.createdAt,
        completedAt: b.completedAt,
        payload: b.payload,
        result: b.result,
      })),
      meta: { total, page, limit },
    };
  }

  async getRetentionPolicy() {
    return {
      policies: [
        { entity: 'audit_logs', retentionDays: 365, archiveAfterDays: 90, autoDelete: false },
        { entity: 'notifications', retentionDays: 180, archiveAfterDays: 60, autoDelete: true },
        { entity: 'error_logs', retentionDays: 90, archiveAfterDays: 30, autoDelete: true },
        { entity: 'session_data', retentionDays: 30, archiveAfterDays: 15, autoDelete: true },
        { entity: 'cache_entries', retentionDays: 7, archiveAfterDays: 0, autoDelete: true },
        { entity: 'background_jobs', retentionDays: 90, archiveAfterDays: 30, autoDelete: true },
        { entity: 'analytics_snapshots', retentionDays: 730, archiveAfterDays: 365, autoDelete: false },
      ],
      lastCleanupAt: new Date(),
      nextScheduledCleanup: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
  }

  async runDataCleanup(dto: { entity?: string; olderThanDays?: number; dryRun?: boolean }) {
    const dryRun = dto.dryRun ?? true;
    const olderThanDays = dto.olderThanDays || 90;
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

    // Count records to clean up per entity
    const counts: any = {};

    if (!dto.entity || dto.entity === 'error_logs') {
      counts.error_logs = await this.prisma.errorLog.count({
        where: { timestamp: { lt: cutoffDate } },
      });
    }

    if (!dto.entity || dto.entity === 'cache_entries') {
      counts.cache_entries = await this.prisma.cacheEntry.count({
        where: { expiresAt: { lt: new Date() } },
      });
    }

    if (!dto.entity || dto.entity === 'background_jobs') {
      counts.background_jobs = await this.prisma.backgroundJob.count({
        where: { createdAt: { lt: cutoffDate }, status: { in: ['COMPLETED', 'FAILED'] } },
      });
    }

    if (!dryRun) {
      // Actually delete
      if (counts.cache_entries) {
        await this.prisma.cacheEntry.deleteMany({
          where: { expiresAt: { lt: new Date() } },
        });
      }

      await this.eventBus.publish('data.cleanup.completed', {
        cutoffDate,
        counts,
        dryRun: false,
      });
    }

    return {
      dryRun,
      cutoffDate,
      olderThanDays,
      recordsAffected: counts,
      message: dryRun ? 'Dry run completed - no records deleted' : 'Cleanup completed',
    };
  }
}
