import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
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
}

