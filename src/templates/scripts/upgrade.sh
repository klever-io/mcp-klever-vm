#!/bin/bash

# Upgrade script for$ CONTRACT_NAME

set -e

# Source common functions
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$SCRIPT_DIR/common.sh"

# Check required dependencies
check_dependencies || exit 1

# Configuration
CONFIG_FILE=".env"
HISTORY_FILE="output/history.json"
DEFAULT_NETWORK="testnet"

# Show usage
show_usage() {
    echo -e "${BOLD}${CYAN}Klever Contract Upgrade Tool${RESET}"
    echo ""
    echo -e "${YELLOW}Usage:${RESET}"
    echo "  $0 [contract-address]"
    echo ""
    echo -e "${YELLOW}Options:${RESET}"
    echo "  contract-address    Optional. Contract to upgrade (default: from history)"
    echo ""
    echo -e "${YELLOW}Environment Variables:${RESET}"
    echo "  NETWORK            Network to use (mainnet/testnet/devnet/local) [default: testnet]"
    echo "  KEY_FILE           Path to wallet key file [default: ~/klever-sdk/walletKey.pem]"
    echo ""
    echo -e "${YELLOW}Examples:${RESET}"
    echo "  # Upgrade last deployed contract"
    echo "  $0"
    echo ""
    echo "  # Upgrade specific contract"
    echo "  $0 klv1qqq..."
    echo ""
    echo "  # Upgrade on mainnet"
    echo "  NETWORK=mainnet $0"
    exit 1
}

# Check for help
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_usage
fi

# Load configuration
if [ -f "$CONFIG_FILE" ]; then
    export $(cat "$CONFIG_FILE" | grep -v '^#' | xargs)
fi

# Set defaults
NETWORK="${NETWORK:-$DEFAULT_NETWORK}"
KEY_FILE="${KEY_FILE:-$KLEVER_WALLET_KEY}"

# Set network endpoint
KLEVER_NODE=$(set_network_endpoint "$NETWORK")

echo -e "${BOLD}${BLUE}=== Contract Upgrade Tool ===${RESET}"
echo -e "${CYAN}Network:${RESET} $NETWORK"
echo -e "${CYAN}Node:${RESET} $KLEVER_NODE"

# Get contract address
if [ $# -eq 1 ] && [ "$1" != "--help" ] && [ "$1" != "-h" ]; then
    CONTRACT_ADDRESS=$1
    echo -e "${CYAN}Contract:${RESET} $CONTRACT_ADDRESS (provided)"
else
    CONTRACT_ADDRESS=$(get_contract_from_history "$NETWORK" "$HISTORY_FILE")

    if [ -z "$CONTRACT_ADDRESS" ]; then
        echo -e "${RED}Error: No contract address found for $NETWORK${RESET}"
        echo "Usage: $0 [contract-address]"
        echo "Or deploy a contract first with: ./scripts/deploy.sh"
        exit 1
    fi
    echo -e "${CYAN}Contract:${RESET} $CONTRACT_ADDRESS (from history)"
fi

echo ""

# Build first
echo -e "${YELLOW}Building smart contract...${RESET}"
"$KSC_BIN" all build || {
    echo -e "${RED}❌ Build failed!${RESET}"
    exit 1
}
echo -e "${GREEN}✅ Build successful!${RESET}"

# Get contract WASM
CONTRACT_WASM=$(find output -name "*.wasm" | head -1)
if [ -z "$CONTRACT_WASM" ]; then
    echo -e "${RED}Error: No WASM file found in output directory${RESET}"
    exit 1
fi

WASM_SIZE=$(ls -lh "$CONTRACT_WASM" | awk '{print $5}')
echo -e "${CYAN}WASM file:${RESET} $CONTRACT_WASM ($WASM_SIZE)"
echo ""

# Confirm upgrade
echo -e "${YELLOW}⚠️  Warning: This will upgrade the contract on $NETWORK${RESET}"
read -p "Are you sure you want to upgrade? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo -e "${YELLOW}Upgrade cancelled${RESET}"
    exit 0
fi

# Upgrade contract
echo -e "${YELLOW}Upgrading contract...${RESET}"
UPGRADE_OUTPUT=$(KLEVER_NODE=$KLEVER_NODE \
    "$KOPERATOR_BIN" \
    --key-file="$KEY_FILE" \
    sc upgrade "$CONTRACT_ADDRESS" \
    --wasm="$CONTRACT_WASM" \
    --payable --payableBySC --readable --upgradeable \
    --await --sign --result-only)

# Check if upgrade was successful
if echo "$UPGRADE_OUTPUT" | grep -q '"status": "success"'; then
    echo -e "${GREEN}✅ Contract upgrade successful!${RESET}"
else
    echo -e "${GREEN}Contract upgrade completed${RESET}"
fi

# Extract transaction hash
TX_HASH=$(echo "$UPGRADE_OUTPUT" | grep -o '"hash": "[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$TX_HASH" ]; then
    # Add upgrade to history
    jq --arg tx "$TX_HASH" --arg addr "$CONTRACT_ADDRESS" --arg net "$NETWORK" \
       '. + [{"hash": $tx, "contractAddress": $addr, "network": $net, "type": "upgrade", "timestamp": now | strftime("%Y-%m-%d %H:%M:%S")}]' \
       "$HISTORY_FILE" > "$HISTORY_FILE.tmp" && mv "$HISTORY_FILE.tmp" "$HISTORY_FILE"

    echo ""
    echo -e "${BOLD}${GREEN}=== Upgrade Summary ===${RESET}"
    echo -e "${CYAN}Transaction:${RESET} $TX_HASH"
    echo -e "${CYAN}Contract:${RESET} $CONTRACT_ADDRESS"
    echo -e "${CYAN}Network:${RESET} $NETWORK"
    echo -e "${CYAN}Status:${RESET} ${GREEN}Upgraded${RESET}"
else
    echo -e "${YELLOW}Warning: Could not extract transaction hash${RESET}"
fi
