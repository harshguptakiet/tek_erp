import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentDto } from './create-student.dto';
import { IsEnum, IsOptional } from 'class-validator';

export enum StudentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  GRADUATED = 'GRADUATED',
  TRANSFERRED = 'TRANSFERRED',
  SUSPENDED = 'SUSPENDED',
  DROPOUT = 'DROPOUT',
}

export class UpdateStudentDto extends PartialType(CreateStudentDto) {
  @IsEnum(StudentStatus)
  @IsOptional()
  status?: StudentStatus;
}
