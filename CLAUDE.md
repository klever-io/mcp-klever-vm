# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MCP (Model Context Protocol) server for Klever blockchain smart contract development. Provides contextual knowledge management (95+ entries across 11 categories) for developers working with the Klever VM SDK (Rust). Runs in two modes: HTTP API server (Express) or MCP protocol server (stdio transport).

## Common Commands

```bash
pnpm install                    # Install dependencies
pnpm run build                  # Build (tsc + copy templates to dist/)
pnpm run dev                    # Dev mode with watch (HTTP server)
pnpm run dev:mcp                # Dev mode with watch (MCP server, memory storage)
pnpm test                       # Run tests (Jest with ESM via --experimental-vm-modules)
pnpm run lint                   # Lint with ESLint
pnpm run format                 # Format with Prettier
pnpm run ingest                 # Ingest knowledge base into Redis storage
MODE=mcp pnpm start             # Run as MCP server (production)
```

Tests use Jest with ESM support. The test command is `node --experimental-vm-modules $(pnpm bin)/jest`. Test files use `.test.ts` extension and match `**/?(*.)+(spec|test).ts` or `**/__tests__/**/*.ts`.

## Architecture

### Data Flow

The server bootstraps in `src/index.ts` which selects between HTTP and MCP mode based on `MODE` env var. Both modes share the same pipeline:

1. `StorageFactory` creates a `StorageBackend` (memory or Redis)
2. `ContextService` wraps storage with business logic (validation, relevance scoring, querying)
3. On memory storage, `autoIngestKnowledge()` loads all entries from `src/knowledge/` at startup
4. HTTP mode mounts Express routes via `createRoutes(contextService)` at `/api`
5. MCP mode creates `KleverMCPServer` using `@modelcontextprotocol/sdk` with stdio transport

### Key Interfaces

- **`StorageBackend`** (`src/types/index.ts`): Core interface for store/retrieve/query/update/delete/count operations. All schemas defined with Zod.
- **`ContextPayload`**: The main data type — has `type` (enum of 8 context types), `content`, `metadata` (title, tags, relevanceScore, etc.), and `relatedContextIds`.
- **`KnowledgeEntry`** (`src/knowledge/types.ts`): Internal format for knowledge base entries, converted to `ContextPayload` during ingestion.

### Knowledge Base System

Knowledge lives in `src/knowledge/` organized by category (core, storage, events, tokens, modules, tools, scripts, examples, errors, best-practices, documentation). Each category exports an array of `KnowledgeEntry` objects created via the `createKnowledgeEntry()` helper. All categories are aggregated in `src/knowledge/index.ts`.

### MCP Tools

The MCP server (`src/mcp/server.ts`) exposes: `query_context`, `add_context`, `get_context`, `find_similar`, `get_knowledge_stats`, `init_klever_project`, `add_helper_scripts`, `enhance_with_context`. Debug logging goes to stderr to avoid interfering with the stdio MCP protocol on stdout.

### Adding New Knowledge Entries

1. Add entries to the appropriate category folder in `src/knowledge/`
2. Use `createKnowledgeEntry(type, content, { title, tags, ... })` helper
3. Export from the category's `index.ts`
4. For memory storage: auto-loaded on startup. For Redis: run `pnpm run ingest`

### Adding New Context Types

1. Add to `ContextTypeSchema` enum in `src/types/index.ts`
2. Update relevance scoring in `ContextService.calculateRelevanceScore()`
3. Update MCP tool input schemas in `src/mcp/server.ts` (the enum arrays in `query_context` and `add_context`)

## Environment Variables

- `MODE`: `http` (default) or `mcp`
- `PORT`: HTTP server port (default: 3000)
- `STORAGE_TYPE`: `memory` (default) or `redis`
- `REDIS_URL`: Redis connection string (only for redis storage)
- `MEMORY_MAX_SIZE`: Max contexts in memory storage (default: 10000)
- `NODE_ENV`: `development` or `production` (affects error detail in responses)

## Branching & Release Process

### Branch Model (GitFlow-lite)

- **`develop`** — Integration branch. All feature PRs merge here. Staging deployments use the `:dev` Docker image.
- **`main`** — Production branch. Only receives merges from `develop` when code is ready for release.
- **Feature branches** — Created from `develop`, merged back via PR.

### Docker Tag Strategy

| Trigger | Docker Tags | Environment |
|---|---|---|
| Manual dispatch from `develop` | `:dev`, `:dev-<sha>` | Staging (`dev-mcp.klever.org`) |
| Release tag `v1.2.3` | `:1.2.3`, `:1.2`, `:1`, `:latest` | Production (`mcp.klever.org`) |
| Pre-release tag `v1.2.3-rc.1` | `:1.2.3-rc.1` (no `:latest`) | Testing |
| Manual dispatch from other branch | `:sha-<sha>` | Ad-hoc |

### Creating a Release

1. Merge `develop` → `main` via PR
2. Go to **Actions** → **Release** → **Run workflow** on `main`
3. Select bump type: `patch`, `minor`, or `major`
4. The workflow will: validate code, bump `package.json`, create git tag, push, create GitHub Release, and sync version back to `develop`
5. The tag push triggers the Docker build workflow automatically

### Deploying :dev to Staging

1. Go to **Actions** → **Build and Push Docker Image** → **Run workflow**
2. Select the `develop` branch
3. Watchtower on staging auto-deploys the new `:dev` image

### Deployment Files

- `docker-compose.deploy.yml` — Production (`mcp.klever.org`, uses `:latest`)
- `docker-compose.staging.yml` — Staging (`dev-mcp.klever.org`, uses `:dev`)
- `docker-compose.yml` — Local development (builds from source)

## Important Notes

- ESM-only project (`"type": "module"` in package.json, `NodeNext` module resolution)
- All internal imports must use `.js` extensions (e.g., `import { Foo } from './bar.js'`)
- Build step copies `src/templates/` to `dist/` alongside TypeScript compilation
- MCP mode must not write to stdout (use `console.error` for logging)
- Express 5 is used (not v4) — route params typed differently
