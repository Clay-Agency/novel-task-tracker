## Summary
- 

## Linked Issue
- Closes #

## 2-stage review confirmation
### Stage 1 — Self-review (author, xhigh reasoning)
- [ ] I completed self-review using xhigh reasoning (requirements, assumptions, edge cases, failure paths).
- [ ] I confirmed the implementation satisfies the linked issue scope.

### Stage 2 — Final review (Boe)
- [ ] Final review requested from **Boe**.

## Validation evidence
### Required pre-merge verification
```bash
# paste command + output
npm run verify:core
```

### Docs-only validation (required when README.md, docs/**, or docs-facing templates change)
See [`docs/ops/docs-validation.md`](./docs/ops/docs-validation.md) for the canonical required-vs-fallback path.

```bash
# paste command + output
npm run docs:links

# or, if local lychee is unavailable:
npm run docs:links:docker

# if neither local lychee nor Docker is available, explain that here
# and note that the required CI workflow "Markdown link check" is expected to catch docs-link regressions.
```

### Optional targeted command outputs
```bash
# paste command + output when useful
npm run lint
npm run typecheck
npm test
npm run build
```

## UI changes
- [ ] N/A (no UI changes)
- [ ] Screenshots/GIF attached below

## Risks / edge cases
- 

## Additional notes
- 
