import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import config from '@/config';

// Create logs directory if it doesn't exist
import fs from 'fs';
import path from 'path';

const logsDir = 'logs';
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Daily rotate file transport configuration
const dailyRotateFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d', // Keep logs for 14 days
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  )
});

// Error log transport with daily rotation
const errorRotateFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d', // Keep error logs for 30 days
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  )
});

const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'trpc-microservices',
    environment: config.environment,
    version: process.env.npm_package_version || '1.0.0'
  },
  transports: [
    dailyRotateFileTransport,
    errorRotateFileTransport
  ]
});

// Handle rotation events for monitoring
dailyRotateFileTransport.on('rotate', function(oldFilename, newFilename) {
  logger.info('Log file rotated', { oldFilename, newFilename });
});

errorRotateFileTransport.on('rotate', function(oldFilename, newFilename) {
  logger.info('Error log file rotated', { oldFilename, newFilename });
});

if (config.environment !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

export default logger; 