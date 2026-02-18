# Contributing

Thanks for contributing to **novel-task-tracker**.

## Branch + PR flow

1. Branch from `main` with `feat/issue-<number>-<summary>`.
2. Keep commits scoped to one issue.
3. Open a PR that links the issue (example: `Closes #14`).
4. Follow the **2-stage review process** below before requesting merge.

## 2-stage review process (required)

### Stage 1 — Self-review (author, xhigh reasoning)
Before assigning final reviewer, the PR author performs a deep self-review and confirms:

- Requirement coverage is complete for the linked issue.
- Logic/edge cases were checked with **xhigh reasoning** (assumptions validated, failure paths reviewed).
- Tests/lint/build were run and outputs are pasted in the PR.
- If UI changed, screenshots/GIFs are attached.
- Risks, regressions, and rollback considerations are documented.

### Stage 2 — Final review (Boe)
After Stage 1 is complete, request final review from **Boe**.

- Boe verifies requirement fit, code quality, and release safety.
- PR is merged only after Boe approval and green CI.

## PR checklist (copy into PR or use default template)

- [ ] Linked issue(s) included (`Closes #...`)
- [ ] Stage 1 self-review complete (xhigh reasoning applied)
- [ ] `npm run lint` result attached
- [ ] `npm test` result attached
- [ ] `npm run build` result attached
- [ ] UI change evidence attached (screenshots/GIF), or marked N/A
- [ ] Risks/edge cases documented
- [ ] Stage 2 final review requested from Boe
