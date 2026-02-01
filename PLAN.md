# PLAN

Local-first CLI that turns structured event feeds into persona-branded, tweet-length posts.

## Features
- Generate ≤N-character posts from `[{title, url}]` JSON feeds
- Built-in personas (plus ad-hoc persona names)
- Deterministic output (safe for tests and local workflows)
- Text (newline) or JSON output

## Top risks / unknowns
- Attribution and safety when adding live fetch + LLM-backed generation
- Input quality (spam, malformed feeds) and defensive limits (size/time)
- Persona config UX (files, templates, validation)

## Commands
- Setup: `make setup`
- Dev: `make dev`
- Quality gate: `make check`
- More: see `PROJECT.md`

## Shipped
- 2026-02-01: Better CLI UX (`personas`, `--version`, richer `--help`), `generate --input -`, `--format json`, `--max-chars`, and robust truncation for very long URLs.

## Next
- Persona config via file (`--personas personas.json`)
- RSS fetcher with caching and explicit allowlists
- Optional LLM backend behind `--llm` flag (default off)
