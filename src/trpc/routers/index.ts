import { initTRPC } from '@trpc/server';
import { EventManager } from '@/manager/EventManager';
import { createUserRouter } from './user.router';
import { createSystemRouter } from './system.router';

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

export function createAppRouter(eventManager: EventManager) {
  return router({
    user: createUserRouter(eventManager),
    system: createSystemRouter(eventManager)
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>; 