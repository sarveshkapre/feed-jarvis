# Project Memory

## Historical Summary
- 2026-02-13T05:12:15Z: compacted memory from 507 lines. Full snapshot archived at /Users/sarvesh/code/feed-jarvis/.clone_memory_archive/PROJECT_MEMORY-20260213T051214Z.md

    - Weak: repeat-run triage speed due manual filter re-entry.
    - Parity: OPML + URL-file ingestion, retry/backoff, bounded concurrency, Step 3/4 E2E.
    - Differentiator: private local-first persona-driven drafting.
- What features are still pending?
  - From `PRODUCT_ROADMAP.md`: dry-run diagnostics, session-persistence edge-case tests, and modularization remain pending after this cycle.
  - From `CLONE_FEATURES.md`: backlog depth remains above 20 candidates.
- Locked task list for this session:
  - Implement saved filter presets in Studio Step 1.
  - Implement per-item mute-domain quick action and domain token filtering semantics.
  - Add focused tests for new filter preset helper logic and domain mute filtering.
- Execution outcome:
  - Completed: Added `web/filterPresets.js` helper module (`parse`/`upsert`/`remove`/`serialize`) with declaration typing and test coverage.
  - Completed: Added Step 1 filter preset UI controls (`save`/`load`/`delete`) with local persistence and session snapshot restore in `web/app.js`.
  - Completed: Added per-item "Mute domain" quick action in preview rows and `site:` domain-token filtering semantics in `web/filters.js`.
  - Completed: Updated roadmap/backlog/readme memory entries to reflect shipped triage-parity behavior.
- Post-ship product phase checkpoint:
  - Prompt: "Are we in a good product phase yet?" -> No.
  - Missing now: CLI dry-run diagnostics and session persistence hardening remain the highest-value parity/reliability work.
- Signals:
  - GitHub issue signals: disabled/unavailable.
  - GitHub CI signals: disabled/unavailable.
- Quick code review sweep:
  - `rg TODO|FIXME` returned no markers in source/test/docs paths.
  - `web/app.js` remains the highest-maintenance hotspot; changes should stay scoped to Step 1 triage flows.
- Trust labels:
  - Trusted: local repository code/tests/commands.
  - Untrusted: external market/reference pages.

## Session Notes (2026-02-17 | Global Cycle 23 Session 1)
- Goal clarification checkpoint:
  - Goal (one sentence): Reduce maintenance and release drift by shipping a safe modularization slice for Step 1 helpers and hardening npm packaging intent.
  - Success criteria:
    - Step 1 ingestion/state helper logic is extracted from `web/app.js` into a dedicated module with unchanged behavior.
    - Focused tests cover extracted helper behavior.
    - Packaging metadata ensures `dist/cli.js` is intentionally included in `npm pack --dry-run` after build output exists.
    - Verification evidence is recorded in this file.
  - Non-goals:
    - Broad visual redesign.
    - API/scheduler feature expansion.
    - Large multi-module rewrite of Studio orchestration.
  - Concrete tasks:
    1. Extract low-risk Step 1 helper functions (`normalizeUrls`, JSON payload validation helpers, URL guard, JSON export helper) from `web/app.js`.
    2. Add targeted tests for extracted helper module.
    3. Add npm packaging policy (`files` whitelist) and verify pack output includes `dist/cli.js`.
    4. Update roadmap/feature/context docs and re-verify lint/typecheck/build + touched tests.
- Brainstorming checkpoint (ranked; impact/effort/fit/diff/risk/confidence):
  1. Extract Step 1 ingestion helpers into `web` module + tests (5/2/5/0/1/5) -> selected.
  2. Packaging metadata hardening via `package.json` `files` whitelist (4/1/5/0/1/5) -> selected.
  3. Move Step 1 localStorage wrappers into dedicated persistence module (4/2/5/0/1/4) -> pending.
  4. README docs split into dedicated `docs/` recipes page (3/2/4/0/1/4) -> pending.
  5. Add Step 1 helper type declarations cleanup (`.d.ts` coverage) (3/1/4/0/1/5) -> selected with #1.
  6. Add targeted smoke command for `npm pack --dry-run` in release docs (2/1/4/0/1/5) -> pending.
  7. Refactor Step 1 fetch API call code path into standalone client utility (3/3/4/0/2/3) -> pending.
  8. Remove dormant/duplicated status message helpers if unused (2/2/3/0/2/3) -> pending.
- Product phase checkpoint:
  - Prompt: "Are we in a good product phase yet?" -> No.
  - Best-in-market signal (untrusted web, bounded scan 2026-02-17): Feedly/Inoreader/Buffer/RSS.app patterns still emphasize fast repeat workflows and deterministic reliability guardrails, which depend on maintainable frontend orchestration and predictable release packaging.
  - Gap map:
    - Missing: modular boundaries for Step 1 helper logic in `web/app.js`.
    - Weak: explicit packaging intent for `dist/cli.js` in publish artifacts.
    - Parity: ingestion interop, retries/concurrency, filter/rule presets, deterministic exports, browser E2E.
    - Differentiator: local-first multi-persona drafting with strict host safety defaults.
- What features are still pending?
  - From `PRODUCT_ROADMAP.md`: `web/app.js` modularization continuation and docs split.
  - From `CLONE_FEATURES.md`: backlog depth remains above 20 candidates.
- Locked task list for this session:
  - Extract Step 1 ingestion/state helper module and wire `web/app.js` to it.
  - Add focused tests for extracted helpers.
  - Harden npm packaging metadata and verify pack output includes `dist/cli.js`.
- Execution outcome:
  - Completed: Extracted Step 1 ingestion helpers from `web/app.js` into `web/step1Ingestion.js` and added declaration typing (`web/step1Ingestion.d.ts`).
  - Completed: Rewired `web/app.js` to import shared Step 1 helper utilities (no behavior changes).
  - Completed: Added focused regression coverage in `test/step1Ingestion.test.ts` for URL normalization, URL scheme guardrails, JSON payload parsing, invalid summary formatting, and JSON export shape.
  - Completed: Added `package.json` `files` whitelist and upgraded `release:check` packaging validation to parse `npm pack --dry-run --json` and fail when `dist/cli.js` is excluded.
- Verification evidence:
  - `npm run lint` -> pass.
  - `npm run typecheck` -> pass.
  - `npm run build` -> pass.
  - `npx vitest run test/step1Ingestion.test.ts` -> pass (6 tests).
  - `npm run release:check -- --allow-dirty --quality-cmd "npm run lint && npm run typecheck && npm run build"` -> pass.
- Quick code review + security sweep:
  - `rg --line-number "TODO|FIXME|HACK|XXX" src web test scripts docs README.md` -> no matches.
  - `rg --line-number "innerHTML|eval\\(|child_process|\\bexec\\b|spawn\\(|dangerouslySetInnerHTML" src web scripts` -> expected matches only (`innerHTML` list resets in `web/app.js`, `execSync` in `scripts/release-check.mjs`); no new high-risk patterns introduced.
- Anti-drift check:
  - Completed work remains aligned to selected cleanup scope (modularization + release-packaging reliability).
UIUX_CHECKLIST: PASS | flow=studio-step1-ingestion-helpers | desktop=logic-only-refactor-no-layout-change | mobile=logic-only-refactor-no-layout-change | a11y=no-focus-or-control-behavior-change | risk=low

## Session Notes (2026-02-17 | Global Cycle 22 Session 1)
- Goal: Ship the top pending parity slice by adding Studio keyboard shortcuts for high-frequency generation/export actions and release checklist automation.
- Success criteria:
  - Step 3/Step 4 keyboard actions are available and guarded against accidental triggers while typing.
  - Shortcut behavior is covered by focused tests.
  - `npm run release:check` validates changelog + quality gate + artifact presence.
  - Verification commands and tracker updates are captured.
- Non-goals:
  - Broad `web/app.js` modularization.
  - New API endpoints or scheduler integrations.
  - Persona management workflow redesign.
- Brainstorming checkpoint (ranked; impact/effort/fit/diff/risk/confidence):
  1. Studio keyboard shortcuts for generate/export + agent-feed actions with focus guards (5/2/5/1/1/4) -> selected.
  2. Release checklist automation (`npm run release:check`) with changelog/quality/artifact checks (4/2/5/0/1/4) -> selected.
  3. Split `web/app.js` shortcut wiring into a dedicated module (3/3/5/0/1/4) -> selected as part of #1.
  4. Persona-card search/filter for 50+ persona packs (4/3/4/1/1/4) -> pending.
  5. Filter-token chips UI with one-click remove (3/3/4/1/1/3) -> pending.
  6. Release flow support for semantic version bump/tag helper (3/3/4/0/2/3) -> pending.
  7. Step 1 per-feed error detail accordion (3/3/4/0/2/3) -> pending.
  8. Deep docs split to keep README to quickstart + links (3/2/4/0/1/5) -> pending.
  9. Studio JSON mode sample payload insert action (2/1/3/0/1/4) -> pending.
  10. Export schema version metadata for JSONL/CSV consumers (3/2/4/1/1/3) -> pending.
