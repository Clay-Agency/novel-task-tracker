# Standard decision-brief template (Project #1)

Use this template when a Project #1 issue/PR is **waiting on an explicit Clay decision** and Boe/May needs to prepare a compact, repeatable brief in an issue comment or doc.

This is the **middle artifact** between:
- opening a new decision issue (`.github/ISSUE_TEMPLATE/decision-request.yml`), and
- writing the final decision record after the choice is made (`docs/decisions/decision-record-template.md`).

## When to use

Use a decision brief when:
- the work is already tracked in an existing issue/PR,
- the next step is blocked on a decision, and
- Clay needs a short, high-signal packet rather than a long thread.

If the decision does **not** already have an issue, start with the repo's **Decision request** issue template first.

## Standard template

Copy/paste into an issue comment and fill in the blanks:

```md
### Decision brief — <short topic>

**Decision needed:** <the exact choice Clay needs to make>

**Recommendation:** <preferred option>
<1-2 sentence rationale>

#### Option A — <name>
- Pros: <bullets>
- Cons: <bullets>

#### Option B — <name>
- Pros: <bullets>
- Cons: <bullets>

<!-- Optional: include only if there is a realistic third option -->
#### Option C — <name>
- Pros: <bullets>
- Cons: <bullets>

**Risks / tradeoffs:**
- <risk or second-order effect>
- <risk or second-order effect>

**Blocked work if unanswered:**
- <issue/PR/task that remains blocked>

**Deadline / urgency:** <date, event, or 'No hard deadline; blocks next triage pass'>

**Exact ask to Clay:** <pick A/B/C, approve recommendation, or provide another constraint>

**Evidence:**
- <issue / PR / doc / workflow link>
- <issue / PR / doc / workflow link>
```

## Writing guidance

- Keep it **compact**: usually 8-20 lines, not an essay.
- Prefer **1-2 realistic options**; use 3 only when necessary.
- Put the **recommendation near the top** so Clay can decide quickly.
- Make the **exact ask** explicit so the thread ends with a clear action.
- Link only the **minimum evidence** needed to justify the recommendation.

## Example in this repo

- #126 Priority taxonomy — example decision brief comment:
  https://github.com/Clay-Agency/novel-task-tracker/issues/126#issuecomment-4019857596
