import { ContextService } from '../context/service.js';
import { InMemoryStorage } from '../storage/memory.js';
import {
  getResourceTemplates,
  getStaticResources,
  readResource,
  KNOWLEDGE_CATEGORIES,
} from './resources.js';

describe('MCP Resources', () => {
  let contextService: ContextService;

  beforeAll(async () => {
    const storage = new InMemoryStorage();
    contextService = new ContextService(storage);

    // Seed some test data
    await contextService.ingest({
      type: 'code_example',
      content: 'use klever_sc::imports::*;',
      metadata: {
        title: 'Basic Import',
        description: 'Required import for Klever contracts',
        tags: ['core', 'imports'],
        language: 'rust',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        relevanceScore: 0.9,
      },
      relatedContextIds: [],
    });

    await contextService.ingest({
      type: 'best_practice',
      content: 'Always emit events for state changes.',
      metadata: {
        title: 'Event Best Practice',
        description: 'Events enable off-chain tracking',
        tags: ['best-practices', 'events'],
        language: 'rust',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        relevanceScore: 0.8,
      },
      relatedContextIds: [],
    });
  });

  describe('getResourceTemplates', () => {
    it('returns category template for local profile', () => {
      const templates = getResourceTemplates('local');
      expect(templates).toHaveLength(1);
      expect(templates[0].uriTemplate).toBe('klever://knowledge/{category}');
      expect(templates[0].mimeType).toBe('text/markdown');
    });

    it('returns category template for public profile', () => {
      const templates = getResourceTemplates('public');
      expect(templates).toHaveLength(1);
      expect(templates[0].uriTemplate).toBe('klever://knowledge/{category}');
    });
  });

  describe('getStaticResources', () => {
    it('returns index resource for local profile', () => {
      const resources = getStaticResources('local');
      expect(resources).toHaveLength(1);
      expect(resources[0].uri).toBe('klever://knowledge/index');
      expect(resources[0].mimeType).toBe('text/markdown');
    });

    it('returns index resource for public profile', () => {
      const resources = getStaticResources('public');
      expect(resources).toHaveLength(1);
      expect(resources[0].uri).toBe('klever://knowledge/index');
    });
  });

  describe('readResource', () => {
    it('returns index content for klever://knowledge/index', async () => {
      const result = await readResource('klever://knowledge/index', contextService);
      expect(result.uri).toBe('klever://knowledge/index');
      expect(result.mimeType).toBe('text/markdown');
      expect(result.text).toContain('# Klever VM Knowledge Base');
      expect(result.text).toContain('Category');
      expect(result.text).toContain('Entries');
    });

    it('returns category content for valid category', async () => {
      const result = await readResource('klever://knowledge/core', contextService);
      expect(result.uri).toBe('klever://knowledge/core');
      expect(result.mimeType).toBe('text/markdown');
      expect(result.text).toContain('# Klever Knowledge: core');
      expect(result.text).toContain('Basic Import');
    });

    it('returns entries for best-practices category', async () => {
      const result = await readResource('klever://knowledge/best-practices', contextService);
      expect(result.text).toContain('# Klever Knowledge: best-practices');
      expect(result.text).toContain('Event Best Practice');
    });

    it('throws error for invalid URI format', async () => {
      await expect(readResource('invalid://uri', contextService)).rejects.toThrow(
        'Invalid resource URI'
      );
    });

    it('throws error for unknown category', async () => {
      await expect(
        readResource('klever://knowledge/nonexistent', contextService)
      ).rejects.toThrow('Unknown knowledge category');
    });
  });

  describe('KNOWLEDGE_CATEGORIES', () => {
    it('contains all 11 categories', () => {
      expect(KNOWLEDGE_CATEGORIES).toHaveLength(11);
      expect(KNOWLEDGE_CATEGORIES).toContain('core');
      expect(KNOWLEDGE_CATEGORIES).toContain('storage');
      expect(KNOWLEDGE_CATEGORIES).toContain('events');
      expect(KNOWLEDGE_CATEGORIES).toContain('tokens');
      expect(KNOWLEDGE_CATEGORIES).toContain('modules');
      expect(KNOWLEDGE_CATEGORIES).toContain('tools');
      expect(KNOWLEDGE_CATEGORIES).toContain('scripts');
      expect(KNOWLEDGE_CATEGORIES).toContain('examples');
      expect(KNOWLEDGE_CATEGORIES).toContain('errors');
      expect(KNOWLEDGE_CATEGORIES).toContain('best-practices');
      expect(KNOWLEDGE_CATEGORIES).toContain('documentation');
    });
  });
});
