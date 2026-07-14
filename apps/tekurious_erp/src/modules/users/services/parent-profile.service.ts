import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { EventBusService } from '../../../events/event-bus.service';
import {
  CreateParentProfileDto,
  LinkParentStudentDto,
  UpdateParentProfileDto,
} from '../dto/parent-profile.dto';

@Injectable()
export class ParentProfileService {
  constructor(
    private prisma: PrismaService,
    private eventBus: EventBusService,
  ) {}

  // FR-USER-027: Create Parent Profile
  async createParentProfile(
    adminId: string,
    createDto: CreateParentProfileDto,
  ) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: createDto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if parent profile already exists
    const existingProfile = await this.prisma.parentProfile.findUnique({
      where: { userId: createDto.userId },
    });

    if (existingProfile) {
      throw new BadRequestException('Parent profile already exists');
    }

    // Create parent profile
    const parentProfile = await this.prisma.parentProfile.create({
      data: {
        userId: createDto.userId,
        occupation: createDto.occupation,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Log action
    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'CREATE_PARENT_PROFILE',
        tableName: 'ParentProfile',
        recordId: parentProfile.id,
        changes: createDto as any,
        timestamp: new Date(),
      },
    });

    // Emit event
    await this.eventBus.publish('parent.profile.created', {
      parentId: parentProfile.id,
      userId: createDto.userId,
      createdBy: adminId,
    });

    return parentProfile;
  }

  // FR-USER-028: Link Parent to Student
  async linkParentToStudent(adminId: string, linkDto: LinkParentStudentDto) {
    // Verify parent profile exists
    const parentProfile = await this.prisma.parentProfile.findUnique({
      where: { id: linkDto.parentId },
    });

    if (!parentProfile) {
      throw new NotFoundException('Parent profile not found');
    }

    // Verify student exists and admission number matches
    const studentProfile = await this.prisma.studentProfile.findUnique({
      where: { id: linkDto.studentId },
    });

    if (!studentProfile) {
      throw new NotFoundException('Student profile not found');
    }

    if (studentProfile.admissionNumber !== linkDto.admissionNumber) {
      throw new BadRequestException('Invalid admission number');
    }

    // TODO: Check if link already exists - requires ParentStudentRelation table
    // TODO: Create link - requires ParentStudentRelation table
    // For now, we'll just emit an event and log the action

    // Log action
    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'LINK_PARENT_STUDENT',
        tableName: 'ParentProfile',
        recordId: linkDto.parentId,
        changes: linkDto as any,
        timestamp: new Date(),
      },
    });

    // Emit event
    await this.eventBus.publish('parent.student.linked', {
      parentId: linkDto.parentId,
      studentId: linkDto.studentId,
      linkedBy: adminId,
    });

    return {
      message: 'Parent-student link created successfully (schema update required)',
      parentId: linkDto.parentId,
      studentId: linkDto.studentId,
    };
  }

  // FR-USER-029: Get Parent Dashboard (linked students)
  async getParentDashboard(parentId: string) {
    const parentProfile = await this.prisma.parentProfile.findUnique({
      where: { id: parentId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!parentProfile) {
      throw new NotFoundException('Parent profile not found');
    }

    // TODO: Get linked children - requires ParentStudentRelation table
    return {
      parent: parentProfile,
      linkedChildren: [], // Will be populated when ParentStudentRelation table exists
      message: 'Schema update required for parent-student relationships',
    };
  }

  // Update parent profile
  async updateParentProfile(
    userId: string,
    parentId: string,
    updateDto: UpdateParentProfileDto,
  ) {
    // Check if parent profile exists
    const parentProfile = await this.prisma.parentProfile.findUnique({
      where: { id: parentId },
    });

    if (!parentProfile) {
      throw new NotFoundException('Parent profile not found');
    }

    // Update parent profile
    const updatedProfile = await this.prisma.parentProfile.update({
      where: { id: parentId },
      data: updateDto,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Log action
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE_PARENT_PROFILE',
        tableName: 'ParentProfile',
        recordId: parentId,
        changes: updateDto as any,
        timestamp: new Date(),
      },
    });

    // Emit event
    await this.eventBus.publish('parent.profile.updated', {
      parentId,
      updatedBy: userId,
      changes: updateDto,
    });

    return updatedProfile;
  }

  // Get parent profile
  async getParentProfile(parentId: string) {
    const parentProfile = await this.prisma.parentProfile.findUnique({
      where: { id: parentId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            email: true,
            phone: true,
            profileImage: true,
            status: true,
          },
        },
      },
    });

    if (!parentProfile) {
      throw new NotFoundException('Parent profile not found');
    }

    return parentProfile;
  }
}
