import { Plugin, EventHandlerMetadata, EventHandler } from '@/shared/common/types';
import { EventName } from '@/constants/events';
import { Event } from '@/shared/common/types';

export abstract class BasePlugin implements Plugin {
  public readonly name: string;
  public readonly version: string;
  public readonly description?: string;
  
  protected eventHandlers: EventHandlerMetadata[] = [];

  constructor(name: string, version: string, description?: string) {
    this.name = name;
    this.version = version;
    this.description = description;
  }

  abstract initialize(): Promise<void>;
  abstract destroy(): Promise<void>;

  protected registerEventHandler(
    eventName: EventName,
    handler: EventHandler,
    priority: number = 0,
    async: boolean = false
  ): void {
    this.eventHandlers.push({
      eventName,
      handler,
      priority,
      async
    });
  }

  getEventHandlers(): EventHandlerMetadata[] {
    return [...this.eventHandlers];
  }

  protected createEventHandler(
    eventName: EventName,
    handler: (event: Event) => Promise<void>
  ): EventHandler {
    return {
      handle: handler,
      canHandle: (name: EventName) => name === eventName
    };
  }
} 