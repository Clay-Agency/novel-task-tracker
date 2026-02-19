# Pilot Facilitator Guide

This guide helps facilitators run consistent pilot sessions, collect high-signal evidence, and translate feedback into actionable issues.

## Session objective
- Understand whether core task workflows are fast and intuitive.
- Validate whether TEFQ "Now Queue" recommendations are understandable and useful.
- Capture concrete friction points with evidence strong enough to prioritize work.

## Recommended roles
- **Facilitator (required):** runs session, asks questions, controls pacing.
- **Note-taker (recommended):** captures quotes, timestamps, and issue candidates.

## Before session
1. Run the preflight in [`docs/pilot/kickoff-checklist.md`](./kickoff-checklist.md).
2. Review script and prompts:
   - Demo flow: [`docs/pilot/demo-script.md`](./demo-script.md)
   - Interview prompts: [`docs/pilot/feedback-questions.md`](./feedback-questions.md)
3. Prepare synthesis template for immediate post-session consolidation:
   - [`docs/pilot/feedback-synthesis-template.md`](./feedback-synthesis-template.md)

## Suggested run-of-show (30–40 minutes)

### 1) Intro and framing (3–5 min)
- Explain this is a pilot prototype and candid feedback is expected.
- Set expectation: you may interrupt to ask clarifying questions.
- Confirm whether participant is using real workflow examples or synthetic tasks.

### 2) Guided walkthrough (8–12 min)
Use [`demo-script.md`](./demo-script.md) as the baseline sequence:
- capture/edit/complete/reopen/delete,
- search/filter/sort,
- TEFQ constraints and recommendation review,
- persistence + limitations.

Facilitator behavior:
- Keep instructions short; avoid over-explaining design intent.
- Pause after each segment for one “what felt easy/hard?” question.

### 3) Task-based probing (10–15 min)
Ask participant to perform realistic actions with minimal instruction.
Examples:
- “You have 30 minutes and medium energy—pick what to do next.”
- “Find and update the task you added first.”
- “Show how you’d identify what can be finished quickly.”

Watch for:
- hesitations, misclicks, backtracking,
- misunderstanding of labels/scores/reason chips,
- inability to recover from mistakes.

### 4) Structured feedback (8–10 min)
Use targeted prompts from [`feedback-questions.md`](./feedback-questions.md):
- Most useful part,
- Largest friction,
- Must-have improvement before broader pilot,
- Trust in TEFQ recommendation output.

## Evidence capture standards
Record evidence with enough detail to be actionable:
- **Quote:** direct participant language when possible.
- **Context:** task attempted, device/browser, and constraints used.
- **Proof point:** timestamp or clear reproduction steps.
- **Impact:** what outcome was blocked or slowed.

Good evidence example:
> “I can’t tell why this item is first in the queue” (12:42) after setting Time=30, Energy=Low; participant opened 3 items to inspect reasons.

## Converting insights into issues
Immediately after session:
1. Fill synthesis template sections (observations, bugs, requests).
2. Assign severity and priority rubric in template.
3. Open/link GitHub issues for each high-signal finding.
4. Add top findings to weekly report format.

Tip: prioritize findings seen in multiple sessions or those blocking core flows.

## Facilitation do/don't
### Do
- Ask neutral questions (“What are you expecting here?”).
- Let participants narrate intent before intervening.
- Distinguish usability confusion from feature gap.

### Don’t
- Lead participants to the “correct” interpretation.
- Defend design decisions during the session.
- Treat single anecdotal preferences as roadmap commitments.

## Session close checklist (2 min)
- Confirm final summary:
  1) most useful,
  2) biggest friction,
  3) one must-have change.
- Thank participant and confirm next steps for feedback usage.
- Save notes with participant/session metadata for synthesis.
