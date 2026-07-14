import { Module } from '@nestjs/common';
import { LiveClassesService } from './live-classes.service';
import { LiveClassesController } from './live-classes.controller';
import { DatabaseModule } from '../../database/database.module';
import { EventsModule } from '../../events/events.module';

@Module({
  imports: [DatabaseModule, EventsModule],
  controllers: [LiveClassesController],
  providers: [LiveClassesService],
  exports: [LiveClassesService],
})
export class LiveClassesModule {}
