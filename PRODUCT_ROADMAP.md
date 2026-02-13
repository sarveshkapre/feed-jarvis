# Product Roadmap

## Product Goal
- Keep feed-jarvis production-ready. Current focus: Feed Jarvis Studio (`feed-jarvis`). Find the highest-impact pending work, implement it, test it, and push to main.

## Good Product Phase Status
- Status: `No` (checkpoint run on 2026-02-13).
- Why not yet: core local-first workflows are strong, but parity gaps remain in repeat-workflow UX and diagnostics depth for high-volume runs.

## Definition Of Done
- Core Studio + CLI workflows are complete for repeated daily use.
- High-value parity features are shipped for feed ingestion, filtering, generation, and export.
- No open critical reliability or data-loss issues in fetch/generate flows.
- Lint/typecheck/test/build and smoke checks pass locally and are documented.
- README/docs/tracker files reflect actual behavior and remaining gaps.

## Milestones
- M1 Foundation (completed): local-first Studio + CLI baseline, tests and CI checks.
- M2 Core Features (completed): persona/rules/filter/export features, OPML fetch in CLI, agent feed, GPT mode.
- M3 Reliability + Interop (current): fetch robustness, ingestion compatibility, validation guardrails.
- M4 UX Polish + Throughput: faster review/edit loops, richer edit guidance, keyboard efficiency.
- M5 Release Readiness: end-to-end coverage, release automation, docs hardening.

## Current Milestone
- M3 Reliability + Interop

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
- P2: Add server-side request id in API error payloads for faster troubleshooting in Studio.
- P2: Add `/api/fetch` retry summary fields (`retryAttempts`, `retrySuccesses`) for better large-run diagnostics.
- P2: Add `/api/fetch` latency summary fields (`durationMs`, `slowestFeedMs`) for troubleshooting slow feed batches.
- P3: Refactor `web/app.js` into smaller modules (state/api/exporters/ui binding).
- P3: Studio keyboard shortcuts for generation/export actions.
- P3: Release checklist automation (version bump + changelog guard + artifact verify).
- P3: Docs split: keep README compact and move deep recipes to `docs/`.

## Delivered Features (Recent)
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
- Add `/api/fetch` retries/latency diagnostics in summary payloads for large-run troubleshooting.
- Add API request-id support in error payloads to improve supportability from Studio UI errors.
- Continue reliability hardening for large feed sets while reducing maintenance risk in `web/app.js`.
