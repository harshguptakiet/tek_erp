import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SessionDto {
  @ApiProperty({ example: 'ses_abc123', description: 'Session ID' })
  sessionId: string;

  @ApiProperty({ example: 'Chrome on Windows', description: 'Device information' })
  deviceInfo: string;

  @ApiProperty({ example: '192.168.1.1', description: 'IP address' })
  ipAddress: string;

  @ApiProperty({ example: 'Mumbai, India', description: 'Geographic location' })
  location: string;

  @ApiProperty({ example: '2026-07-10T15:30:00Z', description: 'Login time' })
  loginTime: Date;

  @ApiProperty({ example: '2026-07-10T16:45:00Z', description: 'Last activity time' })
  lastActivity: Date;

  @ApiProperty({ example: true, description: 'Is this the current session' })
  isCurrent: boolean;
}

export class LogoutDeviceDto {
  @ApiProperty({ example: 'ses_abc123', description: 'Session ID to terminate' })
  @IsString()
  @IsNotEmpty()
  sessionId: string;
}

export class LogoutAllDto {
  @ApiProperty({ example: 'CurrentP@ssw0rd', description: 'Password for verification' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: '123456', description: '2FA code if enabled', required: false })
  @IsOptional()
  @IsString()
  twoFactorCode?: string;
}
