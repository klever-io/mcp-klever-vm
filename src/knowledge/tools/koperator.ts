import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * Koperator tool documentation and usage patterns
 *
 * Source of truth: operator-sc-invoke-create.md (extracted from koperator source code)
 */

export const koperatorKnowledge: KnowledgeEntry[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // ENTRY 1 — CRITICAL: Correct Koperator Syntax
  // ──────────────────────────────────────────────────────────────────────────
  createKnowledgeEntry(
    'deployment_tool',
    `# ⚠️ CRITICAL: Correct Koperator Command Syntax ⚠️

## sc invoke — ALWAYS Use This Format:

\`\`\`bash
~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke CONTRACT_ADDRESS FUNCTION_NAME \\
    --args "type:value" \\
    --values "KLV=amount" \\
    --sign --await --result-only
\`\`\`

CONTRACT_ADDRESS (positional arg 0, required) and FUNCTION_NAME (positional arg 1) are NOT flags.
If FUNCTION_NAME is omitted you must provide \`--message\` with raw data instead.
\`--args\` and \`--message\` are **mutually exclusive** — never pass both.

## sc create — Deploy Format:

\`\`\`bash
~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc create \\
    --wasm="output/contract.wasm" \\
    --args "type:value" \\
    --upgradeable --readable --payable --payableBySC \\
    --sign --await --result-only
\`\`\`

Note: \`--upgradeable\` **defaults to true**. Omit it only when you want an immutable contract.

## ❌ NEVER USE These Wrong Patterns:
- \`--contract="address"\` ❌ WRONG — use positional argument
- \`--function="name"\` ❌ WRONG — use positional argument
- \`--value="amount"\` ❌ WRONG — use \`--values "KLV=amount"\` (plural)
- \`--token-transfers\` ❌ WRONG — use \`--values\`
- \`Option:String:hello\` ❌ WRONG — use \`optionstring:hello\` (no colon between option and type)
- \`List:u32:1,u32:2\` ❌ WRONG — no single-arg list syntax; pass each element as separate \`--args\`
- \`--args "hex:0x1a2b3c"\` ❌ WRONG — hex type must NOT have 0x prefix, use \`hex:1a2b3c\`

## Correct Examples:

### Simple Function Call
\`\`\`bash
~/klever-sdk/koperator sc invoke klv1abc... myFunction \\
    --sign --await --result-only
\`\`\`

### With Arguments
\`\`\`bash
~/klever-sdk/koperator sc invoke klv1abc... transfer \\
    --args "address:klv1xyz..." \\
    --args "bi:1000000" \\
    --sign --await --result-only
\`\`\`

### With Payment
\`\`\`bash
~/klever-sdk/koperator sc invoke klv1abc... stake \\
    --values "KLV=10000000" \\
    --sign --await --result-only
\`\`\`

### With Optional Argument
\`\`\`bash
~/klever-sdk/koperator sc invoke klv1abc... setConfig \\
    --args "optionu64:100" \\
    --args "optionstring:newName" \\
    --sign --await --result-only
\`\`\`

### Deploy with Init Arguments
\`\`\`bash
~/klever-sdk/koperator sc create \\
    --wasm="output/contract.wasm" \\
    --args "BigUint:1000000" \\
    --args "address:klv1owner..." \\
    --payable --payableBySC --readable \\
    --sign --await --result-only
\`\`\`

## 🚨 CRITICAL for Unattended Scripts:
You MUST use these three flags together:
- \`--sign\` (-s): Signs and broadcasts without user interaction
- \`--await\`: Waits for the TX to be posted on-chain
- \`--result-only\`: Returns only clean JSON result (requires --await)

Without these flags, scripts will hang waiting for user input or produce unparseable output!

## Other Important Global Flags:
- \`--create-only\` (-c): Build the TX JSON without broadcasting (offline signing)
- \`--nonce-check\`: Nonce strategy — \`current\` (default), \`first-pending\`, or \`pending\`
- \`--kdaFee\`: Pay fees with a specific KDA token
- \`--verbose\`: Enable trace-level logging for debugging`,
    {
      title: 'CRITICAL: Correct Koperator Syntax - READ THIS FIRST',
      description:
        'The ONLY correct way to use koperator sc invoke and sc create. Covers positional args, option syntax, --message vs --args, and automation flags.',
      tags: ['koperator', 'critical', 'syntax', 'sc-invoke', 'sc-create', 'commands', 'smart-contract'],
      language: 'bash',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // ──────────────────────────────────────────────────────────────────────────
  // ENTRY 2 — Koperator Tool Overview (command hierarchy + all flags)
  // ──────────────────────────────────────────────────────────────────────────
  createKnowledgeEntry(
    'documentation',
    `# Koperator - Klever Operator Tool

## Overview
Koperator is the command-line tool for interacting with the Klever blockchain and smart contracts.

## Location
\`~/klever-sdk/koperator\` (installed by the Klever VSCode extension or manually)

## Command Hierarchy

\`\`\`
operator
  └── sc                          # smart contract actions
        ├── create  (alias: csc)  # deploy a new smart contract
        ├── invoke  (alias: isc)  # call a function on a deployed contract
        ├── upgrade (alias: usc)  # upgrade an existing contract
        ├── delete  (alias: dsc)  # delete a contract
        ├── run-scenarios (alias: rs)
        └── parse-output  (alias: scpo)
\`\`\`

## sc create — Deploy a New Contract

\`\`\`bash
~/klever-sdk/koperator sc create [optional-extra-hex] \\
    --wasm <path-to-wasm> \\
    [--vmType <hex>] \\
    [--args <type:value> ...] \\
    [--values 'KLV=amount,...'] \\
    [--payable] [--upgradeable] [--payableBySC] [--readable] \\
    [global flags]
\`\`\`

Create-specific flags:
- \`--wasm\` (string, required): Path to the .wasm binary file
- \`--vmType\` (string, default \`0500\`): VM type hex (KleverVM WASM)

Data assembly: \`<hex-wasm>@<vmType>@<metadata-hex>[extra-hex][encoded-args]\`
TX type: SmartContract_SCDeploy (receiver = zero address)

## sc invoke — Call a Contract Endpoint

\`\`\`bash
~/klever-sdk/koperator sc invoke <contract-address> [function-name] \\
    [--args <type:value> ...] \\
    [--values 'KLV=amount,...'] \\
    [--message "raw-data"] \\
    [global flags]
\`\`\`

Positional args: CONTRACT_ADDRESS (required), FUNCTION_NAME (optional if --message used)
Data assembly: \`<functionName>@<encoded-arg-1>@<encoded-arg-2>@...\`
TX type: SmartContract_SCInvoke

## Shared Flags (sc sub-commands)

| Flag | Type | Default | Applies to | Description |
|------|------|---------|------------|-------------|
| \`--args\` | string[] | [] | create, invoke, upgrade | Typed arguments (\`type:value\`). Repeat per arg. Mutually exclusive with \`--message\`. |
| \`--values\` | string→int64 | nil | create, invoke, upgrade | Token transfers: \`'KLV=1000000,KDA-ab12=500'\`. **Does NOT work for delete.** |
| \`--payable\` | bool | false | **create, upgrade only** | Sets contract's payable metadata flag. **Ignored by invoke and delete.** |
| \`--upgradeable\` | bool | **true** | **create, upgrade only** | Sets contract's upgradeable metadata flag. **Defaults to true. Ignored by invoke and delete.** |
| \`--payableBySC\` | bool | false | **create, upgrade only** | Sets contract's payableBySC metadata flag. **Ignored by invoke and delete.** |
| \`--readable\` | bool | false | **create, upgrade only** | Sets contract's readable metadata flag. **Ignored by invoke and delete.** |

## Global Flags (all operator commands)

| Flag | Short | Type | Default | Description |
|------|-------|------|---------|-------------|
| \`--key-file\` | \`-k\` | string | \`./walletKey.pem\` | Wallet PEM file path |
| \`--node\` | \`-n\` | string | \`http://localhost:8080\` | Node API endpoint |
| \`--nonce\` | — | uint64 | 0 (auto-fetch) | Explicit TX nonce. 0 = auto-fetch from chain. |
| \`--nonce-check\` | — | string | \`current\` | Nonce strategy: \`current\`, \`first-pending\`, \`pending\` |
| \`--message\` | — | string[] | nil | Raw data bytes. Mutually exclusive with \`--args\`. |
| \`--permID\` | — | int32 | 0 | Permission ID for multi-sig accounts |
| \`--fromAddress\` | — | string | "" | Override sender address |
| \`--password\` | \`-p\` | string | "" | PEM file password (omit value to be prompted) |
| \`--password-file\` | — | string | "" | Path to password file |
| \`--multi-files\` | \`-m\` | string[] | [] | Additional PEM files for multi-signing |
| \`--create-only\` | \`-c\` | bool | false | Build TX JSON without broadcasting |
| \`--sign\` | \`-s\` | bool | false | Auto-sign without interactive confirmation |
| \`--kdaFee\` | — | string | "" | Pay fees with a specific KDA token |
| \`--await\` | — | bool | false | Wait for TX to be posted on-chain |
| \`--result-only\` | — | bool | false | Print only the TX result (requires \`--await\`) |
| \`--verbose\` | — | bool | false | Enable trace-level logging |

## Nonce Strategies (\`--nonce-check\`)

| Strategy | Behavior | Use When |
|----------|----------|----------|
| \`current\` (default) | Uses the last confirmed nonce | Normal single-TX operations |
| \`first-pending\` | Uses the first pending nonce | Replacing a stuck transaction |
| \`pending\` | Uses the next pending nonce | Sending multiple TXs in rapid succession |

## Node Configuration

\`\`\`bash
# Option 1: Environment variable
export KLEVER_NODE="https://node.testnet.klever.org"

# Option 2: --node parameter
~/klever-sdk/koperator --node="https://node.testnet.klever.org" sc invoke ...

# Networks:
# Mainnet: https://node.mainnet.klever.org
# Testnet: https://node.testnet.klever.org
# Devnet:  https://node.devnet.klever.org
# Local:   http://localhost:8080
\`\`\``,
    {
      title: 'Koperator Tool - Complete Overview and Flags Reference',
      description:
        'Comprehensive overview: command hierarchy with aliases, sc create/invoke usage, all shared and global flags, nonce strategies',
      tags: [
        'koperator',
        'cli',
        'tool',
        'smartcontract',
        'smart-contract',
        'deploy',
        'upgrade',
        'invoke',
        'flags',
        'reference',
      ],
      language: 'bash',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // ──────────────────────────────────────────────────────────────────────────
  // ENTRY 3 — Argument Types (complete, authoritative)
  // ──────────────────────────────────────────────────────────────────────────
  createKnowledgeEntry(
    'documentation',
    `# Koperator Argument Types — Complete Reference

Every \`--args\` value follows the pattern \`<type>:<value>\` where type is case-insensitive.
The type prefix is **mandatory** — there is no auto-detection without it (except \`number:\` which auto-selects integer width).
Numeric values must NOT include underscores or thousand separators (e.g. use \`1000000\`, not \`1_000_000\`).

## Supported Types & Aliases

| Type tag(s) | Rust SDK type | Value format | Example |
|-------------|---------------|--------------|---------|
| \`u8\`, \`U8\` | u8 | Decimal integer | \`u8:255\` |
| \`u16\`, \`U16\` | u16 | Decimal integer | \`u16:500\` |
| \`u32\`, \`U32\`, \`usize\`, \`USIZE\` | u32 / usize | Decimal integer | \`u32:50000\` |
| \`u64\`, \`U64\` | u64 | Decimal integer | \`u64:5000000000\` |
| \`i8\`, \`I8\` | i8 | Decimal integer | \`i8:-5\` |
| \`i16\`, \`I16\` | i16 | Decimal integer | \`i16:500\` |
| \`i32\`, \`I32\`, \`isize\`, \`ISIZE\` | i32 / isize | Decimal integer | \`i32:50000\` |
| \`i64\`, \`I64\` | i64 | Decimal integer | \`i64:5000000000\` |
| \`BigInt\`, \`bigint\`, \`bi\`, \`BI\`, \`n\`, \`N\` | BigInt | Decimal (may be negative) | \`bi:1000000000000\` |
| \`BigUint\`, \`biguint\` | BigUint | Decimal (positive) | \`BigUint:99999999\` |
| \`BigFloat\`, \`bigfloat\`, \`bf\`, \`BF\`, \`f\`, \`F\` | BigFloat | Decimal float | \`bf:3.14\` |
| \`Number\`, \`number\` | *(auto-detect)* | Decimal integer | \`number:500\` → u16, \`number:-5\` → i8 |
| \`Address\`, \`address\`, \`a\`, \`A\` | ManagedAddress | \`klv1…\` bech32 string | \`address:klv1qqqq…\` |
| \`String\`, \`string\`, \`ManagedBuffer\`, \`managedbuffer\`, \`TokenIdentifier\`, \`tokenidentifier\`, \`bytes\`, \`BoxedBytes\`, \`boxedbytes\`, \`Vec<u8>\`, \`vec<u8>\`, \`&str\`, \`&[u8]\` | ManagedBuffer / TokenIdentifier / String / Vec<u8> | UTF-8 string | \`string:hello\` |
| \`bool\`, \`boolean\`, \`b\`, \`B\` | bool | true or false | \`bool:true\` |
| \`empty\`, \`0\`, \`e\`, \`E\` | *(None / empty)* | *(ignored)* | \`empty:\` |
| \`file\`, \`code\`, \`wasm\` | *(file contents)* | File path | \`file:./output/contract.wasm\` |
| \`hex\` | *(raw pass-through)* | Hex string | \`hex:0a1b2c\` |

## Option Wrapper (Option<T>)

To encode an optional value, prefix the type tag with \`option\` (**no colon, no separator**):

\`\`\`
option<type>:<value>
\`\`\`

Examples:
\`\`\`bash
--args "optionu32:100"       # Some(100u32)
--args "optionu64:1"         # Some(1u64)
--args "optionstring:abc"    # Some("abc")
--args "optionbool:true"     # Some(true)
--args "optionbool:false"    # Some(false)
--args "empty:"              # None
\`\`\`

> ⚠️ WRONG: \`Option:u32:42\`, \`Option:String:hello\` — these do NOT work!

## Rust SDK Type → Koperator Prefix Mapping

| Rust SDK Type | Recommended prefix | Example |
|---------------|-------------------|---------|
| \`u8\` | \`u8:\` | \`--args "u8:1"\` |
| \`u16\` | \`u16:\` | \`--args "u16:256"\` |
| \`u32\` / \`usize\` | \`u32:\` | \`--args "u32:8"\` |
| \`u64\` | \`u64:\` | \`--args "u64:1234567890"\` |
| \`i8\` | \`i8:\` | \`--args "i8:-5"\` |
| \`i16\` | \`i16:\` | \`--args "i16:-500"\` |
| \`i32\` | \`i32:\` | \`--args "i32:50000"\` |
| \`i64\` | \`i64:\` | \`--args "i64:5000000000"\` |
| \`BigUint\` | \`bi:\` or \`BigUint:\` | \`--args "bi:5000000000"\` |
| \`BigInt\` | \`bi:\` or \`BigInt:\` | \`--args "bi:-5000"\` |
| \`BigFloat\` | \`bf:\` or \`BigFloat:\` | \`--args "bf:3.14"\` |
| \`ManagedBuffer\` / \`String\` | \`string:\` | \`--args "string:MyToken"\` |
| \`ManagedAddress\` | \`address:\` | \`--args "address:klv1…"\` |
| \`TokenIdentifier\` | \`string:\` or \`TokenIdentifier:\` | \`--args "string:KLV"\` |
| \`bool\` | \`bool:\` | \`--args "bool:true"\` |
| \`Option<T>\` | \`option<prefix>:\` or \`empty:\` | \`--args "optionu64:100"\` |
| \`ManagedVec<T>\` / \`List<T>\` | Separate \`--args\` per element | \`--args "u32:1" --args "u32:2"\` |
| \`variadic<T>\` | Separate \`--args\` per element | \`--args "bi:100" --args "bi:200"\` |
| Raw hex bytes | \`hex:\` | \`--args "hex:deadbeef"\` |

## Composite Types (List, Tuple, Variadic)

There is **NO single-arg syntax** for List, Tuple, or Variadic. Pass each element as a separate \`--args\`:

\`\`\`bash
# List<u32> — 3 elements:
--args "u32:10" --args "u32:20" --args "u32:30"

# tuple<u32, String, Address> — each positional element:
--args "u32:42" --args "string:hello" --args "address:klv1..."

# variadic<BigUint> — as tail parameter, each value:
--args "BigUint:100" --args "BigUint:200" --args "BigUint:300"

# Mixed: endpoint(u32, variadic<BigUint>):
--args "u32:1" --args "BigUint:100" --args "BigUint:200"
\`\`\`

## Token Payments (--values, NOT --args)

⚠️ **--values amounts are in RAW smallest units** (not display amounts).
Each token has its own precision (0–8 decimal places). You MUST multiply by 10^decimals.
KLV has 6 decimals → 1 KLV = 1000000 raw. KFI has 6 decimals → 1 KFI = 1000000 raw.
A custom KDA token with 8 decimals → 1 token = 100000000 raw.
A custom KDA token with 0 decimals → 1 token = 1 raw.
This is different from \`koperator account send\` which accepts display amounts directly.

**Formula**: raw_amount = display_amount × 10^token_precision

Payments use \`--values\` with \`=\` syntax:
\`\`\`bash
--values "KLV=1000000"                     # 1 KLV (precision 6 → 1×10^6)
--values "KLV=10000000"                    # 10 KLV
--values "KLV=1000000,KFI=500000"          # Multiple tokens
--values "MYTKN-a1b2=100000000"            # 1 MYTKN (if precision=8 → 1×10^8)
--values "NFT-XY01/01=1"                   # NFT (precision 0, nonce 01)
--values "SFT-AB12/05=100"                 # SFT with nonce
\`\`\`

❌ NEVER use \`--args\` for payments. ❌ NEVER use \`--value\` (singular).`,
    {
      title: 'Koperator Argument Types — Complete Reference',
      description:
        'Complete and authoritative reference for all --args type prefixes, Rust SDK type mapping, Option syntax, composite types, and token payments',
      tags: [
        'koperator',
        'arguments',
        'types',
        'encoding',
        'reference',
        'cli',
        'rust-mapping',
        'critical',
        'smart-contract',
      ],
      language: 'bash',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // ──────────────────────────────────────────────────────────────────────────
  // ENTRY 4 — Encoding Rules & Composite Types
  // ──────────────────────────────────────────────────────────────────────────
  createKnowledgeEntry(
    'best_practice',
    `# Koperator Argument Encoding Rules

## Top-Level vs Nested Encoding

Values encode **differently** depending on whether they appear at top-level (direct --args) or nested inside a composite type (Option, List, Tuple, Struct).

| Type category | Top-level encoding | Nested encoding |
|---------------|-------------------|-----------------|
| Unsigned ints (\`u8\`–\`u64\`) | Minimal even-length hex | Fixed to declared bit-width (zero-padded) |
| Signed ints (\`i8\`–\`i64\`) | Minimal even-length hex (two's complement) | Fixed to declared bit-width |
| \`bool\` | \`01\` (true) or empty (false) | \`01\` (true) or \`00\` (false) |
| Dynamic types (\`String\`, \`BigUint\`, \`BigInt\`, \`BigFloat\`, \`bytes\`) | Raw hex (minimal) | 4-byte length prefix + raw hex |
| \`Address\` | 64 hex chars (always fixed) | 64 hex chars (always fixed) |

### Examples of the same value in different contexts:

\`\`\`
Top-level:   u32:50000  →  c350          (minimal 2 bytes)
Nested:      u32:50000  →  0000c350      (fixed 4 bytes)

Top-level:   bool:false →  (empty)
Nested:      bool:false →  00

Top-level:   string:hi  →  6869
Nested:      string:hi  →  000000026869  (4-byte length prefix + data)

Top-level:   BigUint:5000 →  1388
Nested:      BigUint:5000 →  000000021388  (4-byte length prefix + data)
\`\`\`

## Per-Type Encoding Details

### Unsigned Integers (u8, u16, u32, u64)

Top-level: minimum even-length hex, no leading zeros beyond even-length.
Nested/Option: fixed-width to declared type (1/2/4/8 bytes), zero-padded.

| Input | Top-level hex |
|-------|---------------|
| \`u8:5\` | \`05\` |
| \`u16:500\` | \`01f4\` |
| \`u32:50000\` | \`c350\` |
| \`u64:5000000000\` | \`012a05f200\` |

### Signed Integers (i8, i16, i32, i64)

Top-level: minimum even-length hex. Negative values use two's complement. Hex auto-fits to smallest standard size.
Nested/Option: exact bit-width (1/2/4/8 bytes), zero-padded.
Odd-length hex padded with \`0\` (positive) or \`f\` (negative) on left.

| Input | Top-level hex |
|-------|---------------|
| \`i8:5\` | \`05\` |
| \`i32:50000\` | \`0000c350\` |
| \`i8:-5\` | \`fb\` |
| \`i16:-500\` | \`fe0c\` |

> Key difference: \`u32:50000\` → \`c350\` (minimal), \`i32:50000\` → \`0000c350\` (full width).

### BigInt / BigUint

Decimal → minimal hex. Negative BigInt uses two's complement with minimum byte width.
Nested/Option: 4-byte (8 hex digit) length prefix prepended.

| Input | Top-level hex |
|-------|---------------|
| \`BigInt:5000\` | \`1388\` |
| \`BigInt:-5000\` | \`ec78\` |
| \`BigUint:500000\` | \`07a120\` |

### BigFloat

Decimal → Go big.Float (53-bit precision) → GobEncode → hex.
Nested/Option: 4-byte length prefix added.

### Number (auto-detect)

Auto-selects the smallest fitting type: positive → u8/u16/u32/u64, negative → i8/i16/i32/i64.

| Input | Auto type | Hex |
|-------|-----------|-----|
| \`number:5\` | u8 | \`05\` |
| \`number:-5\` | i8 | \`fb\` |
| \`number:500\` | u16 | \`01f4\` |
| \`number:500000\` | u32 | \`07a120\` |

### Address

Bech32 \`klv1…\` decoded to 32-byte public key → 64 hex chars. Always fixed-width.

### String / ManagedBuffer / TokenIdentifier / bytes

UTF-8 bytes → hex-encoded (\`%02x\` per byte).
Nested/Option: 4-byte length prefix prepended.

| Input | Hex |
|-------|-----|
| \`string:hello\` | \`68656c6c6f\` |
| \`string:KLV\` | \`4b4c56\` |

### Boolean

\`true\` → \`01\`. \`false\` → empty string (top-level) or \`00\` (nested/option).

### Empty

Always returns empty string. Used for None option values or placeholder separators.

### File / WASM

Reads file at path. If \`.kleversc.json\`: extracts the \`"code"\` field. Otherwise: hex-encodes raw bytes.

### Hex (raw pass-through)

Value used as-is with no transformation. Must provide valid hex.

## Composite Type Encoding

### List<T>

- **No single-arg syntax.** Pass each element as a separate \`--args\`.
- **Hex layout (decoded):** Elements back-to-back. Dynamic-length types get a 4-byte length prefix per element. Fixed-length types consumed by their native width. Decoding continues until hex stream is exhausted.
- **Nested lists:** \`List<List<T>>\` is valid — inner list gets a 4-byte length prefix.

\`\`\`bash
# Endpoint expecting List<u32>:
--args "u32:10" --args "u32:20" --args "u32:30"
\`\`\`

### Option<T>

- Encoded via the \`option\` prefix: \`option<type>:<value>\`
- Hex: \`01\` + nested-encoded value (Some), or empty (None via \`empty:\`)
- **The option prefix switches the inner value to nested encoding** (fixed-width ints, length-prefixed dynamic types)

| Argument | Hex | Breakdown |
|----------|-----|-----------|
| \`optionu32:100\` | \`0100000064\` | 01 (Some) + 00000064 (u32 nested: 4 bytes) |
| \`optionu64:1\` | \`010000000000000001\` | 01 (Some) + 8-byte u64 |
| \`optionstring:abc\` | \`010000000361626363\` | 01 + 00000003 (length) + 616263 |
| \`optionbool:true\` | \`0101\` | 01 (Some) + 01 (true) |
| \`optionbool:false\` | \`0100\` | 01 (Some) + 00 (false, nested) |
| \`empty:\` | *(empty)* | None |

### Tuple<T1, T2, ..., Tn>

- **No single-arg syntax.** Pass each positional element as a separate \`--args\` in order.
- **Hex layout:** Elements sequential. Dynamic-length types get a 4-byte length prefix. Nested angle brackets are parsed correctly.

\`\`\`bash
# Endpoint expecting tuple<u32, String, Address>:
--args "u32:42" --args "string:hello" --args "address:klv1..."
\`\`\`

### Variadic<T>

- Typically the **last** parameter of an endpoint.
- **No single-arg syntax.** Each element is a separate \`--args\`, and the contract's variadic parameter consumes all remaining \`@\`-delimited segments.

\`\`\`bash
# Endpoint expecting (u32, variadic<BigUint>):
--args "u32:1" --args "BigUint:100" --args "BigUint:200" --args "BigUint:300"
\`\`\`

### Custom Structs (decode-only)

Custom struct types from the contract ABI \`types\` map are resolved by name. Fields are decoded sequentially (fixed-width for fixed types, 4-byte length prefix for dynamic types). This is **decode-only** — used when parsing output with \`sc parse-output --abi\`.`,
    {
      title: 'Koperator Argument Encoding Rules & Composite Types',
      description:
        'Per-type encoding details, top-level vs nested differences, two\'s complement, length prefixes, and composite type handling (List, Option, Tuple, Variadic)',
      tags: [
        'koperator',
        'encoding',
        'hex',
        'arguments',
        'nested',
        'composite',
        'list',
        'option',
        'tuple',
        'variadic',
        'reference',
        'smart-contract',
      ],
      language: 'bash',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // ──────────────────────────────────────────────────────────────────────────
  // ENTRY 5 — API vs Koperator (KEPT from original)
  // ──────────────────────────────────────────────────────────────────────────
  createKnowledgeEntry(
    'best_practice',
    `# Important: API vs Koperator for Smart Contract Interaction

## When to Use the API vs Koperator

### Use the API for Querying (Read-Only Operations)
When you need to read data from smart contract view endpoints, use the Klever API directly.
View endpoints are read-only and don't require transactions.

**API Endpoint:**
\`\`\`
POST https://api.{network}.klever.org/v1.0/sc/query
\`\`\`

**Important:** Arguments must be base64-encoded!

**Argument Encoding Rules:**
- **Klever Address**: Decode bech32 to 32-byte hex, then base64
- **Numbers**: Convert to 8-byte big-endian hex, then base64
- **Strings**: Direct base64 encoding
- **Hex (0x...)**: Remove 0x prefix, decode hex to bytes, then base64

**Example - Query a view endpoint:**
\`\`\`bash
# Query getTotalSupply (no arguments)
curl -s 'https://api.testnet.klever.org/v1.0/sc/query' \\
    -H 'Content-Type: application/json' \\
    --data-raw '{
        "ScAddress": "klv1contract_address_here",
        "FuncName": "getTotalSupply",
        "Arguments": []
    }'

# Query getBalance with address argument
# Example: klv1qqq...qqpgm89z (zero address) = 32 zero bytes = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="
curl -s 'https://api.testnet.klever.org/v1.0/sc/query' \\
    -H 'Content-Type: application/json' \\
    --data-raw '{
        "ScAddress": "klv1contract_address_here",
        "FuncName": "getBalance",
        "Arguments": ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="]
    }'

# Query with multiple arguments (address + number)
# Address: 32 bytes base64
# Number 42: 0x000000000000002a (8 bytes big-endian) = "AAAAAAAAACo="
curl -s 'https://api.testnet.klever.org/v1.0/sc/query' \\
    -H 'Content-Type: application/json' \\
    --data-raw '{
        "ScAddress": "klv1contract_address_here",
        "FuncName": "getUserInfo",
        "Arguments": ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=", "AAAAAAAAACo="]
    }'

# Helper examples:
# Encode number 42: printf "%016x" 42 | xxd -r -p | base64
# Result: "AAAAAAAAACo="
# Encode string "hello": echo -n "hello" | base64
# Result: "aGVsbG8="
# Encode hex 0xdeadbeef: echo -n "deadbeef" | xxd -r -p | base64
# Result: "3q2+7w=="
\`\`\`

### Use Koperator for Transactional Operations (Write Operations)
When you need to modify contract state, use koperator. It will:
- Create a proper transaction
- Sign it with your private key
- Broadcast it to the blockchain
- Wait for confirmation (with --await flag)

**Example - Invoke a state-changing endpoint:**
\`\`\`bash
# This creates, signs, and broadcasts a transaction
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke klv1contract_address transfer \\
    --args "address:klv1recipient" --args "bi:1000000" \\
    --sign --await --result-only
\`\`\`

## Key Differences

| Aspect | API (for Views) | Koperator (for Transactions) |
|--------|----------------|------------------------------|
| Purpose | Read contract data | Modify contract state |
| Requires Private Key | No | Yes |
| Creates Transaction | No | Yes |
| Gas Fees | No | Yes |
| Speed | Instant | Requires blockchain confirmation |
| Use Case | View balances, get info | Transfer, stake, update state |

## Common Mistake to Avoid
❌ **DON'T** use koperator sc query for view endpoints in production
✅ **DO** use the API for view endpoints - it's faster and doesn't require a wallet

The koperator query command exists but the API is the recommended approach for production systems.`,
    {
      title: 'API vs Koperator - When to Use Each',
      description:
        'Clear guidance on using the API for contract queries vs koperator for transactions',
      tags: ['api', 'koperator', 'view', 'query', 'invoke', 'best-practice', 'contract', 'smart-contract'],
      language: 'bash',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // ──────────────────────────────────────────────────────────────────────────
  // ENTRY 6 — Account Utilities (KEPT from original)
  // ──────────────────────────────────────────────────────────────────────────
  createKnowledgeEntry(
    'deployment_tool',
    `# Koperator Account Operations - Developer Utilities

# 1. Check account address from wallet key
~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    account address

# Example output:
# Wallet address:  klv1graf3wqa8eefzmp3g95wrnmayzacsje2a6c6y7z6zmu9m8z8gz5qlrctat

# 2. Check KLV balance
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    account balance

# Example output:
# Balance: 42.123456 KLV (42123456 units)

# 3. Get detailed account info (balance, nonce, permissions)
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    account info

# 4. Get account nonce (useful for debugging transaction issues)
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    account nonce

# Example output:
# Nonce: 42

# Parse JSON output (for scripts)
# koperator account info | jq '.Balance'
# Or: koperator account info | grep -A 100 "^{" | jq .`,
    {
      title: 'Koperator Account Utilities',
      description:
        'Developer utilities for fetching account information - address, balance, nonce, and other details',
      tags: [
        'koperator',
        'account',
        'balance',
        'address',
        'nonce',
        'info',
        'developer-tools',
        'utilities',
      ],
      language: 'bash',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // ──────────────────────────────────────────────────────────────────────────
  // ENTRY 7 — SC Operations Examples (REWRITTEN)
  // ──────────────────────────────────────────────────────────────────────────
  createKnowledgeEntry(
    'code_example',
    `# Koperator Smart Contract Operations Examples

# 1. Deploy a new contract (no init args)
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc create \\
    --wasm="output/contract.wasm" \\
    --readable --payable --payableBySC \\
    --sign --await --result-only
# Note: --upgradeable defaults to true, so omitted here

# 2. Deploy with init arguments (constructor parameters)
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc create \\
    --wasm="output/contract.wasm" \\
    --args "BigUint:1000000" \\
    --args "address:klv1owner_address_here" \\
    --args "string:MyToken" \\
    --readable --payable --payableBySC \\
    --sign --await --result-only

# 3. Invoke with BigUint argument
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke klv1contract_address_here add \\
    --args "bi:100" \\
    --sign --await --result-only

# 4. Invoke with multiple arguments (separate --args per arg)
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke klv1contract_address_here setUserInfo \\
    --args "address:klv1user_address_here" \\
    --args "u32:42" \\
    --args "string:Active User" \\
    --sign --await --result-only

# 5. Send KLV payment with function call
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke klv1contract_address_here deposit \\
    --values "KLV=10000000" \\
    --sign --await --result-only

# 6. Send multiple token payments
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke klv1contract_address_here multiDeposit \\
    --values "KLV=5000000,KFI=3000000" \\
    --sign --await --result-only

# 7. Invoke with optional arguments
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke klv1contract_address_here setConfig \\
    --args "optionu64:100" \\
    --args "optionstring:newName" \\
    --sign --await --result-only

# 8. Invoke with None for optional argument
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke klv1contract_address_here setConfig \\
    --args "empty:" \\
    --args "optionstring:newName" \\
    --sign --await --result-only

# 9. Invoke with variadic arguments (list of values)
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke klv1contract_address_here addWhitelist \\
    --args "address:klv1addr1..." \\
    --args "address:klv1addr2..." \\
    --args "address:klv1addr3..." \\
    --sign --await --result-only

# 10. Invoke with raw hex data
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke klv1contract_address_here rawCall \\
    --args "hex:deadbeef" \\
    --sign --await --result-only

# 11. Upgrade existing contract
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc upgrade klv1contract_address_here \\
    --wasm="output/contract-v2.wasm" \\
    --upgradeable \\
    --sign --await --result-only

# 12. Create-only (offline TX generation, no broadcast)
~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke klv1contract_address_here withdraw \\
    --create-only
# Outputs unsigned TX JSON to stdout for later signing`,
    {
      title: 'Koperator Smart Contract Operations Examples',
      description:
        'Practical examples: deploy, deploy with init args, invoke, optional args, variadic, payments, upgrade, create-only',
      tags: [
        'koperator',
        'examples',
        'deploy',
        'invoke',
        'upgrade',
        'optional',
        'variadic',
        'create-only',
        'smart-contract',
      ],
      language: 'bash',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // ──────────────────────────────────────────────────────────────────────────
  // ENTRY 8 — Payment/Metadata Flags for Contract Creation (REWRITTEN)
  // ──────────────────────────────────────────────────────────────────────────
  createKnowledgeEntry(
    'documentation',
    `# Koperator Contract Metadata Flags (sc create / sc upgrade)

## Metadata Flags

These flags set the contract's code metadata during deployment or upgrade:

### --upgradeable (default: TRUE)
- **Purpose**: Makes the contract upgradeable by the owner
- **Default**: true — contracts are upgradeable unless you explicitly omit this flag
- To deploy an **immutable** contract, omit \`--upgradeable\` or set false

### --payable (default: false)
- **Purpose**: Allows the contract to receive KLV/KDA payments
- **Usage**: Required if your contract has \`#[payable("KLV")]\` endpoints

### --payableBySC (default: false)
- **Purpose**: Allows other smart contracts to send payments to this contract
- **Usage**: Required for contract-to-contract payment interactions

### --readable (default: false)
- **Purpose**: Makes contract storage readable by external queries
- **Usage**: Recommended for transparency

## Flag Combinations for Different Contract Types

### DeFi/Exchange Contract
\`\`\`bash
# --upgradeable is true by default
--readable --payable --payableBySC
\`\`\`

### NFT Marketplace Contract
\`\`\`bash
--readable --payable --payableBySC
\`\`\`

### Oracle/Data Provider Contract (no payments)
\`\`\`bash
--readable
\`\`\`

### Immutable Production Contract
\`\`\`bash
# Explicitly omit --upgradeable to make immutable
--readable --payable --payableBySC
# Since --upgradeable defaults to true, consider using:
# sc create ... (without --upgradeable won't help; the flag is true by default)
# To make truly immutable, deploy without --upgradeable and it's still upgradeable!
# Immutability requires NOT setting the upgradeable flag in code metadata.
\`\`\`

## Common Mistakes

### ❌ Forgetting --payable
If your contract has payable endpoints but you deploy without --payable:
- Payable endpoints will reject all payments
- Users won't be able to send KLV to the contract

### ❌ Forgetting --payableBySC
If other contracts need to pay yours but you deploy without --payableBySC:
- Contract-to-contract payments will fail

### ✅ Best Practice
Always include both --payable and --payableBySC if your contract handles any payments.`,
    {
      title: 'Koperator Contract Metadata Flags',
      description:
        'Contract metadata flags: --upgradeable (defaults true!), --payable, --payableBySC, --readable',
      tags: [
        'koperator',
        'deployment',
        'payable',
        'payableBySC',
        'upgradeable',
        'readable',
        'flags',
        'metadata',
        'smart-contract',
      ],
      language: 'bash',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // ──────────────────────────────────────────────────────────────────────────
  // ENTRY 9 — Automation Scripts (REWRITTEN — added nonce-check, create-only, verbose)
  // ──────────────────────────────────────────────────────────────────────────
  createKnowledgeEntry(
    'best_practice',
    `# Using Koperator in Unattended/Automated Scripts

## 🚨 CRITICAL: Three Required Flags for Automation

When using koperator in unattended scripts (CI/CD, cron jobs, automated deployments), you MUST use these three flags together:

### Required Flags:
1. \`--sign\` (-s) — Signs and broadcasts the transaction without user interaction
2. \`--await\` — Waits for the transaction to be included in a block before returning
3. \`--result-only\` — Outputs only the transaction result in clean JSON format (requires --await)

## Why These Flags Are Essential:

### Without --sign:
- Script hangs waiting for user to confirm: "Do you want to sign? (y/n)"

### Without --await:
- Script continues immediately, transaction might fail without notice

### Without --result-only:
- Output includes progress messages and logs mixed with JSON — unparseable

## Additional Automation Flags:

### --nonce-check (Nonce Strategy)
Controls which nonce the operator uses for the transaction:
- \`current\` (default): Uses the last confirmed nonce — safe for single-TX operations
- \`first-pending\`: Uses the first pending nonce — useful for replacing a stuck TX
- \`pending\`: Uses the next pending nonce — use for rapid sequential TXs

\`\`\`bash
# Send multiple TXs in rapid succession:
~/klever-sdk/koperator sc invoke CONTRACT func1 \\
    --nonce-check pending --sign --await --result-only

~/klever-sdk/koperator sc invoke CONTRACT func2 \\
    --nonce-check pending --sign --await --result-only
\`\`\`

### --create-only (-c) — Offline TX Generation
Builds the TX JSON without broadcasting. Useful for:
- Offline signing workflows
- Multi-sig setups
- TX review before broadcast

\`\`\`bash
~/klever-sdk/koperator sc invoke CONTRACT withdraw \\
    --create-only > unsigned_tx.json
# Sign and broadcast later
\`\`\`

### --verbose — Debug Logging
Enables trace-level logging. Useful for debugging failed transactions:
\`\`\`bash
~/klever-sdk/koperator sc invoke CONTRACT func \\
    --args "u32:42" \\
    --verbose --sign --await --result-only
\`\`\`

### --kdaFee — Pay Gas with KDA Token
Pay transaction fees with a specific KDA token instead of KLV:
\`\`\`bash
~/klever-sdk/koperator sc invoke CONTRACT func \\
    --kdaFee "USDT-A1B2" \\
    --sign --await --result-only
\`\`\`

## Correct Usage in Scripts:

### ✅ CORRECT - Automated Deployment Script
\`\`\`bash
#!/bin/bash
set -e

RESULT=$(KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc create \\
    --wasm="output/contract.wasm" \\
    --readable --payable --payableBySC \\
    --sign --await --result-only)

CONTRACT_ADDRESS=$(echo "$RESULT" | jq -r '.contractAddress')
echo "Deployed to: $CONTRACT_ADDRESS"
\`\`\`

### ✅ CORRECT - CI/CD Pipeline
\`\`\`yaml
- name: Deploy Smart Contract
  run: |
    ~/klever-sdk/koperator \\
      --key-file="\${KEY_FILE}" \\
      sc create \\
      --wasm="output/contract.wasm" \\
      --readable --payable \\
      --sign --await --result-only > deployment.json

    CONTRACT_ADDR=$(jq -r '.contractAddress' deployment.json)
    echo "CONTRACT_ADDRESS=\${CONTRACT_ADDR}" >> $GITHUB_ENV
\`\`\`

### ✅ CORRECT - Automated Testing Script
\`\`\`bash
#!/bin/bash
set -e

invoke_and_verify() {
    local function_name=$1
    local expected_status=$2

    RESULT=$(~/klever-sdk/koperator \\
        --key-file="$HOME/klever-sdk/walletKey.pem" \\
        sc invoke "$CONTRACT_ADDRESS" "$function_name" \\
        --sign --await --result-only)

    STATUS=$(echo "$RESULT" | jq -r '.status')

    if [ "$STATUS" != "$expected_status" ]; then
        echo "Error: Expected $expected_status, got $STATUS"
        echo "Full result: $RESULT"
        exit 1
    fi
}

invoke_and_verify "initialize" "success"
invoke_and_verify "deposit" "success"
\`\`\`

### ❌ WRONG - Will Hang in Scripts
\`\`\`bash
# WRONG - Missing --sign, will wait for user input
~/klever-sdk/koperator sc invoke CONTRACT transfer \\
    --args "address:klv1..." --await --result-only

# WRONG - Missing --await, won't know if transaction succeeded
~/klever-sdk/koperator sc invoke CONTRACT transfer \\
    --args "address:klv1..." --sign --result-only

# WRONG - Missing --result-only, output not parseable
~/klever-sdk/koperator sc invoke CONTRACT transfer \\
    --args "address:klv1..." --sign --await
\`\`\`

## Parsing the JSON Result:

\`\`\`bash
# Get transaction hash
TX_HASH=$(echo "$RESULT" | jq -r '.txHash')

# Check if successful
if [ "$(echo "$RESULT" | jq -r '.status')" = "success" ]; then
    echo "Transaction successful"
else
    echo "Transaction failed"
    exit 1
fi
\`\`\`

## Environment Variables for Scripts:

\`\`\`bash
#!/bin/bash
export KLEVER_NODE="https://node.testnet.klever.org"
export KEY_FILE="$HOME/klever-sdk/walletKey.pem"

~/klever-sdk/koperator \\
    --key-file="$KEY_FILE" \\
    sc invoke CONTRACT_ADDRESS function_name \\
    --sign --await --result-only
\`\`\``,
    {
      title: 'Using Koperator in Unattended/Automated Scripts',
      description:
        'CRITICAL: --sign --await --result-only for automation. Plus --nonce-check, --create-only, --verbose, --kdaFee',
      tags: [
        'koperator',
        'automation',
        'scripts',
        'ci-cd',
        'unattended',
        'sign',
        'await',
        'result-only',
        'nonce-check',
        'create-only',
        'critical',
      ],
      language: 'bash',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // ──────────────────────────────────────────────────────────────────────────
  // ENTRY 10 — Installation Guide (KEPT from original)
  // ──────────────────────────────────────────────────────────────────────────
  createKnowledgeEntry(
    'error_pattern',
    `# Koperator Not Found - Detection and Installation Guide

## Detecting Missing Koperator

### Common Error Symptoms
\`\`\`bash
# Error 1: Command not found
$ ~/klever-sdk/koperator --version
bash: /Users/username/klever-sdk/koperator: No such file or directory

# Error 2: Permission denied
$ ~/klever-sdk/koperator --version
bash: /Users/username/klever-sdk/koperator: Permission denied

# Error 3: Directory doesn't exist
$ ls ~/klever-sdk/
ls: /Users/username/klever-sdk/: No such file or directory
\`\`\`

### How to Check if Koperator is Installed
\`\`\`bash
# Method 1: Check if binary exists
if [ -x "$HOME/klever-sdk/koperator" ]; then
    echo "koperator is installed"
    ~/klever-sdk/koperator --version
else
    echo "koperator is NOT installed"
fi

# Method 2: Check SDK directory
ls -la ~/klever-sdk/koperator 2>/dev/null || echo "koperator not found"

# Method 3: Check version
~/klever-sdk/koperator --version 2>/dev/null || echo "koperator is not available"
\`\`\`

## Installation Methods

### Method 1: Install via Klever VSCode Extension (Recommended)
1. Open Visual Studio Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "Klever Blockchain"
4. Install the extension
5. The extension automatically installs koperator at \`~/klever-sdk/koperator\`

### Method 2: Manual Download
\`\`\`bash
# 1. Create SDK directory
mkdir -p ~/klever-sdk

# 2. Detect platform (must match Klever CDN paths)
OS_TYPE=$(uname -s)
ARCH=$(uname -m)
case "$OS_TYPE" in
    "Darwin")
        [ "$ARCH" = "arm64" ] && PLATFORM="darwin-arm64" || PLATFORM="darwin-amd64"
        ;;
    "Linux")
        case "$ARCH" in
            x86_64) PLATFORM="linux-amd64" ;;
            arm64|aarch64) PLATFORM="linux-arm64" ;;
            *) PLATFORM="linux-amd64" ;;
        esac
        ;;
    MINGW*|CYGWIN*|MSYS*) PLATFORM="windows-amd64" ;;
esac

# 3. Fetch latest version from Klever's CDN
VERSIONS_URL="https://storage.googleapis.com/kleverchain-public/versions.json"
VERSION=$(curl -s "$VERSIONS_URL" | jq -r ".\\"\${PLATFORM}\\".koperator.version // .koperator")

# 4. Download koperator and VM dependencies
BASE_URL="https://storage.googleapis.com/kleverchain-public/koperator/\${PLATFORM}/v\${VERSION}"
curl -L -o ~/klever-sdk/koperator "\${BASE_URL}/koperator"

# 5. Download VM dependencies listed in versions.json
# macOS arm64: libvmexeccapi_arm.dylib
# macOS amd64: libvmexeccapi.dylib
# Linux: libvmexeccapi.so
DEPS=$(curl -s "$VERSIONS_URL" | jq -r ".\\"\${PLATFORM}\\".koperator.dependencies[]? // empty")
for DEP in $DEPS; do
    curl -L -o ~/klever-sdk/"$DEP" "\${BASE_URL}/$DEP"
done

# 6. Make executable
chmod +x ~/klever-sdk/koperator

# 7. Verify
~/klever-sdk/koperator --version
\`\`\`

**Note:** Requires \`jq\` for JSON parsing. If not available, check https://storage.googleapis.com/kleverchain-public/versions.json manually for the latest version.

## Post-Installation Verification
\`\`\`bash
# Verify koperator works
~/klever-sdk/koperator --version

# Verify ksc is also installed
~/klever-sdk/ksc --version

# Check wallet key exists (generated on first use)
ls ~/klever-sdk/walletKey.pem 2>/dev/null || echo "No wallet key yet - will be generated on first use"
\`\`\`

## Fixing Permission Issues
\`\`\`bash
# If koperator exists but isn't executable
chmod +x ~/klever-sdk/koperator

# If there are macOS Gatekeeper issues
xattr -d com.apple.quarantine ~/klever-sdk/koperator 2>/dev/null
\`\`\`

## Fixing Missing VM Library
\`\`\`bash
# If you get "dylib not found" or "shared library" errors, download the VM dependency:

# Detect platform and get latest version
OS_TYPE=$(uname -s)
ARCH=$(uname -m)
case "$OS_TYPE" in
    "Darwin")
        [ "$ARCH" = "arm64" ] && PLATFORM="darwin-arm64" || PLATFORM="darwin-amd64"
        ;;
    "Linux")
        case "$ARCH" in
            x86_64) PLATFORM="linux-amd64" ;;
            arm64|aarch64) PLATFORM="linux-arm64" ;;
            *) PLATFORM="linux-amd64" ;;
        esac
        ;;
esac
VERSIONS_URL="https://storage.googleapis.com/kleverchain-public/versions.json"
VERSION=$(curl -s "$VERSIONS_URL" | jq -r ".\\"\${PLATFORM}\\".koperator.version // .koperator")
BASE_URL="https://storage.googleapis.com/kleverchain-public/koperator/\${PLATFORM}/v\${VERSION}"

# Download dependencies listed in versions.json for your platform
DEPS=$(curl -s "$VERSIONS_URL" | jq -r ".\\"\${PLATFORM}\\".koperator.dependencies[]? // empty")
for DEP in $DEPS; do
    curl -L -o ~/klever-sdk/"$DEP" "\${BASE_URL}/$DEP"
done
\`\`\``,
    {
      title: 'Koperator Not Found - Detection and Installation Guide',
      description: 'How to detect when koperator is missing and step-by-step installation methods',
      tags: [
        'koperator',
        'installation',
        'missing',
        'not-found',
        'error',
        'setup',
        'troubleshooting',
        'klever-sdk',
      ],
      language: 'bash',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // ──────────────────────────────────────────────────────────────────────────
  // ENTRY 11 — Common Mistakes (KEPT from original)
  // ──────────────────────────────────────────────────────────────────────────
  createKnowledgeEntry(
    'best_practice',
    `# Common Mistakes When Using Klever Tools

## ❌ WRONG Commands (from other blockchains)
\`\`\`bash
# These commands DO NOT work on Klever!
klever-sdk deploy --wasm contract.wasm --pem wallet.pem --proxy http://localhost:7950
koperator --deploy --ksc-file contract.ksc --user-private-key key.pem
sc-meta all build  # This is NOT Klever!
\`\`\`

## ✅ CORRECT Klever Commands
\`\`\`bash
# This is how Klever actually works
KLEVER_NODE=http://localhost:8080 \\
    ~/klever-sdk/koperator \\
    --key-file="walletKey.pem" \\
    sc create \\
    --wasm="contract.wasm" \\
    --readable --payable \\
    --sign --await --result-only
\`\`\`

## Key Points to Remember:
1. Binary is \`~/klever-sdk/koperator\` (not \`klever-sdk\` or \`koperator\` alone)
2. Use \`KLEVER_NODE\` environment variable (not --proxy)
3. Use \`--key-file\` parameter (not --pem)
4. Commands are \`sc create\`, \`sc invoke\`, \`sc upgrade\` (not deploy/call/execute)
5. Build with \`~/klever-sdk/ksc all build\` (not sc-meta)

## Common Incorrect Patterns:

### ❌ Wrong Command Names
\`\`\`bash
# WRONG - These don't exist
koperator --deploy
koperator --execute
koperator --call
koperator deploy
\`\`\`

### ✅ Correct Command Names
\`\`\`bash
# CORRECT
~/klever-sdk/koperator sc create     # Deploy new contract
~/klever-sdk/koperator sc invoke     # Call contract function
~/klever-sdk/koperator sc upgrade    # Upgrade contract
\`\`\`

### ❌ Wrong Parameter Names
\`\`\`bash
# WRONG
--pem wallet.pem
--proxy http://localhost:7950
--wasm-file contract.wasm
\`\`\`

### ✅ Correct Parameter Names
\`\`\`bash
# CORRECT
--key-file="walletKey.pem"
KLEVER_NODE=http://localhost:8080
--wasm="contract.wasm"
\`\`\`

### ❌ Wrong Build Command
\`\`\`bash
# WRONG - Not Klever commands
sc-meta all build
cargo build --release
mxpy contract build
\`\`\`

### ✅ Correct Build Command
\`\`\`bash
# CORRECT
~/klever-sdk/ksc all build
\`\`\`

### ❌ Wrong Argument Syntax
\`\`\`bash
# WRONG - Old/incorrect patterns
--args "Option:String:hello"    # Wrong Option syntax
--args "List:u32:1,u32:2"       # No single-arg List syntax
--args "tuple:u64:123,String:x" # No single-arg tuple syntax
--args "hex:0xdeadbeef"         # 0x prefix causes "invalid item to encode" error
\`\`\`

### ✅ Correct Argument Syntax
\`\`\`bash
# CORRECT
--args "optionstring:hello"     # option prefix (no colon separator)
--args "u32:1" --args "u32:2"   # List: separate --args per element
--args "u64:123" --args "string:x" # Tuple: separate --args per element
--args "hex:deadbeef"           # hex: NO 0x prefix, raw hex digits only
\`\`\`

### ❌ Wrong Payment Amount
\`\`\`bash
# WRONG - display amounts don't work in --values
--values "KLV=10"              # This sends 0.00001 KLV, not 10 KLV!
--klv=500000000                # --klv flag does not exist
\`\`\`

### ✅ Correct Payment Amount
\`\`\`bash
# CORRECT - --values uses raw smallest units: amount × 10^precision
# Token precision ranges from 0 to 8 decimals (check each token's precision!)
--values "KLV=10000000"        # 10 KLV (precision=6, 10 × 10^6)
--values "KLV=500000000"       # 500 KLV (precision=6, 500 × 10^6)
--values "MYTKN-a1b2=100000000" # 1 MYTKN (precision=8, 1 × 10^8)
--values "NFT-XY01/01=1"       # 1 NFT (precision=0, nonce 01)
\`\`\`

### ❌ Wrong Query Method
\`\`\`bash
# WRONG - koperator doesn't do queries
~/klever-sdk/koperator sc query
\`\`\`

### ✅ Correct Query Method
\`\`\`bash
# CORRECT - Use API for queries
curl -s 'https://api.testnet.klever.org/v1.0/sc/query' \\
    --data-raw '{"ScAddress":"...", "FuncName":"...", "Arguments":[...]}'
\`\`\``,
    {
      title: 'Common Mistakes When Using Klever Tools',
      description:
        'Frequent mistakes with Klever CLI tools: wrong commands, wrong arg syntax (Option/List/Tuple), and corrections',
      tags: ['mistakes', 'best-practice', 'koperator', 'cli', 'errors', 'debugging', 'smart-contract'],
      language: 'bash',
      relevanceScore: 0.9,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // ──────────────────────────────────────────────────────────────────────────
  // ENTRY 12 — KDA Token Creation (KEPT from original)
  // ──────────────────────────────────────────────────────────────────────────
  createKnowledgeEntry(
    'deployment_tool',
    `# Creating KDA Tokens with Koperator

## Overview
Koperator provides a \`kda create\` command to create new KDA (Klever Digital Assets) tokens on the Klever blockchain.
Creating a KDA costs 20,000 KLV.

## Basic Command Structure
\`\`\`bash
~/klever-sdk/koperator kda create [KDA_TYPE] [flags]
\`\`\`

## KDA Types
- \`0\` - Fungible Token (default)
- \`1\` - Non-Fungible Token (NFT)
- \`2\` - Semi-Fungible Token (SFT)

## Essential Parameters

### Basic Token Properties
\`\`\`bash
--name "My Token"           # Token full name
--ticker "MYTK"              # Token ticker (3-8 uppercase chars)
--precision 6                # Decimal places (0-8, usually 6 for fungible, 0 for NFTs)
--initialSupply 1000000      # Initial supply (float)
--maxSupply 10000000         # Maximum supply (float, optional)
--logo "https://..."         # Logo URL (optional)
--ownerAddress "klv1..."     # Owner address (optional, defaults to sender)
--adminAddress "klv1..."     # Admin address (optional)
\`\`\`

### Permission Flags
\`\`\`bash
--canMint                    # Allow minting new tokens
--canBurn                    # Allow burning tokens
--canFreeze                  # Allow freezing accounts
--canPause                   # Allow pausing transfers
--canWipe                    # Allow wiping frozen accounts
--canChangeOwner             # Allow ownership transfer
--canAddRoles                # Allow adding roles to addresses
\`\`\`

### Initial State Flags
\`\`\`bash
--isPaused                   # Create token in paused state
--isNFTMintStopped           # Create NFT with minting stopped
--isRoyaltiesChangeStopped   # Lock royalties configuration
--limitTransfer              # Limit token transfers
\`\`\`

## Examples

### 1. Create a Basic Fungible Token
\`\`\`bash
KLEVER_NODE=https://node.testnet.klever.org \\
~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    kda create 0 \\
    --name "My Token" \\
    --ticker "MYTK" \\
    --precision 6 \\
    --initialSupply 1000000 \\
    --maxSupply 10000000 \\
    --canMint \\
    --canBurn \\
    --sign --await --result-only
\`\`\`

### 2. Create an NFT Collection
\`\`\`bash
KLEVER_NODE=https://node.testnet.klever.org \\
~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    kda create 1 \\
    --name "My NFT Collection" \\
    --ticker "MYNFT" \\
    --precision 0 \\
    --logo "https://example.com/logo.png" \\
    --canMint \\
    --canBurn \\
    --canPause \\
    --royaltiesAddress "klv1creator..." \\
    --royaltiesMarketPercentage 5 \\
    --sign --await --result-only
\`\`\`

### 3. Create a DeFi Token with Roles
\`\`\`bash
KLEVER_NODE=https://node.testnet.klever.org \\
~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    kda create 0 \\
    --name "DeFi Token" \\
    --ticker "DEFI" \\
    --precision 8 \\
    --initialSupply 1000000 \\
    --maxSupply 100000000 \\
    --canMint \\
    --canBurn \\
    --canAddRoles \\
    --addRolesMint "klv1minter..." \\
    --addRolesTransfer "klv1treasury..." \\
    --sign --await --result-only
\`\`\`

### 4. Create a Staking Pool Token
\`\`\`bash
KLEVER_NODE=https://node.testnet.klever.org \\
~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    kda create 0 \\
    --name "Staking Pool Token" \\
    --ticker "SPOOL" \\
    --precision 6 \\
    --initialSupply 0 \\
    --canMint \\
    --canBurn \\
    --apr 12.5 \\
    --interestType 0 \\
    --minEpochsToClaim 1 \\
    --minEpochsToUnstake 14 \\
    --minEpochsToWithdraw 21 \\
    --sign --await --result-only
\`\`\`

### 5. Create Token with URIs and Metadata
\`\`\`bash
KLEVER_NODE=https://node.testnet.klever.org \\
~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    kda create 0 \\
    --name "Social Token" \\
    --ticker "SOCIAL" \\
    --precision 6 \\
    --initialSupply 1000000 \\
    --logo "https://example.com/logo.png" \\
    --uris "website=https://example.com" \\
    --uris "twitter=https://twitter.com/mytoken" \\
    --uris "whitepaper=https://example.com/wp.pdf" \\
    --sign --await --result-only
\`\`\`

## Royalties Configuration (for NFTs/SFTs)

### Fixed Royalties
\`\`\`bash
--royaltiesAddress "klv1creator..."  # Required: address to receive royalties
--royaltiesTransferFixed 100         # Fixed amount per transfer
--royaltiesMarketFixed 50            # Fixed amount per market sale
--royaltiesITOFixed 25               # Fixed amount per ITO sale
\`\`\`

### Percentage Royalties
\`\`\`bash
--royaltiesMarketPercentage 5       # 5% on market sales
--royaltiesITOPercentage 10         # 10% on ITO sales
\`\`\`

### Transfer Percentage Royalties (tiered structure)
\`\`\`bash
# --royaltiesTransferPercentage accepts JSON with amount threshold and percentage
--royaltiesTransferPercentage='{"amount": 1000, "percentage": 5}' \\
--royaltiesTransferPercentage='{"amount": 10000, "percentage": 3}'
\`\`\`

### Split Royalties (Multiple Recipients)
\`\`\`bash
# Split royalties across multiple addresses with per-type percentages
--splitRoyalties='{"address":"klv1artist...", "percentTransferPercentage": 70, "percentTransferFixed": 70, "percentMarketPercentage": 70, "percentMarketFixed": 70, "percentITOPercentage": 70, "percentITOFixed": 70}' \\
--splitRoyalties='{"address":"klv1team...", "percentTransferPercentage": 30, "percentTransferFixed": 30, "percentMarketPercentage": 30, "percentMarketFixed": 30, "percentITOPercentage": 30, "percentITOFixed": 30}'
\`\`\`

## Role Management

### Adding Roles During Creation
\`\`\`bash
--addRolesMint "klv1minter1...,klv1minter2..."       # Can mint tokens
--addRolesTransfer "klv1transfer..."                 # Can transfer tokens
--addRolesDeposit "klv1depositor..."                 # Can deposit to KDA pools
--addRolesSetITOPrices "klv1pricesetter..."         # Can set ITO prices
\`\`\`

## Staking Parameters
\`\`\`bash
--apr 12.5                   # Annual percentage rate
--interestType 0             # 0 = APR (annual percentage rate), 1 = FPR (fixed percentage return)
--minEpochsToClaim 1         # Min epochs before claiming rewards
--minEpochsToUnstake 14      # Min epochs before unstaking
--minEpochsToWithdraw 21     # Min epochs before withdrawal after unstake
\`\`\`

## Important Notes

1. **Creation Cost**: Creating a KDA token costs 20,000 KLV
2. **Ticker Format**: 3-8 uppercase characters; blockchain appends a 4-char suffix (e.g., MYTK-A1B2)
3. **Precision**: 0-8 decimal places. Usually 6 for fungible tokens, 0 for NFTs
4. **Initial Supply**: Float value (e.g., 1000000). Use 0 for NFT collections
5. **Permissions**: Set at creation time. Use \`kda trigger\` to modify properties later
6. **Result**: Returns the created asset ID in format TICKER-XXXX

## Parsing Creation Result
\`\`\`bash
# Create token and extract ID
RESULT=$(~/klever-sdk/koperator kda create 0 ... --sign --await --result-only)
TOKEN_ID=$(echo "$RESULT" | jq -r '.assetID')
echo "Created token: $TOKEN_ID"  # e.g., MYTK-A1B2
\`\`\`

## Common Mistakes to Avoid
- ❌ Forgetting \`--sign --await --result-only\` for scripts
- ❌ Using wrong precision (NFTs should have 0)
- ❌ Not setting maxSupply for limited supply tokens
- ❌ Forgetting to enable necessary permissions (cannot be added after creation without \`--canAddRoles\`)
- ❌ Using lowercase in ticker symbols
- ❌ Not having enough KLV balance (need 20,000 KLV + gas fees)`,
    {
      title: 'Creating KDA Tokens with Koperator',
      description:
        'Complete guide to creating KDA tokens (fungible, NFT, SFT) using koperator kda create command',
      tags: ['koperator', 'kda', 'token', 'create', 'nft', 'sft', 'fungible', 'deployment'],
      language: 'bash',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // ──────────────────────────────────────────────────────────────────────────
  // ENTRY 13 — sc upgrade: Contract Upgrade Command (NEW)
  // ──────────────────────────────────────────────────────────────────────────
  createKnowledgeEntry(
    'deployment_tool',
    `# Koperator sc upgrade — Contract Upgrade Command

## Overview

\`sc upgrade\` replaces the bytecode and metadata of an **already-deployed** smart contract with a new WASM binary. The contract address remains unchanged. The caller must be the **contract owner** (the account that originally deployed it), and the contract must have been deployed with \`--upgradeable\` (which defaults to true).

- **Transaction type**: SmartContract_SCInvoke (NOT SCDeploy)
- **Target**: The existing contract address (first positional argument)
- **Alias**: \`sc usc\`

## Full Syntax

\`\`\`bash
~/klever-sdk/koperator \\
    --key-file=<pem> \\
    sc upgrade <CONTRACT_BECH32_ADDRESS> \\
    --wasm=<path/to/contract.wasm> \\
    [--args <type:value>]... \\
    [--values 'KLV=amount,...'] \\
    [--payable] [--upgradeable] [--payableBySC] [--readable] \\
    --sign --await --result-only
\`\`\`

## Positional Arguments

| Position | Required | Description |
|----------|----------|-------------|
| 0 | **Yes** | bech32 \`klv1…\` address of the contract to upgrade |
| 1 | No | Optional raw hex appended verbatim to payload (rarely used) |

## Command-Specific Flag

| Flag | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| \`--wasm\` | string | \`""\` | **Yes** | Path to the new \`.wasm\` binary file |

## ⚠️ CRITICAL: Metadata Is REPLACED, Not Merged

The metadata flags (\`--payable\`, \`--upgradeable\`, \`--payableBySC\`, \`--readable\`) **replace the contract's existing metadata entirely**. They are NOT inherited from the original deployment.

If you previously deployed with \`--payable\` but omit it on upgrade, **the contract will no longer be payable**.

→ Always re-specify ALL desired metadata flags on every upgrade.

## Differences from sc create and sc invoke

| Aspect | sc create | sc upgrade | sc invoke |
|--------|-----------|------------|-----------|
| TX type | SCDeploy | SCInvoke | SCInvoke |
| Target | Zero address (auto) | Existing contract | Existing contract |
| Requires --wasm | Yes | Yes | No |
| Data prefix | \`<bytecode>@<vmType>@<metadata>\` | \`upgradeContract@<bytecode>@<metadata>\` | \`<functionName>\` |
| Metadata flags | Yes | Yes (replaces!) | No (ignored) |
| vmType | Included | NOT included | N/A |

## Examples

### Basic upgrade (keep upgradeable)
\`\`\`bash
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc upgrade klv1qqqqcontract_address_here \\
    --wasm=./output/contract_v2.wasm \\
    --upgradeable \\
    --sign --await --result-only
\`\`\`

### Upgrade with full metadata re-specification
\`\`\`bash
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc upgrade klv1qqqqcontract_address_here \\
    --wasm=./output/contract_v2.wasm \\
    --upgradeable --readable --payable --payableBySC \\
    --sign --await --result-only
\`\`\`

### Upgrade with constructor arguments
If the upgrade constructor requires initialization parameters:
\`\`\`bash
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc upgrade klv1qqqqcontract_address_here \\
    --wasm=./output/contract_v2.wasm \\
    --args "u64:42" \\
    --args "address:klv1abc..." \\
    --args "string:hello" \\
    --upgradeable --payable \\
    --sign --await --result-only
\`\`\`

### Upgrade with token transfer
\`\`\`bash
~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc upgrade klv1qqqqcontract_address_here \\
    --wasm=./output/contract_v2.wasm \\
    --values 'KLV=1000000' \\
    --upgradeable \\
    --sign --await --result-only
\`\`\`

### Scripted upgrade (capture result)
\`\`\`bash
RESULT=$(KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc upgrade klv1qqqqcontract_address_here \\
    --wasm=./output/contract_v2.wasm \\
    --upgradeable --readable --payable --payableBySC \\
    --sign --await --result-only)
TX_HASH=$(echo "$RESULT" | jq -r '.hash')
echo "Upgrade TX: $TX_HASH"
\`\`\`

## ⚠️ Storage Persistence on Upgrade

Contract storage is **preserved** across upgrades — all existing data remains in place. This means:

- ✅ Existing storage values, mappings, and sets survive the upgrade unchanged
- ⚠️ You MUST keep the same storage key names and data layout for existing fields
- ⚠️ Changing a storage mapper type (e.g. SingleValueMapper → MapMapper) or its value type (e.g. u64 → BigUint) **corrupts existing data** — the bytes in storage will be deserialized with the wrong codec
- ✅ Adding NEW storage fields is safe — they start empty
- ❌ Removing or renaming a storage field does NOT delete its data — the bytes remain in storage unused
- ⚠️ Reordering struct fields that are stored as a single blob will break deserialization

**Best practice**: Only add new storage fields. Never change the type or layout of existing ones. If a data migration is needed, add a new field with the new type and write a one-time migration endpoint that reads old data and writes it to the new field.

## Error Reference

| Error | Cause | Fix |
|-------|-------|-----|
| \`invalid receiver <addr>\` | Malformed bech32 address | Provide valid klv1… contract address |
| \`invalid file path provided\` | --wasm is empty or missing | Supply the path to the new .wasm file |
| \`failed to read file\` | WASM file not found or unreadable | Verify path exists; did you run build? |
| Permission denied | Caller is not the contract owner | Use the owner wallet's key file |
| Contract not upgradeable | Contract was deployed without --upgradeable | Cannot upgrade; must redeploy |

## Common Mistakes
- ❌ Omitting metadata flags assuming they carry over from deploy — they DON'T
- ❌ Using a non-owner wallet — only the original deployer can upgrade
- ❌ Forgetting --wasm flag — it's required for upgrade
- ❌ Trying to upgrade a contract deployed without --upgradeable`,
    {
      title: 'Koperator sc upgrade — Contract Upgrade Command',
      description:
        'Complete reference for sc upgrade: syntax, metadata replacement, differences from sc create/invoke, examples, error reference',
      tags: [
        'koperator',
        'upgrade',
        'sc-upgrade',
        'deployment',
        'metadata',
        'wasm',
        'smart-contract',
        'reference',
      ],
      language: 'bash',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),
];

export default koperatorKnowledge;
