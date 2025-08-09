import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * Comprehensive network endpoints and API documentation for Klever blockchain
 */

export const networkEndpointsKnowledge: KnowledgeEntry[] = [
  // Asset Properties Endpoint
  createKnowledgeEntry(
    'documentation',
    `# Asset Properties Endpoint

## Node API Endpoint for Complete Asset Information

### Endpoint
\`\`\`
GET /asset/{assetID}
\`\`\`

### Description
Retrieve comprehensive properties and configuration for any asset (KLV, KFI, KDA tokens, NFT collections).

### Parameters
- \`{assetID}\`: The asset identifier (e.g., "KLV", "KFI", "USDT-A1B2", "LPKLVKFI-3I0N")

### Example Requests
\`\`\`bash
# Get KLV properties
curl "http://localhost:8080/asset/KLV"

# Get custom token properties  
curl "http://localhost:8080/asset/LPKLVKFI-3I0N"

# Get NFT collection properties
curl "https://node.testnet.klever.org/asset/MYNFT-A1B2"
\`\`\`

### Response Format - KDA Token Example
\`\`\`json
{
  "data": {
    "asset": {
      "ID": "TFBLTFZLRkktM0kwTg==",
      "Name": "TFBLTFZLRkk=",
      "Ticker": "TFBLTFZLRkk=",
      "OwnerAddress": "AAAAAAAAAAAFAMgZoFqFvjJxcXvlBTPd50Da3BxAw+Y=",
      "Precision": 6,
      "InitialSupply": 1000,
      "CirculatingSupply": 100001000,
      "MintedValue": 100001000,
      "IssueDate": 1754757945,
      "Royalties": {
        "Address": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="
      },
      "Properties": {
        "CanFreeze": true,
        "CanWipe": true,
        "CanPause": true,
        "CanMint": true,
        "CanBurn": true,
        "CanChangeOwner": true,
        "CanAddRoles": true
      },
      "Attributes": {},
      "Roles": [
        {
          "Address": "AAAAAAAAAAAFAKMCVDuF4gE0Fcq3qD+nLXWPw0psw+Y=",
          "HasRoleMint": true,
          "HasRoleSetITOPrices": true,
          "HasRoleDeposit": true,
          "HasRoleTransfer": true
        }
      ],
      "AdminAddress": "AAAAAAAAAAAFAMgZoFqFvjJxcXvlBTPd50Da3BxAw+Y="
    }
  },
  "error": "",
  "code": "successful"
}
\`\`\`

### Response Format - KLV Example
\`\`\`json
{
  "data": {
    "asset": {
      "ID": "S0xW",
      "Name": "S0xFVkVS",
      "Ticker": "S0xW",
      "Logo": "https://bc.klever.finance/logo_klv",
      "URIs": {
        "Exchange": "https://klever.io",
        "Github": "https://github.com/klever-io",
        "Instagram": "https://instagram.com/klever.io",
        "Twitter": "https://twitter.com/klever_io",
        "Wallet": "https://klever.finance/wallet",
        "Website": "https://klever.finance",
        "Whitepaper": "https://bc.klever.finance/wp"
      },
      "Precision": 6,
      "InitialSupply": 29000000000000,
      "CirculatingSupply": 28995438394794,
      "MaxSupply": 10000000000000000,
      "MintedValue": 29000000000000,
      "BurnedValue": 4561605206,
      "IssueDate": 1754750421,
      "Properties": {
        "CanFreeze": true,
        "CanMint": true,
        "CanBurn": true
      },
      "Attributes": {
        "IsNFTMintStopped": true
      }
    }
  },
  "error": "",
  "code": "successful"
}
\`\`\`

### JavaScript/TypeScript Example
\`\`\`javascript
async function getAssetProperties(assetId, network = 'testnet') {
    const baseUrl = network === 'local' 
        ? 'http://localhost:8080' 
        : \`https://node.\${network}.klever.org\`;
    
    const response = await fetch(\`\${baseUrl}/asset/\${assetId}\`);
    const result = await response.json();
    
    if (result.code === 'successful') {
        const asset = result.data.asset;
        
        // Decode base64 fields
        return {
            id: atob(asset.ID),
            name: atob(asset.Name),
            ticker: atob(asset.Ticker),
            precision: asset.Precision,
            supply: {
                initial: asset.InitialSupply,
                circulating: asset.CirculatingSupply,
                max: asset.MaxSupply,
                minted: asset.MintedValue,
                burned: asset.BurnedValue
            },
            properties: asset.Properties,
            roles: asset.Roles,
            uris: asset.URIs,
            logo: asset.Logo
        };
    }
    
    throw new Error(result.error || 'Failed to fetch asset properties');
}

// Usage examples
const klvInfo = await getAssetProperties('KLV', 'local');
console.log('KLV Precision:', klvInfo.precision);
console.log('KLV Properties:', klvInfo.properties);

const lpTokenInfo = await getAssetProperties('LPKLVKFI-3I0N', 'local');
console.log('LP Token Supply:', lpTokenInfo.supply.circulating);
console.log('Can Mint:', lpTokenInfo.properties.CanMint);
\`\`\`

### Key Information Provided
- **Asset Identification**: ID, Name, Ticker (base64 encoded)
- **Supply Information**: Initial, Circulating, Max, Minted, Burned values
- **Properties**: Permissions like CanMint, CanBurn, CanFreeze, etc.
- **Roles**: Addresses with special permissions
- **Metadata**: URIs, Logo, social links (for major assets)
- **Precision**: Decimal places for the asset

### Use Cases
- Verify token permissions before operations
- Check circulating supply and max supply
- Validate asset properties for DeFi protocols
- Monitor minting and burning activity
- Retrieve asset metadata and social links`,
    {
      title: 'Asset Properties Endpoint',
      description: 'Node API endpoint for retrieving complete asset properties and configuration',
      tags: ['api', 'node', 'asset', 'properties', 'token', 'kda', 'configuration'],
      language: 'javascript',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // NFT Asset Details Endpoint
  createKnowledgeEntry(
    'documentation',
    `# NFT Asset Details Endpoint

## Node API Endpoint for NFT Information

### Endpoint
\`\`\`
GET /asset/nft/{owner}/{id}
\`\`\`

### Description
Retrieve detailed information about a specific NFT for a given owner address.

### Parameters
- \`{owner}\`: The Klever address of the NFT owner
- \`{id}\`: The NFT asset ID (e.g., "MYNFT-A1B2/01" where 01 is the nonce)

### Example Request
\`\`\`bash
# Local network example
curl "http://localhost:8080/asset/nft/klv1owner.../MYNFT-A1B2/01"

# Testnet example
curl "https://node.testnet.klever.org/asset/nft/klv1abc.../ARTNFT-XY78/42"
\`\`\`

### Response Format
\`\`\`json
{
  "data": {
    "assetId": "MYNFT-A1B2/01",
    "ownerAddress": "klv1owner...",
    "attributes": {
      // NFT attributes and metadata
    },
    "uri": "ipfs://...",
    "royalties": {
      // Royalty information if applicable
    }
  },
  "error": "",
  "code": "successful"
}
\`\`\`

### JavaScript/TypeScript Example
\`\`\`javascript
async function getNFTDetails(ownerAddress, nftId, network = 'testnet') {
    const baseUrl = network === 'local' 
        ? 'http://localhost:8080' 
        : \`https://node.\${network}.klever.org\`;
    
    const response = await fetch(
        \`\${baseUrl}/asset/nft/\${ownerAddress}/\${nftId}\`
    );
    
    const result = await response.json();
    
    if (result.code === 'successful') {
        return result.data;
    }
    
    throw new Error(result.error || 'Failed to fetch NFT details');
}

// Usage
const nftDetails = await getNFTDetails(
    'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqlllllh',
    'COOLNFT-A1B2/01',
    'testnet'
);

console.log('NFT ID:', nftDetails.assetId);
console.log('Owner:', nftDetails.ownerAddress);
console.log('Metadata URI:', nftDetails.uri);
\`\`\`

### Notes
- The ID format includes both the collection identifier and the nonce
- This endpoint returns detailed NFT metadata including attributes and URIs
- For fungible tokens (KDA), use the balance or kda endpoints instead`,
    {
      title: 'NFT Asset Details Endpoint',
      description: 'Node API endpoint for querying NFT ownership and metadata',
      tags: ['api', 'node', 'nft', 'asset', 'metadata', 'endpoint'],
      language: 'javascript',
      relevanceScore: 0.9,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // KDA Token Detailed Info Endpoint
  createKnowledgeEntry(
    'documentation',
    `# KDA Token Detailed Information Endpoint

## Node API Endpoint for Detailed KDA Token Information

### Endpoint
\`\`\`
GET /address/{address}/kda?asset={KDA-ID}
\`\`\`

### Description
Retrieve detailed information about a specific KDA token for a given address, including staking mechanisms and claim data.

### Parameters
- \`{address}\`: The Klever address to query
- \`asset\`: Query parameter with the KDA token ID (e.g., "LPKLVKFI-3I0N", "USDT-A1B2")

### Example Request
\`\`\`bash
# Local network example
curl "http://localhost:8080/address/klv17e8zzgn73h6ehe3c6q9vlt77kuxk5euddmhymy5uhv2rhv0dc0nqlfp0ap/kda?asset=LPKLVKFI-3I0N"

# Testnet example
curl "https://node.testnet.klever.org/address/klv1abc.../kda?asset=USDT-A1B2"
\`\`\`

### Response Format
\`\`\`json
{
  "data": {
    "address": "klv17e8zzgn73h6ehe3c6q9vlt77kuxk5euddmhymy5uhv2rhv0dc0nqlfp0ap",
    "asset": "LPKLVKFI-3I0N",
    "userKDA": {
      "LastClaim": {
        // Staking/claim related data if applicable
      }
      // Additional KDA-specific data
    }
  },
  "error": "",
  "code": "successful"
}
\`\`\`

### JavaScript/TypeScript Example
\`\`\`javascript
async function getKDATokenDetails(address, tokenId, network = 'testnet') {
    const baseUrl = network === 'local' 
        ? 'http://localhost:8080' 
        : \`https://node.\${network}.klever.org\`;
    
    const response = await fetch(
        \`\${baseUrl}/address/\${address}/kda?asset=\${tokenId}\`
    );
    
    const result = await response.json();
    
    if (result.code === 'successful') {
        return result.data;
    }
    
    throw new Error(result.error || 'Failed to fetch KDA details');
}

// Usage
const kdaDetails = await getKDATokenDetails(
    'klv17e8zzgn73h6ehe3c6q9vlt77kuxk5euddmhymy5uhv2rhv0dc0nqlfp0ap',
    'LPKLVKFI-3I0N',
    'local'
);

console.log('Asset:', kdaDetails.asset);
console.log('User KDA Info:', kdaDetails.userKDA);
console.log('Last Claim:', kdaDetails.userKDA?.LastClaim);
\`\`\`

### Differences from Balance Endpoint
- \`/balance?asset={KDA-ID}\`: Returns only the balance amount
- \`/kda?asset={KDA-ID}\`: Returns detailed information including staking/claim data

### Use Cases
- Check staking rewards and claim information
- Get detailed KDA metadata
- Monitor liquidity pool positions
- Track NFT/SFT ownership details`,
    {
      title: 'KDA Token Detailed Information Endpoint',
      description: 'Node API endpoint for querying detailed KDA token information including staking data',
      tags: ['api', 'node', 'kda', 'staking', 'tokens', 'endpoint', 'claims'],
      language: 'javascript',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // KDA Token Balance Endpoint
  createKnowledgeEntry(
    'documentation',
    `# KDA Token Balance Query Endpoint

## Node API Endpoint for Specific KDA Token Balance

### Endpoint
\`\`\`
GET /address/{address}/balance?asset={KDA-ID}
\`\`\`

### Description
Retrieve the balance of a specific KDA token for a given address directly from the node.

### Parameters
- \`{address}\`: The Klever address to query
- \`asset\`: Query parameter with the KDA token ID (e.g., "USDT-A1B2", "LPKLVKFI-3I0N")

### Example Request
\`\`\`bash
# Local network example
curl "http://localhost:8080/address/klv17e8zzgn73h6ehe3c6q9vlt77kuxk5euddmhymy5uhv2rhv0dc0nqlfp0ap/balance?asset=LPKLVKFI-3I0N"

# Testnet example
curl "https://node.testnet.klever.org/address/klv1abc.../balance?asset=USDT-A1B2"
\`\`\`

### Response Format
\`\`\`json
{
  "data": {
    "balance": 99999000
  },
  "error": "",
  "code": "successful"
}
\`\`\`

### JavaScript/TypeScript Example
\`\`\`javascript
async function getKDATokenBalance(address, tokenId, network = 'testnet') {
    const baseUrl = network === 'local' 
        ? 'http://localhost:8080' 
        : \`https://node.\${network}.klever.org\`;
    
    const response = await fetch(
        \`\${baseUrl}/address/\${address}/balance?asset=\${tokenId}\`
    );
    
    const result = await response.json();
    
    if (result.code === 'successful') {
        return result.data.balance;
    }
    
    throw new Error(result.error || 'Failed to fetch balance');
}

// Usage
const balance = await getKDATokenBalance(
    'klv17e8zzgn73h6ehe3c6q9vlt77kuxk5euddmhymy5uhv2rhv0dc0nqlfp0ap',
    'LPKLVKFI-3I0N',
    'local'
);
console.log('Balance:', balance / 1e6, 'tokens'); // Assuming 6 decimals
\`\`\`

### Notes
- This endpoint returns the balance for a single KDA token
- For KLV balance, use \`/address/{address}/balance\` without the asset parameter
- For detailed KDA info with staking data, use \`/address/{address}/kda?asset={KDA-ID}\`
- Balance is returned in the smallest unit (consider token decimals)`,
    {
      title: 'KDA Token Balance Query Endpoint',
      description: 'Node API endpoint for querying specific KDA token balances',
      tags: ['api', 'node', 'kda', 'balance', 'tokens', 'endpoint'],
      language: 'javascript',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

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
GET /address/{address}/balance?asset={KDA-ID} # Specific KDA token balance (simple)
GET /address/{address}/nonce                  # Transaction nonce
GET /address/{address}/kda?asset={KDA-ID}     # Detailed KDA info with staking data
GET /address/{address}/code                   # Contract bytecode (if SC)
\`\`\`

### Asset Operations
\`\`\`bash
GET /asset/{assetID}                          # Complete asset properties and configuration
GET /asset/nft/{owner}/{id}                   # NFT details for specific owner and asset
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
- Specific token balance: \`GET node.../address/{addr}/balance?asset={KDA-ID}\`
- Detailed KDA info: \`GET node.../address/{addr}/kda?asset={KDA-ID}\`

**Get transaction history**
- \`GET api.../v1.0/address/{addr}/transactions\`

### Asset/Token Operations
**Get asset properties**
- \`GET node.../asset/{assetID}\` (properties, supply, permissions)

**Get NFT details**
- \`GET node.../asset/nft/{owner}/{nft-id}\`

**Check token permissions**
- Query asset properties to verify CanMint, CanBurn, etc.

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

## Pattern: Get Specific KDA Token Balance
\`\`\`javascript
async function getKDABalance(address, tokenId) {
    // Simple balance endpoint
    const response = await fetch(
        \`https://node.testnet.klever.org/address/\${address}/balance?asset=\${tokenId}\`
    );
    const result = await response.json();
    
    // Returns format: {"data":{"balance":99999000},"error":"","code":"successful"}
    return result.data?.balance || 0;
}

async function getKDADetails(address, tokenId) {
    // Detailed KDA info endpoint (includes staking data)
    const response = await fetch(
        \`https://node.testnet.klever.org/address/\${address}/kda?asset=\${tokenId}\`
    );
    const result = await response.json();
    
    // Returns full KDA details with userKDA info
    return result.data;
}

// Example usage:
const lpBalance = await getKDABalance(
    "klv17e8zzgn73h6ehe3c6q9vlt77kuxk5euddmhymy5uhv2rhv0dc0nqlfp0ap",
    "LPKLVKFI-3I0N"
);
console.log("LP Token Balance:", lpBalance); // 99999000 (6 decimals)

// Get detailed info including staking
const lpDetails = await getKDADetails(
    "klv17e8zzgn73h6ehe3c6q9vlt77kuxk5euddmhymy5uhv2rhv0dc0nqlfp0ap",
    "LPKLVKFI-3I0N"
);
console.log("Staking info:", lpDetails.userKDA);
\`\`\`

## Pattern: Get Asset Properties
\`\`\`javascript
async function getAssetInfo(assetId) {
    const response = await fetch(
        \`https://node.testnet.klever.org/asset/\${assetId}\`
    );
    const result = await response.json();
    
    if (result.code === 'successful') {
        const asset = result.data.asset;
        return {
            name: atob(asset.Name || ''),
            ticker: atob(asset.Ticker || ''),
            precision: asset.Precision,
            circulatingSupply: asset.CirculatingSupply,
            canMint: asset.Properties?.CanMint || false,
            canBurn: asset.Properties?.CanBurn || false,
            canFreeze: asset.Properties?.CanFreeze || false
        };
    }
    return null;
}

// Check if a token can be minted
const tokenInfo = await getAssetInfo('MYTOKEN-A1B2');
if (tokenInfo?.canMint) {
    console.log('Token can be minted');
}
console.log('Circulating:', tokenInfo.circulatingSupply);
\`\`\`

## Pattern: Query NFT Details
\`\`\`javascript
async function getNFT(ownerAddress, nftId) {
    const response = await fetch(
        \`https://node.testnet.klever.org/asset/nft/\${ownerAddress}/\${nftId}\`
    );
    const result = await response.json();
    
    if (result.code === 'successful') {
        return result.data;
    }
    
    return null;
}

// Example: Check NFT ownership and metadata
const nft = await getNFT(
    "klv1useraddress...",
    "MYNFT-A1B2/01"  // Collection ID + "/" + nonce
);

if (nft) {
    console.log("NFT owned by:", nft.ownerAddress);
    console.log("Metadata URI:", nft.uri);
    console.log("Attributes:", nft.attributes);
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