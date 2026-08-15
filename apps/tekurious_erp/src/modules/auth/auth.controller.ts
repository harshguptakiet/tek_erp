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
  Res,
  Put,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { authThrottle } from './config/auth-throttle.config';
import { AuthService } from './auth.service';
import { RolesService } from './services/roles.service';
import { RegisterDto, LoginDto, PhoneLoginDto, ChangePasswordDto, AuthResponseDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto } from './dto';
import { PhoneRegisterDto, SendOtpDto, VerifyOtpDto } from './dto/phone-register.dto';
import { Enable2FADto, Enable2FAResponseDto, Verify2FADto, Disable2FADto, UseBackupCodeDto } from './dto/two-factor.dto';
import { CreateCustomRoleDto, UpdateCustomRoleDto, AssignCustomRoleDto, CustomRoleResponseDto } from './dto/custom-role.dto';
import { OAuthUserDto } from './dto/oauth.dto';
import { SessionDto, LogoutDeviceDto, LogoutAllDto } from './dto/session.dto';
import { JwtAuthGuard } from './guards';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { MicrosoftOAuthGuard } from './guards/microsoft-oauth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser, Public } from './decorators';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly rolesService: RolesService,
  ) {}

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
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto | { requiresTwoFactor: boolean; tempToken: string; message: string }> {
    this.logger.log(`POST /auth/login - Email: ${loginDto.email}`);
    
    // Add IP and User Agent to DTO
    loginDto.ipAddress = req.ip || req.socket.remoteAddress;
    loginDto.userAgent = req.headers['user-agent'];

    const result = await this.authService.login(loginDto);
    if ('refreshToken' in result && result.refreshToken) {
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: result.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });
    }
    return result;
  }

  /**
   * Get CSRF token for the current session
   * GET /api/v1/auth/csrf-token
   */
  @UseGuards(JwtAuthGuard)
  @Get('csrf-token')
  async getCsrfToken(@CurrentUser() user: any): Promise<{ csrfToken: string }> {
    this.logger.log(`GET /auth/csrf-token - User ID: ${user.id}`);
    return this.authService.getCsrfToken(user.id);
  }

  /**
   * Get current user profile
   * GET /api/v1/auth/me
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@CurrentUser() user: any): Promise<AuthResponseDto> {
    this.logger.log(`GET /auth/me - User ID: ${user.id}`);
    return this.authService.getCurrentUser(user.id);
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
   * FR-AUTH-014: Refresh token rotation
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body('refreshToken') bodyToken?: string,
  ): Promise<AuthResponseDto> {
    const refreshToken = bodyToken || req.cookies?.['refreshToken'];
    this.logger.log(`POST /auth/refresh - Refresh token provided`);
    
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }
    
    const result = await this.authService.refreshToken(refreshToken);
    if (result.refreshToken) {
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: result.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });
    }
    return result;
  }

  /**
   * Logout (client-side token removal)
   * POST /api/v1/auth/logout
   * FR-AUTH-013 & FR-AUTH-014: Blacklist access token and revoke refresh token
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser('id') userId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body('refreshToken') bodyToken?: string,
  ): Promise<{ message: string }> {
    this.logger.log(`POST /auth/logout - User ID: ${userId}`);
    
    const refreshToken = bodyToken || req.cookies?.['refreshToken'];
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      await this.authService.logout(userId, token, refreshToken);
    }
    
    res.clearCookie('refreshToken', { path: '/' });
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
   * FR-AUTH-002, FR-AUTH-024: Send OTP to phone (Public - for registration)
   * POST /api/v1/auth/phone/send-otp
   * Rate limit: 3 OTP per phone per hour (enforced by OtpService)
   */
  @Public()
  @Post('phone/send-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle(authThrottle.resendVerification) // Reuse 3 per hour throttle
  async sendPhoneOtpPublic(@Body('phone') phone: string): Promise<{ message: string }> {
    this.logger.log(`POST /auth/phone/send-otp - Phone: ${phone}`);
    return this.authService.sendPublicPhoneOtp(phone);
  }

  /**
   * FR-AUTH-002, FR-AUTH-024: Verify phone OTP (Authenticated - verify user's phone)
   * POST /api/v1/auth/phone/verify-otp
   */
  @UseGuards(JwtAuthGuard)
  @Post('phone/verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyPhoneOtp(
    @CurrentUser() user: any,
    @Body('phone') phone: string,
    @Body('otp') otp: string,
  ): Promise<{ message: string; phoneVerified: boolean }> {
    this.logger.log(`POST /auth/phone/verify-otp - User: ${user.id}, Phone: ${phone}`);
    return this.authService.verifyPhoneOtp(user.id, phone, otp);
  }

  /**
   * FR-AUTH-024: Send OTP to user's own phone (Authenticated - for profile phone change)
   * POST /api/v1/auth/phone/send-otp-auth
   */
  @UseGuards(JwtAuthGuard)
  @Post('phone/send-otp-auth')
  @HttpCode(HttpStatus.OK)
  @Throttle(authThrottle.resendVerification)
  async sendPhoneOtpAuth(
    @CurrentUser() user: any,
    @Body('phone') phone: string,
  ): Promise<{ message: string }> {
    this.logger.log(`POST /auth/phone/send-otp-auth - User: ${user.id}, Phone: ${phone}`);
    return this.authService.sendPhoneOtp(phone);
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

  // ==================== FR-AUTH-029 & 030: OAUTH ACCOUNT LINKING ====================

  /**
   * Link OAuth provider to existing account
   * POST /api/v1/auth/oauth/link
   */
  @UseGuards(JwtAuthGuard)
  @Post('oauth/link')
  @HttpCode(HttpStatus.OK)
  async linkOAuthProvider(
    @CurrentUser('id') userId: string,
    @Body() body: { provider: string; providerUserId: string; providerData: any },
  ): Promise<{ success: boolean; provider: string; message: string }> {
    this.logger.log(`POST /auth/oauth/link - User: ${userId}, Provider: ${body.provider}`);
    return this.authService.linkOAuthProvider(userId, body.provider, body.providerUserId, body.providerData);
  }

  /**
   * Unlink OAuth provider from account
   * DELETE /api/v1/auth/oauth/unlink/:provider
   */
  @UseGuards(JwtAuthGuard)
  @Delete('oauth/unlink/:provider')
  @HttpCode(HttpStatus.OK)
  async unlinkOAuthProvider(
    @CurrentUser('id') userId: string,
    @Param('provider') provider: string,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`DELETE /auth/oauth/unlink/${provider} - User: ${userId}`);
    return this.authService.unlinkOAuthProvider(userId, provider);
  }

  /**
   * Get linked OAuth providers
   * GET /api/v1/auth/oauth/linked
   */
  @UseGuards(JwtAuthGuard)
  @Get('oauth/linked')
  async getLinkedOAuthProviders(
    @CurrentUser('id') userId: string,
  ): Promise<Array<{ provider: string; linkedAt: Date }>> {
    this.logger.log(`GET /auth/oauth/linked - User: ${userId}`);
    return this.authService.getLinkedOAuthProviders(userId);
  }

  // ==================== FR-AUTH-015: SESSION MANAGEMENT ====================

  /**
   * Get all active sessions
   * GET /api/v1/auth/sessions
   */
  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  async getAllSessions(
    @CurrentUser('id') userId: string,
    @CurrentUser() user: any,
  ) {
    this.logger.log(`GET /auth/sessions - User: ${userId}`);
    return this.authService.getAllSessions(userId, user.sessionId);
  }

  /**
   * Revoke a specific session
   * DELETE /api/v1/auth/sessions/:sessionId
   */
  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:sessionId')
  @HttpCode(HttpStatus.OK)
  async revokeSession(
    @CurrentUser('id') userId: string,
    @Param('sessionId') sessionId: string,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`DELETE /auth/sessions/${sessionId} - User: ${userId}`);
    return this.authService.revokeSession(userId, sessionId);
  }

  /**
   * Revoke all sessions except current
   * POST /api/v1/auth/sessions/revoke-all
   */
  @UseGuards(JwtAuthGuard)
  @Post('sessions/revoke-all')
  @HttpCode(HttpStatus.OK)
  async revokeAllSessions(
    @CurrentUser('id') userId: string,
    @Body() body: { exceptSessionId?: string },
  ): Promise<{ success: boolean; count: number; message: string }> {
    this.logger.log(`POST /auth/sessions/revoke-all - User: ${userId}`);
    return this.authService.revokeAllSessions(userId, body.exceptSessionId);
  }

  // ==================== FR-AUTH-033 to 040: ADVANCED SECURITY ====================

  /**
   * Enable IP whitelist for organization
   * POST /api/v1/auth/security/ip-whitelist/enable
   */
  @UseGuards(JwtAuthGuard)
  @Post('security/ip-whitelist/enable')
  @HttpCode(HttpStatus.OK)
  async enableIPWhitelist(
    @CurrentUser('id') userId: string,
    @Body() body: { organizationId: string; ipAddresses: string[] },
  ): Promise<{ success: boolean; message: string; ipAddresses: string[] }> {
    this.logger.log(`POST /auth/security/ip-whitelist/enable - User: ${userId}`);
    return this.authService.enableIPWhitelist(userId, body.organizationId, body.ipAddresses);
  }

  /**
   * Disable IP whitelist for organization
   * POST /api/v1/auth/security/ip-whitelist/disable
   */
  @UseGuards(JwtAuthGuard)
  @Post('security/ip-whitelist/disable')
  @HttpCode(HttpStatus.OK)
  async disableIPWhitelist(
    @CurrentUser('id') userId: string,
    @Body() body: { organizationId: string },
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`POST /auth/security/ip-whitelist/disable - User: ${userId}`);
    return this.authService.disableIPWhitelist(userId, body.organizationId);
  }

  /**
   * Enable geo-blocking for organization
   * POST /api/v1/auth/security/geo-blocking/enable
   */
  @UseGuards(JwtAuthGuard)
  @Post('security/geo-blocking/enable')
  @HttpCode(HttpStatus.OK)
  async enableGeoBlocking(
    @CurrentUser('id') userId: string,
    @Body() body: { organizationId: string; blockedCountries: string[] },
  ): Promise<{ success: boolean; message: string; blockedCountries: string[] }> {
    this.logger.log(`POST /auth/security/geo-blocking/enable - User: ${userId}`);
    return this.authService.enableGeoBlocking(userId, body.organizationId, body.blockedCountries);
  }

  /**
   * Disable geo-blocking for organization
   * POST /api/v1/auth/security/geo-blocking/disable
   */
  @UseGuards(JwtAuthGuard)
  @Post('security/geo-blocking/disable')
  @HttpCode(HttpStatus.OK)
  async disableGeoBlocking(
    @CurrentUser('id') userId: string,
    @Body() body: { organizationId: string },
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`POST /auth/security/geo-blocking/disable - User: ${userId}`);
    return this.authService.disableGeoBlocking(userId, body.organizationId);
  }

  /**
   * Log security event
   * POST /api/v1/auth/security/log-event
   */
  @UseGuards(JwtAuthGuard)
  @Post('security/log-event')
  @HttpCode(HttpStatus.OK)
  async logSecurityEvent(
    @CurrentUser('id') userId: string,
    @Body() body: { eventType: string; metadata: any },
    @Req() req: Request,
  ): Promise<{ success: boolean }> {
    const metadata = {
      ...body.metadata,
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    };
    await this.authService.logSecurityEvent(userId, body.eventType, metadata);
    return { success: true };
  }

  // ==================== OAUTH LOGIN ROUTE HANDLERS (FR-AUTH-008) ====================

  @Public()
  @UseGuards(GoogleOAuthGuard)
  @Get('google')
  async googleAuth(@Req() req) {}

  @Public()
  @UseGuards(GoogleOAuthGuard)
  @Get('google/callback')
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const authResponse = await this.authService.oauthLogin(req.user);
    
    // Redirect to frontend with token and user data
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const token = authResponse.accessToken;
    const userData = encodeURIComponent(JSON.stringify(authResponse.user));
    
    return res.redirect(`${frontendUrl}/auth/oauth/success?token=${token}&user=${userData}`);
  }

  @Public()
  @UseGuards(MicrosoftOAuthGuard)
  @Get('microsoft')
  async microsoftAuth(@Req() req) {}

  @Public()
  @UseGuards(MicrosoftOAuthGuard)
  @Get('microsoft/callback')
  async microsoftAuthRedirect(@Req() req, @Res() res: Response) {
    const authResponse = await this.authService.oauthLogin(req.user);
    
    // Redirect to frontend with token and user data
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const token = authResponse.accessToken;
    const userData = encodeURIComponent(JSON.stringify(authResponse.user));
    
    return res.redirect(`${frontendUrl}/auth/oauth/success?token=${token}&user=${userData}`);
  }

  // ==================== SESSION SECURITY & ROTATION (FR-AUTH-033) ====================

  @UseGuards(JwtAuthGuard)
  @Post('security/rotate-keys')
  @HttpCode(HttpStatus.OK)
  async rotateKeys() {
    return this.authService.rotateSessionKeys();
  }

  // ==================== MAGIC LINKS (FR-AUTH-041-071) ====================

  @Public()
  @Post('magic-link/send')
  @HttpCode(HttpStatus.OK)
  async sendMagicLink(@Body('email') email: string) {
    return this.authService.sendMagicLink(email);
  }

  @Public()
  @Post('magic-link/login')
  @HttpCode(HttpStatus.OK)
  async loginWithMagicLink(@Body('token') token: string): Promise<AuthResponseDto> {
    return this.authService.loginWithMagicLink(token);
  }

  // ==================== API KEYS (FR-AUTH-041-071) ====================

  @UseGuards(JwtAuthGuard)
  @Post('api-keys')
  @HttpCode(HttpStatus.CREATED)
  async generateApiKey(@CurrentUser('id') userId: string, @Body('name') name: string) {
    return this.authService.generateApiKey(userId, name);
  }

  @UseGuards(JwtAuthGuard)
  @Get('api-keys')
  async listApiKeys(@CurrentUser('id') userId: string) {
    return this.authService.listApiKeys(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('api-keys/:id')
  @HttpCode(HttpStatus.OK)
  async revokeApiKey(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.authService.revokeApiKey(userId, id);
  }

  // ==================== IMPERSONATION (FR-AUTH-041-071) ====================

  @UseGuards(JwtAuthGuard)
  @Post('impersonate/:userId')
  @HttpCode(HttpStatus.OK)
  async impersonate(
    @CurrentUser('id') adminId: string,
    @Param('userId') targetUserId: string,
  ): Promise<AuthResponseDto> {
    return this.authService.impersonateUser(adminId, targetUserId);
  }

  // ==================== TWO-FACTOR AUTHENTICATION (FR-AUTH-010 to FR-AUTH-012) ====================

  /**
   * Enable 2FA - Step 1: Generate secret and QR code
   * POST /api/v1/auth/2fa/enable
   */
  @UseGuards(JwtAuthGuard)
  @Post('2fa/enable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enable 2FA - Generate secret and QR code' })
  @ApiBearerAuth()
  async enable2FA(
    @CurrentUser('id') userId: string,
  ): Promise<Enable2FAResponseDto> {
    this.logger.log(`POST /auth/2fa/enable - User: ${userId}`);
    return this.authService.enable2FA(userId);
  }

  /**
   * Enable 2FA - Step 2: Verify setup with TOTP code
   * POST /api/v1/auth/2fa/verify-setup
   */
  @UseGuards(JwtAuthGuard)
  @Post('2fa/verify-setup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify 2FA setup with authenticator code' })
  @ApiBearerAuth()
  async verify2FASetup(
    @CurrentUser('id') userId: string,
    @Body() dto: { code: string; secret: string; backupCodes: string[] },
  ): Promise<{ message: string }> {
    this.logger.log(`POST /auth/2fa/verify-setup - User: ${userId}`);
    return this.authService.verify2FASetup(userId, dto.code, dto.secret, dto.backupCodes);
  }

  /**
   * Disable 2FA
   * POST /api/v1/auth/2fa/disable
   */
  @UseGuards(JwtAuthGuard)
  @Post('2fa/disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disable 2FA for account' })
  @ApiBearerAuth()
  async disable2FA(
    @CurrentUser('id') userId: string,
    @Body() dto: Disable2FADto,
  ): Promise<{ message: string }> {
    this.logger.log(`POST /auth/2fa/disable - User: ${userId}`);
    return this.authService.disable2FA(userId, dto.password, dto.code);
  }

  /**
   * Verify 2FA code during login
   * POST /api/v1/auth/2fa/verify
   */
  @Public()
  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify 2FA code after password login' })
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 per minute
  async verify2FALogin(
    @Body() dto: Verify2FADto,
  ): Promise<AuthResponseDto> {
    this.logger.log(`POST /auth/2fa/verify - Temp token provided`);
    return this.authService.verify2FALogin(dto.tempToken, dto.code);
  }

  /**
   * Verify 2FA backup code during login
   * POST /api/v1/auth/2fa/verify-backup
   */
  @Public()
  @Post('2fa/verify-backup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify 2FA backup code after password login' })
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 per minute
  async verify2FABackupCode(
    @Body() dto: UseBackupCodeDto,
  ): Promise<AuthResponseDto> {
    this.logger.log(`POST /auth/2fa/verify-backup - Temp token provided`);
    return this.authService.verify2FABackupCode(dto.tempToken, dto.backupCode);
  }

  /**
   * Regenerate 2FA backup codes
   * POST /api/v1/auth/2fa/regenerate-backup-codes
   */
  @UseGuards(JwtAuthGuard)
  @Post('2fa/regenerate-backup-codes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Regenerate 2FA backup codes' })
  @ApiBearerAuth()
  async regenerate2FABackupCodes(
    @CurrentUser('id') userId: string,
    @Body() dto: { password: string; code: string },
  ): Promise<{ backupCodes: string[] }> {
    this.logger.log(`POST /auth/2fa/regenerate-backup-codes - User: ${userId}`);
    return this.authService.regenerate2FABackupCodes(userId, dto.password, dto.code);
  }

  // ==================== CUSTOM ROLES MANAGEMENT (FR-AUTH-021) ====================

  /**
   * Create custom role for organization
   * POST /api/v1/auth/roles
   */
  @UseGuards(JwtAuthGuard)
  @Post('roles')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create custom role for B2B organization' })
  @ApiBearerAuth()
  async createCustomRole(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCustomRoleDto,
  ): Promise<CustomRoleResponseDto> {
    this.logger.log(`POST /auth/roles - User: ${userId}, Role: ${dto.name}`);
    return this.rolesService.createCustomRole(dto, userId);
  }

  /**
   * Get all custom roles for organization
   * GET /api/v1/auth/roles/organization/:organizationId
   */
  @UseGuards(JwtAuthGuard)
  @Get('roles/organization/:organizationId')
  @ApiOperation({ summary: 'Get all custom roles for organization' })
  @ApiBearerAuth()
  async getOrganizationRoles(
    @Param('organizationId') organizationId: string,
  ): Promise<CustomRoleResponseDto[]> {
    this.logger.log(`GET /auth/roles/organization/${organizationId}`);
    return this.rolesService.getOrganizationRoles(organizationId);
  }

  /**
   * Get role by ID
   * GET /api/v1/auth/roles/:roleId
   */
  @UseGuards(JwtAuthGuard)
  @Get('roles/:roleId')
  @ApiOperation({ summary: 'Get role by ID with user count' })
  @ApiBearerAuth()
  async getRoleById(@Param('roleId') roleId: string): Promise<CustomRoleResponseDto> {
    this.logger.log(`GET /auth/roles/${roleId}`);
    return this.rolesService.getRoleById(roleId);
  }

  /**
   * Update custom role
   * PUT /api/v1/auth/roles/:roleId
   */
  @UseGuards(JwtAuthGuard)
  @Put('roles/:roleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update custom role' })
  @ApiBearerAuth()
  async updateCustomRole(
    @CurrentUser('id') userId: string,
    @Param('roleId') roleId: string,
    @Body() dto: UpdateCustomRoleDto,
  ): Promise<CustomRoleResponseDto> {
    this.logger.log(`PUT /auth/roles/${roleId} - User: ${userId}`);
    return this.rolesService.updateCustomRole(roleId, dto, userId);
  }

  /**
   * Delete custom role
   * DELETE /api/v1/auth/roles/:roleId
   */
  @UseGuards(JwtAuthGuard)
  @Delete('roles/:roleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete custom role' })
  @ApiBearerAuth()
  async deleteCustomRole(
    @CurrentUser('id') userId: string,
    @Param('roleId') roleId: string,
  ): Promise<{ message: string }> {
    this.logger.log(`DELETE /auth/roles/${roleId} - User: ${userId}`);
    return this.rolesService.deleteCustomRole(roleId, userId);
  }

  /**
   * Assign role to user
   * POST /api/v1/auth/roles/assign
   */
  @UseGuards(JwtAuthGuard)
  @Post('roles/assign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign custom role to user' })
  @ApiBearerAuth()
  async assignRoleToUser(
    @CurrentUser('id') assignedBy: string,
    @Body() dto: AssignCustomRoleDto,
  ): Promise<{ message: string }> {
    this.logger.log(`POST /auth/roles/assign - User: ${dto.userId}, Role: ${dto.roleId}`);
    return this.rolesService.assignRoleToUser(
      dto.userId,
      dto.roleId,
      dto.scopeType,
      dto.scopeId,
      assignedBy,
    );
  }

  /**
   * Remove role from user
   * DELETE /api/v1/auth/roles/:roleId/users/:userId
   */
  @UseGuards(JwtAuthGuard)
  @Delete('roles/:roleId/users/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove role from user' })
  @ApiBearerAuth()
  async removeRoleFromUser(
    @CurrentUser('id') removedBy: string,
    @Param('roleId') roleId: string,
    @Param('userId') userId: string,
  ): Promise<{ message: string }> {
    this.logger.log(`DELETE /auth/roles/${roleId}/users/${userId} - Removed by: ${removedBy}`);
    return this.rolesService.removeRoleFromUser(userId, roleId, removedBy);
  }

  /**
   * Get available permission categories
   * GET /api/v1/auth/roles/permissions
   */
  @UseGuards(JwtAuthGuard)
  @Get('roles/permissions')
  @ApiOperation({ summary: 'Get available permission categories' })
  @ApiBearerAuth()
  async getPermissionCategories() {
    this.logger.log(`GET /auth/roles/permissions`);
    return this.rolesService.getPermissionCategories();
  }

  // ==================== ADMIN: ACCOUNT UNLOCK (FR-AUTH-025) ====================

  /**
   * Admin unlock user account
   * POST /api/v1/auth/admin/unlock-account
   */
  @UseGuards(JwtAuthGuard)
  @Post('admin/unlock-account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin unlock locked user account' })
  @ApiBearerAuth()
  async adminUnlockAccount(
    @CurrentUser('id') adminId: string,
    @Body() body: { userId: string },
  ): Promise<{ message: string }> {
    this.logger.log(`POST /auth/admin/unlock-account - Admin: ${adminId}, User: ${body.userId}`);
    return this.authService.adminUnlockAccount(adminId, body.userId);
  }

  /**
   * Admin unblock IP address
   * POST /api/v1/auth/admin/unblock-ip
   * FR-AUTH-025: IP-based rate limiting with admin unblock
   */
  @UseGuards(JwtAuthGuard)
  @Post('admin/unblock-ip')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin unblock IP address' })
  @ApiBearerAuth()
  async adminUnblockIp(
    @CurrentUser('id') adminId: string,
    @Body() body: { ipAddress: string },
  ): Promise<{ message: string }> {
    this.logger.log(`POST /auth/admin/unblock-ip - Admin: ${adminId}, IP: ${body.ipAddress}`);
    return this.authService.adminUnblockIp(adminId, body.ipAddress);
  }

  /**
   * Get locked accounts (admin view)
   * GET /api/v1/auth/admin/locked-accounts
   */
  @UseGuards(JwtAuthGuard)
  @Get('admin/locked-accounts')
  @ApiOperation({ summary: 'Get list of locked accounts' })
  @ApiBearerAuth()
  async getLockedAccounts(): Promise<any[]> {
    this.logger.log('GET /auth/admin/locked-accounts');
    return this.authService.getLockedAccounts();
  }

  /**
   * Get blocked IPs (admin view)
   * GET /api/v1/auth/admin/blocked-ips
   */
  @UseGuards(JwtAuthGuard)
  @Get('admin/blocked-ips')
  @ApiOperation({ summary: 'Get list of blocked IP addresses' })
  @ApiBearerAuth()
  async getBlockedIps(): Promise<any[]> {
    this.logger.log('GET /auth/admin/blocked-ips');
    return this.authService.getBlockedIps();
  }

  // ==================== SESSION ACTIVITY PING (FR-AUTH-016) ====================

  /**
   * Keep session alive by updating activity timestamp
   * POST /api/v1/auth/sessions/ping
   */
  @UseGuards(JwtAuthGuard)
  @Post('sessions/ping')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Keep session alive (activity ping)' })
  @ApiBearerAuth()
  async pingSession(
    @CurrentUser('id') userId: string,
    @CurrentUser() user: any,
  ): Promise<{ success: boolean; remainingMs: number }> {
    this.logger.log(`POST /auth/sessions/ping - User: ${userId}`);
    return this.authService.pingSession(user.sessionId || user.id);
  }

  /**
   * Get session timeout configuration
   * GET /api/v1/auth/sessions/timeout-config
   */
  @Get('sessions/timeout-config')
  @ApiOperation({ summary: 'Get session timeout configuration' })
  async getTimeoutConfig(): Promise<{
    timeoutMs: number;
    warningThresholdMs: number;
  }> {
    return {
      timeoutMs: 30 * 60 * 1000, // 30 minutes
      warningThresholdMs: 5 * 60 * 1000, // 5 minutes warning
    };
  }

  // ==================== PASSWORD EXPIRY (FR-AUTH-019) ====================

  /**
   * Check password expiry status
   * GET /api/v1/auth/password-expiry-status
   */
  @UseGuards(JwtAuthGuard)
  @Get('password-expiry-status')
  @ApiOperation({ summary: 'Check password expiry status' })
  @ApiBearerAuth()
  async checkPasswordExpiry(@CurrentUser('id') userId: string): Promise<{
    isExpired: boolean;
    isInGracePeriod: boolean;
    daysRemaining: number;
    expiryDate: Date;
  }> {
    this.logger.log(`GET /auth/password-expiry-status - User: ${userId}`);
    return this.authService.checkPasswordExpiry(userId);
  }

  // ==================== TRUSTED DEVICES ====================

  /**
   * Get trusted devices
   * GET /api/v1/auth/trusted-devices
   */
  @UseGuards(JwtAuthGuard)
  @Get('trusted-devices')
  @ApiOperation({ summary: 'Get trusted devices' })
  @ApiBearerAuth()
  async getTrustedDevices(@CurrentUser('id') userId: string): Promise<{ devices: string[] }> {
    this.logger.log(`GET /auth/trusted-devices - User: ${userId}`);
    return this.authService.getTrustedDevices(userId);
  }

  /**
   * Mark current device as trusted
   * POST /api/v1/auth/trust-device
   */
  @UseGuards(JwtAuthGuard)
  @Post('trust-device')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark current device as trusted' })
  @ApiBearerAuth()
  async trustDevice(
    @CurrentUser('id') userId: string,
    @Req() req: Request,
  ): Promise<{ message: string; devices: string[] }> {
    const userAgent = req.headers['user-agent'];
    this.logger.log(`POST /auth/trust-device - User: ${userId}`);
    return this.authService.addTrustedDevice(userId, userAgent);
  }

  /**
   * Delete trusted device
   * DELETE /api/v1/auth/trusted-devices/:deviceId
   */
  @UseGuards(JwtAuthGuard)
  @Delete('trusted-devices/:deviceId')
  @ApiOperation({ summary: 'Remove trusted device' })
  @ApiBearerAuth()
  async removeTrustedDevice(
    @CurrentUser('id') userId: string,
    @Param('deviceId') deviceId: string,
  ): Promise<{ message: string; devices: string[] }> {
    this.logger.log(`DELETE /auth/trusted-devices/${deviceId} - User: ${userId}`);
    return this.authService.removeTrustedDevice(userId, deviceId);
  }
}
