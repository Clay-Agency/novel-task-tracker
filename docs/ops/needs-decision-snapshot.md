# Needs-decision daily snapshot (GitHub Actions)

This repo includes a low-noise automation that produces a daily snapshot of **open issues and PRs labeled `needs-decision`**.

## What it does

- Runs daily via GitHub Actions (`.github/workflows/needs-decision-snapshot.yml`).
- Queries GitHub for open items labeled `needs-decision` (issues + PRs).
- Updates a **single canonical GitHub Issue** by overwriting its body.
  - If the snapshot issue does not exist yet, the workflow creates it once.

## Where the snapshot lives

The workflow looks for an open issue titled:

- `Needs-decision snapshot (automated)`

Find it quickly (search): https://github.com/Clay-Agency/novel-task-tracker/issues?q=is%3Aissue+is%3Aopen+%22Needs-decision+snapshot+%28automated%29%22

If it can’t find one, it creates it and uses that new issue as the canonical artifact.

## How to run manually

1. Go to **Actions → Needs-decision daily snapshot** (or open https://github.com/Clay-Agency/novel-task-tracker/actions/workflows/needs-decision-snapshot.yml)
2. Click **Run workflow**

Optional inputs:

- `snapshot_issue_number`: force-update a specific issue number (useful if the snapshot issue was renamed or duplicated).
- `dry_run`: set to `true` to preview output in logs without writing.

## Implementation notes

- Uses only the built-in `GITHUB_TOKEN` (repo-scoped). No Projects v2 auth required.
- Source: `.github/scripts/needs-decision-snapshot.ts` (compiled at runtime with `tsc`).
