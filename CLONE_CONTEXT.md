# Clone Context

Use this file as the first read in every new session for this repository.

## Goal
- Current goal: Continue M4/M5 maintainability hardening by extracting the next `web/app.js` state/UI binding seam after shipping Step 1 failure-handoff and snapshot-fixture cleanup work.
- Why this matters now: Global Cycle 5 reduced Step 1 troubleshooting and snapshot regression risk, so the next leverage point is additional `web/app.js` preset/select binding decomposition.

## Expected Outcome
- What should be true after this session:
  - Next `web/app.js` seam extraction lands (preset/select/event-state bindings) with focused parity tests.
  - Verification depth increases for docs/security + persistence/release smoke paths without broad architecture churn.
  - Tracker docs stay synchronized with shipped behavior and pending parity gaps.
- Definition of done for this cycle:
  - Selected modularization + release automation tasks are completed or explicitly blocked with evidence.
  - Verification evidence is logged in `PROJECT_MEMORY.md`.
  - Trackers are updated and backlog depth remains healthy.

## Current State
- Completed recently:
  - Extracted Step 1 fetch-failure presentation/serialization helpers into `web/fetchFailureDetails.js` and rewired `web/app.js` to use the helper model.
  - Added Step 1 "Copy failures JSON" quick action with clipboard-safe status feedback in the fetch details block.
  - Added deterministic session snapshot round-trip fixture coverage in `test/studioStorage.test.ts`.
  - Re-ran docs/security/lint/typecheck/build + focused Step 1/storage test suites and captured evidence in trackers.
- In progress:
  - No active implementation in progress; Global Cycle 5 locked scope completed and pushed.
- Blockers or risks:
  - `web/app.js` remains a high-maintenance hotspot until API/export/UI helper slices are extracted.
  - Sandboxed environment blocks listen-based integration tests (`listen EPERM`) and default home-cache writes (`EPERM`), so verification relies on lint/typecheck/build + targeted unit suites + CLI smoke paths.

## Immediate Next Actions
- [ ] 1. Extract next `web/app.js` preset/select/event binding seam into focused helpers with parity tests.
- [ ] 2. Add `/api/fetch` failure payload contract notes + focused smoke assertion coverage.
- [ ] 3. Investigate CI-safe cache/listen isolation defaults for broader integration-test reliability.
- [ ] 4. Run docs/security/lint/typecheck/build + targeted tests and log exact evidence in `PROJECT_MEMORY.md`.
- [ ] 5. Refresh roadmap/feature/context trackers and replenish backlog depth >=20 candidates.

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
- Last updated: 2026-02-17T08:35:00Z
- Updated by: codex autonomous maintainer (global cycle 5)
- Notes for next session: Global Cycle 5 shipped Step 1 failure-handoff cleanup (`daecfbd`) and deterministic snapshot fixture hardening (`175b095`). Next highest-value work is continuing `web/app.js` state/UI seam extraction and adding API contract + smoke-depth hardening.
