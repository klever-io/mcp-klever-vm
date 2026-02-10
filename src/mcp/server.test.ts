import { jest } from '@jest/globals';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { ContextService } from '../context/service.js';
import { InMemoryStorage } from '../storage/memory.js';
import { KleverMCPServer } from './server.js';

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
        const wordCount = tool.description!.split(/\s+/).length;
        expect(wordCount).toBeLessThanOrEqual(100);
      }
    });

    it('all tools have annotations with readOnlyHint', async () => {
      const { tools } = await client.listTools();

      for (const tool of tools) {
        expect(tool.annotations).toBeDefined();
        expect(tool.annotations!.readOnlyHint).toBeDefined();
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
});
