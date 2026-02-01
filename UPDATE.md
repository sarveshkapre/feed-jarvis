# UPDATE

## 2026-02-01
- Shipped: `feed-jarvis personas`, `--version`, richer `--help`.
- Shipped: `generate --input -` (stdin), `--format json`, and `--max-chars`.
- Shipped: `--personas personas.json` to load persona definitions from a file (overrides built-ins).
- Shipped: `fetch --url ... --allow-host ...` to convert RSS/Atom feeds into events JSON (cached, size/time-limited).
- Improved: `fetch` supports repeated `--url`, dedupes by event URL (disable with `--no-dedupe`), and enforces allowlist across redirects.
- Improved: conditional requests with `ETag`/`Last-Modified` when caching.
- Improved: `fetch --stats` prints a fetch summary to stderr.
- Improved: `generate` supports `--out posts.txt` and `--format jsonl`.
- Hardening: guaranteed max-length posts even with extremely long URLs; clearer input validation errors.

## Verify
- `make check`

## Push
- No git remote is configured yet. To publish:
  - `git remote add origin <your-repo-url>`
  - `git push -u origin main`
