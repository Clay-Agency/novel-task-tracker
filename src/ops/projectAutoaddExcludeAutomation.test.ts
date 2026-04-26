import { describe, expect, it, vi } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { getProjectItemForContent, projectMatchesTarget } = require('../../.github/scripts/project-autoadd-exclude-automation.cjs');

describe('project-autoadd-exclude-automation', () => {
  it('matches Project items by number and owner login', () => {
    expect(
      projectMatchesTarget({
        project: { number: 1, owner: { login: 'Clay-Agency' } },
        projectNumber: 1,
        projectOwner: 'clay-agency',
      })
    ).toBe(true);

    expect(
      projectMatchesTarget({
        project: { number: 1, owner: { login: 'someone-else' } },
        projectNumber: 1,
        projectOwner: 'Clay-Agency',
      })
    ).toBe(false);
  });

  it('returns only the target owner Project item when another owner has the same project number', async () => {
    const graphql = vi.fn(async () => ({
      node: {
        url: 'https://github.com/Clay-Agency/novel-task-tracker/issues/212',
        projectItems: {
          nodes: [
            { id: 'ITEM_OTHER', project: { id: 'PROJ_OTHER', number: 1, owner: { login: 'someone-else' } } },
            { id: 'ITEM_TARGET', project: { id: 'PROJ_TARGET', number: 1, owner: { login: 'Clay-Agency' } } },
          ],
        },
      },
    }));

    const res = await getProjectItemForContent({
      graphql,
      projectNumber: 1,
      projectOwner: 'Clay-Agency',
      contentNodeId: 'CONTENT',
      core: { warning: vi.fn() },
    });

    expect(res.itemId).toBe('ITEM_TARGET');
    expect(res.projectId).toBe('PROJ_TARGET');
  });

  it('skips and warns when the only same-number Project item has the wrong owner', async () => {
    const warning = vi.fn();
    const graphql = vi.fn(async () => ({
      node: {
        url: 'https://github.com/other/repo/issues/1',
        projectItems: {
          nodes: [
            { id: 'ITEM_OTHER', project: { id: 'PROJ_OTHER', number: 1, owner: { login: 'someone-else' } } },
          ],
        },
      },
    }));

    const res = await getProjectItemForContent({
      graphql,
      projectNumber: 1,
      projectOwner: 'Clay-Agency',
      contentNodeId: 'CONTENT',
      core: { warning },
    });

    expect(res.itemId).toBeNull();
    expect(res.projectId).toBeNull();
    expect(warning).toHaveBeenCalledWith(expect.stringContaining("expected owner 'Clay-Agency'"));
  });
});
