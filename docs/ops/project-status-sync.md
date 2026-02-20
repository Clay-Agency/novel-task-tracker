# Project status sync workflow (Issue #78)

The repo includes a GitHub Actions workflow: `.github/workflows/project-status-sync.yml`.

It syncs Clay Project (ProjectV2) fields when:
- an issue is closed
- a PR is closed (only acts when merged)
- on a daily scheduled reconciliation
- manually via `workflow_dispatch`

## Token / permissions

`GITHUB_TOKEN` often **cannot** read/write ProjectV2 items unless the project grants access to GitHub Actions.

To ensure the workflow can access the project reliably, create a PAT and store it as:

- **Secret name**: `PROJECT_STATUS_SYNC_TOKEN`

Recommended scopes:
- **Fine-grained PAT**: Projects **Read and write** (and access to this repository)
- **Classic PAT**: `project` (and `repo` if required by your org settings)

If the secret is not configured (or the token can't access the project), the workflow will log a warning and exit successfully (low-noise no-op).
