import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * Storage mapper performance comparison and optimization
 */

export const storageComparisonKnowledge: KnowledgeEntry[] = [
  // Storage Mapper Performance Comparison
  createKnowledgeEntry(
    'documentation',
    `# Storage Mapper Performance Comparison

## SingleValueMapper vs VecMapper
- **SingleValueMapper<ManagedVec<T>>**: Concatenates all elements under one key
- **VecMapper<T>**: Stores each element under different keys

Use SingleValueMapper when:
- Reading whole array on every use
- Array is expected to be small

Use VecMapper when:
- Only reading parts of the array
- T's top-encoding is more efficient than nested-encoding

## VecMapper vs SetMapper for Whitelists
- **VecMapper**: O(n) lookup, requires iteration
- **SetMapper**: O(1) lookup, uses 3*N+1 storage entries

## Storage Requirements:
- SingleValueMapper: 1 storage entry
- VecMapper: N+1 entries
- SetMapper: 3*N+1 entries
- UnorderedSetMapper: 2*N+1 entries
- LinkedListMapper: 2*N+1 entries
- MapMapper: 4*N+1 entries (most expensive)`,
    {
      title: 'Storage Mapper Performance Comparison',
      description: 'Detailed comparison of storage requirements and performance characteristics for different mappers',
      tags: ['storage', 'performance', 'comparison', 'optimization'],
      language: 'rust',
      relevanceScore: 0.85,
    }
  ),
];

export default storageComparisonKnowledge;