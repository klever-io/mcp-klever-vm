# Contributing to Klever MCP Server

Thank you for your interest in contributing to the Klever MCP Server! This guide will help you get started.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18.0.0
- [pnpm](https://pnpm.io/) (see `packageManager` in `package.json` for the exact version)
- [Git](https://git-scm.com/)

### Setup

1. Fork the repository on GitHub
2. Clone your fork:
   ```bash
   git clone https://github.com/<your-username>/mcp-klever-vm.git
   cd mcp-klever-vm
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Copy the environment configuration:
   ```bash
   cp .env.example .env
   ```
5. Build the project:
   ```bash
   pnpm run build
   ```
6. Run the tests to verify everything works:
   ```bash
   pnpm test
   ```

## Development Workflow

### Running in Development

```bash
# HTTP server mode
pnpm run dev

# MCP server mode (stdio)
pnpm run dev:mcp

# Public hosted mode
pnpm run dev:public
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm run build` | Compile TypeScript and copy templates |
| `pnpm run dev` | Start HTTP server with watch mode |
| `pnpm run dev:mcp` | Start MCP server with watch mode |
| `pnpm test` | Run test suite |
| `pnpm run lint` | Run ESLint |
| `pnpm run lint:fix` | Run ESLint with auto-fix |
| `pnpm run format` | Format code with Prettier |
| `pnpm run format:check` | Check code formatting |
| `pnpm run typecheck` | Run TypeScript type checking |
| `pnpm run validate` | Run typecheck, lint, and tests |

### Before Submitting

Run the full validation suite to make sure everything passes:

```bash
pnpm run validate
```

## Coding Standards

### TypeScript

- This is an **ESM-only project** (`"type": "module"` in `package.json`)
- All internal imports **must** use `.js` extensions (e.g., `import { Foo } from './bar.js'`)
- Use strict TypeScript with Zod for runtime validation
- Follow existing patterns in the codebase

### Linting & Formatting

- **ESLint** v9 with flat config and TypeScript support
- **Prettier** for code formatting
- Run `pnpm run lint:fix` and `pnpm run format` before committing

### Testing

- Tests use **Jest** with ESM support via `--experimental-vm-modules`
- Test files use the `.test.ts` extension
- Place tests in `tests/` or alongside source files as `__tests__/`
- Aim for meaningful test coverage on new features

## Making Changes

### Branch Naming

Use descriptive branch names:

```
feature/<short-description>
bugfix/<short-description>
chore/<short-description>
```

### Commit Messages

Write clear, concise commit messages that describe the change:

- Use the imperative mood ("Add feature" not "Added feature")
- Keep the first line under 72 characters
- Reference issue numbers when applicable

### Adding Knowledge Entries

To add new knowledge to the base:

1. Create or edit entries in the appropriate `src/knowledge/<category>/` folder
2. Use the `createKnowledgeEntry()` helper function
3. Export from the category's `index.ts`
4. The entry will be auto-loaded on startup (memory storage) or after running `pnpm run ingest` (Redis)

### Adding New Context Types

1. Add to `ContextTypeSchema` enum in `src/types/index.ts`
2. Update relevance scoring in `ContextService.calculateRelevanceScore()`
3. Update MCP tool input schemas in `src/mcp/server.ts`

## Pull Request Process

1. Create a feature branch from `develop`
2. Make your changes following the coding standards above
3. Add or update tests as appropriate
4. Run `pnpm run validate` to ensure all checks pass
5. Push your branch and open a pull request against `develop`
6. Fill in the PR template with a clear description of your changes
7. Wait for review and address any feedback

### PR Guidelines

- Keep pull requests focused on a single change
- Include a clear description of what changed and why
- Link to relevant issues
- Ensure CI checks pass before requesting review

## Reporting Issues

- Use [GitHub Issues](https://github.com/klever-io/mcp-klever-vm/issues) to report bugs or request features
- Include reproduction steps for bugs
- Check existing issues before opening a new one

## License

By contributing to this project, you agree that your contributions will be licensed under the [MIT License](LICENSE).
