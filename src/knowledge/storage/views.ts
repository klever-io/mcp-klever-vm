import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * View endpoints for storage access
 */

export const storageViewsKnowledge: KnowledgeEntry[] = [
  // View Endpoint Pattern
  createKnowledgeEntry(
    'code_example',
    `// View Endpoints for Storage Access

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
    {
      title: 'View Endpoints for Storage Access',
      description: 'Using #[view] annotation to create read-only endpoints for storage values',
      tags: ['view', 'endpoints', 'storage', 'read-only', 'query'],
      language: 'rust',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Complete Storage Pattern with Namespace and Views
  createKnowledgeEntry(
    'code_example',
    `// Complete Storage Pattern with Namespace and Views

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
    {
      title: 'Complete Storage Pattern with Namespace and Views',
      description: 'Full example showing organized storage with namespaces and view endpoints',
      tags: ['storage', 'view', 'namespace', 'complete-example', 'pattern'],
      language: 'rust',
      relevanceScore: 1.0,
      contractType: 'token',
      author: 'klever-mcp',
    }
  ),
];

export default storageViewsKnowledge;