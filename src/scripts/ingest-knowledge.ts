#!/usr/bin/env tsx

import { StorageFactory, type StorageType } from '../storage/index.js';
import { ContextService } from '../context/service.js';
import { ContractIngester } from '../utils/ingest.js';
import { kleverKnowledge } from '../knowledge/index.js';
import { ContextPayload } from '../types/index.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ quiet: true });

async function ingestKleverKnowledge() {
  console.log('🚀 Starting Klever knowledge ingestion...\n');

  // Create storage and context service
  const storageType = (process.env.STORAGE_TYPE as StorageType) || 'memory';
  const storage = StorageFactory.create(storageType, {
    redis: {
      url: process.env.REDIS_URL,
    },
  });

  const contextService = new ContextService(storage);
  const ingester = new ContractIngester(contextService);

  try {
    // First, ingest common patterns
    console.log('📚 Ingesting common Klever patterns...');
    await ingester.ingestCommonPatterns();

    // Convert new knowledge format to ContextPayload format
    const allKleverContexts: ContextPayload[] = kleverKnowledge.map(entry => ({
      type: entry.type,
      content: entry.content,
      metadata: entry.metadata,
      relatedContextIds: entry.relatedContextIds || [],
    }));

    // Then, ingest all the comprehensive knowledge
    console.log('\n📖 Ingesting comprehensive Klever knowledge base...');
    let successCount = 0;
    let errorCount = 0;

    for (const context of allKleverContexts) {
      try {
        const id = await contextService.ingest(context);
        console.log(`✅ Ingested: ${context.metadata.title} (ID: ${id})`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to ingest: ${context.metadata.title}`, error);
        errorCount++;
      }
    }

    console.log(`\n📊 Ingestion Summary:`);
    console.log(`   ✅ Successfully ingested: ${successCount} contexts`);
    console.log(`   ❌ Failed: ${errorCount} contexts`);
    console.log(`   📁 Total contexts in knowledge base: ${allKleverContexts.length}`);

    // Query some examples to verify
    console.log('\n🔍 Verifying ingestion with sample queries...\n');

    // Query 1: Storage patterns
    const storageResults = await contextService.query({
      query: 'storage mapper',
      types: ['best_practice', 'documentation'],
      limit: 3,
      offset: 0,
    });
    console.log(`Found ${storageResults.results.length} storage mapper contexts:`);
    storageResults.results.forEach(r => console.log(`  - ${r.metadata.title}`));

    // Query 2: Deployment scripts
    const deployResults = await contextService.query({
      tags: ['deployment', 'script'],
      limit: 3,
      offset: 0,
    });
    console.log(`\nFound ${deployResults.results.length} deployment script contexts:`);
    deployResults.results.forEach(r => console.log(`  - ${r.metadata.title}`));

    // Query 3: Error patterns
    const errorResults = await contextService.query({
      types: ['error_pattern'],
      limit: 5,
      offset: 0,
    });
    console.log(`\nFound ${errorResults.results.length} error pattern contexts:`);
    errorResults.results.forEach(r => console.log(`  - ${r.metadata.title}`));

    console.log('\n✨ Knowledge ingestion completed successfully!');
  } catch (error) {
    console.error('💥 Fatal error during ingestion:', error);
    process.exit(1);
  }

  // Cleanup
  if ('disconnect' in storage && typeof storage.disconnect === 'function') {
    await storage.disconnect();
  }
}

// Run the ingestion
ingestKleverKnowledge().catch(console.error);
