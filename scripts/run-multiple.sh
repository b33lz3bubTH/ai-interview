#!/bin/bash

# Script to run multiple instances of the tRPC microservice
# Usage: ./scripts/run-multiple.sh [num_instances]

NUM_INSTANCES=${1:-3}
START_PORT=3000

echo "🚀 Starting $NUM_INSTANCES instances of tRPC microservice..."

# Kill any existing instances
pkill -f "ts-node-dev" 2>/dev/null || true
sleep 2

# Start instances
for i in $(seq 0 $((NUM_INSTANCES-1))); do
    PORT=$((START_PORT + i))
    echo "Starting instance $((i+1)) on port $PORT..."
    
    # Start in background
    npm run dev -- --port=$PORT > logs/instance-$PORT.log 2>&1 &
    INSTANCE_PID=$!
    echo "Instance $((i+1)) started with PID $INSTANCE_PID on port $PORT"
    
    # Wait a bit between starts
    sleep 3
done

echo ""
echo "✅ All instances started!"
echo ""
echo "🌐 Available endpoints:"
for i in $(seq 0 $((NUM_INSTANCES-1))); do
    PORT=$((START_PORT + i))
    echo "  - Instance $((i+1)): http://localhost:$PORT"
    echo "  - Health: http://localhost:$PORT/health"
    echo "  - tRPC Playground: http://localhost:$PORT/trpc-playground"
    echo "  - tRPC API: http://localhost:$PORT/trpc"
    echo ""
done

echo "📝 Logs are saved in logs/instance-*.log"
echo "🛑 To stop all instances: pkill -f 'ts-node-dev'"
echo ""
echo "🧪 Test endpoints:"
echo "  curl http://localhost:3000/health"
echo "  curl http://localhost:3001/health"
echo "  curl http://localhost:3002/health" 