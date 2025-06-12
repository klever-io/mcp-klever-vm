#!/bin/bash

# Script to install Klever MCP server configuration for Claude Desktop

echo "🚀 Installing Klever MCP server for Claude Desktop..."

# Get the absolute path of the current directory
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Claude Desktop config location on macOS
CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"
MCP_CONFIG_FILE="$CLAUDE_CONFIG_DIR/claude_desktop_config.json"

# Create config directory if it doesn't exist
mkdir -p "$CLAUDE_CONFIG_DIR"

# Check if config file exists
if [ ! -f "$MCP_CONFIG_FILE" ]; then
    echo "Creating new Claude configuration file..."
    echo '{
  "mcpServers": {}
}' > "$MCP_CONFIG_FILE"
fi

# Create the MCP server configuration
MCP_SERVER_CONFIG=$(cat <<EOF
{
  "command": "node",
  "args": [
    "--experimental-vm-modules",
    "$PROJECT_DIR/dist/index.js"
  ],
  "env": {
    "MODE": "mcp",
    "STORAGE_TYPE": "memory"
  }
}
EOF
)

# Update the configuration using a temporary file
echo "Adding Klever MCP server to Claude configuration..."
if command -v jq &> /dev/null; then
    # Use jq if available
    jq --argjson server "$MCP_SERVER_CONFIG" '.mcpServers["klever-vm"] = $server' "$MCP_CONFIG_FILE" > "$MCP_CONFIG_FILE.tmp"
    mv "$MCP_CONFIG_FILE.tmp" "$MCP_CONFIG_FILE"
    echo "✅ Configuration updated successfully!"
else
    echo "⚠️  jq not found. Please manually add this configuration to $MCP_CONFIG_FILE:"
    echo ""
    echo "Under 'mcpServers', add:"
    echo '"klever-vm": '$MCP_SERVER_CONFIG
fi

echo ""
echo "📋 Next steps:"
echo "1. Build the project: pnpm run build"
echo "2. Restart Claude Desktop"
echo "3. Look for 'klever-vm' in the MCP tools"
echo ""
echo "✨ Done!"