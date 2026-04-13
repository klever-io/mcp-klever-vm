/**
 * Tool-related knowledge entries
 */

import koperatorKnowledge from './koperator.js';
import koperatorAbiKnowledge from './koperator-abi.js';
import koperatorGlobalFlagsKnowledge from './koperator-global-flags.js';
import kscKnowledge from './ksc.js';
import vscodeExtensionKnowledge from './vscode-extension.js';

export const toolsKnowledge = [
  ...koperatorKnowledge,
  ...koperatorAbiKnowledge,
  ...koperatorGlobalFlagsKnowledge,
  ...kscKnowledge,
  ...vscodeExtensionKnowledge,
];

export default toolsKnowledge;
