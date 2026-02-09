# CHANGELOG

## Unreleased
- Studio UI: import/export personas as JSON (local-only, stored in `localStorage`).
- Studio UI: exports (`.jsonl`/`.csv`) now include source + persona metadata for each draft.
- Studio UI: show the source title/link above each generated draft card.
- Studio UI: remember per-channel `maxChars` (local-only) so switching channels restores the last-used value per channel.
- Studio UI: fetch status now includes cache vs network and dedupe/trim summary details.
- Studio server: `/api/fetch` summary now separates `deduped` vs `limited`.
- CLI: add `personas`, `--version`, and improved `--help`.
- CLI: add `fetch` to convert RSS/Atom feeds into the events JSON format (explicit allowlist + caching).
- CLI: `fetch` supports multiple `--url` values, url-based dedupe (default on), and allowlist-enforced redirects.
- Fetch: honors `ETag`/`Last-Modified` for conditional requests when caching.
- Fetch: `--stats` prints fetch summary to stderr.
- Fetch: `--stale-if-error` serves stale cache when the network fails.
- Fetch: when private hosts are disabled, block hostnames that resolve via DNS to private/local IP ranges.
- CLI: `generate` supports `--out` and `--format jsonl`.
- CLI: `generate` supports `--input -`, `--format json`, and `--max-chars`.
- CLI: `--personas` loads persona definitions from a JSON file (overrides built-ins).
- Posts: always respect `maxChars` even with extremely long URLs.
- Studio server: expose `createStudioServer`/`startStudioServer` for integration tests and smoke tooling.
- Studio fetch safety: block localhost/private-network feeds by default (`FEED_JARVIS_ALLOW_PRIVATE_HOSTS=true` to override intentionally).
- Studio UI: persist source/mode/persona/channel/form state to `localStorage`.
- Studio UI: add item filters (include/exclude keywords + minimum title length) before generation/export.
- Studio UI: harden API error handling for non-JSON responses and unknown thrown values.
- Studio UI: fix the header "GitHub" link to point at this repository.
- Studio UI: remove `innerHTML` persona rendering path to avoid DOM injection risk.
- Testing: add server integration tests for personas, generate, fetch guardrails, and API 404 handling.
- DevEx: add `npm run smoke:web` for deterministic local Studio API smoke validation.
- CI: run `npm run smoke:web` in GitHub Actions.

## 0.0.0
- Initial scaffold.
