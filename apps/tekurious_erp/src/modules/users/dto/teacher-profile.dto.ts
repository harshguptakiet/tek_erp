import {
  IsString,
  IsOptional,
  IsDateString,
  IsObject,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeacherProfileDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiProperty()
  @IsString()
  designation: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  joiningDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  qualifications?: Array<{
    degree: string;
    institution: string;
    year: number;
    specialization?: string;
  }>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  subjects?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  totalExperience?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  previousInstitution?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  bankDetails?: {
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    branchName?: string;
  };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };
}

export class UpdateTeacherProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  designation?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  qualifications?: Array<{
    degree: string;
    institution: string;
    year: number;
    specialization?: string;
  }>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  subjects?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };
}
