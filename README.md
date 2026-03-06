# novel-task-tracker

Baseline React scaffold for the Novel Task Tracker project.

## Live demo
GitHub Pages: https://clay-agency.github.io/novel-task-tracker/

Single source of truth for the pilot URL: [`docs/pilot/pilot-url.md`](./docs/pilot/pilot-url.md)

## Open decisions

Quick filter: [`label:needs-decision`](https://github.com/Clay-Agency/novel-task-tracker/issues?q=is%3Aopen+label%3Aneeds-decision)

### `needs-decision` (how to use it)

Use the `needs-decision` label when an issue/PR is blocked on an **explicit decision from Clay**.

- Apply/remove guidelines: [`CONTRIBUTING.md#needs-decision-convention`](./CONTRIBUTING.md#needs-decision-convention)
- Canonical daily snapshot issue (automation overwrites the body): search for [`Needs-decision snapshot (automated)`](https://github.com/Clay-Agency/novel-task-tracker/issues?q=is%3Aissue+is%3Aopen+%22Needs-decision+snapshot+%28automated%29%22)
- Run snapshot manually: [Actions → “Needs-decision daily snapshot”](https://github.com/Clay-Agency/novel-task-tracker/actions/workflows/needs-decision-snapshot.yml) → **Run workflow** (no Projects v2 auth required)

- **#80 Projects v2 auth for Project #1 automation**: decide **GitHub App vs PAT** (so Actions can update Project fields like Done date/Needs decision). Links: [issue](https://github.com/Clay-Agency/novel-task-tracker/issues/80), [decision record](https://github.com/Clay-Agency/novel-task-tracker/issues/80#issuecomment-3941544627), [runbook](./docs/ops/projects-v2-auth-runbook.md)
- **#126 Priority taxonomy (P0–P3 vs P0–P2)**: decide whether to **add P3** to Project #1 (or collapse P3 into P2). Links: [issue](https://github.com/Clay-Agency/novel-task-tracker/issues/126), [decision memo](https://github.com/Clay-Agency/novel-task-tracker/issues/126#issuecomment-3993404482)

Checklist: [`docs/ops/open-decisions.md`](./docs/ops/open-decisions.md)

## Prerequisites
- Node.js 18+
- npm 9+

## Setup
```bash
npm install
```

## Run locally
```bash
npm run dev
```

Alias command (same as `dev`):
```bash
npm run start
```

## Quality checks
```bash
npm run lint
npm run typecheck
npm run test
npm run e2e
```

## Build
```bash
npm run build
```

## Ops / Automation

### Quick links
- Projects v2 auth runbook: [`docs/ops/projects-v2-auth-runbook.md`](./docs/ops/projects-v2-auth-runbook.md)
- Project #1 field conventions: [`docs/ops/project-1-field-conventions.md`](./docs/ops/project-1-field-conventions.md)
- Clay admin quickstart: [`docs/ops/clay-admin-quickstart.md`](./docs/ops/clay-admin-quickstart.md)
- Branch protection runbook (require **Verify (core)** on `main`): [`docs/ops/branch-protection.md`](./docs/ops/branch-protection.md)

Project #1 status sync workflows require **GitHub Projects v2 auth** (separate token).
Tracking issue: [#80](https://github.com/Clay-Agency/novel-task-tracker/issues/80)

## CI maintenance runbook (Issue #72)
Weekly scheduled CI + manual dispatch procedure and failure triage: [`docs/ops/ci-maintenance-runbook.md`](./docs/ops/ci-maintenance-runbook.md).

## Project status sync (Issue #78)
Workflow behavior: [`docs/ops/project-status-sync.md`](./docs/ops/project-status-sync.md).

## Projects v2 automation auth (Issue #96)
GitHub Projects v2 automation requires a separate token (GitHub App preferred; PAT fallback).

Runbook: [`docs/ops/projects-v2-auth-runbook.md`](./docs/ops/projects-v2-auth-runbook.md)

Workflows look for these GitHub Actions names:
- **GitHub App (preferred)**: `PROJECTS_APP_ID` (var or secret) + `PROJECTS_APP_PRIVATE_KEY` (secret)
- **PAT fallback**: `PROJECT_STATUS_SYNC_TOKEN` (secret)

A daily scheduled preflight workflow verifies those names are set:
- [`.github/workflows/projects-v2-auth-preflight.yml`](./.github/workflows/projects-v2-auth-preflight.yml)
- Docs (what it checks + how to silence temporarily): [`docs/ops/projects-v2-auth-runbook.md`](./docs/ops/projects-v2-auth-runbook.md)

## Core test completion gate (Issue #12)
Core test scope and checklist live in [`docs/testing/core-test-strategy.md`](./docs/testing/core-test-strategy.md).

Gate must pass before merge:
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run e2e` (Playwright smoke suite)
- Unit coverage for task domain/reducer/persistence logic
- UI integration coverage for CRUD + search/filter/sort + persistence
- Deterministic test behavior


## Filing issues
Use the GitHub issue templates in `.github/ISSUE_TEMPLATE/` so reports are actionable:
- **Bug report**: product defects (include environment, repro, expected/actual, severity)
- **QA finding**: validation findings mapped to checklist items in `docs/qa/`
- **Feature request**: proposed enhancements with problem statement + success criteria

When filing bugs or QA findings, link the relevant checklist section when applicable:
- `docs/qa/responsive-qa-checklist.md`
- `docs/qa/pilot-readiness-cross-browser-plan.md`

## Branch / PR workflow
1. Create a branch from `main` using `feat/issue-<number>-<summary>`.
2. Keep commits small and scoped to one issue.
3. Open a PR that references the issue (example: `Closes #5`).
4. Follow the required 2-stage review process in [`CONTRIBUTING.md`](./CONTRIBUTING.md):
   - Stage 1 self-review by author (xhigh reasoning)
   - Stage 2 final review by Boe
5. Use the PR checklist template and attach lint/test/build evidence.

## Core task domain model (Issue #6)
Task shape in state:
- `id` (string, required)
- `title` (string, required, trimmed non-empty)
- `status` (`open` | `completed`, required)
- `createdAt` (ISO timestamp, required)
- `updatedAt` (ISO timestamp, required)
- `description` (string | null, optional)
- `completedAt` (ISO timestamp | null, optional)
- `dueDate` (`YYYY-MM-DD` | null, optional)
- `priority` (`normal` | `high`, optional)
- `estimatedDurationMin` (number | null, optional)
- `energy` (`low` | `medium` | `high` | null, optional)
- `context` (`deep-work` | `admin` | `errands` | `calls` | null, optional)

State actions implemented in reducer/store:
- create
- edit
- complete
- reopen
- delete
- import (replace list from validated JSON payload)

## Core UI flows (Issue #7)
Implemented in the app UI:
- Create task form with title validation and optional description.
- Task list with empty states.
- Update flows: edit, complete/reopen.
- Delete flow.
- Visually distinct status badges/cards for open vs completed tasks.
- Baseline list controls: search (title/description), status filter, and sort.
- Export current task list to versioned JSON and import task list from JSON with shape validation.

## Novel differentiator: Time-Energy Fit Queue (Issue #11)
TEFQ adds a deterministic “Now queue” to help users pick what to do next based on current constraints.

### Inputs
- Per-task metadata: estimated duration, energy required, optional due date/priority/context.
- Current constraints: available minutes, current energy, optional context filter.

### Deterministic pilot scoring
- `+3` if `task.duration <= availableTime`
- `-2` if task exceeds available time (stretch item)
- `+2` exact energy match, `+1` adjacent energy match
- `+2` due within 24h, `+1` due within 3 days
- `+1` high priority

Tie-breakers:
1. Higher total score
2. Earlier due date
3. Higher priority
4. Earlier created timestamp

### UX behavior
- Top recommendations (default 5) show reason chips for transparency.
- Completed tasks are excluded.
- Tasks missing duration/energy are excluded from TEFQ ranking.
- When context filter has no direct matches, closest alternatives appear in a fallback block with guidance to relax context.

## Responsive UX QA checklist (Issue #9)
Use the quick manual checklist at [`docs/qa/responsive-qa-checklist.md`](./docs/qa/responsive-qa-checklist.md) when validating mobile/desktop behavior before merge.

## Pilot readiness + cross-browser QA plan (Issue #27)
Use the pilot gate checklist and browser/device validation plan at [`docs/qa/pilot-readiness-cross-browser-plan.md`](./docs/qa/pilot-readiness-cross-browser-plan.md).

## Accessibility baseline manual check (Issue #35)
Use the quick keyboard/ARIA smoke pass at [`docs/qa/accessibility-baseline-check.md`](./docs/qa/accessibility-baseline-check.md) before merging UI changes.

## Pilot onboarding + feedback operations (Issues #30, #41)
Use these docs for pilot participant onboarding, live walkthroughs, structured feedback capture, and weekly synthesis/reporting:
- [`docs/pilot/onboarding.md`](./docs/pilot/onboarding.md)
- [`docs/pilot/faq-troubleshooting.md`](./docs/pilot/faq-troubleshooting.md)
- [`docs/pilot/demo-script.md`](./docs/pilot/demo-script.md)
- [`docs/pilot/feedback-questions.md`](./docs/pilot/feedback-questions.md)
- [`docs/pilot/feedback-synthesis-template.md`](./docs/pilot/feedback-synthesis-template.md)
- [`docs/pilot/weekly-report-format.md`](./docs/pilot/weekly-report-format.md)
- [`docs/pilot/consent-data-notice.md`](./docs/pilot/consent-data-notice.md)

## JSON export/import (Issue #40)
Use **Export JSON** in the Tasks panel to download a versioned snapshot of your task list.

Use **Import JSON** to replace the current list with tasks from a JSON file. Supported shapes:
- Current export shape: `{ "version": 2, "payload": { "tasks": [...] } }`
- Legacy shape: `{ "tasks": [...] }`
- Raw array shape: `[...]`

Import validation rejects malformed JSON or unsupported envelopes. Individual invalid task records are skipped during normalization.

## Optional local usage log (Issue #60)
The app includes an **opt-in** local usage log for pilot debugging.

- Default is **OFF**.
- Events include task CRUD actions, TEFQ control usage, JSON export/import, and reset actions.
- Data is stored only in this browser profile (`localStorage`) and can be exported as JSON from the UI.
- **No usage log data is sent to any server.**

## Export support bundle (Issue #65)
Use **Export support bundle** in the Tasks panel to download a single JSON file containing:
- versioned task export payload
- optional usage-log payload (**only when the usage log toggle is enabled**)
- diagnostics metadata (app version + commit SHA)

> Privacy warning: support bundles can contain full task content and optional local usage details. Review before sharing with support.

## Diagnostics footer / in-app support links (Issue #48)
A lightweight diagnostics footer appears at the bottom of the app and shows:
- app version (from `package.json` at build time)
- short commit SHA (from `git rev-parse --short HEAD` at build time)

It also includes quick links for:
- **Report a bug**: GitHub bug-report template
- **QA docs**: `docs/qa/` folder
- **Export JSON**: jumps to the in-app export/import actions

<!-- repro issue191 2026-03-06T07:55:13Z -->
