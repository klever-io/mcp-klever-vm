---
name: klever-dev
description: End-to-end Klever blockchain development — smart contracts (Rust/WASM), transaction building (@klever/connect, klever-go-sdk), deployment via ksc + koperator, and on-chain interaction via MCP tools. Use when the task involves KLV, KDA tokens, klv1 addresses, Klever smart contracts, or Klever node/API interaction.
user-invocable: true
---

# Klever Blockchain Skill

> LLM-optimized reference for building on Klever. Use this to produce correct smart contracts, transactions, and dApp integrations.

## Role

You are an expert Klever blockchain developer. Your stack:

- **Smart contracts**: Rust with `klever_sc` framework, compiled to WASM
- **Client SDKs**: `@klever/connect` (TypeScript) or `klever-go-sdk` (Go)
- **Tooling**: `ksc` (compiler) + `koperator` (deploy/invoke/query)
- **Networks**: Testnet for development, mainnet for production

You write clean, secure, production-ready code. You always validate against the correctness rules below before writing any code.

## When to Use This Skill

Activate this skill when the task involves ANY of the following:

- KLV or KDA tokens (balances, transfers, staking, freezing)
- `klv1...` addresses (bech32 format)
- Klever smart contracts (Rust, `klever_sc`, WASM)
- `ksc` or `koperator` CLI commands
- Klever node or API interaction (ports 8080/9090)
- `@klever/connect` or `klever-go-sdk` usage

## Task Decision Tree

Use this to route the task to the correct guide:

```
What does the task involve?
├─ Writing a smart contract?
│  ├─ New contract from scratch
│  │  └─ Start with Quick Start below, then → 01-smart-contracts.md
│  ├─ Adding storage/state
│  │  └─ → 02-storage.md (mappers, namespaces)
│  ├─ Handling tokens/payments
│  │  └─ → 03-tokens.md (payable endpoints, KLV/KDA)
│  ├─ Emitting events
│  │  └─ → 04-events.md (ONE-DATA rule)
│  └─ Using modules (admin, pause)
│     └─ → 05-modules.md
│
├─ Building or deploying?
│  └─ → 06-deployment.md (ksc build, koperator deploy/invoke/query)
│
├─ Querying on-chain data?
│  └─ → 07-api-reference.md (Node API port 8080, API proxy port 9090)
│
├─ Reviewing for security?
│  └─ → 08-security.md (reentrancy, overflow, access control)
│
└─ Debugging an error?
   └─ → 09-troubleshooting.md (common errors and fixes)
```

## How to Use This Skill

1. **Classify** the task using the decision tree above
2. **Validate** against the correctness rules below before writing any code
3. **Reference** the detailed guide for the relevant topic — start minimal, add complexity only when needed
4. **Verify** all code uses the correct imports, address format, decimals, and CLI flags
5. **Deliver** complete, working code with build/deploy commands and security considerations

## Klever Quick Reference

Validate all code against these facts before outputting.

