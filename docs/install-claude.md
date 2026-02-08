# Setting up Klever MCP Server with Claude

This guide walks through configuring the Klever MCP server with Claude Code and Claude Desktop. You can either connect to the **public server** (no setup required) or run it **locally**.

---

## 1. Prerequisites

- Claude Code CLI or Claude Desktop installed
- For local mode: Node.js and the MCP project built locally (see [Installation](../README.md#installation))

---

## 2. Option A: Connect to the Public Server (Recommended)

The fastest way to get started. No local build or installation required.

### Claude Code CLI

```bash
# Add permanently (user-level)
claude mcp add -t http klever-vm https://mcp.klever.org/mcp

# Add for current project only
claude mcp add -t http -s project klever-vm https://mcp.klever.org/mcp
```

### Claude Desktop

Add to your Claude Desktop MCP configuration file:

```json
{
  "mcpServers": {
    "klever-vm": {
      "type": "http",
      "url": "https://mcp.klever.org/mcp"
    }
  }
}
```

This connects to the hosted Klever MCP server with read-only access to the full knowledge base.

---

## 2. Option B: Run Locally (Full Access)

For full access including write operations and project initialization tools, run the server locally.

### Claude Code CLI

```bash
claude mcp add klever-vm -- node --experimental-vm-modules /path/to/mcp-klever-vm/dist/index.js
```

Or use the `mcp.json` configuration file:

```bash
claude --mcp-config /path/to/mcp-klever-vm/mcp.json
```

### Claude Desktop

Add to your Claude Desktop MCP configuration file:

```json
{
  "mcpServers": {
    "klever-vm": {
      "command": "node",
      "args": [
        "--experimental-vm-modules",
        "/path/to/mcp-klever-vm/dist/index.js"
      ],
      "env": {
        "MODE": "mcp",
        "STORAGE_TYPE": "memory"
      }
    }
  }
}
```

Replace `/path/to/mcp-klever-vm/dist/index.js` with the actual path to your built server.

---

## 3. Verifying the Server

### Claude Code CLI

Type `/mcp` in the Claude Code CLI to check if the MCP server is connected and see available tools.

### Claude Desktop

Open a conversation and ask: "Do you have Klever Blockchain Knowledge?" to confirm the server is active.

---

## 4. Troubleshooting

- **Server not connecting?** Check that the URL or path is correct
- **Tools not appearing?** Restart Claude Code/Desktop after adding the configuration
- **Local server errors?** Check that the project is built (`pnpm run build`) and Node.js is installed
