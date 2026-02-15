import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { ContextService } from '../context/service.js';
import { QueryContextSchema, ContextPayloadSchema } from '../types/index.js';
import { VERSION, GIT_SHA } from '../version.js';
import { KNOWLEDGE_CATEGORIES } from './resources.js';
import { KleverChainClient } from '../chain/index.js';
import type { KleverNetwork, VMQueryRequest } from '../chain/types.js';

export type ServerProfile = 'local' | 'public';

const VALID_NETWORKS = new Set<string>(['mainnet', 'testnet', 'devnet', 'local']);

function validateNetwork(network: string | undefined): KleverNetwork | undefined {
  if (network === undefined) return undefined;
  if (!VALID_NETWORKS.has(network)) {
    throw new Error(
      `Invalid network "${network}". Valid options: mainnet, testnet, devnet, local.`
    );
  }
  return network as KleverNetwork;
}

interface ExecError {
  message: string;
  stderr: string;
  stdout: string;
}

function toExecError(error: unknown): ExecError {
  if (error instanceof Error) {
    const e = error as Error & { stderr?: string; stdout?: string };
    return {
      message: e.message,
      stderr: e.stderr || '',
      stdout: e.stdout || '',
    };
  }
  return { message: String(error), stderr: '', stdout: '' };
}

export class KleverMCPServer {
  private server: Server;
  private profile: ServerProfile;
  private chainClient: KleverChainClient;

  constructor(
    private contextService: ContextService,
    profile: ServerProfile = 'local',
    chainClient?: KleverChainClient
  ) {
    this.profile = profile;
    this.chainClient = chainClient || new KleverChainClient();
    this.server = new Server(
      {
        name: 'klever-vm-mcp',
        version: `${VERSION}+${GIT_SHA}`,
      },
      {
        capabilities: {
          tools: {},
          prompts: {},
          resources: {},
        },
      }
    );

    this.setupHandlers();
  }

