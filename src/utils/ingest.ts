import fs from 'fs/promises';
import path from 'path';
import { ContextService } from '../context/service.js';
import { KleverParser } from '../parsers/klever.js';

export class ContractIngester {
  constructor(private contextService: ContextService) {}

  /**
   * Ingest a single Klever contract file
   */
  async ingestContract(filePath: string, author?: string): Promise<string[]> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const fileName = path.basename(filePath);

      // Parse and extract contexts
      const contexts = KleverParser.parseAndExtractContexts(content);

      // Add author if provided
      if (author) {
        contexts.forEach(ctx => {
          ctx.metadata.author = author;
        });
      }

      // Ingest all contexts
      const ids: string[] = [];
      for (const context of contexts) {
        const id = await this.contextService.ingest(context);
        ids.push(id);
      }

      console.log(`Ingested ${ids.length} contexts from ${fileName}`);
      return ids;
    } catch (error) {
      console.error(`Error ingesting contract ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Ingest all Rust files in a directory
   */
  async ingestDirectory(dirPath: string, author?: string): Promise<string[]> {
    const ids: string[] = [];

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          // Recursively process subdirectories
          const subIds = await this.ingestDirectory(fullPath, author);
          ids.push(...subIds);
        } else if (entry.isFile() && entry.name.endsWith('.rs')) {
          // Process Rust files
          try {
            const fileIds = await this.ingestContract(fullPath, author);
            ids.push(...fileIds);
          } catch (error) {
            console.error(`Failed to ingest ${fullPath}:`, error);
          }
        }
      }

      return ids;
    } catch (error) {
      console.error(`Error processing directory ${dirPath}:`, error);
      throw error;
    }
  }

  /**
   * Ingest common Klever patterns and best practices
   */
  async ingestCommonPatterns(): Promise<void> {
    const commonPatterns = [
      {
        type: 'best_practice' as const,
        content: `#[klever_sc::contract]
pub trait MyContract {
    #[init]
    fn init(&self) {
        // Initialize contract state
    }
    
    #[upgrade]
    fn upgrade(&self) {
        // Handle contract upgrades
    }
}`,
        metadata: {
          title: 'Basic Contract Structure',
          description: 'Standard structure for a Klever smart contract',
          tags: ['structure', 'template', 'basic'],
          language: 'rust',
          relevanceScore: 0.9,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      {
        type: 'security_tip' as const,
        content: `// Always validate inputs
require!(amount > 0, "Amount must be positive");
require!(self.blockchain().get_caller() == self.owner().get(), "Only owner can call this");`,
        metadata: {
          title: 'Input Validation Best Practices',
          description: 'Always validate inputs and check permissions',
          tags: ['security', 'validation', 'require'],
          language: 'rust',
          relevanceScore: 0.95,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      {
        type: 'optimization' as const,
        content: `// Use storage mappers efficiently
#[view]
#[storage_mapper("my_value")]
fn my_value(&self) -> SingleValueMapper<BigUint>;

// Batch operations when possible
for item in items {
    self.process_item(item);
}`,
        metadata: {
          title: 'Storage Optimization',
          description: 'Efficient storage usage patterns',
          tags: ['optimization', 'storage', 'performance'],
          language: 'rust',
          relevanceScore: 0.8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      {
        type: 'error_pattern' as const,
        content: `// Common error: Not checking for zero address
require!(!address.is_zero(), "Invalid address");

// Common error: Integer overflow
let result = a.checked_add(&b).ok_or("Overflow")?;`,
        metadata: {
          title: 'Common Error Patterns',
          description: 'Frequent mistakes and how to avoid them',
          tags: ['errors', 'debugging', 'common-mistakes'],
          language: 'rust',
          relevanceScore: 0.85,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    ];

    for (const pattern of commonPatterns) {
      await this.contextService.ingest({
        ...pattern,
        relatedContextIds: [],
      });
    }

    console.log(`Ingested ${commonPatterns.length} common patterns`);
  }
}
