import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * Klever VSCode Extension installation and setup documentation
 */

export const vscodeExtensionKnowledge: KnowledgeEntry[] = [
  // VSCode Extension Overview and Installation
  createKnowledgeEntry(
    'documentation',
    `# Klever VSCode Extension - Installation Guide

## Overview
The Klever VSCode Extension provides an integrated development environment for Klever blockchain smart contract development. It automatically installs and manages the Klever SDK tools.

## Installation Steps

### 1. Install the Extension
1. Open Visual Studio Code
2. Go to the Extensions panel (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "Klever Blockchain"
4. Click **Install** on the Klever Blockchain extension

### 2. What Gets Installed
The extension automatically installs the Klever SDK at \`~/klever-sdk/\` which includes:
- **ksc** - Klever Smart Contract CLI (build tool)
- **koperator** - Klever Operator (transaction and deployment tool)
- **walletKey.pem** - Default wallet key file (generated on first use)

### 3. Verify Installation
After installation, verify the tools are available:
\`\`\`bash
# Check ksc
~/klever-sdk/ksc --version

# Check koperator
~/klever-sdk/koperator --version
\`\`\`

### 4. Extension Features
- Smart contract project templates
- Syntax highlighting for Klever-specific Rust annotations
- Integrated build and deploy commands
- Contract ABI generation
- Test runner integration

## SDK Path
The Klever SDK is installed at:
\`\`\`
~/klever-sdk/
├── ksc            # Smart Contract CLI (build tool)
├── koperator      # Operator CLI (deploy/invoke tool)
└── walletKey.pem  # Default wallet key
\`\`\`

## Alternative: Manual SDK Installation
If the VSCode extension is not available or you prefer manual installation:
\`\`\`bash
# 1. Create SDK directory
mkdir -p ~/klever-sdk

# 2. Detect platform (must match Klever CDN paths)
OS_TYPE=$(uname -s)
ARCH=$(uname -m)
case "$OS_TYPE" in
    "Darwin")
        [ "$ARCH" = "arm64" ] && PLATFORM="darwin-arm64" || PLATFORM="darwin"
        ;;
    "Linux")  PLATFORM="linux" ;;
    MINGW*|CYGWIN*|MSYS*) PLATFORM="win32" ;;
esac

# 3. Fetch latest versions from Klever's CDN
VERSIONS_URL="https://storage.googleapis.com/kleverchain-public/versions.json"
KSC_VERSION=$(curl -s "$VERSIONS_URL" | jq -r ".\\"\${PLATFORM}\\".ksc.version // .ksc")
KOPERATOR_VERSION=$(curl -s "$VERSIONS_URL" | jq -r ".\\"\${PLATFORM}\\".koperator.version // .koperator")

# 4. Download ksc and koperator using latest versions
curl -L -o ~/klever-sdk/ksc \\
    "https://storage.googleapis.com/kleverchain-public/ksc/\${PLATFORM}/v\${KSC_VERSION}/ksc"
curl -L -o ~/klever-sdk/koperator \\
    "https://storage.googleapis.com/kleverchain-public/koperator/\${PLATFORM}/v\${KOPERATOR_VERSION}/koperator"

# 5. Make executable
chmod +x ~/klever-sdk/ksc ~/klever-sdk/koperator

# 6. Verify
~/klever-sdk/ksc --version
~/klever-sdk/koperator --version
\`\`\`

**Note:** Requires \`jq\` for JSON parsing. If not available, check https://storage.googleapis.com/kleverchain-public/versions.json manually for the latest versions.

## Troubleshooting

### Extension Not Installing SDK
- Ensure you have internet connectivity
- Check VSCode Output panel for error messages
- Try the manual installation steps above

### Tools Not Found After Installation
- Verify the SDK path exists: \`ls ~/klever-sdk/\`
- Check file permissions: \`ls -la ~/klever-sdk/ksc ~/klever-sdk/koperator\`
- Make binaries executable: \`chmod +x ~/klever-sdk/ksc ~/klever-sdk/koperator\``,
    {
      title: 'Klever VSCode Extension - Installation Guide',
      description:
        'Complete guide for installing the Klever VSCode extension and setting up the development environment',
      tags: ['vscode', 'extension', 'installation', 'setup', 'klever-sdk', 'getting-started'],
      language: 'markdown',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Setting Up MCP Server in VSCode
  createKnowledgeEntry(
    'documentation',
    `# Setting Up klever-vm MCP Server in Visual Studio Code

## Prerequisites
- Visual Studio Code 1.102 or newer (with built-in MCP support)
- GitHub Copilot Chat extension installed and enabled

## Option 1: Public MCP Server (Recommended)

The easiest way to get started is using the public Klever MCP server. No local setup required.

Create a \`.vscode/mcp.json\` file at the root of your project:

\`\`\`json
{
  "inputs": [],
  "servers": {
    "klever-vm": {
      "type": "sse",
      "url": "https://mcp.klever.org/mcp"
    }
  }
}
\`\`\`

This connects directly to the hosted Klever MCP server with all knowledge pre-loaded.

## Option 2: Local MCP Server

If you need a local instance (e.g., for development or custom knowledge), you can run the server locally.

**Additional prerequisite:** Locally built klever-vm server (via \`pnpm run build\`)

Create a \`.vscode/mcp.json\` file at the root of your project:

\`\`\`json
{
  "inputs": [],
  "servers": {
    "klever-vm": {
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
\`\`\`

**Note:** Update the path in \`args\` to point to your full path to \`mcp-klever-vm/dist/index.js\`.

## Running the MCP Server

1. After configuring \`mcp.json\`, VS Code may show an option to start the MCP server
2. Alternatively, restart VS Code to auto-discover and start the server
3. Check the **Output > MCP** panel for server logs

## Using with Copilot Chat

1. Open the GitHub Copilot Chat pane
2. Verify the server is running by asking: "Do you have Klever Blockchain Knowledge?"
3. The MCP server provides context-aware Klever smart contract assistance

## Troubleshooting
- **Tools don't appear?** Check if the server started in Output > MCP
- **Server errors (local)?** Ensure \`dist/index.js\` exists (run \`pnpm run build\` first)
- **Connection errors (public)?** Verify internet connectivity and that \`https://mcp.klever.org/mcp\` is reachable
- **Review security:** Always review server config before running MCP servers`,
    {
      title: 'Setting Up klever-vm MCP Server in VSCode',
      description:
        'Guide for configuring the klever-vm MCP server in Visual Studio Code - public or local',
      tags: ['vscode', 'mcp', 'setup', 'copilot', 'configuration', 'public-server'],
      language: 'json',
      relevanceScore: 0.9,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),
];

export default vscodeExtensionKnowledge;
