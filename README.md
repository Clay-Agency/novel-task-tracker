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

## Core UI flows (Issue #7)
Implemented in the app UI:
- Create task form with title validation and optional description.
- Task list with empty states.
- Update flows: edit, complete/reopen.
- Delete flow.
- Visually distinct status badges/cards for open vs completed tasks.
- Baseline list controls: search (title/description), status filter, and sort.

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
