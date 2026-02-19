# API Reference

## Swagger (Full API Docs)

- **Node API**: `https://node.mainnet.klever.org/swagger/index.html`
- **Indexer API**: `https://api.mainnet.klever.org/swagger/index.html`

Replace `mainnet` with `testnet` or `devnet` for other networks.

## Node API (Port 8080)

Direct blockchain connection. Use for real-time data, transaction building, and VM queries.

### Account

```
GET /address/{address}                        # Full account details
GET /address/{address}/balance                # KLV balance
GET /address/{address}/balance?asset={KDA-ID} # KDA token balance
GET /address/{address}/nonce                  # Transaction nonce
GET /address/{address}/kda?asset={KDA-ID}     # Detailed KDA info + staking
```

### Assets

```
GET /asset/{assetID}              # Asset properties (supply, permissions, roles)
GET /asset/nft/{owner}/{id}       # NFT details for owner
```

### Transactions

```
POST /transaction/send            # Build unsigned transaction (returns proto + hash)
POST /transactions/broadcast      # Broadcast signed transaction
POST /transaction/decode          # Decode proto to JSON
GET  /transaction/{hash}          # Get transaction by hash
```

### Smart Contracts

```
POST /vm/query                    # Read-only contract query
# Body: {"scAddress":"klv1...","funcName":"func","args":["base64..."]}
```

### Blocks & Network

```
GET /block/by-nonce/{nonce}       # Block by number
GET /block/by-hash/{hash}         # Block by hash
GET /node/status                  # Node health
GET /validators                   # Validator list
```

## API Proxy (Port 9090)

Indexed data from ElasticSearch. Use for historical queries and search.

### Account

```
GET /v1.0/address/{address}               # Formatted account data
GET /v1.0/address/{address}/transactions  # Transaction history
```

### Transactions

```
GET /v1.0/transaction/{hash}              # Transaction details
GET /v1.0/transaction/list                # List with filters
```

### Assets

```
GET /v1.0/assets                          # All assets
GET /v1.0/assets/{assetID}               # Asset details
GET /v1.0/assets/{assetID}/holders       # Token holders
GET /v1.0/assets/{collection}/nfts       # NFT collection
```

### Blocks

```
GET /v1.0/block/list                      # List blocks
GET /v1.0/block/by-nonce/{nonce}         # Block by number
```

### Validators & Network

```
GET /v1.0/validators                      # Validator list
GET /v1.0/network/stats                   # Network statistics
GET /v1.0/health                         # API health check
```

## Which Endpoint to Use

| Need | Use |
|---|---|
| Real-time balance | Node: `/address/{addr}/balance` |
| Transaction history | API: `/v1.0/address/{addr}/transactions` |
| Build transaction | Node: `/transaction/send` |
| Query contract | Node: `/vm/query` |
| Search assets | API: `/v1.0/assets` |
| Latest block | API: `/v1.0/block/list?limit=1` |
