/**
 * Event-related knowledge entries
 */

import eventParameterRules from './parameter-rules.js';
import eventAnnotationsKnowledge from './annotations.js';

export const eventKnowledge = [
  ...eventParameterRules,
  ...eventAnnotationsKnowledge,
];

export default eventKnowledge;