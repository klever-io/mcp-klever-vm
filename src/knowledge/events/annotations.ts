import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * Event annotation best practices and patterns
 */

export const eventAnnotationsKnowledge: KnowledgeEntry[] = [
  // Event Annotations Best Practices
  createKnowledgeEntry(
    'best_practice',
    `// Event annotation best practices:

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
    {
      title: 'Event Annotation Best Practices',
      description: 'Rules and patterns for properly defining events in Klever smart contracts',
      tags: ['events', 'annotations', 'best-practice'],
      language: 'rust',
      relevanceScore: 0.9,
    }
  ),
];

export default eventAnnotationsKnowledge;