#!/usr/bin/env node

/**
 * Test Elasticsearch connection and log ingestion
 * Run with: node scripts/test-elasticsearch.js
 */

require('dotenv').config();
const { Client } = require('@elastic/elasticsearch');

async function testElasticsearch() {
  console.log('🧪 Testing Elasticsearch Connection');
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
    // Test connection
    console.log('🔌 Testing connection...');
    const pingResult = await client.ping();
    console.log('✅ Elasticsearch connection successful');
    
    // Get cluster info
    const info = await client.info();
    console.log(`📊 Cluster: ${info.cluster_name}`);
    console.log(`🔢 Version: ${info.version.number}`);
    
    // Test index creation
    const testIndex = 'test-logs-' + new Date().toISOString().split('T')[0];
    console.log(`📝 Creating test index: ${testIndex}`);
    
    const createResult = await client.index({
      index: testIndex,
      body: {
        message: 'Test log entry',
        timestamp: new Date().toISOString(),
        service: 'trpc-microservices',
        level: 'info',
        test: true
      }
    });
    
    console.log('✅ Test log indexed successfully');
    console.log(`🆔 Document ID: ${createResult._id}`);
    
    // Refresh index to make it searchable
    await client.indices.refresh({ index: testIndex });
    
    // Search for the test log
    const searchResult = await client.search({
      index: testIndex,
      body: {
        query: {
          match: { message: 'Test log entry' }
        }
      }
    });
    
    console.log(`🔍 Found ${searchResult.hits.total.value} documents`);
    
    // Clean up test index
    await client.indices.delete({ index: testIndex });
    console.log('🧹 Test index cleaned up');
    
  } catch (error) {
    console.error('❌ Elasticsearch test failed:', error.message);
    if (error.meta) {
      console.error('📋 Error details:', error.meta);
    }
  } finally {
    await client.close();
  }
}

testElasticsearch(); 