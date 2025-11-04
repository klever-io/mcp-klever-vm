#!/bin/bash

# Generic query script for Klever smart contracts

set -e

# Source common functions
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$SCRIPT_DIR/common.sh"

# Check required dependencies
check_dependencies || exit 1

# Function to display usage
show_usage() {
    echo -e "${BOLD}${CYAN}Klever Smart Contract Query Tool${RESET}"
    echo ""
    echo -e "${YELLOW}Usage:${RESET}"
    echo "  $0 --contract <address> --endpoint <name> [--arg <value>]... [--network <network>] [--format <type>]"
    echo ""
    echo -e "${YELLOW}Options:${RESET}"
    echo "  ${GREEN}--contract, -c${RESET}  Smart contract address (required)"
    echo "  ${GREEN}--endpoint, -e${RESET}  Endpoint/function name to query (required)"
    echo "  ${GREEN}--arg, -a${RESET}       Arguments to pass to the endpoint (can be repeated)"
    echo "  ${GREEN}--network, -n${RESET}   Network to query (mainnet/testnet/devnet/local) [default: testnet]"
    echo "  ${GREEN}--format, -f${RESET}    Output format (json/raw/decoded) [default: decoded]"
    echo "  ${GREEN}--help, -h${RESET}      Show this help message"
    echo ""
    echo -e "${YELLOW}Argument Types:${RESET}"
    echo "  ${CYAN}Address:${RESET}klv1...    Klever bech32 address"
    echo "  ${CYAN}0x${RESET}...             Hex string"
    echo "  ${CYAN}N${RESET}                 Number (auto-detected)"
    echo "  ${CYAN}string${RESET}            Plain string"
    echo ""
    echo -e "${YELLOW}Examples:${RESET}"
    echo "  # Query a simple getter"
    echo "  $0 --contract klv1qqq... --endpoint getValue"
    echo ""
    echo "  # Query with address argument"
    echo "  $0 --contract klv1qqq... --endpoint getBalance --arg klv1xyz..."
    echo ""
    echo "  # Query with multiple arguments"
    echo "  $0 --contract klv1qqq... --endpoint getData --arg 5 --arg bi:1000000"
    echo ""
    echo "  # Query on mainnet with JSON output"
    echo "  $0 --contract klv1qqq... --endpoint getInfo --network mainnet --format json"
    exit 1
}

# Parse arguments
ENDPOINT=""
CONTRACT_ADDRESS=""
NETWORK="testnet"
FORMAT="decoded"
ARGUMENTS=()

while [[ $# -gt 0 ]]; do
    case $1 in
        --endpoint|-e) ENDPOINT="$2"; shift 2 ;;
        --contract|-c) CONTRACT_ADDRESS="$2"; shift 2 ;;
        --arg|-a) ARGUMENTS+=("$2"); shift 2 ;;
        --network|-n) NETWORK="$2"; shift 2 ;;
        --format|-f) FORMAT="$2"; shift 2 ;;
        --help|-h) show_usage ;;
        *) echo "Unknown argument: $1"; show_usage ;;
    esac
done

# Validate required arguments
if [ -z "$ENDPOINT" ] || [ -z "$CONTRACT_ADDRESS" ]; then
    echo -e "${RED}Error: Both --contract and --endpoint are required${RESET}"
    show_usage
fi

# Validate format
if [[ ! "$FORMAT" =~ ^(json|raw|decoded)$ ]]; then
    echo -e "${RED}Error: Invalid format. Must be json, raw, or decoded${RESET}"
    exit 1
fi

# Set API endpoint
API_ENDPOINT=$(get_api_endpoint "$NETWORK")

# Only show status message if not in json format
if [ "$FORMAT" != "json" ]; then
    echo -e "${BOLD}${BLUE}Querying $ENDPOINT...${RESET}"
fi

