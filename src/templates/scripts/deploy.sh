#!/bin/bash

# Deploy script for $CONTRACT_NAME

set -e

# Source common functions
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$SCRIPT_DIR/common.sh"

# Configuration
CONFIG_FILE=".env"
DEFAULT_NETWORK="testnet"

# Load configuration
if [ -f "$CONFIG_FILE" ]; then
    export $(cat "$CONFIG_FILE" | grep -v '^#' | xargs)
fi

# Set defaults
NETWORK="${NETWORK:-$DEFAULT_NETWORK}"
KEY_FILE="${KEY_FILE:-$HOME/klever-sdk/walletKey.pem}"

# Set network endpoint
KLEVER_NODE=$(set_network_endpoint "$NETWORK")

echo -e "${CYAN}Deploying to: ${NETWORK}${RESET}"

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
DEPLOY_OUTPUT=$(KLEVER_NODE=$KLEVER_NODE \
    ~/klever-sdk/koperator \
    --key-file="$KEY_FILE" \
    sc create \
    --upgradeable --readable --payable --payableBySC \
    --wasm="$CONTRACT_WASM" \
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
    jq --arg tx "$TX_HASH" --arg addr "$CONTRACT_ADDRESS" --arg net "$NETWORK" \
       '. + [{"hash": $tx, "contractAddress": $addr, "network": $net, "timestamp": now | strftime("%Y-%m-%d %H:%M:%S")}]' \
       "$HISTORY_FILE" > "$HISTORY_FILE.tmp" && mv "$HISTORY_FILE.tmp" "$HISTORY_FILE"
    
    echo -e "${GREEN}Transaction: $TX_HASH${RESET}"
    echo -e "${GREEN}Contract: $CONTRACT_ADDRESS${RESET}"
    echo -e "${GREEN}Network: $NETWORK${RESET}"
else
    echo -e "${RED}Warning: Could not extract deployment information${RESET}"
fi
