# Product Roadmap

## Product Goal
- Keep feed-jarvis production-ready. Current focus: Feed Jarvis Studio (`feed-jarvis`). Find the highest-impact pending work, implement it, test it, and push to main.

## Good Product Phase Status
- Status: `No` (checkpoint run on 2026-02-17).
- Why not yet: core local-first workflows are strong and Cycle 6 closed select-binding + fetch-contract gaps, but broader `web/app.js` decomposition and CI-safe listen/cache isolation still remain before M5 is complete.

## Definition Of Done
- Core Studio + CLI workflows are complete for repeated daily use.
- High-value parity features are shipped for feed ingestion, filtering, generation, and export.
- No open critical reliability or data-loss issues in fetch/generate flows.
- Lint/typecheck/test/build and smoke checks pass locally and are documented.
- README/docs/tracker files reflect actual behavior and remaining gaps.

## Milestones
- M1 Foundation (completed): local-first Studio + CLI baseline, tests and CI checks.
- M2 Core Features (completed): persona/rules/filter/export features, OPML fetch in CLI, agent feed, GPT mode.
- M3 Reliability + Interop (completed): fetch robustness, ingestion compatibility, validation guardrails.
- M4 UX Polish + Throughput (current): faster review/edit loops, richer edit guidance, keyboard efficiency.
- M5 Release Readiness: end-to-end coverage, release automation, docs hardening.

## Current Milestone
- M4 UX Polish + Throughput

## Session Goal Checkpoint (2026-02-17 | Global Cycle 6 Session 1)
- Goal: Reduce `web/app.js` maintenance risk by extracting the named select/state binding seam and harden `/api/fetch` failure payload reliability with explicit contract docs plus smoke assertions.
- Success criteria:
  - Feed set/filter preset/rule preset select synchronization logic is extracted from `web/app.js` into a focused helper module with parity tests.
  - `/api/fetch` `failures[]` payload contract and partial-success semantics are documented in `docs/`.
  - Local smoke checks validate a partial-success `/api/fetch` path where `items[]` and `failures[]` coexist.
  - Lint/typecheck/build + targeted tests/docs/security/smoke commands pass (or are explicitly blocked with evidence).
- Non-goals:
  - New APIs, schedulers, or hosted publishing integrations.
  - Broad visual redesign outside touched Step 1 controls/docs.
  - Full `web/app.js` modularization in one pass.

## Product Phase Checkpoint (2026-02-17 | Global Cycle 6 Session 1)
- Prompt: "Are we in a good product phase yet?" -> `No`.
- Best-in-market references (untrusted web, bounded scan 2026-02-17):
  - Feedly AI + summarize workflow signal (`https://feedly.com/new-features/posts/feedly-ai-and-summarization`).
  - RSS.app filtering expectations (`https://help.rss.app/en/articles/10271103-how-to-filter-rss-feeds`).
  - Buffer RSS automation operational baseline (`https://support.buffer.com/article/613-automating-rss-feeds-using-feedly-and-zapier`).
  - Inoreader feed monitoring/reliability baseline (`https://www.inoreader.com/blog/2025/11/monitoring-feeds.html`).
  - Inoreader automation throughput signal (`https://www.inoreader.com/blog/2026/01/save-time-with-automations.html`).
- Core expected capabilities in this segment:
  - Maintainable high-churn UI bindings (preset/select/action flows) with low refactor risk.
  - Explicit API failure contracts for troubleshooting and support handoff.
  - Repeatable smoke checks that verify mixed-success fetch flows.
- Parity gap map:
  - Missing: documented `/api/fetch` `failures[]` contract semantics.
  - Weak: named select/state bindings are still duplicated in `web/app.js`.
  - Weak: smoke checks currently focus happy-path fetch/generate and do not assert mixed success/failure fetch payloads.
  - Parity: feed ingestion/filtering/rules presets/export formats/retries/concurrency.
  - Differentiator: local-first multi-persona workflow with strict private-host safety defaults.

## Pending Feature Checkpoint (2026-02-17 | Global Cycle 6 Session 1)
- Prompt: "What features are still pending?"
- `PRODUCT_ROADMAP.md` pending highlights:
  - Next `web/app.js` state/UI seam extraction.
  - `/api/fetch` failure payload contract docs and smoke-depth hardening.
  - CI-safe listen/cache isolation defaults for broader integration coverage.
- `CLONE_FEATURES.md` pending highlights:
  - API payload contract docs for `/api/fetch` and focused browser/server smoke assertions.
  - Remaining modularization slices and release/smoke stability fixtures.

## Prioritized Session Tasks (2026-02-17 | Global Cycle 6 Session 1)
- Selected first (score: impact/effort/strategic-fit/differentiation/risk/confidence):
  1. Extract named select/state bindings from `web/app.js` into a focused helper module + tests (5/3/5/0/1/4).
  2. Add `/api/fetch` failure payload contract docs (4/1/5/0/1/5).
  3. Extend smoke checks with partial-success fetch assertion coverage (4/2/5/0/1/4).
- Additional ranked candidates (not locked this session):
  1. Add CI-safe test cache/listen isolation defaults (`FEED_JARVIS_CACHE_DIR`, host/port strategy) for integration reliability (4/3/4/0/2/3).
  2. Add release-check JSON output fixture test for output-stability guarantees (3/2/4/0/1/4).
  3. Add lightweight migration smoke command for storage schema keys (3/2/4/0/1/3).
  4. Continue next `web/app.js` extraction seam (persona card/search + session listeners) (4/4/5/0/2/3).

## Locked Cycle Scope (2026-02-17 | Global Cycle 6 Session 1)
- [x] P1: Extract feed/filter/rule named select binding helpers from `web/app.js` with parity tests.
- [x] P1: Document `/api/fetch` `failures[]` payload contract and partial-success behavior.
- [x] P1: Add partial-success `/api/fetch` smoke assertion coverage and re-run quality gates.

## Product Phase Checkpoint (2026-02-17 | Global Cycle 6 Session 1 Post-Ship)
- Prompt: "Are we in a good product phase yet?" -> `No`.
- Outcome after this session:
  - Extracted the named select/state binding seam (`web/namedSelectBindings.js`) and removed duplicate select-refresh logic from `web/app.js`.
  - Added explicit `/api/fetch` payload contract docs in `docs/API_CONTRACTS.md` and linked them from README/workflow docs.
  - Extended smoke coverage with partial-success `/api/fetch` contract assertions and added unit coverage (`test/fetchContract.test.ts`) for smoke assertion logic.
- Remaining highest-value gaps:
  - Continue `web/app.js` seam extraction (persona/session/event binding slices).
  - Add CI-safe listen/cache isolation defaults to unblock broader integration and smoke execution in constrained environments.
  - Add output fixture stability coverage for release/smoke machine-readable contracts (`release:check --json`).

## Session Goal Checkpoint (2026-02-17 | Global Cycle 5 Session 1)
- Goal: Complete a targeted cleanup/refactor pass by extracting the next Step 1 UI/status seam from `web/app.js`, shipping the pending fetch-failure JSON handoff action, and hardening snapshot test coverage.
- Success criteria:
  - Fetch-failure detail rendering/serialization logic moves to a focused `web/` helper module with parity behavior.
  - Step 1 exposes a one-click "copy fetch failures JSON" support/debug action.
  - Deterministic session snapshot round-trip coverage is added for modularization safety.
  - Lint/typecheck/build + targeted tests + security/doc checks pass (or are explicitly blocked with evidence).
- Non-goals:
  - New API endpoints, schedulers, or hosted integrations.
  - Broad Studio visual redesign.
  - Full `web/app.js` decomposition in one pass.

