# Pilot Onboarding Packet

## What this is
Novel Task Tracker is a lightweight task app prototype focused on fast capture, simple completion workflows, and a **Time-Energy Fit Queue (TEFQ) Now Queue** that recommends what to do next based on time/energy constraints.

This onboarding guide is for pilot participants and facilitators to align on:
- what to test,
- where to access the app,
- how task data is stored,
- and current pilot limitations.

## Related pilot docs
- Pilot kickoff checklist: [`docs/pilot/kickoff-checklist.md`](./kickoff-checklist.md)
- Facilitator runbook: [`docs/pilot/facilitator-guide.md`](./facilitator-guide.md)
- FAQ + troubleshooting: [`docs/pilot/faq-troubleshooting.md`](./faq-troubleshooting.md)
- Feedback interview guide: [`docs/pilot/feedback-questions.md`](./feedback-questions.md)
- Feedback synthesis template: [`docs/pilot/feedback-synthesis-template.md`](./feedback-synthesis-template.md)
- Weekly report format: [`docs/pilot/weekly-report-format.md`](./weekly-report-format.md)
- Consent + data handling notice: [`docs/pilot/consent-data-notice.md`](./consent-data-notice.md)
- Recruitment criteria + outreach templates: [`docs/pilot/recruitment-criteria-outreach.md`](./recruitment-criteria-outreach.md)

## Pilot app link
- Canonical pilot URL source: [`docs/pilot/pilot-url.md`](./pilot-url.md)
- Live app: use the URL listed in the canonical source above.

## Pilot test setup (2–3 minutes)
1. Open the app link in a modern browser (Chrome/Safari/Edge/Firefox latest).
2. Create 4–6 tasks with varied:
   - durations (for example: 15, 30, 60 min),
   - energy levels (low/medium/high),
   - priority (normal/high),
   - optional due dates.
3. Mark at least one task complete.
4. Refresh once to confirm tasks persist.

## How data is stored
- Data is stored **locally in your browser** using `localStorage`.
- Your tasks stay on the same browser/profile/device unless storage is cleared.
- Data is not sent to a backend service in this pilot build.
- Full participant notice: [`docs/pilot/consent-data-notice.md`](./consent-data-notice.md)

## What to focus on during pilot
- Is task capture/editing/completion fast and intuitive?
- Is the Now Queue recommendation logic understandable and useful?
- Do filters/sorting/search support real workflows?
- Does the UI remain usable across desktop/mobile viewport sizes?

## Known limitations (pilot)
- **Client-only app**: no server/backend persistence.
- **localStorage only**: clearing browser data removes tasks.
- **No accounts or sync**: tasks are not shared/synced across devices.
- **No collaboration/multi-user support** in this pilot.
