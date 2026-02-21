# GitHub Projects v2 auth (Clay org Project #1)

This repo has automation that reads and updates **Clay-Agency org Project #1** (GitHub **Projects v2 / `ProjectV2`**) via the **GraphQL API**.

GitHub’s built-in Actions token (`secrets.GITHUB_TOKEN`) **cannot** mutate **organization Projects v2**, so you must configure **one** of:

- **Option A (preferred): GitHub App installation token** (least privilege, easy to rotate)
- **Option B: PAT fallback** (Personal Access Token)

Primary consumer:
- [Project status sync workflow](./project-status-sync.md) (`.github/workflows/project-status-sync.yml`)

---

## Option A (preferred): GitHub App (least privilege)

The workflow mints an installation token at runtime using `actions/create-github-app-token@v2`.

### Minimum permissions (recommended)

| Scope | Permission | Level | Why needed |
|---|---|---:|---|
| **Organization** | **Projects** | **Read & write** | Required to query `organization{ projectV2(...) }`, read Project fields/items, and run `updateProjectV2ItemFieldValue` mutations. |
| **Repository** | **Issues** | **Read-only** | Needed to read Issue nodes (URL/state/closedAt) and resolve project items for an issue (`node(id){... on Issue ...}`). |
| **Repository** | **Pull requests** | **Read-only** | Needed to read PR nodes (merged/mergedAt/closedAt) in event-driven runs and reconcile mode. |
| **Repository** | **Metadata** | **Read-only** | Required by GitHub Apps for basic repo identification / token issuance. (Usually auto-included.) |

No other repository/org permissions should be required for the current workflow logic (no contents, checks, deployments, etc.).

### Webhooks / event subscriptions

**None required.** These automations are triggered by GitHub Actions events (`issues.closed`, `pull_request.closed`, `schedule`, `workflow_dispatch`).

You can create the App with **Webhook = inactive**.

---

## GitHub App setup steps

### 1) Create an org-owned GitHub App

1. Go to **Clay-Agency** → **Settings** → **Developer settings** → **GitHub Apps** → **New GitHub App**.
2. **GitHub App name**: e.g. `Clay Projects Automation` (any unique name).
3. **Homepage URL**: repo URL is fine (e.g. `https://github.com/Clay-Agency/novel-task-tracker`).
4. **Webhook**: uncheck **Active** (not needed).
5. **Where can this GitHub App be installed?** → **Only on this account**.
6. Set permissions exactly as in the table above.
7. Click **Create GitHub App**.

### 2) Generate credentials (App ID + private key)

1. On the App page, note the **App ID** (numeric).
2. In **Private keys**, click **Generate a private key**.
3. Download the `.pem` file.

### 3) Install the App on the Clay-Agency org

1. From the App page, click **Install App**.
2. Choose the **Clay-Agency** organization.
3. Installation scope:
   - Recommended (least privilege): **Only select repositories** → select **`novel-task-tracker`**.
   - If **Clay-Agency Project #1 contains items from multiple repos** and you want the *daily reconcile* job to read/update those items too, you must also grant the App access to those repos (or install on **All repositories**).

**Installation scope caveat (Project #1 spans repos):**
- In reconcile mode, the workflow scans Project items and reads their `content`.
- If a Project item comes from a repo the App is **not** installed on, GitHub may return `content: null` or deny access; those items may be skipped or produce warnings.

**Pitfall:** if you later change the App permissions, go back to the installation (**Configure**) and **approve** the new permissions.

### 4) Add Actions variables/secrets

The workflow looks for:

- `PROJECTS_APP_ID` (from `vars.PROJECTS_APP_ID` **preferred**, or `secrets.PROJECTS_APP_ID`)
- `PROJECTS_APP_PRIVATE_KEY` (**secret**)

You can store these either **repo-level** or **org-level**.

#### Repo-level (simplest / smallest blast radius)

`Clay-Agency/novel-task-tracker` → **Settings** → **Secrets and variables** → **Actions**:
- **Variables**: `PROJECTS_APP_ID` = your App ID
- **Secrets**: `PROJECTS_APP_PRIVATE_KEY` = full PEM contents

#### Org-level (best if multiple repos will reuse the same App)

Clay-Agency → **Settings** → **Secrets and variables** → **Actions**:
- **Variables**: `PROJECTS_APP_ID`
- **Secrets**: `PROJECTS_APP_PRIVATE_KEY`
- Set **Repository access = Selected repositories** and include `novel-task-tracker`.

#### PEM formatting (common pitfall)

Paste the **raw PEM** including headers and line breaks:

```text
-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----
```

Do **not** base64-encode it.

---

## Option B: PAT fallback (`PROJECT_STATUS_SYNC_TOKEN`)

If you can’t use a GitHub App, you can provide a PAT.

- **Secret name**: `PROJECT_STATUS_SYNC_TOKEN`

Recommended scopes:

- **Fine-grained PAT**: grant **Projects → Read and write** (organization scope) and repository access to `novel-task-tracker`.
- **Classic PAT**: `project` (and `repo` if required by your org settings). Some setups also require `read:org`.

Store it as a **GitHub Actions secret** (repo-level or org-level with selected repo access).

---

## Validation / smoke test

1. Go to **Actions** → **Sync Clay Project status** → **Run workflow**.
2. Confirm logs show token setup succeeded (you should *not* see a “missing Projects v2 auth” failure).
3. Create (or pick) an issue in `novel-task-tracker` and add it to **Clay-Agency Project #1**.
4. Close the issue.
5. Confirm the Project item updates:
   - **Status** is set to **Done**
   - **Done date** is set
   - **Needs decision** is cleared (if the field exists)

---

## Troubleshooting / common failure modes

### Token minting fails (`actions/create-github-app-token`)

Common causes:
- App is not installed on the org, or not granted access to `novel-task-tracker`.
- Private key pasted incorrectly (missing headers/line breaks).
- App permissions changed, but the installation was not re-approved (**Installations → Configure → approve**).

### GraphQL: “Resource not accessible by integration”

Usually indicates:
- Missing **Organization permission → Projects: Read & write**, or
- The App installation does not include the repo whose Issue/PR is being read.

### Project not found / metadata unavailable

- Error like: `Could not find org projectV2 Clay-Agency#1`.
- Verify the workflow’s `ORG_LOGIN` and `PROJECT_NUMBER` values and that your token can read org Projects.

### Field/option mismatch warnings

The workflow expects (by default):
- A **Status** field with an option named **Done**
- A date field named **Done date** (it also checks `Done_date` or `Done`)
- Optional **Needs decision** field (`Needs decision` or `Needs_decision`)

If your Project fields/options are renamed, the workflow may skip updates and log warnings.
