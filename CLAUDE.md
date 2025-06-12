# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Model Context Protocol (MCP) server implementation for Klever blockchain smart contract development. It provides contextual knowledge management for developers working with the Klever VM SDK (Rust).

The server comes pre-loaded with comprehensive Klever VM knowledge including:
- Contract structure templates and patterns
- Storage mapper selection guides and performance comparisons
- Event and annotation best practices
- Deployment, upgrade, and query scripts
- Common errors and solutions
- Testing patterns and examples

## Common Commands

```bash
# Install dependencies
pnpm install

# Build the project
pnpm run build

# Ingest Klever knowledge base (only needed for Redis storage)
# For memory storage, knowledge is auto-loaded on startup
pnpm run ingest

# Run in development mode (HTTP server)
pnpm run dev

# Run in production mode
pnpm start

# Run as MCP server
MODE=mcp pnpm start

# Run tests
pnpm test

# Lint code
pnpm run lint

# Format code
pnpm run format
```

## Architecture

### Core Components

1. **Storage Layer** (`src/storage/`)
   - `InMemoryStorage`: Fast in-memory storage for development
   - `RedisStorage`: Persistent Redis-based storage for production
   - `StorageFactory`: Factory pattern for storage backend selection

2. **Context Service** (`src/context/`)
   - Manages context ingestion, retrieval, and querying
   - Implements relevance scoring and ranking
   - Handles context relationships

3. **API Layer** (`src/api/`)
   - RESTful HTTP endpoints for context management
   - Input validation with Zod schemas
   - Error handling and response formatting

4. **MCP Server** (`src/mcp/`)
   - Implements MCP protocol for AI assistants
   - Provides tools for context querying and management

5. **Parsers** (`src/parsers/`)
   - `KleverParser`: Extracts patterns from Klever smart contracts
   - Identifies contract structure, endpoints, events, storage mappers
   - `KleverValidator`: Validates contracts and detects common issues

6. **Knowledge Base** (`src/utils/klever-knowledge.ts`)
   - Pre-defined Klever VM patterns and best practices
   - Deployment and utility scripts
   - Common errors and solutions
   - API reference documentation

### Key Design Patterns

- **Factory Pattern**: Used for storage backend selection
- **Service Layer**: Business logic separated from API routes
- **Type Safety**: Full TypeScript with Zod validation
- **Modular Architecture**: Clear separation of concerns

## Development Guidelines

### Adding New Context Types

1. Update the `ContextTypeSchema` in `src/types/index.ts`
2. Update relevance scoring logic in `ContextService`
3. Add corresponding parser logic if needed
4. Add new contexts to `src/utils/klever-knowledge.ts` if they're Klever-specific

### Updating Klever Knowledge

1. Edit `src/utils/klever-knowledge.ts` to add new patterns
2. Run `pnpm run ingest` to reload the knowledge base
3. The ingestion script will report success/failure for each context

### Storage Backend

- Use in-memory storage for development (`STORAGE_TYPE=memory`)
- Use Redis for production (`STORAGE_TYPE=redis`)
- Storage interface is abstracted - easy to add new backends

### Testing

- Write unit tests for new features
- Test files should be placed next to source files with `.test.ts` extension
- Run tests before committing: `pnpm test`

### Code Style

- Use TypeScript for all new code
- Follow existing patterns for consistency
- Run linter before committing: `pnpm run lint`
- Format code: `pnpm run format`

## Environment Configuration

Key environment variables:
- `MODE`: Server mode (`http` or `mcp`)
- `PORT`: HTTP server port (default: 3000)
- `STORAGE_TYPE`: Storage backend (`memory` or `redis`)
- `REDIS_URL`: Redis connection URL

## Troubleshooting

1. **Build errors**: Ensure TypeScript is installed: `pnpm install -D typescript`
2. **Redis connection**: Check Redis is running and URL is correct
3. **MCP mode**: Ensure stdout is not being used for logging
4. **Missing contexts**: Run `pnpm run ingest` to load the knowledge base
5. **Contract validation**: Use `KleverValidator` to detect common issues

## Klever-Specific Features

### Contract Validation
The server can validate Klever contracts for common issues:
- Event annotation format errors
- Missing API type parameters in managed types
- Inefficient storage mapper usage
- Missing input validations

### Enhanced Parsing
The parser extracts:
- Contract name, endpoints, and views
- Events and storage mappers
- Module dependencies and proxy contracts
- Usage of OptionalValue and MultiValue types