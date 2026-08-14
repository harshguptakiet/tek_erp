/**
 * Security Service
 * Handles critical security features: token blacklist, session management, CSRF protection
 */

import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // ==================== TOKEN BLACKLIST ====================

  /**
   * Add token to blacklist (logout, password change, security breach)
   */
  async blacklistToken(
    token: string,
    userId: string,
    reason: 'LOGOUT' | 'PASSWORD_CHANGE' | 'ADMIN_REVOKE' | 'SECURITY_BREACH',
  ): Promise<void> {
    try {
      // Decode token to get expiry
      const decoded = this.jwtService.decode(token) as any;
      const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 3600000); // Default 1 hour

      // Store in database
      await this.prisma.tokenBlacklist.create({
        data: {
          token: this.hashToken(token), // Store hash for security
          userId,
          reason,
          expiresAt,
        },
      });

      this.logger.log(`Token blacklisted for user ${userId}, reason: ${reason}`);
    } catch (error) {
      this.logger.error(`Failed to blacklist token: ${error.message}`);
      // Don't throw - blacklisting failure shouldn't break the flow
    }
  }

  /**
   * Check if token is blacklisted
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const tokenHash = this.hashToken(token);

      // Check database
      const dbResult = await this.prisma.tokenBlacklist.findFirst({
        where: {
          token: tokenHash,
          expiresAt: { gt: new Date() }, // Not expired
        },
      });

      return !!dbResult;
    } catch (error) {
      this.logger.error(`Error checking token blacklist: ${error.message}`);
      return false; // Fail open to prevent blocking valid users
    }
  }

  /**
   * Blacklist all user's tokens (password change, security breach)
   */
  async blacklistAllUserTokens(
    userId: string,
    reason: 'PASSWORD_CHANGE' | 'SECURITY_BREACH' | 'ADMIN_REVOKE',
  ): Promise<void> {
    // Get all active sessions
    const sessions = await this.prisma.userSession.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
    });

    // Blacklist each session token
    for (const session of sessions) {
      if (session.token) {
        await this.blacklistToken(session.token, userId, reason);
      }
    }

    // Mark all sessions as revoked
    await this.prisma.userSession.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false, revokedAt: new Date() },
    });

    this.logger.warn(`All tokens blacklisted for user ${userId}, reason: ${reason}`);
  }

  // ==================== REFRESH TOKEN ROTATION ====================

  /**
   * Rotate refresh token (generate new, invalidate old)
   */
  async rotateRefreshToken(
    sessionId: string,
    oldRefreshToken: string,
  ): Promise<{ newRefreshToken: string; newAccessToken: string }> {
    const session = await this.prisma.userSession.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!session || !session.isActive) {
      throw new UnauthorizedException('Invalid session');
    }

    // Check if old token hash matches
    const oldTokenHash = this.hashToken(oldRefreshToken);
    if (session.tokenHash && session.tokenHash !== oldTokenHash) {
      // Token reuse detected - possible theft!
      this.logger.error(`Token reuse detected for user ${session.userId}`);
      
      // Revoke all user's tokens
      await this.blacklistAllUserTokens(session.userId, 'SECURITY_BREACH');
      
      // Log security event
      await this.logSecurityEvent(session.userId, 'TOKEN_REUSE_DETECTED', 'CRITICAL', {
        sessionId,
        message: 'Possible token theft detected - all tokens revoked',
      });

      throw new UnauthorizedException('Security breach detected. All sessions have been terminated.');
    }

    // Generate new tokens
    const newRefreshToken = this.generateRefreshToken();
    const newAccessToken = this.jwtService.sign({
      sub: session.userId,
      email: session.user.email,
      tenantId: session.user.tenantId,
      roles: [],
    });

    // Update session with new token
    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: {
        refreshToken: newRefreshToken,
        tokenHash: this.hashToken(newRefreshToken),
        previousTokenHash: oldTokenHash, // Store for detection
        tokenVersion: (session.tokenVersion || 0) + 1,
        rotatedAt: new Date(),
        lastActivity: new Date(),
      },
    });

    this.logger.log(`Refresh token rotated for session ${sessionId}`);

    return { newRefreshToken, newAccessToken };
  }

  // ==================== SESSION TIMEOUT ====================

  /**
   * Check if session has timed out (30 min inactivity)
   */
  async checkSessionTimeout(sessionId: string): Promise<boolean> {
    const session = await this.prisma.userSession.findUnique({
      where: { id: sessionId },
      select: { lastActivity: true, isActive: true },
    });

    if (!session || !session.isActive) {
      return true; // Session doesn't exist or inactive = timed out
    }

    const inactiveMinutes = 30; // Configurable
    const timeoutThreshold = new Date(Date.now() - inactiveMinutes * 60 * 1000);

    return session.lastActivity < timeoutThreshold;
  }

  /**
   * Update session activity timestamp
   */
  async updateSessionActivity(sessionId: string): Promise<void> {
    try {
      await this.prisma.userSession.update({
        where: { id: sessionId },
        data: { lastActivity: new Date() },
      });
    } catch (error) {
      this.logger.error(`Failed to update session activity: ${error.message}`);
    }
  }

  // ==================== CSRF PROTECTION ====================

  /**
   * Generate CSRF token for session
   */
  generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validate CSRF token
   */
  async validateCSRFToken(sessionId: string, token: string): Promise<boolean> {
    const session = await this.prisma.userSession.findUnique({
      where: { id: sessionId },
      select: { csrfToken: true },
    });

    return session?.csrfToken === token;
  }

  // ==================== SECURITY EVENTS ====================

  /**
   * Log security event
   */
  async logSecurityEvent(
    userId: string,
    eventType: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    details?: any,
    ipAddress?: string,
    deviceInfo?: string,
  ): Promise<void> {
    try {
      await this.prisma.securityEvent.create({
        data: {
          userId,
          eventType,
          severity,
          details,
          ipAddress,
          deviceInfo,
        },
      });

      this.logger.log(`Security event logged: ${eventType} for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to log security event: ${error.message}`);
    }
  }

  /**
   * Get unresolved security events for user
   */
  async getUnresolvedSecurityEvents(userId: string): Promise<any[]> {
    return this.prisma.securityEvent.findMany({
      where: {
        userId,
        resolved: false,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  // ==================== HELPER METHODS ====================

  /**
   * Hash token using SHA-256
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Generate secure refresh token
   */
  private generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Clean up expired blacklisted tokens (run periodically)
   */
  async cleanupExpiredBlacklist(): Promise<void> {
    try {
      const result = await this.prisma.tokenBlacklist.deleteMany({
        where: {
          expiresAt: { lt: new Date() },
        },
      });

      this.logger.log(`Cleaned up ${result.count} expired blacklisted tokens`);
    } catch (error) {
      this.logger.error(`Failed to cleanup blacklist: ${error.message}`);
    }
  }

  /**
   * Enforce session limit (max 10 concurrent sessions per user)
   */
  async enforceSessionLimit(userId: string): Promise<void> {
    const maxSessions = 10;
    
    const sessions = await this.prisma.userSession.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActivity: 'asc' }, // Oldest first
    });

    if (sessions.length >= maxSessions) {
      // Revoke oldest session
      const oldestSession = sessions[0];
      await this.prisma.userSession.update({
        where: { id: oldestSession.id },
        data: { isActive: false, revokedAt: new Date() },
      });

      if (oldestSession.token) {
        await this.blacklistToken(oldestSession.token, userId, 'ADMIN_REVOKE');
      }

      this.logger.log(`Revoked oldest session for user ${userId} (session limit reached)`);
    }
  }
}
