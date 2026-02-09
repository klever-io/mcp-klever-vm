import { getPromptDefinitions, getPromptMessages } from './prompts.js';

describe('getPromptDefinitions', () => {
  it('returns 2 prompts for local profile', () => {
    const prompts = getPromptDefinitions('local');
    expect(prompts).toHaveLength(2);
    expect(prompts.map(p => p.name)).toEqual(['create_smart_contract', 'add_feature']);
  });

  it('returns 2 prompts for public profile', () => {
    const prompts = getPromptDefinitions('public');
    expect(prompts).toHaveLength(2);
    expect(prompts.map(p => p.name)).toEqual(['create_smart_contract', 'add_feature']);
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
