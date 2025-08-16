import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import { Client } from '@elastic/elasticsearch';
import config from '@/config';

import fs from 'fs';
import path from 'path';

const logsDir = 'logs';
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// === File rotation transports ===
const dailyRotateFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
});

const errorRotateFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error',
});

// === Elasticsearch Transport ===
const esClient = new Client({ 
  node: process.env.ELASTIC_URL || 'http://localhost:9200',
  auth: {
    username: process.env.ELASTIC_USERNAME || 'elastic',
    password: process.env.ELASTIC_PASSWORD || 'changeme'
  },
  tls: {
    rejectUnauthorized: false // For development Docker setup
  }
});

// Test Elasticsearch connection
esClient.ping()
  .then(() => console.log('✅ Connected to Elasticsearch'))
  .catch((err) => console.warn('⚠️  Elasticsearch connection failed:', err.message));

const esTransportOpts = {
  level: 'info',
  client: esClient,
  indexPrefix: 'trpc-logs', // will create daily index like trpc-logs-YYYY.MM.DD
  ensureMappingTemplate: true,
  mappingTemplate: {
    index_patterns: ['trpc-logs-*'],
    settings: {
      number_of_shards: 1,
      number_of_replicas: 0
    }
  }
};

const esTransport = new ElasticsearchTransport(esTransportOpts);

// === Logger ===
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
    errorRotateFileTransport,
    esTransport, // <--- NEW
  ]
});

// Handle rotation events
dailyRotateFileTransport.on('rotate', (oldFilename, newFilename) => {
  logger.info('Log file rotated', { oldFilename, newFilename });
});

errorRotateFileTransport.on('rotate', (oldFilename, newFilename) => {
  logger.info('Error log file rotated', { oldFilename, newFilename });
});

// Console only in dev
if (config.environment !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

export default logger;
