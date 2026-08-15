import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma.service';
import { UserPayload } from '../dto';
import { SecurityService } from '../services/security.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private securityService: SecurityService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'tekurious-erp-default-jwt-secret-key-2026',
      passReqToCallback: true, // Pass request to validate method
    });
  }

  async validate(req: Request, payload: any): Promise<UserPayload> {
    // Payload contains: { sub: userId, email, tenantId, roles, iat, exp }
    
    // Extract token from header
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    
    // 1. Check if token is blacklisted (critical security check)
    if (token) {
      const isBlacklisted = await this.securityService.isTokenBlacklisted(token);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }
    }
    
    // 2. Verify user still exists and is active
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        tenantId: true,
        status: true,
        deletedAt: true,
        lockedUntil: true,
      },
    });

    if (!user || user.status === 'SUSPENDED' || user.status === 'INACTIVE' || user.deletedAt) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // 3. Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account is temporarily locked');
    }

    // 4. Check session timeout (if sessionId is in payload)
    if (payload.sessionId) {
      const isTimedOut = await this.securityService.checkSessionTimeout(payload.sessionId);
      if (isTimedOut) {
        throw new UnauthorizedException('Session has expired due to inactivity');
      }
      
      // Update session activity timestamp
      await this.securityService.updateSessionActivity(payload.sessionId);
    }

    return {
      id: user.id,
      userId: user.id, // alias used by some controllers
      email: user.email,
      tenantId: user.tenantId,
      roles: payload.roles || [],
      sessionId: payload.sessionId, // CRITICAL: must propagate sessionId for ping/CSRF/session ops to work
    };
  }
}
