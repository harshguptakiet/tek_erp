import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../database/prisma.service';
import { TokenBlacklistService } from './token-blacklist.service';
import * as crypto from 'crypto';

/**
 * Refresh Token Service
 * FR-AUTH-014: Refresh Token Management with Rotation
 * 
 * Features:
 * - Generate and store refresh tokens
 * - Token rotation on use (one-time use tokens)
 * - Theft detection via token reuse
 * - Automatic revocation on security breach
 */
@Injectable()
export class RefreshTokenService {
  private readonly logger = new Logger(RefreshTokenService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private tokenBlacklistService: TokenBlacklistService,
  ) {}

  /**
   * Generate a new refresh token and store it
   * @param userId - User ID
   * @param deviceInfo - Device information
   * @param ipAddress - IP address
   * @param expiryDays - Token expiry in days (7 default, 30 for remember me)
   * @returns Refresh token string
   */
  async generateRefreshToken(
    userId: string,
    deviceInfo?: any,
    ipAddress?: string,
    expiryDays: number = 7,
  ): Promise<{ refreshToken: string; sessionId: string }> {
    try {
      // Generate cryptographically secure random token
      const refreshToken = crypto.randomBytes(64).toString('hex');
      const tokenHash = this.hashToken(refreshToken);

      // Calculate expiry
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiryDays);

      // Enforce 10 active sessions limit per user (FR-AUTH-015)
      const activeSessions = await this.prisma.userSession.findMany({
        where: { userId, isActive: true },
        orderBy: { lastActivity: 'asc' },
      });

      if (activeSessions.length >= 10) {
        const excessCount = activeSessions.length - 9;
        const sessionsToEvict = activeSessions.slice(0, excessCount);
        for (const s of sessionsToEvict) {
          await this.prisma.userSession.update({
            where: { id: s.id },
            data: { isActive: false, revokedAt: new Date() },
          });
        }
        this.logger.log(`Evicted ${excessCount} oldest session(s) for user ${userId} to enforce 10-session limit`);
      }

      // Create session - store only the SHA-256 hash of the refresh token
      // (FR-AUTH-033: refresh tokens must be hashed at rest, never plaintext).
      // The plaintext token is returned to the caller once and never persisted.
      const session = await this.prisma.userSession.create({
        data: {
          userId,
          token: '', // Will be set when access token is issued
          tokenHash, // Store hash for validation
          deviceInfo: deviceInfo ? JSON.stringify(deviceInfo) : null, // Convert to string
          ipAddress,
          expiresAt,
          lastActivity: new Date(),
          isActive: true,
          tokenVersion: 1,
        },
      });

      this.logger.log(`Refresh token generated for user ${userId}, expires in ${expiryDays} days`);

      return {
        refreshToken,
        sessionId: session.id,
      };
    } catch (error) {
      this.logger.error(`Failed to generate refresh token: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate and rotate refresh token
   * FR-AUTH-014: Token rotation - generate new token, invalidate old
   * 
   * @param refreshToken - Current refresh token
   * @returns New access token and refresh token
   */
  async rotateRefreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: any;
    rememberMe: boolean;
    tokenExpiry: number;
  }> {
    try {
      const tokenHash = this.hashToken(refreshToken);

      // Find session with this token
      const session = await this.prisma.userSession.findFirst({
        where: {
          tokenHash,
          isActive: true,
          expiresAt: { gt: new Date() },
        },
        include: {
          user: true,
        },
      });

      if (!session) {
        // Token not found or expired
        this.logger.warn(`Invalid refresh token attempt`);
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      // Check if token was already used (reuse detection)
      if (session.previousTokenHash && session.previousTokenHash === tokenHash) {
        // TOKEN REUSE DETECTED - Possible theft!
        this.logger.error(`🚨 SECURITY BREACH: Token reuse detected for user ${session.userId}`);

        // Revoke ALL user's sessions immediately
        await this.revokeAllUserSessions(session.userId, 'TOKEN_THEFT_DETECTED');

        // Log critical security event
        await this.prisma.securityEvent.create({
          data: {
            userId: session.userId,
            eventType: 'REFRESH_TOKEN_REUSE',
            severity: 'CRITICAL',
            details: {
              sessionId: session.id,
              message: 'Refresh token reuse detected - possible theft',
              ipAddress: session.ipAddress,
            },
            ipAddress: session.ipAddress,
          },
        });

        throw new UnauthorizedException(
          'Security breach detected. All sessions have been terminated for your safety.',
        );
      }

      // Verify user is still active
      if (session.user.status !== 'ACTIVE') {
        throw new UnauthorizedException('Account is not active');
      }

      // Generate new tokens
      const newRefreshToken = crypto.randomBytes(64).toString('hex');
      const newTokenHash = this.hashToken(newRefreshToken);

      const roles = []; // Will be populated from user roles if needed

      const newAccessToken = this.jwtService.sign({
        sub: session.user.id,
        email: session.user.email,
        tenantId: session.user.tenantId,
        roles,
        sessionId: session.id,
      });

      // Determine remember-me duration from the ORIGINAL session lifetime
      // (createdAt -> expiresAt), so a 30-day "remember me" session keeps
      // renewing itself for another 30 days instead of being silently
      // downgraded to 7 days on every refresh (previously hardcoded).
      const originalDurationMs = session.expiresAt.getTime() - session.createdAt.getTime();
      const REMEMBER_ME_THRESHOLD_MS = 10 * 24 * 60 * 60 * 1000; // >10 days implies remember-me (30-day) session
      const rememberMe = originalDurationMs > REMEMBER_ME_THRESHOLD_MS;
      const renewedDurationDays = rememberMe ? 30 : 7;
      const newExpiresAt = new Date(Date.now() + renewedDurationDays * 24 * 60 * 60 * 1000);

      // Update session with new token hash (never store plaintext refresh tokens)
      await this.prisma.userSession.update({
        where: { id: session.id },
        data: {
          tokenHash: newTokenHash,
          previousTokenHash: tokenHash, // Store old hash for reuse detection
          tokenVersion: (session.tokenVersion || 1) + 1,
          rotatedAt: new Date(),
          lastActivity: new Date(),
          expiresAt: newExpiresAt,
        },
      });

      this.logger.log(`Refresh token rotated for user ${session.userId}, session ${session.id}, rememberMe: ${rememberMe}`);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          id: session.user.id,
          email: session.user.email || '',
          firstName: session.user.firstName,
          lastName: session.user.lastName,
          role: session.user.role,
          roles,
          tenantId: session.user.tenantId,
          status: session.user.status,
        },
        rememberMe,
        tokenExpiry: rememberMe ? 2592000 : 604800, // seconds: 30 days or 7 days
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Failed to rotate refresh token: ${error.message}`);
      throw new UnauthorizedException('Failed to refresh session');
    }
  }

  /**
   * Revoke a specific refresh token
   * @param refreshToken - Refresh token to revoke
   */
  async revokeRefreshToken(refreshToken: string): Promise<void> {
    try {
      const tokenHash = this.hashToken(refreshToken);

      const result = await this.prisma.userSession.updateMany({
        where: {
          tokenHash,
          isActive: true,
        },
        data: {
          isActive: false,
          revokedAt: new Date(),
        },
      });

      if (result.count > 0) {
        this.logger.log(`Refresh token revoked`);
      }
    } catch (error) {
      this.logger.error(`Failed to revoke refresh token: ${error.message}`);
      throw error;
    }
  }

  /**
   * Revoke all refresh tokens for a user
   * Used when: password change, security breach, admin action
   * 
   * @param userId - User ID
   * @param reason - Reason for revocation
   */
  async revokeAllUserSessions(
    userId: string,
    reason: string = 'USER_REQUESTED',
    exceptSessionId?: string,
  ): Promise<number> {
    try {
      // Get active sessions (excluding the current one if specified)
      const sessions = await this.prisma.userSession.findMany({
        where: {
          userId,
          isActive: true,
          ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}),
        },
        select: {
          id: true,
          token: true,
        },
      });

      // Blacklist access tokens for the targeted sessions only
      for (const session of sessions) {
        if (session.token) {
          try {
            const decoded = this.jwtService.decode(session.token) as any;
            const ttl = decoded?.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 3600;
            await this.tokenBlacklistService.blacklistToken(session.token, userId, reason, ttl);
          } catch (err) {
            this.logger.warn(`Failed to blacklist token for session ${session.id}`);
          }
        }
      }

      // IMPORTANT: only blacklist ALL user tokens (including current) when
      // no exceptSessionId is given (i.e. a true "kill everything" scenario
      // like security breach). Otherwise this would also invalidate the
      // caller's own active session.
      if (!exceptSessionId) {
        await this.tokenBlacklistService.blacklistAllUserTokens(userId, reason, 7200);
      }

      // Mark targeted sessions as inactive
      const result = await this.prisma.userSession.updateMany({
        where: {
          userId,
          isActive: true,
          ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}),
        },
        data: {
          isActive: false,
          revokedAt: new Date(),
        },
      });

      this.logger.warn(
        `Revoked ${result.count} sessions for user ${userId}, reason: ${reason}${exceptSessionId ? ` (except ${exceptSessionId})` : ''}`,
      );

      return result.count;
    } catch (error) {
      this.logger.error(`Failed to revoke all user sessions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate refresh token without rotation
   * @param refreshToken - Token to validate
   * @returns Session data if valid
   */
  async validateRefreshToken(refreshToken: string): Promise<{
    valid: boolean;
    userId?: string;
    sessionId?: string;
  }> {
    try {
      const tokenHash = this.hashToken(refreshToken);

      const session = await this.prisma.userSession.findFirst({
        where: {
          tokenHash,
          isActive: true,
          expiresAt: { gt: new Date() },
        },
        select: {
          id: true,
          userId: true,
        },
      });

      if (!session) {
        return { valid: false };
      }

      return {
        valid: true,
        userId: session.userId,
        sessionId: session.id,
      };
    } catch (error) {
      this.logger.error(`Failed to validate refresh token: ${error.message}`);
      return { valid: false };
    }
  }

  /**
   * Cleanup expired refresh tokens
   * Should be run periodically via cron job
   */
  async cleanupExpiredTokens(): Promise<number> {
    try {
      const result = await this.prisma.userSession.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            {
              isActive: false,
              revokedAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // 30 days old
            },
          ],
        },
      });

      this.logger.log(`Cleaned up ${result.count} expired refresh token sessions`);

      return result.count;
    } catch (error) {
      this.logger.error(`Failed to cleanup expired tokens: ${error.message}`);
      return 0;
    }
  }

  /**
   * Hash token using SHA-256
   * @param token - Token to hash
   * @returns Hashed token
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
