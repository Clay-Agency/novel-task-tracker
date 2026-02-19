# Pilot Kickoff Checklist

Use this checklist before each pilot session to keep setup consistent and avoid data contamination between participants.

## 1) Session prep (before participant joins)
- [ ] Confirm facilitator and note-taker roles for this session.
- [ ] Open pilot materials:
  - [ ] Onboarding packet: [`docs/pilot/onboarding.md`](./onboarding.md)
  - [ ] Demo flow: [`docs/pilot/demo-script.md`](./demo-script.md)
  - [ ] Interview prompts: [`docs/pilot/feedback-questions.md`](./feedback-questions.md)
  - [ ] Synthesis template: [`docs/pilot/feedback-synthesis-template.md`](./feedback-synthesis-template.md)
- [ ] Prepare a place to capture notes (doc, issue draft, or template copy).
- [ ] Confirm meeting link + recording consent workflow (if recording is used).

## 2) Environment + browser check
- [ ] Open app: https://clay-agency.github.io/novel-task-tracker/
- [ ] Use a supported browser version (latest Chrome/Safari/Edge/Firefox).
- [ ] Use a clean profile/window if possible (recommended: incognito/private window for each participant).
- [ ] Verify page loads with no obvious console/runtime errors.
- [ ] Confirm viewport matches test intent (desktop and/or mobile width).

## 3) Data reset (required between participants)
Because this pilot uses `localStorage`, always reset data before a new session.

### Quick reset option (recommended)
- [ ] Open devtools console on the app page.
- [ ] Run:

```js
localStorage.clear();
location.reload();
```

### Browser UI reset option
- [ ] Clear site data/storage for `clay-agency.github.io` in browser settings.
- [ ] Reload and verify an empty starting state.

## 4) Baseline sanity check (1–2 minutes)
- [ ] Create 2–3 test tasks with varied duration/energy/priority.
- [ ] Mark one complete, then reopen.
- [ ] Set TEFQ constraints (time + energy) and verify recommendations appear.
- [ ] Refresh once to confirm persistence behavior within the same browser profile.
- [ ] Remove test tasks (or repeat reset) so participant starts clean.

## 5) Participant kickoff confirmations
At the beginning of the session, confirm:
- [ ] Pilot purpose: workflow feedback, not polished production UX.
- [ ] Storage model: local browser storage only (no account/sync/backend).
- [ ] Session flow: orientation → demo/tasks → feedback questions.
- [ ] Permission to ask follow-up questions and probe specific moments.

## 6) Post-session handoff
- [ ] Capture 3–5 key findings immediately after session end.
- [ ] Classify each finding (bug vs feature request; severity/priority).
- [ ] Add evidence (quotes, timestamps, repro steps).
- [ ] Convert findings into GitHub issues and link in synthesis notes.
- [ ] Add to weekly summary using [`docs/pilot/weekly-report-format.md`](./weekly-report-format.md).

---

## Fast preflight (60-second version)
If time is short, do these minimum checks:
1. [ ] Reset localStorage.
2. [ ] Load app and create one task.
3. [ ] Confirm TEFQ recommendations appear.
4. [ ] Confirm note-taking template is ready.
