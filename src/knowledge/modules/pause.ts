import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * Pause module patterns and documentation
 */

export const pauseModuleKnowledge: KnowledgeEntry[] = [
  // PauseModule Pattern
  createKnowledgeEntry(
    'code_example',
    `// Contract Pausability with PauseModule

// Step 1: Add dependency to Cargo.toml
/*
[dependencies.klever-sc-modules]
version = "0.45.0"  # check crates.io/crates/klever-sc for latest
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
        // No pause check - owner can always withdraw
        let contract_klv_balance = self.blockchain().get_sc_balance(
            &TokenIdentifier::klv(),
            0
        );
        let owner = self.blockchain().get_owner_address();
        self.send().direct_klv(&owner, &contract_klv_balance);
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
    {
      title: 'Contract Pausability Pattern',
      description: 'Using PauseModule for emergency pause functionality in smart contracts',
      tags: ['pause', 'security', 'module', 'emergency', 'pausable'],
      language: 'rust',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // PauseModule Reference
  createKnowledgeEntry(
    'documentation',
    `# PauseModule Reference

The PauseModule is a built-in Klever SDK module that provides contract pausability functionality.

## Setup Steps

### 1. Add Dependency to Cargo.toml
\`\`\`toml
[dependencies.klever-sc-modules]
version = "0.45.0"  # check crates.io/crates/klever-sc for latest
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

    #[view(isPaused)]
    fn is_paused_view(&self) -> bool {
        self.is_paused()
    }

    fn require_paused(&self) {
        require!(self.is_paused(), "Contract is not paused");
    }

    fn require_not_paused(&self) {
        require!(self.not_paused(), "Contract is paused");
    }

    #[storage_mapper("pause_module:paused")]
    fn paused_status(&self) -> SingleValueMapper<bool>;
}
\`\`\`

## Key Features:
1. **Owner-controlled**: Only contract owner can pause/unpause
2. **View function**: Check pause status via \`isPaused()\`
3. **Helper methods**: Convenient pause checking methods
4. **Storage namespace**: Uses "pause_module:paused" for storage

## Best Practices:
- Initialize pause status in \`init()\`
- Call \`require_not_paused()\` in sensitive functions
- Allow withdrawals even when paused (user protection)
- Consider emergency functions that bypass pause
- Always emit events (currently TODO in module)`,
    {
      title: 'PauseModule Reference Documentation',
      description: 'Complete reference for the built-in PauseModule for contract pausability',
      tags: ['pause', 'module', 'reference', 'documentation', 'security'],
      language: 'rust',
      relevanceScore: 0.9,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Pausable Contract Best Practices
  createKnowledgeEntry(
    'best_practice',
    `// Pausable Contract Best Practices

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

    // 3. Emergency functions for owner
    #[only_owner]
    #[endpoint(emergencyPause)]
    fn emergency_pause(&self) {
        self.set_paused(true);
        // Log the pause reason
        self.pause_reason().set(&ManagedBuffer::from(b"Emergency pause activated"));
    }

    // 4. Combine with admin module for better control
    #[only_admin]
    #[endpoint(adminFunction)]
    fn admin_function(&self) {
        // Admin functions may work when paused
        // depending on your security model
        if self.is_paused() {
            // Special handling for paused state
        }
    }

    // 5. Granular pause control
    #[storage_mapper("deposits_paused")]
    fn deposits_paused(&self) -> SingleValueMapper<bool>;

    #[storage_mapper("withdrawals_paused")]
    fn withdrawals_paused(&self) -> SingleValueMapper<bool>;

    #[storage_mapper("pause_reason")]
    fn pause_reason(&self) -> SingleValueMapper<ManagedBuffer>;

    #[storage_mapper("user_balance")]
    fn user_balance(&self, user: &ManagedAddress) -> SingleValueMapper<BigUint>;
}

// Best Practices Summary:
// ✓ Always allow users to withdraw their funds
// ✓ Initialize pause state in init()
// ✓ Use require_not_paused() at the start of sensitive functions
// ✓ Consider granular pause controls for different features
// ✓ Log pause reasons for transparency
// ✓ Test pause/unpause thoroughly
// ✓ Consider time-locked unpausing
// ✗ Don't pause withdrawal functions
// ✗ Don't forget to check pause status in new endpoints`,
    {
      title: 'Pausable Contract Best Practices',
      description: 'Best practices for implementing pausable smart contracts with security considerations',
      tags: ['pause', 'security', 'best-practice', 'module', 'emergency'],
      language: 'rust',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),
];

export default pauseModuleKnowledge;