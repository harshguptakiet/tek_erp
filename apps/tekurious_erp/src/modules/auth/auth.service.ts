import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { EventBusService } from '../../events/event-bus.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto, ChangePasswordDto, AuthResponseDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto } from './dto';
import { PhoneRegisterDto, SendOtpDto, VerifyOtpDto } from './dto/phone-register.dto';
import { Enable2FADto, Enable2FAResponseDto, Verify2FADto, Disable2FADto, UseBackupCodeDto, TwoFactorRequiredDto } from './dto/two-factor.dto';
import { OAuthUserDto } from './dto/oauth.dto';
import { SessionDto } from './dto/session.dto';
import { OtpService } from './services/otp.service';
import { TwoFactorService } from './services/two-factor.service';
import { SessionService } from './services/session.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private tempTokens = new Map<string, { userId: string; expiresAt: Date }>();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private eventBus: EventBusService,
    private otpService: OtpService,
    private twoFactorService: TwoFactorService,
    private sessionService: SessionService,
  ) {}

  /**
   * Register a new user
   */
  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    this.logger.log(`Registration attempt for email: ${dto.email}`);

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create user with profile and authentication
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        tenantId: dto.tenantId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        passwordHash: passwordHash,
        role: 'ORG_OWNER', // Default role, will be changed based on context
        status: 'PENDING_VERIFICATION',
        authProvider: 'LOCAL',
        emailVerified: false,
      },
      include: {
        userRolesNew: {
          include: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Generate email verification token
    const verificationToken = this.jwtService.sign(
      { userId: user.id, email: user.email, type: 'email_verification' },
      { expiresIn: '24h' }
    );

    // TODO: Send verification email
    this.logger.log(`Verification email should be sent to: ${user.email}`);
    this.logger.log(`Verification token: ${verificationToken}`);

    // Emit user registered event
    await this.eventBus.publish('user.registered', {
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      timestamp: new Date(),
    });

    this.logger.log(`User registered successfully: ${user.id}`);

    // Generate and return tokens
    return this.generateTokens(user);
  }

  /**
   * Login user
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    this.logger.log(`Login attempt for email: ${dto.email}`);

    // Find user with authentication
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        userRolesNew: {
          include: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.passwordHash) {
      // Record failed login attempt
      await this.recordLoginAttempt(dto.email, false, dto.ipAddress, dto.userAgent);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if account is locked
    const isLocked = await this.isAccountLocked(user.id);
    if (isLocked) {
      throw new UnauthorizedException('Account is temporarily locked due to multiple failed login attempts. Please try again later.');
    }

    // Check password expiry (FR-AUTH-019)
    if (user.lastPasswordChange) {
      const daysSinceChange = Math.floor(
        (Date.now() - user.lastPasswordChange.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceChange > 90) { // 90-day password expiry
        throw new UnauthorizedException('Password expired. Please reset your password.');
      }
    }

    // Check if user is active (allow PENDING_VERIFICATION to login with warning)
    if (user.status === 'SUSPENDED' || user.status === 'INACTIVE' || user.deletedAt) {
      throw new UnauthorizedException('Account is inactive or suspended');
    }
    // Warn if email not verified
    const emailVerificationWarning = user.status === 'PENDING_VERIFICATION' ? 'Please verify your email to access all features' : null;

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      // Handle failed login
      await this.handleFailedLogin(user);
      await this.recordLoginAttempt(dto.email, false, dto.ipAddress, dto.userAgent);
      throw new UnauthorizedException('Invalid email or password');
    }

    // FR-AUTH-026: Suspicious Activity Detection
    await this.checkSuspiciousActivity(user, dto.ipAddress, dto.userAgent);

    // Reset failed attempts on successful login
    if (user.failedLoginAttempts > 0) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
    }

    // Record successful login
    await this.recordLoginAttempt(dto.email, true, dto.ipAddress, dto.userAgent);

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // FR-AUTH-036: Send login notification
    await this.sendLoginNotification(user, dto.ipAddress, dto.userAgent);

    // Emit login event
    await this.eventBus.publish('user.logged_in', {
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      timestamp: new Date(),
    });

    this.logger.log(`User logged in successfully: ${user.id}`);

    // Generate and return tokens
    return this.generateTokens(user, dto.rememberMe);
  }

  /**
   * FR-AUTH-007: Login with phone number
   */
  async loginWithPhone(phone: string, password: string, ipAddress?: string, userAgent?: string, rememberMe?: boolean): Promise<AuthResponseDto> {
    this.logger.log(`Phone login attempt: ${phone}`);

    const user = await this.prisma.user.findUnique({
      where: { phone },
      include: {
        userRolesNew: {
          include: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid phone or password');
    }

    // Same security checks as email login
    const isLocked = await this.isAccountLocked(user.id);
    if (isLocked) {
      throw new UnauthorizedException('Account is temporarily locked');
    }

    if (user.status !== 'ACTIVE' || user.deletedAt) {
      throw new UnauthorizedException('Account is inactive or deleted');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      await this.handleFailedLogin(user);
      throw new UnauthorizedException('Invalid phone or password');
    }

    // Check suspicious activity
    await this.checkSuspiciousActivity(user, ipAddress, userAgent);

    // Reset failed attempts
    if (user.failedLoginAttempts > 0) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Send login notification
    await this.sendLoginNotification(user, ipAddress, userAgent);

    this.logger.log(`User logged in successfully via phone: ${user.id}`);

    return this.generateTokens(user, rememberMe);
  }

  /**
   * Validate user credentials (used by LocalStrategy)
   */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && user.passwordHash) {
      const isPasswordValid = await bcrypt.compare(
        password,
        user.passwordHash,
      );

      if (isPasswordValid) {
        const { passwordHash, ...result } = user;
        return result;
      }
    }

    return null;
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    this.logger.log(`Password change attempt for user: ${userId}`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.passwordHash) {
      throw new BadRequestException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        lastPasswordChange: new Date(),
      },
    });

    // Emit password changed event
    await this.eventBus.publish('user.password_changed', {
      userId: user.id,
      email: user.email,
      timestamp: new Date(),
    });

    this.logger.log(`Password changed successfully for user: ${userId}`);

    return { message: 'Password changed successfully' };
  }

  /**
   * Refresh access token
   */
  async refreshToken(userId: string): Promise<{ accessToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRolesNew: {
          include: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokens = this.generateTokens(user);
    return { accessToken: tokens.accessToken };
  }

  /**
   * Generate JWT tokens
   */
  private generateTokens(user: any, rememberMe: boolean = false): AuthResponseDto {
    const roles = user.userRolesNew?.map((ur: any) => ur.role.name) || [];

    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      roles,
    };

    // FR-AUTH-009: Remember Me - extend token expiry
    const expiresIn = rememberMe ? '30d' : '7d';
    const accessToken = this.jwtService.sign(payload, { expiresIn });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        tenantId: user.tenantId,
        roles,
      },
    };
  }

  /**
   * Record login attempt
   */
  private async recordLoginAttempt(
    email: string,
    success: boolean,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      await this.prisma.loginAttempt.create({
        data: {
          email,
          success,
          ipAddress,
          userAgent,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to record login attempt: ${error.message}`);
    }
  }

  /**
   * FR-AUTH-026: Check for suspicious activity
   */
  private async checkSuspiciousActivity(user: any, ipAddress?: string, userAgent?: string): Promise<void> {
    if (!ipAddress || !userAgent) return;

    // Get recent login attempts
    const recentLogins = await this.prisma.loginAttempt.findMany({
      where: {
        email: user.email,
        success: true,
        timestamp: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 10,
    });

    let isSuspicious = false;
    let reason = '';

    // Check for new device
    const knownUserAgents = recentLogins.map(l => l.userAgent);
    if (!knownUserAgents.includes(userAgent)) {
      isSuspicious = true;
      reason = 'New device detected';
    }

    // Check for new location (simplified - check if IP prefix changed)
    const knownIpPrefixes = recentLogins
      .map(l => l.ipAddress?.split('.').slice(0, 2).join('.'))
      .filter(Boolean);
    const currentIpPrefix = ipAddress.split('.').slice(0, 2).join('.');
    
    if (!knownIpPrefixes.includes(currentIpPrefix)) {
      isSuspicious = true;
      reason = reason ? `${reason}, New location detected` : 'New location detected';
    }

    if (isSuspicious) {
      // Log suspicious activity
      this.logger.warn(`Suspicious login detected for user ${user.id}: ${reason}`);
      
      // Emit event for notification
      await this.eventBus.publish('login.suspicious', {
        userId: user.id,
        email: user.email,
        reason,
        ipAddress,
        userAgent,
        timestamp: new Date(),
      });
    }
  }

  /**
   * FR-AUTH-036: Send login notification
   */
  private async sendLoginNotification(user: any, ipAddress?: string, userAgent?: string): Promise<void> {
    // TODO: Integrate with email service
    this.logger.log(`[LOGIN NOTIFICATION] User: ${user.email} | IP: ${ipAddress} | Device: ${userAgent}`);
    
    // Emit event for notification service
    await this.eventBus.publish('login.notification', {
      userId: user.id,
      email: user.email,
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });
  }

  /**
   * Forgot password - Send reset email
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    this.logger.log(`Password reset requested for: ${dto.email}`);

    // Always return success message (security - don't reveal if email exists)
    const message = 'If an account with that email exists, you will receive a password reset link.';

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      // Still return success to prevent email enumeration
      return { message };
    }

    // Generate password reset token (1 hour expiry)
    const resetToken = this.jwtService.sign(
      { userId: user.id, email: user.email, type: 'password_reset' },
      { expiresIn: '1h' }
    );

    // TODO: Send password reset email
    this.logger.log(`Password reset email should be sent to: ${user.email}`);
    this.logger.log(`Reset token: ${resetToken}`);
    this.logger.log(`Reset link: ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`);

    // Emit event
    await this.eventBus.publish('password.reset_requested', {
      userId: user.id,
      email: user.email,
      timestamp: new Date(),
    });

    return { message };
  }

  /**
   * Reset password with token
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    this.logger.log('Password reset attempt with token');

    try {
      // Verify token
      const payload = this.jwtService.verify(dto.token);

      if (payload.type !== 'password_reset') {
        throw new BadRequestException('Invalid token type');
      }

      // Find user
      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

      // Update password
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newPasswordHash,
          lastPasswordChange: new Date(),
        },
      });

      // Emit event
      await this.eventBus.publish('password.reset_completed', {
        userId: user.id,
        email: user.email,
        timestamp: new Date(),
      });

      this.logger.log(`Password reset successfully for user: ${user.id}`);

      return { message: 'Password has been reset successfully. You can now login with your new password.' };
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new BadRequestException('Invalid or expired reset token');
      }
      throw error;
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(dto: VerifyEmailDto): Promise<{ message: string; accessToken?: string }> {
    this.logger.log('Email verification attempt');

    try {
      // Verify token
      const payload = this.jwtService.verify(dto.token);

      if (payload.type !== 'email_verification') {
        throw new BadRequestException('Invalid token type');
      }

      // Find user
      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
        include: {
          userRolesNew: {
            include: {
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (user.emailVerified) {
        return { message: 'Email already verified' };
      }

      // Update user
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          status: 'ACTIVE',
        },
      });

      // Emit event
      await this.eventBus.publish('email.verified', {
        userId: user.id,
        email: user.email,
        timestamp: new Date(),
      });

      this.logger.log(`Email verified for user: ${user.id}`);

      // Auto-login user after verification
      const tokens = this.generateTokens(user);

      return {
        message: 'Email verified successfully',
        accessToken: tokens.accessToken,
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new BadRequestException('Invalid or expired verification token');
      }
      throw error;
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    this.logger.log(`Verification email resend requested for: ${email}`);

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return { message: 'If your email is registered, you will receive a verification link.' };
    }

    if (user.emailVerified) {
      return { message: 'Email is already verified' };
    }

    // Generate new verification token
    const verificationToken = this.jwtService.sign(
      { userId: user.id, email: user.email, type: 'email_verification' },
      { expiresIn: '24h' }
    );

    // TODO: Send verification email
    this.logger.log(`Verification email should be sent to: ${user.email}`);
    this.logger.log(`Verification token: ${verificationToken}`);

    return { message: 'If your email is registered, you will receive a verification link.' };
  }

  /**
   * Check if user account is locked due to failed attempts
   */
  private async isAccountLocked(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { lockedUntil: true },
    });

    if (!user || !user.lockedUntil) {
      return false;
    }

    // Check if lock has expired
    if (user.lockedUntil < new Date()) {
      // Lock expired, clear it
      await this.prisma.user.update({
        where: { id: userId },
        data: { lockedUntil: null, failedLoginAttempts: 0 },
      });
      return false;
    }

    return true;
  }

  /**
   * Handle failed login attempt and account locking
   */
  private async handleFailedLogin(user: any): Promise<void> {
    const failedAttempts = (user.failedLoginAttempts || 0) + 1;
    
    const updateData: any = {
      failedLoginAttempts: failedAttempts,
    };

    // Lock account after 5 failed attempts (15 minutes)
    if (failedAttempts >= 5) {
      updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      this.logger.warn(`Account locked for user ${user.id} due to failed attempts`);
      
      // Emit event
      await this.eventBus.publish('account.locked', {
        userId: user.id,
        email: user.email,
        reason: 'FAILED_LOGIN_ATTEMPTS',
        timestamp: new Date(),
      });
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });
  }

  // ==================== PHASE 2: PHONE AUTHENTICATION ====================

  /**
   * FR-AUTH-002: Send OTP to phone number
   */
  async sendPhoneOtp(dto: SendOtpDto): Promise<{ message: string }> {
    this.logger.log(`OTP requested for phone: ${dto.phone}`);
    await this.otpService.sendOtp(dto.phone);
    return { message: 'OTP sent successfully' };
  }

  /**
   * FR-AUTH-002: Register with phone number
   */
  async registerWithPhone(dto: PhoneRegisterDto, otp: string): Promise<AuthResponseDto> {
    this.logger.log(`Phone registration attempt: ${dto.phone}`);

    // Verify OTP first
    await this.otpService.verifyOtp(dto.phone, otp);

    // Check if phone already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (existingUser) {
      throw new BadRequestException('User with this phone number already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create user (phone pre-verified)
    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        passwordHash,
        role: 'STUDENT', // Default role for phone registration
        status: 'ACTIVE', // Phone pre-verified
        authProvider: 'LOCAL',
        emailVerified: false,
        phoneVerified: true,
      },
      include: {
        userRolesNew: {
          include: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    await this.eventBus.publish('user.registered_phone', {
      userId: user.id,
      phone: user.phone,
      timestamp: new Date(),
    });

    this.logger.log(`User registered with phone: ${user.id}`);
    return this.generateTokens(user);
  }

  /**
   * FR-AUTH-024: Verify phone for existing user
   */
  async verifyPhoneNumber(userId: string, phone: string, otp: string): Promise<{ message: string }> {
    await this.otpService.verifyOtp(phone, otp);

    await this.prisma.user.update({
      where: { id: userId },
      data: { phoneVerified: true },
    });

    await this.eventBus.publish('phone.verified', {
      userId,
      phone,
      timestamp: new Date(),
    });

    return { message: 'Phone verified successfully' };
  }

  // ==================== PHASE 2: TWO-FACTOR AUTHENTICATION ====================

  /**
   * FR-AUTH-010: Enable 2FA for user
   */
  async enable2FA(userId: string, dto: Enable2FADto): Promise<Enable2FAResponseDto> {
    this.logger.log(`2FA enable attempt for user: ${userId}`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA is already enabled');
    }

    // Generate secret
    const { secret, qrCodeUrl } = await this.twoFactorService.generateSecret(user.email);

    // Verify the code user entered
    const isValid = await this.twoFactorService.verifyToken(secret, dto.code);

    if (!isValid) {
      throw new BadRequestException('Invalid 2FA code');
    }

    // Encrypt secret
    const encryptedSecret = this.twoFactorService.encryptSecret(secret);

    // Generate backup codes
    const backupCodes = this.twoFactorService.generateBackupCodes();
    const hashedBackupCodes = backupCodes.map(code => 
      this.twoFactorService.hashBackupCode(code)
    );

    // Save to database
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: encryptedSecret,
        backupCodes: hashedBackupCodes,
      },
    });

    await this.eventBus.publish('2fa.enabled', {
      userId,
      email: user.email,
      timestamp: new Date(),
    });

    this.logger.log(`2FA enabled for user: ${userId}`);

    return {
      secret,
      qrCodeUrl,
      backupCodes,
    };
  }

  /**
   * FR-AUTH-011: Login with 2FA (Step 1 returns temp token)
   */
  async loginWith2FA(dto: LoginDto): Promise<AuthResponseDto | TwoFactorRequiredDto> {
    // Perform normal login first
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        userRolesNew: {
          include: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      await this.handleFailedLogin(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    // If 2FA not enabled, return tokens normally
    if (!user.twoFactorEnabled) {
      return this.login(dto);
    }

    // If 2FA enabled, return temp token
    const tempToken = this.jwtService.sign(
      { userId: user.id, type: '2fa_pending' },
      { expiresIn: '5m' }
    );

    this.tempTokens.set(tempToken, {
      userId: user.id,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    this.logger.log(`2FA required for user: ${user.id}`);

    return {
      tempToken,
      message: '2FA verification required',
    };
  }

  /**
   * FR-AUTH-011: Verify 2FA code (Step 2)
   */
  async verify2FA(dto: Verify2FADto): Promise<AuthResponseDto> {
    const tempData = this.tempTokens.get(dto.tempToken);

    if (!tempData || tempData.expiresAt < new Date()) {
      this.tempTokens.delete(dto.tempToken);
      throw new UnauthorizedException('Temporary token expired');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: tempData.userId },
      include: {
        userRolesNew: {
          include: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.twoFactorSecret) {
      throw new UnauthorizedException('2FA not configured');
    }

    // Decrypt secret
    const secret = this.twoFactorService.decryptSecret(user.twoFactorSecret);

    // Verify code
    const isValid = await this.twoFactorService.verifyToken(secret, dto.code);

    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    // Clear temp token
    this.tempTokens.delete(dto.tempToken);

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    this.logger.log(`2FA verified for user: ${user.id}`);

    return this.generateTokens(user);
  }

  /**
   * FR-AUTH-011: Use backup code for 2FA
   */
  async useBackupCode(dto: UseBackupCodeDto): Promise<AuthResponseDto> {
    const tempData = this.tempTokens.get(dto.tempToken);

    if (!tempData || tempData.expiresAt < new Date()) {
      this.tempTokens.delete(dto.tempToken);
      throw new UnauthorizedException('Temporary token expired');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: tempData.userId },
      include: {
        userRolesNew: {
          include: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.backupCodes || user.backupCodes.length === 0) {
      throw new UnauthorizedException('No backup codes available');
    }

    // Find matching backup code
    let matchIndex = -1;
    for (let i = 0; i < user.backupCodes.length; i++) {
      if (this.twoFactorService.verifyBackupCode(dto.backupCode, user.backupCodes[i])) {
        matchIndex = i;
        break;
      }
    }

    if (matchIndex === -1) {
      throw new UnauthorizedException('Invalid backup code');
    }

    // Remove used backup code
    const updatedBackupCodes = user.backupCodes.filter((_, index) => index !== matchIndex);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        backupCodes: updatedBackupCodes,
        lastLogin: new Date(),
      },
    });

    // Clear temp token
    this.tempTokens.delete(dto.tempToken);

    await this.eventBus.publish('2fa.backup_code_used', {
      userId: user.id,
      remainingCodes: updatedBackupCodes.length,
      timestamp: new Date(),
    });

    this.logger.log(`Backup code used for user: ${user.id}, remaining: ${updatedBackupCodes.length}`);

    return this.generateTokens(user);
  }

  /**
   * FR-AUTH-012: Disable 2FA
   */
  async disable2FA(userId: string, dto: Disable2FADto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Verify 2FA code
    const secret = this.twoFactorService.decryptSecret(user.twoFactorSecret);
    const isCodeValid = await this.twoFactorService.verifyToken(secret, dto.code);

    if (!isCodeValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    // Disable 2FA
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: [],
      },
    });

    // Terminate all other sessions
    await this.sessionService.terminateAllOtherSessions(userId, 'current');

    await this.eventBus.publish('2fa.disabled', {
      userId,
      timestamp: new Date(),
    });

    this.logger.log(`2FA disabled for user: ${userId}`);

    return { message: '2FA disabled successfully. All other sessions have been terminated.' };
  }

  // ==================== PHASE 2: OAUTH AUTHENTICATION ====================

  /**
   * FR-AUTH-003/004: Register or login with OAuth
   */
  async oauthLogin(oauthUser: OAuthUserDto): Promise<AuthResponseDto> {
    this.logger.log(`OAuth login attempt: ${oauthUser.provider} - ${oauthUser.email}`);

    // Check if user exists
    let user = await this.prisma.user.findUnique({
      where: { email: oauthUser.email },
      include: {
        userRolesNew: {
          include: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (user) {
      // User exists - update profile and login
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: oauthUser.firstName,
          lastName: oauthUser.lastName,
          lastLogin: new Date(),
        },
        include: {
          userRolesNew: {
            include: {
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      this.logger.log(`OAuth login successful: ${user.id}`);
    } else {
      // Create new user
      user = await this.prisma.user.create({
        data: {
          email: oauthUser.email,
          firstName: oauthUser.firstName,
          lastName: oauthUser.lastName,
          authProvider: oauthUser.provider,
          role: 'STUDENT',
          status: 'ACTIVE',
          emailVerified: true, // OAuth emails are pre-verified
        },
        include: {
          userRolesNew: {
            include: {
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      await this.eventBus.publish('user.registered_oauth', {
        userId: user.id,
        email: user.email,
        provider: oauthUser.provider,
        timestamp: new Date(),
      });

      this.logger.log(`New OAuth user created: ${user.id}`);
    }

    return this.generateTokens(user);
  }

  /**
   * FR-AUTH-029: Link OAuth provider to existing account
   */
  async linkOAuthProvider(userId: string, oauthUser: OAuthUserDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.email !== oauthUser.email) {
      throw new BadRequestException('OAuth email does not match account email');
    }

    // Update user to add OAuth provider (simplified - in production, use separate OAuthProvider table)
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        authProvider: oauthUser.provider,
      },
    });

    await this.eventBus.publish('oauth.linked', {
      userId,
      provider: oauthUser.provider,
      timestamp: new Date(),
    });

    return { message: `${oauthUser.provider} account linked successfully` };
  }

  /**
   * FR-AUTH-030: Unlink OAuth provider
   */
  async unlinkOAuthProvider(userId: string, provider: string, password: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Must have password set before unlinking OAuth
    if (!user.passwordHash) {
      throw new BadRequestException('Please set a password before unlinking OAuth provider');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Unlink provider (simplified)
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        authProvider: 'LOCAL',
      },
    });

    await this.eventBus.publish('oauth.unlinked', {
      userId,
      provider,
      timestamp: new Date(),
    });

    return { message: `${provider} account unlinked successfully` };
  }

  // ==================== PHASE 2: SESSION MANAGEMENT ====================

  /**
   * FR-AUTH-015: Get all user sessions
   */
  async getUserSessions(userId: string, currentSessionId?: string): Promise<SessionDto[]> {
    return this.sessionService.getUserSessions(userId, currentSessionId);
  }

  /**
   * FR-AUTH-015: Logout specific device/session
   */
  async logoutDevice(userId: string, sessionId: string): Promise<{ message: string }> {
    await this.sessionService.terminateSession(userId, sessionId);
    return { message: 'Device logged out successfully' };
  }

  /**
   * FR-AUTH-028: Logout all other devices
   */
  async logoutAllDevices(userId: string, password: string, twoFactorCode?: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Verify 2FA if enabled
    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        throw new UnauthorizedException('2FA code required');
      }

      const secret = this.twoFactorService.decryptSecret(user.twoFactorSecret);
      const isCodeValid = await this.twoFactorService.verifyToken(secret, twoFactorCode);

      if (!isCodeValid) {
        throw new UnauthorizedException('Invalid 2FA code');
      }
    }

    // Terminate all sessions
    const count = await this.sessionService.terminateAllSessions(userId);

    await this.eventBus.publish('sessions.terminated_all', {
      userId,
      sessionCount: count,
      timestamp: new Date(),
    });

    return { message: `All ${count} sessions terminated successfully` };
  }
}
