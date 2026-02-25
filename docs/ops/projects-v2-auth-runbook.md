# Runbook — GitHub Projects v2 auth (Clay org Project #1)

This repo has GitHub Actions automation that reads and updates **Clay-Agency org Project #1** (GitHub **Projects v2 / `ProjectV2`**) via the **GraphQL API**.

Context / blocker: this setup is required to unblock **Issue #80** (Projects v2 automation) — https://github.com/Clay-Agency/novel-task-tracker/issues/80

UI note: GitHub labels move occasionally; the click-paths below match the GitHub web UI as of **2026-02**.

GitHub’s built-in Actions token (`secrets.GITHUB_TOKEN`) **cannot** mutate **organization Projects v2**, so you must configure **one** of:

- **Option A (preferred): GitHub App installation token** (least privilege, per-run tokens, easy rotation)
- **Option B: PAT fallback** (Personal Access Token)

Primary consumers:
- `.github/workflows/project-status-sync.yml` (sync Status/Done date/Needs decision)
- `.github/workflows/projects-v2-auth-smoke.yml` (read-only smoke test)

## Scheduled workflow — Projects v2 auth preflight

Workflow: [`.github/workflows/projects-v2-auth-preflight.yml`](../../.github/workflows/projects-v2-auth-preflight.yml) (added in [PR #101](https://github.com/Clay-Agency/novel-task-tracker/pull/101)).

This workflow runs **daily on a schedule** (and can be run manually) to check whether this repo has a valid **Projects v2 auth** configuration **before** other scheduled automations run.

### What it checks

It passes if **either** of these is configured in GitHub Actions:

1) **GitHub App (preferred)**
   - `vars.PROJECTS_APP_ID` (preferred)
     - legacy fallback: `secrets.PROJECTS_APP_ID` (still accepted)
   - `secrets.PROJECTS_APP_PRIVATE_KEY`

2) **PAT fallback**
   - `secrets.PROJECT_STATUS_SYNC_TOKEN`

If neither is configured, the preflight **fails intentionally** with an actionable error message and a step summary pointing back to this runbook.

### Where to see the result (job summary)

1. Go to **GitHub → Actions**.
2. Click the workflow: **Projects v2 auth preflight**.
3. Open the latest run.
4. Click the job: **Verify Projects v2 auth vars/secrets are configured**.
5. Check the run **Summary** — it shows a **Detected** section like:
   - `PROJECTS_APP_ID present: true/false`
   - `PROJECTS_APP_PRIVATE_KEY present: true/false`
   - `PROJECT_STATUS_SYNC_TOKEN present: true/false`

Notes:
- The workflow **does not print secret values**, only whether they are present.
- You may also see an error annotation at the top of the run when preflight fails.

### Common failure modes

| Detected | Meaning | Fix |
|---|---|---|
| App ID = ✅, App key = ❌, PAT = ❌ | **Only App ID is set** | Add `secrets.PROJECTS_APP_PRIVATE_KEY` (full PEM, with headers + line breaks). |
| App ID = ❌, App key = ✅, PAT = ❌ | **Only private key is set** | Add `vars.PROJECTS_APP_ID` (preferred) or `secrets.PROJECTS_APP_ID` (legacy). |
| App ID = ❌, App key = ❌, PAT = ❌ | **Nothing is configured** | Configure either the GitHub App pair or the PAT fallback (see below). |
| PAT = ✅ (App ID/key may be missing) | PAT fallback is configured | Preflight will pass; consider migrating to the GitHub App approach for least privilege. |

### Temporarily silencing the schedule (use sparingly)

Preferred fix is to **configure Projects v2 auth** (this is usually a one-time setup). If the scheduled failure is too noisy (e.g., during initial bootstrapping), you can temporarily silence it **with caution**:

Option A (no code change):
- **Actions → Projects v2 auth preflight → Disable workflow** (re-enable when auth is configured).

Option B (code change):
- Edit [`.github/workflows/projects-v2-auth-preflight.yml`](../../.github/workflows/projects-v2-auth-preflight.yml) and remove (or comment out) the `on: schedule:` trigger, then merge.

Caution:
- Disabling/removing the schedule reduces early warning for missing auth, and can cause other workflows (like scheduled project sync) to fail later with less context.

---

## What the workflows look for (names must match)

Exact names (copy/paste):

| Name | GitHub Actions type | Preferred location | Notes |
|---|---|---|---|
| `PROJECTS_APP_ID` | **Variable** | `vars.PROJECTS_APP_ID` (repo-level or org-level) | Legacy fallback: `secrets.PROJECTS_APP_ID` is still accepted by the preflight. |
| `PROJECTS_APP_PRIVATE_KEY` | **Secret** | `secrets.PROJECTS_APP_PRIVATE_KEY` | Full PEM contents (keep headers + line breaks). |
| `PROJECT_STATUS_SYNC_TOKEN` | **Secret** | `secrets.PROJECT_STATUS_SYNC_TOKEN` | PAT fallback (only if you can’t use a GitHub App). |


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

**Org-side click path (create the App):**
1. Open the **Clay-Agency** organization on GitHub.
2. Click **Settings** (this is **org** Settings, not a repo’s Settings).
3. In the left sidebar, click **Developer settings**.
4. Click **GitHub Apps**.
5. Click **New GitHub App**.

Fill in the form:
- **GitHub App name**: e.g. `Clay Projects Automation` (any unique name)
- **Homepage URL**: the repo URL is fine (e.g. `https://github.com/Clay-Agency/novel-task-tracker`)
- **Webhook**: uncheck **Active** (not needed; Actions events trigger the workflows)
- **Where can this GitHub App be installed?** → **Only on this account**

