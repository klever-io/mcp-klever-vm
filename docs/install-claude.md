# 🚀 Setting up Claude Code MCP Server

This guide walks through running the Claude Code MCP server locally using a pre-built project and configuration file.

---

## 1. Prerequisites ✅

- Node.js installed (for running the Claude Code MCP server)
- MCP project built locally (e.g. using `pnpm build` or similar)
- The `mcp.json` configuration file available inside the MCP repository (Or your cloned repository)

---

## 2. Using the `mcp.json` Configuration

The Claude Code repository already includes a sample `mcp.json` file defining the MCP server:

```json
{
  "servers": {
    "Claude": {
      "type": "stdio",
      "command": "node",
      "args": [
        "--experimental-vm-modules",
        "./dist/index.js"
      ],
      "env": {
        "MODE": "mcp",
        "STORAGE_TYPE": "memory"
      }
    }
  }
}

## 3. Running Claude Code MCP Server with Configuration

To start the Claude Code MCP server using your config file, run:

```bash
claude --mcp-config ../mcp-klever-vm/mcp.json

Replace ../mcp-klever-vm/mcp.json with the correct relative or absolute path to your mcp.json file.

This tells the Claude Code CLI to use your MCP server configuration.

## 4. Verifying the Server

- Once running, you should see logs indicating the MCP server has started.
- You can now connect to Claude Code.
