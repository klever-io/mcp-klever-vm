import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * KLV/KFI token handling knowledge
 * Critical information about decimals and conversions
 */

export const klvKfiKnowledge: KnowledgeEntry[] = [
  // CRITICAL PAYMENT SYNTAX
  createKnowledgeEntry(
    'error_pattern',
    `# CRITICAL: --values NOT --value

## Most Common Error in Klever Development

When calling payable endpoints, you MUST use \`--values\` (plural) not \`--value\` (singular).

### ❌ WRONG - Will fail silently
\`\`\`bash
koperator contract invoke \\
  --contract-address $CONTRACT \\
  --method "deposit" \\
  --value "1000000"  # ❌ WRONG! Will be ignored!
\`\`\`

### ✅ CORRECT
\`\`\`bash
koperator contract invoke \\
  --contract-address $CONTRACT \\
  --method "deposit" \\
  --values "1000000"  # ✅ CORRECT! Note the 's'
\`\`\`

## Why This Matters
- Using \`--value\` will NOT send any payment
- The transaction will succeed but with 0 KLV sent
- This is the #1 cause of "payment not received" errors

## Multiple Values Format
For multiple token payments:
\`\`\`bash
--values "1000000" --values "2000000"  # Send multiple payments
\`\`\`

## Remember
**ALWAYS use --values with an 's' at the end!**`,
    {
      title: 'CRITICAL: --values NOT --value - Most Common Error',
      description: 'The most common error in Klever: using --value instead of --values for payments',
      tags: ['koperator', 'payment', 'critical', 'common-error', 'values', 'payable'],
      relevanceScore: 1.0,
    }
  ),

  // KLV/KFI DECIMALS
  createKnowledgeEntry(
    'best_practice',
    `# KLV/KFI Decimals - CRITICAL Information

## The Golden Rule: ALWAYS 6 Decimals

**KLV and KFI ALWAYS use 6 decimal places. NOT 8, NOT 9, NOT 10, NOT 18!**

### Conversion Formula
\`\`\`rust
// ALWAYS use this constant
const KLV_DECIMALS: u32 = 6;
const KLV_UNITS_PER_COIN: u64 = 1_000_000; // 10^6

// Convert KLV to units
fn klv_to_units(klv_amount: f64) -> u64 {
    (klv_amount * 1_000_000.0) as u64
}

// Convert units to KLV
fn units_to_klv(units: u64) -> f64 {
    units as f64 / 1_000_000.0
}
\`\`\`

### Common Values
- 1 KLV = 1,000,000 units
- 0.1 KLV = 100,000 units
- 0.01 KLV = 10,000 units
- 0.001 KLV = 1,000 units
- 0.000001 KLV = 1 unit (smallest unit)

### In Smart Contracts
\`\`\`rust
// Receiving payment
#[payable("KLV")]
#[endpoint]
fn deposit(&self) {
    let payment = self.call_value().klv_value();
    // payment is in units (1 KLV = 1_000_000 units)
    
    // To check for 1 KLV minimum
    require!(payment >= 1_000_000u64, "Minimum 1 KLV required");
}

// Sending payment
fn send_klv(&self, to: &ManagedAddress, klv_amount: f64) {
    let units = (klv_amount * 1_000_000.0) as u64;
    self.send().direct_klv(to, &BigUint::from(units));
}
\`\`\`

### In Scripts/CLI
\`\`\`bash
# Converting from KLV to units
KLV_AMOUNT=1.5
UNITS=$(echo "$KLV_AMOUNT * 1000000" | bc)
echo "1.5 KLV = $UNITS units"  # 1500000

# In koperator commands
koperator contract invoke \\
  --values "1000000"  # 1 KLV
\`\`\`

### Common Mistakes to Avoid
1. **Using 18 decimals** (Ethereum style) - KLV is NOT like ETH!
2. **Using 8 decimals** (Bitcoin style) - KLV is NOT like BTC!
3. **Forgetting to convert** - Always work in units in contracts
4. **Using floating point in contracts** - Use BigUint for precision

### Testing Values
\`\`\`rust
#[test]
fn test_klv_decimals() {
    assert_eq!(1_000_000u64, 1_KLV);
    assert_eq!(100_000u64, 0.1_KLV);
    assert_eq!(1_000u64, 0.001_KLV);
}
\`\`\`

## Remember: KLV and KFI = 6 DECIMALS ALWAYS!`,
    {
      title: 'CRITICAL: KLV/KFI Always 6 Decimals - NOT 8, 9, 10 or 18',
      description: 'Critical information about KLV/KFI decimal places - always 6, never anything else',
      tags: ['klv', 'kfi', 'decimals', 'conversion', 'units', 'critical', 'payment'],
      relevanceScore: 1.0,
    }
  ),

  // KLV Decimal Conversion in Scripts
  createKnowledgeEntry(
    'deployment_tool',
    `# KLV Decimal Conversion Functions

## Bash Functions for KLV/KFI Conversion

\`\`\`bash
#!/bin/bash

# KLV has 6 decimal places
# 1 KLV = 1,000,000 units

# Convert KLV to units (for contract calls)
klv_to_units() {
    local klv=$1
    # Remove underscores if present (for readability)
    klv=$(echo "$klv" | tr -d '_')
    
    # Use bc for decimal multiplication
    echo $(echo "$klv * 1000000" | bc | cut -d. -f1)
}

# Convert units to KLV (for display)
units_to_klv() {
    local units=$1
    echo "scale=6; $units / 1000000" | bc
}

# Format number with underscores for readability
format_number() {
    echo "$1" | sed ':a;s/\\B[0-9]\\{3\\}\\>/,&/;ta' | tr ',' '_'
}

# Examples
echo "1.5 KLV = $(klv_to_units 1.5) units"
echo "1500000 units = $(units_to_klv 1500000) KLV"
echo "Formatted: $(format_number 1000000)"  # 1_000_000
\`\`\`

## Using in Query Scripts

\`\`\`bash
# Parse return data as KLV amount
RETURN_DATA="..." # base64 encoded
if [ -n "$RETURN_DATA" ]; then
    # Decode to number
    HEX_VALUE=$(echo "$RETURN_DATA" | base64 -d | xxd -p)
    UNITS=$((16#$HEX_VALUE))
    
    # Convert to KLV
    KLV_AMOUNT=$(units_to_klv $UNITS)
    echo "Balance: $KLV_AMOUNT KLV ($UNITS units)"
fi
\`\`\`

## Integration with Koperator

\`\`\`bash
# Send 1.5 KLV
AMOUNT_KLV=1.5
AMOUNT_UNITS=$(klv_to_units $AMOUNT_KLV)

koperator contract invoke \\
  --contract-address $CONTRACT \\
  --method "deposit" \\
  --values "$AMOUNT_UNITS"  # Must use units, not KLV
\`\`\``,
    {
      title: 'KLV Decimal Conversion in Query Scripts',
      description: 'Bash functions for converting between KLV and units in scripts',
      tags: ['klv', 'decimals', 'bash', 'conversion', 'scripts', 'query'],
      relevanceScore: 0.85,
    }
  ),

  // KdaTokenPayment Structure and Usage
  createKnowledgeEntry(
    'code_example',
    `# Using KdaTokenPayment for Token Transfers

## KdaTokenPayment Structure

\`KdaTokenPayment\` is imported automatically with \`use klever_sc::imports::*;\` and represents any token payment (KLV, KDA, NFT, or SFT).

\`\`\`rust
// Structure (for reference - already imported, no need to define):
// pub struct KdaTokenPayment<M: ManagedTypeApi> {
//     pub token_identifier: TokenIdentifier<M>,
//     pub token_nonce: u64,  // 0 for fungible tokens, >0 for NFTs/SFTs
//     pub amount: BigUint<M>,
// }
\`\`\`

### VERY IMPORTANT !!!!!!:
- **1 KLV = 1_000_000 (1e6) smallest units**
- **1 KFI = 1_000_000 (1e6) smallest units**
- Always use smallest units values in contracts
    - FOR KLV - Always use 6 decimals (1 KLV = 1_000_000 units)
    - FOR KFI - Always use 6 decimals (1 KFI = 1_000_000 units)

### Example Conversions:
\`\`\`rust
// Converting from KLV/KFI to contract units
const ONE_KLV: u64 = 1_000_000;        // 1 KLV
const HALF_KLV: u64 = 500_000;         // 0.5 KLV
const TEN_KLV: u64 = 10_000_000;       // 10 KLV
const HUNDRED_KLV: u64 = 100_000_000;  // 100 KLV

// In contract functions
#[payable("KLV")]
#[endpoint(deposit)]
fn deposit(&self) {
    let amount = self.call_value().klv_value();
    // amount is already multiplied by 1_000_000
}
\`\`\`

## Usage Examples

### Direct Payment Function
\`\`\`rust
#[endpoint]
fn send_payment(&self, recipient: ManagedAddress, payment: KdaTokenPayment<Self::Api>) {
    // Validate payment
    require!(payment.amount > 0, "Amount must be positive");

    // Send using direct_payment
    self.send().direct_payment(&recipient, &payment);

    // Log the transfer
    self.payment_sent_event(&recipient, &payment);
}
\`\`\`

### Creating KdaTokenPayment
\`\`\`rust
// For KLV
let klv_payment = KdaTokenPayment::new(
    TokenIdentifier::klv(),
    0,
    BigUint::from(1000u32)
);

// For KDA token (using byte slice)
let kda_payment = KdaTokenPayment::new(
    TokenIdentifier::from(&b"DVK-34ZH"[..]),
    0u64,
    BigUint::from(500u128)
);

// For NFT
let nft_payment = KdaTokenPayment::new(
    TokenIdentifier::from(&b"MYNFT-5678"[..]),
    42u64,  // The specific NFT index
    BigUint::from(1u32)  // NFTs always have amount 1
);

// For SFT
let sft_payment = KdaTokenPayment::new(
    TokenIdentifier::from(&b"MYSFT-9ABC"[..]),
    5u64,   // The SFT type index
    BigUint::from(100u32)  // SFTs can have amounts > 1
);

// Using variables
let fee_value = BigUint::from(50u32);
let fee_payment = KdaTokenPayment::new(
    TokenIdentifier::klv(),
    0,
    fee_value
);
\`\`\`

### Getting Payment from Call Value
\`\`\`rust
#[endpoint]
#[payable("*")]
fn receive_and_forward(&self, recipient: ManagedAddress) {
    // Get the payment sent to this endpoint
    let payment = self.call_value().single_kda();

    // Forward it to another address
    self.send().direct_payment(&recipient, &payment);
}
\`\`\`

### Alternative Direct Transfer Methods
\`\`\`rust
// These are equivalent:

// Using direct_payment
self.send().direct_payment(&recipient, &payment);

// Using direct_kda (same result)
self.send().direct_kda(
    &recipient,
    &payment.token_identifier,
    payment.token_nonce,
    &payment.amount
);
\`\`\`

### Complete Example: Creating and Sending Payment
\`\`\`rust
#[endpoint]
fn send_fee(&self, recipient: ManagedAddress, fee_amount: BigUint) {
    // Create payment
    let payment = KdaTokenPayment::new(
        TokenIdentifier::klv(),
        0,
        fee_amount
    );

    // Send it
    self.send().direct_payment(&recipient, &payment);

    // Or create and send in one operation
    self.send().direct_kda(
        &recipient,
        &TokenIdentifier::from(&b"BTC-F3E4"[..]),
        0u64,
        &BigUint::from(100u32)
    );
}
\`\`\``,
    {
      title: 'KdaTokenPayment Structure and Usage',
      description: 'How to use KdaTokenPayment for handling all token types in Klever',
      tags: ['payment', 'tokens', 'transfer', 'kda', 'nft', 'sft'],
      language: 'rust',
      relevanceScore: 0.9,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // CRITICAL: Token Types Clarification
  createKnowledgeEntry(
    'best_practice',
    `# CRITICAL: Token Types Clarification - KLV vs KDA Payments

## Understanding Klever Token Types

### KLV (Native Token)
- **Type**: Native blockchain token
- **Usage**: Gas fees, staking, governance
- **Payment Method**: Use \`#[payable("KLV")]\`
- **Access**: \`self.call_value().klv_value()\`
- **Decimals**: Always 6 decimals (1 KLV = 1,000,000 units)

### KFI (Klever Finance Token)
- **Type**: Built-in token (similar to native)
- **Usage**: DeFi operations, rewards
- **Payment Method**: Use \`#[payable("*")]\` and check token identifier
- **Access**: \`self.call_value().single_kda()\` then verify token ID
- **Decimals**: Always 6 decimals (1 KFI = 1,000,000 units)

### KDA (Klever Digital Assets)
- **Type**: Custom tokens created on Klever
- **Usage**: Custom tokens, NFTs, SFTs
- **Payment Method**: Use \`#[payable("*")]\`
- **Access**: \`self.call_value().single_kda()\`
- **Decimals**: Varies by token (defined at creation)

## Code Examples

### Accepting Only KLV
\`\`\`rust
#[payable("KLV")]
#[endpoint]
fn deposit_klv(&self) {
    let klv_amount = self.call_value().klv_value();
    // klv_amount is BigUint in smallest units (6 decimals)
}
\`\`\`

### Accepting Only KFI
\`\`\`rust
#[payable("*")]
#[endpoint]
fn deposit_kfi(&self) {
    let payment = self.call_value().single_kda();
    require!(
        payment.token_identifier == TokenIdentifier::from("KFI"),
        "Only KFI accepted"
    );
    let kfi_amount = payment.amount;
    // kfi_amount is BigUint in smallest units (6 decimals)
}
\`\`\`

### Accepting Any Token
\`\`\`rust
#[payable("*")]
#[endpoint]
fn deposit_any_token(&self) {
    let payment = self.call_value().single_kda();
    
    if payment.token_identifier == TokenIdentifier::klv() {
        // Handle KLV payment
        self.handle_klv_payment(payment.amount);
    } else if payment.token_identifier == TokenIdentifier::from("KFI") {
        // Handle KFI payment
        self.handle_kfi_payment(payment.amount);
    } else {
        // Handle other KDA tokens
        self.handle_kda_payment(&payment);
    }
}
\`\`\`

### Multiple Payment Types
\`\`\`rust
#[payable("*")]
#[endpoint]
fn deposit_multiple(&self) {
    let payments = self.call_value().all_kda_transfers();
    
    for payment in &payments {
        if payment.token_identifier == TokenIdentifier::klv() {
            self.klv_balance().update(|balance| *balance += &payment.amount);
        } else if payment.token_identifier == TokenIdentifier::from("KFI") {
            self.kfi_balance().update(|balance| *balance += &payment.amount);
        } else {
            // Handle other tokens
            self.token_balances(&payment.token_identifier)
                .update(|balance| *balance += &payment.amount);
        }
    }
}
\`\`\`

## Key Differences Summary

| Aspect | KLV | KFI | KDA Tokens |
|--------|-----|-----|------------|
| Type | Native | Built-in | Custom |
| Payable | \`"KLV"\` | \`"*"\` + check | \`"*"\` |
| Access | \`.klv_value()\` | \`.single_kda()\` | \`.single_kda()\` |
| Decimals | Always 6 | Always 6 | Variable |
| Gas Fees | Yes | No | No |

## Critical Notes
1. **KLV vs KFI**: Both have 6 decimals, but different access patterns
2. **Token Verification**: Always verify token identifier for non-KLV payments  
3. **Multiple Payments**: Use \`all_kda_transfers()\` for multiple tokens
4. **Gas Considerations**: Only KLV can pay gas fees`,
    {
      title: 'Token Types Clarification - KLV vs KDA Payments',
      description: 'Critical differences between KLV, KFI, and KDA token types in payments',
      tags: ['tokens', 'klv', 'kfi', 'kda', 'payments', 'critical', 'types'],
      language: 'rust',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Working with KLV/KFI Decimals
  createKnowledgeEntry(
    'best_practice',
    `# Working with KLV/KFI Decimals

## The 6-Decimal Rule

Both KLV and KFI use exactly 6 decimal places:
- 1 KLV = 1,000,000 units
- 1 KFI = 1,000,000 units

## Smart Contract Patterns

### Constants Definition
\`\`\`rust
const KLV_DECIMALS: u32 = 6;
const KFI_DECIMALS: u32 = 6;
const KLV_UNITS_PER_TOKEN: u64 = 1_000_000;
const KFI_UNITS_PER_TOKEN: u64 = 1_000_000;
\`\`\`

### Conversion Functions
\`\`\`rust
#[klever_sc::contract]
pub trait TokenConverter {
    // Convert display amount to contract units
    fn tokens_to_units(&self, tokens: u64, decimals: u32) -> BigUint {
        let multiplier = BigUint::from(10u32).pow(decimals);
        BigUint::from(tokens) * multiplier
    }
    
    // Convert contract units to display amount
    fn units_to_tokens(&self, units: &BigUint, decimals: u32) -> BigUint {
        let divisor = BigUint::from(10u32).pow(decimals);
        units / divisor
    }
    
    // KLV-specific helpers
    fn klv_to_units(&self, klv_amount: u64) -> BigUint {
        self.tokens_to_units(klv_amount, KLV_DECIMALS)
    }
    
    fn units_to_klv(&self, units: &BigUint) -> BigUint {
        self.units_to_tokens(units, KLV_DECIMALS)
    }
}
\`\`\`

### Validation Patterns
\`\`\`rust
#[payable("KLV")]
#[endpoint]
fn stake(&self) {
    let payment = self.call_value().klv_value();
    
    // Validate minimum stake (1 KLV)
    require!(
        payment >= KLV_UNITS_PER_TOKEN,
        "Minimum stake is 1 KLV"
    );
    
    // Validate maximum stake (1000 KLV)  
    require!(
        payment <= 1000 * KLV_UNITS_PER_TOKEN,
        "Maximum stake is 1000 KLV"
    );
    
    self.user_stake(&self.blockchain().get_caller()).set(&payment);
}
\`\`\`

### Display Formatting
\`\`\`rust
#[view]
fn get_formatted_balance(&self, user: ManagedAddress) -> ManagedBuffer {
    let balance_units = self.user_balance(&user).get();
    
    // Convert to display format (divide by 1,000,000)
    let whole_tokens = &balance_units / KLV_UNITS_PER_TOKEN;
    let fractional_part = &balance_units % KLV_UNITS_PER_TOKEN;
    
    // Format as "X.XXXXXX KLV"
    let mut result = ManagedBuffer::new();
    result.append(&whole_tokens.to_bytes_be());
    result.append(b".");
    
    // Pad fractional part to 6 digits
    let frac_str = fractional_part.to_bytes_be();
    // Padding logic would go here...
    
    result.append(b" KLV");
    result
}
\`\`\`

## Common Validation Patterns

### Minimum Amount Check
\`\`\`rust
fn require_minimum_klv(&self, amount: &BigUint, minimum_klv: u64) {
    let minimum_units = BigUint::from(minimum_klv * KLV_UNITS_PER_TOKEN);
    require!(amount >= &minimum_units, "Amount below minimum");
}
\`\`\`

### Percentage Calculations
\`\`\`rust
fn calculate_fee(&self, amount: &BigUint, fee_percentage: u64) -> BigUint {
    // fee_percentage is in basis points (1% = 100)
    (amount * fee_percentage) / 10_000u64
}

fn calculate_reward(&self, stake: &BigUint, apy_percentage: u64, days: u64) -> BigUint {
    // APY calculation: stake * (apy/100) * (days/365)
    let yearly_reward = (stake * apy_percentage) / 100u64;
    (yearly_reward * days) / 365u64
}
\`\`\`

## Testing with Decimals
\`\`\`rust
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_klv_conversions() {
        let one_klv = 1_000_000u64;
        let half_klv = 500_000u64;
        
        assert_eq!(BigUint::from(one_klv), BigUint::from(1u64 * KLV_UNITS_PER_TOKEN));
        assert_eq!(BigUint::from(half_klv), BigUint::from(5u64 * (KLV_UNITS_PER_TOKEN / 10)));
    }
}
\`\`\``,
    {
      title: 'Working with KLV/KFI Decimals',
      description: 'Best practices for handling KLV/KFI decimal conversions in smart contracts',
      tags: ['klv', 'kfi', 'decimals', 'conversion', 'validation', 'formatting'],
      language: 'rust',
      relevanceScore: 0.9,
      contractType: 'any', 
      author: 'klever-mcp',
    }
  ),
];

// Export all entries as default
export default klvKfiKnowledge;