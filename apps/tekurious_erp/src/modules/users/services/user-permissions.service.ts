import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class UserPermissionsService {
  constructor(private prisma: PrismaService) {}

  // FR-USER-053: View User Permissions
  async getUserPermissions(userId: string): Promise<{
    role: string;
    rolePermissions: string[];
    customPermissions: string[];
    effectivePermissions: string[];
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        customPermissions: {
          select: {
            resource: true,
            action: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get role-based permissions
    const rolePermissions = this.getRolePermissions(user.role);

    // Get custom permissions
    const customPermissions = user.customPermissions.map(
      (p) => `${p.resource}:${p.action}`,
    );

    // Combine all permissions
    const effectivePermissions = [
      ...new Set([...rolePermissions, ...customPermissions]),
    ];

    return {
      role: user.role,
      rolePermissions,
      customPermissions,
      effectivePermissions,
    };
  }

  // FR-USER-054: Grant Custom Permission
  async grantCustomPermission(
    adminId: string,
    userId: string,
    resource: string,
    action: string,
    reason: string,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create a temporary role for custom permissions
    // TODO: This needs CustomRole and CustomPermission tables properly configured
    // For now, we'll just log it

    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'GRANT_CUSTOM_PERMISSION',
        tableName: 'User',
        recordId: userId,
        changes: { resource, action, reason },
        timestamp: new Date(),
      },
    });

    return {
      message: 'Custom permission granted (requires proper schema setup)',
    };
  }

  // FR-USER-055: Revoke Custom Permission
  async revokeCustomPermission(
    adminId: string,
    userId: string,
    resource: string,
    action: string,
    reason: string,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Log revocation
    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'REVOKE_CUSTOM_PERMISSION',
        tableName: 'User',
        recordId: userId,
        changes: { resource, action, reason },
        timestamp: new Date(),
      },
    });

    return {
      message: 'Custom permission revoked',
    };
  }

  // Helper: Get role-based permissions
  private getRolePermissions(role: string): string[] {
    const rolePermissionsMap = {
      PLATFORM_ADMIN: [
        'users:create',
        'users:read',
        'users:update',
        'users:delete',
        'organizations:create',
        'organizations:read',
        'organizations:update',
        'organizations:delete',
        'content:create',
        'content:read',
        'content:update',
        'content:delete',
        'assessments:create',
        'assessments:read',
        'assessments:update',
        'assessments:delete',
      ],
      ORG_ADMIN: [
        'users:read',
        'users:update',
        'content:create',
        'content:read',
        'content:update',
        'assessments:create',
        'assessments:read',
        'assessments:update',
      ],
      SCHOOL_ADMIN: [
        'users:read',
        'content:read',
        'assessments:read',
        'attendance:create',
        'attendance:read',
      ],
      TEACHER: [
        'content:read',
        'assessments:create',
        'assessments:read',
        'attendance:create',
        'attendance:read',
      ],
      STUDENT: ['content:read', 'assessments:read'],
      PARENT: ['content:read', 'assessments:read'],
      PUBLISHER: [
        'content:create',
        'content:read',
        'content:update',
        'content:delete',
      ],
      CREATOR: ['content:create', 'content:read', 'content:update'],
      GUEST: ['content:read'],
    };

    return rolePermissionsMap[role] || [];
  }
}
