import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { EventManager } from '@/manager/EventManager';
import { PluginManager } from '@/manager/PluginManager';
import { Event, EventContext } from '@/shared/common/types';
import { EVENT_NAMES } from '@/constants/events';
import { createTRPCServer } from '@/trpc/server';
import logger from '@/utils/logger';
import config from '@/config';

export class Application {
  private app: express.Application;
  private eventManager: EventManager;
  private pluginManager: PluginManager;
  private server: any;

  constructor() {
    this.app = express();
    this.eventManager = new EventManager();
    this.pluginManager = new PluginManager(this.eventManager);
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupTRPC();
  }

  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private setupRoutes(): void {
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    this.app.get('/plugins', (req, res) => {
      const plugins = this.pluginManager.getAllPlugins().map(plugin => ({
        name: plugin.name,
        version: plugin.version,
        description: plugin.description
      }));
      res.json(plugins);
    });
  }

  private setupTRPC(): void {
    const { app: trpcApp } = createTRPCServer(this.eventManager);
    this.app.use(trpcApp);
  }

  async initialize(): Promise<void> {
    try {
      logger.info('Initializing application...');
      
      // Initialize plugins
      await this.pluginManager.initializePlugins();
      
      // Emit system startup event
      await this.emitSystemEvent(EVENT_NAMES.SYSTEM_STARTUP, {
        message: 'Application started successfully'
      });
      
      logger.info('Application initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize application:', error);
      throw error;
    }
  }

  async start(): Promise<void> {
    try {
      this.server = this.app.listen(config.port, () => {
        logger.info(`Server running on port ${config.port}`);
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      // Emit system shutdown event
      await this.emitSystemEvent(EVENT_NAMES.SYSTEM_SHUTDOWN, {
        message: 'Application shutting down'
      });
      
      // Destroy plugins
      await this.pluginManager.destroyPlugins();
      
      if (this.server) {
        this.server.close();
      }
      
      logger.info('Application stopped successfully');
    } catch (error) {
      logger.error('Error stopping application:', error);
      throw error;
    }
  }

  getEventManager(): EventManager {
    return this.eventManager;
  }

  getPluginManager(): PluginManager {
    return this.pluginManager;
  }

  getApp(): express.Application {
    return this.app;
  }

  private async emitSystemEvent(eventName: string, payload: any): Promise<void> {
    const event: Event = {
      name: eventName as any,
      payload,
      context: this.createEventContext('system')
    };
    
    await this.eventManager.emit(event);
  }

  private createEventContext(source: string): EventContext {
    return {
      timestamp: Date.now(),
      source,
      correlationId: this.generateCorrelationId()
    };
  }

  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 