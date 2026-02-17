# Clone Feature Tracker

## Context Sources
- README and docs
- TODO/FIXME markers in code
- Test and build failures
- Gaps found during codebase exploration

## Locked Cycle Scope (2026-02-17 | Global Cycle 4 Session 1)
- [x] P1: Extract Studio export/download helper seam from `web/app.js` into a dedicated `web/studioExports.js` module with parity tests.
- [x] P1: Add `release:check --json` machine-readable summary output for CI/runtime automation hooks.
- [x] P1: Add `docs:check-links` and `security:grep` scripts and document the local quality-gate workflow.

## Locked Cycle Scope (2026-02-17 | Global Cycle 3 Session 1)
- [x] P1: Add Step 1 per-feed fetch failure drill-down status/details UI backed by structured API diagnostics.
- [x] P1: Add versioned storage migration helper and wire it into Studio startup before persisted-state reads.
- [x] P1: Add focused tests and documentation updates for fetch diagnostics + storage migration behavior.

## Locked Cycle Scope (2026-02-17 | Global Cycle 2 Session 1)
- [x] P1: Extract shared Studio API helper module (`web/studioApi.js`) for response parsing, request-id aware API error shaping, and endpoint wrappers.
- [x] P1: Rewire `web/app.js` API call paths (`loadPersonas`, `fetchItems`, `generatePosts`, `buildAgentFeed`) to use shared wrappers.
- [x] P1: Add focused tests for the extracted API helper module and re-run quality gates.

## Locked Cycle Scope (2026-02-17 | Global Cycle 22 Session 1)
- [x] P1: Add Studio keyboard shortcuts for Step 3/Step 4 high-frequency actions (generate, export/copy, and agent-feed actions) with safe focus guards.
- [x] P1: Add focused shortcut helper tests for keybinding matching and editable-target blocking.
- [x] P2: Add release checklist automation command with changelog guard, quality-gate check, and artifact verification.

## Locked Cycle Scope (2026-02-17 | Global Cycle 23 Session 1)
- [x] P1: Extract Step 1 ingestion helpers out of `web/app.js` into a dedicated module without behavior changes.
- [x] P1: Add focused tests for extracted Step 1 ingestion helpers.
- [x] P2: Harden npm packaging metadata so `npm pack --dry-run` intentionally includes `dist/cli.js`.

## Locked Cycle Scope (2026-02-17 | Global Cycle 1 Session 1)
- [x] P1: Extract Step 1 persistence/session read-write helpers out of `web/app.js` into a dedicated module without behavior changes.
- [x] P1: Add focused tests for extracted persistence/session helper functions.
- [x] P1: Split deep README workflows into `docs/` and keep README quickstart-only.

