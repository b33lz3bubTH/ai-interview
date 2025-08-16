import { EventEmitter2 } from 'eventemitter2';
import { EventManager as IEventManager, Event, EventHandler, Logger } from '@/shared/common/types';
import { EventName } from '@/constants/events';
import logger from '@/utils/logger';
import config from '@/config';

export class EventManager implements IEventManager {
  private eventEmitter: EventEmitter2;
  private handlers: Map<EventName, EventHandler[]> = new Map();
  private logger: Logger;

  constructor() {
    this.eventEmitter = new EventEmitter2({
      maxListeners: config.events.maxListeners,
      wildcard: true,
      delimiter: '.'
    });
    this.logger = logger;
  }

  registerHandler(eventName: EventName, handler: EventHandler, priority: number = 0): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }

    const handlers = this.handlers.get(eventName)!;
    handlers.push(handler);
    
    // Sort by priority (higher priority first)
    handlers.sort((a, b) => {
      const aPriority = (a as any).priority || 0;
      const bPriority = (b as any).priority || 0;
      return bPriority - aPriority;
    });

    this.eventEmitter.on(eventName, async (event: Event) => {
      try {
        await handler.handle(event);
      } catch (error) {
        this.logger.error(`Error in event handler for ${eventName}:`, error);
      }
    });

    this.logger.info(`Registered handler for event: ${eventName}`);
  }

  unregisterHandler(eventName: EventName, handler: EventHandler): void {
    const handlers = this.handlers.get(eventName);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
        // Remove all listeners for this event
        this.eventEmitter.removeAllListeners(eventName);
        this.logger.info(`Unregistered handler for event: ${eventName}`);
      }
    }
  }

  async emit(event: Event): Promise<void> {
    try {
      this.logger.debug(`Emitting event: ${event.name}`, { payload: event.payload });
      await this.eventEmitter.emitAsync(event.name, event);
    } catch (error) {
      this.logger.error(`Error emitting event ${event.name}:`, error);
      throw error;
    }
  }

  emitAsync(event: Event): void {
    this.emit(event).catch(error => {
      this.logger.error(`Async event emission failed for ${event.name}:`, error);
    });
  }

  getHandlers(eventName: EventName): EventHandler[] {
    return this.handlers.get(eventName) || [];
  }

  getEventEmitter(): EventEmitter2 {
    return this.eventEmitter;
  }
} 