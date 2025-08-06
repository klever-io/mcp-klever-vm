/**
 * Storage-related knowledge entries
 */

import storageMapperKnowledge from './mappers.js';
import storageNamespaceKnowledge from './namespace.js';
import storageViewsKnowledge from './views.js';
import storageComparisonKnowledge from './comparison.js';

export const storageKnowledge = [
  ...storageMapperKnowledge,
  ...storageNamespaceKnowledge,
  ...storageViewsKnowledge,
  ...storageComparisonKnowledge,
];

export default storageKnowledge;