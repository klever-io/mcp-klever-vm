import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * Admin module patterns and documentation
 */

export const adminModuleKnowledge: KnowledgeEntry[] = [
  // Admin Module - Common Mistakes vs Correct Usage
  createKnowledgeEntry(
    'best_practice',
    `# Admin Module - Common Mistakes vs Correct Usage

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
version = "0.45.0"  # check crates.io/crates/klever-sc for latest

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
    {
      title: 'Admin Module - Common Mistakes vs Correct Usage',
      description: 'Clear comparison showing why not to create custom admin modules',
      tags: ['admin', 'module', 'best-practice', 'mistakes', 'sdk'],
      language: 'rust',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Admin Access Control Pattern
  createKnowledgeEntry(
    'code_example',
    `// Admin Access Control with OnlyAdminModule

// Step 1: Add dependency to Cargo.toml
/*
[dependencies.klever-sc-modules]
version = "0.45.0"  # check crates.io/crates/klever-sc for latest
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
    {
      title: 'Admin Access Control Pattern',
      description: 'Using #[only_admin] annotation and OnlyAdminModule for multi-admin access control',
      tags: ['admin', 'access-control', 'security', 'only_admin', 'module'],
      language: 'rust',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // OnlyAdminModule Reference
  createKnowledgeEntry(
    'documentation',
    `# OnlyAdminModule Reference

The OnlyAdminModule is a built-in Klever SDK module that provides multi-admin access control functionality.

## Setup Steps

### 1. Add Dependency to Cargo.toml
\`\`\`toml
[dependencies.klever-sc-modules]
version = "0.45.0"  # check crates.io/crates/klever-sc for latest
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
    {
      title: 'OnlyAdminModule Reference Documentation',
      description: 'Complete reference for the built-in OnlyAdminModule for admin access control',
      tags: ['admin', 'module', 'reference', 'only_admin', 'documentation'],
      language: 'rust',
      relevanceScore: 0.9,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // IMPORTANT: Do NOT Create Custom Admin Module
  createKnowledgeEntry(
    'security_tip',
    `# IMPORTANT: Do NOT Create Custom Admin Module

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
    {
      title: 'IMPORTANT: Do NOT Create Custom Admin Module',
      description: 'Critical warning about not creating custom admin modules when SDK provides one',
      tags: ['admin', 'security', 'warning', 'best-practice', 'module', 'sdk'],
      language: 'rust',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Klever VM SDK Built-in Admin Module
  createKnowledgeEntry(
    'documentation',
    `# Klever VM SDK Built-in Admin Module

## Overview
Klever VM SDK provides a pre-built admin module in the \`klever-sc-modules\` crate that handles administrative functions out of the box.

## Setup and Usage

### 1. Add Dependency to Cargo.toml
\`\`\`toml
[dependencies.klever-sc-modules]
version = "0.45.0"  # check crates.io/crates/klever-sc for latest
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
    {
      title: 'Klever VM SDK Built-in Admin Module',
      description: 'Complete guide for using the pre-built admin module from klever-sc-modules',
      tags: ['admin', 'module', 'sdk', 'klever-sc-modules', 'only_admin', 'built-in'],
      language: 'rust',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Access Control Comparison
  createKnowledgeEntry(
    'best_practice',
    `// Access Control Patterns Comparison

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
        caller == self.blockchain().get_owner_address() || self.is_admin(caller),
        "Only owner or admin can call"
    );
}

// Best Practices:
// - Use #[only_owner] for critical one-time setup or emergency functions
// - Use #[only_admin] for routine administrative tasks
// - Implement custom roles for complex permission systems
// - Always emit events for access control changes
// - Consider time-locks for critical admin actions`,
    {
      title: 'Access Control Patterns Comparison',
      description: 'Comparison of different access control patterns: owner, admin, and custom roles',
      tags: ['access-control', 'security', 'only_owner', 'only_admin', 'best-practice'],
      language: 'rust',
      relevanceScore: 0.9,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),
];

export default adminModuleKnowledge;