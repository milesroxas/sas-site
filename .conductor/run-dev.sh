#!/usr/bin/env bash
# Run script (Conductor, T3 Code): Next dev on this workspace's port.
# Re-ensures postgres + the workspace DB so Run works after a reboot or db:reset.
# In the main checkout (a T3 thread in local mode) it is plain `pnpm dev`.
set -euo pipefail
source "$(dirname "$0")/lib.sh"

if is_main_checkout; then
  exec pnpm dev
fi

if [ ! -f .env ]; then
  echo "workspace: no .env in this workspace — run the setup script first (bash .conductor/setup.sh)" >&2
  exit 1
fi

assert_port_free "$PORT"
ensure_postgres
ensure_workspace_db
echo "workspace: $WS_NAME → http://localhost:$PORT (db $DB_NAME)"

# Mirrors package.json `dev` but with the workspace port instead of 3001.
exec pnpm exec cross-env NODE_OPTIONS=--no-deprecation next dev --no-server-fast-refresh -p "$PORT"
