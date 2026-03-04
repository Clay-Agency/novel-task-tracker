# Branch protection (main)

Goal: require the **Verify (core)** GitHub Actions check to pass before merging to `main`.

## Enable (GitHub UI)
1. Open the repo on GitHub.
2. Go to **Settings** → **Branches**.
3. Under **Branch protection rules**, click **Add rule**.
4. In **Branch name pattern**, enter: `main`.
5. Configure the rule:
   - Check **Require a pull request before merging**
     - (Recommended) **Require approvals**: `1`
     - (Recommended) **Require conversation resolution**
   - Check **Require status checks to pass before merging**
     - Check **Require branches to be up to date before merging**
     - In **Status checks that are required**, search for `Verify (core)` and select it.
       - Note: GitHub may show the context as **`Verify (core) / npm run verify:core`** (that’s the one you want).
   - (Recommended) Uncheck / leave disabled:
     - **Allow force pushes**
     - **Allow deletions**
6. Click **Create** (or **Save changes**).

## Confirm it’s working
1. Create a small test branch and open a PR targeting `main`.
2. In the PR, verify you see a required check named **Verify (core)** (or **Verify (core) / npm run verify:core**).
3. Confirm the **Merge** button is blocked until the check is **green**.

## If you can’t find the status check in the picker
GitHub only lets you require checks that have reported at least once.

- Trigger the workflow once (open any PR, or run **Actions** → **Verify (core)** → **Run workflow**).
- Then return to **Settings** → **Branches** → edit the rule → add the check.
