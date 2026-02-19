import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

interface PackageJson {
  version?: string;
}

function readAppVersion(): string {
  try {
    const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as PackageJson;
    return packageJson.version?.trim() || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

function readCommitSha(): string {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim() || 'dev';
  } catch {
    return 'dev';
  }
}

const appVersion = readAppVersion();
const commitSha = readCommitSha();

export default defineConfig({
  base: '/novel-task-tracker/',
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
    __APP_COMMIT_SHA__: JSON.stringify(commitSha)
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    exclude: ['e2e/**', 'node_modules/**', 'dist/**']
  }
});
