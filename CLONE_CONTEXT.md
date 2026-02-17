# Clone Context

Use this file as the first read in every new session for this repository.

## Goal
- Current goal: Ship the highest-value pending parity slice by adding production-safe Studio keyboard shortcuts for Step 3/Step 4 actions and release-check automation for repeatable ship readiness.
- Why this matters now: current roadmap gaps are operator-speed friction and release-readiness drift, which directly block the transition from reliability work into sustained daily production use.

## Expected Outcome
- What should be true after this session:
  - Studio supports clear keyboard actions for generate/export loops beyond the existing fetch shortcut.
  - A local release checklist script validates changelog, quality gates, and build artifacts before tagging.
  - Roadmap, memory, and feature tracker are updated with verification evidence and the next pending priorities.
- Definition of done for this cycle:
  - New shortcuts work without triggering while typing in text inputs/textareas.
  - Shortcut behavior is covered by tests.
  - `npm run release:check` exists, is documented, and passes locally in this environment.
  - Lint/typecheck/build/tests for touched areas pass and are logged in `PROJECT_MEMORY.md`.

## Current State
- Completed recently:
  - `/api/fetch` now reports retry/latency diagnostics and API errors include request IDs surfaced in Studio.
  - CLI `generate --dry-run` diagnostics and session-persistence hardening are complete.
- In progress:
  - Global Cycle 22 session kickoff: goal checkpoint, brainstorm ranking, market/parity refresh, and locked-scope planning.
- Blockers or risks:
  - `web/app.js` remains a high-maintenance hotspot until modularization lands.
  - Sandbox restrictions can block listener-based integration paths (`listen EPERM`) during verification.

## Immediate Next Actions
- [ ] 1. Implement a keyboard shortcut helper and wire Step 3/Step 4 shortcut actions in `web/app.js`.
- [ ] 2. Add shortcut hints in `web/index.html` and update behavior docs in `README.md`.
- [ ] 3. Add release-check automation script + npm command and document release workflow in `docs/RELEASE.md`.
- [ ] 4. Run lint/typecheck/build/tests/smoke commands and record exact evidence in `PROJECT_MEMORY.md`.
- [ ] 5. Update roadmap/feature tracker/memory/handoff, then commit and push each completed slice to `main`.

## Constraints
- Guardrails:
  - Preserve local-first behavior and existing API contracts.
  - Do not rewrite immutable policy sections in `AGENTS.md`.
  - Keep UI changes scoped to shortcut affordances; avoid broad layout refactors this cycle.
- Non-goals:
  - `web/app.js` large-scale modularization.
  - New API endpoints or scheduler/publishing integrations.
  - Persona-management redesign.

## Key References
- Roadmap: PRODUCT_ROADMAP.md
- Memory log: PROJECT_MEMORY.md
- Incidents: INCIDENTS.md
- Agent contract: AGENTS.md

## Session Handoff
- Last updated: 2026-02-17T02:51:54Z
- Updated by: codex autonomous maintainer (global cycle 22)
- Notes for next session: locked execution list is keyboard shortcuts + release checklist automation; finish both before starting a new cycle scope.
