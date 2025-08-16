import 'reflect-metadata';
import { Application } from '@/core/Application';
import { UserPlugin } from '@/plugins/UserPlugin';
import { OrderPlugin } from '@/plugins/OrderPlugin';
import logger from '@/utils/logger';

async function bootstrap() {
  const app = new Application();
  
  try {
    // Register plugins
    await app.getPluginManager().registerPlugin(new UserPlugin());
    await app.getPluginManager().registerPlugin(new OrderPlugin());
    
    // Initialize application
    await app.initialize();
    
    // Start server
    await app.start();
    
    logger.info('Application started successfully');
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully...');
      await app.stop();
      process.exit(0);
    });
    
    process.on('SIGINT', async () => {
      logger.info('SIGINT received, shutting down gracefully...');
      await app.stop();
      process.exit(0);
    });
    
  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
