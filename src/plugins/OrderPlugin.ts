import { BasePlugin } from './BasePlugin';
import { EVENT_NAMES } from '@/constants/events';
import { Event } from '@/shared/common/types';
import logger from '@/utils/logger';

export class OrderPlugin extends BasePlugin {
  constructor() {
    super('order-plugin', '1.0.0', 'Handles order-related events');
  }

  async initialize(): Promise<void> {
    logger.info('Initializing OrderPlugin...');
    
    // Register event handlers
    this.registerEventHandler(
      EVENT_NAMES.ORDER_CREATED,
      this.createEventHandler(EVENT_NAMES.ORDER_CREATED, this.handleOrderCreated.bind(this))
    );

    this.registerEventHandler(
      EVENT_NAMES.ORDER_UPDATED,
      this.createEventHandler(EVENT_NAMES.ORDER_UPDATED, this.handleOrderUpdated.bind(this))
    );

    this.registerEventHandler(
      EVENT_NAMES.ORDER_CANCELLED,
      this.createEventHandler(EVENT_NAMES.ORDER_CANCELLED, this.handleOrderCancelled.bind(this))
    );

    this.registerEventHandler(
      EVENT_NAMES.ORDER_COMPLETED,
      this.createEventHandler(EVENT_NAMES.ORDER_COMPLETED, this.handleOrderCompleted.bind(this))
    );

    logger.info('OrderPlugin initialized successfully');
  }

  async destroy(): Promise<void> {
    logger.info('Destroying OrderPlugin...');
    // Cleanup logic here
  }

  private async handleOrderCreated(event: Event): Promise<void> {
    logger.info('Order created:', event.payload);
    // Handle order creation logic
  }

  private async handleOrderUpdated(event: Event): Promise<void> {
    logger.info('Order updated:', event.payload);
    // Handle order update logic
  }

  private async handleOrderCancelled(event: Event): Promise<void> {
    logger.info('Order cancelled:', event.payload);
    // Handle order cancellation logic
  }

  private async handleOrderCompleted(event: Event): Promise<void> {
    logger.info('Order completed:', event.payload);
    // Handle order completion logic
  }
} 