import { StorageBackend } from '../types/index.js';
import { InMemoryStorage } from './memory.js';
import { RedisStorage } from './redis.js';

export type StorageType = 'memory' | 'redis';

/**
 * Configuration options for storage backends
 */
export interface StorageOptions {
  redis?: {
    url?: string;
    // Future options: poolSize, retryStrategy, etc.
  };
  memory?: {
    maxSize?: number; // Maximum number of contexts to store
    ttl?: number; // Time-to-live in seconds
  };
}

/**
 * Factory for creating storage backend instances
 */
export class StorageFactory {
  static create(type: StorageType = 'memory', options?: StorageOptions): StorageBackend {
    switch (type) {
      case 'redis':
        if (!options?.redis?.url && !process.env.REDIS_URL) {
          console.warn('No Redis URL provided, using default localhost:6379');
        }
        return new RedisStorage(options?.redis?.url);
      case 'memory':
      default:
        return new InMemoryStorage(options?.memory?.maxSize);
    }
  }
}

export { InMemoryStorage, RedisStorage };