  private getReadOnlyToolDefinitions() {
    return [
      {
        name: 'query_context',
        description:
          'Search the Klever VM knowledge base for smart contract development context. Returns structured JSON with matching entries, scores, and pagination. Use this for precise filtering by type or tags; use search_documentation for human-readable "how do I..." answers.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            query: {
              type: 'string',
              description:
                'Free-text search query. Use Klever-specific terms for best results (e.g. "storage mapper SingleValueMapper", "payable endpoint KLV", "deploy contract testnet").',
            },
            types: {
              type: 'array',
              items: {
                type: 'string',
                enum: [
                  'code_example',
                  'best_practice',
                  'security_tip',
                  'optimization',
                  'documentation',
                  'error_pattern',
                  'deployment_tool',
                  'runtime_behavior',
                ],
              },
              description:
                'Filter results by context type. Omit to search all types. Common combinations: ["code_example", "documentation"] for learning, ["error_pattern"] for debugging, ["security_tip", "best_practice"] for reviews.',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description:
                'Filter by tags (e.g. ["storage", "mapper"], ["tokens", "KLV"], ["events"]). Tags are matched with OR logic — any matching tag includes the entry.',
            },
            contractType: {
              type: 'string',
              description:
                'Filter by contract type (e.g. "token", "nft", "defi", "dao"). Only returns entries tagged for this contract category.',
            },
            limit: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 10,
              description: 'Maximum number of results to return (1-100). Default: 10.',
            },
            offset: {
              type: 'integer',
              minimum: 0,
              default: 0,
              description:
                'Number of results to skip for pagination. Use with limit to page through results. Default: 0.',
            },
          },
        },
        annotations: {
          title: 'Query Knowledge Base',
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false,
        },
      },
      {
        name: 'get_context',
        description:
          'Retrieve a single knowledge base entry by its unique ID. Returns the full entry including content, metadata, tags, and related context IDs. Use this after query_context or find_similar to get complete details for a specific entry.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            id: {
              type: 'string',
              description:
                'The unique context ID (UUID format). Obtain IDs from query_context or find_similar results.',
            },
          },
          required: ['id'],
        },
        annotations: {
          title: 'Get Context by ID',
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false,
        },
      },
      {
        name: 'find_similar',
        description:
          'Find knowledge base entries similar to a given entry by comparing tags and content. Returns related contexts ranked by similarity score. Useful for discovering related patterns, examples, or documentation after finding one relevant entry.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            id: {
              type: 'string',
              description:
                'The context ID to find similar entries for. Obtain from query_context or get_context results.',
            },
            limit: {
              type: 'integer',
              minimum: 1,
              default: 5,
              description:
                'Maximum number of similar entries to return. Typical range is 1-20; higher values may be slower. Default: 5.',
            },
          },
          required: ['id'],
        },
        annotations: {
          title: 'Find Similar Contexts',
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false,
        },
      },
      {
        name: 'get_knowledge_stats',
        description:
          'Get summary statistics of the Klever VM knowledge base. Returns total entry count, counts broken down by context type (code_example, best_practice, security_tip, etc.), and a sample entry title for each type. Useful for understanding what knowledge is available before querying.',
        inputSchema: {
          type: 'object' as const,
          properties: {},
        },
        annotations: {
          title: 'Knowledge Base Stats',
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false,
        },
      },
      {
        name: 'enhance_with_context',
        description:
          'Augment a natural-language query with relevant Klever VM knowledge base context. Extracts Klever-specific keywords, finds matching entries, and returns the original query combined with relevant code examples and documentation in markdown. Use this to enrich a user prompt before answering Klever development questions.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            query: {
              type: 'string',
              description:
                'The user\'s natural-language question or prompt to enhance (e.g. "How do I handle KLV payments in my contract?").',
            },
            autoInclude: {
              type: 'boolean',
              default: true,
              description:
                'When true (default), automatically appends the most relevant knowledge base entries to the response. Set to false to only return metadata without injecting context.',
            },
          },
          required: ['query'],
        },
        annotations: {
          title: 'Enhance Query with Context',
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false,
        },
      },
      {
        name: 'search_documentation',
        description:
          'Search Klever VM documentation and knowledge base. Returns human-readable markdown with titles, descriptions, and code snippets. Optimized for "how do I..." questions. Use this instead of query_context when you need formatted developer documentation.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            query: {
              type: 'string',
              description:
                'Search query in natural language (e.g. "how to use storage mappers", "deploy contract to testnet", "handle KDA token transfers").',
            },
            category: {
              type: 'string',
              enum: [...KNOWLEDGE_CATEGORIES],
              description:
                'Narrow results to a specific knowledge category. Available: core, storage, events, tokens, modules, tools, scripts, examples, errors, best-practices, documentation.',
            },
          },
          required: ['query'],
        },
        annotations: {
          title: 'Search Documentation',
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false,
        },
      },
      {
        name: 'analyze_contract',
        description:
          'Analyze Klever smart contract Rust source code for common issues. Checks for missing imports, missing #[klever_sc::contract] macro, missing endpoint annotations, payable handlers without call_value usage, storage mappers without #[storage_mapper], and missing event definitions. Returns findings with severity (error/warning/info) and links to relevant knowledge base entries.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            sourceCode: {
              type: 'string',
              description:
                'The full Rust source code of the Klever smart contract to analyze. Must be valid Rust code using klever_sc imports.',
            },
            contractName: {
              type: 'string',
              description:
                'Human-readable name for the contract (used in output labeling). Defaults to "contract" if omitted.',
            },
          },
          required: ['sourceCode'],
        },
        annotations: {
          title: 'Analyze Contract',
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false,
        },
      },
    ];
  }

  private getChainReadToolDefinitions() {
    const networkDesc = `Network to query. Options: "mainnet", "testnet", "devnet", "local". Defaults to server default (${this.chainClient.getDefaultNetwork()}).`;
    return [
      {
        name: 'get_balance',
        description:
          'Get the KLV or KDA token balance for a Klever blockchain address. Returns the balance in the smallest unit (for KLV: 1 KLV = 1,000,000 units with 6 decimal places). Optionally specify an asset ID to query a specific KDA token balance instead of KLV.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            address: {
              type: 'string',
              description: 'Klever address (klv1... bech32 format).',
            },
            assetId: {
              type: 'string',
              description:
                'Optional KDA token ID (e.g. "USDT-A1B2", "LPKLVKFI-3I0N"). Omit for KLV balance.',
            },
            network: { type: 'string', description: networkDesc },
          },
          required: ['address'],
        },
        annotations: {
          title: 'Get Balance',
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
      },
      {
        name: 'get_account',
        description:
          'Get full account details for a Klever blockchain address including nonce, balance, frozen balance, allowance, and permissions. Use this when you need comprehensive account state beyond just the balance.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            address: {
              type: 'string',
              description: 'Klever address (klv1... bech32 format).',
            },
            network: { type: 'string', description: networkDesc },
          },
          required: ['address'],
        },
        annotations: {
          title: 'Get Account',
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
      },
      {
        name: 'get_asset_info',
        description:
          'Get complete properties and configuration for any asset on the Klever blockchain (KLV, KFI, KDA tokens, NFT collections). Returns supply info, permissions (CanMint, CanBurn, etc.), roles, precision, and metadata. Note: string fields like ID, Name, Ticker are base64-encoded in the raw response.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            assetId: {
              type: 'string',
              description:
                'Asset identifier (e.g. "KLV", "KFI", "USDT-A1B2", "MYNFT-XY78").',
            },
            network: { type: 'string', description: networkDesc },
          },
          required: ['assetId'],
        },
        annotations: {
          title: 'Get Asset Info',
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
      },
      {
        name: 'query_sc',
        description:
          'Execute a read-only query against a Klever smart contract (VM view call). Returns the contract function result as base64-encoded return data. Arguments must be base64-encoded. Use this to read contract state without modifying it.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            scAddress: {
              type: 'string',
              description: 'Smart contract address (klv1... bech32 format).',
            },
            funcName: {
              type: 'string',
              description:
                'Function name to call (must be a #[view] function on the contract).',
            },
            args: {
              type: 'array',
              items: { type: 'string' },
              description:
                'Optional base64-encoded arguments. For addresses, encode the hex-decoded bech32 bytes. For numbers, use big-endian byte encoding.',
            },
            network: { type: 'string', description: networkDesc },
          },
          required: ['scAddress', 'funcName'],
        },
        annotations: {
          title: 'Query Smart Contract',
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
      },
      {
        name: 'get_transaction',
        description:
          'Get transaction details by hash from the Klever blockchain. Returns sender, receiver, status, block info, contracts, and receipts. Uses the API proxy for indexed data.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            hash: {
              type: 'string',
              description: 'Transaction hash (hex string).',
            },
            network: { type: 'string', description: networkDesc },
          },
          required: ['hash'],
        },
        annotations: {
          title: 'Get Transaction',
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
      },
      {
        name: 'get_block',
        description:
          'Get block information from the Klever blockchain by nonce (block number). If no nonce is provided, returns the latest block. Returns hash, timestamp, proposer, number of transactions, and other block metadata.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            nonce: {
              type: 'integer',
              minimum: 0,
              description:
                'Block number (nonce). Omit to get the latest block.',
            },
            network: { type: 'string', description: networkDesc },
          },
        },
        annotations: {
          title: 'Get Block',
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
      },
      {
        name: 'list_validators',
        description:
          'List active validators on the Klever blockchain network. Returns validator addresses, names, commission rates, delegation info, and staking amounts.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            network: { type: 'string', description: networkDesc },
          },
        },
        annotations: {
          title: 'List Validators',
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
      },
    ];
  }

  private getChainWriteToolDefinitions() {
    const networkDesc = `Network to use. Options: "mainnet", "testnet", "devnet", "local". Defaults to server default (${this.chainClient.getDefaultNetwork()}).`;
    return [
      {
        name: 'send_transfer',
        description:
          'Build an unsigned KLV or KDA token transfer transaction on the Klever blockchain. Returns the unsigned transaction data and hash for client-side signing. The MCP server NEVER handles private keys — signing must be done externally.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            sender: {
              type: 'string',
              description: 'Sender address (klv1... bech32 format).',
            },
            receiver: {
              type: 'string',
              description: 'Receiver address (klv1... bech32 format).',
            },
            amount: {
              type: 'integer',
              minimum: 1,
              description:
                'Amount in the smallest unit. For KLV: 1 KLV = 1,000,000 units (6 decimals). Example: to send 10 KLV, use 10000000.',
            },
            assetId: {
              type: 'string',
              description:
                'Optional KDA token ID for non-KLV transfers (e.g. "USDT-A1B2"). Omit for KLV.',
            },
            network: { type: 'string', description: networkDesc },
          },
          required: ['sender', 'receiver', 'amount'],
        },
        annotations: {
          title: 'Build Transfer Transaction',
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
      },
      {
        name: 'deploy_sc',
        description:
          'Build an unsigned smart contract deployment transaction for the Klever blockchain. Provide the WASM bytecode as a hex string. Returns the unsigned transaction for client-side signing. The MCP server NEVER handles private keys.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            sender: {
              type: 'string',
              description: 'Deployer address (klv1... bech32 format).',
            },
            wasmHex: {
              type: 'string',
              description:
                'Smart contract WASM bytecode as a hex-encoded string.',
            },
            initArgs: {
              type: 'array',
              items: { type: 'string' },
              description:
                'Optional base64-encoded init arguments for the contract constructor.',
            },
            network: { type: 'string', description: networkDesc },
          },
          required: ['sender', 'wasmHex'],
        },
        annotations: {
          title: 'Build Deploy SC Transaction',
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
      },
      {
        name: 'invoke_sc',
        description:
          'Build an unsigned smart contract invocation transaction on the Klever blockchain. Calls a state-changing endpoint on a deployed contract. Returns the unsigned transaction for client-side signing. For read-only calls, use query_sc instead.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            sender: {
              type: 'string',
              description: 'Caller address (klv1... bech32 format).',
            },
            scAddress: {
              type: 'string',
              description: 'Smart contract address (klv1... bech32 format).',
            },
            funcName: {
              type: 'string',
              description: 'Endpoint function name to invoke.',
            },
            args: {
              type: 'array',
              items: { type: 'string' },
              description: 'Optional base64-encoded arguments.',
            },
            value: {
              type: 'integer',
              minimum: 0,
              description:
                'Optional KLV amount to send with the call (smallest unit). Required for payable endpoints.',
            },
            network: { type: 'string', description: networkDesc },
          },
          required: ['sender', 'scAddress', 'funcName'],
        },
        annotations: {
          title: 'Build Invoke SC Transaction',
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
      },
      {
        name: 'freeze_klv',
        description:
          'Build an unsigned Freeze KLV transaction on the Klever blockchain. Freezing KLV provides energy/bandwidth for network operations and enables staking rewards. Returns the unsigned transaction for client-side signing.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            sender: {
              type: 'string',
              description: 'Address to freeze from (klv1... bech32 format).',
            },
            amount: {
              type: 'integer',
              minimum: 1,
              description:
                'Amount of KLV to freeze in the smallest unit (1 KLV = 1,000,000 units).',
            },
            network: { type: 'string', description: networkDesc },
          },
          required: ['sender', 'amount'],
        },
        annotations: {
          title: 'Build Freeze KLV Transaction',
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
      },
    ];
  }

  private async getPublicModeToolDefinitions() {
    const { projectInitToolDefinition, addHelperScriptsToolDefinition } = await import(
      '../utils/project-init-script.js'
    );
    const publicNote =
      ' NOTE: In public profile, this tool returns a project template JSON and does not perform any filesystem changes.';
    const publicAnnotations = {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    };
    return [
      {
        ...projectInitToolDefinition,
        description: projectInitToolDefinition.description + publicNote,
        annotations: { ...projectInitToolDefinition.annotations, ...publicAnnotations },
      },
      {
        ...addHelperScriptsToolDefinition,
        description: addHelperScriptsToolDefinition.description + publicNote,
        annotations: { ...addHelperScriptsToolDefinition.annotations, ...publicAnnotations },
      },
    ];
  }

  private async getLocalOnlyToolDefinitions() {
    const { projectInitToolDefinition, addHelperScriptsToolDefinition } = await import(
      '../utils/project-init-script.js'
    );
    const { checkSdkStatusToolDefinition, installKleverSdkToolDefinition } = await import(
      '../utils/sdk-install-script.js'
    );
    return [
      {
        name: 'add_context',
        description:
          'Add a new knowledge entry to the Klever VM context store. Use this to save code examples, best practices, security tips, or documentation that can later be retrieved via query_context or search_documentation. Returns the generated ID of the new entry.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            type: {
              type: 'string',
              enum: [
                'code_example',
                'best_practice',
                'security_tip',
                'optimization',
                'documentation',
                'error_pattern',
                'deployment_tool',
                'runtime_behavior',
              ],
              description:
                'The category of this knowledge entry. Choose the most specific type: "code_example" for Rust snippets, "best_practice" for recommended patterns, "security_tip" for vulnerability guidance, "error_pattern" for known error solutions.',
            },
            content: {
              type: 'string',
              description:
                'The main content body — typically Rust source code, a CLI command, or a detailed explanation. For code, include the full working snippet.',
            },
            metadata: {
              type: 'object',
              description:
                'Entry metadata including title, tags, and categorization. At minimum, provide a title.',
              properties: {
                title: {
                  type: 'string',
                  description:
                    'A concise, descriptive title (e.g. "SingleValueMapper Storage Pattern", "KLV Payment Handling").',
                },
                description: {
                  type: 'string',
                  description:
                    'A 1-2 sentence summary of what this entry covers and when to use it.',
                },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  description:
                    'Searchable tags for discovery (e.g. ["storage", "mapper", "singlemapper"], ["tokens", "KLV", "payment"]). Use lowercase.',
                },
                contractType: {
                  type: 'string',
                  description:
                    'The contract category this applies to (e.g. "token", "nft", "defi", "dao"). Omit if generally applicable.',
                },
                author: {
                  type: 'string',
                  description: 'Author name or identifier for attribution.',
                },
              },
              required: ['title'],
            },
          },
          required: ['type', 'content', 'metadata'],
        },
        annotations: {
          title: 'Add Knowledge Entry',
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false,
        },
      },
      projectInitToolDefinition,
      addHelperScriptsToolDefinition,
      checkSdkStatusToolDefinition,
      installKleverSdkToolDefinition,
    ];
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Array<Record<string, unknown>> = [
        ...this.getReadOnlyToolDefinitions(),
        ...this.getChainReadToolDefinitions(),
      ];

      if (this.profile === 'public') {
        const publicTools = await this.getPublicModeToolDefinitions();
        tools.push(...publicTools);
      } else {
        tools.push(...this.getChainWriteToolDefinitions());
        const localTools = await this.getLocalOnlyToolDefinitions();
        tools.push(...localTools);
      }

      return { tools };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async request => {
      const { name, arguments: args } = request.params;

      // Debug logging to stderr
      console.error(`[MCP] Tool called: ${name}`, JSON.stringify(args));

      // Block local-only tools in public profile
      const localOnlyTools = [
        'add_context',
        'check_sdk_status',
        'install_klever_sdk',
        'send_transfer',
        'deploy_sc',
        'invoke_sc',
        'freeze_klv',
      ];
      if (this.profile === 'public' && localOnlyTools.includes(name)) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: false,
                  error: `Tool "${name}" is not available in public mode. Public mode does not allow local-only, write, or environment-modifying tools.`,
                  suggestion:
                    'Use query_context, search_documentation, or analyze_contract to explore the knowledge base. On-chain read tools (get_balance, get_account, get_asset_info, query_sc, get_transaction, get_block, list_validators) are available in public mode.',
                  availableTools: [
                    'query_context',
                    'get_context',
                    'find_similar',
                    'get_knowledge_stats',
                    'enhance_with_context',
                    'search_documentation',
                    'analyze_contract',
                    'get_balance',
                    'get_account',
                    'get_asset_info',
                    'query_sc',
                    'get_transaction',
                    'get_block',
                    'list_validators',
                    'init_klever_project',
                    'add_helper_scripts',
                  ],
                },
                null,
                2
              ),
            },
          ],
        };
      }

      try {
        switch (name) {
          case 'query_context': {
            const params = QueryContextSchema.parse(args);
            console.error(`[MCP] Query params:`, JSON.stringify(params));
            const result = await this.contextService.query(params);
            console.error(
              `[MCP] Query returned ${result.results.length} out of ${result.total} total results`
            );

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      success: true,
                      results: result.results,
                      total: result.total,
                      pagination: {
                        offset: result.offset,
                        limit: result.limit,
                      },
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          case 'add_context': {
            const payload = ContextPayloadSchema.parse(args);
            const id = await this.contextService.ingest(payload);

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      success: true,
                      id,
                      message: 'Context added successfully',
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          case 'get_context': {
            const { id } = args as { id: string };
            const context = await this.contextService.retrieve(id);

            if (!context) {
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(
                      {
                        success: false,
                        error: `Context with ID "${id}" not found. The ID may be invalid or the entry may have been deleted.`,
                        suggestion:
                          'Use query_context to search for entries and obtain valid IDs from the results. Each result includes an "id" field you can pass to get_context.',
                      },
                      null,
                      2
                    ),
                  },
                ],
              };
            }

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      success: true,
                      data: context,
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          case 'find_similar': {
            const { id, limit = 5 } = args as { id: string; limit?: number };
            const similar = await this.contextService.findSimilar(id, limit);

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      success: true,
                      data: similar,
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          case 'get_knowledge_stats': {
            // Get counts by type
            const types = [
              'code_example',
              'best_practice',
              'security_tip',
              'optimization',
              'documentation',
              'error_pattern',
              'deployment_tool',
              'runtime_behavior',
            ] as const;
            const stats: {
              total: number;
              byType: Record<string, number>;
              examples: Array<{ type: string; title: string; tags: string[] }>;
            } = {
              total: 0,
              byType: {},
              examples: [],
            };

            // Get total count
            const allContexts = await this.contextService.query({ limit: 1000, offset: 0 });
            stats.total = allContexts.total;

            // Count by type
            for (const type of types) {
              const typeQuery = await this.contextService.query({
                types: [type],
                limit: 100,
                offset: 0,
              });
              if (typeQuery.total > 0) {
                stats.byType[type] = typeQuery.total;
                // Add first example of each type
                if (typeQuery.results.length > 0) {
                  stats.examples.push({
                    type,
                    title: typeQuery.results[0].metadata.title,
                    tags: typeQuery.results[0].metadata.tags,
                  });
                }
              }
            }

            console.error(`[MCP] Knowledge stats: ${stats.total} total contexts`);

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      success: true,
                      stats,
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          case 'enhance_with_context': {
            const { query, autoInclude = true } = args as { query: string; autoInclude?: boolean };

            console.error(`[MCP] Enhancing query with context: "${query}"`);

            // Extract keywords for better matching
            const keywords = this.extractKeywords(query);
            console.error(`[MCP] Extracted keywords: ${keywords.join(', ')}`);

            // Query for relevant contexts
            const searchQuery = keywords.join(' ');
            const result = await this.contextService.query({
              query: searchQuery,
              limit: 3,
              offset: 0,
            });

            console.error(`[MCP] Found ${result.results.length} relevant contexts`);

            // Format the enhanced response
            let enhancedResponse = `Query: "${query}"\n\n`;

            if (result.results.length > 0 && autoInclude) {
              enhancedResponse += '## Relevant Klever VM Context:\n\n';

              for (const ctx of result.results) {
                enhancedResponse += `### ${ctx.metadata.title}\n`;
                if (ctx.metadata.description) {
                  enhancedResponse += `${ctx.metadata.description}\n\n`;
                }
                enhancedResponse += `\`\`\`${ctx.metadata.language || 'rust'}\n${ctx.content}\n\`\`\`\n\n`;
              }

              enhancedResponse += '\n## Original Query:\n' + query;
            }

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      success: true,
                      originalQuery: query,
                      keywords: keywords,
                      contextsFound: result.results.length,
                      enhancedQuery: enhancedResponse,
                      contexts: result.results.map(r => ({
                        id: r.id,
                        type: r.type,
                        title: r.metadata.title,
                        relevance: r.metadata.relevanceScore,
                      })),
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          case 'search_documentation': {
            const { query, category } = args as { query: string; category?: string };
            console.error(`[MCP] Documentation search: "${query}" (category: ${category || 'all'})`);

            const { CATEGORY_TAG_MAP } = await import('./resources.js');

            // Build tag filter from category if provided
            const tags =
              category && KNOWLEDGE_CATEGORIES.includes(category as (typeof KNOWLEDGE_CATEGORIES)[number])
                ? CATEGORY_TAG_MAP[category as keyof typeof CATEGORY_TAG_MAP]
                : undefined;

            const searchResult = await this.contextService.query({
              query,
              tags,
              limit: 10,
              offset: 0,
              includeTotal: false,
            });

            // Re-rank by relevance to the search query
            const ranked = await this.contextService.rankByRelevance(searchResult.results, query);

            // Format as human-readable markdown
            let markdown = `# Documentation Search: "${query}"\n\n`;
            if (category) {
              markdown += `**Category**: ${category}\n\n`;
            }
            markdown += `Found ${ranked.length} result(s).\n\n`;

            for (const entry of ranked) {
              markdown += `## ${entry.metadata.title}\n\n`;
              if (entry.metadata.description) {
                markdown += `${entry.metadata.description}\n\n`;
              }
              const lang = entry.metadata.language || 'rust';
              markdown += `\`\`\`${lang}\n${entry.content}\n\`\`\`\n\n`;
              if (entry.metadata.tags.length > 0) {
                markdown += `**Tags**: ${entry.metadata.tags.join(', ')}\n\n`;
              }
              markdown += '---\n\n';
            }

            return {
              content: [{ type: 'text', text: markdown }],
            };
          }

          case 'analyze_contract': {
            const { sourceCode, contractName } = args as {
              sourceCode: string;
              contractName?: string;
            };
            const label = contractName || 'contract';
            console.error(`[MCP] Analyzing contract: ${label} (${sourceCode.length} chars)`);

            const findings = await this.analyzeContractSource(sourceCode);

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      success: true,
                      contractName: label,
                      totalFindings: findings.length,
                      findings,
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          case 'init_klever_project': {
            if (this.profile === 'public') {
              const { getProjectTemplateFiles } = await import('../utils/project-init-script.js');
              const { name: projectName } = args as { name: string };
              const result = getProjectTemplateFiles(projectName);
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(
                      {
                        success: true,
                        mode: 'template',
                        message: `Project template for "${projectName}" generated`,
                        ...result,
                      },
                      null,
                      2
                    ),
                  },
                ],
              };
            }

            const { execFile } = await import('child_process');
            const { promisify } = await import('util');
            const { writeFile, chmod, access, unlink } = await import('fs/promises');
            const { join } = await import('path');
            const { tmpdir } = await import('os');
            const { createProjectInitScript } = await import('../utils/project-init-script.js');
            const execFileAsync = promisify(execFile);

            const {
              name: projectName,
              template = 'empty',
              noMove = false,
            } = args as {
              name: string;
              template?: string;
              noMove?: boolean;
            };

            console.error(
              `[MCP] Initializing project: ${projectName} with template: ${template}`
            );

            // Create the initialization script
            const scriptContent = createProjectInitScript();
            const scriptPath = join(tmpdir(), `init-klever-${Date.now()}.sh`);

            // Write script to temp file
            await writeFile(scriptPath, scriptContent, 'utf8');
            await chmod(scriptPath, '755');

            // Build command with arguments
            const cmdArgs = ['--name', projectName, '--template', template];
            if (noMove) {
              cmdArgs.push('--no-move');
            }

            console.error(`[MCP] Running: ${scriptPath} ${cmdArgs.join(' ')}`);

            try {
              console.error(`[MCP] Current working directory: ${process.cwd()}`);

              // Check if script exists
              try {
                await access(scriptPath);
                console.error(`[MCP] Script path exists: true`);
              } catch {
                console.error(`[MCP] Script path exists: false`);
              }

              // Execute the script using execFile to safely handle paths with spaces
              const { stdout, stderr } = await execFileAsync('/bin/bash', [scriptPath, ...cmdArgs], {
                cwd: process.cwd(),
                env: { ...process.env },
              });

              console.error(`[MCP] Script stdout length: ${stdout.length}`);
              console.error(`[MCP] Script output: ${stdout}`);
              if (stderr) {
                console.error(`[MCP] Script stderr: ${stderr}`);
              }

              // Clean up temp script
              await unlink(scriptPath);

              // Check if we're in the right directory structure
              const checkResult = await execFileAsync('/bin/bash', [
                '-c',
                'ls -la scripts/ 2>/dev/null || echo "No scripts directory"',
              ]);
              console.error(`[MCP] Scripts directory check: ${checkResult.stdout}`);

              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(
                      {
                        success: true,
                        message: `Project ${projectName} initialized successfully`,
                        output: stdout,
                        workingDirectory: process.cwd(),
                        projectStructure: {
                          directories: ['src/', 'tests/', 'scripts/', 'output/'],
                          scripts: [
                            'scripts/common.sh (shared utilities)',
                            'scripts/build.sh',
                            'scripts/deploy.sh',
                            'scripts/upgrade.sh',
                            'scripts/query.sh',
                            'scripts/test.sh',
                            'scripts/interact.sh',
                          ],
                        },
                        nextSteps: [
                          'Edit src/lib.rs to implement your contract',
                          'Run ./scripts/build.sh to build',
                          'Run ./scripts/deploy.sh to deploy',
                          'Use ./scripts/interact.sh for interactive management',
                        ],
                      },
                      null,
                      2
                    ),
                  },
                ],
              };
            } catch (error: unknown) {
              const err = toExecError(error);
              // Clean up temp script on error
              await unlink(scriptPath).catch(() => {});

              console.error(`[MCP] Project init error: ${err.message}`);
              console.error(`[MCP] Error details:`, err);

              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(
                      {
                        success: false,
                        error: err.message,
                        stderr: err.stderr,
                        stdout: err.stdout,
                        command: `${scriptPath} ${cmdArgs.join(' ')}`,
                        suggestion: 'Please ensure Klever SDK is installed at ~/klever-sdk/',
                      },
                      null,
                      2
                    ),
                  },
                ],
              };
            }
          }

          case 'add_helper_scripts': {
            if (this.profile === 'public') {
              const { getHelperScriptTemplateFiles } = await import(
                '../utils/project-init-script.js'
              );
              const { contractName } = args as { contractName?: string };
              const result = getHelperScriptTemplateFiles(contractName);
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(
                      {
                        success: true,
                        mode: 'template',
                        message: 'Helper script templates generated',
                        ...result,
                      },
                      null,
                      2
                    ),
                  },
                ],
              };
            }

            const { execFile: execFileCb } = await import('child_process');
            const { promisify: promisifyUtil } = await import('util');
            const { writeFile: wf, chmod: ch, unlink: ul } = await import('fs/promises');
            const { join: joinPath } = await import('path');
            const { tmpdir: td } = await import('os');
            const { createHelperScriptsScript } = await import('../utils/project-init-script.js');
            const execFileHelper = promisifyUtil(execFileCb);

            console.error(`[MCP] Adding helper scripts to existing project`);

            // Create the helper scripts generation script
            const helperScriptContent = createHelperScriptsScript();
            const helperScriptPath = joinPath(td(), `add-helper-scripts-${Date.now()}.sh`);

            // Write script to temp file
            await wf(helperScriptPath, helperScriptContent, 'utf8');
            await ch(helperScriptPath, '755');

            console.error(`[MCP] Running: ${helperScriptPath}`);

            try {
              console.error(`[MCP] Current working directory: ${process.cwd()}`);

              // Execute the script using execFile to safely handle paths with spaces
              const { stdout, stderr } = await execFileHelper('/bin/bash', [helperScriptPath], {
                cwd: process.cwd(),
                env: { ...process.env },
              });

              console.error(`[MCP] Script stdout: ${stdout}`);
              if (stderr) {
                console.error(`[MCP] Script stderr: ${stderr}`);
              }

              // Clean up temp script
              await ul(helperScriptPath);

              // Check if scripts were created
              const checkResult = await execFileHelper('/bin/bash', [
                '-c',
                'ls -la scripts/ 2>/dev/null || echo "No scripts directory"',
              ]);
              console.error(`[MCP] Scripts directory check: ${checkResult.stdout}`);

              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(
                      {
                        success: true,
                        message: 'Helper scripts added successfully',
                        output: stdout,
                        workingDirectory: process.cwd(),
                        scriptsAdded: [
                          'scripts/common.sh (shared utilities)',
                          'scripts/build.sh',
                          'scripts/deploy.sh',
                          'scripts/upgrade.sh',
                          'scripts/query.sh',
                          'scripts/test.sh',
                          'scripts/interact.sh',
                        ],
                        nextSteps: [
                          'Run ./scripts/build.sh to build your contract',
                          'Run ./scripts/deploy.sh to deploy',
                          'Use ./scripts/interact.sh for interactive management',
                          'Create .env file for configuration (NETWORK, KEY_FILE)',
                        ],
                      },
                      null,
                      2
                    ),
                  },
                ],
              };
            } catch (error: unknown) {
              const err = toExecError(error);
              // Clean up temp script on error
              await ul(helperScriptPath).catch(() => {});

              console.error(`[MCP] Add helper scripts error: ${err.message}`);
              console.error(`[MCP] Error details:`, err);

              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(
                      {
                        success: false,
                        error: err.message,
                        stderr: err.stderr,
                        stdout: err.stdout,
                        command: helperScriptPath,
                        suggestion:
                          'Please ensure you are in a Klever smart contract project directory',
                      },
                      null,
                      2
                    ),
                  },
                ],
              };
            }
          }

          case 'check_sdk_status': {
            const { execFile: execFileSdk } = await import('child_process');
            const { promisify: promisifySdk } = await import('util');
            const { writeFile: wfSdk, chmod: chSdk, unlink: ulSdk } = await import('fs/promises');
            const { join: joinSdk } = await import('path');
            const { tmpdir: tdSdk } = await import('os');
            const { createCheckSdkScript } = await import('../utils/sdk-install-script.js');
            const execFileSdkAsync = promisifySdk(execFileSdk);

            console.error(`[MCP] Checking SDK status`);

            const scriptContent = createCheckSdkScript();
            const scriptPath = joinSdk(tdSdk(), `check-sdk-${Date.now()}.sh`);

            await wfSdk(scriptPath, scriptContent, 'utf8');
            await chSdk(scriptPath, '755');

            try {
              const { stdout, stderr } = await execFileSdkAsync('/bin/bash', [scriptPath], {
                env: { ...process.env },
              });

              if (stderr) {
                console.error(`[MCP] Check SDK stderr: ${stderr}`);
              }

              await ulSdk(scriptPath);

              const status = JSON.parse(stdout.trim());
              console.error(`[MCP] SDK status: ksc=${status.ksc?.installed}, koperator=${status.koperator?.installed}`);

              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(
                      {
                        success: true,
                        ...status,
                      },
                      null,
                      2
                    ),
                  },
                ],
              };
            } catch (error: unknown) {
              const err = toExecError(error);
              await ulSdk(scriptPath).catch(() => {});

              console.error(`[MCP] Check SDK error: ${err.message}`);

              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(
                      {
                        success: false,
                        error: err.message,
                        stderr: err.stderr,
                        stdout: err.stdout,
                      },
                      null,
                      2
                    ),
                  },
                ],
              };
            }
          }

          case 'install_klever_sdk': {
            const { execFile: execFileInst } = await import('child_process');
            const { promisify: promisifyInst } = await import('util');
            const { writeFile: wfInst, chmod: chInst, unlink: ulInst } = await import('fs/promises');
            const { join: joinInst } = await import('path');
            const { tmpdir: tdInst } = await import('os');
            const { createInstallSdkScript } = await import('../utils/sdk-install-script.js');
            const execFileInstAsync = promisifyInst(execFileInst);

            const { tool: toolArg = 'all' } = args as { tool?: string };
            const toolChoice = ['ksc', 'koperator', 'all'].includes(toolArg) ? toolArg : 'all';

            console.error(`[MCP] Installing SDK: ${toolChoice}`);

            const scriptContent = createInstallSdkScript(toolChoice);
            const scriptPath = joinInst(tdInst(), `install-sdk-${Date.now()}.sh`);

            await wfInst(scriptPath, scriptContent, 'utf8');
            await chInst(scriptPath, '755');

            try {
              const { stdout, stderr } = await execFileInstAsync('/bin/bash', [scriptPath], {
                env: { ...process.env },
                timeout: 120000,
              });

              if (stderr) {
                console.error(`[MCP] Install SDK stderr: ${stderr}`);
              }

              await ulInst(scriptPath);

              const result = JSON.parse(stdout.trim());
              console.error(`[MCP] Install SDK result: ${JSON.stringify(result)}`);

              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(
                      {
                        success: true,
                        ...result,
                      },
                      null,
                      2
                    ),
                  },
                ],
              };
            } catch (error: unknown) {
              const err = toExecError(error);
              await ulInst(scriptPath).catch(() => {});

              console.error(`[MCP] Install SDK error: ${err.message}`);

              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(
                      {
                        success: false,
                        error: err.message,
                        stderr: err.stderr,
                        stdout: err.stdout,
                        suggestion:
                          'Ensure you have curl or wget installed and internet connectivity',
                      },
                      null,
                      2
                    ),
                  },
                ],
              };
            }
          }

          // ─── Chain Read Tools ─────────────────────────────

          case 'get_balance': {
            const { address, assetId, network } = args as {
              address: string;
              assetId?: string;
              network?: string;
            };
            console.error(`[MCP] get_balance: ${address} asset=${assetId || 'KLV'} network=${network || 'default'}`);

            const balance = await this.chainClient.getBalance(
              address,
              assetId,
              validateNetwork(network)
            );

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      success: true,
                      address,
                      assetId: assetId || 'KLV',
                      balance,
                      formatted: assetId
                        ? `${balance} (raw units — check asset precision)`
                        : `${(balance / 1_000_000).toFixed(6)} KLV`,
                      network: network || this.chainClient.getDefaultNetwork(),
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          case 'get_account': {
            const { address, network } = args as {
              address: string;
              network?: string;
            };
            console.error(`[MCP] get_account: ${address} network=${network || 'default'}`);

            const account = await this.chainClient.getAccount(
              address,
              validateNetwork(network)
            );

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      success: true,
                      data: account,
                      network: network || this.chainClient.getDefaultNetwork(),
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          case 'get_asset_info': {
            const { assetId, network } = args as {
              assetId: string;
              network?: string;
            };
            console.error(`[MCP] get_asset_info: ${assetId} network=${network || 'default'}`);

            const asset = await this.chainClient.getAssetInfo(
              assetId,
              validateNetwork(network)
            );

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      success: true,
                      data: asset,
                      network: network || this.chainClient.getDefaultNetwork(),
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          case 'query_sc': {
            const { scAddress, funcName, args: scArgs, network } = args as {
              scAddress: string;
              funcName: string;
              args?: string[];
              network?: string;
            };
            console.error(`[MCP] query_sc: ${scAddress}::${funcName} network=${network || 'default'}`);

            const request: VMQueryRequest = {
              scAddress,
              funcName,
              args: scArgs,
            };

            const result = await this.chainClient.querySmartContract(
              request,
              validateNetwork(network)
            );

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      success: true,
                      data: result,
                      network: network || this.chainClient.getDefaultNetwork(),
                      hint: 'returnData values are base64-encoded. Decode them based on the expected return type.',
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          case 'get_transaction': {
            const { hash, network } = args as {
              hash: string;
              network?: string;
            };
            console.error(`[MCP] get_transaction: ${hash} network=${network || 'default'}`);

            const tx = await this.chainClient.getTransaction(
              hash,
              validateNetwork(network)
            );

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      success: true,
                      data: tx,
                      network: network || this.chainClient.getDefaultNetwork(),
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          case 'get_block': {
            const { nonce, network } = args as {
              nonce?: number;
              network?: string;
            };
            console.error(`[MCP] get_block: nonce=${nonce ?? 'latest'} network=${network || 'default'}`);

            const block = await this.chainClient.getBlock(
              nonce,
              validateNetwork(network)
            );

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      success: true,
                      data: block,
                      network: network || this.chainClient.getDefaultNetwork(),
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          case 'list_validators': {
            const { network } = args as { network?: string };
            console.error(`[MCP] list_validators: network=${network || 'default'}`);

            const validators = await this.chainClient.listValidators(
              validateNetwork(network)
            );

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      success: true,
                      total: validators.length,
                      data: validators,
                      network: network || this.chainClient.getDefaultNetwork(),
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          // ─── Chain Write Tools (local only) ────────────────

          case 'send_transfer': {
            const { sender, receiver, amount, assetId, network } = args as {
              sender: string;
              receiver: string;
              amount: number;
              assetId?: string;
              network?: string;
            };
            console.error(`[MCP] send_transfer: ${sender} -> ${receiver} amount=${amount} asset=${assetId || 'KLV'}`);

            const nonce = await this.chainClient.getNonce(
              sender,
              validateNetwork(network)
            );

            const contract: Array<{ type: number; parameter: Record<string, unknown> }> = [
              {
                type: 0, // Transfer
                parameter: {
                  amount,
                  toAddress: receiver,
                  ...(assetId ? { assetId } : {}),
                },
              },
            ];

            const txResult = await this.chainClient.buildTransaction(
              { type: 0, sender, nonce, contract },
              validateNetwork(network)
            );

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      success: true,
                      message:
                        'Unsigned transaction built successfully. Sign this transaction externally and broadcast it.',
                      txHash: txResult.result.txHash,
                      unsignedTx: txResult.result.tx,
                      details: {
                        sender,
                        receiver,
                        amount,
                        assetId: assetId || 'KLV',
                        nonce,
                      },
                      network: network || this.chainClient.getDefaultNetwork(),
                      nextSteps: [
                        '1. Sign the transaction hash with the sender private key',
                        '2. Broadcast the signed transaction to the network',
                        'WARNING: The MCP server does NOT handle private keys.',
                      ],
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          case 'deploy_sc': {
            const { sender, wasmHex, initArgs, network } = args as {
              sender: string;
              wasmHex: string;
              initArgs?: string[];
              network?: string;
            };
            console.error(`[MCP] deploy_sc: sender=${sender} wasmSize=${wasmHex.length / 2} bytes`);

            const nonce = await this.chainClient.getNonce(
              sender,
              validateNetwork(network)
            );

            const data = [wasmHex, ...(initArgs || [])];

            const contract: Array<{ type: number; parameter: Record<string, unknown> }> = [
              {
                type: 9, // SmartContract (Deploy)
                parameter: {
                  type: 0, // Deploy
                },
              },
            ];

            const txResult = await this.chainClient.buildTransaction(
              { type: 9, sender, nonce, contract, data },
              validateNetwork(network)
            );

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      success: true,
                      message:
                        'Unsigned deploy transaction built. Sign externally and broadcast.',
                      txHash: txResult.result.txHash,
                      unsignedTx: txResult.result.tx,
                      details: {
                        sender,
                        wasmSize: `${wasmHex.length / 2} bytes`,
                        nonce,
                      },
                      network: network || this.chainClient.getDefaultNetwork(),
                      nextSteps: [
                        '1. Sign the transaction hash with the deployer private key',
                        '2. Broadcast the signed transaction',
                        '3. The contract address will be derived from the sender address + nonce',
                      ],
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          case 'invoke_sc': {
            const {
              sender,
              scAddress,
              funcName,
              args: scArgs,
              value,
              network,
            } = args as {
              sender: string;
              scAddress: string;
              funcName: string;
              args?: string[];
              value?: number;
              network?: string;
            };
            console.error(`[MCP] invoke_sc: ${sender} -> ${scAddress}::${funcName}`);

            const nonce = await this.chainClient.getNonce(
              sender,
              validateNetwork(network)
            );

            const data = [funcName, ...(scArgs || [])];

            const contract: Array<{ type: number; parameter: Record<string, unknown> }> = [
              {
                type: 9, // SmartContract (Invoke)
                parameter: {
                  type: 1, // Invoke
                  callValue: value ? { amount: value } : undefined,
                  address: scAddress,
                },
              },
            ];

            const txResult = await this.chainClient.buildTransaction(
              { type: 9, sender, nonce, contract, data },
              validateNetwork(network)
            );

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      success: true,
                      message:
                        'Unsigned SC invoke transaction built. Sign externally and broadcast.',
                      txHash: txResult.result.txHash,
                      unsignedTx: txResult.result.tx,
                      details: {
                        sender,
                        scAddress,
                        funcName,
                        argsCount: scArgs?.length || 0,
                        value: value || 0,
                        nonce,
                      },
                      network: network || this.chainClient.getDefaultNetwork(),
                      nextSteps: [
                        '1. Sign the transaction hash with the caller private key',
                        '2. Broadcast the signed transaction',
                        '3. Check the transaction receipt for execution results',
                      ],
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          case 'freeze_klv': {
            const { sender, amount, network } = args as {
              sender: string;
              amount: number;
              network?: string;
            };
            console.error(`[MCP] freeze_klv: ${sender} amount=${amount}`);

            const nonce = await this.chainClient.getNonce(
              sender,
              validateNetwork(network)
            );

            const contract: Array<{ type: number; parameter: Record<string, unknown> }> = [
              {
                type: 2, // Freeze
                parameter: {
                  amount,
                },
              },
            ];

            const txResult = await this.chainClient.buildTransaction(
              { type: 2, sender, nonce, contract },
              validateNetwork(network)
            );

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      success: true,
                      message:
                        'Unsigned freeze transaction built. Sign externally and broadcast.',
                      txHash: txResult.result.txHash,
                      unsignedTx: txResult.result.tx,
                      details: {
                        sender,
                        amount,
                        formattedAmount: `${(amount / 1_000_000).toFixed(6)} KLV`,
                        nonce,
                      },
                      network: network || this.chainClient.getDefaultNetwork(),
                      nextSteps: [
                        '1. Sign the transaction hash with the sender private key',
                        '2. Broadcast the signed transaction',
                        '3. Frozen KLV provides energy/bandwidth and enables staking rewards',
                      ],
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          default:
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      success: false,
                      error: `Unknown tool: "${name}". This tool does not exist.`,
                      suggestion:
                        'Use the MCP tools/list method to see all available tools and their descriptions.',
                    },
                    null,
                    2
                  ),
                },
              ],
            };
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: false,
                  error: message,
                  tool: name,
                  suggestion:
                    'Check that all required parameters are provided and correctly typed. You can retry the call with corrected arguments. If the error persists, try a different approach or use search_documentation to find relevant guidance.',
                },
                null,
                2
              ),
            },
          ],
        };
      }
    });

    // Prompt handlers
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      const { getPromptDefinitions } = await import('./prompts.js');
      return { prompts: getPromptDefinitions(this.profile) };
    });

    this.server.setRequestHandler(GetPromptRequestSchema, async request => {
      const { getPromptMessages } = await import('./prompts.js');
      const { name, arguments: promptArgs } = request.params;
      return getPromptMessages(name, promptArgs, this.profile);
    });

    // Resource handlers
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      const { getStaticResources } = await import('./resources.js');
      return { resources: getStaticResources(this.profile) };
    });

    this.server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
      const { getResourceTemplates } = await import('./resources.js');
      return { resourceTemplates: getResourceTemplates(this.profile) };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async request => {
      const { readResource } = await import('./resources.js');
      const result = await readResource(request.params.uri, this.contextService);
      return { contents: [result] };
    });
  }

  async connectTransport(transport: Transport) {
    await this.server.connect(transport);
    console.error(`[MCP] Klever MCP Server connected (profile: ${this.profile})`);
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.connectTransport(transport);
    // Log to stderr to avoid interfering with MCP protocol on stdout
    console.error('[MCP] Klever MCP Server started with knowledge base');
  }

  private extractKeywords(message: string): string[] {
    // Klever-specific keywords to look for
    const kleverKeywords = [
      'klever',
      'smart contract',
      'kvm',
      'storage',
      'mapper',
      'endpoint',
      'payable',
      'deploy',
      'upgrade',
      'query',
      'annotation',
      'event',
      'managed',
      'bigint',
      'biguint',
      'token',
      'transfer',
      'koperator',
      'ksc',
      'singlemapper',
      'setmapper',
      'mapmapper',
      'vecmapper',
      'optionmapper',
      'init',
      'rust',
      'wasm',
      'testnet',
      'mainnet',
      'admin',
      'only_admin',
      'only_owner',
      'access',
      'permission',
      'role',
      'view',
      'namespace',
      'module',
      'pause',
      'unpause',
      'pausable',
      'paused',
      'emergency',
    ];

    const words = message.toLowerCase().split(/\s+/);
    const found: string[] = [];

    // Check for Klever-specific keywords
    for (const keyword of kleverKeywords) {
      if (message.toLowerCase().includes(keyword)) {
        found.push(keyword);
      }
    }

    // Also include any significant words from the query
    const additionalWords = words.filter(
      w =>
        w.length > 3 &&
        ![
          'what',
          'how',
          'when',
          'where',
          'why',
          'can',
          'could',
          'would',
          'should',
          'does',
          'make',
          'create',
          'build',
        ].includes(w)
    );

    return [...new Set([...found, ...additionalWords.slice(0, 3)])];
  }

  private async analyzeContractSource(sourceCode: string): Promise<
    Array<{
      severity: 'error' | 'warning' | 'info';
      pattern: string;
      message: string;
      suggestion: string;
      relatedKnowledge: Array<{ title: string; id: string }>;
    }>
  > {
    const findings: Array<{
      severity: 'error' | 'warning' | 'info';
      pattern: string;
      message: string;
      suggestion: string;
      relatedKnowledge: Array<{ title: string; id: string }>;
    }> = [];

    // Pattern checks
    const checks: Array<{
      test: () => boolean;
      severity: 'error' | 'warning' | 'info';
      pattern: string;
      message: string;
      suggestion: string;
      searchQuery: string;
    }> = [
      {
        test: () => !sourceCode.includes('use klever_sc::imports::*'),
        severity: 'error',
        pattern: 'missing_imports',
        message: 'Missing required import: use klever_sc::imports::*',
        suggestion: 'Add `use klever_sc::imports::*;` at the top of your contract file.',
        searchQuery: 'imports klever_sc',
      },
      {
        test: () => !sourceCode.includes('#[klever_sc::contract]'),
        severity: 'error',
        pattern: 'missing_contract_macro',
        message: 'Missing #[klever_sc::contract] attribute macro',
        suggestion:
          'Add `#[klever_sc::contract]` above your contract trait definition.',
        searchQuery: 'contract macro attribute',
      },
      {
        test: () => {
          const hasPubFns = sourceCode.match(/fn\s+\w+\s*\(/g);
          const hasEndpoints = sourceCode.match(/#\[(endpoint|view|init)\]/g);
          return !!(hasPubFns && hasPubFns.length > 0 && !hasEndpoints);
        },
        severity: 'warning',
        pattern: 'missing_endpoint_annotations',
        message: 'Functions found without #[endpoint], #[view], or #[init] annotations',
        suggestion:
          'Add `#[endpoint]` for state-changing functions, `#[view]` for read-only functions, or `#[init]` for the constructor.',
        searchQuery: 'endpoint view annotation',
      },
      {
        test: () => {
          const payableMatch = sourceCode.match(/#\[payable\([^)]*\)]/g);
          if (!payableMatch) return false;
          // Check if there's payment handling nearby (call_value)
          return !sourceCode.includes('call_value');
        },
        severity: 'warning',
        pattern: 'payable_without_handling',
        message: '#[payable] annotation found but no call_value() usage detected',
        suggestion:
          'Use `self.call_value().klv_value()` or `self.call_value().single_kda()` to handle incoming payments in payable endpoints.',
        searchQuery: 'payable payment handling call_value',
      },
      {
        test: () => {
          const hasMappers = sourceCode.match(
            /(SingleValueMapper|MapMapper|SetMapper|VecMapper|OptionMapper)/g
          );
          if (!hasMappers) return false;
          return !sourceCode.includes('#[storage_mapper');
        },
        severity: 'warning',
        pattern: 'storage_without_annotation',
        message: 'Storage mapper types used without #[storage_mapper] annotations',
        suggestion:
          'Declare storage mappers with `#[storage_mapper("key_name")]` to properly initialize them.',
        searchQuery: 'storage mapper initialization annotation',
      },
      {
        test: () => {
          // Check for state-changing functions (endpoints that aren't views)
          const endpoints = sourceCode.match(/#\[endpoint\]/g);
          const events = sourceCode.match(/#\[event\(/g);
          return !!(endpoints && endpoints.length > 0 && !events);
        },
        severity: 'info',
        pattern: 'no_event_emissions',
        message:
          'State-changing endpoints found but no event definitions detected',
        suggestion:
          'Consider adding events for state-changing operations to enable off-chain tracking. Define events with `#[event("event_name")]`.',
        searchQuery: 'event definition emission',
      },
    ];

    for (const check of checks) {
      if (check.test()) {
        // Query knowledge base for related entries
        const related = await this.contextService.query({
          query: check.searchQuery,
          limit: 3,
          offset: 0,
          includeTotal: false,
        });

        findings.push({
          severity: check.severity,
          pattern: check.pattern,
          message: check.message,
          suggestion: check.suggestion,
          relatedKnowledge: related.results.map(r => ({
            title: r.metadata.title,
            id: r.id || '',
          })),
        });
      }
    }

    // If no issues found, return a positive finding
    if (findings.length === 0) {
      findings.push({
        severity: 'info',
        pattern: 'no_issues',
        message: 'No common issues detected in the contract source code',
        suggestion: 'The contract passes basic pattern checks. Consider a thorough manual review.',
        relatedKnowledge: [],
      });
    }

    return findings;
  }
}
