import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface DomainEvent {
  eventName: string;
  payload: Record<string, any>;
  timestamp: Date;
  tenantId?: string;
  userId?: string;
}

@Injectable()
export class EventBusService {
  private readonly logger = new Logger(EventBusService.name);

  constructor(private eventEmitter: EventEmitter2) {}

  /**
   * Publish a domain event
   */
  async publish(eventName: string, payload: Record<string, any>): Promise<void> {
    const event: DomainEvent = {
      eventName,
      payload,
      timestamp: new Date(),
      tenantId: payload.tenantId,
      userId: payload.userId,
    };

    this.logger.log(`📡 Publishing event: ${eventName}`);
    this.logger.debug(`Event payload: ${JSON.stringify(payload)}`);

    await this.eventEmitter.emitAsync(eventName, event);
  }

  /**
   * Subscribe to an event
   */
  subscribe(eventName: string, handler: (event: DomainEvent) => void | Promise<void>): void {
    this.logger.log(`👂 Subscribing to event: ${eventName}`);
    this.eventEmitter.on(eventName, handler);
  }

  /**
   * Subscribe to multiple events with a wildcard
   */
  subscribeMany(pattern: string, handler: (event: DomainEvent) => void | Promise<void>): void {
    this.logger.log(`👂 Subscribing to event pattern: ${pattern}`);
    this.eventEmitter.on(pattern, handler);
  }

  /**
   * Remove a listener
   */
  unsubscribe(eventName: string, handler: (event: DomainEvent) => void): void {
    this.eventEmitter.off(eventName, handler);
  }
}
