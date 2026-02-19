# Pilot FAQ + Troubleshooting

This guide helps pilot users quickly resolve common setup and usage issues.

## Quick FAQ

### Where is my data stored?
- Task data is stored in your browser `localStorage` under the key `novel-task-tracker/tasks`.
- Data is local to the **same browser + profile + device**.
- This pilot does **not** send task data to a backend service.

### Can I safely reset my data?
Yes. Use one of these options:

1. **In-app reset (recommended for full reset)**
   - Open the **Tasks** panel and select **Reset app data**.
   - Confirm the prompt.
   - The app clears local keys for tasks and theme preference (`novel-task-tracker/tasks`, `novel-task-tracker/theme`) and returns to an empty state.

2. **In-app partial cleanup**
   - Delete tasks one by one from the task list.
   - Best when you only want to remove some tasks.

3. **Browser storage reset (manual full reset)**
   - Open browser DevTools → Application/Storage → Local Storage.
   - Remove `novel-task-tracker/tasks` and `novel-task-tracker/theme`.
   - Refresh the app.

> Tip: Reset is irreversible for this pilot build (no account backup/sync).

### What happens in Private/Incognito mode?
- The app may work for the current session, but data usually clears when the private window is closed.
- Some browsers may block or restrict storage in private mode.
- If storage is blocked, the app should still run, but data may not persist after refresh/reopen.

### What if my browser blocks local storage?
- Check browser privacy/security settings and site permissions.
- Allow site data/local storage for `clay-agency.github.io`.
- Disable strict anti-tracking/storage blocking for this site (or test in another browser profile).
- If you cannot enable storage, you can still run a short-session test, but persistence checks will be unreliable.

### How do search/filter/sort work?
- **Search** matches task title and description text.
- **Status filter** narrows to open/completed/all tasks.
- **Sort** reorders task list (for example, by recently updated, created time, or title).
- If no items appear, clear search/filter selections first.

### Why is my task not showing in TEFQ (Now Queue)?
A task must be **open** and include both:
- `Estimated duration (min)`
- `Energy required` (low/medium/high)

Also check:
- Current time/energy inputs in the Now Queue panel.
- Optional context filter (it can limit primary matches; fallback suggestions may appear separately).

## Troubleshooting quick checks

### "My tasks disappeared"
1. Confirm you are using the same browser/profile/device.
2. Check whether you are in Private/Incognito mode.
3. Verify browser/site settings are not clearing storage on close.
4. If data was cleared, recreate sample tasks for pilot continuation.

### "Changes do not persist after refresh"
1. Open browser console and look for storage/privacy errors.
2. Confirm local storage is allowed for the site.
3. Retry in a normal (non-private) window.
4. Retry with extensions disabled (privacy/ad-block extensions can interfere).

### "Now Queue is empty"
1. Ensure there are open tasks.
2. Add duration + energy on tasks.
3. Relax context filter or adjust available minutes/current energy inputs.

### "No tasks match search/filter"
1. Clear search text.
2. Set Status filter back to `All`.
3. Reset Sort if needed to re-check ordering.

## Reporting bugs or pilot issues
When reporting an issue, include:
- browser + version,
- OS/device,
- exact steps to reproduce,
- expected vs actual result,
- screenshots/video if available.

Use repository issue templates:
- Bug report: [`../../.github/ISSUE_TEMPLATE/bug-report.md`](../../.github/ISSUE_TEMPLATE/bug-report.md)
- QA finding: [`../../.github/ISSUE_TEMPLATE/qa-finding.md`](../../.github/ISSUE_TEMPLATE/qa-finding.md)
- Feature request: [`../../.github/ISSUE_TEMPLATE/feature-request.md`](../../.github/ISSUE_TEMPLATE/feature-request.md)

Or open the template chooser directly:
- https://github.com/Clay-Agency/novel-task-tracker/issues/new/choose
