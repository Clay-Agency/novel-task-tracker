export type GitHubSearchItem = {
  number: number;
  title: string;
  html_url: string;
  user?: { login?: string };
  updated_at?: string;
  created_at?: string;
  pull_request?: unknown;
};

export const SNAPSHOT_TITLE = 'Needs-decision snapshot (automated)';
export const LABEL = 'needs-decision';

// Label applied to the canonical snapshot issue so it can be excluded from Project auto-add rules.
export const SNAPSHOT_ISSUE_LABEL = 'automation';

export function fmtDate(dateLike?: string): string {
  if (!dateLike) return '';
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export function fmtIsoMinute(d: Date): string {
  const iso = d.toISOString();
  return iso.slice(0, 16).replace('T', ' ') + ' UTC';
}

export function splitPrsAndIssues(items: GitHubSearchItem[]): {
  prs: GitHubSearchItem[];
  issues: GitHubSearchItem[];
} {
  const prs: GitHubSearchItem[] = [];
  const issues: GitHubSearchItem[] = [];

  for (const it of items) {
    if (it.pull_request) prs.push(it);
    else issues.push(it);
  }

  return { prs, issues };
}

export function renderList(items: GitHubSearchItem[], limit: number): string {
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

export function buildBody(params: {
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
