# Klever MCP Server

A Model Context Protocol (MCP) server tailored for Klever blockchain smart contract development. This server maintains and serves contextual knowledge including code patterns, best practices, and runtime behavior for developers working with the Klever VM SDK.

## Features

- 🚀 **Dual Mode Operation**: Run as HTTP API server or MCP protocol server
- 💾 **Flexible Storage**: In-memory or Redis backend support
- 🔍 **Smart Context Retrieval**: Query by type, tags, or contract type
- 📝 **Automatic Pattern Extraction**: Parse Klever contracts to extract examples and patterns
- 🎯 **Relevance Ranking**: Intelligent scoring and ranking of context
- 🔄 **Live Updates**: Add and update context in real-time
- 🛡️ **Type Safety**: Full TypeScript with Zod validation
- 📚 **Comprehensive Knowledge Base**: Pre-loaded with Klever VM patterns, best practices, and examples
- 🔧 **Contract Validation**: Automatic detection of common issues and anti-patterns
- 🚀 **Deployment Scripts**: Ready-to-use scripts for contract deployment, upgrade, and querying

## Architecture

```
mcp-klever-vm/
├── src/
│   ├── api/          # HTTP API routes with validation
│   ├── context/      # Context management service layer
│   ├── mcp/          # MCP protocol server implementation
│   ├── parsers/      # Klever contract parser and validator
│   ├── storage/      # Storage backends (memory/Redis)
│   │   ├── memory.ts # In-memory storage with size limits
│   │   └── redis.ts  # Redis storage with optimized queries
│   ├── types/        # TypeScript type definitions
│   ├── utils/        # Utilities and ingestion tools
│   └── knowledge/    # Modular knowledge base (95+ entries)
│       ├── core/     # Core concepts and imports
│       ├── storage/  # Storage patterns and mappers
│       ├── events/   # Event handling and rules
│       ├── tokens/   # Token operations and decimals
│       ├── modules/  # Built-in modules (admin, pause)
│       ├── tools/    # CLI tools (koperator, ksc)
│       ├── scripts/  # Helper scripts
│       ├── examples/ # Complete contract examples
│       ├── errors/   # Error patterns
│       ├── best-practices/ # Optimization and validation
│       └── documentation/  # API reference
├── tests/            # Test files
└── docs/             # Documentation
```

### Key Improvements Made

1. **Storage Layer**
   - Added memory limits to prevent OOM in InMemoryStorage
   - Optimized Redis queries to avoid O(N) KEYS command
   - Added atomic transactions for Redis operations
   - Improved error handling and validation

2. **API Security**
   - Added input validation for all endpoints
   - Batch operation size limits
   - Proper error responses without leaking internals
   - Environment-aware error messages

3. **Type Safety**
   - Centralized schema validation
   - Proper TypeScript interfaces for options
   - Runtime validation of stored data

4. **Performance**
   - Batch operations using Redis MGET
   - Index-based queries instead of full scans
   - Optimized count operations

## Installation

1. Clone the repository:
```bash
git clone https://github.com/klever-io/mcp-klever-vm.git
cd mcp-klever-vm
```

2. Install dependencies:
```bash
pnpm install
```

3. Copy environment configuration:
```bash
cp .env.example .env
```

4. Install Klever SDK tools (required for transactions):
```bash
chmod +x scripts/install-sdk.sh && ./scripts/install-sdk.sh
```

5. Build the project:
```bash
pnpm run build
```

## Configuration

Edit `.env` file to configure the server:

```env
# Server Mode (http or mcp)
MODE=http

# HTTP Server Port (only for http mode)
PORT=3000

# Storage Backend (memory or redis)
STORAGE_TYPE=memory

# Maximum contexts for in-memory storage (default: 10000)
MEMORY_MAX_SIZE=10000

# Redis URL (only if STORAGE_TYPE=redis)
REDIS_URL=redis://localhost:6379

# Node environment (development or production)
NODE_ENV=development
```

## MCP Client Integration

The Klever MCP Server can be integrated with different MCP-compatible clients. We provide detailed setup guides for:

### Visual Studio Code
Follow the [VS Code Installation Guide](docs/install-vscode.md) to:
- Configure the MCP server in VS Code with GitHub Copilot Chat
- Set up the `.vscode/mcp.json` configuration file
- Use Klever blockchain knowledge in your development workflow

### Claude Desktop
Follow the [Claude Desktop Installation Guide](docs/install-claude.md) to:
- Configure the MCP server with Claude Desktop application
- Set up the `mcp.json` configuration file
- Access Klever development context through Claude's interface

