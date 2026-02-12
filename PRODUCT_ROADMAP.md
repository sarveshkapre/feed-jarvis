# Product Roadmap

## Product Goal
- Keep feed-jarvis production-ready. Current focus: Feed Jarvis Studio (`feed-jarvis`). Find the highest-impact pending work, implement it, test it, and push to main.

## Good Product Phase Status
- Status: `No` (checkpoint run on 2026-02-12).
- Why not yet: core local-first workflows are strong, but parity gaps remain in ingestion interoperability and reliability hardening for multi-feed runs.

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

## Locked Cycle Scope (2026-02-12 | Session 2)
- [x] P1: Studio OPML import/export for saved feed sets (local-only interoperability).
- [x] P1: Studio live over-max-char warnings while editing drafts + one-click trim suggestion.

## Locked Cycle Scope (2026-02-12)
- [x] P1: Feed fetcher bounded retry/backoff for transient 5xx/network/timeout failures (honor timeout + stale-if-error).
- [x] P1: CLI `fetch --urls-file <path>` for newline-delimited feed URLs with existing dedupe + allowlist flow.
- [x] P1: Studio pasted JSON URL validation (`http/https` only) with actionable user feedback.

## Pending Features (What Is Still Pending?)
- P1: Browser-level Studio E2E coverage for critical flow (fetch -> generate -> export) in CI.
- P2: Fetcher configurable concurrent-fetch limit for large multi-feed runs.
- P2: Studio saved filter presets (include/exclude/min-title) for repeat triage workflows.
- P2: Studio per-item quick action to mute a domain into exclusion filters.
- P2: CLI `generate --dry-run` diagnostics (invalid items, duplicate URLs, truncation counts).
- P2: CSV/JSONL export smoke assertions in CI (headers + metadata columns).
- P2: Targeted session-persistence edge-case tests (invalid snapshots, stale keys, partial payloads).
- P2: CLI regression tests for `EPIPE` across text/json/jsonl/csv output formats.
- P3: Refactor `web/app.js` into smaller modules (state/api/exporters/ui binding).
- P3: Studio keyboard shortcuts for generation/export actions.
- P3: Release checklist automation (version bump + changelog guard + artifact verify).
- P3: Docs split: keep README compact and move deep recipes to `docs/`.

## Delivered Features (Recent)
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
- Risk: no browser-level CI coverage yet for the end-to-end Studio user journey (fetch -> generate -> export).
- Risk: large pending UX work in `web/app.js` carries rising maintenance cost until modularized.
- Active blockers: none currently.

## Next Cycle Goals
- Complete remaining P1 parity item (Studio E2E critical flow coverage).
- Reduce manual QA cost via expanded smoke and E2E checks.
- Continue reliability hardening for large feed sets (concurrency controls and clearer diagnostics).
