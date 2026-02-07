import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { ContextService } from '../context/service.js';
import { QueryContextSchema, ContextPayloadSchema } from '../types/index.js';
import { VERSION, GIT_SHA } from '../version.js';

export type ServerProfile = 'local' | 'public';

export class KleverMCPServer {
  private server: Server;
  private profile: ServerProfile;

  constructor(
    private contextService: ContextService,
    profile: ServerProfile = 'local'
  ) {
    this.profile = profile;
    this.server = new Server(
      {
        name: 'klever-vm-mcp',
        version: `${VERSION}+${GIT_SHA}`,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private getReadOnlyToolDefinitions() {
    return [
      {
        name: 'query_context',
        description: 'Query Klever VM smart contract development context',
        inputSchema: {
          type: 'object' as const,
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
        name: 'get_context',
        description: 'Retrieve specific context by ID',
        inputSchema: {
          type: 'object' as const,
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
          type: 'object' as const,
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
          type: 'object' as const,
          properties: {},
        },
      },
      {
        name: 'enhance_with_context',
        description: 'Enhance a query with relevant Klever VM context before processing',
        inputSchema: {
          type: 'object' as const,
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
        description: 'Add new context for Klever VM development',
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
      projectInitToolDefinition,
      addHelperScriptsToolDefinition,
      checkSdkStatusToolDefinition,
      installKleverSdkToolDefinition,
    ];
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Array<Record<string, unknown>> = [...this.getReadOnlyToolDefinitions()];

      if (this.profile === 'local') {
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
      if (
        this.profile === 'public' &&
        ['add_context', 'init_klever_project', 'add_helper_scripts', 'check_sdk_status', 'install_klever_sdk'].includes(name)
      ) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: false,
                  error: 'This tool is not available in public mode',
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
            const { exec } = await import('child_process');
            const { promisify } = await import('util');
            const { writeFile, chmod, access } = await import('fs/promises');
            const { join } = await import('path');
            const { tmpdir } = await import('os');
            const { createProjectInitScript } = await import('../utils/project-init-script.js');
            const execAsync = promisify(exec);

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

            // Properly escape arguments for shell
            const escapedArgs = cmdArgs
              .map((arg, index) => {
                // Don't quote flags (arguments starting with --)
                if (index % 2 === 0 || arg.startsWith('--')) {
                  return arg;
                }
                // Quote values that might contain spaces
                return `"${arg.replace(/"/g, '\\"')}"`;
              })
              .join(' ');

            const cmd = `${scriptPath} ${escapedArgs}`;
            console.error(`[MCP] Running: ${cmd}`);

            try {
              console.error(`[MCP] Current working directory: ${process.cwd()}`);

              // Check if script exists
              try {
                await access(scriptPath);
                console.error(`[MCP] Script path exists: true`);
              } catch {
                console.error(`[MCP] Script path exists: false`);
              }

              // Execute the script
              const { stdout, stderr } = await execAsync(cmd, {
                cwd: process.cwd(),
                env: { ...process.env },
                shell: '/bin/bash',
              });

              console.error(`[MCP] Script stdout length: ${stdout.length}`);
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

          case 'add_helper_scripts': {
            const { exec: execCb } = await import('child_process');
            const { promisify: promisifyUtil } = await import('util');
            const { writeFile: wf, chmod: ch } = await import('fs/promises');
            const { join: joinPath } = await import('path');
            const { tmpdir: td } = await import('os');
            const { createHelperScriptsScript } = await import('../utils/project-init-script.js');
            const execHelper = promisifyUtil(execCb);

            console.error(`[MCP] Adding helper scripts to existing project`);

            // Create the helper scripts generation script
            const helperScriptContent = createHelperScriptsScript();
            const helperScriptPath = joinPath(td(), `add-helper-scripts-${Date.now()}.sh`);

            // Write script to temp file
            await wf(helperScriptPath, helperScriptContent, 'utf8');
            await ch(helperScriptPath, '755');

            // Build command
            const helperCmd = helperScriptPath;
            console.error(`[MCP] Running: ${helperCmd}`);

            try {
              console.error(`[MCP] Current working directory: ${process.cwd()}`);

              // Execute the script
              const { stdout, stderr } = await execHelper(helperCmd, {
                cwd: process.cwd(),
                env: { ...process.env },
                shell: '/bin/bash',
              });

              console.error(`[MCP] Script stdout: ${stdout}`);
              if (stderr) {
                console.error(`[MCP] Script stderr: ${stderr}`);
              }

              // Clean up temp script
              await execHelper(`rm -f ${helperScriptPath}`);

              // Check if scripts were created
              const checkResult = await execHelper(
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
            } catch (error: any) {
              // Clean up temp script on error
              await execHelper(`rm -f ${helperScriptPath}`).catch(() => {});

              console.error(`[MCP] Add helper scripts error: ${error.message}`);
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
                        command: helperCmd,
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
            const { exec: execCbSdk } = await import('child_process');
            const { promisify: promisifySdk } = await import('util');
            const { writeFile: wfSdk, chmod: chSdk, unlink: ulSdk } = await import('fs/promises');
            const { join: joinSdk } = await import('path');
            const { tmpdir: tdSdk } = await import('os');
            const { createCheckSdkScript } = await import('../utils/sdk-install-script.js');
            const execSdkCheck = promisifySdk(execCbSdk);

            console.error(`[MCP] Checking SDK status`);

            const scriptContent = createCheckSdkScript();
            const scriptPath = joinSdk(tdSdk(), `check-sdk-${Date.now()}.sh`);

            await wfSdk(scriptPath, scriptContent, 'utf8');
            await chSdk(scriptPath, '755');

            try {
              const { stdout, stderr } = await execSdkCheck(scriptPath, {
                env: { ...process.env },
                shell: '/bin/bash',
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
            } catch (error: any) {
              await ulSdk(scriptPath).catch(() => {});

              console.error(`[MCP] Check SDK error: ${error.message}`);

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
            const { exec: execCbInst } = await import('child_process');
            const { promisify: promisifyInst } = await import('util');
            const { writeFile: wfInst, chmod: chInst, unlink: ulInst } = await import('fs/promises');
            const { join: joinInst } = await import('path');
            const { tmpdir: tdInst } = await import('os');
            const { createInstallSdkScript } = await import('../utils/sdk-install-script.js');
            const execSdkInstall = promisifyInst(execCbInst);

            const { tool: toolArg = 'all' } = args as { tool?: string };
            const toolChoice = ['ksc', 'koperator', 'all'].includes(toolArg) ? toolArg : 'all';

            console.error(`[MCP] Installing SDK: ${toolChoice}`);

            const scriptContent = createInstallSdkScript(toolChoice);
            const scriptPath = joinInst(tdInst(), `install-sdk-${Date.now()}.sh`);

            await wfInst(scriptPath, scriptContent, 'utf8');
            await chInst(scriptPath, '755');

            try {
              const { stdout, stderr } = await execSdkInstall(scriptPath, {
                env: { ...process.env },
                shell: '/bin/bash',
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
            } catch (error: any) {
              await ulInst(scriptPath).catch(() => {});

              console.error(`[MCP] Install SDK error: ${error.message}`);

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
}