Both guides include troubleshooting tips and verification steps to ensure the MCP server is working correctly with your chosen client.

## Usage

### Knowledge Base Loading

The server automatically loads the Klever knowledge base based on your storage type:

#### Memory Storage (Default)
- Knowledge is **automatically loaded** when the server starts
- No need to run `pnpm run ingest` separately
- Data exists only while server is running
- Best for development and testing

#### Redis Storage
```bash
# First, ingest the knowledge base (one time)
pnpm run ingest

# Then start the server
pnpm run dev
```
- Knowledge persists in Redis database
- Survives server restarts
- Best for production use

This will load:
- Smart contract templates and examples
- Annotation rules and best practices
- Storage mapper patterns and comparisons
- Deployment and query scripts
- Common errors and solutions
- Testing patterns
- API reference documentation

### Running as HTTP Server

```bash
# Development mode
pnpm run dev

# Production mode
pnpm run build && pnpm start
```

The HTTP API will be available at `http://localhost:3000/api`

### Running as MCP Server

```bash
MODE=mcp pnpm start
```

Use with any MCP-compatible client.

### API Endpoints

#### POST `/api/context`
Ingest new context into the system.

```json
{
  "type": "code_example",
  "content": "contract code here",
  "metadata": {
    "title": "Token Contract Example",
    "description": "ERC20-like token implementation",
    "tags": ["token", "fungible"],
    "contractType": "token"
  }
}
```

#### GET `/api/context/:id`
Retrieve specific context by ID.

#### POST `/api/context/query`
Query contexts with filters.

```json
{
  "query": "transfer",
  "types": ["code_example", "best_practice"],
  "tags": ["token"],
  "contractType": "token",
  "limit": 10,
  "offset": 0
}
```

#### PUT `/api/context/:id`
Update existing context.

#### DELETE `/api/context/:id`
Delete context.

#### GET `/api/context/:id/similar`
Find similar contexts.

#### POST `/api/context/batch`
Batch ingest multiple contexts.

### MCP Tools

When running as MCP server, the following tools are available:

- `query_context`: Search for relevant Klever development context
- `add_context`: Add new context to the knowledge base
- `get_context`: Retrieve specific context by ID
- `find_similar`: Find contexts similar to a given context
- `get_knowledge_stats`: Get statistics about the knowledge base
- `init_klever_project`: Initialize a new Klever smart contract project with helper scripts
- `enhance_with_context`: Automatically enhance queries with relevant Klever VM context

## Context Types

- `code_example`: Working code snippets and examples (Rust smart contract code)
- `best_practice`: Recommended patterns and practices
- `security_tip`: Security considerations and warnings
- `optimization`: Performance optimization techniques
- `documentation`: General documentation and guides
- `error_pattern`: Common errors and solutions
- `deployment_tool`: Deployment scripts and utilities (bash scripts, tools)
- `runtime_behavior`: Runtime behavior explanations

## Pre-loaded Knowledge Base

The MCP server includes a comprehensive knowledge base with 95+ entries organized into 11 categories:

### Critical Patterns
- Payment handling and token operations
- Decimal conversions and calculations
- Event emission and parameter rules
- CLI tool usage and best practices

### Contract Patterns & Examples
- Basic contract structure templates
- Complete lottery game implementation
- Staking contract with rewards
- Cross-contract communication patterns
- Remote storage access patterns
- Token mapper helper modules

### Development Tools
- **Koperator**: Complete CLI reference with argument encoding
- **KSC**: Build commands and project setup
- Deployment, upgrade, and query scripts
- Interactive contract management tools
- Common utilities library (bech32, network management)

### Storage & Optimization
- Storage mapper selection guide with performance comparisons
- Namespace organization patterns
- View endpoints for efficient queries
- Gas optimization techniques
- OptionalValue vs Option patterns

### Best Practices & Security
- Input validation patterns
- Error handling strategies
- Admin and pause module usage
- Access control patterns
- Common mistakes and solutions

## Ingesting Contracts

Use the built-in ingestion utilities to parse and import Klever contracts:

```typescript
import { StorageFactory } from './storage/index.js';
import { ContextService } from './context/service.js';
import { ContractIngester } from './utils/ingest.js';

const storage = StorageFactory.create('memory');
const contextService = new ContextService(storage);
const ingester = new ContractIngester(contextService);

// Ingest a single contract
await ingester.ingestContract('./path/to/contract.rs', 'AuthorName');

// Ingest entire directory
await ingester.ingestDirectory('./contracts', 'AuthorName');

// Add common patterns
await ingester.ingestCommonPatterns();
```

## Development

