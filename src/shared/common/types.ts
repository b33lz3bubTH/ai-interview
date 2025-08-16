import { EventName } from '@/constants/events';

export type { EventName };

export interface EventPayload {
  [key: string]: any;
}

export interface EventContext {
  timestamp: number;
  source: string;
  correlationId?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface Event {
  name: EventName;
  payload: EventPayload;
  context: EventContext;
}

export interface EventHandler {
  handle(event: Event): Promise<void>;
  canHandle(eventName: EventName): boolean;
}

export interface EventHandlerMetadata {
  eventName: EventName;
  handler: EventHandler;
  priority?: number;
  async?: boolean;
}

export interface Plugin {
  name: string;
  version: string;
  description?: string;
  initialize(): Promise<void>;
  destroy(): Promise<void>;
  getEventHandlers(): EventHandlerMetadata[];
}

export interface PluginManager {
  registerPlugin(plugin: Plugin): Promise<void>;
  unregisterPlugin(pluginName: string): Promise<void>;
  getPlugin(name: string): Plugin | undefined;
  getAllPlugins(): Plugin[];
  initializePlugins(): Promise<void>;
  destroyPlugins(): Promise<void>;
}

export interface EventManager {
  registerHandler(eventName: EventName, handler: EventHandler, priority?: number): void;
  unregisterHandler(eventName: EventName, handler: EventHandler): void;
  emit(event: Event): Promise<void>;
  emitAsync(event: Event): void;
  getHandlers(eventName: EventName): EventHandler[];
}

export interface Logger {
  info(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}

export interface Config {
  port: number;
  environment: string;
  logLevel: string;
  plugins: {
    enabled: string[];
    disabled: string[];
  };
  events: {
    maxListeners: number;
    asyncHandling: boolean;
  };
} 