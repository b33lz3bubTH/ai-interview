export const EVENT_NAMES = {
  // User events
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',

  // Order events
  ORDER_CREATED: 'order.created',
  ORDER_UPDATED: 'order.updated',
  ORDER_CANCELLED: 'order.cancelled',
  ORDER_COMPLETED: 'order.completed',

  // System events
  SYSTEM_STARTUP: 'system.startup',
  SYSTEM_SHUTDOWN: 'system.shutdown',
  SYSTEM_ERROR: 'system.error',
  SYSTEM_HEALTH_CHECK: 'system.health_check',

  // Plugin events
  PLUGIN_LOADED: 'plugin.loaded',
  PLUGIN_UNLOADED: 'plugin.unloaded',
  PLUGIN_ERROR: 'plugin.error',

  // tRPC events
  TRPC_REQUEST: 'trpc.request',
  TRPC_RESPONSE: 'trpc.response',
  TRPC_ERROR: 'trpc.error'
} as const;

export type EventName = typeof EVENT_NAMES[keyof typeof EVENT_NAMES];
