import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * Critical differences between Klever and other blockchains
 */

export const criticalDifferencesKnowledge: KnowledgeEntry[] = [
  // Klever vs MultiversX Differences
  createKnowledgeEntry(
    'best_practice',
    `# CRITICAL: Klever vs MultiversX Differences

## ⚠️ WARNING: Never Mix MultiversX and Klever

Klever blockchain is similar to MultiversX in some aspects but has MANY important differences:

### Key Differences:
1. **Local Node Port**: Klever uses port 8080 (not 7950)
2. **SDK Location**: \`~/klever-sdk/\` (not multiversx-sdk)
3. **Binary Names**: \`koperator\`, \`ksc\` (not mxpy, erdpy, etc.)
4. **Libraries**: NEVER use MultiversX libs in Klever KVM contracts
5. **API Endpoints**: Different API structure and endpoints

### Common Mistakes to Avoid:
\`\`\`rust
// ❌ WRONG - MultiversX import
use multiversx_sc::api::ManagedTypeApi;

// ✅ CORRECT - Klever import
use klever_sc::api::ManagedTypeApi;
\`\`\`

### Node Configuration:
\`\`\`bash
# ❌ WRONG - MultiversX port
export PROXY="http://localhost:7950"

# ✅ CORRECT - Klever port and variable
export KLEVER_NODE="http://localhost:8080"
\`\`\`

### CLI Tools:
\`\`\`bash
# ❌ WRONG - MultiversX tools
mxpy contract deploy
erdpy contract call
sc-meta all build

# ✅ CORRECT - Klever tools
~/klever-sdk/koperator sc create
~/klever-sdk/koperator sc invoke
~/klever-sdk/ksc all build
\`\`\`

## Important Rules:
1. ALWAYS check Klever documentation first
2. If you find MultiversX examples, they need adjustments
3. Library names are different (klever-sc vs multiversx-sc)
4. Node interaction patterns are different
5. Default ports and endpoints are different

## When Converting MultiversX Code:
- Replace all \`multiversx\` imports with \`klever\`
- Change port 7950 to 8080 for local development
- Use \`KLEVER_NODE\` instead of \`PROXY\`
- Use Klever-specific CLI tools`,
    {
      title: 'Critical: Klever vs MultiversX Differences',
      description: 'Important differences between Klever and MultiversX blockchains',
      tags: ['critical', 'differences', 'multiversx', 'warning', 'important'],
      language: 'mixed',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),
];

export default criticalDifferencesKnowledge;