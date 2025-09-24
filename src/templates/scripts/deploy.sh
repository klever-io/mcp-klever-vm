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

# Check wallet balance before deploying
echo "Checking wallet balance..."
WALLET_ADDRESS=$(~/klever-sdk/koperator --key-file="$KEY_FILE" account address 2>/dev/null | grep -o 'klv1[a-z0-9]*' || echo "")

if [ -z "$WALLET_ADDRESS" ]; then
    echo -e "${RED}❌ Could not get wallet address. Check your key file: $KEY_FILE${RESET}"
    exit 1
fi

echo -e "${BLUE}Wallet: $WALLET_ADDRESS${RESET}"

# Get balance
BALANCE_OUTPUT=$(KLEVER_NODE=$KLEVER_NODE ~/klever-sdk/koperator --key-file="$KEY_FILE" account balance 2>&1 || echo "")
BALANCE_KLV=$(echo "$BALANCE_OUTPUT" | sed 's/\x1b\[[0-9;]*m//g' | grep -o 'balance.*= [0-9]*\.[0-9]*' | grep -o '[0-9]*\.[0-9]*' | head -1 || echo "0")

echo -e "${BLUE}Balance: $BALANCE_KLV KLV${RESET}"

# Check if balance is too low
BALANCE_INT=$(echo "$BALANCE_KLV" | cut -d. -f1)
if [ -z "$BALANCE_KLV" ] || [ "$BALANCE_KLV" = "0" ] || [ "${BALANCE_INT:-0}" -lt 5 ]; then
    echo -e "${YELLOW}⚠️  Low balance detected: $BALANCE_KLV KLV${RESET}"

    if [ "$NETWORK" = "testnet" ]; then
        echo -e "${YELLOW}💰 You need testnet funds to deploy contracts!${RESET}"
        echo -e "${CYAN}Solution: Use the Klever testnet faucet to get free KLV${RESET}"
        echo ""
        echo -e "${GREEN}Option 1: Manual faucet request${RESET}"
        echo "curl -X POST \"https://api.testnet.klever.org/v1.0/transaction/send-user-funds/$WALLET_ADDRESS\" -H \"Content-Type: application/json\""
        echo ""

        read -p "$(echo -e "${CYAN}Request testnet funds automatically? (y/N): ${RESET}")" -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${BLUE}Requesting testnet funds...${RESET}"
            FAUCET_RESPONSE=$(curl -s -X POST "https://api.testnet.klever.org/v1.0/transaction/send-user-funds/$WALLET_ADDRESS" -H "Content-Type: application/json")

            if echo "$FAUCET_RESPONSE" | grep -q "success\|Success\|requested\|Requested"; then
                echo -e "${GREEN}✅ Funds requested successfully!${RESET}"
                echo -e "${YELLOW}⏳ Wait 1-2 minutes for funds to arrive, then run this script again${RESET}"
            else
                echo -e "${RED}❌ Faucet request failed. Try again later or request manually${RESET}"
                echo "Response: $FAUCET_RESPONSE"
            fi
            exit 0
        else
            echo -e "${YELLOW}Please get testnet funds before deploying${RESET}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Insufficient balance for deployment on $NETWORK${RESET}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Sufficient balance for deployment${RESET}"

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
