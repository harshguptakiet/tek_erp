import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventBusService } from '../../events/event-bus.service';

@Injectable()
export class SyncService {
  constructor(
    private prisma: PrismaService,
    private eventBus: EventBusService,
  ) {}

  // FR-SYNC-001: Manual Sync Trigger
  async triggerManualSync(
    userId: string,
    organizationId: string,
    syncType: string,
    entityTypes: string[],
  ) {
    // Create sync history record
    const syncHistory = await this.prisma.syncHistory.create({
      data: {
        integrationId: `manual-${userId}`,
        externalSystem: 'MANUAL_TRIGGER',
        syncType,
        entityType: entityTypes.join(','),
        status: 'PENDING',
        startedAt: new Date(),
      },
    });

    // Create sync log
    await this.prisma.syncLog.create({
      data: {
        organizationId,
        syncType,
        dataType: entityTypes[0],
        status: 'PENDING',
      },
    });

    // Emit sync event for processing
    this.eventBus.publish('sync.manual.triggered', {
      syncHistoryId: syncHistory.id,
      organizationId,
      userId,
      syncType,
      entityTypes,
      timestamp: new Date(),
    });

    return {
      success: true,
      syncId: syncHistory.id,
      message: 'Manual sync initiated successfully',
      status: 'PENDING',
      entityTypes,
    };
  }

  // FR-SYNC-002: Sync Status Monitoring
  async getSyncStatus(syncId: string) {
    const syncHistory = await this.prisma.syncHistory.findUnique({
      where: { id: syncId },
    });

    if (!syncHistory) {
      throw new NotFoundException('Sync record not found');
    }

    const failures = await this.prisma.syncFailure.findMany({
      where: { syncHistoryId: syncId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      syncId: syncHistory.id,
      syncType: syncHistory.syncType,
      entityType: syncHistory.entityType,
      status: syncHistory.status,
      startedAt: syncHistory.startedAt,
      completedAt: syncHistory.completedAt,
      recordsProcessed: syncHistory.recordsProcessed,
      recordsSucceeded: syncHistory.recordsSuccess,
      recordsFailed: syncHistory.recordsFailed,
      failures: failures.map((f) => ({
        id: f.id,
        entityId: f.entityId,
        errorMessage: f.errorMessage,
        createdAt: f.createdAt,
      })),
      progress:
        syncHistory.recordsProcessed && syncHistory.recordsProcessed > 0
          ? ((syncHistory.recordsSuccess || 0) / syncHistory.recordsProcessed * 100).toFixed(1) + '%'
          : '0%',
    };
  }

  // Get sync history for organization
  async getSyncHistory(
    organizationId: string,
    page = 1,
    limit = 20,
    dataType?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = { organizationId };
    if (dataType) where.dataType = dataType;

    const [logs, total] = await Promise.all([
      this.prisma.syncLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startedAt: 'desc' },
      }),
      this.prisma.syncLog.count({ where }),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get recent sync failures
  async getSyncFailures(organizationId: string, limit = 50) {
    const recentSyncs = await this.prisma.syncHistory.findMany({
      where: {
        status: { in: ['FAILED'] },
      },
      orderBy: { startedAt: 'desc' },
      take: 20,
      select: { id: true, syncType: true, entityType: true, startedAt: true },
    });

    const syncIds = recentSyncs.map((s) => s.id);

    const failures = await this.prisma.syncFailure.findMany({
      where: {
        syncHistoryId: { in: syncIds },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return {
      failures: failures.map((f) => {
        const sync = recentSyncs.find((s) => s.id === f.syncHistoryId);
        return {
          id: f.id,
          syncType: sync?.syncType || 'UNKNOWN',
          entityType: f.entityType,
          entityId: f.entityId,
          errorMessage: f.errorMessage,
          createdAt: f.createdAt,
          syncStartedAt: sync?.startedAt,
        };
      }),
      total: failures.length,
    };
  }

  // Retry failed sync
  async retryFailedSync(userId: string, syncId: string) {
    const sync = await this.prisma.syncHistory.findUnique({
      where: { id: syncId },
    });

    if (!sync) {
      throw new NotFoundException('Sync record not found');
    }

    if (sync.status !== 'FAILED') {
      throw new BadRequestException('Can only retry failed syncs');
    }

    // Create new sync record
    const newSync = await this.prisma.syncHistory.create({
      data: {
        integrationId: `retry-${userId}`,
        externalSystem: sync.externalSystem,
        syncType: sync.syncType,
        entityType: sync.entityType,
        status: 'PENDING',
        startedAt: new Date(),
      },
    });

    // Emit retry event
    this.eventBus.publish('sync.retry.triggered', {
      originalSyncId: syncId,
      newSyncId: newSync.id,
      userId,
      timestamp: new Date(),
    });

    return {
      success: true,
      newSyncId: newSync.id,
      message: 'Sync retry initiated',
    };
  }
}
