import { jest } from '@jest/globals';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { ContextService } from '../context/service.js';
import { InMemoryStorage } from '../storage/memory.js';
import { KleverMCPServer } from './server.js';
import { KleverChainClient } from '../chain/index.js';

// Mock global fetch for chain tools (save original and restore in afterAll)
const originalFetch = global.fetch;
const mockFetch = jest.fn<typeof fetch>();
global.fetch = mockFetch;

afterAll(() => {
  global.fetch = originalFetch;
});

function jsonResponse(data: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Headers(),
    redirected: false,
    type: 'basic' as ResponseType,
    url: '',
    clone: () => jsonResponse(data, status),
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
    bytes: () => Promise.resolve(new Uint8Array()),
  };
}

describe('KleverMCPServer (public mode)', () => {
  let client: Client;
  let server: KleverMCPServer;
  let consoleErrorSpy: ReturnType<typeof jest.spyOn>;

  beforeAll(async () => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation((() => {}) as () => void);

    const storage = new InMemoryStorage();
    const contextService = new ContextService(storage);
    server = new KleverMCPServer(contextService, 'public');

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connectTransport(serverTransport);

    client = new Client({ name: 'test-client', version: '1.0.0' });
    await client.connect(clientTransport);
  });

  afterAll(async () => {
    await client.close();
    consoleErrorSpy.mockRestore();
  });

  describe('tool listing', () => {
    it('lists init_klever_project and add_helper_scripts', async () => {
      const { tools } = await client.listTools();
      const names = tools.map(t => t.name);

      expect(names).toContain('init_klever_project');
      expect(names).toContain('add_helper_scripts');
    });

    it('does not list add_context in public mode', async () => {
      const { tools } = await client.listTools();
      const names = tools.map(t => t.name);

      expect(names).not.toContain('add_context');
    });

    it('does not list SDK tools in public mode', async () => {
      const { tools } = await client.listTools();
      const names = tools.map(t => t.name);

      expect(names).not.toContain('check_sdk_status');
      expect(names).not.toContain('install_klever_sdk');
    });

    it('lists read-only tools', async () => {
      const { tools } = await client.listTools();
      const names = tools.map(t => t.name);

      expect(names).toContain('query_context');
      expect(names).toContain('get_context');
      expect(names).toContain('find_similar');
      expect(names).toContain('get_knowledge_stats');
      expect(names).toContain('enhance_with_context');
    });

    it('lists search_documentation and analyze_contract tools', async () => {
      const { tools } = await client.listTools();
      const names = tools.map(t => t.name);

      expect(names).toContain('search_documentation');
      expect(names).toContain('analyze_contract');
    });
  });

  describe('init_klever_project (public mode)', () => {
    it('returns template JSON instead of executing', async () => {
      const result = await client.callTool({
        name: 'init_klever_project',
        arguments: { name: 'test-contract' },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      expect(content).toHaveLength(1);

      const parsed = JSON.parse(content[0].text);
      expect(parsed.success).toBe(true);
      expect(parsed.mode).toBe('template');
      expect(parsed.files).toBeDefined();
      expect(parsed.files['scripts/build.sh']).toBeDefined();
      expect(parsed.instructions).toContain('test-contract');
    });
  });

  describe('add_helper_scripts (public mode)', () => {
    it('returns template JSON instead of executing', async () => {
      const result = await client.callTool({
        name: 'add_helper_scripts',
        arguments: { contractName: 'my-kda' },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      expect(content).toHaveLength(1);

      const parsed = JSON.parse(content[0].text);
      expect(parsed.success).toBe(true);
      expect(parsed.mode).toBe('template');
      expect(parsed.files).toBeDefined();
      expect(parsed.files['scripts/common.sh']).toBeDefined();
    });
  });

  describe('prompt listing', () => {
    it('lists prompts via client.listPrompts()', async () => {
      const { prompts } = await client.listPrompts();
      expect(prompts).toHaveLength(4);
      const names = prompts.map(p => p.name);
      expect(names).toContain('create_smart_contract');
      expect(names).toContain('add_feature');
      expect(names).toContain('debug_error');
      expect(names).toContain('review_contract');
    });
  });

  describe('get prompt', () => {
    it('returns messages for create_smart_contract', async () => {
      const result = await client.getPrompt({
        name: 'create_smart_contract',
        arguments: { contractName: 'MyToken' },
      });

      expect(result.description).toContain('MyToken');
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].role).toBe('user');

      const content = result.messages[0].content;
      expect(content.type).toBe('text');
      expect((content as { type: 'text'; text: string }).text).toContain('MyToken');
      expect((content as { type: 'text'; text: string }).text).toContain('query_context');
    });

    it('returns messages for add_feature', async () => {
      const result = await client.getPrompt({
        name: 'add_feature',
        arguments: { featureName: 'staking' },
      });

      expect(result.messages).toHaveLength(1);
      const text = (result.messages[0].content as { type: 'text'; text: string }).text;
      expect(text).toContain('staking');
      expect(text).toContain('query_context');
    });

    it('returns messages for debug_error', async () => {
      const result = await client.getPrompt({
        name: 'debug_error',
        arguments: { errorMessage: 'error[E0308]: mismatched types' },
      });

      expect(result.messages).toHaveLength(1);
      const text = (result.messages[0].content as { type: 'text'; text: string }).text;
      expect(text).toContain('error[E0308]: mismatched types');
      expect(text).toContain('search_documentation');
      expect(text).toContain('query_context');
    });

    it('returns messages for review_contract', async () => {
      const result = await client.getPrompt({
        name: 'review_contract',
      });

      expect(result.messages).toHaveLength(1);
      const text = (result.messages[0].content as { type: 'text'; text: string }).text;
      expect(text).toContain('analyze_contract');
      expect(text).toContain('Security Review');
      expect(text).toContain('Code Quality');
    });
  });

  describe('blocked tools (public mode)', () => {
    it('blocks add_context with actionable error', async () => {
      const result = await client.callTool({
        name: 'add_context',
        arguments: {
          type: 'code_example',
          content: 'test',
          metadata: { title: 'test' },
        },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      const parsed = JSON.parse(content[0].text);
      expect(parsed.success).toBe(false);
      expect(parsed.error).toContain('not available in public mode');
      expect(parsed.suggestion).toBeDefined();
      expect(parsed.availableTools).toBeDefined();
      expect(parsed.availableTools).toContain('query_context');
    });
  });

  describe('resources', () => {
    it('lists static resources via client.listResources()', async () => {
      const { resources } = await client.listResources();
      expect(resources).toHaveLength(1);
      expect(resources[0].uri).toBe('klever://knowledge/index');
      expect(resources[0].mimeType).toBe('text/markdown');
    });

    it('lists resource templates via client.listResourceTemplates()', async () => {
      const { resourceTemplates } = await client.listResourceTemplates();
      expect(resourceTemplates).toHaveLength(1);
      expect(resourceTemplates[0].uriTemplate).toBe('klever://knowledge/{category}');
    });

    it('reads the knowledge index resource', async () => {
      const result = await client.readResource({ uri: 'klever://knowledge/index' });
      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].mimeType).toBe('text/markdown');
      expect(result.contents[0].text).toContain('Klever VM Knowledge Base');
    });

    it('reads a category resource', async () => {
      const result = await client.readResource({ uri: 'klever://knowledge/core' });
      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].mimeType).toBe('text/markdown');
      expect(result.contents[0].text).toContain('# Klever Knowledge: core');
    });
  });

  describe('search_documentation', () => {
    it('returns markdown-formatted documentation results', async () => {
      const result = await client.callTool({
        name: 'search_documentation',
        arguments: { query: 'storage mapper' },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      expect(content).toHaveLength(1);
      expect(content[0].text).toContain('# Documentation Search');
      expect(content[0].text).toContain('storage mapper');
    });

    it('accepts an optional category filter', async () => {
      const result = await client.callTool({
        name: 'search_documentation',
        arguments: { query: 'import', category: 'core' },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toContain('**Category**: core');
    });
  });

  describe('tool description quality', () => {
    it('all tools have non-empty descriptions under 100 words', async () => {
      const { tools } = await client.listTools();

      for (const tool of tools) {
        expect(tool.description).toBeDefined();
        expect(tool.description!.length).toBeGreaterThan(0);
        const wordCount = tool.description!.trim().split(/\s+/).filter(Boolean).length;
        expect(wordCount).toBeLessThanOrEqual(100);
      }
    });

    it('all tools have complete annotation sets', async () => {
      const { tools } = await client.listTools();
      const requiredAnnotations = [
        'title',
        'readOnlyHint',
        'destructiveHint',
        'idempotentHint',
        'openWorldHint',
      ];

      for (const tool of tools) {
        expect(tool.annotations).toBeDefined();
        for (const annotation of requiredAnnotations) {
          expect(tool.annotations).toHaveProperty(
            annotation,
            expect.anything(),
          );
        }
      }
    });

    it('read-only tools are marked with readOnlyHint: true', async () => {
      const { tools } = await client.listTools();
      const readOnlyToolNames = [
        'query_context',
        'get_context',
        'find_similar',
        'get_knowledge_stats',
        'enhance_with_context',
        'search_documentation',
        'analyze_contract',
      ];

      for (const name of readOnlyToolNames) {
        const tool = tools.find(t => t.name === name);
        expect(tool).toBeDefined();
        expect(tool!.annotations!.readOnlyHint).toBe(true);
      }
    });

    it('all tool parameters have descriptions', async () => {
      const { tools } = await client.listTools();

      for (const tool of tools) {
        const schema = tool.inputSchema as {
          properties?: Record<string, { description?: string }>;
        };
        if (schema.properties) {
          for (const [paramName, paramSchema] of Object.entries(schema.properties)) {
            // Skip nested object properties (like metadata sub-fields)
            if (typeof paramSchema === 'object' && !('properties' in paramSchema)) {
              expect(paramSchema.description).toBeDefined();
              expect(paramSchema.description!.length).toBeGreaterThan(0);
            } else if (typeof paramSchema === 'object' && paramName !== 'metadata') {
              // Top-level non-object params should have descriptions
              expect(paramSchema.description).toBeDefined();
            }
          }
        }
      }
    });
  });

  describe('analyze_contract', () => {
    it('detects missing imports', async () => {
      const result = await client.callTool({
        name: 'analyze_contract',
        arguments: {
          sourceCode: '#[klever_sc::contract]\npub trait MyContract {}',
          contractName: 'TestContract',
        },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      const parsed = JSON.parse(content[0].text);
      expect(parsed.success).toBe(true);
      expect(parsed.contractName).toBe('TestContract');
      expect(parsed.findings.some((f: { pattern: string }) => f.pattern === 'missing_imports')).toBe(
        true
      );
    });

    it('detects missing contract macro', async () => {
      const result = await client.callTool({
        name: 'analyze_contract',
        arguments: {
          sourceCode: 'use klever_sc::imports::*;\npub trait MyContract {}',
        },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      const parsed = JSON.parse(content[0].text);
      expect(
        parsed.findings.some((f: { pattern: string }) => f.pattern === 'missing_contract_macro')
      ).toBe(true);
    });

    it('returns no_issues for well-formed contract', async () => {
      const validContract = `use klever_sc::imports::*;

#[klever_sc::contract]
pub trait MyContract {
    #[init]
    fn init(&self) {}

    #[endpoint]
    fn do_something(&self) {}

    #[event("something_done")]
    fn something_done_event(&self);
}`;

      const result = await client.callTool({
        name: 'analyze_contract',
        arguments: { sourceCode: validContract },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      const parsed = JSON.parse(content[0].text);
      expect(parsed.findings.some((f: { pattern: string }) => f.pattern === 'no_issues')).toBe(
        true
      );
    });
  });

  describe('chain read tools (public mode)', () => {
    it('lists chain read tools in public mode', async () => {
      const { tools } = await client.listTools();
      const names = tools.map(t => t.name);

      expect(names).toContain('get_balance');
      expect(names).toContain('get_account');
      expect(names).toContain('get_asset_info');
      expect(names).toContain('query_sc');
      expect(names).toContain('get_transaction');
      expect(names).toContain('get_block');
      expect(names).toContain('list_validators');
    });

    it('does not list chain write tools in public mode', async () => {
      const { tools } = await client.listTools();
      const names = tools.map(t => t.name);

      expect(names).not.toContain('send_transfer');
      expect(names).not.toContain('deploy_sc');
      expect(names).not.toContain('invoke_sc');
      expect(names).not.toContain('freeze_klv');
    });

    it('chain read tools are marked readOnlyHint: true', async () => {
      const { tools } = await client.listTools();
      const chainReadTools = ['get_balance', 'get_account', 'get_asset_info', 'query_sc', 'get_transaction', 'get_block', 'list_validators'];

      for (const name of chainReadTools) {
        const tool = tools.find(t => t.name === name);
        expect(tool).toBeDefined();
        expect(tool!.annotations!.readOnlyHint).toBe(true);
        expect(tool!.annotations!.openWorldHint).toBe(true);
      }
    });

    it('rejects invalid network parameter', async () => {
      const result = await client.callTool({
        name: 'get_balance',
        arguments: { address: 'klv1test', network: 'staging' },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toContain('Invalid network');
      expect(content[0].text).toContain('staging');
      expect(content[0].text).toContain('mainnet, testnet, devnet, local');
    });

    it('get_balance returns formatted result', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ data: { balance: 5000000 }, error: '', code: 'successful' })
      );

      const result = await client.callTool({
        name: 'get_balance',
        arguments: { address: 'klv1test' },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      const parsed = JSON.parse(content[0].text);
      expect(parsed.success).toBe(true);
      expect(parsed.balance).toBe(5000000);
      expect(parsed.assetId).toBe('KLV');
      expect(parsed.formatted).toContain('KLV');
    });

    it('get_account returns account data', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          data: { account: { address: 'klv1test', nonce: 5, balance: 1000000 } },
          error: '',
          code: 'successful',
        })
      );

      const result = await client.callTool({
        name: 'get_account',
        arguments: { address: 'klv1test' },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      const parsed = JSON.parse(content[0].text);
      expect(parsed.success).toBe(true);
      expect(parsed.data.address).toBe('klv1test');
    });

    it('list_validators returns array', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          data: { validators: [{ ownerAddress: 'klv1val1', name: 'Val 1' }] },
          error: '',
        })
      );

      const result = await client.callTool({
        name: 'list_validators',
        arguments: {},
      });

      const content = result.content as Array<{ type: string; text: string }>;
      const parsed = JSON.parse(content[0].text);
      expect(parsed.success).toBe(true);
      expect(parsed.total).toBe(1);
    });
  });

  describe('chain write tools blocked in public mode', () => {
    it('blocks send_transfer', async () => {
      const result = await client.callTool({
        name: 'send_transfer',
        arguments: { sender: 'klv1a', receiver: 'klv1b', amount: 1000000 },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      const parsed = JSON.parse(content[0].text);
      expect(parsed.success).toBe(false);
      expect(parsed.error).toContain('not available in public mode');
    });

    it('blocks deploy_sc', async () => {
      const result = await client.callTool({
        name: 'deploy_sc',
        arguments: { sender: 'klv1a', wasmHex: 'deadbeef' },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      const parsed = JSON.parse(content[0].text);
      expect(parsed.success).toBe(false);
      expect(parsed.error).toContain('not available in public mode');
    });

    it('blocks invoke_sc', async () => {
      const result = await client.callTool({
        name: 'invoke_sc',
        arguments: { sender: 'klv1a', scAddress: 'klv1sc', funcName: 'test' },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      const parsed = JSON.parse(content[0].text);
      expect(parsed.success).toBe(false);
    });

    it('blocks freeze_klv', async () => {
      const result = await client.callTool({
        name: 'freeze_klv',
        arguments: { sender: 'klv1a', amount: 1000000 },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      const parsed = JSON.parse(content[0].text);
      expect(parsed.success).toBe(false);
    });
  });
});

describe('KleverMCPServer (local mode)', () => {
  let client: Client;
  let consoleErrorSpy: ReturnType<typeof jest.spyOn>;

  beforeAll(async () => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation((() => {}) as () => void);

    const storage = new InMemoryStorage();
    const contextService = new ContextService(storage);
    const chainClient = new KleverChainClient({ network: 'testnet' });
    const server = new KleverMCPServer(contextService, 'local', chainClient);

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connectTransport(serverTransport);

    client = new Client({ name: 'test-client-local', version: '1.0.0' });
    await client.connect(clientTransport);
  });

  afterAll(async () => {
    await client.close();
    consoleErrorSpy.mockRestore();
  });

  it('lists chain write tools in local mode', async () => {
    const { tools } = await client.listTools();
    const names = tools.map(t => t.name);

    expect(names).toContain('send_transfer');
    expect(names).toContain('deploy_sc');
    expect(names).toContain('invoke_sc');
    expect(names).toContain('freeze_klv');
  });

  it('lists chain read tools in local mode', async () => {
    const { tools } = await client.listTools();
    const names = tools.map(t => t.name);

    expect(names).toContain('get_balance');
    expect(names).toContain('get_account');
    expect(names).toContain('get_asset_info');
    expect(names).toContain('query_sc');
    expect(names).toContain('get_transaction');
    expect(names).toContain('get_block');
    expect(names).toContain('list_validators');
  });

  it('send_transfer builds unsigned transaction', async () => {
    // Mock getNonce
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ data: { nonce: 10 }, error: '', code: 'successful' })
    );
    // Mock buildTransaction
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        data: { result: { txHash: 'hash123', tx: 'proto_tx' } },
        error: '',
        code: 'successful',
      })
    );

    const result = await client.callTool({
      name: 'send_transfer',
      arguments: { sender: 'klv1sender', receiver: 'klv1receiver', amount: 5000000 },
    });

    const content = result.content as Array<{ type: string; text: string }>;
    const parsed = JSON.parse(content[0].text);
    expect(parsed.success).toBe(true);
    expect(parsed.txHash).toBe('hash123');
    expect(parsed.unsignedTx).toBe('proto_tx');
    expect(parsed.details.amount).toBe(5000000);
    expect(parsed.nextSteps).toBeDefined();
    expect(parsed.message).toContain('Unsigned');
  });

  it('deploy_sc builds unsigned deploy transaction', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ data: { nonce: 3 }, error: '', code: 'successful' })
    );
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        data: { result: { txHash: 'deployhash', tx: 'deploy_proto' } },
        error: '',
        code: 'successful',
      })
    );

    const result = await client.callTool({
      name: 'deploy_sc',
      arguments: { sender: 'klv1deployer', wasmHex: 'deadbeefcafe' },
    });

    const content = result.content as Array<{ type: string; text: string }>;
    const parsed = JSON.parse(content[0].text);
    expect(parsed.success).toBe(true);
    expect(parsed.txHash).toBe('deployhash');
    expect(parsed.unsignedTx).toBe('deploy_proto');
    expect(parsed.details.sender).toBe('klv1deployer');
    expect(parsed.details.wasmSize).toBe('6 bytes');
    expect(parsed.nextSteps).toBeDefined();
    expect(parsed.message).toContain('deploy');
  });

  it('deploy_sc requires wasmPath or wasmHex', async () => {
    const result = await client.callTool({
      name: 'deploy_sc',
      arguments: { sender: 'klv1deployer' },
    });

    const content = result.content as Array<{ type: string; text: string }>;
    const parsed = JSON.parse(content[0].text);
    expect(parsed.success).toBe(false);
    expect(parsed.error).toContain('wasmPath or wasmHex');
  });

  it('invoke_sc builds unsigned invoke transaction', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ data: { nonce: 7 }, error: '', code: 'successful' })
    );
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        data: { result: { txHash: 'invokehash', tx: 'invoke_proto' } },
        error: '',
        code: 'successful',
      })
    );

    const result = await client.callTool({
      name: 'invoke_sc',
      arguments: {
        sender: 'klv1caller',
        scAddress: 'klv1contract',
        funcName: 'doSomething',
        args: ['AQID'],
        callValue: { KLV: 1000000 },
      },
    });

    const content = result.content as Array<{ type: string; text: string }>;
    const parsed = JSON.parse(content[0].text);
    expect(parsed.success).toBe(true);
    expect(parsed.txHash).toBe('invokehash');
    expect(parsed.unsignedTx).toBe('invoke_proto');
    expect(parsed.details.sender).toBe('klv1caller');
    expect(parsed.details.scAddress).toBe('klv1contract');
    expect(parsed.details.funcName).toBe('doSomething');
    expect(parsed.details.argsCount).toBe(1);
    expect(parsed.details.callValue).toEqual({ KLV: 1000000 });
    expect(parsed.nextSteps).toBeDefined();
    expect(parsed.message).toContain('invoke');
  });

  it('freeze_klv builds unsigned transaction', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ data: { nonce: 5 }, error: '', code: 'successful' })
    );
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        data: { result: { txHash: 'freezehash', tx: 'freeze_proto' } },
        error: '',
        code: 'successful',
      })
    );

    const result = await client.callTool({
      name: 'freeze_klv',
      arguments: { sender: 'klv1sender', amount: 10000000 },
    });

    const content = result.content as Array<{ type: string; text: string }>;
    const parsed = JSON.parse(content[0].text);
    expect(parsed.success).toBe(true);
    expect(parsed.details.formattedAmount).toBe('10.000000 KLV');
  });
});