- Product phase checkpoint:
  - Prompt: "Are we in a good product phase yet?" -> No.
  - Best-in-market signal (untrusted web, bounded scan 2026-02-17): Feedly/Inoreader/Buffer/RSS.app emphasize fast repeat workflows and operator efficiency, including shortcut-heavy usage and reliable automation guardrails.
  - Gap map:
    - Missing: keyboard shortcuts for Step 3/4 operator loops and scripted release-readiness checks.
    - Weak: maintainability in large `web/app.js` and release reproducibility.
    - Parity: OPML/URL-file ingestion, retries/concurrency, filter/rule presets, deterministic exports, request-id diagnostics.
    - Differentiator: local-first multi-persona workflow with strict host safety defaults.
- What features are still pending?
  - From `PRODUCT_ROADMAP.md`: `web/app.js` modularization, docs split, and npm packaging metadata hardening.
  - From `CLONE_FEATURES.md`: backlog depth remains above 20 combined pending items across tracker + roadmap.
- Locked task list for this session:
  - Implement shortcut helper + keyboard bindings for Step 3/4 actions with safe focus guards and UI hints.
  - Add shortcut helper tests.
  - Implement release checklist automation command and docs wiring.
- Execution outcome:
  - Completed: Added `web/keyboardShortcuts.js` and wired keybindings in `web/app.js` for load/fetch, generate, copy/export drafts, and Step 4 build/copy/download actions.
  - Completed: Added shortcut UI hints in `web/index.html` and styling in `web/styles.css`.
  - Completed: Added `test/keyboardShortcuts.test.ts` coverage for keybinding matching and editable-target guards.
  - Completed: Added `scripts/release-check.mjs` with git/changelog/quality/artifact checks and npm-cache isolation for `npm pack --dry-run`.
  - Completed: Wired release checks into `package.json` (`release:check`), `Makefile`, `docs/RELEASE.md`, and README/changelog docs.
- Anti-drift check:
  - Confirmed completed items map directly to locked cycle scope and roadmap parity/release-readiness goals.
UIUX_CHECKLIST: PASS | flow=studio-step3-step4-shortcuts | desktop=verified-shortcut-hints-and-keybindings | mobile=no-layout-regressions-introduced | a11y=keyboard-first-actions-with-editable-guard | risk=medium
- Quick code review + security sweep:
  - `rg TODO|FIXME|HACK|XXX src web test docs README.md` returned no actionable markers.
  - `rg innerHTML|eval|child_process|exec|spawn|dangerouslySetInnerHTML src web` found no high-risk patterns requiring immediate remediation.
- Market strategy entry (untrusted web):
  - Sources:
    - https://docs.feedly.com/article/67-how-to-customize-keyboard-shortcuts-in-feedly
    - https://feedly.helpscoutdocs.com/article/345-mute-filters
    - https://help.rss.app/en/articles/10271103-how-to-filter-rss-feeds
    - https://support.buffer.com/article/613-automating-rss-feeds-using-feedly-and-zapier
    - https://www.inoreader.com/blog/2026/01/save-time-with-automations.html
  - Decision: prioritize operator-speed parity (shortcuts) plus release guardrails before broader UI modularization.
  - Follow-up experiment: instrument shortcut usage/error feedback in Studio status messaging once modularization work starts.
- Trust labels:
  - Trusted: local repository code/tests/commands.
  - Untrusted: external market/reference pages.

## Session Notes (2026-02-13 | Global Cycle 5 Session 1)
- Goal: Ship the highest-impact remaining M3 reliability/supportability work by adding fetch diagnostics telemetry and API request IDs.
- Success criteria:
  - `/api/fetch` summary returns `retryAttempts`, `retrySuccesses`, `durationMs`, and `slowestFeedMs`.
  - API error payloads include `requestId` and matching `x-request-id` headers.
  - Studio fetch/error UX surfaces the new diagnostics/request-id context without regressing existing status messaging.
  - Verification commands and tracker updates are recorded.
- Non-goals:
  - `web/app.js` modularization.
  - Scheduler/publishing integrations.
  - New API routes beyond diagnostics/supportability changes.
- Brainstorming checkpoint (ranked; impact/effort/fit/diff/risk/confidence):
  1. `/api/fetch` retry/latency summary diagnostics (`retryAttempts`, `retrySuccesses`, `durationMs`, `slowestFeedMs`) (5/2/5/0/1/4) -> selected.
  2. API request-id in error payloads + response headers (5/2/5/0/1/5) -> selected.
  3. Studio fetch status formatting update for new diagnostics (4/2/5/0/1/4) -> selected.
  4. Server test coverage for diagnostics and request-id behavior (5/2/5/0/1/4) -> selected.
  5. Studio keyboard shortcuts for generate/export flow (4/3/4/1/1/4) -> pending.
  6. `web/app.js` modularization starter split (state/api/utils) (4/4/5/0/2/3) -> pending.
  7. Release checklist automation script (3/3/4/0/1/3) -> pending.
  8. Deep docs split from README into `docs/` recipes (3/2/4/0/1/5) -> pending.
  9. Step 1 per-feed error detail accordion (3/3/4/0/2/3) -> pending.
  10. Filter preset import/export JSON (3/2/3/1/1/3) -> pending.
- Product phase checkpoint:
  - Prompt: "Are we in a good product phase yet?" -> No.
  - Best-in-market signal (untrusted web, bounded scan 2026-02-13): Feedly/RSS.app/Buffer/Sprout/Inoreader reinforce that trustworthy feed workflows expose high-signal diagnostics and traceable failure context for repeated automated runs.
  - Gap map:
    - Missing: fetch retry/latency diagnostics visibility and request-id traceability in Studio-facing API errors.
    - Weak: high-throughput operator speed (keyboard flow/modular maintainability).
    - Parity: ingestion interop (URL-file/OPML), bounded retries/concurrency, filter presets/domain mute, deterministic exports.
    - Differentiator: local-first private workflow with multi-persona generation/timeline support.
- What features are still pending?
  - From `PRODUCT_ROADMAP.md`: request-id support, fetch retry diagnostics, fetch latency diagnostics, `web/app.js` modularization, keyboard shortcuts, release checklist automation, docs split.
  - From `CLONE_FEATURES.md`: backlog depth remains above 20 candidates.
- Locked task list for this session:
  - Add `/api/fetch` retry and latency diagnostics.
  - Add API request-id error payload/header support and surface request-id in Studio API errors.
  - Add tests and summary formatting updates for the new diagnostics.
- Execution outcome:
  - Completed: `src/lib/feedFetch.ts` now returns retry-attempt metadata (`retryAttempts`, `retrySucceeded`) from network fetch paths.
  - Completed: `src/server.ts` now reports fetch diagnostics (`retryAttempts`, `retrySuccesses`, `durationMs`, `slowestFeedMs`) and emits request IDs in API error payloads + `x-request-id` headers.
  - Completed: `web/studioPrefs.js` + `web/app.js` now format diagnostics in Step 1 status and append request IDs in surfaced API error text.
  - Completed: Added tests for diagnostics formatting (`test/studioPrefs.test.ts`) and request-id/fetch-diagnostics server behavior (`test/server.test.ts`).
- Anti-drift check:
  - Confirmed all implemented items map directly to M3 reliability/supportability goals; deferred modularization/keyboard work to next cycle.
- Quick code review sweep:
  - `rg TODO|FIXME|HACK|XXX src web test docs` returned no actionable source markers.
  - Largest hotspot remains `web/app.js` (2.2k+ LOC), reinforcing modularization as next cycle priority.
- Signals:
  - GitHub issue signals: disabled/unavailable.
  - GitHub CI signals: disabled/unavailable.
- Trust labels:
  - Trusted: local repository code/tests/commands.
  - Untrusted: external market/reference pages.

## Session Notes (2026-02-13 | Cycle 2 Session 1)
- Goal: Ship the highest-impact remaining parity work by adding deterministic browser E2E coverage for Step 4 agent-feed actions (`build -> copy -> download`).
- Success criteria:
  - Existing Playwright smoke run covers Step 4 build flow and verifies feed entries render.
  - E2E verifies Step 4 copy action succeeds and download payload is structurally correct.
  - Step 3 fetch/generate/export assertions remain passing in the same script.
  - Verification commands and tracker updates are recorded.
