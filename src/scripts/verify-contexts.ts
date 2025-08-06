#!/usr/bin/env tsx

import { kleverKnowledge } from '../knowledge/index.js';
import { ContextType, ContextPayload } from '../types/index.js';

console.log('🔍 Klever Knowledge Base Context Analysis\n');

// Convert new knowledge format to ContextPayload format
const allKleverContexts: ContextPayload[] = kleverKnowledge.map(entry => ({
  type: entry.type,
  content: entry.content,
  metadata: entry.metadata,
  relatedContextIds: entry.relatedContextIds || [],
}));

// Count contexts by type
const typeCounts = new Map<ContextType, number>();
const typeExamples = new Map<ContextType, string[]>();

for (const context of allKleverContexts) {
  const count = typeCounts.get(context.type) || 0;
  typeCounts.set(context.type, count + 1);

  // Store first 3 examples of each type
  const examples = typeExamples.get(context.type) || [];
  if (examples.length < 3) {
    examples.push(context.metadata.title);
  }
  typeExamples.set(context.type, examples);
}

// Display results
console.log('📊 Context Type Distribution:');
console.log('================================');

const sortedTypes = Array.from(typeCounts.entries()).sort((a, b) => b[1] - a[1]);

for (const [type, count] of sortedTypes) {
  console.log(`\n${type.toUpperCase()} (${count} contexts)`);
  const examples = typeExamples.get(type) || [];
  examples.forEach(title => console.log(`  • ${title}`));
}

console.log('\n================================');
console.log(`📁 Total Contexts: ${allKleverContexts.length}`);

// Verify content types
console.log('\n🔎 Content Type Verification:');

const rustCodeContexts = allKleverContexts.filter(
  ctx => ctx.type === 'code_example' && ctx.metadata.language === 'rust'
);
const bashContexts = allKleverContexts.filter(ctx => ctx.metadata.language === 'bash');
const jsonContexts = allKleverContexts.filter(ctx => ctx.metadata.language === 'json');

console.log(`  • Rust code examples: ${rustCodeContexts.length}`);
console.log(`  • Bash scripts: ${bashContexts.length}`);
console.log(`  • JSON examples: ${jsonContexts.length}`);

// Check for misclassified contexts
console.log('\n⚠️  Potential Issues:');

const bashCodeExamples = allKleverContexts.filter(
  ctx => ctx.type === 'code_example' && ctx.metadata.language === 'bash'
);

if (bashCodeExamples.length > 0) {
  console.log(`  • Found ${bashCodeExamples.length} bash scripts classified as code_example`);
  bashCodeExamples.forEach(ctx => console.log(`    - ${ctx.metadata.title}`));
}

const deploymentTools = allKleverContexts.filter(ctx => ctx.type === 'deployment_tool');

console.log(`\n✅ Deployment Tools: ${deploymentTools.length}`);
deploymentTools.forEach(ctx => console.log(`  • ${ctx.metadata.title}`));
