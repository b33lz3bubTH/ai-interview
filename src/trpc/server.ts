import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { createAppRouter } from './routers';
import { EventManager } from '@/manager/EventManager';
import logger from '@/utils/logger';

export function createTRPCServer(eventManager: EventManager) {
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
  
  return { app, appRouter };
}

export type AppRouter = ReturnType<typeof createAppRouter>; 