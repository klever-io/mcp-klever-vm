import {
  ContextPayload,
  QueryContext,
  StorageBackend,
  ContextPayloadSchema,
} from '../types/index.js';
import { z } from 'zod';

/**
 * Service layer for context management
 *
 * IMPROVEMENTS:
 * 1. Added proper schema validation using imported schemas
 * 2. Improved relevance scoring algorithm
 * 3. Added caching considerations (TODO)
 * 4. Better error handling and validation
 */
export class ContextService {
  constructor(private storage: StorageBackend) {}

  async ingest(payload: ContextPayload): Promise<string> {
    // Validate payload using the centralized schema
    const validated = ContextPayloadSchema.parse(payload);

    // Calculate relevance score if not provided
    if (!validated.metadata.relevanceScore) {
      validated.metadata.relevanceScore = this.calculateRelevanceScore(validated);
    }

    // Store the validated context
    return await this.storage.store(validated);
  }

  async retrieve(id: string): Promise<ContextPayload | null> {
    return await this.storage.retrieve(id);
  }

  async query(params: QueryContext): Promise<{
    results: ContextPayload[];
    total: number;
    offset: number;
    limit: number;
  }> {
    const results = await this.storage.query(params);
    const total = await this.storage.count(params);

    return {
      results,
      total,
      offset: params.offset || 0,
      limit: params.limit || 10,
    };
  }

  async update(id: string, payload: Partial<ContextPayload>): Promise<boolean> {
    // Validate partial payload
    const partialSchema = ContextPayloadSchema.partial();
    const validated = partialSchema.parse(payload);

    // Recalculate relevance score if content or metadata changed
    if (validated.content || validated.metadata) {
      const existing = await this.storage.retrieve(id);
      if (existing) {
        const updated = { ...existing, ...validated };
        updated.metadata.relevanceScore = this.calculateRelevanceScore(updated);
        return await this.storage.update(id, updated);
      }
    }

    return await this.storage.update(id, validated);
  }

  async delete(id: string): Promise<boolean> {
    return await this.storage.delete(id);
  }

  async findSimilar(contextId: string, limit: number = 5): Promise<ContextPayload[]> {
    const context = await this.storage.retrieve(contextId);
    if (!context) return [];

    // Find contexts with similar tags and type
    const similar = await this.storage.query({
      types: [context.type],
      tags: context.metadata.tags,
      limit: limit + 1, // +1 to exclude self
      offset: 0,
    });

    // Filter out the original context
    return similar.filter(ctx => ctx.id !== contextId).slice(0, limit);
  }

  async rankByRelevance(contexts: ContextPayload[], query: string): Promise<ContextPayload[]> {
    // Simple relevance ranking based on query match
    const queryLower = query.toLowerCase();
    const queryTokens = queryLower.split(/\s+/);

    const scored = contexts.map(ctx => {
      let score = ctx.metadata.relevanceScore || 0.5;

      // Boost score based on query matches
      const searchable = [
        ctx.content,
        ctx.metadata.title,
        ctx.metadata.description || '',
        ctx.metadata.tags.join(' '),
      ]
        .join(' ')
        .toLowerCase();

      // Exact match boost
      if (searchable.includes(queryLower)) {
        score += 0.3;
      }

      // Token match boost
      const matchedTokens = queryTokens.filter(token => searchable.includes(token));
      score += (matchedTokens.length / queryTokens.length) * 0.2;

      // Contract type match boost
      if (
        ctx.metadata.contractType &&
        queryLower.includes(ctx.metadata.contractType.toLowerCase())
      ) {
        score += 0.2;
      }

      return { context: ctx, score: Math.min(score, 1) };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    return scored.map(s => s.context);
  }

  private calculateRelevanceScore(payload: ContextPayload): number {
    let score = 0.5; // Base score

    // Boost for documentation and best practices
    if (['documentation', 'best_practice', 'security_tip'].includes(payload.type)) {
      score += 0.2;
    }

    // Boost for deployment tools
    if (payload.type === 'deployment_tool') {
      score += 0.15;
    }

    // Boost for detailed content
    if (payload.content.length > 500) {
      score += 0.1;
    }

    // Boost for well-tagged content
    if (payload.metadata.tags.length >= 3) {
      score += 0.1;
    }

    // Boost for having a description
    if (payload.metadata.description && payload.metadata.description.length > 50) {
      score += 0.1;
    }

    return Math.min(score, 1);
  }
}
