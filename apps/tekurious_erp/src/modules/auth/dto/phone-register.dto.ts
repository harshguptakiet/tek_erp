import { IsString, IsNotEmpty, Matches, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PhoneRegisterDto {
  @ApiProperty({ example: '+919876543210', description: 'Phone number in E.164 format' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, { message: 'Phone must be in E.164 format (e.g., +919876543210)' })
  phone: string;

  @ApiProperty({ example: 'John', description: 'First name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'StrongP@ss123', description: 'Password (8+ chars, uppercase, lowercase, digit, special char)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/, {
    message: 'Password must contain uppercase, lowercase, digit, and special character'
  })
  password: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Optional email', required: false })
  @IsOptional()
  @IsString()
  email?: string;
}

export class SendOtpDto {
  @ApiProperty({ example: '+919876543210', description: 'Phone number in E.164 format' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, { message: 'Phone must be in E.164 format' })
  phone: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '+919876543210', description: 'Phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP code' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'OTP must be 6 digits' })
  otp: string;
}