## Candidate Features To Do
- [x] P2: Add Studio-side URL normalization helper for pasted feeds (strip whitespace/tracking junk safely). (Impact 3, Effort 2, Fit 4, Diff 0, Risk 2, Conf 3)
- [ ] P2: Add optional output schema versioning metadata in JSON/JSONL exports for stable downstream imports. (Impact 3, Effort 2, Fit 3, Diff 1, Risk 1, Conf 3)
- [x] P2: Add `--diagnostics-json` machine-readable dry-run output for CI/pipeline ingestion. (Impact 3, Effort 2, Fit 4, Diff 1, Risk 1, Conf 3)
- [x] P3: Add Studio quick action to insert a valid sample `items.json` payload into Step 1 JSON mode. (Impact 2, Effort 1, Fit 3, Diff 0, Risk 1, Conf 4)
- [ ] P3: Add CLI troubleshooting doc page in `docs/` (invalid input, dry-run, stdin/pipes, private-host fetch limits). (Impact 2, Effort 2, Fit 4, Diff 0, Risk 1, Conf 5)
- [ ] P3: Refactor `web/app.js` into focused modules (state, API client, exporters, UI bindings) to reduce maintenance risk. (Impact 4, Effort 4, Fit 5, Diff 0, Risk 2, Conf 3)
- [x] P2: Extract Studio export/download serialization helpers into `web/studioExports.js` to shrink `web/app.js` hot paths. (Impact 4, Effort 3, Fit 5, Diff 0, Risk 1, Conf 4)
- [x] P2: Extract Studio API payload/error/request helpers into `web/studioApi.js` as the next `web/app.js` modularization slice. (Impact 4, Effort 2, Fit 5, Diff 0, Risk 1, Conf 5)
- [x] P3: Document deep command recipes under `docs/` and keep README constrained to quickstart + links (1-2 screens). (Impact 2, Effort 2, Fit 4, Diff 0, Risk 1, Conf 5)
- [x] P3: Add persona-card search/filter in Studio for large persona packs (50+). (Impact 3, Effort 2, Fit 3, Diff 1, Risk 1, Conf 4)
- [x] P3: Add optional per-persona maxChars override for agent-feed generation workflows. (Impact 3, Effort 3, Fit 3, Diff 1, Risk 2, Conf 3)
- [ ] P3: Add benchmark script for feed parse + generation throughput on 1k-item payloads. (Impact 2, Effort 3, Fit 3, Diff 1, Risk 1, Conf 3)
- [x] P3: Add feed-set migration helper when storage schema changes (with versioned upgrade path). (Impact 2, Effort 2, Fit 3, Diff 0, Risk 1, Conf 3)
- [ ] P3: Add copy-ready "trimmed chars" analytics summary after post edits for QA review. (Impact 2, Effort 2, Fit 3, Diff 1, Risk 1, Conf 3)
- [ ] P3: Add Studio import support for newline-delimited feed URL files to mirror CLI `--urls-file` workflows. (Impact 2, Effort 2, Fit 3, Diff 0, Risk 1, Conf 4)
- [x] P3: Add Step 4 persona-name search/filter to control large timeline views. (Impact 2, Effort 2, Fit 3, Diff 1, Risk 1, Conf 3)
- [x] P3: Add per-feed error detail accordion in Step 1 fetch status for faster debugging. (Impact 3, Effort 3, Fit 4, Diff 0, Risk 2, Conf 3)
- [x] P3: Add filter preset import/export JSON flow for cross-machine Studio setup reuse. (Impact 2, Effort 2, Fit 3, Diff 1, Risk 1, Conf 3)
- [x] P3: Add filter-token chips UI (`keyword`/`site:`) with one-click remove for faster triage edits. (Impact 2, Effort 3, Fit 3, Diff 1, Risk 1, Conf 3)
- [x] P3: Add keyboard shortcut legend dialog (`?`) so power-user actions stay discoverable without doc lookup. (Impact 2, Effort 2, Fit 4, Diff 1, Risk 1, Conf 4)
- [ ] P3: Add confirm-before-download option for bulk draft export when post count exceeds threshold. (Impact 2, Effort 2, Fit 3, Diff 0, Risk 1, Conf 3)
- [ ] P3: Add release command support for `--skip-check` and `--allow-dirty` flags with explicit warnings. (Impact 2, Effort 2, Fit 3, Diff 0, Risk 2, Conf 3)
- [x] P2: Extract Step 1 persistence/session helper module from `web/app.js` and reuse it for feed sets, presets, and snapshots. (Impact 4, Effort 2, Fit 5, Diff 0, Risk 1, Conf 4)
- [x] P2: Add focused tests for storage/session helper edge cases (invalid payloads, storage failures, parser errors). (Impact 3, Effort 2, Fit 5, Diff 0, Risk 1, Conf 4)
- [x] P2: Move deep CLI/release command recipes to `docs/WORKFLOWS.md` and trim README to quickstart + links. (Impact 3, Effort 2, Fit 5, Diff 0, Risk 1, Conf 5)
- [x] P3: Add Studio localStorage key map documentation for safer future migrations. (Impact 2, Effort 1, Fit 4, Diff 0, Risk 1, Conf 4)
- [ ] P3: Add deterministic test fixture for session snapshot round-trips to reduce regressions during ongoing modularization. (Impact 2, Effort 2, Fit 4, Diff 0, Risk 1, Conf 4)
- [ ] P3: Add unit coverage for README/docs command snippets via lightweight smoke script validation. (Impact 2, Effort 3, Fit 3, Diff 1, Risk 2, Conf 3)
- [ ] P3: Add UI empty-state copy polish for Step 1/Step 4 when filters remove all items. (Impact 2, Effort 1, Fit 3, Diff 1, Risk 1, Conf 4)
- [ ] P3: Add API payload schema notes in docs for `/api/fetch`, `/api/generate`, and `/api/agent-feed`. (Impact 2, Effort 2, Fit 4, Diff 0, Risk 1, Conf 4)
- [ ] P3: Add smoke test for README quickstart path (`dev:web` + `/api/personas` + `/api/generate`) to guard onboarding drift. (Impact 3, Effort 2, Fit 4, Diff 0, Risk 1, Conf 4)
- [x] P3: Add lightweight `npm run security:grep` script for repeatable static checks of risky patterns/secrets. (Impact 2, Effort 2, Fit 4, Diff 0, Risk 1, Conf 3)
- [ ] P3: Add export filename timestamp option for drafts/items downloads in Studio. (Impact 2, Effort 2, Fit 3, Diff 1, Risk 1, Conf 3)
- [ ] P3: Add test cache-dir isolation defaults for feed-fetch integration tests to avoid host cache permission failures. (Impact 2, Effort 2, Fit 4, Diff 0, Risk 1, Conf 4)
- [x] P3: Add docs link-check script to prevent README/docs drift and broken local doc references. (Impact 2, Effort 2, Fit 4, Diff 0, Risk 1, Conf 3)
- [x] P3: Add release-check machine-readable summary output (`--json`) for CI automation hooks. (Impact 2, Effort 2, Fit 3, Diff 1, Risk 1, Conf 3)
- [ ] P3: Add Step 1 "copy fetch failures JSON" quick action for support/debug handoff. (Impact 2, Effort 2, Fit 3, Diff 1, Risk 1, Conf 3)
- [ ] P3: Add migration smoke command (`npm run storage:migrate:check`) to validate schema key/version writes in CI-safe mode. (Impact 2, Effort 2, Fit 4, Diff 0, Risk 1, Conf 3)
- [ ] P3: Add API contract docs for `/api/fetch` `failures[]` payload shape and partial-success semantics. (Impact 2, Effort 1, Fit 4, Diff 0, Risk 1, Conf 4)
- [ ] P3: Add focused browser smoke assertion ensuring Step 1 fetch failure details accordion renders for mixed success/failure fixtures. (Impact 3, Effort 2, Fit 4, Diff 0, Risk 2, Conf 3)
- [ ] P3: Add release-check output fixture test to keep `--json` machine output stable for automation clients. (Impact 2, Effort 2, Fit 3, Diff 0, Risk 1, Conf 3)

