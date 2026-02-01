# Feed Jarvis (`feed-jarvis`)

Persona-based agents that generate short posts from “latest events” inputs (local-first, no auth).

## Quickstart

```bash
make setup
echo '[{"title":"Hello world","url":"https://example.com"}]' > events.json
npm run dev -- generate --input events.json --persona "Analyst"
```

## What it does (MVP)
- Reads a JSON list of items (`title`, `url`)
- Generates ≤280-char posts for a named persona
- Outputs newline-delimited posts to stdout

## Docs
- `PROJECT.md` (commands), `PLAN.md`, `CHANGELOG.md`
- Extra notes: `docs/` (security, roadmap, release)
