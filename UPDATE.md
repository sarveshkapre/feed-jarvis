# UPDATE

## 2026-02-08
- Fixed: restored CI by applying required Biome lint/format changes.
- Added: server integration tests for `/api/personas`, `/api/fetch`, `/api/generate`, and unknown API route handling.
- Hardened: Studio `/api/fetch` now blocks localhost/private-network hosts by default to reduce SSRF risk in shared environments.
- Added: explicit Studio override for trusted local feeds via `FEED_JARVIS_ALLOW_PRIVATE_HOSTS=true`.
- Improved: Studio remembers source mode and core form settings using `localStorage`.
- Hardened: persona cards now render with safe DOM APIs (no `innerHTML` templating).
- Added: `npm run smoke:web` deterministic smoke check for Studio static + API flow.

## 2026-02-01
- Shipped: `feed-jarvis personas`, `--version`, richer `--help`.
- Shipped: `generate --input -` (stdin), `--format json`, and `--max-chars`.
- Shipped: `--personas personas.json` to load persona definitions from a file (overrides built-ins).
- Shipped: `fetch --url ... --allow-host ...` to convert RSS/Atom feeds into events JSON (cached, size/time-limited).
- Improved: `fetch` supports repeated `--url`, dedupes by event URL (disable with `--no-dedupe`), and enforces allowlist across redirects.
- Improved: conditional requests with `ETag`/`Last-Modified` when caching.
- Improved: `fetch --stats` prints a fetch summary to stderr.
- Improved: `fetch --stale-if-error` serves stale cache on failures.
- Improved: `generate` supports `--out posts.txt` and `--format jsonl`.
- Hardening: guaranteed max-length posts even with extremely long URLs; clearer input validation errors.

## Verify
- `make check`

## Push
- No git remote is configured yet. To publish:
  - `git remote add origin <your-repo-url>`
  - `git push -u origin main`
