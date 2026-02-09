import { getPromptDefinitions, getPromptMessages } from './prompts.js';

describe('getPromptDefinitions', () => {
  it('returns 4 prompts for local profile', () => {
    const prompts = getPromptDefinitions('local');
    expect(prompts).toHaveLength(4);
    expect(prompts.map(p => p.name)).toEqual([
      'create_smart_contract',
      'add_feature',
      'debug_error',
      'review_contract',
    ]);
  });

  it('returns 4 prompts for public profile', () => {
    const prompts = getPromptDefinitions('public');
    expect(prompts).toHaveLength(4);
    expect(prompts.map(p => p.name)).toEqual([
      'create_smart_contract',
      'add_feature',
      'debug_error',
      'review_contract',
    ]);
  });

  it('create_smart_contract has optional arguments', () => {
    const prompts = getPromptDefinitions('local');
    const prompt = prompts.find(p => p.name === 'create_smart_contract')!;
    expect(prompt.arguments).toHaveLength(2);
    expect(prompt.arguments![0].name).toBe('contractName');
    expect(prompt.arguments![0].required).toBe(false);
    expect(prompt.arguments![1].name).toBe('contractType');
    expect(prompt.arguments![1].required).toBe(false);
  });

  it('add_feature has featureName as required argument', () => {
    const prompts = getPromptDefinitions('local');
    const prompt = prompts.find(p => p.name === 'add_feature')!;
    expect(prompt.arguments).toHaveLength(2);
    expect(prompt.arguments![0].name).toBe('featureName');
    expect(prompt.arguments![0].required).toBe(true);
  });

  it('debug_error has required errorMessage and optional sourceCode arguments', () => {
    const prompts = getPromptDefinitions('local');
    const prompt = prompts.find(p => p.name === 'debug_error')!;
    expect(prompt.arguments).toHaveLength(2);
    expect(prompt.arguments![0].name).toBe('errorMessage');
    expect(prompt.arguments![0].required).toBe(true);
    expect(prompt.arguments![1].name).toBe('sourceCode');
    expect(prompt.arguments![1].required).toBe(false);
  });

  it('review_contract has optional contractName argument', () => {
    const prompts = getPromptDefinitions('local');
    const prompt = prompts.find(p => p.name === 'review_contract')!;
    expect(prompt.arguments).toHaveLength(1);
    expect(prompt.arguments![0].name).toBe('contractName');
    expect(prompt.arguments![0].required).toBe(false);
  });
});

