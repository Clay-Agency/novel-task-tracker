# Clay admin quickstart (5–10 min)

This is a **GitHub-first**, low-friction checklist for Clay (org admin) to unblock the repo’s Project automation.

If you need full details (copy/paste commands, troubleshooting, rotation/incident response), use the canonical runbook:
- **Projects v2 auth runbook**: [`docs/ops/projects-v2-auth-runbook.md`](./projects-v2-auth-runbook.md)

## Operational guardrails (recommended)

- **Protect `main` (required check gate)**: [`docs/ops/branch-protection.md`](./branch-protection.md)
  - Require **Verify (core)** to pass + at least **1 approval** before merge.
  - Blocks force-push/deletion and prevents bypassing the CI gate.

- **Needs-decision daily snapshot (low-noise automation)**: [`docs/ops/needs-decision-snapshot.md`](./needs-decision-snapshot.md)
  - Maintains a single canonical Issue: search **"Needs-decision snapshot (automated)"** → https://github.com/Clay-Agency/novel-task-tracker/issues?q=is%3Aissue+is%3Aopen+%22Needs-decision+snapshot+%28automated%29%22
  - Workflow: https://github.com/Clay-Agency/novel-task-tracker/actions/workflows/needs-decision-snapshot.yml (uses only `GITHUB_TOKEN`; **no Projects v2 auth**)

## Security reminders (do this first)

- **Never paste** private keys (PEM), PATs, or other secrets into **issues/PRs/Discord/chat**.
- Prefer:
  - GitHub UI (**Settings → Secrets and variables → Actions**) or
  - `gh secret set …` (interactive) so secrets don’t land in shell history.
- If a secret is ever exposed: **rotate/revoke immediately** (see incident response in the runbook).

---

## 0) Checklist (copy/paste)

