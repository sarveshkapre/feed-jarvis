# Clone Feature Tracker

## Context Sources
- README and docs
- TODO/FIXME markers in code
- Test and build failures
- Gaps found during codebase exploration

## Candidate Features To Do
- [ ] P2: Add browser-level E2E coverage for Studio critical flow (fetch -> generate -> export) in CI (Playwright).
- [ ] P2: Studio: save/load named feed sets (local-only presets) for faster repeat workflows.
- [ ] P2: Studio: add "Download items.json" export for the filtered item set (so users can move between Studio and CLI easily).
- [ ] P3: Studio: optional rule presets (save/load) for repeatable prepend/append/hashtags/UTM settings (local-only).
- [ ] P3: Studio: import/export feed sets as OPML (local-only) for interoperability with RSS readers.
- [ ] P3: CLI: add `generate --stats` to print post counts + length distribution to stderr for quick validation.
- [ ] P3: CLI: allow `fetch` from an OPML file (local-only) to batch feed URLs while preserving the allowlist model.
- [ ] P3: Implement optional LLM-backed generation behind an explicit `--llm` opt-in flag (roadmap item).

## Implemented
- [x] 2026-02-10 P1: Studio: optional generation text rules (prepend/append/hashtags) + basic UTM tagging, persisted locally and applied while always honoring `maxChars`. Evidence: `web/index.html`, `web/app.js`, `web/styles.css`, `src/lib/posts.ts`, `src/server.ts`, `test/posts.test.ts`, `test/server.test.ts`; verification: `make check`, `npm run smoke:web`.
- [x] 2026-02-10 P1: CLI: `generate --format csv` with metadata columns (persona/channel/template/title/url/post) plus `--channel`/`--template` and rule/UTM parity. Evidence: `src/cli.ts`, `src/lib/posts.ts`, `test/cli.test.ts`; verification: `make check` (includes CLI stdin test), manual: `tsx src/cli.ts generate --format csv ...`.
- [x] 2026-02-09 P1: Studio: remember per-channel `maxChars` (local-only) so switching channels restores the last-used value per channel. Evidence: `web/app.js`, `web/studioPrefs.js`, `test/studioPrefs.test.ts`; verification: `make check`, `npm run smoke:web`.
- [x] 2026-02-09 P1: Studio: show richer fetch summary after loading items (feeds, cache vs network, deduped, trimmed-to-max). Evidence: `web/app.js`, `src/server.ts`, `test/server.test.ts`; verification: `make check`, `npm run smoke:web`.
- [x] 2026-02-09 P2: Studio server: return a clearer `/api/fetch` summary (separate `deduped` vs `limited`) + add test coverage. Evidence: `src/server.ts`, `test/server.test.ts`; verification: `make check`.
- [x] 2026-02-09 P0: CI: bump CodeQL Action to `v4` to remove deprecation warning and keep analysis future-proof. Evidence: `.github/workflows/codeql.yml`; verification: `gh run watch 21830511384 --exit-status`.
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
- Market scan (untrusted web): RSS-to-social tools emphasize (1) rules/filters (keywords, duplicates), (2) configurable post text (prepend/append, tags/UTMs), (3) queues/scheduling with optional review, and (4) downstream automation/export to schedulers.
- Market scan (untrusted web, cycle4): auto-publish tools highlight scheduler queue integration and feed-to-channel mapping, with copy review as a differentiator for teams.
- Market scan (untrusted web, cycle5): auto-publish workflows commonly support per-feed post text customization (including hashtags) and basic tracking via UTM parameters, plus downstream scheduling/approval flows; our Studio now covers the text customization + UTM parity while staying local-first.
- References (untrusted web):
  - https://www.inoreader.com/blog/2026/01/save-time-with-automations.html
  - https://feedly.com/new-features/posts/feedly-ai-and-summarization
  - https://feedly.helpscoutdocs.com/article/345-mute-filters
  - https://zapier.com/apps/buffer/integrations/rss
  - https://support.buffer.com/article/613-automating-rss-feeds-using-feedly-and-zapier
  - https://help.metricool.com/en/article/how-to-automate-posts-with-an-rss-feed-1m6ahtz/
  - https://dlvrit.com/
  - https://www.make.com/en/integrations/rss
  - https://rss.app/blog/how-to-filter-rss-feeds
  - https://help.hootsuite.com/hc/en-us/articles/204598580-Auto-publish-posts-from-RSS-feeds
  - https://help.missinglettr.com/article/392-how-do-i-change-my-default-utm-settings
  - https://help.missinglettr.com/article/386-how-do-i-add-hashtags-to-my-default-post-content-settings
  - https://support.sproutsocial.com/hc/en-us/articles/20299161205645-How-do-I-use-Automated-Feed-Publishing-on-the-Professional-and-Advanced-Plans
  - https://missinglettr.com/features/drip-campaigns/

## Notes
- This file is maintained by the autonomous clone loop.
