import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * BigUint handling best practices and patterns
 */

export const bigintPatternsKnowledge: KnowledgeEntry[] = [
  // BigUint Type Handling and Comparisons
  createKnowledgeEntry(
    'best_practice',
    `# 🔥 BigUint Usage Patterns and Best Practices

## Comparison Patterns

Rust auto-borrows for \`PartialOrd\` and \`PartialEq\`, so all of these work:

### Pattern 1: Use Owned Values Directly (Simplest)
\`\`\`rust
let balance: BigUint = self.balance().get();
let threshold = BigUint::from(1000u32);
require!(balance >= threshold, "Balance too low");    // ✅ Works!
\`\`\`

### Pattern 2: Use References
\`\`\`rust
let balance = self.balance().get();
let threshold = BigUint::from(1000u32);
require!(&balance >= &threshold, "Balance too low");  // ✅ Works!
\`\`\`

### Pattern 3: Dereference Inside update() Closures
\`\`\`rust
// *balance works inside update() closures where the parameter is &mut BigUint
// BigUint does NOT implement Deref — this is standard Rust mutable reference dereferencing
self.balance(&user).update(|balance| {
    require!(*balance >= threshold, "Balance too low");  // ✅ Works!
    *balance -= &amount;
});
\`\`\`

### Pattern 4: Compare with Primitives
\`\`\`rust
// ✅ Comparison with primitives (u32, u64, i32, i64) is supported:
require!(balance >= 1000u32, "Too low");
require!(balance > 0u64, "Must be positive");
\`\`\`

## Arithmetic Operations

For arithmetic, references matter — they avoid consuming (moving) values:

\`\`\`rust
// ✅ Reference arithmetic (efficient, a and b survive)
let a = BigUint::from(100u32);
let b = BigUint::from(50u32);
let result = &a + &b;  // Doesn't consume a or b

// ✅ Move semantics (consumes values)
let result = a + b;    // a and b are consumed

// ✅ Mixed: owned + reference
let result = a + &b;   // a is consumed, b stays

// ✅ Primitive operands (auto-converts)
let result = &a + 50u32;
let result = &a * 2u64;
\`\`\`

## Storage Updates

\`\`\`rust
// ✅ Update with closure (recommended — avoids get/set roundtrip)
self.balance(&user).update(|balance| {
    *balance += &amount;  // Reference to avoid clone
});

// ✅ Get, modify, set pattern
let mut balance = self.balance(&user).get();
balance += &amount;
self.balance(&user).set(&balance);
\`\`\`

## Transfer Pattern

\`\`\`rust
#[endpoint]
fn transfer(&self, to: ManagedAddress, amount: BigUint) {
    let caller = self.blockchain().get_caller();
    let balance = self.balance(&caller).get();

    // ✅ Reference comparison
    require!(&balance >= &amount, "Insufficient balance");

    // ✅ Update with reference
    self.balance(&caller).update(|bal| *bal -= &amount);
    self.balance(&to).update(|bal| *bal += &amount);
}
\`\`\`

## Memory Efficiency Tips

1. **Use references (&) in arithmetic** — Avoids cloning
2. **Use update() closures** — Direct storage modification
3. **Chain operations** — \`&a + &b + &c\` instead of multiple steps
4. **Avoid unnecessary get/set cycles** — Use update() instead

## ❌ Anti-Patterns to Avoid

\`\`\`rust
// ❌ WRONG - Unnecessary cloning
let balance = self.balance().get().clone();

// ❌ WRONG - Multiple get/set calls (use update() instead)
let balance = self.balance().get();
let new_balance = balance + amount;
self.balance().set(&new_balance);
\`\`\`

## Quick Reference

| Operation | Correct Pattern | Notes |
|-----------|----------------|-------|
| Compare | \`a >= b\` or \`&a >= &b\` | Both work (auto-borrow) |
| Compare with primitive | \`a >= 1000u32\` | u32, u64, i32, i64 supported |
| Add to storage | \`update(\\|x\\| *x += &amount)\` | Reference avoids clone |
| Subtract from storage | \`update(\\|x\\| *x -= &amount)\` | Reference avoids clone |
| Initialize | \`BigUint::from(1000u32)\` | u8, u16, u32, u64, u128 |
| Zero check | \`value == 0u32\` or \`value == BigUint::zero()\` | Both work |`,
    {
      title: 'BigUint Usage Patterns and Best Practices',
      description:
        'Comparison patterns, arithmetic with references, storage updates, and anti-patterns',
      tags: ['biguint', 'types', 'best-practice', 'errors', 'memory-efficiency'],
      language: 'rust',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // BigUint API Reference
  createKnowledgeEntry(
    'documentation',
    `# BigUint API Reference - Complete Method Guide

## Overview

\`BigUint\` is an unsigned arbitrary-precision integer type managed by the Klever VM.
It is the most commonly used numeric type in smart contracts for balances, amounts, and token operations.

## Struct Definition

\`\`\`rust
#[repr(transparent)]
pub struct BigUint<M: ManagedTypeApi> {
    pub(crate) handle: M::BigIntHandle,
}
\`\`\`

Internally it is a handle to VM-managed memory. All operations are executed by the VM, not in contract code.

## Creation & Initialization

\`\`\`rust
// Zero value
let zero = BigUint::zero();
let zero_ref = BigUint::zero_ref();  // Reference to constant zero

// From unsigned primitives (u8, u16, u32, u64 — direct From impl)
let a = BigUint::from(100u32);
let b = BigUint::from(1_000_000u64);

// u128 supported via byte conversion
let c = BigUint::from(1u128);

// From big-endian bytes
let from_bytes = BigUint::from_bytes_be(&[0x01, 0x00]);  // 256
let from_buffer = BigUint::from_bytes_be_buffer(&managed_buffer);
\`\`\`

## Conversion Methods

\`\`\`rust
let value = BigUint::from(42u32);

// To primitive (returns Option — None if value doesn't fit)
let as_u64: Option<u64> = value.to_u64();

// To bytes
let bytes: BoxedBytes = value.to_bytes_be();
let buffer: ManagedBuffer = value.to_bytes_be_buffer();

// To display string
let display: ManagedBuffer = value.to_display();
\`\`\`

## Math Methods

\`\`\`rust
let a = BigUint::from(16u32);

let root = a.sqrt();       // 4 — integer square root
let power = a.pow(3);      // 4096 — exponent must be u32
let log = a.log2();        // 4 — base-2 logarithm
\`\`\`

## Arithmetic Operators

All operators support owned values, references, and mixed:

\`\`\`rust
let a = BigUint::from(100u32);
let b = BigUint::from(30u32);

// Addition
let sum = &a + &b;         // 130 (a and b survive)
let sum = a.clone() + b.clone();  // 130 (a and b consumed)

// ⚠️ Subtraction — SIGNALS ERROR if result would be negative
let diff = &a - &b;        // 70
// let bad = &b - &a;      // ERROR: signals BIG_UINT_SUB_NEGATIVE

// Multiplication
let prod = &a * &b;        // 3000

// Division (truncated)
let quot = &a / &b;        // 3

// Remainder (truncated)
let rem = &a % &b;         // 10
\`\`\`

### Compound Assignment
\`\`\`rust
let mut x = BigUint::from(100u32);
x += &BigUint::from(10u32);   // 110
x -= &BigUint::from(5u32);    // 105
x *= &BigUint::from(2u32);    // 210
x /= &BigUint::from(3u32);    // 70
x %= &BigUint::from(30u32);   // 10
\`\`\`

### Primitive Operands
\`\`\`rust
let a = BigUint::from(100u32);
let result = &a + 50u32;   // 150 — auto-converts primitive
let result = &a * 2u64;    // 200
\`\`\`

## Bitwise Operators

\`\`\`rust
let a = BigUint::from(0b1100u32);
let b = BigUint::from(0b1010u32);

let and = &a & &b;       // 0b1000 (8)
let or  = &a | &b;       // 0b1110 (14)
let xor = &a ^ &b;       // 0b0110 (6)
let shl = &a << 2usize;  // 0b110000 (48)
let shr = &a >> 1usize;  // 0b0110 (6)
\`\`\`

## Comparison

\`\`\`rust
let a = BigUint::from(100u32);
let b = BigUint::from(50u32);

// With other BigUint (auto-borrow — references optional)
assert!(a > b);
assert!(&a >= &b);   // Explicit references also work

// With primitives (u32, u64, i32, i64)
assert!(a > 0u32);
assert!(a == 100u64);
\`\`\`

## ⚠️ CRITICAL: Subtraction Safety

BigUint subtraction **signals an error** (aborts the contract) if the result would be negative:

\`\`\`rust
let a = BigUint::from(5u32);
let b = BigUint::from(10u32);

// ❌ This will ABORT the contract execution
let result = a - b;  // ERROR: BIG_UINT_SUB_NEGATIVE
\`\`\`

**Always check before subtracting:**
\`\`\`rust
// ✅ Safe subtraction pattern
require!(&a >= &b, "Insufficient amount");
let result = &a - &b;

// ✅ Or use BigInt for potentially negative results
let a_signed = BigInt::from(a);
let b_signed = BigInt::from(b);
let result = a_signed - b_signed;  // Works even if negative
\`\`\``,
    {
      title: 'BigUint API Reference',
      description:
        'Complete API reference for BigUint including creation, operators, math methods, and subtraction safety',
      tags: [
        'biguint',
        'api',
        'reference',
        'operators',
        'math',
        'subtraction',
        'bitwise',
      ],
      language: 'rust',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),
];

export default bigintPatternsKnowledge;
