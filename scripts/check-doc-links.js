import fs from 'node:fs/promises';
import path from 'node:path';

const roots = process.argv.slice(2);
const defaultRoots = ['README.md', 'docs'];
const targets = roots.length ? roots : defaultRoots;
const cwd = process.cwd();
const markdownFiles = [];
const errors = [];

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function walk(target) {
  const fullPath = path.resolve(cwd, target);
  if (!(await exists(fullPath))) {
    errors.push(`Missing input path: ${target}`);
    return;
  }

  const stat = await fs.stat(fullPath);
  if (stat.isDirectory()) {
    const entries = await fs.readdir(fullPath, { withFileTypes: true });
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name === '.git' || entry.name === 'node_modules') continue;
      await walk(path.join(target, entry.name));
    }
    return;
  }

  if (/\.md$/i.test(fullPath) || path.basename(fullPath).toLowerCase() === 'readme.md') {
    markdownFiles.push(fullPath);
  }
}

function stripCodeBlocks(content) {
  return content.replace(/```[\s\S]*?```/g, '').replace(/~~~[\s\S]*?~~~/g, '');
}

function slugifyHeading(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\u2019']/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function collectAnchors(content) {
  const anchors = new Set();
  const seen = new Map();
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const match = /^(#{1,6})\s+(.*)$/.exec(line.trim());
    if (!match) continue;
    const rawHeading = match[2].replace(/\s+#*\s*$/, '').trim();
    const base = slugifyHeading(rawHeading);
    if (!base) continue;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    anchors.add(count === 0 ? base : `${base}-${count}`);
  }

  return anchors;
}

function shouldSkipTarget(target) {
  return (
    !target ||
    target.startsWith('http://') ||
    target.startsWith('https://') ||
    target.startsWith('mailto:') ||
    target.startsWith('tel:') ||
    target.startsWith('data:')
  );
}

function extractLinks(content) {
  const clean = stripCodeBlocks(content);
  const matches = [];
  const pattern = /!?\[[^\]]*\]\(([^)\s]+(?:\s+"[^"]*")?)\)/g;
  for (const match of clean.matchAll(pattern)) {
    let rawTarget = match[1].trim();
    rawTarget = rawTarget.replace(/^<|>$/g, '');
    rawTarget = rawTarget.replace(/\s+"[^"]*"$/, '');
    matches.push(rawTarget);
  }
  return matches;
}

async function validateFile(filePath, anchorCache) {
  const content = await fs.readFile(filePath, 'utf8');
  const links = extractLinks(content);
  const relativeFilePath = path.relative(cwd, filePath) || path.basename(filePath);

  for (const target of links) {
    if (shouldSkipTarget(target)) continue;

    const [rawPathPart, rawAnchorPart] = target.split('#');
    const pathPart = rawPathPart || '';
    const anchorPart = rawAnchorPart || '';

    if (!pathPart && anchorPart) {
      const anchors = anchorCache.get(filePath) ?? collectAnchors(content);
      anchorCache.set(filePath, anchors);
      if (!anchors.has(slugifyHeading(anchorPart))) {
        errors.push(`${relativeFilePath}: missing anchor #${anchorPart}`);
      }
      continue;
    }

    const resolvedPath = path.resolve(path.dirname(filePath), decodeURIComponent(pathPart));
    if (!(await exists(resolvedPath))) {
      errors.push(`${relativeFilePath}: missing target ${target}`);
      continue;
    }

    if (anchorPart) {
      const stat = await fs.stat(resolvedPath);
      if (!stat.isFile()) {
        errors.push(`${relativeFilePath}: anchor target is not a file ${target}`);
        continue;
      }

      const targetContent = await fs.readFile(resolvedPath, 'utf8');
      const anchors = anchorCache.get(resolvedPath) ?? collectAnchors(targetContent);
      anchorCache.set(resolvedPath, anchors);
      if (!anchors.has(slugifyHeading(anchorPart))) {
        errors.push(`${relativeFilePath}: missing anchor ${target}`);
      }
    }
  }
}

for (const target of targets) {
  await walk(target);
}

markdownFiles.sort();
const anchorCache = new Map();
for (const filePath of markdownFiles) {
  await validateFile(filePath, anchorCache);
}

if (errors.length > 0) {
  console.error('Markdown link check failed:\n');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Markdown link check passed for ${markdownFiles.length} file(s).`);
