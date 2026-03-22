# Project #1 maintainer runbook index (Issue #276)

Use this page as the navigation hub for **Clay-Agency org Project #1** maintainer operations.
It does not replace the detailed runbooks; it points maintainers to the right doc for the task at hand.

## Start here

- Lifecycle-by-phase navigation: [`project-1-maintainer-lifecycle-map.md`](./project-1-maintainer-lifecycle-map.md)
- Field semantics and Project conventions: [`project-1-field-conventions.md`](./project-1-field-conventions.md)

## Current maintainer runbook set

### Phase guides
- [`project-1-triage-guide.md`](./project-1-triage-guide.md) — decide whether an item belongs in `In progress`, `Blocked`, or `Review`, and whether `Needs decision` should be set.
- [`project-1-review-clearing-quick-start.md`](./project-1-review-clearing-quick-start.md) — shortest safe maintainer path before merge review.
- [`project-1-review-queue-daily-loop.md`](./project-1-review-queue-daily-loop.md) — one-pass SOP for clearing multiple Project #1 review items.
- [`project-1-ci-triage-quick-guide.md`](./project-1-ci-triage-quick-guide.md) — required vs advisory checks for docs/process vs automation/code PRs.
- [`project-1-post-merge-hygiene-checklist.md`](./project-1-post-merge-hygiene-checklist.md) — final consistency pass after merge/close.

### Core Project semantics
- [`project-1-field-conventions.md`](./project-1-field-conventions.md) — canonical meaning for Project #1 fields, status values, owner expectations, and Evidence usage.

### Project automation and post-merge state
- [`project-status-sync.md`](./project-status-sync.md) — what the status-sync workflow updates and when it runs.
- [`projects-v2-auth-runbook.md`](./projects-v2-auth-runbook.md) — GitHub App setup, validation, and troubleshooting when Project automation cannot read/write Project #1.
- [`projects-v2-auth.md`](./projects-v2-auth.md) — compact auth/setup reference.
- [`clay-admin-quickstart.md`](./clay-admin-quickstart.md) — fast admin checklist for Clay when project automation needs to be enabled or repaired.

### Merge / review guardrails
- [`branch-protection.md`](./branch-protection.md) — required PR check and approval baseline for merging to `main`.
- [`ci-maintenance-runbook.md`](./ci-maintenance-runbook.md) — deeper CI failure handling, workflow flakes, and ownership/rotation guidance.
- [`project-1-workflow-auto-add-filter.md`](./project-1-workflow-auto-add-filter.md) — how to keep Project #1 auto-add rules from pulling in automation/meta issues.

## Recommended reading order for common maintainer work

### Triage an item to its real next action
1. [`project-1-maintainer-lifecycle-map.md`](./project-1-maintainer-lifecycle-map.md)
2. [`project-1-triage-guide.md`](./project-1-triage-guide.md)
3. [`project-1-field-conventions.md`](./project-1-field-conventions.md)

### Clear one or more review items safely
1. [`project-1-maintainer-lifecycle-map.md`](./project-1-maintainer-lifecycle-map.md)
2. [`project-1-review-clearing-quick-start.md`](./project-1-review-clearing-quick-start.md)
3. [`project-1-review-queue-daily-loop.md`](./project-1-review-queue-daily-loop.md)
4. [`project-1-ci-triage-quick-guide.md`](./project-1-ci-triage-quick-guide.md)
5. [`branch-protection.md`](./branch-protection.md)

### Confirm post-merge Project state
1. [`project-1-maintainer-lifecycle-map.md`](./project-1-maintainer-lifecycle-map.md)
2. [`project-1-post-merge-hygiene-checklist.md`](./project-1-post-merge-hygiene-checklist.md)
3. [`project-status-sync.md`](./project-status-sync.md)
4. [`projects-v2-auth-runbook.md`](./projects-v2-auth-runbook.md)

### Repair Project automation/setup
1. [`project-status-sync.md`](./project-status-sync.md)
2. [`projects-v2-auth-runbook.md`](./projects-v2-auth-runbook.md)
3. [`clay-admin-quickstart.md`](./clay-admin-quickstart.md)
4. [`projects-v2-auth.md`](./projects-v2-auth.md)

This index intentionally links only to docs that are currently present in the repo so navigation stays accurate.
