import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * Complete lottery game example
 */

export const lotteryGameExample: KnowledgeEntry[] = [
  // Complete Lottery Game Example
  createKnowledgeEntry(
    'code_example',
    `# Complete Lottery Game Contract - Combining Patterns

This example shows how to combine multiple patterns to create a complete lottery game contract.

\`\`\`rust
#![no_std]

use klever_sc::imports::*;

/// A complete lottery game combining multiple patterns:
/// - Admin control for game management
/// - Pausable functionality for emergencies
/// - Token payments for ticket purchases
/// - Random number generation for winner selection
/// - Storage patterns for tracking players and prizes
/// - Events for game state changes
#[klever_sc::contract]
pub trait Lottery:
    klever_sc_modules::pause::PauseModule
    + klever_sc_modules::only_admin::OnlyAdminModule
{
    #[init]
    fn init(&self, ticket_price: BigUint) {
        self.ticket_price().set(ticket_price);
        self.set_paused(false);
    }

    #[upgrade]
    fn upgrade(&self, _new_ticket_price: BigUint) {
        // do nothing for now, can be extended later
    }

    /// Buy lottery tickets - combines payable endpoint pattern
    #[payable("KLV")]
    #[endpoint(buyTickets)]
    fn buy_tickets(&self) {
        self.require_not_paused();

        let payment = self.call_value().klv_value();
        let ticket_price = self.ticket_price().get();

        require!(*payment >= ticket_price, "Insufficient payment");

        let tickets_bought = &*payment / &ticket_price;
        let caller = self.blockchain().get_caller();

        // Convert BigUint to u32 for ticket count
        let tickets_count = tickets_bought.to_u64().unwrap_or(0) as u32;
        require!(tickets_count > 0, "No tickets bought, payment too low");

        // Storage pattern - track player tickets
        self.player_tickets(&caller).update(|tickets| *tickets += tickets_count);

        // Add player to the set if not already present
        self.players().insert(caller.clone());

        self.total_tickets().update(|total| *total += tickets_count);

        // Add to prize pool
        self.prize_pool().update(|pool| *pool += &*payment);

        // Event pattern - notify ticket purchase
        self.ticket_purchased_event(&caller, tickets_count);
    }

    /// Draw winner - combines random generation and cross-contract patterns
    #[endpoint(drawWinner)]
    fn draw_winner(&self) {
        self.require_not_paused();
        self.require_caller_is_admin();

        let total = self.total_tickets().get();
        require!(total > 0u32, "No tickets sold");

        // Random number generation pattern
        let mut rand_source = RandomnessSource::new();
        let winning_ticket = rand_source.next_u32() % total;

        // Find winner by iterating through players
        let winner = self.find_winner_by_ticket(winning_ticket);

        // Transfer prize
        let prize = self.prize_pool().take();
        self.send().direct_klv(&winner, &prize);

        // Event pattern - announce winner
        self.winner_drawn_event(&winner, &prize, winning_ticket);

        // Reset for next round
        self.reset_lottery();
    }

    /// Admin function to set new ticket price
    #[endpoint(setTicketPrice)]
    fn set_ticket_price(&self, new_price: BigUint) {
        self.require_caller_is_admin();
        self.ticket_price().set(new_price);
    }

    /// Emergency withdraw - admin only
    #[endpoint(emergencyWithdraw)]
    fn emergency_withdraw(&self) {
        self.require_caller_is_admin();
        self.set_paused(true);

        let pool = self.prize_pool().take();
        let admin = self.blockchain().get_owner_address();
        self.send().direct_klv(&admin, &pool);
    }

    fn find_winner_by_ticket(&self, winning_ticket: u32) -> ManagedAddress {
        let mut current_ticket = 0u32;

        for player in self.players().iter() {
            let player_ticket_count = self.player_tickets(&player).get();
            current_ticket += player_ticket_count;

            if current_ticket > winning_ticket {
                return player;
            }
        }

        sc_panic!("Winner not found");
    }

    fn reset_lottery(&self) {
        // Clear all player tickets
        for player in self.players().iter() {
            self.player_tickets(&player).clear();
        }
        self.players().clear();
        self.total_tickets().clear();
    }

    // Storage patterns
    #[storage_mapper("ticket_price")]
    fn ticket_price(&self) -> SingleValueMapper<BigUint>;

    #[storage_mapper("player_tickets")]
    fn player_tickets(&self, player: &ManagedAddress) -> SingleValueMapper<u32>;

    #[storage_mapper("total_tickets")]
    fn total_tickets(&self) -> SingleValueMapper<u32>;

    #[storage_mapper("prize_pool")]
    fn prize_pool(&self) -> SingleValueMapper<BigUint>;

    #[storage_mapper("players")]
    fn players(&self) -> UnorderedSetMapper<ManagedAddress>;

    // Events
    #[event("ticketPurchased")]
    fn ticket_purchased_event(
        &self,
        #[indexed] player: &ManagedAddress,
        #[indexed] tickets: u32,
    );

    #[event("winnerDrawn")]
    fn winner_drawn_event(
        &self,
        #[indexed] winner: &ManagedAddress,
        #[indexed] prize: &BigUint,
        #[indexed] winning_ticket: u32,
    );
}
\`\`\`

## Patterns Used in This Example:
1. **Basic Contract Structure** - Foundation with #![no_std] and imports
2. **Admin Module** - Admin-only functions for game management
3. **Pausable Module** - Emergency stop functionality
4. **Payable Endpoints** - Accept KLV for ticket purchases
5. **Random Number Generation** - Select winner randomly
6. **Storage Mappers** - Track tickets, players, and prize pool
7. **Event Patterns** - Notify about purchases and winners
8. **Token Transfer** - Send prize to winner

This demonstrates how multiple patterns work together to create a complete dApp!`,
    {
      title: 'Complete Lottery Game Example',
      description: 'Full example combining multiple patterns for a lottery game',
      tags: ['gaming', 'lottery', 'complete-example', 'patterns', 'defi'],
      language: 'rust',
      relevanceScore: 0.95,
      contractType: 'gaming',
      author: 'klever-mcp',
    }
  ),

  // Correct KLV Token Identifier Usage
  createKnowledgeEntry(
    'code_example',
    `# Correct KLV Token Identifier Usage

## Common Error
\`\`\`rust
// ❌ WRONG - This will cause compilation error
let balance = self.blockchain().get_sc_balance(&KlvTokenIdentifier::klv(), 0);
\`\`\`
Error: \`use of undeclared type 'KlvTokenIdentifier'\`

## Correct Usage
\`\`\`rust
// ✅ CORRECT - Use TokenIdentifier
let balance = self.blockchain().get_sc_balance(&TokenIdentifier::klv(), 0);

// For sending KLV
self.send().direct_klv(&recipient, &amount);

// For checking KLV payment
let klv_amount = self.call_value().klv_value();
\`\`\`

## Token Identifier Patterns
\`\`\`rust
// KLV token
TokenIdentifier::klv()

// KDA tokens
TokenIdentifier::from(&b"DVK-1234"[..])
TokenIdentifier::from(managed_buffer)

// Checking token type
if payment.token_identifier == TokenIdentifier::klv() {
    // Handle KLV payment
}
\`\`\``,
    {
      title: 'Correct KLV Token Identifier Usage',
      description: 'How to properly use TokenIdentifier for KLV and avoid common KlvTokenIdentifier error',
      tags: ['klv', 'token-identifier', 'balance', 'common-error'],
      language: 'rust',
      relevanceScore: 1.0,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),
];

export default lotteryGameExample;