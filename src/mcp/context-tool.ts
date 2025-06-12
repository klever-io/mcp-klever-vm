/**
 * Context-aware tool for MCP servers
 * 
 * This tool can be added to any MCP server to automatically
 * query the Klever VM knowledge base for relevant context
 */

export const contextAwareToolDefinition = {
  name: 'get_klever_context',
  description: 'Automatically retrieve relevant Klever VM development context based on the user query',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The user query or topic to get context for'
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
            'runtime_behavior'
          ]
        },
        description: 'Specific context types to include (optional)'
      },
      maxResults: {
        type: 'number',
        default: 5,
        description: 'Maximum number of contexts to return'
      }
    },
    required: ['query']
  }
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
        text: JSON.stringify({
          query: args.query,
          contexts: [
            {
              type: 'documentation',
              title: 'How to query Klever context',
              content: 'Use the query_context tool with your search terms',
              relevance: 0.9
            }
          ],
          suggestion: 'Connect to klever-vm MCP server for full context access'
        }, null, 2)
      }
    ]
  };
}