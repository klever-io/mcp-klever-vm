# Build & Deploy

## SDK Tools

| Tool | Purpose | Install Path |
|---|---|---|
| **ksc** | Smart contract compiler (Rust -> WASM) | `~/klever-sdk/ksc` |
| **koperator** | CLI for blockchain operations | `~/klever-sdk/koperator` |

## Build

```bash
~/klever-sdk/ksc all build
# Output: output/contract.wasm
```

## Deploy

```bash
~/klever-sdk/koperator sc create \
    --wasm="output/contract.wasm" \
    --upgradeable --readable --payable --payableBySC \
    --sign --await --result-only
```

## Upgrade

```bash
~/klever-sdk/koperator sc update CONTRACT_ADDR \
    --wasm="output/contract.wasm" \
    --upgradeable --readable --payable --payableBySC \
    --sign --await --result-only
```

## Invoke (State-Changing Call)

```bash
~/klever-sdk/koperator sc invoke CONTRACT_ADDR FUNCTION_NAME \
    --args "Type:value" \
    --sign --await --result-only
```

### Argument Types

| Type | Example |
|---|---|
| Address | `--args "Address:klv1abc..."` |
| TokenIdentifier | `--args "TokenIdentifier:KLV"` |
| String | `--args "String:hello"` |
| u32 / u64 | `--args "u32:42"` |
| BigUint | `--args "bi:1000000"` |
| Bool | `--args "bool:true"` |
| Hex | `--args "hex:deadbeef"` |

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
