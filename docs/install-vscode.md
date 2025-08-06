# 🚀 Setting up `klever-vm` MCP Server in Visual Studio Code

This guide walks through installing and configuring your local `klever-vm` MCP server in VS Code so other users can follow it easily.

---

## 1. Prerequisites ✅

- **Visual Studio Code 1.102 or newer**, with built-in support for MCP fully available ([VS Code MCP Docs](https://code.visualstudio.com/docs/copilot/chat/mcp-servers))
- **GitHub Copilot Chat** extension installed and enabled (used to access Agent Mode and MCP tools)
- Locally built `klever-vm` server executable (e.g. via `node dist/index.js`)

---

## 2. Configuration File (`.vscode/mcp.json`)

Create a `.vscode/mcp.json` file at the root of your project. This file defines your `klever-vm` MCP server:

```json
{
  "inputs": [],
  "servers": {
    "klever-vm": {
      "type": "stdio",
      "command": "node",
      "args": [
        "--experimental-vm-modules",
        "./dist/index.js" // use your full path to the mcp-klever-vm dist/index.js
      ],
      "env": {
        "MODE": "mcp",
        "STORAGE_TYPE": "memory"
      }
    }
  }
}

## 3. Run the MCP Server in VS Code

After configuring `mcp.json`, VS Code may show an option to **run the MCP server** directly.

You can click to start the server and view the output within VS Code.

Alternatively, restart VS Code to auto-discover and start your MCP server.


## 4. Using the Server in Copilot Chat

1. Open the **GitHub Copilot Chat** pane.
2. You can confirm the server is running by typing "Do you have Klever Blockchain Knowledge?" in the chat.

## 5. Troubleshooting ⚠️

- **Tools don't appear?**

- **See errors in the MCP output channel?**
  - Check logs in **Output → MCP** inside VS Code.

- **Important:**
  - Always review server config before running MCP servers; they have the power to execute code on your machine.
