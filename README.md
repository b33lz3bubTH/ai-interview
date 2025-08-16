# tRPC Event-Driven Microservices

A professional Node.js TypeScript project implementing tRPC SDK microservices with event-driven architecture, plugin-based pattern, and SOLID principles.

## Features

- **Event-Driven Architecture**: Decoupled event system with named constants
- **Plugin-Based Pattern**: Modular, independent plugins that can be enabled/disabled
- **tRPC Integration**: Type-safe API with automatic event emission
- **SOLID Principles**: Clean architecture with dependency injection
- **Professional Setup**: Winston logging, configuration management, graceful shutdown

## Project Structure

```
src/
├── constants/
│   └── events.ts              # Event name constants
├── shared/
│   └── common/
│       └── types.ts           # Common interfaces and types
├── core/
│   └── Application.ts         # Main application orchestrator
├── manager/
│   ├── EventManager.ts        # Event registration and emission
│   └── PluginManager.ts       # Plugin lifecycle management
├── plugins/
│   ├── BasePlugin.ts          # Abstract base plugin class
│   ├── UserPlugin.ts          # User event handlers
│   └── OrderPlugin.ts         # Order event handlers
├── events/
│   └── EventFactory.ts        # Event creation utilities
├── trpc/
│   ├── routers/
│   │   ├── index.ts           # Main router that merges all routers
│   │   ├── user.router.ts     # User-related procedures
│   │   ├── order.router.ts    # Order-related procedures
│   │   └── system.router.ts   # System-related procedures
│   └── server.ts              # tRPC server setup
├── config/
│   └── index.ts               # Configuration management
├── utils/
│   └── logger.ts              # Winston logger setup
└── index.ts                   # Application entry point
```

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Run in development**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

## Event System

Events are defined as constants in `src/constants/events.ts`:

```typescript
export const EVENT_NAMES = {
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  ORDER_CREATED: 'order.created',
  // ... more events
} as const;
```

## Plugin System

Plugins extend `BasePlugin` and register event handlers:

```typescript
export class UserPlugin extends BasePlugin {
  async initialize(): Promise<void> {
    this.registerEventHandler(
      EVENT_NAMES.USER_CREATED,
      this.createEventHandler(EVENT_NAMES.USER_CREATED, this.handleUserCreated.bind(this))
    );
  }
}
```

## tRPC API Structure

The tRPC API is organized by resources:

### User Endpoints
- `POST /trpc/user.create` - Create user
- `POST /trpc/user.update` - Update user
- `POST /trpc/user.delete` - Delete user
- `POST /trpc/user.login` - User login
- `POST /trpc/user.logout` - User logout

### Order Endpoints
- `POST /trpc/order.create` - Create order
- `POST /trpc/order.update` - Update order
- `POST /trpc/order.cancel` - Cancel order
- `POST /trpc/order.complete` - Complete order

### System Endpoints
- `GET /trpc/system.health` - Health check
- `POST /trpc/system.emitEvent` - Emit custom event
- `GET /trpc/system.getSystemInfo` - System information

## Configuration

Configure plugins and events via environment variables:

```bash
# Enable/disable plugins
ENABLED_PLUGINS=user-plugin,order-plugin
DISABLED_PLUGINS=

# Event system settings
MAX_EVENT_LISTENERS=10
ASYNC_EVENT_HANDLING=true
```

## API Endpoints

- `GET /health` - Health check
- `GET /plugins` - List registered plugins
- `POST /trpc/*` - tRPC API endpoints (see structure above)

## Development

```bash
# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format

# Clean build
npm run clean
```

## Architecture Principles

- **Single Responsibility**: Each class has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Plugins can be substituted without breaking
- **Interface Segregation**: Small, focused interfaces
- **Dependency Inversion**: Depend on abstractions, not concretions 