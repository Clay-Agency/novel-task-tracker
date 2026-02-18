# DR-001 — Pilot feature selection: Time-Energy Fit Queue (TEFQ)

- **Date:** 2026-02-19
- **Status:** Accepted
- **Related issue:** #10

## Context
For a frontend-only pilot, baseline task CRUD is not differentiating enough versus established tools (Todoist, TickTick, Trello, Microsoft To Do). The strongest opportunity is improving moment-of-execution decisions: “what should I do right now?”

## Decision
Ship **Time-Energy Fit Queue (TEFQ)** as the pilot differentiator.

Users provide:
- task duration estimate
- task energy requirement
- current available time + current energy

System provides:
- deterministic ranked “Now” suggestions
- transparent reason chips per recommendation

## Rationale
- Novel but feasible without backend.
- High immediate user value (execution guidance, not just organization).
- Straightforward to test deterministically.

## Consequences
- Need a clear, simple scoring model and tie-break rules.
- Ranking quality must be explainable to maintain trust.
- Excludes advanced personalization in pilot scope.

## Implementation scope handoff (Issue #11)
- Add task metadata: duration + energy.
- Build Now panel with time/energy inputs.
- Implement deterministic scoring and ranking.
- Add reason chips and empty/fallback states.
- Cover with unit/UI tests.

