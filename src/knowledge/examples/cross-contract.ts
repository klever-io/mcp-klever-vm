import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

/**
 * Cross-contract communication patterns
 */

export const crossContractExamples: KnowledgeEntry[] = [
  // Cross-Contract Communication Pattern
  createKnowledgeEntry(
    'code_example',
    `# Cross-Contract Communication Pattern

## Basic Contract Proxy
\`\`\`rust
#[allow(unused_imports)]
use klever_sc::imports::*;

// Define the external contract interface
#[klever_sc::proxy]
pub trait ExternalContract {
    #[endpoint]
    fn do_something(&self, value: BigUint) -> BigUint;
    
    #[endpoint]
    fn get_balance(&self, user: ManagedAddress) -> BigUint;
}

#[klever_sc::contract]
pub trait MyContract {
    #[storage_mapper("externalContractAddress")]
    fn external_contract_address(&self) -> SingleValueMapper<ManagedAddress>;

    #[endpoint]
    fn call_external_contract(&self, value: BigUint) {
        let contract_address = self.external_contract_address().get();

        // Create contract proxy
        let mut contract_proxy = self.send()
            .contract_call::<ExternalContract>(contract_address)
            .do_something(value);

        // Execute the call
        let result = contract_proxy.execute_on_dest_context::<BigUint>();

        // Process result...
        self.last_result().set(&result);
    }

    #[endpoint]
    fn query_external_balance(&self, user: ManagedAddress) -> BigUint {
        let contract_address = self.external_contract_address().get();

        // Synchronous call - result returned immediately
        let balance: BigUint = self.send()
            .contract_call::<ExternalContract>(contract_address)
            .get_balance(user)
            .execute_on_dest_context();

        balance
    }

    #[storage_mapper("lastResult")]
    fn last_result(&self) -> SingleValueMapper<BigUint>;
}
\`\`\`

## Cross-Contract Call with Payment
\`\`\`rust
#[klever_sc::contract]
pub trait PaymentCallerContract {
    #[payable("KLV")]
    #[endpoint]
    fn forward_payment(&self, target_contract: ManagedAddress, target_endpoint: ManagedBuffer) {
        let payment = self.call_value().klv_value();
        
        // Forward the KLV payment to another contract
        self.send()
            .contract_call::<()>(target_contract, target_endpoint)
            .with_klv_transfer(payment.clone_value())
            .call();
            
        self.payment_forwarded_event(&target_contract, &payment);
    }
    
    #[event("paymentForwarded")]
    fn payment_forwarded_event(
        &self,
        #[indexed] target: &ManagedAddress,
        #[indexed] amount: &BigUint
    );
}
\`\`\`

## Multi-Contract Interaction
\`\`\`rust
#[klever_sc::contract]
pub trait MultiContractManager {
    #[endpoint]
    fn batch_call_contracts(&self, contracts: ManagedVec<ManagedAddress>, value: BigUint) {
        for contract in &contracts {
            let result: BigUint = self.send()
                .contract_call::<ExternalContract>(contract.clone())
                .do_something(value.clone())
                .execute_on_dest_context();
                
            // Store results
            self.contract_results(&contract).set(&result);
        }
    }
    
    #[view]
    fn get_contract_result(&self, contract: ManagedAddress) -> BigUint {
        self.contract_results(&contract).get()
    }
    
    #[storage_mapper("contractResults")]
    fn contract_results(&self, contract: &ManagedAddress) -> SingleValueMapper<BigUint>;
}
\`\`\``,
    {
      title: 'Cross-Contract Communication Pattern',
      description: 'Pattern for calling other contracts using proxies with synchronous execution',
      tags: ['cross-contract', 'proxy', 'synchronous', 'communication'],
      language: 'rust',
      relevanceScore: 0.9,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Cross-Contract Call Patterns (Synchronous Only)
  createKnowledgeEntry(
    'code_example',
    `# Cross-Contract Call Patterns (Synchronous Only)

## Important: Klever Only Supports Synchronous Calls
Unlike some other blockchains, Klever smart contracts only support synchronous contract calls. All calls are executed immediately and return results in the same transaction.

## Basic Synchronous Call
\`\`\`rust
#[klever_sc::proxy]
pub trait ExternalContractProxy {
    #[endpoint]
    fn compute_value(&self, input: BigUint) -> BigUint;
}

#[klever_sc::contract]
pub trait CallerContract {
    #[endpoint]
    fn call_and_use_result(&self, target: ManagedAddress, input: BigUint) -> BigUint {
        // Call executes immediately, result available right away
        let result: BigUint = self.send()
            .contract_call::<ExternalContractProxy>(target)
            .compute_value(input)
            .execute_on_dest_context();
            
        // Use result immediately in same transaction
        let doubled_result = &result * 2u32;
        self.last_calculation().set(&doubled_result);
        
        doubled_result
    }
    
    #[storage_mapper("lastCalculation")]
    fn last_calculation(&self) -> SingleValueMapper<BigUint>;
}
\`\`\`

## Error Handling in Cross-Contract Calls
\`\`\`rust
#[klever_sc::contract]
pub trait SafeCallerContract {
    #[endpoint]
    fn safe_contract_call(&self, target: ManagedAddress) -> SCResult<()> {
        // Validate target is a contract
        require!(
            self.blockchain().is_smart_contract(&target),
            "Target must be a smart contract"
        );

        // Contract calls that fail will panic
        // You cannot catch panics - design accordingly
        let balance: BigUint = self.send()
            .contract_call::<ExternalContractProxy>(target)
            .get_balance(self.blockchain().get_caller())
            .execute_on_dest_context();
            
        // If we reach here, call succeeded
        self.last_balance().set(&balance);
        
        Ok(())
    }
    
    #[storage_mapper("lastBalance")]
    fn last_balance(&self) -> SingleValueMapper<BigUint>;
}
\`\`\`

## Contract Factory Pattern
\`\`\`rust
#[klever_sc::contract]
pub trait ContractFactory {
    #[payable("KLV")]
    #[endpoint]
    fn deploy_and_initialize(&self, init_value: BigUint) -> ManagedAddress {
        let payment = self.call_value().klv_value();
        
        // Deploy new contract (pseudo-code - actual deployment is more complex)
        let new_contract_address = self.deploy_new_contract();
        
        // Initialize the new contract immediately
        self.send()
            .contract_call::<ExternalContractProxy>(new_contract_address.clone())
            .initialize(init_value)
            .with_klv_transfer(payment.clone_value())
            .call();
            
        // Store deployed contract
        self.deployed_contracts().insert(new_contract_address.clone());
        
        new_contract_address
    }
    
    fn deploy_new_contract(&self) -> ManagedAddress {
        // Contract deployment logic
        // This is simplified - actual deployment requires WASM code
        ManagedAddress::zero() // Placeholder
    }
    
    #[storage_mapper("deployedContracts")]
    fn deployed_contracts(&self) -> SetMapper<ManagedAddress>;
}
\`\`\`

## Key Points:
1. **Synchronous Only**: All calls execute immediately
2. **No Async/Await**: Results are available right away
3. **Panic Propagation**: Failed calls will panic the entire transaction
4. **Gas Limits**: Cross-contract calls consume gas from the original transaction
5. **State Changes**: All state changes happen in the same transaction`,
    {
      title: 'Cross-Contract Call Patterns (Synchronous Only)',
      description: 'Comprehensive guide to synchronous cross-contract calls in Klever',
      tags: ['cross-contract', 'synchronous', 'proxy', 'calls', 'error-handling'],
      language: 'rust',
      relevanceScore: 0.95,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  // Remote Storage Access Pattern
  createKnowledgeEntry(
    'code_example',
    `# Remote Storage Access Pattern

## Accessing Storage from Another Contract
\`\`\`rust
#[klever_sc::contract]
pub trait MyContract {
    // Local storage mapper
    #[storage_mapper("my_mapper")]
    fn my_mapper(&self) -> SetMapper<u32>;

    // Remote storage mapper - accesses storage at another address
    #[storage_mapper_from_address("my_mapper")]
    fn my_mapper_from_address(
        &self,
        address: ManagedAddress
    ) -> SetMapper<u32, ManagedAddress>;

    #[endpoint]
    fn read_remote_storage(&self, contract_address: ManagedAddress) {
        // Access the remote contract's storage
        let remote_mapper = self.my_mapper_from_address(contract_address);

        // Iterate over remote storage
        for value in remote_mapper.iter() {
            // Process value from remote contract
            self.process_remote_value(value);
        }
    }

    // Example with additional keys
    #[storage_mapper_from_address("user_data")]
    fn user_data_from_address(
        &self,
        address: ManagedAddress,
        user: &ManagedAddress
    ) -> SingleValueMapper<BigUint, ManagedAddress>;

    #[endpoint]
    fn check_user_balance_in_contract(
        &self,
        contract_address: ManagedAddress,
        user: ManagedAddress
    ) -> BigUint {
        // Read user balance from another contract's storage
        self.user_data_from_address(contract_address, &user).get()
    }

    fn process_remote_value(&self, value: u32) {
        // Process the value read from remote storage
        self.processed_values().insert(value);
    }

    #[storage_mapper("processedValues")]
    fn processed_values(&self) -> SetMapper<u32>;
}
\`\`\`

## Use Cases for Remote Storage Access:
1. **Data Aggregation**: Collecting data from multiple contracts
2. **Cross-Contract Verification**: Checking state in other contracts
3. **Proxy Patterns**: Reading data through proxy contracts
4. **Analytics**: Computing statistics across multiple contracts

## Important Notes:
- Remote storage access is read-only
- The remote contract must be readable (deployed with --readable flag)
- Use the same storage key as the target contract
- Remote access consumes gas like any other operation`,
    {
      title: 'Remote Storage Access Pattern',
      description: 'Pattern for accessing storage from other contracts using storage_mapper_from_address',
      tags: ['remote-storage', 'storage-mapper', 'cross-contract', 'read-access'],
      language: 'rust',
      relevanceScore: 0.85,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),
];

export default crossContractExamples;