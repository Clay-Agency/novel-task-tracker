# Project #1 review queue cleanup runbook (Issue #258)

Use this runbook when **Clay-Agency org Project #1** still contains legacy **PR items** in `Review` that duplicate a canonical **issue item** already tracking the same work.

This is a **one-time / occasional hygiene task** for older items created before the issue-centric review convention was documented.

Related convention: [`project-1-field-conventions.md`](./project-1-field-conventions.md)

## Goal

Keep exactly **one actionable `Review` item per unit of work**:
- keep the **issue item** in Project #1
- keep the PR URL in the issue item’s **Evidence** field
- remove the redundant **PR item** from Project #1

## When a PR item is safe to remove

A Project #1 PR item is safe to delete when **all** of the following are true:

1. The PR has a controlling issue that is also in Project #1.
2. The **issue item** is the intended actionable item (usually `Review`).
3. The issue item’s **Evidence** field already includes the PR URL.
4. The PR item does **not** represent standalone repo-maintenance work with no controlling issue.

If any of the above is false, **do not delete the PR item** until the issue item is corrected or the exception is confirmed.

## Manual review steps

1. Open Project #1 and filter `Status = Review`.
2. Look for issue/PR pairs representing the same work.
3. For each pair:
   - open the **issue item**
   - confirm its **Evidence** field includes the PR link
   - confirm the issue item is the one that should remain actionable
4. Delete only the duplicate **PR item** from the project.
5. Re-check the review queue to confirm only the issue item remains.

## CLI-assisted audit

List Project #1 items as JSON:

```bash
gh project item-list 1 --owner Clay-Agency --limit 250 --format json
```

A typical duplicate pair will look like:
- issue item in `Review` with `Evidence: PR: <url>`
- PR item in `Review` pointing to the same PR URL

## CLI cleanup

Delete the redundant PR item by its **project item ID**:

```bash
gh project item-delete 1 --owner Clay-Agency --id <project-item-id>
```

Example legacy duplicates observed while opening Issue #258:
- issue #217 / PR #235
- issue #220 / PR #237
- issue #230 / PR #249
- issue #250 / PR #251

## Safety notes

- Deleting a **project item** does **not** delete the GitHub PR itself.
- Prefer deleting only the PR item after the issue item’s `Evidence` is confirmed.
- If unsure, leave the item in place and add a note/evidence link to the issue for follow-up.

## Expected result

After cleanup:
- Project #1 `Review` shows the **issue items** as the canonical queue
- each issue item carries the PR link in **Evidence**
- duplicate PR review items are gone
