import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { EventBusService } from '../../../events/event-bus.service';
import {
  CreateTeacherProfileDto,
  UpdateTeacherProfileDto,
} from '../dto/teacher-profile.dto';

@Injectable()
export class TeacherProfileService {
  constructor(
    private prisma: PrismaService,
    private eventBus: EventBusService,
  ) {}

  // FR-USER-019: Create Teacher Profile
  async createTeacherProfile(
    adminId: string,
    createDto: CreateTeacherProfileDto,
  ) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: createDto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if teacher profile already exists
    const existingProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId: createDto.userId },
    });

    if (existingProfile) {
      throw new BadRequestException('Teacher profile already exists');
    }

    // Generate employee ID if not provided
    const employeeId =
      createDto.employeeId || (await this.generateEmployeeId());

    // Create teacher profile
    const teacherProfile = await this.prisma.teacherProfile.create({
      data: {
        userId: createDto.userId,
        employeeId,
        designation: createDto.designation,
        joiningDate: createDto.joiningDate
          ? new Date(createDto.joiningDate)
          : new Date(),
        experience: createDto.totalExperience
          ? parseInt(createDto.totalExperience)
          : undefined,
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
        action: 'CREATE_TEACHER_PROFILE',
        tableName: 'TeacherProfile',
        recordId: teacherProfile.id,
        changes: createDto as any,
        timestamp: new Date(),
      },
    });

    // Emit event
    await this.eventBus.publish('teacher.profile.created', {
      teacherId: teacherProfile.id,
      userId: createDto.userId,
      createdBy: adminId,
      employeeId,
    });

    return teacherProfile;
  }

  // FR-USER-020: Edit Teacher Profile
  async updateTeacherProfile(
    userId: string,
    teacherId: string,
    updateDto: UpdateTeacherProfileDto,
  ) {
    // Check if teacher profile exists
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { id: teacherId },
    });

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found');
    }

    // Update teacher profile
    const updatedProfile = await this.prisma.teacherProfile.update({
      where: { id: teacherId },
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
        action: 'UPDATE_TEACHER_PROFILE',
        tableName: 'TeacherProfile',
        recordId: teacherId,
        changes: updateDto as any,
        timestamp: new Date(),
      },
    });

    // Emit event
    await this.eventBus.publish('teacher.profile.updated', {
      teacherId,
      updatedBy: userId,
      changes: updateDto,
    });

    return updatedProfile;
  }

  // Get teacher profile
  async getTeacherProfile(teacherId: string) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { id: teacherId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            email: true,
            phone: true,
            dateOfBirth: true,
            gender: true,
            profileImage: true,
            status: true,
          },
        },
      },
    });

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found');
    }

    return teacherProfile;
  }

  // Get teacher profile by user ID
  async getTeacherProfileByUserId(userId: string) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            email: true,
            phone: true,
            dateOfBirth: true,
            gender: true,
            profileImage: true,
            status: true,
          },
        },
      },
    });

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found');
    }

    return teacherProfile;
  }

  // Helper: Generate unique employee ID
  private async generateEmployeeId(): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    const count = await this.prisma.teacherProfile.count();
    const sequence = (count + 1).toString().padStart(5, '0');
    return `TCH${year}${sequence}`;
  }
}
