import { BasePlugin } from './BasePlugin';
import { EVENT_NAMES } from '@/constants/events';
import { Event } from '@/shared/common/types';
import logger from '@/utils/logger';

export class UserPlugin extends BasePlugin {
  constructor() {
    super('user-plugin', '1.0.0', 'Handles user-related events');
  }

  async initialize(): Promise<void> {
    logger.info('Initializing UserPlugin...');
    
    // Register event handlers
    this.registerEventHandler(
      EVENT_NAMES.USER_CREATED,
      this.createEventHandler(EVENT_NAMES.USER_CREATED, this.handleUserCreated.bind(this))
    );

    this.registerEventHandler(
      EVENT_NAMES.USER_UPDATED,
      this.createEventHandler(EVENT_NAMES.USER_UPDATED, this.handleUserUpdated.bind(this))
    );

    this.registerEventHandler(
      EVENT_NAMES.USER_LOGIN,
      this.createEventHandler(EVENT_NAMES.USER_LOGIN, this.handleUserLogin.bind(this))
    );

    this.registerEventHandler(
      EVENT_NAMES.USER_ME,
      this.createEventHandler(EVENT_NAMES.USER_ME, this.handleUserMe.bind(this))
    );

    logger.info('UserPlugin initialized successfully');
  }

  async destroy(): Promise<void> {
    logger.info('Destroying UserPlugin...');
    // Cleanup logic here
  }

  private async handleUserCreated(event: Event): Promise<void> {
    logger.info('User created:', event.payload);
    // Handle user creation logic
  }

  private async handleUserUpdated(event: Event): Promise<void> {
    logger.info('User updated:', event.payload);
    // Handle user update logic
  }

  private async handleUserLogin(event: Event): Promise<void> {
    logger.info('User login:', event.payload);
    // Handle user login logic
  }

  private async handleUserMe(event: Event): Promise<void> {
    logger.info('User me:', event.payload);
  }
} 