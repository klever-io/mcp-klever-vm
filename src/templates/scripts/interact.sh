#!/bin/bash

# Interactive script for $CONTRACT_NAME

set -e

# Source common functions
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$SCRIPT_DIR/common.sh"

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
    NETWORK="${NETWORK:-$DEFAULT_NETWORK}"
    KEY_FILE="${KEY_FILE:-$HOME/klever-sdk/walletKey.pem}"
}

# Set network endpoint
set_network() {
    KLEVER_NODE=$(set_network_endpoint "$NETWORK")
    export KLEVER_NODE
    echo -e "${CYAN}Network: ${BOLD}$NETWORK${RESET} (${KLEVER_NODE})"
}

# Get contract address from history
get_contract_address() {
    if [ -z "$CONTRACT_ADDRESS" ]; then
        CONTRACT_ADDRESS=$(get_contract_from_history "$NETWORK" "$HISTORY_FILE")
        
        if [ -z "$CONTRACT_ADDRESS" ]; then
            echo -e "${RED}No contract found for $NETWORK. Deploy first!${RESET}"
            echo -e "${YELLOW}Run: ./scripts/deploy.sh${RESET}"
            return 1
        fi
    fi
    
    echo -e "${CYAN}Contract: ${BOLD}$CONTRACT_ADDRESS${RESET}"
    return 0
}

# Generic function to invoke contract methods
invoke_contract() {
    local method=$1
    shift
    local args=("$@")
    
    echo -e "${YELLOW}Invoking ${BOLD}$method${RESET}..."
    
    # Build koperator command
    local cmd="KLEVER_NODE=$KLEVER_NODE ~/klever-sdk/koperator"
    cmd="$cmd --key-file=\"$KEY_FILE\""
    cmd="$cmd sc invoke \"$CONTRACT_ADDRESS\" $method"
    
    # Add arguments
    for arg in "${args[@]}"; do
        cmd="$cmd $arg"
    done
    
    # Add common flags
    cmd="$cmd --await --sign --result-only"
    
    echo -e "${CYAN}Command: $cmd${RESET}"
    
    # Execute
    eval "$cmd"
}

# Query contract view
query_contract() {
    local endpoint=$1
    shift
    local args=("$@")
    
    echo -e "${YELLOW}Querying ${BOLD}$endpoint${RESET}..."
    
    # Use the query.sh script
    local cmd="./scripts/query.sh --endpoint $endpoint --contract $CONTRACT_ADDRESS"
    
    # Add arguments
    for arg in "${args[@]}"; do
        cmd="$cmd --arg \"$arg\""
    done
    
    eval "$cmd"
}

# Build arguments for koperator
build_arg() {
    local type=$1
    local value=$2
    
    # Parse numbers with underscores
    if [[ "$type" =~ ^(u64|u32|u16|u8|bi|BigInt|BigUint)$ ]]; then
        value=$(parse_number "$value")
    fi
    
    case "$type" in
        String)
            echo "--args String:\"$value\""
            ;;
        u64)
            echo "--args u64:$value"
            ;;
        u32)
            echo "--args u32:$value"
            ;;
        u16)
            echo "--args u16:$value"
            ;;
        u8)
            echo "--args u8:$value"
            ;;
        bi|BigInt|BigUint)
            echo "--args bi:$value"
            ;;
        Address)
            echo "--args Address:\"$value\""
            ;;
        Bool)
            echo "--args Bool:$value"
            ;;
        Hex)
            echo "--args Hex:\"$value\""
            ;;
        *)
            echo "--args \"$value\""
            ;;
    esac
}

# Interactive menu
show_menu() {
    echo -e "\n${BOLD}${BLUE}=== Smart Contract Interactive Menu ===${RESET}"
    echo -e "${GREEN}1.${RESET} 🔨 Build contract"
    echo -e "${GREEN}2.${RESET} 🚀 Deploy contract"
    echo -e "${GREEN}3.${RESET} ⬆️  Upgrade contract"
    echo -e "${GREEN}4.${RESET} 🔍 Query contract (view functions)"
    echo -e "${GREEN}5.${RESET} 📝 Invoke contract method"
    echo -e "${GREEN}6.${RESET} ℹ️  Show contract info"
    echo -e "${GREEN}7.${RESET} 🌐 Change network (current: $NETWORK)"
    echo -e "${GREEN}8.${RESET} 📚 Show examples"
    echo -e "${GREEN}0.${RESET} 🚪 Exit"
    echo
}

# Show usage
show_usage() {
    echo -e "${BOLD}${CYAN}Smart Contract Interaction Tool${RESET}"
    echo ""
    echo -e "${YELLOW}Usage:${RESET}"
    echo "  $0                    Interactive menu mode"
    echo "  $0 query <endpoint> [args...]   Query contract"
    echo "  $0 invoke <method> [args...]     Invoke contract method"
    echo "  $0 --help                        Show this help"
    echo ""
    echo -e "${YELLOW}Environment Variables:${RESET}"
    echo "  NETWORK       Network to use (mainnet/testnet/devnet/local) [default: testnet]"
    echo "  KEY_FILE      Path to wallet key file [default: ~/klever-sdk/walletKey.pem]"
    echo ""
    echo -e "${YELLOW}Examples:${RESET}"
    echo "  # Interactive mode"
    echo "  $0"
    echo ""
    echo "  # Query contract"
    echo "  $0 query getValue"
    echo "  $0 query getBalance klv1abc..."
    echo ""
    echo "  # Invoke method"
    echo "  $0 invoke setValue 42"
    echo ""
    echo "Run '$0' and select option 8 for more examples"
    exit 0
}

