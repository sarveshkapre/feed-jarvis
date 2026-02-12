# Project Memory

## Objective
- Keep feed-jarvis production-ready. Current focus: Feed Jarvis Studio (`feed-jarvis`). Find the highest-impact pending work, implement it, test it, and push to main.

## Architecture Snapshot

## Open Problems

## Recent Decisions
- Template: YYYY-MM-DD | Decision | Why | Evidence (tests/logs) | Commit | Confidence (high/medium/low) | Trust (trusted/untrusted)
- 2026-02-12 | Add agent-feed layout modes (`rotating` and `consensus`) across API + Studio UI | Users need both broad scanning and same-event comparison to extract higher-value signal from many personas | `test/server.test.ts` (consensus coverage), `web/index.html` layout selector, `make check` | (pending) | high | trusted
- 2026-02-12 | Add multi-persona agent timeline generation in Studio + server (`/api/agent-feed`) with template/GPT modes | Core product direction is an agent-only high-value feed; timeline generation is the first concrete experience beyond single-persona drafting | `test/server.test.ts` (agent feed coverage), `web/index.html` Step 4, `make check` | (pending) | high | trusted
- 2026-02-12 | Add GPT generation engine (Studio + CLI) backed by OpenAI Responses API with persona-conditioned concise prompts | Product direction requires LLM-generated posts with richer persona character than template-only drafting | `src/lib/llm.ts`, `test/llm.test.ts`, `test/server.test.ts`, `test/cli.test.ts`, `make check` | (pending) | high | trusted
- 2026-02-12 | Ship bundled markdown persona pack (50+ files) and auto-load it in CLI/Studio when present | The product direction requires many distinct agent identities with per-file contracts; auto-loading removes setup friction and makes Studio immediately useful | `personas/` pack, `test/cli.test.ts`, `test/server.test.ts`, `make check` | (pending) | high | trusted
- 2026-02-12 | Add markdown persona contract support (single file or directory) across CLI and Studio server (`FEED_JARVIS_PERSONAS`) | Persona-per-file authoring is required for scaling to many unique agent voices without brittle JSON editing | `test/personas.test.ts`, `test/cli.test.ts`, `test/server.test.ts`, `make check` | (pending) | high | trusted
- 2026-02-11 | Ship Studio local-only rule presets (save/load/delete) for text-rule reuse | Repeated feed workflows need fast rule reuse; presets reduce repetitive setup and improve drafting consistency | `test/rulePresets.test.ts`, `make check`, `npm run smoke:web` | 7c4ae07 | high | trusted
- 2026-02-11 | Add CLI `fetch --opml <path>` support with preserved host allowlist enforcement | OPML is a common interoperability format for feed collections; this improves ingestion without weakening SSRF controls | `test/opml.test.ts`, `test/cli.test.ts`, local OPML smoke command, `make check` | 7c4ae07 | high | trusted
- 2026-02-11 | Run bounded market scan to validate cycle1 baseline expectations | Confirm near-term PMF priorities against comparable feed automation tooling while treating external docs as untrusted input | Inoreader/Buffer/Zapier docs links captured in `CLONE_FEATURES.md` Insights | 7c4ae07 | medium | untrusted
- 2026-02-09 | Add maintainer contract + session trackers to the repo (`AGENTS.md`, `PROJECT_MEMORY.md`, `INCIDENTS.md`, refreshed `CLONE_FEATURES.md`) | Ensure the autonomous loop has durable, versioned operating context and verification policy | `git status` showed files were untracked; pushed to `main` | 4d2598f | high | trusted
- 2026-02-09 | Run Studio smoke validation in CI and explicitly scope `ci.yml` token permissions | Catch integration breakages earlier while preserving least privilege after enabling write-capable workflow tokens | `.github/workflows/ci.yml`, `npm run smoke:web` | c233218 | high | trusted
- 2026-02-09 | Block DNS-based private-network SSRF bypasses when `allowPrivateHosts=false` | The previous guard only covered literal hostnames/IPs; hostnames could resolve to private IPs | `test/feedFetch.test.ts` (DNS stub), `make check` | d22b0a0 | high | trusted
- 2026-02-09 | Set repo default Actions workflow permissions to `write` and rely on per-workflow `permissions:` to keep CI least-privilege | Fix failing dynamic "Dependabot Updates" workflow (403 due to read-only token) without granting write perms to all workflows | `gh api /repos/sarveshkapre/feed-jarvis/actions/permissions/workflow` shows `"default_workflow_permissions":"write"` | (repo setting; no git commit) | medium | trusted
- 2026-02-09 | Fix Studio header "GitHub" links to point at this repository | Broken nav link hurts basic product polish and makes it harder for users to find docs/source | `web/index.html`, `web/about.html`; `npm run lint` | 9cc2008 | high | trusted
- 2026-02-09 | Add Studio item filters (include/exclude keywords + minimum title length), persist them, and apply before generation/export | Filtering/muting is baseline UX for feed triage; improves signal quality before drafting | `test/filters.test.ts`, `web/filters.js`; `make check`, `npm run smoke:web` | 0732de5 | high | trusted
- 2026-02-09 | Harden Studio API error handling for non-JSON responses and unknown thrown values | Prevent confusing status messages when the server/proxy returns unexpected payloads | `web/app.js`; `make check`, `npm run smoke:web` | 37d90bf | medium | trusted
- 2026-02-09 | Add Studio persona import/export (local-only) and apply imported personas during generation | Persona libraries are core to repeatable voice; import/export keeps workflows local-first while enabling sharing | `web/index.html`, `web/app.js`, `test/server.test.ts`; `make check`, `npm run smoke:web` | 5fcf555 | high | trusted
- 2026-02-09 | Enrich Studio exports with per-draft metadata (title/url/persona/channel/template) and show source context above drafts | Improves downstream scheduler/import workflows and reduces context switching when reviewing drafts | `web/app.js`, `web/styles.css`, `README.md`, `CHANGELOG.md`; `make check`, `npm run smoke:web` | 1e76b86 | high | trusted
- 2026-02-09 | Clarify Studio `/api/fetch` summary (separate `deduped` vs `limited`) and add test coverage | Enables accurate UX messaging and avoids confusing "deduped" counts when the item cap trims results | `test/server.test.ts` (summary assertions), `make check` | fa3d5a4 | high | trusted
- 2026-02-09 | Persist per-channel `maxChars` (local-only) and show richer fetch status in Studio | Reduces friction when switching channels and makes caching/dedupe behavior visible without leaving the UI | `test/studioPrefs.test.ts`, `npm run smoke:web`, `make check` | a6a0e86 | high | trusted
- 2026-02-09 | Bump CodeQL workflow to use `github/codeql-action@v4` | CodeQL Action v3 emits deprecation warnings; upgrading now avoids future breakage with minimal risk | `.github/workflows/codeql.yml`; `gh run watch 21830511384 --exit-status` | 455f6a6 | high | trusted
- 2026-02-10 | Studio: add optional generation text rules (prepend/append/hashtags) + basic UTM tagging and persist them locally | Post-text customization + UTM tagging is baseline parity for RSS-to-social workflows; shipping locally-first rules improves PMF without external dependencies | `test/posts.test.ts`, `test/server.test.ts`, `npm run smoke:web` | b576b01 | high | trusted
- 2026-02-10 | CLI: add `generate --format csv`, `--channel`/`--template`, rule/UTM flags; fix `--input -` parsing and handle stdout `EPIPE` | CSV export and channel/template parity improves downstream scheduler import; stdin and pipe robustness makes the CLI match documented workflows | `test/cli.test.ts`, manual `tsx src/cli.ts generate --format csv ...`, `make check` | ffd3299 | high | trusted
- 2026-02-10 | Studio: add local-only feed set presets (save/load/delete) and a filtered `items.json` export bridge | Feed grouping + export bridges are baseline UX for RSS-to-social workflows; this keeps the product local-first while reducing repeat friction and enabling Studio -> CLI handoff | `web/feedSets.js`, `test/feedSets.test.ts`, `make check`, `npm run smoke:web` | f64f9ab | high | trusted
- 2026-02-10 | CLI: add `generate --stats` to print post count + length distribution to stderr | Quick validation and QA loops are common when exporting drafts; stats help spot outliers without changing output formats | `src/cli.ts`, `test/cli.test.ts`, `make check` | b6e0cc2 | high | trusted

