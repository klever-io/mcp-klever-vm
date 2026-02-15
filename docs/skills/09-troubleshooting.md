# Troubleshooting

## Common Errors

### "only 1 data argument allowed in event log"

Events can have maximum ONE non-indexed parameter. Mark others with `#[indexed]`:

```rust
// Fix: add #[indexed] to all but one param
#[event("transfer")]
fn transfer_event(
    &self,
    #[indexed] from: &ManagedAddress,
    #[indexed] to: &ManagedAddress,
    amount: &BigUint,  // only non-indexed param
);
```

### "cannot find type ManagedTypeApi in this scope"

Missing import. Add:

```rust
use klever_sc::imports::*;
```

### Struct serialization errors

Custom structs with managed types need the type parameter:

```rust
// WRONG
pub struct MyData {
    address: ManagedAddress,  // Error!
}

// CORRECT
pub struct MyData<M: ManagedTypeApi> {
    address: ManagedAddress<M>,
}
```

### "signal: aborted" on BigUint subtraction

BigUint subtraction panics on underflow. Always validate:

```rust
require!(balance >= amount, "Insufficient balance");
```

### koperator "--value: unknown flag"

Use `--values` (plural), not `--value`:

```bash
# WRONG
koperator sc invoke ADDR func --value 1000000

# CORRECT
koperator sc invoke ADDR func --values "KLV=1000000" --sign --await --result-only
```

### koperator "--function: unknown flag"

Koperator uses positional arguments for contract and function:

```bash
# WRONG
koperator sc invoke --contract ADDR --function func

# CORRECT
koperator sc invoke ADDR func --sign --await --result-only
```

### Event name must use double quotes

```rust
#[event("myEvent")]    // Correct: double quotes
#[event('myEvent')]    // Wrong: single quotes - compile error
```

### RandomnessSource import error

`RandomnessSource` is already included in `klever_sc::imports::*`. Do NOT import it separately:

```rust
// WRONG
use klever_sc::api::RandomnessSource;

// CORRECT - already available via imports
use klever_sc::imports::*;
let mut rand = RandomnessSource::new();
```

## Debugging Tips

1. **Check transaction receipts**: After broadcast, check the transaction receipt for execution errors
2. **Use events**: Emit events at key points to trace execution flow
3. **Test locally first**: Use devnet/local node before mainnet
4. **Check nonce**: Failed transactions may be due to incorrect nonce
5. **Base64 arguments**: VM query args must be base64-encoded
