import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { PrismaService } from '../../database/prisma.service';
import { EventsModule } from '../../events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [SyncController],
  providers: [SyncService, PrismaService],
  exports: [SyncService],
})
export class SyncModule {}
