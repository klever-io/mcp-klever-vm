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
    {
      name: 'debug_error',
      description: 'Diagnose and fix a Klever smart contract compiler or runtime error',
      arguments: [
        {
          name: 'errorMessage',
          description: 'The error message or compiler output',
          required: true,
        },
        {
          name: 'sourceCode',
          description: 'The contract source code producing the error',
          required: false,
        },
      ],
    },
    {
      name: 'review_contract',
      description: 'Comprehensive security and quality review of a Klever smart contract',
      arguments: [
        {
          name: 'contractName',
          description: 'Name of the contract to review',
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
    case 'debug_error':
      return buildDebugErrorPrompt(args);
    case 'review_contract':
      return buildReviewContractPrompt(args);
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

Before writing any code, query the MCP knowledge base for each topic below using the \`query_context\` tool or \`search_documentation\` tool. Use \`search_documentation\` for "how do I..." style lookups and \`query_context\` for precise type/tag filtering. Document all findings before moving on.

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

## Phase 4 — Analysis, Scripts & Testing

1. Run \`analyze_contract\` on your contract source code to check for common issues (missing imports, annotations, storage patterns, event emissions). Fix any findings before proceeding.
2. ${scriptsToolNote}
3. Update interact.sh and query.sh with all contract endpoints, using correct \`--args\` type prefixes and \`--values\` for payments.
4. Build the contract and fix any compilation errors.
5. Run tests and verify all endpoints work correctly.

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

- \`search_documentation({ query: "${featureName} pattern implementation" })\` — for human-readable docs
- \`query_context({ query: "${featureName} storage events" })\` — for detailed context entries
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

## Step 4 — Analysis, Scripts & Test

1. Run \`analyze_contract\` on the updated contract source to check for common issues. Fix any findings.
2. ${scriptsNote}
3. Add the new endpoint to interact.sh and/or query.sh with correct \`--args\` type prefixes
4. Build the contract and verify compilation succeeds
5. Test the new feature and confirm it works as expected`;

  return {
    description: `Add feature "${featureName}" to ${contractName}`,
    messages: [{ role: 'user', content: { type: 'text', text } }],
  };
}

function buildDebugErrorPrompt(args: Record<string, string> | undefined): GetPromptResult {
  const errorMessage = args?.errorMessage || 'unknown error';
  const sourceCode = args?.sourceCode;

  const analyzeNote = sourceCode
    ? `
3. **Analyze Contract** — If the error may relate to contract structure, run:
   - \`analyze_contract({ sourceCode: "<the provided source code>" })\` to check for structural issues that may cause or contribute to the error`
    : '';

  const text = `You are helping the user diagnose and fix a Klever smart contract error.

**Error message:**
\`\`\`
${errorMessage}
\`\`\`
${sourceCode ? `\n**Source code:**\n\`\`\`rust\n${sourceCode}\n\`\`\`\n` : ''}
Follow these steps in order:

## Step 1 — Classify the Error

Parse the error message and classify it into one of these categories:
- **Compiler error (rustc)** — type mismatches, missing imports, trait bounds, lifetime issues
- **Linker error** — unresolved symbols, ABI mismatches
- **Runtime/VM error** — execution failures, out-of-gas, storage access errors
- **koperator CLI error** — deployment failures, argument formatting issues
- **Deployment error** — contract too large, missing init function, network issues

Extract key identifiers: error codes (e.g. E0308, E0599), type names, function names, and any Klever-specific terms.

## Step 2 — Search Knowledge Base

Query the MCP knowledge base for matching error patterns and relevant documentation:

1. **Error patterns** — Search for known error entries:
   - \`search_documentation({ query: "${errorMessage.slice(0, 80)}", category: "errors" })\`
   - \`query_context({ query: "${errorMessage.slice(0, 80)}", types: ["error_pattern"] })\`

2. **Related documentation** — Search for relevant concepts mentioned in the error:
   - \`search_documentation({ query: "<key terms from the error>" })\`
   - \`query_context({ query: "<key terms from the error>" })\`
${analyzeNote}

Document all relevant knowledge base entries found.

## Step 3 — Diagnose

Based on the knowledge base results and error classification:

1. **Explain** what the error means in the context of Klever smart contracts
2. **Highlight Klever differences** — If the error is due to a Klever/KVM difference from MultiversX or standard Rust, explain the specific difference
3. **Identify root cause** — Pinpoint the exact cause and the relevant code section
4. **Reference** matching knowledge base entries that explain the underlying concept

## Step 4 — Fix

Provide a concrete fix:

1. **Before/After** — Show the problematic code and the corrected version side by side
2. **Explanation** — Explain why the fix works and what was wrong
3. **Related patterns** — If the fix involves a common pattern (payment handling, event params, storage mappers, type conversions), link to the relevant best practice from the knowledge base
4. **Prevention** — Suggest how to avoid this error in the future`;

  return {
    description: `Debug Klever smart contract error: ${errorMessage.slice(0, 60)}`,
    messages: [{ role: 'user', content: { type: 'text', text } }],
  };
}

function buildReviewContractPrompt(args: Record<string, string> | undefined): GetPromptResult {
  const contractName = args?.contractName || 'the contract';

  const text = `You are performing a comprehensive security and quality review of a Klever smart contract${contractName !== 'the contract' ? ` ("${contractName}")` : ''}.

Follow each phase below in order. Do NOT skip phases.

## Phase 1 — Automated Analysis

Run \`analyze_contract\` on the contract source code to get automated findings:
- \`analyze_contract({ sourceCode: "<contract source>" })\`

Document all errors, warnings, and info items returned by the analysis.

## Phase 2 — Security Review

Query the knowledge base for security-related patterns and best practices:

1. **Access control** — Search for ownership and admin patterns:
   - \`search_documentation({ query: "access control owner admin", category: "modules" })\`
   - \`query_context({ query: "only_owner only_admin access control" })\`

2. **Payment security** — Search for payment validation patterns:
   - \`search_documentation({ query: "payment validation security", category: "best-practices" })\`
   - \`query_context({ query: "payable payment validation" })\`

3. **Security tips** — Search for general security guidance:
   - \`query_context({ query: "security", types: ["security_tip"] })\`

Check for the following issues:
- **Access control**: Are sensitive endpoints protected with \`#[only_owner]\` or \`#[only_admin]\`?
- **Payment validation**: Do payable endpoints validate payment amounts and token types?
- **Reentrancy**: Are there potential reentrancy risks in external calls?
- **Integer overflow/underflow**: Are BigUint operations used safely?

## Phase 3 — Code Quality Review

Query the knowledge base for quality and optimization patterns:

1. **Gas optimization** — Search for storage and gas best practices:
   - \`search_documentation({ query: "gas optimization storage", category: "best-practices" })\`
   - \`query_context({ query: "gas optimization performance" })\`

2. **Optimization patterns** — Search for optimization entries:
   - \`query_context({ query: "optimization", types: ["optimization"] })\`

Check for the following:
- **Event emissions**: Do all state-changing endpoints emit events?
- **Storage mapper selection**: Is the correct mapper type used for each use case (SingleValueMapper, MapMapper, SetMapper, VecMapper)?
- **Error messages**: Do all \`require!\` calls include descriptive error messages?
- **Code organization**: Is the contract well-organized with modules and separation of concerns?

## Phase 4 — Summary & Recommendations

Produce a structured review report with these sections:

### Critical Issues (must fix before deployment)
- Issues that could lead to loss of funds, unauthorized access, or contract bricking

### Warnings (should fix)
- Issues that could lead to unexpected behavior or reduced security

### Suggestions (nice to have)
- Improvements for code quality, gas optimization, or maintainability

### Positive Observations
- Things done well that should be maintained

For each finding:
1. Describe the issue clearly
2. Reference the relevant knowledge base entry
3. Provide a concrete fix or recommendation`;

  return {
    description: `Security and quality review of ${contractName}`,
    messages: [{ role: 'user', content: { type: 'text', text } }],
  };
}