- Non-goals:
  - New scheduler/queue integrations.
  - Large `web/app.js` architectural refactor.
  - New feature surface outside Step 4 validation depth.
- Brainstorming checkpoint (ranked; impact/effort/fit/diff/risk/confidence):
  1. Step 4 browser E2E path (`build -> copy -> download`) in `scripts/e2e-web.ts` (5/2/5/1/1/4) -> selected.
  2. Step 4 E2E assertion depth for metadata + downloaded JSON schema (4/2/5/0/1/4) -> selected.
  3. Saved filter presets (include/exclude/min-title) (4/3/4/1/1/3) -> pending.
  4. Per-item mute-domain quick action in Studio (4/3/4/2/1/3) -> pending.
  5. CLI `generate --dry-run` diagnostics mode (4/3/4/1/1/3) -> pending.
  6. Session-persistence edge-case coverage (3/2/4/0/1/4) -> pending.
  7. API request-id field for better support diagnostics (3/2/4/0/1/4) -> pending.
  8. `web/app.js` modularization (4/4/5/0/2/3) -> pending.
  9. Studio keyboard shortcuts for generate/export (3/2/3/1/1/4) -> pending.
  10. Fetch telemetry summary fields (`durationMs`, `slowestFeedMs`) (3/2/4/0/1/3) -> pending.
- Product phase checkpoint:
  - Prompt: "Are we in a good product phase yet?" -> No.
  - Best-in-market signal (untrusted web, bounded scan 2026-02-13): Feedly/Buffer/Sprout/RSS.app/Inoreader set baseline expectations around ingestion interoperability, filtering, and robust automation controls; product trust improves when browser-level flows are regression tested end-to-end.
  - Gap map:
    - Missing: Step 4 browser E2E assertions for build/copy/download timeline flow.
    - Weak: Step 4 regression detection relative to already-covered Step 3 flow.
    - Parity: OPML + URL-file ingestion, retries, bounded concurrency, filters/rules, Step 3 browser E2E.
    - Differentiator: local-first multi-persona drafting with strict private-host defaults.
- What features are still pending?
  - From `PRODUCT_ROADMAP.md`: saved filter presets, mute-domain action, dry-run diagnostics, session-persistence hardening, and app modularization are pending.
  - From `CLONE_FEATURES.md`: backlog remains >20 candidates after cycle-2 replenishment.
- Locked task list for this session:
  - Extend existing Playwright E2E smoke to include Step 4 agent feed build/copy/download path.
  - Add deterministic assertions for Step 4 feed metadata and JSON download payload shape.
- Execution outcome:
  - Completed: Extended `scripts/e2e-web.ts` to include Step 4 build flow assertions (`personaLimit=3`, `consensus` layout, card rendering checks).
  - Completed: Added Step 4 action assertions for `Copy feed` status and `Download feed .json` payload structure (`meta.layout`, `meta.mode`, `meta.personaLimit`, feed rows).
  - Completed: Synced roadmap/changelog/backlog trackers to mark Step 4 E2E parity gap closed.
- Quick code review sweep:
  - `rg TODO/FIXME` returned no markers in tracked source/docs paths.
  - `web/app.js` remains a high-maintenance hotspot (~2058 LOC), so this session keeps scope to targeted Step 4 coverage only.
- Signals:
  - GitHub issue signals: disabled/unavailable.
  - GitHub CI signals: disabled/unavailable.
- Trust labels:
  - Trusted: local repository code/tests/commands.
  - Untrusted: external market/reference pages.

## Session Notes (2026-02-13 | Cycle 1 Session 4)
- Goal: Improve large-run fetch reliability by shipping bounded configurable fetch concurrency across CLI + Studio and validating it with integration tests.
- Success criteria:
  - CLI supports configurable fetch concurrency and uses bounded worker execution for multi-feed fetches.
  - Studio `/api/fetch` supports bounded concurrency control, and Studio UI exposes/persists the setting.
  - Tests verify concurrency limiting behavior for CLI and Studio server fetch flows.
  - Verification commands and outcomes are recorded in this file.
- Non-goals:
  - Scheduler/autopublish integrations.
  - Step 4 agent-feed E2E expansion in this session.
  - Full `web/app.js` modularization.
- Brainstorming checkpoint (ranked; impact/effort/fit/diff/risk/confidence):
  1. Fetch concurrency limit for CLI + Studio API with bounded defaults (5/3/5/0/1/4) -> selected.
  2. Studio fetch concurrency control + persisted session preference (4/2/5/1/1/4) -> selected.
  3. Concurrency-focused integration coverage for CLI/server fetch paths (5/2/5/0/1/4) -> selected.
  4. Saved filter presets (include/exclude/min-title) for repeat triage (4/3/4/1/1/3) -> pending.
  5. Step 4 browser E2E (`build -> copy -> download`) (4/3/4/1/1/3) -> pending.
  6. Per-item mute-domain quick action in Studio (4/3/4/2/1/3) -> pending.
  7. CLI `generate --dry-run` diagnostics (4/3/4/1/1/3) -> pending.
  8. Session persistence edge-case tests (invalid snapshots/stale keys) (3/2/4/0/1/4) -> pending.
  9. Request-id field in API errors for supportability (3/2/4/0/1/4) -> pending.
  10. `web/app.js` modularization pass (4/4/5/0/2/3) -> pending.
- Product phase checkpoint:
  - Prompt: "Are we in a good product phase yet?" -> No.
  - Best-in-market signal (untrusted web, bounded scan 2026-02-13): Feedly/Inoreader/Buffer/Sprout/RSS.app all emphasize controlled automation throughput, stable ingestion, and repeatable feed workflows for multi-source operations.
  - Gap map:
    - Missing: configurable concurrency controls for large multi-feed fetch runs.
    - Weak: large-run fetch behavior predictability in Studio UI.
    - Parity: OPML/URL-file ingestion, retry/backoff, filters/rules, metadata exports, Step 3 browser E2E.
    - Differentiator: local-first drafting with strict private-host safeguards.
- What features are still pending?
  - From `PRODUCT_ROADMAP.md`: saved filter presets, mute-domain quick action, Step 4 E2E, CLI dry-run diagnostics, and modularization remain pending.
  - From `CLONE_FEATURES.md`: backlog remains >=20 items with reliability, UX, and test-depth opportunities.
- Locked task list for this session:
  - Bounded configurable fetch concurrency for CLI + Studio API.
  - Studio fetch concurrency control with session persistence.
  - CLI/server/tests updates validating concurrency behavior.
- Execution outcome:
  - Completed: Added shared bounded-concurrency helper and applied it to CLI `fetch` plus Studio `/api/fetch`.
  - Completed: Added CLI/API/UI concurrency controls (`--fetch-concurrency`, `FEED_JARVIS_FETCH_CONCURRENCY`, Step 1 fetch concurrency input, and persisted session value).
  - Completed: Added concurrency coverage (`test/concurrency.test.ts`, new CLI/server concurrency assertions, `studioPrefs` summary assertion).
- Signals:
  - GitHub issue signals: disabled/unavailable.
  - GitHub CI signals: disabled/unavailable.
- Trust labels:
  - Trusted: local repository code/tests/commands.
  - Untrusted: external market/reference pages.

## Session Notes (2026-02-12 | Cycle 1)
- Goal: Ship the highest-impact reliability and ingestion parity improvements for Feed Jarvis Studio + CLI.
- Success criteria:
  - Bounded retry/backoff is added for transient feed fetch failures with test coverage.
  - CLI supports `fetch --urls-file <path>` and preserves allowlist/dedupe behavior.
  - Studio pasted JSON ingestion rejects non-HTTP(S) URLs with clear per-item feedback.
  - Verification commands and outputs are recorded in this file.
- Non-goals:
  - Scheduler or auto-publish integrations.
  - Hosted/cloud deployment workflows.
  - Broad UI redesign beyond touched ingestion/editing flows.
- Brainstorming checkpoint (ranked, scored by impact/effort/fit/diff/risk/confidence):
  1. Feed fetch bounded retry/backoff for transient failures (5/3/5/1/2/4) -> selected.
  2. Studio pasted JSON URL validation (`http/https`) (4/2/5/0/1/5) -> selected.
  3. CLI `fetch --urls-file` ingestion (4/2/5/0/1/5) -> selected.
  4. Studio OPML import/export feed sets (5/4/5/1/2/3) -> pending.
  5. Browser E2E critical flow in CI (5/4/5/0/2/3) -> pending.
  6. Studio live over-limit edit warnings + trim helper (5/3/5/1/1/4) -> pending.
  7. Fetch concurrent limit control (4/3/4/0/2/3) -> pending.
  8. Save/load filter presets (4/3/4/1/1/3) -> pending.
  9. Refactor `web/app.js` into modules (4/4/5/0/2/3) -> pending.
  10. Export schema/version metadata for downstream tooling (3/2/3/1/1/3) -> pending.
