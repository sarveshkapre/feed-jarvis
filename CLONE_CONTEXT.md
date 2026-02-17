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
  - Extracted Step 1 persistence/session storage helpers into `web/studioStorage.js` and added focused coverage (`test/studioStorage.test.ts`).
  - Split deep command recipes from `README.md` into `docs/WORKFLOWS.md` and kept README quickstart-focused.
- In progress:
  - No active implementation in progress; Global Cycle 1 locked scope completed.
- Blockers or risks:
  - `web/app.js` remains a high-maintenance hotspot until modularization lands.
  - README still carries deep workflow content that should move under `docs/` to keep onboarding concise.

## Immediate Next Actions
- [ ] 1. Continue phased `web/app.js` modularization by extracting the next high-churn slice (API request helpers + fetch/generate wrappers).
- [ ] 2. Add Step 1 per-feed error detail drill-down UI/status messaging for fetch troubleshooting.
- [ ] 3. Add/verify a storage migration helper for future localStorage schema evolution.
- [ ] 4. Re-run lint/typecheck/build plus targeted tests for the next extracted module slice.
- [ ] 5. Update roadmap/feature/memory trackers and verify backlog depth remains >=20 pending items.

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
- Last updated: 2026-02-17T10:02:00Z
- Updated by: codex autonomous maintainer (global cycle 1)
- Notes for next session: persistence-helper extraction and README/docs split are complete; next highest-value work is further `web/app.js` modularization plus fetch-debug UX depth.