## Product Phase Checkpoint (2026-02-17 | Global Cycle 5 Session 1)
- Prompt: "Are we in a good product phase yet?" -> `No`.
- Best-in-market references (untrusted web, bounded scan baseline reused due sandboxed network constraints):
  - Feedly (`https://feedly.com/new-features/posts/feedly-ai-and-summarization`)
  - RSS.app (`https://help.rss.app/en/articles/10271103-how-to-filter-rss-feeds`)
  - Buffer (`https://support.buffer.com/article/613-automating-rss-feeds-using-feedly-and-zapier`)
  - Inoreader (`https://www.inoreader.com/blog/2025/11/monitoring-feeds.html`)
- Core expected capabilities in this segment:
  - High-signal troubleshooting actions with fast operator handoff payloads.
  - Modular UI bindings that keep large controller files maintainable.
  - Deterministic local persistence regression coverage for ongoing refactors.
- Parity gap map:
  - Weak: Step 1 fetch-failure UI binding modularization is partially complete; additional `web/app.js` seams remain.
  - Weak: broader snapshot/migration smoke depth beyond unit fixtures is still pending for M5 confidence.
  - Parity: ingestion interop/retries/concurrency, filters/rules presets, export formats, browser smoke path.
  - Differentiator: local-first multi-persona workflow with strict host safety defaults.

## Pending Feature Checkpoint (2026-02-17 | Global Cycle 5 Session 1)
- Prompt: "What features are still pending?"
- `PRODUCT_ROADMAP.md` pending highlights:
  - Next `web/app.js` state/UI seam extraction.
  - Snapshot/migration smoke depth for M5 readiness.
  - Release/smoke automation depth improvements.
- `CLONE_FEATURES.md` pending highlights:
  - API payload contract docs and focused smoke assertions.

## Prioritized Session Tasks (2026-02-17 | Global Cycle 5 Session 1)
- Selected first (score: impact/effort/strategic-fit/differentiation/risk/confidence):
  1. Extract Step 1 fetch-failure UI/status helpers from `web/app.js` and add copy-failures JSON action (5/2/5/1/1/4).
  2. Add deterministic snapshot round-trip fixture coverage for Studio session storage (4/2/5/0/1/5).
  3. Tighten docs/verification evidence for cleanup slice delivery and anti-drift checks (3/1/5/0/1/5).
- Additional ranked candidates (not locked this session):
  1. Add release-check JSON output fixture coverage (3/2/4/0/1/4).
  2. Add API contract docs for `/api/fetch` `failures[]` payload (3/1/4/0/1/4).
  3. Add CI-safe cache-dir isolation defaults for fetch integration tests (3/2/4/0/2/3).
  4. Extract next `web/app.js` presets/select binding seam (4/4/5/0/2/3).

## Locked Cycle Scope (2026-02-17 | Global Cycle 5 Session 1)
- [x] P1: Extract Step 1 fetch-failure rendering/serialization seam from `web/app.js` into a focused module and wire "copy failures JSON".
- [x] P1: Add deterministic session snapshot round-trip fixture coverage.
- [x] P1: Run quality/security checks and update tracker docs with verification evidence.

## Product Phase Checkpoint (2026-02-17 | Global Cycle 5 Session 1 Post-Ship)
- Prompt: "Are we in a good product phase yet?" -> `No`.
- Outcome after this session:
  - Closed the targeted Step 1 supportability gap via copy-ready fetch-failure JSON handoff and modularized failure-details helper logic.
  - Added deterministic session snapshot round-trip fixture coverage to reduce refactor drift risk.
  - Re-ran docs/security/lint/typecheck/build + focused tests and recorded evidence in trackers.
- Remaining highest-value gaps:
  - Continue `web/app.js` extraction seams (state/preset bindings) for M5 maintainability depth.
  - Add API contract docs and smoke assertions around `/api/fetch` failure payload semantics.
  - Add CI-safe cache-dir/listen test isolation for broader suite reliability in constrained environments.

## Session Goal Checkpoint (2026-02-17 | Global Cycle 4 Session 1)
- Goal: Reduce maintenance/release drift by extracting the `web/app.js` export seam and shipping machine-readable release/docs/security automation hooks.
- Success criteria:
  - `web/app.js` export/download helper logic is extracted into a focused `web/` module with parity tests.
  - `npm run release:check` supports a `--json` output mode for automation consumers while preserving existing console checks.
  - Docs/security helper scripts (`docs:check-links`, `security:grep`) run locally and are documented in release/workflow guidance.
  - Verification/security evidence and tracker updates are captured.
- Non-goals:
  - New server API endpoints or scheduler/publisher integrations.
  - Broad UI redesign outside touched export/status flows.
  - Full `web/app.js` decomposition in one cycle.

## Product Phase Checkpoint (2026-02-17 | Global Cycle 4 Session 1)
- Prompt: "Are we in a good product phase yet?" -> `No`.
- Best-in-market references (untrusted web, bounded scan 2026-02-17):
  - Feedly product direction baseline (`https://feedly.com/new-features/posts/feedly-ai-and-summarization`).
  - RSS.app filtering baseline (`https://help.rss.app/en/articles/10271103-how-to-filter-rss-feeds`).
  - Buffer RSS automation reliability baseline (`https://support.buffer.com/article/613-automating-rss-feeds-using-feedly-and-zapier`).
  - Inoreader monitoring/automation baseline (`https://www.inoreader.com/blog/2025/11/monitoring-feeds.html`).
  - Inoreader OPML interoperability baseline (`https://www.inoreader.com/hu/blog/2015/07/subscribe-to-news-feeds-with-opml.html`).
- Core expected capabilities in this segment:
  - Maintainable UI orchestration with export/status logic isolated from large controller files.
  - Automation-friendly machine-readable release checks for CI/runtime hooks.
  - Lightweight repeatable docs/security quality gates that run before release.
- Parity gap map:
  - Missing: extracted export/download seam from `web/app.js`.
  - Missing: machine-readable release-check summary output.
  - Missing: first-class docs link-check and security grep scripts.
  - Weak: current release/docs guardrails are human-readable only.
  - Parity: ingestion interop, retries/concurrency, filters/rules presets, export formats, browser-assisted smoke flow.
  - Differentiator: local-first multi-persona workflow with strict host safety defaults.

## Pending Feature Checkpoint (2026-02-17 | Global Cycle 4 Session 1)
- Prompt: "What features are still pending?"
- `PRODUCT_ROADMAP.md` pending highlights:
  - Next `web/app.js` extraction seam (state/export UI bindings).
  - Snapshot round-trip fixture and migration smoke checks for modularization safety.
  - Additional release/smoke automation depth for M5 readiness.
- `CLONE_FEATURES.md` pending highlights:
  - session snapshot fixture hardening, Step 1 failure JSON quick action, API payload docs, and ongoing modularization slices.

## Prioritized Session Tasks (2026-02-17 | Global Cycle 4 Session 1)
- Selected first (score: impact/effort/strategic-fit/differentiation/risk/confidence):
  1. Extract Studio export/download helpers from `web/app.js` into `web/studioExports.js` with focused tests (5/3/5/0/2/4).
  2. Add `release:check --json` summary output for CI/runtime hooks (4/2/4/1/1/4).
  3. Add `docs:check-links` + `security:grep` scripts and wire docs references (3/2/4/0/1/4).
- Additional ranked candidates (not locked this session):
  1. Snapshot round-trip fixture for studio session persistence (3/2/4/0/1/4).
  2. Step 1 "copy fetch failures JSON" quick action (2/2/3/1/1/3).
  3. API payload schema notes for `/api/fetch`, `/api/generate`, `/api/agent-feed` (2/2/4/0/1/4).

