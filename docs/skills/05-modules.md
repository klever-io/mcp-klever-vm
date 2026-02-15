# Modules

## Admin Module (Built-in)

Do NOT create a custom admin module. Use the SDK's built-in module:

### Cargo.toml

```toml
[dependencies.klever-sc-modules]
version = "0.45.0"  # use latest from crates.io
```

### Usage

```rust
#![no_std]
use klever_sc::imports::*;
use klever_sc_modules::only_admin;

#[klever_sc::contract]
pub trait MyContract: only_admin::OnlyAdminModule {
    #[init]
    fn init(&self) {
        let caller = self.blockchain().get_caller();
        self.add_admin(caller);
    }

    #[only_admin]
    #[endpoint]
    fn admin_only_action(&self) {
        // Only callable by admin addresses
    }

    #[only_owner]
    #[endpoint]
    fn add_new_admin(&self, address: ManagedAddress) {
        self.add_admin(address);
    }
}
```

## Pause Module (Built-in)

```rust
use klever_sc_modules::pause;

#[klever_sc::contract]
pub trait MyContract: pause::PauseModule {
    #[endpoint]
    fn do_something(&self) {
        self.require_not_paused();
        // ... logic
    }

    // IMPORTANT: Allow withdrawals even when paused
    #[endpoint]
    fn emergency_withdraw(&self) {
        // Don't check pause status for safety-critical operations
        let caller = self.blockchain().get_caller();
        let balance = self.balance(&caller).get();
        self.send().direct_klv(&caller, &balance);
    }
}
```

## Combining Modules

```rust
#[klever_sc::contract]
pub trait MyContract:
    only_admin::OnlyAdminModule
    + pause::PauseModule
{
    #[init]
    fn init(&self) {
        let caller = self.blockchain().get_caller();
        self.add_admin(caller);
    }

    #[only_admin]
    #[endpoint]
    fn pause_contract(&self) {
        self.set_paused(true);
    }

    #[only_admin]
    #[endpoint]
    fn unpause_contract(&self) {
        self.set_paused(false);
    }
}
```
