/**
 * Suspicious Activity Detection Service
 * FR-AUTH-026: Detect and alert on suspicious login activity
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { EventBusService } from '../../../events/event-bus.service';
import { EmailService } from './email.service';

export interface LoginContext {
  userId: string;
  email: string;
  firstName: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
}

export interface SuspiciousActivityResult {
  isSuspicious: boolean;
  reasons: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

@Injectable()
export class SuspiciousActivityService {
  private readonly logger = new Logger(SuspiciousActivityService.name);

  constructor(
    private prisma: PrismaService,
    private eventBus: EventBusService,
    private emailService: EmailService,
  ) { }

  /**
   * Analyze login attempt for suspicious activity
   * Checks: new device, new location, unusual time, impossible travel
   */
  async analyzeLogin(context: LoginContext): Promise<SuspiciousActivityResult> {
    const reasons: string[] = [];
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

    try {
      // Get recent login history (last 30 days)
      const recentLogins = await this.prisma.loginAttempt.findMany({
        where: {
          email: context.email,
          success: true,
          timestamp: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
        orderBy: { timestamp: 'desc' },
        take: 50,
      });

      // Check 1: New device
      const isNewDevice = this.isNewDevice(context.userAgent, recentLogins);
      if (isNewDevice) {
        reasons.push('Login from new device');
        riskLevel = 'MEDIUM';
      }

      // Check 2: New location (different country/region)
      const isNewLocation = await this.isNewLocation(context.ipAddress, recentLogins);
      if (isNewLocation) {
        reasons.push('Login from new location');
        riskLevel = 'MEDIUM';
      }

      // Check 3: Unusual login time
      const isUnusualTime = this.isUnusualLoginTime(recentLogins);
      if (isUnusualTime) {
        reasons.push('Login at unusual time');
      }

      // Check 4: Impossible travel (location change too fast)
      const isImpossibleTravel = await this.detectImpossibleTravel(
        context.ipAddress,
        recentLogins,
      );
      if (isImpossibleTravel) {
        reasons.push('Impossible travel detected');
        riskLevel = 'HIGH';
      }

      // Check 5: Multiple failed attempts then success
      const hasRecentFailures = await this.hasRecentFailedAttempts(context.email);
      if (hasRecentFailures) {
        reasons.push('Multiple failed attempts before success');
        if (riskLevel === 'LOW') {
          riskLevel = 'MEDIUM';
        }
      }

      const isSuspicious = reasons.length > 0;

      if (isSuspicious) {
        this.logger.warn(
          `Suspicious login detected for ${context.email}: ${reasons.join(', ')}`
        );

        // Log security event
        await this.prisma.auditLog.create({
          data: {
            userId: context.userId,
            action: 'SUSPICIOUS_LOGIN_DETECTED',
            resourceType: 'USER',
            resourceId: context.userId,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            metadata: {
              reasons,
              riskLevel,
              location: context.location,
            },
          },
        });

        // Send notification email
        await this.sendSuspiciousActivityAlert(context, reasons, riskLevel);

        // Emit event
        await this.eventBus.publish('security.suspicious_login', {
          userId: context.userId,
          email: context.email,
          reasons,
          riskLevel,
          timestamp: new Date(),
        });
      }

      return {
        isSuspicious,
        reasons,
        riskLevel,
      };
    } catch (error: any) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error analyzing login activity: ${errorMsg}`);
      // Return non-suspicious on error to avoid blocking legitimate logins
      return { isSuspicious: false, reasons: [], riskLevel: 'LOW' };
    }
  }

  /**
   * Check if this is a new device based on user agent
   */
  private isNewDevice(userAgent: string, recentLogins: any[]): boolean {
    if (!userAgent || recentLogins.length === 0) return false;

    // Simple device fingerprint: extract browser and OS
    const deviceFingerprint = this.extractDeviceFingerprint(userAgent);

    // Check if this fingerprint exists in recent logins
    const knownFingerprints = recentLogins
      .map(login => this.extractDeviceFingerprint(login.userAgent || ''))
      .filter(Boolean);

    return !knownFingerprints.includes(deviceFingerprint);
  }

  /**
   * Extract simple device fingerprint from user agent
   */
  private extractDeviceFingerprint(userAgent: string): string {
    if (!userAgent) return '';

    // Extract browser
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    // Extract OS
    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'Mac';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    return `${browser}-${os}`;
  }

  /**
   * Check if login is from a new location
   * (Simplified: in production, use IP geolocation service)
   */
  private async isNewLocation(ipAddress: string, recentLogins: any[]): Promise<boolean> {
    if (!ipAddress || recentLogins.length === 0) return false;

    // Check if this IP or IP range has been seen before
    const knownIPs = recentLogins.map(login => login.ipAddress).filter(Boolean);

    // Simple check: exact IP match
    if (knownIPs.includes(ipAddress)) {
      return false;
    }

    // Check IP prefix (same /24 subnet)
    const ipPrefix = ipAddress.split('.').slice(0, 3).join('.');
    const knownPrefixes = knownIPs.map(ip => ip.split('.').slice(0, 3).join('.'));

    return !knownPrefixes.includes(ipPrefix);
  }

  /**
   * Check if login time is unusual based on history
   */
  private isUnusualLoginTime(recentLogins: any[]): boolean {
    if (recentLogins.length < 5) return false; // Need history

    const currentHour = new Date().getHours();

    // Get typical login hours
    const loginHours = recentLogins.map(login => new Date(login.timestamp).getHours());

    // Check if current hour is significantly different from typical pattern
    // Consider unusual if outside of typical ±3 hour range
    const avgHour = loginHours.reduce((a, b) => a + b, 0) / loginHours.length;
    const isUnusual = Math.abs(currentHour - avgHour) > 6;

    return isUnusual;
  }

  /**
   * Detect impossible travel (location change too fast)
   */
  private async detectImpossibleTravel(
    currentIP: string,
    recentLogins: any[],
  ): Promise<boolean> {
    if (recentLogins.length === 0) return false;

    // Get most recent login
    const lastLogin = recentLogins[0];
    if (!lastLogin.ipAddress) return false;

    // Check if IPs are from very different locations
    // Simplified: check if IPs are from different /16 subnets
    const currentPrefix = currentIP.split('.').slice(0, 2).join('.');
    const lastPrefix = lastLogin.ipAddress.split('.').slice(0, 2).join('.');

    if (currentPrefix === lastPrefix) {
      return false; // Same general location
    }

    // Check time difference
    const timeDiff = Date.now() - new Date(lastLogin.timestamp).getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    // If login from different location within 1 hour, flag as impossible travel
    // (In production: use actual geolocation and distance calculation)
    return hoursDiff < 1;
  }

  /**
   * Check if there were recent failed login attempts
   */
  private async hasRecentFailedAttempts(email: string): Promise<boolean> {
    const recentFailures = await this.prisma.loginAttempt.findMany({
      where: {
        email,
        success: false,
        timestamp: {
          gte: new Date(Date.now() - 15 * 60 * 1000), // Last 15 minutes
        },
      },
    });

    return recentFailures.length >= 2;
  }

  /**
   * Send suspicious activity alert email
   */
  private async sendSuspiciousActivityAlert(
    context: LoginContext,
    reasons: string[],
    riskLevel: string,
  ): Promise<void> {
    try {
      const deviceInfo = this.extractDeviceFingerprint(context.userAgent);
      const location = context.location || 'Unknown location';

      await this.emailService.sendLoginNotification(
        context.email,
        context.firstName,
        deviceInfo,
        location,
        context.ipAddress,
        new Date(),
      );

      this.logger.log(`Suspicious activity alert sent to ${context.email}`);
    } catch (error: any) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send suspicious activity alert: ${errorMsg}`);
    }
  }

  /**
   * Mark device as trusted (user confirms it's their device)
   */
  async markDeviceAsTrusted(userId: string, deviceFingerprint: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { trustedDevices: true },
    });

    if (user) {
      const currentList = user.trustedDevices || [];
      if (!currentList.includes(deviceFingerprint)) {
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            trustedDevices: [...currentList, deviceFingerprint],
          },
        });
      }
    }

    this.logger.log(`Device marked as trusted for user ${userId}: ${deviceFingerprint}`);

    await this.eventBus.publish('security.device_trusted', {
      userId,
      deviceFingerprint,
      timestamp: new Date(),
    });
  }
}
