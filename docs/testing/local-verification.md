# Local Verification Command Guide

Use this guide to choose the smallest local verification command set that matches your change.

## Quick command guide

| Change type | Run locally | Why |
| --- | --- | --- |
| Docs-only changes in `README.md` or `docs/` | `npm run docs:links` | Verifies local Markdown links still resolve after doc edits. |
| Workflow YAML changes in `.github/workflows/` | `npm run check:workflows` | Parses workflow files so YAML or syntax mistakes fail locally first. |
| Standard code changes | `npm run verify:quick` | Runs the default pre-PR baseline: workflow parsing, lint, typecheck, and unit/integration tests. |
| Code changes that also need production build confidence | `npm run verify:core` | Runs `verify:quick` plus `npm run build`. This is the main required local merge gate. |
| UI flows, browser behavior, or smoke-path changes | `npm run e2e` | Runs Playwright smoke coverage in addition to the normal verification path. |
| Need one specific signal while iterating | `npm run docs:links`, `npm run lint`, `npm run typecheck`, `npm test`, or `npm run build` | Useful for fast feedback before running one of the bundled verification commands above. |

## Recommended local paths

### 1) Docs-only changes

If you only changed Markdown under `README.md` or `docs/`, start with:

```bash
npm run docs:links
```

Add this when you also changed workflow files:

```bash
npm run check:workflows
```

This keeps docs validation fast without forcing the full code verification path for content-only edits.

### 2) Standard code changes

For normal application or script changes, run:

```bash
npm run verify:quick
```

`verify:quick` expands to:

```bash
npm run check:workflows && npm run lint && npm run typecheck && npm test
```

Use this as the default baseline while iterating on most implementation work.

### 3) Deeper local validation before PR

Before opening or updating a PR for merge-ready code, run:

```bash
npm run verify:core
```

`verify:core` expands to:

```bash
npm run verify:quick && npm run build
```

This is the best single command when you want confidence that the app still compiles after the normal test and quality checks pass.

### 4) When to run E2E separately

Run the Playwright smoke suite when your change affects:

- task CRUD flows
- filters, sorting, or persistence behavior
- browser-only regressions
- end-to-end user journeys called out in CI or PR review

```bash
npm run e2e
```

## Command reference

### `npm run docs:links`
Checks local Markdown links in `README.md` and `docs/`.

### `npm run check:workflows`
Parses GitHub Actions workflow YAML files under `.github/workflows/`.

### `npm run lint`
Runs ESLint with `--max-warnings 0`.

### `npm run typecheck`
Runs TypeScript in no-emit mode.

### `npm test`
Runs the Vitest suite once.

### `npm run build`
Builds the production bundle with Vite.

### `npm run verify:quick`
Runs the standard local baseline for most code changes:
workflow parsing + lint + typecheck + tests.

### `npm run verify:core`
Runs the full core merge gate:
`verify:quick` + production build.

### `npm run e2e`
Runs Playwright smoke coverage for browser-level validation.

## Related docs

- [Core test strategy](./core-test-strategy.md)
- [CI maintenance runbook](../ops/ci-maintenance-runbook.md)
