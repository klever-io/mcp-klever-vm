import type { Resource, ResourceTemplate } from '@modelcontextprotocol/sdk/types.js';
import type { ServerProfile } from './server.js';
import type { ContextService } from '../context/service.js';

/**
 * Knowledge categories matching the folders under src/knowledge/
 */
export const KNOWLEDGE_CATEGORIES = [
  'core',
  'storage',
  'events',
  'tokens',
  'modules',
  'tools',
  'scripts',
  'examples',
  'errors',
  'best-practices',
  'documentation',
] as const;

export type KnowledgeCategory = (typeof KNOWLEDGE_CATEGORIES)[number];

/**
 * Maps knowledge category names to tags used in the knowledge base.
 * Categories use kebab-case in URIs but knowledge entries use varied tag forms.
 */
export const CATEGORY_TAG_MAP: Record<KnowledgeCategory, string[]> = {
  core: ['core', 'contract-structure', 'imports', 'critical-differences'],
  storage: ['storage', 'mapper', 'singlemapper', 'mapmapper', 'setmapper', 'vecmapper'],
  events: ['events', 'event', 'indexed'],
  tokens: ['tokens', 'token', 'KLV', 'KDA', 'precision'],
  modules: ['modules', 'module', 'admin', 'pause', 'access-control'],
  tools: ['tools', 'koperator', 'ksc', 'CLI'],
  scripts: ['scripts', 'bash', 'build', 'deploy'],
  examples: ['examples', 'example', 'template'],
  errors: ['errors', 'error', 'common-mistakes', 'pitfalls'],
  'best-practices': ['best-practices', 'best_practice', 'security', 'optimization'],
  documentation: ['documentation', 'docs', 'guide', 'reference'],
};

/**
 * Returns MCP resource templates for the given server profile.
 */
export function getResourceTemplates(_profile: ServerProfile): ResourceTemplate[] {
  return [
    {
      uriTemplate: 'klever://knowledge/{category}',
      name: 'Klever Knowledge Category',
      description:
        'Browse knowledge base entries by category. Available categories: ' +
        KNOWLEDGE_CATEGORIES.join(', '),
      mimeType: 'text/markdown',
    },
  ];
}

/**
 * Returns static (non-templated) MCP resources.
 */
export function getStaticResources(_profile: ServerProfile): Resource[] {
  return [
    {
      uri: 'klever://knowledge/index',
      name: 'Klever Knowledge Base Index',
      description:
        'Overview of all knowledge categories with entry counts and descriptions',
      mimeType: 'text/markdown',
    },
  ];
}

/**
 * Reads a resource by URI and returns formatted content.
 */
export async function readResource(
  uri: string,
  contextService: ContextService
): Promise<{ uri: string; mimeType: string; text: string }> {
  const parsed = parseResourceUri(uri);

  if (parsed.type === 'index') {
    return {
      uri,
      mimeType: 'text/markdown',
      text: await buildKnowledgeIndex(contextService),
    };
  }

  if (parsed.type === 'category') {
    return {
      uri,
      mimeType: 'text/markdown',
      text: await buildCategoryContent(parsed.category, contextService),
    };
  }

  throw new Error(`Invalid resource URI: ${uri}`);
}

interface ParsedUri {
  type: 'index' | 'category';
  category: KnowledgeCategory;
}

function parseResourceUri(uri: string): ParsedUri {
  const match = uri.match(/^klever:\/\/knowledge\/(.+)$/);
  if (!match) {
    throw new Error(`Invalid resource URI: ${uri}. Expected format: klever://knowledge/{category}`);
  }

  const segment = match[1];

  if (segment === 'index') {
    return { type: 'index', category: 'core' };
  }

  if (KNOWLEDGE_CATEGORIES.includes(segment as KnowledgeCategory)) {
    return { type: 'category', category: segment as KnowledgeCategory };
  }

  throw new Error(
    `Unknown knowledge category: "${segment}". Available: ${KNOWLEDGE_CATEGORIES.join(', ')}`
  );
}

async function buildKnowledgeIndex(contextService: ContextService): Promise<string> {
  const lines: string[] = [
    '# Klever VM Knowledge Base',
    '',
    'Browse the knowledge base by category to find documentation, code examples,',
    'best practices, and troubleshooting guides for Klever smart contract development.',
    '',
    '| Category | Entries | Description |',
    '|---|---|---|',
  ];

  const categoryDescriptions: Record<KnowledgeCategory, string> = {
    core: 'Contract structure, imports, macros, and fundamental patterns',
    storage: 'Storage mapper types (Single, Map, Set, Vec) and usage patterns',
    events: 'Event definitions, annotations, indexed fields, and emission patterns',
    tokens: 'Token system, KLV/KDA precision, decimal handling, and transfers',
    modules: 'Built-in SDK modules (Admin, Pause) and access control',
    tools: 'CLI tools (koperator, ksc), argument formatting, and deployment',
    scripts: 'Build, deploy, and automation script patterns',
    examples: 'Complete contract examples and code templates',
    errors: 'Common mistakes, error patterns, and troubleshooting',
    'best-practices': 'Security tips, optimization strategies, and recommended patterns',
    documentation: 'SDK reference, API docs, and developer guides',
  };

  for (const category of KNOWLEDGE_CATEGORIES) {
    const tags = CATEGORY_TAG_MAP[category];
    const count = await contextService.count({ tags });
    const desc = categoryDescriptions[category];
    lines.push(`| [${category}](klever://knowledge/${category}) | ${count} | ${desc} |`);
  }

  lines.push(
    '',
    '## How to Use',
    '',
    'Read any category resource to get all entries in that category formatted as markdown.',
    'Each entry includes title, description, code snippets, and related tags.',
    ''
  );

  return lines.join('\n');
}

async function buildCategoryContent(
  category: KnowledgeCategory,
  contextService: ContextService
): Promise<string> {
  const tags = CATEGORY_TAG_MAP[category];
  const total = await contextService.count({ tags });
  const limit = 100;
  const result = await contextService.query({ tags, limit, offset: 0, includeTotal: false });

  const lines: string[] = [
    `# Klever Knowledge: ${category}`,
    '',
    total > limit
      ? `Showing ${result.results.length} of ${total} entries in this category.`
      : `${total} entries in this category.`,
    '',
  ];

  if (result.results.length === 0) {
    lines.push('No entries found for this category.');
    lines.push('');
    return lines.join('\n');
  }

  for (const entry of result.results) {
    lines.push(`## ${entry.metadata.title}`);
    lines.push('');

    if (entry.metadata.description) {
      lines.push(entry.metadata.description);
      lines.push('');
    }

    const lang = entry.metadata.language || 'rust';
    lines.push(`\`\`\`${lang}`);
    lines.push(entry.content);
    lines.push('```');
    lines.push('');

    if (entry.metadata.tags.length > 0) {
      lines.push(`**Tags**: ${entry.metadata.tags.join(', ')}`);
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}
