#!/usr/bin/env node

/**
 * Setup Kibana index pattern for tRPC logs
 * Run with: node scripts/setup-kibana.js
 */

require('dotenv').config();
const { Client } = require('@elastic/elasticsearch');

async function setupKibana() {
  console.log('🔧 Setting up Kibana Index Pattern');
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
    // Check if index exists
    const indexName = 'trpc-logs-' + new Date().toISOString().split('T')[0].replace(/-/g, '.');
    const indexExists = await client.indices.exists({ index: indexName });
    
    if (!indexExists) {
      console.log(`📝 Creating index: ${indexName}`);
      await client.indices.create({
        index: indexName,
        body: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0
          },
          mappings: {
            properties: {
              '@timestamp': { type: 'date' },
              message: { type: 'text' },
              severity: { type: 'keyword' },
              fields: {
                properties: {
                  service: { type: 'keyword' },
                  environment: { type: 'keyword' },
                  version: { type: 'keyword' },
                  timestamp: { type: 'date' }
                }
              }
            }
          }
        }
      });
      console.log('✅ Index created successfully');
    } else {
      console.log(`✅ Index ${indexName} already exists`);
    }

    // Get all trpc-logs indices
    const indices = await client.cat.indices({ 
      index: 'trpc-logs-*',
      format: 'json'
    });
    
    console.log('\n📊 Available Log Indices:');
    indices.forEach(idx => {
      console.log(`  - ${idx.index} (${idx.docs_count} docs, ${idx.store_size})`);
    });

    console.log('\n🌐 Next Steps:');
    console.log('1. Open Kibana at: http://localhost:5601');
    console.log('2. Go to Stack Management > Index Patterns');
    console.log('3. Create index pattern: trpc-logs-*');
    console.log('4. Set @timestamp as time field');
    console.log('5. Go to Discover to view your logs');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    if (error.meta) {
      console.error('📋 Error details:', error.meta);
    }
  } finally {
    await client.close();
  }
}

setupKibana(); 