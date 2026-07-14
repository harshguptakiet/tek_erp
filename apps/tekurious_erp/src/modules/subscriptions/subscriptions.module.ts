import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController, LicensesController } from './subscriptions.controller';
import { DatabaseModule } from '../../database/database.module';
import { EventsModule } from '../../events/events.module';

@Module({
  imports: [DatabaseModule, EventsModule],
  controllers: [SubscriptionsController, LicensesController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
