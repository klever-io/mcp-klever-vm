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
      expect(prompts).toHaveLength(2);
      const names = prompts.map(p => p.name);
      expect(names).toContain('create_smart_contract');
      expect(names).toContain('add_feature');
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
  });

  describe('blocked tools (public mode)', () => {
    it('blocks add_context', async () => {
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
    });
  });
});
