# Feed Jarvis Studio (`feed-jarvis`)

Local-first Studio + CLI that turns RSS/JSON feeds into on-brand social drafts.

## Quickstart

### Studio

```bash
make setup
npm run dev:web
```

Open `http://localhost:4321` and run the core flow:
1. Load feed or JSON items (Step 1)
2. Choose persona + generation settings (Step 2/3)
3. Export drafts (`.txt`, `.jsonl`, `.csv`) or build Step 4 agent feed

### CLI

```bash
make setup
echo '[{"title":"Hello world","url":"https://example.com"}]' > events.json
npm run dev -- generate --input events.json --persona Analyst
```

## Verify Locally

```bash
npm run lint
npm run typecheck
npm run build
npm test
npm run docs:check-links
npm run security:grep
```

Optional browser smoke paths:

```bash
npx playwright install chromium
npm run smoke:web
npm run e2e:web
```

## Core Capabilities

- Studio + CLI ingestion from direct feed URL, newline URL file, OPML, or JSON payload.
- Step 1 fetch diagnostics include aggregate summary metrics and per-feed failure drill-down details.
- Local-first persistence for feed sets, filter presets, rule presets, personas, and session state.
- Feed triage controls: include/exclude filters, `site:` mute tokens, min-title filter, token chips.
- Draft generation in template mode or GPT mode (`OPENAI_API_KEY` required for GPT).
- Multi-format exports (`txt/jsonl/csv`) with source metadata.
- Step 4 agent feed builder with rotating/consensus layouts.
- Release guardrail automation via `npm run release:check`.

## Docs

- Deep command recipes and workflow playbooks: `docs/WORKFLOWS.md`
- Release checklist and publish checks: `docs/RELEASE.md`
- Security policy: `docs/SECURITY.md`
- World-state snapshot: `docs/WORLD_STATE_2026-02-17.md`

## Runtime Notes

- Optional private-host feed testing:

```bash
FEED_JARVIS_ALLOW_PRIVATE_HOSTS=true npm run dev:web
```

- Optional GPT engine:

```bash
OPENAI_API_KEY=your_key_here npm run dev:web
```

- Optional defaults:
  - `FEED_JARVIS_PERSONAS=/absolute/path/to/personas`
  - `FEED_JARVIS_LLM_MODEL=gpt-4.1-mini`
  - `FEED_JARVIS_FETCH_CONCURRENCY=4`
