import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * Knowledge entries for mapping ABI JSON to koperator commands and decoding output.
 * Enables AI agents to autonomously construct koperator invocations and decode results.
 * Sources of truth: operator-sc-invoke-create.md, operator-abi-decoding.md
 */

export const koperatorAbiKnowledge: KnowledgeEntry[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // ENTRY 1 — ABI JSON → koperator command mapping
  // ──────────────────────────────────────────────────────────────────────────
  createKnowledgeEntry(
    'documentation',
    `# ABI JSON → Koperator Command Mapping

## Overview

The contract ABI (output by \`~/klever-sdk/ksc all build\` as \`output/contract.abi.json\`) defines all endpoints, their parameters, and types. This guide shows how to translate ABI definitions into koperator \`--args\` flags.

## ABI Structure

\`\`\`json
{
  "name": "my_contract",
  "endpoints": [
    {
      "name": "init",
      "inputs": [
        { "name": "initial_supply", "type": "BigUint" },
        { "name": "owner", "type": "Address" }
      ],
      "outputs": []
    },
    {
      "name": "transfer",
      "mutability": "mutable",
      "inputs": [
        { "name": "to", "type": "Address" },
        { "name": "amount", "type": "BigUint" }
      ],
      "outputs": []
    },
    {
      "name": "getBalance",
      "mutability": "readonly",
      "inputs": [
        { "name": "addr", "type": "Address" }
      ],
      "outputs": [
        { "name": "", "type": "BigUint" }
      ]
    }
  ],
  "types": {}
}
\`\`\`

## ABI Type → Koperator Prefix Mapping

| ABI type string | Koperator prefix | Notes |
|----------------|-----------------|-------|
| \`u8\` | \`u8:\` | |
| \`u16\` | \`u16:\` | |
| \`u32\` | \`u32:\` | |
| \`u64\` | \`u64:\` | |
| \`usize\` | \`u32:\` | Same encoding as u32 |
| \`i8\` | \`i8:\` | |
| \`i16\` | \`i16:\` | |
| \`i32\` | \`i32:\` | |
| \`i64\` | \`i64:\` | |
| \`isize\` | \`i32:\` | Same encoding as i32 |
| \`BigUint\` | \`bi:\` or \`BigUint:\` | Positive only |
| \`BigInt\` | \`bi:\` or \`BigInt:\` | Can be negative |
| \`BigFloat\` | \`bf:\` or \`BigFloat:\` | |
| \`Address\` | \`address:\` | klv1… bech32 |
| \`ManagedAddress\` | \`address:\` | Same as Address |
| \`ManagedBuffer\` | \`string:\` | UTF-8 or raw bytes |
| \`TokenIdentifier\` | \`string:\` | Token ID string |
| \`bytes\` | \`string:\` | UTF-8 bytes |
| \`BoxedBytes\` | \`string:\` | UTF-8 bytes |
| \`&[u8]\` | \`string:\` | UTF-8 bytes |
| \`String\` | \`string:\` | |
| \`&str\` | \`string:\` | |
| \`Vec<u8>\` | \`string:\` | Same as bytes |
| \`bool\` | \`bool:\` | true or false |
| \`Option<T>\` | \`option<prefix>:\` or \`empty:\` | See below |
| \`List<T>\` / \`ManagedVec<T>\` | *(multiple --args)* | See below |
| \`variadic<T>\` | *(multiple --args)* | See below |
| \`multi<T1,T2,...>\` | *(multiple --args)* | See below |

## Translating Endpoints to Commands

### Step-by-step Algorithm

1. **Read the endpoint name** → becomes the positional FUNCTION_NAME arg
2. **Check mutability**: \`readonly\` → use API query; \`mutable\` → use koperator sc invoke
3. **For each input in order**, map the ABI type to a koperator \`--args\` flag:
   - Simple type → single \`--args "<prefix>:<value>"\`
   - \`Option<T>\` → \`--args "option<prefix>:<value>"\` or \`--args "empty:"\` for None
   - \`List<T>\` / \`ManagedVec<T>\` → one \`--args\` per element (type prefix from T)
   - \`variadic<T>\` → one \`--args\` per element (always last parameter)
   - \`multi<T1,T2,...>\` → one \`--args\` per type in the multi
4. **Check for payable annotation** → if present, add \`--values\`

### Example: ABI to Command

Given this ABI endpoint:
\`\`\`json
{
  "name": "configure",
  "mutability": "mutable",
  "inputs": [
    { "name": "max_supply", "type": "BigUint" },
    { "name": "token_name", "type": "bytes" },
    { "name": "is_active", "type": "bool" },
    { "name": "admin", "type": "Option<Address>" }
  ]
}
\`\`\`

Produces:
\`\`\`bash
~/klever-sdk/koperator sc invoke klv1contract... configure \\
    --args "bi:1000000000000" \\
    --args "string:MyToken" \\
    --args "bool:true" \\
    --args "optionaddress:klv1admin..." \\
    --sign --await --result-only
\`\`\`

Or with None for the optional admin:
\`\`\`bash
~/klever-sdk/koperator sc invoke klv1contract... configure \\
    --args "bi:1000000000000" \\
    --args "string:MyToken" \\
    --args "bool:true" \\
    --args "empty:" \\
    --sign --await --result-only
\`\`\`

## Handling \`init\` Endpoints (Constructor)

The \`init\` endpoint is called during \`sc create\`. Pass its inputs as \`--args\`:

\`\`\`json
{
  "name": "init",
  "inputs": [
    { "name": "initial_supply", "type": "BigUint" },
    { "name": "owner", "type": "Address" },
    { "name": "token_name", "type": "bytes" }
  ]
}
\`\`\`

\`\`\`bash
~/klever-sdk/koperator sc create \\
    --wasm="output/contract.wasm" \\
    --args "bi:1000000" \\
    --args "address:klv1owner..." \\
    --args "string:MyToken" \\
    --readable --payable --payableBySC \\
    --sign --await --result-only
\`\`\`

## Handling List / Variadic Parameters

### List<T> or ManagedVec<T>

Each element becomes a separate \`--args\`. The contract decodes all remaining hex segments as list elements.

ABI:
\`\`\`json
{ "name": "whitelist", "type": "List<Address>" }
\`\`\`

Command:
\`\`\`bash
--args "address:klv1aaa..." --args "address:klv1bbb..." --args "address:klv1ccc..."
\`\`\`

### variadic<T>

Always the **last** parameter. Each value is a separate \`--args\`:

ABI:
\`\`\`json
{ "name": "amounts", "type": "variadic<BigUint>" }
\`\`\`

Command:
\`\`\`bash
--args "bi:100" --args "bi:200" --args "bi:300"
\`\`\`

### multi<T1, T2, ...>

Groups of types that repeat. Each type in the group is a separate \`--args\`:

ABI:
\`\`\`json
{ "name": "pairs", "type": "variadic<multi<Address, BigUint>>" }
\`\`\`

Command (2 pairs: addr1+100, addr2+200):
\`\`\`bash
--args "address:klv1aaa..." --args "bi:100" \\
--args "address:klv1bbb..." --args "bi:200"
\`\`\`

## Handling Readonly Endpoints (Queries)

If \`mutability\` is \`readonly\`, use the API instead of koperator:

\`\`\`json
{
  "name": "getBalance",
  "mutability": "readonly",
  "inputs": [{ "name": "addr", "type": "Address" }],
  "outputs": [{ "name": "", "type": "BigUint" }]
}
\`\`\`

\`\`\`bash
# Use API query (arguments must be base64-encoded)
curl -s 'https://api.testnet.klever.org/v1.0/sc/query' \\
    -H 'Content-Type: application/json' \\
    --data-raw '{
        "ScAddress": "klv1contract...",
        "FuncName": "getBalance",
        "Arguments": ["<base64-encoded-address>"]
    }'
\`\`\`

## Complete Example: Full Contract ABI → Commands

\`\`\`json
{
  "endpoints": [
    {
      "name": "init",
      "inputs": [{ "name": "cap", "type": "BigUint" }]
    },
    {
      "name": "mint",
      "mutability": "mutable",
      "payableInTokens": ["KLV"],
      "inputs": [{ "name": "amount", "type": "BigUint" }]
    },
    {
      "name": "setRoles",
      "mutability": "mutable",
      "inputs": [
        { "name": "address", "type": "Address" },
        { "name": "roles", "type": "variadic<u32>" }
      ]
    },
    {
      "name": "totalSupply",
      "mutability": "readonly",
      "inputs": [],
      "outputs": [{ "name": "", "type": "BigUint" }]
    }
  ]
}
\`\`\`

### Deploy (init)
\`\`\`bash
~/klever-sdk/koperator sc create \\
    --wasm="output/contract.wasm" \\
    --args "bi:1000000" \\
    --readable --payable --payableBySC \\
    --sign --await --result-only
\`\`\`

### mint (payable)
\`\`\`bash
~/klever-sdk/koperator sc invoke klv1contract... mint \\
    --args "bi:500" \\
    --values "KLV=1000000" \\
    --sign --await --result-only
\`\`\`

### setRoles (variadic tail)
\`\`\`bash
~/klever-sdk/koperator sc invoke klv1contract... setRoles \\
    --args "address:klv1user..." \\
    --args "u32:1" --args "u32:2" --args "u32:4" \\
    --sign --await --result-only
\`\`\`

### totalSupply (readonly → API query)
\`\`\`bash
curl -s 'https://api.testnet.klever.org/v1.0/sc/query' \\
    -d '{"ScAddress":"klv1contract...","FuncName":"totalSupply","Arguments":[]}'
\`\`\``,
    {
      title: 'ABI JSON to Koperator Command Mapping',
      description:
        'How to translate contract ABI endpoint definitions into koperator --args flags. Covers init, mutable, readonly, List, variadic, multi, Option.',
      tags: [
        'koperator',
        'abi',
        'mapping',
        'endpoints',
        'arguments',
        'translation',
        'automation',
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
  // ENTRY 2 — sc parse-output: ABI-based output decoding
  // ──────────────────────────────────────────────────────────────────────────
  createKnowledgeEntry(
    'documentation',
    `# Decoding Smart Contract Output: sc parse-output

## Command Overview

\`operator sc parse-output\` (alias: \`sc scpo\`) decodes raw smart contract output using an ABI file.

\`\`\`bash
~/klever-sdk/koperator sc parse-output <mode> <endpoint-name> \\
    --abi <path-to-abi.json> \\
    --raw-output <data-string> \\
    [--result-only --await]
\`\`\`

### Positional Arguments

| Position | Required | Description |
|----------|----------|-------------|
| 0 | Yes | Decode mode: \`hex\` or \`query\` |
| 1 | Yes | Endpoint name (case-sensitive, must match ABI exactly) |

### Command Flags

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| \`--abi\` | string | Yes | Path to the contract's ABI JSON file |
| \`--raw-output\` | string | Yes | Raw output data (hex string or base64) |

## Decode Modes

| Mode | Input format | When to use |
|------|-------------|-------------|
| \`hex\` | Raw hex string (e.g. \`0000000a\`) | TX results, storage reads, manual hex data |
| \`query\` | Base64 string (e.g. \`AAAACg==\`) | Output from \`/vm/query\` API (returns base64) |

\`query\` mode: base64 decode → hex encode → hex decode. Both modes converge on the same pipeline.

## ABI File Structure

The decoder uses only the \`endpoints\` and \`types\` sections:

\`\`\`json
{
  "name": "MyContract",
  "endpoints": [
    {
      "name": "getBalance",
      "mutability": "readonly",
      "inputs": [{ "name": "addr", "type": "Address" }],
      "outputs": [{ "type": "BigUint" }]
    }
  ],
  "types": {
    "TokenInfo": {
      "type": "struct",
      "fields": [
        { "name": "id", "type": "TokenIdentifier" },
        { "name": "amount", "type": "BigUint" },
        { "name": "frozen", "type": "bool" }
      ]
    }
  }
}
\`\`\`

For decoding, only the \`outputs\` array matters. Custom structs are resolved from the \`types\` map.

## Type Categories for Decoding

### Fixed-Length Types (consume fixed hex width)

| Type | Hex chars | Bytes |
|------|-----------|-------|
| \`u8\` / \`i8\` | 2 | 1 |
| \`u16\` / \`i16\` | 4 | 2 |
| \`u32\` / \`i32\` / \`usize\` / \`isize\` | 8 | 4 |
| \`u64\` / \`i64\` | 16 | 8 |
| \`bool\` | 2 | 1 (\`01\` = true, else false) |
| \`Address\` | 64 | 32 (always fixed, → bech32 \`klv1…\`) |

### Dynamic-Length Types (variable size, length-prefixed when nested)

\`ManagedBuffer\`, \`TokenIdentifier\`, \`bytes\`, \`BoxedBytes\`, \`String\`, \`&str\`, \`Vec<u8>\`, \`&[u8]\`, \`BigInt\`, \`BigUint\`, \`BigFloat\`

- **Top-level** (sole output): entire hex is the data, no length prefix
- **Nested** (in List/Tuple/Struct/Option): 4-byte (8 hex) length prefix before data

\`\`\`
Nested string "hello":  [00000005][68656c6c6f]
                          ^ 5 bytes  ^ "hello"
\`\`\`

### Wrapper / Composite Types

| Wrapper | Decoding rule |
|---------|---------------|
| \`List<T>\` | Elements sequential until hex exhausted. Dynamic T gets length prefix per element. |
| \`Option<T>\` | 1-byte flag: empty = None, \`01\` = Some + nested T |
| \`tuple<T1,T2,...>\` | Each element decoded in order per its type |
| \`variadic<T>\` | Delegates to inner type T |
| Custom struct | Fields decoded in ABI order; dynamic fields get length prefix |

### Type Resolution Order

1. Split at \`<\` → match wrapper (List, Option, tuple, variadic)
2. Match built-in primitive/dynamic type
3. Look up in ABI \`types\` map (custom struct)
4. Error: \`"type X not found in provided abi"\`

## Decoding Examples

### BigUint from hex
\`\`\`bash
# ABI: { "name": "getTotal", "outputs": [{ "type": "BigUint" }] }
~/klever-sdk/koperator sc parse-output hex getTotal \\
    --abi ./contract.abi.json \\
    --raw-output "1388"
# Output: 5000
\`\`\`

### BigUint from VM query (base64)
\`\`\`bash
~/klever-sdk/koperator sc parse-output query getTotal \\
    --abi ./contract.abi.json \\
    --raw-output "E4g="
# Output: 5000 (base64 → hex 1388 → 5000)
\`\`\`

### Address
\`\`\`bash
~/klever-sdk/koperator sc parse-output hex getOwner \\
    --abi ./contract.abi.json \\
    --raw-output "0139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1"
# Output: klv1… bech32 address
\`\`\`

### String / TokenIdentifier
\`\`\`bash
~/klever-sdk/koperator sc parse-output hex getName \\
    --abi ./contract.abi.json \\
    --raw-output "4b4c56"
# Output: KLV
\`\`\`

### List<u32>
\`\`\`bash
# Each u32 is 8 hex chars (fixed-width nested):
# 0000000a = 10, 00000014 = 20, 00000064 = 100
~/klever-sdk/koperator sc parse-output hex getValues \\
    --abi ./contract.abi.json \\
    --raw-output "0000000a0000001400000064"
# Output: [10, 20, 100]
\`\`\`

### List<BigUint> (dynamic-length elements)
\`\`\`bash
# Each BigUint is length-prefixed:
# 00000002 1388  → 2 bytes → 5000
# 00000003 07a120 → 3 bytes → 500000
~/klever-sdk/koperator sc parse-output hex getBalances \\
    --abi ./contract.abi.json \\
    --raw-output "0000000213880000000307a120"
# Output: [5000, 500000]
\`\`\`

### Option<BigUint>
\`\`\`bash
# Some(5000): 01 + length(00000002) + data(1388)
~/klever-sdk/koperator sc parse-output hex getReward \\
    --abi ./contract.abi.json \\
    --raw-output "01000000021388"
# Output: 5000
\`\`\`

**Option None:** At the encoding level, Option None is an empty byte sequence.
However, \`--raw-output ""\` triggers the CLI error \`"empty smart contract output not allowed"\`.
Detect None **before** calling parse-output by checking if the VM query \`returnData\` array
is empty or the element is an empty string:
\`\`\`bash
RAW=$(curl -s ... | jq -r '.data.returnData[0] // empty')
if [ -z "$RAW" ]; then
  echo "None"  # Option is None — nothing to decode
else
  ~/klever-sdk/koperator sc parse-output query getReward \\
      --abi ./contract.abi.json --raw-output "$RAW"
fi
\`\`\`

### Option<u32>
\`\`\`bash
# Some(42): 01 + 0000002a (nested u32, fixed 4 bytes)
~/klever-sdk/koperator sc parse-output hex getLimit \\
    --abi ./contract.abi.json \\
    --raw-output "010000002a"
# Output: 42
\`\`\`

### Custom Struct
\`\`\`bash
# ABI types: TokenInfo { id: TokenIdentifier, amount: BigUint, frozen: bool }
# id = "KLV": length(00000003) + 4b4c56
# amount = 1000000: length(00000003) + 0f4240
# frozen = false: 00
~/klever-sdk/koperator sc parse-output hex getInfo \\
    --abi ./contract.abi.json \\
    --raw-output "000000034b4c56000000030f424000"
# Output: { "id": "KLV", "amount": 1000000, "frozen": false }
\`\`\`

### Scripting-Friendly
\`\`\`bash
VALUE=$(~/klever-sdk/koperator sc parse-output hex getTotal \\
    --abi ./contract.abi.json \\
    --raw-output "1388" \\
    --result-only --await)
echo "Total: $VALUE"
\`\`\`

## Obtaining Raw Output Data

### From VM query (readonly endpoints)
\`\`\`bash
RAW=$(curl -s -X POST https://node.testnet.klever.org/vm/query \\
    -H "Content-Type: application/json" \\
    -d '{"scAddress":"klv1contract...","funcName":"getTotal","args":[]}' \\
    | jq -r '.data.returnData[0]')

~/klever-sdk/koperator sc parse-output query getTotal \\
    --abi ./contract.abi.json \\
    --raw-output "$RAW" \\
    --result-only --await
\`\`\`

### From transaction result (mutable endpoints)
Extract hex from the TX result's smartContractResults, then use \`hex\` mode.

## Decision Tree for Agents

\`\`\`
Is the data from /vm/query?
  ├── YES → mode = "query", --raw-output = base64 from returnData
  └── NO  → Is it hex from a TX result or storage?
              ├── YES → mode = "hex", --raw-output = hex string
              └── NO  → Convert to hex first, then use "hex" mode
\`\`\`

## Error Reference

| Error | Cause | Fix |
|-------|-------|-----|
| \`invalid file path provided\` | --abi empty or missing | Supply valid path |
| \`empty smart contract output not allowed\` | --raw-output empty | Provide hex or base64 data. For Option None, detect empty data before calling parse-output (see Option examples above) |
| \`invalid parse option\` | Mode is not \`hex\` or \`query\` | Use \`hex\` or \`query\` |
| \`endpoint <name> not found\` | Name doesn't match ABI | Check exact case-sensitive name |
| \`invalid base64 string\` | Bad base64 in query mode | Verify base64 encoding |
| \`type <X> not found in provided abi\` | Unknown type | Add type to ABI \`types\` map |
| \`error decoding list item\` | Data/type mismatch | Verify hex matches List<T> structure |

## Important Notes for Agents

1. **Endpoint names are case-sensitive** — must match ABI exactly
2. **ABI file must be on disk** — no inline ABI mode; reference a local file
3. **One --raw-output per invocation** — decode multiple outputs with multiple runs
4. **No spaces in hex** — entire hex string must be contiguous
5. **Decoded type depends on ABI** — outdated ABI = wrong/failed decoding
6. **Use query mode for readonly** endpoints with /vm/query; hex mode for TX results`,
    {
      title: 'Decoding Smart Contract Output with sc parse-output',
      description:
        'Complete reference for sc parse-output: decode modes (hex/query), ABI type system, fixed vs dynamic types, length prefixes, List/Option/Tuple/Struct decoding, error reference, agent workflow',
      tags: [
        'koperator',
        'abi',
        'decode',
        'parse-output',
        'hex',
        'query',
        'output',
        'types',
        'list',
        'option',
        'struct',
        'reference',
        'smart-contract',
      ],
      language: 'bash',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),
];

export default koperatorAbiKnowledge;
