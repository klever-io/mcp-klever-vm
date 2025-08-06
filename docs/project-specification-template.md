# Smart Contract Development Template & Prompt

> **This is a template/prompt for developing Klever smart contracts using the MCP knowledge base.**
> 
> Use this as a guide for any smart contract project - it provides a structured approach to discovery, planning, and implementation using MCP queries to gather the necessary knowledge before coding.

---

# Klever Smart Contract Project Specification

## 🎓 PHASE 0: BLOCKCHAIN DISCOVERY (MANDATORY FIRST STEP)

Before ANY implementation, you MUST:
1. Query the KLEVER-VM MCP knowledge base for EACH topic below
2. **CREATE A VISIBLE KNOWLEDGE DOCUMENT** (knowledge-notes.md) with your findings
3. Reference this document throughout implementation

### Required Knowledge Document Structure:
Create `knowledge-notes.md` with discovered information from MCP queries about:
- Native tokens and their exact decimal precision
- Payment command syntax (especially the correct --values parameter)
- Event system rules and limitations
- Storage mapper types and when to use each
- Random generation methods
- Contract structure and required imports
- Common errors to avoid

### Essential Topics to Research in MCP:
1. **Token System**:
   - [ ] Query MCP for native/base tokens and their properties
   - [ ] Discover token precision and decimal places
   - [ ] Learn KDA (Klever Digital Assets) naming conventions
   - [ ] Understand token unit conversions

2. **Command Line Interface**:
   - [ ] Query MCP for blockchain interaction commands
   - [ ] Discover correct payment parameter syntax
   - [ ] Learn argument encoding formats
   - [ ] Find examples of token transfer commands

3. **Contract Architecture**:
   - [ ] Query MCP for contract structure patterns
   - [ ] Discover required imports and macros
   - [ ] Learn about endpoint and view annotations
   - [ ] Understand payable function patterns

4. **Development Libraries**:
   - [ ] Query MCP for available storage solutions
   - [ ] Discover numeric type handling
   - [ ] Find module usage patterns
   - [ ] Discover the sdk builtin modules available
   - [ ] Query for event declaration and annotation patterns
   - [ ] Learn about event system limitations and best practices

5. **Common Patterns**:
   - [ ] Query MCP for random number generation
   - [ ] Discover access control patterns
   - [ ] Learn about pausable contract patterns
   - [ ] Find address handling best practices

### Discovery Process:
1. Query MCP for each topic area
2. **Document findings in knowledge-notes.md**
3. Identify critical rules and common errors
4. Build a reference sheet from MCP discoveries
5. Validate understanding before proceeding

### Additional Resources in MCP:
- Query for API documentation and endpoints
- Search for SDK location and usage patterns
- Find testnet/mainnet network configurations
- Discover available code examples and templates

## ⚠️ IMPLEMENTATION GATE
**DO NOT PROCEED TO IMPLEMENTATION UNTIL:**
- [ ] knowledge-notes.md file created with MCP findings
- [ ] All essential topics have been queried and documented
- [ ] Event system limitations are documented
- [ ] Payment syntax is clearly documented
- [ ] Token decimals are confirmed and documented

## Project Name
**KleverDice**

## Template
- Use the `empty` Klever smart contract template

## Goal
Create a smart contract for a decentralized dice game on Klever Blockchain.

## Features

### 🎮 Game Logic
- Players bet **KLV** tokens on dice outcomes (1–6)
- Random number is securely generated for each roll
- Winning payout: **5.88x** the bet (6x minus **2% house edge**)
- Enforce min/max bet rules:
  - Minimum: **10 KLV**
  - Maximum: **1000 KLV**
- Reject bets from **smart contract addresses**

### 📢 Event Requirements
- Emit events for all game actions (bet placed, game won, game lost)
- **MUST query MCP for event limitations before implementing**
- **MUST follow discovered event annotation patterns**
- Include relevant indexed fields based on MCP findings

## 🧱 Project Initialization (via init_klever_project)
- Initialize the project using `init_klever_project`
- This must:
  - Generate all automation scripts (`deploy`, `upgrade`, `query`, `interact`, `build`, `test`)
  - Enable full deployment history tracking using the MCP project context
  - Preconfigure the environment for **testnet deployment**
  - Ensure all scripts are prefilled with valid `koperator` calls and argument encoding

### 🛠 Automation Scripts
Generate all necessary helper scripts to interact with contract using the previous generated from init project `query.sh` && `interact.sh`

The `interact.sh` script must include functions for ALL contract endpoints:
- `placeBet` - with bet amount and dice number parameters
- `withdrawHouseProfits` - owner-only function
- `pauseGame` - owner-only function to pause the contract
- `resumeGame` - owner-only function to resume the contract
- Any other endpoints added to the contract

All scripts must have:
- Proper encoding for arguments based on MCP knowledge
- Ready-to-use execution flow with example values
- Clear comments explaining each parameter
- For KLV or KDA token payments query MCP for proper koperator payment parameters

### 🔐 Owner Functions
- Withdraw house profits
- Pause/resume the game (use klever-vm-sdk modules)

## 📚 MCP Context Integration (Throughout Development)

### Phase 1: Initial Knowledge Discovery
**MANDATORY BEFORE ANY CODE GENERATION**:
1. Query MCP for blockchain fundamentals and patterns
2. Search for common error patterns to avoid
3. Find deployment tools and script templates
4. Discover code examples and best practices

### Phase 2: Development-Time Queries
For EVERY implementation decision, query MCP for:
- **Token Operations**: Search for token precision and unit information
- **Command Generation**: Find correct command syntax and parameters
- **Contract Patterns**: Discover best practices and optimizations
- **Error Prevention**: Look up known issues and their solutions

### Phase 3: Script Generation Validation
When creating automation scripts:
- **MUST** query MCP for exact command syntax
- **MUST** search for argument encoding patterns
- **MUST** find payment parameter formats
- **NEVER** assume - always verify through MCP queries

### Required MCP Queries Before Implementation:
1. **Before token payments**: Query for payment syntax and token decimals
2. **Before contract creation**: Query for initialization patterns
3. **Before storage implementation**: Query for storage mapper options
4. **Before events**: Query for event system rules and limitations
5. **Before randomness**: Query for random generation patterns

**⚠️ FAILURE MODE**: If MCP query returns no results, document the missing information for knowledge base improvement. Never make assumptions.

## Output
- Full project structure
- All automation scripts preconfigured
- Smart contract code with comments
- Ready for testnet deployment


## 🔍 Pre-Implementation Verification

Before writing code, ensure you have:
- [ ] Created knowledge-notes.md with MCP discoveries
- [ ] Documented token system findings
- [ ] Documented command syntax discoveries
- [ ] Documented event system constraints
- [ ] Documented storage solutions
- [ ] Documented randomness approach
- [ ] Documented common pitfalls to avoid

**Your knowledge-notes.md should enable you to implement without guessing**
