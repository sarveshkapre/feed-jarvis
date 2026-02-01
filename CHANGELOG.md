# CHANGELOG

## Unreleased
- CLI: add `personas`, `--version`, and improved `--help`.
- CLI: add `fetch` to convert RSS/Atom feeds into the events JSON format (explicit allowlist + caching).
- CLI: `generate` supports `--input -`, `--format json`, and `--max-chars`.
- CLI: `--personas` loads persona definitions from a JSON file (overrides built-ins).
- Posts: always respect `maxChars` even with extremely long URLs.

## 0.0.0
- Initial scaffold.
