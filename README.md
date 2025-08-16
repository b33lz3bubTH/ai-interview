# tRPC Event-Driven Microservices

A professional Node.js TypeScript project implementing tRPC SDK microservices with event-driven architecture, plugin-based pattern, and SOLID principles.

## Features

- **Event-Driven Architecture**: Decoupled event system with named constants
- **Plugin-Based Pattern**: Modular, independent plugins that can be enabled/disabled
- **tRPC Integration**: Type-safe API with automatic event emission
- **SOLID Principles**: Clean architecture with dependency injection
- **Professional Setup**: Winston logging, configuration management, graceful shutdown
- **Interactive Playground**: Beautiful web UI for testing tRPC endpoints with autocomplete

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

4. **Run multiple instances** (for testing microservices):
   ```bash
   # Option 1: Use the convenience script (recommended)
   npm run dev:multi
   
   # Option 2: Run individual instances
   # Instance 1 on port 3000
   npm run dev:3000
   
   # Instance 2 on port 3001
   npm run dev:3001
   
   # Instance 3 on port 3002
   npm run dev:3002
   
   # Instance 4 on port 3003
   npm run dev:3003
   ```

5. **Custom port** (command line):
   ```bash
   npm run dev -- --port=4000
   ```

6. **Run multiple instances with custom count**:
   ```bash
   # Run 5 instances (ports 3000-3004)
   ./scripts/run-multiple.sh 5
   
   # Run 2 instances (ports 3000-3001)
   ./scripts/run-multiple.sh 2
   ```

7. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

## Testing Your API

### **🎮 Interactive tRPC Playground (Recommended)**
Open your browser and navigate to: `http://localhost:3000/trpc-playground`

**Features:**
- **🚀 Professional tRPC Playground** - Official tRPC playground with full autocomplete
- **📝 Schema Discovery** - Automatically discovers your tRPC procedures
- **🔍 Real-time Testing** - Test queries and mutations with instant results
- **📊 Type Safety** - Full TypeScript support with type checking
- **🎯 Auto-completion** - Intelligent suggestions for all your endpoints
- **📱 Modern UI** - Clean, professional interface

### **Command Line Testing**
```bash
# Test user creation
curl -X POST http://localhost:3000/trpc/user.create \
  -H "Content-Type: application/json" \
  -d '{"id":"user1","email":"test@example.com","name":"Test User"}'

# Test user.me query
curl "http://localhost:3000/trpc/user.me?input=%7B%22userId%22%3A%22user123%22%2C%22token%22%3A%22test-token%22%7D"

# Test system health
curl "http://localhost:3000/trpc/system.health"
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
- `GET /trpc/user.me` - Get user info

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
- `GET /trpc-playground` - Interactive tRPC playground

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