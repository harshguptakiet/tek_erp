import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Enable2FADto {
  @ApiProperty({ example: '123456', description: '6-digit TOTP code from authenticator app' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'Code must be 6 digits' })
  code: string;
}

export class Verify2FADto {
  @ApiProperty({ example: 'temp_token_here', description: 'Temporary token from login step 1' })
  @IsString()
  @IsNotEmpty()
  tempToken: string;

  @ApiProperty({ example: '123456', description: '6-digit TOTP code' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'Code must be 6 digits' })
  code: string;
}

export class Disable2FADto {
  @ApiProperty({ example: 'CurrentP@ssw0rd', description: 'Current password for verification' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: '123456', description: 'Current 6-digit TOTP code' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'Code must be 6 digits' })
  code: string;
}

export class UseBackupCodeDto {
  @ApiProperty({ example: 'temp_token_here', description: 'Temporary token from login step 1' })
  @IsString()
  @IsNotEmpty()
  tempToken: string;

  @ApiProperty({ example: 'ABC12345', description: '8-character backup code' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9]{8}$/, { message: 'Backup code must be 8 alphanumeric characters' })
  backupCode: string;
}

export class Enable2FAResponseDto {
  secret: string;
  qrCode: string; // Changed from qrCodeUrl to match frontend expectation
  backupCodes: string[]; // Added backup codes
}

export class TwoFactorRequiredDto {
  tempToken: string;
  message: string;
}
