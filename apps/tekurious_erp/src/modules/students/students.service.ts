import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateStudentDto, UpdateStudentDto, StudentFiltersDto } from './dto';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: StudentFiltersDto) {
    const { page = 1, limit = 50, search, classId, status, schoolId, sectionId, academicYearId } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      role: 'STUDENT',
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        {
          studentProfile: {
            admissionNumber: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (schoolId) {
      where.studentProfile = {
        ...where.studentProfile,
        schoolId,
      };
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
        include: {
          studentProfile: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const data = users.map((user) => ({
      id: user.id,
      admissionNumber: user.studentProfile?.admissionNumber || '',
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      status: user.status,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, include: string[] = []) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        studentProfile: true,
      },
    });

    if (!user || user.role !== 'STUDENT') {
      throw new NotFoundException('Student not found');
    }

    return user;
  }

  async findByAdmissionNumber(admissionNumber: string) {
    const studentProfile = await this.prisma.studentProfile.findFirst({
      where: { admissionNumber },
      include: {
        user: true,
      },
    });

    if (!studentProfile) {
      throw new NotFoundException('Student not found');
    }

    return studentProfile;
  }

  async create(dto: CreateStudentDto) {
    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        middleName: dto.middleName,
        email: dto.email,
        phone: dto.phone,
        gender: dto.gender,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        role: 'STUDENT',
        status: 'ACTIVE',
        emailVerified: true,
        studentProfile: {
          create: {
            admissionNumber: dto.admissionNumber,
            rollNumber: dto.rollNumber || null,
            bloodGroup: dto.bloodGroup || null,
            admissionDate: dto.enrollmentDate ? new Date(dto.enrollmentDate) : new Date(),
            previousSchool: dto.previousSchool || null,
            schoolId: dto.schoolId || null,
          },
        },
      },
      include: {
        studentProfile: true,
      },
    });

    return user;
  }

  async update(id: string, dto: UpdateStudentDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user || user.role !== 'STUDENT') {
      throw new NotFoundException('Student not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        middleName: dto.middleName,
        email: dto.email,
        phone: dto.phone,
        gender: dto.gender,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        status: dto.status as any,
      },
      include: {
        studentProfile: true,
      },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user || user.role !== 'STUDENT') {
      throw new NotFoundException('Student not found');
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'DELETED',
      },
    });

    return { success: true, message: 'Student deleted successfully' };
  }

  async getAttendanceSummary(id: string, filters: any) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || user.role !== 'STUDENT') {
      throw new NotFoundException('Student not found');
    }

    // Return mock data for now
    return {
      totalDays: 100,
      present: 85,
      absent: 10,
      leave: 5,
      percentage: 85,
    };
  }

  async getPerformanceSummary(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || user.role !== 'STUDENT') {
      throw new NotFoundException('Student not found');
    }

    // Return mock data for now
    return {
      averageGrade: 'A',
      totalAssignments: 20,
      completedAssignments: 18,
      averageScore: 85,
    };
  }

  async bulkImport(file: any) {
    // Implement CSV parsing and bulk import logic
    return {
      success: true,
      imported: 0,
      failed: 0,
      message: 'Bulk import not yet implemented',
    };
  }

  async bulkExport(filters: StudentFiltersDto) {
    const { search, classId, status, schoolId } = filters;

    const where: any = {
      role: 'STUDENT',
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (schoolId) {
      where.studentProfile = {
        schoolId,
      };
    }

    const users = await this.prisma.user.findMany({
      where,
      include: {
        studentProfile: true,
      },
    });

    return {
      success: true,
      count: users.length,
      data: users,
    };
  }
}
