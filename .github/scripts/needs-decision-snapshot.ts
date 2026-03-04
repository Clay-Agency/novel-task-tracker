/**
 * Daily snapshot of open Issues/PRs labeled `needs-decision`.
 *
 * Canonical artifact: a single GitHub Issue whose body is overwritten on each run.
 *
 * Constraints:
 * - Uses only repo-scoped GITHUB_TOKEN (no Projects v2 auth).
 * - Low-noise: updates one existing issue body (or creates it once if missing).
 */

type GitHubSearchItem = {
  number: number;
  title: string;
  html_url: string;
  user?: { login?: string };
  updated_at?: string;
  created_at?: string;
  pull_request?: unknown;
};

type GitHubSearchResponse = {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubSearchItem[];
};

type GitHubIssue = {
  number: number;
  title: string;
  state: 'open' | 'closed';
  html_url: string;
  body: string | null;
};

const SNAPSHOT_TITLE = 'Needs-decision snapshot (automated)';
const LABEL = 'needs-decision';

function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function repoFromEnv(): { owner: string; repo: string; full: string } {
  const full = mustEnv('GITHUB_REPOSITORY');
  const [owner, repo] = full.split('/');
  if (!owner || !repo) throw new Error(`Invalid GITHUB_REPOSITORY: ${full}`);
  return { owner, repo, full };
}

function toBool(v: string | undefined, defaultValue = false): boolean {
  if (v == null) return defaultValue;
  const s = String(v).trim().toLowerCase();
  if (['1', 'true', 'yes', 'y', 'on'].includes(s)) return true;
  if (['0', 'false', 'no', 'n', 'off'].includes(s)) return false;
  return defaultValue;
}

function fmtDate(dateLike?: string): string {
  if (!dateLike) return '';
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function fmtIsoMinute(d: Date): string {
  const iso = d.toISOString();
  return iso.slice(0, 16).replace('T', ' ') + ' UTC';
}

async function ghFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = mustEnv('GITHUB_TOKEN');
  const url = `https://api.github.com${path}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'x-github-api-version': '2022-11-28',
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GitHub API ${init?.method || 'GET'} ${path} failed: ${res.status} ${res.statusText}\n${text}`);
  }

  return (await res.json()) as T;
}

async function searchAllIssues(query: string, maxPages = 10): Promise<GitHubSearchItem[]> {
  const perPage = 100;
  const items: GitHubSearchItem[] = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const q = encodeURIComponent(query);
    const res = await ghFetch<GitHubSearchResponse>(
      `/search/issues?q=${q}&per_page=${perPage}&page=${page}`
    );

    items.push(...(res.items || []));

    if (items.length >= res.total_count) break;
    if ((res.items || []).length < perPage) break;
  }

  return items;
}

function splitPrsAndIssues(items: GitHubSearchItem[]): { prs: GitHubSearchItem[]; issues: GitHubSearchItem[] } {
  const prs: GitHubSearchItem[] = [];
  const issues: GitHubSearchItem[] = [];

  for (const it of items) {
    if (it.pull_request) prs.push(it);
    else issues.push(it);
  }

  return { prs, issues };
}

function renderList(items: GitHubSearchItem[], limit: number): string {
  if (items.length === 0) return '_None._\n';

  const shown = items.slice(0, limit);
  const lines = shown.map((it) => {
    const who = it.user?.login ? `@${it.user.login}` : 'unknown';
    const updated = fmtDate(it.updated_at);
    const suffix = updated ? ` (updated ${updated})` : '';
    return `- [#${it.number}](${it.html_url}) ${it.title} — ${who}${suffix}`;
  });

  const extra = items.length - shown.length;
  if (extra > 0) {
    lines.push(`- …and ${extra} more`);
  }

  return lines.join('\n') + '\n';
}

