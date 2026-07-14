import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { EventBusService } from '../../../events/event-bus.service';
import {
  CreateStudentProfileDto,
  UpdateStudentProfileDto,
} from '../dto/student-profile.dto';

@Injectable()
export class StudentProfileService {
  constructor(
    private prisma: PrismaService,
    private eventBus: EventBusService,
  ) {}

  // FR-USER-011: Create Student Profile
  async createStudentProfile(
    adminId: string,
    createDto: CreateStudentProfileDto,
  ) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: createDto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if student profile already exists
    const existingProfile = await this.prisma.studentProfile.findUnique({
      where: { userId: createDto.userId },
    });

    if (existingProfile) {
      throw new BadRequestException('Student profile already exists');
    }

    // Generate admission number if not provided
    const admissionNumber =
      createDto.admissionNumber || (await this.generateAdmissionNumber());

    // Create student profile
    const studentProfile = await this.prisma.studentProfile.create({
      data: {
        userId: createDto.userId,
        admissionNumber,
        rollNumber: createDto.rollNumber,
        admissionDate: createDto.enrollmentDate
          ? new Date(createDto.enrollmentDate)
          : new Date(),
        previousSchool: createDto.previousSchool,
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
        action: 'CREATE_STUDENT_PROFILE',
        tableName: 'StudentProfile',
        recordId: studentProfile.id,
        changes: createDto as any,
        timestamp: new Date(),
      },
    });

    // Emit event
    await this.eventBus.publish('student.profile.created', {
      studentId: studentProfile.id,
      userId: createDto.userId,
      createdBy: adminId,
      admissionNumber,
    });

    return studentProfile;
  }

  // FR-USER-012: Edit Student Profile
  async updateStudentProfile(
    userId: string,
    studentId: string,
    updateDto: UpdateStudentProfileDto,
  ) {
    // Check if student profile exists
    const studentProfile = await this.prisma.studentProfile.findUnique({
      where: { id: studentId },
    });

    if (!studentProfile) {
      throw new NotFoundException('Student profile not found');
    }

    // Update student profile
    const updatedProfile = await this.prisma.studentProfile.update({
      where: { id: studentId },
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
        action: 'UPDATE_STUDENT_PROFILE',
        tableName: 'StudentProfile',
        recordId: studentId,
        changes: updateDto as any,
        timestamp: new Date(),
      },
    });

    // Emit event
    await this.eventBus.publish('student.profile.updated', {
      studentId,
      updatedBy: userId,
      changes: updateDto,
    });

    return updatedProfile;
  }

  // Get student profile
  async getStudentProfile(studentId: string) {
    const studentProfile = await this.prisma.studentProfile.findUnique({
      where: { id: studentId },
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

    if (!studentProfile) {
      throw new NotFoundException('Student profile not found');
    }

    return studentProfile;
  }

  // Get student profile by user ID
  async getStudentProfileByUserId(userId: string) {
    const studentProfile = await this.prisma.studentProfile.findUnique({
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

    if (!studentProfile) {
      throw new NotFoundException('Student profile not found');
    }

    return studentProfile;
  }

  // Helper: Generate unique admission number
  private async generateAdmissionNumber(): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    const count = await this.prisma.studentProfile.count();
    const sequence = (count + 1).toString().padStart(5, '0');
    return `STU${year}${sequence}`;
  }
}
