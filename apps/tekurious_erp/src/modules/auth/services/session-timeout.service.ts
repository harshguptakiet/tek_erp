/**
 * Session Timeout Service
 * Handles session inactivity timeout (FR-AUTH-016)
 */

import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SessionTimeoutService {
  private readonly logger = new Logger(SessionTimeoutService.name);
  private readonly INACTIVITY_TIMEOUT_MS: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    // Default: 30 minutes (1800000 ms)
    const timeoutMinutes = this.configService.get<number>(
      'SESSION_INACTIVITY_TIMEOUT_MINUTES',
      30,
    );
    this.INACTIVITY_TIMEOUT_MS = timeoutMinutes * 60 * 1000;
    this.logger.log(
      `Session inactivity timeout set to ${timeoutMinutes} minutes`,
    );
  }

  /**
   * Check if session has expired due to inactivity
   * @param sessionId - Session ID to check
   * @returns true if session is expired, false otherwise
   */
  async isSessionExpired(sessionId: string): Promise<boolean> {
    try {
      const session = await this.prisma.userSession.findUnique({
        where: { id: sessionId },
        select: { lastActivityAt: true, expiresAt: true },
      });

      if (!session) {
        return true; // Session not found = expired
      }

      // Check absolute expiry first
      if (session.expiresAt && session.expiresAt < new Date()) {
        this.logger.warn(`Session ${sessionId} has reached absolute expiry`);
        return true;
      }

      // Check inactivity timeout
      const inactiveMs = Date.now() - session.lastActivityAt.getTime();
      if (inactiveMs > this.INACTIVITY_TIMEOUT_MS) {
        this.logger.warn(
          `Session ${sessionId} expired due to inactivity (${Math.round(inactiveMs / 60000)} minutes)`,
        );
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(
        `Error checking session expiry: ${error.message}`,
        error.stack,
      );
      return true; // Fail closed - treat as expired on error
    }
  }

  /**
   * Get remaining time before session expires due to inactivity
   * @param sessionId - Session ID
   * @returns Remaining milliseconds, or 0 if expired
   */
  async getRemainingTime(sessionId: string): Promise<number> {
    try {
      const session = await this.prisma.userSession.findUnique({
        where: { id: sessionId },
        select: { lastActivityAt: true },
      });

      if (!session) {
        return 0;
      }

      const inactiveMs = Date.now() - session.lastActivityAt.getTime();
      const remainingMs = this.INACTIVITY_TIMEOUT_MS - inactiveMs;

      return Math.max(0, remainingMs);
    } catch (error) {
      this.logger.error(`Error getting remaining time: ${error.message}`);
      return 0;
    }
  }

  /**
   * Update session activity timestamp (keep alive)
   * @param sessionId - Session ID to update
   */
  async updateActivity(sessionId: string): Promise<void> {
    try {
      await this.prisma.userSession.update({
        where: { id: sessionId },
        data: { lastActivityAt: new Date() },
      });
      this.logger.debug(`Updated activity for session ${sessionId}`);
    } catch (error) {
      this.logger.error(
        `Failed to update activity: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Revoke expired sessions (cleanup job)
   * Should be called periodically (e.g., every 5 minutes)
   */
  async revokeExpiredSessions(): Promise<number> {
    try {
      const expiryThreshold = new Date(
        Date.now() - this.INACTIVITY_TIMEOUT_MS,
      );

      const result = await this.prisma.userSession.deleteMany({
        where: {
          lastActivityAt: {
            lt: expiryThreshold,
          },
        },
      });

      if (result.count > 0) {
        this.logger.log(`Cleaned up ${result.count} expired sessions`);
      }

      return result.count;
    } catch (error) {
      this.logger.error(
        `Failed to revoke expired sessions: ${error.message}`,
        error.stack,
      );
      return 0;
    }
  }

  /**
   * Get session timeout configuration
   * @returns Timeout in milliseconds
   */
  getTimeoutMs(): number {
    return this.INACTIVITY_TIMEOUT_MS;
  }

  /**
   * Get warning threshold (when to show warning to user)
   * Default: 5 minutes before timeout
   * @returns Warning threshold in milliseconds
   */
  getWarningThresholdMs(): number {
    return 5 * 60 * 1000; // 5 minutes
  }
}
