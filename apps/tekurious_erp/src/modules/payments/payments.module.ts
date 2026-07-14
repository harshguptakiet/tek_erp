import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController, FeesController } from './payments.controller';
import { DatabaseModule } from '../../database/database.module';
import { EventsModule } from '../../events/events.module';

@Module({
  imports: [DatabaseModule, EventsModule],
  controllers: [PaymentsController, FeesController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
