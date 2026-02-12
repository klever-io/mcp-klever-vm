import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * Numeric type conversion patterns between BigUint, BigInt, and BigFloat
 */

export const numericTypeConversionsKnowledge: KnowledgeEntry[] = [
  createKnowledgeEntry(
    'best_practice',
    `# 🔄 Numeric Type Conversions - BigUint, BigInt, BigFloat

## Type Selection Guide

| Type | Sign | Precision | Use When |
|------|------|-----------|----------|
| \`BigUint\` | Unsigned | Integer | Balances, token amounts, counts |
| \`BigInt\` | Signed | Integer | Price changes, profit/loss, signed deltas |
| \`BigFloat\` | Signed | Floating-point | Interest rates, percentages, exchange rates |

## Conversion Paths

### ✅ Easy Direction: BigUint -> BigInt -> BigFloat

All these conversions are lossless and always succeed:

\`\`\`rust
// BigUint -> BigInt (always positive)
let uint = BigUint::from(100u32);
let int = BigInt::from(uint);          // +100
let int = BigInt::from(BigUint::from(100u32));  // +100

// BigInt -> BigFloat (exact)
let int = BigInt::from(-50i64);
let float = BigFloat::from(&int);      // -50.0
let float = BigFloat::from(int);       // -50.0 (consuming)

// BigUint -> BigFloat (exact)
let uint = BigUint::from(100u32);
let float = BigFloat::from(&uint);     // 100.0
let float = BigFloat::from(uint);      // 100.0 (consuming)
\`\`\`

### ⚠️ Reverse Direction: BigFloat -> BigInt -> BigUint (Requires Care)

\`\`\`rust
// BigFloat -> BigInt (choose rounding strategy)
let float = BigFloat::from_frac(7, 2);  // 3.5
let truncated = float.trunc();           // 3 (towards zero)
let floored = float.floor();             // 3 (towards -infinity)
let ceiled = float.ceil();               // 4 (towards +infinity)

// BigInt -> BigUint (fails if negative — returns ManagedOption, not Option)
let positive = BigInt::from(100i64);
let uint = positive.into_big_uint();     // ManagedOption::some(BigUint(100))

let negative = BigInt::from(-100i64);
let uint = negative.into_big_uint();     // ManagedOption::none() — value is negative
\`\`\`

### Safe BigFloat -> BigUint Pattern

\`\`\`rust
// Complete chain: BigFloat -> BigInt -> BigUint
fn float_to_uint<M: ManagedTypeApi>(value: BigFloat<M>) -> BigUint<M> {
    let as_int: BigInt<M> = value.trunc();  // or .floor() or .ceil()
    as_int.into_big_uint().unwrap_or_else(|| BigUint::zero())
}
\`\`\`

## Mixed Type Arithmetic

BigInt and BigUint can be mixed directly in arithmetic — the result is always BigInt:

\`\`\`rust
let int = BigInt::from(-5i64);
let uint = BigUint::from(10u32);

// ✅ All operators work (Add, Sub, Mul, Div, Rem)
let result: BigInt = int + uint;   // BigInt(5)
let result: BigInt = uint - int;   // BigInt(15)

// ⚠️ Compound assignment does NOT support mixed types:
// let mut x = BigInt::from(10i64);
// x += uint;  // ❌ Won't compile
// x += BigInt::from(uint);  // ✅ Convert first
\`\`\`

## Primitive Conversions

### Into BigUint
\`\`\`rust
// Direct From impl for u8, u16, u32, u64
BigUint::from(42u32)
BigUint::from(42u64)

// u128 supported (via byte conversion internally)
BigUint::from(42u128)

// From bytes
BigUint::from_bytes_be(&[0x01, 0x00])  // 256
\`\`\`

### Into BigInt
\`\`\`rust
// Direct From impl for i8, i16, i32, i64, isize
BigInt::from(42i32)
BigInt::from(-42i64)
BigInt::from(42isize)

// From signed bytes (two's complement)
BigInt::from_signed_bytes_be(&[0xFF])  // -1

// ⚠️ i128 is NOT supported
\`\`\`

### Into BigFloat
\`\`\`rust
// ⚠️ Only SIGNED integer From impls (i8, i16, i32, i64, isize)
BigFloat::from(42i32)
BigFloat::from(-42i64)

// ❌ No From<u32>, From<u64>, etc.!
// BigFloat::from(42u32)  // Won't compile

// ✅ For unsigned values, go through BigUint or cast:
BigFloat::from(&BigUint::from(42u32))   // Via BigUint reference
BigFloat::from(42u32 as i64)            // Cast to signed (if value fits)

// Fractional and scientific notation
BigFloat::from_frac(1, 3)              // 0.333...
BigFloat::from_sci(314, -2)            // 3.14
BigFloat::from_parts(1, 5, -1)         // 1.5
\`\`\`

### Back to Primitives
\`\`\`rust
let uint = BigUint::from(42u32);
let val: Option<u64> = uint.to_u64();   // Some(42)

let int = BigInt::from(-42i64);
let val: Option<i64> = int.to_i64();    // Some(-42)

// BigFloat has no direct to_i64(); go through BigInt
let float = BigFloat::from_frac(7, 2);  // 3.5
let val: Option<i64> = float.trunc().to_i64();  // Some(3)
\`\`\`

## BigInt Sign Decomposition

\`\`\`rust
let value = BigInt::from(-42i64);

// Get sign enum (three variants!)
match value.sign() {
    Sign::Minus => { /* negative */ },
    Sign::NoSign => { /* zero */ },
    Sign::Plus => { /* positive */ },
}

// Get absolute value as BigUint
let abs = value.magnitude();  // BigUint(42)

// Decompose fully
let (sign, magnitude) = value.to_parts();
// sign = Sign::Minus, magnitude = BigUint(42)

// Recompose
let recomposed = BigInt::from_biguint(Sign::Minus, BigUint::from(42u32));
\`\`\`

## ⚠️ Common Conversion Pitfalls

### Pitfall 1: BigUint Subtraction Instead of BigInt

\`\`\`rust
// ❌ WRONG - Aborts if b > a
let result = &a - &b;  // BIG_UINT_SUB_NEGATIVE error

// ✅ CORRECT - Use BigInt for safe subtraction
let result = BigInt::from(a) - BigInt::from(b);
match result.sign() {
    Sign::Minus => { /* b was larger */ },
    Sign::NoSign => { /* equal */ },
    Sign::Plus => { /* a was larger */ },
}
\`\`\`

### Pitfall 2: Ignoring ManagedOption on into_big_uint()

\`\`\`rust
// ❌ WRONG - Aborts with panic message if negative
let uint = big_int.into_big_uint().unwrap_or_sc_panic("Expected positive");

// ✅ CORRECT - Handle the none case with a default
let uint = big_int.into_big_uint()
    .unwrap_or_else(|| BigUint::zero());
\`\`\`

### Pitfall 3: Precision Loss in Float -> Int

\`\`\`rust
let fee = BigFloat::from_frac(1, 3) * BigFloat::from(10i64);  // 3.333...
let fee_int = fee.trunc();  // 3 — lost 0.333...

// ✅ If collecting fees, round UP to avoid giving away fractions
let fee_int = fee.ceil();   // 4 — contract keeps the remainder
\`\`\`

### Pitfall 4: Division Truncation in Pure Integer Math

\`\`\`rust
// Integer division loses precision
let a = BigUint::from(10u32);
let b = BigUint::from(3u32);
let result = &a / &b;  // 3 (lost 0.333...)

// ✅ Use BigFloat for intermediate calculation
let result = BigFloat::from(&a) / BigFloat::from(&b);  // 3.333...
let rounded_int: BigInt = result.ceil();
let rounded = rounded_int.into_big_uint()
    .unwrap_or_else(|| BigUint::zero());  // 4
\`\`\`

### Pitfall 5: BigFloat From Unsigned Integers

\`\`\`rust
// ❌ Won't compile — no From<u32> for BigFloat
// let f = BigFloat::from(100u32);

// ✅ Convert through BigUint
let f = BigFloat::from(&BigUint::from(100u32));

// ✅ Or cast to signed
let f = BigFloat::from(100u32 as i64);
\`\`\`

## Summary Table

| From | To | Method | Can Fail? |
|------|----|--------|-----------|
| \`BigUint\` | \`BigInt\` | \`BigInt::from(uint)\` | No |
| \`BigUint\` | \`BigFloat\` | \`BigFloat::from(&uint)\` | No |
| \`BigInt\` | \`BigUint\` | \`int.into_big_uint()\` | Yes (if negative) |
| \`BigInt\` | \`BigFloat\` | \`BigFloat::from(&int)\` | No |
| \`BigFloat\` | \`BigInt\` | \`.trunc()\\|.floor()\\|.ceil()\` | No |
| \`BigFloat\` | \`BigUint\` | \`.trunc().into_big_uint()\` | Yes (if negative) |
| \`u32/u64\` | \`BigUint\` | \`BigUint::from(val)\` | No |
| \`i32/i64\` | \`BigInt\` | \`BigInt::from(val)\` | No |
| \`i32/i64\` | \`BigFloat\` | \`BigFloat::from(val)\` | No |
| \`u32/u64\` | \`BigFloat\` | \`BigFloat::from(&BigUint::from(val))\` | No |
| \`BigUint\` | \`u64\` | \`.to_u64()\` | Yes (if too large) |
| \`BigInt\` | \`i64\` | \`.to_i64()\` | Yes (if too large) |`,
    {
      title: 'Numeric Type Conversions Guide',
      description:
        'Complete conversion guide between BigUint, BigInt, BigFloat and primitives with pitfalls',
      tags: [
        'biguint',
        'bigint',
        'bigfloat',
        'conversion',
        'types',
        'casting',
        'rounding',
        'best-practice',
      ],
      language: 'rust',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),
];

export default numericTypeConversionsKnowledge;
