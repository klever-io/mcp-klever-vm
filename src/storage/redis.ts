import { createClient, RedisClientType } from 'redis';
import { ContextPayload, QueryContext, StorageBackend } from '../types/index.js';
import crypto from 'crypto';

/**
 * Redis-based storage implementation for Klever MCP contexts
 */
export class RedisStorage implements StorageBackend {
  private client: RedisClientType;
  private readonly prefix = 'klever:context:';
  private readonly indexPrefix = 'klever:index:';
  private readonly masterIndexKey = 'klever:index:all'; // Master index for all context IDs
  private connected: boolean = false;

  constructor(redisUrl?: string) {
    this.client = createClient({
      url: redisUrl || process.env.REDIS_URL || 'redis://localhost:6379',
    });

    // Track connection state
    this.client.on('error', err => {
      console.error('Redis Client Error', err);
      this.connected = false;
      // TODO: Emit error event for proper error handling
    });

    this.client.on('ready', () => {
      this.connected = true;
    });
  }

  async connect(): Promise<void> {
    if (!this.client.isReady) {
      await this.client.connect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.client.isReady) {
      await this.client.disconnect();
    }
  }

  async store(payload: ContextPayload): Promise<string> {
    await this.connect();

    const id = payload.id || crypto.randomUUID();
    const storedPayload = {
      ...payload,
      id,
      metadata: {
        ...payload.metadata,
        createdAt: payload.metadata.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    const key = `${this.prefix}${id}`;

    // TRANSACTION: Use multi for atomic operations
    const multi = this.client.multi();
    multi.set(key, JSON.stringify(storedPayload));
    multi.sAdd(this.masterIndexKey, id); // Add to master index

    // Create indexes for efficient querying
    await this.createIndexesTransaction(multi, id, storedPayload);

    const results = await multi.exec();
    if (!results || results.some(r => r instanceof Error)) {
      throw new Error('Failed to store context atomically');
    }

    return id;
  }

  async retrieve(id: string): Promise<ContextPayload | null> {
    await this.connect();

    const key = `${this.prefix}${id}`;
    const data = await this.client.get(key);

    if (!data) return null;

    return JSON.parse(data) as ContextPayload;
  }

  async query(params: QueryContext): Promise<ContextPayload[]> {
    await this.connect();

    let contextIds: string[] = [];

    // OPTIMIZATION: Use indexes instead of KEYS command
    if (params.types && params.types.length > 0) {
      // Use SUNION to get IDs matching any type
      const typeKeys = params.types.map(type => `${this.indexPrefix}type:${type}`);
      contextIds = await this.client.sUnion(typeKeys);
    } else if (params.tags && params.tags.length > 0) {
      // Get IDs matching any tag
      const tagKeys = params.tags.map(tag => `${this.indexPrefix}tag:${tag}`);
      contextIds = await this.client.sUnion(tagKeys);
    } else if (params.contractType) {
      // Get IDs for specific contract type
      contextIds = await this.client.sMembers(`${this.indexPrefix}contract:${params.contractType}`);
    } else {
      // CRITICAL: Avoid KEYS command - use master index instead
      contextIds = await this.client.sMembers(this.masterIndexKey);
    }

    if (contextIds.length === 0) return [];

    // OPTIMIZATION: Use MGET for batch retrieval
    const keys = contextIds.map(id => `${this.prefix}${id}`);
    const values = await this.client.mGet(keys);

    const contexts: ContextPayload[] = values
      .filter(v => v !== null)
      .map(v => JSON.parse(v as string));

    // Apply filters
    let results = contexts;

    if (params.types && params.types.length > 0) {
      results = results.filter(ctx => params.types!.includes(ctx.type));
    }

    if (params.tags && params.tags.length > 0) {
      results = results.filter(ctx => params.tags!.some(tag => ctx.metadata.tags.includes(tag)));
    }

    if (params.contractType) {
      results = results.filter(ctx => ctx.metadata.contractType === params.contractType);
    }

    if (params.query) {
      const queryTokens = params.query.toLowerCase().split(/\s+/).filter(Boolean);
      results = results.filter(ctx => {
        const searchable = [
          ctx.content,
          ctx.metadata.title,
          ctx.metadata.description || '',
          ctx.metadata.tags.join(' '),
        ]
          .join(' ')
          .toLowerCase();

        return queryTokens.every(token => searchable.includes(token));
      });
    }

    // Sort by relevance score
    results.sort((a, b) => (b.metadata.relevanceScore || 0) - (a.metadata.relevanceScore || 0));

    // Apply pagination
    const start = params.offset || 0;
    const end = start + (params.limit || 10);

    return results.slice(start, end);
  }

  async update(id: string, payload: Partial<ContextPayload>): Promise<boolean> {
    const existing = await this.retrieve(id);
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

    const key = `${this.prefix}${id}`;

    // TRANSACTION: Atomic update with index changes
    const multi = this.client.multi();
    multi.set(key, JSON.stringify(updated));

    // Update indexes atomically
    if (existing.type !== updated.type) {
      multi.sRem(`${this.indexPrefix}type:${existing.type}`, id);
      multi.sAdd(`${this.indexPrefix}type:${updated.type}`, id);
    }

    // Handle tag changes
    const oldTags = new Set(existing.metadata.tags);
    const newTags = new Set(updated.metadata.tags);

    for (const tag of oldTags) {
      if (!newTags.has(tag)) {
        multi.sRem(`${this.indexPrefix}tag:${tag}`, id);
      }
    }

    for (const tag of newTags) {
      if (!oldTags.has(tag)) {
        multi.sAdd(`${this.indexPrefix}tag:${tag}`, id);
      }
    }

    // Handle contract type change
    if (existing.metadata.contractType !== updated.metadata.contractType) {
      if (existing.metadata.contractType) {
        multi.sRem(`${this.indexPrefix}contract:${existing.metadata.contractType}`, id);
      }
      if (updated.metadata.contractType) {
        multi.sAdd(`${this.indexPrefix}contract:${updated.metadata.contractType}`, id);
      }
    }

    const results = await multi.exec();
    return results !== null && results.every(r => !(r instanceof Error));
  }

  async delete(id: string): Promise<boolean> {
    await this.connect();

    const context = await this.retrieve(id);
    if (!context) return false;

    const key = `${this.prefix}${id}`;

    // TRANSACTION: Atomic delete with index removal
    const multi = this.client.multi();
    multi.del(key);
    multi.sRem(this.masterIndexKey, id);

    // Remove from all indexes
    multi.sRem(`${this.indexPrefix}type:${context.type}`, id);

    for (const tag of context.metadata.tags) {
      multi.sRem(`${this.indexPrefix}tag:${tag}`, id);
    }

    if (context.metadata.contractType) {
      multi.sRem(`${this.indexPrefix}contract:${context.metadata.contractType}`, id);
    }

    const results = await multi.exec();
    return results !== null && results.every(r => !(r instanceof Error));
  }

  async count(params?: Partial<QueryContext>): Promise<number> {
    if (!params || Object.keys(params).length === 0) {
      await this.connect();
      const keys = await this.client.keys(`${this.prefix}*`);
      return keys.length;
    }

    const results = await this.query({ ...params, limit: Number.MAX_SAFE_INTEGER, offset: 0 });
    return results.length;
  }

  /**
   * Create indexes in a transaction for atomic operations
   */
  private async createIndexesTransaction(
    multi: ReturnType<RedisClientType['multi']>,
    id: string,
    payload: ContextPayload
  ): Promise<void> {
    // Index by type
    multi.sAdd(`${this.indexPrefix}type:${payload.type}`, id);

    // Index by tags
    for (const tag of payload.metadata.tags) {
      multi.sAdd(`${this.indexPrefix}tag:${tag}`, id);
    }

    // Index by contract type
    if (payload.metadata.contractType) {
      multi.sAdd(`${this.indexPrefix}contract:${payload.metadata.contractType}`, id);
    }
  }

  private async createIndexes(id: string, payload: ContextPayload): Promise<void> {
    // Index by type
    await this.client.sAdd(`${this.indexPrefix}type:${payload.type}`, id);

    // Index by tags
    for (const tag of payload.metadata.tags) {
      await this.client.sAdd(`${this.indexPrefix}tag:${tag}`, id);
    }

    // Index by contract type
    if (payload.metadata.contractType) {
      await this.client.sAdd(`${this.indexPrefix}contract:${payload.metadata.contractType}`, id);
    }
  }

  private async removeIndexes(id: string, payload: ContextPayload): Promise<void> {
    // Remove from type index
    await this.client.sRem(`${this.indexPrefix}type:${payload.type}`, id);

    // Remove from tag indexes
    for (const tag of payload.metadata.tags) {
      await this.client.sRem(`${this.indexPrefix}tag:${tag}`, id);
    }

    // Remove from contract type index
    if (payload.metadata.contractType) {
      await this.client.sRem(`${this.indexPrefix}contract:${payload.metadata.contractType}`, id);
    }
  }
}
