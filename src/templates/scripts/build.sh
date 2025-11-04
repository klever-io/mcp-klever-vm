#!/bin/bash

# Build script for $CONTRACT_NAME

# Source common functions for colors
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$SCRIPT_DIR/common.sh"

echo "Building smart contract..."
"$KSC_BIN" all build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful!${RESET}"
    echo "WASM files:"
    find output -name "*.wasm" -exec ls -lh {} \;
else
    echo -e "${RED}❌ Build failed!${RESET}"
    exit 1
fi
