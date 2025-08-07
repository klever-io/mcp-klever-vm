import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * Payment-related error patterns and solutions
 */

export const paymentErrorsKnowledge: KnowledgeEntry[] = [
  // CRITICAL PAYMENT SYNTAX
  createKnowledgeEntry(
    'error_pattern',
    `# 🚨 CRITICAL: KLV Payment Syntax - NEVER USE --value

## ⛔ --value DOES NOT EXIST IN KOPERATOR!

### VERY IMPORTANT !!!!!!:
- **1 KLV = 1_000_000 (1e6) smallest units**
- **1 KFI = 1_000_000 (1e6) smallest units**
- Always use smallest units values in contracts
    - FOR KLV - Always use 6 decimals (1 KLV = 1_000_000 units)
    - FOR KFI - Always use 6 decimals (1 KFI = 1_000_000 units)
### Example Conversions:
\`\`\`rust
// Converting from KLV/KFI to contract units
const ONE_KLV: u64 = 1_000_000;        // 1 KLV
const HALF_KLV: u64 = 500_000;         // 0.5 KLV
const HUNDRED_KLV: u64 = 100_000_000;  // 100 KLV
\`\`\`

## ❌ WRONG - This syntax DOES NOT EXIST:
\`\`\`bash
# These will ALL FAIL:
--value="1000000"           # ❌ WRONG
--value "KLV=1000000"       # ❌ WRONG
--value="KLV:1000000"       # ❌ WRONG
\`\`\`

## ✅ CORRECT - Use --values (with 's'):
\`\`\`bash
# The ONLY correct way to send payments:
--values "KLV=1000000"      # ✅ CORRECT - 1 KLV
--values "KFI=500000"       # ✅ CORRECT - 0.5 KFI
--values "KLV=1000000,KFI=2000000"  # ✅ CORRECT - Multiple tokens
\`\`\`

## Remember the Rules:
1. **Always use --values (plural), NEVER --value**
2. **Format is "TOKEN=AMOUNT" with equals sign**
3. **Amount is ALWAYS in smallest units (6 decimals)**
4. **Multiple tokens separated by comma**

## Complete Example:
\`\`\`bash
# Send 10 KLV to a contract endpoint
~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc invoke CONTRACT_ADDRESS deposit \\
    --values "KLV=10000000" \\
    --await --sign --result-only
\`\`\``,
    {
      title: 'CRITICAL: KLV Payment Syntax - NEVER USE --value',
      description: 'Critical error pattern: --value does not exist, always use --values with correct format',
      tags: ['critical', 'error', 'payment', 'koperator', 'values', 'klv', 'kfi'],
      language: 'mixed',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // KLV/KFI Decimals Error
  createKnowledgeEntry(
    'error_pattern',
    `# 🚨 CRITICAL: KLV and KFI ALWAYS Use 6 Decimals

## ⛔ NEVER USE 8, 9, 10 or 18 DECIMALS!

### ✅ CORRECT: KLV and KFI ALWAYS have 6 decimals:
\`\`\`bash
# 1 KLV = 1,000,000 units (10^6)
# NOT 10^8, NOT 10^9, NOT 10^10, NOT 10^18!

# Correct Examples:
1 KLV = 1000000        # 6 zeros
10 KLV = 10000000      # 7 zeros
0.1 KLV = 100000       # 5 zeros
0.001 KLV = 1000       # 3 zeros
\`\`\`

### ❌ WRONG: Using decimals from other blockchains:
\`\`\`bash
# These are ALL WRONG for Klever:
1 KLV = 100000000      # ❌ 8 decimals (Bitcoin style) - WRONG!
1 KLV = 1000000000     # ❌ 9 decimals (Ethereum gwei) - WRONG!
1 KLV = 10000000000    # ❌ 10 decimals - WRONG!
1 KLV = 1000000000000000000  # ❌ 18 decimals (Ethereum) - WRONG!
\`\`\`

### In Smart Contracts:
\`\`\`rust
// ✅ CORRECT
const DECIMALS: u32 = 6;
const ONE_KLV: u64 = 1_000_000;

// ❌ WRONG
const DECIMALS: u32 = 18;  // NOT FOR KLEVER!
const ONE_KLV: u64 = 1_000_000_000_000_000_000;  // WRONG!
\`\`\`

### In Koperator Commands:
\`\`\`bash
# Send 1 KLV
~/klever-sdk/koperator sc invoke CONTRACT method --values "KLV=1000000"  # 6 zeros

# Send 10 KLV
~/klever-sdk/koperator sc invoke CONTRACT method --values "KLV=10000000" # 7 zeros

# Send 0.5 KLV
~/klever-sdk/koperator sc invoke CONTRACT method --values "KLV=500000"   # 5 zeros + 5
\`\`\`

### REMEMBER:
- **KLV: ALWAYS 6 decimals** (1 KLV = 1,000,000)
- **KFI: ALWAYS 6 decimals** (1 KFI = 1,000,000)
- **NOT 8, NOT 9, NOT 10, NOT 18 decimals!**
- **This is different from Ethereum** (which uses 18)
- **This is different from Bitcoin** (which uses 8)
- **When in doubt**: 1 KLV = 1 followed by 6 zeros`,
    {
      title: 'CRITICAL: KLV/KFI Always 6 Decimals - NOT 8, 9, 10 or 18',
      description: 'Critical error: KLV and KFI always use 6 decimals, not 8, 9, 10, or 18 like other blockchains',
      tags: ['critical', 'error', 'decimals', 'klv', 'kfi', 'units', 'conversion'],
      language: 'mixed',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),
];

export default paymentErrorsKnowledge;