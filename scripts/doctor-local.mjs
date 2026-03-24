#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const cwd = process.cwd();
const packageJsonPath = path.join(cwd, 'package.json');
const packageLockPath = path.join(cwd, 'package-lock.json');
const nodeModulesPath = path.join(cwd, 'node_modules');
const nvmrcPath = path.join(cwd, '.nvmrc');

const checks = [];

function addCheck(ok, label, detail, nextStep) {
  checks.push({ ok, label, detail, nextStep });
}

if (!existsSync(packageJsonPath)) {
  console.error('✖ package.json not found. Run this command from the repository root.');
  process.exit(1);
}

const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const nvmrcExists = existsSync(nvmrcPath);
const nvmrcVersion = nvmrcExists ? readFileSync(nvmrcPath, 'utf8').trim() : null;
const npmProbe = spawnSync('npm', ['--version'], { cwd, stdio: 'pipe' });
const npmAvailable = npmProbe.status === 0;
const npmVersion = npmAvailable ? npmProbe.stdout.toString().trim() : null;

addCheck(true, 'Repository root', `package.json found at ${packageJsonPath}`);
addCheck(nvmrcExists, 'Node version file', nvmrcExists ? `.nvmrc present (${nvmrcVersion})` : '.nvmrc missing', 'Add `.nvmrc` so local Node selection stays aligned with CI.');
addCheck(existsSync(packageLockPath), 'Lockfile', existsSync(packageLockPath) ? 'package-lock.json present' : 'package-lock.json missing', 'Restore `package-lock.json` before install/verify commands.');
addCheck(npmAvailable, 'npm available', npmAvailable ? `npm ${npmVersion}` : 'npm command not found', 'Install Node.js/npm or reactivate your shell environment before local verify commands.');
addCheck(existsSync(nodeModulesPath), 'Dependencies installed', existsSync(nodeModulesPath) ? 'node_modules directory present' : 'node_modules directory missing', 'Run `npm install` before lint/test/build commands.');
addCheck(true, 'Node.js runtime', process.version);
addCheck(true, 'Package name', pkg.name ?? '(missing)');

const failures = checks.filter((check) => !check.ok);

for (const check of checks) {
  const icon = check.ok ? '✔' : '✖';
  console.log(`${icon} ${check.label}: ${check.detail}`);
  if (!check.ok && check.nextStep) {
    console.log(`  → ${check.nextStep}`);
  }
}

if (failures.length > 0) {
  console.log(`\nDoctor result: ${failures.length} issue(s) detected.`);
  process.exit(1);
}

console.log('\nDoctor result: OK');
