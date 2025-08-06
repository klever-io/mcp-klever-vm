import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * Common error patterns and solutions
 */

export const commonErrorsKnowledge: KnowledgeEntry[] = [
  // Common Klever Smart Contract Errors
  createKnowledgeEntry(
    'error_pattern',
    `# Common Klever Smart Contract Errors

## Type Errors
**Issue**: "incompatible types" with managed types
**Solution**: Ensure using correct API parameter (Self::Api)
\`\`\`rust
// ❌ Wrong
fn my_value(&self) -> SingleValueMapper<BigUint>;

// ✅ Correct
fn my_value(&self) -> SingleValueMapper<BigUint<Self::Api>>;
\`\`\`

## Struct Type Parameter Errors
**Issue**: "missing type parameter" or "cannot find type \`Self\` in this scope"
**Solution**: Add type parameter \`<Self::Api>\` to managed types
\`\`\`rust
// ❌ Wrong
pub struct UserInfo {
    address: ManagedAddress,
    balance: BigUint,
}

// ✅ Correct
pub struct UserInfo<M: ManagedTypeApi> {
    address: ManagedAddress<M>,
    balance: BigUint<M>,
}
\`\`\`

## Event Annotation Errors
**Issue**: Event macro not working
**Solution**: Check annotation format
\`\`\`rust
// ❌ Wrong
#[event("user_registered")]  // snake_case won't work

// ✅ Correct
#[event("userRegistered")]   // camelCase required
\`\`\`

## Import Errors
**Issue**: "unresolved import" for RandomnessSource
**Solution**: It's already included in imports::*
\`\`\`rust
// ❌ Wrong - Don't import separately
use klever_sc::api::RandomnessSource;

// ✅ Correct - Already in imports
use klever_sc::imports::*;
// RandomnessSource is available
\`\`\`

## Koperator Command Syntax Errors
**Issue**: Using wrong koperator parameters that don't exist
**Common mistakes**:
\`\`\`bash
# ❌ WRONG - These parameters DO NOT EXIST in koperator:
sc invoke \\
    --contract="$CONTRACT_ADDRESS" \\    # ❌ WRONG
    --function="placeBet" \\             # ❌ WRONG
    --value="$BET_AMOUNT" \\             # ❌ WRONG
    --kdaFee="KLV"                       # ❌ WRONG

# ✅ CORRECT - Use positional arguments and correct parameters:
sc invoke $CONTRACT_ADDRESS placeBet \\
    --args "u8:6" \\
    --values "KLV=$BET_AMOUNT" \\
    --await --sign --result-only
\`\`\`

**Solution**:
- CONTRACT_ADDRESS and FUNCTION_NAME are positional arguments
- Use --values for token payments (not --value)
- Use --args for function arguments with type prefixes
- Always include --result-only for clean output`,
    {
      title: 'Common Klever Smart Contract Errors',
      description: 'Common compilation and runtime errors with solutions',
      tags: ['error', 'troubleshooting', 'types', 'imports', 'koperator', 'debugging'],
      language: 'mixed',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Event Parameter Limitation Error
  createKnowledgeEntry(
    'error_pattern',
    `# Event Parameter Limitation Error in Klever

## Error Description
**Issue**: "too many non-indexed parameters in event" or event compilation errors
**Cause**: Klever has a strict limitation on event parameters - you can have at most ONE non-indexed parameter

## Example of the Error
\`\`\`rust
// ❌ THIS WILL CAUSE AN ERROR
#[event("gamePlayed")]
fn game_played_event(
    &self,
    #[indexed] player: &ManagedAddress,
    bet_amount: &BigUint,     // ❌ Error: non-indexed
    chosen_number: u8,        // ❌ Error: non-indexed
    result: bool              // ❌ Error: too many non-indexed
);
\`\`\`

## The Rule
**ONE DATA RULE**: You can have either:
- Multiple indexed parameters + ONE non-indexed parameter
- All parameters indexed + NO non-indexed parameters

## Solutions

### Solution 1: Combine into a Struct (Recommended)
\`\`\`rust
#[derive(TopEncode)]
pub struct GameResult<M: ManagedTypeApi> {
    bet_amount: BigUint<M>,
    chosen_number: u8,
    result: bool,
}

#[event("gamePlayed")]
fn game_played_event(
    &self,
    #[indexed] player: &ManagedAddress,
    game_data: &GameResult<Self::Api>  // ✅ Single non-indexed parameter
);
\`\`\`

### Solution 2: Make All Parameters Indexed
\`\`\`rust
#[event("gamePlayed")]
fn game_played_event(
    &self,
    #[indexed] player: &ManagedAddress,
    #[indexed] bet_amount: &BigUint,
    #[indexed] chosen_number: u8,
    #[indexed] result: bool  // ✅ All indexed, no data field
);
\`\`\`

### Solution 3: Emit Multiple Events
\`\`\`rust
// Event 1: Game start
#[event("gameStarted")]
fn game_started_event(
    &self,
    #[indexed] player: &ManagedAddress,
    #[indexed] chosen_number: u8,
    bet_amount: &BigUint  // One non-indexed
);

// Event 2: Game result
#[event("gameResult")]
fn game_result_event(
    &self,
    #[indexed] player: &ManagedAddress,
    #[indexed] won: bool,
    payout: &BigUint  // One non-indexed
);
\`\`\`

## Best Practice
Always prefer Solution 1 (struct) as it:
- Keeps related data together
- Makes events more readable
- Allows future additions without breaking changes
- Follows Klever's event design pattern`,
    {
      title: 'Event Parameter Limitation Error',
      description: 'Klever event parameter limitation - maximum one non-indexed parameter',
      tags: ['error', 'events', 'parameters', 'indexed', 'one-data-rule', 'struct'],
      language: 'rust',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Error Handling Best Practices
  createKnowledgeEntry(
    'best_practice',
    `# Error Handling in Klever Smart Contracts

## require! vs sc_panic!

### Use require! for Input Validation
\`\`\`rust
#[endpoint]
fn transfer(&self, to: ManagedAddress, amount: BigUint) {
    // require! returns a clear error message
    require!(amount > 0, "Transfer amount must be positive");
    require!(
        self.balance(&self.blockchain().get_caller()).get() >= &amount,
        "Insufficient balance"
    );

    // Continue with transfer logic...
}
\`\`\`

### Use sc_panic! for Critical Failures
\`\`\`rust
#[endpoint]
fn critical_operation(&self) {
    let result = self.perform_critical_task();
    
    if result.is_err() {
        // Panic for unrecoverable errors
        sc_panic!("Critical system failure: corrupted state");
    }
}
\`\`\`

## Best Practices for Error Messages

### Be Specific and Actionable
\`\`\`rust
// ❌ Bad: Generic message
require!(amount > 0, "Invalid amount");

// ✅ Good: Specific and helpful
require!(amount > 0, "Transfer amount must be greater than zero");

// ❌ Bad: Technical jargon
require!(self.check_invariant(), "Invariant violation at L245");

// ✅ Good: User-friendly
require!(self.check_invariant(), "Contract state inconsistency detected");
\`\`\`

### Include Context When Helpful
\`\`\`rust
#[endpoint]
fn place_bet(&self, number: u8) {
    require!(
        number >= 1 && number <= 36,
        "Invalid bet number: must be between 1 and 36"
    );
    
    let min_bet = self.min_bet_amount().get();
    let payment = self.call_value().klv_value();
    
    require!(
        payment >= min_bet,
        "Bet amount too low: minimum is {} units",
        min_bet
    );
}
\`\`\`

## Error Handling in Contract Calls

### Handle Contract Call Failures
\`\`\`rust
#[endpoint]
fn safe_transfer(&self, target: ManagedAddress, amount: BigUint) {
    // Pre-validate to avoid panics
    require!(
        self.blockchain().is_smart_contract(&target),
        "Invalid contract address"
    );

    // Check balance before attempting transfer
    let balance = self.balance(&self.blockchain().get_caller()).get();
    require!(balance >= amount, "Insufficient balance");

    // Perform the transfer
    self.send()
        .direct(&target, &TokenIdentifier::klv(), 0, &amount);
}
\`\`\`

### Error Recovery Patterns
\`\`\`rust
#[endpoint]
fn withdraw_with_fallback(&self) {
    let caller = self.blockchain().get_caller();
    let amount = self.pending_withdrawals(&caller).get();
    
    require!(amount > 0, "No pending withdrawal");
    
    // Clear the pending amount first (reentrancy protection)
    self.pending_withdrawals(&caller).clear();
    
    // Attempt withdrawal
    let send_result = self.send()
        .direct_klv(&caller, &amount);
    
    if send_result.is_err() {
        // Restore the pending amount if send failed
        self.pending_withdrawals(&caller).set(&amount);
        sc_panic!("Withdrawal failed: please try again later");
    }
}
\`\`\``,
    {
      title: 'Error Handling Best Practices',
      description: 'Comprehensive guide to error handling in Klever smart contracts',
      tags: ['error-handling', 'require', 'panic', 'validation', 'best-practice'],
      language: 'rust',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),
];

export default commonErrorsKnowledge;