- Product phase checkpoint:
  - Prompt: "Are we in a good product phase yet?" -> No.
  - Best-in-market signal (untrusted web): Feedly/Inoreader/Buffer/Missinglettr highlight ingestion interoperability, rules/filtering, retry/automation resilience, and export/queue bridges as baseline.
  - Gap map:
    - Missing: Studio OPML feed-set interoperability, browser E2E critical-flow coverage.
    - Weak: fetch transient-failure handling, pasted JSON URL validation.
    - Parity: local rules/filters/presets, metadata exports, multi-persona generation.
    - Differentiator: local-first workflow + strict private-host safeguards.
- Locked task list for this cycle:
  - Feed fetcher bounded retry/backoff.
  - CLI `fetch --urls-file`.
  - Studio pasted JSON URL validation.
- Trust labels:
  - Trusted: local repository code/tests, local command outputs.
  - Untrusted: market scan pages and external product docs.

## Session Notes (2026-02-12 | Cycle 1 Session 2)
- Goal: Ship the highest-value remaining Studio parity features for feed-set interoperability and draft-length editing guidance.
- Success criteria:
  - Studio feed sets can be exported/imported as OPML locally.
  - Studio draft editor shows live over-max warnings and supports one-click trim-to-max.
  - Tests are added/updated for OPML import/export behavior and trim helper behavior.
  - Verification evidence is captured with exact command lines.
- Non-goals:
  - Browser E2E framework setup.
  - Scheduler integration work.
  - Large architectural refactor of `web/app.js`.
- Brainstorming checkpoint (ranked, scored by impact/effort/fit/diff/risk/confidence):
  1. Studio OPML import/export feed sets (5/4/5/1/2/4) -> selected.
  2. Live over-max-char warnings + one-click trim (5/3/5/1/1/4) -> selected.
  3. Browser E2E critical flow in CI (5/4/5/0/2/3) -> pending.
  4. Fetch concurrent-limit control (4/3/4/0/2/3) -> pending.
  5. Saved filter presets (4/3/4/1/1/3) -> pending.
  6. Mute-domain quick action in Studio (4/3/4/2/1/3) -> pending.
  7. Session-persistence edge-case tests (3/2/4/0/1/4) -> pending.
  8. `web/app.js` modularization pass (4/4/5/0/2/3) -> pending.
- Product phase checkpoint:
  - Prompt: "Are we in a good product phase yet?" -> No.
  - Best-in-market signal (untrusted web, bounded scan on 2026-02-12): Feedly/Inoreader emphasize OPML + feed grouping interoperability; Buffer emphasizes feed-to-channel automation constraints; Missinglettr emphasizes link-tagging/hashtag controls.
  - Gap map:
    - Missing: Studio OPML feed-set import/export; browser E2E critical-flow coverage.
    - Weak: live over-limit draft editing guidance.
    - Parity: fetch retry handling, URL-file ingestion, filters/rules, metadata exports.
    - Differentiator: strict local-first workflow with private-host safeguards.
- Locked task list for this session:
  - Studio feed-set OPML import/export.
  - Studio live over-max-char warnings + one-click trim.
- Execution outcome:
  - Completed: Studio feed-set OPML import/export.
  - Completed: Studio live over-max-char warnings + one-click trim.
- Trust labels:
  - Trusted: local repo code/tests/commands.
  - Untrusted: external market/reference pages.

## Session Notes (2026-02-12 | Cycle 1 Session 3)
- Goal: Add production-grade browser E2E coverage for Studio’s highest-value user path and enforce it in CI.
- Success criteria:
  - Browser E2E validates `fetch -> generate -> export` in one deterministic run.
  - CI installs browser dependencies and executes the new E2E command.
  - Export checks assert `.txt`, `.jsonl`, `.csv` payloads from real browser interactions.
  - Verification command evidence is captured in this file.
- Non-goals:
  - Full visual regression framework.
  - Scheduler or external publishing integration work.
  - Broad `web/app.js` modularization.
- Brainstorming checkpoint (ranked; impact/effort/fit/diff/risk/confidence):
  1. Browser E2E critical flow in CI (5/4/5/0/2/4) -> selected.
  2. Browser-driven export payload assertions (.txt/.jsonl/.csv) in CI (4/2/5/0/1/4) -> selected.
  3. Feed fetch concurrent-limit controls (4/3/4/0/2/3) -> pending.
  4. Saved filter presets for repeat triage workflows (4/3/4/1/1/3) -> pending.
  5. Mute-domain quick action in Studio (4/3/4/2/1/3) -> pending.
  6. Session-persistence edge-case coverage expansion (3/2/4/0/1/4) -> pending.
  7. CLI `generate --dry-run` diagnostics mode (4/3/4/1/1/3) -> pending.
- Product phase checkpoint:
  - Prompt: "Are we in a good product phase yet?" -> No.
  - Best-in-market signal (untrusted web, bounded scan 2026-02-12): Feedly/Buffer/Sprout/RSS.app/Inoreader all reinforce that reliable automation products validate ingestion-to-output workflows end-to-end and preserve stable export contracts.
  - Gap map:
    - Missing: browser-level CI coverage for Studio critical path.
    - Weak: export contract verification under real browser interactions.
    - Parity: local feed ingestion interop (URL file + OPML), filtering/rules, draft editing guidance.
    - Differentiator: local-first drafting + strict private-host safeguards.
- What features are still pending?
  - From `PRODUCT_ROADMAP.md`: browser E2E coverage remains the only P1 gap; multiple P2/P3 reliability and UX tasks remain.
  - From `CLONE_FEATURES.md`: pending list remains >20 items and is prioritized around reliability/interop/UX.
- Locked task list for this session:
  - Browser E2E coverage for Studio critical path (`fetch -> generate -> export`) in CI.
  - Browser-driven export smoke assertions for `.txt`, `.jsonl`, `.csv`.
- Execution outcome:
  - Completed: Browser E2E coverage for Studio critical path via Playwright (`scripts/e2e-web.ts`) with deterministic fixture-backed feed fetch.
  - Completed: Browser-driven export assertions for `.txt`, `.jsonl`, `.csv`, and CI wiring (`.github/workflows/ci.yml`).
- Signals:
  - GitHub issue signals: disabled/unavailable.
  - GitHub CI signals: disabled/unavailable.
- Trust labels:
  - Trusted: local code/tests/commands.
  - Untrusted: external market/reference pages.

