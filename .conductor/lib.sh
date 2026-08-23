#!/usr/bin/env bash
# Shared helpers for Conductor setup/run/archive scripts.
# Sourced, not executed. Requires: docker, pnpm.

set -euo pipefail

ROOT="${CONDUCTOR_ROOT_PATH:?CONDUCTOR_ROOT_PATH not set — run via Conductor}"
WS_NAME="${CONDUCTOR_WORKSPACE_NAME:-$(basename "$PWD")}"
PORT="${CONDUCTOR_PORT:-3001}"

# Workspace database name: payload_<sanitized workspace name>.
# Postgres identifier limit is 63 chars; keep well under it.
DB_NAME="payload_$(printf '%s' "$WS_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/_/g' | cut -c1-40)"

# Same image as docker-compose.yml / scripts/dev-tui/constants.ts — dumping
# production with the container's own pg_dump avoids client/server mismatch.
POSTGRES_IMAGE="pgvector/pgvector:pg18"

# Vercel-pulled production env in the MAIN checkout (shared across workspaces).
# Same file/convention as the dev TUI: pulled once when missing, never
# auto-refreshed (re-pull via the TUI after credentials rotate).
PROD_ENV_FILE="$ROOT/.env.production.pulled"

# All compose commands target the MAIN repo checkout so every workspace shares
# the one postgres container (a worktree-local `docker compose up` would spawn a
# second container and fight over port 54320).
compose() {
  docker compose --project-directory "$ROOT" "$@"
}

psql_c() {
  compose exec -T postgres psql -U postgres -v ON_ERROR_STOP=1 -q "$@"
}

ensure_postgres() {
  if ! docker info >/dev/null 2>&1; then
    echo "conductor: Docker is not running — start Docker Desktop first." >&2
    exit 1
  fi
  compose up -d postgres
  local i=0
  until compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; do
    i=$((i + 1))
    if [ "$i" -gt 60 ]; then
      echo "conductor: postgres did not become healthy within 60s" >&2
      exit 1
    fi
    sleep 1
  done
}

db_exists() {
  [ "$(psql_c -tAc "SELECT 1 FROM pg_database WHERE datname='$1'")" = "1" ]
}

# Read KEY from a dotenv-style file, stripping optional surrounding quotes.
read_env_key() {
  local file="$1" key="$2" line v
  line="$(grep "^${key}=" "$file" 2>/dev/null | tail -n1)" || return 1
  v="${line#*=}"
  v="${v%\"}" v="${v#\"}" v="${v%\'}" v="${v#\'}"
  printf '%s' "$v"
}

# Pull production env from Vercel into the main checkout if missing.
# Never refreshes an existing file (repo convention — see README).
ensure_production_env() {
  if [ -f "$PROD_ENV_FILE" ]; then
    return 0
  fi
  if ! command -v vercel >/dev/null 2>&1; then
    echo "conductor: vercel CLI not found (npm i -g vercel) — cannot pull production env" >&2
    return 1
  fi
  echo "conductor: pulling Vercel production env → .env.production.pulled"
  (cd "$ROOT" && vercel env pull .env.production.pulled --environment=production --yes)
}

# pg_dump production straight into the workspace DB. Prefers the non-pooling
# URL (PgBouncer breaks pg_dump). PG17+ pg_dump emits `SET transaction_timeout`
# which older servers reject on restore — strip it (mirrors dev-tui pg-tools).
seed_db_from_production() {
  local dump_url
  dump_url="$(read_env_key "$PROD_ENV_FILE" POSTGRES_URL_NON_POOLING || true)"
  [ -n "$dump_url" ] || dump_url="$(read_env_key "$PROD_ENV_FILE" POSTGRES_URL || true)"
  if [ -z "$dump_url" ]; then
    echo "conductor: no POSTGRES_URL in .env.production.pulled — re-pull production env" >&2
    return 1
  fi
  echo "conductor: dumping production content into $DB_NAME (this can take a minute)"
  docker run --rm "$POSTGRES_IMAGE" pg_dump "$dump_url" --no-owner --no-acl |
    sed '/^[[:space:]]*SET transaction_timeout/d' |
    psql_c -d "$DB_NAME" >/dev/null
}

# Create the workspace DB seeded with production content (schema + data), so
# every new workspace starts from real prod data and drizzle push can diverge
# safely. Falls back to cloning the main dev DB when production is unreachable
# (vercel CLI missing / not logged in / offline).
# Sets WORKSPACE_DB_SOURCE to production | local | empty for the caller.
ensure_workspace_db() {
  WORKSPACE_DB_SOURCE="existing"
  if db_exists "$DB_NAME"; then
    return 0
  fi
  echo "conductor: creating database $DB_NAME"
  psql_c -c "CREATE DATABASE \"$DB_NAME\""
  WORKSPACE_DB_SOURCE="empty"
  if ensure_production_env && seed_db_from_production; then
    WORKSPACE_DB_SOURCE="production"
    echo "conductor: workspace DB seeded from production content"
  else
    echo "conductor: production seed unavailable — falling back to main dev database clone" >&2
    # A failed restore may be partial; start over clean before the fallback.
    psql_c -c "DROP DATABASE IF EXISTS \"$DB_NAME\" WITH (FORCE)"
    psql_c -c "CREATE DATABASE \"$DB_NAME\""
    if db_exists "payload"; then
      echo "conductor: cloning content from main dev database 'payload'"
      if ! compose exec -T postgres pg_dump -U postgres payload | psql_c -d "$DB_NAME" >/dev/null; then
        psql_c -c "DROP DATABASE IF EXISTS \"$DB_NAME\" WITH (FORCE)"
        echo "conductor: clone of 'payload' into $DB_NAME failed" >&2
        exit 1
      fi
      WORKSPACE_DB_SOURCE="local"
    fi
  fi
  # Safety net — Ask RAG embeddings need it; a full restore already carries it.
  psql_c -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS vector"
}

# Upsert KEY=VALUE in the workspace .env (BSD sed — macOS). Delete-then-append
# so values with sed metacharacters (&, |, \ — e.g. secrets) survive intact.
set_env() {
  local key="$1" value="$2"
  sed -i '' "/^${key}=/d" .env
  printf '%s=%s\n' "$key" "$value" >>.env
}
