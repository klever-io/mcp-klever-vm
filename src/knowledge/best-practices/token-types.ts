import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * Token type best practices and clarifications
 */

export const tokenTypesBestPractices: KnowledgeEntry[] = [
  // Token Types Clarification
  createKnowledgeEntry(
    'best_practice',
    `# 🎯 CRITICAL: KlvTokenPayment vs KdaTokenPayment vs TokenIdentifier

## ⚠️ Common Confusion Points

Many developers get confused between these three. Here's the definitive guide:

### Quick Reference Table

| Type | Purpose | When to Use | Example |
|------|---------|-------------|---------|
| \`TokenIdentifier\` | Token ID only | Identifying tokens | \`TokenIdentifier::klv()\` |
| \`KlvTokenPayment\` | KLV amount only | KLV payments | \`self.call_value().klv_value()\` |
| \`KdaTokenPayment\` | KDA token + amount + nonce | KDA/NFT/SFT payments | \`self.call_value().single_kda()\` |

## 1. TokenIdentifier - Just the ID

\`\`\`rust
// ✅ Use for token identification
let klv_id = TokenIdentifier::klv();
let kda_id = TokenIdentifier::from(&b"USDT-A1B2"[..]);

// ✅ Checking what token was sent
if payment.token_identifier == TokenIdentifier::klv() {
    // Handle KLV
}

// ✅ Getting contract balance of specific token
let balance = self.blockchain().get_sc_balance(&token_id, 0);
\`\`\`

## 2. KlvTokenPayment - KLV Amount Only

\`\`\`rust
#[payable("KLV")]
#[endpoint]
fn deposit_klv(&self) {
    // ✅ Get KLV payment amount
    let klv_amount = self.call_value().klv_value();
    
    require!(*klv_amount > 0, "Must send KLV");
    
    // klv_amount is BigUint - the amount of KLV sent
    self.klv_balance().update(|balance| *balance += &klv_amount);
}
\`\`\`

## 3. KdaTokenPayment - Full KDA Info

\`\`\`rust
#[derive(Clone)]
pub struct KdaTokenPayment<M: ManagedTypeApi> {
    pub token_identifier: TokenIdentifier<M>,
    pub token_nonce: u64,
    pub amount: BigUint<M>,
}
\`\`\`

### Using KdaTokenPayment

\`\`\`rust
#[payable("*")]
#[endpoint]
fn deposit_tokens(&self) {
    let payments = self.call_value().all_kda_transfers();
    
    for payment in &payments {
        // ✅ Access all payment info
        let token_id = &payment.token_identifier;
        let nonce = payment.token_nonce;
        let amount = &payment.amount;
        
        if *token_id == TokenIdentifier::klv() {
            // Handle KLV
        } else {
            // Handle KDA token
            self.token_balance(token_id).update(|bal| *bal += amount);
        }
    }
}

#[payable("*")]
#[endpoint]
fn single_token_deposit(&self) {
    // ✅ Get single KDA payment
    let payment = self.call_value().single_kda();
    
    require!(
        payment.token_identifier != TokenIdentifier::klv(),
        "Only KDA tokens accepted"
    );
    
    // Now you have: payment.token_identifier, payment.token_nonce, payment.amount
}
\`\`\`

## Common Mistakes to Avoid

### ❌ Wrong: Using KlvTokenPayment for KDA
\`\`\`rust
// This will NOT work for KDA tokens
let payment = self.call_value().klv_value();  // Only works for KLV!
\`\`\`

### ❌ Wrong: Using single_kda() for KLV
\`\`\`rust
// This will fail if user sends KLV
let payment = self.call_value().single_kda();  // Excludes KLV
\`\`\`

### ✅ Correct: Handle Both KLV and KDA
\`\`\`rust
#[payable("*")]
#[endpoint]
fn universal_deposit(&self) {
    let klv_amount = self.call_value().klv_value();
    let kda_payments = self.call_value().all_kda_transfers();
    
    // Handle KLV
    if *klv_amount > 0 {
        self.process_klv_payment(&klv_amount);
    }
    
    // Handle KDA tokens
    for payment in &kda_payments {
        self.process_kda_payment(&payment);
    }
}
\`\`\`

## Payment Method Selection Guide

### Use \`klv_value()\` when:
- Only accepting KLV
- Need just the KLV amount
- Simple KLV-only endpoints

### Use \`single_kda()\` when:
- Accepting exactly one KDA token
- Need token ID, nonce, and amount
- NFT/SFT transactions

### Use \`all_kda_transfers()\` when:
- Accepting multiple tokens
- Need to iterate through payments
- Complex multi-token logic

### Use both when:
- Universal payment endpoints
- Need to handle KLV + KDA together
- Maximum flexibility

## Real-World Examples

### KLV Staking
\`\`\`rust
#[payable("KLV")]
#[endpoint]
fn stake(&self) {
    let stake_amount = self.call_value().klv_value();
    // Only works with KLV, perfect for staking
}
\`\`\`

### NFT Marketplace
\`\`\`rust
#[payable("*")]
#[endpoint]
fn list_nft(&self, price: BigUint) {
    let nft = self.call_value().single_kda();
    require!(nft.token_nonce > 0, "Must be NFT");
    // Gets full NFT info including nonce
}
\`\`\`

### Multi-Token DEX
\`\`\`rust
#[payable("*")]
#[endpoint]
fn add_liquidity(&self) {
    let klv_amount = self.call_value().klv_value();
    let tokens = self.call_value().all_kda_transfers();
    // Handles both KLV and KDA tokens
}
\`\`\``,
    {
      title: 'Token Types Clarification - KLV vs KDA Payments',
      description: 'Clear guide to understanding KlvTokenPayment, KdaTokenPayment, and TokenIdentifier usage',
      tags: ['tokens', 'payment', 'klv', 'kda', 'types', 'best-practice'],
      language: 'rust',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Payment Validation Best Practices
  createKnowledgeEntry(
    'best_practice',
    `# Payment Validation Best Practices

## Universal Payment Validation Pattern

\`\`\`rust
#[payable("*")]
#[endpoint(receivePayment)]
fn receive_payment(&self) {
    let klv_amount = self.call_value().klv_value();
    let kda_payments = self.call_value().all_kda_transfers();
    
    // Validate total payments
    require!(*klv_amount > 0 || !kda_payments.is_empty(), "No payment received");
    
    // Process KLV if sent
    if *klv_amount > 0 {
        self.process_klv_deposit(&klv_amount);
    }
    
    // Process each KDA token
    for payment in &kda_payments {
        self.validate_kda_payment(&payment);
        self.process_kda_deposit(&payment);
    }
}

fn validate_kda_payment(&self, payment: &KdaTokenPayment<Self::Api>) {
    require!(payment.amount > 0, "Payment amount must be positive");
    
    // Check if token is accepted
    require!(
        self.accepted_tokens().contains(&payment.token_identifier),
        "Token not accepted"
    );
    
    // Additional validations based on token type
    if payment.token_nonce > 0 {
        // NFT/SFT specific validation
        require!(payment.amount == 1, "NFTs must have amount = 1");
    }
}
\`\`\`

## Token-Specific Endpoints

### KLV-Only Endpoints
\`\`\`rust
#[payable("KLV")]
#[endpoint(depositKlv)]
fn deposit_klv(&self) {
    let amount = self.call_value().klv_value();
    require!(*amount >= self.min_deposit().get(), "Below minimum");
    
    let caller = self.blockchain().get_caller();
    self.klv_deposits(&caller).update(|deposit| *deposit += &amount);
}
\`\`\`

### Single Token Endpoints
\`\`\`rust
#[payable("*")]
#[endpoint(depositSingleToken)]
fn deposit_single_token(&self) {
    let payment = self.call_value().single_kda();
    
    require!(payment.amount > 0, "Amount must be positive");
    require!(
        self.supported_tokens().contains(&payment.token_identifier),
        "Unsupported token"
    );
    
    let caller = self.blockchain().get_caller();
    self.token_deposits(&caller, &payment.token_identifier)
        .update(|balance| *balance += &payment.amount);
}
\`\`\`

## Multi-Payment Validation

\`\`\`rust
#[payable("*")]
#[endpoint(swapTokens)]
fn swap_tokens(&self) {
    let payments = self.call_value().all_kda_transfers();
    require!(payments.len() == 2, "Must send exactly 2 different tokens");
    
    let token_a = &payments.get(0);
    let token_b = &payments.get(1);
    
    require!(
        token_a.token_identifier != token_b.token_identifier,
        "Must be different tokens"
    );
    
    // Validate both tokens are in trading pairs
    require!(
        self.trading_pairs().contains(&(
            &token_a.token_identifier, 
            &token_b.token_identifier
        )),
        "Trading pair not supported"
    );
}
\`\`\`

## Error Handling Patterns

\`\`\`rust
fn validate_payment_requirements(&self) -> SCResult<()> {
    let klv_value = self.call_value().klv_value();
    let kda_payments = self.call_value().all_kda_transfers();
    
    // Check minimum requirements
    if *klv_value == 0 && kda_payments.is_empty() {
        return sc_error!("No payment received");
    }
    
    // Validate each KDA payment
    for payment in &kda_payments {
        if payment.amount == 0 {
            return sc_error!("Zero amount payment not allowed");
        }
        
        if !self.is_token_accepted(&payment.token_identifier) {
            return sc_error!("Token not accepted: {}", payment.token_identifier);
        }
    }
    
    Ok(())
}
\`\`\``,
    {
      title: 'Payment Validation Best Practices',
      description: 'Comprehensive patterns for validating KLV and KDA token payments',
      tags: ['payment', 'validation', 'best-practice', 'security', 'klv', 'kda'],
      language: 'rust',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),
];

export default tokenTypesBestPractices;