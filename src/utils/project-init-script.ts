export const projectInitScript = `#!/bin/bash

# Klever Smart Contract Project Initializer
# This script creates a new project and adds helper scripts

set -e

# Colors for output
RED="\\x1b[31m"
GREEN="\\x1b[32m"
YELLOW="\\x1b[33m"
BLUE="\\x1b[34m"
BOLD="\\x1b[1m"
RESET="\\x1b[0m"

# Default values
TEMPLATE="empty"
CONTRACT_NAME=""
MOVE_TO_CURRENT=true

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --template)
            TEMPLATE="$2"
            shift 2
            ;;
        --name)
            CONTRACT_NAME="$2"
            shift 2
            ;;
        --no-move)
            MOVE_TO_CURRENT=false
            shift
            ;;
        *)
            echo -e "\${RED}Unknown option: $1\${RESET}"
            exit 1
            ;;
    esac
done

# Validate contract name
if [ -z "$CONTRACT_NAME" ]; then
    echo -e "\${RED}Error: Contract name is required\${RESET}"
    echo "Usage: $0 --name <contract-name> [--template <template>] [--no-move]"
    exit 1
fi

echo -e "\${BOLD}\${BLUE}🚀 Creating Klever Smart Contract: $CONTRACT_NAME\${RESET}"

# Create temporary directory for initial creation
TEMP_DIR="/tmp/klever-contract-$$"
mkdir -p "$TEMP_DIR"

# Create the contract
echo -e "\${YELLOW}Creating contract from template: $TEMPLATE\${RESET}"

# Check if ksc exists
if [ ! -f ~/klever-sdk/ksc ]; then
    echo -e "\${RED}Error: Klever SDK (ksc) not found at ~/klever-sdk/ksc\${RESET}"
    echo "Please install the Klever SDK first"
    exit 1
fi

# Run ksc new command
~/klever-sdk/ksc new --template "$TEMPLATE" --name "$CONTRACT_NAME" --path "$TEMP_DIR" || {
    echo -e "\${RED}Error: Failed to create contract\${RESET}"
    exit 1
}

# Check what was created
echo -e "\${YELLOW}Checking created files...\${RESET}"
ls -la "$TEMP_DIR/"

# Find the actual project directory (ksc might create it differently)
PROJECT_DIR=""
if [ -d "$TEMP_DIR/$CONTRACT_NAME" ]; then
    PROJECT_DIR="$TEMP_DIR/$CONTRACT_NAME"
elif [ -d "$TEMP_DIR" ] && [ "$(ls -A $TEMP_DIR)" ]; then
    # If CONTRACT_NAME dir doesn't exist, check if files were created directly in TEMP_DIR
    PROJECT_DIR="$TEMP_DIR"
else
    echo -e "\${RED}Error: Project was not created as expected\${RESET}"
    exit 1
fi

# Move to current directory if requested
if [ "$MOVE_TO_CURRENT" = true ]; then
    echo -e "\${YELLOW}Moving project to current directory...\${RESET}"
    
    # If project is in a subdirectory
    if [ "$PROJECT_DIR" = "$TEMP_DIR/$CONTRACT_NAME" ]; then
        # Move all files including hidden ones
        if [ -n "$(ls -A $PROJECT_DIR)" ]; then
            cp -r "$PROJECT_DIR"/* . 2>/dev/null || true
            cp -r "$PROJECT_DIR"/.[^.]* . 2>/dev/null || true
        fi
    else
        # Files are directly in TEMP_DIR
        if [ -n "$(ls -A $PROJECT_DIR)" ]; then
            cp -r "$PROJECT_DIR"/* . 2>/dev/null || true
            cp -r "$PROJECT_DIR"/.[^.]* . 2>/dev/null || true
        fi
    fi
else
    # Move the entire project directory
    if [ "$PROJECT_DIR" = "$TEMP_DIR/$CONTRACT_NAME" ]; then
        mv "$PROJECT_DIR" .
    else
        # Create project directory and move files
        mkdir -p "$CONTRACT_NAME"
        if [ -n "$(ls -A $PROJECT_DIR)" ]; then
            cp -r "$PROJECT_DIR"/* "$CONTRACT_NAME"/ 2>/dev/null || true
            cp -r "$PROJECT_DIR"/.[^.]* "$CONTRACT_NAME"/ 2>/dev/null || true
        fi
    fi
fi

# Clean up temp directory
rm -rf "$TEMP_DIR" 2>/dev/null || true

# Create helper scripts directory
mkdir -p scripts

# Create deploy.sh
echo -e "\${YELLOW}Creating deploy.sh...\${RESET}"
cat > scripts/deploy.sh << 'EOF'
#!/bin/bash

# Deploy script for $CONTRACT_NAME

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

# Extract transaction hash and contract address
TX_HASH=$(echo "$DEPLOY_OUTPUT" | grep -o '"hash": "[^"]*"' | head -1 | cut -d'"' -f4)

# Try to extract contract address
CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    if 'logs' in data and 'events' in data['logs']:
        for event in data['logs']['events']:
            if event.get('identifier') == 'SCDeploy':
                print(event.get('address', ''))
                break
except: pass
" 2>/dev/null)

# Create history file
mkdir -p output
HISTORY_FILE="output/history.json"
[ ! -f "$HISTORY_FILE" ] && echo "[]" > "$HISTORY_FILE"

if [ -n "$TX_HASH" ] && [ -n "$CONTRACT_ADDRESS" ]; then
    # Add to history
    jq --arg tx "$TX_HASH" --arg addr "$CONTRACT_ADDRESS" \\
       '. + [{"hash": $tx, "contractAddress": $addr, "timestamp": now | strftime("%Y-%m-%d %H:%M:%S")}]' \\
       "$HISTORY_FILE" > "$HISTORY_FILE.tmp" && mv "$HISTORY_FILE.tmp" "$HISTORY_FILE"
    
    echo "Transaction: $TX_HASH"
    echo "Contract: $CONTRACT_ADDRESS"
else
    echo "Warning: Could not extract deployment information"
fi
EOF

# Create upgrade.sh
echo -e "\${YELLOW}Creating upgrade.sh...\${RESET}"
cat > scripts/upgrade.sh << 'EOF'
#!/bin/bash

# Upgrade script for $CONTRACT_NAME

set -e

# Get contract address
if [ $# -eq 1 ]; then
    CONTRACT_ADDRESS=$1
else
    echo "Getting latest contract from history.json..."
    CONTRACT_ADDRESS=$(jq -r '.[-1].contractAddress' output/history.json 2>/dev/null)
    
    if [ -z "$CONTRACT_ADDRESS" ] || [ "$CONTRACT_ADDRESS" = "null" ]; then
        echo "Error: No contract address found"
        echo "Usage: $0 [contract-address]"
        exit 1
    fi
fi

echo "Contract address: $CONTRACT_ADDRESS"

# Build first
echo "Building smart contract..."
~/klever-sdk/ksc all build || { echo "Build failed"; exit 1; }

# Get contract WASM
CONTRACT_WASM=$(find output -name "*.wasm" | head -1)
if [ -z "$CONTRACT_WASM" ]; then
    echo "Error: No WASM file found"
    exit 1
fi

# Upgrade contract
echo "Upgrading contract..."
KLEVER_NODE=https://node.testnet.klever.org \\
    ~/klever-sdk/koperator \\
    --key-file="$HOME/klever-sdk/walletKey.pem" \\
    sc upgrade "$CONTRACT_ADDRESS" \\
    --wasm="$CONTRACT_WASM" \\
    --payable --payableBySC --readable --upgradeable \\
    --await --sign --result-only

echo "Contract upgrade complete!"
EOF

# Create query.sh
echo -e "\${YELLOW}Creating query.sh...\${RESET}"
cat > scripts/query.sh << 'EOF'
#!/bin/bash

# Query script for $CONTRACT_NAME

set -e

# Colors
RESET="\\x1b[0m"
BOLD="\\x1b[1m"
YELLOW="\\x1b[33m"
BLUE="\\x1b[34m"
CYAN="\\x1b[36m"

# Parse arguments
ENDPOINT=""
CONTRACT_ADDRESS=""
ARGUMENTS=()

while [[ $# -gt 0 ]]; do
    case $1 in
        --endpoint) ENDPOINT="$2"; shift 2 ;;
        --contract) CONTRACT_ADDRESS="$2"; shift 2 ;;
        --arg) ARGUMENTS+=("$2"); shift 2 ;;
        *) echo "Unknown argument: $1"; exit 1 ;;
    esac
done

if [ -z "$ENDPOINT" ]; then
    echo "Error: --endpoint is required"
    exit 1
fi

# Get contract from history if not provided
if [ -z "$CONTRACT_ADDRESS" ]; then
    CONTRACT_ADDRESS=$(jq -r '.[-1].contractAddress' output/history.json 2>/dev/null)
    if [ -z "$CONTRACT_ADDRESS" ] || [ "$CONTRACT_ADDRESS" = "null" ]; then
        echo "Error: No contract address found"
        exit 1
    fi
fi

# Encode arguments
JSON_ARGS="["
for ((i=0; i<\${#ARGUMENTS[@]}; i++)); do
    ARG="\${ARGUMENTS[$i]}"
    
    if [[ "$ARG" == 0x* ]]; then
        HEX_VALUE="\${ARG#0x}"
        ENCODED=$(echo -n "$HEX_VALUE" | xxd -r -p | base64)
    else
        ENCODED=$(echo -n "$ARG" | base64)
    fi
    
    [[ $i -gt 0 ]] && JSON_ARGS="$JSON_ARGS,"
    JSON_ARGS="$JSON_ARGS\\"$ENCODED\\""
done
JSON_ARGS="$JSON_ARGS]"

# Build request
JSON_REQUEST="{\\"ScAddress\\":\\"$CONTRACT_ADDRESS\\",\\"FuncName\\":\\"$ENDPOINT\\",\\"Arguments\\":$JSON_ARGS}"

echo -e "\${BOLD}\${BLUE}Querying $ENDPOINT...\${RESET}"
RESPONSE=$(curl -s 'https://api.testnet.klever.org/v1.0/sc/query' --data-raw "$JSON_REQUEST")

# Display response
echo "$RESPONSE" | jq -C .

# Decode return data if present
RETURN_DATA=$(echo "$RESPONSE" | jq -r '.data.returnData[]? // empty')
if [ -n "$RETURN_DATA" ]; then
    echo -e "\\n\${BOLD}\${YELLOW}Decoded Data:\${RESET}"
    for data in $RETURN_DATA; do
        echo "Base64: $data"
        echo "Hex: $(echo "$data" | base64 -d | xxd -p)"
        echo "---"
    done
fi
EOF

# Create build.sh
echo -e "\${YELLOW}Creating build.sh...\${RESET}"
cat > scripts/build.sh << 'EOF'
#!/bin/bash

# Build script for $CONTRACT_NAME

echo "Building smart contract..."
~/klever-sdk/ksc all build

if [ $? -eq 0 ]; then
    echo -e "\${GREEN}✅ Build successful!\${RESET}"
    echo "WASM files:"
    find output -name "*.wasm" -exec ls -lh {} \\;
else
    echo -e "\${RED}❌ Build failed!\${RESET}"
    exit 1
fi
EOF

# Create test.sh
echo -e "\${YELLOW}Creating test.sh...\${RESET}"
cat > scripts/test.sh << 'EOF'
#!/bin/bash

# Test script for $CONTRACT_NAME

echo "Running tests..."
cargo test

if [ $? -eq 0 ]; then
    echo -e "\${GREEN}✅ All tests passed!\${RESET}"
else
    echo -e "\${RED}❌ Tests failed!\${RESET}"
    exit 1
fi
EOF

# Create interact.sh
echo -e "\${YELLOW}Creating interact.sh...\${RESET}"
cat > scripts/interact.sh << 'EOF'
#!/bin/bash

# Interactive script for $CONTRACT_NAME

echo "Common commands:"
echo "  ./scripts/build.sh         - Build the contract"
echo "  ./scripts/deploy.sh        - Deploy to testnet"
echo "  ./scripts/upgrade.sh       - Upgrade existing contract"
echo "  ./scripts/query.sh         - Query contract endpoints"
echo "  ./scripts/test.sh          - Run tests"
echo ""
echo "Examples:"
echo "  ./scripts/query.sh --endpoint getSum"
echo "  ./scripts/query.sh --endpoint getValue --arg myKey"
echo ""
echo "Contract history: output/history.json"
EOF

# Make all scripts executable
chmod +x scripts/*.sh

# Create or update .gitignore
echo -e "\${YELLOW}Creating/updating .gitignore...\${RESET}"
cat > .gitignore << 'GITIGNORE_EOF'
# Rust
target/
Cargo.lock
**/*.rs.bk
*.pdb

# IDE
.idea/
.vscode/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment
.env
.env.local
.env.*.local

# Testing
coverage/
*.coverage
.coverage

# Temporary files
*.tmp
*.temp
.tmp/
.temp/

# Backup files
*.backup
*.bak

# Node (if using any JS tools)
node_modules/
.npm/

# Python (if using any Python tools)
__pycache__/
*.py[cod]
*$py.class
.Python
venv/
env/

# Documentation builds
docs/_build/
docs/.doctrees/

# Contract deployment history
deployment-history/
*.deployment.json
output/history.json

# Local configuration
config.local.json
settings.local.json

# Keys and secrets (NEVER commit these)
*.key
*.pem
*.pfx
*.p12
keystore/
secrets/

# Klever specific
output/
wasm/
*.wasm
GITIGNORE_EOF

# Replace CONTRACT_NAME in all scripts
sed -i.bak "s/\$CONTRACT_NAME/$CONTRACT_NAME/g" scripts/*.sh && rm scripts/*.sh.bak

echo -e "\${BOLD}\${GREEN}✅ Project initialized successfully!\${RESET}"
echo ""
echo -e "\${CYAN}Project structure:\${RESET}"
echo "  ./src/              - Contract source code"
echo "  ./tests/            - Test files"
echo "  ./scripts/          - Helper scripts"
echo "  ./output/           - Build artifacts"
echo "  ./.gitignore        - Git ignore file (created)"
echo ""
echo -e "\${CYAN}Next steps:\${RESET}"
echo "  1. Edit src/lib.rs to implement your contract"
echo "  2. Run ./scripts/build.sh to build"
echo "  3. Run ./scripts/deploy.sh to deploy"
echo ""
echo -e "\${CYAN}Helper scripts:\${RESET}"
./scripts/interact.sh
`;

export const createProjectInitScript = () => {
  return projectInitScript;
};

// Tool description for MCP
export const projectInitToolDefinition = {
  name: 'init_klever_project',
  description: 'Initialize a new Klever smart contract project with helper scripts',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'The name of the contract'
      },
      template: {
        type: 'string',
        description: 'Template to use (default: empty)',
        default: 'empty'
      },
      noMove: {
        type: 'boolean',
        description: 'Do not move project files to current directory',
        default: false
      }
    },
    required: ['name']
  }
};