- **KLV decimals**: 6 (1 KLV = 1,000,000 units)
- **KFI decimals**: 6 (same as KLV)
- **KDA decimals**: up to 8 (varies per asset — check the asset's `precision` field)
- **Address format**: `klv1...` (bech32)
- **Import**: `use klever_sc::imports::*;`
- **Contract macro**: `#[klever_sc::contract]`
- **Crate**: `klever-sc` ([latest version on crates.io](https://crates.io/crates/klever-sc))
- **Modules crate**: `klever-sc-modules` (use same version as `klever-sc`)
- **Node port**: 8080 (default, configurable)
- **API proxy port**: 9090 (default, configurable)
- **koperator payments**: `--values "TOKEN=amount"` (plural, token=amount format)
- **koperator arguments**: positional — `koperator sc invoke ADDRESS FUNCTION`
- **Event data params**: max 1 non-indexed, all others must be `#[indexed]`

## Common Mistakes

These are the most frequent errors. Check your output against this list.

### 1. Wrong decimal precision

KLV and KFI use **6 decimals**. 1 KLV = 1,000,000 units. Never use 18 (that's EVM).

```rust
// WRONG: 18 decimals
let one_klv = BigUint::from(1_000_000_000_000_000_000u64);

// CORRECT: 6 decimals
let one_klv = BigUint::from(1_000_000u64);
```

### 2. Using `--value` instead of `--values`

koperator uses `--values` (plural) with token=amount format.

```bash
# WRONG
koperator sc invoke ADDR func --value 1000000

# CORRECT
koperator sc invoke ADDR func --values "KLV=1000000" --sign --await --result-only
```

### 3. Using `--function` flag instead of positional argument

koperator uses positional arguments, not flags, for contract address and function name.

```bash
# WRONG
koperator sc invoke --contract ADDR --function func

# CORRECT
koperator sc invoke ADDR func --sign --await --result-only
```

### 4. Multiple non-indexed event parameters

Events allow maximum ONE non-indexed parameter. All others must be `#[indexed]`.

```rust
// WRONG: two non-indexed params — compile error
#[event("transfer")]
fn transfer_event(&self, from: &ManagedAddress, to: &ManagedAddress, amount: &BigUint);

// CORRECT: only amount is non-indexed
#[event("transfer")]
fn transfer_event(
    &self,
    #[indexed] from: &ManagedAddress,
    #[indexed] to: &ManagedAddress,
    amount: &BigUint,  // only non-indexed param
);
```

### 5. BigUint subtraction without validation

BigUint panics on underflow. Always check before subtracting.

```rust
// WRONG: aborts if balance < amount
self.balance(&user).update(|b| *b -= &amount);

// CORRECT: validate first
require!(balance >= amount, "Insufficient balance");
self.balance(&user).update(|b| *b -= &amount);
```

### 6. Missing `#[upgrade]` endpoint

Upgradeable contracts must define an `#[upgrade]` function. Without it, contract upgrades will fail.

```rust
#[upgrade]
fn upgrade(&self) {}
```

## Quick Start

### Project Setup (Cargo.toml)

```toml
[package]
name = "my-contract"
version = "0.1.0"
edition = "2021"

[lib]
path = "src/lib.rs"

[dependencies.klever-sc]
version = "0.45.0"  # use latest from crates.io

[dev-dependencies.klever-sc-scenario]
version = "0.45.0"  # use latest from crates.io
```

### Minimal Contract

```rust
#![no_std]
use klever_sc::imports::*;

#[klever_sc::contract]
pub trait MyContract {
    #[init]
    fn init(&self) {}

    #[upgrade]
    fn upgrade(&self) {}

    #[endpoint]
    fn set_value(&self, value: u64) {
        self.stored_value().set(value);
    }

    #[view(getValue)]
    fn get_value(&self) -> u64 {
        self.stored_value().get()
    }

    #[storage_mapper("storedValue")]
    fn stored_value(&self) -> SingleValueMapper<u64>;
}
```

### Build & Deploy

```bash
# Build
~/klever-sdk/ksc all build

# Deploy
~/klever-sdk/koperator sc create \
    --wasm="output/contract.wasm" \
    --upgradeable --readable --payable --payableBySC \
    --sign --await --result-only
```

### Invoke & Query

```bash
# State-changing call (invoke)
~/klever-sdk/koperator sc invoke CONTRACT_ADDR set_value \
    --args "u64:42" \
    --sign --await --result-only

# Read-only call (query)
~/klever-sdk/koperator sc query CONTRACT_ADDR getValue
```

## Argument Types for koperator

| Type | Example |
|---|---|
| Address | `--args "Address:klv1abc..."` |
| TokenIdentifier | `--args "TokenIdentifier:KLV"` |
| String | `--args "String:hello"` |
| u32 / u64 | `--args "u32:42"` |
| BigUint | `--args "bi:1000000"` |
| Bool | `--args "bool:true"` |
| Hex | `--args "hex:deadbeef"` |

## Networks

| Network | Node URL | API URL |
|---|---|---|
| Mainnet | `https://node.mainnet.klever.org` | `https://api.mainnet.klever.org` |
| Testnet | `https://node.testnet.klever.org` | `https://api.testnet.klever.org` |
| Devnet | `https://node.devnet.klever.org` | `https://api.devnet.klever.org` |
| Local | `http://localhost:8080` | `http://localhost:9090` |

## Detailed Guides

1. [Smart Contracts](skills/01-smart-contracts.md) -- Contract structure, endpoints, lifecycle
2. [Storage](skills/02-storage.md) -- All mapper types, namespaces, patterns
3. [Tokens & Payments](skills/03-tokens.md) -- KLV/KDA handling, payable endpoints
4. [Events](skills/04-events.md) -- Event definitions, the ONE-DATA rule
5. [Modules](skills/05-modules.md) -- Admin, Pause, custom modules
6. [Build & Deploy](skills/06-deployment.md) -- ksc, koperator, scripts
7. [API Reference](skills/07-api-reference.md) -- Node and API proxy endpoints
8. [Security & Best Practices](skills/08-security.md) -- Common vulnerabilities, patterns
9. [Troubleshooting](skills/09-troubleshooting.md) -- Common errors and fixes

## MCP Server

For AI-assisted development, connect to the Klever MCP Server:

```bash
# npm (local stdio mode)
npx @klever/mcp-server

# Docker
docker run -p 3000:3000 kleverapp/mcp-klever-vm:latest

# Remote (no install)
# URL: https://mcp.klever.org/mcp
```

**Knowledge tools**: `search_documentation`, `query_context`, `get_context`, `find_similar`, `get_knowledge_stats`, `enhance_with_context`, `analyze_contract`

**Project tools**: `init_klever_project`, `add_helper_scripts`

**Other tools**: `add_context`
