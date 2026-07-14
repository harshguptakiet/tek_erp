import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsObject,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStudentProfileDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  admissionNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  rollNumber?: string;

  @ApiProperty()
  @IsString()
  class: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  section?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  enrollmentDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  previousSchool?: string;

  @ApiProperty({ required: false, enum: ['NEW', 'TRANSFER', 'READMISSION'] })
  @IsOptional()
  @IsEnum(['NEW', 'TRANSFER', 'READMISSION'])
  admissionType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  medicalInfo?: {
    bloodGroup?: string;
    allergies?: string[];
    chronicConditions?: string[];
    emergencyContact?: {
      name: string;
      relation: string;
      phone: string;
    };
  };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  address?: {
    residential?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    };
    permanent?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    };
  };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  documents?: Array<{
    type: string;
    url: string;
    fileName: string;
  }>;
}

export class UpdateStudentProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  rollNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  class?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  section?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  medicalInfo?: {
    bloodGroup?: string;
    allergies?: string[];
    chronicConditions?: string[];
    emergencyContact?: {
      name: string;
      relation: string;
      phone: string;
    };
  };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  address?: {
    residential?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    };
    permanent?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    };
  };
}
