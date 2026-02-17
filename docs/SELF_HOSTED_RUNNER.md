# Self-Hosted GitHub Actions Runner

This repository is configured to run Actions on `self-hosted` runners.

## Recommended runner host

- OS: Linux (recommended) or macOS
- Architecture: x64
- Shell tools: `bash`, `git`, `make`
- Node: v20.x
- npm: bundled with Node 20
- Browsers: Playwright Chromium (`npx playwright install chromium`)

Linux note:
- Install Playwright system dependencies once on the host (outside workflow), for example with:
  - `sudo npx playwright install --with-deps chromium`
  - or distro-native packages required by Playwright.

Docker note:
- Docker is not required by current workflows.

CodeQL note:
- The `codeql` workflow also runs on `self-hosted`.
- Ensure outbound network access to GitHub and CodeQL bundle downloads.
- No additional repository secrets are required for JavaScript/TypeScript CodeQL analysis.

## Register the runner (repository-level)

1. Open the repository on GitHub.
2. Go to `Settings` -> `Actions` -> `Runners`.
3. Click `New self-hosted runner`.
4. Choose your platform (`Linux` or `macOS`) and architecture (`x64`).
5. Run the generated commands on your host:
   - Create runner directory and download runner package.
   - Extract package.
   - Configure runner:
     - `./config.sh --url https://github.com/<owner>/<repo> --token <token>`
   - Start runner:
     - `./run.sh`
6. Optional but recommended: install as a service so it survives restarts:
   - `sudo ./svc.sh install`
   - `sudo ./svc.sh start`

## Validate CI locally on the runner host

Run these commands from repository root:

```bash
npm ci
bash scripts/ci-self-hosted-preflight.sh
npx playwright install chromium
make check
npm run smoke:web
npm run e2e:web
```

If all commands pass, the `ci` workflow should pass on the same host when triggered in GitHub Actions.
