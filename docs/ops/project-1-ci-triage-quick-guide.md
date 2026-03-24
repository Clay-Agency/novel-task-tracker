# Project #1 CI triage quick guide (Issue #272)

Use this when clearing **Project #1** review items and you need a fast, repeatable way to read PR checks.
This guide is intentionally narrow: it tells maintainers which PR checks are **merge blockers** vs **advisory signals** for the common review-item types.

For deeper failure handling and known GitHub Actions flakes, use the canonical runbook:
- [`ci-maintenance-runbook.md`](./ci-maintenance-runbook.md)

## 1) First sort the PR into one of two buckets

### Docs / process PR
Use this bucket when the PR mainly changes:
- `README.md`
- `docs/**`
- issue / PR templates
- project-process text with no app/runtime behavior change

### Automation / code PR
Use this bucket when the PR changes:
- `src/**`
- test code or Playwright/Vitest config
- `package.json` / `package-lock.json`
- `.github/workflows/**`
- build, lint, or TypeScript config

If a PR touches both docs and automation/code surfaces, treat it as **automation / code**.

## 2) Check matrix: required vs advisory

| Check | What it covers | Docs / process PR | Automation / code PR |
| --- | --- | --- | --- |
| **Verify (core) / npm run verify:core** | Workflow syntax, lint, typecheck, unit tests, build | **Required** | **Required** |
| **Markdown link check / check-markdown-links** | Internal link validity in `README.md` and `docs/**` | **Required** when the PR changes docs/README links or file paths; otherwise advisory | **Advisory** unless the PR also changes docs/README links |
| **CI / test-and-lint** | Lint, typecheck, unit tests, Playwright smoke | **Advisory** for docs/process-only work | **Required** |
| **Scheduled CI Maintenance** | Weekly maintenance workflow on `main` / manual dispatch | Not a PR merge gate | Not a PR merge gate |

## 3) Fast interpretation rules

### Safe-to-merge pattern: docs / process PR
Normally safe to merge when:
1. **Verify (core)** is green.
2. **Markdown link check** is green if the PR changed docs links, filenames, or relative references.
3. **CI** is either green or clearly irrelevant to the docs-only diff.

Stop and escalate instead of guessing when a docs/process PR unexpectedly changes dependency-sensitive or automation-sensitive files.

### Safe-to-merge pattern: automation / code PR
Normally safe to merge when:
1. **Verify (core)** is green.
2. **CI** is green.
3. Any additional check failures are understood and non-blocking.

Treat red **CI** on automation/code PRs as a real merge blocker unless you can prove it is a transient GitHub Actions problem.

## 4) Quick failure meanings

- **Verify (core) red**
  - Treat as a merge blocker for every PR type.
  - This is the branch-protection baseline documented in [`branch-protection.md`](./branch-protection.md).

- **Markdown link check red**
  - Usually means a broken relative link, renamed file, or missing docs target.
  - For docs/process review items, treat it as blocking if the PR touched `README.md` or `docs/**` navigation.

- **CI red on docs/process PR**
  - First confirm the diff is truly docs/process only.
  - If yes, treat it as advisory and note the result in review comments if needed.
  - If no, reclassify the PR as automation/code and require CI green.

- **CI red on automation/code PR**
  - Treat as blocking.
  - Use [`ci-maintenance-runbook.md`](./ci-maintenance-runbook.md) for build/test/workflow triage.

## 5) Known GitHub Actions UI/API flake

If a PR or `gh pr checks` briefly shows **no checks reported** right after open/push:
- wait about 15–60 seconds,
- retry once,
- confirm runs exist before assuming triggers are broken.

Reference: known flake notes in [`ci-maintenance-runbook.md`](./ci-maintenance-runbook.md).

## 6) Review-clearing order hint

When clearing a queue, do the checks in this order:
1. Confirm the **issue item** is the canonical Project #1 record.
2. Confirm the PR is not stacked behind an unmerged prerequisite.
3. Classify the PR as **docs/process** or **automation/code**.
4. Read only the checks that matter for that bucket.
5. Merge only after the required checks for that bucket are green.

Related queue-clearing work in progress:
- Issue #270 — Project #1 review-clearing quick-start: https://github.com/Clay-Agency/novel-task-tracker/issues/270
- Issue #266 — merge-order checklist follow-up: https://github.com/Clay-Agency/novel-task-tracker/issues/266
