# Smart Contracts

## Contract Structure

Every Klever smart contract follows this structure:

```rust
#![no_std]
use klever_sc::imports::*;

#[klever_sc::contract]
pub trait MyContract {
    #[init]
    fn init(&self) {}

    #[upgrade]
    fn upgrade(&self) {}

    // State-changing functions
    #[endpoint]
    fn my_endpoint(&self, arg: u64) { /* ... */ }

    // Read-only functions
    #[view(getMyValue)]
    fn get_my_value(&self) -> u64 { /* ... */ }

    // Storage declarations
    #[storage_mapper("myValue")]
    fn my_value(&self) -> SingleValueMapper<u64>;
}
```

## Annotations

| Annotation | Purpose | State Change |
|---|---|---|
| `#[init]` | Constructor, called once on deploy | Yes |
| `#[upgrade]` | Called on contract upgrade | Yes |
| `#[endpoint]` | Public state-changing function | Yes |
| `#[view(name)]` | Public read-only function | No |
| `#[only_owner]` | Restricts to contract owner | — |
| `#[only_admin]` | Restricts to admin (needs module) | — |
| `#[payable("KLV")]` | Accepts KLV payments | — |
| `#[payable("*")]` | Accepts any token payment | — |

## Custom Structs with Managed Types

Any struct containing managed types MUST have a type parameter:

```rust
#[derive(TopEncode, TopDecode, NestedEncode, NestedDecode, TypeAbi, ManagedVecItem)]
pub struct UserInfo<M: ManagedTypeApi> {
    pub address: ManagedAddress<M>,
    pub balance: BigUint<M>,
    pub name: ManagedBuffer<M>,
}
```

In function signatures, use `Self::Api`:

```rust
#[view(getUserInfo)]
fn get_user_info(&self, addr: ManagedAddress) -> UserInfo<Self::Api> {
    // ...
}
```

## Error Handling

```rust
#[endpoint]
fn withdraw(&self, amount: BigUint) {
    let caller = self.blockchain().get_caller();
    let balance = self.balance(&caller).get();

    require!(amount > 0, "Amount must be positive");
    require!(balance >= amount, "Insufficient balance");

    self.balance(&caller).update(|b| *b -= &amount);
    self.send().direct_klv(&caller, &amount);
}
```

## Optional Parameters

Use `OptionalValue<T>` for optional endpoint parameters:

```rust
#[endpoint]
fn set_config(&self, value: u64, label: OptionalValue<ManagedBuffer>) {
    let label = label.into_option().unwrap_or_default();
    // ...
}
```
