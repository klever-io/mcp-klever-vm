import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * Deployment scripts and checklists
 */

export const deploymentKnowledge: KnowledgeEntry[] = [
  // Build and Deploy Scripts
  createKnowledgeEntry(
    'deployment_tool',
    `# Build and Deploy Scripts for Klever Contracts

## Build Script (build.sh)
\`\`\`bash
#!/bin/bash

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
RESET='\\033[0m'

echo -e "\${BLUE}Building Klever Smart Contract...\${RESET}"

# Clean previous build
echo -e "\${YELLOW}Cleaning previous build...\${RESET}"
rm -rf output/

# Build the contract
echo -e "\${YELLOW}Building contract...\${RESET}"
~/klever-sdk/ksc all build

# Check if build succeeded
if [ \$? -eq 0 ]; then
    echo -e "\${GREEN}✅ Build successful!\${RESET}"
    
    # Show output files
    echo -e "\${BLUE}Generated files:\${RESET}"
    ls -la output/
    
    # Show WASM size
    if [ -f "output/*.wasm" ]; then
        WASM_SIZE=\$(ls -lh output/*.wasm | awk '{print \$5}')
        echo -e "\${BLUE}WASM size: \${WASM_SIZE}\${RESET}"
    fi
else
    echo -e "\${RED}❌ Build failed!\${RESET}"
    exit 1
fi
\`\`\`

## Deploy Script (deploy.sh)
\`\`\`bash
#!/bin/bash

# Load common utilities
source scripts/common.sh

# Configuration
NETWORK="testnet"  # or "mainnet", "devnet", "local"
CONTRACT_WASM="output/contract.wasm"

# Deploy function
deploy_contract() {
    echo -e "\${BLUE}Deploying contract to \${NETWORK}...\${RESET}"
    
    # Check if WASM exists
    if [ ! -f "\$CONTRACT_WASM" ]; then
        echo -e "\${RED}❌ WASM file not found: \$CONTRACT_WASM\${RESET}"
        echo -e "\${YELLOW}Run ./scripts/build.sh first\${RESET}"
        exit 1
    fi
    
    # Set node URL based on network
    case \$NETWORK in
        "testnet")
            KLEVER_NODE="https://node.testnet.klever.org"
            ;;
        "mainnet")
            KLEVER_NODE="https://node.klever.org"
            ;;
        "devnet")
            KLEVER_NODE="https://node.devnet.klever.org"
            ;;
        "local")
            KLEVER_NODE="http://localhost:8080"
            ;;
        *)
            echo -e "\${RED}❌ Invalid network: \$NETWORK\${RESET}"
            exit 1
            ;;
    esac
    
    # Deploy contract
    KLEVER_NODE=\$KLEVER_NODE \\\\
        ~/klever-sdk/koperator \\\\
        --key-file="\$HOME/klever-sdk/walletKey.pem" \\\\
        sc create \\\\
        --wasm="\$CONTRACT_WASM" \\\\
        --upgradeable --readable --payable --payableBySC \\\\
        --await --sign --result-only
}

# Main execution
echo -e "\${BLUE}Klever Contract Deployment\${RESET}"
echo -e "\${YELLOW}Network: \$NETWORK\${RESET}"
echo -e "\${YELLOW}WASM: \$CONTRACT_WASM\${RESET}"

# Confirm deployment
read -p "Deploy contract? (y/N): " -n 1 -r
echo
if [[ \$REPLY =~ ^[Yy]\$ ]]; then
    deploy_contract
else
    echo -e "\${YELLOW}Deployment cancelled\${RESET}"
fi
\`\`\`

## Upgrade Script (upgrade.sh)
\`\`\`bash
#!/bin/bash

source scripts/common.sh

# Configuration
NETWORK="testnet"
CONTRACT_ADDRESS=""
CONTRACT_WASM="output/contract.wasm"

# Function to upgrade contract
upgrade_contract() {
    if [ -z "\$CONTRACT_ADDRESS" ]; then
        echo -e "\${RED}❌ CONTRACT_ADDRESS not set\${RESET}"
        echo -e "\${YELLOW}Edit this script and set CONTRACT_ADDRESS\${RESET}"
        exit 1
    fi
    
    echo -e "\${BLUE}Upgrading contract \$CONTRACT_ADDRESS...\${RESET}"
    
    # Set node URL
    case \$NETWORK in
        "testnet") KLEVER_NODE="https://node.testnet.klever.org" ;;
        "mainnet") KLEVER_NODE="https://node.klever.org" ;;
        *) echo -e "\${RED}❌ Invalid network\${RESET}"; exit 1 ;;
    esac
    
    # Upgrade contract
    KLEVER_NODE=\$KLEVER_NODE \\\\
        ~/klever-sdk/koperator \\\\
        --key-file="\$HOME/klever-sdk/walletKey.pem" \\\\
        sc upgrade "\$CONTRACT_ADDRESS" \\\\
        --wasm="\$CONTRACT_WASM" \\\\
        --await --sign --result-only
}

# Main execution
echo -e "\${BLUE}Contract Upgrade\${RESET}"
echo -e "\${YELLOW}Network: \$NETWORK\${RESET}"
echo -e "\${YELLOW}Contract: \$CONTRACT_ADDRESS\${RESET}"

upgrade_contract
\`\`\`

## Pre-Deploy Checklist
\`\`\`bash
#!/bin/bash

echo "🔍 Pre-Deployment Checklist"
echo "=========================="

# Check 1: WASM file exists
if [ -f "output/contract.wasm" ]; then
    echo "✅ WASM file exists"
else
    echo "❌ WASM file missing - run build first"
    exit 1
fi

# Check 2: Wallet key exists
if [ -f "\$HOME/klever-sdk/walletKey.pem" ]; then
    echo "✅ Wallet key found"
else
    echo "❌ Wallet key missing"
    exit 1
fi

# Check 3: Network connectivity
if curl -s "https://node.testnet.klever.org/node/status" > /dev/null; then
    echo "✅ Network connectivity OK"
else
    echo "❌ Cannot reach testnet"
fi

# Check 4: Contract compiles without warnings
echo "🔨 Checking for compilation warnings..."
~/klever-sdk/ksc all build 2>&1 | grep -i warning && echo "⚠️  Warnings found" || echo "✅ No warnings"

echo
echo "✅ All checks passed - ready to deploy!"
\`\`\``,
    {
      title: 'Build and Deploy Scripts for Klever Contracts',
      description: 'Complete build, deploy, and upgrade scripts for Klever smart contracts',
      tags: ['deployment', 'build', 'scripts', 'ksc', 'koperator', 'upgrade'],
      language: 'bash',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Setting Up New Klever Contract Project
  createKnowledgeEntry(
    'best_practice',
    `# Setting Up New Klever Contract Project

## Initial Setup Steps

### 1. Create New Project
\`\`\`bash
# Create new contract project
~/klever-sdk/ksc new --template empty --name my_contract

# Navigate to project directory
cd my_contract
\`\`\`

### 2. Project Structure
\`\`\`
my_contract/
├── Cargo.toml          # Rust project configuration
├── klever.json         # Klever-specific configuration
├── src/
│   └── lib.rs         # Main contract code
├── tests/             # Test files
├── output/            # Generated after build (WASM files)
└── scripts/           # Helper scripts (optional)
\`\`\`

### 3. Basic Contract Template
\`\`\`rust
// src/lib.rs
#[allow(unused_imports)]
use klever_sc::imports::*;

#[klever_sc::contract]
pub trait MyContract {
    #[init]
    fn init(&self) {}

    #[upgrade]
    fn upgrade(&self) {}

    #[endpoint]
    fn hello_world(&self) -> ManagedBuffer {
        ManagedBuffer::from("Hello, Klever!")
    }
}
\`\`\`

### 4. Build Configuration
\`\`\`json
// klever.json
{
    "language": "rust",
    "version": "0.1.0"
}
\`\`\`

### 5. Cargo Configuration
\`\`\`toml
# Cargo.toml
[package]
name = "my-contract"
version = "0.1.0"
edition = "2021"

[lib]
name = "my_contract"
crate-type = ["cdylib"]

[dependencies]
klever-sc = { version = "0.45.0" }

[dev-dependencies]
klever-sc-scenario = { version = "0.45.0" }
\`\`\`

### 6. Build and Test
\`\`\`bash
# Build the contract
~/klever-sdk/ksc all build

# Run tests (if any)
cargo test
\`\`\`

## Development Workflow

### 1. Development Cycle
1. Write contract code in \`src/lib.rs\`
2. Build: \`~/klever-sdk/ksc all build\`
3. Test: \`cargo test\`
4. Deploy: Use deployment scripts

### 2. Adding Dependencies
\`\`\`toml
# Add to Cargo.toml [dependencies]
serde = { version = "1.0", features = ["derive"] }
\`\`\`

### 3. Testing Setup
\`\`\`rust
// tests/integration_test.rs
use klever_sc_scenario::*;

fn world() -> ScenarioWorld {
    ScenarioWorld::vm_go()
}

#[test]
fn test_hello_world() {
    let mut world = world();
    
    world
        .set_state_step(
            SetStateStep::new()
                .put_account("address:owner", Account::new().nonce(1))
                .put_account("address:my_contract", Account::new().code("file:output/my_contract.wasm"))
        )
        .sc_call_step(
            ScCallStep::new()
                .from("address:owner")
                .to("address:my_contract")
                .call(my_contract::contract_obj().hello_world())
                .expect(TxExpect::ok().result("str:Hello, Klever!"))
        );
}
\`\`\`

## Common Project Patterns

### Storage Contract
\`\`\`rust
#[klever_sc::contract]
pub trait StorageContract {
    #[storage_mapper("values")]
    fn values(&self) -> SingleValueMapper<BigUint>;
    
    #[endpoint]
    fn store_value(&self, value: BigUint) {
        self.values().set(&value);
    }
    
    #[view]
    fn get_value(&self) -> BigUint {
        self.values().get()
    }
}
\`\`\`

### Payable Contract
\`\`\`rust
#[klever_sc::contract]
pub trait PayableContract {
    #[storage_mapper("balances")]
    fn balances(&self, address: &ManagedAddress) -> SingleValueMapper<BigUint>;
    
    #[payable("KLV")]
    #[endpoint]
    fn deposit(&self) {
        let caller = self.blockchain().get_caller();
        let payment = self.call_value().klv_value();
        
        self.balances(&caller).update(|balance| *balance += payment);
    }
    
    #[view]
    fn get_balance(&self, address: ManagedAddress) -> BigUint {
        self.balances(&address).get()
    }
}
\`\`\`

## Project Management Tips

1. **Version Control**: Always use git for contract projects
2. **Documentation**: Document all endpoints and storage
3. **Testing**: Write comprehensive tests before deployment
4. **Security**: Review code for potential vulnerabilities
5. **Gas Optimization**: Profile and optimize gas usage`,
    {
      title: 'Setting Up New Klever Contract Project',
      description: 'Complete guide for setting up and structuring a new Klever smart contract project',
      tags: ['setup', 'project', 'structure', 'ksc', 'template', 'development'],
      language: 'rust',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Klever Contract Build Configuration
  createKnowledgeEntry(
    'documentation',
    `# Klever Contract Build Configuration

## klever.json Configuration

The \`klever.json\` file configures how your Klever smart contract is built.

### Basic Configuration
\`\`\`json
{
    "language": "rust",
    "version": "0.1.0"
}
\`\`\`

### Advanced Configuration
\`\`\`json
{
    "language": "rust",
    "version": "0.1.0",
    "contract": {
        "name": "my_contract",
        "payable": true,
        "upgradeable": true
    },
    "build": {
        "optimize": true,
        "debug": false
    }
}
\`\`\`

## Cargo.toml Configuration

### Basic Setup
\`\`\`toml
[package]
name = "my-contract"
version = "0.1.0"
edition = "2021"
publish = false

[lib]
name = "my_contract"
crate-type = ["cdylib"]
path = "src/lib.rs"

[dependencies]
klever-sc = { version = "0.45.0" }

[dev-dependencies]
klever-sc-scenario = { version = "0.45.0" }
\`\`\`

### With Additional Dependencies
\`\`\`toml
[dependencies]
klever-sc = { version = "0.45.0" }

# Optional: For advanced math operations
num-bigint = "0.4"
num-traits = "0.2"

# Optional: For serialization
serde = { version = "1.0", features = ["derive"] }

[dev-dependencies]
klever-sc-scenario = { version = "0.45.0" }

# Optional: For testing utilities
hex = "0.4"
\`\`\`

## Build Profile Configuration

### Optimize for Size
\`\`\`toml
[profile.release]
codegen-units = 1
opt-level = "z"      # Optimize for size
lto = true           # Link-time optimization
debug = false
panic = "abort"
strip = true         # Remove symbols
\`\`\`

### Debug Profile
\`\`\`toml
[profile.dev]
opt-level = 0
debug = true
overflow-checks = true
\`\`\`

## Build Commands

### Standard Build
\`\`\`bash
# Build with ksc (recommended)
~/klever-sdk/ksc all build

# Alternative: Direct cargo build
cargo build --release --target wasm32v1-none
\`\`\`

### Clean Build
\`\`\`bash
# Clean and rebuild
~/klever-sdk/ksc clean
~/klever-sdk/ksc all build
\`\`\`

### Build with Optimization
\`\`\`bash
# ksc automatically optimizes WASM
~/klever-sdk/ksc all build --optimize
\`\`\`

## Output Files

After building, you'll find these files in the \`output/\` directory:

- \`contract.wasm\` - The WebAssembly binary for deployment
- \`contract.abi.json\` - Contract interface description
- \`contract-view.hex\` - Hex representation of the contract

## Common Build Issues

### Issue: Missing klever.json
\`\`\`bash
# Error: klever.json not found
# Solution: Create minimal klever.json
echo '{"language": "rust", "version": "0.1.0"}' > klever.json
\`\`\`

### Issue: Wrong Cargo.toml crate-type
\`\`\`toml
# Wrong:
crate-type = ["lib"]

# Correct:
crate-type = ["cdylib"]
\`\`\`

### Issue: WASM target not installed
\`\`\`bash
# Install WASM target
rustup target add wasm32v1-none
\`\`\`

### Issue: Large WASM size
\`\`\`toml
# Add to Cargo.toml [profile.release]
opt-level = "z"
lto = true
strip = true
codegen-units = 1
\`\`\`

## Best Practices

1. **Version Pinning**: Always specify exact klever-sc versions
2. **Size Optimization**: Use release profile optimizations
3. **Clean Builds**: Clean before important builds
4. **Dependency Management**: Minimize external dependencies
5. **Build Validation**: Always test build output before deployment`,
    {
      title: 'Klever Contract Build Configuration',
      description: 'Comprehensive guide to configuring builds for Klever smart contracts',
      tags: ['build', 'configuration', 'cargo', 'klever.json', 'wasm', 'optimization'],
      language: 'toml',
      relevanceScore: 0.9,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),
];

export default deploymentKnowledge;