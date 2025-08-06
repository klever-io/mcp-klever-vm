import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { z } from 'zod';

// Response schemas
const QueryContextResponseSchema = z.object({
  success: z.boolean(),
  results: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      content: z.string(),
      metadata: z.object({
        title: z.string(),
        description: z.string().optional(),
        tags: z.array(z.string()),
        relevanceScore: z.number(),
      }),
      score: z.number().optional(),
    })
  ),
  total: z.number(),
  pagination: z.object({
    offset: z.number(),
    limit: z.number(),
  }),
});

export class KleverContextClient {
  private client: Client;
  private connected: boolean = false;

  constructor() {
    this.client = new Client(
      {
        name: 'klever-context-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );
  }

  async connect() {
    const transport = new StdioClientTransport({
      command: 'node',
      args: ['--experimental-vm-modules', './dist/index.js'],
      env: {
        ...process.env,
        MODE: 'mcp',
        STORAGE_TYPE: 'memory',
      },
    });

    await this.client.connect(transport);
    this.connected = true;
  }

  async queryContext(
    query: string,
    options?: {
      types?: string[];
      tags?: string[];
      limit?: number;
    }
  ) {
    if (!this.connected) {
      await this.connect();
    }

    try {
      const result = await this.client.callTool({
        name: 'query_context',
        arguments: {
          query,
          types: options?.types,
          tags: options?.tags,
          limit: options?.limit || 5,
          offset: 0,
        },
      });

      // Parse the response
      const content = (result as any).content[0];
      if (content?.type === 'text') {
        const parsed = JSON.parse(content.text);
        return QueryContextResponseSchema.parse(parsed);
      }

      throw new Error('Unexpected response format');
    } catch (error) {
      console.error('Error querying context:', error);
      return null;
    }
  }

  async getRelevantContext(userMessage: string): Promise<string> {
    // Extract key terms from the message
    const keywords = this.extractKeywords(userMessage);

    // Query for relevant contexts
    const contexts = await this.queryContext(keywords.join(' '), {
      limit: 3,
    });

    if (!contexts || contexts.results.length === 0) {
      return '';
    }

    // Format contexts for inclusion
    return this.formatContexts(contexts.results);
  }

  private extractKeywords(message: string): string[] {
    // Simple keyword extraction - can be improved with NLP
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
    ];

    const words = message.toLowerCase().split(/\s+/);
    const found: string[] = [];

    for (const keyword of kleverKeywords) {
      if (message.toLowerCase().includes(keyword)) {
        found.push(keyword);
      }
    }

    // Also include any words that might be relevant
    const additionalWords = words.filter(
      w =>
        w.length > 3 &&
        !['what', 'how', 'when', 'where', 'why', 'can', 'could', 'would', 'should'].includes(w)
    );

    return [...new Set([...found, ...additionalWords.slice(0, 3)])];
  }

  private formatContexts(contexts: any[]): string {
    let formatted = '\n## Relevant Klever VM Context:\n\n';

    for (const ctx of contexts) {
      formatted += `### ${ctx.metadata.title}\n`;
      if (ctx.metadata.description) {
        formatted += `${ctx.metadata.description}\n\n`;
      }
      formatted += `\`\`\`${ctx.metadata.language || 'rust'}\n${ctx.content}\n\`\`\`\n\n`;
    }

    return formatted;
  }

  async disconnect() {
    if (this.connected) {
      await this.client.close();
      this.connected = false;
    }
  }
}

// Example usage for MCP client middleware
export async function withKleverContext(
  userMessage: string,
  handler: (message: string, context: string) => Promise<string>
): Promise<string> {
  const client = new KleverContextClient();

  try {
    // Get relevant context
    const context = await client.getRelevantContext(userMessage);

    // Call the handler with the original message and context
    return await handler(userMessage, context);
  } finally {
    await client.disconnect();
  }
}
