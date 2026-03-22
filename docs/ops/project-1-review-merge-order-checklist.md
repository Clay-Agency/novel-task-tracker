# Project #1 review merge-order checklist (Issue #266)

Use this checklist when **multiple Project #1 items are in `Review` at the same time** and maintainers need a low-friction way to decide **what merges first**.

Goal: keep the queue aligned with the **issue-first review convention**, avoid merge-order mistakes on related PRs, and make the **post-merge Project updates** predictable.

Related docs:
- [`project-1-field-conventions.md`](./project-1-field-conventions.md)
- [`project-status-sync.md`](./project-status-sync.md)

## Default principles

1. **Treat the issue item as canonical.**
   - For normal issue-driven work, the **issue** is the actionable Project #1 item.
   - The PR is supporting evidence, not a second canonical queue entry.

2. **Merge prerequisites before follow-ups.**
   - If PR B depends on PR A, merge **A before B**.
   - Do not merge a follow-up PR just because it is green if its base assumptions still depend on an unmerged prerequisite.

3. **Prefer simpler policy/docs changes before dependent automation or implementation changes.**
   - When a docs/process PR defines the rule and a later PR implements or automates it, merge the rule-setting PR first.

4. **Keep stacked PRs short-lived.**
   - A temporarily stacked PR is acceptable when it keeps scope clean.
   - Once the base PR merges, promptly retarget/rebase the follow-up PR onto `main` before final merge if needed.

5. **After merge, update the issue evidence/status promptly.**
   - The issue item's `Evidence` field should show the relevant PR/merge reference.
   - The issue item's `Status` should reflect whether the issue is now truly done or still waiting on another follow-up.

## Maintainer checklist

### 1) Start from the controlling issue, not from the PR list

For each review-ready PR:
- identify the **controlling issue** (`Closes #...` or equivalent explicit linkage)
- confirm whether the **issue item** already exists in Project #1
- review/triage the work against the **issue item** as the canonical record

If both an issue item and PR item appear in Project #1 for the same work:
- treat the **issue item** as canonical
- use the PR URL in the issue item's `Evidence` field
- avoid using the duplicate PR item as the merge-order source of truth

### 2) Group the queue by dependency shape

Before merging, sort review items into these buckets:

- **Independent items**: can merge in any order.
- **Issue follow-up items**: a later PR/refinement depends on an earlier issue or decision landing first.
- **Stacked PRs**: the PR branch itself targets another open PR instead of `main`.

If an item belongs to a dependency chain, do **not** merge it purely by queue age or green CI.

### 3) Decide the merge order using this priority ladder

When several items are all green, use this order:

1. **Dependency bases first**
   - Merge the earliest prerequisite/base PR first.
   - Example: if `#263` depends on `#261`, merge `#261` first.

2. **Rule-setting docs/process changes before dependent automation/code**
   - If one PR establishes the maintainer convention and another automates or extends it, merge the convention-setting PR first.

3. **Independent, low-risk items before larger follow-ups when no dependency exists**
   - Prefer the smaller, self-contained review item if it does not block something else.

4. **Blocked stacked follow-ups only after retarget/rebase is clean**
   - After the base PR merges, confirm the follow-up PR has been rebased or retargeted appropriately.
   - Re-run or confirm green CI if the retarget/rebase changed the effective diff.

### 4) Handle stacked PRs explicitly

If a PR is stacked on another open PR:

- check the PR **base branch**
- confirm which base PR must merge first
- merge the base PR before the stacked follow-up
- after the base merges, ensure the follow-up PR is:
  - retargeted to `main`, or
  - rebased onto the updated `main`
- re-check that the follow-up PR still has:
  - clean scope
  - correct linked issue
  - green CI

Do **not** treat a stacked PR as immediately mergeable just because GitHub shows it as clean against its temporary base.

### 5) Use the issue-first review convention during merge

At merge time:
- review the PR in the context of the **issue item**
- make sure the issue item's `Evidence` field contains the PR URL before or at merge time
- avoid leaving both the issue item and a duplicate PR item as parallel `Review` records for the same work

Recommended `Evidence` lines:
- `PR: <url>` while waiting in `Review`
- `Merged: <url>` or `PR: <url>` after merge, depending on existing board habit

### 6) Update Project status after merge

After a PR merges, decide whether the controlling issue should move to `Done` or stay open for a follow-up.

Move the issue item to **Done** when:
- the merged PR fully resolves the issue scope
- no additional linked follow-up remains required for the same issue

Keep the issue item out of **Done** yet when:
- another required follow-up PR is still open
- the merge only landed a prerequisite policy/docs change
- Clay/Boe review still expects another explicit review item to land before the issue is complete

In all cases, confirm the issue item's `Evidence` field includes the final durable reference used to justify the new state.

## Quick decision table

| Situation | Merge first | Follow-up action |
| --- | --- | --- |
| Two unrelated green docs PRs | Either; prefer smaller/lower-risk first | Update each controlling issue normally |
| Docs/process PR + dependent automation PR | Docs/process PR | Rebase/retarget automation PR if needed |
| PR B stacked on PR A | PR A | Retarget/rebase PR B onto `main`, then re-check CI |
| Duplicate issue + PR items in Project #1 | Use issue item as canonical | Keep PR URL in issue `Evidence`; avoid PR-item-led triage |
| Merge lands but issue still has required follow-up | Do not mark issue done yet | Keep status aligned with remaining work |

## Anti-patterns to avoid

Do **not**:
- merge purely by oldest-review timestamp when dependencies exist
- use a duplicate PR Project item as the canonical review queue record for normal issue-driven work
- leave stacked follow-up PRs pointing at merged branches indefinitely
- mark an issue `Done` before its last required follow-up merges
- forget to update `Evidence` after a merge, leaving maintainers without the durable link trail
