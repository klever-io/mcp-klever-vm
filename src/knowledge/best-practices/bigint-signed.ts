import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * BigInt (signed) handling patterns and API reference
 */

export const bigintSignedKnowledge: KnowledgeEntry[] = [
  // BigInt API Reference and Usage Patterns
  createKnowledgeEntry(
    'documentation',
    `# 📐 BigInt (Signed) - API Reference and Usage Patterns

## Overview

\`BigInt\` is a **signed** arbitrary-precision integer type managed by the Klever VM.
Use it when values can be negative (e.g., profit/loss calculations, price differences, signed deltas).

## Struct Definition

\`\`\`rust
#[repr(transparent)]
pub struct BigInt<M: ManagedTypeApi> {
    pub(crate) handle: M::BigIntHandle,
    _phantom: PhantomData<M>,
}
\`\`\`

## Sign Enum

\`\`\`rust
pub enum Sign {
    Minus,    // Negative values
    NoSign,   // Zero
    Plus,     // Positive values
}

impl Sign {
    pub fn is_minus(&self) -> bool
}
\`\`\`

## When to Use BigInt Instead of BigUint

- **Subtraction that might go negative** (BigUint aborts on negative results)
- **Price/rate changes** that can be positive or negative
- **Profit/loss accounting** in DeFi contracts
- **Signed deltas** in balance adjustments
- **Intermediate calculations** where sign matters before final absolute value

## Creation & Initialization

\`\`\`rust
// Zero value
let zero = BigInt::zero();

// From signed primitives (i8, i16, i32, i64, isize)
let positive = BigInt::from(100i64);
let negative = BigInt::from(-50i32);

// From BigUint (always treated as positive)
let unsigned = BigUint::from(100u32);
let signed = BigInt::from(unsigned);  // +100

// From signed big-endian bytes (two's complement)
let from_bytes = BigInt::from_signed_bytes_be(&[0xFF]);  // -1
let from_buffer = BigInt::from_signed_bytes_be_buffer(&managed_buffer);

// Compose from sign and magnitude
let value = BigInt::from_biguint(Sign::Minus, BigUint::from(42u32));  // -42
\`\`\`

## Conversion Methods

\`\`\`rust
let value = BigInt::from(-42i64);

// To primitive (returns Option — None if value doesn't fit)
let as_i64: Option<i64> = value.to_i64();

// To signed big-endian bytes (two's complement)
let bytes: BoxedBytes = value.to_signed_bytes_be();
let buffer: ManagedBuffer = value.to_signed_bytes_be_buffer();
\`\`\`

## Sign & Magnitude Operations

\`\`\`rust
let value = BigInt::from(-42i64);

// Get the sign
let sign: Sign = value.sign();  // Sign::Minus

// Get absolute value as BigUint
let abs: BigUint = value.magnitude();  // 42

// Decompose into sign and magnitude
let (sign, magnitude) = value.to_parts();
// sign = Sign::Minus, magnitude = BigUint(42)

// Convert to BigUint (only if non-negative)
let positive = BigInt::from(100i64);
let as_uint: ManagedOption<_, BigUint> = positive.into_big_uint();  // some(100)

let negative = BigInt::from(-100i64);
let as_uint: ManagedOption<_, BigUint> = negative.into_big_uint();  // none()

// ⚠️ Remember: Sign has three variants — don't forget zero
match value.sign() {
    Sign::Minus => { /* negative */ },
    Sign::NoSign => { /* zero */ },
    Sign::Plus => { /* positive */ },
}
\`\`\`

## Arithmetic Operators

\`\`\`rust
let a = BigInt::from(100i64);
let b = BigInt::from(-30i64);

// Addition
let sum = &a + &b;    // 70

// ✅ Subtraction (safe even when result is negative!)
let diff = &b - &a;   // -130 (no error, unlike BigUint)

// Multiplication
let prod = &a * &b;   // -3000

// Division (truncated towards zero)
let quot = &a / &b;   // -3  (100 / -30 = -3.33... → -3)

// Remainder (follows truncated division: a = (a/b)*b + (a%b))
let rem = &a % &b;    // 10  (100 - (-3)*(-30) = 10)

// Negation via Neg trait (takes ownership — a is consumed)
let neg = -a;          // -100
// Or equivalently: a.neg() — also consumes a
\`\`\`

### Compound Assignment
\`\`\`rust
let mut x = BigInt::from(100i64);
x += &BigInt::from(10i64);    // 110 (reference)
x += BigInt::from(10i64);     // 120 (owned, consumes value)
x -= &BigInt::from(200i64);   // -80
x *= &BigInt::from(-1i64);    // 80
x /= &BigInt::from(3i64);     // 26
x %= &BigInt::from(7i64);     // 5

// ⚠️ Mixed compound assignment NOT supported:
// let unsigned = BigUint::from(5u32);
// x += unsigned;  // ❌ Won't compile
// ✅ Use conversion instead:
// x += BigInt::from(unsigned);
\`\`\`

### Mixed Operations with BigUint

BigInt and BigUint can be mixed in binary operators — the result is always BigInt:

\`\`\`rust
let signed = BigInt::from(-10i64);
let unsigned = BigUint::from(5u32);

// ✅ Both directions work
let result = &signed + &unsigned;   // BigInt(-5)
let result = &unsigned + &signed;   // BigInt(-5)
let result = &unsigned - &signed;   // BigInt(15)

// Consuming (owned) also works
let result = signed + unsigned;     // BigInt(-5)
\`\`\`

## Comparison

\`\`\`rust
let a = BigInt::from(100i64);
let b = BigInt::from(-50i64);

// With other BigInt
assert!(&a > &b);
assert!(&b < &BigInt::zero());

// With i64 primitives
assert!(a > 0i64);
assert!(b < 0i64);
assert!(a == 100i64);
\`\`\`

## Power

\`\`\`rust
let base = BigInt::from(2i64);
let result = base.pow(10);  // 1024 — exponent must be u32
\`\`\`

## Practical Example: Safe Balance Difference

\`\`\`rust
#[endpoint]
fn calculate_pnl(&self, user: ManagedAddress) -> BigInt {
    let current = self.current_balance(&user).get();
    let initial = self.initial_balance(&user).get();

    // ✅ Safe: BigInt subtraction never aborts
    let current_signed = BigInt::from(current);
    let initial_signed = BigInt::from(initial);
    let pnl = &current_signed - &initial_signed;

    // Handle all three sign states
    match pnl.sign() {
        Sign::Minus => { /* User has a loss */ },
        Sign::NoSign => { /* Break even */ },
        Sign::Plus => { /* User has a profit */ },
    }

    pnl
}
\`\`\`

## Practical Example: Price Change Tracking

\`\`\`rust
#[endpoint]
fn record_price_change(&self, new_price: BigUint) {
    let old_price = self.last_price().get();

    // Calculate signed difference
    let change = BigInt::from(new_price.clone()) - BigInt::from(old_price);

    // Store the signed change
    self.price_changes().push(&change);
    self.last_price().set(&new_price);
}

#[storage_mapper("price_changes")]
fn price_changes(&self) -> VecMapper<BigInt>;
\`\`\``,
    {
      title: 'BigInt (Signed) API Reference and Patterns',
      description:
        'Complete guide for signed BigInt including when to use over BigUint, API reference, and practical examples',
      tags: [
        'bigint',
        'signed',
        'api',
        'reference',
        'negative',
        'subtraction',
        'sign',
        'magnitude',
      ],
      language: 'rust',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),
];

export default bigintSignedKnowledge;
