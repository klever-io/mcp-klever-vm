import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * Storage mapper patterns and selection guide
 */

export const storageMapperKnowledge: KnowledgeEntry[] = [
  // Storage Mapper Selection Guide
  createKnowledgeEntry(
    'best_practice',
    `// Storage Mapper Selection Guide

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
    {
      title: 'Storage Mapper Selection Guide',
      description: 'Comprehensive guide for choosing the right storage mapper for different use cases',
      tags: ['storage', 'mappers', 'patterns', 'best-practice'],
      language: 'rust',
      relevanceScore: 0.95,
    }
  ),

  // ManagedTypeApi Requirement for Structs
  createKnowledgeEntry(
    'best_practice',
    `# ManagedTypeApi Requirement for Custom Structs

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
    {
      title: 'ManagedTypeApi Requirements for Structs',
      description: 'Complete guide on using ManagedTypeApi with custom structs containing managed types',
      tags: ['managed-types', 'structs', 'generics', 'best-practice', 'patterns'],
      language: 'rust',
      relevanceScore: 0.95,
    }
  ),
];

export default storageMapperKnowledge;