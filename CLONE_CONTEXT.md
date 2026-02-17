# Clone Context

Use this file as the first read in every new session for this repository.

## Goal
- Current goal: Continue M4/M5 maintainability hardening by extracting the next `web/app.js` state/UI binding seam after shipping export/release/docs automation improvements.
- Why this matters now: Global Cycle 4 closed export and release-automation gaps, so the highest leverage remaining risk is `web/app.js` state/UI coupling.

## Expected Outcome
- What should be true after this session:
  - Next `web/app.js` seam extraction lands (state/UI bindings) with focused tests and no behavior regressions.
  - Persistence/release verification depth increases via snapshot fixture or migration smoke checks.
  - Release/readme/docs trackers stay synchronized with behavior.
- Definition of done for this cycle:
  - Selected modularization + release automation tasks are completed or explicitly blocked with evidence.
  - Verification evidence is logged in `PROJECT_MEMORY.md`.
  - Trackers are updated and backlog depth remains healthy.

## Current State
- Completed recently:
  - Extracted Step 1 ingestion helpers from `web/app.js` into `web/step1Ingestion.js` and added focused tests (`test/step1Ingestion.test.ts`).
  - Hardened package publish metadata with `package.json` `files` whitelist and enforced `dist/cli.js` validation in `release:check` via `npm pack --dry-run --json`.
  - Extracted Step 1 persistence/session storage helpers into `web/studioStorage.js` and added focused coverage (`test/studioStorage.test.ts`).
  - Split deep command recipes from `README.md` into `docs/WORKFLOWS.md` and kept README quickstart-focused.
  - Extracted shared Studio API request helpers into `web/studioApi.js` and rewired `loadPersonas`/`fetchItems`/`generatePosts`/`buildAgentFeed` in `web/app.js` with focused tests (`test/studioApi.test.ts`).
  - Added Step 1 per-feed fetch diagnostics (`/api/fetch` `failures[]` + UI details drill-down + status summary updates) with focused tests.
  - Added versioned Studio storage migration helper (`feed-jarvis-studio:schema-version` current `2`) and startup migration wiring with focused tests.
  - Added Studio localStorage key-map + migration behavior docs in `docs/WORKFLOWS.md`.
- In progress:
  - No active implementation in progress; Global Cycle 4 locked scope completed and pushed.
- Blockers or risks:
  - `web/app.js` remains a high-maintenance hotspot until API/export/UI helper slices are extracted.
  - Sandboxed environment blocks listen-based integration tests (`listen EPERM`) and default home-cache writes (`EPERM`), so verification relies on lint/typecheck/build + targeted unit suites + CLI smoke paths.

## Immediate Next Actions
- [ ] 1. Extract the next `web/app.js` seam (state/UI binding orchestration) into focused modules with parity tests.
- [ ] 2. Add deterministic session snapshot round-trip fixture coverage for modularization safety.
- [ ] 3. Add Step 1 "copy fetch failures JSON" quick action for support/debug handoff.
- [ ] 4. Run lint/typecheck/build + targeted tests + CLI smoke flow and log evidence in `PROJECT_MEMORY.md`.
- [ ] 5. Refresh roadmap/feature/context trackers and keep backlog depth >=20 pending candidates.

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
- Last updated: 2026-02-17T08:27:00Z
- Updated by: codex autonomous maintainer (global cycle 4)
- Notes for next session: Global Cycle 4 shipped export seam extraction + `release:check --json` + docs/security scripts (`06c790f`, `b6f0f24`, `094e3cd`). Next highest-value work is continuing `web/app.js` state/UI extraction and adding snapshot/migration smoke hardening.
