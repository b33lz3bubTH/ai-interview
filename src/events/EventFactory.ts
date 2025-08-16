import { Event, EventContext, EventPayload } from '@/shared/common/types';
import { EventName } from '@/constants/events';

export class EventFactory {
  static createEvent(
    name: EventName,
    payload: EventPayload,
    source: string,
    options?: {
      correlationId?: string;
      userId?: string;
      sessionId?: string;
      metadata?: Record<string, any>;
    }
  ): Event {
    const context: EventContext = {
      timestamp: Date.now(),
      source,
      correlationId: options?.correlationId || this.generateCorrelationId(),
      userId: options?.userId,
      sessionId: options?.sessionId,
      metadata: options?.metadata
    };

    return {
      name,
      payload,
      context
    };
  }

  static createUserEvent(
    name: EventName,
    payload: EventPayload,
    userId: string,
    options?: {
      correlationId?: string;
      sessionId?: string;
      metadata?: Record<string, any>;
    }
  ): Event {
    return this.createEvent(name, payload, 'user', {
      userId,
      ...options
    });
  }

  static createSystemEvent(
    name: EventName,
    payload: EventPayload,
    options?: {
      correlationId?: string;
      metadata?: Record<string, any>;
    }
  ): Event {
    return this.createEvent(name, payload, 'system', options);
  }

  static createTRPCEvent(
    name: EventName,
    payload: EventPayload,
    options?: {
      correlationId?: string;
      userId?: string;
      metadata?: Record<string, any>;
    }
  ): Event {
    return this.createEvent(name, payload, 'trpc', options);
  }

  private static generateCorrelationId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 