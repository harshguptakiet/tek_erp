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

@ApiTags('Teachers')
@Controller('teachers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TeachersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated list of teachers' })
  async getTeachers(
    @Query('page') pageStr?: string,
    @Query('limit') limitStr?: string,
    @Query('search') search?: string,
  ) {
    const page = pageStr ? parseInt(pageStr, 10) : 1;
    const limit = limitStr ? parseInt(limitStr, 10) : 50;
    const skip = (page - 1) * limit;

    const where: any = {
      role: 'TEACHER',
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
        include: {
          teacherProfile: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const data = users.map((u) => ({
      id: u.teacherProfile?.id || u.id,
      userId: u.id,
      employeeId: u.teacherProfile?.employeeId || `EMP-${u.id.substring(0, 6)}`,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email || '',
      phone: u.phone || '',
      designation: u.teacherProfile?.designation || 'Teacher',
      qualification: u.teacherProfile?.qualification || '',
      experienceYears: u.teacherProfile?.joiningDate
        ? new Date().getFullYear() - new Date(u.teacherProfile.joiningDate).getFullYear()
        : 0,
      status: u.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
      joiningDate: u.teacherProfile?.joiningDate?.toISOString() || u.createdAt.toISOString(),
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
  @ApiOperation({ summary: 'Get teacher by ID' })
  async getTeacherById(@Param('id') id: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ id }, { teacherProfile: { id } }],
      },
      include: {
        teacherProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Teacher not found');
    }

    return {
      id: user.teacherProfile?.id || user.id,
      userId: user.id,
      employeeId: user.teacherProfile?.employeeId || `EMP-${user.id.substring(0, 6)}`,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email || '',
      phone: user.phone || '',
      designation: user.teacherProfile?.designation || 'Teacher',
      qualification: user.teacherProfile?.qualification || '',
      status: user.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
      joiningDate: user.teacherProfile?.joiningDate?.toISOString() || user.createdAt.toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
