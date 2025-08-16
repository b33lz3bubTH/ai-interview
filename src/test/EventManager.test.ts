import { EventManager } from '@/manager/EventManager';
import { EVENT_NAMES } from '@/constants/events';
import { Event } from '@/shared/common/types';

describe('EventManager', () => {
  let eventManager: EventManager;

  beforeEach(() => {
    eventManager = new EventManager();
  });

  it('should register and handle events', async () => {
    const mockHandler = jest.fn().mockResolvedValue(undefined);
    
    eventManager.registerHandler(EVENT_NAMES.USER_CREATED, {
      handle: mockHandler,
      canHandle: (eventName) => eventName === EVENT_NAMES.USER_CREATED
    });

    const event: Event = {
      name: EVENT_NAMES.USER_CREATED,
      payload: { id: '1', name: 'Test User' },
      context: {
        timestamp: Date.now(),
        source: 'test'
      }
    };

    await eventManager.emit(event);
    
    expect(mockHandler).toHaveBeenCalledWith(event);
  });

  it('should handle multiple handlers for the same event', async () => {
    const handler1 = jest.fn().mockResolvedValue(undefined);
    const handler2 = jest.fn().mockResolvedValue(undefined);
    
    eventManager.registerHandler(EVENT_NAMES.USER_CREATED, {
      handle: handler1,
      canHandle: (eventName) => eventName === EVENT_NAMES.USER_CREATED
    });

    eventManager.registerHandler(EVENT_NAMES.USER_CREATED, {
      handle: handler2,
      canHandle: (eventName) => eventName === EVENT_NAMES.USER_CREATED
    });

    const event: Event = {
      name: EVENT_NAMES.USER_CREATED,
      payload: { id: '1', name: 'Test User' },
      context: {
        timestamp: Date.now(),
        source: 'test'
      }
    };

    await eventManager.emit(event);
    
    expect(handler1).toHaveBeenCalledWith(event);
    expect(handler2).toHaveBeenCalledWith(event);
  });
}); 