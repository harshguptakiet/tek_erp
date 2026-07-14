import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OAuthCallbackDto {
  @ApiProperty({ example: 'auth_code_here', description: 'OAuth authorization code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'state_token_here', description: 'CSRF state token' })
  @IsString()
  @IsNotEmpty()
  state: string;
}

export class LinkOAuthDto {
  @ApiProperty({ example: 'GOOGLE', description: 'OAuth provider to link' })
  @IsString()
  @IsNotEmpty()
  provider: 'GOOGLE' | 'MICROSOFT';

  @ApiProperty({ example: 'auth_code_here', description: 'OAuth authorization code' })
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class UnlinkOAuthDto {
  @ApiProperty({ example: 'GOOGLE', description: 'OAuth provider to unlink' })
  @IsString()
  @IsNotEmpty()
  provider: 'GOOGLE' | 'MICROSOFT';

  @ApiProperty({ example: 'CurrentP@ssw0rd', description: 'Password for verification' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class OAuthUserDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  provider: 'GOOGLE' | 'MICROSOFT';

  @IsString()
  providerId: string;

  picture?: string;
}
