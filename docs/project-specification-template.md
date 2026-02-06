# Smart Contract Project Specification Template

> Copy everything below the `---` line and fill it in for your project.
> This prompt is designed for MCP-connected AI assistants (Claude, Copilot, etc.)
> that have access to the Klever VM MCP server.
>
> **How to use:**
> 1. Copy the template below into a new file or chat prompt
> 2. Replace the placeholder sections with your project details (see inline comments)
> 3. Send the filled-in spec to your AI assistant
> 4. The assistant will query the MCP knowledge base during each phase before writing code

---

# My Contract Name
<!-- Replace with your contract name, e.g. "KleverDice", "TokenSwap", "NFTMarketplace" -->

## Execution Instructions

When implementing this specification:

1. **Create a task list** — Break this spec into trackable tasks (discovery, project init, each feature, events, scripts, testing). Mark each task as complete when done so progress is visible.
2. **Use agents for parallel work** — Dispatch independent tasks to specialized agents when possible (e.g., researching MCP knowledge in parallel, generating scripts while contract code is being reviewed).
3. **Query MCP before each phase** — Never assume Klever patterns. Always query the MCP knowledge base and document findings before writing code.
4. **Verify at each gate** — Do not move to the next phase until the current phase's checklist is fully checked off.

## Phase 0: Knowledge Discovery

Before writing any code, query the Klever VM MCP knowledge base for each topic below and save findings in `knowledge-notes.md`. This ensures correct patterns are used from the start.

### Topics to Research

Query MCP for each of these. Only check the box once you have documented the findings:

- [ ] **Token System** — Which tokens does your contract handle? Query MCP for their precision (decimal places), unit conversions, and KDA naming conventions. Example: KLV has 6 decimals, so 1 KLV = 1,000,000 units.

- [ ] **CLI Tools** — How will you call the contract from the command line? Query MCP for koperator `sc invoke` syntax, `--args` type prefixes (e.g., `bi:`, `Address:`, `String:`), and `--values` for token payments.

- [ ] **Contract Structure** — What does a Klever contract look like? Query MCP for required imports (`use klever_sc::imports::*`), macros (`#[klever_sc::contract]`), endpoint annotations (`#[endpoint]`, `#[view]`, `#[payable("KLV")]`), and init patterns.

- [ ] **Storage** — What data does your contract store? Query MCP for storage mapper types and when to use each: `SingleValueMapper` for single values, `MapMapper` for key-value lookups, `SetMapper` for unique collections, `VecMapper` for ordered lists.

- [ ] **Events** — What actions should emit events? Query MCP for event annotation rules, parameter limitations, indexed field constraints, and naming conventions.

- [ ] **Modules** — Does your contract need admin controls or pause functionality? Query MCP for built-in SDK modules (`AdminModule`, `PauseModule`) and access control patterns (`#[only_owner]`, `#[only_admin]`).

- [ ] **Common Errors** — What pitfalls should you avoid? Query MCP for frequent mistakes like wrong payment handling, missing type prefixes, incorrect event formats, and storage anti-patterns.

**Do not proceed to implementation until all items above are checked and documented.**

> **If MCP returns no results for a topic**, document the gap in `knowledge-notes.md` and flag it for knowledge base improvement. Never guess — missing knowledge is better caught now than after deployment.

## Project Setup

<!-- Fill in your project details -->

- **Name**: My Contract Name
- **Template**: `empty`
  <!-- Use "empty" for a blank contract. This is the standard starting point. -->
- **Network**: testnet
  <!-- Start with testnet. Switch to mainnet only for production deployment. -->

Initialize using the `init_klever_project` MCP tool. This generates:
- Build, deploy, upgrade, query, test, and interact scripts
- Deployment history tracking in `output/history.json`
- Testnet-preconfigured environment

## Features

<!--
  List each feature of your contract as a subsection.
  Be specific about rules and numbers — the more precise you are,
  the better the generated code will be.

  For each feature, think about:
  - What endpoint(s) does it need?
  - What tokens are involved and in what amounts?
  - What are the validation rules? (min/max, who can call it, etc.)
  - What data needs to be stored?
  - What events should it emit?
-->

### Feature 1 Name

<!-- Example of a well-written feature spec: -->
<!--
- Players bet KLV tokens on dice outcomes (1-6)
- Random number generated securely for each roll
- Winning payout: 5.88x the bet (6x minus 2% house edge)
- Min bet: 10 KLV, Max bet: 1000 KLV
- Reject bets from smart contract addresses
-->

Describe what this feature does. Include:
- What tokens are accepted and in what amounts
- Validation rules (min/max values, who can call, etc.)
- Business logic (calculations, conditions, payouts)
- What data gets stored

