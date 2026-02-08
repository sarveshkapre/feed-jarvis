# Clone Feature Tracker

## Context Sources
- README and docs
- TODO/FIXME markers in code
- Test and build failures
- Gaps found during codebase exploration

## Candidate Features To Do
- [ ] P0: Restore CI green on `main` by fixing Biome lint/format errors in `src/server.ts`, `web/app.js`, and `web/styles.css`.
- [ ] P0: Add server integration tests that exercise `/api/personas`, `/api/fetch`, `/api/generate`, and static file guardrails.
- [ ] P1: Harden Studio feed ingestion by rejecting localhost/private-network hostnames by default (with explicit env override for trusted local use).
- [ ] P1: Remove `innerHTML` usage in persona rendering to eliminate avoidable DOM injection risk.
- [ ] P1: Add Studio session persistence (source mode, feed URLs, JSON payload, persona/channel/template/max chars) using `localStorage`.
- [ ] P2: Add a repeatable local smoke-check command for Studio API + static serving, and document expected output.
- [ ] P2: Align README/CHANGELOG/UPDATE docs with new Studio safety + persistence behavior and CI fixes.

## Implemented

## Insights

## Notes
- This file is maintained by the autonomous clone loop.
