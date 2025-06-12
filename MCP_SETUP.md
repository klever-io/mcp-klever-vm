# MCP Setup for Claude

This guide explains how to connect the Klever MCP server to Claude.

## Prerequisites

1. Build the project first:
```bash
pnpm install
pnpm run build
```

## Configuration Options

### Option 1: Direct Configuration (Recommended)

Add this to your Claude MCP configuration file (`~/.config/claude/mcp.json` or similar):

```json
{
  "mcpServers": {
    "klever-vm": {
      "command": "node",
      "args": [
        "--experimental-vm-modules",
        "~/mcp-klever-vm/dist/index.js"
      ],
      "env": {
        "MODE": "mcp",
        "STORAGE_TYPE": "memory"
      }
    }
  }
}
```

### Option 2: Using npx (if published to npm)

```json
{
  "mcpServers": {
    "klever-vm": {
      "command": "npx",
      "args": ["mcp-klever-vm"],
      "env": {
        "MODE": "mcp",
        "STORAGE_TYPE": "memory"
      }
    }
  }
}
```

### Option 3: Using pnpm script

```json
{
  "mcpServers": {
    "klever-vm": {
      "command": "pnpm",
      "args": ["--dir", "~/mcp-klever-vm", "start"],
      "env": {
        "MODE": "mcp",
        "STORAGE_TYPE": "memory"
      }
    }
  }
}
```

## Environment Variables

You can customize the server behavior with these environment variables:

- `MODE`: Must be set to `"mcp"` for MCP mode
- `STORAGE_TYPE`: Choose between `"memory"` (default) or `"redis"`
- `REDIS_URL`: Redis connection URL (only if using Redis storage)

### Memory Storage (Default)
```json
"env": {
  "MODE": "mcp",
  "STORAGE_TYPE": "memory"
}
```
- Knowledge automatically loaded on startup
- No persistence between restarts
- Good for personal use

### Redis Storage
```json
"env": {
  "MODE": "mcp",
  "STORAGE_TYPE": "redis",
  "REDIS_URL": "redis://localhost:6379"
}
```
- Requires Redis server running
- Knowledge persists between restarts
- Good for shared/team use

## Available Tools

Once connected, you'll have access to these tools in Claude:

### 1. query_context
Search for Klever development knowledge:
```json
{
  "query": "storage mapper",
  "types": ["best_practice", "documentation"],
  "tags": ["storage"],
  "limit": 5
}
```

### 2. add_context
Add new knowledge to the server:
```json
{
  "type": "code_example",
  "content": "// Your code here",
  "metadata": {
    "title": "Example Title",
    "description": "Description",
    "tags": ["example", "klever"]
  }
}
```

### 3. get_context
Retrieve specific context by ID:
```json
{
  "id": "context-uuid-here"
}
```

### 4. find_similar
Find contexts similar to a given one:
```json
{
  "id": "context-uuid-here",
  "limit": 5
}
```

## Troubleshooting

### Server won't start
1. Make sure you've built the project: `pnpm run build`
2. Check the path in the configuration is correct
3. Ensure Node.js is in your PATH

### No knowledge available
- With memory storage, knowledge is auto-loaded on startup
- With Redis storage, run `pnpm run ingest` first

### Connection issues
- Check Claude's MCP logs for errors
- Verify the command path is absolute, not relative
- Ensure all dependencies are installed

## Testing the Connection

Once configured, restart Claude and look for "Klever Smart Contract Assistant" in the available tools. You can test it by asking:

- "Show me Klever storage mapper patterns"
- "How do I create a payable endpoint in Klever?"
- "What are the best practices for event annotations?"

The server will provide relevant knowledge from its comprehensive Klever VM knowledge base.