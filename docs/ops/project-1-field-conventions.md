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
- **Review**: implementation is done and waiting on review/merge (typically there is an open PR). In Project #1, **Review should track the issue item, not a duplicate PR item, for the same underlying work**.
- **Done**: work is complete (merged/closed) and no further action is expected.

Review queue convention:
- Treat the **issue** as the canonical/actionable Project #1 item for a unit of work.
- When implementation is ready for review, move the **issue item** to `Review` and add the PR URL to the issue item's `Evidence` field.
- **Do not add the implementation PR to Project #1** when it would duplicate the issue already being tracked. This keeps heartbeat/review queues low-noise.
- Exception: a PR may be added to Project #1 only when the **PR itself is the primary work item** (for example, repo-maintenance work with no controlling issue). In that case, the PR item can carry the actionable status.

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
- Set back to **False** once the decision is made or no longer blocks progress.

## Evidence (text)

Conventions:
- Use this field as the **living link hub** for the canonical Project item (usually the issue). Keep it short (typically 1–5 lines).
- Prefer durable URLs (PR link, Actions run link, doc/decision record path, screenshot/GIF link).
- Suggested format (one item per line):
  - `PR: <url>`
  - `CI: <url>`
  - `Decision record: docs/decisions/DR-XXXX-...md`
  - `QA evidence: <url or docs/qa/...#anchor>`
- When moving work to **Review** or **Done**, make sure the canonical item’s Evidence field includes the relevant PR/merge reference.
