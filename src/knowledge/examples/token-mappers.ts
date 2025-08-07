import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * Token mapper example patterns
 */

export const tokenMapperExamples: KnowledgeEntry[] = [
  // Token Mapper Helpers
  createKnowledgeEntry(
    'code_example',
    `# Token Mapper Helper Modules

Klever provides specialized storage mappers that simplify token issuance, minting, burning, and management.

## FungibleTokenMapper

### Setup and Issuance
\`\`\`rust
#[payable("KLV")]
#[endpoint]
fn issue_fungible(
    &self,
    token_ticker: ManagedBuffer,
    initial_supply: BigUint,
) -> TokenIdentifier {
    self.fungible_token_mapper().issue(
        &ManagedBuffer::new(),  // token name (empty)
        &token_ticker,          // ticker like "MYTOKEN"
        &initial_supply,        // initial supply
        &initial_supply,        // max supply
        0,                      // decimals
    )
}

#[view(getFungibleTokenId)]
#[storage_mapper("fungibleTokenMapper")]
fn fungible_token_mapper(&self) -> FungibleTokenMapper;
\`\`\`

### Minting and Burning
\`\`\`rust
#[endpoint]
fn mint(&self, amount: BigUint) {
    // Mint tokens using the mapper
    let mint_result = self.fungible_token_mapper().mint(&amount);

    // Send to caller
    let caller = self.blockchain().get_caller();
    self.send().direct_payment(&caller, &mint_result);
}

#[payable("*")]  // Required to receive KDA tokens
#[endpoint]
fn burn(&self, amount: BigUint) {
    let payment = self.call_value().single_kda();
    let token_id = self.fungible_token_mapper().get_token_id();
    
    require!(payment.token_identifier == token_id, "Wrong token");
    require!(payment.amount == amount, "Wrong amount");
    
    self.fungible_token_mapper().burn(&payment.amount);
}
\`\`\`

## NonFungibleTokenMapper

### NFT Issuance
\`\`\`rust
#[payable("KLV")]
#[endpoint]
fn issue_nft(
    &self,
    token_ticker: ManagedBuffer,
) -> TokenIdentifier {
    self.nft_mapper().issue(
        &ManagedBuffer::new(),  // token name
        &token_ticker,          // ticker like "MYNFT"
        0,                      // decimals (0 for NFTs)
    )
}

#[view(getNftTokenId)]
#[storage_mapper("nftMapper")]
fn nft_mapper(&self) -> NonFungibleTokenMapper;
\`\`\`

### NFT Creation and Transfer
\`\`\`rust
#[endpoint]
fn create_nft(
    &self,
    name: ManagedBuffer,
    uri: ManagedBuffer,
) -> TokenIdentifier {
    self.require_roles(&[KdaRole::NftCreate]);
    
    let nft_token_id = self.nft_mapper().get_token_id();
    let nft_nonce = self.send().kda_nft_create(
        &nft_token_id,
        &BigUint::from(1u32),
        &name,
        &0u64,
        &ManagedBuffer::new(),
        &uri,
        &ManagedVec::new(),
    );
    
    // Send to caller
    let caller = self.blockchain().get_caller();
    self.send().direct_kda(
        &caller,
        &nft_token_id,
        nft_nonce,
        &BigUint::from(1u32),
    );
    
    nft_token_id
}
\`\`\`

## Key Features
- **Automatic token ID management**: Mappers store and retrieve token IDs
- **Built-in issue/mint/burn**: Simplified token operations
- **Type safety**: Ensures correct token types
- **Clear state checking**: \`.is_empty()\` to check if issued`,
    {
      title: 'Token Mapper Helper Modules',
      description: 'Using FungibleTokenMapper and NonFungibleTokenMapper for token management',
      tags: ['token-mapper', 'fungible', 'non-fungible', 'nft', 'mint', 'burn', 'issue'],
      language: 'rust',
      relevanceScore: 0.9,
      contractType: 'token',
      author: 'klever-mcp',
    }
  ),
];

export default tokenMapperExamples;