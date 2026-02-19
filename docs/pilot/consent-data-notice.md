# Pilot Consent + Data Handling Notice

Use this short notice before each pilot session so participants understand how data is handled in this prototype.

## What this app does (pilot scope)
Novel Task Tracker is a **client-only** web app prototype for personal task tracking and TEFQ (Time-Energy Fit Queue) recommendations.

In this pilot build, the app runs entirely in your browser.

## Where your data is stored
- Task data is stored in your browser `localStorage`.
- Current storage key: `novel-task-tracker/tasks`
- Theme preference key: `novel-task-tracker/theme`
- Data is local to the same browser profile and device.

## What is not collected in this pilot
- No account sign-up/login
- No server-side task storage
- No cloud sync across devices
- No automatic analytics pipeline for task contents

## How to reset / clear data
Choose one of the following:

1. **In-app reset (recommended full reset)**
   - Open the **Tasks** panel.
   - Select **Reset app data** and confirm.

2. **Manual browser reset**
   - Open browser DevTools → Application/Storage → Local Storage.
   - Remove `novel-task-tracker/tasks` and `novel-task-tracker/theme`.
   - Refresh the app.

> Reset is irreversible in this pilot build.

## How to export JSON backup
- Use **Export JSON** in the Tasks panel.
- Save the downloaded file locally.
- You can re-import later with **Import JSON** in the same panel.

## How to report bugs or share feedback
- Bug report / QA finding / feature request templates:
  - [`bug-report.md`](../../.github/ISSUE_TEMPLATE/bug-report.md)
  - [`qa-finding.md`](../../.github/ISSUE_TEMPLATE/qa-finding.md)
  - [`feature-request.md`](../../.github/ISSUE_TEMPLATE/feature-request.md)
- Direct issue template chooser:
  - https://github.com/Clay-Agency/novel-task-tracker/issues/new/choose
- Pilot interview prompts:
  - [`docs/pilot/feedback-questions.md`](./feedback-questions.md)

## Consent acknowledgement (pilot-friendly)
Use this exact text (or a close equivalent) before starting:

> “This pilot app stores your task data only in this browser using local storage. There is no account and no server-side task storage in this build. You can stop at any time, and you can reset or clear your data at any point. Do you understand and consent to continue with this pilot session?”

If recording is used, ask for recording consent separately.
