#!/usr/bin/env node

/**
 * Create basic Kibana dashboard for tRPC logs
 * Run with: node scripts/create-dashboard.js
 */

require('dotenv').config();
const { Client } = require('@elastic/elasticsearch');

async function createDashboard() {
  console.log('🎨 Creating Basic Kibana Dashboard');
  console.log('==================================');
  
  const client = new Client({ 
    node: process.env.ELASTIC_URL || 'http://localhost:9200',
    auth: {
      username: process.env.ELASTIC_USERNAME || 'elastic',
      password: process.env.ELASTIC_PASSWORD || 'changeme'
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    // Check current log indices
    const indices = await client.cat.indices({ 
      index: 'trpc-logs-*',
      format: 'json'
    });
    
    console.log('\n📊 Current Log Indices:');
    indices.forEach(idx => {
      console.log(`  - ${idx.index}`);
    });

    console.log('\n🎯 Dashboard Setup Instructions:');
    console.log('================================');
    console.log('1. Open Kibana: http://localhost:5601');
    console.log('2. Go to Discover and select trpc-logs-* pattern');
    console.log('3. Set time range to "Last 24 hours"');
    console.log('4. Save your search as "tRPC Logs - All"');
    console.log('');
    console.log('📈 Create Visualizations:');
    console.log('  - Go to Visualize Library');
    console.log('  - Create "Line" chart for log volume over time');
    console.log('  - Create "Pie" chart for log levels distribution');
    console.log('  - Create "Data Table" for top log messages');
    console.log('');
    console.log('📊 Create Dashboard:');
    console.log('  - Go to Dashboard');
    console.log('  - Create new dashboard');
    console.log('  - Add your saved search and visualizations');
    console.log('  - Save as "tRPC Microservices Monitoring"');
    
    // Test some sample queries
    console.log('\n🔍 Sample Queries to Try:');
    console.log('==========================');
    console.log('• Search for errors: severity:error');
    console.log('• Search by service: fields.service:trpc-microservices');
    console.log('• Search by environment: fields.environment:development');
    console.log('• Search for specific messages: message:*started*');
    console.log('• Time-based: @timestamp:[now-1h TO now]');
    
  } catch (error) {
    console.error('❌ Dashboard setup failed:', error.message);
  } finally {
    await client.close();
  }
}

createDashboard(); 