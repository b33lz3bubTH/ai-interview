import { z } from "zod";

export type EventPayloads = {
  USER_CREATED: { userId: string; email: string };
  ORDER_PLACED: { orderId: string; userId: string };
};

export const EventSchemas = {
  USER_CREATED: z.object({ userId: z.string(), email: z.string().email() }),
  ORDER_PLACED: z.object({ orderId: z.string(), userId: z.string() }),
};
