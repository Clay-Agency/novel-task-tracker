# novel-task-tracker

Baseline React scaffold for the Novel Task Tracker project.

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
npm run test
```

## Build
```bash
npm run build
```

## Core test completion gate (Issue #12)
Core test scope and checklist live in [`docs/testing/core-test-strategy.md`](./docs/testing/core-test-strategy.md).

Gate must pass before merge:
- `npm run lint`
- `npm test`
- Unit coverage for task domain/reducer/persistence logic
- UI integration coverage for CRUD + search/filter/sort + persistence
- Deterministic test behavior

## Branch / PR workflow
1. Create a branch from `main` using `feat/issue-<number>-<summary>`.
2. Keep commits small and scoped to one issue.
3. Open a PR that references the issue (example: `Closes #5`).
4. Request review before merge.

## Core task domain model (Issue #6)
Task shape in state:
- `id` (string, required)
- `title` (string, required, trimmed non-empty)
- `status` (`open` | `completed`, required)
- `createdAt` (ISO timestamp, required)
- `updatedAt` (ISO timestamp, required)
- `description` (string | null, optional)
- `completedAt` (ISO timestamp | null, optional)

State actions implemented in reducer/store:
- create
- edit
- complete
- reopen
- delete

## Core UI flows (Issue #7)
Implemented in the app UI:
- Create task form with title validation and optional description.
- Task list with empty states.
- Update flows: edit, complete/reopen.
- Delete flow.
- Visually distinct status badges/cards for open vs completed tasks.
- Baseline list controls: search (title/description), status filter, and sort.

Deferred to later issues:
- Persistence (Issue #8)
- Responsive refinements (Issue #9)
- Novel differentiator feature (Issue #11)
