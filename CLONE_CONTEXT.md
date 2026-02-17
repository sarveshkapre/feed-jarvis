# Clone Context

Use this file as the first read in every new session for this repository.

## Goal
- Current goal: Continue M4/M5 maintainability hardening by extracting the next `web/app.js` seam after named-select cleanup, with priority on CI-safe integration/smoke reliability.
- Why this matters now: Global Cycle 6 closed the select-binding and fetch-contract gaps; the highest leverage now is reducing remaining `web/app.js` orchestration surface and unblocking listen/cache-constrained verification paths.

## Expected Outcome
- What should be true after this session:
  - Next `web/app.js` seam extraction lands (persona/session/event bindings) with focused parity tests.
  - CI-safe listen/cache isolation defaults are defined for broader smoke/integration reliability.
  - Release/smoke machine-readable contracts gain additional fixture/contract stability coverage.
  - Tracker docs stay synchronized with shipped behavior and pending parity gaps.
- Definition of done for this cycle:
  - Selected modularization + integration reliability tasks are completed or explicitly blocked with evidence.
  - Verification evidence is logged in `PROJECT_MEMORY.md`.
  - Trackers are updated and backlog depth remains healthy.

## Current State
- Completed recently:
  - Extracted feed/filter/rule select bindings from `web/app.js` into `web/namedSelectBindings.js` with parity tests (`test/namedSelectBindings.test.ts`).
  - Added explicit `/api/fetch` payload contract docs (`docs/API_CONTRACTS.md`) and linked workflow/readme references.
  - Extended smoke contract assertions for mixed-success `/api/fetch` and added validator unit coverage (`src/lib/fetchContract.ts`, `test/fetchContract.test.ts`).
  - Re-ran lint/typecheck/build/docs/security + targeted unit suites and captured evidence in trackers.
- In progress:
  - No active implementation in progress; Global Cycle 6 locked scope completed and pushed.
- Blockers or risks:
  - `web/app.js` remains a high-maintenance hotspot until API/export/UI helper slices are extracted.
  - Sandboxed environment blocks listen-based integration tests/smoke paths (`listen EPERM`) and default home-cache writes (`EPERM`), so verification still relies on lint/typecheck/build + targeted unit suites + CLI smoke paths.

## Immediate Next Actions
- [ ] 1. Extract the next `web/app.js` persona/session/event binding seam into focused helpers with parity tests.
- [ ] 2. Implement CI-safe listen/cache isolation defaults for integration + smoke commands (`node --import tsx` paths, cache dir isolation).
- [ ] 3. Add fixture stability coverage for machine-readable outputs (`release:check --json` and smoke contract summaries).
- [ ] 4. Run docs/security/lint/typecheck/build + targeted tests/smoke substitutes and log evidence in `PROJECT_MEMORY.md`.
- [ ] 5. Refresh roadmap/feature/context trackers and maintain pending backlog depth >=20 candidates.

## Constraints
- Guardrails:
  - Preserve local-first behavior and existing API contracts.
  - Do not rewrite immutable policy sections in `AGENTS.md`.
  - Keep UI changes scoped to shortcut affordances; avoid broad layout refactors this cycle.
- Non-goals:
  - New API endpoints or scheduler/publishing integrations.
  - Persona-management redesign.
  - Large visual redesign outside touched flows.

## Key References
- Roadmap: PRODUCT_ROADMAP.md
- Memory log: PROJECT_MEMORY.md
- Incidents: INCIDENTS.md
- Agent contract: AGENTS.md

## Session Handoff
- Last updated: 2026-02-17T17:05:00Z
- Updated by: codex autonomous maintainer (global cycle 6)
- Notes for next session: Global Cycle 6 shipped and pushed (`149c0f7`, `3ccbd14`, `de0c61b`). Next highest-value work is CI-safe listen/cache isolation plus the next `web/app.js` extraction seam (persona/session/event bindings), then fixture-level stability checks for machine-readable release/smoke outputs.
