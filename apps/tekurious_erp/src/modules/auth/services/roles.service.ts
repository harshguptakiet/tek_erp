/**
 * Roles Service
 * FR-AUTH-021: Custom roles management for B2B organizations
 */

import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { EventBusService } from '../../../events/event-bus.service';
import { CreateCustomRoleDto, UpdateCustomRoleDto, CustomRoleResponseDto } from '../dto/custom-role.dto';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);
  private readonly MAX_CUSTOM_ROLES_PER_ORG = 20;

  constructor(
    private prisma: PrismaService,
    private eventBus: EventBusService,
  ) {}

  /**
   * Create a new custom role for an organization
   * FR-AUTH-021: Custom roles for B2B organizations
   */
  async createCustomRole(dto: CreateCustomRoleDto, createdBy: string): Promise<CustomRoleResponseDto> {
    this.logger.log(`Creating custom role: ${dto.name} for org: ${dto.organizationId}`);

    // Check organization exists
    const org = await this.prisma.organization.findUnique({
      where: { id: dto.organizationId },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    // Check role count limit
    const existingRolesCount = await this.prisma.role.count({
      where: {
        organizationId: dto.organizationId,
        isSystemRole: false,
      },
    });

    if (existingRolesCount >= this.MAX_CUSTOM_ROLES_PER_ORG) {
      throw new BadRequestException(`Maximum ${this.MAX_CUSTOM_ROLES_PER_ORG} custom roles per organization exceeded`);
    }

    // Check name uniqueness within organization
    const existingRole = await this.prisma.role.findFirst({
      where: {
        name: dto.name,
        organizationId: dto.organizationId,
      },
    });

    if (existingRole) {
      throw new BadRequestException('A role with this name already exists in your organization');
    }

    // Create role with display name matching name
    const role = await this.prisma.role.create({
      data: {
        name: dto.name,
        displayName: dto.name,
        description: dto.description,
        organizationId: dto.organizationId,
        isSystemRole: false,
        isActive: true,
      },
    });

    // Create or link permissions
    // For now, we'll create simple permission records with the provided permission strings
    for (const permissionName of dto.permissions) {
      // Check if permission exists, if not create it
      let permission = await this.prisma.permission.findUnique({
        where: { name: permissionName },
      });

      if (!permission) {
        // Extract resource and action from permission name (e.g., "fees:create" -> resource: "fees", action: "create")
        const [resource, action] = permissionName.split(':');
        permission = await this.prisma.permission.create({
          data: {
            name: permissionName,
            displayName: permissionName,
            description: `${action} permission for ${resource}`,
            resource: resource || 'general',
            action: action || 'access',
            scope: 'ORGANIZATION',
            isSystemPermission: false,
            isActive: true,
          },
        });
      }

      // Link permission to role
      await this.prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId: permission.id,
          grantedBy: createdBy,
        },
      });
    }

    // Emit event
    await this.eventBus.publish('role.created', {
      roleId: role.id,
      roleName: role.name,
      organizationId: dto.organizationId,
      createdBy,
      timestamp: new Date(),
    });

    this.logger.log(`Custom role created: ${role.id}`);

    // Fetch the role with permissions
    const roleWithPermissions = await this.prisma.role.findUnique({
      where: { id: role.id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: { userRoles: true },
        },
      },
    });

    return this.mapToResponseDto(roleWithPermissions, roleWithPermissions._count.userRoles);
  }

  /**
   * Update existing custom role
   */
  async updateCustomRole(roleId: string, dto: UpdateCustomRoleDto, updatedBy: string): Promise<CustomRoleResponseDto> {
    this.logger.log(`Updating custom role: ${roleId}`);

    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystemRole) {
      throw new ForbiddenException('Cannot modify system roles');
    }

    // If name is being updated, check uniqueness
    if (dto.name && dto.name !== role.name) {
      const existingRole = await this.prisma.role.findFirst({
        where: {
          name: dto.name,
          organizationId: role.organizationId,
          id: { not: roleId },
        },
      });

      if (existingRole) {
        throw new BadRequestException('A role with this name already exists in your organization');
      }
    }

    // Update role basic info
    const updatedRole = await this.prisma.role.update({
      where: { id: roleId },
      data: {
        name: dto.name,
        displayName: dto.name || role.displayName,
        description: dto.description,
        isActive: dto.isActive,
        updatedAt: new Date(),
      },
    });

    // Update permissions if provided
    if (dto.permissions) {
      // Remove existing permissions
      await this.prisma.rolePermission.deleteMany({
        where: { roleId },
      });

      // Add new permissions
      for (const permissionName of dto.permissions) {
        let permission = await this.prisma.permission.findUnique({
          where: { name: permissionName },
        });

        if (!permission) {
          const [resource, action] = permissionName.split(':');
          permission = await this.prisma.permission.create({
            data: {
              name: permissionName,
              displayName: permissionName,
              description: `${action} permission for ${resource}`,
              resource: resource || 'general',
              action: action || 'access',
              scope: 'ORGANIZATION',
              isSystemPermission: false,
              isActive: true,
            },
          });
        }

        await this.prisma.rolePermission.create({
          data: {
            roleId: updatedRole.id,
            permissionId: permission.id,
            grantedBy: updatedBy,
          },
        });
      }
    }

    // Emit event
    await this.eventBus.publish('role.updated', {
      roleId: updatedRole.id,
      roleName: updatedRole.name,
      organizationId: role.organizationId,
      updatedBy,
      timestamp: new Date(),
    });

    this.logger.log(`Custom role updated: ${roleId}`);

    // Fetch updated role with permissions
    const roleWithPermissions = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: { userRoles: true },
        },
      },
    });

    return this.mapToResponseDto(roleWithPermissions, roleWithPermissions._count.userRoles);
  }

  /**
   * Delete custom role
   * Users with this role must be reassigned first
   */
  async deleteCustomRole(roleId: string, deletedBy: string): Promise<{ message: string }> {
    this.logger.log(`Deleting custom role: ${roleId}`);

    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        _count: {
          select: { userRoles: true },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystemRole) {
      throw new ForbiddenException('Cannot delete system roles');
    }

    // Check if users are assigned to this role
    if (role._count.userRoles > 0) {
      throw new BadRequestException(
        `Cannot delete role. ${role._count.userRoles} user(s) are currently assigned to this role. Please reassign them first.`
      );
    }

    // Delete role
    await this.prisma.role.delete({
      where: { id: roleId },
    });

    // Emit event
    await this.eventBus.publish('role.deleted', {
      roleId,
      roleName: role.name,
      organizationId: role.organizationId,
      deletedBy,
      timestamp: new Date(),
    });

    this.logger.log(`Custom role deleted: ${roleId}`);

    return { message: 'Role deleted successfully' };
  }

  /**
   * Get all custom roles for an organization
   */
  async getOrganizationRoles(organizationId: string): Promise<CustomRoleResponseDto[]> {
    const roles = await this.prisma.role.findMany({
      where: {
        organizationId,
        isSystemRole: false,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: { userRoles: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return roles.map(role => this.mapToResponseDto(role, role._count.userRoles));
  }

  /**
   * Get role by ID with user count
   */
  async getRoleById(roleId: string): Promise<CustomRoleResponseDto> {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: { userRoles: true },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return this.mapToResponseDto(role, role._count.userRoles);
  }

  /**
   * Assign custom role to user
   */
  async assignRoleToUser(
    userId: string,
    roleId: string,
    scopeType: string = 'ORGANIZATION',
    scopeId?: string,
    assignedBy?: string,
  ): Promise<{ message: string }> {
    this.logger.log(`Assigning role ${roleId} to user ${userId}`);

    // Check user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check role exists
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (!role.isActive) {
      throw new BadRequestException('Cannot assign inactive role');
    }

    // Check if already assigned
    const existing = await this.prisma.userRole.findFirst({
      where: {
        userId,
        roleId,
        isActive: true,
      },
    });

    if (existing) {
      throw new BadRequestException('User already has this role');
    }

    // Assign role
    await this.prisma.userRole.create({
      data: {
        userId,
        roleId,
        scopeType,
        scopeId: scopeId || role.organizationId,
        assignedBy: assignedBy || 'SYSTEM',
      },
    });

    // Emit event
    await this.eventBus.publish('role.assigned', {
      userId,
      roleId,
      roleName: role.name,
      assignedBy,
      timestamp: new Date(),
    });

    this.logger.log(`Role ${roleId} assigned to user ${userId}`);

    return { message: 'Role assigned successfully' };
  }

  /**
   * Remove role from user
   */
  async removeRoleFromUser(userId: string, roleId: string, removedBy?: string): Promise<{ message: string }> {
    this.logger.log(`Removing role ${roleId} from user ${userId}`);

    const userRole = await this.prisma.userRole.findFirst({
      where: {
        userId,
        roleId,
        isActive: true,
      },
      include: {
        role: true,
      },
    });

    if (!userRole) {
      throw new NotFoundException('User does not have this role');
    }

    // Deactivate role assignment
    await this.prisma.userRole.update({
      where: { id: userRole.id },
      data: { isActive: false },
    });

    // Emit event
    await this.eventBus.publish('role.removed', {
      userId,
      roleId,
      roleName: userRole.role.name,
      removedBy,
      timestamp: new Date(),
    });

    this.logger.log(`Role ${roleId} removed from user ${userId}`);

    return { message: 'Role removed successfully' };
  }

  /**
   * Get available permission categories
   */
  getPermissionCategories() {
    const { PERMISSION_CATEGORIES } = require('../dto/custom-role.dto');
    return PERMISSION_CATEGORIES;
  }

  /**
   * Map database role to response DTO
   */
  private mapToResponseDto(role: any, userCount?: number): CustomRoleResponseDto {
    // Extract permission names from the relation
    const permissionNames = role.permissions?.map((rp: any) => rp.permission.name) || [];
    
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: permissionNames,
      organizationId: role.organizationId!,
      isActive: role.isActive,
      userCount: userCount ?? 0,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }
}
