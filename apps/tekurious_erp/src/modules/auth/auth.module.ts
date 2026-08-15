import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { MicrosoftStrategy } from './strategies/microsoft.strategy';
import { JwtAuthGuard, RolesGuard, CsrfGuard, PermissionsGuard } from './guards';
import { OtpService } from './services/otp.service';
import { TwoFactorService } from './services/two-factor.service';
import { SessionService } from './services/session.service';
import { SecurityService } from './services/security.service';
import { TokenBlacklistService } from './services/token-blacklist.service';
import { RefreshTokenService } from './services/refresh-token.service';
import { IpRateLimitService } from './services/ip-rate-limit.service';
import { DeviceDetectionService } from './services/device-detection.service';
import { PasswordExpiryService } from './services/password-expiry.service';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { SuspiciousActivityService } from './services/suspicious-activity.service';
import { RolesService } from './services/roles.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ScheduleModule.forRoot(), // Enable cron jobs
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '1h',
        } as any,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    GoogleStrategy,
    MicrosoftStrategy,
    JwtAuthGuard,
    RolesGuard,
    CsrfGuard,
    PermissionsGuard,
    OtpService,
    TwoFactorService,
    SessionService,
    SecurityService,
    TokenBlacklistService,
    RefreshTokenService,
    IpRateLimitService,
    DeviceDetectionService,
    PasswordExpiryService,
    EmailService,
    SmsService,
    SuspiciousActivityService,
    RolesService,
  ],
  exports: [AuthService, JwtAuthGuard, RolesGuard, CsrfGuard, PermissionsGuard, SecurityService, RolesService],
})
export class AuthModule {}
