/**
 * Context-aware tool for MCP servers
 *
 * This tool can be added to any MCP server to automatically
 * query the Klever VM knowledge base for relevant context
 */

export const contextAwareToolDefinition = {
  name: 'get_klever_context',
  description:
    'Retrieve relevant Klever VM development context for a given query. Searches the knowledge base and returns matching entries with code examples, best practices, and documentation. Designed as a drop-in tool for external MCP servers that need Klever context.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description:
          'Natural-language query or topic to find context for (e.g. "storage mapper patterns", "deploy contract to testnet", "handle KDA token payments").',
      },
      includeTypes: {
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
          'Filter results to specific context types. Omit to include all types. Example: ["code_example", "best_practice"] for implementation guidance.',
      },
      maxResults: {
        type: 'integer',
        minimum: 1,
        maximum: 20,
        default: 5,
        description: 'Maximum number of context entries to return (1-20). Default: 5.',
      },
    },
    required: ['query'],
  },
  annotations: {
    title: 'Get Klever Context',
    readOnlyHint: true,
    idempotentHint: true,
    openWorldHint: false,
  },
};

/**
 * Tool handler that queries the Klever MCP server
 */
export async function handleGetKleverContext(args: {
  query: string;
  includeTypes?: string[];
  maxResults?: number;
}) {
  // This would connect to the Klever MCP server and query context
  // For now, returning a placeholder that shows the structure

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            query: args.query,
            contexts: [
              {
                type: 'documentation',
                title: 'How to query Klever context',
                content: 'Use the query_context tool with your search terms',
                relevance: 0.9,
              },
            ],
            suggestion: 'Connect to klever-vm MCP server for full context access',
          },
          null,
          2
        ),
      },
    ],
  };
}
