/*
* his is a test router, so that we follow the trpc best practices and maintain this structure of code
*/



import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { EventManager } from '@/manager/EventManager';
import { EVENT_NAMES } from '@/constants/events';
import { Event, EventContext } from '@/shared/common/types';

const t = initTRPC.create();

export const userRouter = t.router;
export const userProcedure = t.procedure;

export function createUserRouter(eventManager: EventManager) {
  const userSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
  });

  return userRouter({
    create: userProcedure
      .input(userSchema)
      .mutation(async ({ input }) => {
        const user = { ...input, createdAt: new Date() };

        const event: Event = {
          name: EVENT_NAMES.USER_CREATED,
          payload: user,
          context: createEventContext('trpc', input.id)
        };

        await eventManager.emit(event);

        return user;
      }),

    update: userProcedure
      .input(z.object({
        id: z.string(),
        updates: userSchema.partial()
      }))
      .mutation(async ({ input }) => {
        const updatedUser = { id: input.id, ...input.updates, updatedAt: new Date() };

        const event: Event = {
          name: EVENT_NAMES.USER_UPDATED,
          payload: updatedUser,
          context: createEventContext('trpc', input.id)
        };

        await eventManager.emit(event);

        return updatedUser;
      }),

    delete: userProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        const event: Event = {
          name: EVENT_NAMES.USER_DELETED,
          payload: { id: input.id },
          context: createEventContext('trpc', input.id)
        };

        await eventManager.emit(event);

        return { success: true, id: input.id };
      }),

    login: userProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string()
      }))
      .mutation(async ({ input }) => {
        const event: Event = {
          name: EVENT_NAMES.USER_LOGIN,
          payload: { email: input.email },
          context: createEventContext('trpc')
        };

        await eventManager.emit(event);

        return { success: true, email: input.email };
      }),

    logout: userProcedure
      .input(z.object({ userId: z.string() }))
      .mutation(async ({ input }) => {
        const event: Event = {
          name: EVENT_NAMES.USER_LOGOUT,
          payload: { userId: input.userId },
          context: createEventContext('trpc', input.userId)
        };

        await eventManager.emit(event);

        return { success: true, userId: input.userId };
      }),

    me: userProcedure
      .input(z.object({
        userId: z.string(),
        token: z.string().optional().nullable(),
      }))
      .query(async ({ input }) => {
        const event: Event = {
          name: EVENT_NAMES.USER_ME,
          payload: { userId: input.userId, token: input.token ?? "default token" },
          context: createEventContext('trpc')
        };

        await eventManager.emit(event);

        return { success: true, userId: input.userId };
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