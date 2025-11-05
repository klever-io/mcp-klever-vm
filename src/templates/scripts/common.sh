#!/bin/bash

# Klever SDK base path
export KLEVER_SDK_PATH="${KLEVER_SDK_PATH:-$HOME/klever-sdk}"

# Klever SDK binaries
export KSC_BIN="${KSC_BIN:-$KLEVER_SDK_PATH/ksc}"
export KOPERATOR_BIN="${KOPERATOR_BIN:-$KLEVER_SDK_PATH/koperator}"

# Wallet key file
export KLEVER_WALLET_KEY="${KLEVER_WALLET_KEY:-${KEY_FILE:-$KLEVER_SDK_PATH/walletKey.pem}}"

# Network configurations
export KLEVER_NODE="${KLEVER_NODE:-https://node.testnet.klever.org}"
export KLEVER_NETWORK="${KLEVER_NETWORK:-testnet}"

# Common functions and utilities for Klever scripts

# Check required dependencies
check_dependencies() {
    local missing_deps=()

    # Check for jq
    if ! command -v jq >/dev/null 2>&1; then
        missing_deps+=("jq")
    fi

    if [ ${#missing_deps[@]} -ne 0 ]; then
        echo "Error: Missing required dependencies: ${missing_deps[*]}" >&2
        echo "Please install the missing dependencies and try again." >&2
        return 1
    fi

    return 0
}

# Colors
export RESET="\x1b[0m"
export BOLD="\x1b[1m"
export RED="\x1b[31m"
export GREEN="\x1b[32m"
export YELLOW="\x1b[33m"
export BLUE="\x1b[34m"
export MAGENTA="\x1b[35m"
export CYAN="\x1b[36m"

# Bech32 decoder for Klever addresses using inline Python
decode_bech32_address() {
    local address="$1"

    python3 -c "
def bech32_decode(bech):
    charset = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'
    bech = bech.lower()
    pos = bech.rfind('1')
    if pos < 1:
        return (None, None)
    hrp = bech[:pos]
    data = [charset.find(x) for x in bech[pos+1:]]
    if -1 in data:
        return (None, None)
    return (hrp, data[:-6])

def convertbits(data, frombits, tobits, pad=True):
    acc = 0
    bits = 0
    ret = []
    maxv = (1 << tobits) - 1
    for value in data:
        acc = (acc << frombits) | value
        bits += frombits
        while bits >= tobits:
            bits -= tobits
            ret.append((acc >> bits) & maxv)
    if pad and bits:
        ret.append((acc << (tobits - bits)) & maxv)
    elif bits >= frombits or ((acc << (tobits - bits)) & maxv):
        return None
    return ret

try:
    hrp, data = bech32_decode('$address')
    if hrp == 'klv' and data:
        decoded = convertbits(data, 5, 8, False)
        if decoded:
            print(''.join(format(x, '02x') for x in decoded))
except:
    pass
" 2>/dev/null
}

# Convert KLV to smallest units (6 decimals)
klv_to_units() {
    local klv=$1
    # Remove underscores if present
    klv=$(echo "$klv" | tr -d '_')
    echo $(echo "$klv * 1000000" | bc | cut -d. -f1)
}

# Convert units to KLV
units_to_klv() {
    local units=$1
    echo "scale=6; $units / 1000000" | bc
}

# Format number with underscore separators
format_number() {
    local num=$1
    # Use awk for portable number formatting
    echo "$num" | awk '{
        len = length($0)
        result = ""
        for (i = len; i > 0; i--) {
            result = substr($0, i, 1) result
            if ((len - i + 1) % 3 == 0 && i != 1) {
                result = "_" result
            }
        }
        print result
    }'
}

# Parse number removing underscores
parse_number() {
    local num=$1
    # Remove underscores from the number
    echo "$num" | tr -d '_'
}

# Get contract address from history
get_contract_from_history() {
    local network="${1:-testnet}"
    local history_file="${2:-output/history.json}"

    if [ ! -f "$history_file" ]; then
        return 1
    fi

    # Try to get address for specific network
    local contract_address=$(jq -r ".[] | select(.network == \"$network\") | .contractAddress" "$history_file" 2>/dev/null | tail -1)

    # Fallback to last deployed contract if no network match
    if [ -z "$contract_address" ] || [ "$contract_address" = "null" ]; then
        contract_address=$(jq -r '.[-1].contractAddress' "$history_file" 2>/dev/null)
    fi

    if [ -n "$contract_address" ] && [ "$contract_address" != "null" ]; then
        echo "$contract_address"
        return 0
    fi

    return 1
}

# Set network endpoint
set_network_endpoint() {
    local network="${1:-testnet}"

    case "$network" in
        mainnet)
            echo "https://node.mainnet.klever.org"
            ;;
        testnet)
            echo "https://node.testnet.klever.org"
            ;;
        devnet)
            echo "https://node.devnet.klever.org"
            ;;
        local)
            echo "http://localhost:8080"
            ;;
        *)
            echo "http://localhost:8080"
            ;;
    esac
}

# Get API endpoint for network
get_api_endpoint() {
    local network="${1:-testnet}"

    case "$network" in
        mainnet)
            echo "https://api.mainnet.klever.org/v1.0/sc/query"
            ;;
        testnet)
            echo "https://api.testnet.klever.org/v1.0/sc/query"
            ;;
        devnet)
            echo "https://api.devnet.klever.org/v1.0/sc/query"
            ;;
        local)
            echo "http://localhost:9090/v1.0/sc/query"
            ;;
        *)
            echo "http://localhost:9090/v1.0/sc/query"
            ;;
    esac
}

# Encode argument for API calls
encode_arg() {
    local arg="$1"

    # Handle different types of arguments
    if [[ "$arg" =~ ^Address:(.+)$ ]]; then
        # Address type prefix
        local addr="${BASH_REMATCH[1]}"
        echo -n "$addr" | base64
    elif [[ "$arg" =~ ^klv1[a-z0-9]{58,62}$ ]]; then
        # Klever address - decode using bech32
        local hex_val=$(decode_bech32_address "$arg")

        if [ -n "$hex_val" ]; then
            echo -n "$hex_val" | xxd -r -p | base64
        else
            return 1
        fi
    elif [[ "$arg" =~ ^0x[a-fA-F0-9]+$ ]]; then
        # Hex string - decode hex then base64
        echo -n "${arg:2}" | xxd -r -p | base64
    elif [[ "$arg" =~ ^[0-9]+$ ]]; then
        # Number - convert to hex (big endian) then base64
        printf "%016x" "$arg" | xxd -r -p | base64
    else
        # String - just base64 encode
        echo -n "$arg" | base64
    fi
}

# Make API query to smart contract
query_contract() {
    local contract="$1"
    local endpoint="$2"
    local api_url="$3"
    shift 3
    local args=("$@")

    # Build arguments array
    local json_args="["
    local first=true
    for arg in "${args[@]}"; do
        local encoded=$(encode_arg "$arg")
        if [ -z "$encoded" ]; then
            echo "Error: Failed to encode argument: $arg" >&2
            return 1
        fi

        if [ "$first" = true ]; then
            first=false
        else
            json_args="$json_args,"
        fi
        json_args="$json_args\"$encoded\""
    done
    json_args="$json_args]"

    # Build request body
    local request_body="{
        \"ScAddress\": \"$contract\",
        \"FuncName\": \"$endpoint\",
        \"Arguments\": $json_args
    }"

    # Make the request
    curl -s -X POST "$api_url" \
        -H "Content-Type: application/json" \
        -d "$request_body"
}
