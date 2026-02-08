# CHANGELOG

## Unreleased
- CLI: add `personas`, `--version`, and improved `--help`.
- CLI: add `fetch` to convert RSS/Atom feeds into the events JSON format (explicit allowlist + caching).
- CLI: `fetch` supports multiple `--url` values, url-based dedupe (default on), and allowlist-enforced redirects.
- Fetch: honors `ETag`/`Last-Modified` for conditional requests when caching.
- Fetch: `--stats` prints fetch summary to stderr.
- Fetch: `--stale-if-error` serves stale cache when the network fails.
- CLI: `generate` supports `--out` and `--format jsonl`.
- CLI: `generate` supports `--input -`, `--format json`, and `--max-chars`.
- CLI: `--personas` loads persona definitions from a JSON file (overrides built-ins).
- Posts: always respect `maxChars` even with extremely long URLs.
- Studio server: expose `createStudioServer`/`startStudioServer` for integration tests and smoke tooling.
- Studio fetch safety: block localhost/private-network feeds by default (`FEED_JARVIS_ALLOW_PRIVATE_HOSTS=true` to override intentionally).
- Studio UI: persist source/mode/persona/channel/form state to `localStorage`.
- Studio UI: remove `innerHTML` persona rendering path to avoid DOM injection risk.
- Testing: add server integration tests for personas, generate, fetch guardrails, and API 404 handling.
- DevEx: add `npm run smoke:web` for deterministic local Studio API smoke validation.

## 0.0.0
- Initial scaffold.