## Locked Cycle Scope (2026-02-17 | Global Cycle 4 Session 1)
- [x] P1: Extract the Studio export/download seam from `web/app.js` into a focused module with parity behavior + tests.
- [x] P1: Add `release:check --json` machine-readable summary output without regressing existing checks.
- [x] P1: Add `docs:check-links` and `security:grep` scripts with docs/tracker updates and verification evidence.

## Product Phase Checkpoint (2026-02-17 | Global Cycle 4 Session 1 Post-Ship)
- Prompt: "Are we in a good product phase yet?" -> `No`.
- Outcome after this session:
  - Closed this cycle's locked parity gaps: export/download seam extraction (`web/studioExports.js`), release-check JSON output, and docs/security quality-gate scripts.
  - Added release workflow docs for `docs:check-links`, `security:grep`, and `release:check --json`.
  - Remaining highest-value gap: continue `web/app.js` modularization on state/UI bindings and add persistence snapshot/migration smoke fixtures for M5 confidence.

## Session Goal Checkpoint (2026-02-17 | Global Cycle 3 Session 1)
- Goal: Ship Step 1 fetch troubleshooting depth and localStorage schema migration groundwork without regressing local-first Studio behavior.
- Success criteria:
  - Step 1 surfaces per-feed fetch failure details (URL + actionable reason) with readable drill-down UI.
  - Server/API payloads preserve existing summary metrics while exposing structured fetch-failure details.
  - Studio startup runs a versioned storage migration helper with tests proving legacy-key upgrade behavior.
  - Verification/security evidence and tracker updates are captured.
- Non-goals:
  - Broad Studio visual redesign.
  - New hosted scheduler/publisher integrations.
  - Full `web/app.js` decomposition in one pass.

## Product Phase Checkpoint (2026-02-17 | Global Cycle 3 Session 1)
- Prompt: "Are we in a good product phase yet?" -> `No`.
- Best-in-market references (untrusted web, bounded scan 2026-02-17):
  - Feedly Team Feeds baseline (`https://feedly.com/new-features/posts/feedly-ai-and-summarization`).
  - RSS.app filtering baseline (`https://help.rss.app/en/articles/10271103-how-to-filter-rss-feeds`).
  - Inoreader automation throughput baseline (`https://www.inoreader.com/blog/2026/01/save-time-with-automations.html`).
  - Buffer RSS automation reliability baseline (`https://support.buffer.com/article/613-automating-rss-feeds-using-feedly-and-zapier`).
  - dlvr.it RSS automation positioning baseline (`https://dlvrit.com/`).
- Core expected capabilities in this segment:
  - Per-feed, high-signal fetch diagnostics (not only aggregate failure text).
  - Safe persistence evolution with explicit schema versioning/migration.
  - Stable local-first batch workflows with repeatable verification evidence.
- Parity gap map:
  - Missing: per-feed fetch error drill-down payload + UI rendering.
  - Missing: explicit storage schema version + migration entrypoint.
  - Weak: `web/app.js` maintainability for Step 1 control/status wiring.
  - Parity: ingestion interop, retries/concurrency, filters/rules presets, export formats, browser-assisted smoke flow.
  - Differentiator: local-first multi-persona workflow with strict host safety defaults.

## Pending Feature Checkpoint (2026-02-17 | Global Cycle 3 Session 1)
- Prompt: "What features are still pending?"
- `PRODUCT_ROADMAP.md` pending highlights:
  - Step 1 per-feed failure drill-down UX.
  - Storage schema migration/version ergonomics.
  - Next `web/app.js` extraction seam (state/export UI bindings).
- `CLONE_FEATURES.md` pending highlights:
  - Storage key-map docs, snapshot round-trip fixture, throughput benchmark, release-check JSON output, security grep script, docs link-check, UI empty-state polish, and additional Step 1/Step 4 UX hardening.

## Prioritized Session Tasks (2026-02-17 | Global Cycle 3 Session 1)
- Selected first (score: impact/effort/strategic-fit/differentiation/risk/confidence):
  1. Step 1 per-feed fetch error diagnostics across API + UI (5/3/5/1/2/4).
  2. Versioned storage migration helper with startup wiring + tests (4/2/5/0/1/4).
  3. Storage migration docs/key-map + verification evidence refresh (3/1/4/0/1/5).
- Additional ranked candidates (not locked this session):
  1. `web/app.js` next extraction seam (`export` + status bindings) (4/4/5/0/2/3).
  2. Release-check `--json` summary for CI hooks (3/2/3/1/1/3).
  3. Docs link-check script (2/2/4/0/1/3).
  4. Security grep helper command (2/2/4/0/1/3).

## Locked Cycle Scope (2026-02-17 | Global Cycle 3 Session 1)
- [x] P1: Add structured per-feed fetch failure details in `/api/fetch` responses/errors and Step 1 status drill-down UI.
- [x] P1: Add versioned Studio storage migration helper and run it during app startup before reading persisted state.
- [x] P1: Add/refresh tests + docs/tracker updates for fetch diagnostics and storage migration behavior.

## Product Phase Checkpoint (2026-02-17 | Global Cycle 3 Session 1 Post-Ship)
- Prompt: "Are we in a good product phase yet?" -> `No`.
- Outcome after this session:
  - Closed missing parity items for Step 1 troubleshooting depth (per-feed diagnostics payload + UI drill-down).
  - Closed missing storage-schema evolution groundwork via versioned migration helper + startup invocation + migration tests.
  - Remaining highest-value gap: continue `web/app.js` extraction seams for state/export/UI bindings and complete additional reliability automation (`release:check --json`, docs link checks).

## Session Goal Checkpoint (2026-02-17 | Global Cycle 2 Session 1)
- Goal: Reduce `web/app.js` maintenance risk by extracting Studio API payload/error/request helpers into a dedicated module and rewiring fetch/generate flows to shared wrappers.
- Success criteria:
  - `web/studioApi.js` owns API payload parsing, request-id aware error shaping, and endpoint wrappers for personas/fetch/generate/agent-feed.
  - `web/app.js` uses wrapper calls instead of inlined API parsing/error logic with no behavioral regressions.
  - Focused tests cover the extracted module edge cases.
  - Verification/security evidence and tracker updates are captured.
- Non-goals:
  - Broad Studio UI redesign.
  - Server/API surface changes.
  - Full `web/app.js` decomposition in one session.

## Product Phase Checkpoint (2026-02-17 | Global Cycle 2 Session 1)
- Prompt: "Are we in a good product phase yet?" -> `No`.
- Best-in-market references (untrusted web, bounded scan baseline reused; live scan blocked in this sandbox by DNS/network restrictions):
  - Feedly keyboard/operator baseline (`https://docs.feedly.com/article/67-how-to-customize-keyboard-shortcuts-in-feedly`).
  - RSS.app filtering baseline (`https://help.rss.app/en/articles/10271103-how-to-filter-rss-feeds`).
  - Buffer automation reliability baseline (`https://support.buffer.com/article/613-automating-rss-feeds-using-feedly-and-zapier`).
  - Inoreader automation throughput baseline (`https://www.inoreader.com/blog/2026/01/save-time-with-automations.html`).
- Core expected capabilities in this segment:
  - Maintainable UI code where high-churn flows live in focused modules.
  - High-signal troubleshooting feedback when fetch/generate operations fail.
  - Reliable local verification paths with repeatable quality gates.
