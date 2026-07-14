import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsBoolean,
  IsArray,
  IsNumber,
  Min,
  Max,
  Length,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Mirrors ContentType enum in Prisma schema
export enum ContentTypeDto {
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT',
  IMAGE = 'IMAGE',
  INTERACTIVE = 'INTERACTIVE',
  QUIZ = 'QUIZ',
  PRESENTATION = 'PRESENTATION',
  EBOOK = 'EBOOK',
  AR_CONTENT = 'AR_CONTENT',
  VR_CONTENT = 'VR_CONTENT',
  SIMULATION = 'SIMULATION',
  GAME = 'GAME',
  LIVE_CLASS = 'LIVE_CLASS',
}

// FR-CONTENT-001: Create Content
export class CreateContentDto {
  @ApiProperty()
  @IsString()
  @Length(3, 200)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ContentTypeDto })
  @IsEnum(ContentTypeDto)
  contentType: ContentTypeDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  creatorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subjectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  topicId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  grade?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['CBSE', 'ICSE', 'ISC', 'STATE', 'IB', 'IGCSE', 'NIOS'])
  board?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  fileSize?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fileMimeType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number; // seconds

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'])
  difficultyLevel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningOutcomes?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnail?: string;
}

// FR-CONTENT-002: Update Content
export class UpdateContentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(3, 200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  fileSize?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fileMimeType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  duration?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'])
  difficultyLevel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningOutcomes?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  changeNotes?: string;
}

// FR-CONTENT-003: Content Review / Rating
export class ReviewContentDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  comment?: string;
}

// FR-CONTENT-004: Content Workflow (submit for review, approve, reject)
export class ContentWorkflowActionDto {
  @ApiProperty({ enum: ['SUBMIT', 'ASSIGN_REVIEWER', 'APPROVE', 'REJECT', 'PUBLISH', 'ARCHIVE', 'UNPUBLISH'] })
  @IsEnum(['SUBMIT', 'ASSIGN_REVIEWER', 'APPROVE', 'REJECT', 'PUBLISH', 'ARCHIVE', 'UNPUBLISH'])
  action: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedTo?: string; // reviewer userId

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  comment?: string;
}

// FR-CONTENT-005: Content Collection
export class CreateCollectionDto {
  @ApiProperty()
  @IsString()
  @Length(3, 200)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contentIds?: string[];
}

// FR-CONTENT-006: Save Content Draft
export class SaveDraftDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contentId?: string; // null = new content

  @ApiProperty()
  @IsString()
  @Length(3, 200)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ContentTypeDto })
  @IsEnum(ContentTypeDto)
  contentType: ContentTypeDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fileUrl?: string;
}

// FR-CONTENT-007: Content Moderation
export class ModerateContentDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED', 'FLAGGED', 'SUSPENDED'] })
  @IsEnum(['APPROVED', 'REJECTED', 'FLAGGED', 'SUSPENDED'])
  decision: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  reason?: string;
}

// FR-CONTENT-008: Learning Path
export class CreateLearningPathDto {
  @ApiProperty()
  @IsString()
  @Length(3, 200)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contentIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  grade?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subjectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
  difficultyLevel?: string;
}

// Content search/filter
export class ContentSearchDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string; // search query

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(ContentTypeDto)
  contentType?: ContentTypeDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  grade?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  board?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subjectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'])
  difficultyLevel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  creatorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
