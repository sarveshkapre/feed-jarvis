# UPDATE

## 2026-02-01
- Shipped: `feed-jarvis personas`, `--version`, richer `--help`.
- Shipped: `generate --input -` (stdin), `--format json`, and `--max-chars`.
- Hardening: guaranteed max-length posts even with extremely long URLs; clearer input validation errors.

## Verify
- `make check`

## PR
- If GitHub CLI is authenticated: `gh pr create --fill`
- Otherwise: push a branch and open a PR in GitHub UI.

