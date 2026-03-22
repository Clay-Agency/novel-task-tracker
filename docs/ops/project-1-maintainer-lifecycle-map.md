# Project #1 maintainer lifecycle map (Issue #284)

Use this as the **compact navigation layer** for Project #1 maintainer work.
It tells you **which maintainer action comes next** as an item moves from triage → review → merge → post-merge hygiene.

This page does **not** replace the detailed guides.
Open the linked runbook for the phase you are currently in.

## Lifecycle at a glance

| Phase | Ask this first | Primary maintainer action | Open this guide next |
| --- | --- | --- | --- |
| **1. Triage** | What is the real next action for this item? | Set the Project item to `In progress`, `Blocked`, or `Review` based on the current state. | [`project-1-triage-guide.md`](./project-1-triage-guide.md) |
| **2. Review preparation** | Is this review item correctly represented on Project #1? | Start from the canonical issue item, confirm `Evidence`, and do a fast dependency/risk scan before merge review. | [`project-1-review-clearing-quick-start.md`](./project-1-review-clearing-quick-start.md) |
| **3. Review queue / merge decision** | Is this PR actually merge-ready, and are the right checks green? | Confirm dependency order, classify the PR, read only the checks that matter, then merge in the right order. | [`project-1-review-queue-daily-loop.md`](./project-1-review-queue-daily-loop.md) and [`project-1-ci-triage-quick-guide.md`](./project-1-ci-triage-quick-guide.md) |
| **4. Post-merge hygiene** | Did Project #1 end in the correct final state? | Confirm the canonical item, move status to the real end state, update `Evidence`, and remove redundant PR items. | [`project-1-post-merge-hygiene-checklist.md`](./project-1-post-merge-hygiene-checklist.md) |
| **Any phase: automation anomaly** | Did expected Project automation fail or look wrong? | Check expected automation behavior first, then auth/config only if needed. | [`project-status-sync.md`](./project-status-sync.md) → [`projects-v2-auth-runbook.md`](./projects-v2-auth-runbook.md) |

## Default maintainer path

Use this order for a normal Project #1 maintainer pass:

1. **Triage the item correctly**
   - Use [`project-1-triage-guide.md`](./project-1-triage-guide.md).
   - Decide whether the next real action is more implementation, dependency resolution, a Clay decision, or review/merge.
2. **Start review work from the canonical issue item**
   - Use [`project-1-review-clearing-quick-start.md`](./project-1-review-clearing-quick-start.md).
   - Confirm `Status`, `Needs decision`, `Owner agent`, and `Evidence` before treating the PR as mergeable.
3. **Clear the review queue safely**
   - Use [`project-1-review-queue-daily-loop.md`](./project-1-review-queue-daily-loop.md).
   - Use [`project-1-ci-triage-quick-guide.md`](./project-1-ci-triage-quick-guide.md) to decide which checks are merge-blocking for the PR type.
4. **Run the final post-merge consistency pass**
   - Use [`project-1-post-merge-hygiene-checklist.md`](./project-1-post-merge-hygiene-checklist.md).
   - Leave the Project item in its true final state instead of leaving stale review metadata behind.

## Which doc to open by symptom

| If you see... | Open... | Why |
| --- | --- | --- |
| An item looks active, but you cannot tell whether it should be `Blocked`, `In progress`, or `Review` | [`project-1-triage-guide.md`](./project-1-triage-guide.md) | Decides blocker-vs-ready status and `Needs decision` usage. |
| A Project item is in `Review` and you want the shortest safe merge-prep checklist | [`project-1-review-clearing-quick-start.md`](./project-1-review-clearing-quick-start.md) | Gives the compact pre-merge maintainer path. |
| You are doing a full queue-clearing pass across multiple review items | [`project-1-review-queue-daily-loop.md`](./project-1-review-queue-daily-loop.md) | Provides the end-to-end session SOP. |
| PR checks are noisy and you only want to know what is actually merge-blocking | [`project-1-ci-triage-quick-guide.md`](./project-1-ci-triage-quick-guide.md) | Separates required vs advisory checks by PR type. |
| The PR merged, but the board still looks wrong or messy | [`project-1-post-merge-hygiene-checklist.md`](./project-1-post-merge-hygiene-checklist.md) | Handles final status/evidence cleanup and duplicate-item removal. |
| Project fields did not update after close/merge | [`project-status-sync.md`](./project-status-sync.md) | Explains expected automation behavior and normal no-op cases. |
| Project automation cannot read/write Project #1 | [`projects-v2-auth-runbook.md`](./projects-v2-auth-runbook.md) | Covers GitHub App/PAT auth and troubleshooting. |

## Minimal phase rules

### 1) Triage
- `Review` means implementation is complete and the next action is review/merge.
- `Blocked` means progress is stopped by a dependency; set `Needs decision=True` only for an actual Clay decision blocker.
- `In progress` means more execution work is still required before review.

Reference: [`project-1-triage-guide.md`](./project-1-triage-guide.md)

### 2) Review
- Start from the **issue item** as the canonical Project #1 record when it already tracks the PR.
- Confirm `Evidence` contains the active PR (and CI link when useful).
- Do not treat green checks as enough until dependency order is clear.

References:
- [`project-1-review-clearing-quick-start.md`](./project-1-review-clearing-quick-start.md)
- [`project-1-review-queue-daily-loop.md`](./project-1-review-queue-daily-loop.md)
- [`project-1-ci-triage-quick-guide.md`](./project-1-ci-triage-quick-guide.md)

### 3) Merge
- Merge only after the required checks for that PR type are green.
- Merge prerequisite/base PRs before dependent follow-ups.
- If dependency order is unclear, pause instead of improvising.

References:
- [`project-1-review-queue-daily-loop.md`](./project-1-review-queue-daily-loop.md)
- [`branch-protection.md`](./branch-protection.md)

### 4) Post-merge hygiene
- Do not leave the canonical item in `Review` after the merge is done.
- Keep the final `Evidence` durable and short.
- Remove redundant PR items when the issue item already captures the completed work.

Reference: [`project-1-post-merge-hygiene-checklist.md`](./project-1-post-merge-hygiene-checklist.md)

## Related navigation docs

- Broader maintainer doc hub: [`project-1-maintainer-runbook-index.md`](./project-1-maintainer-runbook-index.md)
- Field semantics: [`project-1-field-conventions.md`](./project-1-field-conventions.md)
- Project automation behavior: [`project-status-sync.md`](./project-status-sync.md)
