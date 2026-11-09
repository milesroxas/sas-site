#!/usr/bin/env bash
# Workspace setup. Runs from the worktree directory after Conductor or T3 Code
# creates it (T3: the project's "Setup" script, run on worktree create).
# Leaves the worktree ready for Run with zero manual steps. Idempotent:
# re-running refreshes .env from the root checkout and keeps the worktree's DB
# and port. Refuses to run in the main checkout.
#
#   bash .conductor/setup.sh                      # normal (Conductor / T3 Code call this)
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
  echo "workspace: --from must be local or production" >&2
  exit 2
  ;;
esac

echo "workspace: setting up '$WS_NAME' via $WORKSPACE_HOST (port $PORT, db $DB_NAME)"

# 0. Keep Conductor's own root clone current (recommended by Conductor docs;
#    harmless if offline or dirty). Under T3 Code the root is your main
#    checkout, whose branch is yours to move, so it is never pulled.
if [ "$WORKSPACE_HOST" = conductor ]; then
  git -C "$ROOT" fetch --prune --quiet origin 2>/dev/null &&
    git -C "$ROOT" pull --ff-only --quiet 2>/dev/null || true
fi

# 1. Environment — copy the real .env from the root checkout, then point this
#    workspace at its own port and database. Re-runs pick up rotated secrets
#    but keep the DB this workspace already owns (DB_NAME came from .env).
if [ ! -f "$ROOT/.env" ]; then
  echo "workspace: $ROOT/.env not found. Create it first (see .env.example)." >&2
  exit 1
fi
cp "$ROOT/.env" .env
set_env POSTGRES_URL "postgresql://postgres@$DB_HOST/$DB_NAME"
set_env NEXT_PUBLIC_SERVER_URL "http://localhost:$PORT"
# Conductor assigns the port on every run; elsewhere the worktree keeps the
# one it was given here (lib.sh reads DEV_PORT before allocating).
[ -n "${CONDUCTOR_PORT:-}" ] || set_env DEV_PORT "$PORT"

# 2. Dependencies — pnpm store is shared machine-wide, so this is mostly
#    linking. Also wires .githooks via the `prepare` script.
pnpm install

# 3. Database — shared container, isolated per-workspace DB.
ensure_postgres
if [ "$RESEED" = 1 ] && db_exists "$DB_NAME"; then
  echo "workspace: --reseed — dropping $DB_NAME"
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
    echo "workspace: PAYLOAD_SECRET set from production env (encrypted fields decrypt)"
  fi
fi

echo "workspace: setup complete (db $DB_NAME, source: ${WORKSPACE_DB_SOURCE:-unknown}) — dev server will run at http://localhost:$PORT"
