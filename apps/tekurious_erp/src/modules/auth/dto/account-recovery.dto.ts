import { IsArray, IsString, IsEnum, IsNotEmpty, ValidateNested, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class SecurityQuestionDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  answer: string;
}

export class SetSecurityQuestionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SecurityQuestionDto)
  questions: SecurityQuestionDto[];
}

export class GetSecurityQuestionsDto {
  @IsString()
  @IsNotEmpty()
  identifier: string; // Email or phone
}

export class InitiateRecoveryDto {
  @IsString()
  @IsNotEmpty()
  identifier: string; // Email or phone

  @IsEnum(['SECURITY_QUESTIONS', 'EMAIL_LINK', 'ADMIN_APPROVAL'])
  recoveryMethod: 'SECURITY_QUESTIONS' | 'EMAIL_LINK' | 'ADMIN_APPROVAL';
}

export class SecurityAnswerDto {
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @IsString()
  @IsNotEmpty()
  answer: string;
}

export class VerifySecurityAnswersDto {
  @IsString()
  @IsNotEmpty()
  recoveryId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SecurityAnswerDto)
  answers: SecurityAnswerDto[];
}

export class CompleteRecoveryDto {
  @IsString()
  @IsNotEmpty()
  recoveryId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}