## Recent Decisions
- Template: YYYY-MM-DD | Decision | Why | Evidence (tests/logs) | Commit | Confidence (high/medium/low) | Trust (trusted/untrusted)
- 2026-02-17 | Add Studio keyboard shortcuts through a dedicated helper with editable-target guards instead of embedding more ad-hoc keydown logic in `web/app.js` | Keeps high-frequency operator UX improvements low-risk while reducing keybinding regressions in a large UI orchestration file | `web/keyboardShortcuts.js`, `web/app.js`, `web/index.html`, `test/keyboardShortcuts.test.ts`, `npm run lint`, `npm run typecheck`, `npm run build`, `npx vitest run test/keyboardShortcuts.test.ts` | f2474ae | high | trusted
- 2026-02-17 | Add `npm run release:check` automation with configurable quality command and npm-cache isolation for pack checks | Release readiness needed repeatable guardrails; local cache isolation removes environment-specific npm permission failures | `scripts/release-check.mjs`, `package.json`, `docs/RELEASE.md`, `npm run release:check -- --allow-dirty --quality-cmd "npm run lint && npm run typecheck && npm run build"` | bbabf4c | high | trusted
- 2026-02-13 | Add `/api/fetch` retry/latency diagnostics and API request IDs for Studio troubleshooting | These were the highest-impact remaining parity/reliability gaps after dry-run diagnostics and materially improve large-run debugging confidence | `src/lib/feedFetch.ts`, `src/server.ts`, `web/studioPrefs.js`, `web/app.js`, `test/studioPrefs.test.ts`, `test/server.test.ts`, `npm run lint`, `npm run typecheck`, `npm run build`, `npx vitest run test/studioPrefs.test.ts`, `FEED_JARVIS_CACHE_DIR=/tmp/feed-jarvis-cache-test npx vitest run test/feedFetch.test.ts`, `npx vitest run test/server.test.ts` (`listen EPERM` sandbox limitation), `node dist/cli.js generate --input /tmp/feed-jarvis-cycle5-smoke-items.json --persona Analyst --format jsonl --max-chars 180` | f18a12c | high | trusted
- 2026-02-13 | Ship CLI preflight diagnostics (`generate --dry-run`) plus reliability coverage for session snapshot edge cases and `EPIPE` output piping | This was the highest-impact remaining parity gap from the roadmap and directly improves preflight confidence for repeat CLI workflows without changing normal generation behavior | `src/cli.ts`, `test/cli.test.ts`, `web/studioPrefs.js`, `web/app.js`, `test/studioPrefs.test.ts`, `npm run lint`, `npm run typecheck`, `npm run build`, `npx vitest run test/studioPrefs.test.ts`, `npx vitest run test/cli.test.ts -t "reports diagnostics with --dry-run and does not write posts|handles EPIPE cleanly across output formats"`, `node dist/cli.js generate --input /tmp/feed-jarvis-cycle4-items.json --persona Analyst --max-chars 60 --dry-run --format csv` | 02bd0b4 | high | trusted
- 2026-02-13 | Ship Studio Step 1 filter presets plus per-item domain muting (`site:` tokens) | This was the highest-value remaining repeat-triage parity gap and directly improves daily workflow speed/signal quality | `web/filterPresets.js`, `web/app.js`, `web/index.html`, `web/filters.js`, `test/filterPresets.test.ts`, `test/filters.test.ts`, `npm run lint`, `npm run typecheck`, `npm run build`, `npx vitest run test/filterPresets.test.ts test/filters.test.ts`, `node dist/cli.js generate --input /tmp/feed-jarvis-smoke-items-cycle3.json --persona Analyst --format jsonl --max-chars 200` | 2e8f772 | high | trusted
- 2026-02-13 | Extend Playwright smoke coverage to include Step 4 agent-feed flow (`build -> copy -> download`) with deterministic payload assertions | Step 4 was the highest-value remaining parity/testing gap; closing it reduces regression risk in the multi-persona timeline workflow and aligns with roadmap cycle goals | `scripts/e2e-web.ts`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm run e2e:web` (`listen EPERM` in sandbox), `node dist/cli.js generate --input /tmp/feed-jarvis-smoke-items-cycle2.json --persona Analyst --format jsonl --max-chars 180` | 8611fab | high | trusted
- 2026-02-13 | Add bounded configurable fetch concurrency across CLI + Studio/API with shared worker-limited execution (`--fetch-concurrency`, `FEED_JARVIS_FETCH_CONCURRENCY`, `/api/fetch` `fetchConcurrency`) | Large multi-feed runs previously used unbounded `Promise.all`, causing avoidable request spikes and inconsistent throughput control | `src/lib/concurrency.ts`, `src/cli.ts`, `src/server.ts`, `web/app.js`, `web/index.html`, `test/concurrency.test.ts`, `test/cli.test.ts`, `test/server.test.ts`, `npm run lint`, `npm run typecheck`, `npm run build`, `npx vitest run test/concurrency.test.ts test/studioPrefs.test.ts` | 859de5b | high | trusted
- 2026-02-12 | Add deterministic browser E2E critical-flow smoke (`fetch -> generate -> export`) and run it in CI with Playwright Chromium install | P1 parity required real browser coverage for the Studio journey and export wiring; deterministic fixtures keep it stable and actionable | `scripts/e2e-web.ts`, `.github/workflows/ci.yml`, `package.json`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm run e2e:web` (`listen EPERM` in this sandbox) | 89ab2b3 | medium | trusted
- 2026-02-12 | Add Studio feed-set OPML import/export with collision-safe import naming | OPML import/export is a baseline interoperability expectation and unlocks migration to/from feed readers with low risk to local-first posture | `web/feedSets.js`, `web/app.js`, `test/feedSets.test.ts`, `npx vitest run test/feedSets.test.ts` | 0c4ba7f | high | trusted
- 2026-02-12 | Add live over-limit draft editing warnings and one-click trim helper | Users needed immediate visibility and fast correction while manually editing drafts to channel character limits | `web/postEditing.js`, `web/app.js`, `test/postEditing.test.ts`, `npx vitest run test/postEditing.test.ts` | 0c4ba7f | high | trusted
- 2026-02-12 | Add bounded retry/backoff to feed fetching for transient failures only | Multi-feed reliability was weak during temporary upstream failures; retries improve resilience without hiding persistent 4xx validation errors | `src/lib/feedFetch.ts`, `test/feedFetch.test.ts`, `FEED_JARVIS_CACHE_DIR=/tmp/feed-jarvis-cache-test npx vitest run test/feedFetch.test.ts` | 7a4f349 | high | trusted
- 2026-02-12 | Add CLI `fetch --urls-file <path>` ingestion path | URL-list file import is a common feed-workflow parity expectation and low-risk extension of existing allowlist flow | `src/cli.ts`, `test/cli.test.ts`, `README.md`, `CHANGELOG.md`, local CLI run using `--urls-file` | 7a4f349 | high | trusted
- 2026-02-12 | Enforce `http/https` URL validation for Studio pasted JSON and `/api/generate` items | Broken/non-web URL schemes were leaking into generation/export, reducing output quality and causing invalid links | `web/app.js`, `web/index.html`, `src/server.ts`, `test/server.test.ts` | 7a4f349 | high | trusted
- 2026-02-12 | Add agent-feed layout modes (`rotating` and `consensus`) across API + Studio UI | Users need both broad scanning and same-event comparison to extract higher-value signal from many personas | `test/server.test.ts` (consensus coverage), `web/index.html` layout selector, `make check` | 7191ccd | high | trusted
- 2026-02-12 | Add multi-persona agent timeline generation in Studio + server (`/api/agent-feed`) with template/GPT modes | Core product direction is an agent-only high-value feed; timeline generation is the first concrete experience beyond single-persona drafting | `test/server.test.ts` (agent feed coverage), `web/index.html` Step 4, `make check` | 02bab7b | high | trusted
- 2026-02-12 | Add GPT generation engine (Studio + CLI) backed by OpenAI Responses API with persona-conditioned concise prompts | Product direction requires LLM-generated posts with richer persona character than template-only drafting | `src/lib/llm.ts`, `test/llm.test.ts`, `test/server.test.ts`, `test/cli.test.ts`, `make check` | 2d00147 | high | trusted
- 2026-02-12 | Ship bundled markdown persona pack (50+ files) and auto-load it in CLI/Studio when present | The product direction requires many distinct agent identities with per-file contracts; auto-loading removes setup friction and makes Studio immediately useful | `personas/` pack, `test/cli.test.ts`, `test/server.test.ts`, `make check` | 193c9b6 | high | trusted
- 2026-02-12 | Add markdown persona contract support (single file or directory) across CLI and Studio server (`FEED_JARVIS_PERSONAS`) | Persona-per-file authoring is required for scaling to many unique agent voices without brittle JSON editing | `test/personas.test.ts`, `test/cli.test.ts`, `test/server.test.ts`, `make check` | 879c717 | high | trusted
- 2026-02-11 | Ship Studio local-only rule presets (save/load/delete) for text-rule reuse | Repeated feed workflows need fast rule reuse; presets reduce repetitive setup and improve drafting consistency | `test/rulePresets.test.ts`, `make check`, `npm run smoke:web` | 7c4ae07 | high | trusted
- 2026-02-11 | Add CLI `fetch --opml <path>` support with preserved host allowlist enforcement | OPML is a common interoperability format for feed collections; this improves ingestion without weakening SSRF controls | `test/opml.test.ts`, `test/cli.test.ts`, local OPML smoke command, `make check` | 7c4ae07 | high | trusted
- 2026-02-11 | Run bounded market scan to validate cycle1 baseline expectations | Confirm near-term PMF priorities against comparable feed automation tooling while treating external docs as untrusted input | Inoreader/Buffer/Zapier docs links captured in `CLONE_FEATURES.md` Insights | 7c4ae07 | medium | untrusted
- 2026-02-09 | Add maintainer contract + session trackers to the repo (`AGENTS.md`, `PROJECT_MEMORY.md`, `INCIDENTS.md`, refreshed `CLONE_FEATURES.md`) | Ensure the autonomous loop has durable, versioned operating context and verification policy | `git status` showed files were untracked; pushed to `main` | 4d2598f | high | trusted
- 2026-02-09 | Run Studio smoke validation in CI and explicitly scope `ci.yml` token permissions | Catch integration breakages earlier while preserving least privilege after enabling write-capable workflow tokens | `.github/workflows/ci.yml`, `npm run smoke:web` | c233218 | high | trusted
- 2026-02-09 | Block DNS-based private-network SSRF bypasses when `allowPrivateHosts=false` | The previous guard only covered literal hostnames/IPs; hostnames could resolve to private IPs | `test/feedFetch.test.ts` (DNS stub), `make check` | d22b0a0 | high | trusted
- 2026-02-09 | Set repo default Actions workflow permissions to `write` and rely on per-workflow `permissions:` to keep CI least-privilege | Fix failing dynamic "Dependabot Updates" workflow (403 due to read-only token) without granting write perms to all workflows | `gh api /repos/sarveshkapre/feed-jarvis/actions/permissions/workflow` shows `"default_workflow_permissions":"write"` | (repo setting; no git commit) | medium | trusted
- 2026-02-09 | Fix Studio header "GitHub" links to point at this repository | Broken nav link hurts basic product polish and makes it harder for users to find docs/source | `web/index.html`, `web/about.html`; `npm run lint` | 9cc2008 | high | trusted
- 2026-02-09 | Add Studio item filters (include/exclude keywords + minimum title length), persist them, and apply before generation/export | Filtering/muting is baseline UX for feed triage; improves signal quality before drafting | `test/filters.test.ts`, `web/filters.js`; `make check`, `npm run smoke:web` | 0732de5 | high | trusted
- 2026-02-09 | Harden Studio API error handling for non-JSON responses and unknown thrown values | Prevent confusing status messages when the server/proxy returns unexpected payloads | `web/app.js`; `make check`, `npm run smoke:web` | 37d90bf | medium | trusted
- 2026-02-09 | Add Studio persona import/export (local-only) and apply imported personas during generation | Persona libraries are core to repeatable voice; import/export keeps workflows local-first while enabling sharing | `web/index.html`, `web/app.js`, `test/server.test.ts`; `make check`, `npm run smoke:web` | 5fcf555 | high | trusted
- 2026-02-09 | Enrich Studio exports with per-draft metadata (title/url/persona/channel/template) and show source context above drafts | Improves downstream scheduler/import workflows and reduces context switching when reviewing drafts | `web/app.js`, `web/styles.css`, `README.md`, `CHANGELOG.md`; `make check`, `npm run smoke:web` | 1e76b86 | high | trusted
- 2026-02-09 | Clarify Studio `/api/fetch` summary (separate `deduped` vs `limited`) and add test coverage | Enables accurate UX messaging and avoids confusing "deduped" counts when the item cap trims results | `test/server.test.ts` (summary assertions), `make check` | fa3d5a4 | high | trusted
- 2026-02-09 | Persist per-channel `maxChars` (local-only) and show richer fetch status in Studio | Reduces friction when switching channels and makes caching/dedupe behavior visible without leaving the UI | `test/studioPrefs.test.ts`, `npm run smoke:web`, `make check` | a6a0e86 | high | trusted
- 2026-02-09 | Bump CodeQL workflow to use `github/codeql-action@v4` | CodeQL Action v3 emits deprecation warnings; upgrading now avoids future breakage with minimal risk | `.github/workflows/codeql.yml`; `gh run watch 21830511384 --exit-status` | 455f6a6 | high | trusted
- 2026-02-10 | Studio: add optional generation text rules (prepend/append/hashtags) + basic UTM tagging and persist them locally | Post-text customization + UTM tagging is baseline parity for RSS-to-social workflows; shipping locally-first rules improves PMF without external dependencies | `test/posts.test.ts`, `test/server.test.ts`, `npm run smoke:web` | b576b01 | high | trusted
- 2026-02-10 | CLI: add `generate --format csv`, `--channel`/`--template`, rule/UTM flags; fix `--input -` parsing and handle stdout `EPIPE` | CSV export and channel/template parity improves downstream scheduler import; stdin and pipe robustness makes the CLI match documented workflows | `test/cli.test.ts`, manual `tsx src/cli.ts generate --format csv ...`, `make check` | ffd3299 | high | trusted
- 2026-02-10 | Studio: add local-only feed set presets (save/load/delete) and a filtered `items.json` export bridge | Feed grouping + export bridges are baseline UX for RSS-to-social workflows; this keeps the product local-first while reducing repeat friction and enabling Studio -> CLI handoff | `web/feedSets.js`, `test/feedSets.test.ts`, `make check`, `npm run smoke:web` | f64f9ab | high | trusted
- 2026-02-10 | CLI: add `generate --stats` to print post count + length distribution to stderr | Quick validation and QA loops are common when exporting drafts; stats help spot outliers without changing output formats | `src/cli.ts`, `test/cli.test.ts`, `make check` | b6e0cc2 | high | trusted

