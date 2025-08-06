#!/usr/bin/env tsx

import { StorageFactory } from '../storage/index.js';
import { ContextService } from '../context/service.js';
import { autoIngestKnowledge } from '../utils/auto-ingest.js';

async function testKnowledge() {
  console.log('🧪 Testing knowledge ingestion and retrieval...\n');

  // Create memory storage
  const storage = StorageFactory.create('memory');
  const contextService = new ContextService(storage);

  // Auto-ingest knowledge
  await autoIngestKnowledge(contextService);

  // Test queries
  console.log('\n📋 Testing queries:\n');

  // Query 1: Storage patterns
  const storageQuery = await contextService.query({
    query: 'storage mapper',
    limit: 3,
    offset: 0,
  });
  console.log(`Query "storage mapper": Found ${storageQuery.results.length} results`);
  storageQuery.results.forEach(r => console.log(`  - ${r.metadata.title}`));

  // Query 2: Payable endpoints
  const payableQuery = await contextService.query({
    query: 'payable',
    limit: 3,
    offset: 0,
  });
  console.log(`\nQuery "payable": Found ${payableQuery.results.length} results`);
  payableQuery.results.forEach(r => console.log(`  - ${r.metadata.title}`));

  // Query 3: By type
  const docsQuery = await contextService.query({
    types: ['documentation'],
    limit: 5,
    offset: 0,
  });
  console.log(`\nQuery type="documentation": Found ${docsQuery.results.length} results`);
  docsQuery.results.forEach(r => console.log(`  - ${r.metadata.title}`));

  // Total count
  const total = await contextService.query({
    limit: 1000,
    offset: 0,
  });
  console.log(`\n📊 Total contexts in knowledge base: ${total.total}`);
}

testKnowledge().catch(console.error);
