import { Module, Global } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventBusService } from './event-bus.service';

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({
      // Use wildcards for event patterns
      wildcard: true,
      // Set the delimiter used to segment namespaces
      delimiter: '.',
      // Set this to `true` to use wildcards
      newListener: false,
      // Set this to `true` to remove a listener after it's triggered
      removeListener: false,
      // Max number of listeners per event
      maxListeners: 10,
      // Show event name in memory leak message when more than max amount of listeners
      verboseMemoryLeak: true,
      // Disable throwing uncaughtException if an error event is emitted and it has no listeners
      ignoreErrors: false,
    }),
  ],
  providers: [EventBusService],
  exports: [EventBusService],
})
export class EventsModule {}
