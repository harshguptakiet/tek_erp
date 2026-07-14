import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BulkUserImportRowDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: ['STUDENT', 'TEACHER', 'PARENT', 'STAFF'] })
  @IsEnum(['STUDENT', 'TEACHER', 'PARENT', 'STAFF'])
  role: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  admissionNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  employeeId?: string;
}

export class BulkUserImportDto {
  @ApiProperty({ type: [BulkUserImportRowDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUserImportRowDto)
  users: BulkUserImportRowDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  sendWelcomeEmail?: boolean;
}

export class BulkStatusChangeDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  userIds: string[];

  @ApiProperty({ enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'] })
  @IsEnum(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
  newStatus: string;

  @ApiProperty()
  @IsString()
  reason: string;
}

export class SearchUsersDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum([
    'STUDENT',
    'TEACHER',
    'PARENT',
    'ORG_ADMIN',
    'SCHOOL_ADMIN',
    'PLATFORM_ADMIN',
  ])
  role?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'])
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  organizationId?: string;
}

export class UserPermissionsDto {
  @ApiProperty()
  role: string;

  @ApiProperty({ type: [String] })
  permissions: string[];

  @ApiProperty({ type: [String] })
  customPermissions: string[];
}
