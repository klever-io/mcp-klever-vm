# Build & Deploy

## SDK Tools

| Tool | Purpose | Install Path |
|---|---|---|
| **ksc** | Smart contract compiler (Rust -> WASM) | `~/klever-sdk/ksc` |
| **koperator** | CLI for blockchain operations | `~/klever-sdk/koperator` |

## Update Dependencies

```bash
# Update Cargo.lock in all wasm crates to latest versions
~/klever-sdk/ksc all update
```

## Build

```bash
~/klever-sdk/ksc all build
# Output: output/contract.wasm
```

## Deploy

```bash
~/klever-sdk/koperator sc create \
    --wasm="output/contract.wasm" \
    --readable --payable --payableBySC \
    --sign --await --result-only
# Note: --upgradeable defaults to true (contract is upgradeable unless you omit it)
```

### Deploy with Init Arguments

```bash
~/klever-sdk/koperator sc create \
    --wasm="output/contract.wasm" \
    --args "bi:1000000" \
    --args "address:klv1owner..." \
    --args "string:MyToken" \
    --readable --payable --payableBySC \
    --sign --await --result-only
```

## Upgrade

```bash
~/klever-sdk/koperator sc upgrade CONTRACT_ADDR \
    --wasm="output/contract.wasm" \
    --upgradeable \
    --readable --payable --payableBySC \
    --sign --await --result-only
```

## Invoke (State-Changing Call)

```bash
~/klever-sdk/koperator sc invoke CONTRACT_ADDR FUNCTION_NAME \
    --args "type:value" \
    --sign --await --result-only
```

### Argument Types

| Type tag(s) | Rust SDK type | Example |
|---|---|---|
| `address`, `a` | ManagedAddress | `--args "address:klv1abc..."` |
| `string`, `ManagedBuffer`, `TokenIdentifier`, `bytes` | ManagedBuffer / String | `--args "string:hello"` |
| `u8`, `u16`, `u32`, `u64` | u8–u64 | `--args "u32:42"` |
| `i8`, `i16`, `i32`, `i64` | i8–i64 | `--args "i32:-500"` |
| `bi`, `BigUint`, `BigInt` | BigUint / BigInt | `--args "bi:1000000"` |
| `bf`, `BigFloat` | BigFloat | `--args "bf:3.14"` |
| `bool`, `b` | bool | `--args "bool:true"` |
| `hex` | *(raw pass-through)* | `--args "hex:deadbeef"` |
| `empty`, `e` | *(None / empty)* | `--args "empty:"` |
| `number` | *(auto-detect)* | `--args "number:500"` |
| `file`, `code`, `wasm` | *(file contents)* | `--args "file:./output/contract.wasm"` |

### Option<T> (Optional Arguments)

Prefix the type tag with `option` (**no colon separator**):

```bash
--args "optionu64:100"        # Some(100u64)
--args "optionstring:hello"   # Some("hello")
--args "optionaddress:klv1…"  # Some(address)
--args "empty:"               # None
```

**WRONG**: ~~`Option:u32:42`~~, ~~`Option:String:hello`~~

### Composite Types (List, Tuple, Variadic)

No single-arg syntax. Pass each element as a separate `--args`:

```bash
# List<u32>: 3 elements
--args "u32:10" --args "u32:20" --args "u32:30"

# tuple<u32, String, Address>:
--args "u32:42" --args "string:hello" --args "address:klv1..."

# variadic<BigUint> (always last parameter):
--args "bi:100" --args "bi:200" --args "bi:300"
```

### Sending Payments

```bash
# Send KLV with call
~/klever-sdk/koperator sc invoke CONTRACT_ADDR deposit \
    --values "KLV=5000000" \
    --sign --await --result-only

# Send multiple tokens
~/klever-sdk/koperator sc invoke CONTRACT_ADDR multi_deposit \
    --values "KLV=1000000,KFI=500000" \
    --sign --await --result-only
```

**CRITICAL**: Use `--values` (plural), NEVER `--value`.

### Key Flags

| Flag | Default | Purpose |
|---|---|---|
| `--sign` (`-s`) | false | Auto-sign without interactive prompt |
| `--await` | false | Wait for TX to be posted on-chain |
| `--result-only` | false | Clean JSON output (requires --await) |
| `--create-only` (`-c`) | false | Build TX JSON without broadcasting |
| `--nonce-check` | `current` | Nonce strategy: `current`, `first-pending`, `pending` |
| `--upgradeable` | **true** | Contract can be upgraded (defaults to true!) |
| `--verbose` | false | Trace-level logging |
| `--kdaFee` | "" | Pay fees with a specific KDA token |

## Query (Read-Only Call)

```bash
# Via koperator
~/klever-sdk/koperator sc query CONTRACT_ADDR FUNCTION_NAME \
    --args "Type:value"

# Via API
curl -X POST "https://node.testnet.klever.org/vm/query" \
    -H "Content-Type: application/json" \
    -d '{"scAddress":"klv1...","funcName":"getValue","args":[]}'
```

## Environment Setup

```bash
# .env file for scripts
NETWORK=testnet
KEY_FILE=~/klever-sdk/walletKey.pem
CONTRACT_ADDR=klv1qqq...
```
