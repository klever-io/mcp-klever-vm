import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * Import patterns and best practices for Klever smart contracts
 */

export const importKnowledge: KnowledgeEntry[] = [
  // RandomnessSource Import Clarification
  createKnowledgeEntry(
    'documentation',
    `# RandomnessSource Import Clarification

## Important: No Separate Import Needed

The \`RandomnessSource\` type is **already included** in the standard \`klever_sc::imports::*\` module. You do NOT need to import it separately.

### ✅ Correct Usage

\`\`\`rust
#![no_std]
use klever_sc::imports::*;  // This already includes RandomnessSource

#[klever_sc::contract]
pub trait MyContract {
    #[endpoint]
    fn use_randomness(&self) -> u8 {
        // RandomnessSource is available directly
        let mut rand_source = RandomnessSource::new();
        rand_source.next_u8()
    }
}
\`\`\`

### ❌ Common Mistake - Redundant Import

\`\`\`rust
use klever_sc::imports::*;
use klever_sc::api::RandomnessSource;  // ❌ REDUNDANT - Don't do this!
\`\`\`

This extra import is unnecessary and can cause confusion. The \`RandomnessSource\` is already available through \`imports::*\`.

## What's Included in imports::*

The \`klever_sc::imports::*\` module provides all commonly used types:

- **API Types**: \`RandomnessSource\`, blockchain API functions
- **Managed Types**: \`ManagedAddress\`, \`ManagedBuffer\`, \`ManagedVec\`
- **Numeric Types**: \`BigUint\`, \`BigInt\`
- **Storage Mappers**: \`SingleValueMapper\`, \`MapMapper\`, \`SetMapper\`, \`VecMapper\`, \`OptionMapper\`
- **Utility Types**: \`OptionalValue\`, \`MultiValueEncoded\`
- **Token Types**: \`KdaTokenPayment\`, \`KdaTokenType\`

## Best Practice

Always rely on \`klever_sc::imports::*\` for standard types. Only add specific imports when you need something that's not in the common imports module, such as specific modules or less common API functions.`,
    {
      title: 'RandomnessSource Import - No Separate Import Needed',
      description: 'RandomnessSource is already included in klever_sc::imports::* - no separate import statement required',
      tags: ['randomness', 'imports', 'RandomnessSource', 'best-practice', 'common-mistake', 'api'],
      relevanceScore: 0.95,
    }
  ),

  // Standard Rust Imports
  createKnowledgeEntry(
    'best_practice',
    `# Use Standard Rust Imports Instead of Legacy Macros

## Modern Import Pattern (Recommended)
\`\`\`rust
#![no_std]
use klever_sc::imports::*;

#[klever_sc::contract]
pub trait MyContract {
    // Your contract code
}
\`\`\`

## Legacy Macro Pattern (Avoid)
\`\`\`rust
#![no_std]
klever_sc::imports!();  // ❌ OLD STYLE - Still works but not recommended

#[klever_sc::contract]
pub trait MyContract {
    // Your contract code
}
\`\`\`

## Why Use Standard Imports?
1. **Better IDE Support**: Standard \`use\` statements work better with rust-analyzer
2. **Clearer Code**: Explicit imports are easier to understand
3. **Future Compatibility**: Macros may be deprecated in future versions
4. **Type Hints**: Better autocomplete and type information

## What Gets Imported
The \`klever_sc::imports::*\` includes everything you need:
- All managed types (ManagedAddress, BigUint, etc.)
- Storage mappers
- Blockchain API functions
- Common traits and derives`,
    {
      title: 'Use Standard Rust Imports Instead of Legacy Macros',
      description: 'Modern Klever contracts should use standard "use" statements, not the imports!() macro',
      tags: ['imports', 'best-practice', 'modern', 'rust', 'macro'],
      relevanceScore: 0.9,
    }
  ),

  // Import Patterns with Unused Warnings
  createKnowledgeEntry(
    'best_practice',
    `# Klever Import Patterns with Unused Imports

## Complete Import Set (All Features)
\`\`\`rust
#![no_std]
#![allow(unused_imports)]  // During development

use klever_sc::imports::*;

// Additional imports for specific features
use klever_sc::{
    api::ManagedTypeApi,
    types::{
        KdaTokenPayment,
        KdaTokenType,
        TokenIdentifier,
    },
};

// For admin features
use klever_sc_modules::pause::PauseModule;
use klever_sc_modules::only_admin::OnlyAdminModule;
\`\`\`

## Minimal Import Set (Basic Contract)
\`\`\`rust
#![no_std]
use klever_sc::imports::*;

#[klever_sc::contract]
pub trait MinimalContract {
    #[init]
    fn init(&self) {}
}
\`\`\`

## Import for Testing
\`\`\`rust
#[cfg(test)]
mod tests {
    use super::*;
    use klever_sc_scenario::{*, testing_framework::*};
    
    #[test]
    fn test_contract() {
        // Test code
    }
}
\`\`\`

## Handling Unused Import Warnings
During development, you might get unused import warnings. Options:

1. **Allow unused during development**:
   \`#![allow(unused_imports)]\`

2. **Use cfg attributes**:
   \`#[cfg(feature = "admin")]\`
   \`use klever_sc_modules::only_admin::OnlyAdminModule;\`

3. **Import only what you need**:
   Instead of \`use klever_sc::types::*\`, use specific types`,
    {
      title: 'Klever Import Patterns with Unused Imports',
      description: 'How to structure imports in Klever contracts and handle unused import warnings',
      tags: ['imports', 'unused', 'warnings', 'patterns', 'modules'],
      relevanceScore: 0.85,
    }
  ),
];

export default importKnowledge;