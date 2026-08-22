#!/usr/bin/env bash
# Conductor run script — Next dev on this workspace's assigned port.
# Re-ensures postgres + workspace DB so Run works even after a reboot or db:reset.
set -euo pipefail
source "$(dirname "$0")/lib.sh"

ensure_postgres
ensure_workspace_db

# Mirrors package.json `dev` but with the workspace port instead of 3001.
exec pnpm exec cross-env NODE_OPTIONS=--no-deprecation next dev --no-server-fast-refresh -p "$PORT"
