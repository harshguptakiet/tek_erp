import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Get,
  Logger,
  Delete,
  Param,
} from '@nestjs/common';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { authThrottle } from './config/auth-throttle.config';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, PhoneLoginDto, ChangePasswordDto, AuthResponseDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto } from './dto';
import { PhoneRegisterDto, SendOtpDto, VerifyOtpDto } from './dto/phone-register.dto';
import { Enable2FADto, Enable2FAResponseDto, Verify2FADto, Disable2FADto, UseBackupCodeDto } from './dto/two-factor.dto';
import { OAuthUserDto } from './dto/oauth.dto';
import { SessionDto, LogoutDeviceDto, LogoutAllDto } from './dto/session.dto';
import { JwtAuthGuard } from './guards';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { MicrosoftOAuthGuard } from './guards/microsoft-oauth.guard';
import { CurrentUser, Public } from './decorators';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   * POST /api/v1/auth/register
   * Rate limit: 3 requests per 10 minutes per IP
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle(authThrottle.register)
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    this.logger.log(`POST /auth/register - Email: ${registerDto.email}`);
    return this.authService.register(registerDto);
  }

  /**
   * Login user
   * POST /api/v1/auth/login
   * Rate limit: 5 requests per minute per IP
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle(authThrottle.login)
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
  ): Promise<AuthResponseDto> {
    this.logger.log(`POST /auth/login - Email: ${loginDto.email}`);
    
    // Add IP and User Agent to DTO
    loginDto.ipAddress = req.ip || req.socket.remoteAddress;
    loginDto.userAgent = req.headers['user-agent'];

    return this.authService.login(loginDto);
  }

  /**
   * Login with phone number (FR-AUTH-007)
   * POST /api/v1/auth/login/phone
   * Rate limit: 5 requests per minute per IP
   */
  @Public()
  @Post('login/phone')
  @HttpCode(HttpStatus.OK)
  @Throttle(authThrottle.login)
  async loginWithPhone(
    @Body() phoneLoginDto: PhoneLoginDto,
    @Req() req: Request,
  ): Promise<AuthResponseDto> {
    this.logger.log(`POST /auth/login/phone - Phone: ${phoneLoginDto.phone}`);
    
    phoneLoginDto.ipAddress = req.ip || req.socket.remoteAddress;
    phoneLoginDto.userAgent = req.headers['user-agent'];

    return this.authService.loginWithPhone(
      phoneLoginDto.phone,
      phoneLoginDto.password,
      phoneLoginDto.ipAddress,
      phoneLoginDto.userAgent,
      phoneLoginDto.rememberMe
    );
  }

  /**
   * Get current user profile
   * GET /api/v1/auth/me
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@CurrentUser() user: any) {
    this.logger.log(`GET /auth/me - User ID: ${user.id}`);
    return {
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
      roles: user.roles,
    };
  }

  /**
   * Change password
   * POST /api/v1/auth/change-password
   */
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    this.logger.log(`POST /auth/change-password - User ID: ${userId}`);
    return this.authService.changePassword(userId, changePasswordDto);
  }

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh
   */
  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@CurrentUser('id') userId: string): Promise<{ accessToken: string }> {
    this.logger.log(`POST /auth/refresh - User ID: ${userId}`);
    return this.authService.refreshToken(userId);
  }

  /**
   * Logout (client-side token removal)
   * POST /api/v1/auth/logout
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser('id') userId: string): Promise<{ message: string }> {
    this.logger.log(`POST /auth/logout - User ID: ${userId}`);
    
    // In a JWT-based system, logout is primarily client-side
    // But we can record the logout event
    
    return { message: 'Logged out successfully' };
  }

  /**
   * Forgot password - Request password reset
   * POST /api/v1/auth/forgot-password
   * Rate limit: 3 requests per hour per IP
   */
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle(authThrottle.forgotPassword)
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ message: string }> {
    this.logger.log(`POST /auth/forgot-password - Email: ${dto.email}`);
    return this.authService.forgotPassword(dto);
  }

  /**
   * Reset password with token
   * POST /api/v1/auth/reset-password
   * Rate limit: 5 requests per hour per IP
   */
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle(authThrottle.resetPassword)
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    this.logger.log(`POST /auth/reset-password - Token provided`);
    return this.authService.resetPassword(dto);
  }

  /**
   * Verify email address
   * POST /api/v1/auth/verify-email
   */
  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<{ message: string; accessToken?: string }> {
    this.logger.log(`POST /auth/verify-email - Token provided`);
    return this.authService.verifyEmail(dto);
  }

  /**
   * Resend verification email
   * POST /api/v1/auth/resend-verification
   * Rate limit: 3 requests per hour per IP
   */
  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @Throttle(authThrottle.resendVerification)
  async resendVerification(@Body('email') email: string): Promise<{ message: string }> {
    this.logger.log(`POST /auth/resend-verification - Email: ${email}`);
    return this.authService.resendVerificationEmail(email);
  }

  /**
   * Check password strength (FR-AUTH-037)
   * POST /api/v1/auth/check-password-strength
   */
  @Public()
  @Post('check-password-strength')
  @HttpCode(HttpStatus.OK)
  async checkPasswordStrength(
    @Body() body: { password: string; email?: string; firstName?: string; lastName?: string }
  ): Promise<any> {
    const { PasswordStrengthUtil } = await import('./utils/password-strength.util');
    return PasswordStrengthUtil.calculateStrength(body.password, {
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
    });
  }

  // ==================== PHASE 2: PHONE AUTHENTICATION ENDPOINTS ====================

  /**
   * Send OTP to phone number
   * POST /api/v1/auth/phone/send-otp
   */
  @Public()
  @Post('phone/send-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle(authThrottle.phoneOtp)
  async sendPhoneOtp(@Body() dto: SendOtpDto): Promise<{ message: string }> {
    this.logger.log(`POST /auth/phone/send-otp - Phone: ${dto.phone}`);
    return this.authService.sendPhoneOtp(dto);
  }

  /**
   * Register with phone number
   * POST /api/v1/auth/phone/register
   */
  @Public()
  @Post('phone/register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle(authThrottle.phoneRegister)
  async registerWithPhone(
    @Body() dto: PhoneRegisterDto & { otp: string }
  ): Promise<AuthResponseDto> {
    this.logger.log(`POST /auth/phone/register - Phone: ${dto.phone}`);
    const { otp, ...registerDto } = dto;
    return this.authService.registerWithPhone(registerDto, otp);
  }

  /**
   * Verify phone number for authenticated user
   * POST /api/v1/auth/phone/verify
   */
  @UseGuards(JwtAuthGuard)
  @Post('phone/verify')
  @HttpCode(HttpStatus.OK)
  async verifyPhone(
    @CurrentUser('id') userId: string,
    @Body() dto: VerifyOtpDto,
  ): Promise<{ message: string }> {
    this.logger.log(`POST /auth/phone/verify - User: ${userId}`);
    return this.authService.verifyPhoneNumber(userId, dto.phone, dto.otp);
  }

  // ==================== PHASE 2: TWO-FACTOR AUTHENTICATION ENDPOINTS ====================

  /**
   * Enable 2FA
   * POST /api/v1/auth/2fa/enable
   */
  @UseGuards(JwtAuthGuard)
  @Post('2fa/enable')
  @HttpCode(HttpStatus.OK)
  async enable2FA(
    @CurrentUser('id') userId: string,
    @Body() dto: Enable2FADto,
  ): Promise<Enable2FAResponseDto> {
    this.logger.log(`POST /auth/2fa/enable - User: ${userId}`);
    return this.authService.enable2FA(userId, dto);
  }

  /**
   * Verify 2FA code during login
   * POST /api/v1/auth/2fa/verify
   */
  @Public()
  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  async verify2FA(@Body() dto: Verify2FADto): Promise<AuthResponseDto> {
    this.logger.log(`POST /auth/2fa/verify - Temp token provided`);
    return this.authService.verify2FA(dto);
  }

  /**
   * Use backup code for 2FA
   * POST /api/v1/auth/2fa/backup-code
   */
  @Public()
  @Post('2fa/backup-code')
  @HttpCode(HttpStatus.OK)
  async useBackupCode(@Body() dto: UseBackupCodeDto): Promise<AuthResponseDto> {
    this.logger.log(`POST /auth/2fa/backup-code - Temp token provided`);
    return this.authService.useBackupCode(dto);
  }

  /**
   * Disable 2FA
   * POST /api/v1/auth/2fa/disable
   */
  @UseGuards(JwtAuthGuard)
  @Post('2fa/disable')
  @HttpCode(HttpStatus.OK)
  async disable2FA(
    @CurrentUser('id') userId: string,
    @Body() dto: Disable2FADto,
  ): Promise<{ message: string }> {
    this.logger.log(`POST /auth/2fa/disable - User: ${userId}`);
    return this.authService.disable2FA(userId, dto);
  }

  // ==================== PHASE 2: OAUTH ENDPOINTS ====================

  /**
   * Initiate Google OAuth login
   * GET /api/v1/auth/google
   */
  @Public()
  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth() {
    // Redirects to Google
  }

  /**
   * Google OAuth callback
   * GET /api/v1/auth/google/callback
   */
  @Public()
  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthCallback(@Req() req: Request): Promise<AuthResponseDto> {
    this.logger.log(`GET /auth/google/callback - User: ${req.user['email']}`);
    return this.authService.oauthLogin(req.user as OAuthUserDto);
  }

  /**
   * Initiate Microsoft OAuth login
   * GET /api/v1/auth/microsoft
   */
  @Public()
  @Get('microsoft')
  @UseGuards(MicrosoftOAuthGuard)
  async microsoftAuth() {
    // Redirects to Microsoft
  }

  /**
   * Microsoft OAuth callback
   * GET /api/v1/auth/microsoft/callback
   */
  @Public()
  @Get('microsoft/callback')
  @UseGuards(MicrosoftOAuthGuard)
  async microsoftAuthCallback(@Req() req: Request): Promise<AuthResponseDto> {
    this.logger.log(`GET /auth/microsoft/callback - User: ${req.user['email']}`);
    return this.authService.oauthLogin(req.user as OAuthUserDto);
  }

  /**
   * Link OAuth provider to existing account
   * POST /api/v1/auth/oauth/link/:provider
   */
  @UseGuards(JwtAuthGuard)
  @Post('oauth/link/:provider')
  @HttpCode(HttpStatus.OK)
  async linkOAuth(
    @CurrentUser('id') userId: string,
    @Param('provider') provider: string,
    @Body() oauthUser: OAuthUserDto,
  ): Promise<{ message: string }> {
    this.logger.log(`POST /auth/oauth/link/${provider} - User: ${userId}`);
    return this.authService.linkOAuthProvider(userId, oauthUser);
  }

  /**
   * Unlink OAuth provider
   * POST /api/v1/auth/oauth/unlink/:provider
   */
  @UseGuards(JwtAuthGuard)
  @Post('oauth/unlink/:provider')
  @HttpCode(HttpStatus.OK)
  async unlinkOAuth(
    @CurrentUser('id') userId: string,
    @Param('provider') provider: string,
    @Body('password') password: string,
  ): Promise<{ message: string }> {
    this.logger.log(`POST /auth/oauth/unlink/${provider} - User: ${userId}`);
    return this.authService.unlinkOAuthProvider(userId, provider, password);
  }

  // ==================== PHASE 2: SESSION MANAGEMENT ENDPOINTS ====================

  /**
   * Get all active sessions
   * GET /api/v1/auth/sessions
   */
  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  async getSessions(@CurrentUser('id') userId: string): Promise<SessionDto[]> {
    this.logger.log(`GET /auth/sessions - User: ${userId}`);
    return this.authService.getUserSessions(userId);
  }

  /**
   * Logout specific device/session
   * DELETE /api/v1/auth/sessions/:sessionId
   */
  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:sessionId')
  @HttpCode(HttpStatus.OK)
  async logoutDevice(
    @CurrentUser('id') userId: string,
    @Param('sessionId') sessionId: string,
  ): Promise<{ message: string }> {
    this.logger.log(`DELETE /auth/sessions/${sessionId} - User: ${userId}`);
    return this.authService.logoutDevice(userId, sessionId);
  }

  /**
   * Logout all devices
   * POST /api/v1/auth/logout-all
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @CurrentUser('id') userId: string,
    @Body() dto: LogoutAllDto,
  ): Promise<{ message: string }> {
    this.logger.log(`POST /auth/logout-all - User: ${userId}`);
    return this.authService.logoutAllDevices(userId, dto.password, dto.twoFactorCode);
  }

  // ==================== FR-AUTH-031: ACCOUNT RECOVERY VIA SECURITY QUESTIONS ====================

  /**
   * Set security questions for authenticated user
   * POST /api/v1/auth/security-questions/set
   */
  @UseGuards(JwtAuthGuard)
  @Post('security-questions/set')
  @HttpCode(HttpStatus.OK)
  async setSecurityQuestions(
    @CurrentUser('id') userId: string,
    @Body() body: { questions: Array<{ question: string; answer: string }> },
  ): Promise<{ message: string }> {
    this.logger.log(`POST /auth/security-questions/set - User: ${userId}`);
    return this.authService.setSecurityQuestions(userId, body.questions);
  }

  /**
   * Get security questions for account recovery
   * POST /api/v1/auth/security-questions
   */
  @Public()
  @Post('security-questions')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async getSecurityQuestions(
    @Body('identifier') identifier: string,
  ): Promise<Array<{ id: string; question: string }>> {
    this.logger.log(`POST /auth/security-questions - Identifier: ${identifier}`);
    return this.authService.getSecurityQuestions(identifier);
  }

  /**
   * Initiate account recovery
   * POST /api/v1/auth/account-recovery/initiate
   */
  @Public()
  @Post('account-recovery/initiate')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 per 5 minutes
  async initiateAccountRecovery(
    @Body() body: { identifier: string; recoveryMethod: 'SECURITY_QUESTIONS' | 'EMAIL_LINK' | 'ADMIN_APPROVAL' },
  ): Promise<{ recoveryId: string; questions?: Array<{ id: string; question: string }>; message: string }> {
    this.logger.log(`POST /auth/account-recovery/initiate - Method: ${body.recoveryMethod}`);
    return this.authService.initiateAccountRecovery(body.identifier, body.recoveryMethod);
  }

  /**
   * Verify security answers
   * POST /api/v1/auth/account-recovery/verify
   */
  @Public()
  @Post('account-recovery/verify')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 per 5 minutes
  async verifySecurityAnswers(
    @Body() body: { recoveryId: string; answers: Array<{ questionId: string; answer: string }> },
  ): Promise<{ verified: boolean; message: string; resetToken?: string }> {
    this.logger.log(`POST /auth/account-recovery/verify - Recovery ID: ${body.recoveryId}`);
    return this.authService.verifySecurityAnswers(body.recoveryId, body.answers);
  }

  /**
   * Complete account recovery and reset password
   * POST /api/v1/auth/account-recovery/complete
   */
  @Public()
  @Post('account-recovery/complete')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 300000 } })
  async completeAccountRecovery(
    @Body() body: { recoveryId: string; newPassword: string },
  ): Promise<{ message: string; accessToken: string }> {
    this.logger.log(`POST /auth/account-recovery/complete - Recovery ID: ${body.recoveryId}`);
    return this.authService.completeAccountRecovery(body.recoveryId, body.newPassword);
  }
}
