import {
  IsString,
  IsOptional,
  IsEmail,
  IsDateString,
  IsEnum,
  Length,
  IsPhoneNumber,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  lastName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  middleName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ required: false, enum: ['MALE', 'FEMALE', 'OTHER'] })
  @IsOptional()
  @IsEnum(['MALE', 'FEMALE', 'OTHER'])
  gender?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  profileImage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
}

export class ChangeEmailDto {
  @ApiProperty({ example: 'newemail@example.com' })
  @IsEmail()
  newEmail: string;

  @ApiProperty({ example: 'CurrentPassword123!' })
  @IsString()
  currentPassword: string;
}

export class ChangePhoneDto {
  @ApiProperty({ example: '+919876543210' })
  @IsPhoneNumber()
  newPhone: string;

  @ApiProperty({ example: 'CurrentPassword123!' })
  @IsString()
  currentPassword: string;
}

export class VerifyPhoneOtpDto {
  @ApiProperty({ example: '+919876543210' })
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  otp: string;
}

export class PrivacySettingsDto {
  @ApiProperty({ required: false, enum: ['PUBLIC', 'ORGANIZATION', 'PRIVATE'] })
  @IsOptional()
  @IsEnum(['PUBLIC', 'ORGANIZATION', 'PRIVATE'])
  profileVisibility?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  showEmail?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  showPhone?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  allowSearchIndexing?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  showOnlineStatus?: boolean;

  @ApiProperty({ required: false, enum: ['EVERYONE', 'CONNECTIONS', 'NONE'] })
  @IsOptional()
  @IsEnum(['EVERYONE', 'CONNECTIONS', 'NONE'])
  allowDirectMessages?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  dataSharing?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  analyticsTracking?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  personalizedRecommendations?: boolean;
}

export class DeactivateAccountDto {
  @ApiProperty({ enum: ['TAKING_BREAK', 'PRIVACY_CONCERNS', 'TOO_MANY_NOTIFICATIONS', 'OTHER'] })
  @IsEnum(['TAKING_BREAK', 'PRIVACY_CONCERNS', 'TOO_MANY_NOTIFICATIONS', 'OTHER'])
  reason: string;

  @ApiProperty()
  @IsString()
  currentPassword: string;
}

export class UserProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ required: false })
  middleName?: string;

  @ApiProperty({ required: false })
  dateOfBirth?: Date;

  @ApiProperty({ required: false })
  gender?: string;

  @ApiProperty({ required: false })
  profileImage?: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  emailVerified: boolean;

  @ApiProperty()
  phoneVerified: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  lastLogin: Date;

  @ApiProperty()
  profileCompleteness: number;
}
