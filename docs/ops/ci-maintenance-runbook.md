# CI maintenance runbook (weekly workflow)

This runbook covers the scheduled CI maintenance workflow used to catch regressions and dependency risk with low operational noise.

## Workflow location
- File: [`.github/workflows/maintenance-ci.yml`](../../.github/workflows/maintenance-ci.yml)
- Workflow name in GitHub Actions: **Scheduled CI Maintenance**

## Related runbooks
- Projects v2 auth (GitHub App) setup + troubleshooting: [`docs/ops/projects-v2-auth-runbook.md`](./projects-v2-auth-runbook.md)

## Trigger modes
The workflow runs in two ways:
1. **Automatic schedule**: weekly on Monday at `00:00 UTC`
2. **Manual run** (`workflow_dispatch`): on-demand from GitHub Actions

### Run manually (`workflow_dispatch`)
1. Open the repo in GitHub.
2. Go to **Actions** → **Scheduled CI Maintenance**.
3. Click **Run workflow**.
4. Choose branch (`main` recommended) and confirm.

## What the workflow executes
In order, it runs:
1. `npm ci`
2. `npm run check:workflows`
3. `npm run lint`
4. `npm run typecheck`
5. `npm test`
6. `npm run build`
7. `npm audit --omit=dev --audit-level=high`

Notes:
- Audit is intentionally scoped to **production deps** (`--omit=dev`).
- Only **high/critical** vulnerabilities fail the job (`--audit-level=high`).

## Failure response checklist
Use this short triage flow when the workflow fails.

### 1) Audit failure (high/critical)
- Confirm package(s), severity, and affected path from the audit log.
- Check if a safe patch/minor upgrade exists; update lockfile and re-run checks.
- If no safe immediate fix exists, document mitigation/risk and open a tracked follow-up issue.
- Keep deployment decisions explicit (do not silently ignore high/critical findings).

### 2) Build failure
- Reproduce locally with `npm ci && npm run build`.
- Check recent merged changes for TypeScript, Vite, or dependency breakage.
- Fix and validate with full sequence (lint/typecheck/test/build) before PR.

### 3) Test failure
- Reproduce locally with `npm test` (and related suite if needed).
- Determine if failure is deterministic regression vs flaky behavior.
- Fix regression or stabilize test, then re-run full checks.

### 4) Workflow YAML validation failure
- Reproduce locally with `npm run check:workflows`.
- Fix malformed YAML in `.github/workflows/*.yml` and re-run the command.
- Confirm the updated workflow still loads in GitHub Actions and rerun maintenance job.

## Noise policy and monitoring
- **No auto-issues / no auto-PRs** are created by this workflow.
- Failures are visible in:
  - GitHub **Actions** tab run history
  - PR checks / commit status (for manual runs on branch commits)
  - Repository notification settings (watchers/maintainers)

Owners should review failures directly and decide follow-up action case-by-case.

## Ownership and rotation policy (pilot default)

To keep pilot operations low-noise and predictable, use a single **weekly CI triage owner (DRI)**.

### Policy
- One maintainer is the CI triage owner each week (Monday 00:00 UTC → Sunday 23:59 UTC).
- Rotation is lightweight: update the next owner during normal weekly planning.
- Only the weekly owner is expected to actively triage scheduled maintenance failures.

### Triage SLA and escalation
- **Acknowledge** a failing scheduled run within 24 hours on business days.
- If fix is straightforward, owner ships a PR and links it from the failure thread/issue.
- If not fixable quickly, owner opens (or updates) a tracking issue with context + next step.
- If the owner is unavailable, hand off to the next maintainer in rotation.

### Low-noise operating rules
- Keep current behavior: **no automatic issue/PR creation**.
- Prefer one canonical tracking issue per failure class instead of opening duplicates.
- Use GitHub Actions visibility + existing maintainer notifications as primary signal.

### Rotation options considered (for future revisit)
1. **Single fixed owner** (lowest coordination, higher bus-factor risk)
2. **Weekly rotating owner (current default)** (balanced load, still low overhead)
3. **Formal on-call window** (strong coverage, higher process/noise cost)

## Known GitHub Actions flakes (workarounds)

### 1) PR / `gh pr checks` briefly shows “no checks reported”
Occasionally right after opening a PR or pushing a commit, GitHub’s Checks UI/API can lag even though workflow runs have started.

Workarounds:
- Wait ~15–60 seconds and retry `gh pr checks <PR>`.
- Confirm the runs exist via:
  - `gh run list --repo Clay-Agency/novel-task-tracker --branch <branch> --event pull_request`
- If runs exist but checks still don’t show, treat it as UI/API propagation delay rather than missing triggers.

### 2) `gh workflow run …` returns HTTP 500
This is usually a transient GitHub Actions service/API error (server-side). Recommended operator behavior:
- Retry with exponential backoff (e.g., 1s, 2s, 4s, 8s; cap ~30s).
- If it persists, trigger from the GitHub Actions web UI.
- When reporting, capture an API request id for GitHub Support/debugging:
  - `GH_DEBUG=api gh workflow run "<workflow>" --ref <branch>`
