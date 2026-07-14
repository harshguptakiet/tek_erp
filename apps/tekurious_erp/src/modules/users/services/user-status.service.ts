import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { EventBusService } from '../../../events/event-bus.service';

@Injectable()
export class UserStatusService {
  constructor(
    private prisma: PrismaService,
    private eventBus: EventBusService,
  ) {}

  // FR-USER-049: Get User Status History
  async getUserStatusHistory(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get status change history from audit logs
    const statusHistory = await this.prisma.auditLog.findMany({
      where: {
        tableName: 'User',
        recordId: userId,
        action: {
          in: ['ACTIVATE_USER', 'SUSPEND_USER', 'DEACTIVATE_USER'],
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      select: {
        id: true,
        action: true,
        changes: true,
        timestamp: true,
        userId: true,
      },
      take: 50,
    });

    return {
      currentStatus: user.status,
      history: statusHistory.map((log) => ({
        id: log.id,
        action: log.action,
        timestamp: log.timestamp,
        changedBy: {
          id: log.userId,
          name: 'System/Admin', // We don't have user relation in select
        },
        reason: (log.changes as any)?.reason,
        details: log.changes,
      })),
    };
  }

  // FR-USER-050: Bulk Status Change
  async bulkStatusChange(
    adminId: string,
    userIds: string[],
    newStatus: string,
    reason: string,
  ) {
    const validStatuses = [
      'ACTIVE',
      'INACTIVE',
      'SUSPENDED',
      'PENDING_VERIFICATION',
      'DELETED',
    ];

    if (!validStatuses.includes(newStatus)) {
      throw new BadRequestException('Invalid status');
    }

    const results = {
      successful: [],
      failed: [],
    };

    for (const userId of userIds) {
      try {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          results.failed.push({
            userId,
            reason: 'User not found',
          });
          continue;
        }

        await this.prisma.user.update({
          where: { id: userId },
          data: {
            status: newStatus as any,
          },
        });

        // Log action
        await this.prisma.auditLog.create({
          data: {
            userId: adminId,
            action: 'BULK_STATUS_CHANGE',
            tableName: 'User',
            recordId: userId,
            changes: {
              oldStatus: user.status,
              newStatus,
              reason,
            },
            timestamp: new Date(),
          },
        });

        // If suspended, logout all sessions
        if (newStatus === 'SUSPENDED') {
          await this.prisma.userSession.deleteMany({
            where: { userId },
          });
        }

        results.successful.push(userId);

        // Emit event
        await this.eventBus.publish('user.status.changed', {
          userId,
          oldStatus: user.status,
          newStatus,
          changedBy: adminId,
          reason,
        });
      } catch (error) {
        results.failed.push({
          userId,
          reason: error.message,
        });
      }
    }

    return {
      message: 'Bulk status change completed',
      results,
      summary: {
        total: userIds.length,
        successful: results.successful.length,
        failed: results.failed.length,
      },
    };
  }
}

class BadRequestException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BadRequestException';
  }
}
