#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import process from 'node:process';

const targets = ['README.md', 'docs'];
const lycheeArgs = [
  '--no-progress',
  '--offline',
  '--exclude',
  '^https?://',
  '--exclude',
  '^mailto:',
  ...targets,
];
const dockerArgs = [
  'run',
  '--rm',
  '-v',
  `${process.cwd()}:/workdir`,
  '-w',
  '/workdir',
  'ghcr.io/lycheeverse/lychee:latest',
  ...lycheeArgs,
];

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: process.env,
    ...options,
  });
}

function hasCommand(command) {
  const probe = spawnSync('sh', ['-lc', `command -v ${command}`], {
    cwd: process.cwd(),
    stdio: 'ignore',
    env: process.env,
  });
  return probe.status === 0;
}

if (hasCommand('lychee')) {
  const result = run('lychee', lycheeArgs);
  process.exit(result.status ?? 1);
}

if (hasCommand('docker')) {
  const dockerInfo = spawnSync('docker', ['info'], {
    cwd: process.cwd(),
    stdio: 'ignore',
    env: process.env,
  });

  if (dockerInfo.status === 0) {
    const result = run('docker', dockerArgs);
    process.exit(result.status ?? 1);
  }
}

console.error('docs:links could not find a runnable link checker.');
console.error('');
console.error('Choose one of these fixes, then rerun `npm run docs:links`:');
console.error('1. Install lychee locally:');
console.error('   brew install lychee');
console.error('   # or: cargo install lychee');
console.error('2. Start Docker/OrbStack so the Docker fallback can run.');
console.error('');
console.error('If you want the Docker-only path after Docker is ready, run:');
console.error('  npm run docs:links:docker');
process.exit(1);
