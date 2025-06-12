#!/bin/bash

# Setup script for Klever MCP Server

echo "🚀 Setting up Klever MCP Server with pnpm..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first:"
    echo "   npm install -g pnpm"
    echo "   or"
    echo "   curl -fsSL https://get.pnpm.io/install.sh | sh -"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build the project
echo "🔨 Building project..."
pnpm run build

# Ingest knowledge base
echo "📚 Ingesting Klever knowledge base..."
pnpm run ingest

echo "✅ Setup complete! You can now run:"
echo "   pnpm run dev    # For development"
echo "   pnpm start      # For production"
echo "   MODE=mcp pnpm start  # For MCP mode"