```bash
# Run tests
pnpm test

# Lint code
pnpm run lint

# Format code
pnpm run format

# Watch mode
pnpm run dev

# Ingest/update knowledge base
pnpm run ingest
```

## Contract Validation

The server can automatically validate Klever contracts and detect issues:

```typescript
import { KleverValidator } from './parsers/validators.js';

const issues = KleverValidator.validateContract(contractCode);
// Returns array of detected issues with suggestions
```

Validation checks include:
- Event annotation format (double quotes, camelCase)
- Managed type API parameters
- Zero address validation in transfers
- Optimal storage mapper selection
- Module naming conventions

## Example Use Cases

### 1. Smart Contract Development Assistant
Integrate with your IDE to provide context-aware suggestions for Klever contract development.

### 2. Code Review Tool
Automatically check contracts against best practices and security patterns.

### 3. Learning Platform
Provide examples and explanations for developers learning Klever development.

### 4. Documentation Generator
Extract and organize contract documentation automatically.

## Project Specifications and Examples

For complete project implementation examples and specifications, see:
- [Project Specification Template](docs/project-specification-template.md) - A comprehensive template/prompt for implementing smart contracts using the MCP knowledge base. This includes the discovery process, implementation gates, and step-by-step guidance for using MCP queries throughout development.

## Project Initialization

The MCP server includes a powerful project initialization tool that creates a new Klever smart contract project with all necessary helper scripts.

### Using the init_klever_project Tool

When connected via MCP, use the `init_klever_project` tool:

```json
{
  "name": "my-token-contract",
  "template": "empty",
  "noMove": false
}
```

Parameters:
- `name` (required): The name of your contract
- `template` (optional): Template to use (default: "empty")
- `noMove` (optional): If true, keeps project in subdirectory (default: false)

### Generated Helper Scripts

The tool creates the following scripts in the `scripts/` directory:

- **build.sh**: Builds the smart contract
- **deploy.sh**: Deploys to Klever testnet with auto-detection of contract artifacts
- **upgrade.sh**: Upgrades existing contract (auto-detects from history.json)
- **query.sh**: Query contract endpoints with proper encoding/decoding
- **test.sh**: Run contract tests
- **interact.sh**: Shows usage examples and available commands

### Example Workflow

1. Initialize project:
   ```bash
   # Via MCP tool
   init_klever_project({"name": "my-contract"})
   ```

2. Build contract:
   ```bash
   ./scripts/build.sh
   ```

3. Deploy to testnet:
   ```bash
   ./scripts/deploy.sh
   ```

4. Query contract:
   ```bash
   ./scripts/query.sh --endpoint getSum
   ./scripts/query.sh --endpoint getValue --arg myKey
   ```

5. Upgrade contract:
   ```bash
   ./scripts/upgrade.sh
   ```

All deployment history is tracked in `output/history.json` for easy reference.

## Automatic Context Enhancement

The MCP server can automatically enhance queries with relevant Klever VM context. This ensures your MCP client always has access to the most relevant information.

### Using Context Enhancement

Use the `enhance_with_context` tool to automatically add relevant context to any query:

```json
{
  "tool": "enhance_with_context",
  "arguments": {
    "query": "How do I create a storage mapper?",
    "autoInclude": true
  }
}
```

This will:
1. Extract relevant keywords from the query
2. Search the knowledge base for matching contexts
3. Return an enhanced query with context included
4. Provide metadata about what was found

### Integration Pattern

For MCP clients that want to always check Klever context first:

```javascript
// Always enhance Klever-related queries
if (query.match(/klever|kvm|smart contract|endpoint/i)) {
  const enhanced = await callTool('enhance_with_context', { query });
  // Use enhanced.enhancedQuery for processing
}
```

The context enhancement feature automatically enriches queries with relevant Klever VM knowledge from the comprehensive knowledge base.

## Integration Examples

### VS Code Extension
```typescript
// Query for token transfer examples
const response = await fetch('http://localhost:3000/api/context/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'transfer',
    types: ['code_example'],
    contractType: 'token'
  })
});
```

### CLI Tool
```bash
# Using curl to add context
curl -X POST http://localhost:3000/api/context \
  -H "Content-Type: application/json" \
  -d '{
    "type": "security_tip",
    "content": "Always check for zero address",
    "metadata": {
      "title": "Zero Address Check",
      "tags": ["security", "validation"]
    }
  }'
```

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Inspired by [Context7 by Upstash](https://github.com/upstash/context7)
- Built for the [Klever Blockchain](https://klever.io)
- Uses the [Klever VM SDK (Rust)](https://github.com/klever-io/klever-vm-sdk-rs)