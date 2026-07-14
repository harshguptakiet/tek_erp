import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma.service';
import { UserPayload } from '../dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any): Promise<UserPayload> {
    // Payload contains: { sub: userId, email, tenantId, roles, iat, exp }
    
    // Verify user still exists and is active
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        tenantId: true,
        status: true,
        deletedAt: true,
      },
    });

    if (!user || user.status === 'SUSPENDED' || user.status === 'INACTIVE' || user.deletedAt) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      id: user.id,
      userId: user.id, // alias used by some controllers
      email: user.email,
      tenantId: user.tenantId,
      roles: payload.roles || [],
    };
  }
}
