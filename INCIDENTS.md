# Incidents And Learnings

## Entry Schema
- Date
- Trigger
- Impact
- Root Cause
- Fix
- Prevention Rule
- Evidence
- Commit
- Confidence

## Entries
- Date: 2026-02-09
- Trigger: GitHub Actions run "Dependabot Updates" failing on `main` (403 while fetching job details)
- Impact: CI signal noise and reduced confidence that dependency update automation is working
- Root Cause: Repo default `GITHUB_TOKEN` workflow permissions were set to `read`; the dynamic Dependabot workflow needs write access
- Fix: Set repo default workflow permissions to `write`; explicitly pinned `.github/workflows/ci.yml` to `permissions: contents: read` to preserve least privilege for our workflows
- Prevention Rule: Treat Actions default permissions as production config. If enabling write defaults, ensure every workflow declares explicit minimal `permissions:` to avoid privilege creep.
- Evidence: `gh api /repos/sarveshkapre/feed-jarvis/actions/permissions/workflow`
- Commit: c233218 (workflow pin), plus repo setting (no git commit)
- Confidence: medium
