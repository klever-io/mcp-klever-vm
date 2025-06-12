#![no_std]

use klever_sc::imports::*;

#[klever_sc::contract]
pub trait TokenContract {
    #[init]
    fn init(&self, initial_supply: BigUint) {
        let caller = self.blockchain().get_caller();
        self.balance(&caller).set(&initial_supply);
        self.total_supply().set(&initial_supply);
    }
    
    #[endpoint]
    fn transfer(&self, to: ManagedAddress, amount: BigUint) {
        let caller = self.blockchain().get_caller();
        require!(!to.is_zero(), "Cannot transfer to zero address");
        require!(amount > 0, "Amount must be positive");
        
        let caller_balance = self.balance(&caller).get();
        require!(caller_balance >= amount, "Insufficient balance");
        
        self.balance(&caller).set(&(caller_balance - &amount));
        self.balance(&to).update(|balance| *balance += &amount);
        
        self.transfer_event(&caller, &to, &amount);
    }
    
    #[endpoint]
    fn mint(&self, to: ManagedAddress, amount: BigUint) {
        self.require_owner();
        require!(!to.is_zero(), "Cannot mint to zero address");
        require!(amount > 0, "Amount must be positive");
        
        self.balance(&to).update(|balance| *balance += &amount);
        self.total_supply().update(|supply| *supply += &amount);
        
        self.mint_event(&to, &amount);
    }
    
    #[endpoint]
    fn burn(&self, amount: BigUint) {
        let caller = self.blockchain().get_caller();
        require!(amount > 0, "Amount must be positive");
        
        let caller_balance = self.balance(&caller).get();
        require!(caller_balance >= amount, "Insufficient balance");
        
        self.balance(&caller).set(&(caller_balance - &amount));
        self.total_supply().update(|supply| *supply -= &amount);
        
        self.burn_event(&caller, &amount);
    }
    
    #[view(getBalance)]
    fn get_balance(&self, address: ManagedAddress) -> BigUint {
        self.balance(&address).get()
    }
    
    #[view(getTotalSupply)]
    fn get_total_supply(&self) -> BigUint {
        self.total_supply().get()
    }
    
    // Storage
    
    #[storage_mapper("balance")]
    fn balance(&self, address: &ManagedAddress) -> SingleValueMapper<BigUint>;
    
    #[storage_mapper("totalSupply")]
    fn total_supply(&self) -> SingleValueMapper<BigUint>;
    
    #[storage_mapper("owner")]
    fn owner(&self) -> SingleValueMapper<ManagedAddress>;
    
    // Events
    
    #[event("transfer")]
    fn transfer_event(
        &self,
        #[indexed] from: &ManagedAddress,
        #[indexed] to: &ManagedAddress,
        amount: &BigUint
    );
    
    #[event("mint")]
    fn mint_event(
        &self,
        #[indexed] to: &ManagedAddress,
        amount: &BigUint
    );
    
    #[event("burn")]
    fn burn_event(
        &self,
        #[indexed] from: &ManagedAddress,
        amount: &BigUint
    );
    
    // Helper functions
    
    fn require_owner(&self) {
        let caller = self.blockchain().get_caller();
        let owner = self.owner().get();
        require!(caller == owner, "Only owner can call this function");
    }
}