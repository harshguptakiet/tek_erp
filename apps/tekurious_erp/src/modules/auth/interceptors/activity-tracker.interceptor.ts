/**
 * Activity Tracker Interceptor
 * Tracks user activity and updates lastActivityAt timestamp
 * Used for session inactivity timeout (FR-AUTH-016)
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class ActivityTrackerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ActivityTrackerInterceptor.name);

  constructor(private readonly prisma: PrismaService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Only track activity for authenticated requests
    if (user && user.sessionId) {
      try {
        // Update lastActivityAt in background (non-blocking)
        this.updateActivity(user.sessionId).catch((error) => {
          this.logger.error(
            `Failed to update activity for session ${user.sessionId}: ${error.message}`,
          );
        });
      } catch (error) {
        // Don't block request if activity tracking fails
        this.logger.error(`Activity tracking error: ${error.message}`);
      }
    }

    return next.handle().pipe(
      tap(() => {
        // Additional processing after response (if needed)
      }),
    );
  }

  private async updateActivity(sessionId: string): Promise<void> {
    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: { lastActivityAt: new Date() },
    });
  }
}
