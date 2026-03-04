# Contributing

Thanks for contributing to **novel-task-tracker**.

## Branch + PR flow

1. Branch from `main` with `feat/issue-<number>-<summary>`.
2. Keep commits scoped to one issue.
3. Open a PR that links the issue (example: `Closes #14`).
4. Follow the **2-stage review process** below before requesting merge.


## Where to file what
Use the issue templates under `.github/ISSUE_TEMPLATE/`:
- **Bug report** (`bug-report.md`): defects with repro, expected/actual, environment, severity
- **QA finding** (`qa-finding.md`): findings mapped to checklist docs in `docs/qa/`
- **Feature request** (`feature-request.md`): enhancement proposals with problem + success criteria

## Needs-decision convention

If an issue is blocked on a **decision from Clay**, set the Project field `Needs decision: True` and apply the repo label `needs-decision` (easy filtering outside the Projects UI).

When closing a `needs-decision` item, add a short decision record to `docs/decisions/` (use the DR template) and link it from the issue/PR.

For QA findings (and QA-discovered bugs), include a direct link to the relevant checklist section:
- `docs/qa/responsive-qa-checklist.md`
- `docs/qa/pilot-readiness-cross-browser-plan.md`

## Markdown link check

CI validates **internal/relative** links in `README.md` and `docs/**` (external URLs are intentionally skipped to avoid flaky failures).

Run locally:

```bash
# Option A: run via npm (requires lychee installed)
#   brew install lychee
#   # or: cargo install lychee

npm run docs:links

# Option B: Docker (no local lychee install required)
docker run --rm -v "$(pwd)":/workdir -w /workdir \
  ghcr.io/lycheeverse/lychee:latest \
  --no-progress --offline --exclude '^https?://' --exclude '^mailto:' README.md docs
```


## Local verification commands

Use the quick check during development, and full check before final review:

```bash
# Fast inner-loop verification (no build)
npm run verify:quick

# Full pre-merge verification (includes build)
npm run verify:core
```


## 2-stage review process (required)

### Stage 1 — Self-review (author, xhigh reasoning)
Before assigning final reviewer, the PR author performs a deep self-review and confirms:

- Requirement coverage is complete for the linked issue.
- Logic/edge cases were checked with **xhigh reasoning** (assumptions validated, failure paths reviewed).
- Core verification was run (`npm run verify:core`) and outputs are pasted in the PR.
- If UI changed, screenshots/GIFs are attached.
- Risks, regressions, and rollback considerations are documented.

### Stage 2 — Final review (Boe)
After Stage 1 is complete, request final review from **Boe**.

- Boe verifies requirement fit, code quality, and release safety.
- PR is merged only after Boe approval and green CI.

## PR checklist (copy into PR or use default template)

- [ ] Linked issue(s) included (`Closes #...`)
- [ ] Stage 1 self-review complete (xhigh reasoning applied)
- [ ] `npm run verify:core` result attached
- [ ] (optional) individual command outputs attached when needed (`check:workflows`, `lint`, `typecheck`, `test`, `build`)
- [ ] UI change evidence attached (screenshots/GIF), or marked N/A
- [ ] Risks/edge cases documented
- [ ] Stage 2 final review requested from Boe
