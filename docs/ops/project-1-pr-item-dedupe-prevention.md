# Project #1 duplicate PR-item prevention plan (Issue #260)

Use this guide to **prevent duplicate PR items from reappearing** in **Clay-Agency org Project #1** after the one-time cleanup tracked in issue #258 / PR #259.

Related convention: [`project-1-field-conventions.md`](./project-1-field-conventions.md)

## Canonical rule

For normal implementation work:
- the **issue item** is the canonical Project #1 record
- the linked PR URL belongs in the issue item's **Evidence** field
- a duplicate **PR item** should not remain in Project #1 once the issue item is present

Exception:
- a **standalone PR** with **no controlling issue** may remain as its own Project item when it represents legitimate repo-maintenance or ops work

## Decision: preferred automation path

Use **workflow automation** as the primary prevention path, with manual cleanup as the fallback.

Chosen shape:
1. Trigger on PR lifecycle events where duplicate items commonly reappear (`opened`, `reopened`, `ready_for_review`, and `edited` when issue references may change).
2. Inspect whether the PR has a **controlling issue**.
3. If the controlling issue already exists in Project #1, treat the issue item as canonical and remove only the duplicate PR item.
4. If the workflow cannot prove the relationship safely, it should **skip** deletion and leave manual cleanup as the fallback path.

Why this is preferred over the alternatives:
- **Better than cron**: duplicates are removed near the moment they appear instead of lingering until a scheduled reconcile.
- **Better than manual-only wrappers**: prevention becomes the default path instead of depending on humans to remember cleanup.
- **Safer than broad project filters**: we still allow legitimate standalone PR items that do not have a controlling issue.

## Guardrails for safe auto-removal

Automation should delete a PR item from Project #1 only when **all** of the following are true:

1. The PR has a **controlling issue** (for example, a closing reference such as `Closes #123`, or another repo-approved link signal).
2. The controlling **issue item already exists in Project #1**.
3. The PR item and issue item clearly refer to the **same unit of work**.
4. The issue item is the intended actionable queue item under the review convention.
5. The PR is **not** a standalone maintenance/ops change that intentionally lives in Project #1 without a controlling issue.

If any guardrail is not satisfied, automation should:
- leave the PR item in place
- log a clear skip reason in the workflow summary
- require manual follow-up instead of guessing

## Recommended implementation contract

If/when this is implemented in GitHub Actions or a repo script, keep the behavior narrow:

- **Input**: one PR event at a time
- **Lookup**:
  - resolve the PR's Project #1 item, if any
  - resolve the controlling issue's Project #1 item, if any
- **Mutation**:
  - delete only the **project item** for the PR
  - never close, edit, or delete the PR itself
- **Fallback**:
  - if the controlling issue cannot be resolved confidently, do nothing automatically

Optional but useful summary output:
- `removed duplicate PR item for #<pr> because issue #<issue> is canonical`
- `skipped: no controlling issue found`
- `skipped: issue exists but is not in Project #1`
- `skipped: Evidence/relationship needs manual confirmation`

## Manual fallback

If duplicates still appear, use a narrow manual cleanup pass:

1. Open Project #1 and filter `Status = Review`.
2. Find issue/PR pairs representing the same work.
3. Confirm the **issue item** is the canonical queue item and already contains the PR URL in **Evidence**.
4. Delete only the duplicate **PR item** from Project #1.
5. Re-check the review queue to confirm only the issue item remains.

This manual path remains the safer option for:
- legacy items created before automation lands
- ambiguous issue/PR relationships
- one-off exceptions where human review is safer than automatic deletion

## Non-goals

This prevention path should **not**:
- remove standalone PR items that have no controlling issue
- rewrite the team's issue-centric review convention
- depend on a daily cron job as the only line of defense
- assume every PR in Project #1 is a duplicate
