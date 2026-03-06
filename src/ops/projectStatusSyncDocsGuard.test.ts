import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { schemaHelp, SCHEMA_HELP_DOC, SCHEMA_HELP_ANCHOR } = require('../../.github/scripts/project-status-sync.cjs');

describe('project-status-sync docs link guard', () => {
  it('schemaHelp points to a stable anchor that exists in the docs', () => {
    expect(schemaHelp()).toBe(`See ${SCHEMA_HELP_DOC}#${SCHEMA_HELP_ANCHOR}`);

    const absDocPath = path.resolve(process.cwd(), SCHEMA_HELP_DOC);
    expect(fs.existsSync(absDocPath)).toBe(true);

    const md = fs.readFileSync(absDocPath, 'utf8');
    const anchorRe = new RegExp(`id=["']${SCHEMA_HELP_ANCHOR}["']`);
    expect(md).toMatch(anchorRe);
  });
});
