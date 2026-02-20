# Project status sync workflow (Issue #78)

The repo includes a GitHub Actions workflow: `.github/workflows/project-status-sync.yml`.

It syncs **Clay-Agency org Project #1** (ProjectV2) fields when:
- an issue is closed
- a PR is closed (only acts when merged)
- on a daily scheduled reconciliation
- manually via `workflow_dispatch`

## Token / permissions

By default the workflow uses GitHub Actions’ built-in `GITHUB_TOKEN`.

If your org/project settings prevent `GITHUB_TOKEN` from reading/writing org Projects (ProjectV2), you can optionally provide a PAT as a fallback:

- **Secret name**: `PROJECT_STATUS_SYNC_TOKEN`

Recommended scopes:
- **Fine-grained PAT**: Projects **Read and write** (and access to this repository)
- **Classic PAT**: `project` (and `repo` if required by your org settings)

If neither token can access the org project, the workflow will fail with a GraphQL NOT_FOUND / “Could not resolve to a ProjectV2…” error.
