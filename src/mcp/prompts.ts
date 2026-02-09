import type { GetPromptResult, Prompt } from '@modelcontextprotocol/sdk/types.js';
import type { ServerProfile } from './server.js';

export function getPromptDefinitions(_profile: ServerProfile): Prompt[] {
  return [
    {
      name: 'create_smart_contract',
      description: 'Guided workflow to create a complete Klever smart contract',
      arguments: [
        {
          name: 'contractName',
          description: 'Name for the smart contract project',
          required: false,
        },
        {
          name: 'contractType',
          description:
            'Type of contract to create (e.g. "token", "nft", "defi", "game", "dao")',
          required: false,
        },
      ],
    },
    {
      name: 'add_feature',
      description: 'Add a feature to an existing Klever smart contract',
      arguments: [
        {
          name: 'featureName',
          description: 'Name or description of the feature to add',
          required: true,
        },
        {
          name: 'contractName',
          description: 'Name of the target smart contract project',
          required: false,
        },
      ],
    },
  ];
}

export function getPromptMessages(
  name: string,
  args: Record<string, string> | undefined,
  profile: ServerProfile
): GetPromptResult {
  switch (name) {
    case 'create_smart_contract':
      return buildCreateSmartContractPrompt(args, profile);
    case 'add_feature':
      return buildAddFeaturePrompt(args, profile);
    default:
      throw new Error(`Unknown prompt: ${name}`);
  }
}

function buildCreateSmartContractPrompt(
  args: Record<string, string> | undefined,
  profile: ServerProfile
): GetPromptResult {
  const contractName = args?.contractName || 'my-contract';
  const contractType = args?.contractType || 'general-purpose';

  const initToolNote =
    profile === 'public'
      ? 'Use the `init_klever_project` tool to generate project template files. In public mode this returns file contents for you to create locally.'
      : 'Use the `init_klever_project` tool to scaffold the project directory with build, deploy, and automation scripts.';

  const scriptsToolNote =
    profile === 'public'
      ? 'Use the `add_helper_scripts` tool to get script template contents for the project.'
      : 'Use the `add_helper_scripts` tool to generate automation scripts in the project directory.';

  const text = `You are guiding the user through creating a complete Klever blockchain smart contract called "${contractName}" (type: ${contractType}).

Follow each phase below in order. Do NOT skip phases or proceed until the current phase is complete.

## Phase 0 — Knowledge Discovery

Before writing any code, query the MCP knowledge base for each topic below using the \`query_context\` tool. Document all findings before moving on.

1. **Token System** — Query for token precision, decimal places, unit conversions, and KDA naming conventions.
   - Example query: \`query_context({ query: "token system KLV precision decimals" })\`

2. **CLI Tools** — Query for koperator \`sc invoke\` syntax, \`--args\` type prefixes (bi:, Address:, String:), and \`--values\` for token payments.
   - Example query: \`query_context({ query: "koperator CLI invoke args values" })\`

3. **Contract Structure** — Query for required imports (\`use klever_sc::imports::*\`), macros (\`#[klever_sc::contract]\`), endpoint annotations (\`#[endpoint]\`, \`#[view]\`, \`#[payable("KLV")]\`), and init patterns.
   - Example query: \`query_context({ query: "contract structure imports annotations endpoint" })\`

4. **Storage** — Query for storage mapper types: SingleValueMapper, MapMapper, SetMapper, VecMapper, and when to use each.
   - Example query: \`query_context({ query: "storage mapper types SingleValueMapper MapMapper" })\`

5. **Events** — Query for event annotation rules, parameter limitations, indexed fields, and naming conventions.
   - Example query: \`query_context({ query: "events annotation indexed fields" })\`

6. **Modules** — Query for built-in SDK modules (AdminModule, PauseModule) and access control patterns (#[only_owner], #[only_admin]).
   - Example query: \`query_context({ query: "modules admin pause access control" })\`

7. **Common Errors** — Query for frequent mistakes: wrong payment handling, missing type prefixes, incorrect event formats, storage anti-patterns.
   - Example query: \`query_context({ query: "common errors mistakes pitfalls" })\`

**Gate: Do not proceed until all 7 topics have been queried and findings documented.**

## Phase 1 — Project Setup

${initToolNote}

- Project name: "${contractName}"
- Template: empty
- Network: testnet (default)

Verify the generated project structure includes: src/, tests/, scripts/, and output/ directories.

## Phase 2 — Contract Implementation

For each feature the user wants:

1. Ask the user what the feature should do (inputs, outputs, validation rules, business logic).
2. Query MCP for relevant patterns: \`query_context({ query: "<feature description> pattern" })\`
3. Implement the endpoint with proper Klever annotations based on knowledge base findings.
4. Use the correct storage mappers identified in Phase 0.

Work through features one at a time. Confirm each feature with the user before moving to the next.

## Phase 3 — Events & Owner Functions

1. For each state-changing endpoint, add an event emission.
   - Query MCP: \`query_context({ query: "event definition syntax" })\`
2. Add owner/admin functions:
   - Withdraw or management endpoints with \`#[only_owner]\` or \`#[only_admin]\`
   - Integrate PauseModule if the contract needs pause/resume capability
   - Query MCP: \`query_context({ query: "owner admin module pause" })\`

## Phase 4 — Scripts & Testing

1. ${scriptsToolNote}
2. Update interact.sh and query.sh with all contract endpoints, using correct \`--args\` type prefixes and \`--values\` for payments.
3. Build the contract and fix any compilation errors.
4. Run tests and verify all endpoints work correctly.

## Summary

At the end, provide:
- Complete project file listing
- Instructions for building and deploying
- Example CLI commands to interact with the deployed contract`;

  return {
    description: `Guided workflow to create a Klever smart contract: ${contractName}`,
    messages: [{ role: 'user', content: { type: 'text', text } }],
  };
}

