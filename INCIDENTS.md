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
- Date: 2026-02-11
- Trigger: New CLI `fetch --opml` test failed with timeout in local `make check`
- Impact: Temporary false-negative test failure blocked the quality gate during implementation
- Root Cause: Test used `spawnSync` while also hosting a local HTTP server in the same process; blocking the event loop prevented responses
- Fix: Reworked the OPML CLI test to run child CLI process asynchronously (`spawn`) and await completion without blocking the server
- Prevention Rule: For tests that rely on in-process network servers, avoid blocking subprocess calls and use async process orchestration
- Evidence: `test/cli.test.ts`, `make check`
- Commit: 7c4ae07
- Confidence: high

- Date: 2026-02-09
- Trigger: GitHub Actions run "Dependabot Updates" failing on `main` (403 while fetching job details)
- Impact: CI signal noise and reduced confidence that dependency update automation is working
- Root Cause: Repo default `GITHUB_TOKEN` workflow permissions were set to `read`; the dynamic Dependabot workflow needs write access
- Fix: Set repo default workflow permissions to `write`; explicitly pinned `.github/workflows/ci.yml` to `permissions: contents: read` to preserve least privilege for our workflows
- Prevention Rule: Treat Actions default permissions as production config. If enabling write defaults, ensure every workflow declares explicit minimal `permissions:` to avoid privilege creep.
- Evidence: `gh api /repos/sarveshkapre/feed-jarvis/actions/permissions/workflow`
- Commit: c233218 (workflow pin), plus repo setting (no git commit)
- Confidence: medium

- Date: 2026-02-10
- Trigger: CLI example `generate --input -` and piping output (for example into `head`) revealed incorrect arg parsing and an unhandled stdout `EPIPE`
- Impact: Documented stdin workflows failed; piping could crash the CLI with a stack trace
- Root Cause: `parseArgs` treated `-` as a new flag (not a value) and the CLI did not handle stdout `EPIPE`
- Fix: Treat `-` as a valid flag value for `--input`/`--out`; exit cleanly on stdout `EPIPE`; added a regression test for stdin input
- Prevention Rule: Treat README command examples as contract tests; add CLI integration tests for argument edge cases (`-`, pipes) when introducing flags/output formats
- Evidence: `test/cli.test.ts`, `make check`
- Commit: ffd3299
- Confidence: high

### 2026-02-12T20:00:42Z | Codex execution failure
- Date: 2026-02-12T20:00:42Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-feed-jarvis-cycle-2.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:04:12Z | Codex execution failure
- Date: 2026-02-12T20:04:12Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-feed-jarvis-cycle-3.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:07:42Z | Codex execution failure
- Date: 2026-02-12T20:07:42Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-feed-jarvis-cycle-4.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:11:14Z | Codex execution failure
- Date: 2026-02-12T20:11:14Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-feed-jarvis-cycle-5.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:14:40Z | Codex execution failure
- Date: 2026-02-12T20:14:40Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-feed-jarvis-cycle-6.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:18:09Z | Codex execution failure
- Date: 2026-02-12T20:18:09Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-feed-jarvis-cycle-7.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:21:38Z | Codex execution failure
- Date: 2026-02-12T20:21:38Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-feed-jarvis-cycle-8.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:25:07Z | Codex execution failure
- Date: 2026-02-12T20:25:07Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-feed-jarvis-cycle-9.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:28:43Z | Codex execution failure
- Date: 2026-02-12T20:28:43Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-feed-jarvis-cycle-10.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:32:13Z | Codex execution failure
- Date: 2026-02-12T20:32:13Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-feed-jarvis-cycle-11.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:35:40Z | Codex execution failure
- Date: 2026-02-12T20:35:40Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-feed-jarvis-cycle-12.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:39:09Z | Codex execution failure
- Date: 2026-02-12T20:39:09Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-feed-jarvis-cycle-13.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:42:37Z | Codex execution failure
- Date: 2026-02-12T20:42:37Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-feed-jarvis-cycle-14.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:46:12Z | Codex execution failure
- Date: 2026-02-12T20:46:12Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-feed-jarvis-cycle-15.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:49:40Z | Codex execution failure
- Date: 2026-02-12T20:49:40Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-feed-jarvis-cycle-16.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:53:12Z | Codex execution failure
- Date: 2026-02-12T20:53:12Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-feed-jarvis-cycle-17.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:56:42Z | Codex execution failure
- Date: 2026-02-12T20:56:42Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-feed-jarvis-cycle-18.log
- Commit: pending
- Confidence: medium

