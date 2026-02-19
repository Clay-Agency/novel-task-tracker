# Pilot Readiness Checklist + Cross-Browser QA Plan (Issue #27)

This document defines a **manual pre-pilot quality gate** for the Novel Task Tracker MVP, including TEFQ Now Queue behavior.

## 1) Scope

In-scope QA behaviors:
- CRUD task flows (create, edit, complete/reopen, delete)
- Search / filter / sort behavior
- Persistence across reloads (local storage)
- TEFQ Now Queue logic and UX
- Responsive behavior at key breakpoints
- Cross-browser baseline compatibility

Out of scope:
- Performance profiling beyond obvious regressions
- Accessibility audit (separate pass)
- Backend/API behavior (app is currently client-side)

## 2) Target Browsers and Devices (Baseline)

Validate all checklist items on at least the following matrix before pilot sign-off.

| Platform | Browser | Version policy | Device / form factor |
|---|---|---|---|
| macOS | Chrome | Latest stable | Laptop/Desktop (1280x800 or wider) |
| macOS | Safari | Latest stable | Laptop/Desktop (1280x800 or wider) |
| Windows 11 | Edge | Latest stable | Laptop/Desktop (1366x768 or wider) |
| Windows 11 | Chrome | Latest stable | Laptop/Desktop (1366x768 or wider) |
| Windows 11 | Firefox | Latest stable | Laptop/Desktop (1366x768 or wider) |
| iOS (17+) | Safari | Latest stable | iPhone class (390x844), small (320x568) |
| Android (13+) | Chrome | Latest stable | Android phone class (360x800) |

### Minimum pilot support statement
- **Supported:** latest stable versions of Chrome, Edge, Firefox, Safari (desktop), and Safari/Chrome on current mobile OS versions.
- **Not guaranteed for pilot:** legacy browsers (e.g., IE), outdated mobile OS/browser versions.

## 3) Pre-QA Setup

1. Pull latest `main` and run:
   - `npm install`
   - `npm run dev`
2. Use a fresh profile/incognito window (to avoid stale localStorage noise).
3. Prepare seed tasks with mixed metadata:
   - title only task
   - task with description
   - task with due date within 24h
   - task with due date within 3 days
   - task with high priority
   - task with estimated duration + energy + context
   - at least 1 completed task
4. Record browser/device/version in test notes.

## 4) Manual QA Checklist (Step-by-step)

Mark each step **PASS/FAIL** with notes and screenshots for FAIL.

### A. CRUD Flows

1. **Create task (required title)**
   - Add task with valid title.
   - Expected: task appears immediately in list with `open` status.
2. **Create task validation**
   - Submit empty or whitespace-only title.
   - Expected: validation prevents creation.
3. **Edit task**
   - Edit title/description of an existing task and save.
   - Expected: updated content persists in list view.
4. **Complete task**
   - Mark open task as completed.
   - Expected: task shows completed state and moves/filters correctly.
5. **Reopen task**
   - Reopen a completed task.
   - Expected: task returns to open state.
6. **Delete task**
   - Delete a task.
   - Expected: task is removed and does not reappear after refresh.

### B. Search / Filter / Sort

1. **Search by title and description**
   - Search with a unique title keyword, then description keyword.
   - Expected: only matching tasks are shown.
2. **Status filter**
   - Toggle between all/open/completed (or equivalent controls).
   - Expected: list updates deterministically by status.
3. **Sort options**
   - Cycle available sort controls.
   - Expected: ordering changes as selected and remains stable (no random reshuffle).
4. **Combined controls**
   - Apply search + status filter + sort together.
   - Expected: composed state behaves correctly and remains usable.

### C. Persistence (Reload)

1. Create/edit/complete/delete several tasks.
2. Refresh the page.
3. Close and reopen the tab.
4. Expected:
   - Current task list and statuses are restored.
   - Search/filter/sort/panel state (if intentionally persisted) restores as designed.
   - No duplicate or corrupted tasks appear.

### D. TEFQ Now Queue

Use tasks with varied duration/energy/due date/priority/context.

1. **Eligibility filtering**
   - Confirm completed tasks are excluded.
   - Confirm tasks missing duration/energy are excluded from TEFQ ranking.
2. **Constraint matching**
   - Set available minutes and energy to match at least one task exactly.
   - Expected: exact-fit items rank above stretch items.
3. **Due-date influence**
   - Include tasks due within 24h / 3 days.
   - Expected: nearer due items receive visible ranking advantage.
4. **Priority influence**
   - Compare otherwise similar tasks with high vs normal priority.
   - Expected: high-priority task ranks higher when applicable.
5. **Tie-break determinism**
   - Re-run same inputs without data changes.
   - Expected: recommendation order is stable across runs/reloads.
6. **Context fallback behavior**
   - Apply context with no direct matches.
   - Expected: fallback guidance appears and closest alternatives are shown.
7. **Reason chips / transparency**
   - Verify recommendation reasons are visible and match task metadata.

### E. Responsive Breakpoints

Validate at minimum the following widths (portrait unless noted):
- 320x568 (small phone)
- 360x800 (Android baseline)
- 390x844 (modern phone)
- 768x1024 (tablet)
- 1280x800 (desktop)

At each breakpoint verify:
1. No critical horizontal overflow or clipped controls.
2. Add/Edit/Complete/Reopen/Delete remain operable.
3. Search/filter/sort controls are readable and tappable/clickable.
4. TEFQ panel and task list remain understandable without layout breakage.

(For a focused responsive pass, also use `docs/qa/responsive-qa-checklist.md`.)

## 5) Pass/Fail Criteria

### Pass
A browser/device test run is **PASS** when:
- All critical flows (CRUD, search/filter/sort, persistence, TEFQ, responsive usability) pass.
- No Severity 1/2 defects remain open.
- Any Severity 3/4 defects are documented and accepted for pilot.

### Fail
A browser/device test run is **FAIL** when any of the following occur:
- Data loss/corruption or persistence failure.
- Core flow broken (cannot create/edit/complete/delete tasks).
- TEFQ recommendations are non-deterministic for identical input state.
- UI becomes unusable at required breakpoints.
- Browser-specific regression blocks normal pilot usage.

### Severity guideline
- **S1 (Blocker):** app unusable / data loss / crash loop.
- **S2 (Major):** key feature broken but workaround may exist.
- **S3 (Minor):** non-blocking functional/UI defect.
- **S4 (Trivial):** cosmetic or low-impact issue.

## 6) Bug Reporting Procedure

Create a GitHub issue for each bug with label **`bug`** and include severity in the title.

### Title format
`[QA][S<1-4>][Browser/Device] short summary`

Example:
`[QA][S2][iOS Safari 17] Cannot reopen completed task after refresh`

### Required bug report fields
- Environment: browser, version, OS, device/viewport
- Build/commit tested
- Preconditions / test data
- Steps to reproduce
- Expected result
- Actual result
- Frequency (always/intermittent)
- Attachments: screenshot or short screen recording
- Console/network errors (if any)

### Triage flow
1. QA files issue with `bug` label + severity in title.
2. Add comment linking impacted checklist section(s).
3. Engineering acknowledges and links fixing PR.
4. QA retests on same browser/device and closes issue when verified.

## 7) Pilot Readiness Exit Checklist

Pilot can proceed only when all are true:
- [ ] Cross-browser matrix completed for required targets.
- [ ] All S1/S2 issues resolved and verified.
- [ ] Remaining S3/S4 issues documented and accepted.
- [ ] Manual checklist evidence captured (notes + links/screenshots).
- [ ] Final QA summary posted in release/PR notes.

