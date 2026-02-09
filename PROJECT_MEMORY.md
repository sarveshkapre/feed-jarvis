# Project Memory

## Objective
- Keep feed-jarvis production-ready. Current focus: Feed Jarvis Studio (`feed-jarvis`). Find the highest-impact pending work, implement it, test it, and push to main.

## Architecture Snapshot

## Open Problems

## Recent Decisions
- Template: YYYY-MM-DD | Decision | Why | Evidence (tests/logs) | Commit | Confidence (high/medium/low) | Trust (trusted/untrusted)
- 2026-02-09 | Add maintainer contract + session trackers to the repo (`AGENTS.md`, `PROJECT_MEMORY.md`, `INCIDENTS.md`, refreshed `CLONE_FEATURES.md`) | Ensure the autonomous loop has durable, versioned operating context and verification policy | `git status` showed files were untracked; pushed to `main` | 4d2598f | high | trusted
- 2026-02-09 | Run Studio smoke validation in CI and explicitly scope `ci.yml` token permissions | Catch integration breakages earlier while preserving least privilege after enabling write-capable workflow tokens | `.github/workflows/ci.yml`, `npm run smoke:web` | c233218 | high | trusted
- 2026-02-09 | Block DNS-based private-network SSRF bypasses when `allowPrivateHosts=false` | The previous guard only covered literal hostnames/IPs; hostnames could resolve to private IPs | `test/feedFetch.test.ts` (DNS stub), `make check` | d22b0a0 | high | trusted
- 2026-02-09 | Set repo default Actions workflow permissions to `write` and rely on per-workflow `permissions:` to keep CI least-privilege | Fix failing dynamic "Dependabot Updates" workflow (403 due to read-only token) without granting write perms to all workflows | `gh api /repos/sarveshkapre/feed-jarvis/actions/permissions/workflow` shows `"default_workflow_permissions":"write"` | (repo setting; no git commit) | medium | trusted
- 2026-02-09 | Fix Studio header "GitHub" links to point at this repository | Broken nav link hurts basic product polish and makes it harder for users to find docs/source | `web/index.html`, `web/about.html`; `npm run lint` | 9cc2008 | high | trusted
- 2026-02-09 | Add Studio item filters (include/exclude keywords + minimum title length), persist them, and apply before generation/export | Filtering/muting is baseline UX for feed triage; improves signal quality before drafting | `test/filters.test.ts`, `web/filters.js`; `make check`, `npm run smoke:web` | 0732de5 | high | trusted
- 2026-02-09 | Harden Studio API error handling for non-JSON responses and unknown thrown values | Prevent confusing status messages when the server/proxy returns unexpected payloads | `web/app.js`; `make check`, `npm run smoke:web` | 37d90bf | medium | trusted
- 2026-02-09 | Add Studio persona import/export (local-only) and apply imported personas during generation | Persona libraries are core to repeatable voice; import/export keeps workflows local-first while enabling sharing | `web/index.html`, `web/app.js`, `test/server.test.ts`; `make check`, `npm run smoke:web` | 5fcf555 | high | trusted
- 2026-02-09 | Enrich Studio exports with per-draft metadata (title/url/persona/channel/template) and show source context above drafts | Improves downstream scheduler/import workflows and reduces context switching when reviewing drafts | `web/app.js`, `web/styles.css`, `README.md`, `CHANGELOG.md`; `make check`, `npm run smoke:web` | 1e76b86 | high | trusted
- 2026-02-09 | Bump CodeQL workflow to use `github/codeql-action@v4` | CodeQL Action v3 emits deprecation warnings; upgrading now avoids future breakage with minimal risk | `.github/workflows/codeql.yml`; `gh run watch 21830511384 --exit-status` | 455f6a6 | high | trusted

## Mistakes And Fixes
- Template: YYYY-MM-DD | Issue | Root cause | Fix | Prevention rule | Commit | Confidence
- 2026-02-09 | "Dependabot Updates" Actions workflow failing with 403 | Repo default `GITHUB_TOKEN` workflow permissions were `read` but the dynamic Dependabot workflow requires write access to fetch job details | Updated repo default workflow permissions to `write`; added explicit `permissions: contents: read` to `ci.yml` | Treat repo-level Actions defaults as production config; whenever enabling write defaults, pin every workflow to explicit minimal permissions | c233218 (plus repo setting) | medium

## Known Risks

## Next Prioritized Tasks
- Scoring rubric: Impact (1-5), Effort (1-5, lower is easier), Strategic fit (1-5), Differentiation (1-5), Risk (1-5, lower is safer), Confidence (1-5).
- Selected (shipped this session):
- Studio item filters (Impact 5, Effort 2, Fit 5, Diff 2, Risk 2, Conf 5).
- Studio UI error hardening (Impact 4, Effort 2, Fit 5, Diff 1, Risk 1, Conf 5).
- Fix Studio GitHub links (Impact 2, Effort 1, Fit 4, Diff 0, Risk 1, Conf 5).
- Studio personas import/export (Impact 4, Effort 2, Fit 5, Diff 2, Risk 2, Conf 4).
- Studio draft exports with metadata + source context (Impact 4, Effort 2, Fit 5, Diff 2, Risk 2, Conf 4).
- Remaining backlog:
- Studio E2E (browser) critical flow in CI (Impact 4, Effort 4, Fit 5, Diff 1, Risk 2, Conf 3).
- Studio fetch summary details in UI (Impact 3, Effort 2, Fit 4, Diff 1, Risk 1, Conf 4).
- Studio local feed-set presets (Impact 3, Effort 3, Fit 4, Diff 1, Risk 1, Conf 3).
- Optional `--llm` generation backend (Impact 4, Effort 4, Fit 4, Diff 3, Risk 4, Conf 2).

## Verification Evidence
- Template: YYYY-MM-DD | Command | Key output | Status (pass/fail)
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

## Historical Summary
- Keep compact summaries of older entries here when file compaction runs.
