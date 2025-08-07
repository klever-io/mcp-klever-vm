import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * BigUint handling best practices and patterns
 */

export const bigintPatternsKnowledge: KnowledgeEntry[] = [
  // BigUint Type Handling and Comparisons
  createKnowledgeEntry(
    'best_practice',
    `# 🔥 BigUint Type Handling - Avoiding Type Mismatch Errors

## Common Error: Type Mismatch in Comparisons

One of the most frequent errors in Klever smart contracts is type mismatch when comparing BigUint values:

\`\`\`rust
// ❌ WRONG - Common type mismatch error
let balance = self.balance().get();  // Returns BigUint
let threshold = BigUint::from(1000u32);
require!(balance >= threshold, "Balance too low");  // Type error!
\`\`\`

**Error**: \`cannot compare \`BigUint\` with \`BigUint\`\`

## ✅ CORRECT Solutions:

### Solution 1: Use References (Recommended)
\`\`\`rust
let balance = self.balance().get();
let threshold = BigUint::from(1000u32);
require!(&balance >= &threshold, "Balance too low");  // ✅ Works!
\`\`\`

### Solution 2: Dereference the Storage Value
\`\`\`rust
let balance = self.balance().get();
let threshold = BigUint::from(1000u32);
require!(*balance >= threshold, "Balance too low");   // ✅ Works!
\`\`\`

### Solution 3: Use Owned Values Consistently
\`\`\`rust
let balance: BigUint = self.balance().get();
let threshold = BigUint::from(1000u32);
require!(balance >= threshold, "Balance too low");    // ✅ Works!
\`\`\`

## Common Patterns That Work:

### Arithmetic Operations
\`\`\`rust
// ✅ Reference arithmetic (efficient)
let a = BigUint::from(100u32);
let b = BigUint::from(50u32);
let result = &a + &b;  // Doesn't consume a or b

// ✅ Move semantics (consumes values)
let result = a + b;    // a and b are consumed

// ✅ Mixed references
let result = &a + b;   // a stays, b is consumed
\`\`\`

### Storage Updates
\`\`\`rust
// ✅ Update with closure (recommended)
self.balance(&user).update(|balance| {
    *balance += &amount;  // Reference to avoid clone
});

// ✅ Get, modify, set pattern
let mut balance = self.balance(&user).get();
balance += &amount;
self.balance(&user).set(&balance);
\`\`\`

### Comparisons in Real Contracts
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

## Memory Efficiency Tips:

1. **Use references (&) when possible** - Avoids cloning
2. **Use update() closures** - Direct storage modification
3. **Chain operations** - \`&a + &b + &c\` instead of multiple steps
4. **Avoid unnecessary get/set cycles** - Use update() instead

## Common Anti-Patterns to Avoid:

\`\`\`rust
// ❌ WRONG - Unnecessary cloning
let balance = self.balance().get().clone();  // Unnecessary clone

// ❌ WRONG - Multiple get/set calls
let balance = self.balance().get();
let new_balance = balance + amount;
self.balance().set(&new_balance);  // Use update() instead

// ❌ WRONG - Direct comparison of different types
require!(balance >= 1000u32, "Too low");  // Type mismatch
\`\`\`

## Quick Reference:

| Operation | Correct Pattern | Notes |
|-----------|----------------|-------|
| Compare | \`&a >= &b\` | Use references |
| Add to storage | \`update(\|x\| *x += &amount)\` | Reference avoids clone |
| Subtract from storage | \`update(\|x\| *x -= &amount)\` | Reference avoids clone |
| Initialize | \`BigUint::from(1000u32)\` | Use appropriate integer type |
| Zero check | \`value == 0u32\` or \`&value == &BigUint::zero()\` | Both work |`,
    {
      title: 'BigUint Type Handling Best Practices',
      description: 'Avoiding common type mismatch errors and efficient BigUint usage patterns',
      tags: ['biguint', 'types', 'best-practice', 'errors', 'memory-efficiency'],
      language: 'rust',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),
];

export default bigintPatternsKnowledge;