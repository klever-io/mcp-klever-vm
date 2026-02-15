# Tokens & Payments

## KLV and KFI

- **KLV** (Klever): Native token, **6 decimal places** (1 KLV = 1,000,000 units)
- **KFI** (Klever Finance): Governance token, **6 decimal places**
- **KDA** (Klever Digital Assets): Custom tokens on Klever

Amount conversions:
- 1 KLV = `1_000_000` (10^6)
- 0.5 KLV = `500_000`
- 100 KLV = `100_000_000`

## Receiving Payments

```rust
// Accept KLV only
#[payable("KLV")]
#[endpoint]
fn deposit_klv(&self) {
    let payment = self.call_value().klv_value();
    let caller = self.blockchain().get_caller();
    self.balance(&caller).update(|b| *b += &*payment);
}

// Accept any single token
#[payable("*")]
#[endpoint]
fn deposit_token(&self) {
    let payment = self.call_value().single_kda();
    // payment.token_identifier, payment.token_nonce, payment.amount
}

// Accept multiple payments
#[payable("*")]
#[endpoint]
fn multi_deposit(&self) {
    let payments = self.call_value().all_kda_transfers();
    for payment in payments.iter() {
        // process each payment
    }
}
```

## Sending Tokens

```rust
// Send KLV
self.send().direct_klv(&recipient, &amount);

// Send KDA token
self.send().direct_kda(
    &recipient,
    &token_id,
    token_nonce,
    &amount,
);

// Transfer from contract balance
self.send().direct(
    &recipient,
    &KlvOrKdaTokenIdentifier::kda(token_id),
    nonce,
    &amount,
);
```

## Token Identifier

```rust
// Check if payment is KLV
let token = self.call_value().klv_or_single_kda();
if token.token_identifier.is_klv() {
    // KLV payment
} else {
    // KDA payment
    let kda_id = token.token_identifier.into_kda_option().unwrap();
}
```
