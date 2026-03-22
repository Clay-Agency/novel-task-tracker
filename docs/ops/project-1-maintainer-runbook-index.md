# Project #1 maintainer runbook index (Issue #268)

Use this page as the **starting point** for Project #1 maintenance work.
It does not replace the detailed runbooks; it tells maintainers **which runbook or pending guide to open next** for routine review work vs anomaly/debug handling.

## Current runbook set

### Merged, repo-local runbooks

- [`project-1-field-conventions.md`](./project-1-field-conventions.md)
  - Use for the canonical issue-first review convention and Project field expectations.
- [`project-status-sync.md`](./project-status-sync.md)
  - Use for workflow-triggered status/evidence sync behavior and low-noise no-op cases.
- [`projects-v2-auth-runbook.md`](./projects-v2-auth-runbook.md)
  - Use only when Projects v2 auth, token, permission, or GitHub App setup is the likely problem.
- [`clay-admin-quickstart.md`](./clay-admin-quickstart.md)
  - Use for Clay-facing setup/smoke-test steps rather than day-to-day queue handling.

### In-flight maintainer guides currently under review

These are part of the Project #1 maintainer runbook set, but at the time of writing they are still being reviewed in linked PRs rather than merged on `main`:

- Duplicate PR-item prevention / review-queue cleanup: [PR #261](https://github.com/Clay-Agency/novel-task-tracker/pull/261) / [Issue #260](https://github.com/Clay-Agency/novel-task-tracker/issues/260)
- Stacked follow-up PR handling: [PR #265](https://github.com/Clay-Agency/novel-task-tracker/pull/265) / [Issue #264](https://github.com/Clay-Agency/novel-task-tracker/issues/264)
- Merge-order checklist: [PR #267](https://github.com/Clay-Agency/novel-task-tracker/pull/267) / [Issue #266](https://github.com/Clay-Agency/novel-task-tracker/issues/266)

## Default maintainer path

For normal Project #1 review/merge work, use this order:

1. **Confirm board fields and review convention**
   - Runbook: [`project-1-field-conventions.md`](./project-1-field-conventions.md)
   - Check the canonical issue item, `Status`, `Owner agent`, `Needs decision`, and `Evidence`.
2. **Check whether automation should update the item automatically**
   - Runbook: [`project-status-sync.md`](./project-status-sync.md)
   - Use when checking expected behavior after PR open/merge/issue close events.
3. **Escalate to auth/config troubleshooting only when automation is not behaving as expected**
   - Runbook: [`projects-v2-auth-runbook.md`](./projects-v2-auth-runbook.md)
   - Use for token, permissions, GitHub App, or GraphQL project-access failures.
4. **If the case is about queue cleanup, stacked follow-ups, or merge order, open the linked in-flight guide/PR above**
   - Those guides are the current source for maintainer handling until merged.

## Which guide to use

| Situation | Primary doc or guide | Why |
| --- | --- | --- |
| Triage a Project #1 item before review | [`project-1-field-conventions.md`](./project-1-field-conventions.md) | Confirms the canonical issue-first workflow and required field values. |
| Need to know whether status/evidence updates should happen automatically | [`project-status-sync.md`](./project-status-sync.md) | Documents workflow triggers, expected sync behavior, and no-op cases. |
| Workflow cannot read/write Project #1 | [`projects-v2-auth-runbook.md`](./projects-v2-auth-runbook.md) | Covers GitHub App/PAT setup and troubleshooting for org Projects v2 access. |
| Review queue shows duplicate issue/PR items for the same work | [PR #261 / Issue #260](https://github.com/Clay-Agency/novel-task-tracker/pull/261) | Tracks the current cleanup/prevention guide until merged. |
| A follow-up PR is stacked on top of another review item | [PR #265 / Issue #264](https://github.com/Clay-Agency/novel-task-tracker/pull/265) | Tracks the current maintainer guidance for stacked follow-up PRs. |
| Several related docs/process PRs are ready and merge order is unclear | [PR #267 / Issue #266](https://github.com/Clay-Agency/novel-task-tracker/pull/267) | Tracks the merge-order checklist until merged. |

## Routine review vs anomaly handling

### Routine review / queue maintenance

This is the normal maintainer path when clearing Project #1 review items:

- start with [`project-1-field-conventions.md`](./project-1-field-conventions.md)
- keep the **issue item** as the canonical queue record
- make sure `Evidence` contains the active PR link before relying on automation
- confirm expected automation behavior in [`project-status-sync.md`](./project-status-sync.md)
- if you hit duplicate-item cleanup, stacked follow-up handling, or merge-order questions, open the linked in-flight guide for that topic

### Anomaly / troubleshooting path

Use the anomaly path when any of the following happens:

- Project #1 fields do not update after a merge or issue close
- the workflow logs a permissions/auth error
- a maintainer cannot tell whether the problem is workflow logic or GitHub Projects access
- the dependency chain across related review items is ambiguous enough that automatic/project-default handling is unsafe

In that case:

1. check expected behavior in [`project-status-sync.md`](./project-status-sync.md)
2. if behavior is correct but execution failed, open [`projects-v2-auth-runbook.md`](./projects-v2-auth-runbook.md)
3. if the issue is workflow-policy/process related rather than auth related, use the linked topic-specific PR/issue above and prefer a narrow manual maintainer decision instead of guessing

## Maintainer notes

Until all Project #1 maintainer guides are merged, use these lightweight rules:

- prefer reviewing the **canonical issue item** first, not a duplicate PR item
- if two PRs are related, merge the **prerequisite/base PR** first
- after the prerequisite merges, rebase or retarget the follow-up PR before final review if needed
- after each merge, update the issue item's `Evidence` and confirm the resulting Project status is still accurate
- if the dependency chain is unclear, treat it as a maintainer anomaly and resolve it manually before merging further follow-ups
