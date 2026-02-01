# CHANGELOG

## Unreleased
- CLI: add `personas`, `--version`, and improved `--help`.
- CLI: add `fetch` to convert RSS/Atom feeds into the events JSON format (explicit allowlist + caching).
- CLI: `fetch` supports multiple `--url` values, url-based dedupe (default on), and allowlist-enforced redirects.
- Fetch: honors `ETag`/`Last-Modified` for conditional requests when caching.
- Fetch: `--stats` prints fetch summary to stderr.
- CLI: `generate` supports `--out` and `--format jsonl`.
- CLI: `generate` supports `--input -`, `--format json`, and `--max-chars`.
- CLI: `--personas` loads persona definitions from a JSON file (overrides built-ins).
- Posts: always respect `maxChars` even with extremely long URLs.

## 0.0.0
- Initial scaffold.
