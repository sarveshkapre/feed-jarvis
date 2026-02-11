# Feed Jarvis Studio (`feed-jarvis`)

Local-first studio + CLI that turns RSS/JSON feeds into on-brand social drafts.

## Studio quickstart

```bash
make setup
npm run dev:web
```

Open `http://localhost:4321` and walk through the three-step flow: load items, choose a persona, export multi-channel drafts.

Run a local smoke verification:

```bash
npm run smoke:web
```

Studio feed safety defaults:

```bash
# Optional: allow localhost/private-network feeds for trusted local testing
FEED_JARVIS_ALLOW_PRIVATE_HOSTS=true npm run dev:web
```

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

Fetch from an RSS/Atom feed (requires explicit allowlist):

```bash
npm run dev -- fetch --url https://example.com/rss.xml --allow-host example.com > events.json
npm run dev -- fetch --url https://example.com/rss.xml --allow-host example.com --stats > events.json
npm run dev -- fetch --url https://example.com/rss.xml --allow-host example.com --stale-if-error > events.json
npm run dev -- generate --input events.json --persona Analyst
```

Fetch from a local OPML file (still requires explicit allowlist hosts):

```bash
npm run dev -- fetch --opml feeds.opml --allow-host example.com --allow-host news.example.com > events.json
```

## What it does
- Studio: three-step workspace to fetch items, pick a persona, and edit/export drafts.
- Local-first: feeds and drafts never leave your machine.
- Studio persistence: remembers your input mode and form settings across refreshes.
- Studio feed sets: save/load named groups of feed URLs (local-only).
- Studio rule presets: save/load named text-rule bundles (prepend/append/hashtags/UTM) for repeat runs.
- Studio filters: optionally include/exclude keywords and enforce a minimum title length before generation/export.
- Studio items export: download/copy the filtered item list as `items.json` to move between Studio and CLI.
- Studio text rules: optional prepend/append/hashtags plus basic UTM tagging while always honoring `maxChars`.
- Personas: consistent voice with editable prefixes (Studio supports local-only persona import/export).
- Outputs: Studio exports `.txt`, `.jsonl`, and `.csv` drafts (JSONL/CSV include source metadata); CLI supports text/JSON/JSONL/CSV.

Tip: load/override personas from a file via `--personas personas.json` (array of `{name, prefix}`).
Tip: write posts to a file with `--out posts.txt` or `--format jsonl` for one JSON string per line.

## Docs
- `PROJECT.md` (commands), `PLAN.md`, `CHANGELOG.md`
- Extra notes: `docs/` (security, roadmap, release)
