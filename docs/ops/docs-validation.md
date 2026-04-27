# Docs validation reference

Use this document as the **single source of truth** for docs-link validation guidance in this repo.

## When this applies

Use the docs validation path when your change is docs-only or touches:

- `README.md`
- `docs/**`
- docs-facing templates such as `.github/pull_request_template.md`

## Required command vs fallback-only options

Follow this order exactly:

1. **Required local command when available:** `npm run docs:links`
2. **Fallback when local `lychee` is unavailable:** `npm run docs:links:docker`
3. **CI-only fallback when neither local `lychee` nor Docker is available:** document that in the PR and rely on the required CI workflow **Markdown link check**

Important: `npm run verify:core` is useful for broader pre-merge validation, but it does **not** run the Markdown link checker and is **not** a substitute for docs-link validation when docs links changed.

## Canonical commands

```bash
# Preferred: local lychee installed
#   brew install lychee
#   # or: cargo install lychee
npm run docs:links

# Fallback: no local lychee, but Docker/OrbStack is available
#   Optional readiness check (daemon reachable):
#   docker info >/dev/null
npm run docs:links:docker

# Equivalent direct Docker command
# docker run --rm -v "$PWD":/workdir -w /workdir \
#   ghcr.io/lycheeverse/lychee:latest \
#   --no-progress --offline --exclude '^https?://' --exclude '^mailto:' README.md docs .github/pull_request_template.md
```

If Docker reports `Cannot connect to the Docker daemon`, start Docker/OrbStack first and rerun `npm run docs:links:docker`.

## Scope of the check

CI validates **internal/relative** links in `README.md`, `docs/**`, and `.github/pull_request_template.md`. External URLs are intentionally skipped to avoid flaky failures.
