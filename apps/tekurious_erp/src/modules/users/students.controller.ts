import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../../database/prisma.service';

@ApiTags('Students')
@Controller('students')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StudentsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated list of students' })
  async getStudents(
    @Query('page') pageStr?: string,
    @Query('limit') limitStr?: string,
    @Query('search') search?: string,
    @Query('classId') classId?: string,
    @Query('sectionId') sectionId?: string,
    @Query('gender') gender?: string,
  ) {
    const page = pageStr ? parseInt(pageStr, 10) : 1;
    const limit = limitStr ? parseInt(limitStr, 10) : 50;
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
        { phone: { contains: search, mode: 'insensitive' } },
        { studentProfile: { admissionNumber: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (gender) {
      where.gender = gender;
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

    const data = users.map((u) => ({
      id: u.studentProfile?.id || u.id,
      userId: u.id,
      admissionNumber: u.studentProfile?.admissionNumber || `STU-${u.id.substring(0, 6)}`,
      rollNumber: u.studentProfile?.rollNumber || '',
      firstName: u.firstName,
      lastName: u.lastName,
      dateOfBirth: u.dateOfBirth?.toISOString() || new Date().toISOString(),
      gender: (u.gender?.toUpperCase() as any) || 'MALE',
      email: u.email || '',
      phone: u.phone || '',
      bloodGroup: u.studentProfile?.bloodGroup || '',
      address: '',
      status: u.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
      enrollmentDate: u.createdAt.toISOString(),
      class: {
        id: classId || 'class-1',
        name: 'Class 1',
        section: 'A',
      },
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get student by ID' })
  async getStudentById(@Param('id') id: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { id },
          { studentProfile: { id } },
        ],
      },
      include: {
        studentProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Student not found');
    }

    return {
      id: user.studentProfile?.id || user.id,
      userId: user.id,
      admissionNumber: user.studentProfile?.admissionNumber || `STU-${user.id.substring(0, 6)}`,
      rollNumber: user.studentProfile?.rollNumber || '',
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: user.dateOfBirth?.toISOString() || new Date().toISOString(),
      gender: (user.gender?.toUpperCase() as any) || 'MALE',
      email: user.email || '',
      phone: user.phone || '',
      bloodGroup: user.studentProfile?.bloodGroup || '',
      address: '',
      status: user.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
      enrollmentDate: user.createdAt.toISOString(),
      class: {
        id: 'class-1',
        name: 'Class 1',
        section: 'A',
      },
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new student' })
  async createStudent(@Body() dto: any) {
    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email || null,
        phone: dto.phone || null,
        gender: dto.gender || 'MALE',
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        role: 'STUDENT',
        status: 'ACTIVE',
        emailVerified: true,
        studentProfile: {
          create: {
            admissionNumber: dto.admissionNumber || `STU-${Date.now().toString().slice(-6)}`,
            rollNumber: dto.rollNumber || null,
          },
        },
      },
      include: {
        studentProfile: true,
      },
    });

    return {
      id: user.studentProfile?.id || user.id,
      userId: user.id,
      admissionNumber: user.studentProfile?.admissionNumber,
      rollNumber: user.studentProfile?.rollNumber,
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: user.dateOfBirth?.toISOString(),
      gender: user.gender,
      email: user.email,
      phone: user.phone,
      status: 'ACTIVE',
      enrollmentDate: user.createdAt.toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  @Patch(':id')
  @Put(':id')
  @ApiOperation({ summary: 'Update student' })
  async updateStudent(@Param('id') id: string, @Body() dto: any) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ id }, { studentProfile: { id } }],
      },
    });

    if (!existing) {
      throw new NotFoundException('Student not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: existing.id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        gender: dto.gender,
        status: dto.status,
      },
      include: { studentProfile: true },
    });

    return {
      id: updated.studentProfile?.id || updated.id,
      userId: updated.id,
      admissionNumber: updated.studentProfile?.admissionNumber,
      rollNumber: updated.studentProfile?.rollNumber,
      firstName: updated.firstName,
      lastName: updated.lastName,
      dateOfBirth: updated.dateOfBirth?.toISOString(),
      gender: updated.gender,
      email: updated.email,
      phone: updated.phone,
      status: updated.status,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete student' })
  async deleteStudent(@Param('id') id: string) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ id }, { studentProfile: { id } }],
      },
    });

    if (existing) {
      await this.prisma.user.update({
        where: { id: existing.id },
        data: { deletedAt: new Date(), status: 'DELETED' },
      });
    }

    return { success: true, message: 'Student deleted successfully' };
  }
}