describe('getPromptMessages', () => {
  describe('create_smart_contract', () => {
    it('includes knowledge discovery phase', () => {
      const result = getPromptMessages('create_smart_contract', {}, 'local');
      const text = result.messages[0].content.text;
      expect(text).toContain('Phase 0');
      expect(text).toContain('Knowledge Discovery');
      expect(text).toContain('query_context');
    });

    it('references init_klever_project tool', () => {
      const result = getPromptMessages('create_smart_contract', {}, 'local');
      const text = result.messages[0].content.text;
      expect(text).toContain('init_klever_project');
    });

    it('includes all phases', () => {
      const result = getPromptMessages('create_smart_contract', {}, 'local');
      const text = result.messages[0].content.text;
      expect(text).toContain('Phase 0');
      expect(text).toContain('Phase 1');
      expect(text).toContain('Phase 2');
      expect(text).toContain('Phase 3');
      expect(text).toContain('Phase 4');
    });

    it('uses contractName and contractType from args', () => {
      const result = getPromptMessages(
        'create_smart_contract',
        { contractName: 'MyToken', contractType: 'token' },
        'local'
      );
      const text = result.messages[0].content.text;
      expect(text).toContain('MyToken');
      expect(text).toContain('token');
    });

    it('uses defaults when args are empty', () => {
      const result = getPromptMessages('create_smart_contract', {}, 'local');
      const text = result.messages[0].content.text;
      expect(text).toContain('my-contract');
      expect(text).toContain('general-purpose');
    });

    it('returns a single user-role message', () => {
      const result = getPromptMessages('create_smart_contract', {}, 'local');
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].role).toBe('user');
      expect(result.messages[0].content.type).toBe('text');
    });

    it('includes description in result', () => {
      const result = getPromptMessages(
        'create_smart_contract',
        { contractName: 'MyToken' },
        'local'
      );
      expect(result.description).toContain('MyToken');
    });
  });

  describe('add_feature', () => {
    it('includes MCP query instructions', () => {
      const result = getPromptMessages(
        'add_feature',
        { featureName: 'staking' },
        'local'
      );
      const text = result.messages[0].content.text;
      expect(text).toContain('query_context');
      expect(text).toContain('staking');
    });

    it('includes the feature name in the message', () => {
      const result = getPromptMessages(
        'add_feature',
        { featureName: 'token swap' },
        'local'
      );
      const text = result.messages[0].content.text;
      expect(text).toContain('token swap');
    });

    it('includes contractName when provided', () => {
      const result = getPromptMessages(
        'add_feature',
        { featureName: 'staking', contractName: 'MyDeFi' },
        'local'
      );
      const text = result.messages[0].content.text;
      expect(text).toContain('MyDeFi');
    });
  });

  describe('debug_error', () => {
    it('includes error classification step', () => {
      const result = getPromptMessages(
        'debug_error',
        { errorMessage: 'error[E0308]: mismatched types' },
        'local'
      );
      const text = result.messages[0].content.text;
      expect(text).toContain('Classify the Error');
      expect(text).toContain('Compiler error');
      expect(text).toContain('Runtime/VM error');
      expect(text).toContain('koperator CLI error');
    });

    it('references search_documentation and query_context tools', () => {
      const result = getPromptMessages(
        'debug_error',
        { errorMessage: 'cannot find type BigUint' },
        'local'
      );
      const text = result.messages[0].content.text;
      expect(text).toContain('search_documentation');
      expect(text).toContain('query_context');
    });

    it('includes the error message in the prompt', () => {
      const result = getPromptMessages(
        'debug_error',
        { errorMessage: 'error[E0599]: no method named `set`' },
        'local'
      );
      const text = result.messages[0].content.text;
      expect(text).toContain('error[E0599]: no method named `set`');
    });

    it('includes analyze_contract reference when sourceCode is provided', () => {
      const result = getPromptMessages(
        'debug_error',
        { errorMessage: 'compilation failed', sourceCode: 'pub trait MyContract {}' },
        'local'
      );
      const text = result.messages[0].content.text;
      expect(text).toContain('analyze_contract');
      expect(text).toContain('pub trait MyContract {}');
    });

    it('does not include analyze_contract when sourceCode is absent', () => {
      const result = getPromptMessages(
        'debug_error',
        { errorMessage: 'compilation failed' },
        'local'
      );
      const text = result.messages[0].content.text;
      expect(text).not.toContain('analyze_contract');
    });

    it('includes diagnosis and fix steps', () => {
      const result = getPromptMessages(
        'debug_error',
        { errorMessage: 'some error' },
        'local'
      );
      const text = result.messages[0].content.text;
      expect(text).toContain('Step 3');
      expect(text).toContain('Diagnose');
      expect(text).toContain('Step 4');
      expect(text).toContain('Fix');
      expect(text).toContain('Before/After');
    });

    it('returns a single user-role message', () => {
      const result = getPromptMessages(
        'debug_error',
        { errorMessage: 'test error' },
        'local'
      );
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].role).toBe('user');
      expect(result.messages[0].content.type).toBe('text');
    });
  });

  describe('review_contract', () => {
    it('includes analyze_contract in phase 1', () => {
      const result = getPromptMessages('review_contract', {}, 'local');
      const text = result.messages[0].content.text;
      expect(text).toContain('Phase 1');
      expect(text).toContain('Automated Analysis');
      expect(text).toContain('analyze_contract');
    });

    it('includes security review with search_documentation', () => {
      const result = getPromptMessages('review_contract', {}, 'local');
      const text = result.messages[0].content.text;
      expect(text).toContain('Phase 2');
      expect(text).toContain('Security Review');
      expect(text).toContain('search_documentation');
      expect(text).toContain('access control');
      expect(text).toContain('payment validation');
    });

    it('includes code quality review phase', () => {
      const result = getPromptMessages('review_contract', {}, 'local');
      const text = result.messages[0].content.text;
      expect(text).toContain('Phase 3');
      expect(text).toContain('Code Quality');
      expect(text).toContain('gas optimization');
      expect(text).toContain('Event emissions');
      expect(text).toContain('Storage mapper');
    });

    it('includes summary with severity levels', () => {
      const result = getPromptMessages('review_contract', {}, 'local');
      const text = result.messages[0].content.text;
      expect(text).toContain('Phase 4');
      expect(text).toContain('Critical Issues');
      expect(text).toContain('Warnings');
      expect(text).toContain('Suggestions');
      expect(text).toContain('Positive Observations');
    });

    it('includes contractName when provided', () => {
      const result = getPromptMessages(
        'review_contract',
        { contractName: 'MyDeFi' },
        'local'
      );
      const text = result.messages[0].content.text;
      expect(text).toContain('MyDeFi');
      expect(result.description).toContain('MyDeFi');
    });

    it('returns a single user-role message', () => {
      const result = getPromptMessages('review_contract', {}, 'local');
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].role).toBe('user');
      expect(result.messages[0].content.type).toBe('text');
    });
  });

  describe('profile-aware content', () => {
    it('public mode mentions template-returning tools for create_smart_contract', () => {
      const result = getPromptMessages('create_smart_contract', {}, 'public');
      const text = result.messages[0].content.text;
      expect(text).toContain('returns file contents');
    });

    it('local mode mentions scaffold for create_smart_contract', () => {
      const result = getPromptMessages('create_smart_contract', {}, 'local');
      const text = result.messages[0].content.text;
      expect(text).toContain('scaffold the project directory');
    });

    it('public mode mentions template for add_feature', () => {
      const result = getPromptMessages(
        'add_feature',
        { featureName: 'staking' },
        'public'
      );
      const text = result.messages[0].content.text;
      expect(text).toContain('script templates');
    });

    it('local mode mentions regenerate for add_feature', () => {
      const result = getPromptMessages(
        'add_feature',
        { featureName: 'staking' },
        'local'
      );
      const text = result.messages[0].content.text;
      expect(text).toContain('regenerate automation scripts');
    });
  });

  describe('error handling', () => {
    it('throws for unknown prompt name', () => {
      expect(() => getPromptMessages('nonexistent', {}, 'local')).toThrow(
        'Unknown prompt: nonexistent'
      );
    });
  });
});