- Parity gap map:
  - Missing: extraction of shared Studio API wrappers from `web/app.js`.
  - Weak: per-feed fetch troubleshooting depth in Step 1 UI.
  - Parity: ingestion interop, retries/concurrency, filters/rules presets, export formats, browser E2E.
  - Differentiator: local-first multi-persona workflow with strict host safety defaults.

## Locked Cycle Scope (2026-02-17 | Global Cycle 2 Session 1)
- [x] P1: Extract shared Studio API helper module for payload parsing, request-id error handling, and endpoint wrappers.
- [x] P1: Rewire `web/app.js` API call sites (`loadPersonas`, `fetchItems`, `generatePosts`, `buildAgentFeed`) to use the shared module.
- [x] P1: Add focused unit coverage for the new API helper module and re-run quality gates.

## Product Phase Checkpoint (2026-02-17 | Global Cycle 2 Session 1 Post-Ship)
- Prompt: "Are we in a good product phase yet?" -> `No`.
- Outcome after this session:
  - Closed the highest-impact modularization seam by moving Studio API wrappers out of `web/app.js` into `web/studioApi.js`.
  - Added focused coverage for API payload parsing and request-id aware error handling.
  - Remaining highest-value gaps: Step 1 per-feed fetch diagnostics UI and storage migration/versioning ergonomics.

## Session Goal Checkpoint (2026-02-17 | Global Cycle 1 Session 1)
- Goal: Close the highest-value remaining maintenance/documentation gaps by extracting `web/app.js` persistence helpers and splitting deep workflows out of README.
- Success criteria:
  - Persistence/session storage read-write helpers are extracted from `web/app.js` into a dedicated module with parity tests.
  - README remains quickstart-focused while deep CLI/release workflows move into `docs/`.
  - Quality/security checks and smoke verification evidence are captured in trackers.
  - Locked cycle scope items are either completed or explicitly marked blocked with evidence.
- Non-goals:
  - Broad Studio visual redesign.
  - New server API endpoints or scheduler integrations.
  - Large architecture rewrites beyond the selected helper-extraction slice.

## Product Phase Checkpoint (2026-02-17 | Global Cycle 1 Session 1)
- Prompt: "Are we in a good product phase yet?" -> `No`.
- Best-in-market references (untrusted web, bounded scan):
  - Feedly mute/filter baseline (`https://feedly.helpscoutdocs.com/article/345-mute-filters`).
  - RSS.app filter workflow baseline (`https://help.rss.app/en/articles/10271103-how-to-filter-rss-feeds`).
  - Buffer automation reliability baseline (`https://support.buffer.com/article/613-automating-rss-feeds-using-feedly-and-zapier`).
  - Inoreader automation throughput baseline (`https://www.inoreader.com/blog/2026/01/save-time-with-automations.html`).
  - Feedly OPML interoperability baseline (`https://docs.feedly.com/article/51-how-to-import-opml-into-feedly`).
- Core expected capabilities in this segment:
  - Maintainable UI modules for rapid iteration on feed triage/generation flows.
  - Concise onboarding docs with deeper operational playbooks split into dedicated pages.
  - Repeatable local verification and release guardrails with explicit evidence trails.
- Parity gap map:
  - Missing: extraction of persistence/session helper seams from `web/app.js`.
  - Weak: README depth and workflow discoverability due long-form command recipes in one page.
  - Parity: ingestion interop (URL file + OPML), retries/concurrency, filters/rules presets, export formats, browser E2E.
  - Differentiator: local-first multi-persona workflow with strict host safety defaults.

## Locked Cycle Scope (2026-02-17 | Global Cycle 1 Session 1)
- [x] P1: Extract Step 1 persistence/session read-write helpers from `web/app.js` into a dedicated `web` module with parity behavior.
- [x] P1: Add focused tests for extracted persistence helper logic.
- [x] P1: Move deep CLI/release workflow recipes from `README.md` into `docs/` and keep README quickstart-level.

## Product Phase Checkpoint (2026-02-17 | Global Cycle 1 Session 1 Post-Ship)
- Prompt: "Are we in a good product phase yet?" -> `No`.
- Outcome after this session:
  - Closed this cycle's selected parity/maintainability tasks: persistence helper extraction + README/docs split.
  - Remaining highest-value gap: continue breaking down `web/app.js` into smaller state/API/export/UI modules.
  - Remaining roadmap focus: reliability polish (per-feed fetch diagnostics UI, migration tooling, schema/version ergonomics).

## Session Goal Checkpoint (2026-02-17 | Global Cycle 23 Session 1)
- Goal: Reduce maintenance/release drift by shipping a targeted `web/app.js` refactor slice plus npm packaging policy hardening.
- Success criteria:
  - Step 1 ingestion/state helper logic is extracted from `web/app.js` into a focused module with no behavior change.
  - Focused unit coverage exists for extracted helpers.
  - Packaging metadata intentionally includes `dist/cli.js` in `npm pack --dry-run` when build artifacts are present.
  - Verification evidence and tracker updates are captured.
- Non-goals:
  - Broad UI redesign or workflow changes.
  - New API endpoints or scheduler integrations.
  - Multi-file architecture rewrite beyond the selected cleanup slice.

## Product Phase Checkpoint (2026-02-17 | Global Cycle 23 Session 1)
- Prompt: "Are we in a good product phase yet?" -> `No`.
- Best-in-market references (untrusted web, bounded scan):
  - Feedly keyboard/operator workflow baseline (`https://docs.feedly.com/article/67-how-to-customize-keyboard-shortcuts-in-feedly`).
  - RSS.app filtering baseline (`https://help.rss.app/en/articles/10271103-how-to-filter-rss-feeds`).
  - Buffer automation reliability baseline (`https://support.buffer.com/article/613-automating-rss-feeds-using-feedly-and-zapier`).
  - Inoreader automation throughput baseline (`https://www.inoreader.com/blog/2026/01/save-time-with-automations.html`).
- Core expected capabilities in this segment:
  - Maintainable UI code for frequent feature iteration.
  - Release packaging and artifact expectations that are deterministic and enforceable.
  - Stable local-first ingest/filter/generate/export flows.
- Parity gap map:
  - Missing: modularized Step 1 helper boundaries in `web/app.js`.
  - Weak: npm packaging intent for built CLI artifact (`dist/cli.js`).
  - Parity: ingestion interop, retries/concurrency, filter/rule presets, deterministic exports, browser E2E.
  - Differentiator: private local-first multi-persona workflow with strict host safety defaults.

## Product Phase Checkpoint (2026-02-17 | Global Cycle 23 Session 1 Post-Ship)
- Prompt: "Are we in a good product phase yet?" -> `No`.
- Outcome after this session:
  - Closed weak-area gaps: Step 1 helper modularization starter slice landed, and package artifact policy is now explicit/enforced.
  - Remaining highest-value gaps: continue `web/app.js` modularization and complete docs split to keep README quickstart-only.

## Session Goal Checkpoint (2026-02-17 | Global Cycle 22 Session 1)
- Goal: Close the highest-value remaining parity gaps by shipping Studio keyboard shortcuts for high-frequency generate/export loops and release checklist automation.
- Success criteria:
  - Studio supports keyboard actions for generate and draft/feed export paths without firing while typing in inputs/textareas.
  - Shortcut behavior is covered by focused helper tests.
  - A release-check script verifies changelog state, quality gates, and release artifact presence.
  - Verification evidence and tracker updates are captured.
- Non-goals:
  - Broad `web/app.js` modularization.
  - New API routes or scheduler integrations.
  - Persona-management UX redesign.

