/**
 * Best practices and optimization knowledge entries
 */

import bigfloatPatternsKnowledge from './bigfloat-patterns.js';
import bigintPatternsKnowledge from './bigint-patterns.js';
import bigintSignedKnowledge from './bigint-signed.js';
import numericTypeConversionsKnowledge from './numeric-type-conversions.js';
import optimizationKnowledge from './optimization.js';
import tokenTypesBestPractices from './token-types.js';

export const bestPracticesKnowledge = [
  ...bigintPatternsKnowledge,
  ...bigintSignedKnowledge,
  ...bigfloatPatternsKnowledge,
  ...numericTypeConversionsKnowledge,
  ...tokenTypesBestPractices,
  ...optimizationKnowledge,
];

export default bestPracticesKnowledge;