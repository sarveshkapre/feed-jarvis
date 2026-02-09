# Clone Feature Tracker

## Context Sources
- README and docs
- TODO/FIXME markers in code
- Test and build failures
- Gaps found during codebase exploration

## Candidate Features To Do
- [ ] P0 (Selected): Fix failing "Dependabot Updates" GitHub Actions runs by granting required `GITHUB_TOKEN` permissions at the repo level and pinning our workflows to least-privilege `permissions:` blocks.
- [ ] P0 (Selected): Add `npm run smoke:web` to CI to catch Studio regressions beyond unit/integration tests.
- [ ] P1 (Selected): Extend private-network fetch protection with DNS resolution checks (current guard covers literal hostnames/IPs); add tests that cover hostname -> private IP resolution.
- [ ] P2: Add browser-level E2E coverage for Studio critical flow (fetch -> generate -> export) in CI.
- [ ] P2: Studio UI: harden error handling to safely render unknown thrown values and non-JSON API errors.
- [ ] P2: Studio: add basic feed item filtering (include/exclude keywords + "min title length") before generation/export.
- [ ] P3: Studio: import/export personas (JSON) from the UI (local-only).
- [ ] P3: Implement optional LLM-backed generation behind an explicit `--llm` opt-in flag (roadmap item).

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
- Market scan (untrusted web): reader/automation tools emphasize (1) rules/filters (keywords, duplicates), (2) summaries/highlights, and (3) downstream automation/export to schedulers.
- References (untrusted web):
  - https://www.inoreader.com/blog/2026/01/save-time-with-automations.html
  - https://feedly.com/new-features/posts/feedly-ai-and-summarization
  - https://zapier.com/apps/buffer/integrations/rss
  - https://support.buffer.com/article/613-automating-rss-feeds-using-feedly-and-zapier

## Notes
- This file is maintained by the autonomous clone loop.