# Make the query
RESPONSE=$(query_contract "$CONTRACT_ADDRESS" "$ENDPOINT" "$API_ENDPOINT" "${ARGUMENTS[@]}")

# Check if response contains error
ERROR_MSG=$(echo "$RESPONSE" | jq -r '.error // empty' 2>/dev/null)
if [ -n "$ERROR_MSG" ] && [ "$ERROR_MSG" != "null" ] && [ "$ERROR_MSG" != "" ]; then
    echo -e "${BOLD}${RED}Error:${RESET}"
    echo "$RESPONSE" | jq -C '.'
    exit 1
fi

# Check if response code is not successful
CODE=$(echo "$RESPONSE" | jq -r '.code // empty' 2>/dev/null)
if [ "$CODE" != "successful" ] && [ -n "$CODE" ]; then
    echo -e "${BOLD}${RED}Error: Response code is not successful${RESET}"
    echo "$RESPONSE" | jq -C '.'
    exit 1
fi

# Handle output based on format
case "$FORMAT" in
    json)
        echo "$RESPONSE"
        ;;
    raw)
        echo "$RESPONSE" | jq -C '.'
        ;;
    decoded)
        echo -e "${BOLD}${GREEN}Response:${RESET}"
        echo "$RESPONSE" | jq -C '.'
        
        # Try to decode return data if present (only for decoded format)
        RETURN_DATA=$(echo "$RESPONSE" | jq -r '.data.returnData[]? // empty' 2>/dev/null)
        if [ -n "$RETURN_DATA" ] || [ "$RETURN_DATA" = "" ]; then
            echo -e "\n${BOLD}${YELLOW}Decoded Return Data:${RESET}"
            
            # Handle case where returnData exists but might be empty
            if [ -z "$RETURN_DATA" ] || [ "$RETURN_DATA" = "" ]; then
                # Empty returnData often means zero value
                echo "Value: 0 (empty result)"
                echo "Note: Empty return data typically represents zero or an empty value"
            else
                # Generic decoding
                for data in $RETURN_DATA; do
                    if [ -n "$data" ] && [ "$data" != "" ]; then
                        # Decode to hex
                        HEX_VALUE=$(echo "$data" | base64 -d 2>/dev/null | xxd -p | tr -d '\n')
                        if [ -n "$HEX_VALUE" ]; then
                            echo "Base64: $data"
                            echo "Hex: 0x$HEX_VALUE"
                            
                            # Try to decode as string
                            if STRING_VALUE=$(echo "$data" | base64 -d 2>/dev/null); then
                                # Check if it's printable
                                if [[ "$STRING_VALUE" =~ ^[[:print:]]*$ ]] && [ -n "$STRING_VALUE" ]; then
                                    echo "String: $STRING_VALUE"
                                fi
                            fi
                            
                            # Try to decode as number (if 8 bytes or less)
                            if [ ${#HEX_VALUE} -le 16 ]; then
                                CLEAN_HEX=$(echo "$HEX_VALUE" | sed 's/^0*//')
                                if [ -n "$CLEAN_HEX" ]; then
                                    NUMBER=$((16#$CLEAN_HEX))
                                    FORMATTED_NUMBER=$(format_number $NUMBER)
                                    echo "Number: $FORMATTED_NUMBER"
                                    
                                    # If it looks like a KLV amount (6 decimals), show conversion
                                    if [ $NUMBER -gt 1000000 ]; then
                                        KLV_AMOUNT=$(units_to_klv $NUMBER)
                                        echo "Possible KLV: $KLV_AMOUNT KLV ($FORMATTED_NUMBER units)"
                                    fi
                                else
                                    echo "Number: 0"
                                fi
                            fi
                        else
                            # Empty data value (base64 decode resulted in nothing)
                            echo "Value: 0 (empty/zero)"
                        fi
                    else
                        # Empty string in returnData array
                        echo "Value: 0 (empty result)"
                    fi
                    echo "---"
                done
            fi
        fi
        ;;
esac