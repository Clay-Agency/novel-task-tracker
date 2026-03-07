# Runbook — Projects v2 auth (GitHub App) for Clay-Agency org Project #1

This repo has GitHub Actions automation that **reads + updates** the Clay-Agency **organization Project (Projects v2 / `ProjectV2`)** via the **GraphQL API**.

GitHub’s built-in Actions token (`GITHUB_TOKEN`) **cannot** mutate **organization Projects v2**, so we use a **GitHub App installation token** minted at runtime.

- Preferred: **GitHub App** (`actions/create-github-app-token@v2`)
- Fallback: **PAT** (only if you cannot use a GitHub App)

Related (status-only): GitHub Projects built-in workflows can set **Status=Done** on close/merge **without any App/PAT** (see **Status-only fallback** below).

Related issues: #80, #95, #175.

---

## Status-only fallback (no App/PAT)

If Projects v2 auth (#80) is **not configured**, our repo automation **cannot** update custom fields (ex: **Done date**, **Needs decision**).

However, GitHub Projects has **built-in Project workflows** that can still set **Status = Done** when an Issue is closed or a PR is merged — with **no token**.

### Enable in the Project UI

1. Open **Clay-Agency Project #1**.
2. Click **… (More)** → **Workflows**.
3. Enable the default workflows for:
   - **Item closed** → set **Status** to **Done**
   - **Pull request merged** (or **Pull request closed**, depending on your UI) → set **Status** to **Done**

If the workflow asks for a field/option:
- Field: `Status`
- Option: `Done`

### What this does / does not do

✅ Works without App/PAT:
- Updates the Project item’s **Status** to **Done** on close/merge.

❌ Limitations (why #80 still matters):
- Cannot set **Done date**
- Cannot clear **Needs decision**

Recommended usage: treat this as a **temporary stopgap** until #80 (GitHub App auth) is set up.

### Reducing Actions noise (if you intentionally stay Status-only)

If you choose this fallback and **do not** configure Projects v2 auth (#80), you may still see GitHub Actions activity:

- **Projects v2 auth preflight** runs on a **daily schedule** and will **fail** with a “missing auth” error.
- **Sync Clay Project status** runs on **Issue/PR close** and will typically **warn + skip** when no token is available.

Low-risk ways to keep noise low:

1) **Disable the scheduled trigger** (keep manual `workflow_dispatch`)
   - File: [`.github/workflows/projects-v2-auth-preflight.yml`](../../.github/workflows/projects-v2-auth-preflight.yml)
   - Remove (or comment out) the `on.schedule` block.
   - Click-path: **Code** → open the file → **Edit (pencil)** → commit to your default branch.

2) **Disable specific workflows in the repo UI**
   - Click-path: **Actions** → select a workflow (ex: **Projects v2 auth preflight**) → **…** → **Disable workflow**.
   - Suggested disables if you only want built-in Project workflows:
     - **Projects v2 auth preflight**
     - **Sync Clay Project status**

3) **Ignore the warnings as expected**
   - The warnings/skips are safe if you’re relying on GitHub Projects built-in workflows for **Status = Done**.
   - When you’re ready for full automation (Done date / Needs decision), follow #80 and re-enable the workflows.


---

## What to configure (exact names)

Copy/paste these names (they must match):

| Name | Type | Preferred location | Notes |
|---|---|---|---|
| `PROJECTS_APP_ID` | Actions **Variable** | `vars.PROJECTS_APP_ID` | Legacy fallback: `secrets.PROJECTS_APP_ID` is still accepted by preflight. |
| `PROJECTS_APP_PRIVATE_KEY` | Actions **Secret** | `secrets.PROJECTS_APP_PRIVATE_KEY` | Paste the **full PEM** including headers + line breaks. |
| `PROJECT_STATUS_SYNC_TOKEN` | Actions **Secret** | `secrets.PROJECT_STATUS_SYNC_TOKEN` | PAT fallback (optional). |

Docs:
- GitHub Apps: https://docs.github.com/en/apps/creating-github-apps
- Actions secrets: https://docs.github.com/en/actions/security-guides/encrypted-secrets
- Actions variables: https://docs.github.com/en/actions/learn-github-actions/variables

---

## GitHub App setup (recommended)

### 1) Create an org-owned GitHub App

Clay-Agency → **Settings** → **Developer settings** → **GitHub Apps** → **New GitHub App**

Recommended settings:
- Webhook: **inactive** (not needed)
- Installable: **Only on this account**

**Minimal required permissions** (keep it least-privilege):

