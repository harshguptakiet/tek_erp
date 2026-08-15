/**
 * Password Expiry Service
 * Handles 30-day password expiry policy (FR-AUTH-019)
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { EmailService } from './email.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class PasswordExpiryService {
  private readonly logger = new Logger(PasswordExpiryService.name);
  private readonly PASSWORD_EXPIRY_DAYS = 30;
  private readonly GRACE_PERIOD_DAYS = 3;

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Check if user's password has expired
   * @param userId - User ID to check
   * @returns Object with expiry status and days remaining
   */
  async checkPasswordExpiry(userId: string): Promise<{
    isExpired: boolean;
    isInGracePeriod: boolean;
    daysRemaining: number;
    expiryDate: Date;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { lastPasswordChange: true },
    });

    if (!user || !user.lastPasswordChange) {
      // No password change history - consider it expired for security
      return {
        isExpired: true,
        isInGracePeriod: false,
        daysRemaining: 0,
        expiryDate: new Date(),
      };
    }

    const daysSinceChange = this.getDaysSince(user.lastPasswordChange);
    const daysRemaining = this.PASSWORD_EXPIRY_DAYS - daysSinceChange;
    const expiryDate = new Date(
      user.lastPasswordChange.getTime() + this.PASSWORD_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    );

    // Check if in grace period (3 days after expiry)
    const gracePeriodEnd = new Date(
      expiryDate.getTime() + this.GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000,
    );
    const isInGracePeriod = new Date() > expiryDate && new Date() < gracePeriodEnd;

    return {
      isExpired: daysRemaining <= 0,
      isInGracePeriod,
      daysRemaining: Math.max(0, daysRemaining),
      expiryDate,
    };
  }

  /**
   * Force password change on next login
   * @param userId - User ID
   */
  async forcePasswordChange(userId: string): Promise<void> {
    // Lock account to force password reset
    await this.prisma.user.update({
      where: { id: userId },
      data: { 
        lockedUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Lock for 1 year
        permanentLockReason: 'PASSWORD_EXPIRED',
      },
    });
    this.logger.log(`Forced password change for user ${userId}`);
  }

  /**
   * Send password expiry reminder
   * @param userId - User ID
   * @param daysRemaining - Days until password expires
   */
  async sendExpiryReminder(userId: string, daysRemaining: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true },
    });

    if (!user || !user.email) {
      return;
    }

    try {
      await this.emailService.sendPasswordExpiryReminder(
        user.email,
        user.firstName,
        daysRemaining,
      );
      this.logger.log(
        `Sent password expiry reminder to ${user.email} (${daysRemaining} days remaining)`,
      );
    } catch (error) {
      this.logger.error(`Failed to send expiry reminder: ${error.message}`);
    }
  }

  /**
   * Cron job: Send reminders at 7, 3, and 1 day before expiry
   * Runs daily at 9 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendPasswordExpiryReminders(): Promise<void> {
    this.logger.log('Running password expiry reminder job...');

    try {
      const reminderDays = [7, 3, 1];

      for (const days of reminderDays) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - (this.PASSWORD_EXPIRY_DAYS - days));

        // Find users whose password will expire in X days
        const users = await this.prisma.user.findMany({
          where: {
            lastPasswordChange: {
              gte: new Date(targetDate.setHours(0, 0, 0, 0)),
              lte: new Date(targetDate.setHours(23, 59, 59, 999)),
            },
            status: 'ACTIVE',
            emailVerified: true,
          },
          select: {
            id: true,
            email: true,
            firstName: true,
          },
        });

        for (const user of users) {
          await this.sendExpiryReminder(user.id, days);
        }

        this.logger.log(`Sent ${users.length} reminders for ${days}-day expiry`);
      }
    } catch (error) {
      this.logger.error(`Password expiry reminder job failed: ${error.message}`);
    }
  }

  /**
   * Cron job: Lock accounts after grace period expires
   * Runs daily at 10 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async lockExpiredAccounts(): Promise<void> {
    this.logger.log('Running expired account lockout job...');

    try {
      const gracePeriodEnd = new Date();
      gracePeriodEnd.setDate(
        gracePeriodEnd.getDate() - (this.PASSWORD_EXPIRY_DAYS + this.GRACE_PERIOD_DAYS),
      );

      const result = await this.prisma.user.updateMany({
        where: {
          lastPasswordChange: { lt: gracePeriodEnd },
          status: 'ACTIVE',
          lockedUntil: null, // Not already locked
        },
        data: {
          lockedUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Lock for 1 year
          permanentLockReason: 'PASSWORD_EXPIRED',
        },
      });

      if (result.count > 0) {
        this.logger.warn(
          `Locked ${result.count} accounts due to password expiry (grace period ended)`,
        );
      }
    } catch (error) {
      this.logger.error(`Expired account lockout job failed: ${error.message}`);
    }
  }

  /**
   * Calculate days since a date
   */
  private getDaysSince(date: Date): number {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }
}
