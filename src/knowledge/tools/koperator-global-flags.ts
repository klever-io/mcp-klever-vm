import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * Detailed documentation for all koperator global (persistent) flags.
 * Source of truth: operator-global-flags.md (extracted from koperator source code)
 */

export const koperatorGlobalFlagsKnowledge: KnowledgeEntry[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // ENTRY 1 — Authentication, Network & Transaction Construction Flags
  // ──────────────────────────────────────────────────────────────────────────
  createKnowledgeEntry(
    'documentation',
    `# Koperator Global Flags: Authentication, Network & Transaction Construction

All global (persistent) flags propagate to every subcommand (\`sc\`, \`send\`, \`kda\`, \`validator\`, \`account\`, etc.).

Before any command runs, a startup hook:
1. Validates flag combinations (e.g. \`--args\` and \`--message\` cannot coexist).
2. Loads the wallet PEM file, deriving the signer address and private key.
3. Auto-fetches the account nonce from the node (unless \`--nonce\` was explicitly set).
4. Loads optional multi-sign keys.
5. Reads a \`.env\` file (via godotenv) from the current working directory.

---

## Authentication & Key Management

### --key-file / -k
| Property | Value |
|----------|-------|
| Type | string |
| Short | \`-k\` |
| Default | \`./walletKey.pem\` |

Path to the wallet PEM file (Ed25519 private key). The public key and bech32 address (\`klv1…\`) are derived automatically.

\`\`\`bash
~/klever-sdk/koperator sc invoke klv1... myFunc --key-file /path/to/myWallet.pem
\`\`\`

If the default \`./walletKey.pem\` is not found and no \`-k\` is provided, the operator logs a warning but continues (some read-only commands don't require a key).

### --password / -p
| Property | Value |
|----------|-------|
| Type | string |
| Short | \`-p\` |
| Default | \`""\` (no encryption) |

Password to decrypt an encrypted PEM file. Three modes:

| Usage | Behavior |
|-------|----------|
| \`--password=MY_SECRET\` | Uses the literal password string. |
| \`--password\` (no value) | Prompts interactively on stdin (hidden input). |
| *(omitted)* | No password — PEM is assumed unencrypted. |

> **Security for automation:** Prefer \`--password-file\` over \`--password\` — CLI args are visible in process listings.

### --password-file
| Property | Value |
|----------|-------|
| Type | string |
| Default | \`""\` |

Path to a plaintext file containing the PEM password. Trailing newlines are stripped. **Recommended for automation and scripting.**

\`\`\`bash
~/klever-sdk/koperator sc invoke klv1... myFunc --password-file /secrets/wallet-password.txt
\`\`\`

If both \`--password\` and \`--password-file\` are provided, \`--password-file\` takes precedence.

### --multi-files / -m
| Property | Value |
|----------|-------|
| Type | string array (repeatable) |
| Short | \`-m\` |
| Default | \`[]\` |

Additional PEM key files for **multi-signature** workflows. Each additional signature is appended to the transaction.

\`\`\`bash
~/klever-sdk/koperator sc invoke klv1... myFunc \\
    --key-file ./signer1.pem \\
    -m ./signer2.pem \\
    -m ./signer3.pem
\`\`\`

Each additional key uses the same \`--password\` / \`--password-file\` as the primary key.

---

## Network & Node Connection

### --node / -n
| Property | Value |
|----------|-------|
| Type | string |
| Short | \`-n\` |
| Default | \`http://localhost:8080\` |

URL of the Klever node API. All TX creation, broadcasting, account queries, and block lookups go to this endpoint.

\`\`\`bash
# Mainnet
~/klever-sdk/koperator sc invoke klv1... myFunc --node https://node.mainnet.klever.org

# Testnet
~/klever-sdk/koperator sc invoke klv1... myFunc -n https://node.testnet.klever.org
\`\`\`

Node API routes used:
- \`POST /transaction/send\` — create the transaction object
- \`POST /transaction/broadcast\` — broadcast a signed transaction
- \`GET /address/{address}/nonce\` — fetch account nonce
- \`GET /transaction/{hash}\` — look up a transaction by hash
- \`GET /block/by-nonce/{nonce}\` — fetch a block

### KLEVER_NODE Environment Variable

The \`KLEVER_NODE\` env var overrides the default node URL. Loaded at startup via godotenv (reads \`.env\` file if present). The \`--node\` flag takes final precedence if explicitly passed.

\`\`\`bash
# In .env file:
KLEVER_NODE=https://node.testnet.klever.org

# Or export:
export KLEVER_NODE=https://node.testnet.klever.org
~/klever-sdk/koperator sc invoke klv1... myFunc  # uses testnet without --node
\`\`\`

---

## Transaction Construction

### --nonce
| Property | Value |
|----------|-------|
| Type | uint64 |
| Default | \`0\` (auto-fetch) |

Explicitly set the TX nonce. When \`0\` (default), the operator auto-fetches the nonce from the node using the strategy set by \`--nonce-check\`.

\`\`\`bash
~/klever-sdk/koperator sc invoke klv1... myFunc --nonce 42
\`\`\`

Use when you need to override or replay a specific nonce, or when running offline with \`--create-only\`.

### --nonce-check
| Property | Value |
|----------|-------|
| Type | string |
| Default | \`current\` |
| Valid values | \`current\`, \`first-pending\`, \`pending\` |

Controls which nonce is fetched when \`--nonce=0\` (auto-fetch). The node response provides three values:

| Strategy | Node field | Use case |
|----------|-----------|----------|
| \`current\` | \`nonce\` | Default — current confirmed nonce. Normal single-TX operations. |
| \`first-pending\` | \`firstPendingNonce\` | First pending nonce in mempool. Replacing a stuck TX. |
| \`pending\` | \`nonce + txPending\` | Confirmed nonce + pending count. Queuing multiple TXs rapidly. |

\`\`\`bash
# Queue 3 TXs rapidly
~/klever-sdk/koperator sc invoke klv1... func1 --nonce-check pending --sign &
~/klever-sdk/koperator sc invoke klv1... func2 --nonce-check pending --sign &
~/klever-sdk/koperator sc invoke klv1... func3 --nonce-check pending --sign &
\`\`\`

### --message
| Property | Value |
|----------|-------|
| Type | string array (repeatable) |
| Default | \`nil\` |

Sets raw data/message bytes on the transaction. Each \`--message\` value becomes one entry in the TX \`Data\` field.

\`\`\`bash
~/klever-sdk/koperator sc invoke klv1... --message "myRawData"
\`\`\`

> **Mutually exclusive with \`--args\`:** Error: \`"can only use args or messages flag, not both"\`

### --fromAddress
| Property | Value |
|----------|-------|
| Type | string |
| Default | \`""\` (uses signer address) |

Overrides the \`Sender\` field in the transaction. The nonce is also fetched for this address instead of the signer. Useful for **permissioned accounts** where one key signs on behalf of another.

\`\`\`bash
~/klever-sdk/koperator sc invoke klv1... myFunc \\
    --key-file ./delegateKey.pem \\
    --fromAddress klv1ownerAddress...
\`\`\`

### --permID
| Property | Value |
|----------|-------|
| Type | int32 |
| Default | \`0\` |

Permission group ID. Klever accounts can have multiple permission groups. Default \`0\` = owner permission (primary key).

\`\`\`bash
~/klever-sdk/koperator sc invoke klv1... myFunc --permID 2 --key-file ./permKey.pem
\`\`\`

### --kdaFee
| Property | Value |
|----------|-------|
| Type | string |
| Default | \`""\` (pay with KLV) |

A KDA token identifier to pay TX fees instead of KLV.

\`\`\`bash
~/klever-sdk/koperator sc invoke klv1... myFunc --kdaFee KDA-ab12
\`\`\``,
    {
      title: 'Koperator Global Flags: Authentication, Network & Transaction Construction',
      description:
        'Detailed reference for --key-file, --password, --password-file, --multi-files, --node, KLEVER_NODE, --nonce, --nonce-check, --message, --fromAddress, --permID, --kdaFee',
      tags: [
        'koperator',
        'global-flags',
        'authentication',
        'key-file',
        'password',
        'multi-sign',
        'node',
        'network',
        'nonce',
        'transaction',
        'reference',
      ],
      language: 'bash',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // ──────────────────────────────────────────────────────────────────────────
  // ENTRY 2 — Signing, Broadcasting, Output Control & Automation Patterns
  // ──────────────────────────────────────────────────────────────────────────
  createKnowledgeEntry(
    'documentation',
    `# Koperator Global Flags: Signing, Output Control & Automation

## Signing & Broadcasting

### --sign / -s
| Property | Value |
|----------|-------|
| Type | bool |
| Short | \`-s\` |
| Default | \`false\` |

Auto-signs the transaction without interactive confirmation.

**Without --sign** (default): Displays full TX details and prompts:
\`\`\`
Requested Transaction Details:
{...formatted JSON...}
Please carefully review the transaction above.
Would you like to sign this transaction? (yes/no)
\`\`\`
Valid confirmations: \`y\`, \`Y\`, \`yes\`, \`Yes\`, \`YES\`.
Valid rejections: \`n\`, \`N\`, \`no\`, \`No\`, \`NO\`.

**With --sign**: Skips the prompt entirely and signs immediately.

> **For automation:** Always use \`--sign\` when calling koperator programmatically — interactive prompts will hang the process.

### --create-only / -c
| Property | Value |
|----------|-------|
| Type | bool |
| Short | \`-c\` |
| Default | \`false\` |

Builds and signs the TX but does **not** broadcast it. The complete signed TX JSON is printed to stdout.

\`\`\`bash
# Generate signed TX for later broadcast
~/klever-sdk/koperator sc invoke klv1... myFunc --create-only --sign > tx.json
\`\`\`

Useful for:
- Offline signing workflows
- Inspecting the TX before broadcasting
- Multi-step multi-sig processes where the TX is passed between signers

When active, logging is suppressed (set to LogNone).

### Transaction Signing Flow

The full lifecycle of a transaction:

\`\`\`
1. Build request JSON (sender, nonce, contract data, etc.)
       ↓
2. POST /transaction/send → node returns a Transaction object
       ↓
3. If NOT --sign: display TX and prompt for confirmation
   If --sign: skip confirmation
       ↓
4. Sign with primary key (Ed25519)
       ↓
5. For each --multi-files key: add additional signature
       ↓
6. If --create-only: dump signed TX JSON to stdout → STOP
       ↓
7. POST /transaction/broadcast → node returns txHash
       ↓
8. If --await: poll GET /transaction/{hash} every 2s (up to 20s)
   until status ≠ pending
       ↓
9. Display TX details with block info
\`\`\`

---

## Output Control

### --await
| Property | Value |
|----------|-------|
| Type | bool |
| Default | \`false\` |

Waits for the TX to be processed on-chain after broadcasting. Polls the node every **2 seconds** for up to **10 attempts** (≈20 seconds). Once TX status is no longer \`pending\`, fetches the block and displays full details.

If the TX is not found or still pending after timeout: error \`"transaction not found within the specified timeout"\`.

### --result-only
| Property | Value |
|----------|-------|
| Type | bool |
| Default | \`false\` |

Suppresses all informational logging and prints **only** the TX result. Designed for programmatic consumption and piping.

**Constraint:** Requires \`--await\`. Without it: error \`"await flag is required to use result-only"\`.

\`\`\`bash
TX_HASH=$(~/klever-sdk/koperator sc invoke klv1... myFunc --sign --await --result-only)
\`\`\`

> **Mutually exclusive with \`--verbose\`.**

### --verbose
| Property | Value |
|----------|-------|
| Type | bool |
| Default | \`false\` |

Enables trace-level logging for debugging. Shows detailed internal operations, HTTP requests, encoding steps, etc.

> **Mutually exclusive with \`--result-only\`.**

---

## Mutual Exclusivity & Constraints

| Constraint | Error if violated |
|------------|-------------------|
| \`--args\` and \`--message\` cannot both be provided | \`"can only use args or messages flag, not both"\` |
| \`--result-only\` requires \`--await\` | \`"await flag is required to use result-only"\` |
| \`--result-only\` and \`--verbose\` are mutually exclusive | *(enforced by cobra)* |

---

## Automation Patterns (MCP / AI Agent)

### Standard automated invocation
\`\`\`bash
~/klever-sdk/koperator <subcommand> [args...] \\
    --key-file <path> \\
    --password-file <path> \\
    --node <url> \\
    --sign \\
    --await \\
    --result-only
\`\`\`

### Dry-run / inspection without broadcasting
\`\`\`bash
~/klever-sdk/koperator <subcommand> [args...] \\
    --key-file <path> \\
    --create-only \\
    --sign
\`\`\`

### Rapid TX queuing (multiple TXs without waiting)
\`\`\`bash
~/klever-sdk/koperator <subcommand> [args...] \\
    --nonce-check pending \\
    --sign
\`\`\`

### Multi-signature workflow
\`\`\`bash
~/klever-sdk/koperator sc invoke klv1... myFunc \\
    --key-file ./signer1.pem \\
    -m ./signer2.pem \\
    -m ./signer3.pem \\
    --sign --await --result-only
\`\`\`

### Permissioned account (delegated signing)
\`\`\`bash
~/klever-sdk/koperator sc invoke klv1... myFunc \\
    --key-file ./delegateKey.pem \\
    --fromAddress klv1ownerAddress... \\
    --permID 2 \\
    --sign --await --result-only
\`\`\`

### Encrypted PEM in automation
\`\`\`bash
~/klever-sdk/koperator sc invoke klv1... myFunc \\
    --key-file ./encrypted-wallet.pem \\
    --password-file /run/secrets/wallet-pass \\
    --sign --await --result-only
\`\`\``,
    {
      title: 'Koperator Global Flags: Signing, Output Control & Automation',
      description:
        'Detailed reference for --sign, --create-only, --await, --result-only, --verbose, TX signing flow, mutual exclusivity constraints, and automation patterns',
      tags: [
        'koperator',
        'global-flags',
        'sign',
        'create-only',
        'await',
        'result-only',
        'verbose',
        'automation',
        'signing-flow',
        'multi-sig',
        'reference',
      ],
      language: 'bash',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),
];

export default koperatorGlobalFlagsKnowledge;
