import {
  IsString, IsOptional, IsEnum, IsInt, IsBoolean,
  IsArray, IsNumber, Min, Max, Length, IsDateString, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ── Question Bank ─────────────────────────────────────────────────────────────

export class CreateQuestionDto {
  @ApiProperty()
  @IsString()
  @Length(5, 5000)
  question: string;

  @ApiProperty({ enum: ['MCQ', 'MULTI_SELECT', 'TRUE_FALSE', 'SHORT_ANSWER', 'LONG_ANSWER', 'FILL_BLANK', 'MATCH_FOLLOWING', 'DIAGRAM'] })
  @IsEnum(['MCQ', 'MULTI_SELECT', 'TRUE_FALSE', 'SHORT_ANSWER', 'LONG_ANSWER', 'FILL_BLANK', 'MATCH_FOLLOWING', 'DIAGRAM'])
  questionType: string;

  @ApiPropertyOptional()
  @IsOptional()
  options?: any; // JSON - array of options for MCQ

  @ApiProperty()
  @IsOptional()
  correctAnswer: any; // JSON - flexible format

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  board?: string;

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
  @IsString()
  topicId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'])
  difficultyLevel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bloomsTaxonomy?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.5)
  marks: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  negativeMarks?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  estimatedTime?: number; // seconds

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

// ── Exam ──────────────────────────────────────────────────────────────────────

export class ExamQuestionItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  questionBankId?: string; // from bank

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  question?: string; // custom question text

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['MCQ', 'MULTI_SELECT', 'TRUE_FALSE', 'SHORT_ANSWER', 'LONG_ANSWER', 'FILL_BLANK', 'MATCH_FOLLOWING', 'DIAGRAM'])
  questionType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  options?: any;

  @ApiPropertyOptional()
  @IsOptional()
  correctAnswer?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.5)
  marks: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  negativeMarks?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sectionName?: string;
}

export class CreateExamDto {
  @ApiProperty()
  @IsString()
  @Length(3, 200)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ['UNIT_TEST', 'TERM_EXAM', 'FINAL_EXAM', 'QUIZ', 'PRACTICE', 'MOCK_EXAM', 'COMPETITIVE'] })
  @IsEnum(['UNIT_TEST', 'TERM_EXAM', 'FINAL_EXAM', 'QUIZ', 'PRACTICE', 'MOCK_EXAM', 'COMPETITIVE'])
  examType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  teacherId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sectionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subjectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  grade?: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  totalMarks: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  passingMarks?: number;

  @ApiProperty()
  @IsInt()
  @Min(5)
  duration: number; // minutes

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasNegativeMarking?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  randomizeQuestions?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  randomizeOptions?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showResultsImmediately?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamQuestionItemDto)
  questions?: ExamQuestionItemDto[];
}

// ── Exam Attempt ──────────────────────────────────────────────────────────────

export class SubmitAnswerDto {
  @ApiProperty()
  @IsString()
  questionId: string;

  @ApiProperty()
  answer: any; // flexible - text, number, array, etc.

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  timeTaken?: number;
}

export class SubmitExamDto {
  @ApiProperty({ type: [SubmitAnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitAnswerDto)
  answers: SubmitAnswerDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  totalTimeTaken?: number;
}

// ── Grading / Evaluation ──────────────────────────────────────────────────────

export class GradeAnswerDto {
  @ApiProperty()
  @IsString()
  answerId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  marksAwarded: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  feedback?: string;
}

export class BulkGradeDto {
  @ApiProperty({ type: [GradeAnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GradeAnswerDto)
  grades: GradeAnswerDto[];
}

// ── Blueprint ─────────────────────────────────────────────────────────────────

export class CreateBlueprintDto {
  @ApiProperty()
  @IsString()
  @Length(3, 200)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  board?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  grade?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subjectId?: string;

  @ApiProperty()
  @IsOptional()
  distribution: any; // JSON: chapter/topic-wise marks distribution

  @ApiProperty()
  @IsNumber()
  @Min(1)
  totalMarks: number;

  @ApiProperty()
  @IsInt()
  @Min(5)
  duration: number; // minutes

  @ApiPropertyOptional()
  @IsOptional()
  difficultyDistribution?: any; // {easy: 30, medium: 50, hard: 20}

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isTemplate?: boolean;
}

// ── Grading Rubric ────────────────────────────────────────────────────────────

export class CreateRubricDto {
  @ApiProperty()
  @IsString()
  @Length(3, 200)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsOptional()
  criteria: any; // JSON array of criteria with levels and points

  @ApiProperty()
  @IsNumber()
  @Min(1)
  totalPoints: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