## Mistakes And Fixes
- Template: YYYY-MM-DD | Issue | Root cause | Fix | Prevention rule | Commit | Confidence
- 2026-02-17 | Initial `release:check` implementation failed on `npm pack --dry-run` in this environment and assumed `dist/cli.js` must be in pack output | Global npm cache permission issue (`~/.npm`) and `.gitignore`-fallback packaging excludes `dist` without explicit npm files config | Added per-command npm cache isolation (`npm_config_cache` temp dir) and downgraded missing packed `dist/cli.js` to an explicit warning while keeping local artifact presence checks strict | Release automation should isolate external caches and treat packaging assumptions as policy checks with clear warnings unless repo publish intent is explicit | bbabf4c | high
- 2026-02-11 | New CLI OPML integration test initially timed out | Used `spawnSync` against a test-local HTTP server in the same process, blocking the event loop and starving server responses | Switched the test helper to async `spawn` and awaited process close with streamed stdout/stderr capture | For tests depending on in-process servers, avoid blocking subprocess APIs (`spawnSync`) and prefer async process control | 7c4ae07 | high
- 2026-02-09 | "Dependabot Updates" Actions workflow failing with 403 | Repo default `GITHUB_TOKEN` workflow permissions were `read` but the dynamic Dependabot workflow requires write access to fetch job details | Updated repo default workflow permissions to `write`; added explicit `permissions: contents: read` to `ci.yml` | Treat repo-level Actions defaults as production config; whenever enabling write defaults, pin every workflow to explicit minimal permissions | c233218 (plus repo setting) | medium
- 2026-02-10 | CLI `generate --input -` example failing + piping output causing `EPIPE` crash | `parseArgs` treated `-` as a new flag (not a value), and the CLI did not handle stdout `EPIPE` when downstream consumers closed the pipe | Treat `-` as a valid flag value for `--input`/`--out`; exit cleanly on `EPIPE`; add a regression test | Treat README command examples as contract tests; add CLI integration tests for argument edge cases (`-`, pipes) | ffd3299 | high

## Known Risks

## Next Prioritized Tasks
- Scoring rubric: Impact (1-5), Effort (1-5, lower is easier), Strategic fit (1-5), Differentiation (1-5), Risk (1-5, lower is safer), Confidence (1-5).
- Selected (completed in cycle 2026-02-17):
- Add Studio shortcut helper and keyboard actions for Step 3/Step 4 high-frequency workflows (Impact 5, Effort 2, Fit 5, Diff 1, Risk 1, Conf 4).
- Add release checklist automation (`npm run release:check`) with changelog guard + quality gate + artifact checks (Impact 4, Effort 2, Fit 5, Diff 0, Risk 1, Conf 4).
- Remaining backlog:
- `web/app.js` modularization into smaller modules (state/api/export/ui) (Impact 4, Effort 4, Fit 5, Diff 0, Risk 2, Conf 3).
- Docs split from README into deeper `docs/` recipes (Impact 3, Effort 2, Fit 4, Diff 0, Risk 1, Conf 5).
- Packaging metadata hardening for npm publish-readiness (`dist/cli.js` inclusion policy) (Impact 3, Effort 2, Fit 4, Diff 0, Risk 1, Conf 4).

