import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * Koperator tool documentation and usage patterns
 */

export const koperatorKnowledge: KnowledgeEntry[] = [
  // CRITICAL: Correct Koperator Syntax
  createKnowledgeEntry(
    'deployment_tool',
    `# ⚠️ CRITICAL: Correct Koperator Command Syntax ⚠️

## ALWAYS Use This Format for sc invoke:

\`\`\`bash
# CORRECT FORMAT:
~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke CONTRACT_ADDRESS FUNCTION_NAME \\
    --args "type:value" \\
    --values "KLV=amount" \\
    --await --sign --result-only
\`\`\`

## ❌ NEVER USE These Wrong Patterns:
- \`--contract="address"\` ❌ WRONG - use positional argument
- \`--function="name"\` ❌ WRONG - use positional argument
- \`--value="amount"\` ❌ WRONG - use --values "KLV=amount"
- \`--kdaFee="KLV"\` ❌ WRONG - does not exist
- \`--token-transfers\` ❌ WRONG - use --values

## Correct Examples:

### Simple Function Call
\`\`\`bash
~/klever-sdk/koperator sc invoke klv1abc... myFunction \\
    --await --sign --result-only
\`\`\`

### With Arguments
\`\`\`bash
~/klever-sdk/koperator sc invoke klv1abc... transfer \\
    --args "Address:klv1xyz..." \\
    --args "bi:1000000" \\
    --await --sign --result-only
\`\`\`

### With Payment
\`\`\`bash
~/klever-sdk/koperator sc invoke klv1abc... stake \\
    --values "KLV=10000000" \\
    --await --sign --result-only
\`\`\`

## Key Parameters Explained:
- Positional Args: CONTRACT_ADDRESS and FUNCTION_NAME come first (no flags)
- \`--args\`: Each argument needs its own --args flag with type prefix
- \`--values\`: For sending tokens (KLV, KFI, or KDA tokens)
- \`--await\`: Wait for transaction confirmation
- \`--sign\`: Sign the transaction
- \`--result-only\`: Show only the transaction result (clean JSON output without logs)

## 🚨 CRITICAL for Unattended Scripts:
When using koperator in automated/unattended scripts, you MUST use these three flags together:
- \`--sign\`: Signs and broadcasts the transaction without user interaction
- \`--await\`: Waits for the transaction to be included in a block
- \`--result-only\`: Returns only clean JSON result without extra output

Without these flags, scripts will hang waiting for user input or produce unparseable output!`,
    {
      title: 'CRITICAL: Correct Koperator Syntax - READ THIS FIRST',
      description: 'The ONLY correct way to use koperator sc invoke - NEVER use --contract, --function, --value. Always include --result-only for clean output',
      tags: ['koperator', 'critical', 'syntax', 'sc-invoke', 'commands'],
      language: 'bash',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Koperator Tool Overview
  createKnowledgeEntry(
    'documentation',
    `# Koperator - Klever Operator Tool

## Overview
Koperator is the command-line tool for interacting with Klever blockchain and smart contracts.

## Location
If Klever VSCode extension is installed, koperator is located at:
\`~/klever-sdk/koperator\`

## Basic Usage
\`\`\`bash
# Check available options
~/klever-sdk/koperator --help

# Smart contract operations
~/klever-sdk/koperator sc --help
\`\`\`

## Node Configuration Options

### Option 1: Environment Variable
\`\`\`bash
export KLEVER_NODE="http://localhost:8080"  # Local node (default port 8080)
# export KLEVER_NODE="https://node.testnet.klever.org"  # Testnet
\`\`\`

### Option 2: --node Parameter
\`\`\`bash
# Use --node parameter directly in the command
~/klever-sdk/koperator --node="http://localhost:8080" ...
\`\`\`

## Smart Contract Operations

### Contract Deployment (sc create)
\`\`\`bash
~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc create \\
    --wasm="output/contract.wasm" \\
    --upgradeable --readable --payable --payableBySC \\
    --await --sign --result-only
\`\`\`

### Contract Upgrade (sc upgrade)
\`\`\`bash
~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc upgrade CONTRACT_ADDRESS \\
    --wasm="output/contract.wasm" \\
    --await --sign --result-only
\`\`\`

### Contract Invocation (sc invoke)
\`\`\`bash
~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke CONTRACT_ADDRESS FUNCTION_NAME \\
    --args "type:value" \\
    --values "KLV=amount" \\
    --await --sign --result-only
\`\`\`

## Important Notes:
- Always use --result-only for clean JSON output
- CONTRACT_ADDRESS and FUNCTION_NAME are positional arguments
- Each argument needs its own --args flag
- Query endpoints use API, not koperator`,
    {
      title: 'Koperator Tool - Overview and Basic Usage',
      description: 'Comprehensive overview of the Klever Operator (koperator) command-line tool',
      tags: ['koperator', 'cli', 'tool', 'smartcontract', 'deploy', 'upgrade', 'invoke'],
      language: 'bash',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Koperator Argument Types
  createKnowledgeEntry(
    'documentation',
    `# Klever Argument Types for Koperator

## IMPORTANT: Always use type prefixes for arguments

When using koperator with sc invoke, ALL arguments must have type prefixes:

## Type Prefixes for --args
Based on koperator's encode function, use these type prefixes:

### Wrapper Types
- \`List:\` - List of values
- \`Option:\` - Optional value (can also use \`option\` prefix)
- \`tuple:\` - Tuple of values
- \`variadic:\` - Variable number of arguments

### Integer Types
- \`i8:\`, \`I8:\` - Signed 8-bit integer
- \`i16:\`, \`I16:\` - Signed 16-bit integer
- \`i32:\`, \`I32:\`, \`isize:\`, \`ISIZE:\` - Signed 32-bit integer
- \`i64:\`, \`I64:\` - Signed 64-bit integer
- \`u8:\`, \`U8:\` - Unsigned 8-bit integer
- \`u16:\`, \`U16:\` - Unsigned 16-bit integer
- \`u32:\`, \`U32:\`, \`usize:\`, \`USIZE:\` - Unsigned 32-bit integer
- \`u64:\`, \`U64:\` - Unsigned 64-bit integer
- \`bi:\`, \`BI:\`, \`BigInt:\`, \`bigint:\`, \`BigUint:\`, \`biguint:\` - Big integers

### String and Buffer Types
- \`str:\`, \`String:\`, \`string:\` - String value
- \`bytes:\`, \`Bytes:\` - Byte array
- \`TokenIdentifier:\` - Token identifier
- \`KdaTokenIdentifier:\` - KDA token identifier

### Address Types
- \`Address:\`, \`address:\` - Klever address (must start with "klv")

### Boolean Types
- \`bool:\`, \`b:\` - Boolean (true/false, 0/1)

### Special Types
- \`empty\` - No value (for Option::None)
- \`CodeMetadata:\` - Contract metadata

## Usage Examples

### Basic Types
\`\`\`bash
# Numbers
--args "u8:5"                    # 8-bit unsigned integer
--args "u32:1000"                # 32-bit unsigned integer
--args "bi:1000000"              # BigUint for large numbers

# Strings
--args "String:hello world"      # String value
--args "bytes:0x48656c6c6f"      # Byte array (hex)

# Addresses
--args "Address:klv1abc..."      # Klever address

# Booleans
--args "bool:true"               # Boolean true
--args "b:0"                     # Boolean false
\`\`\`

### Complex Types
\`\`\`bash
# Optional values
--args "Option:String:value"     # Some(value)
--args "empty"                   # None

# Lists
--args "List:u32:1,u32:2,u32:3"  # List of numbers

# Tuples
--args "tuple:u64:123,String:test,bool:true"  # Tuple of mixed types

# Multiple arguments - use separate --args for each
~/klever-sdk/koperator sc invoke CONTRACT transfer \\
    --args "Address:klv1recipient..." \\
    --args "bi:1000000" \\
    --args "String:memo"
\`\`\`

### Token Payments (use --values, not --args!)
\`\`\`bash
# Single token payment
--values "KLV=1000000"           # 1 KLV (6 decimals)

# Multiple token payments
--values "KLV=1000000,KFI=500000,USDT-A1B2=250000"

# NFT/SFT with nonce
--values "NFT-XYZ/01=1"          # NFT with nonce 01
\`\`\`

## Common Mistakes to Avoid

### ❌ Wrong: Mixing up --args and --values
\`\`\`bash
# WRONG - KLV payment is not an argument
--args "KLV:1000000"

# CORRECT - Use --values for payments
--values "KLV=1000000"
\`\`\`

### ❌ Wrong: Missing type prefix
\`\`\`bash
# WRONG - No type prefix
--args "123"

# CORRECT - Include type prefix
--args "u32:123"
\`\`\`

### ❌ Wrong: Using flags for positional arguments
\`\`\`bash
# WRONG
--contract="klv1abc..." --function="transfer"

# CORRECT - Positional arguments
sc invoke klv1abc... transfer
\`\`\``,
    {
      title: 'Klever Argument Types for Koperator',
      description: 'Complete reference for argument types and formatting when using Koperator CLI tool',
      tags: ['koperator', 'arguments', 'types', 'documentation', 'cli', 'reference'],
      language: 'bash',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Complete Koperator Argument Encoding Guide
  createKnowledgeEntry(
    'best_practice',
    `# 📚 Complete Koperator Argument Encoding Guide

## 🎯 Quick Reference - Most Common Patterns

\`\`\`bash
# Basic Types
--args "u8:5"                    # Unsigned 8-bit integer (0-255)
--args "u32:1000"                # Unsigned 32-bit integer
--args "u64:1000000"             # Unsigned 64-bit integer
--args "bi:1000000"              # BigInt/BigUint (any size)
--args "String:hello world"      # String value
--args "Address:klv1abc..."      # Klever address
--args "bool:true"               # Boolean (true/false)

# Token Payments (using --values, not --args!)
--values "KLV=1000000"           # 1 KLV (6 decimals)
--values "KFI=500000"            # 0.5 KFI (6 decimals)
--values "DVK-34ZH=100000"       # Custom KDA token
--values "KLV=1000000,KFI=500000" # Multiple tokens

# NFT/SFT with nonce
--values "NFT-XYZ/01=1"          # NFT with nonce 01
--values "SFT-ABC/05=100"        # 100 SFTs with nonce 05

# Optional Values
--args "Option:String:hello"     # Some("hello")
--args "empty"                   # None

# Lists
--args "List:u32:1,u32:2,u32:3" # [1, 2, 3]

# Tuples
--args "tuple:u64:123,String:test,bool:true" # (123, "test", true)
\`\`\`

## 📖 Complete Type Reference

### Numeric Types (with examples)
\`\`\`bash
# Unsigned integers
--args "u8:255"                  # 8-bit: 0 to 255
--args "u16:65535"               # 16-bit: 0 to 65,535
--args "u32:4294967295"          # 32-bit: 0 to 4,294,967,295
--args "u64:18446744073709551615" # 64-bit: 0 to 18,446,744,073,709,551,615

# Signed integers
--args "i8:-128"                 # 8-bit: -128 to 127
--args "i16:-32768"              # 16-bit: -32,768 to 32,767
--args "i32:-2147483648"         # 32-bit: -2,147,483,648 to 2,147,483,647
--args "i64:-9223372036854775808" # 64-bit: very large range

# Big integers (unlimited size)
--args "bi:999999999999999999999" # Any size number
--args "BigUint:1000000000000000" # Alternative syntax
\`\`\`

### String and Buffer Types
\`\`\`bash
# Strings
--args "String:Hello World"      # Regular string
--args "str:Special chars: !@#"  # With special characters
--args 'String:With "quotes"'    # Quotes inside

# Bytes (hex format)
--args "bytes:0x48656c6c6f"      # "Hello" in hex
--args "Bytes:0x00FF00FF"        # Binary data

# Token identifiers
--args "TokenIdentifier:KLV"     # Token ID
--args "KdaTokenIdentifier:USDT-A1B2" # KDA token ID
\`\`\`

### Address Types
\`\`\`bash
# Klever addresses (must start with "klv")
--args "Address:klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqlllllh"
--args "address:klv1234567890abcdef..."
\`\`\`

### Boolean Types
\`\`\`bash
# Boolean values
--args "bool:true"               # True
--args "bool:false"              # False
--args "b:1"                     # True (using 1)
--args "b:0"                     # False (using 0)
\`\`\`

### Complex Types

#### Optional Values
\`\`\`bash
# Some value
--args "Option:u32:42"           # Some(42)
--args "Option:String:hello"     # Some("hello")
--args "option:Address:klv1..."  # Some(address)

# None value
--args "empty"                   # None
\`\`\`

#### Lists (arrays)
\`\`\`bash
# List of same type
--args "List:u32:1,u32:2,u32:3"  # [1, 2, 3]
--args "List:String:a,String:b"   # ["a", "b"]
--args "List:Address:klv1...,Address:klv2..." # [addr1, addr2]

# Empty list
--args "List:"                   # []
\`\`\`

#### Tuples (mixed types)
\`\`\`bash
# Tuple with different types
--args "tuple:u64:123,String:test,bool:true" # (123, "test", true)
--args "tuple:Address:klv1...,bi:1000000"    # (address, 1000000)
\`\`\`

#### Variadic (variable number of args)
\`\`\`bash
# Variadic arguments (processed as separate values)
--args "variadic:u32:1,u32:2,u32:3" # Passes 1, 2, 3 as separate args
\`\`\`

## 💰 Token Payments with --values

### CRITICAL: Use --values for payments, NOT --args!

\`\`\`bash
# ✅ CORRECT - Single token payment
~/klever-sdk/koperator sc invoke CONTRACT stake \\
    --values "KLV=1000000" \\        # 1 KLV
    --await --sign --result-only

# ✅ CORRECT - Multiple token payments
~/klever-sdk/koperator sc invoke CONTRACT multiPay \\
    --values "KLV=1000000,KFI=500000,USDT-A1B2=250000" \\
    --await --sign --result-only

# ❌ WRONG - Don't use --args for payments
--args "KLV:1000000"  # This won't work!
\`\`\`

### NFT/SFT Payments
\`\`\`bash
# NFT payment (nonce required)
--values "MYNFT-A1B2/01=1"       # 1 NFT with nonce 01

# SFT payment (nonce required, amount can be > 1)
--values "MYSFT-C3D4/05=100"     # 100 SFTs with nonce 05

# Multiple NFTs/SFTs
--values "NFT1-XYZ/01=1,NFT2-ABC/02=1,SFT-DEF/03=50"
\`\`\`

## 🔧 Real-World Examples

### Example 1: Token Transfer
\`\`\`bash
~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke klv1contract... transfer \\
    --args "Address:klv1recipient..." \\
    --args "bi:1000000" \\
    --await --sign --result-only
\`\`\`

### Example 2: Staking with Payment
\`\`\`bash
~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke klv1staking... stake \\
    --args "u32:30" \\              # 30 days lock period
    --values "KLV=100000000" \\     # 100 KLV
    --await --sign --result-only
\`\`\`

### Example 3: Complex Function Call
\`\`\`bash
~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke klv1game... createGame \\
    --args "String:MyGame" \\
    --args "u32:10" \\
    --args "List:Address:klv1p1...,Address:klv1p2..." \\
    --args "Option:u64:3600" \\
    --values "KLV=10000000" \\
    --await --sign --result-only
\`\`\`

## ⚠️ Common Pitfalls and Solutions

1. **Wrong Parameter Names**: CONTRACT_ADDRESS and FUNCTION are positional, not flags
2. **Missing Type Prefix**: Always include type: prefix (u32:, String:, etc.)
3. **Payment Confusion**: Use --values with = for payments, not --args with :
4. **Multiple Arguments**: Each argument needs its own --args flag
5. **Address Format**: Addresses must start with "klv"
6. **NFT Format**: TOKEN_ID/NONCE=AMOUNT for NFTs/SFTs`,
    {
      title: 'Complete Koperator Argument Encoding Guide',
      description: 'Comprehensive guide for encoding arguments and payments in koperator commands',
      tags: ['koperator', 'arguments', 'encoding', 'payments', 'guide', 'reference', 'critical'],
      language: 'bash',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // API vs Koperator Usage
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
curl -s 'https://api.testnet.klever.org/v1.0/sc/query' \
    -H 'Content-Type: application/json' \
    --data-raw '{
        "ScAddress": "klv1contract_address_here",
        "FuncName": "getTotalSupply",
        "Arguments": []
    }'

# Query getBalance with address argument
# Example: klv1qqq...qqpgm89z (zero address) = 32 zero bytes = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="
curl -s 'https://api.testnet.klever.org/v1.0/sc/query' \
    -H 'Content-Type: application/json' \
    --data-raw '{
        "ScAddress": "klv1contract_address_here",
        "FuncName": "getBalance",
        "Arguments": ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="]
    }'

# Query with multiple arguments (address + number)
# Address: 32 bytes base64
# Number 42: 0x000000000000002a (8 bytes big-endian) = "AAAAAAAAACo="
curl -s 'https://api.testnet.klever.org/v1.0/sc/query' \
    -H 'Content-Type: application/json' \
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
    --args Address:klv1recipient --args bi:1000000 \\
    --await --sign --result-only
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
      description: 'Clear guidance on using the API for contract queries vs koperator for transactions',
      tags: ['api', 'koperator', 'view', 'query', 'invoke', 'best-practice', 'contract'],
      language: 'bash',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Koperator Account Operations
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
      description: 'Developer utilities for fetching account information - address, balance, nonce, and other details',
      tags: ['koperator', 'account', 'balance', 'address', 'nonce', 'info', 'developer-tools', 'utilities'],
      language: 'bash',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Koperator Examples
  createKnowledgeEntry(
    'code_example',
    `# Koperator Smart Contract Operations Examples

# 1. Deploy a new contract
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc create \\
    --wasm="output/contract.wasm" \\
    --upgradeable --readable --payable --payableBySC \\
    --await --sign --result-only

# 2. Invoke contract with BigUint argument
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke klv1contract_address_here add \\
    --args bi:100 \\
    --await --sign --result-only

# 3. Invoke with multiple arguments - use separate --args for each argument
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke klv1contract_address_here setUserInfo \\
    --args Address:klv1user_address_here \\
    --args u32:42 \\
    --args String:"Active User" \\
    --await --sign --result-only

# 4. Send KLV payment with function call
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke klv1contract_address_here deposit \\
    --values "KLV=10000000" \\
    --await --sign --result-only

# 5. Send multiple token payments
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke klv1contract_address_here multiDeposit \\
    --values "KLV=5000000,KFI=3000000,USDT-A1B2=1000000" \\
    --await --sign --result-only

# 6. Upgrade existing contract
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc upgrade klv1contract_address_here \\
    --wasm="output/contract-v2.wasm" \\
    --await --sign --result-only`,
    {
      title: 'Koperator Smart Contract Operations Examples',
      description: 'Practical examples of using koperator for various smart contract operations',
      tags: ['koperator', 'examples', 'deploy', 'invoke', 'query', 'upgrade'],
      language: 'bash',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Koperator Payment Flags
  createKnowledgeEntry(
    'documentation',
    `# Koperator Payment Flags for Smart Contract Creation

## Contract Properties During Deployment

When creating a smart contract with \`sc create\`, you can set the following properties:

### Payment-Related Flags

#### --payable
- **Purpose**: Allows the contract to receive KLV payments
- **Usage**: Required if your contract has \`#[payable("KLV")]\` endpoints
- **Example**: Contract can receive KLV via payable endpoints

#### --payableBySC
- **Purpose**: Allows other smart contracts to send payments to this contract
- **Usage**: Required for contract-to-contract payment interactions
- **Example**: Another contract can call your payable endpoints with payments

### Other Important Flags

#### --upgradeable
- **Purpose**: Makes the contract upgradeable by the owner
- **Usage**: Recommended for development, optional for production
- **Example**: Owner can upgrade contract code later

#### --readable
- **Purpose**: Makes contract storage readable by external queries
- **Usage**: Recommended for transparency
- **Example**: Anyone can query contract storage values

## Complete Deployment Example

\`\`\`bash
# Deploy with all common flags
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc create \\
    --wasm="output/my_contract.wasm" \\
    --upgradeable \\      # Can be upgraded later
    --readable \\         # Storage is queryable
    --payable \\          # Can receive KLV
    --payableBySC \\      # Other contracts can pay it
    --await \\            # Wait for confirmation
    --sign \\             # Sign transaction
    --result-only         # Clean JSON output
\`\`\`

## Flag Combinations for Different Contract Types

### DeFi/Exchange Contract
\`\`\`bash
--upgradeable --readable --payable --payableBySC
\`\`\`

### NFT Marketplace Contract
\`\`\`bash
--upgradeable --readable --payable --payableBySC
\`\`\`

### Oracle/Data Provider Contract
\`\`\`bash
--upgradeable --readable
# (No payment flags if it doesn't accept payments)
\`\`\`

### Immutable Production Contract
\`\`\`bash
--readable --payable --payableBySC
# (No --upgradeable for immutability)
\`\`\`

## Common Mistakes

### ❌ Forgetting --payable
If your contract has payable endpoints but you deploy without --payable:
- Payable endpoints will reject all payments
- Users won't be able to send KLV to the contract

### ❌ Forgetting --payableBySC
If other contracts need to pay yours but you deploy without --payableBySC:
- Contract-to-contract payments will fail
- Integration with other protocols won't work

### ✅ Best Practice
Always include both --payable and --payableBySC if your contract handles any payments, even if you're not sure about contract-to-contract interactions yet.`,
    {
      title: 'Koperator Payment Flags for Contract Creation',
      description: 'Understanding --payable and --payableBySC flags when deploying smart contracts',
      tags: ['koperator', 'deployment', 'payable', 'payableBySC', 'flags', 'contract-creation'],
      language: 'bash',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Koperator for Unattended Scripts
  createKnowledgeEntry(
    'best_practice',
    `# Using Koperator in Unattended/Automated Scripts

## 🚨 CRITICAL: Three Required Flags for Automation

When using koperator in unattended scripts (CI/CD, cron jobs, automated deployments), you MUST use these three flags together:

### Required Flags:
1. \`--sign\` - Signs and broadcasts the transaction without user interaction
2. \`--await\` - Waits for the transaction to be included in a block before returning
3. \`--result-only\` - Outputs only the transaction result in clean JSON format

## Why These Flags Are Essential:

### Without --sign:
- Script will hang waiting for user to confirm transaction
- Terminal prompt: "Do you want to sign? (y/n)"
- Script never continues

### Without --await:
- Script continues immediately after broadcasting
- Transaction might fail but script won't know
- No way to verify transaction success

### Without --result-only:
- Output includes progress messages, ASCII art, logs
- JSON result is mixed with text output
- Cannot parse result programmatically

## Correct Usage in Scripts:

### ✅ CORRECT - Automated Deployment Script
\`\`\`bash
#!/bin/bash
set -e  # Exit on error

# Deploy contract and capture result
RESULT=$(KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc create \\
    --wasm="output/contract.wasm" \\
    --upgradeable --readable --payable --payableBySC \\
    --sign \\        # No user interaction
    --await \\       # Wait for confirmation
    --result-only)   # Clean JSON output

# Parse contract address from result
CONTRACT_ADDRESS=$(echo "$RESULT" | jq -r '.contractAddress')
echo "Deployed to: $CONTRACT_ADDRESS"
\`\`\`

### ✅ CORRECT - CI/CD Pipeline
\`\`\`yaml
# .github/workflows/deploy.yml
- name: Deploy Smart Contract
  run: |
    ~/klever-sdk/koperator \\
      --key-file="\${KEY_FILE}" \\
      sc create \\
      --wasm="output/contract.wasm" \\
      --upgradeable --readable --payable \\
      --sign --await --result-only > deployment.json
    
    # Extract and save contract address
    CONTRACT_ADDR=$(jq -r '.contractAddress' deployment.json)
    echo "CONTRACT_ADDRESS=\${CONTRACT_ADDR}" >> $GITHUB_ENV
\`\`\`

### ✅ CORRECT - Automated Testing Script
\`\`\`bash
#!/bin/bash

# Function to invoke contract and check result
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

# Run tests
invoke_and_verify "initialize" "success"
invoke_and_verify "deposit" "success"
\`\`\`

### ❌ WRONG - Will Hang in Scripts
\`\`\`bash
# WRONG - Missing --sign, will wait for user input
~/klever-sdk/koperator sc invoke CONTRACT transfer \\
    --args "Address:klv1..." \\
    --await --result-only

# WRONG - Missing --await, won't know if transaction succeeded
~/klever-sdk/koperator sc invoke CONTRACT transfer \\
    --args "Address:klv1..." \\
    --sign --result-only

# WRONG - Missing --result-only, output not parseable
~/klever-sdk/koperator sc invoke CONTRACT transfer \\
    --args "Address:klv1..." \\
    --sign --await
\`\`\`

## Parsing the JSON Result:

### With --result-only, you get clean JSON:
\`\`\`json
{
  "txHash": "abc123...",
  "status": "success",
  "contractAddress": "klv1...",
  "gasUsed": 5000000,
  "returnData": ["0x01"],
  "logs": []
}
\`\`\`

### Parse with jq:
\`\`\`bash
# Get transaction hash
TX_HASH=$(echo "$RESULT" | jq -r '.txHash')

# Get status
STATUS=$(echo "$RESULT" | jq -r '.status')

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

# Set environment for script
export KLEVER_NODE="https://node.testnet.klever.org"
export KEY_FILE="$HOME/klever-sdk/walletKey.pem"

# Now all koperator commands use these settings
~/klever-sdk/koperator \\
    --key-file="$KEY_FILE" \\
    sc invoke CONTRACT_ADDRESS function_name \\
    --sign --await --result-only
\`\`\`

## Summary:
- **Always use**: \`--sign --await --result-only\` for scripts
- **Never forget**: All three flags are required for automation
- **Parse output**: Use jq or similar to extract data from JSON result
- **Set -e**: Use \`set -e\` in bash scripts to exit on errors`,
    {
      title: 'Using Koperator in Unattended/Automated Scripts',
      description: 'CRITICAL: How to use koperator in CI/CD, automated scripts, and unattended environments',
      tags: ['koperator', 'automation', 'scripts', 'ci-cd', 'unattended', 'sign', 'await', 'result-only', 'critical'],
      language: 'bash',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Common Mistakes When Using Klever Tools
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
    --upgradeable --readable --payable \\
    --await --sign --result-only
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
      description: 'Frequent mistakes developers make with Klever CLI tools and how to avoid them',
      tags: ['mistakes', 'best-practice', 'koperator', 'cli', 'errors', 'debugging'],
      language: 'bash',
      relevanceScore: 0.9,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),
];

export default koperatorKnowledge;