# Pilot Success Metrics + Measurement Plan

Define a lightweight measurement system for the pilot so we can decide whether to **proceed**, **proceed with fixes**, or **hold** without adding heavy analytics overhead.

## Principles (minimal overhead)
- Prefer data we already collect in pilot operations.
- Use existing templates first:
  - [`feedback-synthesis-template.md`](./feedback-synthesis-template.md)
  - [`weekly-report-format.md`](./weekly-report-format.md)
- Collect only what drives decisions (stop collecting if unused for 2+ weeks).
- Keep metrics directional for pilot-stage confidence, not precision benchmarking.

## Data sources
1. **Session-level feedback synthesis docs** (primary qualitative + issue-level evidence).
2. **Weekly report** (primary roll-up and trend view).
3. **Optional local usage logs** (secondary quantitative support; use when available).
4. **Facilitator quick survey/scoring** from `feedback-questions.md` after sessions.

---

## Candidate metrics (8)

| Metric | Why it matters | How to measure (low overhead) | Weekly cadence | Good | Needs work |
| --- | --- | --- | --- | --- | --- |
| 1) Session completion rate | Validates participants can finish the planned pilot flow | Count completed sessions / scheduled sessions in weekly report header | Weekly | >= 80% | < 60% |
| 2) First-task activation | Confirms first-use clarity and onboarding effectiveness | In synthesis: did participant create first meaningful task during session (Yes/No) | Weekly roll-up | >= 85% Yes | < 70% Yes |
| 3) Core workflow success | Checks usability of create/edit/complete/reopen loop | From synthesis observations + facilitator scoring; mark each session Pass/Partial/Fail | Weekly | >= 80% Pass | < 65% Pass |
| 4) Search/filter/sort usefulness | Verifies findability for active use | Feedback question C3 + synthesis notes; count positive vs negative mentions | Weekly | Positive >= 2x negative | Negative >= positive |
| 5) TEFQ relevance rate | Core product value signal for recommendations | Feedback question D1 (Often/Sometimes/Never), roll up `% Often` and `% Never` | Weekly | Often >= 50% and Never <= 20% | Often < 30% or Never > 35% |
| 6) Recommendation explainability trust | Tests if reason chips build user trust | Feedback question D3 + synthesis quote evidence; session marked Trust/Unclear | Weekly | Trust >= 70% | Trust < 50% |
| 7) Reliability confidence | Protects pilot validity (persistence + bugs) | Feedback section E + issue tracker count of S1/S2 bugs opened/active that week | Weekly | 0 S1 and <= 2 S2 active | Any S1 or > 3 S2 |
| 8) Continue-using intent | High-level adoption/retention proxy | Feedback question G1 (Yes/No/Maybe), track `% Yes` | Weekly | >= 60% Yes | < 40% Yes |

> Thresholds are starting points for a small pilot and should be recalibrated after 2-3 weeks of data.

---

## Measurement method by metric type

### A) Manual counts (default)
Use this for metrics 1-4, 6, 8.
- Facilitator fills one synthesis doc per session.
- Weekly owner tallies counts into weekly report:
  - Executive summary (health + key signal)
  - Optional KPI tracker table

### B) Survey roll-ups (default)
Use feedback questions B-G to derive comparable weekly percentages.
- Keep response scales unchanged week-to-week.
- Treat missing responses explicitly as `No response` (don’t infer).

### C) Optional local usage logs (supporting evidence)
Use only if pilot logging is enabled and stable.
- Validate directional trends only (e.g., TEFQ view/use frequency).
- Never replace session synthesis interpretation with logs alone.
- If log instrumentation breaks, continue pilot reporting with manual + survey metrics.

---

## Weekly operating cadence

### Monday–Thursday (during sessions)
- Run session(s), capture synthesis evidence (quotes, timestamps, issues).
- Open/link bugs and requests directly from synthesis template.

### Friday (reporting)
1. Aggregate metric counts and percentages.
2. Update `weekly-report-format.md` sections:
   - **Executive summary**: health color + top risk/win.
   - **What we learned**: adoption, TEFQ, reliability signals.
   - **Optional KPI tracker**: weekly deltas.
3. Assign provisional health status:
   - **Green**: no red-flag thresholds hit.
   - **Yellow**: one needs-work threshold hit.
   - **Red**: multiple needs-work thresholds or any S1 reliability incident.
4. Document explicit next-week success criteria tied to weakest metric(s).

---

## Decision policy for pilot readiness
- **Proceed**: 2 consecutive weeks with no red metrics and reliability in good range.
- **Proceed with fixes**: mixed signals but no critical reliability failure.
- **Hold**: reliability red flag (any S1) or sustained low activation/intent for 2 weeks.

## Traceability checklist
For each weekly report, ensure:
- All KPI values link back to session synthesis evidence.
- All serious findings map to an issue with severity/priority.
- Decisions/asks are explicit in weekly report section 6.
