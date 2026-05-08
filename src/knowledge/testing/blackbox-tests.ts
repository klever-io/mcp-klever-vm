import { createKnowledgeEntry, KnowledgeEntry } from '../types.js';

export const blackboxTestsKnowledge: KnowledgeEntry[] = [
  createKnowledgeEntry(
    'code_example',
    `# Blackbox Testing with ScenarioWorld (Modern API)

The modern blackbox test API uses \`ScenarioWorld\` with a fluent \`.tx()\` / \`.query()\` builder. This is the **recommended approach** for new contracts.

## When to Use
- Full integration tests with real blockchain simulation
- Testing deploy, upgrade, cross-contract calls
- Generating scenario trace files (\`.scen.json\`)
- Most readable and type-safe test approach

## Setup

\`\`\`rust
use klever_sc_scenario::imports::*;
use my_contract::*;  // imports your contract + proxy

const OWNER_ADDRESS: TestAddress = TestAddress::new("owner");
const OTHER_ADDRESS: TestAddress = TestAddress::new("other");
const USER_ADDRESS: TestAddress = TestAddress::new("user");
const SC_ADDRESS: TestSCAddress = TestSCAddress::new("my-contract");
const CODE_PATH: KleverscPath = KleverscPath::new("output/my-contract.kleversc.json");
const TOKEN_ID: TestTokenIdentifier = TestTokenIdentifier::new("TOKEN-abc123");

fn world() -> ScenarioWorld {
    let mut blockchain = ScenarioWorld::new();
    blockchain.register_contract(CODE_PATH, my_contract::ContractBuilder);
    blockchain
}
\`\`\`

## Setting Up Accounts

\`\`\`rust
world
    .account(OWNER_ADDRESS)
    .nonce(1)
    .balance(100)          // KLV balance
    .account(OTHER_ADDRESS)
    .nonce(2)
    .balance(300)
    .kda_balance(TOKEN_ID, 500)    // Fungible token balance
    .commit();             // commit() persists to blockchain state
\`\`\`

## Deploying a Contract

\`\`\`rust
let new_address = world
    .tx()
    .from(OWNER_ADDRESS)
    .typed(my_contract_proxy::MyContractProxy)
    .init(5u32)                  // calls #[init] with arg
    .code(CODE_PATH)
    .new_address(SC_ADDRESS)     // pin the resulting address
    .returns(ReturnsNewAddress)
    .run();

assert_eq!(new_address, SC_ADDRESS.to_address());
\`\`\`

## Querying a Contract (Read-Only)

\`\`\`rust
// Assert expected value inline
world
    .query()
    .to(SC_ADDRESS)
    .typed(my_contract_proxy::MyContractProxy)
    .sum()
    .returns(ExpectValue(5u32))
    .run();

// Or capture the return value
let value = world
    .query()
    .to(SC_ADDRESS)
    .typed(my_contract_proxy::MyContractProxy)
    .sum()
    .returns(ReturnsResultUnmanaged)
    .run();
assert_eq!(value, RustBigUint::from(5u32));
\`\`\`

## Calling an Endpoint

\`\`\`rust
world
    .tx()
    .from(OWNER_ADDRESS)
    .to(SC_ADDRESS)
    .typed(my_contract_proxy::MyContractProxy)
    .add(1u32)
    .run();
\`\`\`

## Checking Storage After a Call

\`\`\`rust
world
    .check_account(SC_ADDRESS)
    .check_storage("str:sum", "6");
\`\`\`

Or use the step-style:
\`\`\`rust
world.check_state_step(
    CheckStateStep::new()
        .put_account(OWNER_ADDRESS, CheckAccount::new())
        .put_account(SC_ADDRESS, CheckAccount::new().check_storage("str:sum", "6")),
);
\`\`\`

## Testing Multi-Value Return

\`\`\`rust
// Assert inline
world
    .tx()
    .from(OTHER_ADDRESS)
    .to(SC_ADDRESS)
    .typed(my_contract_proxy::MyContractProxy)
    .multi_return(1u32)
    .returns(ExpectValue(MultiValue2((1u32, 2u32))))
    .run();

// Capture and assert
let value = world
    .tx()
    .from(OTHER_ADDRESS)
    .to(SC_ADDRESS)
    .typed(my_contract_proxy::MyContractProxy)
    .multi_return(1u32)
    .returns(ReturnsResultUnmanaged)
    .run();
assert_eq!(value, MultiValue2((1u32, 2u32)));
\`\`\`

## Testing Upgrade

\`\`\`rust
world
    .tx()
    .from(OWNER_ADDRESS)
    .to(SC_ADDRESS)
    .typed(my_contract_proxy::MyContractProxy)
    .upgrade(100u64)
    .code(CODE_PATH)
    .run();

world
    .check_account(SC_ADDRESS)
    .check_storage("str:sum", "100");
\`\`\`

## Generating a Scenario Trace

\`\`\`rust
world.start_trace();          // start recording before steps

// ... perform tx, query, check_account calls ...

world.write_scenario_trace("trace1.scen.json");  // saves a replayable .scen.json
\`\`\`

## NFT Balance in Account Setup

\`\`\`rust
world
    .account(USER_ADDRESS)
    .nonce(3)
    .balance(50)
    .kda_nft_balance(TOKEN_ID, 2u64, 1u64, ())   // (token, nonce, amount, attributes)
    .commit();
\`\`\`

## Complete Test Example

\`\`\`rust
#[test]
fn full_lifecycle_test() {
    let mut world = world();

    world.start_trace();

    world
        .account(OWNER_ADDRESS).nonce(1).balance(100)
        .account(OTHER_ADDRESS).nonce(2).balance(300).kda_balance(TOKEN_ID, 500)
        .commit();

    // Deploy
    world
        .tx()
        .from(OWNER_ADDRESS)
        .typed(my_contract_proxy::MyContractProxy)
        .init(5u32)
        .code(CODE_PATH)
        .new_address(SC_ADDRESS)
        .run();

    // Query initial state
    world
        .query()
        .to(SC_ADDRESS)
        .typed(my_contract_proxy::MyContractProxy)
        .sum()
        .returns(ExpectValue(5u32))
        .run();

    // Call add
    world
        .tx()
        .from(OWNER_ADDRESS)
        .to(SC_ADDRESS)
        .typed(my_contract_proxy::MyContractProxy)
        .add(1u32)
        .run();

    // Verify storage
    world.check_account(SC_ADDRESS).check_storage("str:sum", "6");

    world.write_scenario_trace("scenarios/trace1.scen.json");
}
\`\`\``,
    {
      title: 'Blackbox Testing with ScenarioWorld (Modern API)',
      description:
        'Modern recommended approach for blackbox contract testing using ScenarioWorld with .tx()/.query() fluent builder, typed proxy, and scenario trace generation',
      tags: [
        'testing',
        'blackbox',
        'ScenarioWorld',
        'tx',
        'query',
        'proxy',
        'deploy',
        'upgrade',
        'trace',
        'modern',
      ],
      language: 'rust',
      relevanceScore: 0.97,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),

  createKnowledgeEntry(
    'code_example',
    `# Blackbox Testing with Raw Steps (Step-Based API)

The raw steps API gives full control over each blockchain action using explicit step objects. Useful when you need precise control or are migrating from scenario JSON files.

## Setup

\`\`\`rust
use klever_sc_scenario::imports::*;

const SC_PATH: &str = "kleversc:output/my-contract.kleversc.json";

fn world() -> ScenarioWorld {
    let mut blockchain = ScenarioWorld::new();
    blockchain.register_contract(SC_PATH, my_contract::ContractBuilder);
    blockchain
}
\`\`\`

## Deploy with SetStateStep + ScDeployStep

\`\`\`rust
#[test]
fn deploy_raw_test() {
    let mut world = world();
    let code = world.code_expression(SC_PATH);

    world
        .set_state_step(
            SetStateStep::new()
                .put_account("address:owner", Account::new().nonce(1))
                .new_address("address:owner", 2, "sc:my-contract"),
        )
        .sc_deploy(
            ScDeployStep::new()
                .from("address:owner")
                .code(code)
                .argument("5")                       // constructor arg (raw)
                .gas_limit("5,000,000")
                .expect(TxExpect::ok().no_result()),  // assert no return value
        );
}
\`\`\`

## Query with ScQueryStep

\`\`\`rust
world.sc_query(
    ScQueryStep::new()
        .to("sc:my-contract")
        .function("getSum")
        .expect(TxExpect::ok().result("5")),     // assert return = 5
);
\`\`\`

## Call with ScCallStep

\`\`\`rust
world.sc_call(
    ScCallStep::new()
        .from("address:owner")
        .to("sc:my-contract")
        .function("add")
        .argument("3")
        .expect(TxExpect::ok().no_result()),
);
\`\`\`

## Check State with CheckStateStep

\`\`\`rust
world.check_state_step(
    CheckStateStep::new()
        .put_account("address:owner", CheckAccount::new())
        .put_account(
            "sc:my-contract",
            CheckAccount::new().check_storage("str:sum", "8"),
        ),
);
\`\`\`

## Multi-Token Payment in ScCallStep

\`\`\`rust
world.sc_call(
    ScCallStep::new()
        .from("address:an-account")
        .to("sc:my-contract")
        .function("echo_call_value")
        .kda_transfer("str:TOK-000001", 0, "100")   // fungible token
        .kda_transfer("str:TOK-000002", 0, "400")
        .expect(
            TxExpect::ok()
                .result("0")
                .result("nested:str:TOK-000001|u64:0|biguint:100|nested:str:TOK-000002|u64:0|biguint:400"),
        ),
);
\`\`\`

## Contract Upgrade via ScCallStep

\`\`\`rust
world.sc_call(
    ScCallStep::new()
        .from("address:owner")
        .to("sc:my-contract")
        .function("upgradeContract")
        .argument(&new_code)         // new wasm code
        .argument("0x0502")          // codeMetadata
        .argument("8")               // new constructor arg
        .expect(TxExpect::ok().no_result()),
);
\`\`\`

## Deploy and Capture Address

\`\`\`rust
use klever_sc_scenario::api::StaticApi;

let owner_address = "address:owner";
let code = world.code_expression(SC_PATH);
let mut contract = ContractInfo::<my_contract::Proxy<StaticApi>>::new("sc:my-contract");

world
    .sc_deploy_use_result(
        ScDeployStep::new()
            .from(owner_address)
            .code(code)
            .call(contract.init()),
        |address, tr: TypedResponse<String>| {
            assert_eq!(address, contract.to_address());
            assert_eq!(tr.result.unwrap(), "constructor-result");
        },
    );
\`\`\`

## Account Setup with KDA Balances

\`\`\`rust
world.set_state_step(
    SetStateStep::new()
        .put_account(
            "address:user",
            Account::new()
                .balance("10000")
                .kda_balance("str:TOK-000001", "1000")
                .kda_nft_balance("str:NFT-abc123", 5u32, 10u32, Option::<()>::None),
        )
        .put_account("sc:my-contract", Account::new().code(code)),
);
\`\`\``,
    {
      title: 'Blackbox Testing with Raw Step Objects',
      description:
        'Step-based blackbox testing API using SetStateStep, ScDeployStep, ScCallStep, ScQueryStep, and CheckStateStep for precise blockchain simulation',
      tags: [
        'testing',
        'blackbox',
        'raw-steps',
        'ScDeployStep',
        'ScCallStep',
        'ScQueryStep',
        'CheckStateStep',
        'SetStateStep',
        'kda-transfer',
      ],
      language: 'rust',
      relevanceScore: 0.92,
      contractType: 'any',
      author: 'klever-mcp',
    }
  ),
];

export default blackboxTestsKnowledge;
