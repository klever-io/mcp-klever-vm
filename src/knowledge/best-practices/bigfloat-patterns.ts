import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * BigFloat handling patterns and API reference
 */

export const bigfloatPatternsKnowledge: KnowledgeEntry[] = [
  // BigFloat API Reference and Usage Patterns
  createKnowledgeEntry(
    'documentation',
    `# 📊 BigFloat - API Reference and Usage Patterns

## Overview

\`BigFloat\` is an arbitrary-precision floating-point type managed by the Klever VM.
Use it for calculations that require decimal precision: interest rates, exchange rates,
percentages, and any math where integer truncation would lose too much accuracy.

## Struct Definition

\`\`\`rust
#[repr(transparent)]
pub struct BigFloat<M: ManagedTypeApi> {
    pub(crate) handle: M::BigFloatHandle,
}
\`\`\`

## When to Use BigFloat

- **Interest/yield calculations** with decimal rates
- **Exchange rate conversions** (e.g., token A to token B)
- **Percentage-based fees** where precision matters
- **Scientific computations** in smart contracts
- **Any calculation requiring decimal precision** before converting back to integer

## Creation & Initialization

\`\`\`rust
// Zero value
let zero = BigFloat::zero();

// From signed integers (i8, i16, i32, i64, isize)
let a = BigFloat::from(100i64);
let b = BigFloat::from(-25i32);

// ⚠️ BigFloat has NO From<u32>/From<u64> — only signed integer From impls
// ❌ BigFloat::from(100u32)           // Won't compile!
// ✅ BigFloat::from(100u32 as i64)    // Cast to signed first
// ✅ BigFloat::from(&BigUint::from(100u32))  // Or go through BigUint

// From BigUint (reference or owned)
let uint_val = BigUint::from(1000u32);
let float_val = BigFloat::from(&uint_val);   // 1000.0 (borrows)
let float_val = BigFloat::from(uint_val);    // 1000.0 (consumes)

// From BigInt (reference or owned)
let int_val = BigInt::from(-500i64);
let float_val = BigFloat::from(&int_val);    // -500.0

// From fraction (numerator / denominator)
let half = BigFloat::from_frac(1, 2);        // 0.5
let rate = BigFloat::from_frac(3, 100);      // 0.03 (3%)
let negative = BigFloat::from_frac(-7, 4);   // -1.75

// From scientific notation (significand: i64, exponent: i32)
let pi_approx = BigFloat::from_sci(314159, -5);   // 3.14159
let large = BigFloat::from_sci(15, 6);             // 15000000.0
let small = BigFloat::from_sci(1, -18);            // 0.000000000000000001

// From parts: integral + fractional * 10^exponent
let value = BigFloat::from_parts(1, 41421356, -8); // 1 + 41421356 * 10^(-8) = 1.41421356
\`\`\`

## Conversion Methods (Rounding)

BigFloat converts to BigInt using three rounding strategies:

\`\`\`rust
let value = BigFloat::from_frac(7, 2);  // 3.5

let truncated: BigInt = value.trunc();   // 3 (towards zero)
let floored: BigInt = value.floor();     // 3 (towards negative infinity)
let ceiled: BigInt = value.ceil();       // 4 (towards positive infinity)
\`\`\`

### Rounding Behavior with Negative Values

\`\`\`rust
let neg = BigFloat::from_frac(-7, 2);   // -3.5

let truncated: BigInt = neg.trunc();     // -3 (towards zero)
let floored: BigInt = neg.floor();       // -4 (towards negative infinity)
let ceiled: BigInt = neg.ceil();         // -3 (towards positive infinity)
\`\`\`

### Fixed-Point Conversion

\`\`\`rust
// Convert to fixed-point integer by multiplying by denominator
let rate = BigFloat::from_frac(3, 100);  // 0.03
let precision = BigFloat::from(1_000_000i64);

let fixed_point: BigInt = rate.to_fixed_point(&precision);  // 30000
// Useful for storing decimal values as integers with known precision
\`\`\`

### Buffer Serialization

\`\`\`rust
let value = BigFloat::from_frac(1, 3);
let buffer: ManagedBuffer = value.to_buffer();
let restored = BigFloat::from_buffer(&buffer);
\`\`\`

## Arithmetic Operators

Binary operators support both owned and borrowed values:

\`\`\`rust
let a = BigFloat::from_frac(3, 2);  // 1.5
let b = BigFloat::from_frac(1, 4);  // 0.25

// ✅ Reference arithmetic (values survive)
let sum = &a + &b;     // 1.75
let diff = &a - &b;    // 1.25
let diff = &b - &a;    // -1.25 (safe, unlike BigUint)
let prod = &a * &b;    // 0.375
let quot = &a / &b;    // 6.0

// ✅ Owned arithmetic (values consumed)
let sum = a.clone() + b.clone();  // 1.75

// Negation — two approaches:
let neg = a.neg();      // .neg() takes &self (a survives)
let neg = -a;           // Unary - takes self (a is moved)
// let neg = -&a;       // ❌ Won't compile — no Neg for &BigFloat
\`\`\`

### Compound Assignment
\`\`\`rust
let mut x = BigFloat::from(100i64);
x += &BigFloat::from_frac(1, 2);   // 100.5
x -= &BigFloat::from(1i64);        // 99.5
x *= &BigFloat::from_frac(1, 10);  // 9.95
x /= &BigFloat::from(2i64);        // 4.975
\`\`\`

## Math Methods

\`\`\`rust
let a = BigFloat::from(16i64);

// Square root
let root = a.sqrt();          // 4.0

// Power (exponent can be NEGATIVE — unlike BigUint/BigInt!)
let squared = a.pow(2);       // 256.0
let inverse = a.pow(-1);      // 0.0625 (1/16)
let inv_sq = a.pow(-2);       // 0.00390625 (1/256)
// This makes BigFloat ideal for compound interest: (1 + rate).pow(periods)
\`\`\`

## Sign & Magnitude

\`\`\`rust
let value = BigFloat::from(-3i64);

let sign: Sign = value.sign();              // Sign::Minus
let abs: BigFloat = value.magnitude();      // 3.0
let (sign, mag) = value.to_parts();         // (Sign::Minus, 3.0)
\`\`\`

## Comparison

\`\`\`rust
let a = BigFloat::from_frac(3, 2);  // 1.5
let b = BigFloat::from(2i64);       // 2.0

// With other BigFloat
assert!(&a < &b);
assert!(&b > &a);

// With i64 primitives (BigFloat must be on the left side)
assert!(b == 2i64);       // ✅ Works
assert!(a > 0i64);        // ✅ Works
// assert!(2i64 == b);    // ❌ Won't compile — not bidirectional

// With BigInt (BigFloat must be on the left side)
let bi = BigInt::from(1i64);
assert!(a > bi);           // ✅ Works
// assert!(bi < a);        // ❌ Won't compile
\`\`\`

## ⚠️ Precision Considerations

BigFloat provides arbitrary precision but:
- Division may not be exact (e.g., 1/3 is approximated)
- Repeated operations can accumulate rounding errors
- For financial calculations, consider using fixed-point integers when possible
- Always round in a direction that's safe for your use case (\`ceil\` for fees, \`floor/trunc\` for payouts)

## Practical Examples

### Interest Calculation

\`\`\`rust
#[endpoint]
fn calculate_interest(&self, principal: BigUint, rate_bps: u64, periods: u32) -> BigUint {
    // Convert to BigFloat for precise calculation
    let p = BigFloat::from(&principal);

    // Rate in basis points (e.g., 500 = 5%)
    let r = BigFloat::from_frac(rate_bps as i64, 10_000i64);

    // Compound: principal * (1 + rate)^periods
    let one = BigFloat::from(1i64);
    let factor = (&one + &r).pow(periods as i32);
    let result = &p * &factor;

    // Convert back to BigUint (truncate decimals)
    let result_int = result.trunc();
    result_int.into_big_uint().unwrap_or_else(|| BigUint::zero())
}
\`\`\`

### Percentage Fee Calculation

\`\`\`rust
fn calculate_fee(&self, amount: &BigUint, fee_percent: u64) -> BigUint {
    // fee_percent: 250 = 2.5%
    let amount_float = BigFloat::from(amount);
    let fee_rate = BigFloat::from_frac(fee_percent as i64, 10_000i64);

    let fee = &amount_float * &fee_rate;

    // ✅ Round UP to avoid rounding fee to zero on small amounts
    let fee_int = fee.ceil();
    fee_int.into_big_uint().unwrap_or_else(|| BigUint::zero())
}
\`\`\`

### Exchange Rate Conversion

\`\`\`rust
#[endpoint]
fn swap(&self, input_amount: BigUint) -> BigUint {
    let reserve_a = self.reserve_a().get();
    let reserve_b = self.reserve_b().get();

    // Calculate rate with full precision
    let rate = BigFloat::from(&reserve_b) / BigFloat::from(&reserve_a);
    let input_float = BigFloat::from(&input_amount);
    let output = &input_float * &rate;

    // ✅ Truncate (floor) to avoid giving more than available
    let output_int = output.trunc();
    output_int.into_big_uint().unwrap_or_else(|| BigUint::zero())
}
\`\`\`

### Square Root for AMM Price Calculation

\`\`\`rust
fn geometric_mean(&self, a: &BigUint, b: &BigUint) -> BigUint {
    let product = BigFloat::from(a) * BigFloat::from(b);
    let result = product.sqrt();

    let result_int = result.trunc();
    result_int.into_big_uint().unwrap_or_else(|| BigUint::zero())
}
\`\`\``,
    {
      title: 'BigFloat API Reference and Patterns',
      description:
        'Complete guide for BigFloat including creation, rounding, precision, and practical DeFi examples',
      tags: [
        'bigfloat',
        'floating-point',
        'precision',
        'api',
        'reference',
        'interest',
        'percentage',
        'exchange-rate',
        'defi',
        'math',
      ],
      language: 'rust',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),
];

export default bigfloatPatternsKnowledge;
