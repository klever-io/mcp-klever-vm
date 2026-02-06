import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

function loadPackageVersion(): string {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const pkgPath = join(__dirname, '..', 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    return pkg.version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

export const VERSION = loadPackageVersion();
export const GIT_SHA = process.env.GIT_SHA || 'dev';
export const BUILD_TIME = process.env.BUILD_TIME || new Date().toISOString();

export function getVersionInfo() {
  return {
    version: VERSION,
    gitSha: GIT_SHA,
    buildTime: BUILD_TIME,
  };
}
