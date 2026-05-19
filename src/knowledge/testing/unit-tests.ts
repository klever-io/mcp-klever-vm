import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

export const unitTestsKnowledge: KnowledgeEntry[] = [
  createKnowledgeEntry(
    'code_example',
    `# Unit Testing Smart Contracts with SingleTxApi

Unit tests are the fastest test type — no blockchain simulation, no state setup. They call contract functions directly using \`SingleTxApi\`.

## When to Use
- Testing pure logic (math, transformations, state reads/writes)
- Fast feedback loops during development
- No cross-contract calls, no KLV/KDA payments needed

## Setup

Add to \`Cargo.toml\`:
\`\`\`toml
[dev-dependencies]
klever-sc-scenario = { version = "0.*" }
\`\`\`

## Basic Unit Test

\`\`\`rust
use adder::*;
use klever_sc::types::BigUint;
use klever_sc_scenario::api::SingleTxApi;

#[test]
fn adder_unit_test() {
    // Create contract object directly — no blockchain simulation
    let contract = adder::contract_obj::<SingleTxApi>();

    // Call init (simulates deploy constructor)
    contract.init(BigUint::from(5u32));
    assert_eq!(BigUint::from(5u32), contract.sum().get());

    // Call endpoint
    contract.add(BigUint::from(7u32));
    assert_eq!(BigUint::from(12u32), contract.sum().get());

    contract.add(BigUint::from(1u32));
    assert_eq!(BigUint::from(13u32), contract.sum().get());
}
\`\`\`

## Accessing Storage Directly

\`\`\`rust
#[test]
fn storage_direct_test() {
    let contract = my_contract::contract_obj::<SingleTxApi>();

    contract.init(BigUint::from(100u32));

    // Read storage mapper directly
    let stored = contract.my_value().get();
    assert_eq!(stored, BigUint::from(100u32));

    // Write storage mapper directly (no tx needed)
    contract.my_value().set(BigUint::from(200u32));
    assert_eq!(contract.my_value().get(), BigUint::from(200u32));
}
\`\`\`

## Limitations
- Cannot test \`#[payable]\` endpoints (no KLV/KDA transfers)
- Cannot test blockchain state queries (caller, epoch, etc.)
- Cannot test cross-contract calls
- Use whitebox or blackbox tests for those scenarios`,
    {
      title: 'Unit Testing Smart Contracts with SingleTxApi',
      description:
        'How to write fast unit tests for Klever smart contracts using SingleTxApi without blockchain simulation',
      tags: ['testing', 'unit-test', 'SingleTxApi', 'contract_obj', 'no-simulation'],
      language: 'rust',
      relevanceScore: 0.93,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),
];

export default unitTestsKnowledge;
