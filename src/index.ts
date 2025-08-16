import 'reflect-metadata';
import { Application } from '@/core/Application';
import { UserPlugin } from '@/plugins/UserPlugin';
import logger from '@/utils/logger';

// Get port from command line arguments or use default
function getPort(): number {
  const portArg = process.argv.find(arg => arg.startsWith('--port='));
  if (portArg) {
    const port = parseInt(portArg.split('=')[1]);
    if (!isNaN(port) && port > 0) {
      return port;
    }
  }
  return 3000; // default port
}

async function bootstrap() {
  const port = getPort();
  const app = new Application();
  
  try {
    // Register plugins
    await app.getPluginManager().registerPlugin(new UserPlugin());
    
    // Initialize application
    await app.initialize();
    
    // Start server with specified port
    await app.start(port);
    
    logger.info(`Application started successfully on port ${port}`);
    
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
