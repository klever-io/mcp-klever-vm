import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { ContextService } from '../context/service.js';
import { QueryContextSchema, ContextPayloadSchema } from '../types/index.js';
import {
  createProjectInitScript,
  projectInitToolDefinition,
} from '../utils/project-init-script.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, chmod } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

const execAsync = promisify(exec);

export class KleverMCPServer {
  private server: Server;

  constructor(private contextService: ContextService) {
    this.server = new Server(
      {
        name: 'klever-vm-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'query_context',
          description: 'Query Klever VM smart contract development context',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Search query' },
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
              },
              tags: {
                type: 'array',
                items: { type: 'string' },
              },
              contractType: { type: 'string' },
              limit: { type: 'number', default: 10 },
              offset: { type: 'number', default: 0 },
            },
          },
        },
        {
          name: 'add_context',
          description: 'Add new context for Klever VM development',
          inputSchema: {
            type: 'object',
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
              },
              content: { type: 'string' },
              metadata: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  tags: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  contractType: { type: 'string' },
                  author: { type: 'string' },
                },
                required: ['title'],
              },
            },
            required: ['type', 'content', 'metadata'],
          },
        },
        {
          name: 'get_context',
          description: 'Retrieve specific context by ID',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string' },
            },
            required: ['id'],
          },
        },
        {
          name: 'find_similar',
          description: 'Find contexts similar to a given context',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              limit: { type: 'number', default: 5 },
            },
            required: ['id'],
          },
        },
        {
          name: 'get_knowledge_stats',
          description: 'Get statistics about the knowledge base',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        projectInitToolDefinition,
        {
          name: 'enhance_with_context',
          description: 'Enhance a query with relevant Klever VM context before processing',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'The user query to enhance with context',
              },
              autoInclude: {
                type: 'boolean',
                default: true,
                description: 'Automatically include the most relevant contexts',
              },
            },
            required: ['query'],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async request => {
      const { name, arguments: args } = request.params;

      // Debug logging to stderr
      console.error(`[MCP] Tool called: ${name}`, JSON.stringify(args));

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
                        error: 'Context not found',
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
            const stats: any = {
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

          case 'init_klever_project': {
            const {
              name,
              template = 'empty',
              noMove = false,
            } = args as {
              name: string;
              template?: string;
              noMove?: boolean;
            };

            console.error(`[MCP] Initializing project: ${name} with template: ${template}`);

            // Create the initialization script
            const scriptContent = createProjectInitScript();
            const scriptPath = join(tmpdir(), `init-klever-${Date.now()}.sh`);

            // Write script to temp file
            await writeFile(scriptPath, scriptContent, 'utf8');
            await chmod(scriptPath, '755');

            // Build command with arguments
            const cmdArgs = [`--name "${name}"`, `--template "${template}"`];
            if (noMove) {
              cmdArgs.push('--no-move');
            }

            const cmd = `${scriptPath} ${cmdArgs.join(' ')}`;
            console.error(`[MCP] Running: ${cmd}`);

            try {
              // Execute the script
              const { stdout, stderr } = await execAsync(cmd, {
                cwd: process.cwd(),
                env: { ...process.env },
                shell: '/bin/bash',
              });

              console.error(`[MCP] Script output: ${stdout}`);
              if (stderr) {
                console.error(`[MCP] Script stderr: ${stderr}`);
              }

              // Clean up temp script
              await execAsync(`rm -f ${scriptPath}`);

              // Check if we're in the right directory structure
              const checkResult = await execAsync(
                'ls -la scripts/ 2>/dev/null || echo "No scripts directory"'
              );
              console.error(`[MCP] Scripts directory check: ${checkResult.stdout}`);

              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(
                      {
                        success: true,
                        message: `Project ${name} initialized successfully`,
                        output: stdout,
                        workingDirectory: process.cwd(),
                        projectStructure: {
                          directories: ['src/', 'tests/', 'scripts/', 'output/'],
                          scripts: [
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
                        ],
                      },
                      null,
                      2
                    ),
                  },
                ],
              };
            } catch (error: any) {
              // Clean up temp script on error
              await execAsync(`rm -f ${scriptPath}`).catch(() => {});

              console.error(`[MCP] Project init error: ${error.message}`);
              console.error(`[MCP] Error details:`, error);

              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(
                      {
                        success: false,
                        error: error.message,
                        stderr: error.stderr || '',
                        stdout: error.stdout || '',
                        command: cmd,
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

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: false,
                  error: error instanceof Error ? error.message : 'Unknown error',
                },
                null,
                2
              ),
            },
          ],
        };
      }
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
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
}
