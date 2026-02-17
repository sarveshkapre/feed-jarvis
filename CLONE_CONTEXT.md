# Clone Context

Use this file as the first read in every new session for this repository.

## Goal
- Current goal: Continue M4/M5 hardening by shipping the next reliability+maintainability slice after API-helper extraction (Step 1 fetch drill-down UX and storage migration groundwork).
- Why this matters now: the API wrapper modularization seam is now closed, so the highest-value remaining gaps are troubleshooting depth in Step 1 and future-safe local storage schema evolution.

## Expected Outcome
- What should be true after this session:
  - Step 1 fetch flows provide higher-signal failure detail per feed.
  - Storage schema evolution has a documented and tested migration path.
  - `web/app.js` modularization continues in small, low-risk slices.
  - Verification and tracker docs remain current with each shipped cleanup slice.
- Definition of done for this cycle:
  - Selected reliability/modularization tasks are completed or explicitly blocked with evidence.
  - Verification evidence is logged in `PROJECT_MEMORY.md`.
  - Trackers are updated and backlog depth remains healthy.

## Current State
- Completed recently:
  - Extracted Step 1 ingestion helpers from `web/app.js` into `web/step1Ingestion.js` and added focused tests (`test/step1Ingestion.test.ts`).
  - Hardened package publish metadata with `package.json` `files` whitelist and enforced `dist/cli.js` validation in `release:check` via `npm pack --dry-run --json`.
  - Extracted Step 1 persistence/session storage helpers into `web/studioStorage.js` and added focused coverage (`test/studioStorage.test.ts`).
  - Split deep command recipes from `README.md` into `docs/WORKFLOWS.md` and kept README quickstart-focused.
  - Extracted shared Studio API request helpers into `web/studioApi.js` and rewired `loadPersonas`/`fetchItems`/`generatePosts`/`buildAgentFeed` in `web/app.js` with focused tests (`test/studioApi.test.ts`).
- In progress:
  - No active implementation in progress; Global Cycle 2 locked scope completed.
- Blockers or risks:
  - `web/app.js` remains a high-maintenance hotspot until API/export/UI helper slices are extracted.
  - Sandboxed environment blocks network-based scans and listen-based integration tests (`curl` DNS failures, `listen EPERM`), so verification relies on lint/typecheck/build + targeted unit suites + CLI smoke paths.

## Immediate Next Actions
- [ ] 1. Add Step 1 per-feed fetch error detail drill-down UI/status messaging for faster troubleshooting.
- [ ] 2. Add/verify a storage migration helper for future localStorage schema revisions.
- [ ] 3. Continue phased `web/app.js` modularization with the next extraction seam (export/state UI bindings).
- [ ] 4. Run lint/typecheck/build + targeted tests + smoke flow and log exact evidence in `PROJECT_MEMORY.md`.
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
- Last updated: 2026-02-17T22:45:00Z
- Updated by: codex autonomous maintainer (global cycle 2)
- Notes for next session: API helper modularization slice is complete with parity tests; next highest-value work is Step 1 fetch diagnostics depth plus schema migration tooling.