Set **Permissions** (minimum recommended):

| Scope | Permission | Level | Why needed |
|---|---|---:|---|
| **Organization** | **Projects** | **Read & write** | Required to query `organization{ projectV2(...) }`, read fields/items, and run `updateProjectV2ItemFieldValue` mutations. |
| **Repository** | **Issues** | **Read-only** | Needed to read Issue nodes and resolve project items for an issue (`node(id){... on Issue ...}`). |
| **Repository** | **Pull requests** | **Read-only** | Needed to read PR nodes (merged/closed timestamps) in PR-triggered runs. |
| **Repository** | **Metadata** | **Read-only** | Required for basic repo identification / token issuance (usually auto-included). |

Finally:
- Scroll down and click **Create GitHub App**.

Notes:
- **No webhook / event subscriptions** are required.
- If you later change permissions: go to the App’s **Installations** → **Configure** and **approve** the updated permissions.

### 2) Generate credentials (App ID + private key)

1. From the newly created App page, copy the **App ID** (numeric).
2. Scroll to **Private keys** → click **Generate a private key**.
3. Download the `.pem` file.

### 3) Install the App on the Clay-Agency org

**Org-side click path (install the App on the org):**
1. Go to **Clay-Agency** → **Settings** → **Developer settings** → **GitHub Apps**.
2. Click your App’s name (e.g. `Clay Projects Automation`).
3. In the App’s left sidebar, click **Install App**.
4. On the installation page, choose the **Clay-Agency** organization (if prompted).
5. Under **Repository access**, choose one:
   - **Only select repositories** → select **`novel-task-tracker`** (recommended least privilege)
   - **All repositories** (only if you explicitly want org-wide coverage)
6. Click **Install** / **Save** (button label varies slightly).

If **Clay-Agency Project #1 contains items from multiple repos** and you want the daily **reconcile** run to handle them, the App must also be installed on those repos (or installed on **All repositories**).

### 4) Add Actions variables/secrets

You can store these either **repo-level** (simplest) or **org-level** (if reused across repos). Do **not** commit keys to the repo.

#### Repo-level (recommended to start)

**Repo-side click path (set Actions Variables/Secrets):**
1. Open the repo: **Clay-Agency/novel-task-tracker**.
2. Click the repo’s **Settings** tab.
3. In the left sidebar, click **Secrets and variables**.
4. Click **Actions**.

Now set these in the correct tabs (GitHub separates them):

- **Variables** tab → **New repository variable**
  - Name: `PROJECTS_APP_ID`
  - Value: *(your numeric App ID)*

- **Secrets** tab → **New repository secret**
  - Name: `PROJECTS_APP_PRIVATE_KEY`
  - Value: *(paste the full PEM contents; see formatting notes below)*

Legacy support (avoid if possible):
- Instead of a variable, you *may* set `PROJECTS_APP_ID` as a **Secret** named `PROJECTS_APP_ID`. The preflight still accepts this, but prefer the Variable going forward.

#### Org-level (if multiple repos will reuse the same App)

**Org-side click path (set Actions Variables/Secrets at the org level):**
1. Open **Clay-Agency** on GitHub.
2. Click **Settings**.
3. In the left sidebar, click **Secrets and variables**.
4. Click **Actions**.

Create both entries (in their respective tabs):
- **Variables** tab → **New organization variable**
  - Name: `PROJECTS_APP_ID`

- **Secrets** tab → **New organization secret**
  - Name: `PROJECTS_APP_PRIVATE_KEY`

When prompted, set **Repository access** to **Selected repositories** and include `novel-task-tracker` (and any other repos that the App needs to read Issues/PRs from).

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

### 6) Private key rotation + incident response

#### Routine rotation (planned)

Goal: rotate without downtime by overlapping keys briefly.

1. App page → **Private keys** → **Generate a private key** (download the new `.pem`).
2. Update the Actions secret `PROJECTS_APP_PRIVATE_KEY` with the **new** PEM contents (keep formatting/line breaks).
3. Validate quickly:
   - Run **Projects v2 auth smoke test** (read-only), then optionally trigger **Sync Clay Project status**.
4. After validation, delete the **old** private key on the App page.

Notes:
- GitHub App private keys are long-lived; rotation is the primary mitigation if a key may have been exposed.
- Keep only the minimum number of active keys (ideally 1) to reduce blast radius.

#### Incident response (suspected key compromise)

If you suspect `PROJECTS_APP_PRIVATE_KEY` leaked (e.g., pasted in a ticket, logged, committed, or shared):

1. **Revoke quickly:** delete the affected private key(s) from the GitHub App page (**Private keys**). Deletion immediately prevents new installation tokens from being minted with that key.
2. **Rotate:** generate a fresh key and update `PROJECTS_APP_PRIVATE_KEY` to the new PEM, then re-run the smoke test.
3. **Hunt & contain:**
   - Search for accidental disclosure (PRs, issues, chat logs, CI logs). Remove/redact where possible.
   - Review recent **Actions runs** for unexpected workflows, forks, or unusual access patterns.
   - If the App is installed on multiple repos, confirm the installation scope is still least-privilege (selected repos only).
4. **Follow-up:**
   - If the key was ever committed, treat the full git history as compromised; rotate again after remediation and consider repository secret scanning alerts.
   - Document the timeline and rotation in the incident notes for future audits.

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
   - Open **Clay-Agency/novel-task-tracker** → **Settings** → **Secrets and variables** → **Actions**
   - Click the **Secrets** tab → **New repository secret**
     - Name: `PROJECT_STATUS_SYNC_TOKEN`
     - Value: *(your PAT token value — keep it secret)*

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
