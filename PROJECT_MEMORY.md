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

## Mistakes And Fixes
- Template: YYYY-MM-DD | Issue | Root cause | Fix | Prevention rule | Commit | Confidence
- 2026-02-09 | "Dependabot Updates" Actions workflow failing with 403 | Repo default `GITHUB_TOKEN` workflow permissions were `read` but the dynamic Dependabot workflow requires write access to fetch job details | Updated repo default workflow permissions to `write`; added explicit `permissions: contents: read` to `ci.yml` | Treat repo-level Actions defaults as production config; whenever enabling write defaults, pin every workflow to explicit minimal permissions | c233218 (plus repo setting) | medium

## Known Risks

## Next Prioritized Tasks

## Verification Evidence
- Template: YYYY-MM-DD | Command | Key output | Status (pass/fail)
- 2026-02-09 | `make check` | `Tests 20 passed (20)` | pass
- 2026-02-09 | `npm run smoke:web` | `Smoke check passed` | pass
- 2026-02-09 | `gh api /repos/sarveshkapre/feed-jarvis/actions/permissions/workflow` | `"default_workflow_permissions":"write"` | pass

## Historical Summary
- Keep compact summaries of older entries here when file compaction runs.
