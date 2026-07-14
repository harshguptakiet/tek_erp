import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { SearchUsersDto } from '../dto/bulk-operations.dto';

@Injectable()
export class UserSearchService {
  constructor(private prisma: PrismaService) {}

  // FR-USER-039: Search Users
  async searchUsers(
    searchDto: SearchUsersDto,
    page = 1,
    limit = 20,
  ): Promise<{
    users: any[];
    pagination: { page: number; limit: number; total: number };
  }> {
    const skip = (page - 1) * limit;
    const where: any = {};

    // Search query (name or email)
    if (searchDto.query) {
      where.OR = [
        { firstName: { contains: searchDto.query, mode: 'insensitive' } },
        { lastName: { contains: searchDto.query, mode: 'insensitive' } },
        { email: { contains: searchDto.query, mode: 'insensitive' } },
      ];
    }

    // Role filter
    if (searchDto.role) {
      where.role = searchDto.role;
    }

    // Status filter
    if (searchDto.status) {
      where.status = searchDto.status;
    }

    // Organization filter
    if (searchDto.organizationId) {
      where.tenantId = searchDto.organizationId;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
          profileImage: true,
          role: true,
          status: true,
          emailVerified: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  // FR-USER-040: User Directory
  async getUserDirectory(
    role?: string,
    page = 1,
    limit = 50,
  ): Promise<{
    users: any[];
    pagination: { page: number; limit: number; total: number };
  }> {
    const skip = (page - 1) * limit;
    const where: any = {
      status: 'ACTIVE',
    };

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          profileImage: true,
          role: true,
        },
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
        take: limit,
        skip,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  // FR-USER-042: View Public Profile
  async getPublicProfile(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, status: { not: 'DELETED' } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        role: true,
        createdAt: true,
        studentProfile: {
          select: {
            admissionNumber: true,
            rollNumber: true,
          },
        },
        teacherProfile: {
          select: {
            employeeId: true,
            designation: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
