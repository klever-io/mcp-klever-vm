import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the directory name for ES modules
let __dirname: string;
try {
  const __filename = fileURLToPath(import.meta.url);
  __dirname = dirname(__filename);
} catch {
  // Fallback for when import.meta.url is not available
  __dirname = process.cwd();
}

// Helper function to read template file
const readTemplate = (relativePath: string): string => {
  // Try multiple paths to find the template
  const possiblePaths = [
    // Production: dist/templates
    join(__dirname, '..', 'templates', relativePath),
    // Development: src/templates  
    join(process.cwd(), 'src', 'templates', relativePath),
    // Alternative production path
    join(process.cwd(), 'dist', 'templates', relativePath),
  ];
  
  for (const fullPath of possiblePaths) {
    if (existsSync(fullPath)) {
      return readFileSync(fullPath, 'utf8');
    }
  }
  
  throw new Error(`Template file not found in any of: ${possiblePaths.join(', ')}`);
};

// Cache templates
let cachedProjectInitScript: string | null = null;

export const createProjectInitScript = (): string => {
  if (cachedProjectInitScript) {
    return cachedProjectInitScript;
  }

  try {
    // Read main project init script
    let projectInitScript = readTemplate('project-init.sh');
    
    // Read individual script templates
    const commonScript = readTemplate('scripts/common.sh');
    const deployScript = readTemplate('scripts/deploy.sh');
    const upgradeScript = readTemplate('scripts/upgrade.sh');
    const queryScript = readTemplate('scripts/query.sh');
    const buildScript = readTemplate('scripts/build.sh');
    const testScript = readTemplate('scripts/test.sh');
    const interactScript = readTemplate('scripts/interact.sh');
    const gitignoreContent = readTemplate('.gitignore');
    
    // Replace placeholders in the main script
    projectInitScript = projectInitScript
      .replace('{{COMMON_SCRIPT}}', commonScript)
      .replace('{{DEPLOY_SCRIPT}}', deployScript)
      .replace('{{UPGRADE_SCRIPT}}', upgradeScript)
      .replace('{{QUERY_SCRIPT}}', queryScript)
      .replace('{{BUILD_SCRIPT}}', buildScript)
      .replace('{{TEST_SCRIPT}}', testScript)
      .replace('{{INTERACT_SCRIPT}}', interactScript)
      .replace('{{GITIGNORE_CONTENT}}', gitignoreContent);
    
    // Cache the result
    cachedProjectInitScript = projectInitScript;
    
    return projectInitScript;
  } catch (error) {
    console.error('Error reading template files:', error);
    // Fallback to inline script if templates can't be read
    return getFallbackScript();
  }
};

// Fallback script (minimal version for when templates can't be loaded)
const getFallbackScript = (): string => {
  return `#!/bin/bash
# Klever Smart Contract Project Initializer
# Error: Could not load template files. Using minimal fallback script.

set -e

CONTRACT_NAME="$1"
if [ -z "$CONTRACT_NAME" ]; then
    echo "Error: Contract name is required"
    echo "Usage: $0 <contract-name>"
    exit 1
fi

echo "Creating Klever Smart Contract: $CONTRACT_NAME"

# Create basic project structure
~/klever-sdk/ksc new --template empty --name "$CONTRACT_NAME" || {
    echo "Error: Failed to create contract"
    exit 1
}

echo "Project created successfully!"
echo "Note: Helper scripts could not be generated due to missing templates."
`;
};

