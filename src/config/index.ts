import dotenv from 'dotenv';
import net from 'net';
import { Config } from '@/shared/common/types';

dotenv.config();

export const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  environment: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  plugins: {
    enabled: process.env.ENABLED_PLUGINS?.split(',') || [],
    disabled: process.env.DISABLED_PLUGINS?.split(',') || [],
  },
  events: {
    maxListeners: parseInt(process.env.MAX_EVENT_LISTENERS || '10', 10),
    asyncHandling: process.env.ASYNC_EVENT_HANDLING === 'true',
  },
};

/**
 * Check if a port is in use.
 */
function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    server.once('listening', () => {
      server.close();
      resolve(false);
    });

    server.listen(port);
  });
}

/**
 * Ensure an available port (increments if busy).
 */
export async function appConfig(): Promise<Config> {
  let port = config.port;

  while (await isPortInUse(port)) {
    port++;
  }

  return { ...config, port };
}

export default config;