## Product Phase Checkpoint (2026-02-17 | Global Cycle 22 Session 1)
- Prompt: "Are we in a good product phase yet?" -> `No`.
- Best-in-market references (untrusted web, bounded scan):
  - Feedly keyboard shortcut baseline (`https://docs.feedly.com/article/67-how-to-customize-keyboard-shortcuts-in-feedly`).
  - Feedly mute/filter workflow baseline (`https://feedly.helpscoutdocs.com/article/345-mute-filters`).
  - RSS.app feed filtering baseline (`https://help.rss.app/en/articles/10271103-how-to-filter-rss-feeds`).
  - Buffer RSS automation baseline (`https://support.buffer.com/article/613-automating-rss-feeds-using-feedly-and-zapier`).
  - Inoreader automation throughput posture (`https://www.inoreader.com/blog/2026/01/save-time-with-automations.html`).
- Core expected capabilities in this segment:
  - Keyboard-driven triage/generation actions for repeated feed-review loops.
  - Strong release and reliability guardrails before publish/tag.
  - Stable local-first ingest/filter/generate/export workflows with traceable failures.
- Parity gap map:
  - Missing: Step 3/Step 4 keyboard shortcuts and scripted release checklist enforcement.
  - Weak: release readiness automation and maintainability of large UI orchestration file.
  - Parity: ingestion interop (URL-file/OPML), retries/concurrency, filter/rule presets, deterministic exports, browser E2E.
  - Differentiator: private local-first multi-persona workflow with strict host safety defaults.

## Product Phase Checkpoint (2026-02-17 | Global Cycle 22 Session 1 Post-Ship)
- Prompt: "Are we in a good product phase yet?" -> `No`.
- Outcome after this session:
  - Closed missing parity items: Step 3/Step 4 keyboard shortcuts and scripted release-check automation.
  - Remaining highest-value gaps: `web/app.js` modularization and docs split for deep command recipes/release playbooks.
  - Remaining weak area: package publishing metadata currently excludes `dist/cli.js` in `npm pack --dry-run` output; release-check now warns explicitly.

## Session Goal Checkpoint (2026-02-13 | Global Cycle 5 Session 1)
- Goal: Close the highest-impact remaining M3 reliability/supportability gaps by shipping fetch retry/latency diagnostics and API request IDs.
- Success criteria:
  - `/api/fetch` summary includes `retryAttempts`, `retrySuccesses`, `durationMs`, and `slowestFeedMs`.
  - API error payloads include a request ID and Studio surfaces that ID in error messages for troubleshooting.
  - Tests cover new summary diagnostics and request-id payload/header behavior.
  - Verification evidence and tracker updates are captured.
- Non-goals:
  - `web/app.js` modularization.
  - Scheduler/publishing integrations.
  - New API routes unrelated to fetch diagnostics/supportability.

## Product Phase Checkpoint (2026-02-13 | Global Cycle 5 Session 1)
- Prompt: "Are we in a good product phase yet?" -> `No`.
- Best-in-market references (untrusted web, bounded scan):
  - Feedly guide: mute filters for repeated feed noise reduction (`https://feedly.helpscoutdocs.com/article/345-mute-filters`).
  - RSS.app guide: filtering controls baseline for feed triage (`https://help.rss.app/en/articles/10271103-how-to-filter-rss-feeds`).
  - Buffer Help: RSS automation and queue guardrail baseline (`https://support.buffer.com/article/613-automating-rss-feeds-using-feedly-and-zapier`).
  - Sprout Social Help: automated feed publishing controls/limits (`https://support.sproutsocial.com/hc/en-us/articles/20299161205645-How-do-I-use-Automated-Feed-Publishing-on-the-Professional-and-Advanced-Plans`).
  - Inoreader blog: automation efficiency expectations for high-volume workflows (`https://www.inoreader.com/blog/2026/01/save-time-with-automations.html`).
- Core expected capabilities in this segment:
  - Fast diagnostics for repeated runs (retry visibility, latency visibility, traceable failures).
  - Repeat-workflow speed controls (saved settings + keyboard efficiency).
  - Stable export and automation handoff with confidence checks.
- Parity gap map:
  - Missing: fetch retry/latency summary visibility and traceable request IDs in Studio-facing errors.
  - Weak: troubleshooting depth for large feed batches and fast operator navigation.
  - Parity: ingestion interoperability (URL-file/OPML), retries/concurrency controls, triage filtering/presets, deterministic exports.
  - Differentiator: private local-first multi-persona workflow with strict host safety defaults.

## Session Goal Checkpoint (2026-02-13 | Global Cycle 4 Session 1)
- Goal: Ship preflight CLI diagnostics parity by adding `generate --dry-run` insight mode and close adjacent reliability test gaps.
- Success criteria:
  - CLI `generate --dry-run` reports input diagnostics (`valid`, `invalid`, `duplicate URL`, estimated truncation counts) without writing post output.
  - CLI regression tests cover dry-run behavior and `EPIPE` handling across `text/json/jsonl/csv` output formats.
  - Session-persistence edge-case tests cover invalid snapshots, stale keys, and partial payload fallbacks.
  - Verification evidence and tracker updates are captured.
- Non-goals:
  - Scheduler/publishing integrations.
  - `web/app.js` modularization.
  - New API routes unrelated to diagnostics/reliability.

## Session Goal Checkpoint (2026-02-13 | Global Cycle 3 Session 1)
- Goal: Ship repeat-workflow triage parity by adding saved filter presets and one-click domain muting in Studio Step 1.
- Success criteria:
  - Users can save/load/delete named filter presets (`include`/`exclude`/`min-title`) locally in Step 1.
  - Items preview includes a per-item mute-domain quick action that updates exclusion filters and immediately re-filters items.
  - Filter logic supports explicit domain exclusion tokens without regressing existing keyword behavior.
  - Verification evidence and tracker updates are captured.
- Non-goals:
  - Scheduler/publishing integrations.
  - Large `web/app.js` modularization.
  - New server/API endpoints unrelated to triage UX.

## Session Goal Checkpoint (2026-02-13 | Cycle 2 Session 1)
- Goal: Close the highest-impact remaining parity gap by shipping browser E2E coverage for Step 4 agent-feed actions (`build -> copy -> download`).
- Success criteria:
  - Playwright E2E validates Step 4 build flow and confirms feed cards render with expected metadata.
  - E2E validates copy and download actions for Step 4 outputs and asserts payload structure.
  - Existing Step 3 coverage remains intact in the same deterministic run.
  - Verification evidence and tracker updates are captured.
- Non-goals:
  - New scheduler/publishing integrations.
  - Major `web/app.js` modularization.
  - New API surface area changes unrelated to agent-feed verification.

## Session Goal Checkpoint (2026-02-13 | Cycle 1 Session 4)
- Goal: Ship bounded fetch concurrency controls across CLI + Studio to harden large multi-feed runs.
- Success criteria:
  - CLI `fetch` supports bounded configurable concurrency and uses non-unbounded worker scheduling.
  - Studio API supports bounded fetch concurrency and returns the effective value in fetch summary payloads.
  - Studio UI exposes fetch concurrency setting and persists it across sessions.
  - Concurrency behavior is covered by tests and verification evidence is captured.
- Non-goals:
  - Step 4 agent-feed browser E2E rollout.
  - Scheduler/publishing integrations.
  - Broad architecture refactors outside touched fetch pathways.

## Session Goal Checkpoint (2026-02-12 | Cycle 1 Session 3)
- Goal: Ship production-grade browser E2E coverage for the Studio critical path so CI validates real user behavior (`fetch -> generate -> export`).
- Success criteria:
  - Deterministic browser E2E test covers feed fetch, draft generation, and draft export flows.
  - CI runs the E2E check (with browser install) in addition to existing unit/integration/smoke checks.
  - Export smoke assertions verify `.txt`, `.jsonl`, and `.csv` payload shape from the browser flow.
  - Verification evidence and tracker updates are captured.
