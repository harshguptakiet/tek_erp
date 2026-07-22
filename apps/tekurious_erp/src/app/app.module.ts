import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '../database/database.module';
import { EventsModule } from '../events/events.module';
import { AuthModule } from '../modules/auth/auth.module';
import { UsersModule } from '../modules/users/users.module';
import { OrganizationsModule } from '../modules/organizations/organizations.module';
import { AcademicModule } from '../modules/academic/academic.module';
import { ContentModule } from '../modules/content/content.module';
import { AssessmentModule } from '../modules/assessment/assessment.module';
import { AssignmentsModule } from '../modules/assignments/assignments.module';
import { AttendanceModule } from '../modules/attendance/attendance.module';
import { NotificationsModule } from '../modules/notifications/notifications.module';
import { PaymentsModule } from '../modules/payments/payments.module';
import { LiveClassesModule } from '../modules/live-classes/live-classes.module';
import { AnalyticsModule } from '../modules/analytics/analytics.module';
import { MarketplaceModule } from '../modules/marketplace/marketplace.module';
import { SearchModule } from '../modules/search/search.module';
import { SystemModule } from '../modules/system/system.module';
import { SubscriptionsModule } from '../modules/subscriptions/subscriptions.module';
import { ErpModule } from '../modules/erp/erp.module';
import { MediaModule } from '../modules/media/media.module';
import { JwtAuthGuard } from '../modules/auth/guards';

@Module({
  imports: [
    // Configuration module - loads .env file
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),
    // Rate limiting configuration (dev: relaxed, prod: strict)
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 100, // 100 requests per second (dev)
      },
      {
        name: 'medium',
        ttl: 10000, // 10 seconds
        limit: 500, // 500 requests per 10 seconds (dev)
      },
      {
        name: 'long',
        ttl: 60000, // 1 minute
        limit: 3000, // 3000 requests per minute (dev)
      },
    ]),
    // Database module (Prisma)
    DatabaseModule,
    // Events module (Event Emitter)
    EventsModule,
    // Feature modules
    AuthModule,
    UsersModule,
    OrganizationsModule,
    AcademicModule,
    ContentModule,
    AssessmentModule,
    AssignmentsModule,
    AttendanceModule,
    NotificationsModule,
    PaymentsModule,
    LiveClassesModule,
    AnalyticsModule,
    MarketplaceModule,
    SearchModule,
    SystemModule,
    SubscriptionsModule,
    ErpModule,
    MediaModule,
    // etc.
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply JWT authentication globally to all routes
    // Use @Public() decorator to make specific routes public
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Apply rate limiting globally to all routes
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
