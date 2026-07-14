import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventBusService } from '../../events/event-bus.service';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  FeatureToggleDto,
  CreateBranchDto,
  CreateDepartmentDto,
} from './dto/organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    private prisma: PrismaService,
    private eventBus: EventBusService,
  ) {}

  // FR-ORG-001: Create Organization
  async createOrganization(adminId: string, dto: CreateOrganizationDto) {
    // Check registration number uniqueness
    if (dto.registrationNumber) {
      const existing = await this.prisma.organization.findUnique({
        where: { registrationNumber: dto.registrationNumber },
      });
      if (existing) {
        throw new ConflictException('Registration number already exists');
      }
    }

    // Validate parent org exists and is active
    if (dto.parentOrganizationId) {
      const parentOrg = await this.prisma.organization.findUnique({
        where: { id: dto.parentOrganizationId },
      });
      if (!parentOrg) {
        throw new NotFoundException('Parent organization not found');
      }
      if (!parentOrg.isActive) {
        throw new BadRequestException('Parent organization is not active');
      }
    }

    // Set limits based on tier
    const tierLimits = {
      FREE: { maxStudents: 50, maxTeachers: 10, storageLimit: 10 },
      BASIC: { maxStudents: 500, maxTeachers: 100, storageLimit: 50 },
      PREMIUM: { maxStudents: 2000, maxTeachers: 500, storageLimit: 200 },
      ENTERPRISE: { maxStudents: null, maxTeachers: null, storageLimit: 1000 },
      GOVERNMENT: { maxStudents: null, maxTeachers: null, storageLimit: 5000 },
    };

    const tier = dto.tier || 'BASIC';
    const limits = tierLimits[tier];

    const tenantId = uuidv4();

    // Calculate hierarchy level
    let hierarchyLevel = 0;
    let hierarchyPath = `/${tenantId}`;
    if (dto.parentOrganizationId) {
      const parentOrg = await this.prisma.organization.findUnique({
        where: { id: dto.parentOrganizationId },
      });
      if (parentOrg) {
        hierarchyLevel = parentOrg.hierarchyLevel + 1;
        hierarchyPath = `${parentOrg.hierarchyPath}/${tenantId}`;
      }
    }

    const organization = await this.prisma.organization.create({
      data: {
        name: dto.name,
        legalName: dto.legalName,
        type: dto.type as any,
        tier: (dto.tier || 'BASIC') as any,
        registrationNumber: dto.registrationNumber,
        taxId: dto.taxId,
        gstin: dto.gstin,
        email: dto.email,
        phone: dto.phone,
        website: dto.website,
        parentOrganizationId: dto.parentOrganizationId,
        tenantId,
        hierarchyLevel,
        hierarchyPath,
        countryId: dto.countryId,
        stateId: dto.stateId,
        districtId: dto.districtId,
        coordinates: dto.coordinates,
        primaryContactName: dto.primaryContactName,
        primaryContactEmail: dto.primaryContactEmail,
        primaryContactPhone: dto.primaryContactPhone,
        enabledModules: dto.enabledModules || ['LMS', 'USERS', 'ANALYTICS'],
        maxStudents: dto.maxStudents || limits.maxStudents,
        maxTeachers: dto.maxTeachers || limits.maxTeachers,
        storageLimit: dto.storageLimit || limits.storageLimit,
        onboardedBy: adminId,
        isActive: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'CREATE_ORGANIZATION',
        tableName: 'Organization',
        recordId: organization.id,
        changes: { name: dto.name, type: dto.type },
        timestamp: new Date(),
      },
    });

    await this.eventBus.publish('organization.created', {
      organizationId: organization.id,
      name: organization.name,
      createdBy: adminId,
    });

    return organization;
  }

  // FR-ORG-020: Configure Organization Details
  async updateOrganization(
    adminId: string,
    organizationId: string,
    dto: UpdateOrganizationDto,
  ) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) throw new NotFoundException('Organization not found');

    const updated = await this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        ...dto,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'UPDATE_ORGANIZATION',
        tableName: 'Organization',
        recordId: organizationId,
        changes: dto as any,
        timestamp: new Date(),
      },
    });

    return updated;
  }

  // FR-ORG-004: Organization Activation/Deactivation
  async deactivateOrganization(
    adminId: string,
    organizationId: string,
    reason: string,
  ) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: { users: true },
    });

    if (!org) throw new NotFoundException('Organization not found');
    if (!org.isActive) throw new BadRequestException('Organization is already inactive');

    // Check for children
    const children = await this.prisma.organization.count({
      where: { parentOrganizationId: organizationId, isActive: true },
    });

    if (children > 0) {
      throw new BadRequestException(
        'Cannot deactivate organization with active child organizations',
      );
    }

    await this.prisma.organization.update({
      where: { id: organizationId },
      data: { isActive: false },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'DEACTIVATE_ORGANIZATION',
        tableName: 'Organization',
        recordId: organizationId,
        changes: { reason },
        timestamp: new Date(),
      },
    });

    await this.eventBus.publish('organization.deactivated', {
      organizationId,
      reason,
      deactivatedBy: adminId,
    });

    return { message: 'Organization deactivated successfully' };
  }

  async reactivateOrganization(
    adminId: string,
    organizationId: string,
    reason: string,
  ) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) throw new NotFoundException('Organization not found');
    if (org.isActive) throw new BadRequestException('Organization is already active');

    await this.prisma.organization.update({
      where: { id: organizationId },
      data: { isActive: true },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'REACTIVATE_ORGANIZATION',
        tableName: 'Organization',
        recordId: organizationId,
        changes: { reason },
        timestamp: new Date(),
      },
    });

    return { message: 'Organization reactivated successfully' };
  }

  // FR-ORG-002: Organization Hierarchy Management
  async getHierarchy(organizationId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        childOrganizations: {
          where: { isActive: true },
          include: {
            childOrganizations: {
              where: { isActive: true },
            },
          },
        },
        parentOrganization: true,
      },
    });

    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  // FR-ORG-021: Feature Toggle Configuration
  async toggleFeature(
    adminId: string,
    organizationId: string,
    dto: FeatureToggleDto,
  ) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) throw new NotFoundException('Organization not found');

    let enabledModules = org.enabledModules || [];

    if (dto.enabled) {
      if (!enabledModules.includes(dto.module)) {
        enabledModules = [...enabledModules, dto.module];
      }
    } else {
      enabledModules = enabledModules.filter((m) => m !== dto.module);
    }

    await this.prisma.organization.update({
      where: { id: organizationId },
      data: { enabledModules },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: dto.enabled ? 'ENABLE_FEATURE' : 'DISABLE_FEATURE',
        tableName: 'Organization',
        recordId: organizationId,
        changes: { module: dto.module, enabled: dto.enabled },
        timestamp: new Date(),
      },
    });

    return {
      message: `Module ${dto.module} ${dto.enabled ? 'enabled' : 'disabled'} successfully`,
      enabledModules,
    };
  }

  // FR-ORG-030: Add Users to Organization
  async addUserToOrganization(
    adminId: string,
    organizationId: string,
    userId: string,
    designation?: string,
    department?: string,
  ) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) throw new NotFoundException('Organization not found');
    if (!org.isActive) throw new BadRequestException('Organization is not active');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Check if user is already in org
    const existing = await this.prisma.organizationUser.findUnique({
      where: { organizationId_userId: { organizationId, userId } },
    });

    if (existing && existing.isActive) {
      throw new ConflictException('User is already part of this organization');
    }

    if (existing) {
      // Reactivate
      await this.prisma.organizationUser.update({
        where: { organizationId_userId: { organizationId, userId } },
        data: { isActive: true, leftAt: null, designation, department },
      });
    } else {
      await this.prisma.organizationUser.create({
        data: {
          organizationId,
          userId,
          designation,
          department,
          isActive: true,
        },
      });
    }

    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'ADD_USER_TO_ORGANIZATION',
        tableName: 'OrganizationUser',
        recordId: organizationId,
        changes: { userId, designation, department },
        timestamp: new Date(),
      },
    });

    await this.eventBus.publish('organization.user.added', {
      organizationId,
      userId,
      addedBy: adminId,
    });

    return { message: 'User added to organization successfully' };
  }

  // FR-ORG-031: Remove Users from Organization
  async removeUserFromOrganization(
    adminId: string,
    organizationId: string,
    userId: string,
    reason: string,
  ) {
    const orgUser = await this.prisma.organizationUser.findUnique({
      where: { organizationId_userId: { organizationId, userId } },
    });

    if (!orgUser || !orgUser.isActive) {
      throw new NotFoundException('User not found in this organization');
    }

    await this.prisma.organizationUser.update({
      where: { organizationId_userId: { organizationId, userId } },
      data: { isActive: false, leftAt: new Date() },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'REMOVE_USER_FROM_ORGANIZATION',
        tableName: 'OrganizationUser',
        recordId: organizationId,
        changes: { userId, reason },
        timestamp: new Date(),
      },
    });

    await this.eventBus.publish('organization.user.removed', {
      organizationId,
      userId,
      reason,
      removedBy: adminId,
    });

    return { message: 'User removed from organization successfully' };
  }

  // FR-ORG-033: View Organization Users List
  async getOrganizationUsers(
    organizationId: string,
    page = 1,
    limit = 20,
    role?: string,
    search?: string,
  ) {
    const skip = (page - 1) * limit;

    const whereClause: any = { organizationId, isActive: true };

    const [users, total] = await Promise.all([
      this.prisma.organizationUser.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              role: true,
              status: true,
              profileImage: true,
              lastLogin: true,
              createdAt: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { joinedAt: 'desc' },
      }),
      this.prisma.organizationUser.count({ where: whereClause }),
    ]);

    return {
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  // FR-ORG-022: User Limit Configuration
  async getUserLimitStatus(organizationId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) throw new NotFoundException('Organization not found');

    const activeUsers = await this.prisma.organizationUser.count({
      where: { organizationId, isActive: true },
    });

    const limit = org.maxStudents ? org.maxStudents + (org.maxTeachers || 0) : null;
    const usagePercent = limit ? Math.round((activeUsers / limit) * 100) : 0;

    return {
      activeUsers,
      limit,
      usagePercent,
      isAtLimit: limit ? activeUsers >= limit : false,
      isNearLimit: limit ? activeUsers >= limit * 0.9 : false,
    };
  }

  // Get single organization
  async getOrganization(organizationId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        parentOrganization: { select: { id: true, name: true, type: true } },
        _count: { select: { users: true, schools: true, branches: true } },
      },
    });

    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  // List organizations (with filtering)
  async listOrganizations(
    page = 1,
    limit = 20,
    type?: string,
    parentId?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };
    if (type) where.type = type;
    if (parentId) where.parentOrganizationId = parentId;

    const [organizations, total] = await Promise.all([
      this.prisma.organization.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          type: true,
          tier: true,
          email: true,
          phone: true,
          isActive: true,
          hierarchyLevel: true,
          onboardedAt: true,
          _count: { select: { users: true, schools: true } },
        },
      }),
      this.prisma.organization.count({ where }),
    ]);

    return {
      organizations,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  // FR-ORG branch: Create Branch
  async createBranch(
    adminId: string,
    organizationId: string,
    dto: CreateBranchDto,
  ) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!org) throw new NotFoundException('Organization not found');

    const tenantId = uuidv4();

    const branch = await this.prisma.branch.create({
      data: {
        organizationId,
        name: dto.name,
        code: dto.code,
        branchType: dto.branchType,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        countryId: dto.countryId,
        stateId: dto.stateId,
        districtId: dto.districtId,
        tenantId,
        hierarchyPath: `${org.hierarchyPath}/${tenantId}`,
        isActive: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'CREATE_BRANCH',
        tableName: 'Branch',
        recordId: branch.id,
        changes: { name: dto.name, organizationId },
        timestamp: new Date(),
      },
    });

    return branch;
  }

  // Create Department
  async createDepartment(
    adminId: string,
    organizationId: string,
    dto: CreateDepartmentDto,
  ) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!org) throw new NotFoundException('Organization not found');

    const tenantId = uuidv4();

    const department = await this.prisma.department.create({
      data: {
        organizationId,
        branchId: dto.branchId,
        name: dto.name,
        code: dto.code,
        departmentType: dto.departmentType,
        parentDepartmentId: dto.parentDepartmentId,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        tenantId,
        isActive: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'CREATE_DEPARTMENT',
        tableName: 'Department',
        recordId: department.id,
        changes: { name: dto.name, organizationId },
        timestamp: new Date(),
      },
    });

    return department;
  }

  // Get branches
  async getBranches(organizationId: string) {
    const branches = await this.prisma.branch.findMany({
      where: { organizationId, isActive: true },
      include: {
        departments: { where: { isActive: true } },
        _count: { select: { schools: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return branches;
  }

  // Get departments
  async getDepartments(organizationId: string, branchId?: string) {
    const where: any = { organizationId, isActive: true };
    if (branchId) where.branchId = branchId;

    return this.prisma.department.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  // FR-ORG-022: Get org stats for dashboard
  async getOrganizationStats(organizationId: string) {
    const [org, activeUsers, schools, branches, departments] =
      await Promise.all([
        this.prisma.organization.findUnique({ where: { id: organizationId } }),
        this.prisma.organizationUser.count({
          where: { organizationId, isActive: true },
        }),
        this.prisma.school.count({ where: { organizationId, isActive: true } }),
        this.prisma.branch.count({ where: { organizationId, isActive: true } }),
        this.prisma.department.count({
          where: { organizationId, isActive: true },
        }),
      ]);

    if (!org) throw new NotFoundException('Organization not found');

    return {
      organization: org,
      stats: {
        activeUsers,
        schools,
        branches,
        departments,
        maxStudents: org.maxStudents,
        maxTeachers: org.maxTeachers,
        storageLimit: org.storageLimit,
      },
    };
  }

  // FR-ORG-003: Organization Verification
  async verifyOrganization(
    adminId: string,
    organizationId: string,
    dto: { status: string; reason?: string; verifiedBy?: string },
  ) {
    // Check organization exists
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!org) throw new NotFoundException('Organization not found');

    // Map verification status to isActive
    const isActive = dto.status === 'ACTIVE';

    // Update organization status
    const updatedOrg = await this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        isActive,
      },
    });

    // Log audit event with full verification details
    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'VERIFY_ORGANIZATION',
        tableName: 'Organization',
        recordId: organizationId,
        organizationId,
        changes: {
          status: dto.status,
          reason: dto.reason,
          previousActive: org.isActive,
          newActive: isActive,
          verifiedBy: adminId,
          verifiedAt: new Date().toISOString(),
        },
        ipAddress: '127.0.0.1',
        userAgent: 'System',
      },
    });

    // Emit event
    this.eventBus.publish('organization.verified', {
      organizationId,
      status: dto.status,
      verifiedBy: adminId,
      timestamp: new Date(),
    });

    // Send notification based on status
    if (dto.status === 'ACTIVE') {
      // Welcome package sent
      this.eventBus.publish('organization.verification.approved', {
        organizationId,
        orgName: org.name,
        primaryContactEmail: org.primaryContactEmail,
      });
    } else if (dto.status === 'REJECTED') {
      // Rejection notification
      this.eventBus.publish('organization.verification.rejected', {
        organizationId,
        orgName: org.name,
        reason: dto.reason,
        primaryContactEmail: org.primaryContactEmail,
      });
    } else if (dto.status === 'INFO_REQUESTED') {
      // Request for more info
      this.eventBus.publish('organization.verification.info_requested', {
        organizationId,
        orgName: org.name,
        reason: dto.reason,
        primaryContactEmail: org.primaryContactEmail,
      });
    }

    return {
      success: true,
      organization: updatedOrg,
      message: `Organization verification status updated to ${dto.status}`,
    };
  }

  async getVerificationStatus(organizationId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        isActive: true,
        registrationNumber: true,
        taxId: true,
        gstin: true,
        createdAt: true,
      },
    });

    if (!org) throw new NotFoundException('Organization not found');

    // Get latest verification audit log
    const latestVerification = await this.prisma.auditLog.findFirst({
      where: {
        recordId: organizationId,
        action: 'VERIFY_ORGANIZATION',
      },
      orderBy: { timestamp: 'desc' },
    });

    return {
      organization: org,
      verificationStatus: org.isActive
        ? 'ACTIVE'
        : 'PENDING_VERIFICATION',
      verifiedAt: latestVerification?.timestamp,
      verificationNotes: latestVerification?.changes
        ? (latestVerification.changes as any).reason
        : null,
      canPublishContent: org.isActive,
      canReceivePayments: org.isActive,
    };
  }

  // FR-ORG-032: Manage User Roles in Organization
  async changeUserRole(
    adminId: string,
    organizationId: string,
    userId: string,
    roleId: string,
    reason: string,
    additionalRoles?: string[],
  ) {
    // Verify organization exists
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!org) throw new NotFoundException('Organization not found');

    // Verify user exists in organization
    const orgUser = await this.prisma.organizationUser.findUnique({
      where: {
        organizationId_userId: { organizationId, userId },
      },
    });
    if (!orgUser) {
      throw new NotFoundException('User not found in organization');
    }

    // Get current user roles
    const currentRoles = await this.prisma.userRoleMapping.findMany({
      where: { userId, organizationId },
      include: { role: true },
    });

    // Verify role exists
    const newRole = await this.prisma.customRole.findUnique({
      where: { id: roleId },
    });
    if (!newRole) throw new NotFoundException('Role not found');

    // Check if user is trying to change their own role
    if (adminId === userId) {
      // Check if there are other admins
      const adminCount = await this.prisma.userRoleMapping.count({
        where: {
          organizationId,
          role: { name: 'Admin' },
          userId: { not: userId },
        },
      });
      if (adminCount === 0) {
        throw new BadRequestException(
          'Cannot change your own role when you are the last admin',
        );
      }
    }

    // Remove old role mappings
    await this.prisma.userRoleMapping.deleteMany({
      where: { userId, organizationId },
    });

    // Add new role
    await this.prisma.userRoleMapping.create({
      data: {
        userId,
        roleId,
        organizationId,
        assignedBy: adminId,
        assignedAt: new Date(),
      },
    });

    // Add additional roles if provided
    if (additionalRoles && additionalRoles.length > 0) {
      await Promise.all(
        additionalRoles.map((addRoleId) =>
          this.prisma.userRoleMapping.create({
            data: {
              userId,
              roleId: addRoleId,
              organizationId,
              assignedBy: adminId,
              assignedAt: new Date(),
            },
          }),
        ),
      );
    }

    // Log audit event
    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'CHANGE_USER_ROLE',
        tableName: 'OrganizationUser',
        recordId: orgUser.id,
        organizationId,
        changes: {
          previousRoles: currentRoles.map((r) => r.role.name),
          newRole: newRole.name,
          additionalRoles,
          reason,
        },
        ipAddress: '127.0.0.1',
        userAgent: 'System',
      },
    });

    // Emit event
    this.eventBus.publish('organization.user.role_changed', {
      organizationId,
      userId,
      changedBy: adminId,
      oldRoles: currentRoles.map((r) => r.roleId),
      newRoleId: roleId,
      additionalRoles,
      reason,
      timestamp: new Date(),
    });

    // Get updated roles
    const updatedRoles = await this.prisma.userRoleMapping.findMany({
      where: { userId, organizationId },
      include: { role: true },
    });

    return {
      success: true,
      user: {
        userId,
        organizationId,
        roles: updatedRoles.map((r) => ({
          id: r.role.id,
          name: r.role.name,
          description: r.role.description,
        })),
      },
      message: 'User role updated successfully. User will need to re-login.',
      reason,
    };
  }

  async getUserRoles(organizationId: string, userId: string) {
    // Verify organization exists
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!org) throw new NotFoundException('Organization not found');

    // Verify user exists in organization
    const orgUser = await this.prisma.organizationUser.findUnique({
      where: {
        organizationId_userId: { organizationId, userId },
      },
    });
    if (!orgUser) {
      throw new NotFoundException('User not found in organization');
    }

    // Get user roles with permissions
    const userRoles = await this.prisma.userRoleMapping.findMany({
      where: { userId, organizationId },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    const roles = userRoles.map((ur) => ({
      id: ur.role.id,
      name: ur.role.name,
      description: ur.role.description,
      permissions: ur.role.permissions.map((perm) => ({
        id: perm.id,
        resource: perm.resource,
        action: perm.action,
        conditions: perm.conditions,
      })),
      assignedAt: ur.assignedAt,
    }));

    return {
      userId,
      organizationId,
      roles,
      totalRoles: roles.length,
      totalPermissions: roles.reduce(
        (sum, role) => sum + role.permissions.length,
        0,
      ),
    };
  }

  // FR-ORG-005: Organization Deletion (soft delete)
  async deleteOrganization(
    adminId: string,
    organizationId: string,
    reason: string,
    confirmName: string,
  ) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        childOrganizations: { where: { deletedAt: null }, take: 1 },
        subscriptions: { where: { status: 'ACTIVE' }, take: 1 },
      },
    });
    if (!org) throw new NotFoundException('Organization not found');

    // Confirmation name must match
    if (confirmName !== org.name) {
      throw new BadRequestException(
        'Confirmation name does not match organization name',
      );
    }

    // Cannot delete if it has active children
    if (org.childOrganizations.length > 0) {
      throw new BadRequestException(
        'Cannot delete organization with active child organizations',
      );
    }

    // Cannot delete if it has active subscriptions
    if (org.subscriptions.length > 0) {
      throw new BadRequestException(
        'Cannot delete organization with active subscriptions. Cancel subscriptions first.',
      );
    }

    // Soft delete
    const deleted = await this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    // Remove all users' access
    await this.prisma.organizationUser.updateMany({
      where: { organizationId },
      data: { isActive: false },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'DELETE_ORGANIZATION',
        tableName: 'Organization',
        recordId: organizationId,
        organizationId,
        reason,
        changes: { deletedAt: new Date().toISOString(), reason } as any,
        ipAddress: '127.0.0.1',
        userAgent: 'System',
      },
    });

    this.eventBus.publish('organization.deleted', {
      organizationId,
      deletedBy: adminId,
      reason,
      timestamp: new Date(),
    });

    return {
      success: true,
      message: `Organization "${org.name}" has been deleted. Data retained for 90 days.`,
    };
  }

  // FR-ORG-034: Invite External Users to Organization
  async inviteUser(inviterId: string, organizationId: string, dto: any) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!org || !org.isActive) {
      throw new NotFoundException('Organization not found or inactive');
    }

    // Check if email is already in org
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      const alreadyMember = await this.prisma.organizationUser.findFirst({
        where: { organizationId, userId: existingUser.id, isActive: true },
      });
      if (alreadyMember) {
        throw new ConflictException('User is already a member of this organization');
      }
    }

    // Check user limit
    const limitStatus = await this.getUserLimitStatus(organizationId);
    if (limitStatus.isAtLimit) {
      throw new BadRequestException(
        'Organization has reached its user limit',
      );
    }

    const expiresAt = new Date(
      Date.now() + (dto.expiryDays || 7) * 24 * 60 * 60 * 1000,
    );

    // Store invitation as audit log until Invitation model is needed
    await this.prisma.auditLog.create({
      data: {
        userId: inviterId,
        action: 'INVITE_USER',
        tableName: 'Organization',
        recordId: organizationId,
        organizationId,
        changes: {
          inviteeEmail: dto.email,
          role: dto.role,
          message: dto.message,
          expiresAt: expiresAt.toISOString(),
          status: 'PENDING',
        } as any,
        ipAddress: '127.0.0.1',
        userAgent: 'System',
      },
    });

    this.eventBus.publish('organization.invitation.sent', {
      organizationId,
      orgName: org.name,
      inviteeEmail: dto.email,
      inviterId,
      role: dto.role,
      expiresAt,
    });

    return {
      success: true,
      invitation: {
        organizationId,
        orgName: org.name,
        inviteeEmail: dto.email,
        role: dto.role || 'Member',
        expiresAt,
        status: 'PENDING',
      },
      message: `Invitation sent to ${dto.email}. Expires in ${dto.expiryDays || 7} days.`,
    };
  }

  async listInvitations(organizationId: string) {
    const invitations = await this.prisma.auditLog.findMany({
      where: { action: 'INVITE_USER', organizationId },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    return invitations.map((inv) => {
      const changes = inv.changes as any;
      return {
        id: inv.id,
        inviteeEmail: changes?.inviteeEmail,
        role: changes?.role,
        status: changes?.status || 'PENDING',
        expiresAt: changes?.expiresAt,
        invitedAt: inv.timestamp,
        invitedBy: inv.userId,
      };
    });
  }

  async cancelInvitation(adminId: string, organizationId: string, invitationId: string) {
    const invitation = await this.prisma.auditLog.findUnique({
      where: { id: invitationId },
    });
    if (!invitation || invitation.organizationId !== organizationId) {
      throw new NotFoundException('Invitation not found');
    }

    const changes = invitation.changes as any;
    await this.prisma.auditLog.update({
      where: { id: invitationId },
      data: {
        changes: { ...changes, status: 'CANCELLED', cancelledAt: new Date().toISOString(), cancelledBy: adminId },
      },
    });

    return { success: true, message: 'Invitation cancelled' };
  }
}

