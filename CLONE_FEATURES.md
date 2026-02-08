# Clone Feature Tracker

## Context Sources
- README and docs
- TODO/FIXME markers in code
- Test and build failures
- Gaps found during codebase exploration

## Candidate Features To Do
- [ ] P1: Implement optional LLM-backed generation behind an explicit `--llm` opt-in flag (roadmap item).
- [ ] P1: Extend private-network fetch protection with DNS resolution checks (current guard covers literal hostnames/IPs).
- [ ] P2: Add browser-level E2E coverage for Studio critical flow (fetch -> generate -> export) in CI.

## Implemented
- [x] 2026-02-08 P0: Restored CI green by fixing Biome lint/format violations. Evidence: `src/server.ts`, `web/app.js`, `web/styles.css`; verification: `make check`.
- [x] 2026-02-08 P0: Added server integration tests for key Studio APIs. Evidence: `test/server.test.ts`; verification: `npm test` (includes 5 server tests).
- [x] 2026-02-08 P1: Hardened Studio feed ingestion by blocking localhost/private-network hosts by default with explicit override. Evidence: `src/lib/feedFetch.ts`, `src/server.ts`; verification: `test/feedFetch.test.ts`, `test/server.test.ts`.
- [x] 2026-02-08 P1: Removed `innerHTML` persona rendering path to reduce DOM injection risk. Evidence: `web/app.js`.
- [x] 2026-02-08 P1: Added Studio session persistence via `localStorage` for source mode and form settings. Evidence: `web/app.js`.
- [x] 2026-02-08 P1: Fixed source-mode toggle scoping so channel buttons no longer affect feed/json panel visibility. Evidence: `web/app.js`.
- [x] 2026-02-08 P2: Added repeatable Studio smoke check command. Evidence: `scripts/smoke-web.ts`, `package.json`, `PROJECT.md`; verification: `npm run smoke:web`.
- [x] 2026-02-08 P2: Synced docs with shipped behavior changes. Evidence: `README.md`, `CHANGELOG.md`, `UPDATE.md`.

## Insights
- Local `make check` output matched historical failing GitHub Actions runs exactly, so Biome drift was the root CI failure.
- Studio fetch security needed a stricter default than CLI: server-side requests can be triggered from browser clients, so private-host blocking now defaults to on for Studio.
- Disk cache can affect integration tests if URLs are reused; tests should prefer unique URLs or isolated cache settings.

## Notes
- This file is maintained by the autonomous clone loop.
