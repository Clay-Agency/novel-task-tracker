import { describe, expect, it, vi } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { getProjectMetadata, syncOneItem } = require('../../.github/scripts/project-status-sync.cjs');

describe('project-status-sync', () => {
  it('maps Status/Done date/Needs decision fields from project metadata (incl. Done option id)', async () => {
    const graphql = vi.fn(async (_query: string, _vars: { org: string; number: number }) => {
      void _query;
      void _vars;

      return {
        organization: {
          projectV2: {
            id: 'P1',
            title: 'Clay Project',
            fields: {
              nodes: [
                {
                  id: 'F_STATUS',
                  name: 'Status',
                  dataType: 'SINGLE_SELECT',
                  options: [
                    { id: 'OPT_TODO', name: 'Todo' },
                    { id: 'OPT_DONE', name: 'Done' },
                  ],
                },
                {
                  id: 'F_DONE_DATE',
                  name: 'Done_date',
                  dataType: 'DATE',
                },
                {
                  id: 'F_NEEDS',
                  name: 'Needs decision',
                  dataType: 'BOOLEAN',
                },
              ],
            },
          },
        },
      };
    });

    const meta = await getProjectMetadata({ graphql, orgLogin: 'Clay-Agency', projectNumber: 1 });

    expect(graphql).toHaveBeenCalledTimes(1);
    expect(graphql.mock.calls[0][1]).toEqual({ org: 'Clay-Agency', number: 1 });

    expect(meta.projectId).toBe('P1');
    expect(meta.statusField.id).toBe('F_STATUS');
    expect(meta.statusDoneOptionId).toBe('OPT_DONE');
    expect(meta.doneDateField.id).toBe('F_DONE_DATE');
    expect(meta.needsDecisionField.id).toBe('F_NEEDS');
  });

  it('syncOneItem writes Status=Done, Done date, and clears Needs decision (BOOLEAN)', async () => {
    type Vars = Record<string, unknown>;

    const calls: Array<{ query: string; vars: Vars }> = [];
    const graphql = vi.fn(async (query: string, vars: Vars) => {
      calls.push({ query, vars });
      return {};
    });

    const core = {
      warning: vi.fn(),
    };

    const meta = {
      statusField: { id: 'F_STATUS' },
      statusDoneOptionId: 'OPT_DONE',
      doneDateField: { id: 'F_DONE_DATE' },
      needsDecisionField: { id: 'F_NEEDS', dataType: 'BOOLEAN' },
    };

    await syncOneItem({
      graphql,
      core,
      meta,
      projectId: 'PROJ',
      itemId: 'ITEM',
      doneDate: '2026-02-23',
    });

    expect(graphql).toHaveBeenCalledTimes(3);

    // Status single-select update
    expect(calls.some((c) => c.vars.fieldId === 'F_STATUS' && c.vars.optionId === 'OPT_DONE')).toBe(true);

    // Done date update
    expect(calls.some((c) => c.vars.fieldId === 'F_DONE_DATE' && c.vars.date === '2026-02-23')).toBe(true);

    // Needs decision boolean clear
    expect(calls.some((c) => c.vars.fieldId === 'F_NEEDS' && c.vars.value === false)).toBe(true);
  });

  it('syncOneItem clears Needs decision (SINGLE_SELECT) using an obvious false option when present', async () => {
    type Vars = Record<string, unknown>;

    const calls: Array<{ vars: Vars }> = [];
    const graphql = vi.fn(async (...args: [string, Vars]) => {
      const vars = args[1];
      calls.push({ vars });
      return {};
    });

    const core = {
      warning: vi.fn(),
    };

    const meta = {
      statusField: { id: 'F_STATUS' },
      statusDoneOptionId: 'OPT_DONE',
      doneDateField: { id: 'F_DONE_DATE' },
      needsDecisionField: {
        id: 'F_NEEDS',
        name: 'Needs decision',
        dataType: 'SINGLE_SELECT',
        options: [
          { id: 'OPT_YES', name: 'Yes' },
          { id: 'OPT_NO', name: 'No' },
        ],
      },
    };

    await syncOneItem({
      graphql,
      core,
      meta,
      projectId: 'PROJ',
      itemId: 'ITEM',
      doneDate: '2026-02-23',
    });

    // Status + Done date + Needs decision (single-select)
    expect(graphql).toHaveBeenCalledTimes(3);

    expect(calls.some((c) => c.vars.fieldId === 'F_NEEDS' && c.vars.optionId === 'OPT_NO')).toBe(true);
  });

  it('maps expected fields even when the project has additional unexpected fields', async () => {
    const graphql = vi.fn(async () => {
      return {
        organization: {
          projectV2: {
            id: 'P1',
            title: 'Clay Project',
            fields: {
              nodes: [
                // unrelated fields (should be ignored)
                { id: 'F_IGNORED', name: 'Epic', dataType: 'TEXT' },
                {
                  id: 'F_STATUS',
                  name: 'Status',
                  dataType: 'SINGLE_SELECT',
                  options: [
                    { id: 'OPT_TODO', name: 'Todo' },
                    { id: 'OPT_DONE', name: 'Done' },
                  ],
                },
                { id: 'F_DONE_DATE', name: 'Done date', dataType: 'DATE' },
                { id: 'F_NEEDS', name: 'Needs_decision', dataType: 'BOOLEAN' },
                // more unrelated fields
                { id: 'F_IGNORED_2', name: 'Random', dataType: 'NUMBER' },
              ],
            },
          },
        },
      };
    });

    const meta = await getProjectMetadata({ graphql, orgLogin: 'Clay-Agency', projectNumber: 1 });

    expect(meta.statusField.id).toBe('F_STATUS');
    expect(meta.statusDoneOptionId).toBe('OPT_DONE');
    expect(meta.doneDateField.id).toBe('F_DONE_DATE');
    expect(meta.needsDecisionField.id).toBe('F_NEEDS');
  });

  it('warns with a runbook link when Status is present but Done option is missing/renamed', async () => {
    type Vars = Record<string, unknown>;

    const calls: Array<{ vars: Vars }> = [];
    const graphql = vi.fn(async (_q: string, vars: Vars) => {
      calls.push({ vars });
      return {};
    });

    const core = { warning: vi.fn() };

    const meta = {
      statusField: {
        id: 'F_STATUS',
        name: 'Status',
        dataType: 'SINGLE_SELECT',
        options: [
          { id: 'OPT_TODO', name: 'Todo' },
          { id: 'OPT_COMPLETED', name: 'Completed' },
        ],
      },
      statusDoneOptionId: null,
      doneDateField: { id: 'F_DONE_DATE' },
      needsDecisionField: null,
    };

    await syncOneItem({
      graphql,
      core,
      meta,
      projectId: 'PROJ',
      itemId: 'ITEM',
      doneDate: '2026-02-23',
    });

    // Done date update only (Status skipped; needs decision missing)
    expect(graphql).toHaveBeenCalledTimes(1);
    expect(calls.some((c) => c.vars.fieldId === 'F_DONE_DATE')).toBe(true);

    expect(core.warning).toHaveBeenCalledTimes(1);
    const msg = String(core.warning.mock.calls[0][0]);
    expect(msg).toContain('Status field missing option "Done"');
    expect(msg).toContain('docs/ops/projects-v2-auth.md#field-option-mismatch-warnings');
    expect(msg).toContain('Completed');
  });

  it('warns with a runbook link when Status field is missing', async () => {

    const graphql = vi.fn(async () => ({}));
    const core = { warning: vi.fn() };

    const meta = {
      statusField: null,
      statusDoneOptionId: null,
      doneDateField: { id: 'F_DONE_DATE' },
      needsDecisionField: null,
    };

    await syncOneItem({
      graphql,
      core,
      meta,
      projectId: 'PROJ',
      itemId: 'ITEM',
      doneDate: '2026-02-23',
    });

    expect(graphql).toHaveBeenCalledTimes(1);

    expect(core.warning).toHaveBeenCalledTimes(1);
    const msg = String(core.warning.mock.calls[0][0]);
    expect(msg).toContain('missing field "Status"');
    expect(msg).toContain('docs/ops/projects-v2-auth.md#field-option-mismatch-warnings');
  });

  it('warns with a runbook link when Done date field is missing', async () => {
    type Vars = Record<string, unknown>;

    const calls: Array<{ vars: Vars }> = [];
    const graphql = vi.fn(async (_q: string, vars: Vars) => {
      calls.push({ vars });
      return {};
    });

    const core = { warning: vi.fn() };

    const meta = {
      statusField: { id: 'F_STATUS' },
      statusDoneOptionId: 'OPT_DONE',
      doneDateField: null,
      needsDecisionField: null,
    };

    await syncOneItem({
      graphql,
      core,
      meta,
      projectId: 'PROJ',
      itemId: 'ITEM',
      doneDate: '2026-02-23',
    });

    // Status update only (Done date skipped)
    expect(graphql).toHaveBeenCalledTimes(1);
    expect(calls.some((c) => c.vars.fieldId === 'F_STATUS' && c.vars.optionId === 'OPT_DONE')).toBe(true);

    expect(core.warning).toHaveBeenCalledTimes(1);
    const msg = String(core.warning.mock.calls[0][0]);
    expect(msg).toContain('Done date field not found');
    expect(msg).toContain('docs/ops/projects-v2-auth.md#field-option-mismatch-warnings');
  });

  it('warns (with options + runbook link) when Needs decision is SINGLE_SELECT but has no obvious false option', async () => {
    type Vars = Record<string, unknown>;

    const calls: Array<{ vars: Vars }> = [];
    const graphql = vi.fn(async (_q: string, vars: Vars) => {
      calls.push({ vars });
      return {};
    });

    const core = { warning: vi.fn() };

    const meta = {
      statusField: { id: 'F_STATUS' },
      statusDoneOptionId: 'OPT_DONE',
      doneDateField: { id: 'F_DONE_DATE' },
      needsDecisionField: {
        id: 'F_NEEDS',
        name: 'Needs decision',
        dataType: 'SINGLE_SELECT',
        options: [
          { id: 'OPT_YES', name: 'Yes' },
          { id: 'OPT_MAYBE', name: 'Maybe' },
        ],
      },
    };

    await syncOneItem({
      graphql,
      core,
      meta,
      projectId: 'PROJ',
      itemId: 'ITEM',
      doneDate: '2026-02-23',
    });

    // Status + Done date only (Needs decision clear skipped)
    expect(graphql).toHaveBeenCalledTimes(2);
    expect(calls.some((c) => c.vars.fieldId === 'F_STATUS')).toBe(true);
    expect(calls.some((c) => c.vars.fieldId === 'F_DONE_DATE')).toBe(true);

    expect(core.warning).toHaveBeenCalledTimes(1);
    const msg = String(core.warning.mock.calls[0][0]);
    expect(msg).toContain('Needs decision is SINGLE_SELECT but no obvious false option found');
    expect(msg).toContain('docs/ops/projects-v2-auth.md#field-option-mismatch-warnings');
    expect(msg).toContain('Maybe');
  });

});
