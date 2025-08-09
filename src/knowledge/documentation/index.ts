/**
 * Documentation and reference knowledge entries
 */

import discoveryGuideKnowledge from './discovery-guide.js';
import apiReferenceKnowledge from './api-reference.js';
import networkEndpointsKnowledge from './network-endpoints.js';
// TODO: Import other documentation modules when created
// import managedTypes from './managed-types.js';
// import projectSetup from './project-setup.js';

export const documentationKnowledge = [
  ...discoveryGuideKnowledge,
  ...apiReferenceKnowledge,
  ...networkEndpointsKnowledge,
  // ...managedTypes,
  // ...projectSetup,
];

export default documentationKnowledge;