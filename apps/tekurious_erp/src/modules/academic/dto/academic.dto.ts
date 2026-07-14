import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsArray,
  Min,
  Max,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBoardDto {
  @ApiProperty()
  @IsString()
  @Length(2, 20)
  code: string;

  @ApiProperty()
  @IsString()
  @Length(3, 100)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stateCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  website?: string;
}

export class CreateAcademicYearDto {
  @ApiProperty()
  @IsString()
  schoolId: string;

  @ApiProperty()
  @IsString()
  year: string; // e.g., "2024-2025"

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;
}

export class CreateClassDto {
  @ApiProperty()
  @IsString()
  schoolId: string;

  @ApiProperty()
  @IsString()
  academicYearId: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(12)
  grade: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gradeName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stream?: string;
}

export class CreateSectionDto {
  @ApiProperty()
  @IsString()
  classId: string;

  @ApiProperty()
  @IsString()
  @Length(1, 5)
  sectionName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  classTeacherId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  roomNumber?: string;
}

export class EnrollStudentDto {
  @ApiProperty()
  @IsString()
  studentId: string;

  @ApiProperty()
  @IsString()
  schoolId: string;

  @ApiProperty()
  @IsString()
  academicYearId: string;

  @ApiProperty()
  @IsString()
  classId: string;

  @ApiProperty()
  @IsString()
  sectionId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rollNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  enrollmentDate?: string;
}

export class AssignTeacherToSectionDto {
  @ApiProperty()
  @IsString()
  teacherId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subjectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class CreateSubjectDto {
  @ApiProperty()
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiProperty()
  @IsString()
  @Length(2, 20)
  code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  grade?: number;
}

export class CreateSchoolDto {
  @ApiProperty()
  @IsString()
  organizationId: string;

  @ApiProperty()
  @IsString()
  @Length(3, 100)
  name: string;

  @ApiProperty()
  @IsString()
  @Length(2, 20)
  code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  schoolType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  board?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  affiliationNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  totalCapacity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  facilities?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  branchId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  countryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stateId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  districtId?: string;
}

// FR-ACAD-016: Student Groups/Houses
export class CreateStudentGroupDto {
  @ApiProperty()
  @IsString()
  schoolId: string;

  @ApiProperty()
  @IsString()
  @Length(2, 50)
  name: string;

  @ApiProperty({ enum: ['HOUSE', 'CLUB', 'TEAM', 'COMMITTEE', 'SECTION'] })
  @IsEnum(['HOUSE', 'CLUB', 'TEAM', 'COMMITTEE', 'SECTION'])
  groupType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  motto?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emblemUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coordinatorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;
}

export class AssignStudentToGroupDto {
  @ApiProperty()
  @IsString()
  studentId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isCaptain?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isViceCaptain?: boolean;
}

export class AwardGroupPointsDto {
  @ApiProperty()
  @IsString()
  groupId: string;

  @ApiProperty()
  @IsInt()
  points: number;

  @ApiProperty()
  @IsString()
  @Length(5, 500)
  reason: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string; // Academic, Sports, Cultural, Discipline

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  awardedBy?: string;
}

// FR-ACAD-014: Academic Calendar & Events
export class CreateAcademicEventDto {
  @ApiProperty()
  @IsString()
  schoolId: string;

  @ApiProperty()
  @IsString()
  academicYearId: string;

  @ApiProperty()
  @IsString()
  @Length(3, 200)
  title: string;

  @ApiProperty({ enum: ['HOLIDAY', 'EXAM', 'PTM', 'SPORTS', 'CULTURAL', 'DEADLINE', 'MEETING', 'OTHER'] })
  @IsEnum(['HOLIDAY', 'EXAM', 'PTM', 'SPORTS', 'CULTURAL', 'DEADLINE', 'MEETING', 'OTHER'])
  eventType: string;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recurrencePattern?: string; // WEEKLY, MONTHLY, YEARLY

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['PUBLIC', 'CLASS_SPECIFIC', 'ROLE_SPECIFIC'])
  visibility?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetAudience?: string[]; // classIds or roleIds

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  sendReminder?: boolean;
}

// FR-ACAD-008: Syllabus & Lesson Plans
export class CreateLessonPlanDto {
  @ApiProperty()
  @IsString()
  teacherId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subjectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  topicId?: string;

  @ApiProperty()
  @IsString()
  @Length(3, 200)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  objectives?: string[];

