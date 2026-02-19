# Pilot Feedback Synthesis Template

Use this template to turn raw pilot sessions into actionable product and engineering work.

## How to use
1. Create one synthesis entry per participant/session.
2. Capture direct evidence (quotes, screen recording timestamps, repro notes).
3. Convert findings into GitHub issues and link them.
4. Roll high-signal findings into the weekly report format.

---

## Session metadata
- Facilitator:
- Date:
- Participant:
- Role / team:
- Experience level with task tools:
- Device + browser:
- Session type: (live demo / self-serve / async notes)
- Duration:

## 1) Feedback intake
- **What they tried**
  - Example: task create/edit/delete, complete/reopen, TEFQ queue tuning, search/filter/sort
- **Context**
  - Real workflow or synthetic test?
  - Approx. task volume used in session:
  - Time/energy settings tested:
- **Outcome summary (2–3 bullets)**
  -
  -

## 2) Observations + quotes
| Area | Observation | Evidence (quote or timestamp) | Impact |
| --- | --- | --- | --- |
| Onboarding |  |  |  |
| Core task flow |  |  |  |
| TEFQ usefulness |  |  |  |
| Reliability/performance |  |  |  |
| Accessibility/responsive |  |  |  |

## 3) Issues found (bugs)
| ID | Finding | Severity (S1-S4) | Priority (P0-P2) | Owner | GitHub issue |
| --- | --- | --- | --- | --- | --- |
| B-01 |  |  |  |  | [#](https://github.com/Clay-Agency/novel-task-tracker/issues/) |
| B-02 |  |  |  |  | [#](https://github.com/Clay-Agency/novel-task-tracker/issues/) |

## 4) Feature requests
| ID | Request | Why it matters | Priority (P0-P2) | Owner | GitHub issue |
| --- | --- | --- | --- | --- | --- |
| F-01 |  |  |  |  | [#](https://github.com/Clay-Agency/novel-task-tracker/issues/) |
| F-02 |  |  |  |  | [#](https://github.com/Clay-Agency/novel-task-tracker/issues/) |

## 5) Next-week plan
- **Top 3 goals**
  1.
  2.
  3.
- **Planned issue set**
  - Must-fix before broader pilot:
  - Should-fix for confidence:
  - Nice-to-have experiments:
- **Risks / dependencies**
  -
- **Decision needed from stakeholders**
  -

---

## Prioritization + severity rubric

### Priority (implementation order)
- **P0 — Blocker / immediate**: prevents pilot progress or invalidates data quality. Fix now.
- **P1 — Important / near-term**: materially harms usability or confidence; fix in next cycle.
- **P2 — Valuable / can wait**: meaningful improvement but not required for pilot continuity.

### Severity (user impact)
- **S1 — Critical**: data loss, app unusable, security/privacy break.
- **S2 — High**: core workflow broken or highly unreliable for many users.
- **S3 — Medium**: partial workflow friction; workaround exists.
- **S4 — Low**: minor UX polish issue or edge-case annoyance.

### Quick triage rule of thumb
- Start with **Severity** (impact), then assign **Priority** (when we will do it).
- Typical mapping (adjust with judgment):
  - S1 → P0
  - S2 → P0/P1
  - S3 → P1/P2
  - S4 → P2
