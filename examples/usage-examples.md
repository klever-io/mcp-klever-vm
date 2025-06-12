# Klever MCP Server Usage Examples

## 1. Query for Storage Mapper Guidance

```bash
# Find the best storage mapper for a whitelist
curl -X POST http://localhost:3000/api/context/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "whitelist storage",
    "types": ["best_practice", "optimization"],
    "limit": 5
  }'
```

## 2. Get Event Annotation Examples

```bash
# Get proper event annotation patterns
curl -X POST http://localhost:3000/api/context/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "event annotation",
    "types": ["code_example", "best_practice"],
    "tags": ["events"],
    "limit": 3
  }'
```

## 3. Find Deployment Scripts

```bash
# Get deployment script examples
curl -X POST http://localhost:3000/api/context/query \
  -H "Content-Type: application/json" \
  -d '{
    "tags": ["deployment", "script"],
    "types": ["code_example"],
    "limit": 5
  }'
```

## 4. Search for Common Errors

```bash
# Find common type errors and solutions
curl -X POST http://localhost:3000/api/context/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "type error managed",
    "types": ["error_pattern"],
    "limit": 5
  }'
```

## 5. Get Testing Patterns

```bash
# Find testing examples for smart contracts
curl -X POST http://localhost:3000/api/context/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "test",
    "types": ["code_example"],
    "tags": ["testing"],
    "limit": 5
  }'
```

## 6. Using MCP Tools

When running as an MCP server, you can use these tools:

### Query Context
```json
{
  "tool": "query_context",
  "arguments": {
    "query": "storage mapper performance",
    "types": ["documentation", "optimization"],
    "limit": 5
  }
}
```

### Add Custom Context
```json
{
  "tool": "add_context",
  "arguments": {
    "type": "code_example",
    "content": "// Custom KDA token transfer\n#[endpoint]\nfn transfer_kda(&self, token: TokenIdentifier, to: ManagedAddress, amount: BigUint) {\n    require!(!to.is_zero(), \"Invalid recipient\");\n    require!(amount > 0, \"Amount must be positive\");\n    \n    self.send().direct_kda(\n        &to,\n        &token,\n        0,\n        &amount\n    );\n}",
    "metadata": {
      "title": "KDA Token Transfer Example",
      "description": "Safe KDA token transfer with validation",
      "tags": ["kda", "transfer", "token"],
      "contractType": "token"
    }
  }
}
```

## 7. Validate a Contract

```typescript
// Example: Validate a contract for common issues
import { KleverValidator } from './parsers/validators.js';

const contractCode = `
#[klever_sc::contract]
pub trait MyToken {
    #[event('transfer')] // Wrong: single quotes
    fn transfer_event(&self, from: ManagedAddress, to: ManagedAddress); // Wrong: no references
    
    #[endpoint]
    fn transfer(&self, to: ManagedAddress, amount: BigUint) {
        // Missing zero address check
        self.balance(&to).update(|b| *b += amount);
    }
    
    #[storage_mapper("token_whitelist")]
    fn token_whitelist(&self) -> VecMapper<TokenIdentifier>; // Inefficient for whitelist
}
`;

const issues = KleverValidator.validateContract(contractCode);
// Returns array of issues with suggestions for fixes
```

## 8. Parse Contract Structure

```typescript
import { KleverParser } from './parsers/klever.js';

const contractInfo = KleverParser.parseContract(contractCode);
console.log(contractInfo);
// {
//   name: 'MyToken',
//   entrypoints: ['transfer'],
//   views: [],
//   events: ['transfer'],
//   storageMappers: ['token_whitelist'],
//   hasInit: false,
//   hasUpgrade: false,
//   contractType: 'token',
//   usesMultiValue: false,
//   usesOptionalValue: false,
//   proxyContracts: []
// }
```

## 9. Find Similar Contexts

```bash
# Find contexts similar to a specific one
curl -X GET http://localhost:3000/api/context/{context-id}/similar?limit=5
```

## 10. Batch Context Upload

```bash
# Upload multiple contexts at once
curl -X POST http://localhost:3000/api/context/batch \
  -H "Content-Type: application/json" \
  -d '[
    {
      "type": "code_example",
      "content": "// Example 1 content",
      "metadata": {
        "title": "Example 1",
        "tags": ["example"]
      }
    },
    {
      "type": "best_practice",
      "content": "// Best practice content",
      "metadata": {
        "title": "Best Practice 1",
        "tags": ["practice"]
      }
    }
  ]'
```