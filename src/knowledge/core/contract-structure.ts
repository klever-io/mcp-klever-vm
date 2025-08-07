import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * Basic contract structure and templates
 */

export const contractStructureKnowledge: KnowledgeEntry[] = [
  // Basic Contract Structure
  createKnowledgeEntry(
    'code_example',
    `#![no_std]

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
    {
      title: 'Basic Klever Smart Contract Template',
      description: 'Complete template showing the structure of a Klever smart contract with init, upgrade, endpoints, views, events, and storage',
      tags: ['template', 'structure', 'basic', 'contract'],
      language: 'rust',
      contractType: 'template',
      relevanceScore: 0.95,
    }
  ),
];

export default contractStructureKnowledge;