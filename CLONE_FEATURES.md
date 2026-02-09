# Clone Feature Tracker

## Context Sources
- README and docs
- TODO/FIXME markers in code
- Test and build failures
- Gaps found during codebase exploration

## Candidate Features To Do
- [ ] P2: Studio: show fetch summary details (cache/network/deduped) in the UI after loading items.
- [ ] P2: Add browser-level E2E coverage for Studio critical flow (fetch -> generate -> export) in CI (Playwright).
- [ ] P3: Studio: save/load named feed sets (local-only presets) for faster repeat workflows.
- [ ] P3: Studio: allow per-channel default `maxChars` presets to be edited and saved (local-only).
- [ ] P3: CLI: add `generate --format csv` with metadata columns (persona/channel/template/title/url/post) for scheduler import.
- [ ] P3: Implement optional LLM-backed generation behind an explicit `--llm` opt-in flag (roadmap item).

## Implemented
- [x] 2026-02-09 P1: Studio: import/export personas (JSON) from the UI (local-only), persisted in `localStorage`, and applied during generation. Evidence: `web/index.html`, `web/app.js`, `test/server.test.ts`; verification: `make check`, `npm run smoke:web`.
- [x] 2026-02-09 P1: Studio: enrich exports (CSV + JSONL) with source metadata (title/url) plus persona/channel/template; snapshot generation inputs for aligned export; show source title/link above drafts. Evidence: `web/index.html`, `web/app.js`, `web/styles.css`, `README.md`, `CHANGELOG.md`; verification: `make check`, `npm run smoke:web`.
- [x] 2026-02-09 P1: Studio: added basic item filters (include/exclude keywords + minimum title length) and applied them before generation/export; persisted in `localStorage`; added unit coverage for the filter logic. Evidence: `web/index.html`, `web/app.js`, `web/filters.js`, `test/filters.test.ts`; verification: `make check`, `npm run smoke:web`.
- [x] 2026-02-09 P1: Studio UI: hardened API error handling for unknown thrown values and non-JSON responses so statuses remain actionable. Evidence: `web/app.js`; verification: `make check`, `npm run smoke:web`.
- [x] 2026-02-09 P2: Studio UI: fixed header "GitHub" links to point at this repository. Evidence: `web/index.html`, `web/about.html`; verification: `npm run lint`.
- [x] 2026-02-09 P0: Fixed failing "Dependabot Updates" GitHub Actions runs by granting required default `GITHUB_TOKEN` workflow permissions at the repo level and pinning `ci.yml` to least-privilege permissions. Evidence: `.github/workflows/ci.yml`, repo Actions workflow setting; verification: `gh api /repos/sarveshkapre/feed-jarvis/actions/permissions/workflow`.
- [x] 2026-02-09 P0: Added `npm run smoke:web` to CI to catch Studio regressions beyond unit/integration tests. Evidence: `.github/workflows/ci.yml`; verification: `npm run smoke:web`.
- [x] 2026-02-09 P1: Extended private-network fetch protection with DNS resolution checks (blocks hostnames resolving to private/local IP ranges). Evidence: `src/lib/feedFetch.ts`, `test/feedFetch.test.ts`; verification: `make check`.
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
  - https://feedly.helpscoutdocs.com/article/345-mute-filters
  - https://zapier.com/apps/buffer/integrations/rss
  - https://support.buffer.com/article/613-automating-rss-feeds-using-feedly-and-zapier
  - https://www.make.com/en/integrations/rss
  - https://rss.app/blog/how-to-filter-rss-feeds

## Notes
- This file is maintained by the autonomous clone loop.
