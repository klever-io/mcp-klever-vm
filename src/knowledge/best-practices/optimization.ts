import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * Optimization patterns and techniques
 */

export const optimizationKnowledge: KnowledgeEntry[] = [
  // OptionalValue vs Option Optimization
  createKnowledgeEntry(
    'optimization',
    `# OptionalValue vs Option - Performance Comparison

## ❌ Using Option<T> - Less Efficient
\`\`\`rust
#[endpoint(myOptArgEndpoint1)]
fn my_opt_arg_endpoint_1(&self, token_id: TokenIdentifier, opt_nonce: Option<u64>) {
    // Requires 0x01 for Some, 0x00 for None
    // Nested encoding required
    // More gas consumption
}
\`\`\`

## ✅ Using OptionalValue<T> - PREFERRED
\`\`\`rust
#[endpoint(myOptArgEndpoint2)]
fn my_opt_arg_endpoint_2(&self, token_id: TokenIdentifier, opt_nonce: OptionalValue<u64>) {
    // More efficient - presence indicates Some
    // Direct top-encoding
    // Can be omitted entirely if None
}
\`\`\`

## MultiValueEncoded Rules:
1. **Only ONE MultiValueEncoded per endpoint**
2. **Must be the LAST parameter**
3. **Used for variable number of same-type arguments**

## ❌ ManagedVec - NOT RECOMMENDED for endpoints
\`\`\`rust
#[endpoint(myVarArgsEndpoint1)]
fn my_var_args_endpoint_1(&self, args: ManagedVec<(TokenIdentifier, u64, BigUint)>) {
    // Less efficient encoding
}
\`\`\`

## ✅ MultiValueManagedVec - PREFERRED
\`\`\`rust
#[endpoint(myVarArgsEndpoint2)]  
fn my_var_args_endpoint_2(&self, args: MultiValueManagedVec<TokenIdentifier, u64, BigUint>) {
    // More gas efficient
    // Better encoding/decoding performance
}
\`\`\`

## Usage Examples

### Optional Parameters
\`\`\`rust
#[endpoint]
fn transfer_with_data(&self, 
    to: ManagedAddress, 
    amount: BigUint,
    data: OptionalValue<ManagedBuffer>  // ✅ Efficient optional parameter
) {
    // Handle optional data
    match data {
        OptionalValue::Some(buffer) => {
            // Process with data
        },
        OptionalValue::None => {
            // Simple transfer
        }
    }
}
\`\`\`

### Variable Arguments
\`\`\`rust
#[endpoint]
fn batch_transfer(&self, 
    transfers: MultiValueEncoded<MultiValue2<ManagedAddress, BigUint>>  // ✅ Efficient
) {
    for transfer in transfers.into_iter() {
        let (to, amount) = transfer.into_tuple();
        self.send().direct_klv(&to, &amount);
    }
}
\`\`\``,
    {
      title: 'OptionalValue and MultiValue Optimization',
      description: 'Performance optimizations for optional and variable arguments in endpoints',
      tags: ['optimization', 'optional', 'multivalue', 'performance', 'gas'],
      language: 'rust',
      relevanceScore: 0.9,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Gas Optimization Techniques
  createKnowledgeEntry(
    'optimization',
    `# Gas Optimization Techniques for Klever Smart Contracts

## Storage Optimization

### Use Appropriate Storage Mappers
\`\`\`rust
// ❌ Bad: Using VecMapper for unique items
#[storage_mapper("users")]
fn users(&self) -> VecMapper<ManagedAddress>;

// ✅ Good: Using SetMapper for unique items (O(1) operations)
#[storage_mapper("users")]
fn users(&self) -> SetMapper<ManagedAddress>;

// ❌ Bad: Storing full objects when only part is needed frequently
#[storage_mapper("user_data")]
fn user_data(&self) -> MapMapper<ManagedAddress, UserFullData>;

// ✅ Good: Separate frequently accessed data
#[storage_mapper("user_balance")]
fn user_balance(&self) -> MapMapper<ManagedAddress, BigUint>;
#[storage_mapper("user_metadata")]
fn user_metadata(&self) -> MapMapper<ManagedAddress, UserMetadata>;
\`\`\`

### Batch Operations
\`\`\`rust
// ❌ Bad: Multiple storage writes
#[endpoint]
fn update_multiple_bad(&self, updates: ManagedVec<(ManagedAddress, BigUint)>) {
    for update in &updates {
        let (user, amount) = update;
        let current = self.balance(&user).get();
        self.balance(&user).set(&(current + amount));
    }
}

// ✅ Good: Use update() for atomic operations
#[endpoint]
fn update_multiple_good(&self, updates: ManagedVec<(ManagedAddress, BigUint)>) {
    for update in &updates {
        let (user, amount) = update;
        self.balance(&user).update(|bal| *bal += amount);
    }
}
\`\`\`

## Computation Optimization

### Minimize BigUint Operations
\`\`\`rust
// ❌ Bad: Repeated expensive operations
#[endpoint]
fn calculate_rewards_bad(&self, user: ManagedAddress) -> BigUint {
    let base_reward = BigUint::from(100u32);
    let multiplier = self.get_multiplier(&user);
    
    // Expensive: Multiple BigUint operations
    let daily_reward = &base_reward * &multiplier;
    let weekly_reward = &daily_reward * 7u32;
    let monthly_reward = &weekly_reward * 4u32;
    
    monthly_reward
}

// ✅ Good: Combine operations
#[endpoint]
fn calculate_rewards_good(&self, user: ManagedAddress) -> BigUint {
    let base_reward = BigUint::from(100u32);
    let multiplier = self.get_multiplier(&user);
    
    // Single combined operation
    &base_reward * &multiplier * 28u32  // 7 * 4 = 28
}
\`\`\`

### Use References for BigUint
\`\`\`rust
// ❌ Bad: Cloning BigUint values
#[endpoint]
fn transfer_bad(&self, to: ManagedAddress, amount: BigUint) {
    let balance = self.balance(&self.blockchain().get_caller()).get();
    require!(balance.clone() >= amount.clone(), "Insufficient balance");
    
    let new_balance = balance - amount.clone();
    self.balance(&self.blockchain().get_caller()).set(&new_balance);
}

// ✅ Good: Use references
#[endpoint]
fn transfer_good(&self, to: ManagedAddress, amount: BigUint) {
    let caller = self.blockchain().get_caller();
    self.balance(&caller).update(|balance| {
        require!(*balance >= amount, "Insufficient balance");
        *balance -= &amount;
    });
}
\`\`\`

## Control Flow Optimization

### Early Returns
\`\`\`rust
// ❌ Bad: Deep nesting
#[endpoint]
fn complex_logic_bad(&self, value: u64) {
    if self.is_active().get() {
        if value > 0 {
            if self.has_permission(&self.blockchain().get_caller()) {
                // Main logic here
                self.process_value(value);
            }
        }
    }
}

// ✅ Good: Early returns
#[endpoint]
fn complex_logic_good(&self, value: u64) {
    require!(self.is_active().get(), "Contract not active");
    require!(value > 0, "Value must be positive");
    require!(
        self.has_permission(&self.blockchain().get_caller()),
        "No permission"
    );
    
    // Main logic at top level
    self.process_value(value);
}
\`\`\`

### Caching Frequently Used Values
\`\`\`rust
// ❌ Bad: Repeated expensive calls
#[endpoint]
fn process_multiple_bad(&self, users: ManagedVec<ManagedAddress>) {
    for user in &users {
        // Gets called multiple times
        let fee_rate = self.get_fee_rate();  // Expensive calculation
        let fee = self.balance(&user).get() * fee_rate / 10000u32;
        self.fees(&user).set(&fee);
    }
}

// ✅ Good: Cache expensive values
#[endpoint]  
fn process_multiple_good(&self, users: ManagedVec<ManagedAddress>) {
    let fee_rate = self.get_fee_rate();  // Calculate once
    
    for user in &users {
        let fee = self.balance(&user).get() * &fee_rate / 10000u32;
        self.fees(&user).set(&fee);
    }
}
\`\`\`

## Event Optimization

### Batch Events
\`\`\`rust
// ❌ Bad: Individual events for each operation
#[endpoint]
fn batch_process_bad(&self, items: ManagedVec<u64>) {
    for item in &items {
        self.process_item(item);
        self.item_processed_event(item);  // Multiple events
    }
}

// ✅ Good: Single batch event
#[endpoint]
fn batch_process_good(&self, items: ManagedVec<u64>) {
    for item in &items {
        self.process_item(item);
    }
    self.batch_processed_event(&items);  // Single event
}
\`\`\`

## Key Optimization Rules:
1. **Use appropriate storage mappers** for data access patterns
2. **Minimize BigUint operations** by combining them
3. **Use references (&)** to avoid cloning
4. **Cache expensive calculations** in loops
5. **Use early returns** instead of deep nesting
6. **Batch operations** when possible
7. **Use update() closures** for atomic storage operations`,
    {
      title: 'Gas Optimization Techniques',
      description: 'Comprehensive guide to optimizing gas usage in Klever smart contracts',
      tags: ['optimization', 'gas', 'performance', 'storage', 'best-practice'],
      language: 'rust',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),
];

export default optimizationKnowledge;