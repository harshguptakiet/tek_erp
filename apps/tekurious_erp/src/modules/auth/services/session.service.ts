import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { SessionDto } from '../dto/session.dto';
import { UAParser } from 'ua-parser-js';

@Injectable()
export class SessionService {
  private readonly maxSessions = 10;

  constructor(private prisma: PrismaService) {}

  /**
   * Create new session
   */
  async createSession(
    userId: string,
    refreshToken: string,
    userAgent: string,
    ipAddress: string
  ): Promise<void> {
    // Parse user agent
    const parser = new UAParser(userAgent);
    const device = parser.getResult();
    const deviceInfo = `${device.browser.name || 'Unknown'} on ${device.os.name || 'Unknown'}`;

    // Get location from IP (basic implementation)
    const location = await this.getLocationFromIp(ipAddress);

    // Check session count and remove oldest if exceeds limit
    const existingSessions = await this.prisma.userSession.count({
      where: { userId, isActive: true },
    });

    if (existingSessions >= this.maxSessions) {
      // Find and delete oldest session
      const oldestSession = await this.prisma.userSession.findFirst({
        where: { userId, isActive: true },
        orderBy: { createdAt: 'asc' },
      });

      if (oldestSession) {
        await this.prisma.userSession.delete({
          where: { id: oldestSession.id },
        });
      }
    }

    // Create session
    await this.prisma.userSession.create({
      data: {
        userId,
        refreshToken, // Should be hashed in production
        token: refreshToken, // Use refreshToken as token for now
        deviceInfo,
        ipAddress,
        location,
        isActive: true,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        lastActivity: new Date(),
      },
    });
  }

  /**
   * Get all active sessions for user
   */
  async getUserSessions(userId: string, currentSessionId?: string): Promise<SessionDto[]> {
    const sessions = await this.prisma.userSession.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        lastActivity: 'desc',
      },
    });

    return sessions.map((session) => ({
      sessionId: session.id,
      deviceInfo: session.deviceInfo,
      ipAddress: session.ipAddress,
      location: session.location,
      loginTime: session.createdAt,
      lastActivity: session.lastActivity,
      isCurrent: session.id === currentSessionId,
    }));
  }

  /**
   * Update session activity timestamp
   */
  async updateActivity(sessionId: string): Promise<void> {
    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: { lastActivity: new Date() },
    });
  }

  /**
   * Terminate specific session
   */
  async terminateSession(userId: string, sessionId: string): Promise<void> {
    const session = await this.prisma.userSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await this.prisma.userSession.delete({
      where: { id: sessionId },
    });
  }

  /**
   * Terminate all sessions except current
   */
  async terminateAllOtherSessions(userId: string, currentSessionId: string): Promise<number> {
    const result = await this.prisma.userSession.deleteMany({
      where: {
        userId,
        id: { not: currentSessionId },
        isActive: true,
      },
    });

    return result.count;
  }

  /**
   * Terminate all sessions for user
   */
  async terminateAllSessions(userId: string): Promise<number> {
    const result = await this.prisma.userSession.deleteMany({
      where: { userId },
    });

    return result.count;
  }

  /**
   * Check for inactive sessions and mark as inactive
   */
  async cleanupInactiveSessions(inactivityMinutes: number = 30): Promise<number> {
    const cutoffTime = new Date(Date.now() - inactivityMinutes * 60 * 1000);

    const result = await this.prisma.userSession.updateMany({
      where: {
        lastActivity: { lt: cutoffTime },
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    return result.count;
  }

  /**
   * Get location from IP address (basic implementation)
   */
  private async getLocationFromIp(ipAddress: string): Promise<string> {
    // TODO: Integrate with IP geolocation service (ipapi.co, ipinfo.io, etc.)
    // For now, return a placeholder
    if (ipAddress === '::1' || ipAddress === '127.0.0.1') {
      return 'localhost';
    }
    return 'Unknown Location';
  }
}