- [ ] (Required) Configure Projects v2 auth (GitHub App preferred; PAT fallback)
- [ ] Run **Projects v2 auth preflight** and confirm it detects the expected names
- [ ] Run **Projects v2 auth smoke test** (read-only)
- [ ] Run **Sync Clay Project status** (real workflow)
- [ ] (Optional interim) Enable Project built-in workflows: close/merge → **Status = Done**
- [ ] (Decision) Priority taxonomy (#126): choose **Option A** (add P3) or **Option B** (collapse P3 into P2) and apply the corresponding UI steps

---

## 1) Projects v2 auth (required for status sync)

Goal: make these workflows able to read/update **Clay-Agency org Project #1** via GraphQL:
- Preflight: `Projects v2 auth preflight`
- Smoke: `Projects v2 auth smoke test`
- Real sync: `Sync Clay Project status`

### Quick links (GitHub UI)

**Org (Clay-Agency) GitHub App pages**
- GitHub Apps list: https://github.com/organizations/Clay-Agency/settings/apps
- New GitHub App: https://github.com/organizations/Clay-Agency/settings/apps/new

**Repo (novel-task-tracker) Actions secrets/vars**
- Repo Actions secrets/variables: https://github.com/Clay-Agency/novel-task-tracker/settings/secrets/actions

**Workflows (run + verify results)**
- Preflight: https://github.com/Clay-Agency/novel-task-tracker/actions/workflows/projects-v2-auth-preflight.yml
- Smoke test: https://github.com/Clay-Agency/novel-task-tracker/actions/workflows/projects-v2-auth-smoke.yml
- Status sync: https://github.com/Clay-Agency/novel-task-tracker/actions/workflows/project-status-sync.yml

### Choose ONE auth approach

- **Option A (preferred): GitHub App** (least privilege; per-run tokens)
  - Configure:
    - `vars.PROJECTS_APP_ID` (preferred; numeric)
    - `secrets.PROJECTS_APP_PRIVATE_KEY` (full PEM)
  - Reference: **Option A** in [`projects-v2-auth-runbook.md`](./projects-v2-auth-runbook.md)

- **Option B (fallback): PAT**
  - Configure:
    - `secrets.PROJECT_STATUS_SYNC_TOKEN`
  - Reference: **Option B** in [`projects-v2-auth-runbook.md`](./projects-v2-auth-runbook.md)

### Verify (3-minute smoke + status sync)

1. **Run preflight**
   - Open the preflight workflow link above → **Run workflow**.
   - Expected: green run.
   - In the run **Summary**, confirm it detects either:
     - `PROJECTS_APP_ID` + `PROJECTS_APP_PRIVATE_KEY`, **or**
     - `PROJECT_STATUS_SYNC_TOKEN`

2. **Run the read-only smoke test**
   - Open the smoke workflow link above → **Run workflow**.
   - Expected: green run; Summary shows Project title/fields.

3. **Run the real status sync**
   - Open the status sync workflow link above → **Run workflow**.
   - Expected: green run (no “No Projects v2 auth token available”).

Optional end-to-end check:
- Add a test Issue/PR to **Project #1** (https://github.com/orgs/Clay-Agency/projects/1), then close/merge it and confirm the Project item updates.

---

## 2) Optional interim: enable built-in Project workflows (Status → Done)

If Projects v2 auth isn’t ready yet, you can still get **basic** automation using GitHub Project’s built-in workflows.

Project:
- Clay-Agency Project #1: https://github.com/orgs/Clay-Agency/projects/1

### Built-in workflows are Status-only

GitHub’s built-in Project automations can only update the built-in **Status** field.

✅ Can:
- When an Issue is **closed** or a PR is **merged/closed**, automatically set **Status = Done** (if configured).

❌ Cannot:
- Set or clear **custom fields** (e.g., **Done date**, **Needs decision**).
- Perform repo-specific logic or field mapping beyond the built-in rules.

Docs:
- Built-in automations: https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/using-the-built-in-automations
- Automating Projects using Actions: https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/automating-projects-using-actions
- Automating with the API: https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/using-the-api-to-manage-projects

### UI steps

1. Open Project #1: https://github.com/orgs/Clay-Agency/projects/1
2. Open **Workflows** (or **⋯ menu → Workflows**, depending on UI).
3. Enable/configure both rules (names vary slightly):
   - **Item closed** → set **Status** to **Done**
   - **Pull request merged** (and/or **Pull request closed**) → set **Status** to **Done**
4. Confirm the Project has a **Status** single-select option named **Done**.

Note: once Projects v2 auth is configured, prefer the repo workflow `Sync Clay Project status` so **Done date** + **Needs decision** can be managed consistently.

---

## 3) Priority taxonomy decision (Issue #126): do A or B

Context: some discussions referenced **P3**, but Project #1’s **Priority** field may only support **P0/P1/P2**.

Tracking issue (needs decision):
- https://github.com/Clay-Agency/novel-task-tracker/issues/126

### Option A — Add P3 to Project #1 field (Project becomes P0–P3)

If Clay chooses **A**, do these **Project UI steps**:

1. Open Project #1: https://github.com/orgs/Clay-Agency/projects/1
2. Open **Project settings** (gear icon or **⋯ → Settings**).
3. Go to **Fields**.
4. Select the **Priority** field (single select) → **Edit**.
5. Add a new option: **P3** (choose a color if prompted) → Save.

Follow-up (recommended):
- Ensure any docs/templates that mention priority match P0–P3.

### Option B — Keep Project at P0–P2 (treat “P3” as part of P2)

If Clay chooses **B**, do these **repo doc/template steps** (no Project field change required):

1. Keep Project #1 **Priority** options as **P0/P1/P2**.
2. Update docs/templates so people stop writing an unsupported value:
   - If any repo docs mention P3, update them to say **P2 includes “P2/P3”**.
   - If/when we add Priority guidance to issue templates, update:
     - `.github/ISSUE_TEMPLATE/*.md`

Where to check for drift:
- Repo README “Open decisions” section: https://github.com/Clay-Agency/novel-task-tracker#open-decisions

---

## Reference links

- Projects v2 auth runbook (canonical): [`docs/ops/projects-v2-auth-runbook.md`](./projects-v2-auth-runbook.md)
- Project status sync behavior: [`docs/ops/project-status-sync.md`](./project-status-sync.md)
- Issue #80 (Projects v2 auth blocker): https://github.com/Clay-Agency/novel-task-tracker/issues/80
- Issue #137 (this doc): https://github.com/Clay-Agency/novel-task-tracker/issues/137
