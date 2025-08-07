import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * KSC (Klever Smart Contract) tool documentation
 */

export const kscKnowledge: KnowledgeEntry[] = [
  // KSC Tool Overview
  createKnowledgeEntry(
    'documentation',
    `# Klever Smart Contract CLI (ksc) Commands Reference

## Overview
KSC (Klever Smart Contract CLI) is the build tool for Klever smart contracts. It's the Klever equivalent of MultiversX's sc-meta tool.

## Location
If Klever VSCode extension is installed, ksc is located at:
\`~/klever-sdk/ksc\`

## Project Management
\`\`\`bash
# List all available templates
~/klever-sdk/ksc templates

# Create new contract from template
~/klever-sdk/ksc new --template <template-name> --name <contract-name> --path <path>

# Examples:
~/klever-sdk/ksc new --template empty --name MyToken --path ./my-token
~/klever-sdk/ksc new --template adder --name Calculator --path ./calculator
~/klever-sdk/ksc new --template multisig --name MultiSigWallet --path ./multisig
\`\`\`

## Build Commands
\`\`\`bash
# Build all contracts in the project
~/klever-sdk/ksc all build

# Build specific contract
~/klever-sdk/ksc contract build

# Clean build artifacts
~/klever-sdk/ksc all clean

# Build with custom output path
~/klever-sdk/ksc all build --output-path ./my-output
\`\`\`

## Other Useful Commands
\`\`\`bash
# Generate contract ABI
~/klever-sdk/ksc all abi

# Run tests
~/klever-sdk/ksc test

# Check contract size
~/klever-sdk/ksc all size
\`\`\``,
    {
      title: 'Klever Smart Contract CLI (ksc) Commands Reference',
      description: 'Complete reference for all ksc commands used in Klever smart contract development',
      tags: ['ksc', 'commands', 'reference', 'cli', 'build', 'templates'],
      language: 'bash',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Setting Up New Project
  createKnowledgeEntry(
    'documentation',
    `# Setting Up a New Klever Smart Contract Project

## 1. Create New Contract from Template
\`\`\`bash
# First, list all available templates
~/klever-sdk/ksc templates

# Create a contract using a specific template
~/klever-sdk/ksc new --template empty --name MyContract --path ./my-contract

# Navigate to the new contract
cd ./my-contract
\`\`\`

## 2. Project Structure Created
\`\`\`
my-contract/
├── Cargo.toml          # Main project configuration
├── meta/               # Meta crate for ABI generation
├── src/                # Contract source code
│   └── lib.rs         # Main contract implementation
├── tests/              # Test files
├── wasm/               # WASM build configuration
└── sc-config.toml      # Smart contract build config
\`\`\`

## 3. Initial Contract Code
The empty template creates a basic contract with:
- \`#[init]\` function for initialization
- Basic project structure
- Build configuration

## 4. Next Steps
1. Implement your contract logic in \`src/lib.rs\`
2. Add endpoints, storage, and events
3. Build with: \`~/klever-sdk/ksc all build\`
4. Deploy using the deployment scripts

## Template Options
- **empty**: Minimal contract with init function
- **adder**: Example with storage and endpoints
- **ping-pong**: Message passing example
- **crowdfunding**: More complex example
- **multisig**: Multi-signature wallet example`,
    {
      title: 'Setting Up New Klever Contract Project',
      description: 'Complete guide for creating and setting up a new Klever smart contract project from templates',
      tags: ['setup', 'create', 'project', 'template', 'getting-started', 'ksc'],
      language: 'markdown',
      relevanceScore: 0.9,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Build Configuration
  createKnowledgeEntry(
    'code_example',
    `# Build Configuration Examples

## sc-config.toml
\`\`\`toml
[settings]
# Main contract name
main = "my-contract"

# Additional contracts (if any)
# contracts = ["contract1", "contract2"]

[contracts.main]
name = "MyContract"
add-unlabelled = true
ei-version = "1.2"

[contracts.main.profile]
codegen-units = 1
opt-level = "z"
lto = true
debug = false
panic = "abort"
overflow-checks = false
\`\`\`

## Cargo.toml Example
\`\`\`toml
[package]
name = "my-contract"
version = "0.0.0"
edition = "2021"
publish = false

[lib]
path = "src/lib.rs"

[dependencies]
klever-sc = "0.44.0"

[dev-dependencies]
klever-sc-scenario = "0.44.0"

[profile.release]
codegen-units = 1
opt-level = "z"
lto = true
debug = false
panic = "abort"
overflow-checks = false
\`\`\`

## Build Commands:
\`\`\`bash
# Build all contracts
~/klever-sdk/ksc all build

# Build specific contract
~/klever-sdk/ksc contract build

# Clean build
~/klever-sdk/ksc all clean

# Build with output path
~/klever-sdk/ksc all build --output-path ./my-output
\`\`\``,
    {
      title: 'Klever Contract Build Configuration',
      description: 'Examples of build configuration files and commands for Klever smart contracts',
      tags: ['build', 'configuration', 'cargo', 'sc-config', 'ksc'],
      language: 'toml',
      relevanceScore: 0.75,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Build Script Example
  createKnowledgeEntry(
    'code_example',
    `# Build Script for Klever Contracts

\`\`\`bash
#!/bin/bash
# Build script for Klever contracts

echo "Building smart contract..."
~/klever-sdk/ksc all build

if [ $? -eq 0 ]; then
    echo -e "\\033[32m✅ Build successful!\\033[0m"
    echo "WASM files:"
    find output -name "*.wasm" -exec ls -lh {} \\;
else
    echo -e "\\033[31m❌ Build failed!\\033[0m"
    exit 1
fi
\`\`\`

## Deploy Script
\`\`\`bash
#!/bin/bash
# Deploy script for Klever contracts

set -e

# Build first
echo "Building smart contract..."
~/klever-sdk/ksc all build || { echo "Build failed"; exit 1; }

# Get contract name from output directory
CONTRACT_WASM=$(find output -name "*.wasm" | head -1)
if [ -z "$CONTRACT_WASM" ]; then
    echo "Error: No WASM file found in output directory"
    exit 1
fi

echo "Deploying contract..."
DEPLOY_OUTPUT=$(KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc create \\
    --upgradeable --readable --payable --payableBySC \\
    --wasm="$CONTRACT_WASM" \\
    --await --sign --result-only)

echo "Contract deployment complete!"
\`\`\``,
    {
      title: 'Build and Deploy Scripts for Klever Contracts',
      description: 'Example bash scripts for building and deploying Klever smart contracts',
      tags: ['build', 'deploy', 'script', 'bash', 'ksc', 'automation'],
      language: 'bash',
      relevanceScore: 0.85,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Project Structure Handling
  createKnowledgeEntry(
    'best_practice',
    `# Project Structure Handling for ksc new

The \`ksc new\` command may create projects in different structures:

\`\`\`bash
# Create in temp directory first
TEMP_DIR="/tmp/klever-contract-$$"
~/klever-sdk/ksc new --template "$TEMPLATE" --name "$CONTRACT_NAME" --path "$TEMP_DIR"

# Find actual project directory
PROJECT_DIR=""
if [ -d "$TEMP_DIR/$CONTRACT_NAME" ]; then
    # Created in subdirectory
    PROJECT_DIR="$TEMP_DIR/$CONTRACT_NAME"
elif [ -d "$TEMP_DIR" ] && [ "$(ls -A $TEMP_DIR)" ]; then
    # Created directly in temp dir
    PROJECT_DIR="$TEMP_DIR"
fi

# Move files including hidden ones
cp -r "$PROJECT_DIR"/* . 2>/dev/null || true
cp -r "$PROJECT_DIR"/.[^.]* . 2>/dev/null || true

# Clean up
rm -rf "$TEMP_DIR"
\`\`\`

Important: Always handle both subdirectory and direct creation patterns.`,
    {
      title: 'Project Structure Handling for ksc new',
      description: 'Best practice for handling different project creation patterns',
      tags: ['ksc', 'project', 'structure', 'best-practice'],
      language: 'bash',
      relevanceScore: 0.85,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Common KSC Commands
  createKnowledgeEntry(
    'deployment_tool',
    `# Common KSC Commands

## List Available Templates
\`\`\`bash
~/klever-sdk/ksc templates
\`\`\`
This command will display all available templates that can be used with ksc new:
- empty: Basic contract structure with init function
- adder: Simple contract with add functionality
- ping-pong: Example contract demonstrating message passing
- crowdfunding: Crowdfunding contract example
- multisig: Multi-signature wallet implementation
- lottery: Lottery contract example
- staking: Token staking contract
- marketplace: NFT marketplace contract

## Create New Contract
\`\`\`bash
# Basic usage
~/klever-sdk/ksc new --template empty --name MyContract --path .

# Create in specific directory
~/klever-sdk/ksc new --template empty --name StakingContract --path ./contracts/staking
\`\`\`

## Build Contract
\`\`\`bash
# Build all contracts
~/klever-sdk/ksc all build

# Clean and rebuild
~/klever-sdk/ksc all clean
~/klever-sdk/ksc all build
\`\`\`

## Generate ABI
\`\`\`bash
~/klever-sdk/ksc all abi
\`\`\`

## Check Contract Size
\`\`\`bash
~/klever-sdk/ksc all size
\`\`\``,
    {
      title: 'Common KSC Commands',
      description: 'Most frequently used ksc commands for Klever smart contract development',
      tags: ['ksc', 'commands', 'templates', 'build', 'create'],
      language: 'bash',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Build Script Documentation
  createKnowledgeEntry(
    'deployment_tool',
    `# build.sh - Smart Contract Build Script

## Features
- Sources common.sh for colored output
- Runs ~/klever-sdk/ksc all build
- Shows WASM file sizes after successful build
- Clear success/failure indicators with colors

## Usage
\`\`\`bash
# Build the contract
./scripts/build.sh
\`\`\`

## Output
- Lists all generated WASM files with sizes
- Green checkmark for success
- Red X for failure`,
    {
      title: 'Klever Contract Build Script',
      description: 'Simple build script with colored output and file size reporting',
      tags: ['build', 'script', 'bash', 'ksc', 'wasm', 'compile', 'common.sh', 'output'],
      language: 'bash',
      relevanceScore: 0.85,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),
];

export default kscKnowledge;