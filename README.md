# Feed Jarvis (`feed-jarvis`)

Persona-based agents that generate short posts from “latest events” inputs (local-first, no auth).

## Quickstart

```bash
make setup
echo '[{"title":"Hello world","url":"https://example.com"}]' > events.json
npm run dev -- generate --input events.json --persona "Analyst"
```

Fetch from an RSS/Atom feed (requires explicit allowlist):

```bash
npm run dev -- fetch --url https://example.com/rss.xml --allow-host example.com > events.json
npm run dev -- generate --input events.json --persona Analyst
```

## What it does (MVP)
- Reads a JSON list of items (`title`, `url`)
- Generates ≤280-char posts for a named persona
- Outputs newline-delimited posts to stdout
 - Can fetch RSS/Atom into the JSON events format (explicit allowlist + caching)

Tip: load/override personas from a file via `--personas personas.json` (array of `{name, prefix}`).
Tip: write posts to a file with `--out posts.txt` or `--format jsonl` for one JSON string per line.

## Docs
- `PROJECT.md` (commands), `PLAN.md`, `CHANGELOG.md`
- Extra notes: `docs/` (security, roadmap, release)
