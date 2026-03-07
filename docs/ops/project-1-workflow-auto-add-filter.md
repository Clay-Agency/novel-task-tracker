# Project #1 — Edit Workflows → Auto-add filter (exclude automation)

Use this when Project #1 is auto-adding “meta”/automation issues (for context, see #169).

## Goal
Update the Project #1 **Workflows → Auto-add** filter to exclude issues labeled `automation` by appending `-label:automation`.

## Repo backstop (GitHub Actions)
This repo includes a small backstop workflow that will **remove any issue/PR labeled `automation` from Project #1** if it gets auto-added anyway:
- Workflow: `.github/workflows/project-autoadd-exclude-automation.yml`

This is intentionally lightweight and should not replace the **Project Workflows → Auto-add filter**. Keep the filter updated so automation items never enter the project in the first place.

### Example filter
Use this exact filter (minimum viable):

```
is:issue -label:automation
```

## Click-by-click (GitHub UI)
1. Open the Clay-Agency organization on GitHub.
2. Go to **Projects**.
3. Open **Project #1**.
4. In the top-right, click **⋯ (More)** → **Workflows**.
5. Under **Auto-add**, click the workflow to open its configuration.
6. Find the **Filter** (query) field.
7. Update the query by adding:
   - `-label:automation`

   For example, change:
   - `is:issue`
   to:
   - `is:issue -label:automation`
8. Click **Save** (or **Update workflow**) to apply.

## Quick verification
- Create or find an issue labeled `automation` and confirm it does **not** auto-add.
- Create or find a normal issue (no `automation` label) and confirm it **does** auto-add.

## References
- #169: https://github.com/Clay-Agency/novel-task-tracker/issues/169
