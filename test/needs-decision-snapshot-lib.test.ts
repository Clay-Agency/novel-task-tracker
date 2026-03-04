import { buildBody, splitPrsAndIssues } from '../.github/scripts/needs-decision-snapshot-lib';
import type { GitHubSearchItem } from '../.github/scripts/needs-decision-snapshot-lib';

describe('needs-decision snapshot lib', () => {
  it('splits PRs vs issues based on pull_request marker', () => {
    const items: GitHubSearchItem[] = [
      {
        number: 101,
        title: 'Fix the thing',
        html_url: 'https://github.com/acme/repo/pull/101',
        user: { login: 'alice' },
        updated_at: '2026-03-04T12:00:00Z',
        pull_request: {},
      },
      {
        number: 202,
        title: 'Decide the approach',
        html_url: 'https://github.com/acme/repo/issues/202',
        user: { login: 'bob' },
        updated_at: '2026-03-03T03:00:00Z',
      },
    ];

    const { prs, issues } = splitPrsAndIssues(items);

    expect(prs.map((i) => i.number)).toEqual([101]);
    expect(issues.map((i) => i.number)).toEqual([202]);
  });

  it('formats snapshot body with counts, headings, query URL, and list entries', () => {
    const prs: GitHubSearchItem[] = [
      {
        number: 101,
        title: 'Fix the thing',
        html_url: 'https://github.com/acme/repo/pull/101',
        user: { login: 'alice' },
        updated_at: '2026-03-04T12:00:00Z',
        pull_request: {},
      },
    ];

    const issues: GitHubSearchItem[] = [
      {
        number: 202,
        title: 'Decide the approach',
        html_url: 'https://github.com/acme/repo/issues/202',
        user: { login: 'bob' },
        updated_at: '2026-03-03T03:00:00Z',
      },
    ];

    const body = buildBody({
      repoFull: 'Clay-Agency/novel-task-tracker',
      runUrl: 'https://github.com/Clay-Agency/novel-task-tracker/actions/runs/123',
      generatedAt: new Date('2026-03-05T00:15:00Z'),
      prs,
      issues,
    });

    expect(body).toContain('<!-- needs-decision-snapshot: do-not-edit -->');
    expect(body).toContain('# Needs-decision snapshot');

    expect(body).toContain('Open items labeled `needs-decision`: **2** (PRs: **1**, issues: **1**)');

    expect(body).toContain(
      'Last updated: **2026-03-05 00:15 UTC** | [workflow run](https://github.com/Clay-Agency/novel-task-tracker/actions/runs/123)'
    );

    expect(body).toContain(
      'Query: https://github.com/Clay-Agency/novel-task-tracker/issues?q=is%3Aopen+label%3Aneeds-decision'
    );

    expect(body).toContain('## Pull requests');
    expect(body).toContain('- [#101](https://github.com/acme/repo/pull/101) Fix the thing — @alice (updated 2026-03-04)');

    expect(body).toContain('## Issues');
    expect(body).toContain(
      '- [#202](https://github.com/acme/repo/issues/202) Decide the approach — @bob (updated 2026-03-03)'
    );

    expect(body).toContain('This issue is maintained automatically by a scheduled GitHub Actions workflow.');
  });

  it('renders empty sections as _None._', () => {
    const body = buildBody({
      repoFull: 'Clay-Agency/novel-task-tracker',
      generatedAt: new Date('2026-03-05T00:15:00Z'),
      prs: [],
      issues: [],
    });

    expect(body).toContain('## Pull requests\n\n_None._\n\n## Issues\n\n_None._');
  });
});
