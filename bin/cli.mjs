#!/usr/bin/env node

// Force MCP stdio mode — the only mode relevant for npx usage
process.env.MODE = 'mcp';
process.env.STORAGE_TYPE = process.env.STORAGE_TYPE || 'memory';

// Dynamic import so env vars are set before index.js reads them
await import('../dist/index.js');