- Non-goals:
  - Full visual regression suite.
  - New scheduler/publishing integrations.
  - Large `web/app.js` modularization.

## Session Goal Checkpoint (2026-02-12 | Cycle 1 Session 2)
- Goal: Close the highest-value remaining Studio parity gaps by shipping OPML feed-set interoperability and live over-limit editing guidance.
- Success criteria:
  - Studio can export saved feed sets to OPML and import OPML back into local feed sets with dedupe-safe behavior.
  - Studio draft editor shows live over-limit warnings and supports one-click trim-to-max while preserving manual edits.
  - Added/updated tests cover OPML parser/export behavior and trim helper behavior.
  - Verification commands and outcomes are recorded in project trackers.
- Non-goals:
  - Browser-level E2E framework rollout this session.
  - External scheduling/publishing integrations.
  - Full `web/app.js` modularization.

## Session Goal Checkpoint (2026-02-12)
- Goal: Ship the highest-impact reliability + ingestion parity work for Feed Jarvis Studio/CLI this cycle.
- Success criteria:
  - Bounded retry/backoff exists for transient fetch failures and is covered by tests.
  - CLI supports file-based multi-feed URL ingestion (`--urls-file`) with existing allowlist + dedupe behavior.
  - Studio pasted JSON ingestion rejects non-HTTP(S) URLs with clear feedback before generation/export.
  - Verification and tracker documentation are updated with exact evidence.
- Non-goals:
  - External scheduler/auto-publish integrations.
  - New hosted/cloud services.
  - Large UI redesign of the Studio layout.

## Product Phase Checkpoint (2026-02-12)
- Prompt: "Are we in a good product phase yet?" -> `No`.
- Best-in-market references (untrusted web):
  - Feedly docs: OPML import/export and dedup controls (`docs.feedly.com`).
  - Inoreader docs/help: folder/rule workflows and feed management (`inoreader.com`).
  - Buffer help: RSS automation into queue and per-channel workflow constraints (`support.buffer.com`).
  - Missinglettr help: default hashtags and UTM controls (`help.missinglettr.com`).
- Core expected capabilities in this segment:
  - Flexible ingestion (URL list files, OPML import/export, feed grouping).
  - Noise control (dedupe, include/exclude filters, mute workflows).
  - Draft controls (rules, character limits, editing, export interoperability).
  - Queue/automation bridges (CSV/JSONL/automation handoff).
- Parity gap map:
  - Missing: browser E2E for critical Studio flow.
  - Weak: none across current ingestion/draft-parity baseline; next gap is test automation breadth.
  - Parity: OPML feed-set interoperability, transient retry handling, URL-list ingestion, local feed sets/rules, item filters, metadata-rich exports, agent feed layouts.
- Differentiator: local-first end-to-end drafting with strict private-host safeguards.

## Product Phase Checkpoint (2026-02-13 | Cycle 2 Session 1)
- Prompt: "Are we in a good product phase yet?" -> `No`.
- Best-in-market references (untrusted web, bounded scan):
  - Feedly OPML interoperability and migration baseline (`https://docs.feedly.com/article/51-how-to-import-opml-into-feedly`, `https://docs.feedly.com/article/52-how-can-i-export-my-sources-and-feeds-through-opml`).
  - RSS.app keyword-filtering expectations for feed triage (`https://help.rss.app/en/articles/10271103-how-to-filter-rss-feeds`).
  - Buffer feed automation workflow expectations (`https://support.buffer.com/article/613-automating-rss-feeds-using-feedly-and-zapier`).
  - Sprout automated feed publishing control baseline (`https://support.sproutsocial.com/hc/en-us/articles/20299161205645-How-do-I-use-Automated-Feed-Publishing-on-the-Professional-and-Advanced-Plans`).
  - Inoreader automation/time-saving posture for high-volume feeds (`https://www.inoreader.com/blog/2026/01/save-time-with-automations.html`).
- Core expected capabilities in this segment:
  - Reliable ingestion interoperability with repeatable save/reuse workflows.
  - Fast noise control and confidence-building verification in real UI flows.
  - Stable export/automation handoff formats with deterministic behavior.
- Parity gap map:
  - Missing: browser E2E assertions for Step 4 agent timeline interactions (`build -> copy -> download`).
  - Weak: regression detection for Step 4 UI actions compared with stronger Step 3 assertions.
  - Parity: OPML and URL-file ingestion, filter/rules stack, retry/backoff, bounded fetch concurrency, Step 3 browser E2E.
  - Differentiator: local-first multi-persona drafting and timeline generation with private-host safeguards.

## Product Phase Checkpoint (2026-02-13 | Session 4)
- Prompt: "Are we in a good product phase yet?" -> `No`.
- Best-in-market references (untrusted web, bounded scan):
  - Feedly OPML import/export interoperability expectations (`https://docs.feedly.com/article/51-how-to-import-opml-into-feedly`, `https://docs.feedly.com/article/52-how-can-i-export-my-sources-and-feeds-through-opml`).
  - Buffer RSS automation guidance for feed workflow throughput (`https://support.buffer.com/article/613-automating-rss-feeds-using-feedly-and-zapier`).
  - Sprout automated feed publishing controls for cadence/limits (`https://support.sproutsocial.com/hc/en-us/articles/20299161205645-How-do-I-use-Automated-Feed-Publishing-on-the-Professional-and-Advanced-Plans`).
  - RSS.app filtering baseline expectations (`https://help.rss.app/en/articles/10271103-how-to-filter-rss-feeds`).
  - Inoreader automation guidance for high-volume workflows (`https://jp.inoreader.com/uk/blog/2026/01/save-time-with-automations.html`).
- Core expected capabilities in this segment:
  - Ingestion interoperability with safe controls at higher feed counts.
  - Throughput guardrails (bounded concurrency, predictable retries, dedupe visibility).
  - Repeat-workflow UX (saved rules/filters, shortcuts, reusable feed groups).
- Parity gap map:
  - Missing: bounded configurable fetch concurrency control surfaced in UI + API.
  - Weak: visibility/control of ingestion throughput on large URL batches.
  - Parity: URL-file + OPML ingestion, retry/backoff, filters/rules, export formats, Step 3 E2E coverage.
- Differentiator: strict local-first behavior with private-host defaults.

## Product Phase Checkpoint (2026-02-13 | Global Cycle 3 Session 1)
- Prompt: "Are we in a good product phase yet?" -> `No`.
- Best-in-market references (untrusted web, bounded scan):
  - Feedly guide on muting terms/topics in AI feeds (`https://docs.feedly.com/article/507-how-to-mute-topics-in-feedly-ai-feeds`).
  - Feedly keyword mute filters in regular feeds (`https://feedly.helpscoutdocs.com/article/345-mute-filters`).
  - Inoreader automation/rules emphasis for high-volume workflows (`https://www.inoreader.com/blog/2026/01/save-time-with-automations.html`).
  - RSS.app keyword/domain filtering baseline (`https://help.rss.app/en/articles/10271103-how-to-filter-rss-feeds`).
  - Buffer RSS automation expectations for repeat publishing loops (`https://support.buffer.com/article/613-automating-rss-feeds-using-feedly-and-zapier`).
- Core expected capabilities in this segment:
  - Reusable filter controls and quick muting to reduce repeated setup and feed noise.
  - Safe local persistence of triage state for repeated daily runs.
  - Deterministic export/automation handoff once triage quality is high.
