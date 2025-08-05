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
echo -e "\${YELLOW}Running: ~/klever-sdk/ksc new --template \"$TEMPLATE\" --name \"$CONTRACT_NAME\" --path \"$TEMP_DIR\"\${RESET}"
~/klever-sdk/ksc new --template "$TEMPLATE" --name "$CONTRACT_NAME" --path "$TEMP_DIR" || {
    echo -e "\${RED}Error: Failed to create contract\${RESET}"
    echo -e "\${RED}ksc exit code: $?\${RESET}"
    exit 1
}

# Check what was created
echo -e "\${YELLOW}Checking created files in $TEMP_DIR...\${RESET}"
ls -la "$TEMP_DIR/"

# Also check if ksc created the project in current directory instead
echo -e "\${YELLOW}Checking if ksc created files in current directory...\${RESET}"
if [ -d "./$CONTRACT_NAME" ]; then
    echo -e "\${YELLOW}Found project in current directory: ./$CONTRACT_NAME\${RESET}"
    ls -la "./$CONTRACT_NAME"
fi

# Find the actual project directory (ksc might create it differently)
PROJECT_DIR=""
if [ -d "$TEMP_DIR/$CONTRACT_NAME" ]; then
    PROJECT_DIR="$TEMP_DIR/$CONTRACT_NAME"
    echo -e "\${GREEN}Found project in: $PROJECT_DIR\${RESET}"
elif [ -d "./$CONTRACT_NAME" ]; then
    # ksc might have created it in current directory despite --path
    PROJECT_DIR="./$CONTRACT_NAME"
    echo -e "\${YELLOW}Project created in current directory instead of temp\${RESET}"
    # Since it's already in current dir, we can skip the move
    MOVE_TO_CURRENT=false
elif [ -d "$TEMP_DIR" ] && [ "$(ls -A $TEMP_DIR)" ]; then
    # If CONTRACT_NAME dir doesn't exist, check if files were created directly in TEMP_DIR
    PROJECT_DIR="$TEMP_DIR"
    echo -e "\${YELLOW}Files created directly in temp directory\${RESET}"
else
    echo -e "\${RED}Error: Project was not created as expected\${RESET}"
    echo -e "\${RED}Neither $TEMP_DIR/$CONTRACT_NAME nor ./$CONTRACT_NAME exists\${RESET}"
    exit 1
fi