## Mistakes And Fixes
- Template: YYYY-MM-DD | Issue | Root cause | Fix | Prevention rule | Commit | Confidence
- 2026-02-11 | New CLI OPML integration test initially timed out | Used `spawnSync` against a test-local HTTP server in the same process, blocking the event loop and starving server responses | Switched the test helper to async `spawn` and awaited process close with streamed stdout/stderr capture | For tests depending on in-process servers, avoid blocking subprocess APIs (`spawnSync`) and prefer async process control | 7c4ae07 | high
- 2026-02-09 | "Dependabot Updates" Actions workflow failing with 403 | Repo default `GITHUB_TOKEN` workflow permissions were `read` but the dynamic Dependabot workflow requires write access to fetch job details | Updated repo default workflow permissions to `write`; added explicit `permissions: contents: read` to `ci.yml` | Treat repo-level Actions defaults as production config; whenever enabling write defaults, pin every workflow to explicit minimal permissions | c233218 (plus repo setting) | medium
- 2026-02-10 | CLI `generate --input -` example failing + piping output causing `EPIPE` crash | `parseArgs` treated `-` as a new flag (not a value), and the CLI did not handle stdout `EPIPE` when downstream consumers closed the pipe | Treat `-` as a valid flag value for `--input`/`--out`; exit cleanly on `EPIPE`; add a regression test | Treat README command examples as contract tests; add CLI integration tests for argument edge cases (`-`, pipes) | ffd3299 | high

