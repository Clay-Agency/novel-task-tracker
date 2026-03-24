# Project #1 review-clearing quick start (Issue #270)

Use this page when you are actively clearing multiple **Project #1** review items and need the shortest safe maintainer path.
It is intentionally brief: use it as the session checklist, then open the linked runbooks/issues for full detail.

## Recommended order of checks

### 1) Start from the canonical issue item
- Open **Project #1** and review the **issue item first**.
- Confirm the item still matches the issue-first convention:
  - `Status=Review`
  - if the PR is still draft/stacked, stop and move it out of `Review` before continuing
  - `Owner agent` is still accurate (if used)
  - `Needs decision=False` unless Clay input is required
  - `Evidence` includes the active PR link
- Canonical field definitions + expectations: [`project-1-field-conventions.md`](./project-1-field-conventions.md)

### 2) Do a dependency / risk scan before merge
- Check whether the PR touches dependency-sensitive files or automation surfaces (`package.json`, `package-lock.json`, `.github/workflows/`, `docs/ops/`).
- Confirm CI is not hiding a dependency-risk problem, especially audit/build/test failures.
- Use the failure meanings and triage path in [`ci-maintenance-runbook.md`](./ci-maintenance-runbook.md).

### 3) Check CI status on the candidate PR
- Make sure required PR checks are green before merging.
- If checks appear missing right after a push/open, treat short-lived "no checks reported" as a possible GitHub propagation delay and retry once before escalating.
- CI expectations and known Actions flakes: [`ci-maintenance-runbook.md`](./ci-maintenance-runbook.md)

### 4) Confirm merge order before pressing merge
- If multiple review items are related, merge the **prerequisite/base item first**.
- If the queue includes duplicate PR items, stacked follow-up PRs, or unclear dependencies, stop and use the deeper guide instead of guessing. Draft/stacked PRs are not merge-ready review items yet.
- Current detailed references:
  - Duplicate PR-item cleanup: [PR #261 / Issue #260](https://github.com/Clay-Agency/novel-task-tracker/pull/261)
  - Stacked follow-up PR handling: [PR #265 / Issue #264](https://github.com/Clay-Agency/novel-task-tracker/pull/265)
  - Merge-order checklist: [PR #267 / Issue #266](https://github.com/Clay-Agency/novel-task-tracker/pull/267)

### 5) Merge, then verify status/evidence updates
- After merge, check whether Project automation should update the item automatically.
- Confirm the issue item still has the right `Evidence` and resulting `Status`.
- Expected automation behavior: [`project-status-sync.md`](./project-status-sync.md)
- Field requirements for `Evidence` / `Status`: [`project-1-field-conventions.md`](./project-1-field-conventions.md)

### 6) Escalate only if behavior looks wrong
- If the merge result is correct but Project fields did not update, use the auth/config troubleshooting runbook.
- Projects v2 auth + troubleshooting: [`projects-v2-auth-runbook.md`](./projects-v2-auth-runbook.md)

## Fast stop conditions

Pause the review-clearing session and treat the item as a maintainer anomaly when:
- `Needs decision=True` or the issue clearly needs a Clay decision
- the PR is stacked on an unmerged prerequisite
- duplicate issue/PR items make the canonical record unclear
- CI is red for a real failure (not a transient checks delay)
- Project status/evidence automation behaves differently from [`project-status-sync.md`](./project-status-sync.md)

## One-screen maintainer checklist

1. Issue item is the canonical review record.
2. `Evidence` points at the active PR.
3. Dependency/automation risk checked.
4. PR CI green.
5. Merge order confirmed.
6. Post-merge `Status`/`Evidence` verified.
7. Auth/config troubleshooting only if expected automation failed.
