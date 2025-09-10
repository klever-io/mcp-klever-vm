import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * Common utilities and helper scripts knowledge
 */

export const commonUtilitiesKnowledge: KnowledgeEntry[] = [
  // Helper Scripts with Common Utilities
  createKnowledgeEntry(
    'deployment_tool',
    `# Klever Helper Scripts with Common Utilities
## common.sh - Shared Utilities Library
All modern Klever helper scripts now source a common.sh file providing:

### Color Definitions
- RED, GREEN, YELLOW, BLUE, CYAN, MAGENTA, BOLD, RESET

### KLV Conversion Functions (6 decimals)
- klv_to_units(amount) - Convert KLV to smallest units
- units_to_klv(units) - Convert units to KLV

### Number Formatting
- format_number(num) - Add underscore separators (1000000 → 1_000_000)
- parse_number(num) - Remove underscores (1_000_000 → 1000000)

### Bech32 Address Handling
- decode_bech32_address(klv1...) - Decode Klever address to hex

### Network Management
- set_network_endpoint(network) - Get node URL for network
- get_api_endpoint(network) - Get API URL for queries
- Networks: mainnet, testnet, devnet, local

### Contract History
- get_contract_from_history(network, file) - Get deployed contract address

### Query Helpers
- encode_arg(value) - Encode arguments for API calls
- query_contract(contract, endpoint, api_url, args...) - Make API query

## Enhanced ReturnData Parsing in query.sh
The query script now properly handles:
- Empty strings ("") as zero values
- Base64 to hex decoding
- String value detection
- Number parsing with formatting
- KLV amount conversion (6 decimals)
- Multiple output formats: json, raw, decoded

### Empty Value Handling
\`\`\`bash
# Empty returnData often means zero
if [ -z "$RETURN_DATA" ] || [ "$RETURN_DATA" = "" ]; then
    echo "Value: 0 (empty result)"
    echo "Note: Empty return data typically represents zero or an empty value"
fi
\`\`\`

### Multiple Data Interpretations
For each returnData value:
1. Base64 decode to hex
2. Try as printable string
3. Parse as number (up to 8 bytes)
4. Format with underscores
5. Convert to KLV if > 1,000,000 units

## Usage Examples

### Query with Enhanced Decoding
\`\`\`bash
# Query with enhanced decoding
./scripts/query.sh --contract klv1... --endpoint getBalance --format decoded

# Output shows:
# Base64: AAAAAAAF3EA=
# Hex: 0x00000000000F4240
# Number: 1_000_000
# Possible KLV: 1.000000 KLV (1_000_000 units)
\`\`\`

### Deploy with Network Selection
\`\`\`bash
# Deploy to specific network
NETWORK=testnet ./scripts/deploy.sh
NETWORK=mainnet ./scripts/deploy.sh
NETWORK=local ./scripts/deploy.sh
\`\`\`

### Interactive Menu with Enhanced Features
\`\`\`bash
# Interactive script sources common.sh
./scripts/interact.sh
# Provides formatted numbers, KLV conversions, network switching
\`\`\``,
    {
      title: 'Klever Helper Scripts with Common Utilities',
      description: 'Modern helper scripts with shared utilities, advanced returnData parsing, and empty value handling',
      tags: ['scripts', 'common.sh', 'utilities', 'returnData', 'parsing', 'KLV', 'conversion', 'network', 'bech32', 'formatting', 'helper', 'shared'],
      language: 'bash',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Testnet Faucet
  createKnowledgeEntry(
    'deployment_tool',
    `# Klever Testnet Faucet - Get Free Test KLV

## When to Use the Faucet
Use the Klever testnet faucet when you encounter these situations:
- **Insufficient funds** for transactions or deployments
- **Zero balance** in your testnet wallet
- **Low KLV balance** preventing contract interactions
- **Need test tokens** for development and testing
- **Transaction fails** due to insufficient balance
- **Cannot deploy contracts** due to lack of funds
- **Error messages** about insufficient balance or fees

## Request Test Funds
To request test funds on Klever testnet, you can make a POST request to the faucet:

\`\`\`javascript
// Request funds for an account on testnet
const url = \`https://api.testnet.klever.org/v1.0/transaction/send-user-funds/\${Settings.getAddress()}\`;
const options = {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
};

fetch(url, options)
    .then(response => response.json())
    .then(result => console.log("Funds requested:", result))
    .catch(error => console.error("Error:", error));
\`\`\`

## cURL Example
\`\`\`bash
curl -X POST "https://api.testnet.klever.org/v1.0/transaction/send-user-funds/YOUR_ADDRESS" \\
     -H "Content-Type: application/json"
\`\`\`

## Common Error Messages That Indicate Need for Faucet
- "insufficient funds"
- "balance too low"
- "not enough KLV"
- "transaction failed: insufficient balance"
- "cannot pay transaction fees"
- "account has zero balance"

**Important Notes:**
- Only works on **testnet**, not mainnet
- Rate limiting: typically a few requests per address per day
- Funds are only for testing purposes`,
    {
      title: 'Klever Testnet Faucet - Get Free Test KLV',
      description: 'How to request test funds when you have insufficient balance, zero funds, or low KLV for testnet development',
      tags: ['faucet', 'testnet', 'fund', 'outoffunds', 'balance', 'insufficient', 'funds', 'zero', 'low'],
      contractType: 'any',
      author: 'klever-mcp',
      relevanceScore: 1.0,
    }
  ),
];

export default commonUtilitiesKnowledge;