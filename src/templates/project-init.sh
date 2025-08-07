#!/bin/bash

# Klever Smart Contract Project Initializer
# This script creates a new project and adds helper scripts

set -e

# Colors for output
RED="\x1b[31m"
GREEN="\x1b[32m"
YELLOW="\x1b[33m"
BLUE="\x1b[34m"
BOLD="\x1b[1m"
RESET="\x1b[0m"

# Default values
TEMPLATE="empty"
CONTRACT_NAME=""
MOVE_TO_CURRENT=true
NO_MOVE_SPECIFIED=false

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
            NO_MOVE_SPECIFIED=true
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${RESET}"
            exit 1
            ;;
    esac
done

# Validate contract name
if [ -z "$CONTRACT_NAME" ]; then
    echo -e "${RED}Error: Contract name is required${RESET}"
    echo "Usage: $0 --name <contract-name> [--template <template>] [--no-move]"
    exit 1
fi

echo -e "${BOLD}${BLUE}🚀 Creating Klever Smart Contract: $CONTRACT_NAME${RESET}"

# Create temporary directory for initial creation
TEMP_DIR="/tmp/klever-contract-$$"
mkdir -p "$TEMP_DIR"

# Create the contract
echo -e "${YELLOW}Creating contract from template: $TEMPLATE${RESET}"

# Check if ksc exists
if [ ! -f ~/klever-sdk/ksc ]; then
    echo -e "${RED}Error: Klever SDK (ksc) not found at ~/klever-sdk/ksc${RESET}"
    echo "Please install the Klever SDK first"
    exit 1
fi

# Run ksc new command
echo -e "${YELLOW}Running: ~/klever-sdk/ksc new --template \"$TEMPLATE\" --name \"$CONTRACT_NAME\" --path \"$TEMP_DIR\"${RESET}"
~/klever-sdk/ksc new --template "$TEMPLATE" --name "$CONTRACT_NAME" --path "$TEMP_DIR" || {
    echo -e "${RED}Error: Failed to create contract${RESET}"
    echo -e "${RED}ksc exit code: $?${RESET}"
    exit 1
}

# Check what was created
echo -e "${YELLOW}Checking created files in $TEMP_DIR...${RESET}"
ls -la "$TEMP_DIR/"

# Also check if ksc created the project in current directory instead
echo -e "${YELLOW}Checking if ksc created files in current directory...${RESET}"
if [ -d "./$CONTRACT_NAME" ]; then
    echo -e "${YELLOW}Found project in current directory: ./$CONTRACT_NAME${RESET}"
    ls -la "./$CONTRACT_NAME"
fi

# Find the actual project directory (ksc might create it differently)
PROJECT_DIR=""
if [ -d "$TEMP_DIR/$CONTRACT_NAME" ]; then
    PROJECT_DIR="$TEMP_DIR/$CONTRACT_NAME"
    echo -e "${GREEN}Found project in: $PROJECT_DIR${RESET}"
elif [ -d "./$CONTRACT_NAME" ]; then
    # ksc might have created it in current directory despite --path
    PROJECT_DIR="./$CONTRACT_NAME"
    echo -e "${YELLOW}Project created in current directory instead of temp${RESET}"
    # Only skip move if user didn't explicitly specify --no-move
    if [ "$NO_MOVE_SPECIFIED" = false ]; then
        MOVE_TO_CURRENT=false
    fi
elif [ -d "$TEMP_DIR" ] && [ "$(ls -A $TEMP_DIR)" ]; then
    # If CONTRACT_NAME dir doesn't exist, check if files were created directly in TEMP_DIR
    PROJECT_DIR="$TEMP_DIR"
    echo -e "${YELLOW}Files created directly in temp directory${RESET}"
else
    echo -e "${RED}Error: Project was not created as expected${RESET}"
    echo -e "${RED}Neither $TEMP_DIR/$CONTRACT_NAME nor ./$CONTRACT_NAME exists${RESET}"
    exit 1
fi

