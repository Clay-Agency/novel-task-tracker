# Project #1 — handling draft stacked review items

Use this when a Project #1 item has an open PR that is intentionally **draft**, **dependency-bound**, or part of a **stacked docs series** (for example PR #285).

## Default status convention

For draft stacked PRs, keep the Project #1 item in **In progress** by default.

Why:
- `Review` should mean a maintainer can take a real review/merge action now.
- Draft stacked PRs are often green but intentionally **not ready for final review**.
- Keeping them in `In progress` avoids making the review queue look artificially ready.

Move the item to **Review** only when all of the following are true:
- the PR is no longer draft
- any required base/dependency PRs are already merged (or are no longer blockers)
- the author is explicitly asking for review/merge
- the Evidence field points to the ready PR + relevant CI proof

Use **Blocked** instead of `In progress` only when the next step truly depends on an external blocker (for example: waiting on a prerequisite PR to merge, waiting on access, or waiting on a Clay decision).

## Evidence text convention

When a PR is draft/stacked, make that obvious in the Project #1 `Evidence` field.

Recommended format (one item per line):
- `PR (draft): <url>`
- `Depends on: <url or #issue/pr>`
- `Ready after: <what must happen next>`
- `CI: <url>`

Example:
- `PR (draft): https://github.com/Clay-Agency/novel-task-tracker/pull/285`
- `Depends on: base=main; kept draft until lifecycle-map wording is reviewed`
- `Ready after: convert PR to ready-for-review and confirm docs links`
- `CI: https://github.com/Clay-Agency/novel-task-tracker/actions/runs/...`

## Maintainer triage rule

When triaging Project #1 review items:
1. If the linked PR is **draft**, do **not** treat it as an active `Review` item yet.
2. Check the Evidence field for the dependency/ready signal.
3. Keep the item in `In progress` unless a true blocker justifies `Blocked`.
4. Move it to `Review` once the PR is ready and the dependency note is cleared.

## Author checklist for stacked draft PRs

Before leaving a stacked draft PR in Project #1:
- keep the PR in **Draft** until it is genuinely reviewable
- mirror the draft/stacked state in the issue body or latest progress comment
- update the Project `Evidence` field with the `PR (draft)` + `Ready after` lines
- avoid moving the item to `Review` just because CI is green

## Related docs

- [Project #1 field conventions](./project-1-field-conventions.md)
- [CONTRIBUTING.md — Project #1 board fields](../../CONTRIBUTING.md#project-1-board-fields-owner-agent--needs-decision--evidence)
- [README — Ops / Automation quick links](../../README.md#ops--automation)
