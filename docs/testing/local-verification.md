# Local Verification Command Matrix

Use this matrix to pick the smallest command that matches your change before opening a PR.

## Command matrix

| Situation | Command | Includes |
| --- | --- | --- |
| Quick inner-loop check before pushing | `npm run verify:quick` | workflow YAML parse, lint, typecheck, unit/integration tests |
| Full pre-merge verification | `npm run verify:core` | everything in `verify:quick` plus production build |
| Docs-only link validation | `npm run docs:links` | internal/relative link checks for `README.md` and `docs/**` |
| Docs-only link validation without local `lychee` install | `npm run docs:links:docker` | same link checks using Docker |
| Workflow-only changes | `npm run check:workflows` | parses `.github/workflows/*.{yml,yaml}` |
| Code quality only | `npm run lint` | ESLint with `--max-warnings 0` |
| Type safety only | `npm run typecheck` | TypeScript compile check without emit |
| Unit + UI integration tests only | `npm test` | Vitest suite |
| Production build only | `npm run build` | Vite production build |
| End-to-end browser checks | `npm run e2e` | Playwright end-to-end tests |

## Recommended defaults

- **Docs-only changes:** run `npm run docs:links`
- **Typical code changes during development:** run `npm run verify:quick`
- **Before final review / merge:** run `npm run verify:core`

## Related docs

- [Contributing guide](../../CONTRIBUTING.md)
- [Core test strategy](./core-test-strategy.md)
