# Project #1 maintainer triage guide — blocker vs ready (Issue #280)

Use this during Project #1 cleanup/review passes when an item looks active but it is not obvious whether it should stay in **Review**, move to **Blocked**, or return to **In progress**.

This guide is intentionally short. Reuse the linked runbooks for the detailed mechanics.

## Fast branching rule

Ask these in order:

1. **Is implementation complete and is the next maintainer action review/merge?**
   - **Yes** → keep/move item to **Review**.
   - **No, the PR is still draft or intentionally stacked behind another open PR** → do **not** treat it as `Review` yet. Continue below.
2. **Is progress blocked by a Clay decision?**
   - **Yes** → move item to **Blocked** and set `Needs decision=True`.
3. **Is progress blocked by some other dependency?**
   - **Yes** → move item to **Blocked** and keep `Needs decision=False` unless Clay input is explicitly required. This includes green-but-draft PRs that are waiting on a prerequisite merge/rebase before final review.
4. **Otherwise**
   - keep/move item to **In progress** (work still needed before review).

## Triage outcomes

| Situation | Project `Status` | `Needs decision` | Maintainer action |
| --- | --- | --- | --- |
| Implementation complete; waiting on review/merge | `Review` | `False` | Make sure `Evidence` links the active PR/CI and request final review. |
| Draft PR waiting on another PR / stack dependency before final review | `Blocked` | `False` | Keep it out of the active `Review` queue. In `Evidence`, use `Draft PR: <url>` and `Blocked by: <url>` (or `Ready after: <condition>`). |
| Blocked on explicit Clay decision (policy, direction, trade-off) | `Blocked` | `True` | Add/remove the repo `needs-decision` label as needed, state the decision question + options in the issue, and link the decision brief/evidence. |
| Blocked on external dependency but **not** a Clay decision (access, upstream fix, reviewer identity constraint, waiting on another repo/system) | `Blocked` | `False` | Record the dependency clearly in the issue and `Evidence`, plus the next trigger/checkpoint. |
| Work is still being implemented or revised before review | `In progress` | `False` (usually) | Leave with current owner and continue execution work. Draft PRs that are still changing belong here if they are not dependency-blocked. |

## How to classify common Project #1 cases

### 1) Clay-decision blocker
Use this when the work cannot move until Clay chooses a direction.

Examples:
- **#80** — auth approach decision for Project #1 automation (**GitHub App vs PAT**)
- **#126** — priority taxonomy decision (**add P3 vs collapse into P2**)

Maintainer checklist:
- Set Project `Status` to **Blocked**.
- Set Project `Needs decision` to **True**.
- Apply repo label `needs-decision`.
- Ensure the issue contains:
  - the decision question,
  - 1–3 options,
  - recommended default if helpful,
  - links to supporting evidence/runbooks.
- Link the durable doc instead of rewriting the whole context:
  - [`docs/ops/open-decisions.md`](./open-decisions.md)
  - [`docs/ops/needs-decision-snapshot.md`](./needs-decision-snapshot.md)

## 2) Dependency blocker (not decision-bound)
Use this when the work is blocked, but the blocker is an external dependency rather than a Clay decision.

Examples:
- waiting on upstream access/configuration
- waiting on another PR/repo/workflow
- waiting on a reviewer identity or permissions constraint to be resolved

Maintainer checklist:
- Set Project `Status` to **Blocked**.
- Keep Project `Needs decision` as **False** unless there is an actual Clay decision request.
- Do **not** apply `needs-decision` just because the item is stalled.
- In the issue, write the blocker in one sentence and state what event unblocks it.
- Put the concrete evidence link in the Project `Evidence` field.

## 3) Draft or stacked PR that is not review-ready yet
Use this when a PR exists, but it is still **draft** or intentionally stacked behind another open PR, so the next maintainer action is **not** final review/merge yet.

Maintainer checklist:
- If the PR is waiting on a prerequisite merge/rebase, set Project `Status` to **Blocked**.
- Keep Project `Needs decision` at **False** unless the stack order itself needs a Clay decision.
- Keep the **issue item** as the canonical Project record when it already tracks the draft PR.
- In Project `Evidence`, make the state obvious at a glance:
  - `Draft PR: <url>`
  - `Blocked by: <url>` or `Ready after: <condition>`
- Move the item to **Review** only when the PR is ready for final review/merge (for example, draft removed and prerequisite merged).

## 4) Merge-ready review item
Use this when implementation is done and the next meaningful step is review/merge rather than more execution.

Maintainer checklist:
- Set Project `Status` to **Review**.
- Keep Project `Needs decision` at **False**.
- Ensure Project `Evidence` includes, at minimum:
  - `PR: <url>`
  - `CI: <url>` when relevant
- Follow the review flow in [`CONTRIBUTING.md`](../../CONTRIBUTING.md#2-stage-review-process-required).
- Apply the de-duplication rule from [`docs/ops/project-1-field-conventions.md`](./project-1-field-conventions.md): keep the **issue item** as canonical when it already tracks the active PR.

## Short maintainer checklist for cleanup passes

When triaging a Project #1 item, confirm:
- Is the next action **review/merge**, **decision**, **dependency resolution**, or **more implementation**?
- Does `Status` match that next action?
- Does `Needs decision` reflect an actual Clay decision blocker, not just general delay?
- Does `Evidence` contain the single most useful link for the current state?
- If the item is in **Review**, is there a redundant PR item that should be removed?

## Related docs

- Field definitions and evidence conventions: [`docs/ops/project-1-field-conventions.md`](./project-1-field-conventions.md)
- Needs-decision process: [`CONTRIBUTING.md#needs-decision-convention`](../../CONTRIBUTING.md#needs-decision-convention)
- Open decision checklist: [`docs/ops/open-decisions.md`](./open-decisions.md)
