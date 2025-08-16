import { PluginManager as IPluginManager, Plugin, EventManager, Logger } from '@/shared/common/types';
import logger from '@/utils/logger';
import config from '@/config';

export class PluginManager implements IPluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private eventManager: EventManager;
  private logger: Logger;

  constructor(eventManager: EventManager) {
    this.eventManager = eventManager;
    this.logger = logger;
  }

  async registerPlugin(plugin: Plugin): Promise<void> {
    try {
      if (this.plugins.has(plugin.name)) {
        throw new Error(`Plugin ${plugin.name} is already registered`);
      }

      // Check if plugin is disabled
      if (config.plugins.disabled.includes(plugin.name)) {
        this.logger.warn(`Plugin ${plugin.name} is disabled and will not be registered`);
        return;
      }

      // Check if plugin is enabled (if enabled list is not empty)
      if (config.plugins.enabled.length > 0 && !config.plugins.enabled.includes(plugin.name)) {
        this.logger.warn(`Plugin ${plugin.name} is not in enabled list and will not be registered`);
        return;
      }

      this.plugins.set(plugin.name, plugin);
      this.logger.info(`Plugin ${plugin.name} registered successfully`);
    } catch (error) {
      this.logger.error(`Failed to register plugin ${plugin.name}:`, error);
      throw error;
    }
  }

  async unregisterPlugin(pluginName: string): Promise<void> {
    try {
      const plugin = this.plugins.get(pluginName);
      if (!plugin) {
        throw new Error(`Plugin ${pluginName} is not registered`);
      }

      await plugin.destroy();
      this.plugins.delete(pluginName);
      this.logger.info(`Plugin ${pluginName} unregistered successfully`);
    } catch (error) {
      this.logger.error(`Failed to unregister plugin ${pluginName}:`, error);
      throw error;
    }
  }

  getPlugin(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  async initializePlugins(): Promise<void> {
    this.logger.info('Initializing plugins...');
    
    for (const plugin of this.plugins.values()) {
      try {
        await plugin.initialize();
        
        // Register event handlers from plugin
        const eventHandlers = plugin.getEventHandlers();
        for (const handlerMeta of eventHandlers) {
          this.eventManager.registerHandler(
            handlerMeta.eventName,
            handlerMeta.handler,
            handlerMeta.priority
          );
        }
        
        this.logger.info(`Plugin ${plugin.name} initialized successfully`);
      } catch (error) {
        this.logger.error(`Failed to initialize plugin ${plugin.name}:`, error);
        throw error;
      }
    }
    
    this.logger.info('All plugins initialized successfully');
  }

  async destroyPlugins(): Promise<void> {
    this.logger.info('Destroying plugins...');
    
    for (const plugin of this.plugins.values()) {
      try {
        await plugin.destroy();
        this.logger.info(`Plugin ${plugin.name} destroyed successfully`);
      } catch (error) {
        this.logger.error(`Failed to destroy plugin ${plugin.name}:`, error);
      }
    }
    
    this.plugins.clear();
    this.logger.info('All plugins destroyed successfully');
  }
} 