function buildBody(params: {
  repoFull: string;
  runUrl?: string;
  generatedAt: Date;
  prs: GitHubSearchItem[];
  issues: GitHubSearchItem[];
}): string {
  const { repoFull, runUrl, generatedAt, prs, issues } = params;

  const total = prs.length + issues.length;
  const qUrl = `https://github.com/${repoFull}/issues?q=is%3Aopen+label%3A${encodeURIComponent(LABEL)}`;

  const runLine = runUrl ? ` | [workflow run](${runUrl})` : '';

  const marker = '<!-- needs-decision-snapshot: do-not-edit -->';

  // Keep noise low: compact, scannable.
  return [
    marker,
    `# Needs-decision snapshot`,
    '',
    `Open items labeled \`${LABEL}\`: **${total}** (PRs: **${prs.length}**, issues: **${issues.length}**)`,
    '',
    `Last updated: **${fmtIsoMinute(generatedAt)}**${runLine}`,
    '',
    `Query: ${qUrl}`,
    '',
    '## Pull requests',
    '',
    renderList(prs, 50).trimEnd(),
    '',
    '## Issues',
    '',
    renderList(issues, 50).trimEnd(),
    '',
    '---',
    '',
    'This issue is maintained automatically by a scheduled GitHub Actions workflow.',
  ].join('\n');
}

async function getIssue(owner: string, repo: string, issueNumber: number): Promise<GitHubIssue> {
  return ghFetch<GitHubIssue>(`/repos/${owner}/${repo}/issues/${issueNumber}`);
}

async function createIssue(owner: string, repo: string, body: string): Promise<GitHubIssue> {
  return ghFetch<GitHubIssue>(`/repos/${owner}/${repo}/issues`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      title: SNAPSHOT_TITLE,
      body,
    }),
  });
}

async function updateIssue(params: {
  owner: string;
  repo: string;
  issueNumber: number;
  body: string;
  reopenIfClosed: boolean;
}): Promise<GitHubIssue> {
  const { owner, repo, issueNumber, body, reopenIfClosed } = params;

  let state: 'open' | undefined;
  if (reopenIfClosed) {
    const current = await getIssue(owner, repo, issueNumber);
    if (current.state === 'closed') state = 'open';
  }

  return ghFetch<GitHubIssue>(`/repos/${owner}/${repo}/issues/${issueNumber}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      body,
      ...(state ? { state } : {}),
    }),
  });
}

async function findOrCreateSnapshotIssueNumber(owner: string, repo: string, repoFull: string): Promise<number> {
  const envIssue = process.env.SNAPSHOT_ISSUE_NUMBER || process.env.NEEDS_DECISION_SNAPSHOT_ISSUE_NUMBER;
  if (envIssue) {
    const n = Number(envIssue);
    if (!Number.isFinite(n) || n <= 0) throw new Error(`Invalid SNAPSHOT_ISSUE_NUMBER: ${envIssue}`);
    return n;
  }

  // Search by title first (reliable + no repo setup required).
  const query = `repo:${repoFull} is:issue is:open in:title "${SNAPSHOT_TITLE}"`;
  const hits = await searchAllIssues(query, 2);

  if (hits.length > 0) {
    const sorted = [...hits].sort((a, b) => a.number - b.number);
    return sorted[0]!.number;
  }

  // Not found -> create once.
  const body = [
    '<!-- needs-decision-snapshot: do-not-edit -->',
    '# Needs-decision snapshot',
    '',
    '_Initializing…_',
    '',
    'This issue will be updated automatically.',
  ].join('\n');

  const created = await createIssue(owner, repo, body);
  return created.number;
}

async function main(): Promise<void> {
  const { owner, repo, full: repoFull } = repoFromEnv();
  const dryRun = toBool(process.env.DRY_RUN, false);

  const runUrl =
    process.env.GITHUB_SERVER_URL && process.env.GITHUB_RUN_ID
      ? `${process.env.GITHUB_SERVER_URL}/${repoFull}/actions/runs/${process.env.GITHUB_RUN_ID}`
      : undefined;

  const q = `repo:${repoFull} is:open label:"${LABEL}" sort:updated-desc`;
  const all = await searchAllIssues(q, 10);
  const { prs, issues } = splitPrsAndIssues(all);

  const body = buildBody({ repoFull, runUrl, generatedAt: new Date(), prs, issues });

  const issueNumber = await findOrCreateSnapshotIssueNumber(owner, repo, repoFull);

  if (dryRun) {
    console.log(`[dry-run] Would update issue #${issueNumber} with ${prs.length} PR(s) and ${issues.length} issue(s).`);
    console.log(body.slice(0, 2000));
    return;
  }

  const updated = await updateIssue({ owner, repo, issueNumber, body, reopenIfClosed: true });
  console.log(`Updated snapshot issue: ${updated.html_url}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
