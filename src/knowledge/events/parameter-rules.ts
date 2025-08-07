import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * Event parameter rules and limitations
 */

export const eventParameterRules: KnowledgeEntry[] = [
  // CRITICAL Event Parameter Rule
  createKnowledgeEntry(
    'error_pattern',
    `# CRITICAL: Event Parameter "One-Data" Rule

## The Golden Rule
**Events can have at most ONE non-indexed parameter (data field)**

### What This Means
- You can have UNLIMITED #[indexed] parameters
- You can have ONLY ONE regular parameter (without #[indexed])
- If you have more than one non-indexed parameter, compilation WILL FAIL

### ❌ WRONG - Will NOT Compile
\`\`\`rust
#[event("transfer_event")]
fn transfer_event(
    &self,
    #[indexed] from: &ManagedAddress,
    #[indexed] to: &ManagedAddress,
    amount: BigUint,      // ❌ First data field
    timestamp: u64,       // ❌ Second data field - COMPILATION ERROR!
);
\`\`\`

**Error:** "only 1 data argument allowed in event log"

### ✅ CORRECT - Option 1: Index Everything
\`\`\`rust
#[event("transfer_event")]
fn transfer_event(
    &self,
    #[indexed] from: &ManagedAddress,
    #[indexed] to: &ManagedAddress,
    #[indexed] amount: &BigUint,      // ✅ Indexed
    #[indexed] timestamp: u64,         // ✅ Indexed
);
\`\`\`

### ✅ CORRECT - Option 2: Combine into Struct
\`\`\`rust
#[derive(TopEncode)]
struct TransferData<M: ManagedTypeApi> {
    amount: BigUint<M>,
    timestamp: u64,
}

#[event("transfer_event")]
fn transfer_event(
    &self,
    #[indexed] from: &ManagedAddress,
    #[indexed] to: &ManagedAddress,
    data: TransferData<Self::Api>,    // ✅ Single data field
);
\`\`\`

### ✅ CORRECT - Option 3: Use MultiValue2
\`\`\`rust
#[event("transfer_event")]
fn transfer_event(
    &self,
    #[indexed] from: &ManagedAddress,
    #[indexed] to: &ManagedAddress,
    data: MultiValue2<BigUint, u64>,  // ✅ Single data field with multiple values
);
\`\`\`

## Best Practice
**Just add #[indexed] to ALL parameters to avoid this error entirely!**

\`\`\`rust
// This pattern ALWAYS works
#[event("my_event")]
fn my_event(
    &self,
    #[indexed] param1: &ManagedAddress,
    #[indexed] param2: &BigUint,
    #[indexed] param3: u64,
    #[indexed] param4: &ManagedBuffer,
    // ... as many as you need, all indexed
);
\`\`\`

## Why This Limitation Exists
- Indexed parameters are stored differently in the blockchain
- They can be queried efficiently
- Data parameters are stored as a single blob
- Multiple data fields would need encoding/decoding logic

## Common Scenarios

### Scenario 1: Transfer Event
\`\`\`rust
#[event("transfer")]
fn transfer_event(
    &self,
    #[indexed] from: &ManagedAddress,
    #[indexed] to: &ManagedAddress,
    #[indexed] token: &TokenIdentifier,
    #[indexed] amount: &BigUint,
);
\`\`\`

### Scenario 2: Complex Data Event
\`\`\`rust
#[derive(TopEncode)]
struct GameResult<M: ManagedTypeApi> {
    winner: ManagedAddress<M>,
    score: u64,
    prize: BigUint<M>,
    timestamp: u64,
}

#[event("game_completed")]
fn game_completed_event(
    &self,
    #[indexed] game_id: u64,
    result: GameResult<Self::Api>,  // All complex data in one struct
);
\`\`\`

## Remember: Maximum ONE non-indexed parameter per event!`,
    {
      title: 'CRITICAL: Event Parameter One-Data Rule',
      description: 'Events can have at most ONE non-indexed parameter - critical compilation rule',
      tags: ['events', 'indexed', 'compilation-error', 'critical', 'parameters'],
      relevanceScore: 0.95,
    }
  ),

  // Event Parameter Limitation Error
  createKnowledgeEntry(
    'error_pattern',
    `# Event Parameter Limitation Error

## Error Message
\`\`\`
error: only 1 data argument allowed in event log
\`\`\`

## Cause
This error occurs when an event has more than one non-indexed parameter.

## Solution
Add #[indexed] to all but one parameter, or combine multiple values into a struct.

### Quick Fix
\`\`\`rust
// Before (causes error)
#[event("my_event")]
fn my_event(&self, user: &ManagedAddress, amount: BigUint, timestamp: u64);

// After (fixed)
#[event("my_event")]
fn my_event(
    &self,
    #[indexed] user: &ManagedAddress,
    #[indexed] amount: &BigUint,
    #[indexed] timestamp: u64
);
\`\`\``,
    {
      title: 'Event Parameter Limitation Error',
      description: 'Solution for "only 1 data argument allowed in event log" error',
      tags: ['events', 'error', 'indexed', 'compilation'],
      relevanceScore: 0.9,
    }
  ),
];

export default eventParameterRules;