## Implemented
- [x] 2026-02-17 P1: Extracted Studio export/download serialization helpers from `web/app.js` into `web/studioExports.js` and added focused coverage. Evidence: `web/studioExports.js`, `web/studioExports.d.ts`, `web/app.js`, `test/studioExports.test.ts`; verification: `npm run lint`, `npm run typecheck`, `npm run build`, `npx vitest run test/studioExports.test.ts test/studioApi.test.ts test/studioPrefs.test.ts`.
- [x] 2026-02-17 P1: Added `release:check --json` machine-readable summary output with per-check status + artifact details while preserving existing text mode. Evidence: `scripts/release-check.mjs`, `docs/RELEASE.md`, `docs/WORKFLOWS.md`, `CHANGELOG.md`; verification: `npm run release:check -- --allow-dirty --quality-cmd "npm run lint && npm run typecheck && npm run build"`, `npm run release:check -- --allow-dirty --quality-cmd "npm run lint && npm run typecheck && npm run build" --json`.
- [x] 2026-02-17 P1: Added docs/security hygiene scripts (`docs:check-links`, `security:grep`) with package wiring and documentation. Evidence: `scripts/docs-check-links.mjs`, `scripts/security-grep.mjs`, `package.json`, `README.md`, `docs/RELEASE.md`, `docs/WORKFLOWS.md`; verification: `npm run docs:check-links`, `npm run security:grep`, `npm run lint`.
- [x] 2026-02-17 P1: Added Step 1 per-feed fetch failure diagnostics across server/client/UI (`/api/fetch` `failures` payload + Step 1 drill-down details panel) while preserving summary metrics. Evidence: `src/server.ts`, `web/app.js`, `web/index.html`, `web/styles.css`, `web/fetchDiagnostics.js`, `test/fetchDiagnostics.test.ts`, `test/studioApi.test.ts`, `test/studioPrefs.test.ts`, `test/server.test.ts`; verification: `npm run lint`, `npm run typecheck`, `npm run build`, `npx vitest run test/studioApi.test.ts test/studioPrefs.test.ts test/fetchDiagnostics.test.ts`.
- [x] 2026-02-17 P1: Added versioned Studio storage migration helper with startup wiring and legacy-key upgrade path (`feed-jarvis-studio`, `feed-jarvis-personas`, `feed-jarvis-studio:channel-maxchars` -> `:v1`). Evidence: `web/studioStorage.js`, `web/studioStorage.d.ts`, `web/app.js`, `test/studioStorage.test.ts`; verification: `npm run lint`, `npm run typecheck`, `npm run build`, `npx vitest run test/studioStorage.test.ts`.
- [x] 2026-02-17 P1: Documented Studio storage schema key map and migration behavior in workflows docs. Evidence: `docs/WORKFLOWS.md`; verification: `npm run lint`.
- [x] 2026-02-17 P1: Extracted Studio API helper module (`web/studioApi.js`) and rewired `web/app.js` API flows (`loadPersonas`, `fetchItems`, `generatePosts`, `buildAgentFeed`) to shared wrappers with request-id aware error handling preserved. Evidence: `web/studioApi.js`, `web/studioApi.d.ts`, `web/app.js`, `test/studioApi.test.ts`; verification: `npm run lint`, `npm run typecheck`, `npm run build`, `npx vitest run test/studioApi.test.ts test/studioPrefs.test.ts`, `node dist/cli.js generate --input /tmp/feed-jarvis-cycle2-smoke-items.json --persona Analyst --format jsonl --max-chars 180`.
- [x] 2026-02-17 P1: Moved deep Studio/CLI/release command recipes into `docs/WORKFLOWS.md` and reduced `README.md` to quickstart-first onboarding with targeted docs links. Evidence: `README.md`, `docs/WORKFLOWS.md`; verification: `npm run lint`, `npm run typecheck`, `npm run build`.
- [x] 2026-02-17 P1: Extracted Studio persistence/session storage helper module (`web/studioStorage.js`) and rewired `web/app.js` storage flows (channel max chars, feed/filter/rule presets, session snapshots, persona overrides) to shared helpers with parity behavior. Evidence: `web/studioStorage.js`, `web/studioStorage.d.ts`, `web/app.js`, `test/studioStorage.test.ts`; verification: `npm run lint`, `npm run typecheck`, `npm run build`, `npx vitest run test/studioStorage.test.ts test/studioPrefs.test.ts`.
- [x] 2026-02-17 P2: Added world-signal product update from a dated world-state scan (new `World Signal Editor` persona + snapshot playbook doc with source links). Evidence: `personas/world_signal_editor.md`, `docs/WORLD_STATE_2026-02-17.md`, `README.md`, `CHANGELOG.md`; verification: `npm run lint`, `npm run typecheck`, `npm run build`, `npx vitest run test/personas.test.ts`.
- [x] 2026-02-17 P2: Added Step 1 feed URL normalization helper (host/path cleanup + common tracking-param stripping) with coverage updates. Evidence: `web/step1Ingestion.js`, `web/step1Ingestion.d.ts`, `test/step1Ingestion.test.ts`; verification: `npm run lint`, `npm run typecheck`, `npm run build`, `npx vitest run test/step1Ingestion.test.ts`.
- [x] 2026-02-17 P3: Added Step 1 JSON-mode sample payload insertion (`Insert sample items.json`) for faster first-run setup/testing. Evidence: `web/sampleItems.js`, `web/sampleItems.d.ts`, `web/app.js`, `web/index.html`, `test/sampleItems.test.ts`; verification: `npm run lint`, `npm run typecheck`, `npm run build`, `npx vitest run test/sampleItems.test.ts`.
- [x] 2026-02-17 P3: Added in-app keyboard shortcut legend dialog with `?` toggle, close controls, and shortcut matcher coverage updates. Evidence: `web/index.html`, `web/styles.css`, `web/app.js`, `web/keyboardShortcuts.js`, `test/keyboardShortcuts.test.ts`; verification: `npm run lint`, `npm run typecheck`, `npm run build`, `npx vitest run test/keyboardShortcuts.test.ts`.
- [x] 2026-02-17 P3: Added optional per-persona maxChars overrides for `/api/agent-feed` and Studio Step 4 inputs, including payload persistence and server coverage. Evidence: `web/app.js`, `web/index.html`, `web/studioPrefs.js`, `src/server.ts`, `test/server.test.ts`, `test/studioPrefs.test.ts`; verification: `npm run lint`, `npm run typecheck`, `npm run build`, `npx vitest run test/server.test.ts -t "applies per-persona maxChars overrides in agent feed mode"`, `npx vitest run test/studioPrefs.test.ts`.
- [x] 2026-02-17 P3: Added Step 1 filter-token chips (`include`/`exclude`) with one-click remove actions for faster triage editing. Evidence: `web/filterTokens.js`, `web/filterTokens.d.ts`, `web/app.js`, `web/index.html`, `web/styles.css`, `test/filterTokens.test.ts`; verification: `npm run lint`, `npm run typecheck`, `npm run build`, `npx vitest run test/filterTokens.test.ts`.
- [x] 2026-02-17 P3: Added Step 1 filter-preset import/export JSON flow with deterministic merge behavior for cross-machine Studio setup reuse. Evidence: `web/filterPresets.js`, `web/filterPresets.d.ts`, `web/app.js`, `web/index.html`, `test/filterPresets.test.ts`; verification: `npm run lint`, `npm run typecheck`, `npm run build`, `npx vitest run test/filterPresets.test.ts`.
- [x] 2026-02-17 P3: Added Step 4 agent-feed persona-name filter input and status messaging for large timeline triage, backed by isolated search helper coverage. Evidence: `web/agentFeedSearch.js`, `web/agentFeedSearch.d.ts`, `web/app.js`, `web/index.html`, `web/studioPrefs.js`, `test/agentFeedSearch.test.ts`; verification: `npm run lint`, `npm run typecheck`, `npm run build`, `npx vitest run test/agentFeedSearch.test.ts test/studioPrefs.test.ts`.
- [x] 2026-02-17 P3: Added Studio persona-card search/filter with click-to-select behavior and session persistence for large persona packs. Evidence: `web/personaSearch.js`, `web/app.js`, `web/index.html`, `web/styles.css`, `web/studioPrefs.js`, `test/personaSearch.test.ts`; verification: `npm run lint`, `npm run typecheck`, `npm run build`, `npx vitest run test/personaSearch.test.ts test/studioPrefs.test.ts`.
- [x] 2026-02-17 P2: Added CLI `--diagnostics-json` output for `generate --dry-run` so CI/pipelines can ingest machine-readable diagnostics from stdout. Evidence: `src/cli.ts`, `test/cli.test.ts`, `README.md`, `CHANGELOG.md`; verification: `npm run lint`, `npm run typecheck`, `npm run build`, `npx vitest run test/cli.test.ts -t "reports diagnostics with --dry-run and does not write posts|prints machine-readable diagnostics with --diagnostics-json|requires --dry-run when --diagnostics-json is set"`.
- [x] 2026-02-17 P2: Hardened package publish policy by adding `package.json` `files` whitelist and updating `release:check` to parse `npm pack --dry-run --json` and fail when `dist/cli.js` is excluded. Evidence: `package.json`, `scripts/release-check.mjs`, `docs/RELEASE.md`, `README.md`; verification: `npm run release:check -- --allow-dirty --quality-cmd "npm run lint && npm run typecheck && npm run build"`.
- [x] 2026-02-17 P1: Extracted Step 1 ingestion helper logic into `web/step1Ingestion.js` and rewired `web/app.js` to use shared exports (`normalizeUrls`, `safeHttpUrl`, JSON payload parse/summary, `toItemsJson`). Evidence: `web/step1Ingestion.js`, `web/step1Ingestion.d.ts`, `web/app.js`, `test/step1Ingestion.test.ts`; verification: `npm run lint`, `npm run typecheck`, `npm run build`, `npx vitest run test/step1Ingestion.test.ts`.
- [x] 2026-02-17 P1: Added Studio keyboard shortcuts for Step 3/Step 4 actions (`generate`, `copy/export drafts`, `build/copy/download feed`) with editable-target guards and new shortcut helper module/tests. Evidence: `web/keyboardShortcuts.js`, `web/app.js`, `web/index.html`, `web/styles.css`, `test/keyboardShortcuts.test.ts`; verification: `npx vitest run test/keyboardShortcuts.test.ts`, `npm run lint`, `npm run typecheck`, `npm run build`.
- [x] 2026-02-17 P2: Added release checklist automation via `npm run release:check` with changelog guard, quality-command execution, artifact checks, and docs/Makefile wiring. Evidence: `scripts/release-check.mjs`, `package.json`, `Makefile`, `docs/RELEASE.md`; verification: `npm run release:check -- --allow-dirty --quality-cmd "npm run lint && npm run typecheck && npm run build"`.
- [x] 2026-02-13 P1: Added `/api/fetch` retry/latency diagnostics in response summary (`retryAttempts`, `retrySuccesses`, `durationMs`, `slowestFeedMs`) for large-run troubleshooting. Evidence: `src/lib/feedFetch.ts`, `src/server.ts`, `web/studioPrefs.js`, `test/server.test.ts`, `test/studioPrefs.test.ts`; verification: `npm run lint`, `npm run typecheck`, `npm run build`, `npx vitest run test/studioPrefs.test.ts`.
- [x] 2026-02-13 P1: Added API request IDs in error payloads and `x-request-id` response headers; Studio now surfaces request IDs in API error text. Evidence: `src/server.ts`, `web/app.js`, `test/server.test.ts`; verification: `npm run lint`, `npm run typecheck`, `npm run build`, `npx vitest run test/server.test.ts` (blocked in this sandbox by `listen EPERM`).
- [x] 2026-02-13 P2: Added server tests for fetch diagnostics + request-id behavior and kept fetch retry unit coverage green with writable cache-dir override. Evidence: `test/server.test.ts`, `test/feedFetch.test.ts`; verification: `FEED_JARVIS_CACHE_DIR=/tmp/feed-jarvis-cache-test npx vitest run test/feedFetch.test.ts`.
- [x] 2026-02-13 P1: Added CLI `generate --dry-run` diagnostics (`valid/invalid`, duplicate URLs, estimated truncation count) with no output writes. Evidence: `src/cli.ts`, `README.md`, `CHANGELOG.md`, `test/cli.test.ts`; verification: `npm run lint`, `npm run typecheck`, `npm run build`, `npx vitest run test/cli.test.ts -t "reports diagnostics with --dry-run and does not write posts|handles EPIPE cleanly across output formats"`, `node dist/cli.js generate --input /tmp/feed-jarvis-cycle4-items.json --persona Analyst --max-chars 60 --dry-run --format csv`.
- [x] 2026-02-13 P2: Added CLI regression coverage for output pipe-close (`EPIPE`) behavior across `text/json/jsonl/csv` and updated CLI tests to use `node --import tsx` execution in sandbox-restricted environments. Evidence: `test/cli.test.ts`; verification: `npx vitest run test/cli.test.ts -t "reports diagnostics with --dry-run and does not write posts|handles EPIPE cleanly across output formats"`.
- [x] 2026-02-13 P2: Added session snapshot sanitization and edge-case coverage (invalid JSON snapshots, stale keys dropped, partial payload preserved). Evidence: `web/studioPrefs.js`, `web/studioPrefs.d.ts`, `web/app.js`, `test/studioPrefs.test.ts`; verification: `npx vitest run test/studioPrefs.test.ts`, `npm run lint`, `npm run typecheck`, `npm run build`.
- [x] 2026-02-13 P1: Added Studio filter presets for Step 1 triage (save/load/delete named include/exclude/min-title settings) with local persistence and session restore support. Evidence: `web/filterPresets.js`, `web/filterPresets.d.ts`, `web/app.js`, `web/index.html`, `test/filterPresets.test.ts`; verification: `npm run lint`, `npm run typecheck`, `npm run build`, `npx vitest run test/filterPresets.test.ts test/filters.test.ts`.
- [x] 2026-02-13 P1: Added per-item "Mute domain" quick action in Step 1 preview that appends `site:<domain>` exclusions and re-filters immediately. Evidence: `web/app.js`, `web/index.html`, `web/styles.css`, `web/filters.js`, `test/filters.test.ts`; verification: `npm run lint`, `npm run typecheck`, `npm run build`, `npx vitest run test/filterPresets.test.ts test/filters.test.ts`.
- [x] 2026-02-13 P1: Added filter matching support for explicit `site:`/`domain:` tokens (subdomain-aware) to harden domain-level triage muting. Evidence: `web/filters.js`, `test/filters.test.ts`; verification: `npx vitest run test/filters.test.ts`.
- [x] 2026-02-13 P1: Extended browser E2E smoke to cover Step 4 agent feed (`build -> copy -> download`) in the existing Playwright flow. Evidence: `scripts/e2e-web.ts`; verification: `npm run lint`, `npm run typecheck`, `npm run build`, `npm run e2e:web` (blocked in this sandbox by `listen EPERM`), `node dist/cli.js generate --input /tmp/feed-jarvis-smoke-items-cycle2.json --persona Analyst --format jsonl --max-chars 180`.
- [x] 2026-02-13 P2: Added deterministic Step 4 assertion depth for rendered feed cards, copy status, and downloaded JSON payload structure (`meta` + `feed`). Evidence: `scripts/e2e-web.ts`; verification: `npm run lint`, `npm run typecheck`, `npm run build`, `npm test` (sandbox `listen EPERM` / cache-path `EPERM`), `npx vitest run test/concurrency.test.ts test/studioPrefs.test.ts test/feedSets.test.ts`.
- [x] 2026-02-13 P1: Added bounded configurable fetch concurrency across CLI + Studio/API (`--fetch-concurrency`, `FEED_JARVIS_FETCH_CONCURRENCY`, `fetchConcurrency` request field) using shared worker-limited execution. Evidence: `src/lib/concurrency.ts`, `src/cli.ts`, `src/server.ts`, `web/app.js`, `web/index.html`, `web/studioPrefs.js`; verification: `npm run lint`, `npm run typecheck`, `npm run build`, `npx vitest run test/concurrency.test.ts test/studioPrefs.test.ts`.
- [x] 2026-02-13 P1: Added concurrency behavior tests for CLI and server fetch flows with max in-flight assertions. Evidence: `test/cli.test.ts`, `test/server.test.ts`, `test/concurrency.test.ts`; verification: `npx vitest run test/concurrency.test.ts test/studioPrefs.test.ts` (full network/listen integration tests blocked in this sandbox by `listen EPERM`).
- [x] 2026-02-12 P1: Added browser-level Studio E2E smoke for critical flow (`fetch -> generate -> export`) with deterministic feed fixtures. Evidence: `scripts/e2e-web.ts`, `package.json`, `.github/workflows/ci.yml`; verification: `npm run lint`, `npm run typecheck`, `npm run build`, `npm run e2e:web` (environment blocked in this sandbox: `listen EPERM`), `npx playwright install chromium`.
- [x] 2026-02-12 P2: Added browser-driven export smoke assertions for `.txt`, `.jsonl`, `.csv` payloads and wired them into CI. Evidence: `scripts/e2e-web.ts`, `.github/workflows/ci.yml`, `CHANGELOG.md`, `README.md`; verification: `npm run lint`, `npm run typecheck`, `npm run build`, `npm run e2e:web` (environment blocked in this sandbox: `listen EPERM`).
- [x] 2026-02-12 P1: Studio feed-set OPML import/export (local-only) with dedupe-safe parsing and collision-safe naming during import. Evidence: `web/feedSets.js`, `web/feedSets.d.ts`, `web/app.js`, `web/index.html`, `test/feedSets.test.ts`; verification: `npx vitest run test/feedSets.test.ts`, `npm run lint`, `npm run typecheck`, `npm run build`.
- [x] 2026-02-12 P1: Studio live over-limit draft editing guidance (`current/max` + warning + one-click trim). Evidence: `web/postEditing.js`, `web/postEditing.d.ts`, `web/app.js`, `web/styles.css`, `test/postEditing.test.ts`; verification: `npx vitest run test/postEditing.test.ts`, `npm run lint`, `npm run typecheck`, `npm run build`, `node dist/cli.js generate --input /tmp/feed-jarvis-smoke-items.json --persona Analyst --format jsonl --max-chars 160`.
- [x] 2026-02-12 P1: Feed fetcher bounded retry/backoff for transient failures (network/timeouts + HTTP 408/429/5xx), honoring existing timeout and stale-cache fallback behavior. Evidence: `src/lib/feedFetch.ts`, `test/feedFetch.test.ts`; verification: `FEED_JARVIS_CACHE_DIR=/tmp/feed-jarvis-cache-test npx vitest run test/feedFetch.test.ts`, `npm run lint`, `npm run typecheck`, `npm run build`.
- [x] 2026-02-12 P1: CLI `fetch --urls-file <path>` support for newline-delimited URL ingestion with preserved allowlist + dedupe flow. Evidence: `src/cli.ts`, `test/cli.test.ts`, `README.md`, `CHANGELOG.md`; verification: `node dist/cli.js fetch --urls-file /tmp/feed-jarvis-urls.txt --allow-host example.org --no-cache --timeout-ms 1000` (expected network-restricted failure in sandbox after parsing file input), `npm run lint`, `npm run typecheck`, `npm run build`.
- [x] 2026-02-12 P1: Studio pasted JSON URL validation (`http/https` only) plus server-side generation guardrails for non-http(s) URLs. Evidence: `web/app.js`, `web/index.html`, `src/server.ts`, `test/server.test.ts`, `README.md`, `CHANGELOG.md`; verification: `npm run lint`, `npm run typecheck`, `npm run build`.
- [x] 2026-02-11 P1: Studio: add local-only rule presets (save/load/delete) for optional text rules (`prepend`/`append`/`hashtags`/UTM). Evidence: `web/index.html`, `web/app.js`, `web/styles.css`, `web/rulePresets.js`, `test/rulePresets.test.ts`; verification: `make check`, `npm run smoke:web`.
- [x] 2026-02-11 P2: CLI: add `fetch --opml <path>` support for local OPML feed URL ingestion with existing host allowlist enforcement. Evidence: `src/cli.ts`, `src/lib/opml.ts`, `test/opml.test.ts`, `test/cli.test.ts`; verification: `make check`, local smoke command (CLI OPML fetch via local HTTP server).
- [x] 2026-02-10 P2: CLI: `generate --stats` prints post counts + character-length distribution to stderr. Evidence: `src/cli.ts`, `test/cli.test.ts`; verification: `make check`.
- [x] 2026-02-10 P1: Studio: save/load named feed sets (local-only presets) to speed up repeat workflows. Evidence: `web/index.html`, `web/app.js`, `web/styles.css`, `web/feedSets.js`, `test/feedSets.test.ts`; verification: `make check`, `npm run smoke:web`.
- [x] 2026-02-10 P1: Studio: add "Download items.json" (and copy-to-clipboard) export for the filtered item set to bridge Studio to CLI workflows. Evidence: `web/index.html`, `web/app.js`, `web/styles.css`; verification: `make check`.
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
- Export/download logic is a low-risk `web/app.js` extraction seam because serialization is pure and can be validated with focused unit tests.
- Release automation is easier to integrate with CI/runtime tooling when check outcomes are machine-readable (`--json`) instead of console text only.
- Lightweight docs/security scripts are useful release gates only when high-noise patterns are scoped carefully (for example, avoiding placeholder-env and regex method-call false positives).
- Structured `/api/fetch` failure payloads (`failures[]`) let Step 1 show partial-success diagnostics without regressing existing summary cards.
- Storage migrations are safest when schema versioning is explicit and startup migrations run before any read path touches user state.
- Storage/session helper extraction from `web/app.js` is low-risk when APIs accept `StorageLike` and parser callbacks; this keeps browser wiring simple while enabling isolated tests.
- API payload parsing/error shaping should stay in a shared client helper (`web/studioApi.js`) so request-id handling and non-JSON fallback behavior remain consistent across personas/fetch/generate/agent-feed flows.
- README quality improves when it only covers quickstart and links, while deep command recipes stay in a dedicated docs page that can grow without onboarding bloat.
- Shortcut handling should be centralized in a helper that explicitly blocks editable targets, otherwise keybindings become brittle as UI complexity grows.
- `npm pack --dry-run` can fail in constrained environments due global cache permissions; release checks should isolate npm cache paths for deterministic behavior.
- API request IDs in both response headers and JSON error payloads make Studio-reported failures directly traceable in logs and support workflows.
- Retry/latency diagnostics (`retryAttempts`, `retrySuccesses`, `durationMs`, `slowestFeedMs`) are most useful when formatted into one status line rather than hidden as raw JSON.
- CLI tests are more resilient in sandboxed environments when launched as `node --import tsx src/cli.ts` instead of invoking the `tsx` binary directly (which may require IPC `listen` permissions).
- A no-write `--dry-run` path gives high-signal preflight diagnostics without changing generation/export behavior for strict production runs.
- `site:<domain>` exclusion tokens give an explicit, low-ambiguity path for domain muting without changing existing free-text filter UX.
- Saving filter presets closes a repeat-workflow parity gap and reduces setup friction for high-frequency feed triage sessions.
- Step 4 UI actions (`build -> copy -> download`) now have deterministic browser assertions, reducing regression blind spots between timeline rendering and export/copy wiring.
- Bounded concurrency materially reduces peak in-flight requests on large URL batches while preserving output ordering and dedupe behavior.
- Browser-level coverage is now practical and deterministic by stubbing feed fetches in a local test server and driving real DOM interactions via Playwright.
- Export verification should stay browser-driven because it catches regressions in both payload construction and download wiring.
- OPML import/export is now parity-complete in Studio for local feed-set interoperability and migration.
- Live over-limit feedback in draft editing materially reduces manual QA friction for channel-specific `maxChars` constraints.
- Bounded retries should only apply to transient classes (network/timeouts + 408/429/5xx); 4xx validation errors should fail fast with no retry.
- URL-file ingestion provides high-value interoperability with near-zero UX overhead and keeps the same allowlist/safety posture as direct URL inputs.
- Studio JSON ingestion quality improved by validating URL schemes client-side and server-side, preventing malformed links from reaching exports.
- Local `make check` output matched historical failing GitHub Actions runs exactly, so Biome drift was the root CI failure.
- Studio fetch security needed a stricter default than CLI: server-side requests can be triggered from browser clients, so private-host blocking now defaults to on for Studio.
- Disk cache can affect integration tests if URLs are reused; tests should prefer unique URLs or isolated cache settings.
- Gap map (cycle1 update): Missing = browser E2E for Step 4 agent feed path; Weak = browser assertion depth beyond critical Step 3 flow; Parity = local-first feed grouping with OPML import/export, filters/rules, metadata exports, and Step 3 E2E; Differentiator = deterministic local-first workflow with strong private-host safeguards.
- Market scan (untrusted web, cycle1): baseline feed-to-social UX consistently includes reusable content rules and lightweight feed automation/import paths; OPML support and reusable text rules are common interoperability/efficiency expectations.
- Market scan (untrusted web): RSS-to-social tools emphasize (1) rules/filters (keywords, duplicates), (2) configurable post text (prepend/append, tags/UTMs), (3) queues/scheduling with optional review, and (4) downstream automation/export to schedulers.
- Market scan (untrusted web, cycle4): auto-publish tools highlight scheduler queue integration and feed-to-channel mapping, with copy review as a differentiator for teams.
- Market scan (untrusted web, cycle5): auto-publish workflows commonly support per-feed post text customization (including hashtags) and basic tracking via UTM parameters, plus downstream scheduling/approval flows; our Studio now covers the text customization + UTM parity while staying local-first.
- Market scan (untrusted web, cycle1): RSS-to-social automation tools emphasize (1) reusable feed groupings, (2) fast filtering/muting to control noise, (3) schedulers/queues, and (4) export/automation bridges (CSV/Zapier/Buffer) plus basic tracking (UTM). This session focuses on local-first feed set presets + a clean "items.json" bridge to the CLI.
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
  - https://zapier.com/blog/rss-to-buffer/
  - https://help.buffer.com/en/articles/3056329-how-to-automate-your-posts-from-rss-feeds

## Notes
- This file is maintained by the autonomous clone loop.
