import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { EventManager } from '@/manager/EventManager';
import { EVENT_NAMES } from '@/constants/events';
import { Event, EventContext } from '@/shared/common/types';

const t = initTRPC.create();

export const orderRouter = t.router;
export const orderProcedure = t.procedure;

export function createOrderRouter(eventManager: EventManager) {
  const orderSchema = z.object({
    id: z.string(),
    userId: z.string(),
    items: z.array(z.object({
      productId: z.string(),
      quantity: z.number(),
      price: z.number(),
    })),
    total: z.number(),
  });

  return orderRouter({
    create: orderProcedure
      .input(orderSchema)
      .mutation(async ({ input }) => {
        const order = { ...input, createdAt: new Date(), status: 'pending' };
        
        const event: Event = {
          name: EVENT_NAMES.ORDER_CREATED,
          payload: order,
          context: createEventContext('trpc', input.userId)
        };
        
        await eventManager.emit(event);
        
        return order;
      }),

    update: orderProcedure
      .input(z.object({
        id: z.string(),
        updates: orderSchema.partial()
      }))
      .mutation(async ({ input }) => {
        const updatedOrder = { id: input.id, ...input.updates, updatedAt: new Date() };
        
        const event: Event = {
          name: EVENT_NAMES.ORDER_UPDATED,
          payload: updatedOrder,
          context: createEventContext('trpc')
        };
        
        await eventManager.emit(event);
        
        return updatedOrder;
      }),

    cancel: orderProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        const event: Event = {
          name: EVENT_NAMES.ORDER_CANCELLED,
          payload: { id: input.id },
          context: createEventContext('trpc')
        };
        
        await eventManager.emit(event);
        
        return { success: true, id: input.id };
      }),

    complete: orderProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        const event: Event = {
          name: EVENT_NAMES.ORDER_COMPLETED,
          payload: { id: input.id },
          context: createEventContext('trpc')
        };
        
        await eventManager.emit(event);
        
        return { success: true, id: input.id };
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