# Project #1 post-merge hygiene checklist (Issue #282)

Use this immediately after a Project #1 review item merges or otherwise reaches a done state.

Keep it short: this is the **final consistency pass** after merge, not a second review.

Related docs:
- [`project-1-field-conventions.md`](./project-1-field-conventions.md)
- [`project-status-sync.md`](./project-status-sync.md)
- [`../../CONTRIBUTING.md#project-1-board-fields-owner-agent--needs-decision--evidence`](../../CONTRIBUTING.md#project-1-board-fields-owner-agent--needs-decision--evidence)

## Maintainer checklist

### 1) Confirm the canonical Project item
- Keep the **issue item** as the canonical Project #1 record when it already tracks the merged PR.
- If a separate PR item is now redundant, remove the duplicate PR item instead of leaving parallel done/review records.

### 2) Update `Status` to match the real next action
- Move the canonical item to **Done** when the merge/close completes the tracked scope.
- Do **not** leave the item in **Review** after merge just because the PR was recently active.
- If merge uncovered immediate remaining work on the same issue, move the item to the status that reflects the next real action (`In progress` or `Blocked`).

### 3) Verify `Evidence` explains the final state
- Replace review-only evidence with the most useful durable completion reference.
- Keep it short; usually 1–3 lines is enough.
- Preferred lines:
  - `PR: <merged-pr-url>`
  - `Issue: <issue-url>`
  - `Follow-up: <issue-url>` when cleanup revealed a new required item

### 4) Run a duplicate-item sanity check
- Make sure Project #1 does **not** keep both:
  - the completed issue item, and
  - a stale PR item for the same work
- If follow-up work was split into a new issue, confirm the new issue is the only active Project item that remains for that workstream.

### 5) Decide whether to leave a note or update durable docs
- Leave a short **issue/PR note** when the cleanup explains a **one-off item-specific action**:
  - why a status was corrected
  - why a duplicate Project item was removed
  - what small follow-up issue was created
- Update a **durable doc** (runbook/checklist/convention) when the merge exposed a **repeatable rule, policy change, or recurring hygiene gap** that future maintainers should follow.

## Quick decision rule: note vs durable doc

Use a **note** if the information only helps explain this specific item.

Update a **durable doc** if another maintainer is likely to need the same guidance again during a later cleanup/review pass.

## Expected end state

When this checklist is done:
- the canonical Project item reflects the true final status
- `Evidence` contains the merged PR or other durable completion link
- redundant PR items are removed
- any repeatable lesson is captured in a maintainer-facing doc instead of being lost in one-off comments
