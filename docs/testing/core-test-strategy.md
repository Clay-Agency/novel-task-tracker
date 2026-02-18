# Core Test Strategy (Issue #12)

This document defines the **core test completion gate** for `novel-task-tracker`.

## Scope: what counts as “core tests”

Core tests are the minimum automated checks that must pass before merge:

1. **Unit tests (domain + state reducer)**
   - Task schema and title validation
   - Reducer actions: create/edit/complete/reopen/delete
   - Idempotent transitions and unknown actions
   - Persistence utilities (versioning, migration, normalization, fallback)

2. **UI integration tests (React + DOM)**
   - Core CRUD flow via UI
   - Search/filter/sort controls
   - Empty states and validation errors
   - Persistence behavior across remount
   - Future-version storage guard (no clobber)

3. **Lint check (quality baseline)**
   - ESLint must pass with `--max-warnings 0`

## Completion gate checklist

A change set is considered complete only when all items below are true:

- [ ] `npm run lint` passes
- [ ] `npm test` passes
- [ ] Unit tests cover reducer domain logic and persistence migration behavior
- [ ] UI integration tests cover CRUD + search/filter/sort + persistence flows
- [ ] Tests are deterministic (fixed timestamps/explicit assertions, no network/time dependencies)

## Determinism rules

- Use fixed timestamps in reducer/domain tests.
- Use fake timers in UI tests when task ordering relies on timestamps.
- Avoid assertions that depend on locale-specific formatting or external services.

## Commands

```bash
npm run lint
npm test
```
