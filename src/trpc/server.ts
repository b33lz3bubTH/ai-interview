import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { expressHandler } from 'trpc-playground/handlers/express';
import { createAppRouter } from './routers';
import { EventManager } from '@/manager/EventManager';
import logger from '@/utils/logger';
import {appConfig} from '@/config';

export async function createTRPCServer(eventManager: EventManager) { 
  const appRouter = createAppRouter(eventManager);
  const app = express();

  // Add body parser middleware with increased limit for audio files
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext: () => ({}),
      onError: ({ error }) => {
        logger.error('tRPC error:', error);
      },
      // Add configuration for large payloads (20MB in bytes)
      maxBodySize: 20 * 1024 * 1024,
    })
  );

  if (process.env.NODE_ENV !== 'production') {
    const playgroundHandler = await expressHandler({
      trpcApiEndpoint: '/trpc',
      playgroundEndpoint: '/trpc-playground',
      router: appRouter,
    });

    app.use('/trpc-playground', playgroundHandler);
    logger.info(`🚀 tRPC Playground available at http://localhost:${(await appConfig()).port}/trpc-playground`);
  }

  return { app, appRouter };
}

export type AppRouter = ReturnType<typeof createAppRouter>;
