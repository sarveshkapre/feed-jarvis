# RELEASE

## Checklist
1. Ensure `CHANGELOG.md` has release notes under `## Unreleased`.
2. Run release validation:

```bash
npm run release:check
```

`release:check` validates:
- clean git working tree (unless `--allow-dirty` is passed)
- changelog guardrails (`## Unreleased` exists and has bullet entries)
- quality gate command (default: `npm run check`)
- release artifact presence (`dist/cli.js`) and package dry-run execution (`npm pack --dry-run`, warns when `dist/cli.js` is excluded by packaging rules)

Examples:

```bash
# local/sandbox-friendly run without full integration test suite
npm run release:check -- --allow-dirty --quality-cmd "npm run lint && npm run typecheck && npm run build"
```

3. Tag and push:

```bash
git tag vX.Y.Z
git push origin main --tags
```
