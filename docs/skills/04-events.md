# Events

## The ONE-DATA Rule

Events can have **maximum ONE non-indexed parameter**. All other parameters MUST be `#[indexed]`.

```rust
// CORRECT: one non-indexed (amount), rest indexed
#[event("transfer")]
fn transfer_event(
    &self,
    #[indexed] from: &ManagedAddress,
    #[indexed] to: &ManagedAddress,
    amount: &BigUint,       // <-- the ONE non-indexed param
);

// WRONG: two non-indexed params - COMPILE ERROR
#[event("transfer")]
fn transfer_event(
    &self,
    #[indexed] from: &ManagedAddress,
    to: &ManagedAddress,     // non-indexed
    amount: &BigUint,        // non-indexed - ERROR!
);
```

Error message: `only 1 data argument allowed in event log`

## Solutions for Multiple Data Fields

### Option 1: Make all parameters indexed

```rust
#[event("transfer")]
fn transfer_event(
    &self,
    #[indexed] from: &ManagedAddress,
    #[indexed] to: &ManagedAddress,
    #[indexed] amount: &BigUint,
);
```

### Option 2: Combine into a struct

```rust
#[derive(TopEncode)]
pub struct TransferData<M: ManagedTypeApi> {
    pub to: ManagedAddress<M>,
    pub amount: BigUint<M>,
}

#[event("transfer")]
fn transfer_event(
    &self,
    #[indexed] from: &ManagedAddress,
    data: &TransferData<Self::Api>,  // ONE data param
);
```

## Emitting Events

```rust
#[endpoint]
fn transfer(&self, to: ManagedAddress, amount: BigUint) {
    let caller = self.blockchain().get_caller();
    // ... transfer logic ...
    self.transfer_event(&caller, &to, &amount);
}
```

## Naming Convention

Use **camelCase** for event names with **double quotes**:

```rust
#[event("tokensMinted")]     // Correct
#[event("tokens_minted")]    // Wrong: snake_case
#[event('tokensMinted')]     // Wrong: single quotes
```
