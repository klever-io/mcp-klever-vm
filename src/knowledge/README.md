# Klever Knowledge Base

## Overview

The Klever knowledge base provides comprehensive documentation, patterns, and examples for Klever smart contract development. It's organized in a modular structure by topic and type for easy navigation and maintenance.

## Directory Structure

```
src/knowledge/
├── README.md                    # This file
├── index.ts                    # Main export combining all modules
├── types.ts                    # Shared types and helper functions
│
├── core/                       # Core concepts and basics
│   ├── index.ts               # Category exports
│   ├── imports.ts             # Import patterns, RandomnessSource info
│   ├── contract-structure.ts  # Basic templates and structure
│   └── differences.ts         # Klever vs MultiversX differences
│
├── storage/                    # Storage patterns
│   ├── index.ts               # Category exports
│   ├── mappers.ts             # Storage mapper selection guide
│   ├── namespace.ts           # Namespace organization patterns
│   ├── views.ts               # View endpoints for storage
│   └── performance.ts         # Performance comparisons
│
├── events/                     # Event handling
│   ├── index.ts               # Category exports
│   ├── parameter-rules.ts     # One-data parameter rule
│   └── annotations.ts         # Event annotation best practices
│
├── tokens/                     # Token handling
│   ├── index.ts               # Category exports
│   ├── klv-kfi.ts            # KLV/KFI decimals, conversions, critical info
│   └── payment-patterns.ts   # Payment validation patterns
│
├── modules/                    # Built-in modules
│   ├── index.ts               # Category exports
│   ├── admin.ts              # Admin module patterns and mistakes
│   ├── pause.ts              # Pause module patterns
│   └── access-control.ts     # Access control patterns
│
├── tools/                      # Development tools
│   ├── index.ts               # Category exports
│   ├── koperator.ts          # Complete koperator reference
│   └── ksc.ts                # KSC commands and build tools
│
├── scripts/                    # Helper scripts
│   ├── index.ts               # Category exports
│   ├── common-utilities.ts   # Common bash utilities
│   └── deployment.ts         # Deploy, upgrade, build scripts
│
├── examples/                   # Complete examples
│   ├── index.ts               # Category exports
│   ├── lottery-game.ts       # Complete lottery game
│   ├── staking-contract.ts   # Complete staking example
│   ├── token-mappers.ts      # Token mapper patterns
│   └── cross-contract.ts     # Cross-contract communication
│
├── errors/                     # Error patterns
│   ├── index.ts               # Category exports
│   ├── common-errors.ts      # Common errors and solutions
│   └── event-errors.ts       # Event-specific errors
│
├── best-practices/            # Best practices
│   ├── index.ts               # Category exports
│   ├── validation.ts         # Input validation patterns
│   ├── optimization.ts       # Gas optimization techniques
│   ├── error-handling.ts     # Error handling patterns
│   └── token-types.ts        # Token type clarifications
│
└── documentation/             # Reference documentation
    ├── index.ts               # Category exports
    ├── api-reference.ts       # Klever VM API reference
    └── discovery-guide.ts     # How to find examples
```

## Content Categories

### Core Concepts
- **Tokens**: KLV/KFI decimals, payment patterns, token type clarifications
- **Events**: Parameter rules, annotation best practices, error patterns
- **Storage**: Mapper selection guide, namespace patterns, views, performance comparisons
- **Modules**: Admin module patterns, pause module, access control

### Development Tools
- **Koperator**: Complete command reference, syntax guide, examples
- **KSC**: Build commands, project setup, configuration
- **Scripts**: Build, deploy, query, and utility scripts

### Examples & Patterns
- **Complete Examples**: Lottery game, staking contract, cross-contract communication
- **Error Patterns**: Common mistakes and solutions
- **Best Practices**: Validation, optimization, error handling
- **Documentation**: API reference, discovery guides

## Key Features

### 🎯 Critical Information
- **Payment syntax**: `--values` NOT `--value` 
- **Decimals**: KLV/KFI ALWAYS 6 decimals
- **Koperator syntax**: Complete reference with examples
- **Event rules**: One-data parameter limitation
- **Storage patterns**: Comprehensive mapper selection guide

### 📚 Comprehensive Coverage
- **95+ knowledge entries** covering all aspects of Klever development
- **11 categories** for easy navigation
- **Real-world examples**: Lottery, staking, cross-contract patterns
- **Complete tool references**: koperator, ksc, API
- **Best practices**: Security, optimization, error handling

## Adding New Knowledge

### 1. Choose the Right Category
Select the most appropriate category folder for your knowledge entry.

### 2. Use the Helper Function
```typescript
import { createKnowledgeEntry } from '../types.js';

export const myKnowledge = [
  createKnowledgeEntry(
    'documentation',  // type
    'Content here',   // content
    {
      title: 'Entry Title',
      description: 'Brief description',
      tags: ['tag1', 'tag2'],
      relevanceScore: 0.8,  // optional, defaults to 0.8
    }
  ),
];
```

### 3. Export and Include
- Export from your module file
- Import in the category's index.ts
- The main index.ts will automatically include it

## Architecture Benefits

1. **Maintainability**: Each topic in its own focused module
2. **Discoverability**: Logical organization by functionality
3. **Type Safety**: Full TypeScript support with strong typing
4. **Scalability**: Easy to extend with new knowledge
5. **Testing**: Modules can be tested independently
6. **Collaboration**: Clear separation allows parallel development

## Usage

### Import Everything
```typescript
import { kleverKnowledge } from './knowledge/index.js';
```

### Import Specific Categories
```typescript
import { tokenKnowledge, eventKnowledge } from './knowledge/index.js';
```

### Import Individual Modules
```typescript
import klvKfiKnowledge from './knowledge/tokens/klv-kfi.js';
```

## Quick Navigation

### Critical Entries
- `tokens/klv-kfi.ts` - CRITICAL decimal information
- `events/parameter-rules.ts` - Event one-data rule
- `tools/koperator.ts` - Complete koperator reference
- `best-practices/token-types.ts` - Token type clarifications

### Common Tasks
- **New project**: `documentation/api-reference.ts`
- **Deployment**: `scripts/deployment.ts`
- **Storage patterns**: `storage/mappers.ts`
- **Error handling**: `errors/common-errors.ts`
- **Examples**: `examples/` folder

## Quality Standards

### Code Quality
- TypeScript strict mode enabled
- No circular dependencies
- All categories properly indexed
- Consistent structure across modules

### Content Guidelines
- Clear, actionable documentation
- Working code examples
- Critical patterns highlighted
- Common mistakes documented

### Testing
- All entries successfully ingest
- Build verification on changes
- Example code tested
- No broken references