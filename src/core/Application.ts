import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { EventManager } from '@/manager/EventManager';
import { PluginManager } from '@/manager/PluginManager';
import { createTRPCServer } from '@/trpc/server';
import logger from '@/utils/logger';
import config from '@/config';
import { Event } from '@/shared/common/types';
import { EVENT_NAMES } from '@/constants/events';

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
  }

  private setupMiddleware(): void {
    // Configure helmet with CSP that allows tRPC playground
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            "https://cdn.jsdelivr.net",
            "https://unpkg.com"
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://cdn.jsdelivr.net",
            "https://unpkg.com"
          ],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https:", "wss:"],
          fontSrc: ["'self'", "https:", "data:"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
    }));
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private setupRoutes(): void {
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
      });
    });

    this.app.get('/plugins', (req, res) => {
      const plugins = this.pluginManager.getAllPlugins();
      res.json({
        plugins: plugins.map(p => p.name),
        count: plugins.length,
      });
    });
  }

  private async setupTRPC(): Promise<void> {
    try {
      const { app: trpcApp } = await createTRPCServer(this.eventManager);
      
      // Mount tRPC app on the main app
      this.app.use(trpcApp);
      
      logger.info('tRPC server setup completed successfully');
    } catch (error) {
      logger.error('Failed to setup tRPC server:', error);
      throw error;
    }
  }

  async initialize(): Promise<void> {
    logger.info('Initializing application...');
    
    // Initialize plugins first
    await this.pluginManager.initializePlugins();
    
    // Setup tRPC server
    await this.setupTRPC();
    
    // Emit system events
    const initEvent: Event = {
      name: EVENT_NAMES.SYSTEM_STARTUP,
      payload: {
        timestamp: new Date().toISOString(),
        plugins: this.pluginManager.getAllPlugins().map(p => p.name),
      },
      context: {
        timestamp: Date.now(),
        source: 'system',
        correlationId: `init_${Date.now()}`,
      },
    };
    await this.eventManager.emit(initEvent);
    
    logger.info('Application initialized successfully');
  }

  async start(port?: number): Promise<void> {
    const serverPort = port || config.port;
    
    this.server = this.app.listen(serverPort, () => {
      logger.info(`Server running on port ${serverPort}`);
    });
    
    // Emit system events
    const startEvent: Event = {
      name: EVENT_NAMES.SYSTEM_STARTUP,
      payload: {
        timestamp: new Date().toISOString(),
        port: serverPort,
      },
      context: {
        timestamp: Date.now(),
        source: 'system',
        correlationId: `start_${Date.now()}`,
      },
    };
    await this.eventManager.emit(startEvent);
  }

  async stop(): Promise<void> {
    logger.info('Stopping application...');
    
    if (this.server) {
      this.server.close();
    }
    
    // Destroy plugins
    await this.pluginManager.destroyPlugins();
    
    // Emit system events
    const stopEvent: Event = {
      name: EVENT_NAMES.SYSTEM_SHUTDOWN,
      payload: {
        timestamp: new Date().toISOString(),
      },
      context: {
        timestamp: Date.now(),
        source: 'system',
        correlationId: `stop_${Date.now()}`,
      },
    };
    await this.eventManager.emit(stopEvent);
    
    logger.info('Application stopped successfully');
  }

  getEventManager(): EventManager {
    return this.eventManager;
  }

  getPluginManager(): PluginManager {
    return this.pluginManager;
  }
} 