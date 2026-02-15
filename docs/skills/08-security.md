# Security & Best Practices

## Critical Security Rules

### 1. Validate Before Subtracting

BigUint subtraction **aborts** on underflow. Always check first:

```rust
// CORRECT
require!(balance >= amount, "Insufficient balance");
self.balance(&user).update(|b| *b -= &amount);

// WRONG - aborts if balance < amount
self.balance(&user).update(|b| *b -= &amount);
```

### 2. Check Caller Identity

```rust
#[endpoint]
fn withdraw(&self) {
    let caller = self.blockchain().get_caller();
    // Use caller for authorization, not a user-provided address
    let balance = self.balance(&caller).get();
    require!(balance > 0, "Nothing to withdraw");
    self.balance(&caller).clear();
    self.send().direct_klv(&caller, &balance);
}
```

### 3. Emergency Withdrawals

Always allow withdrawals even when paused:

```rust
// This should NOT check pause status
#[endpoint]
fn emergency_withdraw(&self) {
    let caller = self.blockchain().get_caller();
    let balance = self.balance(&caller).get();
    self.balance(&caller).clear();
    self.send().direct_klv(&caller, &balance);
}
```

### 4. Reentrancy Prevention

Update state BEFORE external calls:

```rust
#[endpoint]
fn withdraw(&self, amount: BigUint) {
    let caller = self.blockchain().get_caller();
    let balance = self.balance(&caller).get();
    require!(balance >= amount, "Insufficient");

    // Update state FIRST
    self.balance(&caller).update(|b| *b -= &amount);

    // THEN send tokens
    self.send().direct_klv(&caller, &amount);
}
```

## Best Practices

### BigUint Arithmetic

```rust
// Use references to avoid consuming values
let total = &a + &b;
let diff = &a - &b;  // Only after require!(a >= b)

// Atomic updates with closures
self.total().update(|t| *t += &amount);
```

### Storage Optimization

- Use `SingleValueMapper` for single values (cheapest)
- Use `SetMapper` when you need uniqueness checks
- Use `MapMapper` for key-value lookups
- Cache values in local variables for repeated reads
- Use namespaced keys: `"module:variable"`

### Numeric Types

```rust
// u64 for small numbers (cheaper)
fn set_count(&self, count: u64) { /* ... */ }

// BigUint for token amounts (arbitrary precision)
fn set_amount(&self, amount: BigUint) { /* ... */ }

// Converting
let big = BigUint::from(42u64);
let small: u64 = big.to_u64().unwrap();
```

### Access Control Checklist

- Use `#[only_owner]` for owner-only functions
- Use `#[only_admin]` with the admin module for multi-admin
- Validate all user inputs with `require!`
- Never trust user-provided addresses for authorization
- Emit events for all state changes
