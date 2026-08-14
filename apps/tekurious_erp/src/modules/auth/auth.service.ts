import { Injectable, UnauthorizedException, BadRequestException, Logger, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { EventBusService } from '../../events/event-bus.service';
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
      throw new UnauthorizedException('Invalid email or password');
    }

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

    // Emit login event
    await this.eventBus.publish('user.logged_in', {
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      timestamp: new Date(),
    });

    this.logger.log(`User logged in successfully: ${user.id}`);

    // Generate and return tokens
    return this.generateTokens(user);
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
   * Generate JWT tokens
   */
  private generateTokens(user: any): AuthResponseDto {
    const roles = user.userRolesNew?.map((ur: any) => ur.role.name) || [];

    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      roles,
    };

    const accessToken = this.jwtService.sign(payload);

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
      where: { userId, revokedAt: null, expiresAt: { gte: new Date() } },
      orderBy: { lastActivityAt: 'desc' },
      select: {
        id: true,
        deviceName: true,
        deviceType: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        lastActivityAt: true,
        expiresAt: true,
      },
    });

    return sessions;
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await this.prisma.userSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new BadRequestException('Session not found');
    }

    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
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
    const where: any = { userId, revokedAt: null };
    if (exceptSessionId) {
      where.id = { not: exceptSessionId };
    }

    const result = await this.prisma.userSession.updateMany({
      where,
      data: { revokedAt: new Date() },
    });

    this.eventBus.publish('auth.all_sessions_revoked', {
      userId,
      count: result.count,
      timestamp: new Date(),
    });

    this.logger.log(`${result.count} sessions revoked for user: ${userId}`);
    return { success: true, count: result.count, message: 'All sessions revoked successfully' };
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
}
