import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * Documentation and guides for using the knowledge base
 */

export const discoveryGuideKnowledge: KnowledgeEntry[] = [
  // Code Example Discovery Guide
  createKnowledgeEntry(
    'best_practice',
    `# Finding Contract Patterns and Code Examples

## 🎯 How to Find Code Examples for Different Use Cases

This knowledge base contains extensive code examples for various smart contract implementations. Use these patterns to build gaming, DeFi, NFT, and other contract types.

### Available Code Example Categories

#### Core Contract Patterns
- **Basic Contract Structure** - Foundation for any contract type
- **Token Handling Examples** - KLV, KDA token operations
- **Storage Patterns** - Complete storage with namespaces and views
- **Admin Access Control** - Permission management for DeFi/gaming
- **Pausable Contracts** - Emergency stop mechanisms

#### Token & NFT Patterns
- **FungibleTokenMapper** - Create fungible tokens (for DeFi)
- **NonFungibleTokenMapper** - NFT creation and management
- **Token Payment Patterns** - Accept and process payments
- **KDA Token Operations** - Working with Klever digital assets

#### DeFi Building Blocks
- **Payable Endpoints** - Accept token deposits
- **Cross-Contract Calls** - Interact with other contracts
- **Remote Storage Access** - Read data from other contracts
- **Token Mapper Helpers** - Issue, mint, burn tokens

#### Gaming Components
- **Random Number Generation** - Secure randomness for games
- **Event Patterns** - Game state changes and notifications
- **Storage Collections** - Track players, scores, items

### How to Build Different Contract Types

#### 🎮 Gaming Contracts
Combine these patterns:
1. **Basic Contract Structure** - Foundation
2. **Random Number Generation** - For game mechanics
3. **Storage Collections** (MapMapper, SetMapper) - Track players/items
4. **Event Patterns** - Notify game state changes
5. **Admin Module** - Game admin functions
6. **Pausable Module** - Pause game if needed

#### 💰 DeFi Contracts
Combine these patterns:
1. **Basic Contract Structure** - Foundation
2. **Token Handling Examples** - Accept/send tokens
3. **FungibleTokenMapper** - Create liquidity tokens
4. **Payable Endpoints** - Accept deposits
5. **Cross-Contract Calls** - Interact with other DeFi protocols
6. **Admin Access Control** - Protocol governance

#### 🎨 NFT Contracts
Combine these patterns:
1. **Basic Contract Structure** - Foundation
2. **NonFungibleTokenMapper** - NFT creation
3. **Storage Patterns** - Track NFT metadata
4. **Token Payment Patterns** - NFT sales
5. **Event Patterns** - Mint/transfer events

#### 🏦 Staking Contracts
Combine these patterns:
1. **Basic Contract Structure** - Foundation
2. **Token Handling** - Stake/unstake operations
3. **Storage Mappers** - Track staked amounts
4. **View Endpoints** - Check balances
5. **Pausable Module** - Emergency controls

### Finding Specific Examples

To find code examples for your use case:
1. Search for \`type: 'code_example'\` to see all examples
2. Look for relevant patterns in the categories above
3. Combine multiple patterns to build complete contracts
4. Each example includes working code you can adapt

### Example: Building a Simple Game

\`\`\`rust
// Combine these patterns:
// 1. Basic structure
#![no_std]
use klever_sc::imports::*;

// 2. Add storage for game state
#[klever_sc::contract]
pub trait GameContract {
    #[storage_mapper("players")]
    fn players(&self) -> SetMapper<ManagedAddress>;

    #[storage_mapper("scores")]
    fn scores(&self) -> MapMapper<ManagedAddress, BigUint>;

    // 3. Game logic using randomness
    #[endpoint]
    fn play(&self) -> u8 {
        let mut rand_source = RandomnessSource::new();
        let dice_roll = (rand_source.next_u8() % 6) + 1;

        // Update scores...
        dice_roll
    }
}
\`\`\`

### Tips for Using Examples
- Start with the Basic Contract Structure
- Add modules and patterns as needed
- Each pattern is self-contained and can be combined
- Examples show real, working code
- Adapt variable names and logic to your needs`,
    {
      title: 'Code Example Discovery Guide',
      description: 'How to find and use code examples for different contract types',
      tags: ['guide', 'examples', 'patterns', 'gaming', 'defi', 'nft', 'discovery'],
      language: 'mixed',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),
];

export default discoveryGuideKnowledge;