// Create helper scripts generation script
export const createHelperScriptsScript = (): string => {
  try {
    // Read individual script templates
    const deployScript = readTemplate('scripts/deploy.sh');
    const upgradeScript = readTemplate('scripts/upgrade.sh');
    const queryScript = readTemplate('scripts/query.sh');
    const buildScript = readTemplate('scripts/build.sh');
    const testScript = readTemplate('scripts/test.sh');
    const interactScript = readTemplate('scripts/interact.sh');
    const commonScript = readTemplate('scripts/common.sh');
    const gitignoreContent = readTemplate('.gitignore');
    
    // Create a script that generates just the helper scripts
    return `#!/bin/bash
# Klever Helper Scripts Generator
# This script adds helper scripts to an existing Klever smart contract project

set -e

# Colors for output
RED="\\x1b[31m"
GREEN="\\x1b[32m"
YELLOW="\\x1b[33m"
BLUE="\\x1b[34m"
BOLD="\\x1b[1m"
RESET="\\x1b[0m"

echo -e "\${BOLD}\${BLUE}🛠️  Adding Klever Helper Scripts to Current Project\${RESET}"

# Check if we're in a Klever project (look for Cargo.toml or src/lib.rs)
if [ ! -f "Cargo.toml" ] && [ ! -f "src/lib.rs" ]; then
    echo -e "\${YELLOW}Warning: This doesn't appear to be a Rust/Klever project directory.\${RESET}"
    echo -e "\${YELLOW}Expected to find Cargo.toml or src/lib.rs\${RESET}"
    read -p "Continue anyway? (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        echo -e "\${RED}Cancelled\${RESET}"
        exit 1
    fi
fi

# Create scripts directory
echo -e "\${YELLOW}Creating scripts directory...\${RESET}"
mkdir -p scripts

# Create common.sh
echo -e "\${YELLOW}Creating common.sh...\${RESET}"
cat > scripts/common.sh << 'COMMON_EOF'
${commonScript}
COMMON_EOF

# Create deploy.sh
echo -e "\${YELLOW}Creating deploy.sh...\${RESET}"
cat > scripts/deploy.sh << 'DEPLOY_EOF'
${deployScript}
DEPLOY_EOF

# Create upgrade.sh
echo -e "\${YELLOW}Creating upgrade.sh...\${RESET}"
cat > scripts/upgrade.sh << 'UPGRADE_EOF'
${upgradeScript}
UPGRADE_EOF

# Create query.sh
echo -e "\${YELLOW}Creating query.sh...\${RESET}"
cat > scripts/query.sh << 'QUERY_EOF'
${queryScript}
QUERY_EOF

# Create build.sh
echo -e "\${YELLOW}Creating build.sh...\${RESET}"
cat > scripts/build.sh << 'BUILD_EOF'
${buildScript}
BUILD_EOF

# Create test.sh
echo -e "\${YELLOW}Creating test.sh...\${RESET}"
cat > scripts/test.sh << 'TEST_EOF'
${testScript}
TEST_EOF

# Create interact.sh
echo -e "\${YELLOW}Creating interact.sh...\${RESET}"
cat > scripts/interact.sh << 'INTERACT_EOF'
${interactScript}
INTERACT_EOF

# Make all scripts executable
chmod +x scripts/*.sh

# Update .gitignore if it exists, or create it
if [ -f .gitignore ]; then
    echo -e "\${YELLOW}Updating existing .gitignore...\${RESET}"
    # Add our entries if they don't exist
    grep -q "output/" .gitignore || echo -e "\\n# Klever build output\\noutput/" >> .gitignore
    grep -q "*.wasm" .gitignore || echo "*.wasm" >> .gitignore
    grep -q ".env" .gitignore || echo -e "\\n# Environment\\n.env" >> .gitignore
    grep -q "walletKey.pem" .gitignore || echo -e "\\n# Keys (NEVER commit)\\n*.pem" >> .gitignore
else
    echo -e "\${YELLOW}Creating .gitignore...\${RESET}"
    cat > .gitignore << 'GITIGNORE_EOF'
${gitignoreContent}
GITIGNORE_EOF
fi

# Get contract name from Cargo.toml if it exists
CONTRACT_NAME="my-contract"
if [ -f "Cargo.toml" ]; then
    EXTRACTED_NAME=$(grep -m1 '^name = ' Cargo.toml | sed 's/name = "\\(.*\\)"/\\1/')
    if [ -n "$EXTRACTED_NAME" ]; then
        CONTRACT_NAME="$EXTRACTED_NAME"
        echo -e "\${GREEN}Detected contract name: $CONTRACT_NAME\${RESET}"
    fi
fi

# Replace $CONTRACT_NAME placeholder in all scripts
sed -i.bak "s/\\$CONTRACT_NAME/$CONTRACT_NAME/g" scripts/*.sh && rm scripts/*.sh.bak

echo -e "\${BOLD}\${GREEN}✅ Helper scripts added successfully!\${RESET}"
echo ""
echo -e "\${CYAN}Scripts created:\${RESET}"
echo "  ./scripts/common.sh     - Shared utilities"
echo "  ./scripts/build.sh      - Build the contract"
echo "  ./scripts/deploy.sh     - Deploy to blockchain"
echo "  ./scripts/upgrade.sh    - Upgrade existing contract"
echo "  ./scripts/query.sh      - Query contract views"
echo "  ./scripts/test.sh       - Run tests"
echo "  ./scripts/interact.sh   - Interactive menu"
echo ""
echo -e "\${CYAN}Next steps:\${RESET}"
echo "  1. Run ./scripts/build.sh to build your contract"
echo "  2. Run ./scripts/deploy.sh to deploy"
echo "  3. Use ./scripts/interact.sh for interactive management"
echo ""
echo -e "\${CYAN}Configuration:\${RESET}"
echo "  Create a .env file to set defaults:"
echo "    NETWORK=testnet"
echo "    KEY_FILE=\$HOME/klever-sdk/walletKey.pem"
`;
  } catch (error) {
    console.error('Error creating helper scripts script:', error);
    return getFallbackHelperScript();
  }
};

// Fallback helper script generator
const getFallbackHelperScript = (): string => {
  return `#!/bin/bash
echo "Error: Could not load script templates"
echo "Helper scripts generation is not available"
exit 1
`;
};

// Export the main function
export const projectInitScript = createProjectInitScript();
export const helperScriptsScript = createHelperScriptsScript();

// Tool definition for MCP - Full project initialization
export const projectInitToolDefinition = {
  name: 'init_klever_project',
  description: 'Initialize a new Klever smart contract project with helper scripts (build, deploy, upgrade, query with returnData parsing, test, and interactive management)',
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

// Tool definition for MCP - Add helper scripts only
export const addHelperScriptsToolDefinition = {
  name: 'add_helper_scripts',
  description: 'Add helper scripts to an existing Klever smart contract project (build, deploy, upgrade, query, test, interact)',
  inputSchema: {
    type: 'object',
    properties: {
      contractName: {
        type: 'string',
        description: 'Optional contract name (will try to detect from Cargo.toml if not provided)',
      },
    },
  },
};