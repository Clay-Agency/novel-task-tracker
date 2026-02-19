# Competitive teardown: 5 task apps and what we should copy

Issue: #68  
Date: 2026-02-20  
Author: Research (May)

## Scope and method
- Reviewed 5 mainstream task apps used across web/mobile/desktop patterns:
  1. Todoist
  2. TickTick
  3. Microsoft To Do
  4. Things 3
  5. Any.do
- Focused on: navigation model, quick-add behavior, prioritization, reminders, and “next action” support.
- Extracted 3 strongest ideas per app, then synthesized recurring patterns we should adapt for `novel-task-tracker`.

---

## 1) Todoist
### Best ideas
1. **Natural-language quick add** (date, priority, labels inline while typing) keeps capture friction very low.
2. **Views as first-class navigation** (Inbox, Today, Upcoming, filters) reduce cognitive load vs one long list.
3. **Progressive metadata entry**: task can start minimal, then get richer fields only when needed.

### Why it matters
- Users keep the habit when capture takes seconds.
- Separate “capture” from “organize” improves completion rates.

---

## 2) TickTick
### Best ideas
1. **Calendar + list dual view** supports both time-blocking and backlog workflows.
2. **Built-in smart lists** (Today, Tomorrow, Overdue, custom filters) make urgency obvious.
3. **Reminder flexibility** (time-based + recurring options) makes follow-through more reliable.

### Why it matters
- People switch between “what exists” (list) and “when it happens” (calendar) constantly.
- Overdue visibility is a strong nudge mechanism.

---

## 3) Microsoft To Do
### Best ideas
1. **“My Day” focus mode** creates a bounded daily plan from a larger backlog.
2. **“Planned” and “Important” lightweight prioritization** avoids complex setup.
3. **Suggested tasks for today** lowers planning effort at day start.

### Why it matters
- Daily curation is more behaviorally effective than static priority flags.
- Suggested resurfacing helps prevent forgotten tasks.

---

## 4) Things 3
### Best ideas
1. **Elegant hierarchy** (Areas → Projects → Tasks) without overwhelming users.
2. **Today/Upcoming/Anytime/Someday states** model intent and commitment level clearly.
3. **Low-friction “this evening” / defer semantics** improve realistic planning.

### Why it matters
- “Not now, but not never” is a common real-life state that basic to-do lists miss.
- Commitment staging reduces guilt and list fatigue.

---

## 5) Any.do
### Best ideas
1. **Daily planning ritual** encourages users to re-confirm priorities each day.
2. **Simple gesture-driven task actions** (complete/reschedule) keep flow fast on mobile.
3. **Cross-platform reminder mindset** (time + context of day) is clear and approachable.

### Why it matters
- Ritualized review increases consistency.
- Fast rescheduling reduces abandonment when plans break.

---

## Cross-app patterns (what repeatedly works)

## A. Navigation patterns
- High-performing apps avoid a single undifferentiated list.
- Common stable views: **Inbox/Capture**, **Today**, **Upcoming**, **Overdue**, **Important**.
- Best UX balances persistent nav with one-tap focus views.

## B. Quick add patterns
- Capture is optimized for speed first, structure second.
- Natural-language parsing and inline shortcuts dramatically reduce friction.
- Users add richer metadata later if the app makes that path obvious but optional.

## C. Prioritization patterns
- Raw priority labels are insufficient alone.
- Strong apps combine signals: due date urgency, effort/time fit, and daily focus selection.
- “Pick today’s set” is more actionable than “mark high priority”.

## D. Reminder patterns
- Reminder controls are near task creation/edit, not hidden in deep settings.
- Good defaults + recurring options increase completion.
- Overdue and due-soon surfacing is treated as core UX, not a side panel.

## E. Momentum patterns
- Most successful products create a **daily loop**:
  1) capture quickly,
  2) pick today,
  3) execute,
  4) roll forward unfinished items.

---

## 5 concrete improvements for `novel-task-tracker`

## 1) Add an Inbox + Daily Focus workflow (Today queue)
**What to build**
- Introduce `Inbox` as default capture destination.
- Add a `Today` picker where users intentionally select tasks for today.

**Why now**
- Complements TEFQ by distinguishing **candidate tasks** from **committed tasks**.

**MVP acceptance idea**
- New task defaults to Inbox.
- User can “Add to Today” / “Remove from Today”.
- Dedicated Today view exists with task count + completion progress.

## 2) Implement natural-language quick add (lightweight parser)
**What to build**
- Parse common patterns in title input (e.g., `tomorrow`, `fri`, `p1`, `30m`, `@calls`) into existing fields.
- Show parsed chips before submit for user confirmation.

**Why now**
- Directly improves input speed and metadata quality, which also improves TEFQ recommendations.

**MVP acceptance idea**
- At least date, priority, duration, and context tokens parse correctly.
- Parsing is transparent and editable before create.

## 3) Create Upcoming + Overdue smart views
**What to build**
- Add computed views for Overdue, Due Today, Next 7 Days.
- Keep sort deterministic and visually separate overdue items.

**Why now**
- Users need urgency triage before running TEFQ.

**MVP acceptance idea**
- One-tap navigation to each view.
- Overdue count badge in nav.

## 4) Add reminder presets tied to due date
**What to build**
- Provide simple reminder presets: `At due time`, `1h before`, `1 day before` (local notification-ready architecture even if browser limitations apply).
- Keep per-task reminder state in model for future backend sync.

**Why now**
- Reminder intent is a major retention lever and requested expectation in task apps.

**MVP acceptance idea**
- Reminder options visible in create/edit UI.
- State persists and appears in task details/chips.

## 5) Introduce a daily review ritual screen (2-minute plan)
**What to build**
- At first app open each day, optional review prompt:
  - carry over unfinished tasks,
  - pick top 3 for today,
  - run TEFQ with current time/energy.

**Why now**
- Converts TEFQ from “feature” into habit loop.

**MVP acceptance idea**
- Once-per-day prompt (dismissible).
- Saves a timestamped “review completed” event (works with existing optional usage log).

---

## Suggested roadmap order
1. Inbox + Today workflow
2. Upcoming/Overdue smart views
3. Lightweight natural-language quick add
4. Daily review ritual screen
5. Reminder presets + persistence model

Rationale: this order delivers immediate planning clarity first, then capture speed, then retention loops.

## Notes / constraints
- This teardown is intentionally lightweight and product/UX-oriented (no reverse engineering).
- Recommendations are chosen to fit the current frontend-only pilot architecture and existing TEFQ concept.
