# Clone Context

Use this file as the first read in every new session for this repository.

## Goal
- Current goal: Continue M4/M5 delivery by reducing maintenance and release drift after shipping shortcut + release-check parity.
- Why this matters now: keyboard and release guardrails landed this session, so the next leverage point is maintainability/docs depth to keep delivery speed high.

## Expected Outcome
- What should be true after this session:
  - `web/app.js` modularization starts with a low-risk extraction slice.
  - README remains compact while deep recipes move to `docs/`.
  - Packaging policy for `dist/cli.js` inclusion is clarified (`.npmignore`/`files`).
- Definition of done for this cycle:
  - Selected modularization/docs/packaging tasks are completed or explicitly blocked with evidence.
  - Verification evidence is logged in `PROJECT_MEMORY.md`.
  - Trackers are updated and backlog depth remains healthy.

## Current State
- Completed recently:
  - Studio now supports keyboard shortcuts for Step 3/Step 4 (`generate`, `copy/export drafts`, `build/copy/download feed`) with editable-field guards.
  - Added `npm run release:check` automation with changelog guard, quality command execution, artifact checks, and npm-cache isolation for pack validation.
  - Updated roadmap/features/memory/docs with new parity closure and remaining gaps.
- In progress:
  - No active implementation in progress; session closed after two shipped slices.
- Blockers or risks:
  - `web/app.js` remains a high-maintenance hotspot until modularization lands.
  - `npm pack --dry-run` excludes `dist/cli.js` under current packaging rules (`.gitignore` fallback); release-check warns but does not fail.

## Immediate Next Actions
- [ ] 1. Start phased modularization by extracting Step 1 state/actions from `web/app.js` into a dedicated module.
- [ ] 2. Split deep command/release recipes from `README.md` into `docs/` and keep README at quickstart depth.
- [ ] 3. Decide npm packaging policy (`files` whitelist or `.npmignore`) so `dist/cli.js` inclusion is intentional and testable.
- [ ] 4. Add focused tests for any modularized helpers and rerun lint/typecheck/build + smoke path.
- [ ] 5. Refresh roadmap/feature/memory trackers with post-modularization outcomes and commit/push slices.

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
- Last updated: 2026-02-17T03:00:54Z
- Updated by: codex autonomous maintainer (global cycle 22)
- Notes for next session: keyboard/release parity slice is complete; next cycle should prioritize `web/app.js` modularization + docs split + packaging policy hardening.
