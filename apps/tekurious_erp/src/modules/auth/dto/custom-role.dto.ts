/**
 * Custom Role DTOs
 * FR-AUTH-021: Custom roles for B2B organizations
 */

import { IsString, IsNotEmpty, IsArray, ArrayMinSize, IsOptional, MaxLength, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomRoleDto {
  @ApiProperty({ example: 'Finance Manager', description: 'Role name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Manages all financial operations', description: 'Role description' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ 
    example: ['fees:create', 'fees:view', 'fees:edit', 'payments:record'], 
    description: 'Array of permissions' 
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one permission is required' })
  @IsString({ each: true })
  permissions: string[];

  @ApiProperty({ example: 'org-123', description: 'Organization ID' })
  @IsString()
  @IsNotEmpty()
  organizationId: string;
}

export class UpdateCustomRoleDto {
  @ApiProperty({ example: 'Finance Manager', description: 'Role name' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ example: 'Manages all financial operations', description: 'Role description' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ 
    example: ['fees:create', 'fees:view', 'fees:edit', 'payments:record'], 
    description: 'Array of permissions' 
  })
  @IsArray()
  @IsOptional()
  @ArrayMinSize(1, { message: 'At least one permission is required' })
  @IsString({ each: true })
  permissions?: string[];

  @ApiProperty({ example: true, description: 'Active status' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class AssignCustomRoleDto {
  @ApiProperty({ example: 'user-123', description: 'User ID' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'role-456', description: 'Custom role ID' })
  @IsString()
  @IsNotEmpty()
  roleId: string;

  @ApiProperty({ example: 'ORGANIZATION', description: 'Scope type' })
  @IsString()
  @IsOptional()
  scopeType?: string;

  @ApiProperty({ example: 'org-123', description: 'Scope ID' })
  @IsString()
  @IsOptional()
  scopeId?: string;
}

export class CustomRoleResponseDto {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  organizationId: string;
  isActive: boolean;
  userCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Available permission categories
 */
export const PERMISSION_CATEGORIES = {
  USERS: {
    name: 'User Management',
    permissions: [
      'users:create',
      'users:read',
      'users:update',
      'users:delete',
      'users:invite',
    ],
  },
  STUDENTS: {
    name: 'Student Management',
    permissions: [
      'students:create',
      'students:read',
      'students:update',
      'students:delete',
      'students:bulk_import',
      'students:export',
    ],
  },
  TEACHERS: {
    name: 'Teacher Management',
    permissions: [
      'teachers:create',
      'teachers:read',
      'teachers:update',
      'teachers:delete',
    ],
  },
  ATTENDANCE: {
    name: 'Attendance Management',
    permissions: [
      'attendance:mark',
      'attendance:view',
      'attendance:edit',
      'attendance:export',
      'attendance:reports',
    ],
  },
  FEES: {
    name: 'Fee Management',
    permissions: [
      'fees:create_structure',
      'fees:view',
      'fees:edit',
      'fees:record_payment',
      'fees:refund',
      'fees:waiver',
      'fees:reports',
    ],
  },
  CONTENT: {
    name: 'Content Management',
    permissions: [
      'content:create',
      'content:read',
      'content:update',
      'content:delete',
      'content:publish',
    ],
  },
  EXAMS: {
    name: 'Exam Management',
    permissions: [
      'exams:create',
      'exams:read',
      'exams:update',
      'exams:delete',
      'exams:assign',
      'exams:grade',
      'exams:publish_results',
    ],
  },
  REPORTS: {
    name: 'Reports',
    permissions: [
      'reports:generate',
      'reports:export',
      'reports:schedule',
      'reports:view_all',
    ],
  },
  SETTINGS: {
    name: 'System Settings',
    permissions: [
      'settings:view',
      'settings:update',
      'settings:integrations',
    ],
  },
};
