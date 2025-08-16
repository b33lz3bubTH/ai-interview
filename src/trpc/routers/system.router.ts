import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { EventManager } from '@/manager/EventManager';
import { EVENT_NAMES } from '@/constants/events';
import { Event, EventContext } from '@/shared/common/types';

const t = initTRPC.create();

export const systemRouter = t.router;
export const systemProcedure = t.procedure;

export function createSystemRouter(eventManager: EventManager) {
  return systemRouter({
    health: systemProcedure
      .query(() => {
        return { status: 'healthy', timestamp: new Date().toISOString() };
      }),

    emitEvent: systemProcedure
      .input(z.object({
        eventName: z.string(),
        payload: z.any()
      }))
      .mutation(async ({ input }) => {
        const event: Event = {
          name: input.eventName as any,
          payload: input.payload,
          context: createEventContext('trpc')
        };
        
        await eventManager.emit(event);
        
        return { success: true, eventName: input.eventName };
      }),

    getSystemInfo: systemProcedure
      .query(() => {
        return {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          version: process.version,
          platform: process.platform
        };
      })
  });
}

function createEventContext(source: string, userId?: string): EventContext {
  return {
    timestamp: Date.now(),
    source,
    userId,
    correlationId: `trpc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
} 