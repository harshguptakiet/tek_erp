import { IsEmail, IsString, MinLength, MaxLength, IsOptional, Matches, IsBoolean } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'Password must contain uppercase, lowercase, number, and special character' }
  )
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  middleName?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName: string;

  @IsOptional()
  @IsBoolean()
  acceptTerms?: boolean;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'Phone number must be 10 digits' })
  phone?: string;

  @IsOptional()
  @IsString()
  tenantId?: string; // For school/organization signup
}
