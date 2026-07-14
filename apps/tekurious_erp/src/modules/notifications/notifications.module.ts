import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController, MessagingController } from './notifications.controller';
import { DatabaseModule } from '../../database/database.module';
import { EventsModule } from '../../events/events.module';

@Module({
  imports: [DatabaseModule, EventsModule],
  controllers: [NotificationsController, MessagingController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