### 2026-02-12T21:00:12Z | Codex execution failure
- Date: 2026-02-12T21:00:12Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-feed-jarvis-cycle-19.log
- Commit: pending
- Confidence: medium

### 2026-02-12T21:03:40Z | Codex execution failure
- Date: 2026-02-12T21:03:40Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-feed-jarvis-cycle-20.log
- Commit: pending
- Confidence: medium

### 2026-02-12T21:07:14Z | Codex execution failure
- Date: 2026-02-12T21:07:14Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-feed-jarvis-cycle-21.log
- Commit: pending
- Confidence: medium

### 2026-02-12T21:10:41Z | Codex execution failure
- Date: 2026-02-12T21:10:41Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-feed-jarvis-cycle-22.log
- Commit: pending
- Confidence: medium

### 2026-02-12T21:14:14Z | Codex execution failure
- Date: 2026-02-12T21:14:14Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-feed-jarvis-cycle-23.log
- Commit: pending
- Confidence: medium

### 2026-02-12T21:17:45Z | Codex execution failure
- Date: 2026-02-12T21:17:45Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-feed-jarvis-cycle-24.log
- Commit: pending
- Confidence: medium

### 2026-02-12T21:21:11Z | Codex execution failure
- Date: 2026-02-12T21:21:11Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-feed-jarvis-cycle-25.log
- Commit: pending
- Confidence: medium

### 2026-02-12T21:24:22Z | Codex execution failure
- Date: 2026-02-12T21:24:22Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-feed-jarvis-cycle-26.log
- Commit: pending
- Confidence: medium

### 2026-02-12T21:27:40Z | Codex execution failure
- Date: 2026-02-12T21:27:40Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-feed-jarvis-cycle-27.log
- Commit: pending
- Confidence: medium

### 2026-02-12T21:31:00Z | Codex execution failure
- Date: 2026-02-12T21:31:00Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-feed-jarvis-cycle-28.log
- Commit: pending
- Confidence: medium

### 2026-02-12T21:34:25Z | Codex execution failure
- Date: 2026-02-12T21:34:25Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-feed-jarvis-cycle-29.log
- Commit: pending
- Confidence: medium

### 2026-02-12T21:37:54Z | Codex execution failure
- Date: 2026-02-12T21:37:54Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-feed-jarvis-cycle-30.log
- Commit: pending
- Confidence: medium

### 2026-02-16T22:54:35Z | Codex execution failure
- Date: 2026-02-16T22:54:35Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260216-144104-feed-jarvis-cycle-1.log
- Commit: pending
- Confidence: medium

### 2026-02-17T01:42:25Z | Codex execution failure
- Date: 2026-02-17T01:42:25Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260216-144104-feed-jarvis-cycle-2.log
- Commit: pending
- Confidence: medium

### 2026-02-17T01:45:30Z | Codex execution failure
- Date: 2026-02-17T01:45:30Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260216-144104-feed-jarvis-cycle-3.log
- Commit: pending
- Confidence: medium

### 2026-02-17T01:48:49Z | Codex execution failure
- Date: 2026-02-17T01:48:49Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260216-144104-feed-jarvis-cycle-4.log
- Commit: pending
- Confidence: medium

### 2026-02-17T01:52:38Z | Codex execution failure
- Date: 2026-02-17T01:52:38Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260216-144104-feed-jarvis-cycle-5.log
- Commit: pending
- Confidence: medium

### 2026-02-17T01:55:42Z | Codex execution failure
- Date: 2026-02-17T01:55:42Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260216-144104-feed-jarvis-cycle-6.log
- Commit: pending
- Confidence: medium

### 2026-02-17T01:59:13Z | Codex execution failure
- Date: 2026-02-17T01:59:13Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260216-144104-feed-jarvis-cycle-7.log
- Commit: pending
- Confidence: medium

### 2026-02-17T02:03:00Z | Codex execution failure
- Date: 2026-02-17T02:03:00Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260216-144104-feed-jarvis-cycle-8.log
- Commit: pending
- Confidence: medium

### 2026-02-17T02:06:12Z | Codex execution failure
- Date: 2026-02-17T02:06:12Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260216-144104-feed-jarvis-cycle-9.log
- Commit: pending
- Confidence: medium

### 2026-02-17T02:09:30Z | Codex execution failure
- Date: 2026-02-17T02:09:30Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260216-144104-feed-jarvis-cycle-10.log
- Commit: pending
- Confidence: medium
