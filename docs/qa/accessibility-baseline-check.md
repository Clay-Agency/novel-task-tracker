# Accessibility Baseline Manual Check (Issue #35)

Lightweight pass for pilot readiness (not a full WCAG audit).

## Quick check steps
1. Run app locally (`npm run dev`) and use keyboard only (no mouse).
2. Confirm core flows are reachable and usable:
   - Add task
   - Edit task (including `Esc` to cancel)
   - Mark completed / Reopen
   - Delete
   - Search / status filter / sort
   - TEFQ controls (time, energy, context)
3. Confirm visible focus ring appears on inputs, selects, and buttons.
4. Confirm screen reader semantics are present:
   - Form controls have labels
   - Task action buttons include task-specific names
   - Task count/status updates are announced via live regions

## Record findings
- Capture browser + OS + assistive tech used.
- Log any blocker as GitHub issue with repro steps.
