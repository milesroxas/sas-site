#!/usr/bin/env bash
# Conductor setup script — runs once after a workspace is created, from the
# workspace directory. Leaves the workspace ready for `Run` with zero manual steps.
set -euo pipefail
source "$(dirname "$0")/lib.sh"

echo "conductor: setting up workspace '$WS_NAME' (port $PORT, db $DB_NAME)"

# 1. Environment — copy the real .env from the main checkout, then point this
#    workspace at its own port and database.
if [ ! -f "$ROOT/.env" ]; then
  echo "conductor: $ROOT/.env not found — create it in the main checkout first (see .env.example)." >&2
  exit 1
fi
cp "$ROOT/.env" .env
set_env POSTGRES_URL "postgresql://postgres@127.0.0.1:54320/$DB_NAME"
set_env NEXT_PUBLIC_SERVER_URL "http://localhost:$PORT"

# 2. Dependencies — pnpm store is shared machine-wide, so this is mostly linking.
pnpm install

# 3. Database — shared container, isolated per-workspace DB seeded from
#    production content (fallback: clone of the main dev DB).
ensure_postgres
ensure_workspace_db

# 4. When the DB holds production content, encrypted fields (API keys etc.)
#    only decrypt with production's PAYLOAD_SECRET — mirror the dev TUI.
if [ "${WORKSPACE_DB_SOURCE:-}" = "production" ]; then
  prod_secret="$(read_env_key "$PROD_ENV_FILE" PAYLOAD_SECRET || true)"
  if [ -n "$prod_secret" ]; then
    set_env PAYLOAD_SECRET "$prod_secret"
    echo "conductor: PAYLOAD_SECRET set from production env (encrypted fields decrypt)"
  fi
fi

echo "conductor: setup complete (db source: ${WORKSPACE_DB_SOURCE:-unknown}) — dev server will run at http://localhost:$PORT"
