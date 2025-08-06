/**
 * Shared types for knowledge entries
 */

export type KnowledgeEntryType = 
  | 'code_example'
  | 'best_practice'
  | 'security_tip'
  | 'optimization'
  | 'documentation'
  | 'error_pattern'
  | 'deployment_tool'
  | 'runtime_behavior';

export interface KnowledgeMetadata {
  title: string;
  description?: string;
  tags: string[];
  language: string;
  contractType?: string;
  author?: string;
  createdAt: string;
  updatedAt: string;
  relevanceScore: number;
}

export interface KnowledgeEntry {
  id?: string;
  type: KnowledgeEntryType;
  content: string;
  metadata: KnowledgeMetadata;
  relatedContextIds: string[];
}

/**
 * Helper function to create knowledge entries with defaults
 */
export function createKnowledgeEntry(
  type: KnowledgeEntryType,
  content: string,
  metadata: Partial<KnowledgeMetadata> & { title: string; tags: string[] },
  relatedContextIds: string[] = []
): KnowledgeEntry {
  const now = new Date().toISOString();
  return {
    type,
    content,
    metadata: {
      language: 'rust',
      createdAt: now,
      updatedAt: now,
      relevanceScore: 0.8,
      author: 'Klever',
      ...metadata,
    },
    relatedContextIds,
  };
}