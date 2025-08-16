import dotenv from 'dotenv';
import { Config } from '@/shared/common/types';

dotenv.config();

export const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  environment: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  plugins: {
    enabled: process.env.ENABLED_PLUGINS?.split(',') || [],
    disabled: process.env.DISABLED_PLUGINS?.split(',') || []
  },
  events: {
    maxListeners: parseInt(process.env.MAX_EVENT_LISTENERS || '10', 10),
    asyncHandling: process.env.ASYNC_EVENT_HANDLING === 'true'
  }
};

export default config; 