## Known Risks

## Next Prioritized Tasks
- Scoring rubric: Impact (1-5), Effort (1-5, lower is easier), Strategic fit (1-5), Differentiation (1-5), Risk (1-5, lower is safer), Confidence (1-5).
- Selected (shipped 2026-02-11):
- Studio local-only rule presets for text rules (Impact 5, Effort 2, Fit 5, Diff 1, Risk 1, Conf 5).
- CLI `fetch --opml <path>` ingestion with allowlist-preserved fetch path (Impact 4, Effort 3, Fit 4, Diff 1, Risk 2, Conf 4).
- Remaining backlog:
- Studio E2E (browser) critical flow in CI (Impact 4, Effort 4, Fit 5, Diff 1, Risk 2, Conf 3).
- Studio import/export feed sets as OPML (Impact 4, Effort 4, Fit 4, Diff 1, Risk 2, Conf 3).
- Studio live over-limit edit guidance with one-click trim suggestions (Impact 4, Effort 3, Fit 5, Diff 1, Risk 1, Conf 4).
- Optional `--llm` generation backend (Impact 4, Effort 4, Fit 4, Diff 3, Risk 4, Conf 2).

## Verification Evidence
- Template: YYYY-MM-DD | Command | Key output | Status (pass/fail)
- 2026-02-12 | `make check` | `Test Files 12 passed (12); Tests 62 passed (62)` | pass
- 2026-02-12 | `make check` | `Test Files 12 passed (12); Tests 61 passed (61)` | pass
- 2026-02-12 | `make check` | `Test Files 12 passed (12); Tests 59 passed (59)` | pass
- 2026-02-12 | `make check` | `Test Files 11 passed (11); Tests 54 passed (54)` | pass
- 2026-02-12 | `make check` | `Test Files 11 passed (11); Tests 53 passed (53)` | pass
- 2026-02-11 | `make check` | `Test Files 11 passed (11); Tests 49 passed (49)` | pass
- 2026-02-11 | `npm run smoke:web` | `Smoke check passed: personas 200, fetch 200, generate 200, index 200.` | pass
- 2026-02-11 | `node <<'NODE' ... (local OPML + local HTTP feed smoke)` | `status: 0` and one fetched item JSON emitted | pass
- 2026-02-11 | `gh run watch 21894950679 --exit-status` | `✓ main ci · 21894950679` | pass
- 2026-02-11 | `gh run watch 21894950666 --exit-status` | `✓ main codeql · 21894950666` | pass
- 2026-02-11 | `gh run watch 21895007475 --exit-status` | `✓ main ci · 21895007475` | pass
- 2026-02-11 | `gh run watch 21895007476 --exit-status` | `✓ main codeql · 21895007476` | pass
- 2026-02-09 | `make check` | `Tests 20 passed (20)` | pass
- 2026-02-09 | `npm run smoke:web` | `Smoke check passed` | pass
- 2026-02-09 | `gh api /repos/sarveshkapre/feed-jarvis/actions/permissions/workflow` | `"default_workflow_permissions":"write"` | pass
- 2026-02-09 | `npm run lint` | `Checked 20 files ... No fixes applied.` | pass
- 2026-02-09 | `make check` | `Tests 25 passed (25)` | pass
- 2026-02-09 | `npm run smoke:web` | `Smoke check passed: personas/fetch/generate/index 200.` | pass
- 2026-02-09 | `gh run watch 21822522911 --exit-status` | `✓ main ci · 21822522911` | pass
- 2026-02-09 | `make check` | `Tests 26 passed (26)` | pass
- 2026-02-09 | `npm run smoke:web` | `Smoke check passed: personas/fetch/generate/index 200.` | pass
- 2026-02-09 | `gh run watch 21830319469 --exit-status` | `Run codeql ... completed with 'success'` | pass
- 2026-02-09 | `gh run watch 21830511369 --exit-status` | `✓ main ci · 21830511369` | pass
- 2026-02-09 | `gh run watch 21830511384 --exit-status` | `✓ main codeql · 21830511384` | pass
- 2026-02-09 | `gh run watch 21830591051 --exit-status` | `✓ main ci · 21830591051` | pass
- 2026-02-09 | `gh run watch 21830591018 --exit-status` | `✓ main codeql · 21830591018` | pass
- 2026-02-09 | `gh run watch 21830673200 --exit-status` | `Run ci (21830673200) ... completed with 'success'` | pass
- 2026-02-09 | `gh run watch 21830673184 --exit-status` | `✓ main codeql · 21830673184` | pass
- 2026-02-09 | `make check` | `Tests 31 passed (31)` | pass
- 2026-02-09 | `npm run smoke:web` | `Smoke check passed: personas 200, fetch 200, generate 200, index 200.` | pass
- 2026-02-09 | `gh run watch 21839142786 --exit-status` | `Run ci (21839142786) ... completed with 'success'` | pass
- 2026-02-09 | `gh run watch 21839139024 --exit-status` | `✓ main codeql · 21839139024` | pass
- 2026-02-09 | `gh run watch 21839142802 --exit-status` | `✓ main codeql · 21839142802` | pass
- 2026-02-09 | `gh run watch 21839254074 --exit-status` | `✓ main ci · 21839254074` | pass
- 2026-02-09 | `gh run watch 21839254032 --exit-status` | `✓ main codeql · 21839254032` | pass
- 2026-02-10 | `make check` | `Tests 35 passed (35)` | pass
- 2026-02-10 | `npm run smoke:web` | `Smoke check passed: ... generate 200 ...` | pass
- 2026-02-10 | `./node_modules/.bin/tsx src/cli.ts generate --input - --persona Analyst --format csv --channel x --template takeaway --prepend "New:" --hashtags "ai,#Product" --utm-source feed-jarvis --utm-medium social --max-chars 200` | CSV header + one row emitted | pass
- 2026-02-10 | `gh run watch 21846239705 --exit-status` | `✓ main ci · 21846239705` | pass
- 2026-02-10 | `gh run watch 21846239703 --exit-status` | `✓ main codeql · 21846239703` | pass
- 2026-02-10 | `make check` | `Tests 39 passed (39)` | pass
- 2026-02-10 | `npm run smoke:web` | `Smoke check passed: personas 200, fetch 200, generate 200, index 200.` | pass
- 2026-02-10 | `gh run watch 21854460348 --exit-status` | `✓ main ci · 21854460348` | pass
- 2026-02-10 | `gh run watch 21854460336 --exit-status` | `✓ main codeql · 21854460336` | pass
- 2026-02-10 | `make check` | `Tests 40 passed (40)` | pass
- 2026-02-10 | `gh run watch 21854524500 --exit-status` | `✓ main ci · 21854524500` | pass
- 2026-02-10 | `gh run watch 21854524494 --exit-status` | `✓ main codeql · 21854524494` | pass

## Historical Summary
- Keep compact summaries of older entries here when file compaction runs.