- Parity gap map:
  - Missing: saved filter presets and one-click domain mute action in Studio triage.
  - Weak: repeated filter setup speed and item-level noise suppression controls.
  - Parity: OPML + URL-file ingestion, bounded retry/concurrency, Step 3/4 browser E2E coverage.
  - Differentiator: private local-first workflow with persona-rich generation modes.

## Product Phase Checkpoint (2026-02-13 | Global Cycle 3 Session 1 Post-Ship)
- Prompt: "Are we in a good product phase yet?" -> `No`.
- Outcome after this session:
  - Closed missing parity items: saved filter presets and one-click domain muting in Step 1.
  - Remaining highest-value missing parity item: CLI dry-run diagnostics for invalid/duplicate/truncation visibility before publish/export.
  - Remaining weak areas: session-persistence edge-case resilience and large-file maintainability in `web/app.js`.

## Product Phase Checkpoint (2026-02-13 | Global Cycle 4 Session 1)
- Prompt: "Are we in a good product phase yet?" -> `No`.
- Best-in-market references (untrusted web, bounded scan):
  - Buffer Help: RSS automation baseline with feed-to-queue controls (`https://support.buffer.com/article/613-automating-rss-feeds-using-feedly-and-zapier`).
  - Sprout Social Help: automated feed publishing controls and guardrails (`https://support.sproutsocial.com/hc/en-us/articles/20299161205645-How-do-I-use-Automated-Feed-Publishing-on-the-Professional-and-Advanced-Plans`).
  - dlvr.it product docs/site: repeat RSS-to-social autopost workflow posture (`https://dlvrit.com/`).
  - Zapier app integration baseline for RSS -> Buffer automation (`https://zapier.com/apps/buffer/integrations/rss`).
- Core expected capabilities in this segment:
  - Preflight confidence before publish/export (preview and diagnostics).
  - High-signal failure handling for repeated automated runs.
  - Stable output contracts and safe dry-run checks for tooling pipelines.
- Parity gap map:
  - Missing: CLI dry-run diagnostics for invalid/duplicate/truncation visibility.
  - Weak: resilience coverage for session snapshot parsing and CLI pipe-close behavior.
  - Parity: feed ingestion interoperability, bounded fetch concurrency/retries, Studio triage controls, metadata-rich exports.
  - Differentiator: local-first drafting + multi-persona timeline with private-host safeguards.

## Product Phase Checkpoint (2026-02-13 | Global Cycle 4 Session 1 Post-Ship)
- Prompt: "Are we in a good product phase yet?" -> `No`.
- Outcome after this session:
  - Closed missing parity item: CLI preflight dry-run diagnostics for invalid/duplicate/truncation visibility.
  - Closed weak reliability gaps: session snapshot edge-case coverage and CLI `EPIPE` regression coverage across output formats.
  - Remaining highest-value parity/reliability items: fetch retry/latency diagnostics in `/api/fetch` summary and targeted API request-id support for troubleshooting.

## Product Phase Checkpoint (2026-02-13 | Global Cycle 5 Session 1 Post-Ship)
- Prompt: "Are we in a good product phase yet?" -> `No`.
- Outcome after this session:
  - Closed missing parity/reliability items: `/api/fetch` now reports retry/latency diagnostics and API errors now include request IDs for supportability.
  - Remaining highest-value gaps: `web/app.js` modularization and keyboard shortcuts for high-throughput studio operation.
  - Remaining reliability/release gap: release checklist automation and docs split for maintainable release readiness.

## Product Phase Checkpoint (2026-02-12 | Session 3)
- Prompt: "Are we in a good product phase yet?" -> `No`.
- Best-in-market references (untrusted web, bounded scan):
  - Feedly docs: OPML import/export interoperability and non-destructive imports (`https://docs.feedly.com/article/51-how-to-import-opml-into-feedly`, `https://docs.feedly.com/article/52-how-can-i-export-my-sources-and-feeds-through-opml`).
  - Buffer support: feed-to-queue automation baselines and multi-channel constraints (`https://support.buffer.com/article/613-automating-rss-feeds-using-feedly-and-zapier`).
  - Sprout support: RSS automation controls (check intervals, max items, append-text truncation behavior) (`https://support.sproutsocial.com/hc/en-us/articles/20299161205645-How-do-I-use-Automated-Feed-Publishing-on-the-Professional-and-Advanced-Plans`).
  - Inoreader blog: rules/filters automation expectations for high-volume feed workflows (`https://jp.inoreader.com/uk/blog/2026/01/save-time-with-automations.html`).
  - RSS.app help: keyword/domain filtering expectations for feed triage (`https://help.rss.app/en/articles/10271103-how-to-filter-rss-feeds`).
- Core expected capabilities in this segment:
  - Reliable ingestion + grouping interoperability (URL lists, OPML, safe dedupe).
  - Fast noise reduction workflows (filters, rules, mute/blacklist controls).
  - Real workflow verification (browser path checks for ingest -> draft -> export).
  - Export/automation bridges with predictable format contracts.
- Parity gap map:
  - Missing: browser-level CI validation for Studio fetch/generate/export journey.
  - Weak: export-contract verification under real browser interactions.
- Parity: OPML feed-set interoperability, URL-file ingestion, transient fetch retries, local-first draft controls.
- Differentiator: privacy-preserving local-first drafting + strict feed-host safety defaults.

## Locked Cycle Scope (2026-02-17 | Global Cycle 22 Session 1)
- [x] P1: Add Studio keyboard shortcuts for Step 3/Step 4 high-frequency actions (generate, export/copy, agent-feed actions) with safe input-focus guards.
- [x] P1: Add focused shortcut helper test coverage for keybinding matching + guard behavior.
- [x] P2: Add release checklist automation script with changelog guard + quality-gate command + artifact verification and docs wiring.

## Locked Cycle Scope (2026-02-17 | Global Cycle 23 Session 1)
- [x] P1: Extract Step 1 ingestion/state helpers from `web/app.js` into a focused module without behavior changes.
- [x] P1: Add focused helper test coverage for extracted Step 1 utilities.
- [x] P2: Harden npm packaging metadata so `npm pack --dry-run` intentionally includes `dist/cli.js` after build.

## Locked Cycle Scope (2026-02-12 | Session 2)
- [x] P1: Studio OPML import/export for saved feed sets (local-only interoperability).
- [x] P1: Studio live over-max-char warnings while editing drafts + one-click trim suggestion.

## Locked Cycle Scope (2026-02-13 | Cycle 2 Session 1)
- [x] P1: Extend browser E2E coverage to Step 4 agent feed flow (`build -> copy -> download`) with deterministic assertions.
- [x] P2: Add Step 4 assertion depth for feed metadata and exported JSON structure to reduce regression risk.

## Locked Cycle Scope (2026-02-13 | Global Cycle 3 Session 1)
- [x] P1: Add Studio saved filter presets (save/load/delete) for include/exclude/min-title triage settings.
- [x] P1: Add per-item mute-domain quick action that appends a domain exclusion token and re-filters immediately.
- [x] P1: Add coverage for filter preset helpers and domain-token filtering behavior.

## Locked Cycle Scope (2026-02-13 | Global Cycle 4 Session 1)
- [x] P1: Add CLI `generate --dry-run` diagnostics (invalid items, duplicate URLs, truncation counts) without writing post output.
- [x] P2: Add CLI regression tests for pipe-close (`EPIPE`) behavior across `text/json/jsonl/csv` output formats.
- [x] P2: Add targeted session-persistence edge-case tests for invalid snapshots, stale keys, and partial payload defaults.

