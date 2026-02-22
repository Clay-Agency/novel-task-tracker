# Runbook — GitHub Projects v2 auth (Clay org Project #1)

This repo has GitHub Actions automation that reads and updates **Clay-Agency org Project #1** (GitHub **Projects v2 / `ProjectV2`**) via the **GraphQL API**.

GitHub’s built-in Actions token (`secrets.GITHUB_TOKEN`) **cannot** mutate **organization Projects v2**, so you must configure **one** of:

- **Option A (preferred): GitHub App installation token** (least privilege, per-run tokens, easy rotation)
- **Option B: PAT fallback** (Personal Access Token)

Primary consumers:
- `.github/workflows/project-status-sync.yml` (sync Status/Done date/Needs decision)
- `.github/workflows/projects-v2-auth-smoke.yml` (read-only smoke test)

---

## What the workflows look for (names must match)

### GitHub App (preferred)

- **Actions variable** (preferred) or **secret**:
  - `PROJECTS_APP_ID`
- **Actions secret**:
  - `PROJECTS_APP_PRIVATE_KEY`

The workflow mints an installation token at runtime using `actions/create-github-app-token@v2`.

### PAT fallback

- **Actions secret**:
  - `PROJECT_STATUS_SYNC_TOKEN`

---

## Option A (preferred) — GitHub App setup

### 1) Create an org-owned GitHub App

1. Go to **Clay-Agency** → **Settings**.
2. In the left sidebar: **Developer settings** → **GitHub Apps**.
3. Click **New GitHub App**.
4. Fill in:
   - **GitHub App name**: e.g. `Clay Projects Automation` (any unique name)
   - **Homepage URL**: the repo URL is fine (e.g. `https://github.com/Clay-Agency/novel-task-tracker`)
   - **Webhook**: uncheck **Active** (not needed; Actions events trigger the workflows)
   - **Where can this GitHub App be installed?** → **Only on this account**
5. Set **Permissions** (minimum recommended):

| Scope | Permission | Level | Why needed |
|---|---|---:|---|
| **Organization** | **Projects** | **Read & write** | Required to query `organization{ projectV2(...) }`, read fields/items, and run `updateProjectV2ItemFieldValue` mutations. |
| **Repository** | **Issues** | **Read-only** | Needed to read Issue nodes and resolve project items for an issue (`node(id){... on Issue ...}`). |
| **Repository** | **Pull requests** | **Read-only** | Needed to read PR nodes (merged/closed timestamps) in PR-triggered runs. |
| **Repository** | **Metadata** | **Read-only** | Required for basic repo identification / token issuance (usually auto-included). |

6. Click **Create GitHub App**.

Notes:
- **No webhook / event subscriptions** are required.
- If you later change permissions: go to the App’s **Installations** → **Configure** and **approve** the updated permissions.

### 2) Generate credentials (App ID + private key)

1. From the newly created App page, copy the **App ID** (numeric).
2. Scroll to **Private keys** → click **Generate a private key**.
3. Download the `.pem` file.

### 3) Install the App on the Clay-Agency org

1. From the App page, click **Install App**.
2. Choose the **Clay-Agency** organization.
3. Installation scope (recommended least privilege):
   - **Only select repositories** → select **`novel-task-tracker`**.

If **Clay-Agency Project #1 contains items from multiple repos** and you want the daily **reconcile** run to handle them, the App must also be installed on those repos (or installed on **All repositories**).

### 4) Add Actions variables/secrets

You can store these either **repo-level** (simplest) or **org-level** (if reused across repos). Do **not** commit keys to the repo.

#### Repo-level (recommended to start)

Go to **Clay-Agency/novel-task-tracker** → **Settings** → **Secrets and variables** → **Actions**:

- **Variables**:
  - `PROJECTS_APP_ID` = your App ID
- **Secrets**:
  - `PROJECTS_APP_PRIVATE_KEY` = full PEM contents

#### Org-level (if multiple repos will reuse the same App)

Go to **Clay-Agency** → **Settings** → **Secrets and variables** → **Actions**:

- **Variables**: `PROJECTS_APP_ID`
- **Secrets**: `PROJECTS_APP_PRIVATE_KEY`
- Set **Repository access** = **Selected repositories** and include `novel-task-tracker`.

#### PEM formatting (common pitfall)

Paste the **raw PEM** including headers and line breaks:

```text
-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----
```

Do **not** base64-encode it.

### 5) Validate (smoke test + real workflow)

1. Run the read-only smoke test:
   - **Actions** → **Projects v2 auth smoke test** → **Run workflow**
   - Expected: the run succeeds and the **Summary** shows the Project title/ID and a list of fields.
2. Run the real sync workflow:
   - **Actions** → **Sync Clay Project status** → **Run workflow**
   - Expected: no “No Projects v2 auth token available” failure.

End-to-end check (optional):
1. Create an Issue in `novel-task-tracker`.
2. Add it to **Clay-Agency Project #1**.
3. Close the Issue.
4. Confirm the Project item updates (if fields exist):
   - **Status** → **Done**
   - **Done date** is set
   - **Needs decision** is cleared

### 6) Rotation (private key)

1. App page → **Private keys** → **Generate a private key**.
2. Replace `PROJECTS_APP_PRIVATE_KEY` secret with the new PEM.
3. Delete the old private key from the App page.

---

## Option B — PAT fallback (`PROJECT_STATUS_SYNC_TOKEN`)

Use this only if you can’t use a GitHub App.

### Fine-grained PAT (recommended if using PAT)

1. GitHub (user) → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens**.
2. **Generate new token**.
3. Set:
   - **Resource owner**: `Clay-Agency`
   - **Repository access**: only `novel-task-tracker` (or the repos needed)
   - **Organization permissions**: **Projects** → **Read and write**
4. Save the token value.
5. Store it as a GitHub Actions secret:
   - Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
   - Name: `PROJECT_STATUS_SYNC_TOKEN`

### Classic PAT (fallback)

If your org still requires classic PATs:
- Scopes typically needed: `project` (and sometimes `repo` and/or `read:org` depending on org restrictions).
- Store as `PROJECT_STATUS_SYNC_TOKEN`.

---

## Troubleshooting

### “No Projects v2 auth token available”

- Missing one of:
  - `vars.PROJECTS_APP_ID` + `secrets.PROJECTS_APP_PRIVATE_KEY`, or
  - `secrets.PROJECT_STATUS_SYNC_TOKEN`

### `actions/create-github-app-token` fails

Common causes:
- App is not installed on **Clay-Agency**, or not installed on `novel-task-tracker`.
- Private key pasted incorrectly (missing header/footer or line breaks).
- App permissions were changed but the installation wasn’t re-approved.

### GraphQL: “Resource not accessible by integration”

Usually indicates:
- Missing **Organization → Projects: Read & write**, or
- The App installation does not include the repo whose Issue/PR is being read.

### Project not found

Error like: `Could not find org projectV2 Clay-Agency#1`.
- Verify the workflow `ORG_LOGIN` and `PROJECT_NUMBER` values.
- Verify your token can read org Projects v2.
