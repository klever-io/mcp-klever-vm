/**
 * Testing knowledge — unit, whitebox, blackbox, and scenario JSON patterns
 */

import unitTestsKnowledge from './unit-tests.js';
import whiteboxTestsKnowledge from './whitebox-tests.js';
import blackboxTestsKnowledge from './blackbox-tests.js';
import scenarioJsonKnowledge from './scenario-json.js';

export const testingKnowledge = [
  ...unitTestsKnowledge,
  ...whiteboxTestsKnowledge,
  ...blackboxTestsKnowledge,
  ...scenarioJsonKnowledge,
];

export default testingKnowledge;
