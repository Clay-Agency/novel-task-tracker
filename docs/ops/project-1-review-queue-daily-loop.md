# Project #1 review-queue daily loop SOP (Issue #274)

Use this SOP when doing one focused maintainer pass through **Clay-Agency org Project #1** review items.
It is intentionally compact: follow this start-to-finish flow, and use the linked runbooks only when you need detail.

## Goal

In one session:
1. scan the current **Review** queue,
2. identify mergeable items,
3. avoid merging PRs out of dependency order,
4. merge items whose required checks are green,
5. confirm post-merge Project state is correct.

## Before you start

Have these references open:
- Project field meanings: [`project-1-field-conventions.md`](./project-1-field-conventions.md)
- CI interpretation for review items: [`project-1-ci-triage-quick-guide.md`](./project-1-ci-triage-quick-guide.md)
- Branch protection baseline: [`branch-protection.md`](./branch-protection.md)
- Project status sync behavior: [`project-status-sync.md`](./project-status-sync.md)
- Projects v2 auth/troubleshooting: [`projects-v2-auth-runbook.md`](./projects-v2-auth-runbook.md)
- Deep CI failure handling: [`ci-maintenance-runbook.md`](./ci-maintenance-runbook.md)

## Daily loop

### 1) Scan the Review queue

Start with Project #1 items whose **Status** is `Review`.
For each item, identify the canonical links:
- issue link
- open PR link
- latest CI/check context

If an item is in `Review` but has no open PR, remove it from the merge pass and correct the Project state before continuing.

### 2) Confirm the issue is the canonical Project record

Use the **issue** as the source-of-truth Project item whenever possible.
Before reviewing the PR, confirm the issue still reflects the work accurately:
- title/scope still matches the PR,
- **Owner agent** is still correct,
- **Needs decision** is not blocking,
- **Evidence** includes the current PR link when applicable.

Field meanings and expectations live in [`project-1-field-conventions.md`](./project-1-field-conventions.md).

### 3) Check dependency / merge order before reading CI

Do not merge a PR just because checks are green.
First confirm it is not blocked behind another open PR.

Look for signs of dependency such as:
- PR body or issue notes referencing a prerequisite PR/issue,
- stacked branch naming or “based on” language,
- review comments noting “merge after <other PR>”,
- failing/irrelevant diffs caused by a missing upstream merge.

If the PR depends on another open PR:
- leave it in the queue,
- merge the prerequisite first,
- then refresh checks/rebase status before returning.

### 4) Classify the PR and read only the checks that matter

Use [`project-1-ci-triage-quick-guide.md`](./project-1-ci-triage-quick-guide.md) to bucket the PR:
- **docs / process PR**, or
- **automation / code PR**.

Then apply the required checks for that bucket:
- **Always require** `Verify (core)`.
- Require **Markdown link check** when docs/README links or file paths changed.
- Require full **CI** for automation/code PRs.
- Treat scheduled maintenance workflows as non-gating.

If a required check is red, stop and triage instead of guessing.
Use [`ci-maintenance-runbook.md`](./ci-maintenance-runbook.md) when the failure needs deeper handling.

### 5) Merge the ready PRs

A PR is normally ready to merge when:
- scope still matches the issue,
- it is not blocked by dependency order,
- required checks for its bucket are green,
- there is no open decision preventing merge.

Merge in dependency order, oldest prerequisite first.
After each merge, refresh the queue before acting on the next item.
A merge can change which downstream items are now ready.

### 6) Confirm post-merge Project updates

After merge, confirm the Project item moved to the expected end state.
The status-sync workflow is supposed to reconcile merged work, but maintainers should still verify the result.

Check that:
- the issue/PR no longer needs active review handling,
- **Status** moved appropriately toward `Done`,
- **Evidence** contains the merged PR reference,
- any stale `Needs decision=True` flag was cleared if no longer applicable.

If the automatic Project update did not happen:
- review [`project-status-sync.md`](./project-status-sync.md),
- check Projects auth/troubleshooting in [`projects-v2-auth-runbook.md`](./projects-v2-auth-runbook.md),
- then correct the Project item manually if needed.

## Fast stop conditions

Pause the loop and escalate instead of improvising when:
- the Project item and PR scope no longer match,
- a dependency chain is unclear,
- required checks are failing for unclear reasons,
- branch protection behavior differs from the runbook,
- Project automation did not update and the cause is not obvious,
- a Clay decision is required before merge.

## One-pass maintainer checklist

Use this as the compact session checklist:
1. Open Project #1 `Review` items.
2. Verify each item has the right issue + PR pairing.
3. Check for prerequisite / stacked PR dependencies.
4. Classify each PR by review bucket.
5. Read only the required checks for that bucket.
6. Merge only the items that are truly ready.
7. Verify post-merge Project/Evidence state.
8. Escalate unclear blockers instead of guessing.
