import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

export const whiteboxTestsKnowledge: KnowledgeEntry[] = [
  createKnowledgeEntry(
    'code_example',
    `# Whitebox Testing with BlockchainStateWrapper (Legacy)

Whitebox tests give you access to contract internals while simulating a full blockchain environment. The \`BlockchainStateWrapper\` API is the older style — still fully supported.

## When to Use
- Need to inspect/modify storage directly during a test
- Testing payment flows (KLV and KDA)
- Testing blockchain state queries (epoch, nonce, timestamp)
- Testing events and state revert behavior

## Setup

\`\`\`rust
use klever_sc_scenario::{
    testing_framework::*, rust_biguint, managed_biguint, managed_token_id, managed_address,
};
use my_contract::*;

const WASM_PATH: &str = "output/my-contract.wasm";
\`\`\`

## Creating Accounts and Contracts

\`\`\`rust
#[test]
fn setup_test() {
    let mut wrapper = BlockchainStateWrapper::new();

    // Create a user wallet with KLV balance
    let user = wrapper.create_user_account(&rust_biguint!(1_000));

    // Create a smart contract account (owner = user)
    let sc = wrapper.create_sc_account(
        &rust_biguint!(0),        // initial KLV balance
        Some(&user),              // owner (None = no owner)
        my_contract::contract_obj,
        WASM_PATH,
    );
}
\`\`\`

## Execute Transaction

\`\`\`rust
#[test]
fn execute_tx_test() {
    let mut wrapper = BlockchainStateWrapper::new();
    let user = wrapper.create_user_account(&rust_biguint!(0));
    let sc = wrapper.create_sc_account(&rust_biguint!(0), None, my_contract::contract_obj, WASM_PATH);

    // Simulate deploy by calling init
    wrapper
        .execute_tx(&user, &sc, &rust_biguint!(0), |sc| {
            sc.init();
        })
        .assert_ok();

    // Execute a state-changing call
    wrapper
        .execute_tx(&user, &sc, &rust_biguint!(0), |sc| {
            sc.add(managed_biguint!(50));
            // Can assert storage changes inside the closure
            assert_eq!(sc.total_value().get(), managed_biguint!(51));
        })
        .assert_ok();
}
\`\`\`

## Execute Query (Read-Only)

\`\`\`rust
#[test]
fn execute_query_test() {
    let mut wrapper = BlockchainStateWrapper::new();
    let sc = wrapper.create_sc_account(&rust_biguint!(2_000), None, my_contract::contract_obj, WASM_PATH);

    wrapper
        .execute_query(&sc, |sc| {
            let balance = sc.get_klv_balance();
            assert_eq!(balance, managed_biguint!(2_000));
        })
        .assert_ok();
}
\`\`\`

## Testing KLV Payments

\`\`\`rust
#[test]
fn test_klv_payment() {
    let mut wrapper = BlockchainStateWrapper::new();
    let caller = wrapper.create_user_account(&rust_biguint!(1_000));
    let sc = wrapper.create_sc_account(&rust_biguint!(2_000), Some(&caller), my_contract::contract_obj, WASM_PATH);

    // Send KLV with the transaction
    wrapper
        .execute_tx(&caller, &sc, &rust_biguint!(1_000), |sc| {
            let payment = sc.receive_klv();
            assert_eq!(payment, managed_biguint!(1_000));
        })
        .assert_ok();

    // Check balances after tx
    wrapper.check_klv_balance(&caller, &rust_biguint!(0));
    wrapper.check_klv_balance(sc.address_ref(), &rust_biguint!(3_000));
}
\`\`\`

## Testing KDA Token Transfers

\`\`\`rust
#[test]
fn test_kda_transfer() {
    let mut wrapper = BlockchainStateWrapper::new();
    let caller = wrapper.create_user_account(&rust_biguint!(0));
    let sc = wrapper.create_sc_account(&rust_biguint!(0), None, my_contract::contract_obj, WASM_PATH);
    let token_id = b"COOL-123456";

    wrapper.set_kda_balance(&caller, token_id, &rust_biguint!(1_000));
    wrapper.set_kda_balance(sc.address_ref(), token_id, &rust_biguint!(2_000));

    wrapper
        .execute_kda_transfer(&caller, &sc, token_id, 0, &rust_biguint!(1_000), |sc| {
            let (id, amount) = sc.receive_kda();
            assert_eq!(id, managed_token_id!(token_id));
            assert_eq!(amount, managed_biguint!(1_000));
        })
        .assert_ok();

    wrapper.check_kda_balance(&caller, token_id, &rust_biguint!(0));
    wrapper.check_kda_balance(sc.address_ref(), token_id, &rust_biguint!(3_000));
}
\`\`\`

## Testing NFT Balances

\`\`\`rust
#[test]
fn test_nft() {
    let mut wrapper = BlockchainStateWrapper::new();
    let sc = wrapper.create_sc_account(&rust_biguint!(0), None, my_contract::contract_obj, WASM_PATH);
    let token_id = b"NFT-abc123";
    let nonce = 2u64;

    wrapper.set_nft_balance(sc.address_ref(), token_id, nonce, &rust_biguint!(1_000), &nft_attrs);
    wrapper.check_nft_balance(sc.address_ref(), token_id, nonce, &rust_biguint!(1_000), Some(&nft_attrs));
}
\`\`\`

## Testing Multi-Token Transfers

\`\`\`rust
#[test]
fn test_multi_transfer() {
    let mut wrapper = BlockchainStateWrapper::new();
    let caller = wrapper.create_user_account(&rust_biguint!(0));
    let sc = wrapper.create_sc_account(&rust_biguint!(0), None, my_contract::contract_obj, WASM_PATH);

    wrapper.set_kda_balance(&caller, b"TOK1-111111", &rust_biguint!(100));
    wrapper.set_nft_balance(&caller, b"NFT1-222222", 5, &rust_biguint!(1), &Empty);

    let transfers = vec![
        TxTokenTransfer { token_identifier: b"TOK1-111111".to_vec(), nonce: 0, value: rust_biguint!(100) },
        TxTokenTransfer { token_identifier: b"NFT1-222222".to_vec(), nonce: 5, value: rust_biguint!(1) },
    ];

    wrapper
        .execute_kda_multi_transfer(&caller, &sc, &transfers, |sc| {
            let payments = sc.receive_multi_kda().into_vec();
            assert_eq!(payments.len(), 2);
        })
        .assert_ok();
}
\`\`\`

## Testing Error Cases

\`\`\`rust
#[test]
fn test_error_on_zero_input() {
    let mut wrapper = BlockchainStateWrapper::new();
    let user = wrapper.create_user_account(&rust_biguint!(0));
    let sc = wrapper.create_sc_account(&rust_biguint!(0), None, my_contract::contract_obj, WASM_PATH);

    wrapper
        .execute_query(&sc, |sc| {
            let _ = sc.sum_sc_result(managed_biguint!(0), managed_biguint!(2000));
        })
        .assert_user_error("Non-zero required");
}

#[test]
fn test_payment_rejected() {
    let mut wrapper = BlockchainStateWrapper::new();
    let caller = wrapper.create_user_account(&rust_biguint!(1_000));
    let sc = wrapper.create_sc_account(&rust_biguint!(0), Some(&caller), my_contract::contract_obj, WASM_PATH);

    // Transaction reverted — balances unchanged
    wrapper
        .execute_tx(&caller, &sc, &rust_biguint!(1_000), |sc| {
            sc.reject_payment();
        })
        .assert_user_error("No payment allowed!");

    wrapper.check_klv_balance(&caller, &rust_biguint!(1_000));
}
\`\`\`

## Testing Storage Revert on Panic

\`\`\`rust
#[test]
fn storage_revert_on_error_test() {
    let mut wrapper = BlockchainStateWrapper::new();
    let user = wrapper.create_user_account(&rust_biguint!(0));
    let sc = wrapper.create_sc_account(&rust_biguint!(0), None, my_contract::contract_obj, WASM_PATH);

    wrapper.execute_tx(&user, &sc, &rust_biguint!(0), |sc| { sc.init(); }).assert_ok();

    // This tx panics — ALL storage changes inside must be reverted
    wrapper
        .execute_tx(&user, &sc, &rust_biguint!(0), |sc| {
            sc.add(managed_biguint!(50));   // This change is reverted
            sc.panic();                     // Triggers revert
        })
        .assert_user_error("Oh no!");

    // Value should still be the initial one, not 51
    wrapper
        .execute_query(&sc, |sc| {
            assert_eq!(sc.total_value().get(), managed_biguint!(1));
        })
        .assert_ok();
}
\`\`\`

## Testing Blockchain State

\`\`\`rust
#[test]
fn blockchain_state_test() {
    let mut wrapper = BlockchainStateWrapper::new();
    let sc = wrapper.create_sc_account(&rust_biguint!(0), None, my_contract::contract_obj, WASM_PATH);

    wrapper.set_block_epoch(10);
    wrapper.set_block_nonce(20);
    wrapper.set_block_timestamp(30);

    wrapper
        .execute_query(&sc, |sc| {
            assert_eq!(sc.get_block_epoch(), 10);
            assert_eq!(sc.get_block_nonce(), 20);
            assert_eq!(sc.get_block_timestamp(), 30);
        })
        .assert_ok();
}
\`\`\`

## Whitebox Style (WhiteboxContract)

\`\`\`rust
#[test]
fn st_whitebox() {
    let mut world = world();
    let contract_wb = WhiteboxContract::new("sc:my-contract", my_contract::contract_obj);
    let code = world.code_expression("kleversc:output/my-contract.kleversc.json");

    world
        .set_state_step(
            SetStateStep::new()
                .put_account("address:owner", Account::new().nonce(1))
                .new_address("address:owner", 2, "sc:my-contract"),
        )
        .whitebox_deploy(
            &contract_wb,
            ScDeployStep::new().from("address:owner").code(code),
            |sc| { sc.init(5u32.into()); },
        )
        .whitebox_query(&contract_wb, |sc| {
            assert_eq!(sc.sum().get(), 5u32);
        })
        .whitebox_call(
            &contract_wb,
            ScCallStep::new().from("address:owner"),
            |sc| sc.add(3u32.into()),
        )
        .check_state_step(
            CheckStateStep::new()
                .put_account("sc:my-contract", CheckAccount::new().check_storage("str:sum", "8")),
        );
}
\`\`\``,
    {
      title: 'Whitebox Testing with BlockchainStateWrapper',
      description:
        'Full guide to whitebox testing: payments, KDA transfers, NFTs, error cases, storage revert, and blockchain state manipulation',
      tags: [
        'testing',
        'whitebox',
        'BlockchainStateWrapper',
        'execute_tx',
        'execute_query',
        'kda',
        'payments',
        'nft',
        'revert',
      ],
      language: 'rust',
      relevanceScore: 0.96,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),
];

export default whiteboxTestsKnowledge;