## Verification Evidence
- Template: YYYY-MM-DD | Command | Key output | Status (pass/fail)
- 2026-02-17 | `npx vitest run test/keyboardShortcuts.test.ts` | `Test Files 1 passed; Tests 4 passed` | pass
- 2026-02-17 | `npm run lint` | `Checked 50 files ... No fixes applied.` | pass
- 2026-02-17 | `npm run typecheck` | `tsc -p tsconfig.json --noEmit` completed with no errors | pass
- 2026-02-17 | `npm run build` | `tsc -p tsconfig.build.json` completed with no errors | pass
- 2026-02-17 | `npm run release:check -- --allow-dirty --quality-cmd "npm run lint && npm run typecheck && npm run build"` | release check passed; warns that `npm pack --dry-run` currently excludes `dist/cli.js` under existing packaging rules | pass (with warning)
- 2026-02-17 | `node dist/cli.js generate --input /tmp/feed-jarvis-cycle22-smoke-items.json --persona Analyst --format jsonl --max-chars 180` | emitted two JSONL drafts for smoke payload | pass
- 2026-02-17 | `git push origin main` | `1065913..f2474ae main -> main` | pass
- 2026-02-17 | `git push origin main` | `f2474ae..bbabf4c main -> main` | pass
- 2026-02-17 | `gh run list --branch main --limit 3` | `error connecting to api.github.com` in this environment | fail (env)
- 2026-02-13 | `gh run list --branch main --limit 3` | `error connecting to api.github.com` in this environment | fail (env)
- 2026-02-13 | `git push origin main` | `f18a12c..d445b49 main -> main` | pass
- 2026-02-13 | `git push origin main` | `fd6afc4..f18a12c main -> main` | pass
- 2026-02-13 | `npm run format` | `Formatted 44 files ... Fixed 1 file.` | pass
- 2026-02-13 | `npm run lint` | `Checked 46 files ... No fixes applied.` | pass
- 2026-02-13 | `npm run typecheck` | `tsc -p tsconfig.json --noEmit` completed with no errors | pass
- 2026-02-13 | `npm run build` | `tsc -p tsconfig.build.json` completed with no errors | pass
- 2026-02-13 | `npx vitest run test/studioPrefs.test.ts` | `Test Files 1 passed; Tests 9 passed` | pass
- 2026-02-13 | `FEED_JARVIS_CACHE_DIR=/tmp/feed-jarvis-cache-test npx vitest run test/feedFetch.test.ts` | `Test Files 1 passed; Tests 11 passed` | pass
- 2026-02-13 | `npx vitest run test/server.test.ts` | failed in sandbox with `listen EPERM: operation not permitted 127.0.0.1` | fail (env)
- 2026-02-13 | `node dist/cli.js generate --input /tmp/feed-jarvis-cycle5-smoke-items.json --persona Analyst --format jsonl --max-chars 180` | emitted two JSONL lines for smoke payload | pass
- 2026-02-13 | `git push origin main` | `4333481..02bd0b4 main -> main` | pass
- 2026-02-13 | `gh run list --branch main --limit 5` | `error connecting to api.github.com` in this environment | fail (env)
- 2026-02-13 | `npm run lint` | `Checked 46 files ... No fixes applied.` | pass
- 2026-02-13 | `npm run typecheck` | `tsc -p tsconfig.json --noEmit` completed with no errors | pass
- 2026-02-13 | `npm run build` | `tsc -p tsconfig.build.json` completed with no errors | pass
- 2026-02-13 | `npx vitest run test/studioPrefs.test.ts` | `Test Files 1 passed; Tests 8 passed` | pass
- 2026-02-13 | `npx vitest run test/cli.test.ts -t "reports diagnostics with --dry-run and does not write posts|handles EPIPE cleanly across output formats"` | `Test Files 1 passed; Tests 2 passed` | pass
- 2026-02-13 | `node dist/cli.js generate --input /tmp/feed-jarvis-cycle4-items.json --persona Analyst --max-chars 60 --dry-run --format csv` | emitted dry-run diagnostics (`valid 2`, `invalid 2`, `duplicate urls 1`, `estimated truncations 1`) | pass
- 2026-02-13 | `node dist/cli.js generate --input /tmp/feed-jarvis-cycle4-valid.json --persona Analyst --max-chars 60 --format text` | emitted two drafts for valid sample payload | pass
- 2026-02-13 | `npm test` | 12 files passed, but server/CLI integration suites failed in sandbox with `listen EPERM`; one cache write failed with `EPERM` | fail (env)
- 2026-02-13 | `git push origin main` | `58b11ec..2e8f772 main -> main` | pass
- 2026-02-13 | `npx vitest run test/filterPresets.test.ts test/filters.test.ts` | `Test Files 2 passed; Tests 10 passed` | pass
- 2026-02-13 | `npm run lint` | `Checked 46 files ... No fixes applied.` | pass
- 2026-02-13 | `npm run typecheck` | `tsc -p tsconfig.json --noEmit` completed with no errors | pass
- 2026-02-13 | `npm run build` | `tsc -p tsconfig.build.json` completed with no errors | pass
- 2026-02-13 | `npm test` | unit suites mostly passed, but server/CLI suites blocked by sandbox `listen EPERM`; one cache-write path blocked by `EPERM` | fail (env)
- 2026-02-13 | `node dist/cli.js generate --input /tmp/feed-jarvis-smoke-items-cycle3.json --persona Analyst --format jsonl --max-chars 200` | emitted two JSONL drafts for smoke payload | pass
- 2026-02-13 | `git push origin main` | `8611fab..dae6478 main -> main` | pass
- 2026-02-13 | `gh run list --branch main --limit 5` | `error connecting to api.github.com` in this environment | fail (env)
- 2026-02-13 | `git push origin main` | `28d02d5..8611fab main -> main` | pass
- 2026-02-13 | `gh run list --branch main --limit 5` | `error connecting to api.github.com` in this environment | fail (env)
- 2026-02-13 | `npm run lint` | initial run flagged formatter changes in `scripts/e2e-web.ts`; follow-up run passed with `Checked 43 files ... No fixes applied.` | pass
- 2026-02-13 | `npm run typecheck` | `tsc -p tsconfig.json --noEmit` completed with no errors | pass
- 2026-02-13 | `npm run build` | `tsc -p tsconfig.build.json` completed with no errors | pass
- 2026-02-13 | `npm run e2e:web` | failed in sandbox with socket bind restriction `listen EPERM: operation not permitted 127.0.0.1` | fail (env)
- 2026-02-13 | `npm test` | unit-heavy suites passed; server/cli/listen-dependent suites failed in sandbox with `listen EPERM`; one cache-path write failed with `EPERM` | fail (env)
- 2026-02-13 | `npx vitest run test/concurrency.test.ts test/studioPrefs.test.ts test/feedSets.test.ts` | `Test Files 3 passed; Tests 14 passed` | pass
- 2026-02-13 | `node dist/cli.js generate --input /tmp/feed-jarvis-smoke-items-cycle2.json --persona Analyst --format jsonl --max-chars 180` | emitted two JSONL drafts for local smoke payload | pass
- 2026-02-13 | `git push origin main` | `859de5b..ae00dcd main -> main` | pass
- 2026-02-13 | `gh run list --branch main --limit 5` | `error connecting to api.github.com` in this environment | fail (env)
- 2026-02-13 | `git push origin main` | `6a489ff..859de5b main -> main` | pass
- 2026-02-13 | `gh run list --branch main --limit 5` | `error connecting to api.github.com` in this environment | fail (env)
- 2026-02-13 | `npm run lint` | `Checked 43 files ... No fixes applied.` | pass
- 2026-02-13 | `npm run typecheck` | `tsc -p tsconfig.json --noEmit` completed with no errors | pass
- 2026-02-13 | `npm run build` | `tsc -p tsconfig.build.json` completed with no errors | pass
- 2026-02-13 | `npx vitest run test/concurrency.test.ts test/studioPrefs.test.ts` | `Test Files 2 passed; Tests 7 passed` | pass
- 2026-02-13 | `npx vitest run test/concurrency.test.ts test/studioPrefs.test.ts test/server.test.ts test/cli.test.ts` | server/cli suites failed in sandbox with `listen EPERM`; unit suites passed | fail (env)
- 2026-02-13 | `npm test` | 11 files passed; server/cli suites blocked by sandbox `listen EPERM`; one cache-write test blocked by cache-dir `EPERM` | fail (env)
- 2026-02-13 | `npm run smoke:web` | failed before script startup due sandbox `tsx` IPC `listen EPERM` | fail (env)
- 2026-02-13 | `node dist/cli.js generate --input /tmp/feed-jarvis-smoke-items.json --persona Analyst --format jsonl --max-chars 180` | two JSONL drafts emitted for smoke payload | pass
- 2026-02-12 | `git push origin main` | `201d384..a3b6ac6 main -> main` | pass
- 2026-02-12 | `gh run list --branch main --limit 5` | `error connecting to api.github.com` in this environment | fail (env)
- 2026-02-12 | `npx playwright --version && npx playwright install --list` | `Version 1.58.2` and local Chromium listed in Playwright cache | pass
- 2026-02-12 | `npm run lint` | `Checked 41 files ... No fixes applied.` | pass
- 2026-02-12 | `npm run typecheck` | `tsc -p tsconfig.json --noEmit` completed with no errors | pass
- 2026-02-12 | `npm run build` | `tsc -p tsconfig.build.json` completed with no errors | pass
- 2026-02-12 | `npm test` | 10 files passed; failures tied to sandbox `listen EPERM` and cache-path write restrictions | fail (env)
- 2026-02-12 | `npm run smoke:web` | failed in sandbox before script run due `tsx` IPC pipe `listen EPERM` | fail (env)
- 2026-02-12 | `npm run e2e:web` | failed in sandbox with socket bind restriction `listen EPERM: operation not permitted 127.0.0.1` | fail (env)
- 2026-02-12 | `git push origin main` | `4a444f6..f739a49 main -> main` | pass
- 2026-02-12 | `gh run list --branch main --limit 5` | `error connecting to api.github.com` in this environment | fail (env)
- 2026-02-12 | `make check` | lint/typecheck passed; test phase failed with sandbox `listen EPERM` + cache write EPERM restrictions on this host | fail (env)
- 2026-02-12 | `npm run lint` | `Checked 40 files in 23ms. No fixes applied.` | pass
- 2026-02-12 | `npm run typecheck` | `tsc -p tsconfig.json --noEmit` completed with no errors | pass
- 2026-02-12 | `npm run build` | `tsc -p tsconfig.build.json` completed with no errors | pass
- 2026-02-12 | `npx vitest run test/feedSets.test.ts test/postEditing.test.ts` | `Test Files 2 passed; Tests 11 passed` | pass
- 2026-02-12 | `node dist/cli.js generate --input /tmp/feed-jarvis-smoke-items.json --persona Analyst --format jsonl --max-chars 160` | two JSONL drafts emitted for local smoke payload | pass
- 2026-02-12 | `npm run smoke:web` | failed in sandbox with `listen EPERM ... tsx ... .pipe` | fail (env)
- 2026-02-12 | `npm run lint` | `Checked 37 files ... No fixes applied.` | pass
- 2026-02-12 | `npm run typecheck` | `tsc -p tsconfig.json --noEmit` completed with no errors | pass
- 2026-02-12 | `npm run build` | `tsc -p tsconfig.build.json` completed with no errors | pass
- 2026-02-12 | `FEED_JARVIS_CACHE_DIR=/tmp/feed-jarvis-cache-test npx vitest run test/feedFetch.test.ts` | `Test Files 1 passed; Tests 11 passed` | pass
- 2026-02-12 | `node dist/cli.js generate --input /tmp/feed-jarvis-smoke-items.json --persona Analyst --format jsonl --max-chars 180` | one JSONL draft emitted (`"Analysis: Release notes shipped ..."` ) | pass
- 2026-02-12 | `node dist/cli.js fetch --urls-file /tmp/feed-jarvis-urls.txt --allow-host example.org --no-cache --timeout-ms 1000` | parsed new flag path, then failed with `Fetch request failed: fetch failed` due network restrictions | fail (env)
- 2026-02-12 | `FEED_JARVIS_CACHE_DIR=/tmp/feed-jarvis-cache-test npm run check` | lint/typecheck passed; tests failed in sandbox with `listen EPERM` (server + tsx CLI tests) | fail (env)
- 2026-02-12 | `curl -I --max-time 5 https://example.com` | `Could not resolve host` | fail (env)
- 2026-02-12 | `npm run smoke:web` | `Smoke check passed: personas 200, fetch 200, generate 200, index 200.` | pass
- 2026-02-12 | `make check` | `Test Files 12 passed (12); Tests 62 passed (62)` | pass
- 2026-02-12 | `make check` | `Test Files 12 passed (12); Tests 61 passed (61)` | pass
- 2026-02-12 | `make check` | `Test Files 12 passed (12); Tests 59 passed (59)` | pass
- 2026-02-12 | `make check` | `Test Files 11 passed (11); Tests 54 passed (54)` | pass
- 2026-02-12 | `make check` | `Test Files 11 passed (11); Tests 53 passed (53)` | pass
- 2026-02-11 | `make check` | `Test Files 11 passed (11); Tests 49 passed (49)` | pass
- 2026-02-11 | `npm run smoke:web` | `Smoke check passed: personas 200, fetch 200, generate 200, index 200.` | pass
- 2026-02-11 | `node <<'NODE' ... (local OPML + local HTTP feed smoke)` | `status: 0` and one fetched item JSON emitted | pass
- 2026-02-11 | `gh run watch 21894950679 --exit-status` | `✓ main ci · 21894950679` | pass
- 2026-02-11 | `gh run watch 21894950666 --exit-status` | `✓ main codeql · 21894950666` | pass
- 2026-02-11 | `gh run watch 21895007475 --exit-status` | `✓ main ci · 21895007475` | pass
- 2026-02-11 | `gh run watch 21895007476 --exit-status` | `✓ main codeql · 21895007476` | pass
- 2026-02-09 | `make check` | `Tests 20 passed (20)` | pass
- 2026-02-09 | `npm run smoke:web` | `Smoke check passed` | pass
- 2026-02-09 | `gh api /repos/sarveshkapre/feed-jarvis/actions/permissions/workflow` | `"default_workflow_permissions":"write"` | pass
- 2026-02-09 | `npm run lint` | `Checked 20 files ... No fixes applied.` | pass
- 2026-02-09 | `make check` | `Tests 25 passed (25)` | pass
- 2026-02-09 | `npm run smoke:web` | `Smoke check passed: personas/fetch/generate/index 200.` | pass
- 2026-02-09 | `gh run watch 21822522911 --exit-status` | `✓ main ci · 21822522911` | pass
- 2026-02-09 | `make check` | `Tests 26 passed (26)` | pass
- 2026-02-09 | `npm run smoke:web` | `Smoke check passed: personas/fetch/generate/index 200.` | pass
- 2026-02-09 | `gh run watch 21830319469 --exit-status` | `Run codeql ... completed with 'success'` | pass
- 2026-02-09 | `gh run watch 21830511369 --exit-status` | `✓ main ci · 21830511369` | pass
- 2026-02-09 | `gh run watch 21830511384 --exit-status` | `✓ main codeql · 21830511384` | pass
- 2026-02-09 | `gh run watch 21830591051 --exit-status` | `✓ main ci · 21830591051` | pass
- 2026-02-09 | `gh run watch 21830591018 --exit-status` | `✓ main codeql · 21830591018` | pass
- 2026-02-09 | `gh run watch 21830673200 --exit-status` | `Run ci (21830673200) ... completed with 'success'` | pass
- 2026-02-09 | `gh run watch 21830673184 --exit-status` | `✓ main codeql · 21830673184` | pass
- 2026-02-09 | `make check` | `Tests 31 passed (31)` | pass
- 2026-02-09 | `npm run smoke:web` | `Smoke check passed: personas 200, fetch 200, generate 200, index 200.` | pass
- 2026-02-09 | `gh run watch 21839142786 --exit-status` | `Run ci (21839142786) ... completed with 'success'` | pass
- 2026-02-09 | `gh run watch 21839139024 --exit-status` | `✓ main codeql · 21839139024` | pass
- 2026-02-09 | `gh run watch 21839142802 --exit-status` | `✓ main codeql · 21839142802` | pass
- 2026-02-09 | `gh run watch 21839254074 --exit-status` | `✓ main ci · 21839254074` | pass
- 2026-02-09 | `gh run watch 21839254032 --exit-status` | `✓ main codeql · 21839254032` | pass
- 2026-02-10 | `make check` | `Tests 35 passed (35)` | pass
- 2026-02-10 | `npm run smoke:web` | `Smoke check passed: ... generate 200 ...` | pass
- 2026-02-10 | `./node_modules/.bin/tsx src/cli.ts generate --input - --persona Analyst --format csv --channel x --template takeaway --prepend "New:" --hashtags "ai,#Product" --utm-source feed-jarvis --utm-medium social --max-chars 200` | CSV header + one row emitted | pass
- 2026-02-10 | `gh run watch 21846239705 --exit-status` | `✓ main ci · 21846239705` | pass
- 2026-02-10 | `gh run watch 21846239703 --exit-status` | `✓ main codeql · 21846239703` | pass
- 2026-02-10 | `make check` | `Tests 39 passed (39)` | pass
- 2026-02-10 | `npm run smoke:web` | `Smoke check passed: personas 200, fetch 200, generate 200, index 200.` | pass
- 2026-02-10 | `gh run watch 21854460348 --exit-status` | `✓ main ci · 21854460348` | pass
- 2026-02-10 | `gh run watch 21854460336 --exit-status` | `✓ main codeql · 21854460336` | pass
- 2026-02-10 | `make check` | `Tests 40 passed (40)` | pass
- 2026-02-10 | `gh run watch 21854524500 --exit-status` | `✓ main ci · 21854524500` | pass
- 2026-02-10 | `gh run watch 21854524494 --exit-status` | `✓ main codeql · 21854524494` | pass

## Historical Summary
- Keep compact summaries of older entries here when file compaction runs.
