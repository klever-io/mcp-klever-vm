import { ContextPayload, ContextType } from '../types/index.js';

export interface KleverContractInfo {
  name: string;
  entrypoints: string[];
  views: string[];
  structs: string[];
  imports: string[];
  events: string[];
  storageMappers: string[];
  hasInit: boolean;
  hasUpgrade: boolean;
  contractType?: string;
  usesMultiValue: boolean;
  usesOptionalValue: boolean;
  proxyContracts: string[];
}

export class KleverParser {
  /**
   * Parse a Klever smart contract written in Rust using klever-vm-sdk-rs
   */
  static parseContract(content: string): KleverContractInfo {
    const info: KleverContractInfo = {
      name: '',
      entrypoints: [],
      views: [],
      structs: [],
      imports: [],
      events: [],
      storageMappers: [],
      hasInit: false,
      hasUpgrade: false,
      usesMultiValue: false,
      usesOptionalValue: false,
      proxyContracts: []
    };
    
    // Extract contract name
    const contractMatch = content.match(/#\[klever_sc::contract\]\s*(?:pub\s+)?trait\s+(\w+)/);
    if (contractMatch) {
      info.name = contractMatch[1];
    }
    
    // Extract imports
    const importRegex = /use\s+([^;]+);/g;
    let importMatch;
    while ((importMatch = importRegex.exec(content)) !== null) {
      info.imports.push(importMatch[1].trim());
    }
    
    // Extract entrypoints
    const entrypointRegex = /#\[endpoint(?:\(([^)]*)\))?\]\s*(?:async\s+)?fn\s+(\w+)/g;
    let entrypointMatch;
    while ((entrypointMatch = entrypointRegex.exec(content)) !== null) {
      const endpointName = entrypointMatch[1] || entrypointMatch[2];
      info.entrypoints.push(endpointName);
    }
    
    // Extract views
    const viewRegex = /#\[view(?:\(([^)]*)\))?\]\s*(?:async\s+)?fn\s+(\w+)/g;
    let viewMatch;
    while ((viewMatch = viewRegex.exec(content)) !== null) {
      const viewName = viewMatch[1] || viewMatch[2];
      info.views.push(viewName);
    }
    
    // Extract events
    const eventRegex = /#\[event\("([^"]+)"\)\]\s*fn\s+(\w+)/g;
    let eventMatch;
    while ((eventMatch = eventRegex.exec(content)) !== null) {
      info.events.push(eventMatch[1]);
    }
    
    // Extract storage mappers
    const storageRegex = /#\[storage_mapper\("([^"]+)"\)\]\s*fn\s+(\w+)/g;
    let storageMatch;
    while ((storageMatch = storageRegex.exec(content)) !== null) {
      info.storageMappers.push(storageMatch[1]);
    }
    
    // Check for init
    if (content.includes('#[init]')) {
      info.hasInit = true;
    }
    
    // Check for upgrade
    if (content.includes('#[upgrade]')) {
      info.hasUpgrade = true;
    }
    
    // Extract structs
    const structRegex = /#\[derive\([^)]*\)\]\s*(?:pub\s+)?struct\s+(\w+)/g;
    let structMatch;
    while ((structMatch = structRegex.exec(content)) !== null) {
      info.structs.push(structMatch[1]);
    }
    
    // Determine contract type
    if (content.includes('klever_sc::imports')) {
      if (info.entrypoints.some(ep => ['mint', 'burn', 'transfer'].includes(ep))) {
        info.contractType = 'token';
      } else if (info.entrypoints.some(ep => ['stake', 'unstake', 'claim'].includes(ep))) {
        info.contractType = 'staking';
      } else if (info.entrypoints.some(ep => ['swap', 'addLiquidity', 'removeLiquidity'].includes(ep))) {
        info.contractType = 'dex';
      } else if (info.entrypoints.some(ep => ['propose', 'vote', 'execute'].includes(ep))) {
        info.contractType = 'governance';
      } else {
        info.contractType = 'custom';
      }
    }
    
    // Check for MultiValue usage
    if (content.includes('MultiValueEncoded') || content.includes('MultiValueManagedVec')) {
      info.usesMultiValue = true;
    }
    
    // Check for OptionalValue usage
    if (content.includes('OptionalValue')) {
      info.usesOptionalValue = true;
    }
    
    // Extract proxy contracts
    const proxyRegex = /#\[klever_sc::proxy\]\s*(?:pub\s+)?trait\s+(\w+)/g;
    let proxyMatch;
    while ((proxyMatch = proxyRegex.exec(content)) !== null) {
      info.proxyContracts.push(proxyMatch[1]);
    }
    
    return info;
  }
  
  /**
   * Extract examples from contract code
   */
  static extractExamples(content: string, contractInfo: KleverContractInfo): ContextPayload[] {
    const examples: ContextPayload[] = [];
    
    // Extract init function example
    if (contractInfo.hasInit) {
      const initMatch = content.match(/#\[init\]\s*((?:async\s+)?fn\s+\w+[^{]*{[^}]+})/s);
      if (initMatch) {
        examples.push({
          type: 'code_example',
          content: initMatch[0],
          metadata: {
            title: `${contractInfo.name} - Init Function`,
            description: 'Contract initialization function example',
            tags: ['init', 'constructor', contractInfo.contractType || 'contract'],
            language: 'rust',
            contractType: contractInfo.contractType,
            relevanceScore: 0.8,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          relatedContextIds: []
        });
      }
    }
    
    // Extract endpoint examples
    for (const endpoint of contractInfo.entrypoints) {
      const endpointRegex = new RegExp(
        `#\\[endpoint(?:\\([^)]*\\))?\\]\\s*(?:async\\s+)?fn\\s+${endpoint}[^{]*{[^}]+}`,
        's'
      );
      const endpointMatch = content.match(endpointRegex);
      if (endpointMatch) {
        examples.push({
          type: 'code_example',
          content: endpointMatch[0],
          metadata: {
            title: `${contractInfo.name} - ${endpoint} Endpoint`,
            description: `Implementation of ${endpoint} endpoint`,
            tags: ['endpoint', endpoint, contractInfo.contractType || 'contract'],
            language: 'rust',
            contractType: contractInfo.contractType,
            relevanceScore: 0.7,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          relatedContextIds: []
        });
      }
    }
    
    return examples;
  }
  
  /**
   * Extract patterns and best practices from contract
   */
  static extractPatterns(content: string, contractInfo: KleverContractInfo): ContextPayload[] {
    const patterns: ContextPayload[] = [];
    
    // Check for require! pattern
    if (content.includes('require!(')) {
      const requireExamples = content.match(/require!\([^)]+\);/g);
      if (requireExamples && requireExamples.length > 0) {
        patterns.push({
          type: 'best_practice',
          content: requireExamples.join('\n'),
          metadata: {
            title: 'Input Validation with require!',
            description: 'Examples of using require! for input validation in Klever contracts',
            tags: ['validation', 'security', 'require'],
            language: 'rust',
            contractType: contractInfo.contractType,
            relevanceScore: 0.9,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          relatedContextIds: []
        });
      }
    }
    
    // Check for storage patterns
    if (content.includes('SingleValueMapper') || content.includes('VecMapper') || content.includes('SetMapper')) {
      const storagePatterns: string[] = [];
      
      if (content.includes('SingleValueMapper')) {
        storagePatterns.push('SingleValueMapper - For storing single values');
      }
      if (content.includes('VecMapper')) {
        storagePatterns.push('VecMapper - For storing lists/arrays');
      }
      if (content.includes('SetMapper')) {
        storagePatterns.push('SetMapper - For storing unique collections');
      }
      
      patterns.push({
        type: 'best_practice',
        content: `Storage patterns used in ${contractInfo.name}:\n${storagePatterns.join('\n')}`,
        metadata: {
          title: 'Klever Storage Patterns',
          description: 'Common storage patterns for Klever smart contracts',
          tags: ['storage', 'patterns', 'mappers'],
          language: 'rust',
          contractType: contractInfo.contractType,
          relevanceScore: 0.8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        relatedContextIds: []
      });
    }
    
    // Check for event patterns
    if (content.includes('#[event')) {
      patterns.push({
        type: 'best_practice',
        content: 'Contract uses events for logging important state changes',
        metadata: {
          title: 'Event Emission Pattern',
          description: 'Using events to log contract actions for off-chain monitoring',
          tags: ['events', 'logging', 'monitoring'],
          language: 'rust',
          contractType: contractInfo.contractType,
          relevanceScore: 0.7,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        relatedContextIds: []
      });
    }
    
    return patterns;
  }
  
  /**
   * Extract security considerations
   */
  static extractSecurityTips(content: string, contractInfo: KleverContractInfo): ContextPayload[] {
    const tips: ContextPayload[] = [];
    
    // Check for owner-only patterns
    if (content.includes('only_owner') || content.includes('require!(self.blockchain().get_caller() == self.owner().get())')) {
      tips.push({
        type: 'security_tip',
        content: 'Contract implements owner-only access control for sensitive functions',
        metadata: {
          title: 'Access Control Pattern',
          description: 'Restricting function access to contract owner',
          tags: ['security', 'access-control', 'owner'],
          language: 'rust',
          contractType: contractInfo.contractType,
          relevanceScore: 0.9,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        relatedContextIds: []
      });
    }
    
    // Check for reentrancy protection
    if (content.includes('ReentrancyGuard') || content.includes('nonReentrant')) {
      tips.push({
        type: 'security_tip',
        content: 'Contract implements reentrancy protection',
        metadata: {
          title: 'Reentrancy Protection',
          description: 'Protecting against reentrancy attacks',
          tags: ['security', 'reentrancy', 'protection'],
          language: 'rust',
          contractType: contractInfo.contractType,
          relevanceScore: 0.95,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        relatedContextIds: []
      });
    }
    
    return tips;
  }
  
  /**
   * Parse contract and extract all relevant contexts
   */
  static parseAndExtractContexts(content: string): ContextPayload[] {
    const contractInfo = this.parseContract(content);
    const contexts: ContextPayload[] = [];
    
    // Add contract overview
    contexts.push({
      type: 'documentation',
      content: JSON.stringify(contractInfo, null, 2),
      metadata: {
        title: `${contractInfo.name} Contract Overview`,
        description: 'Parsed contract structure and information',
        tags: ['overview', 'structure', contractInfo.contractType || 'contract'],
        language: 'rust',
        contractType: contractInfo.contractType,
        relevanceScore: 0.6,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      relatedContextIds: []
    });
    
    // Extract various context types
    contexts.push(...this.extractExamples(content, contractInfo));
    contexts.push(...this.extractPatterns(content, contractInfo));
    contexts.push(...this.extractSecurityTips(content, contractInfo));
    
    return contexts;
  }
}