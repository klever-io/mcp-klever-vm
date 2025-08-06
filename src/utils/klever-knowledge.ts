import { ContextPayload } from '../types/index.js';

export const kleverKnowledgeBase: ContextPayload[] = [
  // CRITICAL PAYMENT SYNTAX - MUST READ FIRST
  {
    type: 'error_pattern',
    content: `# 🚨 CRITICAL: KLV Payment Syntax - NEVER USE --value

## ⛔ --value DOES NOT EXIST IN KOPERATOR!

### VERY IMPORTANT !!!!!!:
- **1 KLV = 1_000_000 (1e6) smallest units**
- **1 KFI = 1_000_000 (1e6) smallest units**
- Always use \`ManagedRef<BigUint>\` values in contracts (smallest units)
- Convert to human-readable amounts by dividing by 1_000_000
### Example Conversions:
\`\`\`rust
// Converting from KLV/KFI to contract units
const ONE_KLV: u64 = 1_000_000;        // 1 KLV
const HALF_KLV: u64 = 500_000;         // 0.5 KLV
const TEN_KLV: u64 = 10_000_000;       // 10 KLV
const HUNDRED_KLV: u64 = 100_000_000;  // 100 KLV
// In contract functions
#[payable("KLV")]
#[endpoint(deposit)]
fn deposit(&self) {
    let amount = self.call_value().klv_value();
    // amount is already multiplied by 1_000_000
}
\`\`\`
---

### ✅ CORRECT: Always use --values (with 's') for ALL payments:
\`\`\`bash
# For KLV payments - ALWAYS use --values
KLEVER_NODE=$KLEVER_NODE ~/klever-sdk/koperator \\
    --key-file="walletKey.pem" \\
    sc invoke CONTRACT_ADDRESS methodName \\
    --values "KLV=1000000" \\           # ✅ CORRECT: --values
    --await --sign --result-only

# For KDA token payments
--values "DVK-1234=500000"             # ✅ CORRECT

# For multiple tokens
--values "KLV=1000000,KFI=500000"      # ✅ CORRECT

# For NFTs/SFTs
--values "MYNFT-ABC1/42=1"             # ✅ CORRECT
\`\`\`

### ❌ THESE DO NOT EXIST - NEVER USE:
- \`--value\` ❌ DOES NOT EXIST (common mistake!)
- \`--amount\` ❌ DOES NOT EXIST
- \`--klv\` ❌ DOES NOT EXIST
- \`--token-transfers\` ❌ DOES NOT EXIST
- \`--kdaFee\` ❌ DOES NOT EXIST

### Why this matters:
Using \`--value\` will result in an error. The ONLY correct parameter is \`--values\` (plural).

### Format Rules:
1. **ALWAYS --values** not --value
2. **TOKEN=AMOUNT** format (equals sign, not colon)
3. **KLV uses 6 decimals** (1 KLV = 1_000_000 units)
4. **Multiple tokens**: comma-separated

### Examples of Common Mistakes:
\`\`\`bash
# ❌ WRONG - Will fail
koperator sc invoke CONTRACT deposit --value 1000000

# ✅ CORRECT
koperator sc invoke CONTRACT deposit --values "KLV=1000000"

# ❌ WRONG - Will fail
koperator sc invoke CONTRACT swap --amount 500000

# ✅ CORRECT
koperator sc invoke CONTRACT swap --values "KLV=500000"
\`\`\``,
    metadata: {
      title: 'CRITICAL: --values NOT --value - Most Common Error',
      description: '--value does not exist! Always use --values for any token payment',
      tags: ['critical', 'payment', 'KLV', 'koperator', 'error', 'must-read-first'],
      author: 'system',
      language: 'bash',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      relevanceScore: 1.0
    },
    relatedContextIds: []
  },
  // CRITICAL KLV/KFI DECIMALS - MUST READ
  {
    type: 'error_pattern',
    content: `# 🚨 CRITICAL: KLV and KFI ALWAYS Use 6 Decimals

## ⛔ NEVER USE 8, 9, 10 or 18 DECIMALS!

### ✅ CORRECT: KLV and KFI ALWAYS have 6 decimals:
\`\`\`bash
# 1 KLV = 1,000,000 units (10^6)
# NOT 10^8, NOT 10^9, NOT 10^10, NOT 10^18!

# Correct Examples:
1 KLV = 1000000        # 6 zeros
10 KLV = 10000000      # 7 zeros
0.1 KLV = 100000       # 5 zeros
0.001 KLV = 1000       # 3 zeros

# Same for KFI:
1 KFI = 1000000        # 6 zeros
100 KFI = 100000000    # 8 zeros
\`\`\`


### Why This Matters:
Using wrong decimals will cause:
- **Overpayment**: Using 10 decimals means sending 10,000x more than intended!
- **Transaction failures**: Insufficient balance errors
- **Contract bugs**: Wrong calculations in smart contracts

### Quick Reference Table:
| Amount | Units (6 decimals) | Common Mistakes |
|--------|-------------------|------------------|
| 1 KLV | 1,000,000 | NOT 100,000,000 (8 dec) |
| 0.1 KLV | 100,000 | NOT 10,000,000 (8 dec) |
| 0.01 KLV | 10,000 | NOT 1,000,000 (8 dec) |
| 0.001 KLV | 1,000 | NOT 100,000 (8 dec) |
| 10 KLV | 10,000,000 | NOT 1,000,000,000 (9 dec) |
| 100 KLV | 100,000,000 | NOT 10,000,000,000 (10 dec) |

### In Smart Contracts:
\`\`\`rust
// ALWAYS use this constant
const KLV_DECIMALS: u64 = 1_000_000;  // 10^6, NOT 10^8 or 10^9!
const KFI_DECIMALS: u64 = 1_000_000;  // Same 6 decimals

// Convert KLV to units
let one_klv = BigUint::from(1u32) * KLV_DECIMALS;  // 1,000,000
let ten_klv = BigUint::from(10u32) * KLV_DECIMALS; // 10,000,000
\`\`\`

### In Koperator Commands:
\`\`\`bash
# Send 1 KLV
koperator sc invoke CONTRACT method --values "KLV=1000000"  # 6 zeros

# Send 10 KLV
koperator sc invoke CONTRACT method --values "KLV=10000000" # 7 zeros

# Send 0.5 KLV
koperator sc invoke CONTRACT method --values "KLV=500000"   # 5 zeros + 5
\`\`\`

### REMEMBER:
- **KLV: ALWAYS 6 decimals** (1 KLV = 1,000,000)
- **KFI: ALWAYS 6 decimals** (1 KFI = 1,000,000)
- **NOT 8, NOT 9, NOT 10, NOT 18 decimals!**
- **This is different from Ethereum** (which uses 18)
- **This is different from Bitcoin** (which uses 8)
- **When in doubt**: 1 KLV = 1 followed by 6 zeros`,
    metadata: {
      title: 'CRITICAL: KLV/KFI Always 6 Decimals - NOT 8, 9, 10 or 18',
      description: 'KLV and KFI ALWAYS use 6 decimal places. Using 8, 9, 10 or 18 decimals is WRONG and will cause massive overpayments!',
      tags: ['critical', 'decimals', 'KLV', 'KFI', 'error', 'must-read-first'],
      author: 'system',
      language: 'bash',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      relevanceScore: 1.0
    },
    relatedContextIds: []
  },
  // CODE EXAMPLE DISCOVERY GUIDE
  {
    type: 'best_practice',
    content: `# Finding Contract Patterns and Code Examples

## 🎯 How to Find Code Examples for Different Use Cases

This knowledge base contains extensive code examples for various smart contract implementations. Use these patterns to build gaming, DeFi, NFT, and other contract types.

### Available Code Example Categories

#### Core Contract Patterns
- **Basic Contract Structure** - Foundation for any contract type
- **Token Handling Examples** - KLV, KDA token operations
- **Storage Patterns** - Complete storage with namespaces and views
- **Admin Access Control** - Permission management for DeFi/gaming
- **Pausable Contracts** - Emergency stop mechanisms

#### Token & NFT Patterns
- **FungibleTokenMapper** - Create fungible tokens (for DeFi)
- **NonFungibleTokenMapper** - NFT creation and management
- **Token Payment Patterns** - Accept and process payments
- **KDA Token Operations** - Working with Klever digital assets

#### DeFi Building Blocks
- **Payable Endpoints** - Accept token deposits
- **Cross-Contract Calls** - Interact with other contracts
- **Remote Storage Access** - Read data from other contracts
- **Token Mapper Helpers** - Issue, mint, burn tokens

#### Gaming Components
- **Random Number Generation** - Secure randomness for games
- **Event Patterns** - Game state changes and notifications
- **Storage Collections** - Track players, scores, items

### How to Build Different Contract Types

#### 🎮 Gaming Contracts
Combine these patterns:
1. **Basic Contract Structure** - Foundation
2. **Random Number Generation** - For game mechanics
3. **Storage Collections** (MapMapper, SetMapper) - Track players/items
4. **Event Patterns** - Notify game state changes
5. **Admin Module** - Game admin functions
6. **Pausable Module** - Pause game if needed

#### 💰 DeFi Contracts
Combine these patterns:
1. **Basic Contract Structure** - Foundation
2. **Token Handling Examples** - Accept/send tokens
3. **FungibleTokenMapper** - Create liquidity tokens
4. **Payable Endpoints** - Accept deposits
5. **Cross-Contract Calls** - Interact with other DeFi protocols
6. **Admin Access Control** - Protocol governance

#### 🎨 NFT Contracts
Combine these patterns:
1. **Basic Contract Structure** - Foundation
2. **NonFungibleTokenMapper** - NFT creation
3. **Storage Patterns** - Track NFT metadata
4. **Token Payment Patterns** - NFT sales
5. **Event Patterns** - Mint/transfer events

#### 🏦 Staking Contracts
Combine these patterns:
1. **Basic Contract Structure** - Foundation
2. **Token Handling** - Stake/unstake operations
3. **Storage Mappers** - Track staked amounts
4. **View Endpoints** - Check balances
5. **Pausable Module** - Emergency controls

### Finding Specific Examples

To find code examples for your use case:
1. Search for \`type: 'code_example'\` to see all examples
2. Look for relevant patterns in the categories above
3. Combine multiple patterns to build complete contracts
4. Each example includes working code you can adapt

### Example: Building a Simple Game

\`\`\`rust
// Combine these patterns:
// 1. Basic structure
#![no_std]
use klever_sc::imports::*;

// 2. Add random number generation
use klever_sc::api::RandomnessSource;

// 3. Add storage for game state
#[klever_sc::contract]
pub trait GameContract {
    #[storage_mapper("players")]
    fn players(&self) -> SetMapper<ManagedAddress>;

    #[storage_mapper("scores")]
    fn scores(&self) -> MapMapper<ManagedAddress, BigUint>;

    // 4. Game logic using randomness
    #[endpoint]
    fn play(&self) -> u8 {
        let mut rand_source = RandomnessSource::new();
        let dice_roll = (rand_source.next_u8() % 6) + 1;

        // Update scores...
        dice_roll
    }
}
\`\`\`

### Tips for Using Examples
- Start with the Basic Contract Structure
- Add modules and patterns as needed
- Each pattern is self-contained and can be combined
- Examples show real, working code
- Adapt variable names and logic to your needs`,
    metadata: {
      title: 'Code Example Discovery Guide',
      description: 'How to find and use code examples for different contract types',
      tags: ['guide', 'examples', 'patterns', 'gaming', 'defi', 'nft', 'discovery'],
      language: 'mixed',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // CRITICAL: Use Standard Rust Imports, NOT Macros
  {
    type: 'best_practice',
    content: `# CRITICAL: Use Standard Rust Imports, NOT Legacy Macros

## ⚠️ IMPORTANT: Always Use Standard Rust \`use\` Statements

Klever smart contracts should use standard Rust import patterns, NOT the legacy macro approach.

### ✅ CORRECT - Standard Rust Imports
\`\`\`rust
use klever_sc::imports::*;
use klever_sc::derive_imports::*;
\`\`\`

### ❌ WRONG - Legacy Macro Pattern
\`\`\`rust
// DO NOT USE THIS!
klever_sc::imports!();
klever_sc::derive_imports!();
\`\`\`

## Standard Import Patterns for Different Contexts:

### In Smart Contracts
\`\`\`rust
#![no_std]

use klever_sc::imports::*;
use klever_sc::derive_imports::*;

#[klever_sc::contract]
pub trait MyContract {
    #[init]
    fn init(&self) {
        // ...
    }
}
\`\`\`

### In Tests
\`\`\`rust
use klever_sc_scenario::*;
\`\`\`

### In Module Files
\`\`\`rust
use klever_sc::imports::*;
use klever_sc::derive_imports::*;

#[klever_sc::module]
pub trait MyModule {
    // ...
}
\`\`\`

## Why Standard Imports?
1. **Rust Best Practices**: Follows standard Rust conventions
2. **Better IDE Support**: IDEs can better analyze and provide autocomplete
3. **Clearer Dependencies**: Explicit about what's being imported
4. **Future Compatibility**: Macros are legacy and may be deprecated

## Migration from Macros
If you see old code using macros, replace:
- \`klever_sc::imports!();\` → \`use klever_sc::imports::*;\`
- \`klever_sc::derive_imports!();\` → \`use klever_sc::derive_imports::*;\`
- \`klever_sc_scenario::imports!();\` → \`use klever_sc_scenario::*;\``,
    metadata: {
      title: 'Use Standard Rust Imports Instead of Legacy Macros',
      description: 'Critical best practice for Klever smart contract imports',
      tags: ['critical', 'imports', 'best-practice', 'rust', 'macros'],
      language: 'rust',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // CRITICAL: Klever vs MultiversX Differences
  {
    type: 'best_practice',
    content: `# CRITICAL: Klever vs MultiversX Differences

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
    metadata: {
      title: 'Critical: Klever vs MultiversX Differences',
      description: 'Important differences between Klever and MultiversX blockchains',
      tags: ['critical', 'differences', 'multiversx', 'warning', 'important'],
      language: 'mixed',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Import Patterns
  {
    type: 'best_practice',
    content: `# Klever Smart Contract Import Patterns

## Clean Import Guidelines

⚠️ **IMPORTANT**: Always use standard Rust \`use\` statements, NOT legacy macros!

Always use single-line imports with the unused imports attribute:

### In Contracts
\`\`\`rust
#[allow(unused_imports)]
use klever_sc::imports::*;
\`\`\`

### In Tests
\`\`\`rust
#[allow(unused_imports)]
use klever_sc_scenario::imports::*;
\`\`\`

### In Interactors
\`\`\`rust
#[allow(unused_imports)]
use klever_sc_snippets::imports::*;
\`\`\`

### For Derives (when needed)
\`\`\`rust
#[allow(unused_imports)]
use klever_sc::derive_imports::*;
\`\`\`
This gives you derives like \`TypeAbi\` and codec derives.

### In Proxies (Auto-generated)
\`\`\`rust
#[allow(unused_imports)]
use klever_sc::proxy_imports::*;
\`\`\`
Note: This is generated automatically, developers don't need to add it manually.

## Why #[allow(unused_imports)]?

Since these imports bring in all submodules, you may not use every imported item in your contract.
Adding \`#[allow(unused_imports)]\` prevents compiler warnings like:
\`warning: unused import: \`klever_sc::imports\`\`

## Complete Contract Example
\`\`\`rust
#![no_std]

#[allow(unused_imports)]
use klever_sc::imports::*;

#[klever_sc::contract]
pub trait MyContract {
    #[init]
    fn init(&self) {
        // Contract initialization
    }
}
\`\`\``,
    metadata: {
      title: 'Klever Import Patterns with Unused Imports',
      description:
        'Proper import statements with #[allow(unused_imports)] for Klever smart contracts',
      tags: ['imports', 'best-practice', 'setup', 'contract', 'test', 'interactor', 'warnings'],
      language: 'rust',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Basic Contract Structure
  {
    type: 'code_example',
    content: `#![no_std]

#[allow(unused_imports)]
use klever_sc::imports::*;

#[klever_sc::contract]
pub trait MyContract {

    // Handles the contract initialization logic
    #[init]
    fn init(&self) {
        // Initialization logic
    }

     // Handles contract upgrades and ensures all storage values are properly initialized
    #[upgrade]
    fn upgrade(&self) {
        // Upgrade logic
    }

    // Endpoints
    #[endpoint(myEndpoint)]
    fn my_endpoint(
        &self,
        param1: ManagedBuffer,
        param2: BigUint
    ) -> bool {
        // Implementation
        self.values(&param1).set(buffer.clone());
        self.my_event(
            &self.caller(),
            &param1,
            &param2
        );
        true
    }

    // Views (read-only endpoints)
    #[view(getValueForKey)]
    fn get_value_for_key(
        &self,
        key: &ManagedBuffer
    ) -> ManagedBuffer {
        self.values(key).get()
    }

    // Events
    // ⚠️ CRITICAL: Klever allows MAX ONE non-indexed parameter per event!
    // Best practice: Use #[indexed] on ALL parameters to avoid errors
    #[event("myEvent")]
    fn my_event(
        &self,
        #[indexed] caller: &ManagedAddress,  // ✅ indexed
        #[indexed] key: &ManagedBuffer,      // ✅ indexed
        value: &BigUint                      // ⚠️ Only ONE non-indexed allowed!
    );

    // Storage definitions
    #[view(getValue)]
    #[storage_mapper("value")]
    fn values(&self, key: &ManagedBuffer) -> SingleValueMapper<ManagedBuffer>;
}`,
    metadata: {
      title: 'Basic Klever Smart Contract Template',
      description:
        'Complete template showing the structure of a Klever smart contract with init, upgrade, endpoints, views, events, and storage',
      tags: ['template', 'structure', 'basic', 'contract'],
      language: 'rust',
      contractType: 'template',
      relevanceScore: 0.95,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // CRITICAL Event Parameter Rule - READ FIRST
  {
    type: 'best_practice',
    content: `# ⚠️ CRITICAL: Klever Event Parameter Rule - MUST READ FIRST

## 🚨 THE #1 RULE FOR EVENTS IN KLEVER

**Klever allows AT MOST ONE non-indexed parameter per event!**

If you violate this rule, you'll get: \`"only 1 data argument allowed in event log"\`

### 🔥 Quick Fix to Avoid Errors

\`\`\`rust
// ✅ ALWAYS SAFE - Make ALL parameters indexed:
#[event("anyEvent")]
fn any_event(
    &self,
    #[indexed] param1: &ManagedAddress,  // ✅ indexed
    #[indexed] param2: &BigUint,         // ✅ indexed
    #[indexed] param3: &u8,              // ✅ indexed
);
\`\`\`

### ❌ What Causes the Error

\`\`\`rust
// ❌ THIS WILL FAIL - Multiple non-indexed parameters
#[event("gamePlayed")]
fn game_played_event(
    &self,
    #[indexed] player: &ManagedAddress,
    bet_amount: &BigUint,    // ❌ non-indexed
    result: &u8,              // ❌ non-indexed - ERROR HERE!
    payout: &BigUint,         // ❌ non-indexed - ERROR HERE TOO!
);
// Compilation error: "only 1 data argument allowed in event log"
\`\`\`

### ✅ Valid Options

**Option 1: All Indexed (Recommended)**
\`\`\`rust
#[event("gamePlayed")]
fn game_played_event(
    &self,
    #[indexed] player: &ManagedAddress,
    #[indexed] bet_amount: &BigUint,
    #[indexed] result: &u8,
    #[indexed] payout: &BigUint,
);
\`\`\`

**Option 2: Exactly One Non-Indexed**
\`\`\`rust
#[event("gamePlayed")]
fn game_played_event(
    &self,
    #[indexed] player: &ManagedAddress,
    #[indexed] bet_amount: &BigUint,
    #[indexed] result: &u8,
    payout: &BigUint,  // Only ONE non-indexed is OK
);
\`\`\`

### Why This Is Different

| Platform | Non-Indexed Parameters Allowed |
|----------|--------------------------------|
| Ethereum | Multiple ✅ |
| Klever   | Maximum ONE ⚠️ |

### Best Practice

**Just use #[indexed] on EVERYTHING** - It's simpler and avoids errors!`,
    metadata: {
      title: 'CRITICAL: Event Parameter One-Data Rule',
      description: 'The most important rule about Klever events - prevents "only 1 data argument allowed" error',
      tags: ['critical', 'events', 'indexed', 'error-prevention', 'must-read', 'common-error'],
      language: 'rust',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Event Annotations Best Practices
  {
    type: 'best_practice',
    content: `// Event annotation best practices:

// ⚠️ REMEMBER: Every event parameter needs #[indexed] attribute (except at most ONE can be non-indexed)
// Best practice: Just add #[indexed] to ALL parameters to avoid errors!
// 1. Always use double quotes in event names
#[event("myEvent")]  // ✓ Correct
#[event('myEvent')]  // ✗ Wrong

// 2. Use snakeCase for event names
#[event("transferCompleted")]  // ✓ Correct
#[event("transfer_completed")] // ✗ Wrong

// 3. Use references for Managed types
fn my_event(
    &self,
    #[indexed] caller: &ManagedAddress,  // ✓ Correct - reference
    #[indexed] key: &ManagedBuffer,      // ✓ Correct - reference
    value: &BigUint                      // ✓ Correct - reference
);

// 4. CRITICAL: In Klever, EVERY event parameter MUST have #[indexed] attribute (except at most ONE can be non-indexed)
// This means: You MUST add #[indexed] to ALL parameters, or leave at most ONE without it
// ❌ WRONG - Multiple non-indexed parameters (missing #[indexed]) will cause errors:
#[event("gamePlayed")]
fn game_played_event(
    &self,
    #[indexed] player: &ManagedAddress,
    bet_amount: &BigUint,      // ❌ Error: too many non-indexed
    chosen_number: u8,         // ❌ Error: too many non-indexed
    rolled_number: u8,         // ❌ Error: too many non-indexed
    won: bool,                 // ❌ Error: too many non-indexed
    payout: &BigUint,         // ❌ Error: too many non-indexed
);

// ✅ CORRECT - All parameters indexed except one (or all indexed):
#[event("gamePlayed")]
fn game_played_event(
    &self,
    #[indexed] player: &ManagedAddress,
    #[indexed] bet_amount: &BigUint,
    #[indexed] chosen_number: u8,
    #[indexed] rolled_number: u8,
    #[indexed] won: bool,
    #[indexed] payout: &BigUint,  // All indexed is valid
);

// ✅ ALSO CORRECT - One non-indexed parameter:
#[event("transfer")]
fn transfer_event(
    &self,
    #[indexed] from: &ManagedAddress,
    #[indexed] to: &ManagedAddress,
    amount: &BigUint  // Only one non-indexed parameter
);`,
    metadata: {
      title: 'Event Annotation Best Practices',
      description: 'Rules and patterns for properly defining events in Klever smart contracts',
      tags: ['events', 'annotations', 'best-practice'],
      language: 'rust',
      relevanceScore: 0.9,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Contract and Module Annotations
  {
    type: 'documentation',
    content: `# Klever Contract and Module Annotations

## Contract Annotation
- \`#[klever_sc::contract]\`: Essential for traits defining contract endpoints and logic
- Each crate should contain only ONE contract trait
- Does not accept any additional arguments

## Module Annotation
- \`#[klever_sc::module]\`: Designates a trait as a smart contract module
- Does not require any extra arguments
- Module and trait names should use PascalCase (e.g., \`pub trait UserManager\`)

## Important Rules:
1. A Rust module can only contain ONE contract, module, or proxy annotation
2. Multiple annotations must be in separate \`mod module_name { ... }\` declarations
3. Always use PascalCase for module and trait names, not snake_case`,
    metadata: {
      title: 'Contract and Module Annotation Rules',
      description: 'Guidelines for using contract and module annotations in Klever smart contracts',
      tags: ['annotations', 'contract', 'module', 'rules'],
      language: 'rust',
      relevanceScore: 0.85,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // MultiValueEncoded vs Option
  {
    type: 'optimization',
    content: `// OptionalValue vs Option - Performance Comparison

// ❌ Using Option<T> - Less efficient
#[endpoint(myOptArgEndpoint1)]
fn my_opt_arg_endpoint_1(&self, token_id: TokenIdentifier, opt_nonce: Option<u64>) {
    // Requires 0x01 for Some, 0x00 for None
    // Nested encoding required
}

// ✅ Using OptionalValue<T> - PREFERRED
#[endpoint(myOptArgEndpoint2)]
fn my_opt_arg_endpoint_2(&self, token_id: TokenIdentifier, opt_nonce: OptionalValue<u64>) {
    // More efficient - presence indicates Some
    // Direct top-encoding
    // Can be omitted entirely if None
}

// MultiValueEncoded Rules:
// 1. Only ONE MultiValueEncoded per endpoint
// 2. Must be the LAST parameter
// 3. Used for variable number of same-type arguments

// ❌ ManagedVec - NOT RECOMMENDED for endpoints
#[endpoint(myVarArgsEndpoint1)]
fn my_var_args_endpoint_1(&self, args: ManagedVec<(TokenIdentifier, u64, BigUint)>) {}

// ✅ MultiValueManagedVec - PREFERRED
#[endpoint(myVarArgsEndpoint2)]
fn my_var_args_endpoint_2(&self, args: MultiValueManagedVec<TokenIdentifier, u64, BigUint>) {
    // More gas efficient
    // Cleaner encoding
    // Better readability
}`,
    metadata: {
      title: 'OptionalValue and MultiValueEncoded Optimization',
      description:
        'Performance optimizations using OptionalValue over Option and MultiValueEncoded over ManagedVec',
      tags: ['optimization', 'performance', 'endpoints', 'multivalue', 'optional'],
      language: 'rust',
      relevanceScore: 0.9,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Storage Mapper Patterns
  {
    type: 'best_practice',
    content: `// Storage Mapper Selection Guide

// 1. SingleValueMapper - For single values
#[storage_mapper("counter")]
fn counter(&self) -> SingleValueMapper<BigUint>;

// With key arguments
#[storage_mapper("userBalance")]
fn user_balance(&self, user: &ManagedAddress) -> SingleValueMapper<BigUint>;

// 2. VecMapper - For indexed collections (indexes start at 1)
#[storage_mapper("userList")]
fn user_list(&self) -> VecMapper<ManagedAddress>;

// 3. SetMapper - For unique collections with insertion order
#[storage_mapper("tokenWhitelist")]
fn token_whitelist(&self) -> SetMapper<TokenIdentifier>;

// 4. UnorderedSetMapper - More efficient than SetMapper
#[storage_mapper("allowedTokens")]
fn allowed_tokens(&self) -> UnorderedSetMapper<TokenIdentifier>;

// 5. MapMapper - Most expensive, use only when needed
#[storage_mapper("userProfiles")]
fn user_profiles(&self) -> MapMapper<ManagedAddress, UserProfile>;

// 6. LinkedListMapper - For queue-like operations
#[storage_mapper("pendingTasks")]
fn pending_tasks(&self) -> LinkedListMapper<Task>;

// 7. UniqueIdMapper - For available ID tracking
#[storage_mapper("availableIds")]
fn available_ids(&self) -> UniqueIdMapper<Self::Api>;`,
    metadata: {
      title: 'Storage Mapper Selection Guide',
      description:
        'Comprehensive guide for choosing the right storage mapper for different use cases',
      tags: ['storage', 'mappers', 'patterns', 'best-practice'],
      language: 'rust',
      relevanceScore: 0.95,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // ManagedTypeApi Requirement for Structs
  {
    type: 'best_practice',
    content: `# ManagedTypeApi Requirement for Custom Structs

## When to Use ManagedTypeApi

Any struct that contains Klever managed types MUST have a generic parameter M with ManagedTypeApi bound:
- BigUint<M>
- BigInt<M>
- ManagedAddress<M>
- ManagedBuffer<M>
- ManagedVec<M>
- TokenIdentifier<M>
- ManagedByteArray<M, N>
- Any other managed type

## Correct Implementation Patterns

### Pattern 1: Using Where Clause (Explicit)
\`\`\`rust
#[derive(TopEncode, TopDecode, NestedEncode, NestedDecode)]
pub struct GameResult<M>
where
    M: ManagedTypeApi,
{
    player: ManagedAddress<M>,
    bet_amount: BigUint<M>,
    chosen_number: u8,
    rolled_number: u8,
    won: bool,
    payout: BigUint<M>,
    timestamp: u64,
}
\`\`\`

### Pattern 2: Inline Bound (Shorthand)
\`\`\`rust
#[derive(TopEncode, TopDecode, NestedEncode, NestedDecode)]
pub struct UserProfile<M: ManagedTypeApi> {
    address: ManagedAddress<M>,
    username: ManagedBuffer<M>,
    balance: BigUint<M>,
    level: u32,
    created_at: u64,
}
\`\`\`

### Pattern 3: Multiple Bounds
\`\`\`rust
#[derive(TopEncode, TopDecode)]
pub struct ComplexData<M>
where
    M: ManagedTypeApi + Clone,
{
    id: ManagedBuffer<M>,
    tokens: ManagedVec<M, TokenIdentifier<M>>,
    amounts: ManagedVec<M, BigUint<M>>,
    metadata: ManagedBuffer<M>,
}
\`\`\`

## Common Mistakes

### ❌ WRONG - Missing ManagedTypeApi
\`\`\`rust
// This will NOT compile
struct GameResult {
    player: ManagedAddress,    // Error: missing type parameter
    bet_amount: BigUint,       // Error: missing type parameter
    timestamp: u64,
}
\`\`\`

### ❌ WRONG - Using concrete Self::Api in struct definition
\`\`\`rust
// This will NOT work in struct definition
struct GameResult {
    player: ManagedAddress<Self::Api>,  // Error: Self not available here
    bet_amount: BigUint<Self::Api>,
}
\`\`\`

## Usage in Smart Contracts

When using these structs in contracts, use Self::Api:

\`\`\`rust
#[klever_sc::contract]
pub trait GameContract {
    #[endpoint]
    fn process_game_result(&self, result: GameResult<Self::Api>) {
        // Self::Api is available in trait methods
        let player = result.player;
        let payout = result.payout;
        // ...
    }

    #[view]
    fn get_last_result(&self) -> GameResult<Self::Api> {
        // Return type uses Self::Api
        GameResult {
            player: self.last_player().get(),
            bet_amount: self.last_bet().get(),
            chosen_number: self.last_choice().get(),
            rolled_number: self.last_roll().get(),
            won: self.last_won().get(),
            payout: self.last_payout().get(),
            timestamp: self.blockchain().get_block_timestamp(),
        }
    }
}
\`\`\`

## Key Points

1. **Always include M: ManagedTypeApi** for structs with managed types
2. **Use where clause** for better readability with complex bounds
3. **Use Self::Api** when inside contract trait methods
4. **Include necessary derives**: TopEncode, TopDecode for storage/events
5. **NestedEncode, NestedDecode** for structs used inside other structures

## CRITICAL: Always Specify Type Parameter in Function Signatures

When using custom structs with managed types in function signatures, you MUST specify the API type parameter:

### ❌ WRONG - Missing type parameter in return types
\`\`\`rust
// This will NOT compile
#[view]
fn get_player_history(&self, player: ManagedAddress) -> MultiValueEncoded<GameResult> {
    // Error: missing type parameter for GameResult
}

#[endpoint]
fn process_results(&self, results: ManagedVec<GameResult>) {
    // Error: missing type parameter for GameResult
}
\`\`\`

### ✅ CORRECT - Always include Self::Api
\`\`\`rust
#[view]
fn get_player_history(&self, player: ManagedAddress) -> MultiValueEncoded<GameResult<Self::Api>> {
    let mut history = MultiValueEncoded::new();
    for result in self.player_results(&player).iter() {
        history.push(result);
    }
    history
}

#[endpoint]
fn process_results(&self, results: ManagedVec<GameResult<Self::Api>>) {
    for result in results.iter() {
        // Process each result
    }
}

#[view]
fn get_last_game(&self) -> OptionalValue<GameResult<Self::Api>> {
    if self.last_game_id().get() > 0 {
        OptionalValue::Some(self.get_game_by_id(self.last_game_id().get()))
    } else {
        OptionalValue::None
    }
}

// Storage mapper must also include type parameter
#[storage_mapper("game_history")]
fn game_history(&self, game_id: u64) -> SingleValueMapper<GameResult<Self::Api>>;

#[storage_mapper("player_games")]
fn player_games(&self, player: &ManagedAddress) -> VecMapper<GameResult<Self::Api>>;
\`\`\`

### Common Places Requiring Type Parameter
1. **Return types**: MultiValueEncoded, OptionalValue, ManagedVec
2. **Function parameters**: Any custom struct parameter
3. **Storage mappers**: SingleValueMapper, VecMapper, SetMapper, etc.
4. **Event parameters**: Event function signatures
5. **Inside other generic types**: ManagedVec<T>, Option<T>, etc.`,
    metadata: {
      title: 'ManagedTypeApi Requirements for Structs',
      description: 'Complete guide on using ManagedTypeApi with custom structs containing managed types',
      tags: ['managed-types', 'structs', 'generics', 'best-practice', 'patterns'],
      language: 'rust',
      relevanceScore: 0.95,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Storage Namespace Organization Pattern
  {
    type: 'best_practice',
    content: `// Storage Namespace Organization with Colon Separator

// Use colon (:) to organize storage by module/purpose for better visualization
// Format: "module:variable" or "namespace:variable"

// ✅ RECOMMENDED - Organized storage with namespaces
#[storage_mapper("pause_module:paused")]
fn paused_status(&self) -> SingleValueMapper<bool>;

#[storage_mapper("token_module:total_supply")]
fn total_supply(&self) -> SingleValueMapper<BigUint>;

#[storage_mapper("user_module:balances")]
fn user_balances(&self, user: &ManagedAddress) -> SingleValueMapper<BigUint>;

#[storage_mapper("governance:proposals")]
fn proposals(&self) -> VecMapper<Proposal>;

#[storage_mapper("staking:rewards_per_share")]
fn rewards_per_share(&self) -> SingleValueMapper<BigUint>;

// Benefits of namespace organization:
// 1. Better code organization and readability
// 2. Easier to identify related storage variables
// 3. Prevents naming conflicts
// 4. Groups functionality logically
// 5. Makes storage inspection tools more useful

// Common namespace patterns:
// - "auth:" for authentication/authorization
// - "token:" for token-related storage
// - "user:" for user data
// - "config:" for configuration
// - "pause_module:" for pausable functionality
// - "governance:" for governance data
// - "staking:" for staking mechanisms`,
    metadata: {
      title: 'Storage Namespace Organization Pattern',
      description:
        'Using colon separator in storage mappers for better organization and visualization',
      tags: ['storage', 'organization', 'namespace', 'best-practice', 'patterns'],
      language: 'rust',
      relevanceScore: 0.9,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // View Endpoint Pattern
  {
    type: 'code_example',
    content: `// View Endpoints for Storage Access

// The #[view] annotation creates read-only endpoints that expose storage values
// Format: #[view(endpointName)]

// Example 1: Simple boolean view
#[view(isPaused)]
#[storage_mapper("pause_module:paused")]
fn paused_status(&self) -> SingleValueMapper<bool>;
// This creates an endpoint 'isPaused' that returns the boolean value

// Example 2: Token information views
#[view(getTotalSupply)]
#[storage_mapper("token:total_supply")]
fn total_supply(&self) -> SingleValueMapper<BigUint>;

#[view(getTokenName)]
#[storage_mapper("token:name")]
fn token_name(&self) -> SingleValueMapper<ManagedBuffer>;

// Example 3: View with parameters
#[view(getUserBalance)]
#[storage_mapper("user:balances")]
fn user_balance(&self, user: &ManagedAddress) -> SingleValueMapper<BigUint>;
// Creates endpoint that accepts a user address and returns their balance

// Example 4: Complex storage views
#[view(getProposalCount)]
#[storage_mapper("governance:proposals")]
fn proposals(&self) -> VecMapper<Proposal>;
// The view will return the length of the VecMapper

// Example 5: Multiple views for same storage
#[view(getConfig)]
#[view(currentSettings)]  // Can have multiple view names
#[storage_mapper("config:settings")]
fn config_settings(&self) -> SingleValueMapper<ConfigStruct>;

// Benefits of view endpoints:
// 1. Automatic read-only endpoint generation
// 2. No gas cost for queries (read-only)
// 3. Consistent naming for frontend integration
// 4. Type-safe data access
// 5. Can be called without transactions`,
    metadata: {
      title: 'View Endpoints for Storage Access',
      description: 'Using #[view] annotation to create read-only endpoints for storage values',
      tags: ['view', 'endpoints', 'storage', 'read-only', 'query'],
      language: 'rust',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Complete Storage Pattern Example
  {
    type: 'code_example',
    content: `// Complete Storage Pattern with Namespace and Views

#[klever_sc::contract]
pub trait TokenContract {
    // Token configuration with views
    #[view(getTokenName)]
    #[storage_mapper("token:name")]
    fn token_name(&self) -> SingleValueMapper<ManagedBuffer>;

    #[view(getTokenSymbol)]
    #[storage_mapper("token:symbol")]
    fn token_symbol(&self) -> SingleValueMapper<ManagedBuffer>;

    #[view(getTotalSupply)]
    #[storage_mapper("token:total_supply")]
    fn total_supply(&self) -> SingleValueMapper<BigUint>;

    // User module storage
    #[view(getBalance)]
    #[storage_mapper("user:balances")]
    fn balances(&self, address: &ManagedAddress) -> SingleValueMapper<BigUint>;

    #[view(getAllowance)]
    #[storage_mapper("user:allowances")]
    fn allowances(&self, owner: &ManagedAddress, spender: &ManagedAddress) -> SingleValueMapper<BigUint>;

    // Pause module
    #[view(isPaused)]
    #[storage_mapper("pause_module:paused")]
    fn paused(&self) -> SingleValueMapper<bool>;

    #[view(getPauseAdmin)]
    #[storage_mapper("pause_module:admin")]
    fn pause_admin(&self) -> SingleValueMapper<ManagedAddress>;

    // Staking module
    #[view(getStakedAmount)]
    #[storage_mapper("staking:user_stakes")]
    fn user_stakes(&self, user: &ManagedAddress) -> SingleValueMapper<BigUint>;

    #[view(getRewardsPerShare)]
    #[storage_mapper("staking:rewards_per_share")]
    fn rewards_per_share(&self) -> SingleValueMapper<BigUint>;

    #[view(getLastRewardBlock)]
    #[storage_mapper("staking:last_reward_block")]
    fn last_reward_block(&self) -> SingleValueMapper<u64>;
}

// Usage in endpoints
#[endpoint(transfer)]
fn transfer(&self, to: ManagedAddress, amount: BigUint) -> SCResult<()> {
    require!(!self.paused().get(), "Contract is paused");

    let caller = self.blockchain().get_caller();
    let balance = self.balances(&caller).get();
    require!(balance >= amount, "Insufficient balance");

    self.balances(&caller).update(|b| *b -= &amount);
    self.balances(&to).update(|b| *b += &amount);

    Ok(())
}`,
    metadata: {
      title: 'Complete Storage Pattern with Namespace and Views',
      description: 'Full example showing organized storage with namespaces and view endpoints',
      tags: ['storage', 'view', 'namespace', 'complete-example', 'pattern'],
      language: 'rust',
      relevanceScore: 1.0,
      contractType: 'token',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Storage Mapper Comparison
  {
    type: 'documentation',
    content: `# Storage Mapper Performance Comparison

## SingleValueMapper vs VecMapper
- **SingleValueMapper<ManagedVec<T>>**: Concatenates all elements under one key
- **VecMapper<T>**: Stores each element under different keys

Use SingleValueMapper when:
- Reading whole array on every use
- Array is expected to be small

Use VecMapper when:
- Only reading parts of the array
- T's top-encoding is more efficient than nested-encoding

## VecMapper vs SetMapper for Whitelists
- **VecMapper**: O(n) lookup, requires iteration
- **SetMapper**: O(1) lookup, uses 3*N+1 storage entries

## Storage Requirements:
- SingleValueMapper: 1 storage entry
- VecMapper: N+1 entries
- SetMapper: 3*N+1 entries
- UnorderedSetMapper: 2*N+1 entries
- LinkedListMapper: 2*N+1 entries
- MapMapper: 4*N+1 entries (most expensive)`,
    metadata: {
      title: 'Storage Mapper Performance Comparison',
      description:
        'Detailed comparison of storage requirements and performance characteristics for different mappers',
      tags: ['storage', 'performance', 'comparison', 'optimization'],
      language: 'rust',
      relevanceScore: 0.85,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Admin Module - Common Mistakes vs Correct Usage
  {
    type: 'best_practice',
    content: `# Admin Module - Common Mistakes vs Correct Usage

## ❌ WRONG APPROACH - Creating Custom Admin Module

\`\`\`rust
// DO NOT CREATE src/admin.rs like this:
use klever_sc::imports::*;

#[klever_sc::module]
pub trait AdminModule {
    #[endpoint(addAdmin)]
    #[only_owner]
    fn add_admin(&self, address: ManagedAddress) {
        self.admin_whitelist().add(&address);
    }

    #[storage_mapper("admin_whitelist")]
    fn admin_whitelist(&self) -> SetMapper<ManagedAddress>;
}
\`\`\`

## ✅ CORRECT APPROACH - Use SDK Built-in Module

\`\`\`rust
// In Cargo.toml:
[dependencies.klever-sc-modules]
version = "0.44.0"

// In your contract file:
use klever_sc_modules::only_admin;

#[klever_sc::contract]
pub trait MyContract: only_admin::OnlyAdminModule {
    // All admin functionality is already provided!
    // No need to create admin.rs
}
\`\`\`

## File Structure Comparison

### ❌ WRONG Structure:
\`\`\`
src/
├── lib.rs
├── admin.rs    ❌ DO NOT CREATE
├── storage.rs
└── ...
\`\`\`

### ✅ CORRECT Structure:
\`\`\`
src/
├── lib.rs      ✅ Use SDK module here
├── storage.rs
└── ...         (No admin.rs needed!)
\`\`\``,
    metadata: {
      title: 'Admin Module - Common Mistakes vs Correct Usage',
      description: 'Clear comparison showing why not to create custom admin modules',
      tags: ['admin', 'module', 'best-practice', 'mistakes', 'sdk'],
      language: 'rust',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Admin Access Control Pattern
  {
    type: 'code_example',
    content: `// Admin Access Control with OnlyAdminModule

// Step 1: Add dependency to Cargo.toml
/*
[dependencies.klever-sc-modules]
version = "0.44.0"
*/

// Step 2: Import the admin module
#[allow(unused_imports)]
use klever_sc::imports::*;
use klever_sc_modules::only_admin;

// Step 3: Extend contract with the module
#[klever_sc::contract]
pub trait MyContract: only_admin::OnlyAdminModule {

    #[init]
    fn init(&self) {
        // Contract owner is automatically added as first admin
        let owner = self.blockchain().get_caller();
        self.admins().insert(owner);
    }

    // Protected endpoint - only admins can call
    #[only_admin]
    #[endpoint(updateConfig)]
    fn update_config(&self, new_value: u64) {
        self.config_value().set(new_value);
    }

    // Another admin-only endpoint
    #[only_admin]
    #[endpoint(pauseContract)]
    fn pause_contract(&self) {
        self.paused().set(true);
    }

    // Inherited from OnlyAdminModule:
    // - addAdmin(address) - only owner can add admins
    // - removeAdmin(address) - only owner can remove admins
    // - isAdmin(address) -> bool - check if address is admin
    // - getAdmins() -> list of admins
    // - admins() -> UnorderedSetMapper<ManagedAddress> storage
    // - require_caller_is_admin() - manual validation method

    #[storage_mapper("config_value")]
    fn config_value(&self) -> SingleValueMapper<u64>;

    #[storage_mapper("paused")]
    fn paused(&self) -> SingleValueMapper<bool>;
}`,
    metadata: {
      title: 'Admin Access Control Pattern',
      description:
        'Using #[only_admin] annotation and OnlyAdminModule for multi-admin access control',
      tags: ['admin', 'access-control', 'security', 'only_admin', 'module'],
      language: 'rust',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // OnlyAdminModule Reference
  {
    type: 'documentation',
    content: `# OnlyAdminModule Reference

The OnlyAdminModule is a built-in Klever SDK module that provides multi-admin access control functionality.

## Setup Steps

### 1. Add Dependency to Cargo.toml
\`\`\`toml
[dependencies.klever-sc-modules]
version = "0.44.0"
\`\`\`

### 2. Import the Module
\`\`\`rust
use klever_sc_modules::only_admin;
\`\`\`

### 3. Extend Your Contract
\`\`\`rust
#[klever_sc::contract]
pub trait MyContract: only_admin::OnlyAdminModule {
    // Your contract code
}
\`\`\`

## Module Implementation
\`\`\`rust
use klever_sc::imports::*;

#[klever_sc::module]
pub trait OnlyAdminModule {
    #[view(isAdmin)]
    fn is_admin(&self, address: ManagedAddress) -> bool {
        self.admins().contains(&address)
    }

    #[only_owner]
    #[endpoint(addAdmin)]
    fn add_admin(&self, address: ManagedAddress) {
        self.admins().insert(address.clone());
        self.admin_added_event(&address);
    }

    #[only_owner]
    #[endpoint(removeAdmin)]
    fn remove_admin(&self, address: ManagedAddress) {
        self.admins().swap_remove(&address);
        self.admin_removed_event(&address);
    }

    #[view(getAdmins)]
    #[storage_mapper("only_admin_module:admins")]
    fn admins(&self) -> UnorderedSetMapper<ManagedAddress>;

    fn require_caller_is_admin(&self) {
        require!(
            self.is_admin(self.blockchain().get_caller()),
            "Endpoint can only be called by admins"
        );
    }

    // Events
    #[event("adminAdded")]
    fn admin_added_event(&self, #[indexed] admin: &ManagedAddress);

    #[event("adminRemoved")]
    fn admin_removed_event(&self, #[indexed] admin: &ManagedAddress);
}
\`\`\`

## Key Features:
1. **Multi-admin support**: Multiple addresses can be admins
2. **Owner-controlled**: Only contract owner can add/remove admins
3. **View functions**: Check admin status and list all admins
4. **Storage namespace**: Uses "only_admin_module:admins" for storage
5. **Manual validation**: \`require_caller_is_admin()\` for custom checks

## Inherited Functions:
- \`isAdmin(address)\` - View endpoint to check if address is admin
- \`addAdmin(address)\` - Owner-only endpoint to add admin
- \`removeAdmin(address)\` - Owner-only endpoint to remove admin
- \`getAdmins()\` - View endpoint to list all admins
- \`admins()\` - Storage mapper for admin set
- \`require_caller_is_admin()\` - Method for manual validation

## Usage with #[only_admin]:
Once the module is included, you can use the \`#[only_admin]\` annotation on any endpoint to restrict access to admins only.`,
    metadata: {
      title: 'OnlyAdminModule Reference Documentation',
      description: 'Complete reference for the built-in OnlyAdminModule for admin access control',
      tags: ['admin', 'module', 'reference', 'only_admin', 'documentation'],
      language: 'rust',
      relevanceScore: 0.9,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // IMPORTANT: Do NOT Create Custom Admin Module
  {
    type: 'security_tip',
    content: `# IMPORTANT: Do NOT Create Custom Admin Module

## ⚠️ Common Mistake to Avoid
**NEVER create your own admin.rs module!** The Klever SDK already provides a complete admin module.

## ❌ WRONG - Do NOT do this:
\`\`\`rust
// src/admin.rs - DO NOT CREATE THIS FILE!
#[klever_sc::module]
pub trait AdminModule {
    // Custom admin implementation - WRONG!
}
\`\`\`

## ✅ CORRECT - Use the SDK module:
\`\`\`rust
// In your main contract file
use klever_sc_modules::only_admin;

#[klever_sc::contract]
pub trait MyContract: only_admin::OnlyAdminModule {
    // Use the built-in admin functionality
}
\`\`\`

## Why Not Create Custom?
1. The SDK module is tested and secure
2. It follows best practices
3. It's maintained by the Klever team
4. Creating custom modules can introduce security vulnerabilities
5. The SDK module has all features you need`,
    metadata: {
      title: 'IMPORTANT: Do NOT Create Custom Admin Module',
      description: 'Critical warning about not creating custom admin modules when SDK provides one',
      tags: ['admin', 'security', 'warning', 'best-practice', 'module', 'sdk'],
      language: 'rust',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Klever VM SDK Built-in Admin Module
  {
    type: 'documentation',
    content: `# Klever VM SDK Built-in Admin Module

## Overview
Klever VM SDK provides a pre-built admin module in the \`klever-sc-modules\` crate that handles administrative functions out of the box.

## Setup and Usage

### 1. Add Dependency to Cargo.toml
\`\`\`toml
[dependencies.klever-sc-modules]
version = "0.44.0"
\`\`\`

### 2. Import the Module
\`\`\`rust
use klever_sc_modules::only_admin;
\`\`\`

### 3. Add to Contract Trait
\`\`\`rust
#[klever_sc::contract]
pub trait MyContract:
    only_admin::OnlyAdminModule
    + other_modules::OtherModule
{
    // Your contract implementation
}
\`\`\`

### 4. Available Functions (provided by the SDK)
- \`addAdmin(address)\` - Add new admin (owner only)
- \`removeAdmin(address)\` - Remove admin (owner only)
- \`isAdmin(address)\` - Check if address is admin
- \`getAdmins()\` - Get list of all admins
- \`require_caller_is_admin()\` - Manual admin check
- \`#[only_admin]\` - Annotation for automatic admin checks

### 5. Complete Example
\`\`\`rust
#![no_std]

#[allow(unused_imports)]
use klever_sc::imports::*;
use klever_sc_modules::only_admin;

#[klever_sc::contract]
pub trait KleverLabsHub:
    only_admin::OnlyAdminModule
    + storage::StorageModule
{
    #[init]
    fn init(&self) {
        // Owner is automatically first admin
        let owner = self.blockchain().get_caller();
        self.admins().insert(owner);
    }

    // Using annotation for automatic check
    #[only_admin]
    #[endpoint(updateOracle)]
    fn update_oracle(&self, new_oracle: ManagedAddress) {
        self.oracle_address().set(&new_oracle);
    }

    // Using manual check for custom logic
    #[endpoint(complexUpdate)]
    fn complex_update(&self, value: BigUint) {
        self.require_caller_is_admin(); // Built-in admin check
        // Custom logic here
    }

    #[storage_mapper("oracle_address")]
    fn oracle_address(&self) -> SingleValueMapper<ManagedAddress>;
}
\`\`\`

## Important Notes
- **DO NOT** create your own admin module when using SDK
- The module is in \`klever-sc-modules\` crate, not in your project
- The module name is \`only_admin\`, not just \`admin\`
- Always initialize the admin list in your \`init\` function
- The \`#[only_admin]\` annotation only works after including the module`,
    metadata: {
      title: 'Klever VM SDK Built-in Admin Module',
      description: 'Complete guide for using the pre-built admin module from klever-sc-modules',
      tags: ['admin', 'module', 'sdk', 'klever-sc-modules', 'only_admin', 'built-in'],
      language: 'rust',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Access Control Comparison
  {
    type: 'best_practice',
    content: `// Access Control Patterns Comparison

// 1. Owner-only access (single owner)
#[only_owner]
#[endpoint(ownerOnlyFunction)]
fn owner_only_function(&self) {
    // Only the contract owner can call this
}

// 2. Admin access (multiple admins)
use klever_sc_modules::only_admin;

#[only_admin]
#[endpoint(adminOnlyFunction)]
fn admin_only_function(&self) {
    // Any admin can call this
}

// 3. Custom role-based access
#[endpoint(customRoleFunction)]
fn custom_role_function(&self) {
    let caller = self.blockchain().get_caller();
    require!(
        self.has_role(&caller, &Role::Manager),
        "Only managers can call this"
    );
}

// 4. Combined access patterns
#[endpoint(complexAccess)]
fn complex_access(&self) {
    let caller = self.blockchain().get_caller();

    // Owner OR admin can proceed
    require!(
        caller == self.blockchain().get_owner() || self.is_admin(caller),
        "Only owner or admin can call"
    );
}

// Best Practices:
// - Use #[only_owner] for critical one-time setup or emergency functions
// - Use #[only_admin] for routine administrative tasks
// - Implement custom roles for complex permission systems
// - Always emit events for access control changes
// - Consider time-locks for critical admin actions`,
    metadata: {
      title: 'Access Control Patterns Comparison',
      description:
        'Comparison of different access control patterns: owner, admin, and custom roles',
      tags: ['access-control', 'security', 'only_owner', 'only_admin', 'best-practice'],
      language: 'rust',
      relevanceScore: 0.9,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // PauseModule Pattern
  {
    type: 'code_example',
    content: `// Contract Pausability with PauseModule

// Step 1: Add dependency to Cargo.toml
/*
[dependencies.klever-sc-modules]
version = "0.44.0"
*/

// Step 2: Import the pause module
#[allow(unused_imports)]
use klever_sc::imports::*;
use klever_sc_modules::pause;

// Step 3: Extend contract with the module
#[klever_sc::contract]
pub trait MyContract: pause::PauseModule {

    #[init]
    fn init(&self) {
        // Contract starts unpaused by default
        self.set_paused(false);
    }

    // Regular endpoint that checks pause status
    #[endpoint(transfer)]
    fn transfer(&self, to: ManagedAddress, amount: BigUint) {
        // Require contract is not paused
        self.require_not_paused();

        // Transfer logic here
        self.send().direct_klv(&to, &amount);
    }

    // Critical function that works even when paused
    #[only_owner]
    #[endpoint(emergencyWithdraw)]
    fn emergency_withdraw(&self) {
        // This can work even if paused (no pause check)
        let owner = self.blockchain().get_owner();
        let balance = self.blockchain().get_sc_balance(&TokenIdentifier::klv(), 0);
        self.send().direct_klv(&owner, &balance);
    }

    // Inherited from PauseModule:
    // - pause() - owner can pause contract
    // - unpause() - owner can unpause contract
    // - isPaused() -> bool - check pause status

    // Manual pause checks available:
    // - self.is_paused() -> bool
    // - self.not_paused() -> bool
    // - self.require_paused()
    // - self.require_not_paused()
}`,
    metadata: {
      title: 'Contract Pausability Pattern',
      description: 'Using PauseModule for emergency pause functionality in smart contracts',
      tags: ['pause', 'security', 'module', 'emergency', 'pausable'],
      language: 'rust',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // PauseModule Reference
  {
    type: 'documentation',
    content: `# PauseModule Reference

The PauseModule is a built-in Klever SDK module that provides contract pausability functionality.

## Setup Steps

### 1. Add Dependency to Cargo.toml
\`\`\`toml
[dependencies.klever-sc-modules]
version = "0.44.0"
\`\`\`

### 2. Import the Module
\`\`\`rust
use klever_sc_modules::pause;
\`\`\`

### 3. Extend Your Contract
\`\`\`rust
#[klever_sc::contract]
pub trait MyContract: pause::PauseModule {
    // Your contract code
}
\`\`\`

## Module Trait
\`\`\`rust
#[klever_sc::module]
pub trait PauseModule {
    #[inline]
    fn is_paused(&self) -> bool {
        self.paused_status().get()
    }

    #[inline]
    fn not_paused(&self) -> bool {
        !self.is_paused()
    }

    #[inline]
    fn set_paused(&self, paused: bool) {
        self.paused_status().set(paused);
    }

    #[only_owner]
    #[endpoint(pause)]
    fn pause_endpoint(&self) {
        self.set_paused(true);
    }

    #[only_owner]
    #[endpoint(unpause)]
    fn unpause_endpoint(&self) {
        self.set_paused(false);
    }

    fn require_paused(&self) {
        require!(self.is_paused(), "Contract is not paused");
    }

    fn require_not_paused(&self) {
        require!(self.not_paused(), "Contract is paused");
    }

    #[view(isPaused)]
    #[storage_mapper("pause_module:paused")]
    fn paused_status(&self) -> SingleValueMapper<bool>;
}
\`\`\`

## Key Features:
1. **Owner-controlled**: Only contract owner can pause/unpause
2. **Global pause**: Affects entire contract (use features module for granular control)
3. **View function**: \`isPaused()\` endpoint to check status
4. **Helper methods**: Multiple ways to check and enforce pause status
5. **Storage namespace**: Uses "pause_module:paused" for storage

## Usage Patterns:
- Call \`self.require_not_paused()\` at the start of sensitive endpoints
- Emergency functions can skip pause checks
- Combine with circuit breaker patterns for automatic pausing
- Always emit events (currently TODO in module)`,
    metadata: {
      title: 'PauseModule Reference Documentation',
      description: 'Complete reference for the built-in PauseModule for contract pausability',
      tags: ['pause', 'module', 'reference', 'documentation', 'security'],
      language: 'rust',
      relevanceScore: 0.9,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Pausable Contract Best Practices
  {
    type: 'best_practice',
    content: `// Pausable Contract Best Practices

use klever_sc_modules::pause;

#[klever_sc::contract]
pub trait SecureContract: pause::PauseModule {

    // 1. Check pause status in public endpoints
    #[endpoint(deposit)]
    fn deposit(&self) {
        self.require_not_paused();
        // Deposit logic
    }

    // 2. Allow withdrawals even when paused (user protection)
    #[endpoint(withdraw)]
    fn withdraw(&self, amount: BigUint) {
        // NOTE: No pause check - users can always withdraw
        let caller = self.blockchain().get_caller();
        let balance = self.user_balance(&caller).get();
        require!(balance >= amount, "Insufficient balance");

        self.user_balance(&caller).update(|b| *b -= &amount);
        self.send().direct_klv(&caller, &amount);
    }

    // 3. Combine with admin module for better control
    use klever_sc_modules::only_admin;

    #[only_admin]
    #[endpoint(adminPause)]
    fn admin_pause(&self) {
        self.set_paused(true);
        // Log who paused it
        self.pause_admin().set(self.blockchain().get_caller());
    }

    // 4. Auto-pause on critical events
    #[endpoint(reportIssue)]
    fn report_issue(&self, issue_type: u8) {
        if issue_type == CRITICAL_ISSUE {
            self.set_paused(true);
            // Emit event
        }
    }

    // 5. Time-based auto-unpause
    #[endpoint(pauseFor)]
    #[only_owner]
    fn pause_for_duration(&self, seconds: u64) {
        self.set_paused(true);
        let unpause_time = self.blockchain().get_block_timestamp() + seconds;
        self.auto_unpause_time().set(unpause_time);
    }

    #[endpoint(checkAutoUnpause)]
    fn check_auto_unpause(&self) {
        if !self.auto_unpause_time().is_empty() {
            let current_time = self.blockchain().get_block_timestamp();
            let unpause_time = self.auto_unpause_time().get();

            if current_time >= unpause_time {
                self.set_paused(false);
                self.auto_unpause_time().clear();
            }
        }
    }

    #[storage_mapper("pause_admin")]
    fn pause_admin(&self) -> SingleValueMapper<ManagedAddress>;

    #[storage_mapper("auto_unpause_time")]
    fn auto_unpause_time(&self) -> SingleValueMapper<u64>;

    #[storage_mapper("user_balance")]
    fn user_balance(&self, user: &ManagedAddress) -> SingleValueMapper<BigUint>;
}

// Best Practices Summary:
// 1. Always allow users to withdraw their funds
// 2. Consider auto-pause on anomalies
// 3. Log pause/unpause events with actor info
// 4. Implement time-based pausing
// 5. Combine with circuit breaker patterns
// 6. Document which functions work when paused`,
    metadata: {
      title: 'Pausable Contract Best Practices',
      description: 'Advanced patterns and best practices for implementing pausable smart contracts',
      tags: ['pause', 'best-practice', 'security', 'patterns', 'emergency'],
      language: 'rust',
      relevanceScore: 0.9,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Klever Token System
  {
    type: 'documentation',
    content: `# Klever Token System Overview

## Native Tokens

### KLV - Main Blockchain Token
- Token Identifier: \`KLV\`
- **Decimals: 6**
- Purpose: Transaction fees (gas)
- The main token of the Klever blockchain
- Similar to ETH on Ethereum
- 1 KLV = 1,000,000 smallest units

### KFI - Governance Token
- Token Identifier: \`KFI\`
- **Decimals: 6**
- Purpose: Governance and voting
- Used for participating in blockchain governance
- 1 KFI = 1,000,000 smallest units

### Important: Decimal Places
Both KLV and KFI use 6 decimal places. This means:
- To send 1 KLV, you need to specify 1000000 (1 * 10^6)
- To send 0.5 KLV, you need to specify 500000 (0.5 * 10^6)
- To send 100 KLV, you need to specify 100000000 (100 * 10^6)

Example conversions:
- 1 KLV = 1,000,000 units
- 10 KLV = 10,000,000 units
- 0.001 KLV = 1,000 units
- 0.000001 KLV = 1 unit (smallest possible)

## KDA - Klever Digital Assets

All other tokens on Klever are called KDA (Klever Digital Assets).

### KDA Identifier Format
\`\`\`
TICKER-XXXX
\`\`\`
- TICKER: The token symbol (e.g., USDT, BTC, MyToken)
- XXXX: 4-character randomly generated suffix
- Example: \`USDT-A1B2\`, \`BTC-F3E4\`, \`MYTOKEN-9Z8Y\`

### Three Types of KDA

#### 1. Fungible Tokens
- Standard tokens (equivalent to ERC-20)
- Each unit is identical and interchangeable
- Examples: \`USDT-A1B2\`, \`WBTC-C3D4\`

#### 2. Non-Fungible Tokens (NFTs)
- Unique digital assets (similar to ERC-721/ERC-1155)
- Each token has unique properties
- Format: \`TICKER-XXXX/INDEX\`
- Examples:
  - \`MYNFT-E5F6/1\` (first NFT in collection)
  - \`MYNFT-E5F6/2\` (second NFT in collection)
  - \`ART-G7H8/100\` (NFT #100 in ART collection)

#### 3. Semi-Fungible Tokens (SFTs)
- Hybrid between fungible and non-fungible
- Collection with metadata for each item (NFT aspect)
- But items within same ID are fungible
- Format: \`TICKER-XXXX/INDEX\`
- Useful for game items, tickets, etc.
- Examples:
  - \`GAME-I9J0/1\` (SFT type 1 in GAME collection)
  - \`TICKET-K1L2/5\` (ticket type 5)
  - \`ITEM-M3N4/10\` (item type 10)

## Usage in Smart Contracts

\`\`\`rust
// Check for native tokens
if token_id == TokenIdentifier::from("KLV") {
    // Handle KLV payment
} else if token_id == TokenIdentifier::from("KFI") {
    // Handle KFI payment
} else {
    // Handle KDA tokens
    // Format: TICKER-XXXX
}

// Working with specific KDA
let usdt_token = TokenIdentifier::from("USDT-A1B2");

// NFTs and SFTs use index notation
let my_nft = TokenIdentifier::from("MYNFT-E5F6");
let nft_index = 1u64; // First NFT in collection
// Full identifier: MYNFT-E5F6/1

let my_sft = TokenIdentifier::from("GAME-I9J0");
let sft_type = 5u64; // SFT type 5
// Full identifier: GAME-I9J0/5
\`\`\``,
    metadata: {
      title: 'Klever Token System Overview',
      description: 'Understanding KLV, KFI, and KDA token types on Klever blockchain',
      tags: ['tokens', 'klv', 'kfi', 'kda', 'fungible', 'nft', 'sft', 'documentation'],
      language: 'rust',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // NFT and SFT Indexing
  {
    type: 'documentation',
    content: `# NFT and SFT Indexing in Klever

## Index Notation

NFTs and SFTs in Klever use an index notation to identify specific items within a collection.

### Format: TICKER-XXXX/INDEX

- **TICKER-XXXX**: The collection identifier (e.g., MYNFT-E5F6)
- **/INDEX**: The specific item number within the collection

### NFT Examples
- \`MYNFT-E5F6/1\` - First NFT in the MYNFT-E5F6 collection
- \`MYNFT-E5F6/2\` - Second NFT in the collection
- \`MYNFT-E5F6/1000\` - NFT #1000 in the collection

### SFT Examples
- \`GAME-I9J0/1\` - SFT type 1 (e.g., "Bronze Sword")
- \`GAME-I9J0/2\` - SFT type 2 (e.g., "Silver Sword")
- \`TICKET-K1L2/1\` - Ticket type 1 (e.g., "General Admission")
- \`TICKET-K1L2/2\` - Ticket type 2 (e.g., "VIP")

## Important Notes

1. **Token Identifier vs Index**: In smart contracts, these are handled separately:
   - Token Identifier: \`MYNFT-E5F6\` (without the index)
   - Index/Nonce: \`1\`, \`2\`, \`1000\`, etc. (the number after /)

2. **NFT Uniqueness**: Each NFT index is unique - only one NFT can have index 1

3. **SFT Fungibility**: Multiple SFTs can share the same index
   - 100 units of \`GAME-I9J0/1\` can exist
   - Each unit of type 1 is identical

## Usage in Code

\`\`\`rust
// NFT: MYNFT-E5F6/42
let nft_collection = TokenIdentifier::from("MYNFT-E5F6");
let nft_index = 42u64;

// SFT: GAME-I9J0/5 (100 units)
let sft_collection = TokenIdentifier::from("GAME-I9J0");
let sft_type = 5u64;
let sft_amount = BigUint::from(100u32);
\`\`\``,
    metadata: {
      title: 'NFT and SFT Indexing in Klever',
      description: 'Understanding the index notation for NFTs and SFTs in Klever blockchain',
      tags: ['nft', 'sft', 'index', 'tokens', 'collection', 'documentation'],
      language: 'rust',
      relevanceScore: 0.95,
      contractType: 'nft',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Token Handling Examples
  {
    type: 'code_example',
    content: `// Token Handling in Klever Smart Contracts

#[allow(unused_imports)]
use klever_sc::imports::*;

#[klever_sc::contract]
pub trait TokenContract {

    // Accept any token payment
    #[payable("*")]
    #[endpoint(deposit)]
    fn deposit(&self) {
        let payment = self.call_value().any_payment();
        let token_id = payment.token_identifier;
        let amount = payment.amount;

        if token_id == TokenIdentifier::from("KLV") {
            // Handle KLV deposit
            self.klv_deposits(&self.blockchain().get_caller())
                .update(|balance| *balance += amount);
        } else if token_id == TokenIdentifier::from("KFI") {
            // Handle KFI deposit
            self.kfi_deposits(&self.blockchain().get_caller())
                .update(|balance| *balance += amount);
        } else {
            // Handle KDA tokens (format: TICKER-XXXX)
            self.kda_deposits(&self.blockchain().get_caller(), &token_id)
                .update(|balance| *balance += amount);
        }
    }

    // Accept only specific KDA token
    #[payable("USDT-A1B2")]
    #[endpoint(depositUsdt)]
    fn deposit_usdt(&self) {
        let payment = self.call_value().kda_payment();
        // Payment is guaranteed to be USDT-A1B2
    }

    // Working with NFTs
    #[endpoint(transferNft)]
    fn transfer_nft(&self, nft_id: TokenIdentifier, nft_index: u64, to: ManagedAddress) {
        // NFT format: MYNFT-E5F6 with index (e.g., MYNFT-E5F6/1)
        require!(
            self.is_valid_nft(&nft_id),
            "Invalid NFT identifier"
        );

        // The nft_index represents the /INDEX part
        // Full identifier would be MYNFT-E5F6/1 for nft_index = 1
        self.send().direct_kda(
            &to,
            &nft_id,
            nft_index,  // This is the index after the /
            &BigUint::from(1u32)
        );
    }

    // Working with SFTs
    #[endpoint(transferSft)]
    fn transfer_sft(&self, sft_id: TokenIdentifier, sft_type: u64, amount: BigUint, to: ManagedAddress) {
        // SFT format: GAME-I9J0 with type index (e.g., GAME-I9J0/5)
        // sft_type is the index that identifies the specific SFT type
        self.send().direct_kda(
            &to,
            &sft_id,
            sft_type,  // This is the index after the /
            &amount     // SFTs can have amounts > 1
        );
    }

    // Check token type
    fn is_valid_nft(&self, token_id: &TokenIdentifier) -> bool {
        // Check if token follows KDA format (TICKER-XXXX)
        let token_str = token_id.as_managed_buffer();
        token_str.len() > 5 && token_str.try_get(token_str.len() - 5) == b'-'
    }

    // Storage for different token types
    #[storage_mapper("klv_deposits")]
    fn klv_deposits(&self, user: &ManagedAddress) -> SingleValueMapper<BigUint>;

    #[storage_mapper("kfi_deposits")]
    fn kfi_deposits(&self, user: &ManagedAddress) -> SingleValueMapper<BigUint>;

    #[storage_mapper("kda_deposits")]
    fn kda_deposits(&self, user: &ManagedAddress, token: &TokenIdentifier) -> SingleValueMapper<BigUint>;
}`,
    metadata: {
      title: 'Token Handling Examples in Klever',
      description: 'Code examples for handling KLV, KFI, and KDA tokens in smart contracts',
      tags: ['tokens', 'klv', 'kfi', 'kda', 'payable', 'code-example'],
      language: 'rust',
      relevanceScore: 0.95,
      contractType: 'token',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Common API Functions
  {
    type: 'documentation',
    content: `# Klever VM Common API Functions

## BlockchainApi
- \`self.blockchain().get_caller()\`: Get the caller's address
- \`self.blockchain().get_current_kda_nft_nonce()\`: Get current NFT nonce
- \`self.blockchain().get_block_timestamp()\`: Get current block timestamp
- \`self.blockchain().get_block_nonce()\`: Get current block nonce
- \`self.blockchain().get_block_epoch()\`: Get current epoch

## CallValueApi
- \`self.call_value().klv_value()\`: Get KLV payment value
- \`self.call_value().kda_value()\`: Get KDA payment value
- \`self.call_value().token()\`: Get token identifier
- \`self.call_value().klv_or_kda_payment()\`: Get payment details

## CryptoApi
- \`self.crypto().sha256()\`: Compute SHA-256 hash
- \`self.crypto().keccak256()\`: Compute Keccak-256 hash
- \`self.crypto().verify_signature()\`: Verify cryptographic signature

## SendApi
- \`self.send().direct_klv()\`: Send KLV directly
- \`self.send().direct_kda()\`: Send KDA tokens (including NFTs/SFTs with nonce)
- \`self.send().direct_payment()\`: Send KdaTokenPayment structure`,
    metadata: {
      title: 'Klever VM API Reference',
      description: 'Common API functions available in Klever smart contracts',
      tags: ['api', 'reference', 'blockchain', 'crypto', 'send'],
      language: 'rust',
      relevanceScore: 0.8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Working with KLV/KFI Decimals
  {
    type: 'code_example',
    content: `# Working with KLV/KFI Decimals (6 decimal places)

## Understanding KLV/KFI Amounts

Both KLV and KFI use 6 decimal places, so all amounts in smart contracts are in the smallest unit.

### Conversion Examples
\`\`\`rust
// 1 KLV = 1,000,000 units
let one_klv = BigUint::from(1_000_000u32);

// 10 KLV = 10,000,000 units
let ten_klv = BigUint::from(10_000_000u32);

// 0.5 KLV = 500,000 units
let half_klv = BigUint::from(500_000u32);

// 0.001 KLV = 1,000 units
let one_milliKLV = BigUint::from(1_000u32);

// 100 KLV = 100,000,000 units
let hundred_klv = BigUint::from(100_000_000u64);

// For very large amounts, use u64 or u128
let thousand_klv = BigUint::from(1_000_000_000u64); // 1000 KLV
let million_klv = BigUint::from(1_000_000_000_000u128); // 1,000,000 KLV
\`\`\`

### Practical Examples in Smart Contracts

\`\`\`rust
#[klever_sc::contract]
pub trait TokenContract {
    // Constant for decimal conversion
    const DECIMALS: u64 = 1_000_000; // 10^6 for 6 decimals

    #[payable("KLV")]
    #[endpoint]
    fn deposit(&self) {
        let payment = self.call_value().klv_value();
        let caller = self.blockchain().get_caller();

        // Check minimum deposit of 1 KLV
        require!(payment >= BigUint::from(Self::DECIMALS), "Minimum deposit is 1 KLV");

        // Store the deposit
        self.user_balance(&caller).update(|balance| *balance += payment);

        // Event showing both raw and human-readable amounts
        let klv_amount = &payment / Self::DECIMALS; // Integer division for display
        self.deposit_event(&caller, &payment, klv_amount.to_u64().unwrap_or(0));
    }

    #[endpoint]
    fn withdraw_klv(&self, klv_amount: u64) {
        let caller = self.blockchain().get_caller();

        // Convert KLV amount to smallest units
        let amount_in_units = BigUint::from(klv_amount) * Self::DECIMALS;

        // Check balance
        let balance = self.user_balance(&caller).get();
        require!(balance >= amount_in_units, "Insufficient balance");

        // Update balance and send
        self.user_balance(&caller).update(|b| *b -= &amount_in_units);
        self.send().direct_klv(&caller, &amount_in_units);
    }

    // Helper function to convert units to KLV
    #[view]
    fn units_to_klv(&self, units: BigUint) -> u64 {
        (&units / Self::DECIMALS).to_u64().unwrap_or(0)
    }

    // Helper function to convert KLV to units
    #[view]
    fn klv_to_units(&self, klv: u64) -> BigUint {
        BigUint::from(klv) * Self::DECIMALS
    }

    // Storage
    #[storage_mapper("user_balance")]
    fn user_balance(&self, user: &ManagedAddress) -> SingleValueMapper<BigUint>;

    // Events
    #[event("deposit")]
    fn deposit_event(
        &self,
        #[indexed] user: &ManagedAddress,
        #[indexed] amount_units: &BigUint,
        #[indexed] amount_klv: u64
    );
}
\`\`\`

### Common Patterns for Minimum/Maximum Amounts

\`\`\`rust
// Define constants for common amounts
const MIN_BET: u64 = 10_000_000;      // 10 KLV
const MAX_BET: u64 = 1_000_000_000;   // 1000 KLV
const HOUSE_FEE: u64 = 100_000;       // 0.1 KLV

#[endpoint]
fn place_bet(&self, bet_number: u8) {
    let bet_amount = self.call_value().klv_value();

    // Validate bet amount
    require!(
        bet_amount >= BigUint::from(MIN_BET),
        "Minimum bet is 10 KLV"
    );
    require!(
        bet_amount <= BigUint::from(MAX_BET),
        "Maximum bet is 1000 KLV"
    );

    // Deduct house fee
    let fee = BigUint::from(HOUSE_FEE);
    let net_bet = &bet_amount - &fee;

    // Process bet...
}
\`\`\`

### Working with KFI (Same 6 Decimals)

\`\`\`rust
// KFI uses the same 6 decimal places as KLV
const KFI_DECIMALS: u64 = 1_000_000;

#[payable("KFI")]
#[endpoint]
fn stake_kfi(&self) {
    let kfi_amount = self.call_value().kda_value().amount;

    // Minimum stake of 100 KFI
    let min_stake = BigUint::from(100u32) * KFI_DECIMALS;
    require!(kfi_amount >= min_stake, "Minimum stake is 100 KFI");

    // Process staking...
}
\`\`\`

## Important Notes

1. **Always use smallest units** in smart contracts (1 KLV = 1,000,000 units)
2. **Be careful with divisions** - integer division loses precision
3. **Use constants** for decimal conversions to avoid errors
4. **Validate minimum amounts** to prevent dust transactions
5. **Both KLV and KFI** have 6 decimal places
6. **Other KDA tokens** may have different decimal places - always check`,
    metadata: {
      title: 'Working with KLV/KFI Decimals',
      description: 'Complete guide for handling KLV and KFI amounts with 6 decimal places',
      tags: ['klv', 'kfi', 'decimals', 'amounts', 'conversion', 'code-example'],
      language: 'rust',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // KDA Token Payment Pattern
  {
    type: 'code_example',
    content: `# Using KdaTokenPayment for Token Transfers

## KdaTokenPayment Structure




\`KdaTokenPayment\` is imported automatically with \`use klever_sc::imports::*;\` and represents any token payment (KLV, KDA, NFT, or SFT).

\`\`\`rust
// Structure (for reference - already imported, no need to define):
// pub struct KdaTokenPayment<M: ManagedTypeApi> {
//     pub token_identifier: TokenIdentifier<M>,
//     pub token_nonce: u64,  // 0 for fungible tokens, >0 for NFTs/SFTs
//     pub amount: BigUint<M>,
// }
\`\`\`



### VERY IMPORTANT !!!!!!:
- **1 KLV = 1_000_000 (1e6) smallest units**
- **1 KFI = 1_000_000 (1e6) smallest units**
- Always use \`ManagedRef<BigUint>\` values in contracts (smallest units)
- Convert to human-readable amounts by dividing by 1_000_000
### Example Conversions:
\`\`\`rust
// Converting from KLV/KFI to contract units
const ONE_KLV: u64 = 1_000_000;        // 1 KLV
const HALF_KLV: u64 = 500_000;         // 0.5 KLV
const TEN_KLV: u64 = 10_000_000;       // 10 KLV
const HUNDRED_KLV: u64 = 100_000_000;  // 100 KLV
// In contract functions
#[payable("KLV")]
#[endpoint(deposit)]
fn deposit(&self) {
    let amount = self.call_value().klv_value();
    // amount is already multiplied by 1_000_000
}
\`\`\`
---

## Usage Examples

### Direct Payment Function
\`\`\`rust
#[endpoint]
fn send_payment(&self, recipient: ManagedAddress, payment: KdaTokenPayment<Self::Api>) {
    // Validate payment
    require!(payment.amount > 0, "Amount must be positive");

    // Send using direct_payment
    self.send().direct_payment(&recipient, &payment);

    // Log the transfer
    self.payment_sent_event(&recipient, &payment);
}
\`\`\`

### Creating KdaTokenPayment
\`\`\`rust

// For KLV
let klv_payment = KdaTokenPayment::new(
    TokenIdentifier::klv(),
    0,
    BigUint::from(1000u32)
);

// For KDA token (using byte slice)
let kda_payment = KdaTokenPayment::new(
    TokenIdentifier::from(&b"DVK-34ZH"[..]),
    0u64,
    BigUint::from(500u128)
);

// For NFT
let nft_payment = KdaTokenPayment::new(
    TokenIdentifier::from(&b"MYNFT-5678"[..]),
    42u64,  // The specific NFT index
    BigUint::from(1u32)  // NFTs always have amount 1
);

// For SFT
let sft_payment = KdaTokenPayment::new(
    TokenIdentifier::from(&b"MYSFT-9ABC"[..]),
    5u64,   // The SFT type index
    BigUint::from(100u32)  // SFTs can have amounts > 1
);

// Using variables
let fee_value = BigUint::from(50u32);
let fee_payment = KdaTokenPayment::new(
    TokenIdentifier::klv(),
    0,
    fee_value
);
\`\`\`

### Getting Payment from Call Value
\`\`\`rust
#[endpoint]
#[payable("*")]
fn receive_and_forward(&self, recipient: ManagedAddress) {
    // Get the payment sent to this endpoint
    let payment = self.call_value().kda_payment();

    // Forward it to another address
    self.send().direct_payment(&recipient, &payment);
}
\`\`\`

### Alternative Direct Transfer Methods
\`\`\`rust
// These are equivalent:

// Using direct_payment
self.send().direct_payment(&recipient, &payment);

// Using direct_kda (same result)
self.send().direct_kda(
    &recipient,
    &payment.token_identifier,
    payment.token_nonce,
    &payment.amount
);
\`\`\`

### Complete Example: Creating and Sending Payment
\`\`\`rust
#[endpoint]
fn send_fee(&self, recipient: ManagedAddress, fee_amount: BigUint) {
    // Create payment
    let payment = KdaTokenPayment::new(
        TokenIdentifier::klv(),
        0,
        fee_amount
    );

    // Send it
    self.send().direct_payment(&recipient, &payment);

    // Or create and send in one operation
    self.send().direct_kda(
        &recipient,
        &TokenIdentifier::from(&b"BTC-F3E4"[..]),
        0u64,
        &BigUint::from(100u32)
    );
}
\`\`\``,
    metadata: {
      title: 'KdaTokenPayment Structure and Usage',
      description: 'How to use KdaTokenPayment for handling all token types in Klever',
      tags: ['payment', 'tokens', 'transfer', 'kda', 'nft', 'sft'],
      language: 'rust',
      relevanceScore: 0.9,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Testing Pattern
  {
    type: 'code_example',
    content: `use klever_sc_scenario::*;

// Scenario test setup
fn world() -> ScenarioWorld {
    let mut blockchain = ScenarioWorld::new();
    blockchain.register_contract(
        "kleversc:output/adder.kleversc.json",
        adder::ContractBuilder,
    );
    blockchain
}

#[test]
fn adder_rs() {
    world().run("scenarios/adder.scen.json");
}

// Unit test example
#[test]
fn test_my_function() {
    let rust_zero = rust_biguint!(0u64);
    let mut blockchain_wrapper = BlockchainStateWrapper::new();
    let owner_address = blockchain_wrapper.create_user_account(&rust_zero);

    let contract_wrapper = blockchain_wrapper.create_sc_account(
        &rust_zero,
        Some(&owner_address),
        contract_obj,
        WASM_PATH
    );

    // Execute init function
    blockchain_wrapper.execute_tx(
        &owner_address,
        &contract_wrapper,
        &rust_zero,
        |sc| {
            sc.init();
        }
    ).assert_ok();

    // Test the function
    blockchain_wrapper.execute_tx(
        &owner_address,
        &contract_wrapper,
        &rust_zero,
        |sc| {
            // Test code here
        }
    ).assert_ok();
}`,
    metadata: {
      title: 'Klever Smart Contract Testing Patterns',
      description: 'Examples of scenario and unit testing for Klever smart contracts',
      tags: ['testing', 'unit-test', 'scenario', 'example'],
      language: 'rust',
      relevanceScore: 0.85,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Common Errors and Solutions
  {
    type: 'error_pattern',
    content: `# Common Klever Smart Contract Errors

## Type Errors
**Issue**: "incompatible types" with managed types
**Solution**: Ensure using correct API parameter (Self::Api)
\`\`\`rust
// ❌ Wrong
fn my_value(&self) -> SingleValueMapper<BigUint>;

// ✅ Correct
fn my_value(&self) -> SingleValueMapper<BigUint<Self::Api>>;
\`\`\`

## Struct Type Parameter Errors
**Issue**: "missing type parameter" or "cannot find type \`Self\` in this scope"
**Solution**: Add ManagedTypeApi bound to structs containing managed types
\`\`\`rust
// ❌ Wrong - Missing type parameter
struct GameResult {
    player: ManagedAddress,  // Error: missing type parameter
    amount: BigUint,         // Error: missing type parameter
}

// ❌ Wrong - Using Self::Api in struct definition
struct GameResult {
    player: ManagedAddress<Self::Api>,  // Error: Self not in scope
}

// ✅ Correct - With ManagedTypeApi bound
pub struct GameResult<M>
where
    M: ManagedTypeApi,
{
    player: ManagedAddress<M>,
    amount: BigUint<M>,
    timestamp: u64,
}
\`\`\`

## Missing Type Parameter in Function Signatures
**Issue**: "missing generics for struct" or type parameter errors in functions
**Solution**: Always specify Self::Api when using custom structs in function signatures
\`\`\`rust
// ❌ Wrong - Missing type parameter
fn get_history(&self) -> MultiValueEncoded<GameResult> {
    // Error: missing generics for struct GameResult
}

// ❌ Wrong - Missing in storage mapper
fn game_storage(&self) -> VecMapper<GameResult> {
    // Error: missing generics for struct GameResult
}

// ✅ Correct - With Self::Api
fn get_history(&self) -> MultiValueEncoded<GameResult<Self::Api>> {
    // Works correctly
}

// ✅ Correct - In storage mapper
#[storage_mapper("games")]
fn game_storage(&self) -> VecMapper<GameResult<Self::Api>>;
\`\`\`

## Koperator Command Syntax Errors
**Issue**: Using wrong koperator parameters that don't exist
**Common mistakes**:
\`\`\`bash
# ❌ WRONG - These parameters DO NOT EXIST in koperator:
sc invoke \\
    --contract="$CONTRACT_ADDRESS" \\    # ❌ WRONG
    --function="placeBet" \\             # ❌ WRONG
    --value="$BET_AMOUNT" \\             # ❌ WRONG
    --kdaFee="KLV"                       # ❌ WRONG

# ✅ CORRECT - Use positional arguments and correct parameters:
sc invoke $CONTRACT_ADDRESS placeBet \\
    --args "u8:6" \\
    --values "KLV=$BET_AMOUNT" \\
    --await --sign --result-only
\`\`\`

**Solution**:
- CONTRACT_ADDRESS and FUNCTION_NAME are positional arguments
- Use --values for token payments (not --value)
- Use --args for function arguments with type prefixes
- No --contract, --function, --kdaFee parameters exist

## Storage Errors
**Issue**: Storage access errors
**Solution**: Check storage mapper definitions match usage
\`\`\`rust
// Ensure consistent key types in storage mapper
#[storage_mapper("data")]
fn data(&self, key: &ManagedBuffer) -> SingleValueMapper<ManagedBuffer>;
\`\`\`

## Build Errors
**Issue**: Compilation errors with dependencies
**Solution**: Verify Cargo.toml has correct klever-sc version
\`\`\`toml
[dependencies.klever-sc]
version = "0.44.0"
features = ["alloc"]  # Add if using dynamic vectors
\`\`\`

## Memory Allocation Errors
**Issue**: Memory warnings during build
**Solution**: Change allocator in sc-config.toml
\`\`\`toml
[contracts.contract_name]
allocator = "static64k"
\`\`\``,
    metadata: {
      title: 'Common Klever Contract Errors and Solutions',
      description:
        'Frequently encountered errors in Klever smart contract development and their solutions',
      tags: ['errors', 'debugging', 'solutions', 'troubleshooting'],
      language: 'rust',
      relevanceScore: 0.9,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Event Parameter Limitation Error
  {
    type: 'error_pattern',
    content: `# Event Parameter Limitation Error in Klever

## Error Description
**Issue**: "too many non-indexed parameters in event" or event compilation errors
**Cause**: Klever has a strict limitation on event parameters - you can have at most ONE non-indexed parameter

## Example of the Error
\`\`\`rust
// ❌ THIS WILL CAUSE AN ERROR
#[event("gamePlayed")]
fn game_played_event(
    &self,
    #[indexed] player: &ManagedAddress,
    bet_amount: &BigUint,     // ❌ Error: non-indexed
    chosen_number: u8,        // ❌ Error: non-indexed
    rolled_number: u8,        // ❌ Error: non-indexed
    won: bool,                // ❌ Error: non-indexed
    payout: &BigUint,        // ❌ Error: non-indexed
);
// Error: Multiple non-indexed parameters not allowed
\`\`\`

## Solutions

### Solution 1: Make All Parameters Indexed
\`\`\`rust
// ✅ CORRECT - All parameters indexed
#[event("gamePlayed")]
fn game_played_event(
    &self,
    #[indexed] player: &ManagedAddress,
    #[indexed] bet_amount: &BigUint,
    #[indexed] chosen_number: u8,
    #[indexed] rolled_number: u8,
    #[indexed] won: bool,
    #[indexed] payout: &BigUint,
);
\`\`\`

### Solution 2: Use Only One Non-Indexed Parameter
\`\`\`rust
// ✅ CORRECT - Combine data into a single parameter
#[derive(TopEncode)]
pub struct GameResult<M>
where
    M: ManagedTypeApi,
{
    bet_amount: BigUint<M>,
    chosen_number: u8,
    rolled_number: u8,
    won: bool,
    payout: BigUint<M>,
}

#[event("gamePlayed")]
fn game_played_event(
    &self,
    #[indexed] player: &ManagedAddress,
    result: &GameResult<Self::Api>,  // Only one non-indexed parameter
);
\`\`\`

### Solution 3: Use Multiple Events
\`\`\`rust
// ✅ CORRECT - Split into multiple events if needed
#[event("betPlaced")]
fn bet_placed_event(
    &self,
    #[indexed] player: &ManagedAddress,
    #[indexed] amount: &BigUint,
    #[indexed] chosen_number: u8,
);

#[event("gameResult")]
fn game_result_event(
    &self,
    #[indexed] player: &ManagedAddress,
    #[indexed] rolled_number: u8,
    #[indexed] won: bool,
    #[indexed] payout: &BigUint,
);
\`\`\`

## Key Rule
**Remember**: In Klever, you can have either:
1. All parameters indexed, or
2. All parameters indexed except ONE

This is different from other blockchains where multiple non-indexed parameters are allowed.`,
    metadata: {
      title: 'Event Parameter Limitation Error',
      description: 'Common error when defining events with multiple non-indexed parameters in Klever',
      tags: ['error', 'events', 'indexed', 'parameters', 'compilation'],
      language: 'rust',
      relevanceScore: 0.95,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Input Validation Pattern
  {
    type: 'security_tip',
    content: `// Input Validation Best Practices

// Always validate inputs using require!
#[endpoint]
fn transfer(&self, to: ManagedAddress, amount: BigUint) {
    // Validate address
    require!(!to.is_zero(), "Cannot transfer to zero address");

    // Validate amount
    require!(amount > 0, "Amount must be positive");

    // Validate caller permissions
    require!(
        self.blockchain().get_caller() == self.owner().get(),
        "Only owner can call this"
    );

    // Validate sufficient balance
    let balance = self.balance(&self.blockchain().get_caller()).get();
    require!(balance >= amount, "Insufficient balance");

    // Proceed with transfer...
}

// Common validation patterns:
// - Check for zero address: !address.is_zero()
// - Check positive amounts: amount > 0
// - Check ownership: caller == owner
// - Check array bounds: index < array.len()
// - Check token existence: self.token_exists(&token_id)`,
    metadata: {
      title: 'Input Validation Security Patterns',
      description:
        'Best practices for validating inputs in Klever smart contracts using require! macro',
      tags: ['security', 'validation', 'require', 'best-practice'],
      language: 'rust',
      relevanceScore: 0.95,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Project Structure
  {
    type: 'documentation',
    content: `# Klever Smart Contract Project Structure

\`\`\`
my-contract/
├── Cargo.toml              # Main project configuration
├── meta/                   # Meta crate for contract ABI
│   ├── Cargo.toml
│   └── src/
│       └── main.rs
├── src/                    # Contract source code
│   └── lib.rs
├── tests/                  # Test files
│   ├── contract_test.rs
│   ├── contract_scenario_rs_test.rs
│   └── contract_scenario_go_test.rs
├── scenarios/              # JSON scenario test files
│   └── *.scen.json
├── wasm/                   # WASM output configuration
│   ├── Cargo.toml
│   └── src/
│       └── lib.rs
├── sc-config.toml          # Smart contract configuration
└── output/                 # Build output directory
    ├── *.wasm             # Compiled WASM files
    └── *.abi.json         # Contract ABI files
\`\`\`

## Key Files:
- **sc-config.toml**: Contract build configuration
- **meta/**: Generates contract ABI and build tools
- **wasm/**: WASM-specific entry point
- **scenarios/**: JSON-based integration tests`,
    metadata: {
      title: 'Klever Smart Contract Project Structure',
      description: 'Standard directory structure and file organization for Klever smart contracts',
      tags: ['structure', 'project', 'organization', 'files'],
      language: 'rust',
      relevanceScore: 0.8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Managed Types Overview
  {
    type: 'documentation',
    content: `# Klever Managed Types

Managed types are specifically designed for the Klever VM environment and provide efficient memory management:

## Core Managed Types:
- **ManagedBuffer<M>**: For binary data and strings
- **BigUint<M>**: For large unsigned integers (unlimited precision)
- **BigInt<M>**: For large signed integers
- **ManagedAddress<M>**: For blockchain addresses (32 bytes)
- **ManagedVec<M, T>**: For collections of elements
- **ManagedByteArray<M, N>**: For fixed-size byte arrays

## Token-Related Types:
- **TokenIdentifier<M>**: For KDA token identifiers
- **KdaTokenPayment<M>**: For token payment information
- **KdaTokenData<M>**: For token metadata

## Usage Example:
\`\`\`rust
// Always use with Self::Api type parameter
fn process_payment(&self, payment: KdaTokenPayment<Self::Api>) {
    let token = payment.token_identifier;
    let amount = payment.amount;
    let nonce = payment.token_nonce;

    // Process the payment...
}
\`\`\`

## Important Notes:
- All managed types require the API type parameter (usually Self::Api)
- Managed types handle memory allocation automatically
- More efficient than heap-allocated alternatives`,
    metadata: {
      title: 'Klever Managed Types Reference',
      description:
        'Overview of managed types available in Klever VM for efficient memory management',
      tags: ['types', 'managed', 'reference', 'memory'],
      language: 'rust',
      relevanceScore: 0.85,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Contract Project Setup
  {
    type: 'documentation',
    content: `# Setting Up a New Klever Smart Contract Project

## 1. Create New Contract from Template
\`\`\`bash
# First, list all available templates
~/klever-sdk/ksc templates

# Create a contract using a specific template
~/klever-sdk/ksc new --template empty --name MyContract --path ./my-contract

# Navigate to the new contract
cd ./my-contract
\`\`\`

## 2. Project Structure Created
\`\`\`
my-contract/
├── Cargo.toml          # Main project configuration
├── meta/               # Meta crate for ABI generation
├── src/                # Contract source code
│   └── lib.rs         # Main contract implementation
├── tests/              # Test files
├── wasm/               # WASM build configuration
└── sc-config.toml      # Smart contract build config
\`\`\`

## 3. Initial Contract Code
The empty template creates a basic contract with:
- \`#[init]\` function for initialization
- Basic project structure
- Build configuration

## 4. Next Steps
1. Implement your contract logic in \`src/lib.rs\`
2. Add endpoints, storage, and events
3. Build with: \`~/klever-sdk/ksc all build\`
4. Deploy using the deployment scripts

## Template Options
- **empty**: Minimal contract with init function
- **adder**: Example with storage and endpoints
- **ping-pong**: Message passing example
- **crowdfunding**: More complex example
- **multisig**: Multi-signature wallet example`,
    metadata: {
      title: 'Setting Up New Klever Contract Project',
      description:
        'Complete guide for creating and setting up a new Klever smart contract project from templates',
      tags: ['setup', 'create', 'project', 'template', 'getting-started'],
      language: 'markdown',
      relevanceScore: 0.9,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Build Configuration
  {
    type: 'code_example',
    content: `# Build Configuration Examples

## sc-config.toml
\`\`\`toml
[settings]
# Main contract name
main = "my-contract"

[contracts.my-contract]
name = "my-contract"
add-unlabelled = true    # Include endpoints without explicit names
panic-message = true     # Include panic messages (increases size)
allocator = "static64k"  # Memory allocator (for contracts with memory issues)
\`\`\`

## Cargo.toml with features
\`\`\`toml
[package]
name = "my-contract"
version = "0.0.0"
edition = "2021"
publish = false

[lib]
path = "src/lib.rs"

[dependencies.klever-sc]
version = "0.44.0"
features = ["alloc"]  # Enable for dynamic allocation

[dev-dependencies]
num-bigint = "0.4.2"

[dev-dependencies.klever-sc-scenario]
version = "0.44.0"
\`\`\`

## Build Commands:
\`\`\`bash
# Build all contracts
~/klever-sdk/ksc all build

# Build specific contract
~/klever-sdk/ksc contract build

# Clean build
~/klever-sdk/ksc all clean

# Build with output path
~/klever-sdk/ksc all build --output-path ./my-output
\`\`\``,
    metadata: {
      title: 'Klever Contract Build Configuration',
      description: 'Examples of build configuration files and commands for Klever smart contracts',
      tags: ['build', 'configuration', 'cargo', 'sc-config'],
      language: 'toml',
      relevanceScore: 0.75,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Enhanced Error Handling Patterns
  {
    type: 'best_practice',
    content: `# Error Handling in Klever Smart Contracts

## require! vs sc_panic!

### Use require! for Input Validation
\`\`\`rust
#[endpoint]
fn transfer(&self, to: ManagedAddress, amount: BigUint) {
    // require! returns a clear error message
    require!(amount > 0, "Transfer amount must be positive");
    require!(
        self.balance(&self.blockchain().get_caller()).get() >= &amount,
        "Insufficient balance"
    );

    // Continue with transfer logic...
}
\`\`\`

### Use sc_panic! for Unrecoverable Errors
\`\`\`rust
#[endpoint]
fn critical_operation(&self) {
    let result = self.do_something();

    if result.is_err() {
        // This should never happen in normal operation
        sc_panic!("Critical invariant violated!");
    }
}
\`\`\`

## Custom Error Messages

### Define Error Constants
\`\`\`rust
const ERR_INSUFFICIENT_FUNDS: &str = "Insufficient funds for operation";
const ERR_UNAUTHORIZED: &str = "Unauthorized access";
const ERR_INVALID_ARGUMENT: &str = "Invalid argument provided";
const ERR_CONTRACT_PAUSED: &str = "Contract is paused";
const ERR_ZERO_AMOUNT: &str = "Amount must be greater than zero";
\`\`\`

### Use Descriptive Error Messages
\`\`\`rust
#[endpoint]
fn stake(&self, amount: BigUint) {
    require!(!self.is_paused(), ERR_CONTRACT_PAUSED);
    require!(amount > 0, ERR_ZERO_AMOUNT);

    let caller = self.blockchain().get_caller();
    let balance = self.blockchain().get_balance(&caller, &TokenIdentifier::klv());

    require!(balance >= amount, ERR_INSUFFICIENT_FUNDS);

    // Staking logic...
}
\`\`\`

## Error Handling in Contract Calls

### Handle Contract Call Failures
\`\`\`rust
#[endpoint]
fn safe_transfer(&self, target: ManagedAddress, amount: BigUint) {
    // Pre-validate to avoid panics
    require!(
        self.blockchain().is_smart_contract(&target),
        "Invalid contract address"
    );

    // Check balance before attempting transfer
    let balance = self.balance(&self.blockchain().get_caller()).get();
    require!(balance >= amount, "Insufficient balance");

    // Contract calls panic on failure - no way to catch
    // Make sure target contract exists and endpoint is valid
    self.send()
        .contract_call::<()>(target, "receive")
        .with_klv_transfer(amount)
        .execute_on_dest_context();

    // This only executes if call succeeded
    self.transfer_complete_event(&target, &amount);
}
\`\`\`

## Validation Patterns

### Complex Validation
\`\`\`rust
fn validate_token_payment(&self) -> (TokenIdentifier, BigUint) {
    let (token, amount) = self.call_value().single_klever_token();

    require!(
        self.accepted_tokens().contains(&token),
        "Token not accepted"
    );

    let min_amount = self.min_deposit_amount(&token).get();
    require!(
        amount >= min_amount,
        "Amount below minimum deposit"
    );

    (token, amount)
}
\`\`\``,
    metadata: {
      title: 'Error Handling Best Practices',
      description: 'Comprehensive guide to error handling in Klever smart contracts',
      tags: ['error-handling', 'require', 'panic', 'validation', 'best-practice'],
      language: 'rust',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Token Mapper Helpers
  {
    type: 'code_example',
    content: `# Token Mapper Helper Modules

Klever provides specialized storage mappers that simplify token issuance, minting, burning, and management.

## FungibleTokenMapper

### Setup and Issuance
\`\`\`rust
#[payable("KLV")]
#[endpoint]
fn issue_fungible(
    &self,
    token_ticker: ManagedBuffer,
    initial_supply: BigUint,
) -> TokenIdentifier {
    self.fungible_token_mapper().issue(
        &ManagedBuffer::new(),  // token name (empty)
        &token_ticker,          // ticker like "MYTOKEN"
        &initial_supply,        // initial supply
        &initial_supply,        // max supply
        0,                      // decimals
    )
}

#[view(getFungibleTokenId)]
#[storage_mapper("fungibleTokenMapper")]
fn fungible_token_mapper(&self) -> FungibleTokenMapper;
\`\`\`

### Minting and Burning
\`\`\`rust
#[endpoint]
fn mint_fungible(&self, amount: BigUint) -> KdaTokenPayment<Self::Api> {
    self.fungible_token_mapper().mint(&amount)
}

#[endpoint]
fn mint_and_send_fungible(
    &self,
    to: ManagedAddress,
    amount: BigUint,
) -> KdaTokenPayment<Self::Api> {
    self.fungible_token_mapper().mint_and_send(&to, &amount)
}

#[endpoint]
fn burn_fungible(&self, amount: BigUint) {
    self.fungible_token_mapper().burn(&amount);
}
\`\`\`

### Validation
\`\`\`rust
#[payable("*")]
#[endpoint]
fn require_same_token_fungible(&self) {
    let payment_token = self.call_value().single_kda().token_identifier;
    self.fungible_token_mapper()
        .require_same_token(&payment_token);
}

#[endpoint]
fn get_balance_fungible(&self) -> BigUint {
    self.fungible_token_mapper().get_balance()
}
\`\`\`

## NonFungibleTokenMapper

### Setup and Issuance
\`\`\`rust
#[payable("KLV")]
#[endpoint]
fn issue_nft(&self, token_ticker: ManagedBuffer) {
    self.non_fungible_token_mapper()
        .issue(&ManagedBuffer::new(), &token_ticker);
}

#[endpoint]
fn mapper_nft_set_token_id(&self, token_id: TokenIdentifier) {
    self.non_fungible_token_mapper().set_token_id(token_id);
}

#[view(getNonFungibleTokenId)]
#[storage_mapper("nonFungibleTokenMapper")]
fn non_fungible_token_mapper(&self) -> NonFungibleTokenMapper;
\`\`\`

### NFT Operations
\`\`\`rust
#[endpoint]
fn mapper_nft_mint(&self, amount: BigUint) {
    self.non_fungible_token_mapper().nft_mint(&amount);
}

#[endpoint]
fn mapper_nft_burn(&self, token_nonce: u64, amount: BigUint) {
    self.non_fungible_token_mapper()
        .nft_burn(token_nonce, &amount);
}

#[endpoint]
fn mapper_nft_get_balance(&self, token_nonce: u64) -> BigUint {
    self.non_fungible_token_mapper().get_balance(token_nonce)
}
\`\`\`

### NFT Attributes
\`\`\`rust
#[endpoint]
fn mapper_get_nft_attributes(&self, token_nonce: u64) -> RgbColor {
    let token_data = self
        .non_fungible_token_mapper()
        .get_nft_token_data(token_nonce);
    token_data.decode_attributes()
}
\`\`\`

## SemiFungibleTokenMapper

### Setup and Issuance
\`\`\`rust
#[payable("KLV")]
#[endpoint]
fn issue_sft(&self, token_ticker: ManagedBuffer) {
    self.semi_fungible_token_mapper()
        .issue(&ManagedBuffer::new(), &token_ticker, Some(0));
}

#[endpoint]
fn mapper_sft_set_token_id(&self, token_id: TokenIdentifier) {
    self.semi_fungible_token_mapper().set_token_id(token_id);
}

#[view(getSemiFungibleTokenId)]
#[storage_mapper("semiFungibleTokenMapper")]
fn semi_fungible_token_mapper(&self) -> SemiFungibleTokenMapper;
\`\`\`

### SFT Minting with Attributes
\`\`\`rust
#[endpoint]
fn mapper_sft_mint(&self, amount: BigUint, attributes: RgbColor) -> KdaTokenPayment<Self::Api> {
    let token_nonce = self
        .semi_fungible_token_mapper()
        .sft_mint(&amount, &attributes);
    let token_id = self.semi_fungible_token_mapper().get_token_id();

    KdaTokenPayment::new(token_id, token_nonce, amount)
}

#[endpoint]
fn mapper_sft_mint_and_send(
    &self,
    to: ManagedAddress,
    amount: BigUint,
    attributes: RgbColor,
) -> KdaTokenPayment<Self::Api> {
    let token_nonce = self
        .semi_fungible_token_mapper()
        .sft_mint(&amount, &attributes);

    let token_id = self.semi_fungible_token_mapper().get_token_id();

    self.send().direct_kda(&to, &token_id, token_nonce, &amount);

    KdaTokenPayment::new(token_id, token_nonce, amount)
}
\`\`\`

### SFT Quantity Management
\`\`\`rust
#[endpoint]
fn mapper_sft_add_quantity(
    &self,
    token_nonce: u64,
    amount: BigUint,
) -> KdaTokenPayment<Self::Api> {
    self.semi_fungible_token_mapper()
        .sft_add_quantity(token_nonce, &amount)
}

#[endpoint]
fn mapper_sft_add_quantity_and_send(
    &self,
    to: ManagedAddress,
    token_nonce: u64,
    amount: BigUint,
) -> KdaTokenPayment<Self::Api> {
    self.semi_fungible_token_mapper()
        .sft_add_quantity_and_send(&to, token_nonce, &amount)
}
\`\`\`

### SFT Operations
\`\`\`rust
#[endpoint]
fn mapper_sft_burn(&self, token_nonce: u64, amount: BigUint) {
    self.semi_fungible_token_mapper()
        .sft_burn(token_nonce, &amount);
}

#[endpoint]
fn mapper_sft_get_balance(&self, token_nonce: u64) -> BigUint {
    self.semi_fungible_token_mapper().get_balance(token_nonce)
}

#[endpoint]
fn mapper_get_sft_attributes(&self, token_nonce: u64) -> RgbColor {
    self.semi_fungible_token_mapper()
        .get_sft_meta_attributes(token_nonce)
}
\`\`\`

## Key Benefits of Token Mappers

1. **Simplified Token Management**: Handle issuance, minting, burning with single method calls
2. **Automatic State Tracking**: Token ID, supplies, and balances are managed automatically
3. **Built-in Validation**: Methods like \`require_same_token()\` ensure payment correctness
4. **Direct Integration**: Works seamlessly with \`KdaTokenPayment\` and transfer functions
5. **Attribute Support**: Easy encoding/decoding of NFT/SFT attributes

## Common Patterns

### Token Issuance Flow
\`\`\`rust
1. Deploy contract
2. Call issue endpoint with KLV payment for gas
3. Token ID is automatically stored in mapper
4. Use mint/burn functions as needed
\`\`\`

### Payment Validation
\`\`\`rust
#[payable("*")]
#[endpoint]
fn stake(&self) {
    let payment = self.call_value().single_kda();

    // Ensure payment is our token
    self.fungible_token_mapper()
        .require_same_token(&payment.token_identifier);

    // Process staking...
}
\`\`\``,
    metadata: {
      title: 'Token Mapper Helper Modules',
      description: 'Built-in helper modules for managing fungible tokens, NFTs, and SFTs in Klever',
      tags: ['token-mapper', 'nft', 'sft', 'fungible', 'minting', 'burning', 'issuance'],
      language: 'rust',
      relevanceScore: 0.95,
      contractType: 'token',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Gas Optimization Techniques
  {
    type: 'optimization',
    content: `# Gas Optimization Techniques for Klever Smart Contracts

## Storage Optimization

### Use Appropriate Storage Mappers
\`\`\`rust
// ❌ Bad: Using VecMapper for unique items
#[storage_mapper("users")]
fn users(&self) -> VecMapper<ManagedAddress>;

// ✅ Good: Using SetMapper for unique items (O(1) operations)
#[storage_mapper("users")]
fn users(&self) -> SetMapper<ManagedAddress>;

// ❌ Bad: Storing full objects when only part is needed frequently
#[storage_mapper("user_data")]
fn user_data(&self) -> MapMapper<ManagedAddress, UserFullData>;

// ✅ Good: Separate frequently accessed data
#[storage_mapper("user_balance")]
fn user_balance(&self) -> MapMapper<ManagedAddress, BigUint>;
#[storage_mapper("user_metadata")]
fn user_metadata(&self) -> MapMapper<ManagedAddress, UserMetadata>;
\`\`\`

### Batch Operations
\`\`\`rust
// ❌ Bad: Multiple storage writes
#[endpoint]
fn update_multiple_bad(&self, updates: ManagedVec<(ManagedAddress, BigUint)>) {
    for (addr, value) in updates.iter() {
        self.balances(&addr).set(&value);
        self.last_update(&addr).set(self.blockchain().get_block_timestamp());
        self.total_updates().update(|x| *x += 1);
    }
}

// ✅ Good: Minimize storage operations
#[endpoint]
fn update_multiple_good(&self, updates: ManagedVec<(ManagedAddress, BigUint)>) {
    let timestamp = self.blockchain().get_block_timestamp();
    let mut update_count = 0u32;

    for (addr, value) in updates.iter() {
        self.balances(&addr).set(&value);
        self.last_update(&addr).set(timestamp);
        update_count += 1;
    }

    self.total_updates().update(|x| *x += update_count);
}
\`\`\`

## Computation Optimization

### Cache Repeated Calculations
\`\`\`rust
// ❌ Bad: Repeated blockchain calls
#[endpoint]
fn process_rewards_bad(&self) {
    for user in self.users().iter() {
        let reward = self.calculate_reward(&user);
        if reward > 0 {
            self.send().direct_klv(&user, &reward);
            // Multiple blockchain calls
            self.last_claim(&user).set(self.blockchain().get_block_timestamp());
            self.total_distributed().update(|x| *x += &reward);
        }
    }
}

// ✅ Good: Cache blockchain calls
#[endpoint]
fn process_rewards_good(&self) {
    let current_timestamp = self.blockchain().get_block_timestamp();
    let mut total_distributed = BigUint::zero();
    let mut transfers = ManagedVec::new();

    for user in self.users().iter() {
        let reward = self.calculate_reward(&user);
        if reward > 0 {
            transfers.push((user.clone(), reward.clone()));
            self.last_claim(&user).set(current_timestamp);
            total_distributed += &reward;
        }
    }

    // Batch transfers
    for (user, reward) in transfers.iter() {
        self.send().direct_klv(&user, &reward);
    }

    self.total_distributed().update(|x| *x += &total_distributed);
}
\`\`\`

### Avoid Unnecessary Type Conversions
\`\`\`rust
// ❌ Bad: Multiple conversions
fn calculate_percentage_bad(&self, amount: BigUint, percentage: u64) -> BigUint {
    let hundred = BigUint::from(100u32);
    let perc_big = BigUint::from(percentage);
    &amount * &perc_big / &hundred
}

// ✅ Good: Minimize conversions
const PERCENTAGE_DIVISOR: u64 = 10_000; // Use basis points

fn calculate_percentage_good(&self, amount: &BigUint, basis_points: u64) -> BigUint {
    amount * basis_points / PERCENTAGE_DIVISOR
}
\`\`\`

## Memory Optimization

### Use References Instead of Cloning
\`\`\`rust
// ❌ Bad: Unnecessary cloning
fn validate_and_process_bad(&self, token: TokenIdentifier, amount: BigUint) {
    self.validate_token(token.clone());
    self.process_amount(amount.clone());
    self.emit_event(token, amount); // Moved values
}

// ✅ Good: Use references
fn validate_and_process_good(&self, token: &TokenIdentifier, amount: &BigUint) {
    self.validate_token(token);
    self.process_amount(amount);
    self.emit_event(token, amount);
}
\`\`\`

### Optimize Loops
\`\`\`rust
// ❌ Bad: Collecting unnecessary data
fn get_total_staked_bad(&self) -> BigUint {
    self.stakes()
        .iter()
        .map(|(_, stake)| stake)
        .sum()
}

// ✅ Good: Direct accumulation
fn get_total_staked_good(&self) -> BigUint {
    let mut total = BigUint::zero();
    for (_, stake) in self.stakes().iter() {
        total += stake;
    }
    total
}
\`\`\`

## Event Optimization

### Minimize Event Data
\`\`\`rust
// ❌ Bad: Emitting large data structures
#[event("userUpdated")]
fn user_updated_event(&self, user_data: &CompleteUserData);

// ✅ Good: Emit only essential data
#[event("userUpdated")]
fn user_updated_event(
    &self,
    #[indexed] user: &ManagedAddress,
    #[indexed] update_type: &ManagedBuffer,
    new_value: &BigUint
);
\`\`\``,
    metadata: {
      title: 'Gas Optimization Techniques',
      description: 'Advanced techniques for optimizing gas usage in Klever smart contracts',
      tags: ['gas', 'optimization', 'performance', 'storage', 'memory'],
      language: 'rust',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Cross-Contract Calls
  {
    type: 'code_example',
    content: `# Cross-Contract Call Patterns in Klever

## Important: Klever Uses Synchronous Calls Only

Klever smart contracts do NOT support async calls or callbacks. All contract calls are synchronous and execute immediately.

## Basic Cross-Contract Call

### Simple Contract Call
\`\`\`rust
#[endpoint]
fn call_other_contract(&self, target_contract: ManagedAddress) {
    // Direct synchronous call - waits for response
    let result: BigUint = self.send()
        .contract_call::<BigUint>(target_contract, "getValue")
        .execute_on_dest_context();

    // Result is immediately available
    self.stored_value().set(&result);
}
\`\`\`

## Token Transfer with Contract Call

### Sending Tokens to Another Contract
\`\`\`rust
#[endpoint]
#[payable("*")]
fn forward_payment(&self, target_contract: ManagedAddress) {
    let payment = self.call_value().kda_payment();

    // Forward tokens with synchronous contract call
    self.send()
        .contract_call::<()>(target_contract, "receivePayment")
        .with_kda_transfer(
            payment.token_identifier,
            payment.token_nonce,
            payment.amount
        )
        .execute_on_dest_context();

    // Execution continues only after call completes
    self.payment_forwarded_event(&target_contract);
}
\`\`\`

## Multi-Step Operations

### Sequential Contract Calls
\`\`\`rust
#[endpoint]
fn multi_step_operation(&self, oracle: ManagedAddress, dex: ManagedAddress) {
    // Step 1: Get price from oracle (synchronous)
    let price: BigUint = self.send()
        .contract_call::<BigUint>(oracle, "getPrice")
        .execute_on_dest_context();

    // Step 2: Calculate amount based on price
    let amount = &price * 2u32;

    // Step 3: Execute swap on DEX (synchronous)
    let output: BigUint = self.send()
        .contract_call::<BigUint>(dex, "swap")
        .with_klv_transfer(amount)
        .execute_on_dest_context();

    // All steps complete - store results
    self.last_swap_output().set(&output);
}
\`\`\`

## Error Handling

### Handling Failed Contract Calls
\`\`\`rust
#[endpoint]
fn safe_contract_call(&self, target: ManagedAddress) -> SCResult<()> {
    // Validate target is a contract
    require!(
        self.blockchain().is_smart_contract(&target),
        "Target must be a smart contract"
    );

    // Contract calls that fail will panic
    // You cannot catch panics - design accordingly
    let balance: BigUint = self.send()
        .contract_call::<BigUint>(target, "getBalance")
        .execute_on_dest_context();

    require!(balance > 0, "Balance must be positive");

    Ok(())
}
\`\`\`

## Complex Interactions

### Multiple Contract Coordination
\`\`\`rust
#[endpoint]
fn coordinate_contracts(&self, contracts: ManagedVec<ManagedAddress>) {
    let mut total = BigUint::zero();

    // Process each contract sequentially
    for contract in &contracts {
        // Each call is synchronous
        let value: BigUint = self.send()
            .contract_call::<BigUint>(contract, "getValue")
            .execute_on_dest_context();

        total += value;
    }

    // All calls complete - store total
    self.total_value().set(&total);
}
\`\`\`

## Contract Deployment

### Deploy and Initialize
\`\`\`rust
#[endpoint]
fn deploy_child_contract(&self, code: ManagedBuffer, initial_value: BigUint) {
    // Deploy contract
    let (new_address, _) = self.send()
        .deploy_contract(
            self.blockchain().get_gas_left() / 2,
            &BigUint::zero(),
            &code,
            CodeMetadata::DEFAULT,
        );

    // Initialize immediately (synchronous)
    self.send()
        .contract_call::<()>(new_address.clone(), "init")
        .add_argument(&initial_value)
        .execute_on_dest_context();

    self.child_contracts().push(&new_address);
}
\`\`\`

## Best Practices

1. **Always validate before calling**: Check contract existence
2. **Handle gas carefully**: Cross-contract calls consume gas
3. **Design for synchronous execution**: No callbacks available
4. **Keep call chains simple**: Deep nesting increases complexity
5. **Test thoroughly**: Contract calls can fail and panic

## Common Pitfalls

1. **No async/await**: Klever doesn't support asynchronous patterns
2. **No callbacks**: All execution is linear and synchronous
3. **Panics propagate**: Failed calls will panic the caller
4. **Gas limitations**: Complex call chains may run out of gas`,
    metadata: {
      title: 'Cross-Contract Call Patterns (Synchronous Only)',
      description:
        'Patterns for synchronous cross-contract calls in Klever - no async or callbacks',
      tags: ['contract-calls', 'synchronous', 'cross-contract', 'no-async'],
      language: 'rust',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // CRITICAL: Correct Koperator Syntax - MUST BE FIRST
  {
    type: 'deployment_tool',
    content: `# ⚠️ CRITICAL: Correct Koperator Command Syntax ⚠️

## ALWAYS Use This Format for sc invoke:

\`\`\`bash
# CORRECT FORMAT:
~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke CONTRACT_ADDRESS FUNCTION_NAME \\
    --args "type:value" \\
    --values "KLV=amount" \\
    --await --sign --result-only
\`\`\`

## ❌ NEVER USE These Wrong Patterns:
- \`--contract="address"\` ❌ WRONG - use positional argument
- \`--function="name"\` ❌ WRONG - use positional argument
- \`--value="amount"\` ❌ WRONG - use --values "KLV=amount"
- \`--kdaFee="KLV"\` ❌ WRONG - does not exist
- \`--token-transfers\` ❌ WRONG - use --values

## Real Examples:

### 1. Place Bet with KLV Payment:
\`\`\`bash
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke klv1contract123... placeBet \\
    --args "u8:6" \\
    --values "KLV=10000000" \\
    --await --sign --result-only
\`\`\`

### 2. Transfer Function:
\`\`\`bash
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke klv1contract123... transfer \\
    --args "Address:klv1recipient..." \\
    --args "bi:1000000" \\
    --await --sign --result-only
\`\`\`

### Key Rules:
1. CONTRACT_ADDRESS is positional (no --contract)
2. FUNCTION_NAME is positional (no --function)
3. Use --values for payments (not --value)
4. Each argument needs --args with type
5. Always use --await --sign --result-only

### Important Flags:
- \`--await\`: Wait for transaction to be processed
- \`--sign\`: Sign the transaction with your key
- \`--result-only\`: Show only the transaction result (clean JSON output without logs)`,
    metadata: {
      title: 'CRITICAL: Correct Koperator Syntax - READ THIS FIRST',
      description: 'The ONLY correct way to use koperator sc invoke - NEVER use --contract, --function, --value. Always include --result-only for clean output',
      tags: ['koperator', 'critical', 'syntax', 'sc-invoke', 'commands'],
      language: 'bash',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Deployment Tool Context - Correct patterns for using koperator
  {
    type: 'deployment_tool',
    content: `# Klever Smart Contract Operations - Correct Patterns

## IMPORTANT: Koperator Location and Usage

The Klever SDK provides \`koperator\` at: \`~/klever-sdk/koperator\`

## Node Configuration Options

You can specify the node in two ways:

### Option 1: Environment Variable
\`\`\`bash
export KLEVER_NODE="http://localhost:8080"  # Local node (default port 8080)
# export KLEVER_NODE="https://node.testnet.klever.org"  # Testnet
\`\`\`

### Option 2: --node Parameter
\`\`\`bash
# Use --node parameter directly in the command
~/klever-sdk/koperator --node="http://localhost:8080" ...
\`\`\`

## Contract Deployment (sc create)
\`\`\`bash
# Build first
~/klever-sdk/ksc all build

# Deploy a new contract
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc create \\
    --upgradeable --readable --payable --payableBySC \\
    --wasm="$(pwd)/output/contract.wasm" \\
    --await --sign --result-only
\`\`\`

## Contract Upgrade (sc upgrade)
\`\`\`bash
# Build first
~/klever-sdk/ksc all build

# Upgrade existing contract
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc upgrade "$CONTRACT_ADDRESS" \\
    --wasm="$(pwd)/output/contract.wasm" \\
    --payable --payableBySC --readable --upgradeable \\
    --await --sign --result-only
\`\`\`

## Contract Execution (sc invoke)
\`\`\`bash
# Call contract function
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke "$CONTRACT_ADDRESS" "$FUNCTION_NAME" \\
    --args "arg1" --args "arg2" \\
    --await --sign --result-only

# With token transfer
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke "$CONTRACT_ADDRESS" "deposit" \\
    --values "KLV=1000000000" \\
    --await --sign --result-only
\`\`\`

## Contract Query (via API, NOT koperator)
\`\`\`bash
# Query uses the Klever API
curl -s 'https://api.testnet.klever.org/v1.0/sc/query' \\
    --data-raw '{
        "ScAddress":"'$CONTRACT_ADDRESS'",
        "FuncName":"'$ENDPOINT'",
        "Arguments":["'$(echo -n "$ARG" | base64)'"]
    }'
\`\`\`

## Key Differences from Other Blockchain CLIs:
- Use \`sc create\` (NOT \`deploy\`)
- Use \`sc invoke\` (NOT \`call\` or \`execute\`)
- Use \`sc upgrade\` (NOT \`update\`)
- Use \`--key-file\` (NOT \`--pem\`)
- Use \`KLEVER_NODE\` env var (NOT \`--proxy\`)
- Wallet files named \`walletKey.pem\` (NOT \`wallet.pem\`)
- Arguments use \`--args\` flag (can be repeated)
- Query endpoints use API, not koperator`,
    metadata: {
      title: 'Koperator Tool - Correct Usage Patterns',
      description: 'Proper command-line usage patterns for Klever Operator (koperator) tool',
      tags: ['koperator', 'deployment', 'upgrade', 'query', 'execute', 'cli', 'tool'],
      language: 'bash',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Best Practice Context - Common mistakes when using Klever tools
  {
    type: 'best_practice',
    content: `# Common Mistakes When Using Klever Tools

## ❌ WRONG Commands (from other blockchains)
\`\`\`bash
# These commands DO NOT work on Klever!
klever-sdk deploy --wasm contract.wasm --pem wallet.pem --proxy http://localhost:7950
koperator --deploy --ksc-file contract.ksc --user-private-key key.pem
sc-meta all build  # This is NOT Klever!
\`\`\`

## ✅ CORRECT Klever Commands
\`\`\`bash
# This is how Klever actually works
KLEVER_NODE=http://localhost:8080 \\
    ~/klever-sdk/koperator \\
    --key-file="walletKey.pem" \\
    sc create \\
    --wasm="contract.wasm" \\
    --upgradeable --readable --payable \\
    --await --sign --result-only
\`\`\`

## Key Points to Remember:
1. Binary is \`~/klever-sdk/koperator\` (not \`klever-sdk\` or \`koperator\` alone)
2. Use \`KLEVER_NODE\` environment variable (not --proxy)
3. Use \`--key-file\` parameter (not --pem)
4. Commands are \`sc create\`, \`sc invoke\`, \`sc upgrade\` (not deploy/call/execute)
5. Build with \`~/klever-sdk/ksc all build\` (not sc-meta)

## Common Incorrect Patterns:

### ❌ Wrong Command Names
\`\`\`bash
# WRONG - These don't exist
koperator --deploy
koperator --execute
koperator --call
koperator deploy
\`\`\`

### ✅ Correct Command Names
\`\`\`bash
# CORRECT
~/klever-sdk/koperator sc create     # Deploy new contract
~/klever-sdk/koperator sc invoke     # Call contract function
~/klever-sdk/koperator sc upgrade    # Upgrade contract
\`\`\`

### ❌ Wrong Parameter Names
\`\`\`bash
# WRONG
--pem wallet.pem
--proxy http://localhost:7950
--wasm-file contract.wasm
\`\`\`

### ✅ Correct Parameter Names
\`\`\`bash
# CORRECT
--key-file="walletKey.pem"
KLEVER_NODE=http://localhost:8080
--wasm="contract.wasm"
\`\`\`

### ❌ Wrong Build Command
\`\`\`bash
# WRONG - Not Klever commands
sc-meta all build
cargo build --release
mxpy contract build
\`\`\`

### ✅ Correct Build Command
\`\`\`bash
# CORRECT
~/klever-sdk/ksc all build
\`\`\`

### ❌ Wrong Query Method
\`\`\`bash
# WRONG - koperator doesn't do queries
~/klever-sdk/koperator sc query
\`\`\`

### ✅ Correct Query Method
\`\`\`bash
# CORRECT - Use API for queries
curl -s 'https://api.testnet.klever.org/v1.0/sc/query' \\
    --data-raw '{"ScAddress":"...", "FuncName":"...", "Arguments":[...]}'
\`\`\``,
    metadata: {
      title: 'Common Mistakes When Using Klever Tools',
      description: 'Frequent mistakes developers make with Klever CLI tools and how to avoid them',
      tags: ['mistakes', 'best-practice', 'koperator', 'cli', 'errors', 'debugging'],
      language: 'bash',
      relevanceScore: 0.9,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Code Example Context - Bash script functions for Klever smart contracts
  {
    type: 'code_example',
    content: `# Bash Script Functions for Klever Smart Contracts

## Build Script
\`\`\`bash
#!/bin/bash
# Build script for Klever contracts

echo "Building smart contract..."
~/klever-sdk/ksc all build

if [ $? -eq 0 ]; then
    echo -e "\\033[32m✅ Build successful!\\033[0m"
    echo "WASM files:"
    find output -name "*.wasm" -exec ls -lh {} \\;
else
    echo -e "\\033[31m❌ Build failed!\\033[0m"
    exit 1
fi
\`\`\`

## Deploy Script
\`\`\`bash
#!/bin/bash
# Deploy script for Klever contracts

set -e

# Build first
echo "Building smart contract..."
~/klever-sdk/ksc all build || { echo "Build failed"; exit 1; }

# Get contract name from output directory
CONTRACT_WASM=$(find output -name "*.wasm" | head -1)
if [ -z "$CONTRACT_WASM" ]; then
    echo "Error: No WASM file found in output directory"
    exit 1
fi

echo "Deploying contract..."
DEPLOY_OUTPUT=$(KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc create \\
    --upgradeable --readable --payable --payableBySC \\
    --wasm="$CONTRACT_WASM" \\
    --await --sign --result-only)

echo "Contract deployment complete!"

# Extract transaction hash and contract address
TX_HASH=$(echo "$DEPLOY_OUTPUT" | grep -o '"hash": "[^"]*"' | head -1 | cut -d'"' -f4)

# Try to extract contract address
CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    if 'logs' in data and 'events' in data['logs']:
        for event in data['logs']['events']:
            if event.get('identifier') == 'SCDeploy':
                print(event.get('address', ''))
                break
except: pass
" 2>/dev/null)

# Create history file
mkdir -p output
HISTORY_FILE="output/history.json"
[ ! -f "$HISTORY_FILE" ] && echo "[]" > "$HISTORY_FILE"

if [ -n "$TX_HASH" ] && [ -n "$CONTRACT_ADDRESS" ]; then
    # Add to history
    jq --arg tx "$TX_HASH" --arg addr "$CONTRACT_ADDRESS" \\
       '. + [{"hash": $tx, "contractAddress": $addr, "timestamp": now | strftime("%Y-%m-%d %H:%M:%S")}]' \\
       "$HISTORY_FILE" > "$HISTORY_FILE.tmp" && mv "$HISTORY_FILE.tmp" "$HISTORY_FILE"

    echo "Transaction: $TX_HASH"
    echo "Contract: $CONTRACT_ADDRESS"
else
    echo "Warning: Could not extract deployment information"
fi
\`\`\`

## Upgrade Script
\`\`\`bash
#!/bin/bash
# Upgrade script for Klever contracts

set -e

# Get contract address
if [ $# -eq 1 ]; then
    CONTRACT_ADDRESS=$1
else
    echo "Getting latest contract from history.json..."
    CONTRACT_ADDRESS=$(jq -r '.[-1].contractAddress' output/history.json 2>/dev/null)

    if [ -z "$CONTRACT_ADDRESS" ] || [ "$CONTRACT_ADDRESS" = "null" ]; then
        echo "Error: No contract address found"
        echo "Usage: $0 [contract-address]"
        exit 1
    fi
fi

echo "Contract address: $CONTRACT_ADDRESS"

# Build first
echo "Building smart contract..."
~/klever-sdk/ksc all build || { echo "Build failed"; exit 1; }

# Get contract WASM
CONTRACT_WASM=$(find output -name "*.wasm" | head -1)
if [ -z "$CONTRACT_WASM" ]; then
    echo "Error: No WASM file found"
    exit 1
fi

# Upgrade contract
echo "Upgrading contract..."
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc upgrade "$CONTRACT_ADDRESS" \\
    --wasm="$CONTRACT_WASM" \\
    --payable --payableBySC --readable --upgradeable \\
    --await --sign --result-only

echo "Contract upgrade complete!"
\`\`\`

## Query Script (via API)
\`\`\`bash
#!/bin/bash
# Query script for Klever contracts

set -e

# Parse arguments
ENDPOINT=""
CONTRACT_ADDRESS=""
ARGUMENTS=()

while [[ $# -gt 0 ]]; do
    case $1 in
        --endpoint) ENDPOINT="$2"; shift 2 ;;
        --contract) CONTRACT_ADDRESS="$2"; shift 2 ;;
        --arg) ARGUMENTS+=("$2"); shift 2 ;;
        *) echo "Unknown argument: $1"; exit 1 ;;
    esac
done

if [ -z "$ENDPOINT" ]; then
    echo "Error: --endpoint is required"
    exit 1
fi

# Get contract from history if not provided
if [ -z "$CONTRACT_ADDRESS" ]; then
    CONTRACT_ADDRESS=$(jq -r '.[-1].contractAddress' output/history.json 2>/dev/null)
    if [ -z "$CONTRACT_ADDRESS" ] || [ "$CONTRACT_ADDRESS" = "null" ]; then
        echo "Error: No contract address found"
        exit 1
    fi
fi

# Encode arguments
JSON_ARGS="["
for ((i=0; i<\${#ARGUMENTS[@]}; i++)); do
    ARG="\${ARGUMENTS[$i]}"

    if [[ "$ARG" == 0x* ]]; then
        HEX_VALUE="\${ARG#0x}"
        ENCODED=$(echo -n "$HEX_VALUE" | xxd -r -p | base64)
    else
        ENCODED=$(echo -n "$ARG" | base64)
    fi

    [[ $i -gt 0 ]] && JSON_ARGS="$JSON_ARGS,"
    JSON_ARGS="$JSON_ARGS\\"$ENCODED\\""
done
JSON_ARGS="$JSON_ARGS]"

# Build request
JSON_REQUEST="{\\"ScAddress\\":\\"$CONTRACT_ADDRESS\\",\\"FuncName\\":\\"$ENDPOINT\\",\\"Arguments\\":$JSON_ARGS}"

echo -e "\\033[1m\\033[34mQuerying $ENDPOINT...\\033[0m"
RESPONSE=$(curl -s 'https://api.testnet.klever.org/v1.0/sc/query' --data-raw "$JSON_REQUEST")

# Display response
echo "$RESPONSE" | jq -C .

# Decode return data if present
RETURN_DATA=$(echo "$RESPONSE" | jq -r '.data.returnData[]? // empty')
if [ -n "$RETURN_DATA" ]; then
    echo -e "\\n\\033[1m\\033[33mDecoded Data:\\033[0m"
    for data in $RETURN_DATA; do
        echo "Base64: $data"
        echo "Hex: $(echo "$data" | base64 -d | xxd -p)"
        echo "---"
    done
fi
\`\`\``,
    metadata: {
      title: 'Bash Script Functions for Klever Smart Contracts',
      description:
        'Reusable bash functions for Klever contract development, deployment, and testing',
      tags: ['bash', 'scripts', 'automation', 'deployment', 'testing', 'functions'],
      language: 'bash',
      relevanceScore: 0.9,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Documentation Context - Klever argument types for Koperator
  {
    type: 'documentation',
    content: `# Klever Argument Types for Koperator

## IMPORTANT: Always use type prefixes for arguments

When using koperator with sc invoke, ALL arguments must have type prefixes:

## Type Prefixes for --args
Based on koperator's encode function, use these type prefixes:

### Wrapper Types
- \`List:\` - List of values
- \`Option:\` - Optional value (can also use \`option\` prefix)
- \`tuple:\` - Tuple of values
- \`variadic:\` - Variable number of arguments

### Integer Types
- \`i8:\`, \`I8:\` - Signed 8-bit integer
- \`i16:\`, \`I16:\` - Signed 16-bit integer
- \`i32:\`, \`I32:\`, \`isize:\`, \`ISIZE:\` - Signed 32-bit integer
- \`i64:\`, \`I64:\` - Signed 64-bit integer
- \`u8:\`, \`U8:\` - Unsigned 8-bit integer
- \`u16:\`, \`U16:\` - Unsigned 16-bit integer
- \`u32:\`, \`U32:\`, \`usize:\`, \`USIZE:\` - Unsigned 32-bit integer
- \`u64:\`, \`U64:\` - Unsigned 64-bit integer

### Big Number Types
- \`BigInt:\`, \`bigint:\`, \`bi:\`, \`n:\`, \`BI:\`, \`N:\` - Big integers
- \`BigUint:\`, \`biguint:\` - Big unsigned integers (same as BigInt)
- \`BigFloat:\`, \`bigfloat:\`, \`bf:\`, \`BF:\`, \`f:\`, \`F:\` - Big float numbers

### Other Types
- \`Address:\`, \`address:\`, \`a:\`, \`A:\` - Klever address
- \`ManagedBuffer:\`, \`managedbuffer:\` - String/buffer
- \`TokenIdentifier:\`, \`tokenidentifier:\` - Token ID
- \`bytes:\` - Byte array
- \`BoxedBytes:\`, \`boxedbytes:\` - Boxed bytes
- \`String:\`, \`string:\` - String value
- \`Vec<u8>:\` - Vector of bytes
- \`&str:\` - String reference
- \`&[u8]:\` - Slice of bytes
- \`bool:\`, \`boolean:\`, \`b:\`, \`B:\` - Boolean
- \`empty\`, \`0\`, \`e\`, \`E\` - Empty/null value
- \`file:\`, \`code:\`, \`wasm:\` - File path
- \`hex:\` - Raw hex value

### Option Types
- Prefix any type with \`option\` for optional values
- Example: \`optionbi:1000\` or \`optionAddress:klv1...\`

## Examples with sc invoke

### Basic Types
\`\`\`bash
# BigUint amounts (multiple aliases work)
~/klever-sdk/koperator sc invoke CONTRACT_ADDRESS transfer \\
    --args Address:klv1... --args bi:1000000
# Also valid: --args a:klv1... --args BigUint:1000000

# Unsigned integers
~/klever-sdk/koperator sc invoke CONTRACT_ADDRESS setLimit \\
    --args u64:42

# Boolean values (multiple aliases)
~/klever-sdk/koperator sc invoke CONTRACT_ADDRESS setPaused \\
    --args bool:true
# Also valid: --args b:true or --args boolean:true

# String values (multiple types work)
~/klever-sdk/koperator sc invoke CONTRACT_ADDRESS setName \\
    --args String:"My Contract"
# Also valid: --args ManagedBuffer:"My Contract"
\`\`\`

## Complex Types

### Optional Values
\`\`\`bash
# Optional BigUint
--args optionbi:1000

# Optional Address (with value)
--args optionAddress:klv1...

# Empty optional (None)
--args empty
\`\`\`

### Multiple Arguments
\`\`\`bash
# Transfer with amount and recipient
~/klever-sdk/koperator sc invoke CONTRACT transfer \\
    --args Address:klv1recipient... \\
    --args bi:1000000

# Complex function with multiple types
~/klever-sdk/koperator sc invoke CONTRACT configure \\
    --args u32:100 \\
    --args String:"Config Name" \\
    --args bool:true \\
    --args Address:klv1admin...
\`\`\`

### Wrapper Types
\`\`\`bash
# List of addresses
--args List:Address:klv1addr1,klv1addr2,klv1addr3

# Optional value (using Option wrapper)
--args Option:bi:1000

# Tuple of mixed types
--args tuple:u32:100,String:hello,bool:true

# Variadic arguments
--args variadic:bi:100,bi:200,bi:300
\`\`\`

### File and Hex Arguments
\`\`\`bash
# Deploy with WASM file
--args file:/path/to/contract.wasm

# Raw hex data
--args hex:48656c6c6f20576f726c64

# Bytes from hex
--args bytes:0x48656c6c6f
\`\`\`

### Token Identifiers
\`\`\`bash
# Native tokens (no random identifier)
--args TokenIdentifier:KLV
--args TokenIdentifier:KFI

# KDA tokens (4 random characters)
--args TokenIdentifier:DVK-34ZH
--args TokenIdentifier:USDT-A1B2
--args TokenIdentifier:BTC-F3E4
\`\`\`

## Token Transfers

### Token Transfers with --values
\`\`\`bash
# Single token transfer
--values "KLV=1000000000"

# Multiple tokens (comma-separated)
--values "KLV=1000000000,KFI=500000,DVK-34ZH=250000"

# KDA transfers (custom tokens)
--values "USDT-A1B2=1000000"

# Complete example with sc invoke
~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke CONTRACT_ADDRESS deposit \\
    --values "KLV=1000000000" \\
    --await --sign --result-only

# Multiple token values in same transaction
~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke CONTRACT_ADDRESS multiDeposit \\
    --values "KLV=1000,KFI=2000,DVK-34ZH=3000" \\
    --await --sign --result-only
\`\`\`

### Important: --values Format
- Format: \\\`KDA_ID=AMOUNT\\\` (note the equals sign, not colon)
- Multiple values: comma-separated
- Native tokens: \\\`KLV\\\` and \\\`KFI\\\` (no random identifier)
- Custom KDAs: 4 random characters after hyphen (e.g., \\\`DVK-34ZH\\\`, \\\`USDT-A1B2\\\`)
- Examples:
  - Native: \\\`--values "KLV=1000000"\\\`
  - KDA: \\\`--values "DVK-34ZH=500000"\\\`
  - Multiple: \\\`--values "KLV=1000,KFI=2000,USDT-A1B2=3000"\\\`

## Advanced Examples

### Wrong vs Right
\`\`\`bash
# ❌ WRONG - No type prefixes
~/klever-sdk/koperator sc invoke CONTRACT transfer --args klv1... --args 1000

# ✅ CORRECT - With type prefixes
~/klever-sdk/koperator sc invoke CONTRACT transfer --args Address:klv1... --args bi:1000
\`\`\`

### Complex Data Structures
\`\`\`bash
# Struct-like data (represented as tuple with types)
--args tuple:u64:123,String:"John Doe",bool:true,Address:klv1addr123...

# For nested structures, each value needs its type
# This would typically be multiple separate --args calls
\`\`\`

### Option and Result Types
\`\`\`bash
# Some(value)
--args "some:500"

# None
--args "none"

# For Result types, typically return values, not input args
\`\`\`

## Initialization Arguments

### Contract Init
\`\`\`bash
# Simple init with owner
--init-args "klv1owner123..."

# Multiple init parameters
--init-args "klv1owner123...,1000000,\\"Token Name\\""

# Complex initialization
--init-args "klv1owner123...,1000000,[\\"admin1\\",\\"admin2\\"],true"
\`\`\`

### Contract Upgrade
\`\`\`bash
# Simple upgrade
--upgrade-args "2"  # version number

# Complex upgrade with data migration
--upgrade-args "2,true,\\"migration_data\\""
\`\`\`

## Type Conversion Examples

### From Rust Contract to Koperator Args

\`\`\`rust
// Rust endpoint signature
fn transfer(&self, to: ManagedAddress, amount: BigUint, data: OptionalValue<ManagedBuffer>)
\`\`\`

\`\`\`bash
# Koperator call - each argument needs its own --args with type
~/klever-sdk/koperator sc invoke CONTRACT transfer \\
    --args Address:klv1recipient123... \\
    --args bi:1000000 \\
    --args optionString:"transfer_memo"

# Or with empty for None
~/klever-sdk/koperator sc invoke CONTRACT transfer \\
    --args Address:klv1recipient123... \\
    --args bi:1000000 \\
    --args empty
\`\`\`

### Custom Types
\`\`\`rust
// Rust custom struct
pub struct UserData {
    pub id: u64,
    pub name: ManagedBuffer,
    pub active: bool,
}
\`\`\`

\`\`\`bash
# Koperator representation as tuple (with types)
--args tuple:u64:123,String:"John",bool:true
\`\`\`

## Common Encoding Issues

### Special Characters
\`\`\`bash
# Escape quotes properly in strings
--args String:"String with \\\\\\"quotes\\\\\\""

# Handle spaces
--args String:"String with spaces"
\`\`\`

### Large Numbers
\`\`\`bash
# For very large numbers, use BigUint
--args bi:999999999999999999999

# Or hex format with BigUint
--args bi:0xde0b6b3a7640000

# Or as a string if needed by the contract
--args String:"999999999999999999999"
\`\`\``,
    metadata: {
      title: 'Klever Argument Types for Koperator',
      description:
        'Complete reference for argument types and formatting when using Koperator CLI tool',
      tags: ['koperator', 'arguments', 'types', 'documentation', 'cli', 'reference'],
      language: 'bash',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },
  // CRITICAL: Understanding Token Types in Klever
  {
    type: 'best_practice',
    content: `# 🎯 CRITICAL: KlvTokenPayment vs KdaTokenPayment vs TokenIdentifier

## ⚠️ Common Confusion Points

Many developers get confused between these three. Here's the definitive guide:

### Quick Reference Table

| Type | What It Is | When to Use | Import Needed |
|------|------------|-------------|---------------|
| **TokenIdentifier::klv()** | Identifier for KLV token | Getting balances, checking token types | Already imported with \`klever_sc::imports::*\` |
| **KdaTokenPayment** | Structure for ANY token payment | Sending tokens, processing payments | Already imported with \`klever_sc::imports::*\` |
| **KlvTokenPayment** | ❌ DOES NOT EXIST | Never - use KdaTokenPayment | N/A |

## 🚨 THE MOST IMPORTANT THING TO KNOW

**There is NO \`KlvTokenPayment\` type!** Use \`KdaTokenPayment\` for ALL tokens including KLV.

## Common Operations with Examples

### 1️⃣ Getting KLV Balance
\`\`\`rust
#[endpoint]
fn get_contract_klv_balance(&self) -> BigUint {
    // ✅ CORRECT - Use TokenIdentifier::klv()
    self.blockchain().get_sc_balance(&TokenIdentifier::klv(), 0)
}

#[endpoint]
fn get_user_klv_balance(&self, address: ManagedAddress) -> BigUint {
    // ✅ CORRECT - Use TokenIdentifier::klv()
    self.blockchain().get_balance(&address, &TokenIdentifier::klv())
}
\`\`\`

### 2️⃣ Sending KLV - Three Ways
\`\`\`rust
#[endpoint]
fn send_klv_three_ways(&self, recipient: ManagedAddress, amount: BigUint) {
    // Method 1: Direct KLV (simplest for KLV only)
    self.send().direct_klv(&recipient, &amount);

    // Method 2: Using KdaTokenPayment (flexible, works for any token)
    let payment = KdaTokenPayment::new(
        TokenIdentifier::klv(),  // ✅ Use TokenIdentifier::klv()
        0,                        // nonce is 0 for fungible tokens
        amount
    );
    self.send().direct_payment(&recipient, &payment);

    // Method 3: Using direct_kda (also works)
    self.send().direct_kda(
        &recipient,
        &TokenIdentifier::klv(),
        0,
        &amount
    );
}
\`\`\`

### 3️⃣ Complete Withdraw Pattern
\`\`\`rust
#[only_owner]
#[endpoint]
fn withdraw_all(&self) {
    let owner = self.blockchain().get_owner_address();

    // Get KLV balance using TokenIdentifier::klv()
    let balance = self.blockchain()
        .get_sc_balance(&TokenIdentifier::klv(), 0);

    require!(balance > 0, "No KLV to withdraw");

    // Send using direct_klv (simplest for KLV)
    self.send().direct_klv(&owner, &balance);

    // Emit event
    self.withdraw_event(&owner, &balance);
}

#[event("withdraw")]
fn withdraw_event(
    &self,
    #[indexed] recipient: &ManagedAddress,
    #[indexed] amount: &BigUint,
);
\`\`\`

### 4️⃣ Processing Incoming Payments
\`\`\`rust
#[payable("*")]
#[endpoint]
fn process_payment(&self) {
    // Get the payment as KdaTokenPayment (works for ALL tokens)
    let payment: KdaTokenPayment<Self::Api> = self.call_value().any_payment();

    // Check if it's KLV
    if payment.token_identifier == TokenIdentifier::klv() {
        // Handle KLV payment
        self.handle_klv_payment(payment.amount);
    } else {
        // Handle other tokens
        self.handle_token_payment(payment);
    }
}

fn handle_klv_payment(&self, amount: BigUint) {
    // KLV-specific logic
    require!(amount >= BigUint::from(1_000_000u32), "Min 1 KLV required");
}

fn handle_token_payment(&self, payment: KdaTokenPayment<Self::Api>) {
    // Generic token logic
    self.store_payment(&payment);
}
\`\`\`

## ❌ Common Mistakes to Avoid

\`\`\`rust
// ❌ WRONG - KlvTokenPayment doesn't exist
let payment = KlvTokenPayment::new(...);  // Compilation error!

// ❌ WRONG - KlvTokenIdentifier doesn't exist
let id = KlvTokenIdentifier::klv();  // Compilation error!

// ❌ WRONG - Wrong type in function signature
fn process(&self, payment: KlvTokenPayment) {  // Compilation error!
    // ...
}
\`\`\`

## ✅ Always Remember

1. **TokenIdentifier::klv()** - For identifying KLV token
2. **KdaTokenPayment** - For ALL token payments (including KLV)
3. **direct_klv()** - Convenience method specifically for KLV
4. There is NO KlvTokenPayment type - always use KdaTokenPayment`,
    metadata: {
      title: 'CRITICAL: Token Types Clarification - KLV vs KDA',
      description: 'Complete guide clarifying KlvTokenPayment vs KdaTokenPayment vs TokenIdentifier confusion',
      tags: ['critical', 'tokens', 'klv', 'kda', 'payment', 'common-confusion', 'must-read'],
      language: 'rust',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // COMPREHENSIVE Koperator Argument Encoding Guide
  {
    type: 'best_practice',
    content: `# 📚 Complete Koperator Argument Encoding Guide

## 🎯 Quick Reference - Most Common Patterns

\`\`\`bash
# Basic Types
--args "u8:5"                    # Unsigned 8-bit integer (0-255)
--args "u32:1000"                # Unsigned 32-bit integer
--args "u64:1000000"             # Unsigned 64-bit integer
--args "bi:1000000"              # BigInt/BigUint (any size)
--args "String:hello world"      # String value
--args "Address:klv1abc..."      # Klever address
--args "bool:true"               # Boolean (true/false)

# Token Payments (using --values, not --args!)
--values "KLV=1000000"           # 1 KLV (6 decimals)
--values "KFI=500000"            # 0.5 KFI (6 decimals)
--values "DVK-34ZH=100000"       # Custom KDA token
--values "KLV=1000000,KFI=500000" # Multiple tokens

# NFT/SFT with nonce
--values "MYNFT-ABC1/42=1"       # NFT with nonce 42
--values "MYSFT-XYZ2/10=5"       # 5 SFTs with nonce 10
\`\`\`

## ⚠️ CRITICAL Rules

1. **Arguments use --args with type prefix**: \`--args "type:value"\`
2. **Payments use --values with equals sign**: \`--values "TOKEN=AMOUNT"\`
3. **Each argument needs its own --args flag**: Multiple args = multiple flags
4. **KLV/KFI use 6 decimals**: 1 KLV = 1,000,000 units

## 📊 Complete Type Reference Table

| Type | Prefix | Example | Description |
|------|--------|---------|-------------|
| **Unsigned 8-bit** | u8 | \`--args "u8:255"\` | 0 to 255 |
| **Unsigned 16-bit** | u16 | \`--args "u16:65535"\` | 0 to 65,535 |
| **Unsigned 32-bit** | u32 | \`--args "u32:4294967295"\` | 0 to ~4.3 billion |
| **Unsigned 64-bit** | u64 | \`--args "u64:18446744073709551615"\` | 0 to ~18.4 quintillion |
| **Signed 8-bit** | i8 | \`--args "i8:-128"\` | -128 to 127 |
| **Signed 16-bit** | i16 | \`--args "i16:-32768"\` | -32,768 to 32,767 |
| **Signed 32-bit** | i32 | \`--args "i32:-2147483648"\` | ~-2.1 to 2.1 billion |
| **Signed 64-bit** | i64 | \`--args "i64:-9223372036854775808"\` | Very large range |
| **BigUint** | bi, BigUint | \`--args "bi:999999999999999999"\` | Unlimited size |
| **Boolean** | bool, b | \`--args "bool:true"\` | true or false |
| **String** | String, ManagedBuffer | \`--args "String:Hello World"\` | Text data |
| **Address** | Address, a | \`--args "Address:klv1abc..."\` | Klever address |
| **TokenIdentifier** | TokenIdentifier | \`--args "TokenIdentifier:KLV"\` | Token ID |
| **Hex Data** | hex | \`--args "hex:48656c6c6f"\` | Raw hex bytes |
| **Base64** | base64 | \`--args "base64:SGVsbG8="\` | Base64 encoded |
| **Option (Some)** | option, Option | \`--args "option:bi:1000"\` | Optional value |
| **Option (None)** | empty, none | \`--args "empty"\` | No value |
| **List** | List | \`--args "List:u32:1,2,3,4,5"\` | Array of values |
| **Tuple** | tuple | \`--args "tuple:u32:100,String:test"\` | Multiple types |

## 🔥 Real-World Examples

### Example 1: Simple Transfer
\`\`\`bash
~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke klv1contract123... transfer \\
    --args "Address:klv1recipient456..." \\
    --args "bi:1000000" \\
    --await --sign --result-only
\`\`\`

### Example 2: Gaming Contract - Place Bet
\`\`\`bash
~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke klv1game789... placeBet \\
    --args "u8:6" \\                    # Betting on number 6
    --values "KLV=10000000" \\           # Betting 10 KLV
    --await --sign --result-only
\`\`\`

### Example 3: DeFi - Add Liquidity
\`\`\`bash
~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke klv1dex123... addLiquidity \\
    --args "bi:1000000" \\               # Min liquidity
    --values "KLV=5000000,DVK-34ZH=2500000" \\ # Multiple tokens
    --await --sign --result-only
\`\`\`

### Example 4: NFT Marketplace - List NFT
\`\`\`bash
~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke klv1market... listNFT \\
    --args "TokenIdentifier:MYNFT-ABC1" \\
    --args "u64:42" \\                   # NFT nonce
    --args "bi:50000000" \\              # Price: 50 KLV
    --values "MYNFT-ABC1/42=1" \\        # The NFT itself
    --await --sign --result-only
\`\`\`

### Example 5: Complex Configuration
\`\`\`bash
~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke klv1config... setParameters \\
    --args "String:MainPool" \\          # Pool name
    --args "u32:300" \\                  # Duration in seconds
    --args "bool:true" \\                # Is active
    --args "Address:klv1admin..." \\     # Admin address
    --args "bi:1000000" \\               # Min stake
    --args "option:u8:5" \\              # Optional fee percent
    --await --sign --result-only
\`\`\`

## 🔧 Advanced Patterns

### Optional Values
\`\`\`bash
# Some value
--args "option:bi:1000"           # Optional BigUint with value
--args "option:Address:klv1..."   # Optional address with value

# None/Empty
--args "empty"                    # No value (None)
--args "none"                     # Alternative for None
\`\`\`

### Lists and Arrays
\`\`\`bash
# List of numbers
--args "List:u32:100,200,300,400,500"

# List of addresses
--args "List:Address:klv1addr1,klv1addr2,klv1addr3"

# Variadic arguments (unbounded)
--args "variadic:bi:100,200,300"
\`\`\`

### Tuples (Multiple Types Together)
\`\`\`bash
# User struct: (id, name, active, balance)
--args "tuple:u64:123,String:Alice,bool:true,bi:1000000"
\`\`\`

### Token Identifiers
\`\`\`bash
# Native tokens (no random suffix)
--args "TokenIdentifier:KLV"
--args "TokenIdentifier:KFI"

# Custom KDA tokens (4 char random suffix)
--args "TokenIdentifier:DVK-34ZH"
--args "TokenIdentifier:USDT-A1B2"
\`\`\`

## ❌ Common Mistakes to Avoid

\`\`\`bash
# ❌ WRONG - Missing type prefix
--args "hello"                    # ERROR!

# ✅ CORRECT - With type prefix
--args "String:hello"

# ❌ WRONG - Using --args for payments
--args "KLV:1000000"              # ERROR!

# ✅ CORRECT - Use --values for payments
--values "KLV=1000000"

# ❌ WRONG - Colon in --values
--values "KLV:1000000"            # ERROR!

# ✅ CORRECT - Equals sign in --values
--values "KLV=1000000"

# ❌ WRONG - All args in one flag
--args "Address:klv1...,bi:1000" # ERROR!

# ✅ CORRECT - Separate flags
--args "Address:klv1..." --args "bi:1000"
\`\`\`

## 💰 Payment Patterns with --values

### Single Token Payment
\`\`\`bash
--values "KLV=1000000"            # 1 KLV
--values "KFI=500000"             # 0.5 KFI
--values "DVK-34ZH=100000"        # Custom token
\`\`\`

### Multiple Token Payments
\`\`\`bash
--values "KLV=1000000,KFI=500000,DVK-34ZH=250000"
\`\`\`

### NFT/SFT Transfers
\`\`\`bash
# NFT (amount must be 1)
--values "MYNFT-ABC1/42=1"        # NFT with nonce 42

# SFT (amount can be > 1)
--values "MYSFT-XYZ2/10=5"        # 5 SFTs with nonce 10

# Multiple NFTs/SFTs
--values "MYNFT-ABC1/42=1,MYSFT-XYZ2/10=3"
\`\`\`

## 📝 Complete Command Template

\`\`\`bash
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke CONTRACT_ADDRESS METHOD_NAME \\
    --args "type1:value1" \\
    --args "type2:value2" \\
    --values "TOKEN1=AMOUNT1,TOKEN2=AMOUNT2" \\
    --await --sign --result-only
\`\`\`

## 🎓 Pro Tips

1. **Decimals**: KLV and KFI use 6 decimals (1 KLV = 1,000,000)
2. **Big Numbers**: Use \`bi:\` prefix for amounts over u64 max
3. **Strings with Spaces**: Quote them: \`--args "String:Hello World"\`
4. **Multiple Args**: Each needs its own \`--args\` flag
5. **Token Format**: \`--values\` uses \`=\` not \`:\`
6. **NFT Format**: \`TOKEN_ID/NONCE=AMOUNT\` for NFTs/SFTs`,
    metadata: {
      title: 'Complete Koperator Argument Encoding Guide',
      description: 'Comprehensive guide for encoding arguments and payments in koperator commands',
      tags: ['koperator', 'arguments', 'encoding', 'payments', 'guide', 'reference', 'critical'],
      language: 'bash',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // KLV Token Identifier Usage
  {
    type: 'code_example',
    content: `# Correct KLV Token Identifier Usage

## Common Error
\`\`\`rust
// ❌ WRONG - This will cause compilation error
let balance = self.blockchain().get_sc_balance(&KlvTokenIdentifier::klv(), 0);
\`\`\`
Error: \`use of undeclared type 'KlvTokenIdentifier'\`

## Correct Usage
\`\`\`rust
// ✅ CORRECT - Use TokenIdentifier
let balance = self.blockchain().get_sc_balance(&TokenIdentifier::klv(), 0);

// For sending KLV
self.send().direct_klv(&recipient, &amount);

// For checking KLV payment
let klv_amount = self.call_value().klv_value();
\`\`\`

## Token Identifier Patterns
\`\`\`rust
// KLV token
TokenIdentifier::klv()

// KDA tokens
TokenIdentifier::from(&b"DVK-1234"[..])
TokenIdentifier::from(managed_buffer)

// Checking token type
if payment.token_identifier == TokenIdentifier::klv() {
    // Handle KLV payment
}
\`\`\``,
    metadata: {
      title: 'Correct KLV Token Identifier Usage',
      description: 'How to properly use TokenIdentifier for KLV and avoid common KlvTokenIdentifier error',
      tags: ['klv', 'token-identifier', 'balance', 'common-error'],
      language: 'rust',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-community',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },
  // Complete Lottery Game Example - Combining Multiple Patterns
  {
    type: 'code_example',
    content: `# Complete Lottery Game Contract - Combining Patterns

This example shows how to combine multiple patterns to create a complete lottery game contract.

\`\`\`rust
#![no_std]

use klever_sc::imports::*;

/// A complete lottery game combining multiple patterns:
/// - Admin control for game management
/// - Pausable functionality for emergencies
/// - Token payments for ticket purchases
/// - Random number generation for winner selection
/// - Storage patterns for tracking players and prizes
/// - Events for game state changes
#[klever_sc::contract]
pub trait Lottery:
    klever_sc_modules::pause::PauseModule
    + klever_sc_modules::only_admin::OnlyAdminModule
{
    #[init]
    fn init(&self, ticket_price: BigUint) {
        self.ticket_price().set(ticket_price);
        self.set_paused(false);
    }

    #[upgrade]
    fn upgrade(&self, _new_ticket_price: BigUint) {
        // do nothing for now, can be extended later
    }

    /// Buy lottery tickets - combines payable endpoint pattern
    #[payable("KLV")]
    #[endpoint(buyTickets)]
    fn buy_tickets(&self) {
        self.require_not_paused();

        let payment = self.call_value().klv_value();
        let ticket_price = self.ticket_price().get();

        require!(*payment >= ticket_price, "Insufficient payment");

        let tickets_bought = &*payment / &ticket_price;
        let caller = self.blockchain().get_caller();

        // Convert BigUint to u32 for ticket count
        let tickets_count = tickets_bought.to_u64().unwrap_or(0) as u32;
        require!(tickets_count > 0, "No tickets bought, payment too low");

        // Storage pattern - track player tickets
        self.player_tickets(&caller).update(|tickets| *tickets += tickets_count);

        // Add player to the set if not already present
        self.players().insert(caller.clone());

        self.total_tickets().update(|total| *total += tickets_count);

        // Add to prize pool
        self.prize_pool().update(|pool| *pool += &*payment);

        // Event pattern - notify ticket purchase
        self.ticket_purchased_event(&caller, tickets_count);
    }

    /// Draw winner - combines random generation and cross-contract patterns
    #[endpoint(drawWinner)]
    fn draw_winner(&self) {
        self.require_not_paused();
        self.require_caller_is_admin();

        let total = self.total_tickets().get();
        require!(total > 0u32, "No tickets sold");

        // Random number generation pattern
        let mut rand_source = RandomnessSource::new();
        let winning_ticket = rand_source.next_u32() % total;

        // Find winner by iterating through players
        let winner = self.find_winner_by_ticket(winning_ticket);

        // Transfer prize
        let prize = self.prize_pool().take();
        self.send().direct_klv(&winner, &prize);

        // Event pattern - announce winner
        self.winner_drawn_event(&winner, &prize, winning_ticket);

        // Reset for next round
        self.reset_lottery();
    }

    /// Admin function to set new ticket price
    #[endpoint(setTicketPrice)]
    fn set_ticket_price(&self, new_price: BigUint) {
        self.require_caller_is_admin();
        self.ticket_price().set(new_price);
    }

    /// Emergency withdraw - admin only
    #[endpoint(emergencyWithdraw)]
    fn emergency_withdraw(&self) {
        self.require_caller_is_admin();
        self.set_paused(true);

        let pool = self.prize_pool().take();
        let admin = self.blockchain().get_owner_address();
        self.send().direct_klv(&admin, &pool);
    }

    fn find_winner_by_ticket(&self, winning_ticket: u32) -> ManagedAddress {
        let mut current_ticket = 0u32;

        for player in self.players().iter() {
            let player_ticket_count = self.player_tickets(&player).get();
            current_ticket += player_ticket_count;

            if current_ticket > winning_ticket {
                return player;
            }
        }

        sc_panic!("Winner not found");
    }

    fn reset_lottery(&self) {
        // Clear all player tickets
        for player in self.players().iter() {
            self.player_tickets(&player).clear();
        }
        self.players().clear();
        self.total_tickets().clear();
    }

    // Storage patterns
    #[storage_mapper("ticket_price")]
    fn ticket_price(&self) -> SingleValueMapper<BigUint>;

    #[storage_mapper("player_tickets")]
    fn player_tickets(&self, player: &ManagedAddress) -> SingleValueMapper<u32>;

    #[storage_mapper("total_tickets")]
    fn total_tickets(&self) -> SingleValueMapper<u32>;

    #[storage_mapper("prize_pool")]
    fn prize_pool(&self) -> SingleValueMapper<BigUint>;

    #[storage_mapper("players")]
    fn players(&self) -> UnorderedSetMapper<ManagedAddress>;

    // Events
    #[event("ticketPurchased")]
    fn ticket_purchased_event(
        &self,
        #[indexed] player: &ManagedAddress,
        #[indexed] tickets: u32,
    );

    #[event("winnerDrawn")]
    fn winner_drawn_event(
        &self,
        #[indexed] winner: &ManagedAddress,
        #[indexed] prize: &BigUint,
        #[indexed] winning_ticket: u32,
    );
}
\`\`\`

## Patterns Used in This Example:
1. **Basic Contract Structure** - Foundation with #![no_std] and imports
2. **Admin Module** - Admin-only functions for game management
3. **Pausable Module** - Emergency stop functionality
4. **Payable Endpoints** - Accept KLV for ticket purchases
5. **Random Number Generation** - Select winner randomly
6. **Storage Mappers** - Track tickets, players, and prize pool
7. **Event Patterns** - Notify about purchases and winners
8. **Token Transfer** - Send prize to winner

This demonstrates how multiple patterns work together to create a complete dApp!`,
    metadata: {
      title: 'Complete Lottery Game Example',
      description: 'Full example combining multiple patterns for a lottery game',
      tags: ['gaming', 'lottery', 'complete-example', 'patterns', 'defi'],
      language: 'rust',
      relevanceScore: 0.95,
      contractType: 'gaming',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // CRITICAL: BigUint Type Handling and Comparisons
  {
    type: 'best_practice',
    content: `# 🔥 BigUint Type Handling - Avoiding Type Mismatch Errors

## Common Error: Type Mismatch in Comparisons

One of the most frequent errors in Klever smart contracts is type mismatch when comparing BigUint values:

\`\`\`
error[E0277]: can't compare \`BigUint<Self::Api>\` with \`&BigUint<Self::Api>\`
\`\`\`

## ⚠️ IMPORTANT: ManagedRef<BigUint> from call_value()

The \`call_value().klv_value()\` and similar methods return \`ManagedRef<BigUint>\`, not \`BigUint\`!

### Handling ManagedRef<BigUint>
\`\`\`rust
#[payable("KLV")]
fn receive_payment(&self) {
    // ⚠️ payment is ManagedRef<BigUint>, not BigUint!
    let payment = self.call_value().klv_value();
    let min_amount = self.min_amount().get();  // This is BigUint

    // ✅ CORRECT - Dereference ManagedRef with *
    require!(*payment >= min_amount, "Below minimum");

    // ✅ CORRECT - Use &* for arithmetic and updates
    self.balance().update(|b| *b += &*payment);

    // ❌ WRONG - Type mismatch
    // require!(payment >= min_amount, "Below minimum");  // ERROR!
}
\`\`\`

## ✅ Correct Comparison Patterns

### Pattern 1: Both Owned Values
\`\`\`rust
fn compare_owned(&self, amount: BigUint, balance: BigUint) {
    if amount <= balance {
        // Both are owned values - works perfectly
    }
}
\`\`\`

### Pattern 2: Both Borrowed References
\`\`\`rust
fn compare_borrowed(&self, amount: &BigUint, balance: &BigUint) {
    if amount <= balance {
        // Both are references - works perfectly
    }
}
\`\`\`

### Pattern 3: Mixed Ownership - Use References
\`\`\`rust
fn compare_mixed(&self, amount: BigUint, balance: &BigUint) {
    // Convert owned to reference using &
    if &amount <= balance {
        // Now both are references - works!
    }

    // Or the other way
    if amount <= balance.clone() {
        // Clone the reference to owned - also works but less efficient
    }
}
\`\`\`

### Pattern 4: ManagedRef<BigUint> Comparisons
\`\`\`rust
fn compare_managed_ref(&self) {
    let payment = self.call_value().klv_value();  // ManagedRef<BigUint>
    let balance = self.balance().get();           // BigUint

    // ✅ Dereference ManagedRef
    if *payment <= balance {
        // Works!
    }

    // ✅ Or use references
    if &*payment <= &balance {
        // Also works!
    }
}
\`\`\`

## 📋 Complete Reference Guide

### Comparisons
\`\`\`rust
// ✅ CORRECT - All these work
if amount <= balance { }           // Both owned
if &amount <= &balance { }         // Both borrowed
if &amount <= balance { }           // Left ref, right ref
if amount <= balance.clone() { }   // Left owned, right cloned

// ❌ WRONG - Type mismatch
if amount <= &balance { }          // Owned vs borrowed - ERROR!
\`\`\`

### Arithmetic Operations
\`\`\`rust
// Addition
let sum1 = &amount + &balance;     // Both refs ✅
let sum2 = amount.clone() + balance.clone(); // Both owned ✅
let sum3 = amount + &balance;      // ERROR ❌

// Subtraction
let diff1 = &balance - &amount;    // Both refs ✅
let diff2 = balance.clone() - amount.clone(); // Both owned ✅
let diff3 = balance - &amount;     // ERROR ❌

// Multiplication/Division
let product = &amount * &BigUint::from(2u32); // Refs ✅
let quotient = &balance / &divisor; // Refs ✅
\`\`\`

### Storage Updates with BigUint
\`\`\`rust
// Update patterns
self.balance(&user).update(|b| *b += &amount);  // Use reference ✅
self.balance(&user).update(|b| *b -= &amount);  // Use reference ✅
self.balance(&user).update(|b| *b += amount);   // ERROR ❌

// Setting values
self.balance(&user).set(amount);           // Owned value ✅
self.balance(&user).set(&amount);          // ERROR ❌
self.balance(&user).set(amount.clone());   // Clone if needed ✅
\`\`\`

## 🎯 Real-World Examples

### Example 1: Transfer Function
\`\`\`rust
#[endpoint]
fn transfer(&self, to: ManagedAddress, amount: BigUint) {
    let caller = self.blockchain().get_caller();
    let balance = self.balances(&caller).get();

    // ✅ CORRECT - Compare owned values
    require!(balance >= amount, "Insufficient balance");

    // ✅ CORRECT - Use references in updates
    self.balances(&caller).update(|b| *b -= &amount);
    self.balances(&to).update(|b| *b += &amount);
}
\`\`\`

### Example 2: Checking Multiple Conditions
\`\`\`rust
#[endpoint]
fn complex_check(&self, amount: BigUint) {
    let min_amount = BigUint::from(100u32);
    let max_amount = BigUint::from(10000u32);
    let user_balance = self.get_user_balance();

    // ✅ All comparisons use consistent types
    require!(
        &amount >= &min_amount && &amount <= &max_amount,
        "Amount out of range"
    );

    require!(
        &user_balance >= &amount,
        "Insufficient balance"
    );

    // Process the amount...
}
\`\`\`

### Example 3: Fee Calculation
\`\`\`rust
fn calculate_with_fee(&self, amount: &BigUint) -> BigUint {
    let fee_percent = BigUint::from(3u32);  // 3%
    let hundred = BigUint::from(100u32);

    // ✅ Calculate fee using references
    let fee = amount * &fee_percent / &hundred;

    // ✅ Return total using references
    amount + &fee
}
\`\`\`

## 💡 Best Practices

1. **Prefer References**: Use \`&\` for comparisons and arithmetic to avoid unnecessary clones
2. **Be Consistent**: If one side is a reference, make the other a reference too
3. **Clone Sparingly**: Only clone when you need ownership (e.g., storing in storage)
4. **Update Pattern**: Always use \`|b| *b += &amount\` in storage updates

## 🚨 Quick Fix Cheat Sheet

| Error | Fix |
|-------|-----|
| Can't compare \`BigUint\` with \`&BigUint\` | Add \`&\` to the owned value: \`&amount <= balance\` |
| Can't compare \`ManagedRef<BigUint>\` with \`BigUint\` | Dereference with \`*\`: \`*payment <= balance\` |
| Can't add \`BigUint\` to \`&BigUint\` | Use references: \`&amount + &balance\` |
| Can't add to \`ManagedRef<BigUint>\` | Dereference: \`*b += &*payment\` |
| Expected \`BigUint\`, found \`&BigUint\` | Clone if needed: \`balance.clone()\` |
| Expected \`BigUint\`, found \`ManagedRef<BigUint>\` | Dereference: \`*payment\` or clone: \`payment.clone_value()\` |
| Can't subtract \`&BigUint\` from \`BigUint\` | Use references: \`&balance - &amount\` |`,
    metadata: {
      title: 'BigUint Type Handling and Comparison Patterns',
      description: 'Complete guide to avoiding type mismatch errors with BigUint in Klever smart contracts',
      tags: ['critical', 'biguint', 'types', 'comparison', 'arithmetic', 'common-error', 'ownership'],
      language: 'rust',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // BigUint Advanced Patterns Example
  {
    type: 'code_example',
    content: `# Complete BigUint Example - Staking Contract

This example demonstrates all BigUint patterns in a real staking contract:

\`\`\`rust
#![no_std]

use klever_sc::imports::*;

#[klever_sc::contract]
pub trait StakingContract {
    #[init]
    fn init(&self, min_stake: BigUint, reward_rate: BigUint) {
        self.min_stake().set(min_stake);
        self.reward_rate().set(reward_rate);  // Rate per 1000 staked per day
    }

    #[payable("KLV")]
    #[endpoint]
    fn stake(&self) {
        let payment = self.call_value().klv_value();
        let min_stake = self.min_stake().get();

        // ✅ Comparison - both owned values
        require!(*payment >= min_stake, "Below minimum stake");

        let caller = self.blockchain().get_caller();
        let timestamp = self.blockchain().get_block_timestamp();

        // ✅ Storage update using reference
        self.staked_amount(&caller).update(|amount| *amount += &*payment);
        self.stake_timestamp(&caller).set(timestamp);

        // ✅ Update total using reference
        self.total_staked().update(|total| *total += &*payment);
    }

    #[endpoint]
    fn calculate_rewards(&self, user: ManagedAddress) -> BigUint {
        let staked = self.staked_amount(&user).get();
        let stake_time = self.stake_timestamp(&user).get();
        let current_time = self.blockchain().get_block_timestamp();

        // ✅ Comparison with zero
        if staked == BigUint::zero() {
            return BigUint::zero();
        }

        // Calculate time staked (in seconds)
        let time_staked = current_time - stake_time;
        let days_staked = BigUint::from(time_staked / 86400u64);

        // ✅ Complex arithmetic with references
        let reward_rate = self.reward_rate().get();
        let thousand = BigUint::from(1000u32);

        // rewards = (staked * reward_rate * days) / 1000
        &staked * &reward_rate * &days_staked / &thousand
    }

    #[endpoint]
    fn unstake(&self, amount: BigUint) {
        let caller = self.blockchain().get_caller();
        let staked = self.staked_amount(&caller).get();

        // ✅ Comparison - both owned
        require!(amount > BigUint::zero(), "Invalid amount");
        require!(staked >= amount, "Insufficient staked amount");

        // Calculate and add rewards first
        let rewards = self.calculate_rewards(caller.clone());

        // ✅ Update staked amount using reference
        self.staked_amount(&caller).update(|s| *s -= &amount);

        // ✅ Calculate total to send (stake + rewards)
        let total_amount = &amount + &rewards;

        // ✅ Update total staked
        self.total_staked().update(|t| *t -= &amount);

        // Send funds
        self.send().direct_klv(&caller, &total_amount);

        // Emit event
        self.unstake_event(&caller, &amount, &rewards);
    }

    #[endpoint]
    fn compound_rewards(&self) {
        let caller = self.blockchain().get_caller();
        let rewards = self.calculate_rewards(caller.clone());

        // ✅ Check rewards > 0
        require!(&rewards > &BigUint::zero(), "No rewards to compound");

        // ✅ Add rewards to stake using reference
        self.staked_amount(&caller).update(|s| *s += &rewards);
        self.total_staked().update(|t| *t += &rewards);

        // Reset timestamp
        let timestamp = self.blockchain().get_block_timestamp();
        self.stake_timestamp(&caller).set(timestamp);
    }

    // Advanced: Calculate percentage
    fn calculate_percentage(&self, amount: &BigUint, percentage: u32) -> BigUint {
        let hundred = BigUint::from(100u32);
        let perc = BigUint::from(percentage);

        // ✅ All references in calculation
        amount * &perc / &hundred
    }

    // Storage
    #[storage_mapper("min_stake")]
    fn min_stake(&self) -> SingleValueMapper<BigUint>;

    #[storage_mapper("reward_rate")]
    fn reward_rate(&self) -> SingleValueMapper<BigUint>;

    #[storage_mapper("staked_amount")]
    fn staked_amount(&self, user: &ManagedAddress) -> SingleValueMapper<BigUint>;

    #[storage_mapper("stake_timestamp")]
    fn stake_timestamp(&self, user: &ManagedAddress) -> SingleValueMapper<u64>;

    #[storage_mapper("total_staked")]
    fn total_staked(&self) -> SingleValueMapper<BigUint>;

    // Events
    #[event("unstake")]
    fn unstake_event(
        &self,
        #[indexed] user: &ManagedAddress,
        #[indexed] amount: &BigUint,
        #[indexed] rewards: &BigUint,
    );
}
\`\`\`

## Key Patterns Demonstrated:
1. **Comparisons**: \`payment >= min_stake\`, \`staked >= amount\`
2. **Storage Updates**: \`*amount += &payment\`, \`*s -= &amount\`
3. **Arithmetic**: \`&amount + &rewards\`, \`amount * &perc / &hundred\`
4. **Zero Checks**: \`amount > BigUint::zero()\`
5. **Complex Calculations**: Multi-step reward calculation with references`,
    metadata: {
      title: 'BigUint Complete Example - Staking Contract',
      description: 'Full contract demonstrating all BigUint patterns and best practices',
      tags: ['biguint', 'example', 'staking', 'arithmetic', 'comparison'],
      language: 'rust',
      relevanceScore: 0.95,
      contractType: 'defi',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Practical Token Operations Examples
  {
    type: 'code_example',
    content: `# Practical Token Operations - Complete Examples

## Example 1: Fee Collection Contract
\`\`\`rust
#![no_std]

use klever_sc::imports::*;

#[klever_sc::contract]
pub trait FeeCollector {
    #[init]
    fn init(&self, fee_amount: BigUint) {
        self.fee_amount().set(fee_amount);
    }

    // Collect fee in KLV
    #[payable("KLV")]
    #[endpoint]
    fn pay_fee(&self) {
        let payment = self.call_value().klv_value();  // ManagedRef<BigUint>
        let required_fee = self.fee_amount().get();

        // ✅ Dereference ManagedRef for comparison
        require!(*payment >= required_fee, "Insufficient fee");

        // Store user as paid
        let caller = self.blockchain().get_caller();
        self.has_paid(&caller).set(true);

        // Return excess if any
        if *payment > required_fee {
            let excess = &*payment - &required_fee;
            self.send().direct_klv(&caller, &excess);
        }
    }

    // Withdraw collected fees
    #[only_owner]
    #[endpoint]
    fn withdraw_fees(&self) {
        let owner = self.blockchain().get_owner_address();
        let balance = self.blockchain()
            .get_sc_balance(&TokenIdentifier::klv(), 0);

        self.send().direct_klv(&owner, &balance);
    }

    #[storage_mapper("fee_amount")]
    fn fee_amount(&self) -> SingleValueMapper<BigUint>;

    #[storage_mapper("has_paid")]
    fn has_paid(&self, user: &ManagedAddress) -> SingleValueMapper<bool>;
}
\`\`\`

## Example 2: Token Swap Contract
\`\`\`rust
#[klever_sc::contract]
pub trait TokenSwap {
    // Swap any token for KLV
    #[payable("*")]
    #[endpoint]
    fn swap_for_klv(&self) {
        let payment: KdaTokenPayment<Self::Api> = self.call_value().any_payment();

        // Don't accept KLV (no point swapping KLV for KLV)
        require!(
            payment.token_identifier != TokenIdentifier::klv(),
            "Cannot swap KLV for KLV"
        );

        // Calculate KLV amount based on rates
        let klv_amount = self.calculate_klv_amount(&payment);

        // Check we have enough KLV
        let klv_balance = self.blockchain()
            .get_sc_balance(&TokenIdentifier::klv(), 0);
        require!(klv_balance >= klv_amount, "Insufficient KLV liquidity");

        // Send KLV to user
        let caller = self.blockchain().get_caller();
        self.send().direct_klv(&caller, &klv_amount);

        // Store the received token
        self.store_token_payment(payment);
    }

    fn calculate_klv_amount(&self, payment: &KdaTokenPayment<Self::Api>) -> BigUint {
        // Your rate calculation logic here
        payment.amount.clone() // Simplified 1:1 for example
    }

    fn store_token_payment(&self, payment: KdaTokenPayment<Self::Api>) {
        // Store received tokens for later withdrawal
    }
}
\`\`\`

## Example 3: Mixed Token Treasury
\`\`\`rust
#[klever_sc::contract]
pub trait Treasury {
    // Accept any token deposit
    #[payable("*")]
    #[endpoint]
    fn deposit(&self) {
        let payment: KdaTokenPayment<Self::Api> = self.call_value().any_payment();
        let caller = self.blockchain().get_caller();

        // Track different token types differently
        if payment.token_identifier == TokenIdentifier::klv() {
            // Track KLV deposits
            self.klv_deposits(&caller)
                .update(|balance| *balance += payment.amount);
        } else {
            // Track other token deposits
            self.token_deposits(&caller)
                .push(&payment);
        }
    }

    // Withdraw specific token
    #[endpoint]
    fn withdraw(&self, token: TokenIdentifier, amount: BigUint) {
        let caller = self.blockchain().get_caller();

        if token == TokenIdentifier::klv() {
            // Withdraw KLV
            let balance = self.klv_deposits(&caller).get();
            require!(balance >= amount, "Insufficient KLV balance");

            self.klv_deposits(&caller)
                .update(|b| *b -= &amount);
            self.send().direct_klv(&caller, &amount);
        } else {
            // Withdraw other tokens
            // Implementation for other tokens...
        }
    }

    #[storage_mapper("klv_deposits")]
    fn klv_deposits(&self, user: &ManagedAddress) -> SingleValueMapper<BigUint>;

    #[storage_mapper("token_deposits")]
    fn token_deposits(&self, user: &ManagedAddress) -> VecMapper<KdaTokenPayment<Self::Api>>;
}
\`\`\``,
    metadata: {
      title: 'Practical Token Operations Examples',
      description: 'Complete examples showing KLV and token operations in real contracts',
      tags: ['examples', 'tokens', 'klv', 'practical', 'treasury', 'swap', 'fee'],
      language: 'rust',
      relevanceScore: 0.95,
      contractType: 'defi',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Random Number Generation
  {
    type: 'code_example',
    content: `# Secure Random Number Generation in Klever

## 🎲 How RandomnessSource Works Internally

The \`RandomnessSource\` in Klever provides cryptographically secure randomness by combining multiple entropy sources at the blockchain level. Here's how it works:

### Internal Mechanism

When you call \`RandomnessSource::new()\`, the blockchain internally initializes a randomizer using:

1. **Previous Block Random Seed** - Random seed from the previous block
2. **Current Block Random Seed** - Random seed from the current block
3. **Transaction Hash** - Unique hash of the current transaction

These are combined to create a deterministic but unpredictable random seed:

\`\`\`go
// This is what happens internally in the Klever node:
func (context *managedTypesContext) initRandomizer() {
    blockchainContext := context.host.Blockchain()
    previousRandomSeed := blockchainContext.LastRandomSeed()
    currentRandomSeed := blockchainContext.CurrentRandomSeed()
    txHash := context.host.Runtime().GetCurrentTxHash()

    // Combine all entropy sources
    blocksRandomSeed := append(previousRandomSeed, currentRandomSeed...)
    randomSeed := append(blocksRandomSeed, txHash...)

    // Create a deterministic random generator
    randomizer := math.NewSeedRandReader(randomSeed)
    context.randomnessGenerator = randomizer
}
\`\`\`

### Key Properties

- **Deterministic**: Same transaction will always produce same random numbers (important for consensus)
- **Unpredictable**: Cannot be predicted before block is produced
- **Secure**: Combines multiple entropy sources making it resistant to manipulation
- **Per-Transaction**: Each transaction gets its own unique random seed

## Method 1: Using RandomnessSource (Recommended)
\`\`\`rust
use klever_sc::api::RandomnessSource;

fn generate_random_u8(&self) -> u8 {
    // This internally calls SetRandom blockchain function
    // which initializes the randomizer with combined entropy
    let mut rand_source = RandomnessSource::new();
    rand_source.next_u8()
}

// For dice (1-6)
fn roll_dice_v1(&self) -> u8 {
    let mut rand_source = RandomnessSource::new();
    let random = rand_source.next_u8();
    (random % 6) + 1
}

// Generate multiple random numbers from same source
fn generate_multiple_randoms(&self) -> (u8, u32, u64) {
    let mut rand_source = RandomnessSource::new();

    // All these use the same initialized seed
    let random_u8 = rand_source.next_u8();
    let random_u32 = rand_source.next_u32();
    let random_u64 = rand_source.next_u64();

    (random_u8, random_u32, random_u64)
}
\`\`\`

## Method 2: Using Block Random Seed (Alternative)
\`\`\`rust
use klever_sc::imports::*;

// Using block random seed (based on validator signatures)
fn generate_random_from_block(&self) -> u8 {
    let seed = self.blockchain().get_block_random_seed();
    // Use the seed to generate random
    let random_bytes = seed.as_managed_buffer().to_boxed_bytes();
    random_bytes.as_slice()[0]
}

// For dice using block seed
fn roll_dice_v2(&self) -> u8 {
    let seed = self.blockchain().get_block_random_seed();
    let bytes = seed.as_managed_buffer().to_boxed_bytes();
    (bytes.as_slice()[0] % 6) + 1
}
\`\`\`

## Method 3: Combined Seed with Transaction Hash (Most Secure)
\`\`\`rust
use klever_sc::imports::*;

// Combining block seed with tx hash for better entropy
fn generate_secure_random(&self) -> u8 {
    let mut rand = Rand::new(
        self.blockchain().get_block_random_seed(),
        self.blockchain().get_tx_hash(),
    );
    rand.next_u8()
}

// For dice with combined entropy
fn roll_dice_v3(&self) -> u8 {
    let mut rand = Rand::new(
        self.blockchain().get_block_random_seed(),
        self.blockchain().get_tx_hash(),
    );
    (rand.next_u8() % 6) + 1
}

// Generate random in range
fn random_in_range(&self, min: u64, max: u64) -> u64 {
    let mut rand = Rand::new(
        self.blockchain().get_block_random_seed(),
        self.blockchain().get_tx_hash(),
    );
    let range = max - min + 1;
    min + (rand.next_u64() % range)
}
\`\`\`

## Best Practices for Randomness

### ✅ DO:
- Use \`RandomnessSource\` for most random generation needs
- Generate all random numbers needed in a single transaction from one source
- Remember that randomness is deterministic per transaction (for consensus)
- Use modulo operations for bounded ranges

### ❌ DON'T:
- Don't use timestamp alone as a random source (predictable)
- Don't use caller address or nonce as entropy (manipulable)
- Don't generate random numbers in view functions (no tx context)
- Don't rely on randomness for high-value decisions without additional verification

## Common Use Cases

### Shuffling an Array
\`\`\`rust
fn shuffle_array(&self, items: &mut ManagedVec<u32>) {
    let mut rand_source = RandomnessSource::new();
    let len = items.len();

    for i in 0..len {
        let j = rand_source.next_u32() % (len - i) + i;
        // Swap items[i] and items[j]
        let temp = items.get(i);
        items.set(i, items.get(j));
        items.set(j, temp);
    }
}
\`\`\`

### Weighted Random Selection
\`\`\`rust
fn weighted_random_selection(&self, weights: &ManagedVec<u32>) -> usize {
    let mut rand_source = RandomnessSource::new();
    let total_weight: u32 = weights.iter().sum();
    let random_weight = rand_source.next_u32() % total_weight;

    let mut cumulative = 0u32;
    for (index, weight) in weights.iter().enumerate() {
        cumulative += weight;
        if random_weight < cumulative {
            return index;
        }
    }

    weights.len() - 1
}
\`\`\`

## Complete Example: Lottery Contract
\`\`\`rust
#[klever_sc::contract]
pub trait LotteryContract {
    #[endpoint(drawWinner)]
    fn draw_winner(&self) -> ManagedAddress {
        let participants = self.participants().len();
        require!(participants > 0, "No participants");

        // Use combined entropy for fairness
        let mut rand = Rand::new(
            self.blockchain().get_block_random_seed(),
            self.blockchain().get_tx_hash(),
        );

        let winner_index = rand.next_usize() % participants;
        let winner = self.participants().get(winner_index);

        self.winner_drawn_event(&winner, winner_index);
        winner
    }

    #[storage_mapper("participants")]
    fn participants(&self) -> ManagedVec<ManagedAddress>;

    #[event("winnerDrawn")]
    fn winner_drawn_event(
        &self,
        #[indexed] winner: &ManagedAddress,
        #[indexed] index: usize,
    );
}
\`\`\`

## Comparison of Methods

| Method | Security | Gas Cost | Use Case |
|--------|----------|----------|----------|
| RandomnessSource | Good | Low | Simple random needs |
| Block Random Seed | Better | Low | Games, lotteries |
| Combined Seed | Best | Medium | High-stakes games |

## Important Security Notes
1. **Block random seed** is based on validator signatures - more secure than RandomnessSource
2. **Combining with tx hash** prevents prediction even if validator colludes
3. **Never use** block timestamp or block nonce alone - predictable!
4. **For critical randomness** (large prizes), use Method 3
5. **Randomness is deterministic** within same block/tx - design accordingly

## Anti-Patterns to Avoid
\`\`\`rust
// ❌ NEVER DO THIS - Predictable!
fn bad_random(&self) -> u8 {
    let timestamp = self.blockchain().get_block_timestamp();
    (timestamp % 6) as u8 + 1  // Miners can manipulate!
}

// ❌ NEVER DO THIS - Same result for all calls in block
fn bad_random_v2(&self) -> u8 {
    let nonce = self.blockchain().get_block_nonce();
    (nonce % 6) as u8 + 1  // Too predictable!
}
\`\`\``,
    metadata: {
      title: 'Secure Random Number Generation - Complete Guide',
      description: 'Comprehensive guide explaining how RandomnessSource works internally with blockchain entropy sources, plus best practices and common patterns',
      tags: ['random', 'security', 'best-practice', 'randomness', 'validator-signature', 'randomness-source', 'entropy', 'blockchain', 'gaming'],
      language: 'rust',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-community',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },
];

// Deployment Scripts
export const deploymentScripts: ContextPayload[] = [
  // Contract Address Extraction Pattern
  {
    type: 'code_example',
    content: `# Extract Contract Address from Deployment Output

When deploying a contract with koperator, extract the address from the SCDeploy event:

\`\`\`bash
# Deploy and capture output
DEPLOY_OUTPUT=$(KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc create \\
    --wasm="contract.wasm" \\
    --await --sign --result-only)

# Extract contract address using Python
CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    if 'logs' in data and 'events' in data['logs']:
        for event in data['logs']['events']:
            if event.get('identifier') == 'SCDeploy':
                print(event.get('address', ''))
                break
except: pass
" 2>/dev/null)

# Extract transaction hash
TX_HASH=$(echo "$DEPLOY_OUTPUT" | grep -o '"hash": "[^"]*"' | head -1 | cut -d'"' -f4)
\`\`\``,
    metadata: {
      title: 'Extract Contract Address from Deploy Output',
      description: 'Pattern for parsing koperator deployment response to get contract address',
      tags: ['deployment', 'parsing', 'SCDeploy', 'python', 'bash'],
      language: 'bash',
      relevanceScore: 0.95,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // History.json Pattern
  {
    type: 'best_practice',
    content: `# Deployment History Management Pattern

Maintain a history.json file to track all deployments:

\`\`\`bash
# Initialize history file
HISTORY_FILE="output/history.json"
[ ! -f "$HISTORY_FILE" ] && echo "[]" > "$HISTORY_FILE"

# Add deployment to history
jq --arg tx "$TX_HASH" --arg addr "$CONTRACT_ADDRESS" \\
   '. + [{"hash": $tx, "contractAddress": $addr, "timestamp": now | strftime("%Y-%m-%d %H:%M:%S")}]' \\
   "$HISTORY_FILE" > "$HISTORY_FILE.tmp" && mv "$HISTORY_FILE.tmp" "$HISTORY_FILE"

# Get latest deployed contract
CONTRACT_ADDRESS=$(jq -r '.[-1].contractAddress' output/history.json 2>/dev/null)

# Get all deployments
jq '.' output/history.json
\`\`\`

Benefits:
- Automatic contract tracking
- No need to manually copy addresses
- Deployment audit trail
- Easy upgrades and queries`,
    metadata: {
      title: 'Deployment History Management',
      description: 'Best practice for tracking contract deployments with history.json',
      tags: ['deployment', 'history', 'jq', 'best-practice', 'automation'],
      language: 'bash',
      relevanceScore: 0.9,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Query Argument Encoding Pattern
  {
    type: 'code_example',
    content: `# Query Endpoint Argument Encoding

For querying Klever smart contracts via API, arguments must be base64 encoded:

\`\`\`bash
# Encode arguments for query
ARGUMENTS=("arg1" "arg2" "0x48656c6c6f")
JSON_ARGS="["

for ((i=0; i<\${#ARGUMENTS[@]}; i++)); do
    ARG="\${ARGUMENTS[$i]}"

    # Special handling for hex values
    if [[ "$ARG" == 0x* ]]; then
        HEX_VALUE="\${ARG#0x}"
        ENCODED=$(echo -n "$HEX_VALUE" | xxd -r -p | base64)
    else
        ENCODED=$(echo -n "$ARG" | base64)
    fi

    [[ $i -gt 0 ]] && JSON_ARGS="$JSON_ARGS,"
    JSON_ARGS="$JSON_ARGS\\"$ENCODED\\""
done
JSON_ARGS="$JSON_ARGS]"

# Build and send query
JSON_REQUEST="{\\"ScAddress\\":\\"$CONTRACT_ADDRESS\\",\\"FuncName\\":\\"$ENDPOINT\\",\\"Arguments\\":$JSON_ARGS}"
RESPONSE=$(curl -s 'https://api.testnet.klever.org/v1.0/sc/query' --data-raw "$JSON_REQUEST")

# Decode return data
RETURN_DATA=$(echo "$RESPONSE" | jq -r '.data.returnData[]? // empty')
for data in $RETURN_DATA; do
    echo "Base64: $data"
    echo "Hex: $(echo "$data" | base64 -d | xxd -p)"
done
\`\`\``,
    metadata: {
      title: 'Query Argument Encoding Pattern',
      description: 'How to encode arguments for Klever API queries with special hex handling',
      tags: ['query', 'api', 'base64', 'encoding', 'hex'],
      language: 'bash',
      relevanceScore: 0.95,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  // Project Structure Handling
  {
    type: 'best_practice',
    content: `# Handling ksc new Project Structure

The \`ksc new\` command may create projects in different structures:

\`\`\`bash
# Create in temp directory first
TEMP_DIR="/tmp/klever-contract-$$"
~/klever-sdk/ksc new --template "$TEMPLATE" --name "$CONTRACT_NAME" --path "$TEMP_DIR"

# Find actual project directory
PROJECT_DIR=""
if [ -d "$TEMP_DIR/$CONTRACT_NAME" ]; then
    # Created in subdirectory
    PROJECT_DIR="$TEMP_DIR/$CONTRACT_NAME"
elif [ -d "$TEMP_DIR" ] && [ "$(ls -A $TEMP_DIR)" ]; then
    # Created directly in temp dir
    PROJECT_DIR="$TEMP_DIR"
fi

# Move files including hidden ones
cp -r "$PROJECT_DIR"/* . 2>/dev/null || true
cp -r "$PROJECT_DIR"/.[^.]* . 2>/dev/null || true

# Clean up
rm -rf "$TEMP_DIR"
\`\`\`

Important: Always handle both subdirectory and direct creation patterns.`,
    metadata: {
      title: 'Project Structure Handling for ksc new',
      description: 'Best practice for handling different project creation patterns',
      tags: ['ksc', 'project', 'structure', 'best-practice'],
      language: 'bash',
      relevanceScore: 0.85,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },
  {
    type: 'deployment_tool',
    content: `# List all available Klever smart contract templates
~/klever-sdk/ksc templates

# This command will display all available templates that can be used with ksc new
# Example output:
# Available templates:
# - empty: Basic contract structure with init function
# - adder: Simple contract with add functionality
# - ping-pong: Example contract demonstrating message passing
# - crowdfunding: Crowdfunding contract example
# - multisig: Multi-signature wallet implementation
# - lottery: Lottery contract example
# - staking: Token staking contract
# - marketplace: NFT marketplace contract

# To use a template:
~/klever-sdk/ksc new --template <template-name> --name <contract-name> --path <path>`,
    metadata: {
      title: 'List Available Klever Contract Templates',
      description: 'Command to list all available smart contract templates in the Klever SDK',
      tags: ['templates', 'list', 'ksc', 'command', 'available'],
      language: 'bash',
      relevanceScore: 0.9,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  {
    type: 'deployment_tool',
    content: `# Create a new empty Klever smart contract from template
~/klever-sdk/ksc new --template empty --name \${CONTRACT_NAME} --path \${CONTRACT_PATH}

# Examples:
# Create a contract named "MyToken" in the current directory
~/klever-sdk/ksc new --template empty --name MyToken --path .

# Create a contract named "StakingContract" in a specific directory
~/klever-sdk/ksc new --template empty --name StakingContract --path ./contracts/staking

# To see all available templates, run:
~/klever-sdk/ksc templates`,
    metadata: {
      title: 'Create New Klever Contract Command',
      description:
        'Command to create a new empty Klever smart contract from template using ksc tool',
      tags: ['create', 'new', 'template', 'ksc', 'command'],
      language: 'bash',
      relevanceScore: 0.95,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  {
    type: 'documentation',
    content: `# Klever Smart Contract CLI (ksc) Commands Reference

## Project Management
\`\`\`bash
# List all available templates
~/klever-sdk/ksc templates

# Create new contract from template
~/klever-sdk/ksc new --template <template-name> --name <contract-name> --path <path>

# Examples:
~/klever-sdk/ksc new --template empty --name MyToken --path ./my-token
~/klever-sdk/ksc new --template adder --name Calculator --path ./calculator
~/klever-sdk/ksc new --template multisig --name MultiSigWallet --path ./multisig
\`\`\`

## Build Commands
\`\`\`bash
# Build all contracts in the project
~/klever-sdk/ksc all build

# Build specific contract
~/klever-sdk/ksc contract build

# Clean build artifacts
~/klever-sdk/ksc all clean

# Build with custom output path
~/klever-sdk/ksc all build --output-path ./my-output
\`\`\`

## Other Useful Commands
\`\`\`bash
# Generate contract ABI
~/klever-sdk/ksc all abi

# Run tests
~/klever-sdk/ksc test

# Check contract size
~/klever-sdk/ksc all size
\`\`\``,
    metadata: {
      title: 'Klever Smart Contract CLI (ksc) Commands Reference',
      description:
        'Complete reference for all ksc commands used in Klever smart contract development',
      tags: ['ksc', 'commands', 'reference', 'cli', 'build', 'templates'],
      language: 'bash',
      relevanceScore: 0.95,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  {
    type: 'documentation',
    content: `# Koperator - Klever Operator Tool

## Overview
Koperator is the command-line tool for interacting with Klever blockchain and smart contracts.

## Location
If Klever VSCode extension is installed, koperator is located at:
\`~/klever-sdk/koperator\`

## Basic Usage
\`\`\`bash
# Check available options
~/klever-sdk/koperator --help

# Smart contract operations
~/klever-sdk/koperator sc --help
\`\`\`

## Smart Contract Invocation Example

Invoke contract function with arguments:
\`\`\`bash
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke klv1qqqqqqqqqqqqqpgqxwklx9kjsraqctl36kqekhyh95u5cf8qgz5q33zltk add \\
    --args bi:10 \\
    --await --sign --result-only
\`\`\`

This example:
- Invokes contract at address \`klv1qqqqqqqqqqqqqpgqxwklx9kjsraqctl36kqekhyh95u5cf8qgz5q33zltk\`
- Calls function \`add\`
- Passes argument \`10\` of type BigUint (\`bi:10\`)
- Waits for transaction completion (\`--await\`)
- Signs the transaction (\`--sign\`)
- Returns only the result (\`--result-only\`)`,
    metadata: {
      title: 'Koperator - Klever Operator Tool',
      description: 'Overview and basic usage of koperator for smart contract operations',
      tags: ['koperator', 'cli', 'tool', 'smartcontract', 'invoke'],
      language: 'bash',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  {
    type: 'documentation',
    content: `# Koperator Argument Types

## Argument Encoding for Smart Contract Calls

When invoking smart contracts with koperator, arguments must be properly encoded with type prefixes.

### Format: TYPE:VALUE

### Multiple Token Values
When sending multiple tokens in a single transaction, use the \`--values\` parameter:
- Format: \`--values 'TOKEN1=amount1,TOKEN2=amount2,TOKEN3=amount3'\`
- Example: \`--values 'KLV=1000000,KFI=500000,USDT-A1B2=250000'\`
- This sends KLV, KFI, and KDA tokens with their respective values in the same transaction

### Supported Argument Types

#### Numeric Types
- \`bool:true\` or \`b:1\` - Boolean values
- \`i8:127\` - 8-bit signed integer
- \`u8:255\` - 8-bit unsigned integer
- \`i16:32767\` - 16-bit signed integer
- \`u16:65535\` - 16-bit unsigned integer
- \`i32:2147483647\` - 32-bit signed integer
- \`u32:4294967295\` - 32-bit unsigned integer
- \`i64:9223372036854775807\` - 64-bit signed integer
- \`u64:18446744073709551615\` - 64-bit unsigned integer
- \`isize:100\` - Platform-dependent signed integer
- \`usize:100\` - Platform-dependent unsigned integer

#### Big Number Types
- \`BigInt:1000000\` - Arbitrary precision signed integer
- \`BigUint:1000000\` or \`bi:1000000\` or \`n:1000000\` - Arbitrary precision unsigned integer
- \`BigFloat:3.14159\` or \`bf:3.14159\` or \`f:3.14159\` - Arbitrary precision float

#### Address and String Types
- \`Address:klv1....\` - Klever address
- \`String:hello\` - String value
- \`&str:hello\` - String reference
- \`ManagedBuffer:0x48656c6c6f\` - Managed buffer (hex encoded)

#### Token Types
- \`TokenIdentifier:KLV\` - Token identifier
- \`TokenIdentifier:USDT-A1B2\` - KDA token identifier

#### Binary Types
- \`bytes:0x1234\` - Raw bytes (hex encoded)
- \`BoxedBytes:0x1234\` - Boxed bytes
- \`Vec<u8>:0x1234\` - Vector of bytes
- \`&[u8]:0x1234\` - Slice of bytes
- \`hex:48656c6c6f\` - Hex encoded value

#### Special Types
- \`empty\` or \`0\` or \`e\` - Empty/no value
- \`file:path/to/file.wasm\` - File content
- \`code:path/to/contract.wasm\` - Contract code

### Examples

\`\`\`bash
# Call with multiple arguments - use separate --args for each argument
~/klever-sdk/koperator sc invoke CONTRACT_ADDRESS transfer \\
    --args Address:klv1abc... --args bi:1000000 --args TokenIdentifier:KLV

# Call with complex types - use separate --args for each argument
~/klever-sdk/koperator sc invoke CONTRACT_ADDRESS setData \\
    --args String:"Hello World" --args u64:42 --args bool:true

# Call with hex data
~/klever-sdk/koperator sc invoke CONTRACT_ADDRESS storeData \\
    --args hex:48656c6c6f20576f726c64
\`\`\``,
    metadata: {
      title: 'Koperator Argument Types Reference',
      description:
        'Complete reference for argument type encoding in koperator smart contract calls',
      tags: ['koperator', 'arguments', 'types', 'encoding', 'reference'],
      language: 'bash',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  {
    type: 'code_example',
    content: `# Koperator Smart Contract Operations Examples

# 1. Deploy a new contract
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc create \\
    --wasm="output/contract.wasm" \\
    --upgradeable --readable --payable --payableBySC \\
    --await --sign --result-only

# 2. Invoke contract with BigUint argument
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke klv1contract_address_here add \\
    --args bi:100 \\
    --await --sign --result-only

# 3. Invoke with multiple arguments - use separate --args for each argument
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke klv1contract_address_here transfer \\
    --args Address:klv1recipient_address --args bi:1000000 --args TokenIdentifier:KLV \\
    --await --sign --result-only

# 4. Invoke payable endpoint with KLV
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke klv1contract_address_here deposit \\
    --values "KLV=1000000" \\
    --await --sign --result-only

# 5. Invoke with KDA token payment
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke klv1contract_address_here depositToken \\
    --values "USDT-A1B2=1000000" \\
    --await --sign --result-only

# 5b. Invoke with multiple token values in the same transaction
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke klv1contract_address_here depositMultiple \\
    --values 'KLV=1000000,KFI=500000,USDT-A1B2=250000' \\
    --await --sign --result-only

# 6. Query view endpoint (no transaction)
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    sc query klv1contract_address_here getBalance \\
    --args Address:klv1user_address

# 7. Upgrade existing contract
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc upgrade klv1contract_address_here \\
    --wasm="output/new_contract.wasm" \\
    --await --sign --result-only`,
    metadata: {
      title: 'Koperator Smart Contract Operations Examples',
      description: 'Practical examples of using koperator for various smart contract operations',
      tags: ['koperator', 'examples', 'deploy', 'invoke', 'query', 'upgrade'],
      language: 'bash',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  {
    type: 'best_practice',
    content: `# Important: API vs Koperator for Smart Contract Interaction

## When to Use the API vs Koperator

### Use the API for Querying (Read-Only Operations)
When you need to read data from smart contract view endpoints, use the Klever API directly.
View endpoints are read-only and don't require transactions.

**API Endpoint Format:**
\`\`\`
GET https://api.{network}.klever.org/contract/{contractAddress}/call/{endpoint}
\`\`\`

**Example - Query a view endpoint:**
\`\`\`bash
# Query getBalance view endpoint via API
curl "https://api.testnet.klever.org/contract/klv1contract_address/call/getBalance?args=Address:klv1user_address"

# Query getTotalSupply view endpoint
curl "https://api.testnet.klever.org/contract/klv1contract_address/call/getTotalSupply"

# Query with multiple arguments
curl "https://api.testnet.klever.org/contract/klv1contract_address/call/getUserInfo?args=Address:klv1user&args=u32:42"
\`\`\`

### Use Koperator for Transactional Operations (Write Operations)
When you need to modify contract state, use koperator. It will:
- Create a proper transaction
- Sign it with your private key
- Broadcast it to the blockchain
- Wait for confirmation (with --await flag)

**Example - Invoke a state-changing endpoint:**
\`\`\`bash
# This creates, signs, and broadcasts a transaction
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke klv1contract_address transfer \\
    --args Address:klv1recipient --args bi:1000000 \\
    --await --sign --result-only
\`\`\`

## Key Differences

| Aspect | API (for Views) | Koperator (for Transactions) |
|--------|----------------|------------------------------|
| Purpose | Read contract data | Modify contract state |
| Requires Private Key | No | Yes |
| Creates Transaction | No | Yes |
| Gas Fees | No | Yes |
| Speed | Instant | Requires blockchain confirmation |
| Use Case | View balances, get info | Transfer, stake, update state |

## Common Mistake to Avoid
❌ **DON'T** use koperator sc query for view endpoints in production
✅ **DO** use the API for view endpoints - it's faster and doesn't require a wallet

The koperator query command exists but the API is the recommended approach for production systems.`,
    metadata: {
      title: 'API vs Koperator - When to Use Each',
      description:
        'Clear guidance on using the API for contract queries vs koperator for transactions',
      tags: ['api', 'koperator', 'view', 'query', 'invoke', 'best-practice', 'contract'],
      language: 'bash',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  {
    type: 'deployment_tool',
    content: `# Koperator Account Operations - Developer Utilities

# 1. Check account address from wallet key
~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    account address

# Example output:
# INFO [2025-06-10 17:25:35.687]   Loading                                  keyFile = ~/klever-sdk/walletKey.pem
# INFO [2025-06-10 17:25:35.688]   KeyLoaded                                operator = klv1graf3wqa8eefzmp3g95wrnmayzacsje2a6c6y7z6zmu9m8z8gz5qlrctat
# Wallet address:  klv1graf3wqa8eefzmp3g95wrnmayzacsje2a6c6y7z6zmu9m8z8gz5qlrctat

# 2. Check KLV balance
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    account balance

# Example output:
# INFO [2025-06-10 17:28:29.480]   Loading                                  keyFile = ~/klever-sdk/walletKey.pem
# INFO [2025-06-10 17:28:29.480]   KeyLoaded                                operator = klv1graf3wqa8eefzmp3g95wrnmayzacsje2a6c6y7z6zmu9m8z8gz5qlrctat
# INFO [2025-06-10 17:28:29.939]   checking balance                         address = klv1graf3wqa8eefzmp3g95wrnmayzacsje2a6c6y7z6zmu9m8z8gz5qlrctat
# INFO [2025-06-10 17:28:30.292]   klv1graf3wqa8eefzmp3g95wrnmayzacsje2a6c6y7z6zmu9m8z8gz5qlrctat balance = 29672.397284

# 3. Check detailed account information (nonce, allowance, staking, etc.)
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    account info

# Example output:
# INFO [2025-06-10 17:29:08.256]   Loading                                  keyFile = ~/klever-sdk/walletKey.pem
# INFO [2025-06-10 17:29:08.256]   KeyLoaded                                operator = klv1graf3wqa8eefzmp3g95wrnmayzacsje2a6c6y7z6zmu9m8z8gz5qlrctat
# {
#     "Address": "klv1graf3wqa8eefzmp3g95wrnmayzacsje2a6c6y7z6zmu9m8z8gz5qlrctat",
#     "Allowance": "0",
#     "Balance": "29672.39728",
#     "Name": null,
#     "Nonce": 187,
#     "RootHash": "",
#     "StakingRewards": "0"
# }

# IMPORTANT: When parsing JSON output with jq or other tools
# Note that koperator outputs INFO logs before the JSON data.
# To extract only the JSON, you need to filter out the INFO lines:
# Example: koperator account info 2>/dev/null | tail -n +3
# Or: koperator account info | grep -A 100 "^{" | jq .`,
    metadata: {
      title: 'Koperator Account Utilities',
      description:
        'Developer utilities for fetching account information - address, balance, nonce, and other details',
      tags: [
        'koperator',
        'account',
        'balance',
        'address',
        'nonce',
        'info',
        'developer-tools',
        'utilities',
      ],
      language: 'bash',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  {
    type: 'deployment_tool',
    content: `# Klever API - Address Information

## Retrieve Detailed Address Information via API

For fetching information about any address (not just your own), use the Klever API:

### API Endpoint Format:
https://api.{network}.klever.org/address/{address}

### Networks:
- Testnet: \`api.testnet.klever.org\`
- Mainnet: \`api.klever.org\`

### Example - Get testnet address info:
curl https://api.testnet.klever.org/address/klv1graf3wqa8eefzmp3g95wrnmayzacsje2a6c6y7z6zmu9m8z8gz5qlrctat

### Successful Response:
{
  "data": {
    "account": {
      "address": "klv1graf3wqa8eefzmp3g95wrnmayzacsje2a6c6y7z6zmu9m8z8gz5qlrctat",
      "nonce": 187,
      "balance": 29672397284,
      "frozenBalance": 0,
      "unfrozenBalance": 0,
      "allowance": 0,
      "permissions": [],
      "timestamp": 1746279160,
      "assets": {
        "KLV": {
          "address": "klv1graf3wqa8eefzmp3g95wrnmayzacsje2a6c6y7z6zmu9m8z8gz5qlrctat",
          "assetId": "KLV",
          "collection": "KLV",
          "assetName": "KLEVER",
          "assetType": 0,
          "balance": 29672397284,
          "precision": 6,
          "frozenBalance": 0,
          "unfrozenBalance": 0,
          "lastClaim": {
            "timestamp": 0,
            "epoch": 0
          },
          "buckets": null,
          "stakingType": 0
        }
      }
    }
  },
  "pagination": {
    "self": 0,
    "next": 0,
    "previous": 0,
    "perPage": 0,
    "totalPages": 0,
    "totalRecords": 0
  },
  "error": "",
  "code": "successful"
}

### Address Not Found Response:
# If the address has not been initialized on that network:
{
  "data": null,
  "error": "cannot find account in database",
  "code": "not_found"
}

### Usage Examples:
# Check mainnet address
curl https://api.klever.org/address/klv1abc...

# Check testnet address with jq parsing
curl -s https://api.testnet.klever.org/address/klv1abc... | jq '.data.account.balance'

# Get specific asset balance (e.g., KLV)
curl -s https://api.testnet.klever.org/address/klv1abc... | jq '.data.account.assets.KLV.balance'

# Script example to check if address exists
ADDRESS="klv1graf3wqa8eefzmp3g95wrnmayzacsje2a6c6y7z6zmu9m8z8gz5qlrctat"
RESPONSE=$(curl -s https://api.testnet.klever.org/address/$ADDRESS)
if [[ $(echo $RESPONSE | jq -r '.code') == "not_found" ]]; then
  echo "Address not initialized on network"
else
  echo "Balance: $(echo $RESPONSE | jq -r '.data.account.balance')"
  echo "Nonce: $(echo $RESPONSE | jq -r '.data.account.nonce')"
  echo "KLV Balance: $(echo $RESPONSE | jq -r '.data.account.assets.KLV.balance // 0')"
fi`,
    metadata: {
      title: 'Klever API - Address Information',
      description:
        'API endpoints for retrieving detailed address information from Klever blockchain',
      tags: ['api', 'address', 'balance', 'account', 'rest', 'http', 'mainnet', 'testnet'],
      language: 'bash',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  {
    type: 'documentation',
    content: `# Klever API Reference

## Base URLs
- **Testnet**: https://api.testnet.klever.org
- **Mainnet**: https://api.klever.org

## Key API Endpoints for Smart Contract Development

### 1. Account/Address Endpoints

#### GET /address/{address}
Retrieve detailed account information including balance, nonce, and assets.

#### GET /address/{address}/transactions
Get transaction history for an address.
- Query params:
  - \`page\`: Page number (starts at 1)
  - \`limit\`: Items per page (e.g., 50)
  - \`type\`: Transaction type (e.g., 63 for smart contract transactions)
  - \`withResults\`: Include transaction execution results (true/false)
  - \`startdate\`: Filter transactions from this date (RFC3339 format, e.g., "2025-01-01T00:00:00Z")

Example - Get smart contract transactions with results:
\`\`\`bash
curl "https://api.testnet.klever.org/address/klv1qqqqqqqqqqqqqpgqdz47fn3smt9c7rexu90d6tfnwvuc9zlkgz5qunh6d2/transactions?limit=50&page=1&type=63&withResults=true"
\`\`\`

Example - Get transactions since specific date:
\`\`\`bash
curl "https://api.testnet.klever.org/address/{address}/transactions?startdate=2025-01-01T00:00:00Z&type=63&withResults=true"
\`\`\`

### 2. Transaction Endpoints

#### POST /transaction/send
Send a signed transaction to the network.
- Body: Signed transaction data

#### GET /transaction/{hash}
Get transaction details by hash.
- Query params:
  - \`withResults\`: Include transaction execution results (true/false)

Example - Get transaction with smart contract execution results:
\`\`\`bash
curl "https://api.testnet.klever.org/transaction/302b516f9efb3575adca22c171c901d3255c158c8e514d154d4ad3504cea6ed3?withResults=true"
\`\`\`

#### GET /transaction/broadcast
Broadcast a signed transaction (alternative to /send).

### 3. Smart Contract Endpoints

#### GET /contract/{contractAddress}/call/{endpoint}
Query smart contract view endpoints (read-only operations).
- Query params: \`args\` - Multiple args in format Type:Value (e.g., \`args=Address:klv1...&args=u32:42\`)

Example - Query contract view endpoint:
\`\`\`bash
curl "https://api.testnet.klever.org/contract/klv1contract_address/call/getBalance?args=Address:klv1user_address"
\`\`\`

#### GET /address/{address}/nonce
Get the current nonce for an address (useful for transaction creation).

#### GET /transaction/{hash}/results
Get smart contract execution results from a transaction.

### 4. Asset/Token Endpoints

#### GET /assets
List all assets on the network.
- Query params: \`page\`, \`limit\`, \`type\`

#### GET /asset/{assetId}
Get details about a specific asset (KLV, KFI, or KDA tokens).

#### GET /address/{address}/assets
Get all assets held by an address.

### 5. Network Information

#### GET /node/status
Get current network status and node information.

#### GET /network/config
Get network configuration parameters.

### 6. Useful Query Patterns

#### Check if address has specific token:
curl https://api.testnet.klever.org/address/{address}/assets | jq '.data.assets.{TOKEN_ID}'

#### Get address nonce for transaction:
curl https://api.testnet.klever.org/address/{address} | jq '.data.account.nonce'

#### Monitor transaction status:
curl https://api.testnet.klever.org/transaction/{txHash} | jq '.data.status'

### 7. Transaction Types
Transaction types supported by Klever blockchain for filtering:
- \`0\`: Transfer - Basic KLV/token transfers
- \`1\`: CreateAsset - Create new assets/tokens
- \`2\`: CreateValidator - Create blockchain validator
- \`3\`: ValidatorConfig - Configure validator settings
- \`4\`: Freeze - Freeze tokens for staking
- \`5\`: Unfreeze - Unfreeze staked tokens
- \`6\`: Delegate - Delegate tokens to validator
- \`7\`: Undelegate - Remove delegation
- \`8\`: Withdraw - Withdraw available balance
- \`9\`: Claim - Claim staking rewards
- \`10\`: Unjail - Unjail a validator
- \`11\`: AssetTrigger - Trigger asset-specific actions
- \`12\`: SetAccountName - Set account name
- \`13\`: Proposal - Create governance proposal
- \`14\`: Vote - Vote on proposals
- \`15\`: ConfigITO - Configure Initial Token Offering
- \`16\`: SetITOPrices - Set ITO prices
- \`17\`: Buy - Buy order on marketplace
- \`18\`: Sell - Sell order on marketplace
- \`19\`: CancelMarketOrder - Cancel marketplace order
- \`20\`: CreateMarketplace - Create new marketplace
- \`21\`: ConfigMarketplace - Configure marketplace
- \`22\`: UpdateAccountPermission - Update account permissions
- \`23\`: Deposit - Deposit to contract/pool
- \`24\`: ITOTrigger - Trigger ITO actions
- \`63\`: SmartContract - Smart contract transactions (deploy, invoke, upgrade)

Example - Filter for smart contract transactions only:
\`\`\`bash
curl "https://api.testnet.klever.org/address/{address}/transactions?type=63&withResults=true"
\`\`\`

### 8. Common Response Codes
- \`successful\`: Operation completed successfully
- \`not_found\`: Resource not found (e.g., uninitialized address)
- \`invalid_request\`: Malformed request
- \`internal_error\`: Server error

### 9. Pagination
Most list endpoints support pagination:
- \`page\`: Page number (note: some endpoints start at 0, others at 1)
- \`limit\`: Items per page (default: 10, max varies by endpoint)

Example:
curl "https://api.testnet.klever.org/address/{address}/transactions?page=1&limit=50"

### 10. Rate Limiting
The API implements rate limiting. Include proper delays between requests in scripts.

### 11. API Documentation
For complete API documentation with all endpoints, visit:
- Testnet: https://api.testnet.klever.org/swagger
- Mainnet: https://api.klever.org/swagger`,
    metadata: {
      title: 'Klever API Reference',
      description:
        'Comprehensive API reference for Klever blockchain including endpoints for smart contracts, transactions, and assets',
      tags: ['api', 'reference', 'endpoints', 'rest', 'http', 'documentation'],
      language: 'bash',
      relevanceScore: 0.9,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  {
    type: 'deployment_tool',
    content: `#!/bin/bash
# deploy.sh - Deploy a new Klever smart contract

set -e

# Build first
echo "Building smart contract..."
~/klever-sdk/ksc all build || { echo "Build failed"; exit 1; }

# Deploy contract
echo "Deploying contract..."
DEPLOY_OUTPUT=$(KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc create \\
    --upgradeable --readable --payable --payableBySC \\
    --wasm="$(pwd)/output/contract.wasm" \\
    --await --sign --result-only)

# Extract transaction hash and contract address
TX_HASH=$(echo "$DEPLOY_OUTPUT" | grep -o '"hash": "[^"]*"' | head -1 | cut -d'"' -f4)
CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | python3 -c "
import json, sys
data = json.load(sys.stdin)
for event in data.get('logs', {}).get('events', []):
    if event.get('identifier') == 'SCDeploy':
        print(event.get('address', ''))
        break
")

# Update history.json
echo "Updating deployment history..."
HISTORY_FILE="$(pwd)/output/history.json"
[[ ! -f "$HISTORY_FILE" ]] && echo "[]" > "$HISTORY_FILE"

# Add new entry
jq --arg tx "$TX_HASH" --arg addr "$CONTRACT_ADDRESS" \\
   '. + [{"hash": $tx, "contractAddress": $addr}]' \\
   "$HISTORY_FILE" > "$HISTORY_FILE.tmp" && mv "$HISTORY_FILE.tmp" "$HISTORY_FILE"

echo "Deployment complete!"
echo "Transaction: $TX_HASH"
echo "Contract: $CONTRACT_ADDRESS"`,
    metadata: {
      title: 'Klever Contract Deployment Script',
      description: 'Complete deployment script for Klever smart contracts with history tracking',
      tags: ['deployment', 'script', 'bash', 'testnet'],
      language: 'bash',
      relevanceScore: 0.9,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  {
    type: 'deployment_tool',
    content: `#!/bin/bash
# upgrade.sh - Upgrade an existing Klever smart contract

set -e

# Get contract address from argument or history.json
if [ $# -eq 1 ]; then
    CONTRACT_ADDRESS=$1
else
    echo "Getting latest contract from history.json..."
    CONTRACT_ADDRESS=$(grep -o '"contractAddress": "[^"]*"' output/history.json | tail -n 1 | cut -d'"' -f4)

    if [ -z "$CONTRACT_ADDRESS" ]; then
        echo "Error: No contract address found"
        echo "Usage: $0 [contract-address]"
        exit 1
    fi
fi

echo "Contract address: $CONTRACT_ADDRESS"

# Build first
echo "Building smart contract..."
~/klever-sdk/ksc all build || { echo "Build failed"; exit 1; }

# Upgrade contract
echo "Upgrading contract..."
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc upgrade "$CONTRACT_ADDRESS" \\
    --wasm="$(pwd)/output/contract.wasm" \\
    --payable --payableBySC --readable --upgradeable \\
    --await --sign --result-only

echo "Contract upgrade complete!"`,
    metadata: {
      title: 'Klever Contract Upgrade Script',
      description: 'Script for upgrading existing Klever smart contracts',
      tags: ['upgrade', 'script', 'bash', 'deployment'],
      language: 'bash',
      relevanceScore: 0.85,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  {
    type: 'deployment_tool',
    content: `#!/bin/bash
# query.sh - Query Klever smart contract endpoints

set -e

# Color definitions for output
RESET="\\033[0m"
BOLD="\\033[1m"
GREEN="\\033[32m"
YELLOW="\\033[33m"
BLUE="\\033[34m"
CYAN="\\033[36m"

# Parse command-line arguments
ENDPOINT=""
CONTRACT_ADDRESS=""
ARGUMENTS=()

while [[ $# -gt 0 ]]; do
    case $1 in
        --endpoint) ENDPOINT="$2"; shift 2 ;;
        --contract) CONTRACT_ADDRESS="$2"; shift 2 ;;
        --arg) ARGUMENTS+=("$2"); shift 2 ;;
        *) echo "Unknown argument: $1"; exit 1 ;;
    esac
done

# Validate endpoint
if [ -z "$ENDPOINT" ]; then
    echo "Error: --endpoint is required"
    exit 1
fi

# Get contract from history if not provided
if [ -z "$CONTRACT_ADDRESS" ]; then
    CONTRACT_ADDRESS=$(grep -o '"contractAddress": "[^"]*"' output/history.json | tail -n 1 | cut -d'"' -f4)
fi

# Encode arguments to base64
JSON_ARGS="["
for ((i=0; i<\${#ARGUMENTS[@]}; i++)); do
    ARG="\${ARGUMENTS[$i]}"

    if [[ "$ARG" == 0x* ]]; then
        # Hex argument
        HEX_VALUE="\${ARG#0x}"
        ENCODED=$(echo -n "$HEX_VALUE" | xxd -r -p | base64)
    else
        # Text argument
        ENCODED=$(echo -n "$ARG" | base64)
    fi

    [[ $i -gt 0 ]] && JSON_ARGS="$JSON_ARGS,"
    JSON_ARGS="$JSON_ARGS\\"$ENCODED\\""
done
JSON_ARGS="$JSON_ARGS]"

# Build request
JSON_REQUEST="{\\"ScAddress\\":\\"$CONTRACT_ADDRESS\\",\\"FuncName\\":\\"$ENDPOINT\\",\\"Arguments\\":$JSON_ARGS}"

# Query the contract
echo -e "\${BOLD}\${BLUE}Querying $ENDPOINT...\${RESET}"
RESPONSE=$(curl -s 'https://api.testnet.klever.org/v1.0/sc/query' --data-raw "$JSON_REQUEST")

# Display response
echo "$RESPONSE" | jq -C .

# Decode return data if present
RETURN_DATA=$(echo "$RESPONSE" | jq -r '.data.returnData[]? // empty')
if [ -n "$RETURN_DATA" ]; then
    echo -e "\\n\${BOLD}\${YELLOW}Decoded Data:\${RESET}"
    echo "$RETURN_DATA" | base64 -d | xxd -p
fi`,
    metadata: {
      title: 'Klever Contract Query Script',
      description: 'Script for querying Klever smart contract endpoints with argument encoding',
      tags: ['query', 'script', 'bash', 'api'],
      language: 'bash',
      relevanceScore: 0.8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },
];

// Testing Examples
export const testingExamples: ContextPayload[] = [
  {
    type: 'documentation',
    content: `{
    "name": "adder",
    "comment": "add then check",
    "gasSchedule": "dummy",
    "steps": [
        {
            "step": "setState",
            "accounts": {
                "address:owner": {
                    "nonce": "1",
                    "balance": "0"
                }
            },
            "newAddresses": [
                {
                    "creatorAddress": "address:owner",
                    "creatorNonce": "2",
                    "newAddress": "sc:adder"
                }
            ]
        },
        {
            "step": "scDeploy",
            "id": "deploy",
            "tx": {
                "from": "address:owner",
                "contractCode": "kleversc:../output/adder.kleversc.json",
                "arguments": ["5"],
                "gasLimit": "5,000,000",
                "gasPrice": "0"
            },
            "expect": {
                "out": [],
                "status": "",
                "logs": "*",
                "gas": "*",
                "refund": "*"
            }
        },
        {
            "step": "scQuery",
            "id": "check-sum",
            "tx": {
                "to": "sc:adder",
                "function": "getSum",
                "arguments": []
            },
            "expect": {
                "out": ["5"],
                "status": "",
                "logs": []
            }
        },
        {
            "step": "scCall",
            "id": "add-value",
            "tx": {
                "from": "address:owner",
                "to": "sc:adder",
                "function": "add",
                "arguments": ["3"],
                "gasLimit": "5,000,000",
                "gasPrice": "0"
            },
            "expect": {
                "out": [],
                "status": "",
                "logs": "*",
                "gas": "*",
                "refund": "*"
            }
        },
        {
            "step": "checkState",
            "accounts": {
                "address:owner": {
                    "nonce": "*",
                    "balance": "0"
                },
                "sc:adder": {
                    "nonce": "0",
                    "balance": "0",
                    "storage": {
                        "str:sum": "8"
                    },
                    "code": "kleversc:../output/adder.kleversc.json"
                }
            }
        }
    ]
}`,
    metadata: {
      title: 'Klever Scenario Test Example',
      description:
        'Complete JSON scenario test for an adder contract showing deployment, query, call, and state check',
      tags: ['testing', 'scenario', 'json', 'example', 'test-format'],
      language: 'json',
      relevanceScore: 0.85,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },
];

// Payable endpoints and payment handling
export const payableEndpointPatterns: ContextPayload[] = [
  {
    type: 'code_example',
    content: `// Payable endpoints - accepting token transfers

// Accept any token payment using wildcard
#[payable("*")]
#[endpoint(myPayableEndpoint)]
fn my_payable_endpoint(&self, arg: BigUint) -> BigUint {
    let payment = self.call_value().any_payment();

    // Access payment details
    let token = payment.token_identifier;
    let amount = payment.amount;
    let nonce = payment.token_nonce;

    // Process the payment...
    self.total_payments(&token).update(|total| *total += &amount);

    amount
}

// Accept only KLV payments
#[payable("KLV")]
#[endpoint(depositKlv)]
fn deposit_klv(&self) {
    let klv_amount = self.call_value().klv_value();
    require!(klv_amount > 0, "No KLV payment received");

    let caller = self.blockchain().get_caller();
    self.user_klv_balance(&caller).update(|balance| *balance += klv_amount);
}

// Accept only KFI payments
#[payable("KFI")]
#[endpoint(stakeKfi)]
fn stake_kfi(&self, lock_period: u64) {
    let payment = self.call_value().single_kda();
    require!(payment.token_identifier == TokenIdentifier::from("KFI"), "Only KFI accepted");
    require!(payment.amount > 0, "Amount must be positive");

    // Process KFI staking...
}

// Accept multiple specific tokens
#[payable("KLV", "KFI", "USDT")]
#[endpoint(multiTokenDeposit)]
fn multi_token_deposit(&self) {
    let payments = self.call_value().all_kda_transfers();

    for payment in payments.iter() {
        match payment.token_identifier.as_managed_buffer().to_string().as_str() {
            "KLV" => self.process_klv_deposit(&payment),
            "KFI" => self.process_kfi_deposit(&payment),
            "USDT" => self.process_usdt_deposit(&payment),
            _ => sc_panic!("Unsupported token")
        }
    }
}

// Non-payable endpoint (default behavior)
#[endpoint(viewOnly)]
fn view_only(&self) -> BigUint {
    // This endpoint cannot receive payments
    // Any payment sent will be rejected
    self.get_some_value()
}`,
    metadata: {
      title: 'Payable Endpoints and Token Restrictions',
      description:
        'How to create payable endpoints with token restrictions using #[payable] annotation',
      tags: ['payable', 'tokens', 'payment', 'klv', 'kfi', 'endpoints'],
      language: 'rust',
      relevanceScore: 0.9,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  {
    type: 'documentation',
    content: `# Payable Endpoints in Klever Smart Contracts

## Overview
Payable endpoints allow smart contracts to receive token transfers. The \`#[payable]\` annotation controls which tokens can be accepted.

## Syntax
\`\`\`rust
#[payable("TOKEN_ID")]
#[endpoint(endpointName)]
fn endpoint_name(&self, args...) { }
\`\`\`

## Token Restriction Options

### 1. Accept Any Token (Wildcard)
\`\`\`rust
#[payable("*")]
\`\`\`
- Accepts any token transfer
- Use \`self.call_value().any_payment()\` to access payment

### 2. Accept Specific Token
\`\`\`rust
#[payable("KLV")]  // Only KLV
#[payable("KFI")]  // Only KFI
#[payable("USDT")] // Only USDT
\`\`\`
- Restricts to specific token ID
- Contract rejects other tokens automatically

### 3. Accept Multiple Specific Tokens
\`\`\`rust
#[payable("KLV", "KFI", "USDT")]
\`\`\`
- Accepts any of the listed tokens
- Use \`self.call_value().all_kda_transfers()\` for multiple payments

### 4. Non-Payable (Default)
\`\`\`rust
#[endpoint(myEndpoint)]  // No #[payable] annotation
\`\`\`
- Cannot receive any payments
- Any payment attempt will fail

## Accessing Payment Information

### For Single Payment
\`\`\`rust
let payment = self.call_value().single_kda();
let token_id = payment.token_identifier;
let amount = payment.amount;
let nonce = payment.token_nonce;
\`\`\`

### For KLV Specifically
\`\`\`rust
let klv_amount = self.call_value().klv_value();
\`\`\`

### For Any Payment
\`\`\`rust
let payment = self.call_value().any_payment();
\`\`\`

## Best Practices
1. Always validate payment amount > 0
2. Use specific token restrictions when possible
3. Handle each token type appropriately
4. Emit events for payment tracking
5. Update balances atomically`,
    metadata: {
      title: 'Payable Endpoints Documentation',
      description:
        'Comprehensive guide on using payable endpoints and token restrictions in Klever smart contracts',
      tags: ['payable', 'documentation', 'tokens', 'payment', 'guide'],
      language: 'rust',
      relevanceScore: 0.85,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },

  {
    type: 'best_practice',
    content: `// Payment validation best practices

#[payable("*")]
#[endpoint(receivePayment)]
fn receive_payment(&self) {
    // 1. Always check for payment existence
    let payment = self.call_value().any_payment();
    require!(payment.amount > 0, "No payment received");

    // 2. Validate token if specific tokens expected
    let accepted_tokens = ["KLV", "KFI", "USDT"];
    let token_str = payment.token_identifier.as_managed_buffer().to_string();
    require!(
        accepted_tokens.contains(&token_str.as_str()),
        "Token not accepted"
    );

    // 3. Check minimum amounts
    let min_amount = BigUint::from(1000u64);
    require!(payment.amount >= min_amount, "Amount too small");

    // 4. Emit payment event
    self.payment_received_event(
        &self.blockchain().get_caller(),
        &payment.token_identifier,
        &payment.amount
    );

    // 5. Update state atomically
    self.total_deposits(&payment.token_identifier)
        .update(|total| *total += &payment.amount);
}

// Security: Prevent accidental token lock
#[endpoint]
fn withdraw(&self, token: TokenIdentifier, amount: BigUint) {
    self.require_owner();

    // Check contract balance before sending
    let balance = self.blockchain().get_sc_balance(&token, 0);
    require!(balance >= amount, "Insufficient contract balance");

    self.send().direct_kda(
        &self.blockchain().get_caller(),
        &token,
        0,
        &amount
    );
}`,
    metadata: {
      title: 'Payment Handling Best Practices',
      description: 'Best practices for handling payments in payable endpoints',
      tags: ['payable', 'best-practice', 'security', 'validation', 'payment'],
      language: 'rust',
      relevanceScore: 0.9,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },
];

// Cross-contract communication
export const crossContractPatterns: ContextPayload[] = [
  {
    type: 'code_example',
    content: `// Cross-contract communication pattern

#[allow(unused_imports)]
use klever_sc::imports::*;

// Define the external contract interface
#[klever_sc::proxy]
pub trait ExternalContract {
    #[endpoint]
    fn do_something(&self, value: BigUint) -> BigUint;
}

#[klever_sc::contract]
pub trait MyContract {
    #[storage_mapper("externalContractAddress")]
    fn external_contract_address(&self) -> SingleValueMapper<ManagedAddress>;

    #[endpoint]
    fn call_external_contract(&self, value: BigUint) {
        let contract_address = self.external_contract_address().get();

        // Create contract proxy
        let mut contract_proxy = self.send()
            .contract_call::<ExternalContract>(contract_address)
            .do_something(value);

        // Execute the call
        let result = contract_proxy.execute_on_dest_context::<BigUint>();

        // Process result...
    }

    #[endpoint]
    fn contract_call_example(&self, value: BigUint) {
        let contract_address = self.external_contract_address().get();

        // Synchronous call - result returned immediately
        let result: BigUint = self.send()
            .contract_call::<ExternalContract>(contract_address)
            .do_something(value)
            .execute_on_dest_context();

        // Process result immediately
        self.result_value().set(&result);
        self.call_completed_event(&contract_address, &result);
    }
}`,
    metadata: {
      title: 'Cross-Contract Communication Pattern',
      description: 'Pattern for calling other contracts using proxies with synchronous execution',
      tags: ['cross-contract', 'proxy', 'synchronous', 'communication'],
      language: 'rust',
      relevanceScore: 0.9,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },
];

// Remote storage access
export const remoteStoragePattern: ContextPayload = {
  type: 'code_example',
  content: `// Accessing storage from another contract

#[klever_sc::contract]
pub trait MyContract {
    // Local storage mapper
    #[storage_mapper("my_mapper")]
    fn my_mapper(&self) -> SetMapper<u32>;

    // Remote storage mapper - accesses storage at another address
    #[storage_mapper_from_address("my_mapper")]
    fn my_mapper_from_address(
        &self,
        address: ManagedAddress
    ) -> SetMapper<u32, ManagedAddress>;

    #[endpoint]
    fn read_remote_storage(&self, contract_address: ManagedAddress) {
        // Access the remote contract's storage
        let remote_mapper = self.my_mapper_from_address(contract_address);

        // Iterate over remote storage
        for value in remote_mapper.iter() {
            // Process value from remote contract
        }
    }

    // Example with additional keys
    #[storage_mapper_from_address("user_data")]
    fn user_data_from_address(
        &self,
        address: ManagedAddress,
        user: &ManagedAddress
    ) -> SingleValueMapper<UserInfo, ManagedAddress>;
}`,
  metadata: {
    title: 'Remote Storage Access Pattern',
    description:
      'Pattern for accessing storage from other contracts using storage_mapper_from_address',
    tags: ['storage', 'remote', 'cross-contract', 'advanced'],
    language: 'rust',
    relevanceScore: 0.8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  relatedContextIds: [],
};

// Project initialization patterns
export const projectInitPatterns: ContextPayload[] = [
  {
    type: 'deployment_tool',
    content: `# Initialize new Klever smart contract project

Use the MCP tool 'init_klever_project' to create a new project:

Parameters:
- name: Contract name (required)
- template: Template to use (default: "empty")
- noMove: Keep project in subdirectory (default: false)

Example:
{
  "name": "my-contract",
  "template": "empty",
  "noMove": false
}

This will:
1. Create new contract from template
2. Move files to current directory (unless noMove=true)
3. Generate helper scripts:
   - build.sh: Build the contract
   - deploy.sh: Deploy to testnet
   - upgrade.sh: Upgrade existing contract
   - query.sh: Query contract endpoints
   - test.sh: Run tests
   - interact.sh: Show usage examples
4. Create comprehensive .gitignore file`,
    metadata: {
      title: 'Project Initialization Tool',
      description: 'Initialize new Klever smart contract with helper scripts',
      tags: ['project', 'init', 'setup', 'scaffold'],
      language: 'bash',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },
  {
    type: 'documentation',
    content: `# Running Helper Scripts - Important Directory Information

## Script Execution Location

The helper scripts are designed to be run from the **contract project root folder**, not from the git repository root.

## Scenario 1: Contract in Subdirectory

If your contract was created in a subdirectory (e.g., \`MyFirstContract\`):

\`\`\`bash
# Wrong - Running from git root
./scripts/build.sh  # ❌ Will fail!

# Correct - Navigate to contract directory first
cd MyFirstContract
../scripts/build.sh  # ✅ Works!

# Or use one command
cd MyFirstContract && ../scripts/build.sh
\`\`\`

## Scenario 2: Contract in Git Root

If your contract was initialized in the git root (same folder as scripts):

\`\`\`bash
# This works directly
./scripts/build.sh  # ✅ Works!
\`\`\`

## Directory Structure Examples

### Example 1: Contract in Subdirectory
\`\`\`
my-project/                 # Git root
├── scripts/               # Helper scripts
│   ├── build.sh
│   ├── deploy.sh
│   └── ...
└── MyFirstContract/       # Contract root
    ├── Cargo.toml         # ← Run scripts from here
    ├── src/
    └── ...
\`\`\`

### Example 2: Contract in Git Root
\`\`\`
my-contract/               # Git root = Contract root
├── scripts/              # Helper scripts
│   ├── build.sh
│   ├── deploy.sh
│   └── ...
├── Cargo.toml            # ← Run scripts from here
├── src/
└── ...
\`\`\`

## Why This Matters

The scripts use relative paths and expect to find:
- \`Cargo.toml\` in the current directory
- \`src/\` folder with contract code
- \`output/\` folder for build artifacts

Running from the wrong directory will result in errors like:
- "Cargo.toml not found"
- "Failed to build contract"
- "No WASM file found"

## Quick Commands

For contract in subdirectory:
\`\`\`bash
# Build
cd MyFirstContract && ../scripts/build.sh

# Deploy
cd MyFirstContract && ../scripts/deploy.sh

# Upgrade
cd MyFirstContract && ../scripts/upgrade.sh

# Query
cd MyFirstContract && ../scripts/query.sh --endpoint myEndpoint
\`\`\``,
    metadata: {
      title: 'Running Helper Scripts - Directory Guide',
      description: 'Important information about running scripts from the correct directory',
      tags: ['scripts', 'directory', 'build', 'deploy', 'setup', 'troubleshooting'],
      language: 'bash',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },
  {
    type: 'best_practice',
    content: `# Rust
target/
Cargo.lock
**/*.rs.bk
*.pdb

# IDE
.idea/
.vscode/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment
.env
.env.local
.env.*.local

# Testing
coverage/
*.coverage
.coverage

# Temporary files
*.tmp
*.temp
.tmp/
.temp/

# Backup files
*.backup
*.bak

# Node (if using any JS tools)
node_modules/
.npm/

# Python (if using any Python tools)
__pycache__/
*.py[cod]
*$py.class
.Python
venv/
env/

# Documentation builds
docs/_build/
docs/.doctrees/

# Contract deployment history
deployment-history/
*.deployment.json
output/history.json

# Local configuration
config.local.json
settings.local.json

# Keys and secrets (NEVER commit these)
*.key
*.pem
*.pfx
*.p12
keystore/
secrets/

# Klever specific
output/
wasm/
*.wasm`,
    metadata: {
      title: 'Recommended .gitignore for Klever Smart Contracts',
      description: 'Comprehensive .gitignore file for Klever smart contract projects',
      tags: ['gitignore', 'git', 'version-control', 'security', 'best-practice'],
      language: 'gitignore',
      relevanceScore: 0.9,
      contractType: 'any',
      author: 'klever-mcp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },
];

// All contexts combined
export const allKleverContexts: ContextPayload[] = [
  ...kleverKnowledgeBase,
  ...deploymentScripts,
  ...testingExamples,
  ...payableEndpointPatterns,
  ...crossContractPatterns,
  remoteStoragePattern,
  ...projectInitPatterns,
  // Contract Query Response Handling
  {
    type: 'documentation',
    content: `# Understanding Contract Query Responses

## Empty Values in Responses
When querying Klever contracts, empty/zero values often return as empty strings:

\`\`\`json
{
  "data": {
    "returnData": [""],  // Empty string for 0 or false
    "returnCode": "Ok"
  }
}
\`\`\`

## Decoding Response Values

### For BigUint (balances, amounts):
- Empty string \`""\` = 0
- Base64 encoded hex for non-zero values

### For bool:
- Empty string \`""\` = false
- \`"AQ=="\` (base64 of 0x01) = true

### For u64:
- Empty string \`""\` = 0
- Base64 encoded hex for non-zero values

## Query Script Pattern
\`\`\`bash
# Decode BigUint to KLV (6 decimals)
RETURN_DATA=$(echo "$RESPONSE" | jq -r '.data.returnData[]?')
if [ -n "$RETURN_DATA" ] && [ "$RETURN_DATA" != "" ]; then
    HEX_VALUE=$(echo "$RETURN_DATA" | base64 -d | xxd -p -c 256)
    DECIMAL_VALUE=$(echo "ibase=16; \${HEX_VALUE^^}" | bc)
    KLV_VALUE=$(echo "scale=6; $DECIMAL_VALUE / 1000000" | bc)
    echo "$KLV_VALUE KLV"
else
    echo "0 KLV"
fi
\`\`\``,
    metadata: {
      title: 'Understanding Contract Query Responses',
      description: 'How to properly decode empty values and response data from Klever contract queries',
      tags: ['query', 'api', 'response-parsing', 'debugging'],
      language: 'bash',
      relevanceScore: 0.9,
      contractType: 'any',
      author: 'klever-community',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },
  // Deployment Best Practices
  {
    type: 'best_practice',
    content: `# Klever Contract Deployment Checklist

## Pre-Deployment
1. **Build and verify WASM size** - Keep under 24KB for lower fees
2. **Test locally** - Use scenario tests
3. **Check init parameters** - Ensure proper initialization

## Deployment
1. **Use correct flags**:
   \`\`\`bash
   --upgradeable    # Allow future upgrades
   --readable       # Enable view functions
   --payable        # Accept KLV payments
   --payableBySC    # Accept payments from contracts
   \`\`\`

2. **Save deployment info**:
   - Transaction hash
   - Contract address
   - Network used
   - Timestamp

## Post-Deployment
1. **Verify deployment**:
   - Query view functions
   - Check initial state

2. **Fund contract** (if needed):
   - For games/DEX: Add liquidity
   - For prizes: Add reward pool

3. **Test basic operations**:
   - Small test transactions
   - Verify events emitted
   - Check state changes

## Common Issues
- **"Insufficient balance"** - Contract needs funding
- **"Smart contracts not allowed"** - Add checks for SC callers
- **Empty query responses** - Normal for 0/false values`,
    metadata: {
      title: 'Klever Contract Deployment Checklist',
      description: 'Complete checklist for deploying contracts on Klever with best practices',
      tags: ['deployment', 'testing', 'funding', 'checklist'],
      language: 'markdown',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-community',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },
  // Decimal Handling for Queries
  {
    type: 'code_example',
    content: `# KLV Decimal Conversion in Query Scripts

## KLV Uses 6 Decimal Places
1 KLV = 1,000,000 smallest units

## Bash Conversion Functions

\`\`\`bash
# Convert units to KLV
units_to_klv() {
    local units=$1
    echo "scale=6; $units / 1000000" | bc
}

# Convert KLV to units
klv_to_units() {
    local klv=$1
    echo "$klv * 1000000" | bc | cut -d. -f1
}

# Format KLV amount nicely
format_klv() {
    local klv=$1
    printf "%.6f KLV" "$klv" | sed 's/\\.?0*$//'
}

# Parse BigUint from base64
parse_biguint() {
    local base64_data=$1
    if [ -z "$base64_data" ] || [ "$base64_data" = "" ]; then
        echo "0"
    else
        local hex=$(echo "$base64_data" | base64 -d | xxd -p -c 256)
        echo "ibase=16; \${hex^^}" | bc
    fi
}
\`\`\`

## Usage in Query Scripts
\`\`\`bash
# Get balance and convert to KLV
RESPONSE=$(curl -s "$API_URL" --data "$REQUEST")
RETURN_DATA=$(echo "$RESPONSE" | jq -r '.data.returnData[0]')
UNITS=$(parse_biguint "$RETURN_DATA")
KLV=$(units_to_klv "$UNITS")
echo "Balance: $(format_klv "$KLV")"
\`\`\``,
    metadata: {
      title: 'KLV Decimal Conversion in Query Scripts',
      description: 'Bash functions for converting between KLV units and decimal representation',
      tags: ['decimals', 'klv', 'query', 'bash', 'conversion'],
      language: 'bash',
      relevanceScore: 0.9,
      contractType: 'any',
      author: 'klever-community',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },
  // Koperator Payment Flags - Critical Information
  {
    type: 'documentation',
    content: `# Koperator Payment Flags - Correct Usage

## ❌ COMMON ERROR - These flags DO NOT EXIST:
\`\`\`bash
# WRONG - These will cause errors:
--klv 1000000         # DOES NOT EXIST
--payment 1000000     # DOES NOT EXIST
--amount 1000000      # DOES NOT EXIST
\`\`\`

## ✅ CORRECT - Sending KLV with Contract Calls

### For KLV Payments:
\`\`\`bash
# Send KLV with sc invoke (use --values flag)
~/klever-sdk/koperator \\
    --key-file="walletKey.pem" \\
    sc invoke CONTRACT_ADDRESS methodName \\
    --values "KLV=1000000" \\              # Format: KDA_ID=AMOUNT (1 KLV = 1,000,000 units)
    --args String:"hello" \\
    --await --sign
\`\`\`

### For KDA Token Payments:
\`\`\`bash
# Send KDA tokens with sc invoke
~/klever-sdk/koperator \\
    --key-file="walletKey.pem" \\
    sc invoke CONTRACT_ADDRESS methodName \\
    --values "DVK-1234=1000000" \\         # Format: KDA_ID=AMOUNT
    --args String:"hello" \\
    --await --sign
\`\`\`

### For Multiple Token Payments:
\`\`\`bash
# Send multiple tokens (comma-separated)
~/klever-sdk/koperator \\
    --key-file="walletKey.pem" \\
    sc invoke CONTRACT_ADDRESS methodName \\
    --values "KLV=1000000,DVK-1234=1000000,BTC-5678=500000" \\
    --args String:"hello" \\
    --await --sign
\`\`\`

## Important Notes:
1. **--values** is for token payments (format: "KDA_ID=AMOUNT") - use "KLV=AMOUNT" for native KLV
2. All amounts are in smallest units (6 decimals for KLV/KFI)
3. For NFTs: use nonce > 0 and amount = 1

## Examples for Common Operations:

### Dice Game Bet (10 KLV):
\`\`\`bash
~/klever-sdk/koperator \\
    --key-file="$KEY_FILE" \\
    sc invoke "$CONTRACT_ADDRESS" rollDice \\
    --values "KLV=10000000" \\             # 10 KLV (format: KDA_ID=AMOUNT)
    --args u8:3 \\                    # Betting on number 3
    --await --sign
\`\`\`

### Token Swap:
\`\`\`bash
~/klever-sdk/koperator \\
    --key-file="$KEY_FILE" \\
    sc invoke "$DEX_ADDRESS" swap \\
    --values "DVK-1234=1000000" \\       # Sending 1 DVK
    --args String:"BTC-5678" \\          # Want BTC token
    --await --sign
\`\`\`

### NFT Transfer:
\`\`\`bash
~/klever-sdk/koperator \\
    --key-file="$KEY_FILE" \\
    sc invoke "$CONTRACT_ADDRESS" transferNFT \\
    --values "MYNFT-1234/42=1" \\        # NFT with ID MYNFT-1234 and nonce 42
    --args Address:"klv1recipient..." \\
    --await --sign
\`\`\`

### NFT with Nonce Format:
For NFTs and SFTs with nonces, use the format: \`KDA_ID/NONCE=AMOUNT\`
- Example: \`--values "MYNFT-1234/42=1"\` for NFT with nonce 42
- Example: \`--values "MYSFT-5678/100=5"\` for 5 SFTs with nonce 100\`\`\``,
    metadata: {
      title: 'Koperator Payment Flags - Critical Information',
      description: 'Correct usage of payment flags in koperator - avoiding common --klv and --payment errors',
      tags: ['koperator', 'payments', 'klv', 'kda', 'common-error', 'critical'],
      language: 'bash',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-community',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },
  // Complete Koperator Reference for Smart Contracts
  {
    type: 'documentation',
    content: `# Koperator Smart Contract Commands Reference

## SC Deploy
\`\`\`bash
~/klever-sdk/koperator \\
    --key-file="path/to/key.pem" \\
    sc create \\
    --wasm="contract.wasm" \\
    --upgradeable \\          # Allow upgrades
    --readable \\             # Enable queries
    --payable \\              # Accept KLV
    --payableBySC \\          # Accept from contracts
    --args String:"init_arg" \\ # Constructor args
    --await \\                # Wait for confirmation
    --sign                   # Sign transaction
\`\`\`

## SC Invoke (Call Contract Method)
\`\`\`bash
~/klever-sdk/koperator \\
    --key-file="path/to/key.pem" \\
    sc invoke CONTRACT_ADDRESS methodName \\
    --values "KLV=1000000,TOK-1234=100" \\  # Token payments (comma-separated)
    --args Type:value \\      # Method arguments
    --await \\
    --sign
\`\`\`

## SC Query (View Functions)
Note: Queries are done via API, not koperator:
\`\`\`bash
curl -s 'https://api.testnet.klever.org/v1.0/sc/query' \\
    --data-raw '{"ScAddress":"CONTRACT","FuncName":"viewMethod","Arguments":[]}'
\`\`\`

## SC Upgrade
\`\`\`bash
~/klever-sdk/koperator \\
    --key-file="path/to/key.pem" \\
    sc upgrade CONTRACT_ADDRESS \\
    --wasm="new_contract.wasm" \\
    --upgradeable \\
    --readable \\
    --payable \\
    --payableBySC \\
    --args String:"upgrade_arg" \\
    --await \\
    --sign
\`\`\`

## Argument Types
\`\`\`bash
--args String:"hello world"
--args u64:123
--args bi:1000000000000
--args Address:"klv1abc..."
--args Bool:true
--args Hex:"0x1234"
--args Base64:"SGVsbG8="
\`\`\`

## Common Flags
- \`--await\` - Wait for transaction confirmation
- \`--sign\` - Sign the transaction
- \`--result-only\` - Output only the result JSON
- \`--network testnet\` - Specify network (if not using KLEVER_NODE env)
- \`--values\` - Token payments (format: "KDA_ID=AMOUNT" or "KDA_ID/NONCE=AMOUNT" for NFTs)
  - Examples: \`--values "KLV=1000000"\` or \`--values "KLV=100,USDT-A1B2=50,NFT-XYZ/42=1"\``,
    metadata: {
      title: 'Complete Koperator Reference for Smart Contracts',
      description: 'Full reference for all koperator smart contract commands with examples',
      tags: ['koperator', 'reference', 'cli', 'commands'],
      language: 'bash',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-community',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    relatedContextIds: [],
  },
];