function buildAddFeaturePrompt(
  args: Record<string, string> | undefined,
  profile: ServerProfile
): GetPromptResult {
  const featureName = args?.featureName || 'new feature';
  const contractName = args?.contractName || 'the contract';

  const scriptsNote =
    profile === 'public'
      ? 'Use `add_helper_scripts` to get updated script templates if needed.'
      : 'Use `add_helper_scripts` to regenerate automation scripts with the new endpoint.';

  const text = `You are helping the user add a new feature to an existing Klever smart contract${contractName !== 'the contract' ? ` ("${contractName}")` : ''}.

Feature to add: **${featureName}**

Follow these steps in order:

## Step 1 — Research

Query the MCP knowledge base for patterns related to this feature:

- \`query_context({ query: "${featureName} pattern implementation" })\`
- \`query_context({ query: "${featureName} storage events" })\`
- \`find_similar\` on any relevant context IDs returned

Document what patterns, storage types, and annotations are recommended.

## Step 2 — Clarify Requirements

Ask the user clarifying questions:
- What tokens are involved (if any) and in what amounts?
- What validation rules apply (min/max values, access control)?
- What data needs to be stored and how should it be queried?
- Should this feature emit events? If so, what data should they include?

## Step 3 — Implement

Based on MCP knowledge and user answers:

1. Add the endpoint with proper Klever annotations (\`#[endpoint]\`, \`#[payable(...)]\`, \`#[view]\`, etc.)
2. Add storage mappers for any new persistent data
3. Implement validation and business logic following patterns from the knowledge base
4. Add events for state-changing operations

## Step 4 — Update Scripts & Test

1. ${scriptsNote}
2. Add the new endpoint to interact.sh and/or query.sh with correct \`--args\` type prefixes
3. Build the contract and verify compilation succeeds
4. Test the new feature and confirm it works as expected`;

  return {
    description: `Add feature "${featureName}" to ${contractName}`,
    messages: [{ role: 'user', content: { type: 'text', text } }],
  };
}
