# Feed Jarvis Studio (`feed-jarvis`)

Local-first studio + CLI that turns RSS/JSON feeds into on-brand social drafts.

## Studio quickstart

```bash
make setup
npm run dev:web
```

Open `http://localhost:4321` and walk through the three-step flow: load items, choose a persona, export multi-channel drafts.

## CLI quickstart

```bash
make setup
echo '[{"title":"Hello world","url":"https://example.com"}]' > events.json
npm run dev -- generate --input events.json --persona "Analyst"
```

Fetch from an RSS/Atom feed (requires explicit allowlist):

```bash
npm run dev -- fetch --url https://example.com/rss.xml --allow-host example.com > events.json
npm run dev -- fetch --url https://example.com/rss.xml --allow-host example.com --stats > events.json
npm run dev -- fetch --url https://example.com/rss.xml --allow-host example.com --stale-if-error > events.json
npm run dev -- generate --input events.json --persona Analyst
```

## What it does
- Studio: three-step workspace to fetch items, pick a persona, and edit/export drafts.
- Local-first: feeds and drafts never leave your machine.
- Personas: consistent voice with editable prefixes.
- Outputs: text, JSON, JSONL, or CSV drafts ready for your scheduler.

Tip: load/override personas from a file via `--personas personas.json` (array of `{name, prefix}`).
Tip: write posts to a file with `--out posts.txt` or `--format jsonl` for one JSON string per line.

## Docs
- `PROJECT.md` (commands), `PLAN.md`, `CHANGELOG.md`
- Extra notes: `docs/` (security, roadmap, release)
