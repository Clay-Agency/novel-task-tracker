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
});
