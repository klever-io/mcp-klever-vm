import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * Storage namespace organization patterns
 */

export const storageNamespaceKnowledge: KnowledgeEntry[] = [
  // Storage Namespace Organization Pattern
  createKnowledgeEntry(
    'best_practice',
    `// Storage Namespace Organization with Colon Separator

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
    {
      title: 'Storage Namespace Organization Pattern',
      description: 'Using colon separator in storage mappers for better organization and visualization',
      tags: ['storage', 'organization', 'namespace', 'best-practice', 'patterns'],
      language: 'rust',
      relevanceScore: 0.9,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),
];

export default storageNamespaceKnowledge;