# Move to current directory if requested
if [ "$MOVE_TO_CURRENT" = true ]; then
    echo -e "\${YELLOW}Moving project to current directory...\${RESET}"
    echo -e "\${YELLOW}PROJECT_DIR: $PROJECT_DIR\${RESET}"
    echo -e "\${YELLOW}Current directory: $(pwd)\${RESET}"
    
    # List what we're about to move
    echo -e "\${YELLOW}Files to move:\${RESET}"
    ls -la "$PROJECT_DIR"
    
    # If project is in a subdirectory
    if [ "$PROJECT_DIR" = "$TEMP_DIR/$CONTRACT_NAME" ]; then
        echo -e "\${YELLOW}Moving contents from subdirectory to current directory...\${RESET}"
        # Move all files including hidden ones from inside the project directory
        if [ -n "$(ls -A $PROJECT_DIR)" ]; then
            # Move contents, not the directory itself
            echo -e "\${YELLOW}Moving all files from $PROJECT_DIR/ to current directory\${RESET}"
            
            # First try with rsync (moves contents, not directory)
            if command -v rsync >/dev/null 2>&1; then
                rsync -av "$PROJECT_DIR/" . || {
                    echo -e "\${RED}rsync failed, trying cp...\${RESET}"
                    # Copy all files including hidden ones
                    find "$PROJECT_DIR" -maxdepth 1 -mindepth 1 -exec cp -r {} . \; 2>&1 || echo -e "\${RED}Failed to copy files\${RESET}"
                }
            else
                # No rsync, use cp
                echo -e "\${YELLOW}Using cp to move files...\${RESET}"
                # Copy all files including hidden ones
                find "$PROJECT_DIR" -maxdepth 1 -mindepth 1 -exec cp -r {} . \; 2>&1 || echo -e "\${RED}Failed to copy files\${RESET}"
            fi
        fi
    else
        echo -e "\${YELLOW}Moving from temp directory directly...\${RESET}"
        # Files are directly in TEMP_DIR, but we need to check if there's a subdirectory
        if [ -d "$TEMP_DIR/klever-dice" ] || [ -d "$TEMP_DIR/$CONTRACT_NAME" ]; then
            # There's a subdirectory, move its contents
            ACTUAL_DIR=$(find "$TEMP_DIR" -maxdepth 1 -type d ! -path "$TEMP_DIR" | head -1)
            if [ -n "$ACTUAL_DIR" ]; then
                echo -e "\${YELLOW}Found project in $ACTUAL_DIR, moving contents...\${RESET}"
                if command -v rsync >/dev/null 2>&1; then
                    rsync -av "$ACTUAL_DIR/" . || {
                        echo -e "\${RED}rsync failed, trying cp...\${RESET}"
                        find "$ACTUAL_DIR" -maxdepth 1 -mindepth 1 -exec cp -r {} . \; 2>&1 || echo -e "\${RED}Failed to copy files\${RESET}"
                    }
                else
                    find "$ACTUAL_DIR" -maxdepth 1 -mindepth 1 -exec cp -r {} . \; 2>&1 || echo -e "\${RED}Failed to copy files\${RESET}"
                fi
            fi
        else
            # Files truly are directly in TEMP_DIR
            if [ -n "$(ls -A $PROJECT_DIR)" ]; then
                if command -v rsync >/dev/null 2>&1; then
                    rsync -av "$PROJECT_DIR/" . || {
                        echo -e "\${RED}rsync failed, trying cp...\${RESET}"
                        cp -r "$PROJECT_DIR"/* . 2>&1 || echo -e "\${RED}Failed to copy regular files\${RESET}"
                        cp -r "$PROJECT_DIR"/.[^.]* . 2>&1 || echo -e "\${RED}Failed to copy hidden files\${RESET}"
                    }
                else
                    cp -r "$PROJECT_DIR"/* . 2>&1 || echo -e "\${RED}Failed to copy regular files\${RESET}"
                    cp -r "$PROJECT_DIR"/.[^.]* . 2>&1 || echo -e "\${RED}Failed to copy hidden files\${RESET}"
                fi
            fi
        fi
    fi
    
    echo -e "\${GREEN}Files after move:\${RESET}"
    ls -la .
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

# Colors
RED="\\x1b[31m"
GREEN="\\x1b[32m"
YELLOW="\\x1b[33m"
CYAN="\\x1b[36m"
RESET="\\x1b[0m"

# Configuration
CONFIG_FILE=".env"
DEFAULT_NETWORK="testnet"

# Load configuration
if [ -f "$CONFIG_FILE" ]; then
    export $(cat "$CONFIG_FILE" | grep -v '^#' | xargs)
fi

# Set defaults
NETWORK="\${NETWORK:-\$DEFAULT_NETWORK}"
KEY_FILE="\${KEY_FILE:-\$HOME/klever-sdk/walletKey.pem}"

# Set network endpoint
case "$NETWORK" in
    mainnet)
        KLEVER_NODE="https://node.klever.org"
        ;;
    testnet)
        KLEVER_NODE="https://node.testnet.klever.org"
        ;;
    devnet)
        KLEVER_NODE="https://node.devnet.klever.org"
        ;;
    local)
        KLEVER_NODE="http://localhost:8080"
        ;;
    *)
        echo -e "\${YELLOW}Unknown network: \$NETWORK, using testnet\${RESET}"
        NETWORK="testnet"
        KLEVER_NODE="https://node.testnet.klever.org"
        ;;
esac

echo -e "\${CYAN}Deploying to: \${NETWORK}\${RESET}"

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
DEPLOY_OUTPUT=$(KLEVER_NODE=$KLEVER_NODE \\
    ~/klever-sdk/koperator \\
    --key-file="$KEY_FILE" \\
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
    # Add to history with network
    jq --arg tx "$TX_HASH" --arg addr "$CONTRACT_ADDRESS" --arg net "$NETWORK" \\
       '. + [{"hash": $tx, "contractAddress": $addr, "network": $net, "timestamp": now | strftime("%Y-%m-%d %H:%M:%S")}]' \\
       "$HISTORY_FILE" > "$HISTORY_FILE.tmp" && mv "$HISTORY_FILE.tmp" "$HISTORY_FILE"
    
    echo -e "\${GREEN}Transaction: $TX_HASH\${RESET}"
    echo -e "\${GREEN}Contract: $CONTRACT_ADDRESS\${RESET}"
    echo -e "\${GREEN}Network: $NETWORK\${RESET}"
else
    echo -e "\${RED}Warning: Could not extract deployment information\${RESET}"
fi
EOF

# Create upgrade.sh
echo -e "\${YELLOW}Creating upgrade.sh...\${RESET}"
cat > scripts/upgrade.sh << 'EOF'
#!/bin/bash

# Upgrade script for $CONTRACT_NAME

set -e

# Colors
RED="\\x1b[31m"
GREEN="\\x1b[32m"
YELLOW="\\x1b[33m"
CYAN="\\x1b[36m"
RESET="\\x1b[0m"

# Configuration
CONFIG_FILE=".env"
HISTORY_FILE="output/history.json"
DEFAULT_NETWORK="testnet"

# Load configuration
if [ -f "$CONFIG_FILE" ]; then
    export $(cat "$CONFIG_FILE" | grep -v '^#' | xargs)
fi

# Set defaults
NETWORK="\${NETWORK:-\$DEFAULT_NETWORK}"
KEY_FILE="\${KEY_FILE:-\$HOME/klever-sdk/walletKey.pem}"

# Set network endpoint
case "$NETWORK" in
    mainnet)
        KLEVER_NODE="https://node.klever.org"
        ;;
    testnet)
        KLEVER_NODE="https://node.testnet.klever.org"
        ;;
    devnet)
        KLEVER_NODE="https://node.devnet.klever.org"
        ;;
    local)
        KLEVER_NODE="http://localhost:8080"
        ;;
    *)
        echo -e "\${YELLOW}Unknown network: \$NETWORK, using testnet\${RESET}"
        NETWORK="testnet"
        KLEVER_NODE="https://node.testnet.klever.org"
        ;;
esac

echo -e "\${CYAN}Network: \${NETWORK}\${RESET}"

# Get contract address
if [ $# -eq 1 ]; then
    CONTRACT_ADDRESS=$1
else
    echo "Getting contract from history for $NETWORK..."
    # Try to get address for current network
    CONTRACT_ADDRESS=$(jq -r ".[] | select(.network == \\"\$NETWORK\\") | .contractAddress" "$HISTORY_FILE" 2>/dev/null | tail -1)
    
    # Fallback to last deployed contract if no network match
    if [ -z "$CONTRACT_ADDRESS" ] || [ "$CONTRACT_ADDRESS" = "null" ]; then
        CONTRACT_ADDRESS=$(jq -r '.[-1].contractAddress' "$HISTORY_FILE" 2>/dev/null)
        if [ -n "$CONTRACT_ADDRESS" ] && [ "$CONTRACT_ADDRESS" != "null" ]; then
            LAST_NETWORK=$(jq -r '.[-1].network // "unknown"' "$HISTORY_FILE" 2>/dev/null)
            echo -e "\${YELLOW}No contract found for \$NETWORK, using last deployment from \$LAST_NETWORK\${RESET}"
        fi
    fi
    
    if [ -z "$CONTRACT_ADDRESS" ] || [ "$CONTRACT_ADDRESS" = "null" ]; then
        echo -e "\${RED}Error: No contract address found\${RESET}"
        echo "Usage: $0 [contract-address]"
        exit 1
    fi
fi

echo -e "\${CYAN}Contract address: $CONTRACT_ADDRESS\${RESET}"

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
UPGRADE_OUTPUT=$(KLEVER_NODE=$KLEVER_NODE \\
    ~/klever-sdk/koperator \\
    --key-file="$KEY_FILE" \\
    sc upgrade "$CONTRACT_ADDRESS" \\
    --wasm="$CONTRACT_WASM" \\
    --payable --payableBySC --readable --upgradeable \\
    --await --sign --result-only)

echo -e "\${GREEN}Contract upgrade complete!\${RESET}"

# Extract transaction hash  
TX_HASH=$(echo "$UPGRADE_OUTPUT" | grep -o '"hash": "[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$TX_HASH" ]; then
    # Add upgrade to history
    jq --arg tx "$TX_HASH" --arg addr "$CONTRACT_ADDRESS" --arg net "$NETWORK" \\
       '. + [{"hash": $tx, "contractAddress": $addr, "network": $net, "type": "upgrade", "timestamp": now | strftime("%Y-%m-%d %H:%M:%S")}]' \\
       "$HISTORY_FILE" > "$HISTORY_FILE.tmp" && mv "$HISTORY_FILE.tmp" "$HISTORY_FILE"
    
    echo -e "\${GREEN}Transaction: $TX_HASH\${RESET}"
fi
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

set -e

# Colors
RED="\\x1b[31m"
GREEN="\\x1b[32m"
YELLOW="\\x1b[33m"
BLUE="\\x1b[34m"
CYAN="\\x1b[36m"
BOLD="\\x1b[1m"
RESET="\\x1b[0m"

# Configuration
CONFIG_FILE=".env"
HISTORY_FILE="output/history.json"
DEFAULT_NETWORK="testnet"

# Load configuration
load_config() {
    if [ -f "$CONFIG_FILE" ]; then
        export $(cat "$CONFIG_FILE" | grep -v '^#' | xargs)
    fi
    
    # Set defaults if not in config
    NETWORK="\${NETWORK:-\$DEFAULT_NETWORK}"
    KEY_FILE="\${KEY_FILE:-\$HOME/klever-sdk/walletKey.pem}"
}

# Set network endpoint
set_network() {
    case "$NETWORK" in
        mainnet)
            KLEVER_NODE="https://node.klever.org"
            ;;
        testnet)
            KLEVER_NODE="https://node.testnet.klever.org"
            ;;
        devnet)
            KLEVER_NODE="https://node.devnet.klever.org"
            ;;
        local)
            KLEVER_NODE="http://localhost:8080"
            ;;
        *)
            echo -e "\${YELLOW}Unknown network: \$NETWORK, using testnet\${RESET}"
            NETWORK="testnet"
            KLEVER_NODE="https://node.testnet.klever.org"
            ;;
    esac
    
    export KLEVER_NODE
    echo -e "\${CYAN}Network: \${BOLD}\$NETWORK\${RESET} (\${KLEVER_NODE})"
}

# Get contract address from history
get_contract_address() {
    if [ -z "$CONTRACT_ADDRESS" ]; then
        if [ -f "$HISTORY_FILE" ]; then
            # Try to get address for current network
            CONTRACT_ADDRESS=$(jq -r ".[] | select(.network == \\"\$NETWORK\\") | .contractAddress" "$HISTORY_FILE" 2>/dev/null | tail -1)
            
            # Fallback to last deployed contract if no network match
            if [ -z "$CONTRACT_ADDRESS" ] || [ "$CONTRACT_ADDRESS" = "null" ]; then
                CONTRACT_ADDRESS=$(jq -r '.[-1].contractAddress' "$HISTORY_FILE" 2>/dev/null)
            fi
        fi
        
        if [ -z "$CONTRACT_ADDRESS" ] || [ "$CONTRACT_ADDRESS" = "null" ]; then
            echo -e "\${RED}No contract found for \$NETWORK. Deploy first!\${RESET}"
            echo -e "\${YELLOW}Run: ./scripts/deploy.sh\${RESET}"
            return 1
        fi
    fi
    
    echo -e "\${CYAN}Contract: \${BOLD}\$CONTRACT_ADDRESS\${RESET}"
    return 0
}

# Generic function to invoke contract methods
invoke_contract() {
    local method=$1
    shift
    local args=("$@")
    
    echo -e "\${YELLOW}Invoking \${BOLD}\$method\${RESET}..."
    
    # Build koperator command
    local cmd="KLEVER_NODE=\$KLEVER_NODE ~/klever-sdk/koperator"
    cmd="\$cmd --key-file=\\"\$KEY_FILE\\""
    cmd="\$cmd sc invoke \\"\$CONTRACT_ADDRESS\\" \$method"
    
    # Add arguments
    for arg in "\${args[@]}"; do
        cmd="\$cmd \$arg"
    done
    
    # Add common flags
    cmd="\$cmd --await --sign --result-only"
    
    echo -e "\${CYAN}Command: \$cmd\${RESET}"
    
    # Execute
    eval "\$cmd"
}

# Query contract view
query_contract() {
    local endpoint=$1
    shift
    local args=("$@")
    
    echo -e "\${YELLOW}Querying \${BOLD}\$endpoint\${RESET}..."
    
    # Use the query.sh script
    local cmd="./scripts/query.sh --endpoint \$endpoint --contract \$CONTRACT_ADDRESS"
    
    # Add arguments
    for arg in "\${args[@]}"; do
        cmd="\$cmd --arg \\"\$arg\\""
    done
    
    eval "\$cmd"
}

# Build arguments for koperator
build_arg() {
    local type=$1
    local value=$2
    
    case "$type" in
        String)
            echo "--args String:\\"\$value\\""
            ;;
        Number|u64|u32|u16|u8)
            echo "--args Number:\$value"
            ;;
        Address)
            echo "--args Address:\\"\$value\\""
            ;;
        Bool)
            echo "--args Bool:\$value"
            ;;
        Hex)
            echo "--args Hex:\\"\$value\\""
            ;;
        *)
            echo "--args \\"\$value\\""
            ;;
    esac
}

# Interactive menu
show_menu() {
    echo -e "\\n\${BOLD}\${BLUE}=== $CONTRACT_NAME Interactive Menu ===\${RESET}"
    echo -e "\${GREEN}1.\${RESET} Build contract"
    echo -e "\${GREEN}2.\${RESET} Deploy contract"
    echo -e "\${GREEN}3.\${RESET} Upgrade contract"
    echo -e "\${GREEN}4.\${RESET} Query contract"
    echo -e "\${GREEN}5.\${RESET} Invoke contract method"
    echo -e "\${GREEN}6.\${RESET} Show contract info"
    echo -e "\${GREEN}7.\${RESET} Change network (current: \$NETWORK)"
    echo -e "\${GREEN}8.\${RESET} Show examples"
    echo -e "\${GREEN}0.\${RESET} Exit"
    echo
}

# Show examples
show_examples() {
    echo -e "\\n\${BOLD}\${YELLOW}=== Examples ===\${RESET}"
    echo -e "\${CYAN}Query examples:\${RESET}"
    echo "  ./scripts/query.sh --endpoint getSum"
    echo "  ./scripts/query.sh --endpoint getValue --arg myKey"
    echo ""
    echo -e "\${CYAN}Invoke examples:\${RESET}"
    echo '  invoke_contract "add" $(build_arg Number 42)'
    echo '  invoke_contract "transfer" $(build_arg Address "klv1abc...") $(build_arg Number 1000)'
    echo ""
    echo -e "\${CYAN}Direct koperator usage:\${RESET}"
    echo "  KLEVER_NODE=\$KLEVER_NODE ~/klever-sdk/koperator --key-file=\$KEY_FILE sc invoke \$CONTRACT_ADDRESS myMethod --await --sign"
}

# Main execution
main() {
    load_config
    set_network
    
    # If arguments provided, execute and exit
    if [ $# -gt 0 ]; then
        case "$1" in
            query)
                shift
                get_contract_address && query_contract "$@"
                ;;
            invoke)
                shift
                get_contract_address && invoke_contract "$@"
                ;;
            --help|-h)
                show_examples
                ;;
            *)
                echo -e "\${RED}Unknown command: $1\${RESET}"
                echo "Usage: $0 [query|invoke|--help]"
                exit 1
                ;;
        esac
        exit 0
    fi
    
    # Interactive mode
    while true; do
        show_menu
        read -p "Select option: " choice
        
        case "$choice" in
            1)
                ./scripts/build.sh
                ;;
            2)
                ./scripts/deploy.sh
                ;;
            3)
                get_contract_address && ./scripts/upgrade.sh "$CONTRACT_ADDRESS"
                ;;
            4)
                if get_contract_address; then
                    read -p "Enter endpoint name: " endpoint
                    read -p "Enter arguments (space-separated, optional): " -a args
                    query_contract "\$endpoint" "\${args[@]}"
                fi
                ;;
            5)
                if get_contract_address; then
                    read -p "Enter method name: " method
                    echo "Enter arguments (format: type:value, e.g., String:hello Number:42)"
                    echo "Press Enter with empty line when done"
                    args=()
                    while true; do
                        read -p "Arg: " arg_input
                        [ -z "\$arg_input" ] && break
                        
                        # Parse type:value
                        if [[ "\$arg_input" =~ ^([^:]+):(.+)$ ]]; then
                            arg_type="\${BASH_REMATCH[1]}"
                            arg_value="\${BASH_REMATCH[2]}"
                            args+=("$(build_arg "\$arg_type" "\$arg_value")")
                        else
                            echo -e "\${RED}Invalid format. Use type:value\${RESET}"
                        fi
                    done
                    invoke_contract "\$method" "\${args[@]}"
                fi
                ;;
            6)
                echo -e "\\n\${BOLD}Contract Info:\${RESET}"
                get_contract_address || true
                echo -e "Network: \$NETWORK"
                echo -e "Node: \$KLEVER_NODE"
                echo -e "Key file: \$KEY_FILE"
                if [ -f "$HISTORY_FILE" ]; then
                    echo -e "\\n\${BOLD}Deployment History:\${RESET}"
                    jq -r '.[] | "\\(.timestamp) - \\(.network // "testnet") - \\(.contractAddress)"' "$HISTORY_FILE" 2>/dev/null || echo "No history"
                fi
                ;;
            7)
                echo "Select network:"
                echo "1. Mainnet"
                echo "2. Testnet"
                echo "3. Devnet"
                echo "4. Local"
                read -p "Choice: " net_choice
                case "$net_choice" in
                    1) NETWORK="mainnet" ;;
                    2) NETWORK="testnet" ;;
                    3) NETWORK="devnet" ;;
                    4) NETWORK="local" ;;
                    *) echo -e "\${RED}Invalid choice\${RESET}" ;;
                esac
                set_network
                unset CONTRACT_ADDRESS  # Clear cached address
                ;;
            8)
                show_examples
                ;;
            0)
                echo -e "\${GREEN}Goodbye!\${RESET}"
                exit 0
                ;;
            *)
                echo -e "\${RED}Invalid option\${RESET}"
                ;;
        esac
        
        echo
        read -p "Press Enter to continue..."
    done
}

# Run main
main "$@"
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
echo "  ./scripts/build.sh       - Build the contract"
echo "  ./scripts/deploy.sh      - Deploy to blockchain"
echo "  ./scripts/upgrade.sh     - Upgrade existing contract"
echo "  ./scripts/query.sh       - Query contract views"
echo "  ./scripts/test.sh        - Run tests"
echo "  ./scripts/interact.sh    - Interactive menu"
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
        description: 'The name of the contract',
      },
      template: {
        type: 'string',
        description: 'Template to use (default: empty)',
        default: 'empty',
      },
      noMove: {
        type: 'boolean',
        description: 'Do not move project files to current directory',
        default: false,
      },
    },
    required: ['name'],
  },
};