  @ApiProperty()
  @IsInt()
  @Min(10)
  duration: number; // minutes

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  homework?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  plannedFor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resources?: string[];
}

export class UpdateSyllabusProgressDto {
  @ApiProperty()
  @IsString()
  classId: string;

  @ApiProperty()
  @IsString()
  subjectId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  topicId?: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  @Max(100)
  completedPercentage: number;
}

// FR-ACAD-009: Parent-Teacher Meetings
export class CreatePTMDto {
  @ApiProperty()
  @IsString()
  schoolId: string;

  @ApiProperty()
  @IsString()
  academicYearId: string;

  @ApiProperty()
  @IsString()
  @Length(3, 200)
  title: string;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty()
  @IsString()
  startTime: string;

  @ApiProperty()
  @IsString()
  endTime: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  venue?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['IN_PERSON', 'VIRTUAL', 'HYBRID'])
  mode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(5)
  slotDurationMinutes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetClassIds?: string[];
}

export class RecordPTMAttendanceDto {
  @ApiProperty()
  @IsString()
  parentId: string;

  @ApiProperty()
  @IsString()
  studentId: string;

  @ApiProperty({ enum: ['ATTENDED', 'ABSENT', 'RESCHEDULED'] })
  @IsEnum(['ATTENDED', 'ABSENT', 'RESCHEDULED'])
  status: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

// FR-ACAD-010: Student Transfers
export class StudentTransferDto {
  @ApiProperty()
  @IsString()
  studentId: string;

  @ApiProperty({ enum: ['SECTION_CHANGE', 'CLASS_CHANGE', 'SCHOOL_TRANSFER_OUT', 'INTER_ORG_TRANSFER'] })
  @IsEnum(['SECTION_CHANGE', 'CLASS_CHANGE', 'SCHOOL_TRANSFER_OUT', 'INTER_ORG_TRANSFER'])
  transferType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  targetSectionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  targetClassId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  targetSchoolId?: string;

  @ApiProperty()
  @IsDateString()
  effectiveDate: string;

  @ApiProperty()
  @IsString()
  @Length(10, 1000)
  reason: string;
}

// FR-ACAD-011: Promotions & Detentions
export class BulkPromoteDto {
  @ApiProperty()
  @IsString()
  schoolId: string;

  @ApiProperty()
  @IsString()
  academicYearId: string;

  @ApiProperty()
  @IsString()
  targetAcademicYearId: string;

  @ApiProperty()
  @IsString()
  classId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  detainedStudentIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  dryRun?: boolean;
}

export class ManualPromotionDto {
  @ApiProperty()
  @IsString()
  studentId: string;

  @ApiProperty({ enum: ['PROMOTED', 'DETAINED', 'CONDITIONALLY_PROMOTED'] })
  @IsEnum(['PROMOTED', 'DETAINED', 'CONDITIONALLY_PROMOTED'])
  status: string;

  @ApiProperty()
  @IsString()
  @Length(10, 1000)
  reason: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  targetSectionId?: string;
}

// FR-ACAD-015: Student ID Cards
export class GenerateIDCardDto {
  @ApiProperty()
  @IsString()
  studentId: string;

  @ApiProperty()
  @IsString()
  templateId: string;

  @ApiProperty()
  @IsDateString()
  validFrom: string;

  @ApiProperty()
  @IsDateString()
  validUntil: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photoUrl?: string;
}

export class CreateIDCardTemplateDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: ['STUDENT', 'TEACHER', 'STAFF'] })
  @IsEnum(['STUDENT', 'TEACHER', 'STAFF'])
  cardType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  schoolId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiProperty()
  @IsString()
  templateFront: string; // HTML template

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  templateBack?: string;
}

// FR-ACAD-019: Substitute Teachers
export class AssignSubstituteDto {
  @ApiProperty()
  @IsString()
  substituteTeacherId: string;

  @ApiProperty()
  @IsString()
  originalTeacherId: string;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sectionIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

// FR-ACAD-020: Makeup Classes
export class ScheduleMakeupClassDto {
  @ApiProperty()
  @IsString()
  sectionId: string;

  @ApiProperty()
  @IsString()
  teacherId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subjectId?: string;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty()
  @IsString()
  startTime: string;

  @ApiProperty()
  @IsString()
  endTime: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  venue?: string;

  @ApiProperty()
  @IsString()
  @Length(5, 500)
  reason: string;
}
