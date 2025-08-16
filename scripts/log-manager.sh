#!/bin/bash

# Log Management Script for tRPC Microservices
# Usage: ./scripts/log-manager.sh [command]
# Commands: status, cleanup, rotate, monitor

LOGS_DIR="logs"
MAX_LOG_AGE_DAYS=30
MAX_LOG_SIZE_MB=100

function show_status() {
    echo "📊 Log Status Report"
    echo "==================="
    
    if [ ! -d "$LOGS_DIR" ]; then
        echo "❌ Logs directory does not exist"
        return 1
    fi
    
    echo "📁 Logs directory: $LOGS_DIR"
    echo ""
    
    # Count log files
    local total_files=$(find "$LOGS_DIR" -name "*.log*" | wc -l)
    echo "📄 Total log files: $total_files"
    
    # Show recent log files
    echo ""
    echo "📋 Recent log files:"
    find "$LOGS_DIR" -name "*.log" -type f -exec ls -lh {} \; | head -10
    
    # Show compressed archives
    echo ""
    echo "🗜️  Compressed archives:"
    find "$LOGS_DIR" -name "*.gz" -type f -exec ls -lh {} \; | head -5
    
    # Calculate total size
    local total_size=$(du -sh "$LOGS_DIR" 2>/dev/null | cut -f1)
    echo ""
    echo "💾 Total log directory size: $total_size"
}

function cleanup_old_logs() {
    echo "🧹 Cleaning up old log files..."
    
    if [ ! -d "$LOGS_DIR" ]; then
        echo "❌ Logs directory does not exist"
        return 1
    fi
    
    # Remove log files older than MAX_LOG_AGE_DAYS
    local removed_count=$(find "$LOGS_DIR" -name "*.log*" -type f -mtime +$MAX_LOG_AGE_DAYS | wc -l)
    
    if [ $removed_count -gt 0 ]; then
        echo "🗑️  Removing $removed_count log files older than $MAX_LOG_AGE_DAYS days..."
        find "$LOGS_DIR" -name "*.log*" -type f -mtime +$MAX_LOG_AGE_DAYS -delete
        echo "✅ Cleanup completed"
    else
        echo "✅ No old log files to remove"
    fi
}

function force_rotate() {
    echo "🔄 Forcing log rotation..."
    
    # Send USR1 signal to trigger rotation (if supported by the app)
    local pids=$(pgrep -f "ts-node-dev.*src/index.ts")
    
    if [ -n "$pids" ]; then
        echo "📡 Sending rotation signal to running instances..."
        echo "$pids" | xargs -I {} kill -USR1 {} 2>/dev/null || echo "⚠️  Rotation signal not supported by current instances"
    else
        echo "ℹ️  No running instances found"
    fi
    
    echo "✅ Rotation signal sent"
}

function monitor_logs() {
    echo "👀 Monitoring log files in real-time..."
    echo "Press Ctrl+C to stop monitoring"
    echo ""
    
    # Monitor the most recent log file
    local latest_log=$(find "$LOGS_DIR" -name "application-*.log" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-)
    
    if [ -n "$latest_log" ] && [ -f "$latest_log" ]; then
        echo "📺 Monitoring: $latest_log"
        echo "=================="
        tail -f "$latest_log" | while read line; do
            echo "$(date '+%H:%M:%S') $line"
        done
    else
        echo "❌ No log files found to monitor"
    fi
}

function show_help() {
    echo "Log Management Script for tRPC Microservices"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  status    - Show log status and statistics"
    echo "  cleanup   - Remove old log files (>$MAX_LOG_AGE_DAYS days)"
    echo "  rotate    - Force log rotation (if supported)"
    echo "  monitor   - Monitor logs in real-time"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 status"
    echo "  $0 cleanup"
    echo "  $0 monitor"
}

# Main script logic
case "${1:-help}" in
    "status")
        show_status
        ;;
    "cleanup")
        cleanup_old_logs
        ;;
    "rotate")
        force_rotate
        ;;
    "monitor")
        monitor_logs
        ;;
    "help"|*)
        show_help
        ;;
esac 