# Show examples
show_examples() {
    echo -e "\n${BOLD}${YELLOW}=== Usage Examples ===${RESET}"
    echo ""
    echo -e "${CYAN}Query Examples:${RESET}"
    echo "  # Query simple getter"
    echo "  ./scripts/query.sh --endpoint getValue"
    echo ""
    echo "  # Query with arguments"
    echo "  ./scripts/query.sh --endpoint getBalance --arg klv1abc..."
    echo ""
    echo -e "${CYAN}Invoke Examples:${RESET}"
    echo "  # Simple method call"
    echo '  invoke_contract "setValue" $(build_arg u64 42)'
    echo ""
    echo "  # Method with multiple arguments"
    echo '  invoke_contract "transfer" $(build_arg Address "klv1abc...") $(build_arg bi 1_000_000)'
    echo ""
    echo "  # Method with KLV payment"
    echo '  KLEVER_NODE=$KLEVER_NODE ~/klever-sdk/koperator \\'
    echo '    --key-file=$KEY_FILE \\'
    echo '    sc invoke $CONTRACT_ADDRESS myMethod \\'
    echo '    --values "KLV=1000000" \\'
    echo '    --await --sign'
    echo ""
    echo -e "${CYAN}Argument Types:${RESET}"
    echo "  String:hello           - String value"
    echo "  u8:5                  - 8-bit unsigned integer"
    echo "  u32:1000             - 32-bit unsigned integer"
    echo "  u64:1_000_000        - 64-bit unsigned integer (with separators)"
    echo "  bi:10_000_000_000    - BigInt/BigUint (with separators)"
    echo "  Address:klv1abc...    - Klever address"
    echo "  Bool:true            - Boolean value"
    echo "  Hex:0x1234           - Hexadecimal value"
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
            --help|-h|help)
                show_usage
                ;;
            *)
                echo -e "${RED}Unknown command: $1${RESET}"
                echo "Usage: $0 [query|invoke|--help]"
                echo "Run '$0 --help' for more information"
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
                    query_contract "$endpoint" "${args[@]}"
                fi
                ;;
            5)
                if get_contract_address; then
                    read -p "Enter method name: " method
                    echo "Enter arguments (format: type:value, e.g., String:hello u64:42 bi:1000000000000)"
                    echo "Press Enter with empty line when done"
                    args=()
                    while true; do
                        read -p "Arg: " arg_input
                        [ -z "$arg_input" ] && break
                        
                        # Parse type:value
                        if [[ "$arg_input" =~ ^([^:]+):(.+)$ ]]; then
                            arg_type="${BASH_REMATCH[1]}"
                            arg_value="${BASH_REMATCH[2]}"
                            args+=("$(build_arg "$arg_type" "$arg_value")")
                        else
                            echo -e "${RED}Invalid format. Use type:value${RESET}"
                        fi
                    done
                    invoke_contract "$method" "${args[@]}"
                fi
                ;;
            6)
                echo -e "\n${BOLD}${MAGENTA}=== Contract Information ===${RESET}"
                echo ""
                echo -e "${CYAN}Current Configuration:${RESET}"
                get_contract_address || true
                echo -e "Network: $NETWORK"
                echo -e "Node: $KLEVER_NODE"
                echo -e "Key file: $KEY_FILE"
                
                if [ -f "$HISTORY_FILE" ]; then
                    echo ""
                    echo -e "${CYAN}Deployment History:${RESET}"
                    local history_count=$(jq 'length' "$HISTORY_FILE" 2>/dev/null || echo 0)
                    if [ "$history_count" -gt 0 ]; then
                        jq -r '.[] | "\(.timestamp) | \(.type // "deploy") | \(.network // "testnet") | \(.contractAddress)"' "$HISTORY_FILE" 2>/dev/null | \
                        tail -5 | \
                        while IFS='|' read -r timestamp type network address; do
                            echo -e "  ${YELLOW}$timestamp${RESET} - ${GREEN}$type${RESET} - ${BLUE}$network${RESET}"
                            echo -e "    $address"
                        done
                    else
                        echo "  No deployment history found"
                    fi
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
                    *) echo -e "${RED}Invalid choice${RESET}" ;;
                esac
                set_network
                unset CONTRACT_ADDRESS  # Clear cached address
                ;;
            8)
                show_examples
                ;;
            0)
                echo -e "${GREEN}Goodbye!${RESET}"
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid option${RESET}"
                ;;
        esac
        
        echo
        read -p "Press Enter to continue..."
    done
}

# Run main
main "$@"