# Move to current directory if requested
if [ "$MOVE_TO_CURRENT" = true ]; then
    echo -e "${YELLOW}Moving project to current directory...${RESET}"
    echo -e "${YELLOW}PROJECT_DIR: $PROJECT_DIR${RESET}"
    echo -e "${YELLOW}Current directory: $(pwd)${RESET}"
    
    # List what we're about to move
    echo -e "${YELLOW}Files to move:${RESET}"
    ls -la "$PROJECT_DIR"
    
    # If project is in a subdirectory
    if [ "$PROJECT_DIR" = "$TEMP_DIR/$CONTRACT_NAME" ]; then
        echo -e "${YELLOW}Moving contents from subdirectory to current directory...${RESET}"
        # Move all files including hidden ones from inside the project directory
        if [ -n "$(ls -A $PROJECT_DIR)" ]; then
            # Move contents, not the directory itself
            echo -e "${YELLOW}Moving all files from $PROJECT_DIR/ to current directory${RESET}"
            
            # First try with rsync (moves contents, not directory)
            if command -v rsync >/dev/null 2>&1; then
                rsync -av "$PROJECT_DIR/" . || {
                    echo -e "${RED}rsync failed, trying cp...${RESET}"
                    # Copy all files including hidden ones
                    find "$PROJECT_DIR" -maxdepth 1 -mindepth 1 -exec cp -r {} . \; 2>&1 || echo -e "${RED}Failed to copy files${RESET}"
                }
            else
                # No rsync, use cp
                echo -e "${YELLOW}Using cp to move files...${RESET}"
                # Copy all files including hidden ones
                find "$PROJECT_DIR" -maxdepth 1 -mindepth 1 -exec cp -r {} . \; 2>&1 || echo -e "${RED}Failed to copy files${RESET}"
            fi
        fi
    else
        echo -e "${YELLOW}Moving from temp directory directly...${RESET}"
        # Files are directly in TEMP_DIR, but we need to check if there's a subdirectory
        if [ -d "$TEMP_DIR/klever-dice" ] || [ -d "$TEMP_DIR/$CONTRACT_NAME" ]; then
            # There's a subdirectory, move its contents
            ACTUAL_DIR=$(find "$TEMP_DIR" -maxdepth 1 -type d ! -path "$TEMP_DIR" | head -1)
            if [ -n "$ACTUAL_DIR" ]; then
                echo -e "${YELLOW}Found project in $ACTUAL_DIR, moving contents...${RESET}"
                if command -v rsync >/dev/null 2>&1; then
                    rsync -av "$ACTUAL_DIR/" . || {
                        echo -e "${RED}rsync failed, trying cp...${RESET}"
                        find "$ACTUAL_DIR" -maxdepth 1 -mindepth 1 -exec cp -r {} . \; 2>&1 || echo -e "${RED}Failed to copy files${RESET}"
                    }
                else
                    find "$ACTUAL_DIR" -maxdepth 1 -mindepth 1 -exec cp -r {} . \; 2>&1 || echo -e "${RED}Failed to copy files${RESET}"
                fi
            fi
        else
            # Files truly are directly in TEMP_DIR
            if [ -n "$(ls -A $PROJECT_DIR)" ]; then
                if command -v rsync >/dev/null 2>&1; then
                    rsync -av "$PROJECT_DIR/" . || {
                        echo -e "${RED}rsync failed, trying cp...${RESET}"
                        cp -r "$PROJECT_DIR"/* . 2>&1 || echo -e "${RED}Failed to copy regular files${RESET}"
                        cp -r "$PROJECT_DIR"/.[^.]* . 2>&1 || echo -e "${RED}Failed to copy hidden files${RESET}"
                    }
                else
                    cp -r "$PROJECT_DIR"/* . 2>&1 || echo -e "${RED}Failed to copy regular files${RESET}"
                    cp -r "$PROJECT_DIR"/.[^.]* . 2>&1 || echo -e "${RED}Failed to copy hidden files${RESET}"
                fi
            fi
        fi
    fi
    
    echo -e "${GREEN}Files after move:${RESET}"
    ls -la .
else
    echo -e "${YELLOW}--no-move specified: Using current directory as project root...${RESET}"
    # When noMove is specified, we want to place files directly in current directory
    
    if [ -d "$PROJECT_DIR" ] && [ -n "$(ls -A $PROJECT_DIR)" ]; then
        echo -e "${YELLOW}Moving project files to current directory...${RESET}"
        
        # Move contents directly to current directory (not in a subdirectory)
        if command -v rsync >/dev/null 2>&1; then
            rsync -av "$PROJECT_DIR/" . || {
                echo -e "${RED}rsync failed, trying cp...${RESET}"
                find "$PROJECT_DIR" -maxdepth 1 -mindepth 1 -exec cp -r {} . \; 2>&1 || echo -e "${RED}Failed to copy files${RESET}"
            }
        else
            find "$PROJECT_DIR" -maxdepth 1 -mindepth 1 -exec cp -r {} . \; 2>&1 || echo -e "${RED}Failed to copy files${RESET}"
        fi
        
        # If PROJECT_DIR was ./$CONTRACT_NAME created by ksc, remove the now-empty directory
        if [ "$PROJECT_DIR" = "./$CONTRACT_NAME" ]; then
            rmdir "./$CONTRACT_NAME" 2>/dev/null || true
        fi
    fi
    
    echo -e "${GREEN}Files in current directory:${RESET}"
    ls -la .
fi

# Clean up temp directory
rm -rf "$TEMP_DIR" 2>/dev/null || true

# Create helper scripts directory
mkdir -p scripts

# Create common.sh (shared utilities)
echo -e "${YELLOW}Creating common.sh...${RESET}"
cat > scripts/common.sh << 'COMMON_EOF'
{{COMMON_SCRIPT}}
COMMON_EOF

# Create deploy.sh
echo -e "${YELLOW}Creating deploy.sh...${RESET}"
cat > scripts/deploy.sh << 'DEPLOY_EOF'
{{DEPLOY_SCRIPT}}
DEPLOY_EOF

# Create upgrade.sh
echo -e "${YELLOW}Creating upgrade.sh...${RESET}"
cat > scripts/upgrade.sh << 'UPGRADE_EOF'
{{UPGRADE_SCRIPT}}
UPGRADE_EOF

# Create query.sh
echo -e "${YELLOW}Creating query.sh...${RESET}"
cat > scripts/query.sh << 'QUERY_EOF'
{{QUERY_SCRIPT}}
QUERY_EOF

# Create build.sh
echo -e "${YELLOW}Creating build.sh...${RESET}"
cat > scripts/build.sh << 'BUILD_EOF'
{{BUILD_SCRIPT}}
BUILD_EOF

# Create test.sh
echo -e "${YELLOW}Creating test.sh...${RESET}"
cat > scripts/test.sh << 'TEST_EOF'
{{TEST_SCRIPT}}
TEST_EOF

# Create interact.sh
echo -e "${YELLOW}Creating interact.sh...${RESET}"
cat > scripts/interact.sh << 'INTERACT_EOF'
{{INTERACT_SCRIPT}}
INTERACT_EOF

# Make all scripts executable
chmod +x scripts/*.sh

# Create or update .gitignore
echo -e "${YELLOW}Creating/updating .gitignore...${RESET}"
cat > .gitignore << 'GITIGNORE_EOF'
{{GITIGNORE_CONTENT}}
GITIGNORE_EOF

# Replace CONTRACT_NAME in all scripts
sed -i.bak "s/\$CONTRACT_NAME/$CONTRACT_NAME/g" scripts/*.sh && rm scripts/*.sh.bak

echo -e "${BOLD}${GREEN}✅ Project initialized successfully!${RESET}"
echo ""
echo -e "${CYAN}Project structure:${RESET}"
echo "  ./src/              - Contract source code"
echo "  ./tests/            - Test files"
echo "  ./scripts/          - Helper scripts"
echo "  ./output/           - Build artifacts"
echo "  ./.gitignore        - Git ignore file (created)"
echo ""
echo -e "${CYAN}Next steps:${RESET}"
echo "  1. Edit src/lib.rs to implement your contract"
echo "  2. Run ./scripts/build.sh to build"
echo "  3. Run ./scripts/deploy.sh to deploy"
echo ""
echo -e "${CYAN}Helper scripts:${RESET}"
echo "  ./scripts/build.sh       - Build the contract"
echo "  ./scripts/deploy.sh      - Deploy to blockchain"
echo "  ./scripts/upgrade.sh     - Upgrade existing contract"
echo "  ./scripts/query.sh       - Query contract views"
echo "  ./scripts/test.sh        - Run tests"
echo "  ./scripts/interact.sh    - Interactive menu"