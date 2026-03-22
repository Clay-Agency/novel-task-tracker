# Project #1 maintainer runbook index (Issue #276)

Use this page as the navigation hub for **Clay-Agency org Project #1** maintainer operations.
It does not replace the detailed runbooks; it points maintainers to the right doc for the task at hand.

## Current maintainer runbook set

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

### Verifying Project state and field usage
1. [`project-1-field-conventions.md`](./project-1-field-conventions.md)
2. [`project-status-sync.md`](./project-status-sync.md)
3. [`projects-v2-auth-runbook.md`](./projects-v2-auth-runbook.md)

### Reviewing whether a merge path is healthy
1. [`branch-protection.md`](./branch-protection.md)
2. [`ci-maintenance-runbook.md`](./ci-maintenance-runbook.md)
3. [`project-status-sync.md`](./project-status-sync.md)

### Repairing Project automation/setup
1. [`clay-admin-quickstart.md`](./clay-admin-quickstart.md)
2. [`projects-v2-auth-runbook.md`](./projects-v2-auth-runbook.md)
3. [`projects-v2-auth.md`](./projects-v2-auth.md)

## Related follow-ups still tracked in issues

Some review-queue-specific maintainer procedures are still tracked as open follow-ups rather than merged standalone docs:
- Issue #258 — duplicate review-item cleanup
- Issue #264 — stacked follow-up PR handling
- Issue #266 — merge-order checklist
- Issue #268 — maintainer runbook index/orientation follow-up
- Issue #270 — review-clearing quick-start
- Issue #272 — CI triage quick guide for review items
- Issue #274 — review-queue daily-loop SOP

This index intentionally links only to docs that are currently present in the repo so navigation stays accurate.
