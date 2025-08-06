import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * Staking contract example
 */

export const stakingContractExample: KnowledgeEntry[] = [
  // Complete BigUint Example - Staking Contract
  createKnowledgeEntry(
    'code_example',
    `# Complete BigUint Example - Staking Contract

This example demonstrates all BigUint patterns in a real staking contract:

\`\`\`rust
#![no_std]

use klever_sc::imports::*;

#[klever_sc::contract]
pub trait StakingContract {
    #[init]
    fn init(&self, min_stake: BigUint, reward_rate: BigUint) {
        self.min_stake().set(min_stake);
        self.reward_rate().set(reward_rate);  // Rate per 1000 staked per day
    }

    #[payable("KLV")]
    #[endpoint]
    fn stake(&self) {
        let payment = self.call_value().klv_value();
        let min_stake = self.min_stake().get();

        // ✅ Comparison - both owned values
        require!(*payment >= min_stake, "Below minimum stake");

        let caller = self.blockchain().get_caller();
        let timestamp = self.blockchain().get_block_timestamp();

        // ✅ Addition with reference
        self.user_stake(&caller).update(|stake| {
            *stake += &payment;
        });

        // Store stake timestamp
        self.stake_timestamp(&caller).set(timestamp);

        // ✅ Addition to total - move semantics
        self.total_staked().update(|total| {
            *total += payment;
        });

        self.stake_event(&caller, &self.user_stake(&caller).get());
    }

    #[endpoint]
    fn calculate_rewards(&self, user: ManagedAddress) -> BigUint {
        let stake = self.user_stake(&user).get();
        if stake == 0 {
            return BigUint::zero();
        }

        let timestamp = self.stake_timestamp(&user).get();
        let current_time = self.blockchain().get_block_timestamp();
        let days_staked = (current_time - timestamp) / 86400;

        // ✅ Complex calculation with BigUint
        let reward_rate = self.reward_rate().get();
        
        // Calculate: (stake * reward_rate * days) / 1000
        let reward = &stake * &reward_rate * days_staked / 1000u64;
        
        reward
    }

    #[endpoint]
    fn claim_rewards(&self) {
        let caller = self.blockchain().get_caller();
        let rewards = self.calculate_rewards(caller.clone());

        require!(rewards > 0, "No rewards to claim");

        // Update timestamp to now
        self.stake_timestamp(&caller).set(
            self.blockchain().get_block_timestamp()
        );

        // Send rewards
        self.send().direct_klv(&caller, &rewards);

        self.claim_event(&caller, &rewards);
    }

    #[endpoint]
    fn unstake(&self, amount: BigUint) {
        let caller = self.blockchain().get_caller();
        let staked = self.user_stake(&caller).get();

        // ✅ Comparison and subtraction
        require!(staked >= amount, "Insufficient staked amount");

        // Claim rewards first
        let rewards = self.calculate_rewards(caller.clone());
        
        // Update user stake
        self.user_stake(&caller).update(|stake| {
            *stake -= &amount;
        });

        // Update total
        self.total_staked().update(|total| {
            *total -= &amount;
        });

        // ✅ Addition for total payout
        let total_payout = amount + rewards;
        
        // Send back stake plus rewards
        self.send().direct_klv(&caller, &total_payout);

        self.unstake_event(&caller, &total_payout);
    }

    // View functions
    #[view]
    fn get_user_stake(&self, user: ManagedAddress) -> BigUint {
        self.user_stake(&user).get()
    }

    #[view]
    fn get_total_staked(&self) -> BigUint {
        self.total_staked().get()
    }

    // Storage
    #[storage_mapper("min_stake")]
    fn min_stake(&self) -> SingleValueMapper<BigUint>;

    #[storage_mapper("reward_rate")]
    fn reward_rate(&self) -> SingleValueMapper<BigUint>;

    #[storage_mapper("total_staked")]
    fn total_staked(&self) -> SingleValueMapper<BigUint>;

    #[storage_mapper("user_stake")]
    fn user_stake(&self, user: &ManagedAddress) -> SingleValueMapper<BigUint>;

    #[storage_mapper("stake_timestamp")]
    fn stake_timestamp(&self, user: &ManagedAddress) -> SingleValueMapper<u64>;

    // Events
    #[event("stake")]
    fn stake_event(&self, #[indexed] user: &ManagedAddress, amount: &BigUint);

    #[event("unstake")]
    fn unstake_event(&self, #[indexed] user: &ManagedAddress, amount: &BigUint);

    #[event("claim")]
    fn claim_event(&self, #[indexed] user: &ManagedAddress, amount: &BigUint);
}
\`\`\`

## Key BigUint Patterns Demonstrated:
1. **Initialization**: Setting initial values in \`init\`
2. **Comparisons**: Using \`>=\`, \`>\`, \`==\` operators
3. **Arithmetic**: Addition, subtraction, multiplication, division
4. **References**: Using \`&\` for efficient operations
5. **Updates**: Modifying stored values with closures
6. **Complex calculations**: Multi-step reward calculations`,
    {
      title: 'Complete Staking Contract Example',
      description: 'Full staking contract demonstrating BigUint operations and patterns',
      tags: ['example', 'staking', 'biguint', 'complete', 'rewards', 'defi'],
      language: 'rust',
      relevanceScore: 0.95,
      contractType: 'staking',
      author: 'klever-mcp',
    }
  ),
];

export default stakingContractExample;