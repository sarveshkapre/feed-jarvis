# Clone Context

Use this file as the first read in every new session for this repository.

## Goal
- Current goal: Continue M4/M5 cleanup by finishing phased `web/app.js` modularization and docs-depth cleanup after landing packaging enforcement.
- Why this matters now: Step 1 helper extraction and release packaging policy are now in place, so the biggest remaining maintenance drag is `web/app.js` size and README/docs depth split.

## Expected Outcome
- What should be true after this session:
  - Additional `web/app.js` sections are extracted into focused modules with behavior parity.
  - README stays quickstart-focused and deep recipes move to dedicated docs pages.
  - Verification and tracker docs remain current with each shipped cleanup slice.
- Definition of done for this cycle:
  - Selected modularization/docs tasks are completed or explicitly blocked with evidence.
  - Verification evidence is logged in `PROJECT_MEMORY.md`.
  - Trackers are updated and backlog depth remains healthy.

## Current State
- Completed recently:
  - Extracted Step 1 ingestion helpers from `web/app.js` into `web/step1Ingestion.js` and added focused tests (`test/step1Ingestion.test.ts`).
  - Hardened package publish metadata with `package.json` `files` whitelist and enforced `dist/cli.js` validation in `release:check` via `npm pack --dry-run --json`.
  - Updated roadmap/feature/memory/release docs and re-verified quality gates.
- In progress:
  - No active implementation in progress; session closed after two shipped cleanup slices.
- Blockers or risks:
  - `web/app.js` remains a high-maintenance hotspot until modularization lands.
  - README still carries deep workflow content that should move under `docs/` to keep onboarding concise.

## Immediate Next Actions
- [ ] 1. Extract next `web/app.js` slice: Step 1 persistence/read-write helpers into a dedicated `web` module with parity tests.
- [ ] 2. Split deep CLI/release workflow recipes from `README.md` into a new `docs/` page and keep README quickstart-level.
- [ ] 3. Run `npm run lint`, `npm run typecheck`, `npm run build`, and targeted tests for the extracted module(s).
- [ ] 4. Run lightweight security grep checks and record evidence in `PROJECT_MEMORY.md`.
- [ ] 5. Update `PRODUCT_ROADMAP.md`, `CLONE_FEATURES.md`, `PROJECT_MEMORY.md`, and this context file after each shipped slice.

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
- Last updated: 2026-02-17T03:10:05Z
- Updated by: codex autonomous maintainer (global cycle 23)
- Notes for next session: packaging policy hardening and Step 1 helper extraction are complete; continue phased `web/app.js` modularization and docs split.