## Locked Cycle Scope (2026-02-13 | Global Cycle 5 Session 1)
- [x] P1: Add `/api/fetch` diagnostics fields (`retryAttempts`, `retrySuccesses`, `durationMs`, `slowestFeedMs`) for large-run troubleshooting.
- [x] P1: Add API request-id support in error payloads (and response headers) for faster support/debug loops in Studio.
- [x] P2: Add/extend tests and Studio summary formatting for new diagnostics fields and request-id surfaced errors.

## Locked Cycle Scope (2026-02-12 | Session 3)
- [x] P1: Browser-level Studio E2E coverage for critical path (`fetch -> generate -> export`) with deterministic fixtures.
- [x] P2: Export smoke assertions in CI for `.txt`, `.jsonl`, and `.csv` from the browser-driven flow.

## Locked Cycle Scope (2026-02-13 | Session 4)
- [x] P1: Add bounded configurable fetch concurrency for CLI + Studio API.
- [x] P2: Add Studio fetch-concurrency control with session persistence.
- [x] P1: Add CLI/server concurrency behavior tests and update docs/trackers.

## Locked Cycle Scope (2026-02-12)
- [x] P1: Feed fetcher bounded retry/backoff for transient 5xx/network/timeout failures (honor timeout + stale-if-error).
- [x] P1: CLI `fetch --urls-file <path>` for newline-delimited feed URLs with existing dedupe + allowlist flow.
- [x] P1: Studio pasted JSON URL validation (`http/https` only) with actionable user feedback.

## Pending Features (What Is Still Pending?)
- P2: Continue phased `web/app.js` modularization (remaining state/exporters/UI bindings beyond Step 1 ingestion + persistence + API helper slices).
- P3: Add CLI troubleshooting playbook in `docs/` (dry-run, stdin, private-host fetch errors, release checks).
- P3: Add optional export schema version metadata for JSON/JSONL outputs.
- P3: Add per-feed fetch error drill-down UI in Step 1.
- P3: Add large-batch benchmark script for feed parsing + generation throughput.
- P3: Add feed-set storage migration utility for future schema revisions.
- P3: Add draft edit analytics summary (trimmed chars/post count deltas) for QA loops.
- P3: Add import support for newline-delimited feed URL files in Studio UI.
- P3: Add confirm-before-download behavior when export count exceeds threshold.
- P3: Add release-check flags (`--skip-check`, `--allow-dirty`) with warning rails.

## Delivered Features (Recent)
- 2026-02-17: Extracted shared Studio API helper module (`web/studioApi.js`) and rewired app API flows (`loadPersonas`, `fetchItems`, `generatePosts`, `buildAgentFeed`) to shared wrappers with focused coverage (`test/studioApi.test.ts`).
- 2026-02-17: Split deep Studio/CLI/release command recipes from `README.md` into `docs/WORKFLOWS.md` and tightened README to a quickstart-first surface with doc links.
- 2026-02-17: Extracted Step 1 persistence/session storage helpers from `web/app.js` into `web/studioStorage.js` (channel max chars, feed/filter/rule presets, session snapshots, persona overrides) and rewired app usage to shared helper APIs with new focused tests (`test/studioStorage.test.ts`).
- 2026-02-17: Hardened npm package publish intent by adding a `package.json` `files` whitelist and enforcing `dist/cli.js` inclusion through `release:check` (`npm pack --dry-run --json` validation).
- 2026-02-17: Extracted Step 1 ingestion helpers from `web/app.js` into `web/step1Ingestion.js` (`normalizeUrls`, URL validation, JSON payload parsing, invalid-item summary, `items.json` serialization) with focused tests.
- 2026-02-17: Added Studio keyboard shortcuts for high-frequency Step 3/Step 4 actions (`Ctrl/Cmd+Shift+Enter/C/E/B/K/J`) with editable-field guards and UI hints.
- 2026-02-17: Added `npm run release:check` automation (git clean guard, changelog guard, quality-command execution, artifact checks, and `npm pack --dry-run --json` enforcement for `dist/cli.js` packaging).
- 2026-02-13: Added `/api/fetch` diagnostics summary fields (`retryAttempts`, `retrySuccesses`, `durationMs`, `slowestFeedMs`) for large-run troubleshooting.
- 2026-02-13: Added API request-id support in error payloads and `x-request-id` response headers; Studio now appends request IDs to surfaced API error messages.
- 2026-02-13: Added coverage for fetch diagnostics formatting and server request-id + diagnostics behavior (`test/studioPrefs.test.ts`, `test/server.test.ts`).
- 2026-02-13: Added CLI `generate --dry-run` preflight diagnostics (`valid/invalid`, duplicate URL counts, estimated truncation counts) with no output writes.
- 2026-02-13: Added CLI regression coverage for output pipe-close (`EPIPE`) behavior across `text/json/jsonl/csv` formats.
- 2026-02-13: Added session-persistence snapshot sanitization + tests for invalid JSON, stale keys, and partial payload restore paths.
- 2026-02-13: Added Studio filter presets (save/load/delete) for Step 1 include/exclude/min-title triage settings with local persistence and session restore support.
- 2026-02-13: Added Step 1 per-item "Mute domain" action that appends `site:<domain>` exclusions and re-applies filtering immediately.
- 2026-02-13: Added filter coverage for preset parse/upsert/remove helpers and `site:` domain-token filtering behavior.
- 2026-02-13: Expanded browser-level Studio E2E smoke to include Step 4 agent feed (`build -> copy -> download`) with deterministic assertions for rendered cards, copy status, and downloaded JSON payload shape.
- 2026-02-13: Added bounded configurable fetch concurrency for CLI + Studio server/API (`--fetch-concurrency`, `FEED_JARVIS_FETCH_CONCURRENCY`, `/api/fetch` `fetchConcurrency`) with shared worker-limited execution and summary reporting.
- 2026-02-13: Added Studio Step 1 fetch-concurrency control (`1-20`) with session persistence and fetch-status detail.
- 2026-02-13: Added concurrency-focused coverage for shared helper logic plus CLI/server fetch behavior.
- 2026-02-12: Added browser-level Studio E2E smoke for critical flow (`fetch -> generate -> export`) with deterministic feed fixtures and export assertions (`.txt`, `.jsonl`, `.csv`).
- 2026-02-12: CI now installs Playwright Chromium and runs `npm run e2e:web` after lint/typecheck/test/build + API smoke checks.
- 2026-02-12: Added Studio feed-set OPML import/export (local-only) with parsing, dedupe, and collision-safe naming.
- 2026-02-12: Added live over-max-char draft editing warnings with one-click trim-to-max helper.
- 2026-02-12: Added transient fetch retry/backoff with bounded retries for network/timeouts and HTTP 408/429/5xx.
- 2026-02-12: Added CLI `fetch --urls-file <path>` for newline-delimited feed URL ingestion.
- 2026-02-12: Added Studio/API URL-protocol validation for pasted/generation item URLs (`http/https` only).
- 2026-02-12: Added multi-persona agent feed (`/api/agent-feed`) with rotating/consensus layouts.
- 2026-02-12: Added GPT mode for Studio + CLI generation via OpenAI Responses API.
- 2026-02-12: Added markdown persona contract support and bundled persona pack auto-load.
- 2026-02-11: Added Studio local-only rule presets and CLI OPML fetch ingestion.

## Risks And Blockers
- Risk: large pending UX work in `web/app.js` carries rising maintenance cost until modularized.
- Active blockers: none currently.

## Next Cycle Goals
- Continue phased `web/app.js` modularization to reduce maintenance risk while preserving behavior.
- Add higher-signal Step 1 fetch troubleshooting UX (per-feed error drill-down) and continue reliability/docs parity tasks.
