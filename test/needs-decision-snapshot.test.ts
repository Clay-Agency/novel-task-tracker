import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { main } from '../.github/scripts/needs-decision-snapshot';

function okJson(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => body,
    text: async () => JSON.stringify(body),
    headers: new Headers(),
  } as unknown as Response;
}

describe('needs-decision snapshot script', () => {
  const envBackup = { ...process.env };
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    process.env = { ...envBackup };
    process.env.GITHUB_TOKEN = 'test-token';
    process.env.GITHUB_REPOSITORY = 'Clay-Agency/novel-task-tracker';
    delete process.env.SNAPSHOT_ISSUE_NUMBER;
    delete process.env.NEEDS_DECISION_SNAPSHOT_ISSUE_NUMBER;
    process.env.DRY_RUN = 'false';
  });

  afterEach(() => {
    process.env = { ...envBackup };
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('labels the snapshot issue when it is first created, and also re-applies label on update', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];

    globalThis.fetch = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
      const u = new URL(String(url));
      const path = u.pathname;
      const method = (init?.method || 'GET').toUpperCase();
      calls.push({ url: u.toString(), init });

      if (path === '/search/issues' && method === 'GET') {
        const q = u.searchParams.get('q') || '';
        // First query: open items labeled needs-decision
        if (q.includes('label:"needs-decision"')) {
          return okJson({ total_count: 0, incomplete_results: false, items: [] });
        }
        // Second query: find existing snapshot issue by title
        if (q.includes('in:title') && q.includes('Needs-decision snapshot (automated)')) {
          return okJson({ total_count: 0, incomplete_results: false, items: [] });
        }
        throw new Error(`Unexpected search query: ${q}`);
      }

      if (path === '/repos/Clay-Agency/novel-task-tracker/issues' && method === 'POST') {
        const body = JSON.parse(String(init?.body || '{}'));
        expect(body.title).toBe('Needs-decision snapshot (automated)');
        expect(body.labels).toEqual(['automation']);
        return okJson({
          number: 77,
          title: body.title,
          state: 'open',
          html_url: 'https://github.com/Clay-Agency/novel-task-tracker/issues/77',
          body: body.body,
        });
      }

      if (path === '/repos/Clay-Agency/novel-task-tracker/issues/77' && method === 'GET') {
        return okJson({
          number: 77,
          title: 'Needs-decision snapshot (automated)',
          state: 'open',
          html_url: 'https://github.com/Clay-Agency/novel-task-tracker/issues/77',
          body: 'x',
        });
      }

      if (path === '/repos/Clay-Agency/novel-task-tracker/issues/77' && method === 'PATCH') {
        return okJson({
          number: 77,
          title: 'Needs-decision snapshot (automated)',
          state: 'open',
          html_url: 'https://github.com/Clay-Agency/novel-task-tracker/issues/77',
          body: 'updated',
        });
      }

      if (path === '/repos/Clay-Agency/novel-task-tracker/issues/77/labels' && method === 'POST') {
        const body = JSON.parse(String(init?.body || '{}'));
        expect(body.labels).toEqual(['automation']);
        return okJson([{ name: 'automation' }]);
      }

      throw new Error(`Unexpected fetch: ${method} ${path}`);
    }) as unknown as typeof fetch;

    await main();

    const labelCalls = calls.filter((c) => c.url.includes('/issues/77/labels'));
    expect(labelCalls.length).toBe(1);
  });

  it('re-applies the automation label on every update (even when the snapshot issue already exists)', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];

    globalThis.fetch = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
      const u = new URL(String(url));
      const path = u.pathname;
      const method = (init?.method || 'GET').toUpperCase();
      calls.push({ url: u.toString(), init });

      if (path === '/search/issues' && method === 'GET') {
        const q = u.searchParams.get('q') || '';
        // First query: open items labeled needs-decision
        if (q.includes('label:"needs-decision"')) {
          return okJson({ total_count: 0, incomplete_results: false, items: [] });
        }
        // Second query: find existing snapshot issue by title
        if (q.includes('in:title') && q.includes('Needs-decision snapshot (automated)')) {
          return okJson({
            total_count: 1,
            incomplete_results: false,
            items: [
              {
                number: 50,
                title: 'Needs-decision snapshot (automated)',
                html_url: 'https://github.com/Clay-Agency/novel-task-tracker/issues/50',
              },
            ],
          });
        }
        throw new Error(`Unexpected search query: ${q}`);
      }

      if (path === '/repos/Clay-Agency/novel-task-tracker/issues/50' && method === 'GET') {
        return okJson({
          number: 50,
          title: 'Needs-decision snapshot (automated)',
          state: 'open',
          html_url: 'https://github.com/Clay-Agency/novel-task-tracker/issues/50',
          body: 'x',
        });
      }

      if (path === '/repos/Clay-Agency/novel-task-tracker/issues/50' && method === 'PATCH') {
        return okJson({
          number: 50,
          title: 'Needs-decision snapshot (automated)',
          state: 'open',
          html_url: 'https://github.com/Clay-Agency/novel-task-tracker/issues/50',
          body: 'updated',
        });
      }

      if (path === '/repos/Clay-Agency/novel-task-tracker/issues/50/labels' && method === 'POST') {
        const body = JSON.parse(String(init?.body || '{}'));
        expect(body.labels).toEqual(['automation']);
        return okJson([{ name: 'automation' }]);
      }

      throw new Error(`Unexpected fetch: ${method} ${path}`);
    }) as unknown as typeof fetch;

    await main();

    const labelCalls = calls.filter((c) => c.url.includes('/issues/50/labels'));
    expect(labelCalls.length).toBe(1);

    const createCalls = calls.filter((c) => c.url.endsWith('/repos/Clay-Agency/novel-task-tracker/issues') && (c.init?.method || 'GET').toUpperCase() === 'POST');
    expect(createCalls.length).toBe(0);
  });
});
