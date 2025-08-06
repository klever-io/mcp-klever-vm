/**
 * Main knowledge base export
 * Combines all knowledge modules into a single export
 */

import { KnowledgeEntry } from './types.js';

// Import all category modules
import tokenKnowledge from './tokens/index.js';
import eventKnowledge from './events/index.js';
import coreKnowledge from './core/index.js';
import scriptsKnowledge from './scripts/index.js';
import documentationKnowledge from './documentation/index.js';
import storageKnowledge from './storage/index.js';
import modulesKnowledge from './modules/index.js';
import toolsKnowledge from './tools/index.js';
import errorsKnowledge from './errors/index.js';
import examplesKnowledge from './examples/index.js';
import bestPracticesKnowledge from './best-practices/index.js';

/**
 * Complete Klever knowledge base
 * This array combines all knowledge entries from all modules
 */
export const kleverKnowledge: KnowledgeEntry[] = [
  ...tokenKnowledge,
  ...eventKnowledge,
  ...coreKnowledge,
  ...scriptsKnowledge,
  ...documentationKnowledge,
  ...storageKnowledge,
  ...modulesKnowledge,
  ...toolsKnowledge,
  ...errorsKnowledge,
  ...examplesKnowledge,
  ...bestPracticesKnowledge,
];

// Also export individual categories for targeted access
export {
  tokenKnowledge,
  eventKnowledge,
  coreKnowledge,
  scriptsKnowledge,
  documentationKnowledge,
  storageKnowledge,
  modulesKnowledge,
  toolsKnowledge,
  errorsKnowledge,
  examplesKnowledge,
  bestPracticesKnowledge,
};

// Export types for external use
export * from './types.js';

export default kleverKnowledge;