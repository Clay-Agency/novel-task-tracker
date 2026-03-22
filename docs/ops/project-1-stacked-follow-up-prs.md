# Project #1 stacked follow-up PR handling (Issue #264)

Use this guide when a **Project #1 follow-up PR** is intentionally opened on top of another still-open PR instead of directly on `main`.

## Default rule

Prefer PRs that target **`main`**.

A stacked PR is an exception, not the default. Use it only when it keeps scope materially cleaner than folding the work into the prerequisite PR or waiting for the prerequisite to merge first.

## When stacking is acceptable

Stacking is acceptable when **all** of the following are true:

1. The follow-up work is a **separate issue or reviewable unit**.
2. The prerequisite PR is already the right place for the lower-layer change and should stay narrowly scoped.
3. Rebasing the follow-up work onto `main` **before** the prerequisite merges would create misleading noise, duplicated edits, or incomplete behavior.
4. The PR description clearly states the dependency (for example: `Depends on #261`) and explains that the base branch is temporary.
5. Reviewers can still meaningfully review the follow-up PR by focusing on the delta from the prerequisite PR.

Typical acceptable cases:
- docs/process follow-up that depends on another docs/process PR landing first
- automation follow-up that builds directly on a policy/runbook PR already under review
- narrowly layered refactors where the lower layer and upper layer should be reviewed separately

## When work should rebase to `main` before review

Do **not** stack the PR when any of the following is true:

- the work can cleanly target `main` without losing clarity
- the prerequisite PR is likely to merge immediately, so waiting is simpler than stacking
- the stacked diff would make review confusing or hide the true net change
- the follow-up PR is not independently understandable without reading a large dependent chain
- the stack is being used mainly to avoid merge conflicts rather than preserve clean scope

If in doubt, prefer:
1. merge/review the prerequisite first, then
2. rebase the follow-up branch onto `main`, then
3. open or update the follow-up PR against `main`

## Author requirements for stacked follow-up PRs

If a stacked PR is necessary, the author should:

1. Keep it scoped to its own issue.
2. Set the PR base to the prerequisite branch only for as long as needed.
3. Add an explicit note in the PR body such as:
   - `Depends on #261 landing first (temporary base: feat/issue-260-...)`
4. Keep the controlling issue as the canonical Project #1 item.
5. Add/update the issue item's **Evidence** field with the follow-up PR URL when the PR is ready for review.
6. After the prerequisite merges, promptly retarget/rebase so the PR ends up targeting `main`.

## Maintainer checklist after the prerequisite PR merges

When the lower PR merges first, maintainers (or the PR author) should do this promptly for each stacked follow-up PR:

1. **Confirm dependency landed**
   - verify the prerequisite PR is merged into `main`
2. **Retarget the PR base to `main`**
   - change the GitHub PR base from the prerequisite branch to `main`
3. **Rebase or merge `main` into the follow-up branch**
   - prefer a clean rebase when practical
   - resolve conflicts, if any
4. **Sanity-check the diff**
   - confirm the PR now shows only the intended net-new changes
   - remove any already-merged prerequisite commits from the visible diff
5. **Refresh validation as needed**
   - rerun the lightweight relevant checks for the follow-up PR
6. **Update the PR body**
   - replace the temporary stack note with a short note that the PR has been retargeted/rebased onto `main`
7. **Reconfirm Project #1 evidence**
   - ensure the controlling issue item still has the correct PR URL and status context

## Recommended PR-body language

For an intentionally stacked follow-up PR, add a short note like:

```md
Depends on #261 landing first (temporary base set to its branch for clean scope).
After #261 merges, this PR should be retargeted/rebased onto `main`.
```

After retargeting/rebasing, replace it with:

```md
Originally stacked on #261 for clean scope; now retargeted/rebased onto `main` after #261 merged.
```

## Project #1 convention impact

Stacking does **not** change the Project #1 canonical-item rule:

- keep the **issue item** as the canonical queue item
- use the issue item's **Evidence** field to hold the active PR link(s)
- do not rely on the temporary stacked PR base as workflow state; clear it once the prerequisite lands

## Non-goals

This guidance does **not**:
- require every follow-up PR to be stacked
- permit long-lived multi-PR chains by default
- replace normal preference for `main`-based review
- automate retarget/rebase steps by itself
