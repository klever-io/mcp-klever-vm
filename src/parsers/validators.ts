import { ContextPayload } from '../types/index.js';

export class KleverValidator {
  /**
   * Validate Klever smart contract code and extract potential issues
   */
  static validateContract(content: string): ContextPayload[] {
    const issues: ContextPayload[] = [];

    // Check event annotation format
    const badEventRegex = /#\[event\('[^']+'\)\]/g;
    if (badEventRegex.test(content)) {
      issues.push({
        type: 'error_pattern',
        content: 'Event annotations must use double quotes, not single quotes',
        metadata: {
          title: 'Invalid Event Annotation Format',
          description: 'Found event annotation using single quotes instead of double quotes',
          tags: ['validation', 'events', 'syntax-error'],
          language: 'rust',
          relevanceScore: 0.95,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        relatedContextIds: [],
      });
    }

    // Check for snake_case in event names
    const eventSnakeCaseRegex = /#\[event\("([^"]+)"\)\]/g;
    let match;
    while ((match = eventSnakeCaseRegex.exec(content)) !== null) {
      const eventName = match[1];
      if (eventName.includes('_')) {
        issues.push({
          type: 'error_pattern',
          content: `Event name "${eventName}" uses snake_case instead of camelCase`,
          metadata: {
            title: 'Event Name Convention Violation',
            description: 'Event names should use camelCase, not snake_case',
            tags: ['validation', 'events', 'naming-convention'],
            language: 'rust',
            relevanceScore: 0.8,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          relatedContextIds: [],
        });
      }
    }

    // Check for missing Self::Api in managed types
    const managedTypeRegex =
      /:\s*(ManagedBuffer|BigUint|ManagedAddress|ManagedVec|TokenIdentifier)\s*[;,>]/g;
    if (managedTypeRegex.test(content)) {
      issues.push({
        type: 'error_pattern',
        content: 'Managed types must include the API type parameter (e.g., BigUint<Self::Api>)',
        metadata: {
          title: 'Missing API Type Parameter',
          description: 'Managed types require Self::Api type parameter',
          tags: ['validation', 'types', 'managed-types'],
          language: 'rust',
          relevanceScore: 0.9,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        relatedContextIds: [],
      });
    }

    // Check for Option instead of OptionalValue in endpoints
    const endpointWithOption = /#\[endpoint[^\]]*\]\s*(?:async\s+)?fn\s+\w+[^{]*Option<[^>]+>/;
    if (endpointWithOption.test(content)) {
      issues.push({
        type: 'optimization',
        content:
          'Consider using OptionalValue<T> instead of Option<T> in endpoints for better gas efficiency',
        metadata: {
          title: 'Suboptimal Optional Parameter Usage',
          description: 'OptionalValue is more efficient than Option for endpoint parameters',
          tags: ['optimization', 'endpoints', 'gas-efficiency'],
          language: 'rust',
          relevanceScore: 0.7,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        relatedContextIds: [],
      });
    }

    // Check for missing require! validations
    const transferWithoutValidation =
      /fn\s+transfer[^{]*{(?:(?!require\s*!\s*\(\s*!to\.is_zero).)*$/s;
    if (transferWithoutValidation.test(content)) {
      issues.push({
        type: 'security_tip',
        content: 'Transfer functions should validate the recipient address is not zero',
        metadata: {
          title: 'Missing Zero Address Validation',
          description: 'Transfer function lacks require!(!to.is_zero()) validation',
          tags: ['security', 'validation', 'transfer'],
          language: 'rust',
          relevanceScore: 0.95,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        relatedContextIds: [],
      });
    }

    // Check for VecMapper used for whitelists
    const vecMapperWhitelist =
      /#\[storage_mapper\("[^"]*whitelist[^"]*"\)\]\s*fn\s+\w+[^;]*VecMapper/i;
    if (vecMapperWhitelist.test(content)) {
      issues.push({
        type: 'optimization',
        content:
          'Use SetMapper or UnorderedSetMapper for whitelists instead of VecMapper for O(1) lookups',
        metadata: {
          title: 'Inefficient Whitelist Storage',
          description: 'VecMapper has O(n) lookup time, use SetMapper for whitelists',
          tags: ['optimization', 'storage', 'whitelist'],
          language: 'rust',
          relevanceScore: 0.85,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        relatedContextIds: [],
      });
    }

    // Check for module naming convention
    const moduleSnakeCase = /#\[klever_sc::module\]\s*pub\s+trait\s+[a-z_]+/;
    if (moduleSnakeCase.test(content)) {
      issues.push({
        type: 'error_pattern',
        content: 'Module trait names should use PascalCase, not snake_case',
        metadata: {
          title: 'Module Naming Convention Violation',
          description: 'Module traits must use PascalCase naming convention',
          tags: ['validation', 'module', 'naming-convention'],
          language: 'rust',
          relevanceScore: 0.8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        relatedContextIds: [],
      });
    }

    return issues;
  }

  /**
   * Extract best practices from well-written contract code
   */
  static extractBestPractices(content: string): ContextPayload[] {
    const practices: ContextPayload[] = [];

    // Check for proper input validation
    if (content.includes('require!') && content.includes('is_zero()')) {
      practices.push({
        type: 'best_practice',
        content: 'Contract properly validates zero addresses',
        metadata: {
          title: 'Zero Address Validation',
          description: 'Contract implements proper zero address checks',
          tags: ['security', 'validation', 'best-practice'],
          language: 'rust',
          relevanceScore: 0.8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        relatedContextIds: [],
      });
    }

    // Check for event emission
    if (content.includes('#[event') && content.includes('self.') && content.includes('_event(')) {
      practices.push({
        type: 'best_practice',
        content: 'Contract emits events for important state changes',
        metadata: {
          title: 'Event Emission Pattern',
          description: 'Proper event emission for off-chain monitoring',
          tags: ['events', 'monitoring', 'best-practice'],
          language: 'rust',
          relevanceScore: 0.75,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        relatedContextIds: [],
      });
    }

    // Check for upgrade function
    if (content.includes('#[upgrade]')) {
      practices.push({
        type: 'best_practice',
        content: 'Contract implements upgrade functionality',
        metadata: {
          title: 'Upgradeable Contract Pattern',
          description: 'Contract can be upgraded to fix bugs or add features',
          tags: ['upgrade', 'maintenance', 'best-practice'],
          language: 'rust',
          relevanceScore: 0.7,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        relatedContextIds: [],
      });
    }

    return practices;
  }
}
