import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { EventBusService } from '../../../events/event-bus.service';
import { BulkUserImportDto } from '../dto/bulk-operations.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BulkOperationsService {
  constructor(
    private prisma: PrismaService,
    private eventBus: EventBusService,
  ) {}

  // FR-USER-043: Bulk User Import
  async bulkImportUsers(
    adminId: string,
    importDto: BulkUserImportDto,
  ): Promise<{
    successful: any[];
    failed: any[];
    summary: { total: number; successful: number; failed: number };
  }> {
    const results = {
      successful: [],
      failed: [],
    };

    for (const userData of importDto.users) {
      try {
        // Check if email already exists
        const existingUser = await this.prisma.user.findUnique({
          where: { email: userData.email },
        });

        if (existingUser) {
          results.failed.push({
            email: userData.email,
            reason: 'Email already exists',
          });
          continue;
        }

        // Generate default password
        const defaultPassword = this.generateDefaultPassword();
        const passwordHash = await bcrypt.hash(defaultPassword, 10);

        // Create user
        const user = await this.prisma.user.create({
          data: {
            email: userData.email,
            phone: userData.phone,
            firstName: userData.firstName,
            lastName: userData.lastName,
            passwordHash,
            role: userData.role as any,
            status: 'ACTIVE',
          },
        });

        // Create profile based on role
        if (userData.role === 'STUDENT' && userData.admissionNumber) {
          await this.prisma.studentProfile.create({
            data: {
              userId: user.id,
              admissionNumber: userData.admissionNumber,
            },
          });
        } else if (userData.role === 'TEACHER' && userData.employeeId) {
          await this.prisma.teacherProfile.create({
            data: {
              userId: user.id,
              employeeId: userData.employeeId,
            },
          });
        }

        // Log action
        await this.prisma.auditLog.create({
          data: {
            userId: adminId,
            action: 'BULK_IMPORT_USER',
            tableName: 'User',
            recordId: user.id,
            changes: { email: userData.email, role: userData.role },
            timestamp: new Date(),
          },
        });

        results.successful.push({
          email: userData.email,
          userId: user.id,
          defaultPassword: importDto.sendWelcomeEmail ? '****' : defaultPassword,
        });

        // Emit event for welcome email
        if (importDto.sendWelcomeEmail) {
          await this.eventBus.publish('user.imported', {
            userId: user.id,
            email: userData.email,
            defaultPassword,
          });
        }
      } catch (error) {
        results.failed.push({
          email: userData.email,
          reason: error.message,
        });
      }
    }

    return {
      ...results,
      summary: {
        total: importDto.users.length,
        successful: results.successful.length,
        failed: results.failed.length,
      },
    };
  }

  // FR-USER-044: Bulk User Export
  async bulkExportUsers(
    adminId: string,
    filters?: {
      role?: string;
      status?: string;
      organizationId?: string;
    },
  ): Promise<any[]> {
    const where: any = {};

    if (filters?.role) {
      where.role = filters.role;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.organizationId) {
      where.tenantId = filters.organizationId;
    }

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        lastLogin: true,
      },
      take: 10000, // Max export limit
    });

    // Log action
    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'BULK_EXPORT_USERS',
        tableName: 'User',
        changes: { count: users.length, filters },
        timestamp: new Date(),
      },
    });

    return users;
  }

  // FR-USER-045: Bulk User Update
  async bulkUpdateUsers(
    adminId: string,
    userIds: string[],
    updates: {
      status?: string;
      role?: string;
    },
  ): Promise<{
    successful: string[];
    failed: any[];
    summary: { total: number; successful: number; failed: number };
  }> {
    const results = {
      successful: [],
      failed: [],
    };

    for (const userId of userIds) {
      try {
        await this.prisma.user.update({
          where: { id: userId },
          data: updates as any,
        });

        // Log action
        await this.prisma.auditLog.create({
          data: {
            userId: adminId,
            action: 'BULK_UPDATE_USER',
            tableName: 'User',
            recordId: userId,
            changes: updates,
            timestamp: new Date(),
          },
        });

        results.successful.push(userId);
      } catch (error) {
        results.failed.push({
          userId,
          reason: error.message,
        });
      }
    }

    return {
      ...results,
      summary: {
        total: userIds.length,
        successful: results.successful.length,
        failed: results.failed.length,
      },
    };
  }

  // Helper: Generate default password
  private generateDefaultPassword(): string {
    const chars =
      'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}
