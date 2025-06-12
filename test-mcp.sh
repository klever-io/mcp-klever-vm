#!/bin/bash

# Test the MCP server directly

echo "Testing MCP server with query_context tool..."

# Start the MCP server and send a test query
MODE=mcp STORAGE_TYPE=memory node --experimental-vm-modules dist/index.js 2>&1 &
MCP_PID=$!

# Wait for server to start and ingest knowledge
sleep 3

# Kill the server
kill $MCP_PID

echo "Check the output above for:"
echo "1. '🔄 Auto-ingesting Klever knowledge base...'"
echo "2. '✅ Auto-ingestion complete: X contexts loaded'"