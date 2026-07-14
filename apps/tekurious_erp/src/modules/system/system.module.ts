import { Module } from '@nestjs/common';
import { SystemService } from './system.service';
import { SystemController } from './system.controller';
import { DatabaseModule } from '../../database/database.module';
import { EventsModule } from '../../events/events.module';

@Module({
  imports: [DatabaseModule, EventsModule],
  controllers: [SystemController],
  providers: [SystemService],
  exports: [SystemService],
})
export class SystemModule {}