| Scope | Permission | Level | Why |
|---|---|---:|---|
| Organization | Projects | Read & write | Query `projectV2` + run mutations (field updates). |
| Repository | Issues | Read-only | Read Issue nodes referenced by project items (`closedAt`, etc.). |
| Repository | Pull requests | Read-only | Read PR nodes referenced by project items (`mergedAt`, etc.). |
| Repository | Metadata | Read-only | Required for GitHub Apps token issuance / repo identification. |

No webhook events / subscriptions are required.

### 2) Generate credentials

On the App page:
- Copy the **App ID** (numeric)
- **Generate a private key** → download the `.pem`

### 3) Install the App on the org (and the right repos)

App page → **Install App** → choose **Clay-Agency**.

Repository access:
- **Only select repositories** → select `novel-task-tracker` (recommended)

If **Clay-Agency Project #1 includes items from other repos**, the App must also be installed on those repos (or installed on **All repositories**) or some items may be unreadable.

### 4) Store the App credentials (Actions variable + secret)

Store at **repo level** (simplest) or **org level** (if multiple repos will reuse the App).

PEM formatting (common pitfall):

```text
-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----
```

Do **not** base64-encode it.

#### CLI quickstart (gh) — repo-level (copy/paste)

```bash
REPO="Clay-Agency/novel-task-tracker"
APP_ID="<numeric app id>"
PEM_FILE="</absolute/path/to/private-key.pem>"

gh auth status

# Variable (preferred)
gh variable set PROJECTS_APP_ID -R "$REPO" --body "$APP_ID"

# Secret (read PEM from stdin to preserve line breaks)
gh secret set PROJECTS_APP_PRIVATE_KEY -R "$REPO" < "$PEM_FILE"

# Verify presence (values are never shown)
gh variable list -R "$REPO" | grep -E '^PROJECTS_APP_ID\b'
gh secret list -R "$REPO" | grep -E '^PROJECTS_APP_PRIVATE_KEY\b'
```

---

## Validate (expected evidence)

Workflows:
- Preflight (checks vars/secrets are present): [`.github/workflows/projects-v2-auth-preflight.yml`](../../.github/workflows/projects-v2-auth-preflight.yml)
- Smoke test (read-only GraphQL): [`.github/workflows/projects-v2-auth-smoke.yml`](../../.github/workflows/projects-v2-auth-smoke.yml)
- Real sync: [`.github/workflows/project-status-sync.yml`](../../.github/workflows/project-status-sync.yml)

### Quick manual validation (UI)

1) **Actions → Projects v2 auth preflight** → latest run should be ✅.
2) **Actions → Projects v2 auth smoke test** → run manually → should be ✅.
3) **Actions → Sync Clay Project status** → run manually → should be ✅.

### Optional: run via CLI (gh)

```bash
REPO="Clay-Agency/novel-task-tracker"

gh workflow run "Projects v2 auth preflight" -R "$REPO"
gh workflow run "Projects v2 auth smoke test" -R "$REPO"

gh run list -R "$REPO" --limit 5
```

---

## Common failures + fixes

| Symptom | Likely cause | Fix |
|---|---|---|
| Preflight fails: missing `PROJECTS_APP_ID` / `PROJECTS_APP_PRIVATE_KEY` | Variable/secret not set, or wrong name | Set `vars.PROJECTS_APP_ID` and `secrets.PROJECTS_APP_PRIVATE_KEY` exactly. |
| `actions/create-github-app-token` fails | App not installed on org/repo, or permissions not approved after changes | Install App on Clay-Agency + `novel-task-tracker`; re-approve permissions in installation settings. |
| GraphQL: `Resource not accessible by integration` | Missing **Org → Projects: Read & write** | Update App permissions, then re-approve installation permissions. |
| Project not found / can’t resolve `projectV2` | Wrong org login/project number, or token can’t access org project | Confirm workflow env (`ORG_LOGIN`, `PROJECT_NUMBER`) and ensure App is installed on the org. |
| Some project items never update | Project includes items from repos not covered by installation | Install App on those repos or broaden installation scope. |
| PEM-related errors | PEM pasted without headers/line breaks | Re-set `PROJECTS_APP_PRIVATE_KEY` with the raw PEM text. |

---

## PAT fallback (only if GitHub App is not possible)

Set:
- `secrets.PROJECT_STATUS_SYNC_TOKEN`

Minimum access required:
- Organization **Projects: Read & write**
- Repo read access for any repos whose issues/PRs appear in the Project

After setting the secret, run the same **smoke test** + **sync** workflows above.
