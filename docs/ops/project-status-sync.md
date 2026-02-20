# Project status sync workflow (Issue #78)

The repo includes a GitHub Actions workflow: `.github/workflows/project-status-sync.yml`.

It syncs **Clay-Agency org Project #1** (ProjectV2) fields when:
- an issue is closed
- a PR is closed (only acts when merged)
- on a daily scheduled reconciliation
- manually via `workflow_dispatch`

## Token / permissions

By default the workflow uses GitHub Actions’ built-in `GITHUB_TOKEN`.

If your org/project settings prevent `GITHUB_TOKEN` from reading/writing the org ProjectV2, you can optionally provide a PAT as a fallback:

- **Secret name**: `PROJECT_STATUS_SYNC_TOKEN`

Recommended scopes:
- **Fine-grained PAT**: Projects **Read and write** (and access to this repository)
- **Classic PAT**: `project` (and `repo` if required by your org settings)

If the workflow cannot access the org project, it will log a warning and exit successfully (low-noise no-op).
