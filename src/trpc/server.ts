import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { expressHandler } from 'trpc-playground/handlers/express';
import { createAppRouter } from './routers';
import { EventManager } from '@/manager/EventManager';
import logger from '@/utils/logger';
import config from '@/config';

export async function createTRPCServer(eventManager: EventManager) { 
  const appRouter = createAppRouter(eventManager);
  const app = express();

  app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext: () => ({}),
      onError: ({ error }) => {
        logger.error('tRPC error:', error);
      },
    })
  );

  if (process.env.NODE_ENV !== 'production') {
    const playgroundHandler = await expressHandler({
      trpcApiEndpoint: '/trpc',
      playgroundEndpoint: '/trpc-playground',
      router: appRouter,
    });

    app.use('/trpc-playground', playgroundHandler);
    logger.info(`🚀 tRPC Playground available at http://localhost:${config.port}/trpc-playground`);
  }

  return { app, appRouter };
}

export type AppRouter = ReturnType<typeof createAppRouter>;
