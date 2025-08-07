import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * API and reference documentation
 */

export const apiReferenceKnowledge: KnowledgeEntry[] = [
  // Contract and Module Annotation Rules
  createKnowledgeEntry(
    'documentation',
    `# Klever Contract and Module Annotations

## Contract Annotation
- \`#[klever_sc::contract]\`: Essential for traits defining contract endpoints and logic
- Each crate should contain only ONE contract trait
- Does not accept any additional arguments

## Module Annotation
- \`#[klever_sc::module]\`: Designates a trait as a smart contract module
- Does not require any extra arguments
- Module and trait names should use PascalCase (e.g., \`pub trait UserManager\`)

## Important Rules:
1. A Rust module can only contain ONE contract, module, or proxy annotation
2. Multiple annotations must be in separate \`mod module_name { ... }\` declarations
3. Always use PascalCase for module and trait names, not snake_case`,
    {
      title: 'Contract and Module Annotation Rules',
      description: 'Guidelines for using contract and module annotations in Klever smart contracts',
      tags: ['annotations', 'contract', 'module', 'rules'],
      language: 'rust',
      relevanceScore: 0.85,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Klever VM API Reference
  createKnowledgeEntry(
    'documentation',
    `# Klever VM API Reference

## Core Blockchain API Methods

### Account Information
\`\`\`rust
// Get caller address
let caller = self.blockchain().get_caller();

// Get contract owner
let owner = self.blockchain().get_owner_address();

// Get current contract address  
let contract_addr = self.blockchain().get_sc_address();

// Get contract's own KLV balance
let klv_balance = self.blockchain().get_sc_balance(
    &TokenIdentifier::klv(),
    0
);

// Get contract's own KDA token balance
let token_balance = self.blockchain().get_sc_balance(
    &token_identifier,
    nonce
);

// Get KDA token balance of any address
let address_token_balance = self.blockchain().get_kda_balance(
    &address,
    &token_identifier,
    nonce
);

// Get KLV balance of any address
let address_klv_balance = self.blockchain().get_kda_balance(
    &address,
    &TokenIdentifier::klv(),
    0
);
\`\`\`

### Block Information
\`\`\`rust
// Get current block timestamp
let timestamp = self.blockchain().get_block_timestamp();

// Get current block nonce
let block_nonce = self.blockchain().get_block_nonce();

// Get current block round
let round = self.blockchain().get_block_round();

// Get current epoch
let epoch = self.blockchain().get_block_epoch();
\`\`\`

### Transaction Information
\`\`\`rust
// Get current transaction hash
let tx_hash = self.blockchain().get_tx_hash();

// Get gas left
let gas_left = self.blockchain().get_gas_left();
\`\`\`

### Contract Interaction
\`\`\`rust
// Check if address is smart contract
let is_contract = self.blockchain().is_smart_contract(&address);

// Check if caller is contract owner
let caller = self.blockchain().get_caller();
let is_owner = caller == self.blockchain().get_owner_address();

// Common pattern: require owner
require!(
    self.blockchain().get_caller() == self.blockchain().get_owner_address(),
    "Only owner can perform this action"
);
\`\`\`

## Payment API

### KLV Payments
\`\`\`rust
// Get KLV payment amount
let klv_amount = self.call_value().klv_value();

// Check if any KLV was sent
let has_klv_payment = *klv_amount > 0;
\`\`\`

### KDA Token Payments
\`\`\`rust
// Get all KDA payments
let kda_payments = self.call_value().all_kda_transfers();

// Get single KDA payment
let payment = self.call_value().single_kda();

// Access payment properties
let token_id = &payment.token_identifier;
let nonce = payment.token_nonce;
let amount = &payment.amount;
\`\`\`

### Multi-Token Payments
\`\`\`rust
// Get all payments (KLV + KDA)
let klv_amount = self.call_value().klv_value();
let kda_payments = self.call_value().all_kda_transfers();

// Check total payment count
let payment_count = if *klv_amount > 0 { 1 } else { 0 } + kda_payments.len();
\`\`\`

## Send API

### Direct Transfers
\`\`\`rust
// Send KLV
self.send().direct_klv(&recipient, &amount);

// Send KDA token
self.send().direct_kda(&recipient, &token_id, nonce, &amount);

// Send multiple tokens
self.send().direct_multi(&recipient, &payments);
\`\`\`

### Contract Calls
\`\`\`rust
// Simple contract call
self.send()
    .contract_call::<()>(contract_address, "functionName")
    .with_klv_transfer(amount)
    .call();

// Contract call with arguments
self.send()
    .contract_call::<BigUint>(contract_address, "getBalance")
    .with_argument(&user_address)
    .call();
\`\`\`

### Token Operations
\`\`\`rust
// Issue KDA token
let token_id = self.send().kda_issue(
    &token_name,
    &ticker,
    &initial_supply,
    &max_supply,
    decimals,
    &token_type,
);

// Mint tokens (requires roles)
self.send().kda_mint(&token_id, nonce, &amount);

// Burn tokens
self.send().kda_burn(&token_id, nonce, &amount);

// Create NFT
let nft_nonce = self.send().kda_nft_create(
    &token_id,
    &amount,
    &name,
    &royalties,
    &hash,
    &uri,
    &attributes,
);
\`\`\`

## Crypto API

### Hashing
\`\`\`rust
// Keccak256 hash
let hash = self.crypto().keccak256(&data);

// SHA256 hash  
let hash = self.crypto().sha256(&data);

// Blake2b hash
let hash = self.crypto().blake2b(&data);
\`\`\`

### Signature Verification
\`\`\`rust
// Verify Ed25519 signature
let is_valid = self.crypto().verify_ed25519(
    &public_key,
    &message,
    &signature,
);

// Verify secp256k1 signature
let is_valid = self.crypto().verify_secp256k1(
    &public_key, 
    &message,
    &signature,
);
\`\`\`

### Elliptic Curves
\`\`\`rust
// Generate key pair
let (private_key, public_key) = self.crypto().generate_key_pair();

// Encode points
let encoded = self.crypto().elliptic_curve_get_values(&points);
\`\`\`

## Random Number Generation

\`\`\`rust
// Create randomness source
let mut rand_source = RandomnessSource::new();

// Generate random numbers
let random_u32 = rand_source.next_u32();
let random_u64 = rand_source.next_u64(); 
let random_bytes = rand_source.next_bytes(32);

// Random in range
let dice_roll = (rand_source.next_u32() % 6) + 1;
\`\`\`

## Error Handling

\`\`\`rust
// Input validation
require!(condition, "Error message");

// Signal critical errors
sc_panic!("Critical error occurred");

// Custom error types
sc_error!("Custom error: {}", value);
\`\`\``,
    {
      title: 'Klever VM API Reference',
      description: 'Comprehensive API reference for Klever smart contract development',
      tags: ['api', 'reference', 'blockchain', 'payment', 'crypto', 'documentation'],
      language: 'rust',
      relevanceScore: 0.9,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Working with KLV/KFI Decimals  
  createKnowledgeEntry(
    'documentation',
    `# Working with KLV/KFI Decimals

## Critical Information
- **KLV: ALWAYS 6 decimals** (1 KLV = 1,000,000 units)
- **KFI: ALWAYS 6 decimals** (1 KFI = 1,000,000 units)

## Conversion Examples in Smart Contracts

### Basic Conversions
\`\`\`rust
// Constants for decimal conversion
const DECIMALS: u64 = 1_000_000; // 6 decimals

// Convert whole KLV to units
let one_klv = BigUint::from(DECIMALS);           // 1 KLV
let ten_klv = BigUint::from(10u64 * DECIMALS);   // 10 KLV  
let half_klv = BigUint::from(DECIMALS / 2);      // 0.5 KLV

// Fractional amounts
// 0.1 KLV = 100,000 units
let tenth_klv = BigUint::from(100_000u64);
// 0.01 KLV = 10,000 units  
let hundredth_klv = BigUint::from(10_000u64);
// 0.001 KLV = 1,000 units
let one_milliKLV = BigUint::from(1_000u32);

// For very large amounts, use u64 or u128
let thousand_klv = BigUint::from(1_000_000_000u64); // 1000 KLV
let million_klv = BigUint::from(1_000_000_000_000u128); // 1,000,000 KLV
\`\`\`

### Practical Examples in Smart Contracts

\`\`\`rust
#[klever_sc::contract]
pub trait TokenContract {
    // Constant for decimal conversion
    const DECIMALS: u64 = 1_000_000; // 10^6 for 6 decimals

    #[payable("KLV")]
    #[endpoint]
    fn deposit(&self) {
        let payment = self.call_value().klv_value();
        let caller = self.blockchain().get_caller();

        // Check minimum deposit of 1 KLV
        require!(payment >= BigUint::from(Self::DECIMALS), "Minimum deposit is 1 KLV");

        // Store the deposit
        self.user_balance(&caller).update(|balance| *balance += payment);

        // Event showing both raw and human-readable amounts
        let klv_amount = &payment / Self::DECIMALS; // Integer division for display
        self.deposit_event(&caller, &payment, klv_amount.to_u64().unwrap_or(0));
    }

    #[endpoint]
    fn withdraw_klv(&self, klv_amount: u64) {
        let caller = self.blockchain().get_caller();

        // Convert KLV amount to smallest units
        let amount_in_units = BigUint::from(klv_amount) * Self::DECIMALS;

        // Check balance
        let balance = self.user_balance(&caller).get();
        require!(balance >= amount_in_units, "Insufficient balance");

        // Update balance and send
        self.user_balance(&caller).update(|b| *b -= &amount_in_units);
        self.send().direct_klv(&caller, &amount_in_units);
    }

    // Helper function to convert units to KLV
    #[view]
    fn units_to_klv(&self, units: BigUint) -> u64 {
        (&units / Self::DECIMALS).to_u64().unwrap_or(0)
    }

    // Helper function to convert KLV to units
    #[view]
    fn klv_to_units(&self, klv: u64) -> BigUint {
        BigUint::from(klv) * Self::DECIMALS
    }

    // Storage
    #[storage_mapper("user_balance")]
    fn user_balance(&self, user: &ManagedAddress) -> SingleValueMapper<BigUint>;

    // Events
    #[event("deposit")]
    fn deposit_event(
        &self,
        #[indexed] user: &ManagedAddress,
        #[indexed] amount_units: &BigUint,
        #[indexed] amount_klv: u64
    );
}
\`\`\`

### Common Patterns for Minimum/Maximum Amounts

\`\`\`rust
// Define constants for common amounts
const MIN_BET: u64 = 10_000_000;      // 10 KLV
const MAX_BET: u64 = 1_000_000_000;   // 1000 KLV
const HOUSE_FEE: u64 = 100_000;       // 0.1 KLV

#[endpoint]
fn place_bet(&self, bet_number: u8) {
    let bet_amount = self.call_value().klv_value();

    // Validate bet amount
    require!(
        bet_amount >= BigUint::from(MIN_BET),
        "Minimum bet is 10 KLV"
    );
    require!(
        bet_amount <= BigUint::from(MAX_BET),
        "Maximum bet is 1000 KLV"
    );

    // Deduct house fee
    let net_bet = &*bet_amount - BigUint::from(HOUSE_FEE);
    
    // Game logic with net_bet...
}
\`\`\`

### In Koperator Commands:
\`\`\`bash
# Send 1 KLV
koperator sc invoke CONTRACT method --values "KLV=1000000"  # 6 zeros

# Send 10 KLV
koperator sc invoke CONTRACT method --values "KLV=10000000" # 7 zeros

# Send 0.5 KLV
koperator sc invoke CONTRACT method --values "KLV=500000"   # 5 zeros + 5
\`\`\`

### REMEMBER:
- **KLV: ALWAYS 6 decimals** (1 KLV = 1,000,000)
- **KFI: ALWAYS 6 decimals** (1 KFI = 1,000,000)
- **NOT 8, NOT 9, NOT 10, NOT 18 decimals!**
- **This is different from Ethereum** (which uses 18)
- **This is different from Bitcoin** (which uses 8)
- **When in doubt**: 1 KLV = 1 followed by 6 zeros`,
    {
      title: 'Working with KLV/KFI Decimals',
      description: 'Complete guide for handling KLV and KFI decimal conversions in smart contracts',
      tags: ['klv', 'kfi', 'decimals', 'conversion', 'units', 'documentation'],
      language: 'rust',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),
];

export default apiReferenceKnowledge;