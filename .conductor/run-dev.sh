#!/usr/bin/env bash
# Conductor run script — Next dev on this workspace's assigned port.
# Re-ensures postgres + the workspace DB so Run works after a reboot or db:reset.
set -euo pipefail
source "$(dirname "$0")/lib.sh"

if [ ! -f .env ]; then
  echo "conductor: no .env in this workspace — run the setup script first (bash .conductor/setup.sh)" >&2
  exit 1
fi

ensure_postgres
ensure_workspace_db
echo "conductor: $WS_NAME → http://localhost:$PORT (db $DB_NAME)"

# Mirrors package.json `dev` but with the workspace port instead of 3001.
exec pnpm exec cross-env NODE_OPTIONS=--no-deprecation next dev --no-server-fast-refresh -p "$PORT"
