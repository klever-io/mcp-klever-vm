import { getProjectTemplateFiles, getHelperScriptTemplateFiles } from './project-init-script.js';

describe('getProjectTemplateFiles', () => {
  it('returns all 8 expected files', () => {
    const result = getProjectTemplateFiles('my-token');

    const expectedFiles = [
      'scripts/common.sh',
      'scripts/deploy.sh',
      'scripts/upgrade.sh',
      'scripts/query.sh',
      'scripts/build.sh',
      'scripts/test.sh',
      'scripts/interact.sh',
      '.gitignore',
    ];

    expect(Object.keys(result.files)).toEqual(expect.arrayContaining(expectedFiles));
    expect(Object.keys(result.files)).toHaveLength(expectedFiles.length);
  });

  it('replaces $CONTRACT_NAME with the project name', () => {
    const result = getProjectTemplateFiles('my-token');

    for (const [path, content] of Object.entries(result.files)) {
      if (path === '.gitignore') continue;
      expect(content).not.toContain('$CONTRACT_NAME');
    }
  });

  it('includes project name in instructions', () => {
    const result = getProjectTemplateFiles('awesome-contract');
    expect(result.instructions).toContain('awesome-contract');
  });

  it('returns project structure directories', () => {
    const result = getProjectTemplateFiles('test');
    expect(result.projectStructure).toEqual(
      expect.arrayContaining(['src/', 'scripts/', 'output/'])
    );
  });

  it('reports no unresolved placeholders after replacement', () => {
    const result = getProjectTemplateFiles('test');
    expect(result.placeholders).toHaveLength(0);
  });
});

describe('getHelperScriptTemplateFiles', () => {
  it('returns all 8 expected files', () => {
    const result = getHelperScriptTemplateFiles();

    expect(Object.keys(result.files)).toHaveLength(8);
    expect(result.files['scripts/common.sh']).toBeDefined();
    expect(result.files['.gitignore']).toBeDefined();
  });

  it('uses default contract name when none provided', () => {
    const result = getHelperScriptTemplateFiles();
    expect(result.placeholders).toHaveLength(0);
    expect(result.instructions).toContain('my-contract');
  });

  it('applies custom contract name to scripts', () => {
    const result = getHelperScriptTemplateFiles('my-kda');

    for (const [path, content] of Object.entries(result.files)) {
      if (path === '.gitignore') continue;
      expect(content).not.toContain('$CONTRACT_NAME');
    }
    expect(result.placeholders).toHaveLength(0);
    expect(result.instructions).toContain('my-kda');
  });

  it('returns scripts/ in projectStructure', () => {
    const result = getHelperScriptTemplateFiles();
    expect(result.projectStructure).toContain('scripts/');
  });
});
