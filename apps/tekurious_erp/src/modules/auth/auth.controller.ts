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
} from '@nestjs/common';
import { Request, Response } from 'express';
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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser, Public } from './decorators';

@ApiTags('Auth')
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
  ): Promise<AuthResponseDto | { requiresTwoFactor: boolean; tempToken: string; message: string }> {
    this.logger.log(`POST /auth/login - Email: ${loginDto.email}`);
    
    // Add IP and User Agent to DTO
    loginDto.ipAddress = req.ip || req.socket.remoteAddress;
    loginDto.userAgent = req.headers['user-agent'];

    return this.authService.login(loginDto);
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
  async logout(
    @CurrentUser('id') userId: string,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    this.logger.log(`POST /auth/logout - User ID: ${userId}`);
    
    // Extract token from Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      await this.authService.logout(userId, token);
    }
    
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
  async getAllSessions(@CurrentUser('id') userId: string) {
    this.logger.log(`GET /auth/sessions - User: ${userId}`);
    return this.authService.getAllSessions(userId);
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
}

