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
- Persona config UX (templates, validation, discoverability)

## Commands
- Setup: `make setup`
- Dev: `make dev`
- Quality gate: `make check`
- More: see `PROJECT.md`

## Shipped
- 2026-02-01: Better CLI UX (`personas`, `--version`, richer `--help`), `generate --input -`, `--format json`, `--max-chars`, and robust truncation for very long URLs.
- 2026-02-01: Persona config via file (`--personas personas.json`) with overrides and deterministic merging.
- 2026-02-01: RSS/Atom fetcher (`fetch --url ... --allow-host ...`) that outputs the events JSON format with caching and size/time limits.

## Next
- Optional LLM backend behind `--llm` flag (default off)
