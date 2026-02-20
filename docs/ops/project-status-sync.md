# Project status sync (Clay Project #1)

This repo uses a low-noise GitHub Action to keep **Clay-Agency Project #1** in sync when work completes.

## What it does

When an item in Project #1 is closed/merged, the workflow updates the corresponding Project item fields:

- **Merged PRs** → `Status = Done`, `Done date = mergedAt` (YYYY-MM-DD)
- **Closed issues** → `Status = Done`, `Done date = closedAt` (YYYY-MM-DD)
- Clears **Needs decision** (sets to `false` when the field is a boolean; otherwise tries to select a "No/False" option)

## How it runs

Workflow: `.github/workflows/project-status-sync.yml`

Triggers:

- `pull_request.closed` (only acts when `merged == true`)
- `issues.closed`
- `schedule` (daily reconciliation) to catch cases where an issue/PR is added to the project after it was already closed.
- `workflow_dispatch` (manual run)

## Permissions / secrets

- Uses the built-in `GITHUB_TOKEN`.
- Workflow permissions:
  - `projects: write`
  - `issues: read`
  - `pull-requests: read`
  - `contents: read`

No additional secrets are required.

## Notes / limitations

- The workflow only updates items that are already in **Clay-Agency Project #1**.
- It assumes the project has fields named:
  - `Status` (single-select with an option named `Done`)
  - `Done date` (date field)
  - `Needs decision` (boolean preferred)

If the project uses different names, adjust the matching logic in the workflow script.
