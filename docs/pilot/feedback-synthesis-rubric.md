# Pilot Feedback Synthesis Rubric

Use this rubric to turn raw pilot feedback into comparable decisions across sessions.

It is designed for the current **frontend-only / localStorage-only** pilot:
- prioritize findings that block normal pilot use,
- separate true TEFQ value concerns from prototype limitations,
- and keep synthesis lightweight enough to use right after each session.

## Purpose
Bucket each finding across three dimensions:
1. **Severity** — how bad is the user impact?
2. **Frequency** — how often did we see it?
3. **Actionability** — how clear is the next step?

Use the combined score to decide whether to:
- fix immediately,
- queue for the next pilot cycle,
- monitor for more evidence,
- or explicitly accept as a known pilot limitation.

---

## Step 1: Normalize each finding
Write each finding in a standard format before scoring:
- **Area:** onboarding / task flow / search-filter-sort / TEFQ / reliability / accessibility / other
- **Finding statement:** one sentence, plain language
- **Evidence:** quote, timestamp, or repro steps
- **Observed impact:** what got blocked, slowed, or confused
- **Scope note:** product issue, usability issue, bug, or expected pilot limitation

Example:
> **Area:** TEFQ  
> **Finding:** Participant could not tell why the first recommendation outranked the others.  
> **Evidence:** “I still don’t know why this one is first” at 14:32 after setting Time=30, Energy=Low.  
> **Observed impact:** participant opened multiple cards to guess rationale and lost trust in ranking.  
> **Scope note:** usability issue.

---

## Step 2: Score the finding

### A. Severity rubric
| Score | Label | Definition | Typical examples |
| --- | --- | --- | --- |
| S1 | Critical | Prevents pilot use, causes data loss, or creates a privacy/security concern | app unusable, saved tasks disappear unexpectedly, export/import corrupts data |
| S2 | High | Breaks or seriously undermines a core workflow for multiple users | cannot create/edit/complete tasks reliably, TEFQ fails in normal use |
| S3 | Medium | Noticeable friction or confusion, but user can continue with a workaround | search behavior unclear, TEFQ reasons hard to interpret, mobile layout awkward |
| S4 | Low | Minor annoyance, polish issue, or edge case with limited impact | wording nit, visual alignment issue, low-priority convenience request |

**Severity decision rule:** score based on the user impact in-session, not on implementation difficulty.

### B. Frequency rubric
| Score | Label | Definition | How to use |
| --- | --- | --- | --- |
| F3 | Repeated / pattern | Seen in 3+ sessions, or repeated by multiple participants in one week | treat as strong pilot signal |
| F2 | Confirmed | Seen in 2 sessions, or one session plus supporting log/repro evidence | likely real, not anecdotal |
| F1 | Isolated | Seen once only | keep, but do not overreact |

**Frequency note:** for the first week, many findings will start at **F1**. Upgrade only when comparable evidence appears.

### C. Actionability rubric
| Score | Label | Definition | Typical next move |
| --- | --- | --- | --- |
| A3 | Clear fix or decision | Root cause or next action is obvious | open issue with direct implementation recommendation |
| A2 | Directionally clear | Problem is real, but solution needs some design/product judgment | open issue and note options or owner question |
| A1 | Needs more evidence | Signal is weak or ambiguous; more sessions needed | monitor with a probe question next session |

**Actionability decision rule:** score how clear the next step is, not how important the finding is.

---

## Step 3: Bucket the finding
Use the matrix below to decide what to do next.

### Recommended action matrix
| Severity | Frequency | Actionability | Default bucket | Expected action |
| --- | --- | --- | --- | --- |
| S1 | Any | Any | **Fix now** | open blocker issue immediately; do not ignore for pilot reporting |
| S2 | F2-F3 | A2-A3 | **Fix next cycle** | prioritize for next build/test loop |
| S2 | F1 | A1-A2 | **Validate quickly** | reproduce, ask follow-up question in next session, then re-score |
| S3 | F2-F3 | A2-A3 | **Queue improvement** | add to near-term backlog with evidence links |
| S3 | F1 | A1-A2 | **Monitor** | keep in synthesis and watch for repeat signal |
| S4 | Any | Any | **Park / polish** | log only if easy or strategically relevant |

---

## TEFQ-specific interpretation guidance
Because TEFQ is the pilot differentiator, apply extra discipline when scoring TEFQ findings.

### Treat as higher importance when:
- participants say recommendations are not relevant,
- participants do not trust the reason chips or ranking logic,
- participants cannot use TEFQ without facilitator explanation,
- TEFQ output behaves inconsistently for the same visible inputs.

### Treat as lower importance when:
- participant wants advanced personalization not promised in pilot,
- participant expects backend/account features unrelated to TEFQ value,
- participant preference is stylistic and does not change trust or use.

### Scope reminder
Do **not** over-score known pilot limitations such as:
- no accounts,
- no cross-device sync,
- local-only storage.

These should still be documented, but usually as **expected limitation / not a pilot blocker** unless they directly invalidate the session or make feedback unusable.

---

## Step 4: Convert rubric output into backlog language
Use the following mapping when opening issues or writing weekly summaries.

| Rubric outcome | Suggested backlog treatment |
| --- | --- |
| S1 + any frequency | Severity `S1`, Priority `P0` |
| S2 + F2/F3 | Severity `S2`, Priority `P0` or `P1` |
| S2 + F1 | Severity `S2`, usually Priority `P1` pending confirmation |
| S3 + F2/F3 | Severity `S3`, Priority `P1` |
| S3 + F1 | Severity `S3`, Priority `P2` unless strategically important |
| S4 | Severity `S4`, Priority `P2` |

If a finding is **high severity but low actionability**, still open it — note what evidence is missing.

---

## Step 5: Roll findings into a session summary
After scoring all findings from one session, summarize them as:
- **Top validated strengths** (what clearly worked)
- **Top risks** (highest-severity or repeated findings)
- **TEFQ signal** (useful / mixed / weak, with evidence)
- **Pilot continuity status** (safe to continue / continue with caution / hold for fix)

Recommended summary rule of thumb:
- **Safe to continue:** no S1 findings and no more than one unresolved S2
- **Continue with caution:** one unresolved S2 or multiple repeated S3 findings
- **Hold for fix:** any S1, or evidence quality is too compromised to trust the pilot

---

## Fast facilitator workflow (5 minutes post-session)
1. Capture 3-5 findings only — do not over-document.
2. Score each with **Severity / Frequency / Actionability**.
3. Mark one of four buckets:
   - Fix now
   - Fix next cycle
   - Monitor
   - Park
4. Copy the top findings into:
   - [`feedback-synthesis-template.md`](./feedback-synthesis-template.md)
   - [`pilot-result-template.md`](./pilot-result-template.md)
   - [`weekly-report-format.md`](./weekly-report-format.md)

## Calibration reminders
- Prefer **comparable scoring** over perfect scoring.
- Use direct quotes wherever possible.
- Keep known pilot constraints visible so the team does not confuse prototype limits with core product failure.
- Recalibrate after the first 3-5 sessions if scores feel consistently too harsh or too soft.
