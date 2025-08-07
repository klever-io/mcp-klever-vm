import { ContextService } from '../context/service.js';
import { ContractIngester } from './ingest.js';
import { kleverKnowledge } from '../knowledge/index.js';
import { ContextPayload } from '../types/index.js';

export async function autoIngestKnowledge(contextService: ContextService): Promise<void> {
  console.error('🔄 Auto-ingesting Klever knowledge base...');

  const ingester = new ContractIngester(contextService);

  // First, ingest common patterns
  await ingester.ingestCommonPatterns();

  // Convert new knowledge format to ContextPayload format
  const allKleverContexts: ContextPayload[] = kleverKnowledge.map(entry => ({
    type: entry.type,
    content: entry.content,
    metadata: entry.metadata,
    relatedContextIds: entry.relatedContextIds || [],
  }));

  // Then, ingest all the comprehensive knowledge
  let successCount = 0;
  let errorCount = 0;

  for (const context of allKleverContexts) {
    try {
      await contextService.ingest(context);
      successCount++;
    } catch (error) {
      console.error(`Failed to ingest: ${context.metadata.title}`, error);
      errorCount++;
    }
  }

  console.error(
    `✅ Auto-ingestion complete: ${successCount} contexts loaded, ${errorCount} failed`
  );
}
