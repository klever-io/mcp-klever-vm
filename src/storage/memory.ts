import { ContextPayload, QueryContext, StorageBackend } from '../types/index.js';
import crypto from 'crypto';

/**
 * In-memory storage implementation for development and testing
 *
 * IMPROVEMENTS:
 * 1. Added configurable memory limit to prevent OOM
 * 2. Added validation for required metadata
 * 3. Optimized count() method for better performance
 * 4. Consider implementing LRU cache for automatic cleanup
 */
export class InMemoryStorage implements StorageBackend {
  private contexts: Map<string, ContextPayload> = new Map();
  private readonly maxSize: number;

  constructor(maxSize: number = 10000) {
    this.maxSize = maxSize;
  }

  async store(payload: ContextPayload): Promise<string> {
    // Validate metadata exists
    if (!payload.metadata) {
      throw new Error('Context metadata is required');
    }

    const id = payload.id || crypto.randomUUID();

    // Check size limit for new entries
    if (!payload.id && this.contexts.size >= this.maxSize) {
      throw new Error(`Storage limit reached (max: ${this.maxSize} contexts)`);
    }

    const storedPayload = {
      ...payload,
      id,
      metadata: {
        ...payload.metadata,
        createdAt: payload.metadata.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    this.contexts.set(id, storedPayload);
    return id;
  }

  async retrieve(id: string): Promise<ContextPayload | null> {
    return this.contexts.get(id) || null;
  }

  async query(params: QueryContext): Promise<ContextPayload[]> {
    let results = Array.from(this.contexts.values());

    // Filter by type
    if (params.types && params.types.length > 0) {
      results = results.filter(ctx => params.types!.includes(ctx.type));
    }

    // Filter by tags
    if (params.tags && params.tags.length > 0) {
      results = results.filter(ctx => params.tags!.some(tag => ctx.metadata.tags.includes(tag)));
    }

    // Filter by contract type
    if (params.contractType) {
      results = results.filter(ctx => ctx.metadata.contractType === params.contractType);
    }

    // Search in content and metadata
    if (params.query) {
      const query = params.query.toLowerCase();
      results = results.filter(ctx => {
        const searchable = [
          ctx.content,
          ctx.metadata.title,
          ctx.metadata.description || '',
          ctx.metadata.tags.join(' '),
        ]
          .join(' ')
          .toLowerCase();

        return searchable.includes(query);
      });
    }

    // Sort by relevance score (descending)
    results.sort((a, b) => (b.metadata.relevanceScore || 0) - (a.metadata.relevanceScore || 0));

    // Apply pagination
    const start = params.offset || 0;
    const end = start + (params.limit || 10);

    return results.slice(start, end);
  }

  async update(id: string, payload: Partial<ContextPayload>): Promise<boolean> {
    const existing = this.contexts.get(id);
    if (!existing) return false;

    const updated = {
      ...existing,
      ...payload,
      id,
      metadata: {
        ...existing.metadata,
        ...payload.metadata,
        updatedAt: new Date().toISOString(),
      },
    };

    this.contexts.set(id, updated);
    return true;
  }

  async delete(id: string): Promise<boolean> {
    return this.contexts.delete(id);
  }

  async count(params?: Partial<QueryContext>): Promise<number> {
    // OPTIMIZATION: Direct count when no filters
    if (!params || Object.keys(params).length === 0) {
      return this.contexts.size;
    }

    // For filtered counts, could optimize by implementing direct filtering
    // without building full result array, but keeping simple for now
    const results = await this.query({ ...params, limit: Number.MAX_SAFE_INTEGER, offset: 0 });
    return results.length;
  }
}
