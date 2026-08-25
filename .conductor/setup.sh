#!/usr/bin/env bash
# Conductor setup script — runs from the workspace directory after Conductor
# creates it. Leaves the workspace ready for `Run` with zero manual steps.
# Idempotent: re-running (Conductor → "Run setup script", or from a workspace
# terminal) refreshes .env from the root checkout and keeps the workspace DB.
#
#   bash .conductor/setup.sh                      # normal (Conductor calls this)
#   bash .conductor/setup.sh --reseed             # drop + recreate the workspace DB from 'payload'
#   bash .conductor/setup.sh --reseed --from production   # … from a Neon production dump
set -euo pipefail
source "$(dirname "$0")/lib.sh"
require_root

RESEED=0
FROM="local"
while [ $# -gt 0 ]; do
  case "$1" in
  --reseed) RESEED=1 ;;
  --from)
    FROM="${2:-}"
    shift
    ;;
  *)
    echo "usage: setup.sh [--reseed] [--from local|production]" >&2
    exit 2
    ;;
  esac
  shift
done
case "$FROM" in local | production) ;; *)
  echo "conductor: --from must be local or production" >&2
  exit 2
  ;;
esac

echo "conductor: setting up workspace '$WS_NAME' (port $PORT, db $DB_NAME)"

# 0. Keep the Conductor root checkout current (recommended by Conductor docs;
#    harmless if offline or dirty).
git -C "$ROOT" fetch --prune --quiet origin 2>/dev/null &&
  git -C "$ROOT" pull --ff-only --quiet 2>/dev/null || true

# 1. Environment — copy the real .env from the root checkout, then point this
#    workspace at its own port and database. Re-runs pick up rotated secrets
#    but keep the DB this workspace already owns (DB_NAME came from .env).
if [ ! -f "$ROOT/.env" ]; then
  echo "conductor: $ROOT/.env not found — copy your main checkout's .env there first (see .env.example)." >&2
  exit 1
fi
cp "$ROOT/.env" .env
set_env POSTGRES_URL "postgresql://postgres@$DB_HOST/$DB_NAME"
set_env NEXT_PUBLIC_SERVER_URL "http://localhost:$PORT"

# 2. Dependencies — pnpm store is shared machine-wide, so this is mostly
#    linking. Also wires .githooks via the `prepare` script.
pnpm install

# 3. Database — shared container, isolated per-workspace DB.
ensure_postgres
if [ "$RESEED" = 1 ] && db_exists "$DB_NAME"; then
  echo "conductor: --reseed — dropping $DB_NAME"
  drop_workspace_db "$DB_NAME"
fi
ensure_workspace_db "$FROM"

# 4. A production dump's encrypted fields (API keys etc.) only decrypt with
#    production's PAYLOAD_SECRET — mirror the dev TUI. A local clone shares the
#    root .env secret already.
if [ "${WORKSPACE_DB_SOURCE:-}" = "production" ]; then
  prod_secret="$(read_env_key "$PROD_ENV_FILE" PAYLOAD_SECRET || true)"
  if [ -n "$prod_secret" ]; then
    set_env PAYLOAD_SECRET "$prod_secret"
    echo "conductor: PAYLOAD_SECRET set from production env (encrypted fields decrypt)"
  fi
fi

echo "conductor: setup complete (db $DB_NAME, source: ${WORKSPACE_DB_SOURCE:-unknown}) — dev server will run at http://localhost:$PORT"
