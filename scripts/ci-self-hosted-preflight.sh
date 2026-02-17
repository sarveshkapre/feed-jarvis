#!/usr/bin/env bash
set -euo pipefail

echo "Self-hosted runner preflight"
echo "OS: $(uname -s)"
echo "Arch: $(uname -m)"

if [[ "$(uname -s)" != "Linux" && "$(uname -s)" != "Darwin" ]]; then
  echo "Unsupported OS for this workflow. Use Linux or macOS self-hosted runner."
  exit 1
fi

need_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Missing required command: $cmd"
    exit 1
  fi
}

need_cmd bash
need_cmd git
need_cmd make
need_cmd node
need_cmd npm

node_major="$(node -p 'Number(process.versions.node.split(".")[0])')"
if [[ "$node_major" -lt 20 ]]; then
  echo "Node >=20 is required by CI (found $(node -v))."
  exit 1
fi

echo "Preflight OK"
