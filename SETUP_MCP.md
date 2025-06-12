# Setting up Klever MCP Server with Claude Desktop

## Installation Steps

### 1. Build the MCP Server

```bash
cd mcp-klever-vm
pnpm install
pnpm run build
```

### 2. Configure Claude Desktop

Claude Desktop looks for MCP server configurations in:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### 3. Add Klever MCP Server Configuration

Edit the Claude Desktop config file and add the Klever MCP server:

```json
{
  "mcpServers": {
    "klever-vm": {
      "command": "node",
      "args": [
        "--experimental-vm-modules",
        "./mcp-klever-vm/dist/index.js"
      ],
      "env": {
        "MODE": "mcp",
        "STORAGE_TYPE": "memory"
      }
    }
  }
}
```

**Note**: If you already have other MCP servers configured, add `klever-vm` to the existing `mcpServers` object.

### 4. Alternative: Using npx (if published to npm)

If you publish the package to npm, you can use:

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

### 5. Using Redis Storage (Optional)

For persistent storage across sessions:

```json
{
  "mcpServers": {
    "klever-vm": {
      "command": "node",
      "args": [
        "--experimental-vm-modules",
        "./mcp-klever-vm/dist/index.js"
      ],
      "env": {
        "MODE": "mcp",
        "STORAGE_TYPE": "redis",
        "REDIS_URL": "redis://localhost:6379"
      }
    }
  }
}
```

### 6. Restart Claude Desktop

After updating the configuration:
1. Quit Claude Desktop completely
2. Start Claude Desktop again
3. The Klever MCP server should connect automatically

## Verifying Connection

To verify the MCP server is connected:

1. In Claude Desktop, type: "Can you check your Klever knowledge base?"
2. Claude should be able to use the `get_knowledge_stats` tool
3. You should see knowledge about Klever smart contract development

## Available Tools

Once connected, Claude will have access to these tools:

- **query_context**: Search Klever development knowledge
- **add_context**: Add new knowledge to the base
- **get_context**: Retrieve specific context by ID
- **find_similar**: Find similar contexts
- **get_knowledge_stats**: Check knowledge base statistics
- **init_klever_project**: Initialize new Klever smart contract projects

## Troubleshooting

### Check Logs

MCP server logs are written to stderr. Check Claude Desktop logs at:
- **macOS**: `~/Library/Logs/Claude/`
- **Windows**: `%APPDATA%\Claude\logs\`
- **Linux**: `~/.config/Claude/logs/`

### Common Issues

1. **"No knowledge found"**: The server is running but knowledge isn't loaded
   - Solution: Memory storage auto-ingests on startup, wait a few seconds

2. **"Tool not found"**: The server isn't connected properly
   - Solution: Check the path in config is absolute and correct
   - Verify the server builds successfully with `pnpm run build`

3. **Permission errors**: The script needs execute permissions
   - Solution: `chmod +x ./mcp-klever-vm/dist/index.js`

## Development Mode

For development with hot-reload:

```json
{
  "mcpServers": {
    "klever-vm-dev": {
      "command": "pnpm",
      "args": ["run", "dev:mcp"],
      "cwd": "./klever/mcp-klever-vm",
      "env": {
        "MODE": "mcp",
        "STORAGE_TYPE": "memory"
      }
    }
  }
}
```

Add this script to package.json:
```json
"scripts": {
  "dev:mcp": "MODE=mcp STORAGE_TYPE=memory tsx watch src/index.ts"
}
```