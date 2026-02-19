# Storage Mappers

## Available Mappers

| Mapper | Use Case | Key Features |
|---|---|---|
| `SingleValueMapper<T>` | Single value | `.get()`, `.set()`, `.update()`, `.is_empty()` |
| `VecMapper<T>` | Ordered list | `.push()`, `.get(index)`, `.len()` |
| `SetMapper<T>` | Unique sorted set | `.insert()`, `.contains()`, `.remove()` |
| `UnorderedSetMapper<T>` | Unique unsorted | Faster insert/remove than SetMapper |
| `MapMapper<K, V>` | Key-value pairs | `.insert(k, v)`, `.get(&k)`, `.contains_key(&k)` |
| `LinkedListMapper<T>` | Ordered with iteration | `.push_back()`, `.push_front()`, efficient removal |
| `UniqueIdMapper` | Auto-incrementing IDs | `.set_initial_len()`, `.next_id()` |

## Declaration Pattern

```rust
// Simple value
#[storage_mapper("totalSupply")]
fn total_supply(&self) -> SingleValueMapper<BigUint>;

// Parameterized (per-user balance)
#[storage_mapper("balance")]
fn balance(&self, addr: &ManagedAddress) -> SingleValueMapper<BigUint>;

// Map of key-value pairs
#[storage_mapper("prices")]
fn prices(&self) -> MapMapper<ManagedBuffer, BigUint>;
```

## Namespaces

Use prefixed keys for organization:

```rust
#[storage_mapper("staking:totalStaked")]
fn total_staked(&self) -> SingleValueMapper<BigUint>;

#[storage_mapper("staking:userStake")]
fn user_stake(&self, addr: &ManagedAddress) -> SingleValueMapper<BigUint>;

#[storage_mapper("config:minDeposit")]
fn min_deposit(&self) -> SingleValueMapper<BigUint>;
```

## Update Pattern (Atomic)

```rust
// Preferred: atomic update via closure
self.balance(&user).update(|b| *b += &amount);

// Avoid: separate get/set (not atomic)
let mut bal = self.balance(&user).get();
bal += &amount;
self.balance(&user).set(&bal);
```

## View Functions for Storage

```rust
#[view(getBalance)]
fn get_balance(&self, addr: ManagedAddress) -> BigUint {
    self.balance(&addr).get()
}

#[view(getAllUsers)]
fn get_all_users(&self) -> MultiValueEncoded<ManagedAddress> {
    let mut result = MultiValueEncoded::new();
    for user in self.users().iter() {
        result.push(user);
    }
    result
}

#[storage_mapper("users")]
fn users(&self) -> SetMapper<ManagedAddress>;
```
