import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * Comprehensive network endpoints and API documentation for Klever blockchain
 */

export const networkEndpointsKnowledge: KnowledgeEntry[] = [
  // Main Network Endpoints Reference
  createKnowledgeEntry(
    'documentation',
    `# Klever Network Endpoints Reference

## Quick Network URLs

### Mainnet
- **Node**: https://node.mainnet.klever.org
- **API**: https://api.mainnet.klever.org
- **Swagger Node**: https://node.mainnet.klever.org/swagger/index.html
- **Swagger API**: https://api.mainnet.klever.org/swagger/index.html

### Testnet
- **Node**: https://node.testnet.klever.org
- **API**: https://api.testnet.klever.org
- **Swagger Node**: https://node.testnet.klever.org/swagger/index.html
- **Swagger API**: https://api.testnet.klever.org/swagger/index.html

### Devnet
- **Node**: https://node.devnet.klever.org
- **API**: https://api.devnet.klever.org
- **Swagger Node**: https://node.devnet.klever.org/swagger/index.html
- **Swagger API**: https://api.devnet.klever.org/swagger/index.html

### Local Development
- **Node**: http://localhost:8080 (blockchain node)
- **API**: http://localhost:9090 (klever-proxy)
- **ElasticSearch**: http://localhost:9200
- **Kibana**: http://localhost:5601 (optional)

## Architecture Overview

### Data Flow
\`\`\`
Blockchain → Indexer Node → ElasticSearch → Klever Proxy API → Client
                ↓
         (external.yaml)
\`\`\`

### Node Endpoint
- Direct blockchain connection
- Real-time data
- Transaction broadcasting
- Used by koperator

### API Endpoint (Klever Proxy)
- Powered by [klever-proxy-go](https://github.com/klever-io/klever-proxy-go)
- Indexed data from ElasticSearch
- Historical queries
- Search capabilities

## When to Use Which Endpoint

### Use Node Endpoints for:
✅ Transaction broadcasting
✅ Real-time blockchain state
✅ Contract deployment
✅ Direct VM queries
✅ Latest block info

### Use API Proxy for:
✅ Transaction history
✅ Account history
✅ Asset searches
✅ Complex queries
✅ Indexed data`,
    {
      title: 'Klever Network Endpoints Overview',
      description: 'Main reference for Klever network endpoints and architecture',
      tags: ['endpoints', 'network', 'api', 'node', 'architecture', 'documentation'],
      language: 'markdown',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Complete Endpoint Reference
  createKnowledgeEntry(
    'documentation',
    `# Complete Klever Endpoint Reference

## Node Direct Endpoints

### Account Operations
\`\`\`bash
GET /address/{address}                        # Full account details
GET /address/{address}/balance                # KLV balance
GET /address/{address}/nonce                  # Transaction nonce
GET /address/{address}/kda                    # All KDA tokens
GET /address/{address}/kda/{tokenID}          # Specific token balance
GET /address/{address}/kda/{tokenID}/nonce/{nonce}  # NFT details
GET /address/{address}/code                   # Contract bytecode (if SC)
\`\`\`

### Transaction Operations
\`\`\`bash
POST /transaction/send         # Build unsigned transaction (returns proto + hash)
POST /transactions/broadcast   # Broadcast signed transaction
POST /transaction/decode       # Decode proto to human-readable JSON
POST /transaction/cost         # Calculate transaction cost
GET /transaction/{hash}        # Get transaction by hash
\`\`\`

### Block Operations
\`\`\`bash
GET /block/by-nonce/{nonce}   # Get block by number
GET /block/by-hash/{hash}     # Get block by hash
\`\`\`

### Smart Contract VM
\`\`\`bash
POST /vm/query                # Query contract view directly
# Body: {"scAddress": "klv1...", "funcName": "getValue", "args": ["base64..."]}
\`\`\`

### Network Information
\`\`\`bash
GET /node/status              # Node health and sync status
GET /network/config           # Network configuration
GET /network/economics        # Economic parameters
GET /network/parameters       # Network parameters
GET /validators               # All validators
GET /validators/{address}     # Specific validator
\`\`\`

## API Proxy Endpoints (Port 9090)

### Account Endpoints
\`\`\`bash
GET /v1.0/address/{address}                   # Account with formatted data
GET /v1.0/address/{address}/overview          # Account overview
GET /v1.0/address/{address}/transactions      # Transaction list
GET /v1.0/address/list                        # List addresses (with filters)
\`\`\`

### Transaction Endpoints
\`\`\`bash
GET /v1.0/transaction/{hash}                  # Transaction details
GET /v1.0/transaction/list                    # List transactions with filters
POST /transaction/decode                      # Decode transaction proto
GET /transaction/statistics                   # Transaction statistics
\`\`\`

### Smart Contract Endpoints
\`\`\`bash
POST /v1.0/sc/query                          # Query contract (indexed)
# Body: {"ScAddress": "klv1...", "FuncName": "getValue", "Arguments": ["base64..."]}
GET /v1.0/sc/list                            # List deployed contracts
GET /v1.0/sc/{address}                       # Contract details
GET /v1.0/sc/invokes/{scAddress}             # Contract invocation history
\`\`\`

### Asset Endpoints
\`\`\`bash
GET /v1.0/assets                             # All assets
GET /v1.0/assets/{assetID}                   # Asset details
GET /v1.0/assets/{assetID}/holders           # Token holders
GET /v1.0/assets/{collection}/nfts           # NFT collection
\`\`\`

### Block Endpoints
\`\`\`bash
GET /v1.0/block/list                         # List blocks with pagination
GET /v1.0/block/by-nonce/{nonce}             # Block by number
GET /v1.0/block/by-hash/{hash}               # Block by hash
\`\`\`

### Network Statistics
\`\`\`bash
GET /v1.0/network/stats                      # Network statistics
GET /v1.0/epoch/current                      # Current epoch
GET /v1.0/validators                         # Validator list
GET /v1.0/health                            # API health check
\`\`\``,
    {
      title: 'Complete Endpoint Reference',
      description: 'Comprehensive listing of all Klever node and API endpoints',
      tags: ['endpoints', 'api', 'node', 'reference', 'documentation'],
      language: 'bash',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Transaction Workflow
  createKnowledgeEntry(
    'deployment_tool',
    `# Transaction Building and Broadcasting Flow

## Complete Transaction Lifecycle

### Step 1: Get Account Nonce
\`\`\`bash
NONCE=$(curl -s "https://node.testnet.klever.org/address/klv1sender.../nonce" | jq -r '.nonce')
echo "Current nonce: $NONCE"
\`\`\`

### Step 2: Build Transaction (Unsigned)
\`\`\`bash
# POST /transaction/send creates unsigned tx with computed hash
TX_RESPONSE=$(curl -s -X POST "https://node.testnet.klever.org/transaction/send" \
    -H "Content-Type: application/json" \
    -d '{
        "type": "transfer",
        "sender": "klv1sender...",
        "receiver": "klv1receiver...",
        "amount": 1000000,
        "nonce": '$NONCE',
        "gasPrice": 1000000000,
        "gasLimit": 50000
    }')

TX_HASH=$(echo $TX_RESPONSE | jq -r '.hash')
TX_DATA=$(echo $TX_RESPONSE | jq -r '.tx')
\`\`\`

### Step 3: Sign Transaction (Client-side)
\`\`\`javascript
// Client-side signing with private key
// NEVER send private keys to any API!
const signature = await signWithPrivateKey(privateKey, txHash);
\`\`\`

### Step 4: Broadcast Signed Transaction
\`\`\`bash
RESULT=$(curl -s -X POST "https://node.testnet.klever.org/transactions/broadcast" \
    -H "Content-Type: application/json" \
    -d '{
        "tx": "'$TX_DATA'",
        "signature": "'$SIGNATURE'"
    }')

BROADCAST_HASH=$(echo $RESULT | jq -r '.txHash')
\`\`\`

### Step 5: Monitor Transaction
\`\`\`bash
# Wait for indexing (usually 2-6 seconds)
sleep 5

# Check status via API
curl -s "https://api.testnet.klever.org/v1.0/transactions/$BROADCAST_HASH" | jq '.status'
\`\`\`

## Important Notes
- Node NEVER handles private keys
- Signing is ALWAYS client-side
- /transaction/send does NOT send, it only builds
- /transactions/broadcast requires pre-signed tx`,
    {
      title: 'Transaction Building and Broadcasting',
      description: 'Complete workflow for building and sending transactions',
      tags: ['transaction', 'workflow', 'signing', 'broadcasting', 'deployment'],
      language: 'bash',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Quick Task Reference
  createKnowledgeEntry(
    'best_practice',
    `# Quick Task → Endpoint Guide

## "I need to..." Quick Reference

### Account Information
**Get KLV balance**
- Real-time: \`GET node.../address/{addr}/balance\`
- With details: \`GET api.../v1.0/address/{addr}\`

**Get transaction nonce for building tx**
- \`GET node.../address/{addr}/nonce\`

**Get account's KDA tokens**
- \`GET node.../address/{addr}/kda\` (direct from node)

**Get transaction history**
- \`GET api.../v1.0/address/{addr}/transactions\`

### Smart Contracts
**Deploy contract**
- Use koperator with KLEVER_NODE

**Call contract (write)**
- Use koperator with KLEVER_NODE

**Query contract (read)**
- Indexed: \`POST api.../v1.0/sc/query\`
- Direct: \`POST node.../vm/query\`

### Transactions
**Build transaction**
- \`POST node.../transaction/send\`

**Broadcast signed tx**
- \`POST node.../transactions/broadcast\`

**Check tx status**
- \`GET api.../v1.0/transactions/{hash}\`

**Decode transaction**
- \`POST node.../transaction/decode\`

### Network Info
**Check if node is healthy**
- \`GET node.../node/status\`

**Get latest block**
- \`GET api.../v1.0/block/list?limit=1\` (via API proxy)

**Get network stats**
- \`GET api.../v1.0/network/stats\`

## Decision Helper

\`\`\`
Need real-time data?
  → Use Node endpoint directly

Need historical/searchable data?
  → Use API proxy endpoint

Need to modify blockchain state?
  → Use Node + Koperator

Just reading contract data?
  → Use API /v1.0/sc/query
\`\`\``,
    {
      title: 'Quick Task to Endpoint Guide',
      description: 'Task-based quick reference for finding the right endpoint',
      tags: ['quick-reference', 'tasks', 'endpoints', 'best-practice', 'guide'],
      language: 'text',
      relevanceScore: 0.9,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Common Patterns
  createKnowledgeEntry(
    'code_example',
    `# Common API Usage Patterns

## Pattern: Get Full Account Balance
\`\`\`javascript
async function getFullBalance(address) {
    const [account, kdaTokens] = await Promise.all([
        fetch(\`https://api.testnet.klever.org/v1.0/address/\${address}\`).then(r => r.json()),
        fetch(\`https://node.testnet.klever.org/address/\${address}/kda\`).then(r => r.json())
    ]);
    
    return {
        klv: account.data?.balance,
        nonce: account.data?.nonce,
        tokens: kdaTokens.data?.kdas || []
    };
}
\`\`\`

## Pattern: Query Smart Contract
\`\`\`javascript
async function queryContract(contract, funcName, args = []) {
    const response = await fetch('https://api.testnet.klever.org/v1.0/sc/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ScAddress: contract,
            FuncName: funcName,
            Arguments: args  // Must be base64 encoded!
        })
    });
    
    const result = await response.json();
    if (result.data?.returnData) {
        // Decode base64 results
        return result.data.returnData.map(d => 
            Buffer.from(d, 'base64').toString('hex')
        );
    }
    throw new Error(result.error || 'Query failed');
}

// Helper to encode arguments
function encodeArg(value, type = 'auto') {
    if (type === 'address' || value.startsWith('klv1')) {
        // Decode bech32 address to hex, then base64
        const hex = decodeBech32(value);
        return Buffer.from(hex, 'hex').toString('base64');
    }
    if (type === 'number' || !isNaN(value)) {
        // Convert to 8-byte big-endian
        const buf = Buffer.alloc(8);
        buf.writeBigUInt64BE(BigInt(value));
        return buf.toString('base64');
    }
    // String: direct base64
    return Buffer.from(value).toString('base64');
}
\`\`\`

## Pattern: Monitor Transaction
\`\`\`javascript
async function waitForTx(txHash, maxWait = 30000) {
    const start = Date.now();
    
    while (Date.now() - start < maxWait) {
        try {
            const res = await fetch(\`https://api.testnet.klever.org/v1.0/transaction/\${txHash}\`);
            if (res.ok) {
                const tx = await res.json();
                return { success: tx.data?.status === 'success', tx: tx.data };
            }
        } catch (e) {
            // Not indexed yet
        }
        await new Promise(r => setTimeout(r, 2000));
    }
    throw new Error('Transaction timeout');
}
\`\`\`

## Pattern: Build & Send Transaction
\`\`\`javascript
async function sendKLV(from, to, amount, privateKey) {
    // 1. Get nonce
    const nonceRes = await fetch(\`https://node.testnet.klever.org/address/\${from}/nonce\`);
    const { nonce } = await nonceRes.json();
    
    // 2. Build unsigned tx
    const buildRes = await fetch('https://node.testnet.klever.org/transaction/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            type: 'transfer',
            sender: from,
            receiver: to,
            amount: amount,
            nonce: nonce,
            gasPrice: 1000000000,
            gasLimit: 50000
        })
    });
    const { hash, tx } = await buildRes.json();
    
    // 3. Sign (client-side - implement based on your crypto library)
    const signature = await signTransaction(privateKey, hash);
    
    // 4. Broadcast
    const broadcastRes = await fetch('https://node.testnet.klever.org/transactions/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tx, signature })
    });
    
    const result = await broadcastRes.json();
    return result.txHash;
}
\`\`\``,
    {
      title: 'Common API Usage Patterns',
      description: 'JavaScript patterns for common Klever API operations',
      tags: ['api', 'patterns', 'javascript', 'examples', 'code'],
      language: 'javascript',
      relevanceScore: 0.85,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),
];

export default networkEndpointsKnowledge;