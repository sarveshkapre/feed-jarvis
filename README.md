# Feed Jarvis Studio (`feed-jarvis`)

Local-first studio + CLI that turns RSS/JSON feeds into on-brand social drafts.

## Studio quickstart

```bash
make setup
npm run dev:web
```

Open `http://localhost:4321` and walk through the three-step flow: load items, choose a persona, export multi-channel drafts.
Then optionally build a multi-persona timeline in Step 4 (Agent feed).

Run a local smoke verification:

```bash
npx playwright install chromium
npm run smoke:web
npm run e2e:web
```

`npm run e2e:web` validates `fetch -> generate -> export` plus Step 4 agent-feed `build -> copy -> download`.

Studio feed safety defaults:

```bash
# Optional: allow localhost/private-network feeds for trusted local testing
FEED_JARVIS_ALLOW_PRIVATE_HOSTS=true npm run dev:web
```

Enable GPT generation in Studio (optional):

```bash
OPENAI_API_KEY=your_key_here npm run dev:web
```

Then choose `Engine: GPT (OpenAI)` in Step 3.

## CLI quickstart

```bash
make setup
echo '[{"title":"Hello world","url":"https://example.com"}]' > events.json
npm run dev -- generate --input events.json --persona "Analyst"
```

Generate drafts as CSV (for scheduler import) with optional text rules:

```bash
cat events.json | npm run dev -- generate --input - --persona Analyst --format csv \
  --channel x --template takeaway \
  --prepend "New:" --hashtags "ai,#Product" \
  --utm-source feed-jarvis --utm-medium social > drafts.csv
```

Run a preflight diagnostics pass before generating/exporting drafts:

```bash
npm run dev -- generate --input events.json --persona Analyst --dry-run --max-chars 280
```

`--dry-run` validates input and prints diagnostics for valid/invalid items, duplicate URLs, and estimated truncation counts without writing post output.

Generate posts with OpenAI (GPT) instead of template rules:

```bash
OPENAI_API_KEY=your_key_here npm run dev -- generate \
  --input events.json \
  --persona "Macro Hawk" \
  --llm \
  --llm-model gpt-4.1-mini
```

Load personas from markdown files (single file or directory):

```bash
npm run dev -- personas --personas personas/
npm run dev -- generate --input events.json --persona "Macro Hawk" --personas personas/
```

Bundled persona pack:
- Repository includes `personas/` with 50+ unique persona contracts.
- CLI and Studio auto-load this bundled pack when present.

Fetch from an RSS/Atom feed (requires explicit allowlist):

```bash
npm run dev -- fetch --url https://example.com/rss.xml --allow-host example.com > events.json
npm run dev -- fetch --url https://example.com/rss.xml --allow-host example.com --stats > events.json
npm run dev -- fetch --url https://example.com/rss.xml --allow-host example.com --stale-if-error > events.json
npm run dev -- fetch --urls-file feeds.txt --allow-host example.com --fetch-concurrency 4 > events.json
npm run dev -- generate --input events.json --persona Analyst
```

Fetch from a newline-delimited URL file:

```bash
npm run dev -- fetch --urls-file feeds.txt --allow-host example.com --allow-host news.example.com > events.json
```

Fetch from a local OPML file (still requires explicit allowlist hosts):

```bash
npm run dev -- fetch --opml feeds.opml --allow-host example.com --allow-host news.example.com > events.json
```

## What it does
- Studio: three-step workspace to fetch items, pick a persona, and edit/export drafts.
- Local-first: feeds and drafts never leave your machine.
- Studio persistence: remembers your input mode and form settings across refreshes.
- Studio JSON input: validates URLs as `http/https` and reports skipped invalid entries.
- Studio fetch controls: tune `max items`, `dedupe`, and fetch concurrency (`1-20`) for large URL batches.
- Studio keyboard shortcuts: `Ctrl/Cmd + Enter` fetch/load, `Ctrl/Cmd + Shift + Enter` generate, `Ctrl/Cmd + Shift + E` export JSONL drafts, and Step 4 build/copy/download shortcuts.
- Studio fetch diagnostics: status includes cache/network split, dedupe/trim counts, retry diagnostics, and latency (`duration`/`slowest`) details.
- Studio feed sets: save/load named groups of feed URLs and import/export sets as OPML (local-only).
- Studio rule presets: save/load named text-rule bundles (prepend/append/hashtags/UTM) for repeat runs.
- Studio filters: include/exclude keywords, enforce minimum title length, save/load named filter presets, and mute domains with `site:example.com`.
- Studio items export: download/copy the filtered item list as `items.json` to move between Studio and CLI.
- Studio text rules: optional prepend/append/hashtags plus basic UTM tagging while always honoring `maxChars`.
- Studio draft editing: live `current/max` character warnings with one-click trim for over-limit drafts.
- Studio generation engines: local template mode or GPT mode (server-side OpenAI key required for GPT).
- Studio agent feed: build a Twitter-like multi-persona timeline from filtered items (`/api/agent-feed`).
- Agent feed layouts: `Rotating events` for broad coverage or `Consensus on top event` for many takes on one event.
- Personas: consistent voice with editable prefixes (Studio supports local-only JSON import/export; CLI/Studio server support markdown persona files).
- Outputs: Studio exports `.txt`, `.jsonl`, and `.csv` drafts (JSONL/CSV include source metadata); CLI supports text/JSON/JSONL/CSV.
- CLI fetch ingestion: supports direct `--url`, newline-delimited `--urls-file`, and OPML (`--opml`) inputs.
- CLI fetch throughput: supports `--fetch-concurrency` (or `FEED_JARVIS_FETCH_CONCURRENCY`) to bound parallel feed requests.
- API troubleshooting: error payloads include a request id and the same value in `x-request-id` response headers.

Tip: load/override personas via `--personas` from JSON, a single `.md` persona file, or a directory of `.md` persona files.
Tip: set `FEED_JARVIS_PERSONAS=/absolute/path/to/personas` to override Studio personas.
Tip: set `FEED_JARVIS_LLM_MODEL` to define the default GPT model for Studio/CLI `--llm`.
Tip: set `FEED_JARVIS_FETCH_CONCURRENCY` to cap parallel feed requests in CLI/Studio server fetch paths.
Tip: write posts to a file with `--out posts.txt` or `--format jsonl` for one JSON string per line.

## Docs
- `PROJECT.md` (commands), `PLAN.md`, `CHANGELOG.md`
- Extra notes: `docs/` (security, roadmap, release)
- Release guardrail command: `npm run release:check`
