# Clone Context

Use this file as the first read in every new session for this repository.

## Goal
- Current goal: Ship the next M4/M5 cleanup slice by extracting persistence helpers from `web/app.js` and moving deep README workflows into dedicated docs pages.
- Why this matters now: Step 1 ingestion helper extraction is done, and the highest remaining parity/maintainability gaps are storage/session helper sprawl in `web/app.js` and an oversized README.

## Expected Outcome
- What should be true after this session:
  - Step 1 persistence/session read-write helpers move from `web/app.js` into a focused `web` module with behavior parity.
  - README is quickstart-only and deep CLI/release workflows move to `docs/`.
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
  - Active: Global Cycle 1 locked scope execution has completed persistence-helper extraction and is moving to README/docs split.
- Blockers or risks:
  - `web/app.js` remains a high-maintenance hotspot until modularization lands.
  - README still carries deep workflow content that should move under `docs/` to keep onboarding concise.

## Immediate Next Actions
- [x] 1. Extract next `web/app.js` slice: Step 1 persistence/read-write helpers into a dedicated `web` module with parity tests.
- [ ] 2. Split deep CLI/release workflow recipes from `README.md` into a new `docs/` page and keep README quickstart-level.
- [x] 3. Run `npm run lint`, `npm run typecheck`, `npm run build`, and targeted tests for the extracted module(s).
- [x] 4. Run lightweight security grep checks and record evidence in `PROJECT_MEMORY.md`.
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
- Last updated: 2026-02-17T09:24:00Z
- Updated by: codex autonomous maintainer (global cycle 1)
- Notes for next session: locked scope is persistence-helper modularization + README/docs split; execute both slices with verification and immediate push after each commit.
