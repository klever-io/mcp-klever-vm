import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * Network endpoints documentation for Klever blockchain
 */

export const networkEndpointsKnowledge: KnowledgeEntry[] = [
  // Klever Network Endpoints Reference
  createKnowledgeEntry(
    'documentation',
    `# Klever Network Endpoints Reference

## Node Endpoints (for Koperator)
Node endpoints are used by koperator for transaction broadcasting and blockchain interaction.

### Mainnet
\`\`\`bash
https://node.mainnet.klever.org
\`\`\`

### Testnet
\`\`\`bash
https://node.testnet.klever.org
\`\`\`

### Devnet
\`\`\`bash
https://node.devnet.klever.org
\`\`\`

### Local Development
\`\`\`bash
http://localhost:8080  # Default local node port
\`\`\`

## API Endpoints (for Queries and Data)
API endpoints provide REST APIs for querying blockchain data and smart contracts.

### Mainnet API
\`\`\`bash
https://api.mainnet.klever.org
\`\`\`

### Testnet API
\`\`\`bash
https://api.testnet.klever.org
\`\`\`

### Devnet API
\`\`\`bash
https://api.devnet.klever.org
\`\`\`

### Local API
\`\`\`bash
http://localhost:9090  # Default klever-proxy port
\`\`\`

## Usage Examples

### Setting Node Endpoint for Koperator

#### Environment Variable (Recommended)
\`\`\`bash
# Set for session
export KLEVER_NODE="https://node.testnet.klever.org"

# Use in koperator commands
~/klever-sdk/koperator \\
    --key-file="walletKey.pem" \\
    sc create --wasm="contract.wasm"
\`\`\`

#### Inline with Command
\`\`\`bash
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="walletKey.pem" \\
    sc invoke CONTRACT_ADDRESS FUNCTION
\`\`\`

#### Using --node Parameter
\`\`\`bash
~/klever-sdk/koperator \\
    --node="https://node.testnet.klever.org" \\
    --key-file="walletKey.pem" \\
    sc create --wasm="contract.wasm"
\`\`\`

### Using API Endpoints

#### Smart Contract Query
\`\`\`bash
curl -s 'https://api.testnet.klever.org/v1.0/sc/query' \\
    -H 'Content-Type: application/json' \\
    --data-raw '{
        "ScAddress": "klv1contract...",
        "FuncName": "getValue",
        "Arguments": []
    }'
\`\`\`

#### Get Account Info
\`\`\`bash
curl -s 'https://api.testnet.klever.org/v1.0/accounts/klv1address...'
\`\`\`

#### Get Transaction
\`\`\`bash
curl -s 'https://api.testnet.klever.org/v1.0/transactions/TX_HASH'
\`\`\`

#### Get Block
\`\`\`bash
curl -s 'https://api.testnet.klever.org/v1.0/blocks/BLOCK_NUMBER'
\`\`\`

## Node vs API: When to Use Each

### Use Node Endpoints for:
- Deploying smart contracts (koperator sc create)
- Invoking contract functions (koperator sc invoke)
- Upgrading contracts (koperator sc upgrade)
- Sending transactions
- Account operations via koperator

### Use API Endpoints for:
- Querying smart contract views (read-only)
- Getting account balances and info
- Fetching transaction details
- Retrieving block information
- Exploring blockchain data
- Building dApps and explorers

## Important Notes

1. **Node endpoints** are required for koperator to broadcast transactions
2. **API endpoints** provide REST interfaces for data queries
3. For local development, both node and API typically run on the same port (8080)
4. Always use HTTPS for production (mainnet/testnet)
5. The API has rate limiting - consider this for production applications

## Common Endpoints

### Node Status Check
\`\`\`bash
# Check if node is running
curl -s "https://node.testnet.klever.org/node/status"
\`\`\`

### API Health Check
\`\`\`bash
# Check API health
curl -s "https://api.testnet.klever.org/v1.0/health"
\`\`\`

## Swagger Documentation

### Node Swagger
Direct blockchain node API documentation:
- Mainnet: https://node.mainnet.klever.org/swagger/index.html
- Testnet: https://node.testnet.klever.org/swagger/index.html
- Devnet: https://node.devnet.klever.org/swagger/index.html

### API Swagger
Indexed data API documentation:
- Mainnet: https://api.mainnet.klever.org/swagger/index.html
- Testnet: https://api.testnet.klever.org/swagger/index.html
- Devnet: https://api.devnet.klever.org/swagger/index.html

## Architecture Overview

### Node Endpoint
- Direct connection to blockchain node
- Handles transaction broadcasting
- Provides real-time blockchain state
- Used by koperator for all write operations

### API Endpoint (Klever Proxy)
- Powered by [klever-proxy-go](https://github.com/klever-io/klever-proxy-go)
- Connects to ElasticSearch database
- Provides indexed and searchable blockchain data
- Optimized for read operations and queries

### Indexer Node Configuration
The API data comes from an indexer node with ElasticSearch connector:

\`\`\`yaml
# external.yaml configuration for indexer node
elasticSearchConnector:
  enabled: true
  indexerCacheSize: 100
  url: http://localhost:9200
  useKibana: true
  username:
  password:
  enabledIndexes:
    - transactions      # Transaction history
    - blocks           # Block data
    - accounts         # Account information
    - accountshistory  # Account history
    - assets           # KDA tokens and NFTs
    - proposals        # Governance proposals
    - marketplaces     # NFT marketplaces
    - network-parameters # Network configuration
    - rating           # Validator ratings
    - epoch            # Epoch information
    - accountskda      # Account KDA holdings
    - peersaccounts    # Peer accounts
    - marketplaceorders # Marketplace orders
    - itos             # Initial Token Offerings
    - kdapools         # KDA liquidity pools
    - logs             # Event logs
    - scdeploys        # Smart contract deployments
\`\`\`

## Data Flow Architecture

\`\`\`
Blockchain → Indexer Node → ElasticSearch → Klever Proxy API → Client
                ↓
         (external.yaml)
\`\`\`

1. **Blockchain**: Core Klever blockchain network
2. **Indexer Node**: Regular node with ElasticSearch connector enabled
3. **ElasticSearch**: Stores indexed blockchain data
4. **Klever Proxy**: REST API server that queries ElasticSearch
5. **Client**: Your application or query tool

## Why Two Different Endpoints?

### Node Endpoint
- **Purpose**: Direct blockchain interaction
- **Use Case**: Sending transactions, deploying contracts
- **Data**: Real-time, non-indexed
- **Performance**: Lower latency for writes

### API Endpoint (via Proxy)
- **Purpose**: Query indexed data
- **Use Case**: Search, analytics, historical data
- **Data**: Indexed, searchable, aggregated
- **Performance**: Optimized for complex queries

## Example Use Cases

### When to Use Node Endpoint
\`\`\`bash
# Deploy contract - needs direct node access
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator sc create --wasm="contract.wasm"
\`\`\`

### When to Use API Endpoint
\`\`\`bash
# Search transactions - uses indexed data
curl "https://api.testnet.klever.org/v1.0/transactions?sender=klv1..."

# Get account history - uses indexed data
curl "https://api.testnet.klever.org/v1.0/accounts/klv1.../history"

# Query smart contract - uses indexed data
curl -X POST "https://api.testnet.klever.org/v1.0/sc/query" \\
    -d '{"ScAddress":"klv1...","FuncName":"getValue","Arguments":[]}'
\`\`\``,
    {
      title: 'Klever Network Endpoints Reference',
      description: 'Complete reference for Klever node and API endpoints across all networks',
      tags: ['endpoints', 'network', 'api', 'node', 'mainnet', 'testnet', 'devnet', 'documentation'],
      language: 'bash',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Node vs API Usage Guide
  createKnowledgeEntry(
    'best_practice',
    `# Node vs API: Quick Decision Guide

## Quick Reference Table

| Task | Use | Endpoint | Method |
|------|-----|----------|--------|
| Deploy Contract | Node | KLEVER_NODE + koperator | Transaction |
| Call Contract (Write) | Node | KLEVER_NODE + koperator | Transaction |
| Query Contract (Read) | API | /v1.0/sc/query | POST |
| Get Account Balance | API | /v1.0/accounts/{address} | GET |
| Get Transaction | API | /v1.0/transactions/{hash} | GET |
| Send KLV | Node | KLEVER_NODE + koperator | Transaction |
| Check Node Status | Node | /node/status | GET |

## Examples Side by Side

### Writing to Blockchain (Use Node)
\`\`\`bash
# ✅ Correct: Use node endpoint with koperator
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="wallet.pem" \\
    sc invoke klv1contract... transfer \\
    --args "Address:klv1recipient..." \\
    --args "bi:1000000" \\
    --await --sign
\`\`\`

### Reading from Blockchain (Use API)
\`\`\`bash
# ✅ Correct: Use API endpoint for queries
curl -s 'https://api.testnet.klever.org/v1.0/sc/query' \\
    -H 'Content-Type: application/json' \\
    --data-raw '{
        "ScAddress": "klv1contract...",
        "FuncName": "getBalance",
        "Arguments": ["base64_encoded_address"]
    }'
\`\`\`

## Common Mistakes to Avoid

### ❌ Wrong: Using API for transactions
\`\`\`bash
# This won't work - API can't broadcast transactions
curl -X POST 'https://api.testnet.klever.org/...' \\
    --data '{"deploy": "contract.wasm"}'
\`\`\`

### ❌ Wrong: Using koperator for simple queries
\`\`\`bash
# Inefficient - requires wallet and may consume gas
~/klever-sdk/koperator sc query ...
\`\`\`

### ✅ Correct: Use the right tool for the job
- **Node + Koperator**: When you need to change state
- **API**: When you just need to read data

## Network Selection

### For Development
\`\`\`bash
# Use testnet for development
export KLEVER_NODE="https://node.testnet.klever.org"
export KLEVER_API="https://api.testnet.klever.org"
\`\`\`

### For Production
\`\`\`bash
# Use mainnet for production
export KLEVER_NODE="https://node.mainnet.klever.org"
export KLEVER_API="https://api.mainnet.klever.org"
\`\`\`

### For Local Testing
\`\`\`bash
# Use localhost for local blockchain
export KLEVER_NODE="http://localhost:8080"  # Node port
export KLEVER_API="http://localhost:9090"   # Proxy port
\`\`\`

## Local Development Ports

When running locally, different services use different ports:
- **Node**: Port 8080 (blockchain node)
- **API Proxy**: Port 9090 (klever-proxy-go)
- **ElasticSearch**: Port 9200 (data indexing)
- **Kibana**: Port 5601 (optional, for ES visualization)`,
    {
      title: 'Node vs API Usage Guide',
      description: 'Quick guide for choosing between node and API endpoints',
      tags: ['node', 'api', 'endpoints', 'best-practice', 'guide'],
      language: 'bash',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),
];

export default networkEndpointsKnowledge;