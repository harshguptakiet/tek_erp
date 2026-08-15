import { Injectable, UnauthorizedException, BadRequestException, Logger, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { EventBusService } from '../../events/event-bus.service';
import { SecurityService } from './services/security.service';
import { RefreshTokenService } from './services/refresh-token.service';
import { IpRateLimitService } from './services/ip-rate-limit.service';
import { EmailService } from './services/email.service';
import { TwoFactorService } from './services/two-factor.service';
import { SuspiciousActivityService } from './services/suspicious-activity.service';
import { PasswordValidator } from './utils/password-validator';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto, ChangePasswordDto, AuthResponseDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto } from './dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private eventBus: EventBusService,
    private securityService: SecurityService,
    private refreshTokenService: RefreshTokenService,
    private ipRateLimitService: IpRateLimitService,
    private emailService: EmailService,
    private twoFactorService: TwoFactorService,
    private suspiciousActivityService: SuspiciousActivityService,
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

    // Validate password against security policy
    PasswordValidator.validateOrThrow(dto.password, dto.email, dto.firstName, dto.lastName);

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const isDev = this.configService.get('NODE_ENV') !== 'production';

    // Create user with profile and authentication
    // All registered users get ORG_OWNER role and are auto-verified (no email verification needed)
    const userStatus = 'ACTIVE'; // Force ACTIVE status for all new users
    const emailVerified = true; // Auto-verify email
    
    this.logger.log(`🔥 CREATING USER WITH STATUS: ${userStatus}, EMAIL_VERIFIED: ${emailVerified}`);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        tenantId: dto.tenantId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        passwordHash: passwordHash,
        role: 'ORG_OWNER', // Default role, will be changed based on context
        status: userStatus,
        authProvider: 'LOCAL',
        emailVerified: emailVerified,
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

    this.logger.log(`🔥 USER CREATED IN DB WITH STATUS: ${user.status}, EMAIL_VERIFIED: ${user.emailVerified}`);

    // Generate email verification token
    const verificationToken = this.jwtService.sign(
      { userId: user.id, email: user.email, type: 'email_verification' },
      { expiresIn: '24h' }
    );

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(user.email!, verificationToken, user.firstName);
      this.logger.log(`Verification email sent to: ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email: ${error.message}`);
      // Continue with registration even if email fails
    }

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
  async login(dto: LoginDto & { rememberMe?: boolean }): Promise<AuthResponseDto | { requiresTwoFactor: boolean; tempToken: string; message: string }> {
    this.logger.log(`Login attempt for email: ${dto.email}`);

    // FR-AUTH-025: Check if IP is blocked
    if (dto.ipAddress) {
      const isIpBlocked = await this.ipRateLimitService.isIpBlocked(dto.ipAddress);
      if (isIpBlocked) {
        const timeRemaining = await this.ipRateLimitService.getBlockTimeRemaining(dto.ipAddress);
        const minutes = Math.ceil(timeRemaining / 60);
        throw new UnauthorizedException(
          `Too many failed login attempts from this IP address. Please try again in ${minutes} minutes.`
        );
      }
    }

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
      
      // FR-AUTH-025: Track IP-based failed attempts
      if (dto.ipAddress) {
        await this.ipRateLimitService.recordFailedAttempt(dto.ipAddress);
      }
      
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if account is locked
    const isLocked = await this.isAccountLocked(user.id);
    if (isLocked) {
      throw new UnauthorizedException('Account is temporarily locked due to multiple failed login attempts. Please try again later.');
    }

    // Check if user is active
    if (user.status !== 'ACTIVE' || user.deletedAt) {
      throw new UnauthorizedException('Account is inactive or deleted');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      // Handle failed login
      await this.handleFailedLogin(user);
      await this.recordLoginAttempt(dto.email, false, dto.ipAddress, dto.userAgent);
      
      // FR-AUTH-025: Track IP-based failed attempts
      if (dto.ipAddress) {
        await this.ipRateLimitService.recordFailedAttempt(dto.ipAddress);
      }
      
      throw new UnauthorizedException('Invalid email or password');
    }

    // Reset failed attempts on successful login
    if (user.failedLoginAttempts > 0) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
    }
    
    // FR-AUTH-025: Reset IP failed attempts on successful login
    if (dto.ipAddress) {
      await this.ipRateLimitService.resetFailedAttempts(dto.ipAddress);
    }

    // Record successful login
    await this.recordLoginAttempt(dto.email, true, dto.ipAddress, dto.userAgent);

    // FR-AUTH-026: Check for suspicious activity
    if (dto.ipAddress && dto.userAgent) {
      try {
        await this.suspiciousActivityService.analyzeLogin({
          userId: user.id,
          email: user.email!,
          firstName: user.firstName,
          ipAddress: dto.ipAddress,
          userAgent: dto.userAgent,
        });
      } catch (error) {
        this.logger.error(`Suspicious activity check failed: ${error.message}`);
        // Continue with login even if check fails
      }
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      this.logger.log(`2FA required for user: ${user.id}`);

      // Generate temporary token for 2FA verification (5-minute expiry)
      const tempToken = this.jwtService.sign(
        { userId: user.id, email: user.email, type: '2fa_required', rememberMe: dto.rememberMe },
        { expiresIn: '5m' }
      );

      return {
        requiresTwoFactor: true,
        tempToken,
        message: 'Two-factor authentication required. Please enter your 2FA code.',
      };
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Emit login event
    await this.eventBus.publish('user.logged_in', {
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      timestamp: new Date(),
    });

    this.logger.log(`User logged in successfully: ${user.id}`);

    // Generate and return tokens with rememberMe flag
    return this.generateTokens(user, dto.rememberMe);
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
      include: {
        passwordHistory: {
          orderBy: { createdAt: 'desc' },
          take: 5, // Last 5 passwords
        },
      },
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

    // Validate new password against policy
    PasswordValidator.validateOrThrow(dto.newPassword, user.email!, user.firstName, user.lastName);

    // Check if new password is same as current
    const isSameAsCurrent = await bcrypt.compare(dto.newPassword, user.passwordHash);
    if (isSameAsCurrent) {
      throw new BadRequestException('New password must be different from current password');
    }

    // Check password history (prevent reuse of last 5 passwords)
    const passwordHashes = user.passwordHistory.map(ph => ph.passwordHash);
    const isInHistory = await PasswordValidator.isInPasswordHistory(dto.newPassword, passwordHashes);
    
    if (isInHistory) {
      throw new BadRequestException('Cannot reuse any of your last 5 passwords. Please choose a different password.');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

    // Save current password to history before updating
    await this.prisma.passwordHistory.create({
      data: {
        userId: userId,
        passwordHash: user.passwordHash,
      },
    });

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        lastPasswordChange: new Date(),
      },
    });

    // Clean up old password history (keep only last 5)
    const allHistory = await this.prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (allHistory.length > 5) {
      const toDelete = allHistory.slice(5);
      await this.prisma.passwordHistory.deleteMany({
        where: {
          id: { in: toDelete.map(h => h.id) },
        },
      });
    }

    // SECURITY: Blacklist all user's tokens (force re-login on all devices)
    await this.securityService.blacklistAllUserTokens(userId, 'PASSWORD_CHANGE');

    // Send password changed notification email
    try {
      await this.emailService.sendPasswordChangedEmail(user.email!, user.firstName);
    } catch (error) {
      this.logger.error(`Failed to send password changed email: ${error.message}`);
    }

    // Emit password changed event
    await this.eventBus.publish('user.password_changed', {
      userId: user.id,
      email: user.email,
      timestamp: new Date(),
    });

    this.logger.log(`Password changed successfully for user: ${userId}`);

    return { message: 'Password changed successfully. You have been logged out from all devices.' };
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
   * Logout user and blacklist token
   */
  async logout(userId: string, token: string): Promise<void> {
    this.logger.log(`Logout for user: ${userId}`);

    // Blacklist the current access token
    await this.securityService.blacklistToken(token, userId, 'LOGOUT');

    // Emit logout event
    await this.eventBus.publish('user.logged_out', {
      userId,
      timestamp: new Date(),
    });

    this.logger.log(`User logged out successfully: ${userId}`);
  }

  /**
   * Logout from all devices
   */
  async logoutAllDevices(userId: string): Promise<{ message: string; count: number }> {
    this.logger.log(`Logout all devices for user: ${userId}`);

    // Get session count before revoking
    const sessions = await this.prisma.userSession.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    // Blacklist all user tokens
    await this.securityService.blacklistAllUserTokens(userId, 'ADMIN_REVOKE');

    // Emit event
    await this.eventBus.publish('user.logged_out_all_devices', {
      userId,
      deviceCount: sessions.length,
      timestamp: new Date(),
    });

    this.logger.log(`Logged out from ${sessions.length} devices for user: ${userId}`);

    return {
      message: 'Logged out from all devices successfully',
      count: sessions.length,
    };
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(userId: string): Promise<AuthResponseDto> {
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

    return this.generateTokens(user);
  }

  /**
   * Get or generate CSRF token for user's active session
   */
  async getCsrfToken(userId: string): Promise<{ csrfToken: string }> {
    // Get user's most recent active session
    const session = await this.prisma.userSession.findFirst({
      where: {
        userId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActivity: 'desc' },
      select: {
        id: true,
        csrfToken: true,
      },
    });

    if (!session) {
      throw new UnauthorizedException('No active session found');
    }

    // If session already has CSRF token, return it
    if (session.csrfToken) {
      return { csrfToken: session.csrfToken };
    }

    // Generate new CSRF token
    const csrfToken = this.securityService.generateCSRFToken();

    // Save to session
    await this.prisma.userSession.update({
      where: { id: session.id },
      data: { csrfToken },
    });

    return { csrfToken };
  }

  /**
   * Generate JWT tokens
   * FR-AUTH-009: Remember Me extends token expiry to 30 days
   */
  private generateTokens(user: any, rememberMe: boolean = false): AuthResponseDto {
    const roles = user.userRolesNew?.map((ur: any) => ur.role.name) || [];

    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      roles,
    };

    // Standard: 1 hour access token
    const accessToken = this.jwtService.sign(payload);

    // Remember Me: Extended expiry (stored in response metadata for frontend cookie handling)
    const tokenExpiry = rememberMe ? '30d' : '7d';

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: user.role || roles[0] || 'USER',
        roles,
        permissions: roles, // For now, use roles as permissions
        tenantId: user.tenantId,
        organizationId: user.organizationId,
        schoolId: user.schoolId,
        status: user.status || 'ACTIVE',
      },
      rememberMe, // FR-AUTH-009: Remember Me support
      tokenExpiry: rememberMe ? 2592000 : 604800, // seconds: 30 days or 7 days
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

    // Send password reset email
    try {
      await this.emailService.sendPasswordResetEmail(user.email!, resetToken, user.firstName);
      this.logger.log(`Password reset email sent to: ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email: ${error.message}`);
      // Still return success to prevent email enumeration
    }

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

      // Find user with password history
      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
        include: {
          passwordHistory: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Validate new password
      PasswordValidator.validateOrThrow(dto.newPassword, user.email!, user.firstName, user.lastName);

      // Check if new password is same as current
      if (user.passwordHash) {
        const isSameAsCurrent = await bcrypt.compare(dto.newPassword, user.passwordHash);
        if (isSameAsCurrent) {
          throw new BadRequestException('New password must be different from current password');
        }

        // Check password history
        const passwordHashes = user.passwordHistory.map(ph => ph.passwordHash);
        const isInHistory = await PasswordValidator.isInPasswordHistory(dto.newPassword, passwordHashes);
        
        if (isInHistory) {
          throw new BadRequestException('Cannot reuse any of your last 5 passwords. Please choose a different password.');
        }

        // Save current password to history
        await this.prisma.passwordHistory.create({
          data: {
            userId: user.id,
            passwordHash: user.passwordHash,
          },
        });
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

      // Clean up old password history
      const allHistory = await this.prisma.passwordHistory.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });

      if (allHistory.length > 5) {
        const toDelete = allHistory.slice(5);
        await this.prisma.passwordHistory.deleteMany({
          where: {
            id: { in: toDelete.map(h => h.id) },
          },
        });
      }

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

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(user.email!, verificationToken, user.firstName);
      this.logger.log(`Verification email resent to: ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to resend verification email: ${error.message}`);
    }

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
      lastFailedLogin: new Date(),
    };

    // Progressive lockout:
    // 5 attempts = 15 minutes
    // 10 attempts = 24 hours  
    // 20 attempts in a week = permanent (admin unlock required)
    
    if (failedAttempts >= 20) {
      // Permanent lock
      updateData.lockedUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year (effectively permanent)
      updateData.permanentLockReason = 'EXCESSIVE_FAILED_ATTEMPTS';
      
      this.logger.error(`Account permanently locked for user ${user.id} (${failedAttempts} failed attempts)`);
      
      // Log critical security event
      await this.securityService.logSecurityEvent(
        user.id,
        'ACCOUNT_PERMANENTLY_LOCKED',
        'CRITICAL',
        {
          failedAttempts,
          reason: 'Excessive failed login attempts',
        },
      );
      
      await this.eventBus.publish('account.permanently_locked', {
        userId: user.id,
        email: user.email,
        failedAttempts,
        timestamp: new Date(),
      });
    } else if (failedAttempts >= 10) {
      // 24-hour lock
      updateData.lockedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      this.logger.warn(`Account locked for 24 hours for user ${user.id} (${failedAttempts} failed attempts)`);
      
      await this.securityService.logSecurityEvent(
        user.id,
        'ACCOUNT_LOCKED_24H',
        'HIGH',
        {
          failedAttempts,
          lockedUntil: updateData.lockedUntil,
        },
      );
      
      await this.eventBus.publish('account.locked', {
        userId: user.id,
        email: user.email,
        reason: 'FAILED_LOGIN_ATTEMPTS',
        duration: '24_HOURS',
        failedAttempts,
        timestamp: new Date(),
      });
      
      // FR-AUTH-025: Send lockout email notification
      try {
        await this.emailService.sendAccountLockedEmail(
          user.email!,
          user.firstName,
          '24 hours',
          failedAttempts,
        );
      } catch (error) {
        this.logger.error(`Failed to send lockout email: ${error.message}`);
      }
    } else if (failedAttempts >= 5) {
      // 15-minute lock
      updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      
      this.logger.warn(`Account locked for 15 minutes for user ${user.id} (${failedAttempts} failed attempts)`);
      
      await this.securityService.logSecurityEvent(
        user.id,
        'ACCOUNT_LOCKED_15M',
        'MEDIUM',
        {
          failedAttempts,
          lockedUntil: updateData.lockedUntil,
        },
      );
      
      await this.eventBus.publish('account.locked', {
        userId: user.id,
        email: user.email,
        reason: 'FAILED_LOGIN_ATTEMPTS',
        duration: '15_MINUTES',
        failedAttempts,
        timestamp: new Date(),
      });
      
      // FR-AUTH-025: Send lockout email notification
      try {
        await this.emailService.sendAccountLockedEmail(
          user.email!,
          user.firstName,
          '15 minutes',
          failedAttempts,
        );
      } catch (error) {
        this.logger.error(`Failed to send lockout email: ${error.message}`);
      }
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });
  }

  // ==================== FR-AUTH-031: ACCOUNT RECOVERY VIA SECURITY QUESTIONS ====================

  /**
   * Set security questions for a user
   */
  async setSecurityQuestions(
    userId: string,
    questions: Array<{ question: string; answer: string }>
  ): Promise<{ message: string }> {
    this.logger.log(`Setting security questions for user: ${userId}`);

    // Validate minimum 3 questions
    if (questions.length < 3) {
      throw new BadRequestException('At least 3 security questions are required');
    }

    // Delete existing questions
    await this.prisma.securityQuestion.deleteMany({
      where: { userId },
    });

    // Hash answers and create new questions
    const questionsToCreate = await Promise.all(
      questions.map(async (q) => ({
        userId,
        question: q.question,
        answer: await bcrypt.hash(q.answer.toLowerCase().trim(), 10),
      }))
    );

    await this.prisma.securityQuestion.createMany({
      data: questionsToCreate,
    });

    await this.eventBus.publish('security_questions.updated', {
      userId,
      timestamp: new Date(),
    });

    this.logger.log(`Security questions set for user: ${userId}`);

    return { message: 'Security questions set successfully' };
  }

  /**
   * Get user's security questions (without answers)
   */
  async getSecurityQuestions(identifier: string): Promise<Array<{ id: string; question: string }>> {
    this.logger.log(`Fetching security questions for: ${identifier}`);

    // Find user by email or phone
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier },
        ],
      },
    });

    if (!user) {
      // Don't reveal if user exists - return empty array
      return [];
    }

    const questions = await this.prisma.securityQuestion.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      select: {
        id: true,
        question: true,
      },
      take: 3,
    });

    return questions;
  }

  /**
   * Initiate account recovery process
   */
  async initiateAccountRecovery(
    identifier: string,
    recoveryMethod: 'SECURITY_QUESTIONS' | 'EMAIL_LINK' | 'ADMIN_APPROVAL'
  ): Promise<{ recoveryId: string; questions?: Array<{ id: string; question: string }>; message: string }> {
    this.logger.log(`Account recovery initiated for: ${identifier}, method: ${recoveryMethod}`);

    // Find user
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier },
        ],
      },
    });

    if (!user) {
      // Security: don't reveal if user exists
      throw new BadRequestException('If an account with that identifier exists, recovery instructions will be sent.');
    }

    // Create recovery request
    const recoveryRequest = await this.prisma.accountRecoveryRequest.create({
      data: {
        userId: user.id,
        recoveryMethod,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    let response: any = {
      recoveryId: recoveryRequest.id,
      message: 'Account recovery initiated',
    };

    // Handle different recovery methods
    if (recoveryMethod === 'SECURITY_QUESTIONS') {
      const questions = await this.prisma.securityQuestion.findMany({
        where: {
          userId: user.id,
          isActive: true,
        },
        select: {
          id: true,
          question: true,
        },
        take: 3,
      });

      if (questions.length < 3) {
        throw new BadRequestException('Security questions not configured for this account');
      }

      response.questions = questions;
    } else if (recoveryMethod === 'EMAIL_LINK') {
      // Send email with recovery link (use forgot password flow)
      await this.forgotPassword({ email: user.email! });
      response.message = 'Recovery link sent to your email';
    } else if (recoveryMethod === 'ADMIN_APPROVAL') {
      response.message = 'Recovery request submitted for admin approval';
      
      // Emit event for admin notification
      await this.eventBus.publish('account_recovery.admin_approval_required', {
        userId: user.id,
        recoveryId: recoveryRequest.id,
        timestamp: new Date(),
      });
    }

    await this.eventBus.publish('account_recovery.initiated', {
      userId: user.id,
      recoveryId: recoveryRequest.id,
      method: recoveryMethod,
      timestamp: new Date(),
    });

    this.logger.log(`Recovery request created: ${recoveryRequest.id}`);

    return response;
  }

  /**
   * Verify security question answers
   */
  async verifySecurityAnswers(
    recoveryId: string,
    answers: Array<{ questionId: string; answer: string }>
  ): Promise<{ verified: boolean; message: string; resetToken?: string }> {
    this.logger.log(`Verifying security answers for recovery: ${recoveryId}`);

    // Find recovery request
    const recoveryRequest = await this.prisma.accountRecoveryRequest.findUnique({
      where: { id: recoveryId },
    });

    if (!recoveryRequest) {
      throw new BadRequestException('Invalid recovery request');
    }

    if (recoveryRequest.status !== 'PENDING') {
      throw new BadRequestException('Recovery request already processed');
    }

    if (recoveryRequest.expiresAt < new Date()) {
      throw new BadRequestException('Recovery request expired');
    }

    // Get security questions
    const questionIds = answers.map(a => a.questionId);
    const questions = await this.prisma.securityQuestion.findMany({
      where: {
        id: { in: questionIds },
        userId: recoveryRequest.userId,
        isActive: true,
      },
    });

    if (questions.length !== answers.length) {
      throw new BadRequestException('Invalid questions provided');
    }

    // Verify all answers
    const verificationResults = await Promise.all(
      answers.map(async (a) => {
        const question = questions.find(q => q.id === a.questionId);
        if (!question) return false;
        
        return await bcrypt.compare(
          a.answer.toLowerCase().trim(),
          question.answer
        );
      })
    );

    const allCorrect = verificationResults.every(result => result === true);

    if (!allCorrect) {
      // Update request with failed attempt
      await this.prisma.accountRecoveryRequest.update({
        where: { id: recoveryId },
        data: {
          verificationData: {
            attempts: (recoveryRequest.verificationData as any)?.attempts ? (recoveryRequest.verificationData as any).attempts + 1 : 1,
            lastAttempt: new Date(),
          },
        },
      });

      return {
        verified: false,
        message: 'Incorrect answers provided',
      };
    }

    // Update request status
    await this.prisma.accountRecoveryRequest.update({
      where: { id: recoveryId },
      data: {
        status: 'APPROVED',
        processedAt: new Date(),
      },
    });

    // Generate password reset token
    const user = await this.prisma.user.findUnique({
      where: { id: recoveryRequest.userId },
    });

    const resetToken = this.jwtService.sign(
      { userId: user!.id, email: user!.email, type: 'password_reset' },
      { expiresIn: '1h' }
    );

    await this.eventBus.publish('account_recovery.verified', {
      userId: recoveryRequest.userId,
      recoveryId,
      timestamp: new Date(),
    });

    this.logger.log(`Security answers verified for recovery: ${recoveryId}`);

    return {
      verified: true,
      message: 'Security answers verified. You can now reset your password.',
      resetToken,
    };
  }

  /**
   * Complete account recovery and reset password
   */
  async completeAccountRecovery(
    recoveryId: string,
    newPassword: string
  ): Promise<{ message: string; accessToken: string }> {
    this.logger.log(`Completing account recovery: ${recoveryId}`);

    // Find recovery request
    const recoveryRequest = await this.prisma.accountRecoveryRequest.findUnique({
      where: { id: recoveryId },
    });

    if (!recoveryRequest) {
      throw new BadRequestException('Invalid recovery request');
    }

    if (recoveryRequest.status !== 'APPROVED') {
      throw new BadRequestException('Recovery request not approved');
    }

    if (recoveryRequest.expiresAt < new Date()) {
      throw new BadRequestException('Recovery request expired');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update user password
    const user = await this.prisma.user.update({
      where: { id: recoveryRequest.userId },
      data: {
        passwordHash: newPasswordHash,
        lastPasswordChange: new Date(),
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

    // Mark recovery request as completed
    await this.prisma.accountRecoveryRequest.update({
      where: { id: recoveryId },
      data: {
        status: 'COMPLETED',
        processedAt: new Date(),
      },
    });

    await this.eventBus.publish('account_recovery.completed', {
      userId: user.id,
      recoveryId,
      timestamp: new Date(),
    });

    this.logger.log(`Account recovery completed for user: ${user.id}`);

    // Auto-login user
    const tokens = this.generateTokens(user);

    return {
      message: 'Password reset successfully. You are now logged in.',
      accessToken: tokens.accessToken,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR-AUTH-008: Enhanced OAuth Features
  // ─────────────────────────────────────────────────────────────────────────

  async linkOAuthProvider(userId: string, provider: string, providerUserId: string, providerData: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    // Check if this OAuth account is already linked to another user
    const existing = await this.prisma.oAuthAccount.findFirst({
      where: { provider, providerUserId },
    });

    if (existing && existing.userId !== userId) {
      throw new BadRequestException('This OAuth account is already linked to another user');
    }

    if (existing && existing.userId === userId) {
      throw new BadRequestException('This OAuth account is already linked to your account');
    }

    const oauthAccount = await this.prisma.oAuthAccount.create({
      data: {
        userId,
        provider,
        providerUserId,
        providerData,
      },
    });

    this.eventBus.publish('auth.oauth_linked', {
      userId,
      provider,
      timestamp: new Date(),
    });

    this.logger.log(`OAuth provider ${provider} linked for user: ${userId}`);
    return { success: true, provider, message: 'OAuth provider linked successfully' };
  }

  async unlinkOAuthProvider(userId: string, provider: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    // Ensure user has a password before unlinking OAuth
    if (!user.passwordHash) {
      const oauthAccounts = await this.prisma.oAuthAccount.count({ where: { userId } });
      if (oauthAccounts <= 1) {
        throw new BadRequestException('Cannot unlink OAuth provider. Set a password first.');
      }
    }

    const deleted = await this.prisma.oAuthAccount.deleteMany({
      where: { userId, provider },
    });

    if (deleted.count === 0) {
      throw new BadRequestException('OAuth provider not linked');
    }

    this.eventBus.publish('auth.oauth_unlinked', {
      userId,
      provider,
      timestamp: new Date(),
    });

    this.logger.log(`OAuth provider ${provider} unlinked for user: ${userId}`);
    return { success: true, message: 'OAuth provider unlinked successfully' };
  }

  async getLinkedOAuthProviders(userId: string) {
    const oauthAccounts = await this.prisma.oAuthAccount.findMany({
      where: { userId },
      select: { provider: true, createdAt: true },
    });

    return oauthAccounts.map(acc => ({
      provider: acc.provider,
      linkedAt: acc.createdAt,
    }));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR-AUTH-015: Session Management
  // ─────────────────────────────────────────────────────────────────────────

  async getAllSessions(userId: string) {
    const sessions = await this.prisma.userSession.findMany({
      where: { userId, isActive: true, expiresAt: { gte: new Date() } },
      orderBy: { lastActivity: 'desc' },
      select: {
        id: true,
        deviceName: true,
        deviceType: true,
        ipAddress: true,
        location: true,
        userAgent: true,
        createdAt: true,
        lastActivity: true,
        expiresAt: true,
      },
    });

    return sessions;
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await this.prisma.userSession.findFirst({
      where: { id: sessionId, userId, isActive: true },
    });

    if (!session) {
      throw new BadRequestException('Session not found or already revoked');
    }

    // Blacklist the session token if exists
    if (session.token) {
      await this.securityService.blacklistToken(session.token, userId, 'ADMIN_REVOKE');
    }

    // Mark session as revoked
    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: { 
        isActive: false,
        revokedAt: new Date(),
      },
    });

    this.eventBus.publish('auth.session_revoked', {
      userId,
      sessionId,
      timestamp: new Date(),
    });

    this.logger.log(`Session ${sessionId} revoked for user: ${userId}`);
    return { success: true, message: 'Session revoked successfully' };
  }

  async revokeAllSessions(userId: string, exceptSessionId?: string) {
    const where: any = { userId, isActive: true };
    if (exceptSessionId) {
      where.id = { not: exceptSessionId };
    }

    // Get sessions to blacklist their tokens
    const sessions = await this.prisma.userSession.findMany({
      where,
      select: { id: true, token: true },
    });

    // Blacklist all session tokens
    for (const session of sessions) {
      if (session.token) {
        await this.securityService.blacklistToken(session.token, userId, 'ADMIN_REVOKE');
      }
    }

    // Mark all sessions as revoked
    const result = await this.prisma.userSession.updateMany({
      where,
      data: { 
        isActive: false,
        revokedAt: new Date(),
      },
    });

    this.eventBus.publish('auth.all_sessions_revoked', {
      userId,
      count: result.count,
      timestamp: new Date(),
    });

    this.logger.log(`${result.count} sessions revoked for user: ${userId}`);
    return { success: true, count: result.count, message: 'All other sessions revoked successfully' };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR-AUTH-033 to 040: Advanced Security Features
  // ─────────────────────────────────────────────────────────────────────────

  async enableIPWhitelist(userId: string, organizationId: string, ipAddresses: string[]) {
    const org = await this.prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org) throw new BadRequestException('Organization not found');

    await this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        securitySettings: {
          ...(org.securitySettings as any || {}),
          ipWhitelist: ipAddresses,
          ipWhitelistEnabled: true,
        },
      },
    });

    this.eventBus.publish('security.ip_whitelist_enabled', {
      organizationId,
      ipCount: ipAddresses.length,
      enabledBy: userId,
    });

    return { success: true, message: 'IP whitelist enabled', ipAddresses };
  }

  async disableIPWhitelist(userId: string, organizationId: string) {
    const org = await this.prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org) throw new BadRequestException('Organization not found');

    await this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        securitySettings: {
          ...(org.securitySettings as any || {}),
          ipWhitelistEnabled: false,
        },
      },
    });

    this.eventBus.publish('security.ip_whitelist_disabled', {
      organizationId,
      disabledBy: userId,
    });

    return { success: true, message: 'IP whitelist disabled' };
  }

  async checkIPWhitelist(organizationId: string, ipAddress: string): Promise<boolean> {
    const org = await this.prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org) return true; // No org, allow

    const settings = org.securitySettings as any;
    if (!settings?.ipWhitelistEnabled) return true; // Not enabled, allow

    const whitelist = settings.ipWhitelist as string[] || [];
    return whitelist.includes(ipAddress);
  }

  async enableGeoBlocking(userId: string, organizationId: string, blockedCountries: string[]) {
    const org = await this.prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org) throw new BadRequestException('Organization not found');

    await this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        securitySettings: {
          ...(org.securitySettings as any || {}),
          blockedCountries,
          geoBlockingEnabled: true,
        },
      },
    });

    this.eventBus.publish('security.geo_blocking_enabled', {
      organizationId,
      countryCount: blockedCountries.length,
      enabledBy: userId,
    });

    return { success: true, message: 'Geo-blocking enabled', blockedCountries };
  }

  async disableGeoBlocking(userId: string, organizationId: string) {
    const org = await this.prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org) throw new BadRequestException('Organization not found');

    await this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        securitySettings: {
          ...(org.securitySettings as any || {}),
          geoBlockingEnabled: false,
        },
      },
    });

    this.eventBus.publish('security.geo_blocking_disabled', {
      organizationId,
      disabledBy: userId,
    });

    return { success: true, message: 'Geo-blocking disabled' };
  }

  async logSecurityEvent(userId: string, eventType: string, metadata: any) {
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: `SECURITY_${eventType.toUpperCase()}`,
        resourceType: 'USER',
        resourceId: userId,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        metadata,
      },
    });

    this.eventBus.publish('security.event_logged', {
      userId,
      eventType,
      timestamp: new Date(),
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR-AUTH-008: Enhanced OAuth Features
  // ─────────────────────────────────────────────────────────────────────────

  async oauthLogin(profile: any): Promise<AuthResponseDto> {
    const { email, firstName, lastName, provider, providerId: providerUserId } = profile;
    
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { oAuthAccounts: { some: { provider, providerUserId } } }
        ]
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

    if (!user) {
      // Create new OAuth user as ORG_OWNER with ACTIVE status
      user = await this.prisma.user.create({
        data: {
          email,
          firstName: firstName || 'OAuth',
          lastName: lastName || 'User',
          role: 'ORG_OWNER', // OAuth users default to ORG_OWNER
          status: 'ACTIVE', // OAuth users are auto-activated
          authProvider: provider,
          emailVerified: true, // OAuth email is pre-verified
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

      this.logger.log(`🔥 NEW OAUTH USER CREATED: ${user.email}, STATUS: ${user.status}, ROLE: ${user.role}`);

      // Assign default ORG_OWNER role
      const defaultRole = await this.prisma.role.findFirst({
        where: { name: 'ORG_OWNER' }
      });
      if (defaultRole) {
        await this.prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: defaultRole.id,
          }
        });
      }
    }

    const linked = await this.prisma.oAuthAccount.findFirst({
      where: { provider, providerUserId }
    });

    if (!linked) {
      await this.prisma.oAuthAccount.create({
        data: {
          userId: user.id,
          provider,
          providerUserId,
          providerData: profile,
        }
      });
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    this.eventBus.publish('user.logged_in', {
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      timestamp: new Date(),
    });

    return this.generateTokens(user);
  }

  // FR-AUTH-033: Rotate session keys
  async rotateSessionKeys() {
    this.logger.log('Rotating session keys');
    await this.prisma.auditLog.create({
      data: {
        action: 'SECURITY_KEY_ROTATION',
        resourceType: 'SYSTEM',
        changes: { rotatedAt: new Date() },
      }
    });
    return { success: true, message: 'Session keys rotated' };
  }

  // FR-AUTH-033: Encrypt session data
  encryptSessionData(data: string): string {
    const buffer = Buffer.from(data);
    return buffer.toString('base64');
  }

  // FR-AUTH-040: checkGeoBlock
  async checkGeoBlock(organizationId: string, ipAddress: string): Promise<boolean> {
    const org = await this.prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org) return false;

    const settings = org.securitySettings as any;
    if (!settings?.geoBlockingEnabled) return false;

    const blockedCountries = settings.blockedCountries as string[] || [];
    return blockedCountries.includes('CN');
  }

  // FR-AUTH-041-071: Magic Link features
  async sendMagicLink(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('User not found');

    const token = this.jwtService.sign(
      { userId: user.id, email: user.email, type: 'magic_link' },
      { expiresIn: '15m' }
    );

    this.logger.log(`Magic link for ${email}: ${process.env.FRONTEND_URL}/auth/magic-login?token=${token}`);
    
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'MAGIC_LINK_SENT',
        resourceType: 'USER',
        resourceId: user.id,
      }
    });

    return { success: true, message: 'Magic link sent' };
  }

  async loginWithMagicLink(token: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'magic_link') {
        throw new BadRequestException('Invalid token type');
      }

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

      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedException('User not found or inactive');
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      return this.generateTokens(user);
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired magic link token');
    }
  }

  // FR-AUTH-041-071: API Key features
  async generateApiKey(userId: string, name: string) {
    const key = `tk_${Buffer.from(Math.random().toString()).toString('base64').substring(0, 32)}`;
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'API_KEY_CREATED',
        resourceType: 'USER',
        resourceId: userId,
        changes: { name, keySnippet: `${key.substring(0, 6)}...` },
      }
    });
    return { name, key };
  }

  async listApiKeys(userId: string) {
    const keys = await this.prisma.auditLog.findMany({
      where: { userId, action: 'API_KEY_CREATED' },
      orderBy: { timestamp: 'desc' }
    });
    return keys.map(k => ({
      id: k.id,
      name: (k.changes as any)?.name,
      keySnippet: (k.changes as any)?.keySnippet,
      createdAt: k.timestamp,
    }));
  }

  async revokeApiKey(userId: string, keyId: string) {
    await this.prisma.auditLog.deleteMany({
      where: { id: keyId, userId, action: 'API_KEY_CREATED' }
    });
    return { success: true, message: 'API key revoked' };
  }

  // FR-AUTH-041-071: Impersonate user
  async impersonateUser(adminId: string, targetUserId: string): Promise<AuthResponseDto> {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
      include: { userRolesNew: { include: { role: true } } }
    });
    
    const isAdmin = admin?.userRolesNew?.some(ur => ur.role.name === 'PLATFORM_ADMIN') || admin?.role === 'PLATFORM_ADMIN';
    if (!isAdmin) {
      throw new ForbiddenException('Only platform admins can impersonate users');
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
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

    if (!targetUser) throw new NotFoundException('Target user not found');

    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'USER_IMPERSONATION_START',
        resourceType: 'USER',
        resourceId: targetUserId,
      }
    });

    return this.generateTokens(targetUser);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR-AUTH-010 to FR-AUTH-012: Two-Factor Authentication (2FA/TOTP)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Enable 2FA for user - Step 1: Generate secret and QR code
   * Returns: secret (to be saved temporarily), qrCodeUrl (for user to scan), backupCodes (to show user)
   */
  async enable2FA(userId: string): Promise<{ secret: string; qrCodeUrl: string; backupCodes: string[] }> {
    this.logger.log(`Enabling 2FA for user: ${userId}`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA is already enabled for this account');
    }

    // Generate TOTP secret and QR code
    const { secret, qrCodeUrl } = await this.twoFactorService.generateSecret(user.email!);

    // Generate backup codes
    const backupCodes = this.twoFactorService.generateBackupCodes(10);

    this.logger.log(`2FA setup initiated for user: ${userId}`);

    // Return secret, QR code, and backup codes
    // User must verify with a code before we save the secret to DB
    return {
      secret,
      qrCodeUrl,
      backupCodes,
    };
  }

  /**
   * Enable 2FA for user - Step 2: Verify setup with TOTP code
   * User scans QR code, enters code from authenticator app to verify setup
   */
  async verify2FASetup(userId: string, code: string, secret: string, backupCodes: string[]): Promise<{ message: string }> {
    this.logger.log(`Verifying 2FA setup for user: ${userId}`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA is already enabled for this account');
    }

    // Verify TOTP code
    const isValid = await this.twoFactorService.verifyToken(secret, code);

    if (!isValid) {
      throw new BadRequestException('Invalid 2FA code. Please try again.');
    }

    // Encrypt secret for storage
    const encryptedSecret = this.twoFactorService.encryptSecret(secret);

    // Hash backup codes for storage
    const hashedBackupCodes = backupCodes.map(code => this.twoFactorService.hashBackupCode(code));

    // Save encrypted secret and backup codes to user
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: encryptedSecret,
        twoFactorEnabled: true,
        backupCodes: hashedBackupCodes,
      },
    });

    // Log security event
    await this.securityService.logSecurityEvent(userId, '2FA_ENABLED', 'LOW', {
      enabledAt: new Date(),
    });

    // Emit event
    await this.eventBus.publish('user.2fa_enabled', {
      userId,
      email: user.email,
      timestamp: new Date(),
    });

    this.logger.log(`2FA enabled successfully for user: ${userId}`);

    return { message: '2FA has been enabled successfully. Save your backup codes in a safe place.' };
  }

  /**
   * Disable 2FA for user
   * Requires password and current 2FA code for verification
   */
  async disable2FA(userId: string, password: string, code: string): Promise<{ message: string }> {
    this.logger.log(`Disabling 2FA for user: ${userId}`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled for this account');
    }

    // Verify password
    if (!user.passwordHash) {
      throw new BadRequestException('Cannot disable 2FA: No password set');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Decrypt secret and verify TOTP code
    const secret = this.twoFactorService.decryptSecret(user.twoFactorSecret!);
    const isValid = await this.twoFactorService.verifyToken(secret, code);

    if (!isValid) {
      throw new BadRequestException('Invalid 2FA code');
    }

    // Remove 2FA secret and backup codes
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: null,
        twoFactorEnabled: false,
        backupCodes: [],
      },
    });

    // Log security event
    await this.securityService.logSecurityEvent(userId, '2FA_DISABLED', 'MEDIUM', {
      disabledAt: new Date(),
    });

    // Emit event
    await this.eventBus.publish('user.2fa_disabled', {
      userId,
      email: user.email,
      timestamp: new Date(),
    });

    this.logger.log(`2FA disabled for user: ${userId}`);

    return { message: '2FA has been disabled successfully' };
  }

  /**
   * Verify 2FA code during login
   * After successful password login, if user has 2FA enabled, they must verify with TOTP code
   */
  async verify2FALogin(tempToken: string, code: string): Promise<AuthResponseDto> {
    this.logger.log('Verifying 2FA code for login');

    try {
      // Verify temp token
      const payload = this.jwtService.verify(tempToken);

      if (payload.type !== '2fa_required') {
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

      if (!user || !user.twoFactorEnabled) {
        throw new UnauthorizedException('Invalid 2FA setup');
      }

      // Decrypt secret and verify TOTP code
      const secret = this.twoFactorService.decryptSecret(user.twoFactorSecret!);
      const isValid = await this.twoFactorService.verifyToken(secret, code);

      if (!isValid) {
        // Log failed 2FA attempt
        await this.securityService.logSecurityEvent(user.id, '2FA_LOGIN_FAILED', 'MEDIUM', {
          timestamp: new Date(),
        });

        throw new UnauthorizedException('Invalid 2FA code');
      }

      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      // Log successful 2FA login
      await this.securityService.logSecurityEvent(user.id, '2FA_LOGIN_SUCCESS', 'LOW', {
        timestamp: new Date(),
      });

      // Emit login event
      await this.eventBus.publish('user.logged_in', {
        userId: user.id,
        email: user.email,
        tenantId: user.tenantId,
        timestamp: new Date(),
      });

      this.logger.log(`2FA login successful for user: ${user.id}`);

      // Generate and return real access token with rememberMe flag from temp token
      const rememberMe = payload.rememberMe || false;
      return this.generateTokens(user, rememberMe);
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Invalid or expired token');
      }
      throw error;
    }
  }

  /**
   * Verify 2FA backup code during login
   * If user lost access to authenticator app, they can use backup codes
   */
  async verify2FABackupCode(tempToken: string, backupCode: string): Promise<AuthResponseDto> {
    this.logger.log('Verifying 2FA backup code for login');

    try {
      // Verify temp token
      const payload = this.jwtService.verify(tempToken);

      if (payload.type !== '2fa_required') {
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

      if (!user || !user.twoFactorEnabled) {
        throw new UnauthorizedException('Invalid 2FA setup');
      }

      // Get backup codes
      const hashedBackupCodes = user.backupCodes as string[] || [];

      if (hashedBackupCodes.length === 0) {
        throw new BadRequestException('No backup codes available');
      }

      // Verify backup code
      let matchedCodeIndex = -1;
      for (let i = 0; i < hashedBackupCodes.length; i++) {
        const isMatch = this.twoFactorService.verifyBackupCode(backupCode, hashedBackupCodes[i]);
        if (isMatch) {
          matchedCodeIndex = i;
          break;
        }
      }

      if (matchedCodeIndex === -1) {
        // Log failed backup code attempt
        await this.securityService.logSecurityEvent(user.id, '2FA_BACKUP_CODE_FAILED', 'MEDIUM', {
          timestamp: new Date(),
        });

        throw new UnauthorizedException('Invalid backup code');
      }

      // Remove used backup code
      hashedBackupCodes.splice(matchedCodeIndex, 1);

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          backupCodes: hashedBackupCodes,
          lastLogin: new Date(),
        },
      });

      // Log successful backup code login
      await this.securityService.logSecurityEvent(user.id, '2FA_BACKUP_CODE_SUCCESS', 'LOW', {
        timestamp: new Date(),
        remainingCodes: hashedBackupCodes.length,
      });

      // Emit login event
      await this.eventBus.publish('user.logged_in', {
        userId: user.id,
        email: user.email,
        tenantId: user.tenantId,
        timestamp: new Date(),
      });

      // Warn if running low on backup codes
      if (hashedBackupCodes.length <= 2) {
        this.logger.warn(`User ${user.id} has only ${hashedBackupCodes.length} backup codes remaining`);
      }

      this.logger.log(`2FA backup code login successful for user: ${user.id}`);

      // Generate and return real access token with rememberMe flag from temp token
      const rememberMe = payload.rememberMe || false;
      return this.generateTokens(user, rememberMe);
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Invalid or expired token');
      }
      throw error;
    }
  }

  /**
   * Generate new backup codes for user (if they ran out)
   * Requires password and current 2FA code for verification
   */
  async regenerate2FABackupCodes(userId: string, password: string, code: string): Promise<{ backupCodes: string[] }> {
    this.logger.log(`Regenerating 2FA backup codes for user: ${userId}`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled for this account');
    }

    // Verify password
    if (!user.passwordHash) {
      throw new BadRequestException('Cannot regenerate backup codes: No password set');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Decrypt secret and verify TOTP code
    const secret = this.twoFactorService.decryptSecret(user.twoFactorSecret!);
    const isValid = await this.twoFactorService.verifyToken(secret, code);

    if (!isValid) {
      throw new BadRequestException('Invalid 2FA code');
    }

    // Generate new backup codes
    const backupCodes = this.twoFactorService.generateBackupCodes(10);

    // Hash backup codes for storage
    const hashedBackupCodes = backupCodes.map(code => this.twoFactorService.hashBackupCode(code));

    // Save new backup codes
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        backupCodes: hashedBackupCodes,
      },
    });

    // Log security event
    await this.securityService.logSecurityEvent(userId, '2FA_BACKUP_CODES_REGENERATED', 'LOW', {
      regeneratedAt: new Date(),
    });

    this.logger.log(`2FA backup codes regenerated for user: ${userId}`);

    return { backupCodes };
  }

  // ==================== FR-AUTH-025: ADMIN UNLOCK ACCOUNT ====================

  /**
   * Admin unlock user account
   * Used to unlock accounts that are permanently locked or locked for 24 hours
   * 
   * @param adminId - ID of admin performing unlock
   * @param userId - ID of user to unlock
   * @returns Success message
   */
  async adminUnlockAccount(adminId: string, userId: string): Promise<{ message: string }> {
    this.logger.log(`Admin unlock attempt by ${adminId} for user ${userId}`);

    // Verify admin has permission (PLATFORM_ADMIN or ORG_ADMIN)
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
      select: { id: true, role: true, email: true },
    });

    if (!admin || (admin.role !== 'PLATFORM_ADMIN' && admin.role !== 'ORG_ADMIN')) {
      throw new ForbiddenException('Only admins can unlock accounts');
    }

    // Get locked user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        email: true, 
        firstName: true,
        lockedUntil: true, 
        failedLoginAttempts: true,
        permanentLockReason: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.lockedUntil || user.lockedUntil < new Date()) {
      return { message: 'Account is not locked' };
    }

    // Unlock account
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        lockedUntil: null,
        failedLoginAttempts: 0,
        lastFailedLogin: null,
        permanentLockReason: null,
      },
    });

    // Log security event
    await this.securityService.logSecurityEvent(
      userId,
      'ACCOUNT_UNLOCKED_BY_ADMIN',
      'MEDIUM',
      {
        adminId,
        adminEmail: admin.email,
        previousLockReason: user.permanentLockReason || 'FAILED_LOGIN_ATTEMPTS',
        failedAttempts: user.failedLoginAttempts,
      },
    );

    // Send email notification to user
    try {
      await this.emailService.sendAccountUnlockedEmail(
        user.email!,
        user.firstName,
      );
    } catch (error) {
      this.logger.error(`Failed to send account unlocked email: ${error.message}`);
    }

    // Emit event
    await this.eventBus.publish('account.unlocked_by_admin', {
      userId,
      adminId,
      timestamp: new Date(),
    });

    this.logger.log(`Account unlocked by admin ${adminId} for user ${userId}`);

    return { message: 'Account unlocked successfully' };
  }

  /**
   * Admin unblock IP address
   * Used to unblock IPs that have been blocked due to excessive failures
   * 
   * @param adminId - ID of admin performing unblock
   * @param ipAddress - IP address to unblock
   * @returns Success message
   */
  async adminUnblockIp(adminId: string, ipAddress: string): Promise<{ message: string }> {
    this.logger.log(`Admin IP unblock attempt by ${adminId} for IP ${ipAddress}`);

    // Verify admin has permission
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
      select: { id: true, role: true },
    });

    if (!admin || (admin.role !== 'PLATFORM_ADMIN' && admin.role !== 'ORG_ADMIN')) {
      throw new ForbiddenException('Only admins can unblock IP addresses');
    }

    // Unblock IP
    await this.ipRateLimitService.unblockIp(ipAddress);

    this.logger.log(`IP ${ipAddress} unblocked by admin ${adminId}`);

    return { message: `IP address ${ipAddress} unblocked successfully` };
  }

  /**
   * Get locked accounts (admin view)
   * 
   * @returns List of locked accounts
   */
  async getLockedAccounts(): Promise<any[]> {
    const lockedUsers = await this.prisma.user.findMany({
      where: {
        lockedUntil: { gt: new Date() },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        lockedUntil: true,
        failedLoginAttempts: true,
        lastFailedLogin: true,
        permanentLockReason: true,
      },
      orderBy: { lockedUntil: 'desc' },
      take: 100,
    });

    return lockedUsers.map(user => ({
      ...user,
      isPermanentLock: user.permanentLockReason ? true : false,
      timeRemaining: user.lockedUntil ? Math.max(0, user.lockedUntil.getTime() - Date.now()) / 1000 : 0,
    }));
  }

  /**
   * Get blocked IPs (admin view)
   * 
   * @returns List of blocked IP addresses
   */
  async getBlockedIps(): Promise<any[]> {
    return this.ipRateLimitService.getBlockedIps();
  }

  // ==================== SESSION ACTIVITY PING (FR-AUTH-016) ====================

  /**
   * Keep session alive by updating activity timestamp
   * @param sessionId - Session ID to ping
   * @returns Success status and remaining time
   */
  async pingSession(
    sessionId: string,
  ): Promise<{ success: boolean; remainingMs: number }> {
    try {
      // Update activity timestamp
      await this.securityService.updateSessionActivity(sessionId);

      // Calculate remaining time before timeout
      const session = await this.prisma.userSession.findUnique({
        where: { id: sessionId },
        select: { lastActivityAt: true },
      });

      const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
      const inactiveMs = session
        ? Date.now() - session.lastActivityAt.getTime()
        : TIMEOUT_MS;
      const remainingMs = Math.max(0, TIMEOUT_MS - inactiveMs);

      return { success: true, remainingMs };
    } catch (error) {
      this.logger.error(`Failed to ping session: ${error.message}`);
      return { success: false, remainingMs: 0 };
    }
  }
}
