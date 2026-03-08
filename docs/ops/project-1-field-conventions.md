# Clay-Agency org Project #1 — field conventions (Issue #179)

As observed **2026-03-06** (fields/options may evolve).

## Status (single select)

Allowed values:
- `Todo`
- `In progress`
- `Blocked`
- `Review`
- `Done`

Conventions:
- **Todo**: work not started / no one actively driving it yet.
- **In progress**: an agent is actively working (usually set `Owner agent`).
- **Blocked**: cannot proceed due to an external dependency (access, upstream change, waiting on review, etc.). If the blocker is a **decision**, set `Needs decision=True` and state the decision request in the issue.
- **Review**: implementation is done and waiting on review/merge (typically there is an open PR).
- **Done**: work is complete (merged/closed) and no further action is expected.

## Priority (single select)

Allowed values:
- `P0`
- `P1`
- `P2`

Notes:
- `P3` is **pending a decision** (see Issue #126): https://github.com/Clay-Agency/novel-task-tracker/issues/126

## Owner agent (single select)

Allowed values:
- `Boe`
- `Bine`
- `May`

Conventions:
- Set when one agent is the primary driver/accountable owner.
- Leave empty when unowned or when ownership is genuinely shared.

## Needs decision (single select)

Allowed values:
- `True`
- `False`

Conventions:
- Set **True** when progress requires a Clay/human decision (policy choice, priority trade-off, unclear direction) and the task is blocked until that decision is made.
- When `Needs decision=True`, the issue should include:
  - the decision question
  - 1–3 options
  - (optional) a recommended default
  - links/evidence (can also be mirrored into the project `Evidence` field)
- For repeatable issue updates/comments, use [`docs/ops/decision-brief-template.md`](./decision-brief-template.md).
- Set back to **False** once the decision is made or no longer blocks progress.

## Evidence (text)

Conventions:
- Use this field as the **living link hub** for the issue/PR. Keep it short (typically 1–5 lines).
- Prefer durable URLs (PR link, Actions run link, doc/decision record path, screenshot/GIF link).
- Suggested format (one item per line):
  - `PR: <url>`
  - `CI: <url>`
  - `Decision record: docs/decisions/DR-XXXX-...md`
  - `QA evidence: <url or docs/qa/...#anchor>`
- When moving work to **Review** or **Done**, make sure the Evidence field includes the relevant PR/merge reference.
