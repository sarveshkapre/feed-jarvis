# Workflow Recipes

Detailed Studio/CLI command recipes moved from `README.md`.

## Studio Workflows

Start Studio:

```bash
make setup
npm run dev:web
```

Open `http://localhost:4321`.

Step 1 input modes:
- Feed URLs: one-per-line or comma-separated.
- JSON items: array of objects with `title` + `url` (`http/https` only).

Optional private-host/local-network fetch testing:

```bash
FEED_JARVIS_ALLOW_PRIVATE_HOSTS=true npm run dev:web
```

Browser verification:

```bash
npx playwright install chromium
npm run smoke:web
npm run e2e:web
```

## CLI Workflows

Create an input file and generate drafts:

```bash
echo '[{"title":"Hello world","url":"https://example.com"}]' > events.json
npm run dev -- generate --input events.json --persona Analyst
```

Generate CSV with optional text rules and UTM tags:

```bash
cat events.json | npm run dev -- generate --input - --persona Analyst --format csv \
  --channel x --template takeaway \
  --prepend "New:" --hashtags "ai,#Product" \
  --utm-source feed-jarvis --utm-medium social > drafts.csv
```

### Dry-run Diagnostics

```bash
npm run dev -- generate --input events.json --persona Analyst --dry-run --max-chars 280
npm run dev -- generate --input events.json --persona Analyst --dry-run --diagnostics-json
```

`--dry-run` prints valid/invalid counts, duplicate URL counts, and estimated truncations without writing post output.

## GPT Generation

Studio or CLI can use OpenAI Responses API when `OPENAI_API_KEY` is set.

CLI example:

```bash
OPENAI_API_KEY=your_key_here npm run dev -- generate \
  --input events.json \
  --persona "Macro Hawk" \
  --llm \
  --llm-model gpt-4.1-mini
```

## Persona Loading

Load personas from markdown file or directory:

```bash
npm run dev -- personas --personas personas/
npm run dev -- generate --input events.json --persona "Macro Hawk" --personas personas/
```

Bundled persona pack in `personas/` auto-loads when present.

## Feed Fetch Workflows

Fetch from direct URL:

```bash
npm run dev -- fetch --url https://example.com/rss.xml --allow-host example.com > events.json
npm run dev -- fetch --url https://example.com/rss.xml --allow-host example.com --stats > events.json
npm run dev -- fetch --url https://example.com/rss.xml --allow-host example.com --stale-if-error > events.json
```

Fetch from newline URL file:

```bash
npm run dev -- fetch --urls-file feeds.txt --allow-host example.com --allow-host news.example.com > events.json
```

Fetch from OPML:

```bash
npm run dev -- fetch --opml feeds.opml --allow-host example.com --allow-host news.example.com > events.json
```

Bound fetch concurrency (CLI or env var):

```bash
npm run dev -- fetch --urls-file feeds.txt --allow-host example.com --fetch-concurrency 4 > events.json
```

## Release Workflow

Run release guardrails:

```bash
npm run release:check
```

`release:check` validates git/changelog state, quality commands, artifact expectations, and `npm pack --dry-run` inclusion of `dist/cli.js`.

For detailed release notes see `docs/RELEASE.md`.

## Troubleshooting

- Validate payloads before generation with `--dry-run`.
- Use `--diagnostics-json` for CI/pipeline parsing.
- If fetch fails for private or localhost hosts, confirm `FEED_JARVIS_ALLOW_PRIVATE_HOSTS=true` in trusted local-only runs.
- For recurring parser issues, export filtered Studio items (`items.json`) and run CLI dry-run diagnostics against that file.
