import {
  IsString,
  IsOptional,
  IsEnum,
  IsEmail,
  IsPhoneNumber,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateParentProfileDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty({ enum: ['FATHER', 'MOTHER', 'GUARDIAN', 'OTHER'] })
  @IsEnum(['FATHER', 'MOTHER', 'GUARDIAN', 'OTHER'])
  relation: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  occupation?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  employer?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  alternateEmail?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsPhoneNumber()
  alternatePhone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  residentialAddress?: string;

  @ApiProperty({ required: false, enum: ['EMAIL', 'SMS', 'PHONE', 'APP'] })
  @IsOptional()
  @IsEnum(['EMAIL', 'SMS', 'PHONE', 'APP'])
  preferredCommunication?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  isEmergencyContact?: boolean;
}

export class LinkParentStudentDto {
  @ApiProperty()
  @IsString()
  parentId: string;

  @ApiProperty()
  @IsString()
  studentId: string;

  @ApiProperty({ enum: ['FATHER', 'MOTHER', 'GUARDIAN', 'OTHER'] })
  @IsEnum(['FATHER', 'MOTHER', 'GUARDIAN', 'OTHER'])
  relationship: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  isPrimary?: boolean;

  @ApiProperty({ description: 'Student admission number for verification' })
  @IsString()
  admissionNumber: string;
}

export class UpdateParentProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  occupation?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  employer?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  alternateEmail?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsPhoneNumber()
  alternatePhone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  residentialAddress?: string;

  @ApiProperty({ required: false, enum: ['EMAIL', 'SMS', 'PHONE', 'APP'] })
  @IsOptional()
  @IsEnum(['EMAIL', 'SMS', 'PHONE', 'APP'])
  preferredCommunication?: string;
}
