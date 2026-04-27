# Project status sync workflow (Issue #78)

The repo includes a GitHub Actions workflow: `.github/workflows/project-status-sync.yml`.

It syncs **Clay-Agency org Project #1** (Projects v2 / `ProjectV2`) fields when:
- an issue is closed
- a PR is closed (only acts when merged)
- on a daily scheduled reconciliation
- manually via `workflow_dispatch`

## Token / permissions (Projects v2)

Detailed setup (GitHub App least-privilege, PAT fallback, troubleshooting): [`docs/ops/projects-v2-auth-runbook.md`](./projects-v2-auth-runbook.md).

GitHub’s built-in Actions token (`secrets.GITHUB_TOKEN`) **cannot** update **organization Projects v2** via GraphQL.

You must provide **one** of the following:

### Option A (preferred): GitHub App installation token

Configure a GitHub App installed on the `Clay-Agency` org with permissions that allow reading issues/PRs and **reading/writing organization projects**.

Workflow expects:
- `PROJECTS_APP_ID` (recommended as an **Actions variable**, or a secret)
- `PROJECTS_APP_PRIVATE_KEY` (**Actions secret**)

Notes:
- The workflow uses `actions/create-github-app-token@v2` to mint an installation token at runtime.
- Ensure the App has access to this repository (for reading PR/issue details) and to org Projects v2.

### Option B: PAT fallback

If you can’t use a GitHub App, provide a PAT as a fallback:

- **Secret name**: `PROJECT_STATUS_SYNC_TOKEN`

Recommended scopes:
- **Fine-grained PAT**: Projects **Read and write** (and access to this repository)
- **Classic PAT**: `project` (and `repo` if required by your org settings)

## Low-noise behavior

- If no App/PAT token is configured, the workflow fails early with an actionable error.
- If the closed issue/PR is **not** in org Project #1, the workflow exits successfully (no-op).
- If the workflow can’t read the project metadata (permissions, renamed fields, etc.), it logs an info message and exits successfully.
- If scheduled/manual reconciliation sees `ProjectV2.items` return zero items, it treats the read as suspect: retries, checks recent repo issues via issue-level `projectItems`, then skips reconciliation with a warning instead of assuming Project #1 is empty.

## Project item read consistency guard

Issue #301 captured transient GitHub Projects v2 reads where `ProjectV2.items` reported `0` items while issue-level `projectItems` still showed Project #1 membership. The reconciliation path now guards against that case:

1. retry the first zero-item Project read (`PROJECT_ITEMS_ZERO_RETRY_COUNT`, default `2`);
2. run a read-only issue-level membership sample against recent open issues in the repo;
3. skip the reconcile run if Project items still read as zero, leaving existing Project fields untouched.

Optional tuning:
- `PROJECT_ITEMS_ZERO_RETRY_COUNT`: number of retries after the first zero read (default `2`).
- `PROJECT_ITEMS_ZERO_RETRY_DELAY_MS`: delay between retries (default `1500`).