### Feature 2 Name

Describe the next feature...

<!-- Add more ### sections for additional features -->

### Events

<!--
  List every event your contract emits. For each event, specify:
  - When it fires (what action triggers it)
  - What data it includes (player address, amounts, results, etc.)

  The AI will query MCP for the correct event annotation syntax.
-->

- `MyEvent` — emitted when X happens, includes: field1, field2, field3

### Owner Functions

<!-- List the admin/management functions. Common ones include: -->

- Withdraw accumulated fees/profits
- Pause/resume the contract (use klever-vm-sdk pause module)
- Update configuration parameters (if needed)

## Automation Scripts

<!--
  The init_klever_project tool generates starter scripts. List ALL endpoints
  here so the AI can generate complete interact.sh and query.sh scripts.

  For each endpoint specify:
  - Name: the function name as defined in the contract
  - Type: "endpoint" (writes state) or "view" (reads state)
  - Params: argument types (u32, Address, BigUint, String, etc.)
  - Payment: if it accepts tokens, specify which and how (via --values)
-->

Endpoints for `interact.sh` and `query.sh`:
- `myEndpoint` — endpoint, params: amount (BigUint), payment: KLV via `--values`
- `getStatus` — view, no params
- `ownerWithdraw` — endpoint (owner-only), no params

All scripts must use:
- Correct `--args` type prefixes from MCP knowledge
- `--values` for token payments (not `--args`)
- `--sign --await --result-only` for unattended execution

## Suggested Task Breakdown

<!--
  The AI assistant should create a task list based on this structure.
  Each task should be marked as complete when finished.
  Adjust tasks based on your specific features.
-->

1. **Knowledge Discovery** — Query MCP for all topics, create `knowledge-notes.md`
2. **Project Initialization** — Run `init_klever_project`, verify generated scripts
3. **Contract Skeleton** — Create contract struct, imports, init, storage mappers
4. **Feature: {Feature 1}** — Implement endpoint, validation, business logic
5. **Feature: {Feature 2}** — _(repeat for each feature)_
6. **Events** — Implement all event definitions and emissions
7. **Owner Functions** — Admin endpoints, pause module integration
8. **Automation Scripts** — Update `interact.sh` and `query.sh` with all endpoints
9. **Build and Test** — Compile contract, run tests, fix any issues
10. **Deploy and Verify** — Deploy to testnet, call each endpoint via scripts, confirm expected behavior

## Output

- Full project structure with contract code
- All automation scripts preconfigured and ready to run
- Ready for testnet deployment

---

## Filled-in Example: KleverDice

Below is a complete example showing how to fill in this template.

---

# KleverDice

## Phase 0: Knowledge Discovery

_(Same checklist as above — the AI assistant checks each box as it queries MCP.)_

## Project Setup

- **Name**: KleverDice
- **Template**: `empty`
- **Network**: testnet

## Features

### Game Logic

- Players bet KLV tokens on dice outcomes (1-6)
- Random number generated securely for each roll
- Winning payout: 5.88x the bet (6x minus 2% house edge)
- Min bet: 10 KLV, Max bet: 1000 KLV
- Reject bets from smart contract addresses

### Events

- `GamePlayed` — emitted on every dice roll, includes: player address, bet amount, chosen number, rolled number, payout amount

### Owner Functions

- `withdrawHouseProfits` — withdraw accumulated house edge to owner wallet
- Pause/resume via klever-vm-sdk pause module

## Automation Scripts

Endpoints for `interact.sh` and `query.sh`:
- `placeBet` — endpoint, params: dice number (u32), payment: KLV bet amount via `--values`
- `withdrawHouseProfits` — endpoint (owner-only), no params
- `pauseGame` — endpoint (owner-only), no params
- `resumeGame` — endpoint (owner-only), no params
- `getGameStats` — view, no params

## Suggested Task Breakdown

1. **Knowledge Discovery** — Query MCP for tokens, CLI, storage, events, modules; create `knowledge-notes.md`
2. **Project Initialization** — Run `init_klever_project`, verify generated scripts
3. **Contract Skeleton** — Create contract struct, imports, init, storage mappers
4. **Feature: Game Logic** — Implement `placeBet` endpoint with dice roll, payout, and validation
5. **Events** — Implement `GamePlayed` event
6. **Owner Functions** — `withdrawHouseProfits`, pause module integration
7. **Automation Scripts** — Update `interact.sh` and `query.sh` with all endpoints
8. **Build and Test** — Compile contract, run tests, fix any issues
9. **Deploy and Verify** — Deploy to testnet, call each endpoint via scripts, confirm expected behavior
